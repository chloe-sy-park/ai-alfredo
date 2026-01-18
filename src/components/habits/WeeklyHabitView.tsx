/**
 * 주간 습관 현황 컴포넌트
 * 최근 7일간의 습관 완료 현황을 시각화
 */

import { useMemo } from 'react';
import { CheckCircle2, Circle, Flame } from 'lucide-react';
import { Habit, HabitLog, getStreak } from '../../services/habits';

interface WeeklyHabitViewProps {
  habit: Habit;
  logs: HabitLog[];
}

export default function WeeklyHabitView({ habit, logs }: WeeklyHabitViewProps) {
  const streak = getStreak(habit.id);

  // 최근 7일간의 날짜 생성
  const weekDays = useMemo(() => {
    const days: { date: Date; dateStr: string; dayName: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('ko-KR', { weekday: 'short' });
      days.push({ date, dateStr, dayName });
    }

    return days;
  }, []);

  // 날짜별 로그 매핑
  const logsByDate = useMemo(() => {
    const map: Record<string, HabitLog> = {};
    logs
      .filter((log) => log.habitId === habit.id)
      .forEach((log) => {
        map[log.date] = log;
      });
    return map;
  }, [logs, habit.id]);

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0];
  };

  return (
    <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{habit.icon}</span>
          <div>
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{habit.title}</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {habit.frequency === 'daily' ? '매일' : '매주'} {habit.targetCount}
              {habit.unit}
            </p>
          </div>
        </div>

        {streak > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: 'var(--state-warning-bg)', color: 'var(--state-warning)' }}
          >
            <Flame size={16} />
            <span className="font-bold text-sm">{streak}일 연속</span>
          </div>
        )}
      </div>

      {/* 주간 현황 */}
      <div className="flex justify-between">
        {weekDays.map(({ dateStr, dayName }) => {
          const log = logsByDate[dateStr];
          const completed = log?.completed || false;
          const today = isToday(dateStr);

          return (
            <div key={dateStr} className="flex flex-col items-center gap-1">
              <span
                className={'text-xs ' + (today ? 'font-bold' : '')}
                style={{ color: today ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
              >
                {dayName}
              </span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={
                  completed
                    ? { backgroundColor: 'var(--accent-primary)', color: 'white' }
                    : today
                    ? { border: '2px solid var(--accent-primary)', color: 'var(--accent-primary)' }
                    : { backgroundColor: 'var(--surface-subtle)', color: 'var(--text-tertiary)' }
                }
              >
                {completed ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Circle size={16} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 진행률 바 */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
          <span>이번 주 달성률</span>
          <span>
            {Object.values(logsByDate).filter((l) => l.completed).length}/7
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${
                (Object.values(logsByDate).filter((l) => l.completed).length / 7) *
                100
              }%`,
              backgroundColor: 'var(--accent-primary)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
