import { create } from 'zustand';

interface TimerState {
  isRunning: boolean;
  seconds: number;
  targetSeconds: number;
  taskId: string | null;
  taskName: string | null;
  
  start: (targetMinutes: number, taskId?: string, taskName?: string) => void;
  stop: () => void;
  tick: () => void;
  reset: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  isRunning: false,
  seconds: 0,
  targetSeconds: 0,
  taskId: null,
  taskName: null,
  
  start: (targetMinutes, taskId, taskName) => set({
    isRunning: true,
    seconds: 0,
    targetSeconds: targetMinutes * 60,
    taskId: taskId || null,
    taskName: taskName || null,
  }),
  stop: () => set({ isRunning: false }),
  tick: () => set((state) => ({ seconds: state.seconds + 1 })),
  reset: () => set({
    isRunning: false,
    seconds: 0,
    targetSeconds: 0,
    taskId: null,
    taskName: null,
  }),
}));
