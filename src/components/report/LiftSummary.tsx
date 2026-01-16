/**
 * LiftSummary
 * PRD Component Inventory: 판단 변화 요약 컴포넌트
 * Judgement Lift 통계를 시각화
 */

import { RefreshCw } from 'lucide-react';
import { LiftRecord } from '../../stores/liftStore';

interface LiftSummaryProps {
  lifts: LiftRecord[];
  period?: 'week' | 'month';
  showDescription?: boolean;
}

interface LiftStats {
  total: number;
  apply: number;
  maintain: number;
  consider: number;
  byCategory: {
    priority: number;
    schedule: number;
    worklife: number;
    condition: number;
  };
  byImpact: {
    high: number;
    medium: number;
    low: number;
  };
}

function calculateStats(lifts: LiftRecord[]): LiftStats {
  var stats: LiftStats = {
    total: lifts.length,
    apply: 0,
    maintain: 0,
    consider: 0,
    byCategory: {
      priority: 0,
      schedule: 0,
      worklife: 0,
      condition: 0
    },
    byImpact: {
      high: 0,
      medium: 0,
      low: 0
    }
  };

  lifts.forEach(function(lift) {
    // Type counts
    if (lift.type === 'apply') stats.apply++;
    else if (lift.type === 'maintain') stats.maintain++;
    else if (lift.type === 'consider') stats.consider++;

    // Category counts
    stats.byCategory[lift.category]++;

    // Impact counts
    stats.byImpact[lift.impact]++;
  });

  return stats;
}

function getCategoryLabel(category: string) {
  switch (category) {
    case 'priority':
      return '우선순위';
    case 'schedule':
      return '일정';
    case 'worklife':
      return '워라밸';
    case 'condition':
      return '컨디션';
    default:
      return category;
  }
}

export default function LiftSummary({
  lifts,
  period = 'week',
  showDescription = true
}: LiftSummaryProps) {
  var stats = calculateStats(lifts);
  var periodLabel = period === 'week' ? '이번 주' : '이번 달';

  // 가장 많은 카테고리 찾기
  var topCategory = Object.entries(stats.byCategory).sort(function(a, b) {
    return b[1] - a[1];
  })[0];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw size={18} className="text-[#A996FF]" />
        <h3 className="font-semibold text-[#1A1A1A] dark:text-white">판단 변화</h3>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center p-3 bg-[#F5F5F5] dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-[#A996FF]">{stats.total}</div>
          <div className="text-xs text-[#999999] dark:text-gray-400 mt-1">전체</div>
        </div>
        <div className="text-center p-3 bg-[#F5F5F5] dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{stats.apply}</div>
          <div className="text-xs text-[#999999] dark:text-gray-400 mt-1">적용</div>
        </div>
        <div className="text-center p-3 bg-[#F5F5F5] dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-[#999999]">{stats.maintain}</div>
          <div className="text-xs text-[#999999] dark:text-gray-400 mt-1">유지</div>
        </div>
        <div className="text-center p-3 bg-[#F5F5F5] dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-[#F97316]">{stats.consider}</div>
          <div className="text-xs text-[#999999] dark:text-gray-400 mt-1">검토</div>
        </div>
      </div>

      {/* 카테고리별 분포 */}
      <div className="mb-4">
        <p className="text-xs text-[#999999] dark:text-gray-400 mb-2">카테고리별</p>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(stats.byCategory).map(function([category, count]) {
            if (count === 0) return null;
            return (
              <span
                key={category}
                className="px-2 py-1 bg-[#F0F0FF] dark:bg-gray-700 text-[#A996FF] text-xs rounded-full"
              >
                {getCategoryLabel(category)} {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* 영향도 분포 */}
      <div className="mb-4">
        <p className="text-xs text-[#999999] dark:text-gray-400 mb-2">영향도</p>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-[#E5E5E5] dark:bg-gray-700">
          {stats.byImpact.high > 0 && (
            <div
              className="bg-red-400 transition-all"
              style={{ width: `${(stats.byImpact.high / stats.total) * 100}%` }}
            />
          )}
          {stats.byImpact.medium > 0 && (
            <div
              className="bg-yellow-400 transition-all"
              style={{ width: `${(stats.byImpact.medium / stats.total) * 100}%` }}
            />
          )}
          {stats.byImpact.low > 0 && (
            <div
              className="bg-green-400 transition-all"
              style={{ width: `${(stats.byImpact.low / stats.total) * 100}%` }}
            />
          )}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[#999999]">높음 {stats.byImpact.high}</span>
          <span className="text-[10px] text-[#999999]">중간 {stats.byImpact.medium}</span>
          <span className="text-[10px] text-[#999999]">낮음 {stats.byImpact.low}</span>
        </div>
      </div>

      {/* 설명 */}
      {showDescription && stats.total > 0 && (
        <p className="text-sm text-[#666666] dark:text-gray-300 leading-relaxed border-t border-[#E5E5E5] dark:border-gray-700 pt-4">
          {periodLabel}에는 {stats.total}번의 판단 재조정이 있었고,
          그 중 {stats.apply}번을 실제로 반영했어요.
          {topCategory[1] > 0 && ` ${getCategoryLabel(topCategory[0])} 관련 조정이 가장 많았습니다.`}
        </p>
      )}

      {/* 데이터 없음 */}
      {stats.total === 0 && (
        <p className="text-sm text-[#999999] dark:text-gray-400 text-center py-4">
          {periodLabel}에 기록된 판단 변화가 없어요
        </p>
      )}
    </div>
  );
}

// Export types for external usage
export type { LiftStats };
export { calculateStats };
