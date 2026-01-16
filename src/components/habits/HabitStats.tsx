/**
 * 습관 통계 컴포넌트
 * 전체 습관 달성 현황 요약
 */

import { useMemo } from 'react';
import { Flame, Trophy, TrendingUp, Target } from 'lucide-react';
import { Habit, HabitLog, getStreak } from '../../services/habits';

interface HabitStatsProps {
  habits: Habit[];
  logs: HabitLog[];
}

export default function HabitStats({ habits, logs }: HabitStatsProps) {
  const stats = useMemo(() => {
    // 오늘 완료율
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter((l) => l.date === today);
    const completedToday = todayLogs.filter((l) => l.completed).length;
    const todayRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

    // 최고 스트릭
    const maxStreak = Math.max(...habits.map((h) => getStreak(h.id)), 0);

    // 주간 달성률
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    const weekLogs = logs.filter((l) => weekDates.includes(l.date));
    const weekCompleted = weekLogs.filter((l) => l.completed).length;
    const weekTotal = habits.length * 7;
    const weekRate = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

    // 가장 잘 지킨 습관
    const habitCompletionCounts: Record<string, number> = {};
    logs.forEach((log) => {
      if (log.completed) {
        habitCompletionCounts[log.habitId] = (habitCompletionCounts[log.habitId] || 0) + 1;
      }
    });
    const bestHabitId = Object.entries(habitCompletionCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];
    const bestHabit = habits.find((h) => h.id === bestHabitId);

    return {
      todayRate,
      completedToday,
      totalHabits: habits.length,
      maxStreak,
      weekRate,
      bestHabit,
    };
  }, [habits, logs]);

  if (habits.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 오늘 달성률 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Target size={16} className="text-[#A996FF]" />
          <span className="text-xs text-gray-500 dark:text-gray-400">오늘 달성</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold dark:text-white">{stats.todayRate}%</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">
            {stats.completedToday}/{stats.totalHabits}
          </span>
        </div>
        {/* 미니 프로그레스 */}
        <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#A996FF] rounded-full transition-all"
            style={{ width: `${stats.todayRate}%` }}
          />
        </div>
      </div>

      {/* 최고 스트릭 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Flame size={16} className="text-orange-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">최고 스트릭</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold dark:text-white">{stats.maxStreak}</span>
          <span className="text-sm text-gray-400 dark:text-gray-500 mb-0.5">일</span>
        </div>
        {stats.maxStreak > 0 && (
          <div className="mt-2 flex">
            {Array.from({ length: Math.min(stats.maxStreak, 7) }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-400 mr-0.5"
              />
            ))}
            {stats.maxStreak > 7 && (
              <span className="text-xs text-orange-400 ml-1">+{stats.maxStreak - 7}</span>
            )}
          </div>
        )}
      </div>

      {/* 주간 달성률 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-green-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">이번 주</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold dark:text-white">{stats.weekRate}%</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {stats.weekRate >= 80 ? '아주 잘하고 있어요!' :
           stats.weekRate >= 50 ? '꾸준히 하고 있어요' :
           '조금 더 힘내봐요'}
        </p>
      </div>

      {/* 가장 잘 지킨 습관 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={16} className="text-yellow-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">베스트 습관</span>
        </div>
        {stats.bestHabit ? (
          <div className="flex items-center gap-2">
            <span className="text-xl">{stats.bestHabit.icon}</span>
            <span className="text-sm font-medium dark:text-white truncate">
              {stats.bestHabit.title}
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500">아직 없어요</p>
        )}
      </div>
    </div>
  );
}
