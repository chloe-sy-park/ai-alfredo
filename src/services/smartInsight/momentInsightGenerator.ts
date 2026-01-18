/**
 * Moment Insight Generator
 *
 * "왜 지금 앱을 열었나" 해석 인사이트 생성
 * - morning_first: 아침 첫 방문
 * - afternoon_first: 오후 첫 방문
 * - evening: 저녁 시간
 * - quick_reopen: 빠른 재방문
 * - long_gap: 오랜만에 방문
 */

import {
  Insight,
  InsightContext,
  MOMENT_COPY
} from './types';

// ============================================================
// Types
// ============================================================

type MomentType = 'morning_first' | 'afternoon_first' | 'evening' | 'quick_reopen' | 'long_gap';

// ============================================================
// Helper Functions
// ============================================================

function generateInsightId(): string {
  return `MOMENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 랜덤 선택
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Moment 타입 결정
 */
function determineMomentType(context: InsightContext): MomentType | null {
  const { currentHour, isFirstOpenToday, lastSessionGapHours, todayVisitCount } = context;

  // 1. 오랜만에 방문 (24시간 이상)
  if (lastSessionGapHours !== null && lastSessionGapHours >= 24) {
    return 'long_gap';
  }

  // 2. 빠른 재방문 (2시간 이내, 오늘 3회 이상 방문)
  if (
    !isFirstOpenToday &&
    todayVisitCount >= 3 &&
    lastSessionGapHours !== null &&
    lastSessionGapHours <= 2
  ) {
    return 'quick_reopen';
  }

  // 3. 저녁 시간 (18시 이후)
  if (currentHour >= 18) {
    return 'evening';
  }

  // 4. 아침 첫 방문 (6-12시)
  if (isFirstOpenToday && currentHour >= 6 && currentHour < 12) {
    return 'morning_first';
  }

  // 5. 오후 첫 방문 (12-18시)
  if (isFirstOpenToday && currentHour >= 12 && currentHour < 18) {
    return 'afternoon_first';
  }

  // 해당 없음
  return null;
}

// ============================================================
// Main Generator
// ============================================================

/**
 * MOMENT 인사이트 생성
 *
 * @param context 인사이트 컨텍스트
 * @returns MOMENT 인사이트 또는 null
 */
export function generateMomentInsight(context: InsightContext): Insight | null {
  const momentType = determineMomentType(context);

  if (!momentType) {
    return null;
  }

  const copy = MOMENT_COPY[momentType];
  if (!copy) {
    return null;
  }

  const title = pickRandom(copy.titles);
  const reason = pickRandom(copy.reasons);

  // CTA 결정
  let cta: Insight['cta'];

  switch (momentType) {
    case 'morning_first':
      cta = {
        label: '오늘 할 일 정리하기',
        action: 'OPEN_CAPTURE'
      };
      break;
    case 'afternoon_first':
      cta = {
        label: '지금 해야 할 것 정하기',
        action: 'OPEN_FOCUS'
      };
      break;
    case 'evening':
      cta = {
        label: '오늘 마무리하기',
        action: 'OPEN_CAPTURE'
      };
      break;
    case 'quick_reopen':
      cta = {
        label: '빠르게 기록하기',
        action: 'OPEN_CAPTURE'
      };
      break;
    case 'long_gap':
      cta = {
        label: '밀린 일 확인하기',
        action: 'OPEN_FOCUS'
      };
      break;
    default:
      cta = {
        label: '할 일 보기',
        action: 'OPEN_FOCUS'
      };
  }

  return {
    id: generateInsightId(),
    type: 'MOMENT',
    state: context.integrationState,
    title,
    reason,
    confidence: 'LOW', // MOMENT는 항상 LOW (추측이므로)
    createdAt: Date.now(),
    cta
  };
}

/**
 * MOMENT 인사이트 표시 조건 확인
 *
 * - 첫 방문 또는 저녁 시간 또는 빠른 재방문 또는 오랜만에 방문
 */
export function shouldShowMomentInsight(context: InsightContext): boolean {
  return determineMomentType(context) !== null;
}
