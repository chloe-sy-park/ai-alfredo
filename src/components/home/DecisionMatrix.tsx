import { Target, Zap } from 'lucide-react';
import { ConditionLevel } from '../../services/condition';

interface DecisionMatrixProps {
  condition: ConditionLevel | null;
  currentHour?: number;
}

type QuadrantType = 'doFirst' | 'schedule' | 'delegate' | 'eliminate';

interface QuadrantInfo {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const QUADRANT_CONFIG: Record<QuadrantType, QuadrantInfo> = {
  doFirst: {
    label: 'DO FIRST',
    description: '지금 바로 집중',
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/30'
  },
  schedule: {
    label: 'SCHEDULE',
    description: '나중에 할 일',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  delegate: {
    label: 'DELEGATE',
    description: '위임할 수 있는 일',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  eliminate: {
    label: 'ELIMINATE',
    description: '제거할 일',
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-100'
  }
};

/**
 * AI 의사결정 매트릭스
 * 사용자의 시간/컨디션 상태에 따라 적절한 작업 유형을 시각적으로 표현
 */
export default function DecisionMatrix({ condition, currentHour }: DecisionMatrixProps) {
  const hour = currentHour ?? new Date().getHours();

  // 현재 상태에 따른 추천 사분면 계산
  const getRecommendedQuadrant = (): QuadrantType => {
    // 컨디션이 좋고 오전/이른 오후 = DO FIRST
    if ((condition === 'great' || condition === 'good') && hour >= 9 && hour < 14) {
      return 'doFirst';
    }
    // 컨디션이 보통이거나 오후 = SCHEDULE
    if (condition === 'normal' || (hour >= 14 && hour < 18)) {
      return 'schedule';
    }
    // 컨디션이 나쁨 = DELEGATE
    if (condition === 'bad') {
      return 'delegate';
    }
    // 저녁 시간 = SCHEDULE or ELIMINATE
    if (hour >= 18) {
      return 'schedule';
    }
    return 'doFirst';
  };

  // 상태 기반 메시지 생성
  const getStatusMessage = (): string => {
    const quadrant = getRecommendedQuadrant();

    if (quadrant === 'doFirst') {
      return '현재 에너지가 충만합니다. 고도의 집중이 필요한 일을 먼저 끝내세요!';
    } else if (quadrant === 'schedule') {
      return '중요하지만 급하지 않은 일을 계획해보세요.';
    } else if (quadrant === 'delegate') {
      return '컨디션이 좋지 않네요. 가능하면 위임하거나 쉬어가세요.';
    } else {
      return '불필요한 일은 과감히 제거하세요.';
    }
  };

  // 플로우 상태 계산
  const getFlowState = (): string => {
    if ((condition === 'great' || condition === 'good') && hour >= 9 && hour < 14) {
      return 'OPTIMAL FLOW';
    } else if (condition === 'normal') {
      return 'STEADY PACE';
    } else if (condition === 'bad') {
      return 'REST MODE';
    }
    return 'BALANCED';
  };

  const recommendedQuadrant = getRecommendedQuadrant();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-primary" />
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            AI 의사결정 매트릭스
          </span>
        </div>
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-primary">
          {getFlowState()}
        </span>
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* DO FIRST - 상단 좌측 */}
        <QuadrantCell
          type="doFirst"
          isActive={recommendedQuadrant === 'doFirst'}
        />
        {/* SCHEDULE - 상단 우측 */}
        <QuadrantCell
          type="schedule"
          isActive={recommendedQuadrant === 'schedule'}
        />
        {/* DELEGATE - 하단 좌측 */}
        <QuadrantCell
          type="delegate"
          isActive={recommendedQuadrant === 'delegate'}
        />
        {/* ELIMINATE - 하단 우측 */}
        <QuadrantCell
          type="eliminate"
          isActive={recommendedQuadrant === 'eliminate'}
        />
      </div>

      {/* Status Message */}
      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
        <Zap size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <p>{getStatusMessage()}</p>
      </div>
    </div>
  );
}

// 사분면 셀 컴포넌트
function QuadrantCell({ type, isActive }: { type: QuadrantType; isActive: boolean }) {
  const config = QUADRANT_CONFIG[type];

  return (
    <div
      className={`
        relative p-3 rounded-xl border-2 transition-all
        ${isActive
          ? `${config.bgColor} ${config.borderColor} ${config.color}`
          : 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-600 text-gray-400'
        }
      `}
    >
      <span className={`text-xs font-bold ${isActive ? config.color : 'text-gray-400'}`}>
        {config.label}
      </span>
      {isActive && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-primary/30 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}
