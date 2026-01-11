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
