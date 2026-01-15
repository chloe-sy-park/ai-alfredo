/**
 * 감정 감지 키워드 분류
 * 사용자 메시지에서 감정 상태를 파악하기 위한 키워드 정의
 */

export type SafetyLevel = 'normal' | 'watch' | 'care' | 'crisis';

export interface EmotionKeywordSet {
  keywords: string[];
  weight: number; // 가중치 (높을수록 해당 레벨 확정에 큰 영향)
}

export interface EmotionKeywords {
  [category: string]: EmotionKeywordSet;
}

/**
 * Level 1: Watch (주의 관찰)
 * 일상적인 피로, 스트레스 표현
 */
export const WATCH_KEYWORDS: EmotionKeywords = {
  fatigue: {
    keywords: [
      '피곤해', '피곤하다', '지쳤어', '지쳤다', '힘들어', '힘들다',
      '녹초', '기운 없', '에너지 없', '무기력', '늘어지',
      '쉬고 싶', '잠 자고 싶'
    ],
    weight: 1
  },
  stress: {
    keywords: [
      '스트레스', '머리 아파', '머리가 아파', '정신없', '정신 없',
      '미치겠', '답답해', '답답하다', '복잡해', '복잡하다',
      '짜증나', '짜증 나', '열받', '빡치'
    ],
    weight: 1
  },
  lowMotivation: {
    keywords: [
      '하기 싫', '하기싫', '귀찮', '의욕 없', '의욕없',
      '재미없', '재미 없', '지루해', '지루하다',
      '의미 없', '의미없', '별로야'
    ],
    weight: 1
  },
  overwhelmed: {
    keywords: [
      '너무 많아', '할 게 많', '할게 많', '바빠 죽겠',
      '시간 없', '시간없', '언제 다 해', '못 하겠'
    ],
    weight: 1
  }
};

/**
 * Level 2: Care (적극 케어)
 * 번아웃, 지속적 부정, 신체 증상
 */
export const CARE_KEYWORDS: EmotionKeywords = {
  burnout: {
    keywords: [
      '다 그만두고 싶', '아무것도 하기 싫', '포기하고 싶',
      '때려치고 싶', '도망가고 싶', '다 놓고 싶',
      '그만하고 싶', '못 하겠어', '더 이상 못해',
      '한계야', '한계다', '번아웃'
    ],
    weight: 2
  },
  sleepIssue: {
    keywords: [
      '잠을 못 자', '잠을 못자', '밤새', '불면',
      '악몽', '잠이 안 와', '잠이 안와', '뒤척',
      '새벽까지', '자도 자도 피곤'
    ],
    weight: 2
  },
  eatingIssue: {
    keywords: [
      '밥을 못 먹', '밥을 못먹', '밥 먹기 싫',
      '입맛이 없', '입맛없', '먹기 싫', '먹고 싶지 않',
      '굶었', '안 먹었', '식욕 없'
    ],
    weight: 2
  },
  isolation: {
    keywords: [
      '아무도 없', '혼자야', '외로워', '외롭다',
      '이해 못 해', '이해못해', '아무도 몰라',
      '나 혼자', '혼자인 것 같'
    ],
    weight: 2
  },
  persistentNegative: {
    keywords: [
      '매일 힘들', '계속 힘들', '항상 힘들',
      '나아지지 않', '나아질 것 같지 않',
      '뭘 해도', '어떻게 해도'
    ],
    weight: 2
  }
};

/**
 * Level 3: Crisis (위기 대응)
 * 즉각적인 개입이 필요한 표현
 * ⚠️ 최우선 감지 - 다른 레벨보다 먼저 체크
 */
export const CRISIS_KEYWORDS: EmotionKeywords = {
  selfHarm: {
    keywords: [
      '죽고 싶', '죽고싶', '사라지고 싶', '사라지고싶',
      '없어지고 싶', '없어지고싶', '끝내고 싶', '끝내고싶',
      '자살', '스스로 목숨', '생을 마감'
    ],
    weight: 10 // 최고 가중치
  },
  harmIntent: {
    keywords: [
      '다치고 싶', '다치고싶', '아프면 나을까',
      '상처', '피를 보고 싶', '다쳤으면'
    ],
    weight: 10
  },
  hopelessness: {
    keywords: [
      '희망이 없', '희망없', '미래가 없', '미래없',
      '의미가 없', '살 이유', '살아야 하는 이유',
      '왜 사는지', '살고 싶지 않'
    ],
    weight: 10
  },
  goodbye: {
    keywords: [
      '마지막으로', '안녕', '고마웠어', '미안해 다들',
      '부탁 하나만', '유서', '남기고 싶은 말'
    ],
    weight: 8 // 맥락 의존적이므로 약간 낮게
  }
};

/**
 * 모든 레벨의 키워드 통합
 */
export const ALL_KEYWORDS = {
  watch: WATCH_KEYWORDS,
  care: CARE_KEYWORDS,
  crisis: CRISIS_KEYWORDS
};

/**
 * 긍정적 완화 표현 (위험 레벨 낮춤)
 * 이 표현이 함께 있으면 심각도를 낮출 수 있음
 */
export const MITIGATING_KEYWORDS = [
  '농담', '드라마', '영화', '책에서', '친구가', '뉴스에서',
  '예전에', '가끔', '조금', '살짝', '그냥 말해봤어',
  '괜찮아졌', '나아졌', '좋아졌'
];

/**
 * 전문가 도움 요청 키워드
 * 사용자가 이미 도움을 찾고 있는 신호
 */
export const HELP_SEEKING_KEYWORDS = [
  '상담', '병원', '치료', '약', '전문가',
  '정신과', '심리', '도움', '어디로 가야'
];
