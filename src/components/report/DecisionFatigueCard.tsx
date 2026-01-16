/**
 * DecisionFatigueCard.tsx - 결정 피로 분석 카드
 * PRD Phase 3: 결정 피로 흐름 분석
 */

import { AlertTriangle, CheckCircle, AlertCircle, Brain } from 'lucide-react';
import { DecisionFatigueAnalysis } from '../../stores/liftStore';

interface DecisionFatigueCardProps {
  analysis: DecisionFatigueAnalysis;
  className?: string;
}

function getLevelConfig(level: 'low' | 'moderate' | 'high') {
  switch (level) {
    case 'high':
      return {
        icon: AlertTriangle,
        label: '높음',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-500',
        labelColor: 'text-red-600',
        barColor: 'bg-red-400'
      };
    case 'moderate':
      return {
        icon: AlertCircle,
        label: '보통',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-500',
        labelColor: 'text-yellow-600',
        barColor: 'bg-yellow-400'
      };
    case 'low':
    default:
      return {
        icon: CheckCircle,
        label: '낮음',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-500',
        labelColor: 'text-green-600',
        barColor: 'bg-green-400'
      };
  }
}

export default function DecisionFatigueCard({ analysis, className = '' }: DecisionFatigueCardProps) {
  var config = getLevelConfig(analysis.level);
  var IconComponent = config.icon;

  // 피로도 바 너비 계산
  var barWidth = analysis.level === 'high' ? 100 :
                 analysis.level === 'moderate' ? 60 : 25;

  return (
    <div className={'rounded-xl p-5 sm:p-6 shadow-sm ' + config.bgColor + ' border ' + config.borderColor + ' ' + className}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-[#A996FF]" />
          <h3 className="font-semibold text-[#1A1A1A]">결정 피로도</h3>
        </div>
        <div className={'flex items-center gap-1 px-2 py-1 rounded-full ' + config.bgColor}>
          <IconComponent size={14} className={config.iconColor} />
          <span className={'text-xs font-medium ' + config.labelColor}>{config.label}</span>
        </div>
      </div>

      {/* 피로도 바 */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={'h-full rounded-full transition-all duration-500 ' + config.barColor}
            style={{ width: barWidth + '%' }}
          />
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-[#999999] mb-1">최근 1시간</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{analysis.recentDecisionsInHour}회 결정</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-[#999999] mb-1">연속 결정</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{analysis.consecutiveCount}회</p>
        </div>
      </div>

      {/* 평균 시간 */}
      {analysis.averageTimeBetween !== null && (
        <div className="bg-white rounded-lg p-3 mb-4">
          <p className="text-xs text-[#999999] mb-1">결정 간 평균 시간</p>
          <p className="text-sm font-medium text-[#1A1A1A]">{analysis.averageTimeBetween}분</p>
        </div>
      )}

      {/* 경고 메시지 */}
      {analysis.warning && (
        <div className="bg-white rounded-lg p-3 mb-2 border-l-4 border-l-orange-400">
          <p className="text-sm text-[#666666]">{analysis.warning}</p>
        </div>
      )}

      {/* 제안 */}
      {analysis.suggestion && (
        <div className="bg-[#F9F7FF] rounded-lg p-3">
          <p className="text-sm text-[#666666]">💡 {analysis.suggestion}</p>
        </div>
      )}

      {/* 정상일 때 긍정 메시지 */}
      {analysis.level === 'low' && (
        <p className="text-sm text-[#666666] text-center">
          결정 패턴이 안정적이에요. 좋은 페이스를 유지하고 있어요!
        </p>
      )}
    </div>
  );
}
