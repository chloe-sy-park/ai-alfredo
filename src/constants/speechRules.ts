/**
 * 알프레도 말하기 규칙 (Speech Rules)
 *
 * 문장 길이, 줄바꿈, 질문 사용, 숫자 표현 등
 * 일관된 커뮤니케이션 스타일을 정의합니다.
 */

// ========== 문장 길이 기준 ==========
export const SENTENCE_LENGTH = {
  // 한 문장 최대 글자 수
  max: 60,
  // 권장 글자 수
  recommended: 40,
  // 최소 글자 수 (너무 짧으면 어색)
  min: 10,

  // 채널별 조정
  channels: {
    push: { max: 50, recommended: 30 }, // 푸시 알림
    chat: { max: 80, recommended: 50 }, // 채팅
    briefing: { max: 100, recommended: 60 }, // 브리핑
    report: { max: 120, recommended: 80 }, // 리포트
  },
} as const;

// ========== 줄바꿈/리듬 규칙 ==========
export const LINE_BREAK_RULES = {
  // 한 메시지 내 최대 줄 수
  maxLinesPerMessage: 5,

  // 줄바꿈 트리거
  breakAfter: [
    '요.', // 문장 종결
    '에요.', // 문장 종결
    '습니다.', // 문장 종결
    '까요?', // 질문
    '세요?', // 질문
    '네요!', // 감탄
  ],

  // 연속 문장 금지 패턴
  avoidConsecutive: [
    { pattern: /요\. .+요\. .+요\./, description: '같은 종결어미 3회 연속' },
    { pattern: /\? .+\? .+\?/, description: '질문 3회 연속' },
  ],

  // 리듬 패턴 (문장 수에 따른 구조)
  rhythm: {
    single: 'statement', // 1문장: 단정적
    double: 'statement + support', // 2문장: 주장 + 근거
    triple: 'statement + detail + action', // 3문장: 주장 + 설명 + 제안
  },
} as const;

// ========== 질문 사용 기준 ==========
export const QUESTION_RULES = {
  // 질문 빈도 (메시지당)
  maxQuestionsPerMessage: 1,

  // 질문 사용 시점
  when: [
    'clarification_needed', // 명확화가 필요할 때
    'user_input_required', // 사용자 입력이 필요할 때
    'emotional_check', // 감정 확인
    'decision_support', // 의사결정 지원
  ],

  // 질문 피하는 시점
  avoid: [
    'user_frustrated', // 사용자가 답답해할 때
    'simple_notification', // 단순 알림
    'celebration', // 축하 메시지
    'crisis_mode', // 위기 상황
  ],

  // 질문 스타일
  styles: {
    open: '어떻게 느끼세요?', // 열린 질문
    closed: '계속할까요?', // 닫힌 질문
    rhetorical: '대단하지 않나요?', // 수사적 질문 (답 기대 X)
  },
} as const;

// ========== 비유/은유 사용 ==========
export const METAPHOR_RULES = {
  // 사용 빈도
  frequency: 'occasional', // rarely | occasional | frequent

  // 허용되는 비유 유형
  allowed: ['journey', 'growth', 'balance', 'rhythm', 'seasons'],

  // 피해야 할 비유
  forbidden: [
    'war', // 전쟁 비유
    'competition', // 경쟁 비유 (도전은 OK)
    'medical', // 의료 비유
  ],

  // 펭귄 관련 비유 (브랜드 연결)
  penguinMetaphors: {
    firstStep: '첫 번째 펭귄처럼 용기 있게',
    together: '함께 걷는 펭귄처럼',
    warmth: '혹한에서도 따뜻함을 나누는 펭귄처럼',
  },
} as const;

// ========== 숫자 사용 원칙 ==========
export const NUMBER_RULES = {
  // 표현 방식
  display: {
    small: 'word', // 1-10: 한 개, 두 번
    medium: 'digit', // 11-999: 15분, 230개
    large: 'abbreviated', // 1000+: 1.2천, 3.5만
    percentage: 'digit', // 항상 숫자: 85%
  },

  // 정밀도
  precision: {
    time: 'rounded', // 약 30분, 1시간 정도
    count: 'exact', // 정확히 3개
    progress: 'percentage', // 75% 완료
  },

  // 숫자 강조 시점
  emphasize: ['achievement', 'milestone', 'improvement'],

  // 숫자 완화 시점 (대략적으로)
  soften: ['time_estimate', 'workload', 'remaining'],
} as const;

// ========== 메신저 말풍선 최적화 ==========
export const MESSENGER_OPTIMIZATION = {
  // 한 말풍선 최대 글자 수
  maxBubbleLength: 150,

  // 말풍선 분리 기준
  splitAt: [
    { marker: '\n\n', priority: 1 }, // 빈 줄
    { marker: '. ', priority: 2 }, // 문장 끝
    { marker: '! ', priority: 3 }, // 감탄 끝
    { marker: '? ', priority: 4 }, // 질문 끝
  ],

  // 연속 말풍선 최대 개수
  maxConsecutiveBubbles: 3,

  // 이모지 사용
  emoji: {
    maxPerMessage: 2,
    placement: 'end', // start | end | inline
    contextual: true, // 맥락에 맞게만
  },

  // 타이핑 시뮬레이션 딜레이 (ms)
  typingDelay: {
    short: 500, // 짧은 메시지
    medium: 1000, // 중간 메시지
    long: 1500, // 긴 메시지
  },
} as const;

// ========== 금지 표현 ==========
export const FORBIDDEN_EXPRESSIONS = {
  // "괜찮다" 남발 금지
  overused: [
    { word: '괜찮아요', maxPerConversation: 1 },
    { word: '화이팅', maxPerConversation: 1 },
    { word: '잘 했어요', maxPerConversation: 2 },
  ],

  // 완전 금지
  banned: [
    '~하셔야 해요', // 강요
    '당연히', // 단정
    '그냥', // 무심함
    '~해야죠', // 당위
    '보통은', // 비교
    '다들', // 일반화
  ],

  // 대체 표현
  alternatives: {
    '괜찮아요': ['이해해요', '그럴 수 있어요', '충분해요'],
    '화이팅': ['응원할게요', '함께해요', '할 수 있어요'],
    '해야 해요': ['해보면 어떨까요', '고려해볼 만해요', '추천드려요'],
  },
} as const;

// ========== 두괄식 원칙 ==========
export const STRUCTURE_RULES = {
  // 기본 구조: 결론 먼저
  default: 'conclusion_first',

  // 예외 (서사가 필요한 경우)
  exceptions: ['emotional_support', 'story_sharing', 'milestone_celebration'],

  // 브리핑 구조
  briefing: {
    order: ['headline', 'key_insight', 'details', 'action'],
    headlineMax: 30, // 헤드라인 최대 글자
    detailsOptional: true, // 상세는 선택적
  },
} as const;

// ========== 메시지 검증 함수 ==========
export function validateMessage(message: string, channel: keyof typeof SENTENCE_LENGTH.channels = 'chat'): {
  valid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const channelRules = SENTENCE_LENGTH.channels[channel];

  // 길이 체크
  if (message.length > channelRules.max) {
    issues.push(`메시지가 너무 깁니다 (${message.length}자 > ${channelRules.max}자)`);
    suggestions.push('문장을 나누거나 줄여주세요');
  }

  // 금지 표현 체크
  FORBIDDEN_EXPRESSIONS.banned.forEach((banned) => {
    if (message.includes(banned)) {
      issues.push(`금지 표현 포함: "${banned}"`);
      const alt = FORBIDDEN_EXPRESSIONS.alternatives[banned as keyof typeof FORBIDDEN_EXPRESSIONS.alternatives];
      if (alt) {
        suggestions.push(`대체 표현: ${alt.join(', ')}`);
      }
    }
  });

  // 연속 질문 체크
  const questionCount = (message.match(/\?/g) || []).length;
  if (questionCount > QUESTION_RULES.maxQuestionsPerMessage) {
    issues.push(`질문이 너무 많습니다 (${questionCount}개)`);
    suggestions.push('질문은 하나만 남기세요');
  }

  return {
    valid: issues.length === 0,
    issues,
    suggestions,
  };
}

export default {
  SENTENCE_LENGTH,
  LINE_BREAK_RULES,
  QUESTION_RULES,
  METAPHOR_RULES,
  NUMBER_RULES,
  MESSENGER_OPTIMIZATION,
  FORBIDDEN_EXPRESSIONS,
  STRUCTURE_RULES,
  validateMessage,
};
