import { create } from 'zustand';

interface TimerState {
  isRunning: boolean;
  taskName: string | null;
  startTime: number | null;
  duration: number;
  start: (taskName: string, durationMinutes?: number) => void;
  stop: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  isRunning: false,
  taskName: null,
  startTime: null,
  duration: 0,
  start: (taskName, durationMinutes = 25) => set({
    isRunning: true,
    taskName,
    startTime: Date.now(),
    duration: durationMinutes * 60,
  }),
  stop: () => set({
    isRunning: false,
    taskName: null,
    startTime: null,
    duration: 0,
  }),
  tick: () => set((state) => ({
    duration: Math.max(0, state.duration - 1),
  })),
}));
