// =============================================
// 알프레도 육성 시스템 타입 정의
// =============================================

export type Domain = 'work' | 'life';

export type LearningType =
  | 'preference'   // 선호도 (아침엔 말 걸지 마)
  | 'pattern'      // 패턴 (월요일엔 에너지 낮음)
  | 'feedback'     // 피드백 기반 (이런 조언 좋았어)
  | 'correction'   // 교정 (그건 아니야)
  | 'context';     // 맥락 정보 (이번 주 중요한 프로젝트)

export type LearningSource = 'chat' | 'feedback' | 'onboarding' | 'inferred' | 'manual';

// 4축 스타일 설정
export interface StyleAxes {
  toneWarmth: number;       // 따뜻함 (0: 직설적 ~ 100: 다정한)
  notificationFreq: number; // 알림 빈도 (0: 필요시만 ~ 100: 자주)
  dataDepth: number;        // 정보 깊이 (0: 핵심만 ~ 100: 상세히)
  motivationStyle: number;  // 동기부여 (0: 느긋하게 ~ 100: 도전적)
}

// 영역별 오버라이드
export interface DomainOverrides {
  work?: Partial<StyleAxes>;
  life?: Partial<StyleAxes>;
}

// 알프레도 선호도 설정
export interface AlfredoPreferences {
  id: string;
  userId: string;

  // 기본 스타일
  toneWarmth: number;
  notificationFreq: number;
  dataDepth: number;
  motivationStyle: number;

  // 영역별 오버라이드
  domainOverrides: DomainOverrides;

  // 현재 영역
  currentDomain: Domain;

  // 자동 영역 전환
  autoDomainSwitch: boolean;
  workHoursStart: string;  // "09:00"
  workHoursEnd: string;    // "18:00"
  workDays: number[];      // [1,2,3,4,5]

  createdAt: Date;
  updatedAt: Date;
}

// 알프레도 학습 항목
export interface AlfredoLearning {
  id: string;
  userId: string;

  learningType: LearningType;
  category: Domain | 'general';
  summary: string;
  originalInput?: string;
  appliedRules?: Record<string, unknown>;

  confidence: number;
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;

  source: LearningSource;
  sourceMessageId?: string;

  isActive: boolean;
  lastAppliedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// 파악 중인 항목
export interface PendingLearning {
  topic: string;
  progress: number;
  hint: string;
}

// 주간 배운 항목
export interface WeeklyLearningItem {
  id: string;
  summary: string;
  learnedAt: string;
}

// 알프레도 이해도
export interface AlfredoUnderstanding {
  id: string;
  userId: string;

  // 전체 이해도
  understandingScore: number;
  level: number;
  title: string;

  // 이번 주 배운 것
  weeklyLearnings: WeeklyLearningItem[];

  // 파악 중인 것
  pendingLearnings: PendingLearning[];

  // 영역별 이해도
  workUnderstanding: number;
  lifeUnderstanding: number;

  // 통계
  totalInteractions: number;
  totalLearnings: number;
  totalCorrections: number;
  daysTogether: number;

  // 마지막 주간 리포트
  lastWeeklyReportAt?: Date;
  lastWeeklyReport?: WeeklyReport;

  createdAt: Date;
  updatedAt: Date;
}

// 주간 리포트
export interface WeeklyReport {
  id: string;
  userId: string;

  weekStart: string;
  weekEnd: string;

  learningsCount: number;
  correctionsCount: number;
  understandingChange: number;

  learnedItems: WeeklyLearningItem[];
  pendingItems: PendingLearning[];

  highlightMessage: string;

  createdAt: Date;
}

// 레벨별 칭호
export const LEVEL_TITLES: Record<number, string> = {
  1: '첫 만남',
  2: '알아가는 중',
  3: '조금씩 친해지는 중',
  4: '대화가 편해지는 중',
  5: '서로 알아가는 사이',
  6: '믿음이 쌓이는 중',
  7: '좋은 파트너',
  8: '오랜 친구 같은',
  9: '찐친',
  10: '소울메이트'
};

// 영역별 기본 스타일
export const DEFAULT_DOMAIN_STYLES: Record<Domain, Partial<StyleAxes>> = {
  work: {
    toneWarmth: 40,        // 더 직설적
    notificationFreq: 70,  // 더 자주
    dataDepth: 70,         // 상세히
    motivationStyle: 70    // 도전적
  },
  life: {
    toneWarmth: 85,        // 더 다정하게
    notificationFreq: 30,  // 필요시만
    dataDepth: 40,         // 핵심만
    motivationStyle: 30    // 느긋하게
  }
};

// 학습 타입별 포인트
export const LEARNING_POINTS: Record<LearningType, number> = {
  preference: 3,
  pattern: 2,
  feedback: 1,
  correction: 2,
  context: 1
};
