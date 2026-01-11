import { create } from 'zustand';
import { focusApi } from '../lib/api';
import type { FocusSession, FocusMode } from '../types/database';

interface FocusState {
  sessions: FocusSession[];
  activeSession: FocusSession | null;
  isLoading: boolean;
  error: string | null;
  isPaused: boolean;
  elapsedTime: number; // seconds
  timerInterval: NodeJS.Timeout | null;

  // Actions
  fetchSessions: () => Promise<void>;
  startSession: (options?: {
    mode?: FocusMode;
    plannedDuration?: number;
    taskId?: string;
    taskTitle?: string;
  }) => Promise<FocusSession | null>;
  endSession: (options?: {
    completed?: boolean;
    notes?: string;
  }) => Promise<{ session: FocusSession; rewards?: any } | null>;
  pauseSession: () => Promise<boolean>;
  resumeSession: () => Promise<boolean>;
  tick: () => void;
  clearError: () => void;
}

export const useFocusStore = create<FocusState>((set, get) => ({
  sessions: [],
  activeSession: null,
  isLoading: false,
  error: null,
  isPaused: false,
  elapsedTime: 0,
  timerInterval: null,

  fetchSessions: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await focusApi.list();

      if (response.success && response.data) {
        set({ sessions: response.data, isLoading: false });

        // 진행 중인 세션 찾기
        const active = response.data.find((s: FocusSession) => !s.ended_at);
        if (active) {
          const startedAt = new Date(active.started_at).getTime();
          const elapsed = Math.floor((Date.now() - startedAt) / 1000);
          set({ activeSession: active, elapsedTime: elapsed });
          // 타이머 시작
          const interval = setInterval(() => get().tick(), 1000);
          set({ timerInterval: interval });
        }
      } else {
        set({ error: response.error?.message || '세션 조회 실패', isLoading: false });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류', isLoading: false });
    }
  },

  startSession: async (options) => {
    const { activeSession, timerInterval } = get();

    if (activeSession) {
      set({ error: '이미 진행 중인 세션이 있습니다' });
      return null;
    }

    try {
      const response = await focusApi.start({
        mode: options?.mode || 'pomodoro',
        planned_duration: options?.plannedDuration,
        task_id: options?.taskId,
        task_title: options?.taskTitle,
      });

      if (response.success && response.data) {
        // 기존 타이머 정리
        if (timerInterval) clearInterval(timerInterval);

        // 새 타이머 시작
        const interval = setInterval(() => get().tick(), 1000);

        set({
          activeSession: response.data,
          elapsedTime: 0,
          isPaused: false,
          timerInterval: interval,
        });

        return response.data;
      } else {
        set({ error: response.error?.message || '세션 시작 실패' });
        return null;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return null;
    }
  },

  endSession: async (options) => {
    const { activeSession, elapsedTime, timerInterval } = get();

    if (!activeSession) {
      set({ error: '진행 중인 세션이 없습니다' });
      return null;
    }

    try {
      // 타이머 정지
      if (timerInterval) clearInterval(timerInterval);

      const response = await focusApi.end(activeSession.id, {
        actual_duration: Math.floor(elapsedTime / 60),
        completed: options?.completed ?? true,
        notes: options?.notes,
      });

      if (response.success && response.data) {
        const result = response.data;
        const endedSession = result.session || result;

        set(state => ({
          activeSession: null,
          elapsedTime: 0,
          isPaused: false,
          timerInterval: null,
          sessions: [endedSession, ...state.sessions],
        }));

        return result;
      } else {
        set({ error: response.error?.message || '세션 종료 실패' });
        return null;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return null;
    }
  },

  pauseSession: async () => {
    const { activeSession, isPaused, timerInterval } = get();

    if (!activeSession || isPaused) return false;

    try {
      // 타이머 일시정지
      if (timerInterval) clearInterval(timerInterval);

      const response = await focusApi.pause(activeSession.id);

      if (response.success) {
        set({ isPaused: true, timerInterval: null });
        return true;
      } else {
        // 실패 시 타이머 재시작
        const interval = setInterval(() => get().tick(), 1000);
        set({ timerInterval: interval, error: response.error?.message || '일시정지 실패' });
        return false;
      }
    } catch (e) {
      const interval = setInterval(() => get().tick(), 1000);
      set({ timerInterval: interval, error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return false;
    }
  },

  resumeSession: async () => {
    const { activeSession, isPaused } = get();

    if (!activeSession || !isPaused) return false;

    try {
      const response = await focusApi.resume(activeSession.id);

      if (response.success) {
        const interval = setInterval(() => get().tick(), 1000);
        set({ isPaused: false, timerInterval: interval });
        return true;
      } else {
        set({ error: response.error?.message || '재개 실패' });
        return false;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return false;
    }
  },

  tick: () => {
    set(state => ({ elapsedTime: state.elapsedTime + 1 }));
  },

  clearError: () => set({ error: null }),
}));
