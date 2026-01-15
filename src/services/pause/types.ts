/**
 * Exit & Pause UX 타입 정의
 * 떠나도 괜찮아요 - 사용자가 쉬거나 떠날 때의 경험
 */

/**
 * 일시정지 사유
 */
export type PauseReason =
  | 'vacation'        // 휴가
  | 'busy_period'     // 바쁜 시기
  | 'mental_break'    // 정신적 휴식
  | 'trying_other'    // 다른 도구 시도
  | 'not_needed'      // 당분간 필요 없음
  | 'other';          // 기타

/**
 * 일시정지 기간
 */
export type PauseDuration =
  | 'few_days'        // 며칠
  | 'week'            // 일주일
  | 'two_weeks'       // 2주
  | 'month'           // 한 달
  | 'indefinite';     // 기약 없이

/**
 * 일시정지 상태
 */
export interface PauseState {
  isPaused: boolean;
  pausedAt?: string;
  reason?: PauseReason;
  duration?: PauseDuration;
  expectedReturnDate?: string;
  personalMessage?: string;  // 사용자가 남긴 메모
}

/**
 * 복귀 환영 메시지
 */
export interface WelcomeBackMessage {
  headline: string;
  subtext: string;
  stats?: {
    daysPaused: number;
    pendingTasks?: number;
    missedMilestones?: number;
  };
  tone: 'warm' | 'casual' | 'excited';
}

/**
 * 떠남 타입
 */
export type ExitType =
  | 'pause'           // 일시정지 (돌아올 예정)
  | 'break'           // 휴식 (기간 미정)
  | 'goodbye';        // 작별 (데이터 삭제 가능)

/**
 * 떠남 경험 설정
 */
export interface ExitExperience {
  type: ExitType;
  reason?: PauseReason;
  duration?: PauseDuration;
  feedback?: string;
  keepData: boolean;
  wantReminder: boolean;
  reminderDate?: string;
}

/**
 * 일시정지 사유 라벨
 */
export const PAUSE_REASON_LABELS: Record<PauseReason, string> = {
  vacation: '휴가를 떠나요',
  busy_period: '요즘 너무 바빠요',
  mental_break: '잠시 쉬고 싶어요',
  trying_other: '다른 방법을 써볼게요',
  not_needed: '당분간 필요 없을 것 같아요',
  other: '그냥요'
};

/**
 * 일시정지 기간 라벨
 */
export const PAUSE_DURATION_LABELS: Record<PauseDuration, string> = {
  few_days: '며칠만',
  week: '일주일 정도',
  two_weeks: '2주 정도',
  month: '한 달 정도',
  indefinite: '잘 모르겠어요'
};

/**
 * 작별 인사 메시지
 */
export const GOODBYE_MESSAGES: Record<PauseReason, string[]> = {
  vacation: [
    '좋은 휴가 보내세요! 돌아오면 기다리고 있을게요.',
    '푹 쉬고 오세요. 여기서 기다릴게요.',
    '즐거운 시간 보내세요! 🏖️'
  ],
  busy_period: [
    '바쁜 시기 잘 보내세요. 필요할 때 언제든 불러주세요.',
    '화이팅! 여유 생기면 다시 만나요.',
    '힘내세요. 언제든 돌아오면 반갑게 맞이할게요.'
  ],
  mental_break: [
    '쉬는 것도 중요해요. 천천히 쉬세요.',
    '마음 편히 쉬세요. 준비되면 다시 만나요.',
    '휴식도 생산성의 일부예요. 잘 쉬세요.'
  ],
  trying_other: [
    '좋은 경험 하고 오세요! 언제든 환영이에요.',
    '다른 방법도 좋아요. 필요하면 돌아오세요.',
    '새로운 시도 응원해요! 🙌'
  ],
  not_needed: [
    '알겠어요. 필요할 때 언제든 불러주세요.',
    '네, 여기 있을게요. 언제든 편하게 오세요.',
    '그럼 그때까지! 잘 지내세요.'
  ],
  other: [
    '알겠어요. 나중에 또 만나요!',
    '좋은 시간 보내세요. 언제든 환영이에요.',
    '그럼 다음에 봐요! 👋'
  ]
};

/**
 * 복귀 환영 메시지 템플릿
 */
export const WELCOME_BACK_TEMPLATES: Record<string, WelcomeBackMessage[]> = {
  short: [  // 1-3일
    {
      headline: '돌아왔네요!',
      subtext: '잘 쉬고 왔어요?',
      tone: 'casual'
    },
    {
      headline: '다시 만나서 반가워요',
      subtext: '바로 시작할까요?',
      tone: 'warm'
    }
  ],
  medium: [  // 4-14일
    {
      headline: '오랜만이에요!',
      subtext: '그동안 잘 지냈어요?',
      tone: 'warm'
    },
    {
      headline: '다시 와줬네요',
      subtext: '기다렸어요 ☺️',
      tone: 'warm'
    }
  ],
  long: [  // 15일 이상
    {
      headline: '정말 오랜만이에요!',
      subtext: '다시 만나서 너무 반가워요',
      tone: 'excited'
    },
    {
      headline: '돌아와줘서 고마워요',
      subtext: '여전히 여기 있었어요',
      tone: 'warm'
    }
  ]
};

/**
 * 알림 설정
 */
export interface PauseReminder {
  id: string;
  scheduledFor: string;
  message: string;
  sent: boolean;
}
