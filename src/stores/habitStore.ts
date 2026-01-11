import { create } from 'zustand';
import { habitsApi } from '../lib/api';
import type { Habit, HabitLog, HabitCategory } from '../types/database';

interface HabitWithStatus extends Habit {
  completed_today: boolean;
  today_log?: HabitLog;
}

interface HabitState {
  habits: HabitWithStatus[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchHabits: () => Promise<void>;
  createHabit: (data: Partial<Habit>) => Promise<Habit | null>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<Habit | null>;
  deleteHabit: (id: string) => Promise<boolean>;
  logHabit: (id: string, completed?: boolean, notes?: string) => Promise<HabitLog | null>;
  clearError: () => void;

  // Selectors
  getTodayHabits: () => HabitWithStatus[];
  getCompletedToday: () => HabitWithStatus[];
  getHabitsByCategory: (category: HabitCategory) => HabitWithStatus[];
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await habitsApi.list();

      if (response.success && response.data) {
        set({ habits: response.data, isLoading: false });
      } else {
        set({ error: response.error?.message || '습관 조회 실패', isLoading: false });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류', isLoading: false });
    }
  },

  createHabit: async (data) => {
    try {
      const response = await habitsApi.create(data as any);

      if (response.success && response.data) {
        set(state => ({
          habits: [...state.habits, { ...response.data!, completed_today: false }],
        }));
        return response.data;
      } else {
        set({ error: response.error?.message || '습관 생성 실패' });
        return null;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return null;
    }
  },

  updateHabit: async (id, data) => {
    try {
      const response = await habitsApi.update(id, data);

      if (response.success && response.data) {
        set(state => ({
          habits: state.habits.map(h =>
            h.id === id
              ? { ...response.data!, completed_today: h.completed_today, today_log: h.today_log }
              : h
          ),
        }));
        return response.data;
      } else {
        set({ error: response.error?.message || '습관 수정 실패' });
        return null;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return null;
    }
  },

  deleteHabit: async (id) => {
    try {
      const response = await habitsApi.delete(id);

      if (response.success) {
        set(state => ({
          habits: state.habits.filter(h => h.id !== id),
        }));
        return true;
      } else {
        set({ error: response.error?.message || '습관 삭제 실패' });
        return false;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return false;
    }
  },

  logHabit: async (id, completed = true, notes) => {
    try {
      const response = await habitsApi.log(id, { completed, notes });

      if (response.success && response.data) {
        set(state => ({
          habits: state.habits.map(h =>
            h.id === id
              ? {
                  ...h,
                  completed_today: completed,
                  today_log: response.data!,
                  current_streak: completed ? h.current_streak + 1 : 0,
                }
              : h
          ),
        }));
        return response.data;
      } else {
        set({ error: response.error?.message || '습관 기록 실패' });
        return null;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return null;
    }
  },

  clearError: () => set({ error: null }),

  // Selectors
  getTodayHabits: () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    return get().habits.filter(h => h.is_active && h.target_days.includes(today));
  },

  getCompletedToday: () => {
    return get().habits.filter(h => h.completed_today);
  },

  getHabitsByCategory: (category) => {
    return get().habits.filter(h => h.category === category);
  },
}));
