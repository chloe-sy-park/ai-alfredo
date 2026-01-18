/**
 * 습관 통계 컴포넌트
 * 전체 습관 달성 현황 요약
 */

import { useMemo } from 'react';
import { Flame, Trophy, TrendingUp, Target, Sparkles } from 'lucide-react';
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

  // 빈 상태: 습관이 없을 때
  if (habits.length === 0) {
    return (
      <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
        <div className="text-center py-4">
          <div
            className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          >
            <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            습관을 추가해보세요
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            작은 습관부터 시작해보는 건 어떨까요?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 오늘 달성률 */}
      <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Target size={16} style={{ color: 'var(--accent-primary)' }} />
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>오늘 달성</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.todayRate}%</span>
          <span className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
            {stats.completedToday}/{stats.totalHabits}
          </span>
        </div>
        {/* 미니 프로그레스 */}
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${stats.todayRate}%`, backgroundColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* 최고 스트릭 */}
      <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Flame size={16} style={{ color: 'var(--state-warning)' }} />
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>최고 스트릭</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.maxStreak}</span>
          <span className="text-sm mb-0.5" style={{ color: 'var(--text-tertiary)' }}>일</span>
        </div>
        {stats.maxStreak > 0 && (
          <div className="mt-2 flex">
            {Array.from({ length: Math.min(stats.maxStreak, 7) }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full mr-0.5"
                style={{ backgroundColor: 'var(--state-warning)' }}
              />
            ))}
            {stats.maxStreak > 7 && (
              <span className="text-xs ml-1" style={{ color: 'var(--state-warning)' }}>+{stats.maxStreak - 7}</span>
            )}
          </div>
        )}
      </div>

      {/* 주간 달성률 */}
      <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} style={{ color: 'var(--state-success)' }} />
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>이번 주</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.weekRate}%</span>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
          {stats.weekRate >= 80 ? '아주 잘하고 있어요!' :
           stats.weekRate >= 50 ? '꾸준히 하고 있어요' :
           '조금 더 힘내봐요'}
        </p>
      </div>

      {/* 가장 잘 지킨 습관 */}
      <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={16} style={{ color: 'var(--state-warning)' }} />
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>베스트 습관</span>
        </div>
        {stats.bestHabit ? (
          <div className="flex items-center gap-2">
            <span className="text-xl">{stats.bestHabit.icon}</span>
            <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {stats.bestHabit.title}
            </span>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>아직 없어요</p>
        )}
      </div>
    </div>
  );
}
