/**
 * 넛지 시스템 타입 정의
 * 알프레도가 사용자에게 부드럽게 알려주는 알림/넛지 시스템
 */

import type { Task } from '../tasks';
import type { CalendarEvent } from '../calendar';

// === 넛지 타입 ===
export type NudgeType =
  | 'morning_briefing'    // 아침 브리핑
  | 'evening_wrapup'      // 저녁 마무리
  | 'meeting_reminder'    // 미팅 리마인더
  | 'focus_suggest'       // 집중시간 제안
  | 'task_nudge'          // 태스크 넛지
  | 'overload_warn'       // 과부하 경고
  | 'rest_suggest'        // 휴식 제안
  | 'late_warning'        // 퇴근 권유
  | 'streak_celebrate'    // 연속 달성 축하
  | 'departure_alert';    // 지각 방지 출발 알림

// === 넛지 긴급도 ===
export type NudgePriority = 'low' | 'medium' | 'high';

// === 넛지 액션 ===
export interface NudgeAction {
  id: string;
  label: string;
  handler?: () => void | Promise<void>;
  url?: string;
}

// === 넛지 본체 ===
export interface Nudge {
  id: string;
  type: NudgeType;
  title: string;
  body: string;
  emoji?: string;
  priority: NudgePriority;

  // 액션 버튼
  actions?: NudgeAction[];

  // 관련 데이터
  relatedData?: {
    taskId?: string;
    eventId?: string;
    habitId?: string;
    url?: string;
  };

  // 표시 옵션
  dismissible?: boolean;
  autoHide?: number;  // ms (0 = 수동 닫기)

  // 메타데이터
  createdAt: string;
  expiresAt?: string;

  // 톤 설정
  tonePreset?: string;
}

// === 넛지 트리거 컨텍스트 ===
export interface TriggerContext {
  tasks: Task[];
  events: CalendarEvent[];
  currentTime: Date;

  // 사용자 상태
  user?: {
    userId: string;
    tonePreset?: string;
    focusStartTime?: Date;
    lastActivityTime?: Date;
    isWorking?: boolean;
  };

  // DNA 인사이트
  dna?: {
    chronotype?: 'morning' | 'evening' | 'flexible';
    peakHours?: number[];
    stressLevel?: 'low' | 'medium' | 'high';
    preferredWorkStyle?: 'big_first' | 'small_first';
  };

  // 최근 넛지 히스토리
  recentNudges?: NudgeHistoryItem[];
}

// === 넛지 히스토리 ===
export interface NudgeHistoryItem {
  id: string;
  type: NudgeType;
  targetId?: string;
  sentAt: string;
  readAt?: string;
  actionTaken?: 'clicked' | 'dismissed' | 'snoozed' | 'completed';
}

// === 넛지 제한 설정 ===
export interface NudgeLimits {
  dailyMax: number;
  perType: Record<NudgeType, number>;
  minInterval: Record<NudgeType | 'default', number>;  // 분 단위
  quietHours: {
    start: string;  // "22:00"
    end: string;    // "07:00"
    exceptions: NudgeType[];
  };
}

// === 쿨다운 규칙 ===
export interface CooldownRules {
  sameTarget: number;  // 분
  afterAction: number; // 분
}

// === 트리거 결과 ===
export interface TriggerResult {
  shouldTrigger: boolean;
  nudge?: Omit<Nudge, 'id' | 'createdAt'>;
  reason?: string;
}

// === 트리거 인터페이스 ===
export interface NudgeTrigger {
  type: NudgeType;
  name: string;
  description: string;

  // 조건 확인
  checkCondition(context: TriggerContext): boolean;

  // 넛지 생성
  generateNudge(context: TriggerContext): TriggerResult;

  // 쿨다운 규칙
  cooldownRules?: CooldownRules;
}

// === 알림 설정 ===
export interface NotificationSettings {
  enabled: boolean;

  // 시간대 설정
  morningBriefingTime: string;  // "08:00"
  eveningWrapupTime: string;    // "21:00"

  // 조용한 시간
  quietStart: string;
  quietEnd: string;

  // 타입별 ON/OFF
  types: Record<NudgeType, boolean>;

  // 미팅 리마인더 시간 (분 전)
  meetingReminderBefore: number[];  // [15, 5]

  // 넛지 강도
  nudgeIntensity: 'minimal' | 'balanced' | 'proactive';
}

// === 기본 제한 설정 ===
export const DEFAULT_NUDGE_LIMITS: NudgeLimits = {
  dailyMax: 8,
  perType: {
    morning_briefing: 1,
    evening_wrapup: 1,
    meeting_reminder: 10,
    focus_suggest: 2,
    task_nudge: 3,
    overload_warn: 1,
    rest_suggest: 3,
    late_warning: 2,
    streak_celebrate: 3,
    departure_alert: 2
  },
  minInterval: {
    default: 30,
    morning_briefing: 60 * 24,  // 하루에 한 번
    evening_wrapup: 60 * 24,
    meeting_reminder: 5,
    focus_suggest: 60,
    task_nudge: 60,
    overload_warn: 120,
    rest_suggest: 60,
    late_warning: 30,
    streak_celebrate: 60,
    departure_alert: 15
  },
  quietHours: {
    start: '22:00',
    end: '07:00',
    exceptions: ['morning_briefing']
  }
};

// === 쿨다운 기본값 ===
export const DEFAULT_COOLDOWN_RULES: Record<NudgeType, CooldownRules> = {
  morning_briefing: { sameTarget: 60 * 24, afterAction: 60 * 24 },
  evening_wrapup: { sameTarget: 60 * 24, afterAction: 60 * 24 },
  meeting_reminder: { sameTarget: 10, afterAction: 60 },
  focus_suggest: { sameTarget: 120, afterAction: 60 },
  task_nudge: { sameTarget: 240, afterAction: 60 * 24 },
  overload_warn: { sameTarget: 240, afterAction: 120 },
  rest_suggest: { sameTarget: 60, afterAction: 60 },
  late_warning: { sameTarget: 60, afterAction: 30 },
  streak_celebrate: { sameTarget: 60 * 24, afterAction: 60 * 24 },
  departure_alert: { sameTarget: 30, afterAction: 60 }
};
