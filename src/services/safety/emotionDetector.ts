/**
 * 감정 상태 감지기
 * 사용자 메시지를 분석하여 안전 레벨을 판단
 */

import {
  SafetyLevel,
  EmotionKeywords,
  WATCH_KEYWORDS,
  CARE_KEYWORDS,
  CRISIS_KEYWORDS,
  MITIGATING_KEYWORDS,
  HELP_SEEKING_KEYWORDS
} from './emotionKeywords';

export interface EmotionDetectionResult {
  level: SafetyLevel;
  confidence: number; // 0-1 사이의 신뢰도
  detectedCategories: string[];
  matchedKeywords: string[];
  isMitigated: boolean; // 완화 표현으로 인해 심각도가 낮아졌는지
  isHelpSeeking: boolean; // 사용자가 도움을 찾고 있는지
  rawScore: number;
}

export interface ConversationContext {
  recentMessages: string[]; // 최근 메시지들 (연속적 부정 체크용)
  consecutiveNegativeCount: number;
}

/**
 * 텍스트에서 키워드 매칭 검사
 */
function checkKeywords(
  text: string,
  keywords: EmotionKeywords
): { categories: string[]; keywords: string[]; totalWeight: number } {
  const normalizedText = text.toLowerCase().replace(/\s+/g, '');
  const categories: string[] = [];
  const matchedKeywords: string[] = [];
  let totalWeight = 0;

  for (const [category, { keywords: categoryKeywords, weight }] of Object.entries(keywords)) {
    for (const keyword of categoryKeywords) {
      const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, '');
      if (normalizedText.includes(normalizedKeyword)) {
        if (!categories.includes(category)) {
          categories.push(category);
        }
        matchedKeywords.push(keyword);
        totalWeight += weight;
        break; // 같은 카테고리에서는 하나만 카운트
      }
    }
  }

  return { categories, keywords: matchedKeywords, totalWeight };
}

/**
 * 완화 표현 체크
 */
function checkMitigatingExpressions(text: string): boolean {
  const normalizedText = text.toLowerCase();
  return MITIGATING_KEYWORDS.some(keyword =>
    normalizedText.includes(keyword.toLowerCase())
  );
}

/**
 * 도움 요청 체크
 */
function checkHelpSeeking(text: string): boolean {
  const normalizedText = text.toLowerCase();
  return HELP_SEEKING_KEYWORDS.some(keyword =>
    normalizedText.includes(keyword.toLowerCase())
  );
}

/**
 * 메인 감정 감지 함수
 */
export function detectEmotion(
  message: string,
  context?: ConversationContext
): EmotionDetectionResult {
  // 1. Crisis 키워드 최우선 체크 (가장 먼저!)
  const crisisResult = checkKeywords(message, CRISIS_KEYWORDS);
  if (crisisResult.categories.length > 0 && crisisResult.totalWeight >= 8) {
    const isMitigated = checkMitigatingExpressions(message);

    // 완화 표현이 있어도 crisis 키워드가 있으면 최소 care 레벨
    return {
      level: isMitigated ? 'care' : 'crisis',
      confidence: isMitigated ? 0.7 : 0.95,
      detectedCategories: crisisResult.categories,
      matchedKeywords: crisisResult.keywords,
      isMitigated,
      isHelpSeeking: checkHelpSeeking(message),
      rawScore: crisisResult.totalWeight
    };
  }

  // 2. Care 키워드 체크
  const careResult = checkKeywords(message, CARE_KEYWORDS);
  if (careResult.categories.length >= 2 || careResult.totalWeight >= 4) {
    const isMitigated = checkMitigatingExpressions(message);

    return {
      level: isMitigated ? 'watch' : 'care',
      confidence: isMitigated ? 0.6 : 0.8,
      detectedCategories: careResult.categories,
      matchedKeywords: careResult.keywords,
      isMitigated,
      isHelpSeeking: checkHelpSeeking(message),
      rawScore: careResult.totalWeight
    };
  }

  // 3. Watch 키워드 체크
  const watchResult = checkKeywords(message, WATCH_KEYWORDS);
  if (watchResult.categories.length >= 1) {
    // 연속적인 부정 표현 체크 (context가 있을 때)
    const consecutiveBonus = context?.consecutiveNegativeCount
      ? Math.min(context.consecutiveNegativeCount * 0.5, 2)
      : 0;

    const totalScore = watchResult.totalWeight + consecutiveBonus;

    // 연속 3회 이상 부정 표현이면 care로 업그레이드
    if (context?.consecutiveNegativeCount && context.consecutiveNegativeCount >= 3) {
      return {
        level: 'care',
        confidence: 0.7,
        detectedCategories: [...watchResult.categories, 'persistentNegative'],
        matchedKeywords: watchResult.keywords,
        isMitigated: false,
        isHelpSeeking: checkHelpSeeking(message),
        rawScore: totalScore
      };
    }

    return {
      level: 'watch',
      confidence: 0.7,
      detectedCategories: watchResult.categories,
      matchedKeywords: watchResult.keywords,
      isMitigated: checkMitigatingExpressions(message),
      isHelpSeeking: checkHelpSeeking(message),
      rawScore: totalScore
    };
  }

  // 4. Normal (감지된 키워드 없음)
  return {
    level: 'normal',
    confidence: 0.9,
    detectedCategories: [],
    matchedKeywords: [],
    isMitigated: false,
    isHelpSeeking: checkHelpSeeking(message),
    rawScore: 0
  };
}

/**
 * 대화 컨텍스트 업데이트 (연속 부정 카운트)
 */
export function updateConversationContext(
  currentContext: ConversationContext | null,
  newMessage: string,
  detectionResult: EmotionDetectionResult
): ConversationContext {
  const recentMessages = currentContext?.recentMessages || [];
  const newRecentMessages = [...recentMessages.slice(-4), newMessage]; // 최근 5개 유지

  let consecutiveCount = currentContext?.consecutiveNegativeCount || 0;

  if (detectionResult.level !== 'normal') {
    consecutiveCount++;
  } else {
    consecutiveCount = 0; // 정상이면 리셋
  }

  return {
    recentMessages: newRecentMessages,
    consecutiveNegativeCount: consecutiveCount
  };
}

/**
 * 빠른 위기 체크 (UI에서 즉시 사용)
 */
export function quickCrisisCheck(message: string): boolean {
  const result = detectEmotion(message);
  return result.level === 'crisis';
}

/**
 * 안전 레벨별 색상 코드
 */
export function getSafetyLevelColor(level: SafetyLevel): string {
  switch (level) {
    case 'crisis': return '#DC2626'; // red-600
    case 'care': return '#F59E0B'; // amber-500
    case 'watch': return '#3B82F6'; // blue-500
    default: return '#10B981'; // emerald-500
  }
}

/**
 * 안전 레벨별 라벨
 */
export function getSafetyLevelLabel(level: SafetyLevel): string {
  switch (level) {
    case 'crisis': return '위기 상황';
    case 'care': return '케어 필요';
    case 'watch': return '주의 관찰';
    default: return '정상';
  }
}
