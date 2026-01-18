/**
 * Today Selector
 *
 * Today 화면을 위한 Task 선정 로직
 * - Focus-based: 캘린더 미연동 시 일반 Task에서 선정
 * - Meeting-based: 캘린더 연동 시 미팅 관련 Task 우선
 */

import { Task } from '../tasks';
import { CalendarEvent } from '../calendar';
import {
  AlfredoTask,
  TodayContext,
  TodayMode,
  MeetingAnalysis,
  DEFAULT_TODAY_CRITERIA
} from './types';
import { analyzeTodayMeetings, filterRecommendableMeetings } from './meetingAnalyzer';
// import { sortTasksByPriority } from './taskRecommender'; // 향후 사용 예정

// ============================================================
// Helper Functions
// ============================================================

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateNDaysAgo(n: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - n);
  date.setHours(0, 0, 0, 0);
  return date;
}

// ============================================================
// Today Mode Determination
// ============================================================

/**
 * Today 모드 결정
 *
 * - 캘린더 연동 + 오늘 미팅 있음 → meeting-based
 * - 그 외 → focus-based
 */
export function determineTodayMode(
  calendarConnected: boolean,
  todayEvents: CalendarEvent[]
): TodayMode {
  if (calendarConnected && todayEvents.length > 0) {
    return 'meeting-based';
  }
  return 'focus-based';
}

// ============================================================
// Focus-based Today (캘린더 미연동)
// ============================================================

/**
 * Focus Task 선정 조건
 *
 * - status: todo 또는 doing
 * - 마감일: 오늘이거나 없음
 * - 수정일: 최근 7일 이내
 * - 최대 3개
 */
export function selectFocusTasks(tasks: Task[]): Task[] {
  const today = getTodayDateString();
  const sevenDaysAgo = getDateNDaysAgo(7);

  const filtered = tasks.filter(task => {
    // Status 필터
    if (task.status === 'done') {
      return false;
    }

    // 마감일 필터: 오늘이거나 없음, 또는 이미 지남
    if (task.dueDate) {
      const dueDate = task.dueDate.split('T')[0];
      if (dueDate > today) {
        return false; // 미래 마감은 제외
      }
    }

    // 수정일 필터 (있는 경우)
    const taskAny = task as Task & { updatedAt?: string; createdAt?: string };
    const dateToCheck = taskAny.updatedAt || taskAny.createdAt;

    if (dateToCheck) {
      const date = new Date(dateToCheck);
      if (date < sevenDaysAgo) {
        return false;
      }
    }

    return true;
  });

  // 우선순위 정렬
  const sorted = filtered.sort((a, b) => {
    // 1. doing 상태 우선
    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
    if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;

    // 2. 마감일 있는 것 우선
    if (a.dueDate && !b.dueDate) return -1;
    if (b.dueDate && !a.dueDate) return 1;

    // 3. 마감일 가까운 순
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }

    // 4. 우선순위
    const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
    const aPriority = priorityOrder[a.priority || 'none'] ?? 3;
    const bPriority = priorityOrder[b.priority || 'none'] ?? 3;

    return aPriority - bPriority;
  });

  return sorted.slice(0, DEFAULT_TODAY_CRITERIA.maxCount);
}

// ============================================================
// Meeting-based Today (캘린더 연동)
// ============================================================

/**
 * Meeting-based Today Context 생성
 */
export function buildMeetingBasedContext(
  todayEvents: CalendarEvent[],
  alfredoTasks: AlfredoTask[]
): {
  meetingAnalyses: MeetingAnalysis[];
  recommendableMeetings: MeetingAnalysis[];
  linkedTasks: AlfredoTask[];
} {
  // 미팅 분석
  const meetingAnalyses = analyzeTodayMeetings(todayEvents);

  // 추천 가능한 미팅
  const recommendableMeetings = filterRecommendableMeetings(meetingAnalyses);

  // 미팅에 연결된 AlfredoTask
  const linkedTasks = alfredoTasks.filter(t => t.linkedMeetingId);

  return {
    meetingAnalyses,
    recommendableMeetings,
    linkedTasks
  };
}

// ============================================================
// Today Context Builder
// ============================================================

/**
 * Today 컨텍스트 생성
 */
export function buildTodayContext(
  calendarConnected: boolean,
  todayEvents: CalendarEvent[],
  allTasks: Task[],
  alfredoTasks: AlfredoTask[]
): TodayContext {
  const mode = determineTodayMode(calendarConnected, todayEvents);

  if (mode === 'meeting-based') {
    const { meetingAnalyses, linkedTasks } = buildMeetingBasedContext(
      todayEvents,
      alfredoTasks
    );

    // 미팅 연결 Task 우선순위순 정렬 (향후 사용 예정)
    // const sortedLinkedTasks = sortTasksByPriority(linkedTasks);
    void linkedTasks; // 향후 사용 예정, 현재는 buildMeetingBasedContext에서 반환만

    return {
      mode,
      calendarConnected,
      todayMeetings: todayEvents,
      meetingAnalyses,
      focusTasks: [],
      message: generateTodayMessage(mode, todayEvents.length, 0)
    };
  }

  // Focus-based
  const focusTasks = selectFocusTasks(allTasks);

  return {
    mode,
    calendarConnected,
    todayMeetings: [],
    meetingAnalyses: [],
    focusTasks,
    message: generateTodayMessage(mode, 0, focusTasks.length)
  };
}

/**
 * Today 메시지 생성
 */
export function generateTodayMessage(
  mode: TodayMode,
  meetingCount: number,
  focusCount: number
): string {
  if (mode === 'meeting-based') {
    if (meetingCount === 0) {
      return '오늘은 미팅이 없어요';
    }
    if (meetingCount === 1) {
      return '오늘 미팅이 1개 있어요';
    }
    return `오늘 미팅이 ${meetingCount}개 있어요`;
  }

  // Focus-based
  if (focusCount === 0) {
    return '오늘 집중할 일을 정해볼까요?';
  }
  if (focusCount === 1) {
    return '오늘 집중할 만한 일이 있어요';
  }
  return `오늘 집중할 만한 일이 ${focusCount}개 있어요`;
}

// ============================================================
// Task Summary
// ============================================================

/**
 * Today Task 요약 정보
 */
export interface TodaySummary {
  mode: TodayMode;
  totalMeetings: number;
  recommendableMeetings: number;
  linkedTaskCount: number;
  focusTaskCount: number;
  pendingTaskCount: number;
  message: string;
}

/**
 * Today 요약 생성
 */
export function getTodaySummary(context: TodayContext): TodaySummary {
  const recommendableCount = context.meetingAnalyses.filter(a => a.shouldRecommend).length;
  const linkedTaskCount = context.meetingAnalyses.reduce(
    (sum, a) => sum + a.suggestedTasks.filter(t => t.isSelected).length,
    0
  );

  return {
    mode: context.mode,
    totalMeetings: context.todayMeetings.length,
    recommendableMeetings: recommendableCount,
    linkedTaskCount,
    focusTaskCount: context.focusTasks.length,
    pendingTaskCount: context.focusTasks.filter(t => t.status !== 'done').length,
    message: context.message
  };
}

// ============================================================
// Time-based Helpers
// ============================================================

/**
 * 다음 미팅까지 남은 시간 (분)
 */
export function getMinutesToNextMeeting(analyses: MeetingAnalysis[]): number | null {
  const now = new Date();

  const upcomingMeetings = analyses.filter(a => {
    const start = new Date(a.meeting.start);
    return start > now;
  });

  if (upcomingMeetings.length === 0) {
    return null;
  }

  const nextMeeting = upcomingMeetings[0];
  const meetingStart = new Date(nextMeeting.meeting.start);

  return Math.round((meetingStart.getTime() - now.getTime()) / (1000 * 60));
}

/**
 * 미팅 준비 가능 시간 계산
 *
 * 다음 미팅까지 남은 시간에서 여유 시간(15분) 제외
 */
export function getAvailablePrepTime(analyses: MeetingAnalysis[]): number | null {
  const minutesToNext = getMinutesToNextMeeting(analyses);

  if (minutesToNext === null) {
    return null;
  }

  // 15분 여유 시간 제외
  const availableMinutes = minutesToNext - 15;

  return Math.max(0, availableMinutes);
}

/**
 * 추천 Task가 준비 시간 내에 가능한지 확인
 */
export function canCompleteBeforeMeeting(
  taskEstimateMinutes: number,
  availablePrepTime: number | null
): boolean {
  if (availablePrepTime === null) {
    return true; // 미팅 없으면 항상 가능
  }

  return taskEstimateMinutes <= availablePrepTime;
}
