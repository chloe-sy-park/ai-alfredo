import { useState } from 'react';
import { Target, Zap, Check } from 'lucide-react';
import { ConditionLevel } from '../../services/condition';

interface DecisionMatrixProps {
  condition: ConditionLevel | null;
  currentHour?: number;
  onQuadrantSelect?: (quadrant: QuadrantType) => void;
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
 * 각 사분면 클릭 시 해당 유형의 작업에 집중하도록 안내
 */
export default function DecisionMatrix({ condition, currentHour, onQuadrantSelect }: DecisionMatrixProps) {
  const hour = currentHour ?? new Date().getHours();
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantType | null>(null);

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

  // 사분면 클릭 핸들러
  const handleQuadrantClick = (type: QuadrantType) => {
    setSelectedQuadrant(prev => prev === type ? null : type);
    if (onQuadrantSelect) {
      onQuadrantSelect(type);
    }
  };

  // 선택된 사분면에 따른 상세 메시지
  const getQuadrantDetail = (type: QuadrantType): string => {
    switch (type) {
      case 'doFirst':
        return '중요하고 급한 일을 먼저 처리하세요. 마감이 임박했거나 즉각적인 대응이 필요한 일입니다.';
      case 'schedule':
        return '중요하지만 급하지 않은 일입니다. 시간을 정해두고 계획적으로 진행하세요.';
      case 'delegate':
        return '급하지만 중요도가 낮은 일입니다. 가능하면 다른 사람에게 위임하세요.';
      case 'eliminate':
        return '중요하지도 급하지도 않은 일입니다. 과감하게 제거하거나 미루세요.';
    }
  };

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
          isRecommended={recommendedQuadrant === 'doFirst'}
          isSelected={selectedQuadrant === 'doFirst'}
          onClick={() => handleQuadrantClick('doFirst')}
        />
        {/* SCHEDULE - 상단 우측 */}
        <QuadrantCell
          type="schedule"
          isRecommended={recommendedQuadrant === 'schedule'}
          isSelected={selectedQuadrant === 'schedule'}
          onClick={() => handleQuadrantClick('schedule')}
        />
        {/* DELEGATE - 하단 좌측 */}
        <QuadrantCell
          type="delegate"
          isRecommended={recommendedQuadrant === 'delegate'}
          isSelected={selectedQuadrant === 'delegate'}
          onClick={() => handleQuadrantClick('delegate')}
        />
        {/* ELIMINATE - 하단 우측 */}
        <QuadrantCell
          type="eliminate"
          isRecommended={recommendedQuadrant === 'eliminate'}
          isSelected={selectedQuadrant === 'eliminate'}
          onClick={() => handleQuadrantClick('eliminate')}
        />
      </div>

      {/* Status/Detail Message */}
      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
        <Zap size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <p>{selectedQuadrant ? getQuadrantDetail(selectedQuadrant) : getStatusMessage()}</p>
      </div>
    </div>
  );
}

// 사분면 셀 컴포넌트 (인터랙티브 버튼)
interface QuadrantCellProps {
  type: QuadrantType;
  isRecommended: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function QuadrantCell({ type, isRecommended, isSelected, onClick }: QuadrantCellProps) {
  const config = QUADRANT_CONFIG[type];
  const isActive = isRecommended || isSelected;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative p-3 rounded-xl border-2 transition-all min-h-[56px]
        cursor-pointer hover:scale-[1.02] active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-primary/30
        ${isActive
          ? `${config.bgColor} ${config.borderColor} ${config.color}`
          : 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-600 text-gray-400 hover:border-gray-300'
        }
        ${isSelected ? 'ring-2 ring-primary/50' : ''}
      `}
      aria-pressed={isSelected}
      aria-label={`${config.label}: ${config.description}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${isActive ? config.color : 'text-gray-400'}`}>
          {config.label}
        </span>
        {isSelected && (
          <Check size={14} className="text-primary" />
        )}
      </div>
      <span className={`text-[10px] mt-1 block ${isActive ? 'opacity-70' : 'opacity-50'}`}>
        {config.description}
      </span>
      {isRecommended && !isSelected && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" />
        </div>
      )}
    </button>
  );
}

// Type export for external use
export type { QuadrantType };
