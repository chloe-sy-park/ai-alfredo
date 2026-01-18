/**
 * Insight Picker
 *
 * 인사이트 생성 및 1-2개 선택 로직
 * - DAY_TYPE: 항상 1개 생성
 * - MOMENT: 조건 충족 시 생성
 * - AVOID_ONE: 캘린더 연동 + 중간 이상 확신도일 때 생성
 *
 * 최대 2개까지만 노출
 */

import {
  Insight,
  InsightContext,
  DayType,
  ConfidenceLevel,
  DAY_TYPE_COPY,
  CONFIDENCE_LANGUAGE
} from './types';
import { classifyDay, calculateDayMetrics } from './dayTypeClassifier';
import { generateMomentInsight, shouldShowMomentInsight } from './momentInsightGenerator';
import { generateAvoidOneInsight, shouldShowAvoidOneInsight } from './avoidOneGenerator';

// ============================================================
// Helper Functions
// ============================================================

function generateInsightId(): string {
  return `DAY_TYPE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 랜덤 선택
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Confidence에 따라 title 어미 조정
 */
function adjustTitleWithConfidence(baseTitle: string, confidence: ConfidenceLevel): string {
  // 이미 어미가 있는 경우 (예: "~일 수도") 그대로 반환
  if (baseTitle.includes('일 수도') || baseTitle.includes('수 있어요')) {
    return baseTitle;
  }

  const suffix = CONFIDENCE_LANGUAGE[confidence].suffix;

  // 기본 타이틀이 어미 없이 끝나는 경우 어미 추가
  if (baseTitle.endsWith("'")) {
    // "오늘은 '쪼개진 하루'" 형태
    return `${baseTitle}${suffix}`;
  }

  return baseTitle;
}

// ============================================================
// DAY_TYPE Insight Generator
// ============================================================

/**
 * DAY_TYPE 인사이트 생성
 */
function generateDayTypeInsight(
  context: InsightContext,
  dayType: DayType,
  confidence: ConfidenceLevel
): Insight {
  const copy = DAY_TYPE_COPY[dayType];

  const baseTitle = pickRandom(copy.titles);
  const title = adjustTitleWithConfidence(baseTitle, confidence);
  const reason = pickRandom(copy.reasons);

  // CTA 결정
  let cta: Insight['cta'];

  if (context.integrationState === 'NONE') {
    // 연동 없음: 캘린더 연동 유도
    cta = {
      label: '캘린더 연동하면 더 정확해져요',
      action: 'CONNECT_CALENDAR'
    };
  } else {
    // 연동 있음: 집중 블록 관련 액션
    cta = {
      label: '집중 블록 만들기',
      action: 'OPEN_FOCUS'
    };
  }

  return {
    id: generateInsightId(),
    type: 'DAY_TYPE',
    state: context.integrationState,
    title,
    reason,
    confidence,
    createdAt: Date.now(),
    dayType,
    cta
  };
}

// ============================================================
// Main Picker
// ============================================================

/**
 * 인사이트 생성 및 선택
 *
 * @param context 인사이트 컨텍스트
 * @returns 최대 2개의 인사이트 배열
 */
export function pickInsights(context: InsightContext): Insight[] {
  const insights: Insight[] = [];

  // 1. Day Type 분류
  const { dayType, confidence, dayMetrics } = classifyDay({
    integrationState: context.integrationState,
    calendarEvents: context.calendarEvents,
    currentHour: context.currentHour,
    dayOfWeek: context.dayOfWeek,
    isFirstOpenToday: context.isFirstOpenToday,
    todayVisitCount: context.todayVisitCount
  });

  // 컨텍스트에 dayMetrics 추가
  const enrichedContext: InsightContext = {
    ...context,
    dayMetrics
  };

  // 2. DAY_TYPE 인사이트 (항상 생성)
  const dayTypeInsight = generateDayTypeInsight(enrichedContext, dayType, confidence);
  insights.push(dayTypeInsight);

  // 3. MOMENT 인사이트 (조건 충족 시)
  if (shouldShowMomentInsight(enrichedContext)) {
    const momentInsight = generateMomentInsight(enrichedContext);
    if (momentInsight) {
      insights.push(momentInsight);
    }
  }

  // 4. AVOID_ONE 인사이트 (캘린더 연동 + 중간 이상 확신도)
  // MOMENT가 이미 추가된 경우 AVOID_ONE은 스킵 (최대 2개 제한)
  if (
    insights.length < 2 &&
    shouldShowAvoidOneInsight(enrichedContext.integrationState, confidence)
  ) {
    const avoidOneInsight = generateAvoidOneInsight(enrichedContext, dayType, confidence);
    if (avoidOneInsight) {
      insights.push(avoidOneInsight);
    }
  }

  // 최대 2개로 제한
  return insights.slice(0, 2);
}

/**
 * 인사이트 우선순위 정렬
 *
 * 1. DAY_TYPE (가장 중요)
 * 2. MOMENT (지금 이 순간)
 * 3. AVOID_ONE (행동 제안)
 */
export function sortInsightsByPriority(insights: Insight[]): Insight[] {
  const priorityOrder = {
    DAY_TYPE: 0,
    MOMENT: 1,
    AVOID_ONE: 2
  };

  return [...insights].sort((a, b) => {
    return priorityOrder[a.type] - priorityOrder[b.type];
  });
}

/**
 * 컨텍스트 변경 시 인사이트 재생성 필요 여부 확인
 */
export function shouldRegenerateInsights(
  prevContext: InsightContext | null,
  newContext: InsightContext
): boolean {
  if (!prevContext) {
    return true;
  }

  // 연동 상태 변경
  if (prevContext.integrationState !== newContext.integrationState) {
    return true;
  }

  // 날짜 변경 (자정 넘김)
  const prevDate = new Date(prevContext.currentHour).toDateString();
  const newDate = new Date(newContext.currentHour).toDateString();
  if (prevDate !== newDate) {
    return true;
  }

  // 첫 방문 상태 변경
  if (prevContext.isFirstOpenToday !== newContext.isFirstOpenToday) {
    return true;
  }

  // 시간대 크게 변경 (3시간 이상)
  if (Math.abs(prevContext.currentHour - newContext.currentHour) >= 3) {
    return true;
  }

  // 캘린더 이벤트 수 변경
  const prevEventCount = prevContext.calendarEvents?.length || 0;
  const newEventCount = newContext.calendarEvents?.length || 0;
  if (Math.abs(prevEventCount - newEventCount) >= 2) {
    return true;
  }

  return false;
}

// ============================================================
// Public Exports
// ============================================================

export {
  generateDayTypeInsight,
  classifyDay,
  calculateDayMetrics
};
