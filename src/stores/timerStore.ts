import { create } from 'zustand';

interface TimerState {
  isRunning: boolean;
  taskName: string | null;
  seconds: number;
  targetSeconds: number;
  start: (taskName: string, durationMinutes?: number) => void;
  stop: () => void;
  reset: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  isRunning: false,
  taskName: null,
  seconds: 0,
  targetSeconds: 0,
  start: (taskName, durationMinutes = 25) => {
    const totalSeconds = durationMinutes * 60;
    set({
      isRunning: true,
      taskName,
      seconds: totalSeconds,
      targetSeconds: totalSeconds,
    });
  },
  stop: () => set({ isRunning: false }),
  reset: () => set({
    isRunning: false,
    taskName: null,
    seconds: 0,
    targetSeconds: 0,
  }),
  tick: () => set((state) => ({
    seconds: Math.max(0, state.seconds - 1),
  })),
}));
