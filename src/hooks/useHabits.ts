import { useState, useCallback, useEffect } from 'react';
import { habitsApi } from '../lib/api';
import type { Habit, HabitLog } from '../types/database';

interface HabitWithStatus extends Habit {
  completed_today: boolean;
  today_log?: HabitLog;
}

interface UseHabitsReturn {
  habits: HabitWithStatus[];
  isLoading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  createHabit: (data: Partial<Habit>) => Promise<Habit | null>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<Habit | null>;
  deleteHabit: (id: string) => Promise<boolean>;
  logHabit: (id: string, completed?: boolean, notes?: string) => Promise<HabitLog | null>;
}

export function useHabits(autoFetch = true): UseHabitsReturn {
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 습관 목록 조회
  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await habitsApi.list();

      if (response.success && response.data) {
        setHabits(response.data);
      } else {
        setError(response.error?.message || '습관 조회 실패');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 습관 생성
  const createHabit = useCallback(async (data: Partial<Habit>): Promise<Habit | null> => {
    try {
      const response = await habitsApi.create(data as any);

      if (response.success && response.data) {
        setHabits(prev => [...prev, { ...response.data, completed_today: false }]);
        return response.data;
      } else {
        setError(response.error?.message || '습관 생성 실패');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return null;
    }
  }, []);

  // 습관 수정
  const updateHabit = useCallback(async (id: string, data: Partial<Habit>): Promise<Habit | null> => {
    try {
      const response = await habitsApi.update(id, data);

      if (response.success && response.data) {
        setHabits(prev =>
          prev.map(h =>
            h.id === id ? { ...response.data, completed_today: h.completed_today } : h
          )
        );
        return response.data;
      } else {
        setError(response.error?.message || '습관 수정 실패');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return null;
    }
  }, []);

  // 습관 삭제
  const deleteHabit = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await habitsApi.delete(id);

      if (response.success) {
        setHabits(prev => prev.filter(h => h.id !== id));
        return true;
      } else {
        setError(response.error?.message || '습관 삭제 실패');
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return false;
    }
  }, []);

  // 습관 로그 기록
  const logHabit = useCallback(
    async (id: string, completed = true, notes?: string): Promise<HabitLog | null> => {
      try {
        const response = await habitsApi.log(id, { completed, notes });

        if (response.success && response.data) {
          setHabits(prev =>
            prev.map(h =>
              h.id === id
                ? {
                    ...h,
                    completed_today: completed,
                    today_log: response.data,
                    current_streak: completed ? h.current_streak + 1 : h.current_streak,
                  }
                : h
            )
          );
          return response.data;
        } else {
          setError(response.error?.message || '습관 기록 실패');
          return null;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '알 수 없는 오류');
        return null;
      }
    },
    []
  );

  // 자동 fetch
  useEffect(() => {
    if (autoFetch) {
      fetchHabits();
    }
  }, [autoFetch, fetchHabits]);

  return {
    habits,
    isLoading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    logHabit,
  };
}

export default useHabits;
