/**
 * 안전 대응 메시지 템플릿
 * 감지된 감정 레벨에 따른 알프레도의 응답 템플릿
 */

import { SafetyLevel } from './emotionKeywords';

export interface CrisisResource {
  name: string;
  number: string;
  available: string;
  description?: string;
}

export interface SafetyResponseTemplate {
  empathy: string[];
  suggestion?: string[];
  professionalHint?: string[];
  followUp?: string[];
}

/**
 * Level 1: Watch 응답 템플릿
 */
export const WATCH_RESPONSES: SafetyResponseTemplate = {
  empathy: [
    '오늘 많이 힘드셨나봐요.',
    '좀 지치셨구나...',
    '요즘 바쁘셨나봐요.',
    '피곤하셨겠어요.',
    '에너지가 좀 떨어지셨네요.'
  ],
  suggestion: [
    '잠깐 스트레칭 어때요?',
    '물 한 잔 마시고 오시는 건 어떨까요?',
    '5분만 눈 좀 쉬게 해주세요.',
    '창문 열고 바람 한 번 쐬는 것도 좋아요.',
    '잠깐 자리에서 일어나 걸어보는 건 어때요?'
  ],
  followUp: [
    '필요하시면 말씀해주세요.',
    '도움이 필요하면 언제든요.',
    '옆에 있을게요.'
  ]
};

/**
 * Level 2: Care 응답 템플릿
 */
export const CARE_RESPONSES: SafetyResponseTemplate = {
  empathy: [
    '요즘 많이 힘드신 것 같아서 걱정이 돼요.',
    '이렇게 말씀해주셔서 고마워요.',
    '혼자 감당하기 힘드셨을 것 같아요.',
    '많이 지치셨겠어요.',
    '마음이 많이 무거우셨겠네요.'
  ],
  suggestion: [
    '오늘은 무리하지 않으셔도 돼요.',
    '지금 당장 해야 할 일이 아니라면 내일로 미뤄도 괜찮아요.',
    '가장 중요한 것 하나만 해도 충분해요.',
    '잠깐 쉬어가는 것도 일이에요.'
  ],
  professionalHint: [
    '혹시 가까운 사람에게 이야기해보신 적 있으세요?',
    '전문가와 상담하는 것도 큰 도움이 될 수 있어요.',
    '힘들 땐 도움을 요청하는 것도 용기예요.',
    '이런 마음이 계속되면 전문 상담을 받아보시는 것도 방법이에요.'
  ],
  followUp: [
    '저도 여기 있을게요.',
    '언제든 말씀해주세요.',
    '작은 것이라도 도움이 되고 싶어요.'
  ]
};

/**
 * Level 3: Crisis 응답 템플릿 (위기 상황)
 */
export const CRISIS_RESPONSES = {
  immediate: [
    '지금 많이 힘드시군요. 말씀해주셔서 고마워요.',
    '지금 이 순간 정말 힘드셨겠어요.',
    '이렇게 솔직하게 말씀해주셔서 감사해요.'
  ],
  validation: [
    '그런 생각이 들 만큼 힘드셨던 거예요.',
    '지금 느끼시는 감정은 당연한 거예요.',
    '혼자서 이겨내려고 하지 않으셔도 돼요.'
  ],
  resources: {
    korea: [
      {
        name: '자살예방상담전화',
        number: '1393',
        available: '24시간',
        description: '자살 예방 전문 상담'
      },
      {
        name: '정신건강위기상담전화',
        number: '1577-0199',
        available: '24시간',
        description: '정신건강 위기 상담'
      },
      {
        name: '생명의전화',
        number: '1588-9191',
        available: '24시간',
        description: '생명존중 상담'
      },
      {
        name: '정신건강복지센터',
        number: '1577-0199',
        available: '평일 9-18시',
        description: '지역 정신건강 서비스 연결'
      }
    ] as CrisisResource[]
  },
  followUp: [
    '저도 여기 있을게요. 언제든 말씀해주세요.',
    '혼자가 아니에요.',
    '이야기 나눌 준비가 되면 언제든요.'
  ],
  doNotSay: [
    // 절대 사용하면 안 되는 표현들 (내부 참고용)
    '그런 생각 하지 마세요',
    '힘내세요',
    '다 잘 될 거예요',
    '그럴 수도 있죠',
    '별거 아니에요'
  ]
};

/**
 * 도움 요청자용 응답 (이미 전문가 도움을 찾고 있는 경우)
 */
export const HELP_SEEKING_RESPONSES = {
  encouragement: [
    '도움을 찾으시려는 것, 정말 용기 있는 선택이에요.',
    '전문가와 상담하려고 하시는 거군요. 좋은 결정이에요.',
    '도움을 요청하는 건 강함의 표시예요.'
  ],
  support: [
    '필요한 정보가 있으면 찾아볼게요.',
    '상담 센터 정보가 필요하시면 말씀해주세요.',
    '함께 찾아볼까요?'
  ]
};

/**
 * 레벨에 따른 응답 선택
 */
export function getResponseByLevel(level: SafetyLevel): SafetyResponseTemplate {
  switch (level) {
    case 'watch':
      return WATCH_RESPONSES;
    case 'care':
      return CARE_RESPONSES;
    default:
      return WATCH_RESPONSES;
  }
}

/**
 * 랜덤 응답 선택 헬퍼
 */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 위기 상황용 전체 메시지 생성
 */
export function buildCrisisResponse(): {
  message: string;
  resources: CrisisResource[];
} {
  const immediate = pickRandom(CRISIS_RESPONSES.immediate);
  const validation = pickRandom(CRISIS_RESPONSES.validation);
  const followUp = pickRandom(CRISIS_RESPONSES.followUp);

  const message = `${immediate}\n\n${validation}\n\n도움을 받을 수 있는 곳을 알려드릴게요.\n\n${followUp}`;

  return {
    message,
    resources: CRISIS_RESPONSES.resources.korea
  };
}

/**
 * Care 레벨 메시지 생성
 */
export function buildCareResponse(isHelpSeeking: boolean): string {
  const response = CARE_RESPONSES;
  const empathy = pickRandom(response.empathy);
  const suggestion = pickRandom(response.suggestion || []);
  const professionalHint = isHelpSeeking
    ? pickRandom(HELP_SEEKING_RESPONSES.encouragement)
    : pickRandom(response.professionalHint || []);
  const followUp = pickRandom(response.followUp || []);

  return `${empathy}\n\n${suggestion}\n\n${professionalHint}\n\n${followUp}`;
}

/**
 * Watch 레벨 메시지 생성
 */
export function buildWatchResponse(): string {
  const response = WATCH_RESPONSES;
  const empathy = pickRandom(response.empathy);
  const suggestion = pickRandom(response.suggestion || []);
  const followUp = pickRandom(response.followUp || []);

  return `${empathy} ${suggestion}\n\n${followUp}`;
}
