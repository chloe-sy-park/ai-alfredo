/**
 * Briefing Store - Zustand Store
 *
 * 홈/Work/Life 페이지의 브리핑 데이터 통합 관리
 * 캘린더 이벤트, 태스크, 컨디션 데이터 기반 브리핑 생성
 */

import { create } from 'zustand';
import { getTodayEvents, CalendarEvent } from '../services/calendar/calendarService';
import { getTasks, Task } from '../services/tasks';
import { getTodayCondition, ConditionLevel } from '../services/condition/conditionService';
import { generateBriefing, BriefingOutput, BriefingContext } from '../services/briefing';

// ============================================
// Types
// ============================================

export type BriefingType = 'home' | 'work' | 'life';

interface BriefingState {
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  briefing: BriefingOutput | null;
  todayCalendar: CalendarEvent[];
  incompleteTasks: Task[];
  condition: ConditionLevel | undefined;
  currentType: BriefingType;

  // Actions
  refreshBriefing: (type?: BriefingType) => Promise<void>;
  clearError: () => void;
}

// ============================================
// Constants
// ============================================

const DAYS_KO = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;

// ============================================
// Store Implementation
// ============================================

export const useBriefingStore = create<BriefingState>((set, get) => ({
  lastUpdated: null,
  isLoading: false,
  error: null,
  briefing: null,
  todayCalendar: [],
  incompleteTasks: [],
  condition: undefined,
  currentType: 'home',

  refreshBriefing: async (type: BriefingType = 'home') => {
    // 이미 로딩 중이면 중복 실행 방지
    if (get().isLoading) return;

    set({ isLoading: true, error: null, currentType: type });

    try {
      // 1. 캘린더 이벤트 가져오기
      let todayCalendar: CalendarEvent[] = [];
      try {
        todayCalendar = await getTodayEvents();
      } catch (e) {
        console.warn('[BriefingStore] 캘린더 로드 실패:', e);
      }

      // 2. 미완료 태스크 가져오기
      const allTasks = getTasks();
      const incompleteTasks = allTasks.filter((t) => t.status !== 'done');

      // 3. 오늘 컨디션 가져오기
      const conditionRecord = getTodayCondition();
      const condition: ConditionLevel | undefined = conditionRecord?.level;

      // 4. 브리핑 컨텍스트 구성
      const now = new Date();
      const context: BriefingContext = {
        currentTime: now,
        dayOfWeek: DAYS_KO[now.getDay()],
        todayCalendar,
        incompleteTasks,
        condition,
      };

      // 5. 브리핑 생성
      const briefing = generateBriefing(context);

      set({
        lastUpdated: new Date(),
        briefing,
        todayCalendar,
        incompleteTasks,
        condition,
      });

      console.log('[BriefingStore] 브리핑 갱신 완료:', briefing.headline);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '브리핑 갱신 실패';
      console.error('[BriefingStore] 브리핑 갱신 실패:', error);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// ============================================
// Selectors
// ============================================

export const selectBriefing = (state: BriefingState) => state.briefing;
export const selectIsLoading = (state: BriefingState) => state.isLoading;
export const selectError = (state: BriefingState) => state.error;
export const selectTodayCalendar = (state: BriefingState) => state.todayCalendar;
export const selectIncompleteTasks = (state: BriefingState) => state.incompleteTasks;