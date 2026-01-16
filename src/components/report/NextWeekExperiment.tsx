/**
 * NextWeekExperiment.tsx - 다음 주 실험 제안 컴포넌트
 * PRD Phase 3: 방향 제안 - 구체적인 실험 제안
 */

import { Beaker, ArrowRight, Calendar, Zap, Coffee } from 'lucide-react';
import { LiftRecord } from '../../stores/liftStore';

interface Experiment {
  id: string;
  title: string;
  description: string;
  icon: 'calendar' | 'zap' | 'coffee';
  metric?: {
    current: string;
    target: string;
  };
}

interface NextWeekExperimentProps {
  lifts: LiftRecord[];
  className?: string;
}

function getIcon(icon: 'calendar' | 'zap' | 'coffee') {
  switch (icon) {
    case 'calendar': return Calendar;
    case 'zap': return Zap;
    case 'coffee': return Coffee;
    default: return Zap;
  }
}

// 이번 주 데이터 기반 실험 제안 생성
function generateExperiments(lifts: LiftRecord[]): Experiment[] {
  var experiments: Experiment[] = [];

  // 카테고리별 집계
  var categoryCount: Record<string, number> = {};
  var impactCount = { high: 0, medium: 0, low: 0 };
  var timeOfDayCount = { morning: 0, afternoon: 0, evening: 0 };

  lifts.forEach(function(lift) {
    // 카테고리 집계
    categoryCount[lift.category] = (categoryCount[lift.category] || 0) + 1;

    // 영향도 집계
    if (lift.impact) {
      impactCount[lift.impact]++;
    }

    // 시간대 집계
    var hour = new Date(lift.timestamp).getHours();
    if (hour >= 6 && hour < 12) timeOfDayCount.morning++;
    else if (hour >= 12 && hour < 18) timeOfDayCount.afternoon++;
    else timeOfDayCount.evening++;
  });

  // 실험 1: 일정 관련 (schedule 조정이 많으면)
  if (categoryCount['schedule'] >= 2) {
    experiments.push({
      id: 'buffer-time',
      title: '미팅 사이 버퍼 확보하기',
      description: '연속 미팅 사이에 15분 여유 시간을 넣어보세요',
      icon: 'calendar',
      metric: {
        current: categoryCount['schedule'] + '회 일정 조정',
        target: '→ 50% 감소 목표',
      },
    });
  }

  // 실험 2: 컨디션 기반 (condition 조정이 많으면)
  if (categoryCount['condition'] >= 2) {
    experiments.push({
      id: 'energy-check',
      title: '에너지 체크포인트 만들기',
      description: '오후 2시, 5시에 컨디션 체크인을 해보세요',
      icon: 'zap',
      metric: {
        current: categoryCount['condition'] + '회 컨디션 조정',
        target: '→ 사전 인지 늘리기',
      },
    });
  }

  // 실험 3: 워라밸 관련 (worklife 조정이 있으면)
  if (categoryCount['worklife'] >= 1) {
    experiments.push({
      id: 'life-first',
      title: '삶 시간 먼저 확보하기',
      description: '월요일 아침에 이번 주 개인 시간을 먼저 블록하세요',
      icon: 'coffee',
      metric: {
        current: '현재 Life ' + Math.round(35 + (categoryCount['worklife'] || 0) * 3) + '%',
        target: '→ 40% 이상 목표',
      },
    });
  }

  // 실험 4: 우선순위 관련 (priority 조정이 많으면)
  if (categoryCount['priority'] >= 2) {
    experiments.push({
      id: 'top-3-focus',
      title: 'Top 3만 집중하기',
      description: '하루에 중요 업무 3개만 선정하고 나머지는 과감히 미루세요',
      icon: 'zap',
      metric: {
        current: categoryCount['priority'] + '회 우선순위 조정',
        target: '→ 명확한 집중',
      },
    });
  }

  // 기본 실험 (데이터가 적을 때)
  if (experiments.length === 0) {
    experiments.push({
      id: 'morning-planning',
      title: '아침 5분 플래닝',
      description: '하루 시작 전 오늘의 최우선 과제 1개를 정해보세요',
      icon: 'calendar',
    });
    experiments.push({
      id: 'daily-reflection',
      title: '하루 끝 회고',
      description: '퇴근 전 오늘 가장 잘한 결정 1개를 떠올려보세요',
      icon: 'coffee',
    });
  }

  // 최대 3개만 반환
  return experiments.slice(0, 3);
}

export default function NextWeekExperiment({ lifts, className = '' }: NextWeekExperimentProps) {
  var experiments = generateExperiments(lifts);

  return (
    <div className={'bg-gradient-to-br from-[#F9F7FF] to-[#FEF9E7] rounded-xl p-5 sm:p-6 shadow-sm ' + className}>
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <Beaker size={18} className="text-[#A996FF]" />
        <h3 className="font-semibold text-[#1A1A1A]">다음 주 실험</h3>
      </div>

      <p className="text-sm text-[#666666] mb-4">
        이번 주 패턴을 바탕으로 추천하는 작은 실험들이에요
      </p>

      {/* 실험 카드 목록 */}
      <div className="space-y-3">
        {experiments.map(function(experiment) {
          var IconComponent = getIcon(experiment.icon);

          return (
            <div
              key={experiment.id}
              className="bg-white rounded-xl p-4 border border-[#E5E5E5] hover:border-[#A996FF] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#F0F0FF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconComponent size={20} className="text-[#A996FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[#1A1A1A] mb-1">{experiment.title}</h4>
                  <p className="text-sm text-[#666666] leading-snug">{experiment.description}</p>

                  {/* 메트릭 표시 */}
                  {experiment.metric && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="text-[#999999]">{experiment.metric.current}</span>
                      <ArrowRight size={12} className="text-[#A996FF]" />
                      <span className="text-[#A996FF] font-medium">{experiment.metric.target}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 격려 메시지 */}
      <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
        <p className="text-sm text-[#666666] text-center">
          작은 실험이 큰 변화를 만들어요. 하나만 골라 시작해보세요
        </p>
      </div>
    </div>
  );
}
