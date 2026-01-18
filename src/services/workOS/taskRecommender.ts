/**
 * Task Recommender
 *
 * 미팅 기반 Task 추천 및 생성
 * - TaskSuggestion → AlfredoTask 변환
 * - 추천 Task 생성
 * - Task 유효성 검증
 */

import {
  AlfredoTask,
  TaskSuggestion,
  MeetingAnalysis,
  MEETING_PREP_TASK_TEMPLATES
} from './types';
import { CalendarEvent } from '../calendar';

// ============================================================
// Helper Functions
// ============================================================

function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 현재 시각 ISO 문자열
 */
function nowISO(): string {
  return new Date().toISOString();
}

// ============================================================
// Task Creation
// ============================================================

/**
 * TaskSuggestion을 AlfredoTask로 변환
 *
 * 사용자가 추천을 선택했을 때 호출
 */
export function createTaskFromSuggestion(
  suggestion: TaskSuggestion,
  meetingId: string
): AlfredoTask {
  const now = nowISO();

  return {
    task_id: generateTaskId(),
    title: suggestion.title,
    description: suggestion.description,
    status: 'todo',
    time_estimate: suggestion.estimatedMinutes,
    energy_level: 'unknown', // Phase 1: 항상 unknown
    origin_provider: 'calendar',
    created_from: 'meeting',
    linkedMeetingId: meetingId,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * 미팅 분석 결과에서 선택된 추천을 Task로 변환
 */
export function createTasksFromAnalysis(
  analysis: MeetingAnalysis
): AlfredoTask[] {
  const selectedSuggestions = analysis.suggestedTasks.filter(s => s.isSelected);
  const meetingId = analysis.meeting.id;

  return selectedSuggestions.map(suggestion =>
    createTaskFromSuggestion(suggestion, meetingId)
  );
}

/**
 * 수동 Task 생성 (미팅 연결 없음)
 */
export function createManualTask(
  title: string,
  options?: {
    description?: string;
    timeEstimate?: number;
    dueAt?: Date;
    projectId?: string;
  }
): AlfredoTask {
  const now = nowISO();

  return {
    task_id: generateTaskId(),
    title,
    description: options?.description,
    status: 'todo',
    due_at: options?.dueAt,
    time_estimate: options?.timeEstimate,
    energy_level: 'unknown',
    project_id: options?.projectId,
    origin_provider: 'manual',
    created_from: 'manual',
    createdAt: now,
    updatedAt: now
  };
}

// ============================================================
// Task Recommendations
// ============================================================

/**
 * 미팅에 대한 추천 Task 템플릿 선택
 *
 * 미팅 특성에 따라 적합한 템플릿 선택
 */
export function selectRecommendationTemplates(
  meeting: CalendarEvent,
  maxCount: number = 2
): typeof MEETING_PREP_TASK_TEMPLATES {
  const title = (meeting.title || '').toLowerCase();
  const templates: typeof MEETING_PREP_TASK_TEMPLATES = [];

  // 리뷰 미팅: 관련 자료 확인 우선
  if (title.includes('review') || title.includes('리뷰')) {
    templates.push(MEETING_PREP_TASK_TEMPLATES[1]); // 관련 자료 확인
    templates.push(MEETING_PREP_TASK_TEMPLATES[3]); // 이전 논의 내용 복습
  }
  // 인터뷰: 질문 목록 우선
  else if (title.includes('interview') || title.includes('인터뷰') || title.includes('면접')) {
    templates.push(MEETING_PREP_TASK_TEMPLATES[2]); // 질문 목록 준비
    templates.push(MEETING_PREP_TASK_TEMPLATES[1]); // 관련 자료 확인
  }
  // 플래닝/계획: 논의할 포인트 우선
  else if (title.includes('planning') || title.includes('플래닝') || title.includes('계획')) {
    templates.push(MEETING_PREP_TASK_TEMPLATES[0]); // 논의할 포인트 정리
    templates.push(MEETING_PREP_TASK_TEMPLATES[2]); // 질문 목록 준비
  }
  // 기본: 논의할 포인트 + 관련 자료
  else {
    templates.push(MEETING_PREP_TASK_TEMPLATES[0]); // 논의할 포인트 정리
    templates.push(MEETING_PREP_TASK_TEMPLATES[1]); // 관련 자료 확인
  }

  return templates.slice(0, maxCount) as typeof MEETING_PREP_TASK_TEMPLATES;
}

/**
 * 추천 유효성 검증
 *
 * - 미팅까지 시간이 충분한지
 * - 이미 생성된 Task가 있는지
 */
export function validateRecommendation(
  meeting: CalendarEvent,
  existingTasks: AlfredoTask[]
): {
  isValid: boolean;
  reason?: string;
} {
  const meetingStart = new Date(meeting.start);
  const now = new Date();
  const hoursUntil = (meetingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  // 이미 시작했거나 지난 미팅
  if (hoursUntil < 0) {
    return {
      isValid: false,
      reason: '이미 지난 미팅이에요'
    };
  }

  // 30분 이내 미팅
  if (hoursUntil < 0.5) {
    return {
      isValid: false,
      reason: '미팅이 곧 시작해서 준비 시간이 부족해요'
    };
  }

  // 이미 연결된 Task가 있음
  const linkedTasks = existingTasks.filter(t => t.linkedMeetingId === meeting.id);
  if (linkedTasks.length >= 2) {
    return {
      isValid: false,
      reason: '이미 준비 Task가 있어요'
    };
  }

  return { isValid: true };
}

// ============================================================
// Task Priority & Sorting
// ============================================================

/**
 * Task 우선순위 점수 계산 (Phase 1에서는 간단한 로직)
 *
 * - 마감일이 가까울수록 높음
 * - 미팅 연결 Task는 우선
 * - status가 doing이면 우선
 */
export function calculateTaskPriority(task: AlfredoTask): number {
  let score = 50; // 기본 점수

  // Status 기반
  if (task.status === 'doing') {
    score += 20;
  }

  // 미팅 연결 Task
  if (task.linkedMeetingId) {
    score += 15;
  }

  // 마감일 기반
  if (task.due_at) {
    const dueDate = new Date(task.due_at);
    const now = new Date();
    const hoursUntil = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil <= 4) {
      score += 25; // 4시간 이내
    } else if (hoursUntil <= 24) {
      score += 15; // 24시간 이내
    } else if (hoursUntil <= 72) {
      score += 5; // 3일 이내
    }
  }

  return Math.min(score, 100);
}

/**
 * Task 우선순위순 정렬
 */
export function sortTasksByPriority(tasks: AlfredoTask[]): AlfredoTask[] {
  return [...tasks].sort((a, b) => {
    const priorityA = calculateTaskPriority(a);
    const priorityB = calculateTaskPriority(b);
    return priorityB - priorityA;
  });
}

// ============================================================
// Task Grouping
// ============================================================

/**
 * 미팅별 Task 그룹화
 */
export function groupTasksByMeeting(
  tasks: AlfredoTask[]
): Map<string, AlfredoTask[]> {
  const groups = new Map<string, AlfredoTask[]>();

  for (const task of tasks) {
    if (task.linkedMeetingId) {
      const existing = groups.get(task.linkedMeetingId) || [];
      groups.set(task.linkedMeetingId, [...existing, task]);
    }
  }

  return groups;
}

/**
 * 미팅 연결 없는 Task들
 */
export function getUnlinkedTasks(tasks: AlfredoTask[]): AlfredoTask[] {
  return tasks.filter(t => !t.linkedMeetingId);
}
