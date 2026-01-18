/**
 * Work OS Store
 *
 * AlFredo Work OS Phase 1 상태 관리
 * - Today 컨텍스트 (meeting-based vs focus-based)
 * - 미팅 분석 및 추천 Task
 * - 사용자 선택 Task 관리
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AlfredoTask,
  TodayContext,
  TodayMode,
  MeetingAnalysis,
  DEFAULT_TODAY_CRITERIA
} from '../services/workOS/types';
import { isCalendarConnected, getTodayEvents, CalendarEvent } from '../services/calendar';
import { getTasks, Task } from '../services/tasks';

// ============================================================
// Types
// ============================================================

interface WorkOSState {
  // Today Context
  todayContext: TodayContext | null;
  todayMode: TodayMode;

  // Meeting Analyses
  meetingAnalyses: MeetingAnalysis[];

  // AlfredoTasks (사용자가 선택한 Task들)
  alfredoTasks: AlfredoTask[];

  // UI State
  isLoading: boolean;
  error: string | null;
  lastUpdatedAt: number | null;
  lastUpdatedDate: string | null;

  // Actions
  initializeToday: () => Promise<void>;
  refreshToday: () => Promise<void>;
  selectSuggestion: (meetingId: string, suggestionId: string) => void;
  deselectSuggestion: (meetingId: string, suggestionId: string) => void;
  confirmSelectedTasks: (meetingId: string) => void;
  updateTaskStatus: (taskId: string, status: AlfredoTask['status']) => void;
  removeTask: (taskId: string) => void;
  clearDailyState: () => void;
  resetStore: () => void;

  // Getters
  getTodayTasks: () => AlfredoTask[];
  getMeetingTasks: (meetingId: string) => AlfredoTask[];
  getPendingTasks: () => AlfredoTask[];
}

// ============================================================
// Helper Functions
// ============================================================

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Today 모드 결정
 * - 캘린더 연동 + 오늘 미팅 있음 → meeting-based
 * - 그 외 → focus-based
 */
function determineTodayMode(calendarConnected: boolean, todayMeetings: CalendarEvent[]): TodayMode {
  if (calendarConnected && todayMeetings.length > 0) {
    return 'meeting-based';
  }
  return 'focus-based';
}

/**
 * Focus Task 선정 (캘린더 미연동 시)
 * - status: todo/doing
 * - 마감일: 오늘이거나 없음
 * - 수정일: 최근 7일 내
 * - 최대 3개
 */
function selectFocusTasks(tasks: Task[]): Task[] {
  const today = new Date();
  const todayStr = getTodayDateString();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  return tasks
    .filter(task => {
      // Status 필터
      if (task.status === 'done') return false;

      // 마감일 필터: 오늘이거나 없음
      if (task.dueDate) {
        const dueDate = task.dueDate.split('T')[0];
        if (dueDate > todayStr) return false; // 미래 마감은 제외
      }

      // 수정일 필터: 최근 7일 내 (updatedAt이 있다면)
      // Task 타입에 updatedAt이 없을 수 있으므로 optional로 처리
      const taskAny = task as Task & { updatedAt?: string };
      if (taskAny.updatedAt) {
        const updatedAt = new Date(taskAny.updatedAt);
        if (updatedAt < sevenDaysAgo) return false;
      }

      return true;
    })
    .slice(0, DEFAULT_TODAY_CRITERIA.maxCount);
}

/**
 * Today 메시지 생성
 */
function generateTodayMessage(mode: TodayMode, meetingCount: number, focusCount: number): string {
  if (mode === 'meeting-based') {
    if (meetingCount === 1) {
      return '오늘 미팅이 1개 있어요';
    }
    return `오늘 미팅이 ${meetingCount}개 있어요`;
  }

  if (focusCount === 0) {
    return '오늘 집중할 일을 정해볼까요?';
  }
  if (focusCount === 1) {
    return '오늘 집중할 만한 일이 있어요';
  }
  return `오늘 집중할 만한 일이 ${focusCount}개 있어요`;
}

// ============================================================
// Store
// ============================================================

export const useWorkOSStore = create<WorkOSState>()(
  persist(
    (set, get) => ({
      // Initial State
      todayContext: null,
      todayMode: 'focus-based',
      meetingAnalyses: [],
      alfredoTasks: [],
      isLoading: false,
      error: null,
      lastUpdatedAt: null,
      lastUpdatedDate: null,

      // Actions
      initializeToday: async () => {
        const state = get();
        const today = getTodayDateString();

        // 같은 날 5분 내 재초기화 방지
        if (
          state.lastUpdatedAt &&
          state.lastUpdatedDate === today &&
          Date.now() - state.lastUpdatedAt < 5 * 60 * 1000
        ) {
          return;
        }

        // 날짜 변경 시 초기화
        if (state.lastUpdatedDate !== today) {
          get().clearDailyState();
        }

        set({ isLoading: true, error: null });

        try {
          // 1. 캘린더 연동 상태 확인
          const calendarConnected = isCalendarConnected();

          // 2. 오늘 이벤트 로드 (연동된 경우)
          let todayMeetings: CalendarEvent[] = [];
          if (calendarConnected) {
            try {
              todayMeetings = await getTodayEvents();
            } catch {
              todayMeetings = [];
            }
          }

          // 3. Today 모드 결정
          const mode = determineTodayMode(calendarConnected, todayMeetings);

          // 4. 모드별 컨텍스트 구성
          let focusTasks: Task[] = [];
          let meetingAnalyses: MeetingAnalysis[] = [];

          if (mode === 'focus-based') {
            // Focus-based: Task 선정
            const allTasks = getTasks();
            focusTasks = selectFocusTasks(allTasks);
          } else {
            // Meeting-based: 미팅 분석 (Day 3에서 구현)
            // 현재는 placeholder
            meetingAnalyses = todayMeetings.map(meeting => ({
              meeting,
              conditions: {
                hasMultipleAttendees: false,
                isLongMeeting: false,
                hasMeetingKeyword: false,
                hasSimilarPastMeeting: false,
                conditionsMet: 0
              },
              shouldRecommend: false,
              interpretation: '미팅이에요',
              suggestedTasks: []
            }));
          }

          // 5. Today 메시지 생성
          const message = generateTodayMessage(
            mode,
            todayMeetings.length,
            focusTasks.length
          );

          // 6. 컨텍스트 저장
          const todayContext: TodayContext = {
            mode,
            calendarConnected,
            todayMeetings,
            meetingAnalyses,
            focusTasks,
            message
          };

          set({
            todayContext,
            todayMode: mode,
            meetingAnalyses,
            isLoading: false,
            lastUpdatedAt: Date.now(),
            lastUpdatedDate: today
          });

        } catch (error) {
          console.error('[WorkOSStore] Initialize error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize Today',
            isLoading: false
          });
        }
      },

      refreshToday: async () => {
        // 강제 새로고침
        set({ lastUpdatedAt: null });
        await get().initializeToday();
      },

      selectSuggestion: (meetingId: string, suggestionId: string) => {
        const state = get();
        const updatedAnalyses = state.meetingAnalyses.map(analysis => {
          if (analysis.meeting.id !== meetingId) return analysis;

          return {
            ...analysis,
            suggestedTasks: analysis.suggestedTasks.map(task =>
              task.id === suggestionId
                ? { ...task, isSelected: true }
                : task
            )
          };
        });

        set({ meetingAnalyses: updatedAnalyses });
      },

      deselectSuggestion: (meetingId: string, suggestionId: string) => {
        const state = get();
        const updatedAnalyses = state.meetingAnalyses.map(analysis => {
          if (analysis.meeting.id !== meetingId) return analysis;

          return {
            ...analysis,
            suggestedTasks: analysis.suggestedTasks.map(task =>
              task.id === suggestionId
                ? { ...task, isSelected: false }
                : task
            )
          };
        });

        set({ meetingAnalyses: updatedAnalyses });
      },

      confirmSelectedTasks: (meetingId: string) => {
        const state = get();
        const analysis = state.meetingAnalyses.find(a => a.meeting.id === meetingId);
        if (!analysis) return;

        const selectedSuggestions = analysis.suggestedTasks.filter(t => t.isSelected);
        const now = new Date().toISOString();

        // TaskSuggestion → AlfredoTask 변환
        const newTasks: AlfredoTask[] = selectedSuggestions.map(suggestion => ({
          task_id: generateTaskId(),
          title: suggestion.title,
          description: suggestion.description,
          status: 'todo' as const,
          time_estimate: suggestion.estimatedMinutes,
          energy_level: 'unknown' as const,
          origin_provider: 'calendar' as const,
          created_from: 'meeting' as const,
          linkedMeetingId: meetingId,
          createdAt: now,
          updatedAt: now
        }));

        // 기존 Task에 추가 + 선택 상태 초기화
        const updatedAnalyses = state.meetingAnalyses.map(a => {
          if (a.meeting.id !== meetingId) return a;
          return {
            ...a,
            suggestedTasks: a.suggestedTasks.map(t => ({ ...t, isSelected: false }))
          };
        });

        set({
          alfredoTasks: [...state.alfredoTasks, ...newTasks],
          meetingAnalyses: updatedAnalyses
        });
      },

      updateTaskStatus: (taskId: string, status: AlfredoTask['status']) => {
        const state = get();
        const now = new Date().toISOString();

        set({
          alfredoTasks: state.alfredoTasks.map(task =>
            task.task_id === taskId
              ? { ...task, status, updatedAt: now }
              : task
          )
        });
      },

      removeTask: (taskId: string) => {
        const state = get();
        set({
          alfredoTasks: state.alfredoTasks.filter(t => t.task_id !== taskId)
        });
      },

      clearDailyState: () => {
        set({
          todayContext: null,
          meetingAnalyses: [],
          lastUpdatedAt: null
        });
      },

      resetStore: () => {
        set({
          todayContext: null,
          todayMode: 'focus-based',
          meetingAnalyses: [],
          alfredoTasks: [],
          isLoading: false,
          error: null,
          lastUpdatedAt: null,
          lastUpdatedDate: null
        });
      },

      // Getters
      getTodayTasks: () => {
        const state = get();
        const today = getTodayDateString();

        return state.alfredoTasks.filter(task => {
          // 오늘 생성된 Task 또는 마감이 오늘인 Task
          const createdToday = task.createdAt.split('T')[0] === today;
          const dueToday = task.due_at
            ? task.due_at.toISOString().split('T')[0] === today
            : false;

          return createdToday || dueToday;
        });
      },

      getMeetingTasks: (meetingId: string) => {
        const state = get();
        return state.alfredoTasks.filter(t => t.linkedMeetingId === meetingId);
      },

      getPendingTasks: () => {
        const state = get();
        return state.alfredoTasks.filter(t => t.status === 'todo' || t.status === 'doing');
      }
    }),
    {
      name: 'alfredo-workos-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        alfredoTasks: state.alfredoTasks,
        lastUpdatedDate: state.lastUpdatedDate
      })
    }
  )
);

// ============================================================
// Selector Hooks
// ============================================================

export const useTodayContext = () => useWorkOSStore((state) => state.todayContext);
export const useTodayMode = () => useWorkOSStore((state) => state.todayMode);
export const useMeetingAnalyses = () => useWorkOSStore((state) => state.meetingAnalyses);
export const useAlfredoTasks = () => useWorkOSStore((state) => state.alfredoTasks);
export const useWorkOSLoading = () => useWorkOSStore((state) => state.isLoading);
