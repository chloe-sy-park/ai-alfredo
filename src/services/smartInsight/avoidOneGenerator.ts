/**
 * Avoid One Generator
 *
 * "오늘 피해야 할 것 1개" 인사이트 생성
 * Day Type에 따라 다른 피해야 할 것 추천
 */

import {
  Insight,
  InsightContext,
  DayType,
  ConfidenceLevel,
  AVOID_ONE_COPY
} from './types';

// ============================================================
// Helper Functions
// ============================================================

function generateInsightId(): string {
  return `AVOID_ONE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 랜덤 선택
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// Main Generator
// ============================================================

/**
 * AVOID_ONE 인사이트 생성
 *
 * @param context 인사이트 컨텍스트
 * @param dayType 분류된 Day Type
 * @param confidence Day Type의 확신도
 * @returns AVOID_ONE 인사이트 또는 null
 */
export function generateAvoidOneInsight(
  context: InsightContext,
  dayType: DayType,
  confidence: ConfidenceLevel
): Insight | null {
  // CALENDAR_ONLY 이상에서만 AVOID_ONE 생성
  // (NONE 상태에서는 추측이 너무 약함)
  if (context.integrationState === 'NONE') {
    return null;
  }

  // LOW confidence에서는 생성하지 않음 (추측이 약할 때)
  if (confidence === 'LOW') {
    return null;
  }

  const copy = AVOID_ONE_COPY[dayType];
  if (!copy) {
    return null;
  }

  const title = pickRandom(copy.titles);
  const reason = pickRandom(copy.reasons);

  // AVOID_ONE은 dayType confidence보다 한 단계 낮게 설정
  // (피해야 할 것은 더 조심스럽게 말해야 함)
  const avoidConfidence: ConfidenceLevel = confidence === 'HIGH' ? 'MED' : 'LOW';

  return {
    id: generateInsightId(),
    type: 'AVOID_ONE',
    state: context.integrationState,
    title,
    reason,
    confidence: avoidConfidence,
    createdAt: Date.now(),
    dayType,
    cta: {
      label: '알겠어요',
      action: 'DISMISS'
    }
  };
}

/**
 * AVOID_ONE 인사이트 표시 조건 확인
 *
 * - 캘린더 연동 상태 (CALENDAR_ONLY 이상)
 * - Day Type confidence가 LOW가 아닌 경우
 */
export function shouldShowAvoidOneInsight(
  integrationState: InsightContext['integrationState'],
  confidence: ConfidenceLevel
): boolean {
  if (integrationState === 'NONE') {
    return false;
  }

  if (confidence === 'LOW') {
    return false;
  }

  return true;
}

/**
 * Day Type별 "오늘 피해야 할 것" 간략 설명
 * (UI 힌트용)
 */
export function getAvoidOneHint(dayType: DayType): string {
  const hints: Record<DayType, string> = {
    fragmented: '멀티태스킹 늘리기',
    'heavy-energy': '저녁에 큰 결정',
    'open-focus': '잡일로 블록 쪼개기',
    recovery: '추가 일정 수락'
  };

  return hints[dayType];
}
