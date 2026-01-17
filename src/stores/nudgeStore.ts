/**
 * 넛지 스토어
 * 알프레도 넛지 시스템 상태 관리
 */

import { create } from 'zustand';
import type { Nudge, NudgeType, TriggerContext, NotificationSettings } from '../services/nudge';
import {
  checkForNudges,
  startScheduler,
  stopScheduler,
  markAsRead,
  markAction,
  createContextualNudge,
  INTENSITY_PRESETS
} from '../services/nudge';

interface NudgeState {
  // 활성 넛지 (화면에 표시)
  activeNudges: Nudge[];

  // 히스토리 (세션 내)
  history: Nudge[];

  // 설정
  settings: Partial<NotificationSettings>;

  // 스케줄러 상태
  isSchedulerActive: boolean;

  // Actions
  showNudge: (nudge: Nudge) => void;
  hideNudge: (id: string) => void;
  clearAllNudges: () => void;
  getActiveNudge: () => Nudge | null;

  // 넛지 체크
  checkNudges: (context: TriggerContext) => void;

  // 스케줄러 제어
  startAutoCheck: (getContext: () => TriggerContext) => void;
  stopAutoCheck: () => void;

  // 설정
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  setIntensity: (intensity: NotificationSettings['nudgeIntensity']) => void;

  // 넛지 액션
  respondToNudge: (id: string, action: 'clicked' | 'dismissed' | 'snoozed') => void;

  // 컨텍스트 기반 간편 넛지
  showContextualNudge: (context: Parameters<typeof createContextualNudge>[0]) => void;
}

export const useNudgeStore = create<NudgeState>((set, get) => ({
  activeNudges: [],
  history: [],
  settings: INTENSITY_PRESETS.balanced,
  isSchedulerActive: false,

  showNudge: (nudge) => {
    set((state) => ({
      activeNudges: [...state.activeNudges, nudge],
      history: [...state.history.slice(-49), nudge]  // 최근 50개 유지
    }));

    // 자동 숨김
    if (nudge.autoHide && nudge.autoHide > 0) {
      setTimeout(() => {
        get().hideNudge(nudge.id);
      }, nudge.autoHide);
    }
  },

  hideNudge: (id) => {
    set((state) => ({
      activeNudges: state.activeNudges.filter((n) => n.id !== id)
    }));
  },

  clearAllNudges: () => {
    set({ activeNudges: [] });
  },

  getActiveNudge: () => {
    const { activeNudges } = get();

    // 우선순위 정렬
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const sorted = [...activeNudges].sort((a, b) => {
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];
      return bPriority - aPriority;
    });

    return sorted[0] || null;
  },

  checkNudges: (context) => {
    const { settings, showNudge } = get();
    const nudges = checkForNudges(context, settings);

    nudges.forEach((nudge) => {
      showNudge(nudge);
    });
  },

  startAutoCheck: (getContext) => {
    const { settings, showNudge } = get();

    startScheduler({
      onNudge: showNudge,
      getContext,
      getSettings: () => settings
    });

    set({ isSchedulerActive: true });
  },

  stopAutoCheck: () => {
    stopScheduler();
    set({ isSchedulerActive: false });
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
  },

  setIntensity: (intensity) => {
    const preset = INTENSITY_PRESETS[intensity];
    set((state) => ({
      settings: { ...state.settings, ...preset, nudgeIntensity: intensity }
    }));
  },

  respondToNudge: (id, action) => {
    // 스케줄러 히스토리에 기록
    if (action === 'clicked') {
      markAsRead(id);
    }
    markAction(id, action);

    // 닫기
    get().hideNudge(id);
  },

  showContextualNudge: (context) => {
    const nudgeData = createContextualNudge(context);
    if (!nudgeData) return;

    const nudge: Nudge = {
      ...nudgeData,
      id: `ctx_${Date.now()}`,
      createdAt: new Date().toISOString(),
      dismissible: nudgeData.dismissible ?? true,
      autoHide: nudgeData.autoHide ?? 5000
    };

    get().showNudge(nudge);
  }
}));

// === 헬퍼 훅 ===

/**
 * 현재 가장 중요한 넛지 가져오기
 */
export function useActiveNudge(): Nudge | null {
  return useNudgeStore((state) => state.getActiveNudge());
}

/**
 * 넛지 개수
 */
export function useNudgeCount(): number {
  return useNudgeStore((state) => state.activeNudges.length);
}

/**
 * 특정 타입 넛지 필터
 */
export function useNudgesByType(type: NudgeType): Nudge[] {
  return useNudgeStore((state) =>
    state.activeNudges.filter((n) => n.type === type)
  );
}

// === Legacy export (하위 호환성) ===
export interface LegacyNudge {
  id: string;
  type: 'focus' | 'break' | 'transition' | 'health' | 'celebration';
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
  priority?: 'low' | 'medium' | 'high';
  duration?: number;
}

/**
 * 기존 createContextualNudge 호환
 */
export { createContextualNudge };
