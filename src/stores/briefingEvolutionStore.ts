// briefingEvolutionStore.ts - 브리핑 진화 시스템
// Phase 6: Briefing Evolution Rule - 피드백 기반 템플릿 가중치 + 이해도 연동 밀도 조절

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LiveBriefingStatus } from '../constants/liveBriefing';

// 피드백 타입
export type BriefingFeedbackType = 'helpful' | 'different' | 'skip';

// 피드백 기록
interface FeedbackRecord {
  status: LiveBriefingStatus;
  templateIndex: number;
  feedbackType: BriefingFeedbackType;
  timestamp: Date;
}

// 템플릿 가중치 (상태별 + 템플릿 인덱스별)
type TemplateWeights = Record<LiveBriefingStatus, number[]>;

// 브리핑 밀도 레벨
export type BriefingDensity = 'minimal' | 'normal' | 'detailed';

interface BriefingEvolutionStore {
  // 피드백 기록
  feedbackHistory: FeedbackRecord[];

  // 템플릿 가중치 (0-100, 초기값 50)
  templateWeights: TemplateWeights;

  // 브리핑 밀도 설정 (이해도 연동)
  density: BriefingDensity;
  densityOverride: BriefingDensity | null; // 사용자 수동 설정

  // 진화 통계
  totalFeedbacks: number;
  helpfulCount: number;
  differentCount: number;
  skipCount: number;

  // Actions
  recordFeedback: (status: LiveBriefingStatus, templateIndex: number, feedback: BriefingFeedbackType) => void;
  getWeightedTemplateIndex: (status: LiveBriefingStatus, templateCount: number) => number;
  updateDensityFromUnderstanding: (understandingScore: number) => void;
  setDensityOverride: (density: BriefingDensity | null) => void;
  getEffectiveDensity: () => BriefingDensity;

  // 진화 상태
  getEvolutionLevel: () => { level: number; description: string };
}

// 초기 템플릿 가중치 (모든 템플릿 동일 가중치 50)
function createInitialWeights(): TemplateWeights {
  var statuses: LiveBriefingStatus[] = ['observing', 'stable', 'focused', 'needsAdjust', 'nearOverload', 'recovery'];
  var weights: TemplateWeights = {} as TemplateWeights;

  statuses.forEach(function(status) {
    // 각 상태에 5개 템플릿 가정
    weights[status] = [50, 50, 50, 50, 50];
  });

  return weights;
}

export var useBriefingEvolutionStore = create<BriefingEvolutionStore>()(
  persist(
    function(set, get) {
      return {
        feedbackHistory: [],
        templateWeights: createInitialWeights(),
        density: 'normal',
        densityOverride: null,
        totalFeedbacks: 0,
        helpfulCount: 0,
        differentCount: 0,
        skipCount: 0,

        // 피드백 기록 및 가중치 조정
        recordFeedback: function(status, templateIndex, feedback) {
          var record: FeedbackRecord = {
            status: status,
            templateIndex: templateIndex,
            feedbackType: feedback,
            timestamp: new Date()
          };

          set(function(state) {
            // 피드백 기록 추가 (최근 100개만 유지)
            var newHistory = [record].concat(state.feedbackHistory.slice(0, 99));

            // 가중치 조정
            var newWeights = { ...state.templateWeights };
            var currentWeights = newWeights[status] ? [...newWeights[status]] : [50, 50, 50, 50, 50];

            // 템플릿 인덱스 범위 체크
            while (currentWeights.length <= templateIndex) {
              currentWeights.push(50);
            }

            // 피드백에 따른 가중치 조정
            if (feedback === 'helpful') {
              // 긍정: 해당 템플릿 가중치 +10 (최대 100)
              currentWeights[templateIndex] = Math.min(currentWeights[templateIndex] + 10, 100);
            } else if (feedback === 'different') {
              // 다른 제안 요청: 해당 템플릿 가중치 -5 (최소 10)
              currentWeights[templateIndex] = Math.max(currentWeights[templateIndex] - 5, 10);
            } else if (feedback === 'skip') {
              // 스킵: 해당 템플릿 가중치 -3 (최소 10)
              currentWeights[templateIndex] = Math.max(currentWeights[templateIndex] - 3, 10);
            }

            newWeights[status] = currentWeights;

            // 통계 업데이트
            return {
              feedbackHistory: newHistory,
              templateWeights: newWeights,
              totalFeedbacks: state.totalFeedbacks + 1,
              helpfulCount: state.helpfulCount + (feedback === 'helpful' ? 1 : 0),
              differentCount: state.differentCount + (feedback === 'different' ? 1 : 0),
              skipCount: state.skipCount + (feedback === 'skip' ? 1 : 0)
            };
          });
        },

        // 가중치 기반 템플릿 선택
        getWeightedTemplateIndex: function(status, templateCount) {
          var weights = get().templateWeights[status] || [];

          // 가중치 배열이 템플릿 수보다 작으면 확장
          while (weights.length < templateCount) {
            weights.push(50);
          }

          // 가중치 합계 계산
          var totalWeight = 0;
          for (var i = 0; i < templateCount; i++) {
            totalWeight += weights[i];
          }

          // 가중치 기반 랜덤 선택
          var random = Math.random() * totalWeight;
          var cumulative = 0;

          for (var j = 0; j < templateCount; j++) {
            cumulative += weights[j];
            if (random <= cumulative) {
              return j;
            }
          }

          return 0;
        },

        // 이해도 기반 밀도 자동 조절
        updateDensityFromUnderstanding: function(understandingScore) {
          var newDensity: BriefingDensity;

          // 이해도가 높으면 밀도를 낮춤 (말이 줄어든다)
          if (understandingScore >= 70) {
            newDensity = 'minimal'; // 핵심만
          } else if (understandingScore >= 40) {
            newDensity = 'normal'; // 적절한 설명
          } else {
            newDensity = 'detailed'; // 상세한 설명
          }

          set({ density: newDensity });
        },

        // 사용자 수동 밀도 설정
        setDensityOverride: function(density) {
          set({ densityOverride: density });
        },

        // 실제 적용될 밀도 반환
        getEffectiveDensity: function() {
          var state = get();
          return state.densityOverride || state.density;
        },

        // 진화 레벨 계산
        getEvolutionLevel: function() {
          var state = get();
          var total = state.totalFeedbacks;

          if (total < 5) {
            return { level: 1, description: '알아가는 중' };
          } else if (total < 15) {
            return { level: 2, description: '패턴 파악 중' };
          } else if (total < 30) {
            return { level: 3, description: '취향 학습 중' };
          } else if (total < 50) {
            return { level: 4, description: '맞춤 조정 중' };
          } else {
            return { level: 5, description: '최적화됨' };
          }
        }
      };
    },
    {
      name: 'alfredo-briefing-evolution'
    }
  )
);
