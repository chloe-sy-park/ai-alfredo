/**
 * Growth Archive 타입 정의
 * 알프레도가 배워온 것들을 기록
 */

/**
 * 성장 카테고리
 */
export type GrowthCategory =
  | 'preference'      // 선호도 학습
  | 'pattern'         // 패턴 발견
  | 'accuracy'        // 정확도 향상
  | 'interaction'     // 상호작용 개선
  | 'understanding';  // 이해도 증가

/**
 * 성장 항목
 */
export interface GrowthItem {
  id: string;
  category: GrowthCategory;
  title: string;
  description: string;
  learnedAt: string;
  confidence: number;  // 0-1, 얼마나 확신하는지
  source: GrowthSource;
  metadata?: Record<string, unknown>;
}

/**
 * 학습 출처
 */
export type GrowthSource =
  | 'explicit'        // 사용자가 직접 알려줌
  | 'inferred'        // 행동에서 추론
  | 'feedback'        // 피드백에서 학습
  | 'pattern';        // 패턴 분석

/**
 * 선호도 타입
 */
export interface Preference {
  id: string;
  key: string;
  value: string | number | boolean;
  learnedAt: string;
  confidence: number;
  lastConfirmedAt?: string;
}

/**
 * 발견된 패턴
 */
export interface DiscoveredPattern {
  id: string;
  type: PatternType;
  description: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  confidence: number;
  examples?: string[];
}

/**
 * 패턴 타입
 */
export type PatternType =
  | 'time_preference'     // 시간대 선호
  | 'task_approach'       // 태스크 접근 방식
  | 'focus_duration'      // 집중 시간 패턴
  | 'break_pattern'       // 휴식 패턴
  | 'priority_style'      // 우선순위 스타일
  | 'communication';      // 커뮤니케이션 선호

/**
 * 성장 요약
 */
export interface GrowthSummary {
  totalLearnings: number;
  byCategory: Record<GrowthCategory, number>;
  recentLearnings: GrowthItem[];
  topPatterns: DiscoveredPattern[];
  averageConfidence: number;
}

/**
 * 성장 타임라인 항목
 */
export interface GrowthTimelineItem {
  date: string;
  items: GrowthItem[];
  highlight?: string;
}

/**
 * 카테고리 라벨
 */
export const GROWTH_CATEGORY_LABELS: Record<GrowthCategory, string> = {
  preference: '선호도',
  pattern: '패턴',
  accuracy: '정확도',
  interaction: '상호작용',
  understanding: '이해도'
};

/**
 * 카테고리 아이콘
 */
export const GROWTH_CATEGORY_ICONS: Record<GrowthCategory, string> = {
  preference: '❤️',
  pattern: '🔄',
  accuracy: '🎯',
  interaction: '💬',
  understanding: '💡'
};

/**
 * 패턴 타입 라벨
 */
export const PATTERN_TYPE_LABELS: Record<PatternType, string> = {
  time_preference: '시간 선호',
  task_approach: '일 처리 방식',
  focus_duration: '집중 패턴',
  break_pattern: '휴식 패턴',
  priority_style: '우선순위 스타일',
  communication: '소통 방식'
};

/**
 * 기본 패턴 템플릿
 */
export const PATTERN_TEMPLATES: Record<PatternType, string[]> = {
  time_preference: [
    '오전에 집중 업무를 선호해요',
    '오후에 미팅을 몰아서 해요',
    '저녁에는 가벼운 일을 해요'
  ],
  task_approach: [
    '큰 일을 작게 나눠서 해요',
    '비슷한 일을 묶어서 처리해요',
    '급한 일부터 먼저 해요'
  ],
  focus_duration: [
    '25분 단위로 집중해요',
    '90분 이상 깊은 집중이 가능해요',
    '짧은 집중을 여러 번 해요'
  ],
  break_pattern: [
    '1시간마다 짧은 휴식을 취해요',
    '점심 후에 산책을 해요',
    '미팅 사이에 버퍼를 둬요'
  ],
  priority_style: [
    '마감이 급한 일을 먼저 해요',
    '중요도가 높은 일을 먼저 해요',
    '빨리 끝나는 일부터 치워요'
  ],
  communication: [
    '간결한 메시지를 선호해요',
    '자세한 설명을 좋아해요',
    '이모지를 자주 사용해요'
  ]
};

/**
 * 성장 메시지 템플릿
 */
export const GROWTH_MESSAGES = {
  newLearning: [
    '새로운 걸 알게 됐어요!',
    '이런 것도 배웠어요',
    '점점 더 잘 알아가고 있어요'
  ],
  patternFound: [
    '이런 패턴을 발견했어요',
    '이렇게 하는 걸 좋아하시는 것 같아요',
    '자주 이렇게 하시네요'
  ],
  confidenceUp: [
    '더 확신이 생겼어요',
    '맞는 것 같아요!',
    '이제 더 잘 알겠어요'
  ]
};
