/**
 * AlFredo Emotion & Health System Types
 *
 * 감정/건강은 웰빙이 아니라 생산성 제약조건으로 사용
 * - 입력은 선택: 숫자/서술/병명 입력 금지
 * - 감지 결과를 말하지 말 것: "스트레스 분석", "감정 분석" 표현 금지
 * - 상태 전환은 보수적으로: 단일 메시지로 mode 강제 전환 금지
 */

// ============================================================
// Core Types
// ============================================================

/** Daily Mode: 사용자가 선택한 하루 리듬 */
export type DailyMode = 'push' | 'steady' | 'protect';

/** Effective Mode: 계산된 실제 적용 모드 */
export type EffectiveMode = 'push' | 'steady' | 'protect';

/** Signal Level: 감지된 신호 레벨 */
export type SignalLevel = 'low' | 'medium' | 'high';

/** People Friction Level */
export type PeopleFrictionLevel = 'none' | 'possible' | 'clear';

/** UI Tone */
export type UITone = 'neutral' | 'soft' | 'protective';

/** Suggest Intensity */
export type SuggestIntensity = 'low' | 'medium' | 'high';

// ============================================================
// Detector Types (LLM Output)
// ============================================================

export interface DetectorSignal {
  level: SignalLevel;
  confidence: number; // 0.0 - 1.0
  evidence: string[]; // 12 words max per item
}

export interface PeopleFrictionSignal {
  level: PeopleFrictionLevel;
  confidence: number;
  evidence: string[];
}

export interface DetectorOutput {
  signals: {
    emotional_load: DetectorSignal;
    cognitive_overload: DetectorSignal;
    physical_constraint: DetectorSignal;
    people_friction: PeopleFrictionSignal;
  };
  notes: {
    should_confirm_state_question: boolean;
    confirm_reason: string;
    safety_flags: string[];
  };
}

// ============================================================
// State Types
// ============================================================

export interface RollingState {
  level: SignalLevel;
  streak: number;
  updatedAt: string; // ISO timestamp
}

export interface UIPolicy {
  maxOptions: 1 | 2 | 3;
  tone: UITone;
  suggestIntensity: SuggestIntensity;
}

export interface ConfirmRateLimit {
  lastAskedAt: string | null;
  askedCountToday: number;
  askedDateKey: string | null; // YYYY-MM-DD
}

export interface EmotionHealthState {
  // Daily Mode
  dailyMode: DailyMode | null;
  dailyModeSelectedAt: string | null;

  // Effective Mode
  effectiveMode: EffectiveMode;

  // Rolling States
  emotionalLoad: RollingState;
  cognitiveOverload: RollingState;

  // Instant States
  physicalConstraint: {
    level: SignalLevel;
    reason: string | null;
    updatedAt: string;
  };
  peopleFriction: {
    level: PeopleFrictionLevel;
    updatedAt: string;
  };

  // Confirm Rate Limit
  confirmLimit: ConfirmRateLimit;

  // UI Policy
  uiPolicy: UIPolicy;

  // Drop-off Tracking
  lastDropoffAt: string | null;
  dropoffCountWeek: number;

  // Loading/Sync
  isLoading: boolean;
  lastSyncAt: string | null;
}

// ============================================================
// Health Input Types
// ============================================================

export type HealthLevel = 'fine' | 'uncomfortable' | 'needProtection';

export type HealthReason =
  | 'menstrual'
  | 'cold'
  | 'sleepDeprived'
  | 'bodyAche'
  | 'other';

export interface HealthInput {
  level: HealthLevel;
  reasons?: HealthReason[];
}

// ============================================================
// Transition Card Types
// ============================================================

export type TransitionTrigger =
  | 'peopleFriction'
  | 'emotionalHigh'
  | 'cognitiveHigh'
  | 'meetingHeavy'
  | 'protectMode'
  | 'manual';

export interface TransitionCardState {
  isVisible: boolean;
  trigger: TransitionTrigger | null;
  step: 1 | 2; // 1: 인정, 2: 내려두기
  acknowledgementMessage: string;
  lifeDeclarationMessage: string;
}

// ============================================================
// Event Logging Types
// ============================================================

export type TransitionEventType =
  | 'transition_card_shown'
  | 'transition_card_skipped'
  | 'dropoff_clicked'
  | 'life_entry_completed';

export interface TransitionEvent {
  eventType: TransitionEventType;
  triggerReason?: TransitionTrigger;
  effectiveMode?: EffectiveMode;
  dwellTimeSeconds?: number;
}

// ============================================================
// Daily Onboarding Types
// ============================================================

export interface DailyOnboardingOption {
  mode: DailyMode;
  emoji: string;
  label: string;
  description: string;
}

export const DAILY_ONBOARDING_OPTIONS: DailyOnboardingOption[] = [
  {
    mode: 'push',
    emoji: '🚀',
    label: '밀어보는 날',
    description: '오늘은 집중해서 많이 해볼게요'
  },
  {
    mode: 'steady',
    emoji: '⚖️',
    label: '무리 안 하는 날',
    description: '적당히 하고 균형 잡을게요'
  },
  {
    mode: 'protect',
    emoji: '🛟',
    label: '보호하는 날',
    description: '오늘은 회복이 우선이에요'
  }
];

// ============================================================
// Health Input Options
// ============================================================

export interface HealthLevelOption {
  level: HealthLevel;
  emoji: string;
  label: string;
}

export const HEALTH_LEVEL_OPTIONS: HealthLevelOption[] = [
  {
    level: 'fine',
    emoji: '💪',
    label: '문제없어요'
  },
  {
    level: 'uncomfortable',
    emoji: '😕',
    label: '좀 불편해요'
  },
  {
    level: 'needProtection',
    emoji: '🛌',
    label: '보호가 필요해요'
  }
];

export interface HealthReasonOption {
  reason: HealthReason;
  label: string;
}

export const HEALTH_REASON_OPTIONS: HealthReasonOption[] = [
  { reason: 'menstrual', label: '생리' },
  { reason: 'cold', label: '감기 기운' },
  { reason: 'sleepDeprived', label: '잠을 설쳤어요' },
  { reason: 'bodyAche', label: '몸이 결려요' },
  { reason: 'other', label: '기타' }
];

// ============================================================
// Supabase Row Type
// ============================================================

export interface AlfredoUserStateRow {
  user_id: string;
  daily_mode: DailyMode | null;
  daily_mode_selected_at: string | null;
  effective_mode: EffectiveMode;
  rolling_emotional_level: SignalLevel;
  rolling_emotional_streak: number;
  rolling_emotional_updated_at: string;
  rolling_cognitive_level: SignalLevel;
  rolling_cognitive_streak: number;
  rolling_cognitive_updated_at: string;
  physical_constraint_level: SignalLevel;
  physical_constraint_reason: string | null;
  physical_constraint_updated_at: string;
  people_friction_level: PeopleFrictionLevel;
  people_friction_updated_at: string;
  confirm_last_asked_at: string | null;
  confirm_asked_count_today: number;
  confirm_asked_date_key: string | null;
  ui_max_options: 1 | 2 | 3;
  ui_tone: UITone;
  ui_suggest_intensity: SuggestIntensity;
  last_dropoff_at: string | null;
  dropoff_count_week: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Convert Supabase row to EmotionHealthState
 */
export function rowToState(row: AlfredoUserStateRow): EmotionHealthState {
  return {
    dailyMode: row.daily_mode,
    dailyModeSelectedAt: row.daily_mode_selected_at,
    effectiveMode: row.effective_mode,
    emotionalLoad: {
      level: row.rolling_emotional_level,
      streak: row.rolling_emotional_streak,
      updatedAt: row.rolling_emotional_updated_at
    },
    cognitiveOverload: {
      level: row.rolling_cognitive_level,
      streak: row.rolling_cognitive_streak,
      updatedAt: row.rolling_cognitive_updated_at
    },
    physicalConstraint: {
      level: row.physical_constraint_level,
      reason: row.physical_constraint_reason,
      updatedAt: row.physical_constraint_updated_at
    },
    peopleFriction: {
      level: row.people_friction_level,
      updatedAt: row.people_friction_updated_at
    },
    confirmLimit: {
      lastAskedAt: row.confirm_last_asked_at,
      askedCountToday: row.confirm_asked_count_today,
      askedDateKey: row.confirm_asked_date_key
    },
    uiPolicy: {
      maxOptions: row.ui_max_options,
      tone: row.ui_tone,
      suggestIntensity: row.ui_suggest_intensity
    },
    lastDropoffAt: row.last_dropoff_at,
    dropoffCountWeek: row.dropoff_count_week,
    isLoading: false,
    lastSyncAt: row.updated_at
  };
}

/**
 * Get default state
 */
export function getDefaultState(): EmotionHealthState {
  const now = new Date().toISOString();
  return {
    dailyMode: null,
    dailyModeSelectedAt: null,
    effectiveMode: 'steady',
    emotionalLoad: { level: 'low', streak: 0, updatedAt: now },
    cognitiveOverload: { level: 'low', streak: 0, updatedAt: now },
    physicalConstraint: { level: 'low', reason: null, updatedAt: now },
    peopleFriction: { level: 'none', updatedAt: now },
    confirmLimit: { lastAskedAt: null, askedCountToday: 0, askedDateKey: null },
    uiPolicy: { maxOptions: 3, tone: 'neutral', suggestIntensity: 'medium' },
    lastDropoffAt: null,
    dropoffCountWeek: 0,
    isLoading: false,
    lastSyncAt: null
  };
}
