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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{habit.icon}</span>
          <div>
            <h3 className="font-medium dark:text-white">{habit.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {habit.frequency === 'daily' ? '매일' : '매주'} {habit.targetCount}
              {habit.unit}
            </p>
          </div>
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-600 dark:text-orange-400 rounded-full">
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
                className={`text-xs ${
                  today
                    ? 'text-[#A996FF] font-bold'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {dayName}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  completed
                    ? 'bg-[#A996FF] text-white'
                    : today
                    ? 'border-2 border-[#A996FF] text-[#A996FF]'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-500'
                }`}
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
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>이번 주 달성률</span>
          <span>
            {Object.values(logsByDate).filter((l) => l.completed).length}/7
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7BE8] rounded-full transition-all duration-500"
            style={{
              width: `${
                (Object.values(logsByDate).filter((l) => l.completed).length / 7) *
                100
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
