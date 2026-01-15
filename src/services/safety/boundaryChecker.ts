/**
 * 역할 경계 체크기
 * 알프레도가 응답해도 되는 영역인지 판단
 */

export type BoundaryType =
  | 'safe'           // 응답 가능
  | 'redirect'       // 전문가 안내 필요
  | 'decline'        // 정중히 거절
  | 'acknowledge';   // 인정만 하고 넘어감

export interface BoundaryCheckResult {
  type: BoundaryType;
  reason?: string;
  alternativeResponse?: string;
  redirectTo?: string;
}

/**
 * 알프레도가 응답하면 안 되는 주제 키워드
 */
const BOUNDARY_TOPICS = {
  // 의료 관련 - redirect
  medical: {
    keywords: [
      '약 먹어도', '약 처방', '증상이', '진단', '치료법',
      '수술', '병원 가야', '의사가', '처방전',
      '몸이 아파', '머리가 아파서', '배가 아파서'
    ],
    type: 'redirect' as BoundaryType,
    redirectTo: '의료 전문가',
    alternativeResponse:
      '건강 관련 문제는 제가 판단하기 어려워요. 전문 의료진과 상담해보시는 게 좋겠어요.'
  },

  // 법률 관련 - redirect
  legal: {
    keywords: [
      '소송', '고소', '변호사', '법적으로', '계약서',
      '합의금', '손해배상', '형사', '민사'
    ],
    type: 'redirect' as BoundaryType,
    redirectTo: '법률 전문가',
    alternativeResponse:
      '법률 문제는 제 전문 분야가 아니에요. 변호사나 법률 상담 서비스를 이용해보세요.'
  },

  // 재정/투자 관련 - redirect
  financial: {
    keywords: [
      '주식 사야', '투자해도', '코인', '부동산 투자',
      '대출 받아야', '금리', '수익률'
    ],
    type: 'redirect' as BoundaryType,
    redirectTo: '금융 전문가',
    alternativeResponse:
      '투자나 재정 결정은 전문가와 상담하시는 게 안전해요. 저는 일반적인 정보만 드릴 수 있어요.'
  },

  // 심리치료 관련 - redirect
  therapy: {
    keywords: [
      '트라우마', '학대', '상담 치료', 'PTSD',
      '공황장애', '우울증 치료', '불안장애'
    ],
    type: 'redirect' as BoundaryType,
    redirectTo: '정신건강 전문가',
    alternativeResponse:
      '이런 부분은 전문 심리상담사나 정신건강의학과 전문의의 도움이 필요해요. 전문가와 상담해보시는 걸 권해드려요.'
  },

  // 관계 판단 요청 - acknowledge
  relationshipJudgment: {
    keywords: [
      '헤어져야 할까', '이혼해야', '결혼해도 될까',
      '사귀어도 될까', '나쁜 사람인가'
    ],
    type: 'acknowledge' as BoundaryType,
    redirectTo: undefined as string | undefined,
    alternativeResponse:
      '그런 고민이 있으시군요. 중요한 결정이니까 가까운 사람들과도 이야기 나눠보시면 어떨까요? 저는 들어드릴 수 있어요.'
  },

  // 예측 불가능한 미래 - decline
  futurePrediction: {
    keywords: [
      '될까요', '성공할까요', '잘 될까요',
      '운세', '사주', '점 봐줘'
    ],
    type: 'decline' as BoundaryType,
    redirectTo: undefined as string | undefined,
    alternativeResponse:
      '미래를 예측하는 건 제가 할 수 없는 일이에요. 대신 지금 할 수 있는 것에 집중해볼까요?'
  }
};

/**
 * 메시지에서 경계 주제 체크
 */
export function checkBoundary(message: string): BoundaryCheckResult {
  const normalizedMessage = message.toLowerCase();

  for (const [, config] of Object.entries(BOUNDARY_TOPICS)) {
    for (const keyword of config.keywords) {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        return {
          type: config.type,
          reason: `경계 주제 감지: ${keyword}`,
          alternativeResponse: config.alternativeResponse,
          redirectTo: config.redirectTo
        };
      }
    }
  }

  return {
    type: 'safe'
  };
}

/**
 * 알프레도가 "못한다"고 말할 때의 표현
 */
export const CAPABILITY_BOUNDARIES = {
  cannotDo: [
    '이건 제가 도와드리기 어려운 부분이에요.',
    '이 부분은 제 전문 분야가 아니에요.',
    '솔직히 말씀드리면, 이건 제가 판단할 수 없어요.',
    '이런 결정은 제가 대신 해드릴 수 없어요.'
  ],
  alternative: [
    '대신 이건 어떨까요?',
    '제가 도와드릴 수 있는 부분은...',
    '이런 건 어떠세요?'
  ],
  redirect: [
    '전문가와 상담해보시는 게 좋겠어요.',
    '이 분야 전문가의 도움을 받아보세요.',
    '관련 전문 서비스를 이용해보시는 건 어떨까요?'
  ]
};

/**
 * 판단 실패 인정 표현
 */
export const ADMISSION_OF_UNCERTAINTY = {
  wrongInfo: [
    '아, 제가 잘못 알려드렸네요.',
    '죄송해요, 제가 실수했어요.',
    '앗, 그게 아니었군요!'
  ],
  unsure: [
    '정확하지 않을 수 있는데요...',
    '확실하진 않지만...',
    '제가 잘 모르는 부분이에요.'
  ],
  misunderstanding: [
    '제가 잘 이해하지 못한 것 같아요.',
    '다시 말씀해주실 수 있을까요?',
    '음, 좀 더 설명해주시면 도움이 될 것 같아요.'
  ]
};

/**
 * 경계 체크 결과에 따른 응답 생성
 */
export function buildBoundaryResponse(result: BoundaryCheckResult): string | null {
  if (result.type === 'safe') {
    return null; // 정상 응답 진행
  }

  return result.alternativeResponse || null;
}
