/**
 * Work OS Types
 *
 * AlFredo Work OS Phase 1 MVP 타입 정의
 * - AlfredoTask: 내부 Task 스키마
 * - MeetingRecommendation: 미팅 기반 Task 추천
 * - TodayContext: Today 화면 컨텍스트
 */

import { CalendarEvent } from '../calendar';
import { Task } from '../tasks';

// ============================================================
// AlfredoTask (내부 Task 스키마)
// ============================================================

/**
 * Task 상태
 */
export type TaskStatus = 'todo' | 'doing' | 'waiting' | 'done';

/**
 * 에너지 레벨 (Phase 1에서는 항상 'unknown')
 */
export type EnergyLevel = 'low' | 'medium' | 'high' | 'unknown';

/**
 * Task 출처 Provider
 */
export type OriginProvider = 'notion' | 'calendar' | 'manual';

/**
 * Task 생성 원인
 */
export type CreatedFrom = 'meeting' | 'manual' | 'suggestion';

/**
 * AlFredo 내부 Task 스키마 (v1)
 *
 * 주의: energy_level은 존재만 하고 Phase 1에서는 사용하지 않음
 */
export interface AlfredoTask {
  task_id: string;
  title: string;
  status: TaskStatus;
  due_at?: Date;
  time_estimate?: number;        // minutes
  priority_score?: number;       // 0-100 (Phase 1 미사용)
  energy_level: EnergyLevel;     // Phase 1: 항상 'unknown'
  project_id?: string;
  origin_provider: OriginProvider;
  external_ref_id?: string;
  created_from: CreatedFrom;

  // 추가 메타데이터
  description?: string;
  linkedMeetingId?: string;      // 연결된 미팅 ID
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Meeting Analysis
// ============================================================

/**
 * 미팅 추천 조건
 * (2개 이상 충족 시 추천 Task 생성)
 */
export interface MeetingRecommendationConditions {
  /** 참석자 2인 이상 */
  hasMultipleAttendees: boolean;

  /** 30분 이상 */
  isLongMeeting: boolean;

  /** 미팅 키워드 포함 */
  hasMeetingKeyword: boolean;

  /** 과거 유사 회의 존재 */
  hasSimilarPastMeeting: boolean;

  /** 충족된 조건 수 */
  conditionsMet: number;
}

/**
 * 미팅 분석 결과
 */
export interface MeetingAnalysis {
  /** 분석 대상 미팅 */
  meeting: CalendarEvent;

  /** 추천 조건 */
  conditions: MeetingRecommendationConditions;

  /** 추천 가능 여부 (조건 2개 이상 충족) */
  shouldRecommend: boolean;

  /** 미팅 해석 (예: "OOO를 결정하기 위한 미팅") */
  interpretation: string;

  /** 추천 준비 Task들 */
  suggestedTasks: TaskSuggestion[];
}

/**
 * Task 추천 (선택 전 상태)
 */
export interface TaskSuggestion {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes?: number;

  /** 추천 이유 */
  reason: string;

  /** 선택 여부 */
  isSelected: boolean;
}

// ============================================================
// Meeting Keywords
// ============================================================

/**
 * 미팅 키워드 (추천 조건 판정용)
 */
export const MEETING_KEYWORDS = {
  english: ['meeting', 'sync', 'review', 'interview', 'standup', 'retro', 'planning', '1:1', 'one-on-one'],
  korean: ['미팅', '회의', '회고', '인터뷰', '면접', '리뷰', '싱크', '스탠드업', '플래닝']
};

/**
 * 미팅 해석 키워드 매핑
 */
export const MEETING_INTERPRETATION_KEYWORDS: Record<string, string> = {
  review: '리뷰하기 위한',
  planning: '계획을 세우기 위한',
  sync: '상황을 공유하기 위한',
  interview: '인터뷰를 진행하기 위한',
  standup: '진행 상황을 공유하기 위한',
  retro: '회고하기 위한',
  '1:1': '1:1 대화를 위한',
  미팅: '논의하기 위한',
  회의: '논의하기 위한',
  회고: '회고하기 위한',
  리뷰: '리뷰하기 위한'
};

// ============================================================
// Today Context
// ============================================================

/**
 * Today 화면 모드
 */
export type TodayMode = 'meeting-based' | 'focus-based';

/**
 * Today 화면 컨텍스트
 */
export interface TodayContext {
  /** 현재 모드 */
  mode: TodayMode;

  /** 캘린더 연동 여부 */
  calendarConnected: boolean;

  /** 오늘 미팅 목록 (meeting-based 모드) */
  todayMeetings: CalendarEvent[];

  /** 미팅 분석 결과들 (meeting-based 모드) */
  meetingAnalyses: MeetingAnalysis[];

  /** 오늘의 포커스 Task들 (focus-based 모드) */
  focusTasks: Task[];

  /** Today 메시지 */
  message: string;
}

/**
 * Today Task 선정 조건
 */
export interface TodayTaskCriteria {
  /** 상태: todo 또는 doing */
  statusFilter: TaskStatus[];

  /** 마감일: 오늘이거나 없음 */
  dueTodayOrNone: boolean;

  /** 수정일: 최근 7일 이내 */
  modifiedWithin7Days: boolean;

  /** 최대 개수 */
  maxCount: number;
}

/**
 * 기본 Today Task 선정 조건
 */
export const DEFAULT_TODAY_CRITERIA: TodayTaskCriteria = {
  statusFilter: ['todo', 'doing'],
  dueTodayOrNone: true,
  modifiedWithin7Days: true,
  maxCount: 3
};

// ============================================================
// Task Suggestion Templates
// ============================================================

/**
 * 미팅 준비 Task 템플릿
 */
export const MEETING_PREP_TASK_TEMPLATES = [
  {
    title: '논의할 포인트 정리',
    description: '이 미팅에서 다룰 주요 안건을 미리 정리해두면 좋아요',
    estimatedMinutes: 15,
    reason: '미팅 시간을 효율적으로 쓸 수 있어요'
  },
  {
    title: '관련 자료 확인',
    description: '필요한 문서나 데이터를 미리 확인해두세요',
    estimatedMinutes: 10,
    reason: '미팅 중 당황하지 않게 돼요'
  },
  {
    title: '질문 목록 준비',
    description: '이 미팅에서 꼭 물어볼 것들을 적어두세요',
    estimatedMinutes: 10,
    reason: '중요한 걸 놓치지 않게 돼요'
  },
  {
    title: '이전 논의 내용 복습',
    description: '지난번에 어디까지 얘기했는지 다시 확인해보세요',
    estimatedMinutes: 10,
    reason: '맥락을 이어갈 수 있어요'
  }
];

// ============================================================
// Notification Policy
// ============================================================

/**
 * 알림 허용 조건
 * (모두 충족 시에만 알림)
 */
export interface NotificationConditions {
  /** 회의까지 3시간 이하 */
  meetingWithin3Hours: boolean;

  /** 추천 Task 1개 이하 */
  maxOneSuggestion: boolean;

  /** 과거 유사 추천 수락 이력 있음 */
  hasPastAcceptance: boolean;
}

/**
 * 기본 알림 정책: 알림 비활성화
 */
export const DEFAULT_NOTIFICATION_ENABLED = false;
