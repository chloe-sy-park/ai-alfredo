import { create } from 'zustand';

type PageName = 'home' | 'calendar' | 'work' | 'life' | 'report' | 'settings' | 'chat';

interface BadgeInfo {
  count?: number;
  isNew?: boolean;
}

interface NavigationState {
  currentPage: PageName;
  badges: Record<PageName, BadgeInfo>;
  
  setPage: (page: PageName) => void;
  updateBadge: (page: PageName, badge: BadgeInfo) => void;
  clearBadge: (page: PageName) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'home',
  badges: {
    home: {},
    calendar: {},
    work: {},
    life: {},
    report: { isNew: true },
    settings: {},
    chat: {},
  },
  
  setPage: (page) => set({ currentPage: page }),
  updateBadge: (page, badge) => set((state) => ({
    badges: { ...state.badges, [page]: badge }
  })),
  clearBadge: (page) => set((state) => ({
    badges: { ...state.badges, [page]: {} }
  })),
}));
