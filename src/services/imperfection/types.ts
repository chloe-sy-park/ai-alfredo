/**
 * Human Imperfection 타입 정의
 * 인간의 불완전함을 허용하고 수용하는 UX
 */

/**
 * 불완전함 타입
 */
export type ImperfectionType =
  | 'missed_task'       // 할 일 놓침
  | 'broken_streak'     // 연속 기록 끊김
  | 'changed_mind'      // 마음 바꿈
  | 'procrastinated'    // 미룸
  | 'overcommitted'     // 너무 많이 계획
  | 'forgot'            // 잊어버림
  | 'skipped'           // 건너뜀
  | 'late';             // 늦음

/**
 * 위로 응답 톤
 */
export type ComfortTone =
  | 'understanding'     // 이해
  | 'normalizing'       // 정상화 (누구나 그래)
  | 'encouraging'       // 격려
  | 'gentle'            // 부드러움
  | 'practical';        // 실용적 (다음에 어떻게)

/**
 * 불완전함 상황
 */
export interface ImperfectionMoment {
  id: string;
  type: ImperfectionType;
  context: string;
  timestamp: string;
  response?: ComfortResponse;
  userFeeling?: 'better' | 'same' | 'worse';
}

/**
 * 위로 응답
 */
export interface ComfortResponse {
  message: string;
  tone: ComfortTone;
  followUp?: string;
  actionSuggestion?: string;
}

/**
 * 유연성 설정
 */
export interface FlexibilitySettings {
  allowTaskPostpone: boolean;      // 할 일 미루기 허용
  allowStreakBreak: boolean;       // 연속 기록 끊김 허용
  showGentleReminders: boolean;    // 부드러운 리마인더
  hideStrictMetrics: boolean;      // 엄격한 지표 숨기기
  celebrateSmallWins: boolean;     // 작은 성과도 축하
}

/**
 * 그레이스 기간 (유예 기간)
 */
export interface GracePeriod {
  taskId: string;
  originalDeadline: string;
  extendedDeadline: string;
  reason?: string;
  granted: boolean;
}

/**
 * 불완전함 타입 라벨
 */
export const IMPERFECTION_LABELS: Record<ImperfectionType, string> = {
  missed_task: '할 일을 놓쳤어요',
  broken_streak: '연속 기록이 끊겼어요',
  changed_mind: '계획을 바꿨어요',
  procrastinated: '미뤘어요',
  overcommitted: '너무 많이 계획했어요',
  forgot: '잊어버렸어요',
  skipped: '건너뛰었어요',
  late: '늦었어요'
};

/**
 * 위로 메시지 템플릿
 */
export const COMFORT_MESSAGES: Record<ImperfectionType, ComfortResponse[]> = {
  missed_task: [
    {
      message: '괜찮아요, 다음에 하면 돼요',
      tone: 'understanding',
      followUp: '중요한 건 포기하지 않는 거예요'
    },
    {
      message: '누구나 그럴 수 있어요',
      tone: 'normalizing',
      actionSuggestion: '내일로 옮길까요?'
    },
    {
      message: '오늘 하루도 수고했어요',
      tone: 'gentle'
    }
  ],

  broken_streak: [
    {
      message: '연속 기록보다 꾸준함이 중요해요',
      tone: 'normalizing',
      followUp: '다시 시작하면 돼요'
    },
    {
      message: '쉬어가는 것도 필요해요',
      tone: 'understanding'
    },
    {
      message: '숫자보다 경험이 남아요',
      tone: 'gentle'
    }
  ],

  changed_mind: [
    {
      message: '계획은 바뀔 수 있어요',
      tone: 'understanding',
      followUp: '그게 더 현실적인 판단일 수도 있어요'
    },
    {
      message: '유연하게 대처하는 거예요',
      tone: 'encouraging'
    }
  ],

  procrastinated: [
    {
      message: '때로는 미루는 것도 괜찮아요',
      tone: 'normalizing'
    },
    {
      message: '완벽한 타이밍은 없어요',
      tone: 'practical',
      actionSuggestion: '10분만 시작해볼까요?'
    },
    {
      message: '스스로를 너무 몰아붙이지 마세요',
      tone: 'gentle'
    }
  ],

  overcommitted: [
    {
      message: '욕심이 앞선 거예요, 괜찮아요',
      tone: 'understanding'
    },
    {
      message: '줄이는 것도 용기예요',
      tone: 'encouraging',
      actionSuggestion: '덜 중요한 것 몇 개 뺄까요?'
    }
  ],

  forgot: [
    {
      message: '사람이라 잊을 수 있어요',
      tone: 'normalizing'
    },
    {
      message: '다음엔 제가 미리 알려드릴게요',
      tone: 'practical'
    }
  ],

  skipped: [
    {
      message: '건너뛰어도 괜찮아요',
      tone: 'understanding',
      followUp: '완벽하지 않아도 돼요'
    },
    {
      message: '그날 컨디션이 안 좋았을 수도 있어요',
      tone: 'gentle'
    }
  ],

  late: [
    {
      message: '늦었지만 해냈잖아요',
      tone: 'encouraging'
    },
    {
      message: '완료한 게 중요해요',
      tone: 'normalizing'
    }
  ]
};

/**
 * 격려 메시지
 */
export const ENCOURAGEMENT_MESSAGES = [
  '작은 진전도 진전이에요',
  '완벽하지 않아도 괜찮아요',
  '오늘 할 수 있는 만큼만 해요',
  '스스로에게 너무 엄격하지 마세요',
  '쉬어가는 것도 생산성이에요',
  '그 자체로 충분해요',
  '비교하지 않아도 돼요'
];

/**
 * 부드러운 리마인더 템플릿
 */
export const GENTLE_REMINDERS = [
  '여유 있을 때 해도 돼요',
  '급하지 않으면 나중에 해도 괜찮아요',
  '컨디션 좋을 때 하세요',
  '부담 가지지 마세요',
  '할 수 있을 때 하면 돼요'
];

/**
 * 기본 유연성 설정
 */
export const DEFAULT_FLEXIBILITY_SETTINGS: FlexibilitySettings = {
  allowTaskPostpone: true,
  allowStreakBreak: true,
  showGentleReminders: true,
  hideStrictMetrics: false,
  celebrateSmallWins: true
};
