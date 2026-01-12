// DNA 확장 엔진 타입 정의

// 캐린더 이벤트 원시 데이터
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  location?: string;
  attendees?: number;
  calendarType: 'work' | 'personal' | 'unknown';
  isRecurring: boolean;
  createdAt: Date;
  updatedAt?: Date;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

// 확신도 레벨
export type ConfidenceLevel = 1 | 2 | 3; // ⭐ | ⭐⭐ | ⭐⭐⭐

// 크로노타입 (아침형/저녁형)
export type Chronotype = 'morning' | 'evening' | 'neutral';

// 업무 스타일
export type WorkStyle = 'collaborative' | 'independent' | 'balanced';

// 스트레스 레벨
export type StressLevel = 'low' | 'medium' | 'high' | 'burnout';

// 워라밸 상태
export type WorkLifeBalance = 'good' | 'moderate' | 'poor';

// ========== 새로 추가: 키워드 기반 분류 ==========

// 일정 카테고리
export type EventCategory = 
  | 'meeting'      // 미팅, 회의
  | 'focus'        // 집중 작업, 보고서
  | 'presentation' // 발표, PT
  | 'one_on_one'   // 1:1, 면담
  | 'meal'         // 점심, 저녁
  | 'health'       // 운동, 병원
  | 'personal'     // 개인 일정
  | 'break'        // 휴식
  | 'other';

// 에너지 소모 레벨
export type EnergyLevel = 'high' | 'medium' | 'low' | 'recovery';

// 미팅 강도 (참석자 수 기반)
export type MeetingIntensity = 
  | 'solo'        // 1명 (나만)
  | 'one_on_one'  // 2명
  | 'small'       // 3-5명
  | 'medium'      // 6-10명
  | 'large';      // 10명+

// 분류된 이벤트
export interface ClassifiedEvent extends CalendarEvent {
  category: EventCategory;
  energyLevel: EnergyLevel;
  meetingIntensity?: MeetingIntensity;
}

// ========== 새로 추가: 복합 인사이트 ==========

// 오늘의 컨텍스트
export interface TodayContext {
  date: Date;
  isBusyDay: boolean;
  busyLevel: 'light' | 'normal' | 'heavy' | 'extreme';
  totalMeetings: number;
  totalFreeMinutes: number;
  hasConsecutiveMeetings: boolean; // 연속 미팅 3개+
  hasPresentationToday: boolean;
  hasPresentationTomorrow: boolean;
  hasLunchBreak: boolean;
  firstEventTime?: string;
  lastEventTime?: string;
  suggestedTone: 'energetic' | 'gentle' | 'supportive';
}

// 특별 이벤트 감지
export interface SpecialEventAlert {
  type: 'presentation' | 'deadline' | 'important_meeting' | 'overload';
  eventTitle?: string;
  eventTime?: string;
  daysUntil: number; // 0=오늘, 1=내일, -1=어제
  message: string;
}

// 번아웃 경고
export interface BurnoutWarning {
  level: 'none' | 'watch' | 'warning' | 'critical';
  signals: string[];
  recommendation: string;
}

// ========== 새로 추가: 인사이트 → 액션 매핑 ==========

// 알프레도가 취할 액션
export type AlfredoAction = 
  | 'recommend_morning_task'    // 오전에 중요 태스크 추천
  | 'recommend_afternoon_task'  // 오후에 가벼운 태스크 추천
  | 'minimize_morning_alerts'   // 아침 알림 최소화 (저녁형)
  | 'suggest_break'             // 휴식 제안
  | 'soften_tone'               // 톤 부드럽게
  | 'emphasize_rest'            // 쉬라고 강조
  | 'protect_focus_time'        // 집중 시간 보호
  | 'reduce_task_load'          // 할 일 줄이기 제안
  | 'celebrate_progress'        // 진행 축하
  | 'send_encouragement'        // 격려 메시지
  | 'warn_burnout';             // 번아웃 경고

// 인사이트 → 액션 매핑 결과
export interface InsightAction {
  insight: InsightType;
  condition: string;
  actions: AlfredoAction[];
  priority: 'low' | 'medium' | 'high';
}

// ========== 새로 추가: 확신도 기반 표현 ==========

// 확신도별 말투
export const CONFIDENCE_EXPRESSIONS = {
  1: {
    prefix: '',
    suffix: '인 것 같아요',
    connector: '아마'
  },
  2: {
    prefix: '',
    suffix: '인 편이시네요',
    connector: '보통'
  },
  3: {
    prefix: '',
    suffix: '이시잖아요',
    connector: '항상'
  }
} as const;

// ========== 기존 타입 (유지) ==========

// 인사이트 항목
export interface Insight {
  id: string;
  type: InsightType;
  value: string | number | boolean;
  confidence: ConfidenceLevel;
  evidence: string[]; // 근거 데이터
  createdAt: Date;
  updatedAt: Date;
  isConfirmedByUser?: boolean; // 사용자 확인 여부
}

export type InsightType = 
  | 'chronotype'
  | 'energy_pattern'
  | 'work_style'
  | 'stress_level'
  | 'work_life_balance'
  | 'focus_time'
  | 'busy_day'
  | 'meeting_preference'
  | 'recovery_need';

// DNA 프로필 (전체 분석 결과)
export interface DNAProfile {
  userId: string;
  
  // 기본 패턴
  chronotype: {
    type: Chronotype;
    confidence: ConfidenceLevel;
    firstEventAvgTime: string; // "09:30"
    preferredWakeTime?: string;
  };
  
  // 에너지 패턴
  energyPattern: {
    peakHours: number[]; // [9, 10, 11] = 오전 9-11시 피크
    lowHours: number[]; // [14, 15] = 오후 2-3시 슬럼프
    recoveryNeededAfterMeetings: number; // 미팅 후 회복 필요 시간(분)
    confidence: ConfidenceLevel;
  };
  
  // 업무 스타일
  workStyle: {
    type: WorkStyle;
    meetingRatio: number; // 0-100%
    prefersSoloWork: boolean;
    prefersRoutine: boolean;
    confidence: ConfidenceLevel;
  };
  
  // 스트레스 지표
  stressIndicators: {
    level: StressLevel;
    recentCancellations: number;
    weekendWorkDays: number;
    averageFreeTimePerDay: number; // 분
    confidence: ConfidenceLevel;
  };
  
  // 워라밸
  workLifeBalance: {
    status: WorkLifeBalance;
    personalEventRatio: number; // 0-100%
    afterHoursWorkDays: number; // 지난 주 야근 일수
    hasExerciseRoutine: boolean;
    confidence: ConfidenceLevel;
  };
  
  // 집중 시간
  focusTime: {
    bestSlots: TimeSlot[]; // 집중하기 좋은 시간대
    averageDeepWorkHours: number;
    confidence: ConfidenceLevel;
  };
  
  // 요일별 패턴
  weekdayPatterns: {
    busiestDay: number; // 0=일, 1=월, ..., 6=토
    lightestDay: number;
    meetingHeavyDays: number[];
    confidence: ConfidenceLevel;
  };
  
  // 메타데이터
  analyzedEventsCount: number;
  dataRangeStart: Date;
  dataRangeEnd: Date;
  lastAnalyzedAt: Date;
  version: number;
}

export interface TimeSlot {
  dayOfWeek: number; // 0-6
  startHour: number; // 0-23
  endHour: number;
  quality: 'excellent' | 'good' | 'fair';
}

// 알프레도 메시지 생성용
export interface DNABasedSuggestion {
  type: 'briefing' | 'nudge' | 'warning' | 'celebration';
  message: string;
  basedOn: InsightType[];
  priority: 'low' | 'medium' | 'high';
  actionable?: {
    label: string;
    action: string;
  };
}

// 분석 옵션
export interface AnalysisOptions {
  includeRecurring: boolean;
  dateRange: {
    start: Date;
    end: Date;
  };
  minEventsRequired: number;
}
