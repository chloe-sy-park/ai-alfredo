/**
 * Life OS - Zustand Store
 *
 * 컨디션, 관계, 웰니스 관리
 * Finance Store 패턴 적용 - 글로벌 상태 + 캐싱
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ConditionLevel, getTodayCondition, saveCondition } from '../services/condition';
import { getTop3, Top3Item } from '../services/top3';
import { getRelationships, Relationship } from '../services/relationships';

// ============================================
// Types
// ============================================

export interface PriorityItem {
  id: string;
  title: string;
  sourceTag: 'WORK' | 'LIFE';
  meta?: string;
  status: 'pending' | 'in-progress' | 'done';
}

export interface LifeFactorItem {
  id: string;
  label: string;
  statusText: string;
  signal: 'up' | 'down' | 'steady';
}

export interface RelationshipItem {
  id: string;
  name: string;
  reason: string;
}

export interface LifeBriefing {
  headline: string;
  subline: string;
}

// ============================================
// Store Interface
// ============================================

interface LifeState {
  // Data
  condition: ConditionLevel | null;
  lifePriorities: Top3Item[];
  relationships: Relationship[];
  briefing: LifeBriefing;

  // UI State
  isMoreSheetOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions - Data
  loadData: () => void;
  setCondition: (level: ConditionLevel) => void;

  // Actions - UI
  openMoreSheet: () => void;
  closeMoreSheet: () => void;

  // Selectors (computed values)
  getPriorityItems: () => PriorityItem[];
  getRelationshipItems: () => RelationshipItem[];
  getLifeFactors: () => LifeFactorItem[];
  getMoreContent: () => { why: string; whatChanged: string; tradeOff: string };

  // Actions - Clear
  clearError: () => void;
}

// ============================================
// Helper Functions
// ============================================

const generateLifeBriefing = (condition: ConditionLevel | null): LifeBriefing => {
  const now = new Date();
  const hour = now.getHours();
  let headline = '';
  let subline = '';

  if (hour < 12) {
    headline = '오늘은 나를 위한 하루예요';
    subline = '작은 것부터 챙겨볼까요';
  } else if (hour < 18) {
    headline = '잠시 멈추고 숨 돌리세요';
    subline = '일과 삶의 균형이 중요해요';
  } else {
    headline = '하루를 마무리하는 시간';
    subline = '오늘의 나에게 수고했다고 말해주세요';
  }

  // 컨디션에 따른 메시지 조정
  if (condition === 'bad') {
    headline = '오늘은 쉬어가도 괜찮아요';
    subline = '컨디션이 좋지 않을 땐 무리하지 마세요';
  } else if (condition === 'great') {
    headline = '좋은 컨디션이네요!';
    subline = '이 에너지로 의미 있는 하루를 만들어봐요';
  }

  return { headline, subline };
};

// ============================================
// Initial State
// ============================================

const initialState = {
  condition: null as ConditionLevel | null,
  lifePriorities: [] as Top3Item[],
  relationships: [] as Relationship[],
  briefing: { headline: '', subline: '' } as LifeBriefing,
  isMoreSheetOpen: false,
  isLoading: false,
  error: null as string | null,
};

// ============================================
// Store Implementation
// ============================================

export const useLifeStore = create<LifeState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // Data Actions
      // ============================================

      loadData: () => {
        set({ isLoading: true, error: null });

        try {
          // 컨디션 로드
          const todayCondition = getTodayCondition();
          const conditionLevel = todayCondition?.level || null;

          // Life 우선순위 (개인 항목만 필터)
          const allItems = getTop3();
          const lifeItems = allItems.filter((item) => item.isPersonal === true);

          // 관계 데이터 로드
          const relationshipData = getRelationships();
          const topRelationships = relationshipData.slice(0, 3); // Top 3만

          // 브리핑 생성
          const briefing = generateLifeBriefing(conditionLevel);

          set({
            condition: conditionLevel,
            lifePriorities: lifeItems,
            relationships: topRelationships,
            briefing,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '데이터 로드 실패';
          console.error('[LifeStore] 데이터 로드 실패:', error);
          set({ error: errorMessage, isLoading: false });
        }
      },

      setCondition: (level) => {
        // 서비스에 저장
        saveCondition(level);

        // 브리핑 업데이트
        const briefing = generateLifeBriefing(level);

        set({ condition: level, briefing });
      },

      // ============================================
      // UI Actions
      // ============================================

      openMoreSheet: () => {
        set({ isMoreSheetOpen: true });
      },

      closeMoreSheet: () => {
        set({ isMoreSheetOpen: false });
      },

      // ============================================
      // Selectors (Computed Values)
      // ============================================

      getPriorityItems: () => {
        const { lifePriorities } = get();

        return lifePriorities.map((item) => ({
          id: item.id,
          title: item.title,
          sourceTag: 'LIFE' as const,
          meta: item.completed ? '완료' : undefined,
          status: item.completed ? 'done' as const : 'pending' as const,
        }));
      },

      getRelationshipItems: () => {
        const { relationships } = get();

        return relationships.map((rel) => ({
          id: rel.id,
          name: rel.name,
          reason: rel.lastContactDate
            ? '마지막 연락: ' + new Date(rel.lastContactDate).toLocaleDateString('ko-KR')
            : '연락해보세요',
        }));
      },

      getLifeFactors: () => {
        const { condition, lifePriorities, relationships } = get();

        return [
          {
            id: 'condition',
            label: '컨디션',
            statusText: condition
              ? { great: '아주 좋음', good: '좋음', normal: '보통', bad: '좋지 않음' }[condition]
              : '미설정',
            signal: condition === 'great' ? 'up' as const
              : condition === 'bad' ? 'down' as const
              : 'steady' as const,
          },
          {
            id: 'balance',
            label: '균형',
            statusText: lifePriorities.length > 0 ? '관리 중' : '여유로움',
            signal: 'steady' as const,
          },
          {
            id: 'relationships',
            label: '관계',
            statusText: relationships.length + '명 케어',
            signal: relationships.length > 0 ? 'up' as const : 'steady' as const,
          },
          {
            id: 'rest',
            label: '휴식',
            statusText: condition === 'bad' ? '필요함' : '적당함',
            signal: condition === 'bad' ? 'down' as const : 'steady' as const,
          },
        ];
      },

      getMoreContent: () => {
        return {
          why: '라이프 영역의 균형을 위해 분석했어요.',
          whatChanged: '컨디션과 관계 데이터를 기반으로 판단했어요.',
          tradeOff: '일에 치여 소중한 것들을 놓치지 마세요.',
        };
      },

      // ============================================
      // Utility Actions
      // ============================================

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'alfredo_life',
      storage: createJSONStorage(() => localStorage),
      partialize: () => ({
        // condition은 서비스에서 관리하므로 persist하지 않음
        // UI 상태만 유지
      }),
    }
  )
);

// ============================================
// Selectors (외부에서 사용)
// ============================================

export const selectCondition = (state: LifeState) => state.condition;
export const selectLifePriorities = (state: LifeState) => state.lifePriorities;
export const selectRelationships = (state: LifeState) => state.relationships;
export const selectBriefing = (state: LifeState) => state.briefing;
export const selectIsLoading = (state: LifeState) => state.isLoading;
export const selectError = (state: LifeState) => state.error;
