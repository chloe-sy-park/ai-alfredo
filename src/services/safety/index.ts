/**
 * 안전 서비스 모듈
 * AI 알프레도의 안전한 상호작용을 위한 핵심 서비스
 */

// Types
export type { SafetyLevel, EmotionKeywordSet, EmotionKeywords } from './emotionKeywords';
export type { EmotionDetectionResult, ConversationContext } from './emotionDetector';
export type { BoundaryType, BoundaryCheckResult } from './boundaryChecker';
export type { CrisisResource, SafetyResponseTemplate } from './safetyResponses';

// Emotion Keywords
export {
  WATCH_KEYWORDS,
  CARE_KEYWORDS,
  CRISIS_KEYWORDS,
  ALL_KEYWORDS,
  MITIGATING_KEYWORDS,
  HELP_SEEKING_KEYWORDS
} from './emotionKeywords';

// Emotion Detector
export {
  detectEmotion,
  updateConversationContext,
  quickCrisisCheck,
  getSafetyLevelColor,
  getSafetyLevelLabel
} from './emotionDetector';

// Boundary Checker
export {
  checkBoundary,
  buildBoundaryResponse,
  CAPABILITY_BOUNDARIES,
  ADMISSION_OF_UNCERTAINTY
} from './boundaryChecker';

// Safety Responses
export {
  WATCH_RESPONSES,
  CARE_RESPONSES,
  CRISIS_RESPONSES,
  HELP_SEEKING_RESPONSES,
  getResponseByLevel,
  pickRandom,
  buildCrisisResponse,
  buildCareResponse,
  buildWatchResponse
} from './safetyResponses';

// Safety Prompts
export {
  BASE_SAFETY_PROMPT,
  CRISIS_PROMPT_ADDITION,
  CARE_MODE_PROMPT,
  PROFESSIONAL_REDIRECT_PROMPT,
  getTimeBasedTonePrompt,
  buildSafetySystemPrompt
} from './safetyPrompts';

// ============================================
// 통합 안전 체크 함수
// ============================================

import { detectEmotion, EmotionDetectionResult, ConversationContext } from './emotionDetector';
import { checkBoundary, BoundaryCheckResult } from './boundaryChecker';
import { buildCrisisResponse, buildCareResponse, buildWatchResponse } from './safetyResponses';
import { buildSafetySystemPrompt } from './safetyPrompts';

export interface SafetyCheckResult {
  emotion: EmotionDetectionResult;
  boundary: BoundaryCheckResult;
  systemPrompt: string;
  safetyResponse?: string;
  showCrisisResources: boolean;
  crisisResources?: Array<{
    name: string;
    number: string;
    available: string;
    description?: string;
  }>;
}

/**
 * 통합 안전 체크 함수
 * 메시지 분석 → 감정 감지 + 경계 체크 → 적절한 응답/프롬프트 생성
 */
export function performSafetyCheck(
  message: string,
  context?: ConversationContext
): SafetyCheckResult {
  // 1. 감정 감지
  const emotionResult = detectEmotion(message, context);

  // 2. 경계 체크
  const boundaryResult = checkBoundary(message);

  // 3. 안전 프롬프트 생성
  const systemPrompt = buildSafetySystemPrompt({
    isCrisis: emotionResult.level === 'crisis',
    isCareMode: emotionResult.level === 'care',
    needsRedirect: boundaryResult.type === 'redirect'
  });

  // 4. 결과 조합
  const result: SafetyCheckResult = {
    emotion: emotionResult,
    boundary: boundaryResult,
    systemPrompt,
    showCrisisResources: false
  };

  // 5. 위기 상황 처리
  if (emotionResult.level === 'crisis') {
    const crisisResponse = buildCrisisResponse();
    result.safetyResponse = crisisResponse.message;
    result.showCrisisResources = true;
    result.crisisResources = crisisResponse.resources;
  }
  // 6. 케어 필요 상황
  else if (emotionResult.level === 'care') {
    result.safetyResponse = buildCareResponse(emotionResult.isHelpSeeking);
  }
  // 7. 주의 관찰 상황
  else if (emotionResult.level === 'watch') {
    result.safetyResponse = buildWatchResponse();
  }
  // 8. 경계 주제 처리
  else if (boundaryResult.type !== 'safe' && boundaryResult.alternativeResponse) {
    result.safetyResponse = boundaryResult.alternativeResponse;
  }

  return result;
}

/**
 * 빠른 위기 체크 (UI에서 즉시 사용)
 */
export function quickSafetyCheck(message: string): {
  isCrisis: boolean;
  needsAttention: boolean;
} {
  const emotion = detectEmotion(message);
  return {
    isCrisis: emotion.level === 'crisis',
    needsAttention: emotion.level !== 'normal'
  };
}
