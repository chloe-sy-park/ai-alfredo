/**
 * Home Mode Store
 * 홈 화면의 현재 모드(all/work/life)를 전역에서 관리
 */

import { create } from 'zustand';

type HomeMode = 'all' | 'work' | 'life';

interface HomeModeState {
  mode: HomeMode;
  setMode: (mode: HomeMode) => void;
  isWorkMode: () => boolean;
  isLifeMode: () => boolean;
}

export const useHomeModeStore = create<HomeModeState>(function(set, get) {
  return {
    mode: 'all',

    setMode: function(mode: HomeMode) {
      set({ mode: mode });
    },

    isWorkMode: function() {
      return get().mode === 'work';
    },

    isLifeMode: function() {
      return get().mode === 'life';
    }
  };
});
