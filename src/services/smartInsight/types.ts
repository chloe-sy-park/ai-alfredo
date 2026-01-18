/**
 * Smart Insight Types
 *
 * Low-Integration Smartness UX를 위한 타입 정의
 * - IntegrationState: 연동 상태 (NONE | CALENDAR_ONLY | CALENDAR_PLUS)
 * - DayType: 하루 타입 분류 (fragmented | heavy-energy | open-focus | recovery)
 * - Insight: 스마트 인사이트 데이터 모델
 */

import { CalendarEvent } from '../calendar';

// ============================================================
// Integration State
// ============================================================

/**
 * 연동 상태
 * - NONE: 연동 0개
 * - CALENDAR_ONLY: 캘린더 1개 연동 (Google/Outlook)
 * - CALENDAR_PLUS: 캘린더 + Notion (향후)
 */
export type IntegrationState = 'NONE' | 'CALENDAR_ONLY' | 'CALENDAR_PLUS';

// ============================================================
// Day Type Classification
// ============================================================

/**
 * 하루 타입 분류
 * - fragmented: 쪼개진 하루 (짧은 블록 3개+ OR 전환율 0.6+)
 * - heavy-energy: 에너지 소모형 (총 일정 180분+ OR 미팅 150분+)
 * - open-focus: 집중 가능형 (최대 연속 빈 시간 120분+)
 * - recovery: 회복 필요형 (늦은 일정 120분+ OR 늦은 시작)
 */
export type DayType = 'fragmented' | 'heavy-energy' | 'open-focus' | 'recovery';

/**
 * Day Type별 메타데이터
 */
export const DAY_TYPE_META: Record<DayType, {
  emoji: string;
  label: string;
  description: string;
}> = {
  fragmented: {
    emoji: '🧩',
    label: '쪼개진 하루',
    description: '짧은 조각이 많아서 집중이 끊기기 쉬워요'
  },
  'heavy-energy': {
    emoji: '🔋',
    label: '에너지 소모형',
    description: '사람·전환이 많으면 체력이 먼저 닳아요'
  },
  'open-focus': {
    emoji: '🎯',
    label: '집중 가능형',
    description: '비어있는 큰 블록이 한 번은 나올 것 같아요'
  },
  recovery: {
    emoji: '🌙',
    label: '회복 필요형',
    description: '무리하면 내일 더 크게 무너져요'
  }
};

// ============================================================
// Day Metrics
// ============================================================

/**
 * 캘린더 기반 Day Type 판정을 위한 메트릭
 */
export interface DayMetrics {
  /** 총 이벤트 수 */
  eventCount: number;

  /** 30분 이하 이벤트 수 */
  shortBlocksCount: number;

  /** 전환율 (gap < 15분인 이벤트 전환 비율) */
  switchingRate: number;

  /** 총 이벤트 시간 (분) */
  totalEventMinutes: number;

  /** 미팅 추정 시간 (분) - 키워드 기반 */
  meetingMinutes: number;

  /** 가장 긴 빈 시간 (분) */
  largestFreeBlockMinutes: number;

  /** 19시 이후 이벤트 시간 (분) */
  lateMinutes: number;

  /** 첫 이벤트 시작 시각 (HH:MM) */
  earlyStartTime: string | null;

  /** 미팅 개수 */
  meetingCount: number;
}

// ============================================================
// Confidence Level
// ============================================================

/**
 * 확신도 레벨
 * - LOW: 추측 ("~인 것 같아요", "~일 수도")
 * - MED: 중간 ("~인 편이에요")
 * - HIGH: 확신 ("~이에요") - MVP에서 거의 안 씀
 */
export type ConfidenceLevel = 'LOW' | 'MED' | 'HIGH';

/**
 * 확신도별 언어 표현
 */
export const CONFIDENCE_LANGUAGE: Record<ConfidenceLevel, {
  /** 문장 끝에 붙는 어미 */
  suffix: string;
  /** 문장 중간에 쓰는 연결어 */
  connector: string;
  /** 추가 고백 문구 */
  disclosure: string;
}> = {
  LOW: {
    suffix: '인 것 같아요',
    connector: '아마',
    disclosure: '아직은 추측이에요. 맞으면 반응으로 알려줘요.'
  },
  MED: {
    suffix: '인 편이에요',
    connector: '보통',
    disclosure: '조금 더 보면 더 정확해져요.'
  },
  HIGH: {
    suffix: '이에요',
    connector: '',
    disclosure: ''
  }
};

// ============================================================
// Insight Types
// ============================================================

/**
 * 인사이트 타입
 * - DAY_TYPE: 오늘 하루 타입 판정
 * - MOMENT: 지금 이 순간 해석
 * - AVOID_ONE: 오늘 피해야 할 것 1개
 */
export type InsightType = 'DAY_TYPE' | 'MOMENT' | 'AVOID_ONE';

/**
 * CTA 액션 타입
 */
export type CTAAction =
  | 'CONNECT_CALENDAR'
  | 'OPEN_CAPTURE'
  | 'OPEN_SETTINGS'
  | 'OPEN_FOCUS'
  | 'DISMISS';

/**
 * 스마트 인사이트 데이터 모델
 */
export interface Insight {
  /** 고유 ID */
  id: string;

  /** 인사이트 타입 */
  type: InsightType;

  /** 생성 시점의 연동 상태 */
  state: IntegrationState;

  /** 제목 (22-36자) */
  title: string;

  /** 이유 설명 (28-44자) */
  reason: string;

  /** 확신도 */
  confidence: ConfidenceLevel;

  /** 생성 타임스탬프 */
  createdAt: number;

  /** Day Type (DAY_TYPE 인사이트의 경우) */
  dayType?: DayType;

  /** CTA 버튼 */
  cta?: {
    label: string;
    action: CTAAction;
  };
}

// ============================================================
// Insight Context
// ============================================================

/**
 * 인사이트 생성을 위한 컨텍스트
 */
export interface InsightContext {
  /** 현재 연동 상태 */
  integrationState: IntegrationState;

  /** 오늘 캘린더 이벤트 (CALENDAR_ONLY/PLUS) */
  calendarEvents?: CalendarEvent[];

  /** 현재 시간 (0-23) */
  currentHour: number;

  /** 요일 (0=일, 6=토) */
  dayOfWeek: number;

  /** 오늘 첫 방문 여부 */
  isFirstOpenToday: boolean;

  /** 마지막 세션으로부터 경과 시간 (시간 단위) */
  lastSessionGapHours: number | null;

  /** 오늘 방문 횟수 */
  todayVisitCount: number;

  /** 계산된 Day Metrics (캘린더 있을 때) */
  dayMetrics?: DayMetrics;
}

// ============================================================
// Content Templates
// ============================================================

/**
 * DAY_TYPE 카피 템플릿
 */
export const DAY_TYPE_COPY: Record<DayType, {
  titles: string[];
  reasons: string[];
}> = {
  fragmented: {
    titles: [
      "오늘은 '쪼개진 하루'",
      "오늘은 정신없이 바쁜 하루",
      "오늘은 집중이 자꾸 끊길 수 있어요"
    ],
    reasons: [
      "짧은 조각이 많아서 집중이 끊기기 쉬워요",
      "30분짜리 일정이 여러 개라 전환 비용이 커요",
      "이런 날은 '완료'보다 '진행'이 목표예요"
    ]
  },
  'heavy-energy': {
    titles: [
      "오늘은 '에너지 소모형'",
      "오늘은 '사람 많은 날'이네요",
      "오늘은 에너지가 많이 드는 날"
    ],
    reasons: [
      "사람·전환이 많으면 체력이 먼저 닳아요",
      "미팅 시간이 길어서 회복 시간이 필요해요",
      "저녁은 비워두는 게 좋아요"
    ]
  },
  'open-focus': {
    titles: [
      "오늘은 '집중이 가능한 날'",
      "오늘 큰 빈 시간이 보여요",
      "오늘은 깊이 집중하기 좋은 날"
    ],
    reasons: [
      "비어있는 큰 블록이 한 번은 나올 것 같아요",
      "2시간 이상 비어있는 블록이 있어서요",
      "이 시간대에 중요한 걸 넣어볼까요?"
    ]
  },
  recovery: {
    titles: [
      "오늘은 '회복이 필요한 날'일 수도",
      "오늘은 속도를 낮추는 편이 좋아요",
      "오늘은 천천히 시작해도 되는 날"
    ],
    reasons: [
      "무리하면 내일 더 크게 무너져요",
      "저녁 늦게까지 일정이 이어져요",
      "오늘은 '지키는 날'로 가요"
    ]
  }
};

/**
 * MOMENT 카피 템플릿
 */
export const MOMENT_COPY: Record<string, {
  titles: string[];
  reasons: string[];
}> = {
  morning_first: {
    titles: [
      "지금 하루를 준비하려고 오셨네요",
      "오늘은 '정리'가 먼저인 날일 수도"
    ],
    reasons: [
      "아침에 정리하면 하루가 달라요",
      "해야 할 게 많을수록, 순서가 먼저 필요하거든요"
    ]
  },
  afternoon_first: {
    titles: [
      "지금 머릿속이 꽉 찬 느낌이죠",
      "지금은 '시작이 어려운 구간' 같아요"
    ],
    reasons: [
      "정리하려고 들어온 타이밍이 딱 그래요",
      "작은 한 단추만 끼우면 굴러갈 것 같아요"
    ]
  },
  evening: {
    titles: [
      "하루 마무리 시간이에요",
      "지금 이 시간엔 무리하면 쉽게 지쳐요"
    ],
    reasons: [
      "오늘 한 일을 정리해볼까요?",
      "그래서 '큰 결심'보다 '작은 실행'이 좋아요"
    ]
  },
  quick_reopen: {
    titles: [
      "뭔가 확인하려고 다시 오셨군요",
      "지금은 '결정 피로'가 있는 것 같아요"
    ],
    reasons: [
      "필요한 게 있으면 빨리 도와드릴게요",
      "선택지가 많을수록, 아무것도 못 하게 돼요"
    ]
  },
  long_gap: {
    titles: [
      "새로운 일이 생겼나요?",
      "지금은 '과하게 쌓인 상태' 같아요"
    ],
    reasons: [
      "오랜만에 오셨네요. 무슨 일인지 궁금해요",
      "줄이기보다, 먼저 '나열'부터 하면 가벼워져요"
    ]
  }
};

/**
 * AVOID_ONE 카피 템플릿
 */
export const AVOID_ONE_COPY: Record<DayType, {
  titles: string[];
  reasons: string[];
}> = {
  fragmented: {
    titles: [
      "오늘은 멀티태스킹을 늘리지 않는 게 좋아요",
      "오늘은 새로운 약속 잡기를 피해요"
    ],
    reasons: [
      "이미 전환이 많아서 뇌가 더 피곤해져요",
      "대신 '하나씩'으로 승부 보는 날"
    ]
  },
  'heavy-energy': {
    titles: [
      "오늘은 저녁에 큰 결정을 피하는 게 좋아요",
      "오늘은 '새 프로젝트 시작'을 누르지 말기"
    ],
    reasons: [
      "에너지 소모가 큰 일정이 오후에 몰려 있어요",
      "시작은 에너지가 많이 드는 작업이에요"
    ]
  },
  'open-focus': {
    titles: [
      "오늘은 잡일로 블록을 쪼개지 말아요",
      "오늘은 SNS 확인을 최소화해요"
    ],
    reasons: [
      "큰 집중 블록이 보이는 날이거든요",
      "이런 날 한 번 잘 쓰면 주간이 달라져요"
    ]
  },
  recovery: {
    titles: [
      "오늘은 '추가 일정 수락'을 최대한 줄여요",
      "오늘은 무리한 계획을 세우지 말아요"
    ],
    reasons: [
      "이미 회복 여지가 작아서요",
      "오늘은 '거절'이 실력일 수도"
    ]
  }
};
