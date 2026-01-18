/**
 * Smart Insight Store
 *
 * Low-Integration Smartness UX 상태 관리
 * - currentInsights: 현재 표시할 인사이트 목록
 * - 하루 단위 캐싱 및 중복 방지
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Insight,
  InsightContext
} from '../services/smartInsight/types';
import { detectIntegrationState } from '../services/smartInsight/integrationStateDetector';
import { pickInsights } from '../services/smartInsight/insightPicker';
import { getTodayEvents, CalendarEvent } from '../services/calendar';

// ============================================================
// Types
// ============================================================

interface SmartInsightState {
  // State
  currentInsights: Insight[];
  shownInsightsToday: string[];     // 오늘 표시된 인사이트 ID 목록
  dismissedInsightIds: string[];    // 사용자가 dismiss한 인사이트 ID 목록
  lastGeneratedAt: number | null;
  lastGeneratedDate: string | null; // YYYY-MM-DD
  isLoading: boolean;
  error: string | null;

  // Context cache
  cachedContext: InsightContext | null;

  // Actions
  generateInsights: () => Promise<void>;
  dismissInsight: (insightId: string) => void;
  handleCTA: (insight: Insight) => void;
  clearDailyState: () => void;
  resetStore: () => void;

  // Getters
  getVisibleInsights: () => Insight[];
}

// ============================================================
// Helper Functions
// ============================================================

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// 방문 추적 (localStorage 기반)
function getVisitInfo(): { isFirstOpenToday: boolean; todayVisitCount: number; lastSessionGapHours: number | null } {
  const today = getTodayDateString();
  const key = `alfredo-visit-${today}`;
  const lastVisitKey = 'alfredo-last-visit';

  const stored = localStorage.getItem(key);
  const lastVisit = localStorage.getItem(lastVisitKey);

  let visitCount = 1;
  let isFirstOpen = true;

  if (stored) {
    visitCount = parseInt(stored, 10) + 1;
    isFirstOpen = false;
  }

  localStorage.setItem(key, String(visitCount));
  localStorage.setItem(lastVisitKey, new Date().toISOString());

  // 마지막 방문으로부터 경과 시간
  let lastSessionGapHours: number | null = null;
  if (lastVisit) {
    const gap = Date.now() - new Date(lastVisit).getTime();
    lastSessionGapHours = gap / (1000 * 60 * 60);
  }

  return { isFirstOpenToday: isFirstOpen, todayVisitCount: visitCount, lastSessionGapHours };
}

// 캘린더 이벤트 로드 (에러 시 빈 배열)
async function loadCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    return await getTodayEvents();
  } catch {
    return [];
  }
}

// ============================================================
// Store
// ============================================================

export const useSmartInsightStore = create<SmartInsightState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentInsights: [],
      shownInsightsToday: [],
      dismissedInsightIds: [],
      lastGeneratedAt: null,
      lastGeneratedDate: null,
      isLoading: false,
      error: null,
      cachedContext: null,

      // Actions
      generateInsights: async () => {
        const state = get();
        const today = getTodayDateString();

        // 같은 날 5분 내 재생성 방지
        if (
          state.lastGeneratedAt &&
          state.lastGeneratedDate === today &&
          Date.now() - state.lastGeneratedAt < 5 * 60 * 1000
        ) {
          return;
        }

        // 날짜 변경 시 초기화
        if (state.lastGeneratedDate !== today) {
          get().clearDailyState();
        }

        set({ isLoading: true, error: null });

        try {
          // 1. 연동 상태 확인
          const integrationState = detectIntegrationState();

          // 2. 방문 정보
          const visitInfo = getVisitInfo();

          // 3. 캘린더 이벤트 로드 (연동된 경우)
          let calendarEvents: CalendarEvent[] = [];
          if (integrationState !== 'NONE') {
            calendarEvents = await loadCalendarEvents();
          }

          // 4. 컨텍스트 구성
          const now = new Date();
          const context: InsightContext = {
            integrationState,
            calendarEvents,
            currentHour: now.getHours(),
            dayOfWeek: now.getDay(),
            isFirstOpenToday: visitInfo.isFirstOpenToday,
            lastSessionGapHours: visitInfo.lastSessionGapHours,
            todayVisitCount: visitInfo.todayVisitCount
          };

          // 5. 인사이트 생성 (insightPicker 사용)
          const insights = pickInsights(context);

          // 6. 이미 dismiss된 인사이트 필터링
          const filteredInsights = insights.filter(
            i => !state.dismissedInsightIds.includes(i.id)
          );

          set({
            currentInsights: filteredInsights,
            cachedContext: context,
            lastGeneratedAt: Date.now(),
            lastGeneratedDate: today,
            isLoading: false
          });

        } catch (error) {
          console.error('[SmartInsightStore] Generate error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to generate insights',
            isLoading: false
          });
        }
      },

      dismissInsight: (insightId: string) => {
        const state = get();
        set({
          currentInsights: state.currentInsights.filter(i => i.id !== insightId),
          dismissedInsightIds: [...state.dismissedInsightIds, insightId]
        });
      },

      handleCTA: (insight: Insight) => {
        if (!insight.cta) return;

        const action = insight.cta.action;

        switch (action) {
          case 'CONNECT_CALENDAR':
            // 설정 페이지로 이동 (실제 라우팅은 컴포넌트에서 처리)
            window.dispatchEvent(new CustomEvent('navigate', { detail: '/settings/integrations' }));
            break;
          case 'OPEN_CAPTURE':
            window.dispatchEvent(new CustomEvent('open-capture'));
            break;
          case 'OPEN_SETTINGS':
            window.dispatchEvent(new CustomEvent('navigate', { detail: '/settings' }));
            break;
          case 'OPEN_FOCUS':
            window.dispatchEvent(new CustomEvent('navigate', { detail: '/work' }));
            break;
          case 'DISMISS':
            get().dismissInsight(insight.id);
            break;
        }
      },

      clearDailyState: () => {
        set({
          shownInsightsToday: [],
          currentInsights: [],
          lastGeneratedAt: null
        });
      },

      resetStore: () => {
        set({
          currentInsights: [],
          shownInsightsToday: [],
          dismissedInsightIds: [],
          lastGeneratedAt: null,
          lastGeneratedDate: null,
          isLoading: false,
          error: null,
          cachedContext: null
        });
      },

      // Getters
      getVisibleInsights: () => {
        const state = get();
        return state.currentInsights.slice(0, 2); // 최대 2개
      }
    }),
    {
      name: 'alfredo-smart-insight-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dismissedInsightIds: state.dismissedInsightIds,
        shownInsightsToday: state.shownInsightsToday,
        lastGeneratedDate: state.lastGeneratedDate
      })
    }
  )
);

// ============================================================
// Selector Hooks
// ============================================================

export const useSmartInsights = () => useSmartInsightStore((state) => state.currentInsights);
export const useVisibleInsights = () => useSmartInsightStore((state) => state.getVisibleInsights());
export const useSmartInsightLoading = () => useSmartInsightStore((state) => state.isLoading);
