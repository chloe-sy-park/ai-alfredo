/**
 * weeklyReview.ts
 * 주간 리뷰 자동 생성 서비스
 *
 * 알프레도 철학: 판단하지 않고, 긍정적 관찰 제공
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePenguinStore } from '../stores/penguinStore';
import { useAchievementStore, ACHIEVEMENTS } from '../stores/achievementStore';
import { getTasksForDateRange, Task } from './tasks';
import { useLiftStore, LiftRecord } from '../stores/liftStore';

// === 타입 정의 ===

export interface WeeklyReviewData {
  weekStart: string;
  weekEnd: string;
  generatedAt: string;

  // 태스크 요약
  taskStats: {
    total: number;
    completed: number;
    completionRate: number;
    byPriority: {
      high: { total: number; completed: number };
      medium: { total: number; completed: number };
      low: { total: number; completed: number };
    };
  };

  // 펭귄/게이미피케이션 요약
  gamificationStats: {
    xpEarned: number;
    coinsEarned: number;
    levelProgress: number;
    currentLevel: number;
    streakDays: number;
  };

  // 업적 요약
  achievementStats: {
    unlockedThisWeek: string[]; // achievement IDs
    totalUnlocked: number;
    totalAchievements: number;
  };

  // Lift 요약 (판단 변화)
  liftStats: {
    totalLifts: number;
    appliedCount: number;
    categories: {
      priority: number;
      worklife: number;
      scope: number;
      time: number;
    };
  };

  // AI 생성 인사이트
  insight: string;
  encouragement: string;
  nextWeekSuggestion: string;
}

// === 스토어 ===

interface WeeklyReviewStore {
  reviews: WeeklyReviewData[];
  lastGeneratedAt: string | null;
  hasUnreadReview: boolean;

  generateWeeklyReview: () => WeeklyReviewData | null;
  markAsRead: () => void;
  getLatestReview: () => WeeklyReviewData | null;
  getReviewForWeek: (weekStart: string) => WeeklyReviewData | null;
}

export const useWeeklyReviewStore = create<WeeklyReviewStore>()(
  persist(
    (set, get) => ({
      reviews: [],
      lastGeneratedAt: null,
      hasUnreadReview: false,

      generateWeeklyReview: () => {
        const now = new Date();
        const weekStart = getWeekStart(now);
        const weekEnd = getWeekEnd(now);

        // 이미 이번 주 리뷰가 있는지 확인
        const existingReview = get().reviews.find(
          (r) => r.weekStart === weekStart.toISOString()
        );
        if (existingReview) {
          return existingReview;
        }

        // 데이터 수집
        const reviewData = collectWeeklyData(weekStart, weekEnd);

        // 리뷰 저장
        set((state) => ({
          reviews: [...state.reviews.slice(-11), reviewData], // 최근 12주만 보관
          lastGeneratedAt: now.toISOString(),
          hasUnreadReview: true,
        }));

        return reviewData;
      },

      markAsRead: () => {
        set({ hasUnreadReview: false });
      },

      getLatestReview: () => {
        const { reviews } = get();
        return reviews.length > 0 ? reviews[reviews.length - 1] : null;
      },

      getReviewForWeek: (weekStart: string) => {
        return get().reviews.find((r) => r.weekStart === weekStart) || null;
      },
    }),
    {
      name: 'weekly-review-store',
    }
  )
);

// === 헬퍼 함수 ===

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 월요일 시작
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function collectWeeklyData(weekStart: Date, weekEnd: Date): WeeklyReviewData {
  // 태스크 데이터
  const tasks = getTasksForDateRange(weekStart, weekEnd);
  const taskStats = calculateTaskStats(tasks);

  // 펭귄/게이미피케이션 데이터
  const penguinStatus = usePenguinStore.getState().status;
  const gamificationStats = {
    xpEarned: 0, // 실제로는 주간 기록 필요
    coinsEarned: 0,
    levelProgress: penguinStatus?.experience || 0,
    currentLevel: penguinStatus?.level || 1,
    streakDays: penguinStatus?.streak_days || 0,
  };

  // 업적 데이터
  const achievementState = useAchievementStore.getState();
  const unlockedThisWeek = achievementState.unlocked
    .filter((u) => {
      const unlockedDate = new Date(u.unlockedAt);
      return unlockedDate >= weekStart && unlockedDate <= weekEnd;
    })
    .map((u) => u.achievementId);

  const achievementStats = {
    unlockedThisWeek,
    totalUnlocked: achievementState.unlocked.length,
    totalAchievements: ACHIEVEMENTS.length,
  };

  // Lift 데이터
  const lifts = useLiftStore.getState().lifts.filter((l) => {
    const liftDate = new Date(l.timestamp);
    return liftDate >= weekStart && liftDate <= weekEnd;
  });
  const liftStats = calculateLiftStats(lifts);

  // 인사이트 생성
  const { insight, encouragement, nextWeekSuggestion } = generateInsights(
    taskStats,
    gamificationStats,
    achievementStats,
    liftStats
  );

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    generatedAt: new Date().toISOString(),
    taskStats,
    gamificationStats,
    achievementStats,
    liftStats,
    insight,
    encouragement,
    nextWeekSuggestion,
  };
}

function calculateTaskStats(tasks: Task[]) {
  const completed = tasks.filter((t) => t.status === 'done');

  const byPriority = {
    high: {
      total: tasks.filter((t) => t.priority === 'high').length,
      completed: completed.filter((t) => t.priority === 'high').length,
    },
    medium: {
      total: tasks.filter((t) => t.priority === 'medium').length,
      completed: completed.filter((t) => t.priority === 'medium').length,
    },
    low: {
      total: tasks.filter((t) => t.priority === 'low').length,
      completed: completed.filter((t) => t.priority === 'low').length,
    },
  };

  return {
    total: tasks.length,
    completed: completed.length,
    completionRate: tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0,
    byPriority,
  };
}

function calculateLiftStats(lifts: LiftRecord[]) {
  const categories = {
    priority: 0,
    worklife: 0,
    scope: 0,
    time: 0,
  };

  lifts.forEach((lift) => {
    if (lift.category in categories) {
      categories[lift.category as keyof typeof categories]++;
    }
  });

  return {
    totalLifts: lifts.length,
    appliedCount: lifts.filter((l) => l.type === 'apply').length,
    categories,
  };
}

function generateInsights(
  taskStats: WeeklyReviewData['taskStats'],
  gamificationStats: WeeklyReviewData['gamificationStats'],
  achievementStats: WeeklyReviewData['achievementStats'],
  liftStats: WeeklyReviewData['liftStats']
): { insight: string; encouragement: string; nextWeekSuggestion: string } {
  const insights: string[] = [];
  const encouragements: string[] = [];
  const suggestions: string[] = [];

  // 태스크 완료율 기반 인사이트
  if (taskStats.completionRate >= 80) {
    insights.push('이번 주 완료율이 정말 높았어요!');
    encouragements.push('꾸준히 목표를 달성하는 모습이 인상적이에요.');
  } else if (taskStats.completionRate >= 50) {
    insights.push('균형 잡힌 한 주를 보냈어요.');
    encouragements.push('완벽하지 않아도 괜찮아요. 계속 나아가는 게 중요해요.');
  } else if (taskStats.total > 0) {
    insights.push('도전적인 한 주였네요.');
    encouragements.push('계획보다 결과가 적더라도, 시작한 것 자체가 의미 있어요.');
  } else {
    insights.push('여유로운 한 주였나요?');
    encouragements.push('쉬어가는 것도 중요해요. 재충전의 시간이었을 거예요.');
  }

  // 업적 기반 인사이트
  if (achievementStats.unlockedThisWeek.length > 0) {
    const achievementNames = achievementStats.unlockedThisWeek
      .map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .slice(0, 2);
    if (achievementNames.length > 0) {
      insights.push(`새로운 업적을 달성했어요: ${achievementNames.join(', ')}`);
    }
  }

  // 스트릭 기반 격려
  if (gamificationStats.streakDays >= 7) {
    encouragements.push(`${gamificationStats.streakDays}일 연속 활동 중이에요! 대단해요.`);
  } else if (gamificationStats.streakDays >= 3) {
    encouragements.push('꾸준한 활동이 이어지고 있어요.');
  }

  // 다음 주 제안
  if (taskStats.byPriority.high.total > taskStats.byPriority.high.completed) {
    suggestions.push('중요한 태스크부터 먼저 시작해보는 건 어떨까요?');
  } else if (liftStats.categories.worklife > 3) {
    suggestions.push('워라밸 조정이 많았어요. 다음 주는 좀 더 여유롭게 시작해봐요.');
  } else {
    suggestions.push('지금처럼 꾸준히 해나가면 좋은 결과가 있을 거예요.');
  }

  return {
    insight: insights.join(' '),
    encouragement: encouragements.join(' '),
    nextWeekSuggestion: suggestions.join(' '),
  };
}

// === 자동 생성 트리거 ===

/**
 * 일요일 저녁에 자동으로 주간 리뷰 생성
 */
export function checkAndGenerateWeeklyReview(): boolean {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  // 일요일 저녁 6시 이후
  if (day === 0 && hour >= 18) {
    const store = useWeeklyReviewStore.getState();
    const lastGenerated = store.lastGeneratedAt
      ? new Date(store.lastGeneratedAt)
      : null;

    // 오늘 이미 생성했으면 스킵
    if (lastGenerated && lastGenerated.toDateString() === now.toDateString()) {
      return false;
    }

    store.generateWeeklyReview();
    return true;
  }

  return false;
}

/**
 * 주간 리뷰 데이터를 포맷팅된 문자열로 변환
 */
export function formatWeeklyReviewSummary(review: WeeklyReviewData): string {
  const weekStartDate = new Date(review.weekStart);
  const weekEndDate = new Date(review.weekEnd);

  const dateRange = `${weekStartDate.getMonth() + 1}/${weekStartDate.getDate()} - ${weekEndDate.getMonth() + 1}/${weekEndDate.getDate()}`;

  return `
📊 ${dateRange} 주간 리뷰

📝 태스크
• 완료: ${review.taskStats.completed}/${review.taskStats.total} (${review.taskStats.completionRate}%)
• 중요: ${review.taskStats.byPriority.high.completed}/${review.taskStats.byPriority.high.total}

🐧 성장
• 레벨: ${review.gamificationStats.currentLevel}
• 연속: ${review.gamificationStats.streakDays}일

🏆 업적
• 이번 주: ${review.achievementStats.unlockedThisWeek.length}개 달성
• 전체: ${review.achievementStats.totalUnlocked}/${review.achievementStats.totalAchievements}

💬 알프레도의 관찰
${review.insight}

💪 ${review.encouragement}

🎯 다음 주 제안
${review.nextWeekSuggestion}
`.trim();
}

export default useWeeklyReviewStore;
