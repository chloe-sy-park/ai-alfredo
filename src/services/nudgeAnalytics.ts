/**
 * nudgeAnalytics.ts
 * 넛지 효과 분석 시스템
 *
 * 알프레도 철학: 데이터 기반으로 더 나은 넛지 제공
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// === 타입 정의 ===

export type NudgeAction = 'clicked' | 'dismissed' | 'snoozed' | 'ignored';
export type NudgeCategory =
  | 'break'
  | 'focus'
  | 'health'
  | 'deadline'
  | 'celebration'
  | 'reminder'
  | 'insight';

export interface NudgeInteraction {
  nudgeId: string;
  nudgeType: string;
  category: NudgeCategory;
  action: NudgeAction;
  timestamp: string;
  responseTimeMs?: number; // 넛지 표시 ~ 응답까지 시간
  context?: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: number;
    wasInFocusMode: boolean;
  };
}

export interface NudgeEffectivenessStats {
  category: NudgeCategory;
  totalShown: number;
  clicked: number;
  dismissed: number;
  snoozed: number;
  ignored: number;
  clickRate: number;
  avgResponseTimeMs: number;
  bestTimeOfDay: string;
  trend: 'improving' | 'declining' | 'stable';
}

export interface NudgeAnalyticsState {
  // 상호작용 기록
  interactions: NudgeInteraction[];

  // 넛지 표시 시간 추적 (응답 시간 계산용)
  pendingNudges: Map<string, number>; // nudgeId -> timestamp

  // Actions
  recordNudgeShown: (nudgeId: string, nudgeType: string, category: NudgeCategory) => void;
  recordInteraction: (
    nudgeId: string,
    action: NudgeAction,
    context?: NudgeInteraction['context']
  ) => void;

  // Analytics
  getEffectivenessStats: () => NudgeEffectivenessStats[];
  getCategoryStats: (category: NudgeCategory) => NudgeEffectivenessStats | null;
  getBestTimeForNudges: (category: NudgeCategory) => string;
  getShouldShowNudge: (category: NudgeCategory) => boolean;
  getInsights: () => NudgeInsight[];

  // 데이터 관리
  clearOldData: (daysToKeep?: number) => void;
}

export interface NudgeInsight {
  id: string;
  type: 'success' | 'suggestion' | 'warning';
  title: string;
  description: string;
  actionLabel?: string;
  category?: NudgeCategory;
}

// === 스토어 ===

export const useNudgeAnalyticsStore = create<NudgeAnalyticsState>()(
  persist(
    (set, get) => ({
      interactions: [],
      pendingNudges: new Map(),

      recordNudgeShown: (nudgeId, _nudgeType, _category) => {
        const pendingNudges = new Map(get().pendingNudges);
        pendingNudges.set(nudgeId, Date.now());
        set({ pendingNudges });
      },

      recordInteraction: (nudgeId, action, context) => {
        const { pendingNudges, interactions } = get();
        const shownTime = pendingNudges.get(nudgeId);
        const responseTimeMs = shownTime ? Date.now() - shownTime : undefined;

        // 현재 시간 컨텍스트 계산
        const now = new Date();
        const hour = now.getHours();
        const timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' =
          hour >= 5 && hour < 12
            ? 'morning'
            : hour >= 12 && hour < 17
            ? 'afternoon'
            : hour >= 17 && hour < 21
            ? 'evening'
            : 'night';

        const interaction: NudgeInteraction = {
          nudgeId,
          nudgeType: '', // Will be filled from pendingNudges tracking
          category: 'reminder', // Default, should be passed from caller
          action,
          timestamp: now.toISOString(),
          responseTimeMs,
          context: context || {
            timeOfDay,
            dayOfWeek: now.getDay(),
            wasInFocusMode: false,
          },
        };

        // pendingNudges에서 제거
        const newPendingNudges = new Map(pendingNudges);
        newPendingNudges.delete(nudgeId);

        set({
          interactions: [...interactions.slice(-499), interaction], // 최근 500개 유지
          pendingNudges: newPendingNudges,
        });
      },

      getEffectivenessStats: () => {
        const categories: NudgeCategory[] = [
          'break',
          'focus',
          'health',
          'deadline',
          'celebration',
          'reminder',
          'insight',
        ];

        return categories
          .map((category) => get().getCategoryStats(category))
          .filter((stats): stats is NudgeEffectivenessStats => stats !== null);
      },

      getCategoryStats: (category) => {
        const { interactions } = get();
        const categoryInteractions = interactions.filter(
          (i) => i.category === category
        );

        if (categoryInteractions.length === 0) return null;

        const clicked = categoryInteractions.filter((i) => i.action === 'clicked').length;
        const dismissed = categoryInteractions.filter((i) => i.action === 'dismissed').length;
        const snoozed = categoryInteractions.filter((i) => i.action === 'snoozed').length;
        const ignored = categoryInteractions.filter((i) => i.action === 'ignored').length;
        const totalShown = categoryInteractions.length;

        // 평균 응답 시간
        const responseTimes = categoryInteractions
          .filter((i) => i.responseTimeMs !== undefined)
          .map((i) => i.responseTimeMs!);
        const avgResponseTimeMs =
          responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;

        // 가장 효과적인 시간대
        const timeOfDayCount = categoryInteractions
          .filter((i) => i.action === 'clicked' && i.context?.timeOfDay)
          .reduce((acc, i) => {
            const time = i.context!.timeOfDay;
            acc[time] = (acc[time] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

        const bestTimeOfDay =
          Object.entries(timeOfDayCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
          'afternoon';

        // 트렌드 계산 (최근 10개 vs 이전 10개)
        const recent = categoryInteractions.slice(-10);
        const previous = categoryInteractions.slice(-20, -10);
        const recentClickRate =
          recent.length > 0
            ? recent.filter((i) => i.action === 'clicked').length / recent.length
            : 0;
        const previousClickRate =
          previous.length > 0
            ? previous.filter((i) => i.action === 'clicked').length / previous.length
            : 0;

        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (recentClickRate > previousClickRate + 0.1) trend = 'improving';
        else if (recentClickRate < previousClickRate - 0.1) trend = 'declining';

        return {
          category,
          totalShown,
          clicked,
          dismissed,
          snoozed,
          ignored,
          clickRate: totalShown > 0 ? clicked / totalShown : 0,
          avgResponseTimeMs,
          bestTimeOfDay,
          trend,
        };
      },

      getBestTimeForNudges: (category) => {
        const stats = get().getCategoryStats(category);
        return stats?.bestTimeOfDay || 'afternoon';
      },

      getShouldShowNudge: (category) => {
        const stats = get().getCategoryStats(category);
        if (!stats) return true; // 데이터 없으면 표시

        // 클릭률이 10% 미만이고 20개 이상 표시했으면 빈도 줄이기
        if (stats.clickRate < 0.1 && stats.totalShown >= 20) {
          // 50% 확률로만 표시
          return Math.random() > 0.5;
        }

        // 최근 트렌드가 declining이면 빈도 줄이기
        if (stats.trend === 'declining' && stats.totalShown >= 30) {
          return Math.random() > 0.3;
        }

        return true;
      },

      getInsights: () => {
        const stats = get().getEffectivenessStats();
        const insights: NudgeInsight[] = [];

        stats.forEach((stat) => {
          // 클릭률 높은 카테고리
          if (stat.clickRate >= 0.5 && stat.totalShown >= 10) {
            insights.push({
              id: `success-${stat.category}`,
              type: 'success',
              title: `${getCategoryLabel(stat.category)} 넛지가 효과적이에요`,
              description: `클릭률 ${Math.round(stat.clickRate * 100)}%로 잘 반응하고 있어요.`,
              category: stat.category,
            });
          }

          // 클릭률 낮은 카테고리
          if (stat.clickRate < 0.15 && stat.totalShown >= 15) {
            insights.push({
              id: `warning-${stat.category}`,
              type: 'warning',
              title: `${getCategoryLabel(stat.category)} 넛지를 조정할게요`,
              description: `반응이 적어서 빈도를 줄일게요. 설정에서 변경 가능해요.`,
              category: stat.category,
            });
          }

          // 최적 시간대 제안
          if (stat.totalShown >= 20 && stat.bestTimeOfDay) {
            const timeLabel = getTimeOfDayLabel(stat.bestTimeOfDay);
            insights.push({
              id: `suggestion-time-${stat.category}`,
              type: 'suggestion',
              title: `${getCategoryLabel(stat.category)}은 ${timeLabel}에 효과적`,
              description: `${timeLabel}에 가장 잘 반응해요. 이 시간에 집중할게요.`,
              category: stat.category,
            });
          }
        });

        // 전체 요약
        const totalInteractions = stats.reduce((sum, s) => sum + s.totalShown, 0);
        const avgClickRate =
          stats.length > 0
            ? stats.reduce((sum, s) => sum + s.clickRate, 0) / stats.length
            : 0;

        if (totalInteractions >= 50) {
          insights.unshift({
            id: 'summary',
            type: 'success',
            title: '넛지 분석 요약',
            description: `총 ${totalInteractions}개의 넛지 중 평균 ${Math.round(avgClickRate * 100)}% 반응률이에요.`,
          });
        }

        return insights.slice(0, 5); // 최대 5개
      },

      clearOldData: (daysToKeep = 30) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysToKeep);

        set((state) => ({
          interactions: state.interactions.filter(
            (i) => new Date(i.timestamp) >= cutoff
          ),
        }));
      },
    }),
    {
      name: 'nudge-analytics-store',
      partialize: (state: NudgeAnalyticsState) => ({
        interactions: state.interactions,
      }),
    }
  )
);

// === 헬퍼 함수 ===

function getCategoryLabel(category: NudgeCategory): string {
  const labels: Record<NudgeCategory, string> = {
    break: '휴식',
    focus: '집중',
    health: '건강',
    deadline: '마감',
    celebration: '축하',
    reminder: '리마인더',
    insight: '인사이트',
  };
  return labels[category] || category;
}

function getTimeOfDayLabel(timeOfDay: string): string {
  const labels: Record<string, string> = {
    morning: '오전',
    afternoon: '오후',
    evening: '저녁',
    night: '밤',
  };
  return labels[timeOfDay] || timeOfDay;
}

// === 통합 함수 (nudgeStore와 연동) ===

/**
 * 넛지 표시 시 호출
 */
export function trackNudgeShown(
  nudgeId: string,
  nudgeType: string,
  category: NudgeCategory
): void {
  useNudgeAnalyticsStore.getState().recordNudgeShown(nudgeId, nudgeType, category);
}

/**
 * 넛지 상호작용 시 호출
 */
export function trackNudgeInteraction(
  nudgeId: string,
  action: NudgeAction,
  context?: NudgeInteraction['context']
): void {
  useNudgeAnalyticsStore.getState().recordInteraction(nudgeId, action, context);
}

/**
 * 특정 카테고리 넛지를 표시할지 결정
 */
export function shouldShowNudgeCategory(category: NudgeCategory): boolean {
  return useNudgeAnalyticsStore.getState().getShouldShowNudge(category);
}

export default useNudgeAnalyticsStore;
