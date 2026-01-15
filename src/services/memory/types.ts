/**
 * Memory Framing 타입 정의
 * 알프레도와 함께한 기억을 어떻게 프레이밍하는지
 */

/**
 * 기억 타입
 */
export type MemoryType =
  | 'first_meeting'      // 첫 만남
  | 'milestone'          // 마일스톤 달성
  | 'breakthrough'       // 돌파 순간 (큰 성취)
  | 'pattern_discovered' // 패턴 발견
  | 'tough_day_handled'  // 힘든 날 함께 버팀
  | 'streak_achievement' // 연속 사용 달성
  | 'preference_learned' // 선호도 학습
  | 'focus_session'      // 집중 세션
  | 'task_completion'    // 태스크 완료
  | 'weekly_review'      // 주간 리뷰
  | 'monthly_review';    // 월간 리뷰

/**
 * 기억 감정 톤
 */
export type MemoryTone =
  | 'celebratory'   // 축하
  | 'reflective'    // 회고적
  | 'encouraging'   // 격려
  | 'grateful'      // 감사
  | 'supportive';   // 지지

/**
 * 기억 중요도
 */
export type MemoryImportance = 'highlight' | 'notable' | 'routine';

/**
 * 단일 기억
 */
export interface Memory {
  id: string;
  type: MemoryType;
  title: string;
  description: string;
  tone: MemoryTone;
  importance: MemoryImportance;
  createdAt: string;

  // 연관 데이터
  relatedData?: {
    taskId?: string;
    milestoneId?: string;
    streak?: number;
    stats?: Record<string, number>;
  };

  // 메타데이터
  metadata?: {
    dayNumber?: number;  // 함께한 N번째 날
    contextMessage?: string;  // 상황 설명
  };
}

/**
 * 기억 컬렉션 (주간/월간)
 */
export interface MemoryCollection {
  id: string;
  period: 'weekly' | 'monthly';
  title: string;
  startDate: string;
  endDate: string;

  // 포함된 기억들
  memories: Memory[];

  // 요약 메시지
  summary: {
    headline: string;      // "바쁜 한 주였지만 잘 해냈어요"
    highlights: string[];  // 주요 하이라이트
    stats: CollectionStats;
    reflection?: string;   // 회고 메시지
  };

  // 상태
  viewed: boolean;
  createdAt: string;
}

/**
 * 컬렉션 통계
 */
export interface CollectionStats {
  daysActive: number;
  tasksCompleted: number;
  focusMinutes: number;
  suggestionsAccepted: number;
  milestonesAchieved: number;
}

/**
 * 기억 프레임 (특정 기억을 어떻게 표현할지)
 */
export interface MemoryFrame {
  template: string;        // 템플릿 문자열
  variables: string[];     // 대체할 변수들
  tone: MemoryTone;
  emoji?: string;
}

/**
 * 기억 프레임 템플릿들
 */
export const MEMORY_FRAMES: Record<MemoryType, MemoryFrame[]> = {
  first_meeting: [
    {
      template: '오늘 처음 만났어요',
      variables: [],
      tone: 'celebratory',
      emoji: '👋'
    }
  ],

  milestone: [
    {
      template: '{{milestone}}을(를) 달성했어요!',
      variables: ['milestone'],
      tone: 'celebratory',
      emoji: '🎉'
    },
    {
      template: '벌써 {{milestone}}이에요',
      variables: ['milestone'],
      tone: 'reflective',
      emoji: '✨'
    }
  ],

  breakthrough: [
    {
      template: '큰 일을 해냈어요: {{task}}',
      variables: ['task'],
      tone: 'celebratory',
      emoji: '🚀'
    }
  ],

  pattern_discovered: [
    {
      template: '{{pattern}} 패턴을 발견했어요',
      variables: ['pattern'],
      tone: 'reflective',
      emoji: '🔍'
    }
  ],

  tough_day_handled: [
    {
      template: '바쁜 하루였지만 함께 해냈어요',
      variables: [],
      tone: 'supportive',
      emoji: '💪'
    },
    {
      template: '힘든 날이었지만 잘 버텼어요',
      variables: [],
      tone: 'encouraging',
      emoji: '🌟'
    }
  ],

  streak_achievement: [
    {
      template: '{{days}}일 연속으로 함께했어요',
      variables: ['days'],
      tone: 'celebratory',
      emoji: '🔥'
    }
  ],

  preference_learned: [
    {
      template: '{{preference}}을(를) 좋아하시는 것 같아요',
      variables: ['preference'],
      tone: 'reflective',
      emoji: '📝'
    }
  ],

  focus_session: [
    {
      template: '{{minutes}}분 동안 집중했어요',
      variables: ['minutes'],
      tone: 'encouraging',
      emoji: '🎯'
    }
  ],

  task_completion: [
    {
      template: '{{task}}을(를) 완료했어요',
      variables: ['task'],
      tone: 'celebratory',
      emoji: '✅'
    }
  ],

  weekly_review: [
    {
      template: '이번 주 {{tasks}}개의 일을 함께 했어요',
      variables: ['tasks'],
      tone: 'reflective',
      emoji: '📊'
    }
  ],

  monthly_review: [
    {
      template: '한 달 동안 {{days}}일을 함께했어요',
      variables: ['days'],
      tone: 'grateful',
      emoji: '📅'
    }
  ]
};

/**
 * 하이라이트 메시지 템플릿
 */
export const HIGHLIGHT_MESSAGES: Record<string, string[]> = {
  productive_week: [
    '이번 주 정말 많이 해냈어요',
    '생산적인 한 주였어요',
    '열심히 달려왔네요'
  ],
  streak_building: [
    '꾸준함이 힘이에요',
    '연속 기록이 쌓이고 있어요',
    '함께하는 날이 늘고 있어요'
  ],
  focus_master: [
    '집중력이 대단해요',
    '몰입의 시간이 쌓이고 있어요',
    '딥워크 마스터시네요'
  ],
  milestone_achieved: [
    '새로운 이정표를 찍었어요',
    '또 하나의 마일스톤!',
    '성장이 눈에 보여요'
  ],
  tough_but_made_it: [
    '힘들었지만 잘 버텼어요',
    '어려운 시기를 함께 넘겼어요',
    '포기하지 않아서 다행이에요'
  ]
};

/**
 * 회고 프롬프트
 */
export const REFLECTION_PROMPTS = [
  '이번 주 가장 뿌듯했던 순간은?',
  '다음 주에 꼭 하고 싶은 일이 있나요?',
  '요즘 가장 신경 쓰이는 일은 무엇인가요?',
  '지금 나에게 필요한 건 무엇일까요?'
];
