/**
 * NudgeInsightsCard.tsx
 * 넛지 효과 분석 인사이트 카드
 */

import { motion } from 'framer-motion';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import {
  useNudgeAnalyticsStore,
  NudgeInsight,
  NudgeEffectivenessStats,
} from '../../services/nudgeAnalytics';

interface NudgeInsightsCardProps {
  onViewDetails?: () => void;
}

export function NudgeInsightsCard({ onViewDetails }: NudgeInsightsCardProps) {
  const insights = useNudgeAnalyticsStore((state) => state.getInsights());
  const stats = useNudgeAnalyticsStore((state) => state.getEffectivenessStats());

  if (insights.length === 0 && stats.length === 0) {
    return null;
  }

  const totalInteractions = stats.reduce((sum, s) => sum + s.totalShown, 0);
  const avgClickRate =
    stats.length > 0
      ? stats.reduce((sum, s) => sum + s.clickRate, 0) / stats.length
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-600" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            넛지 효과 분석
          </h3>
        </div>
        {totalInteractions > 0 && (
          <span className="text-xs text-neutral-500">
            {totalInteractions}회 분석
          </span>
        )}
      </div>

      {/* 요약 통계 */}
      {stats.length > 0 && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-lg font-bold text-blue-600">
              {Math.round(avgClickRate * 100)}%
            </p>
            <p className="text-xs text-neutral-500">평균 반응률</p>
          </div>
          <div className="flex-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <p className="text-lg font-bold text-green-600">
              {stats.filter((s) => s.trend === 'improving').length}
            </p>
            <p className="text-xs text-neutral-500">개선 중</p>
          </div>
          <div className="flex-1 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
            <p className="text-lg font-bold text-purple-600">{stats.length}</p>
            <p className="text-xs text-neutral-500">카테고리</p>
          </div>
        </div>
      )}

      {/* 인사이트 목록 */}
      {insights.length > 0 && (
        <div className="space-y-2 mb-3">
          {insights.slice(0, 3).map((insight) => (
            <InsightItem key={insight.id} insight={insight} />
          ))}
        </div>
      )}

      {/* 카테고리별 효과 (상위 3개) */}
      {stats.length > 0 && (
        <div className="space-y-2 mb-3">
          {stats
            .sort((a, b) => b.clickRate - a.clickRate)
            .slice(0, 3)
            .map((stat) => (
              <CategoryStatItem key={stat.category} stat={stat} />
            ))}
        </div>
      )}

      {/* 자세히 보기 */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          자세히 보기
          <ChevronRight size={14} />
        </button>
      )}
    </motion.div>
  );
}

function InsightItem({ insight }: { insight: NudgeInsight }) {
  const iconMap = {
    success: <CheckCircle2 size={16} className="text-green-500" />,
    suggestion: <Lightbulb size={16} className="text-yellow-500" />,
    warning: <AlertCircle size={16} className="text-orange-500" />,
  };

  const bgMap = {
    success: 'bg-green-50 dark:bg-green-900/20',
    suggestion: 'bg-yellow-50 dark:bg-yellow-900/20',
    warning: 'bg-orange-50 dark:bg-orange-900/20',
  };

  return (
    <div className={`p-3 rounded-lg ${bgMap[insight.type]}`}>
      <div className="flex items-start gap-2">
        {iconMap[insight.type]}
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            {insight.title}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}

function CategoryStatItem({ stat }: { stat: NudgeEffectivenessStats }) {
  const trendIcon =
    stat.trend === 'improving' ? (
      <TrendingUp size={12} className="text-green-500" />
    ) : stat.trend === 'declining' ? (
      <TrendingDown size={12} className="text-red-500" />
    ) : null;

  const categoryLabels: Record<string, string> = {
    break: '휴식',
    focus: '집중',
    health: '건강',
    deadline: '마감',
    celebration: '축하',
    reminder: '리마인더',
    insight: '인사이트',
  };

  const clickRateColor =
    stat.clickRate >= 0.5
      ? 'text-green-600'
      : stat.clickRate >= 0.2
      ? 'text-yellow-600'
      : 'text-neutral-500';

  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-700 dark:text-neutral-300">
          {categoryLabels[stat.category] || stat.category}
        </span>
        {trendIcon}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-neutral-400">{stat.totalShown}회</span>
        <span className={`text-sm font-medium ${clickRateColor}`}>
          {Math.round(stat.clickRate * 100)}%
        </span>
      </div>
    </div>
  );
}

export default NudgeInsightsCard;
