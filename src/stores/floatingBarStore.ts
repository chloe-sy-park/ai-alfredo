import { create } from 'zustand';

type FloatingBarMode = 'default' | 'expanded' | 'chat' | 'timer';

interface FloatingBarState {
  mode: FloatingBarMode;
  setMode: (mode: FloatingBarMode) => void;
  expand: () => void;
  collapse: () => void;
  openChat: () => void;
  showTimer: () => void;
}

export const useFloatingBarStore = create<FloatingBarState>((set) => ({
  mode: 'default',
  setMode: (mode) => set({ mode }),
  expand: () => set({ mode: 'expanded' }),
  collapse: () => set({ mode: 'default' }),
  openChat: () => set({ mode: 'chat' }),
  showTimer: () => set({ mode: 'timer' }),
}));
