/**
 * Proxy Actions Store
 * 알프레도의 대행 판단 상태 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ProxyAction,
  ProxySummary,
  generateDailyProxyActions,
  generateProxySummary,
  generateProxyMessage
} from '../services/proxy';
import { getTasks } from '../services/tasks';
import { CalendarEvent } from '../services/calendar';

interface ProxyState {
  // 현재 액션들
  actions: ProxyAction[];
  // 오늘의 요약
  todaySummary: ProxySummary | null;
  // 표시할 메시지
  currentMessage: string | null;
  // 마지막 갱신 시간
  lastUpdated: string | null;
  // 팝업 표시 여부
  showProxyPopup: boolean;
  // 선택된 액션 (상세 보기용)
  selectedAction: ProxyAction | null;

  // 액션들
  refreshProxyActions: (events: CalendarEvent[]) => void;
  acceptAction: (actionId: string) => void;
  dismissAction: (actionId: string) => void;
  modifyAction: (actionId: string, updates: Partial<ProxyAction>) => void;
  clearActions: () => void;

  // UI 액션
  openProxyPopup: () => void;
  closeProxyPopup: () => void;
  selectAction: (action: ProxyAction | null) => void;

  // 히스토리
  getActionHistory: () => ProxyAction[];
}

const STORAGE_KEY = 'alfredo_proxy_actions';

export const useProxyStore = create<ProxyState>()(
  persist(
    (set, get) => ({
      actions: [],
      todaySummary: null,
      currentMessage: null,
      lastUpdated: null,
      showProxyPopup: false,
      selectedAction: null,

      /**
       * Proxy Actions 새로고침
       */
      refreshProxyActions: (events: CalendarEvent[]) => {
        const tasks = getTasks();
        const currentTime = new Date();

        // 오늘 이미 생성된 액션이 있는지 확인
        const existingActions = get().actions;
        const todayStr = currentTime.toDateString();
        const hasTodayActions = existingActions.some(
          a => new Date(a.createdAt).toDateString() === todayStr
        );

        // 오늘 처음이거나 2시간 이상 지났으면 새로 생성
        const lastUpdated = get().lastUpdated;
        const shouldRefresh = !hasTodayActions ||
          !lastUpdated ||
          (currentTime.getTime() - new Date(lastUpdated).getTime()) > 2 * 60 * 60 * 1000;

        if (!shouldRefresh) {
          // 메시지만 갱신
          const message = generateProxyMessage(existingActions);
          set({ currentMessage: message });
          return;
        }

        // 새 액션 생성
        const newActions = generateDailyProxyActions({
          tasks,
          events,
          currentTime
        });

        // 기존 pending 액션은 유지, 새 액션 추가
        const pendingActions = existingActions.filter(
          a => a.status === 'pending' && new Date(a.createdAt).toDateString() !== todayStr
        );

        const allActions = [...pendingActions, ...newActions];

        // 요약 생성
        const summary = generateProxySummary(allActions);

        // 메시지 생성
        const message = generateProxyMessage(newActions);

        set({
          actions: allActions,
          todaySummary: summary,
          currentMessage: message,
          lastUpdated: currentTime.toISOString()
        });
      },

      /**
       * 액션 수락
       */
      acceptAction: (actionId: string) => {
        set(state => {
          const actions = state.actions.map(a =>
            a.id === actionId
              ? { ...a, status: 'accepted' as const, respondedAt: new Date().toISOString() }
              : a
          );

          const summary = generateProxySummary(actions);

          return {
            actions,
            todaySummary: summary,
            currentMessage: generateProxyMessage(actions)
          };
        });
      },

      /**
       * 액션 무시
       */
      dismissAction: (actionId: string) => {
        set(state => {
          const actions = state.actions.map(a =>
            a.id === actionId
              ? { ...a, status: 'dismissed' as const, respondedAt: new Date().toISOString() }
              : a
          );

          const summary = generateProxySummary(actions);

          return {
            actions,
            todaySummary: summary,
            currentMessage: generateProxyMessage(actions)
          };
        });
      },

      /**
       * 액션 수정
       */
      modifyAction: (actionId: string, updates: Partial<ProxyAction>) => {
        set(state => {
          const actions = state.actions.map(a =>
            a.id === actionId
              ? { ...a, ...updates, status: 'modified' as const, respondedAt: new Date().toISOString() }
              : a
          );

          return { actions };
        });
      },

      /**
       * 모든 액션 클리어
       */
      clearActions: () => {
        set({
          actions: [],
          todaySummary: null,
          currentMessage: null,
          lastUpdated: null
        });
      },

      /**
       * 팝업 열기
       */
      openProxyPopup: () => {
        set({ showProxyPopup: true });
      },

      /**
       * 팝업 닫기
       */
      closeProxyPopup: () => {
        set({ showProxyPopup: false, selectedAction: null });
      },

      /**
       * 액션 선택
       */
      selectAction: (action: ProxyAction | null) => {
        set({ selectedAction: action });
      },

      /**
       * 액션 히스토리 가져오기
       */
      getActionHistory: () => {
        return get().actions.filter(
          a => a.status === 'accepted' || a.status === 'dismissed'
        );
      }
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        actions: state.actions,
        lastUpdated: state.lastUpdated
      })
    }
  )
);

/**
 * 펜딩 액션 수 가져오기
 */
export function getPendingActionsCount(): number {
  return useProxyStore.getState().actions.filter(a => a.status === 'pending').length;
}

/**
 * 가장 긴급한 액션 가져오기
 */
export function getMostUrgentAction(): ProxyAction | null {
  const actions = useProxyStore.getState().actions.filter(a => a.status === 'pending');

  return actions.find(a => a.urgency === 'high')
    || actions.find(a => a.urgency === 'medium')
    || actions[0]
    || null;
}
