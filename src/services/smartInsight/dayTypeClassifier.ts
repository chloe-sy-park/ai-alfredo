/**
 * Day Type Classifier
 *
 * 하루 타입 분류 로직
 * - CALENDAR_ONLY: 캘린더 이벤트 기반 분류
 * - NONE: 시간대/맥락 기반 추측
 */

import { CalendarEvent } from '../calendar';
import {
  DayType,
  DayMetrics,
  ConfidenceLevel,
  IntegrationState
} from './types';

// ============================================================
// Day Metrics Calculation
// ============================================================

/**
 * 미팅 키워드 (이벤트가 미팅인지 판정)
 */
const MEETING_KEYWORDS = [
  'meeting', 'sync', 'standup', '1:1', 'review', 'interview',
  '미팅', '회의', '회고', '인터뷰', '면접', '스탠드업'
];

/**
 * 이벤트가 미팅인지 판정
 */
function isMeeting(event: CalendarEvent): boolean {
  const title = (event.title || '').toLowerCase();
  return MEETING_KEYWORDS.some(keyword => title.includes(keyword.toLowerCase()));
}

/**
 * 이벤트 길이(분) 계산
 */
function getEventDurationMinutes(event: CalendarEvent): number {
  const start = new Date(event.start);
  const end = new Date(event.end);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * 시작 시각을 HH:MM 형식으로 변환
 */
function formatTimeHHMM(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 캘린더 이벤트에서 DayMetrics 계산
 */
export function calculateDayMetrics(events: CalendarEvent[]): DayMetrics {
  if (events.length === 0) {
    return {
      eventCount: 0,
      shortBlocksCount: 0,
      switchingRate: 0,
      totalEventMinutes: 0,
      meetingMinutes: 0,
      largestFreeBlockMinutes: 480, // 기본 8시간
      lateMinutes: 0,
      earlyStartTime: null,
      meetingCount: 0
    };
  }

  // 이벤트 정렬 (시작 시간 순)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // 기본 메트릭
  let totalEventMinutes = 0;
  let meetingMinutes = 0;
  let meetingCount = 0;
  let shortBlocksCount = 0;
  let lateMinutes = 0;

  // 첫 이벤트 시작 시각
  const firstEvent = sortedEvents[0];
  const earlyStartTime = firstEvent
    ? formatTimeHHMM(new Date(firstEvent.start))
    : null;

  // 이벤트별 계산
  for (const event of sortedEvents) {
    const duration = getEventDurationMinutes(event);
    const startDate = new Date(event.start);

    totalEventMinutes += duration;

    // 짧은 블록 (30분 이하)
    if (duration <= 30) {
      shortBlocksCount++;
    }

    // 미팅 판정
    if (isMeeting(event)) {
      meetingMinutes += duration;
      meetingCount++;
    }

    // 늦은 이벤트 (19시 이후)
    if (startDate.getHours() >= 19) {
      lateMinutes += duration;
    }
  }

  // 전환율 계산 (연속 이벤트 간 gap < 15분)
  let quickTransitions = 0;
  for (let i = 1; i < sortedEvents.length; i++) {
    const prevEnd = new Date(sortedEvents[i - 1].end);
    const currStart = new Date(sortedEvents[i].start);
    const gapMinutes = (currStart.getTime() - prevEnd.getTime()) / (1000 * 60);

    if (gapMinutes < 15 && gapMinutes >= 0) {
      quickTransitions++;
    }
  }
  const switchingRate = sortedEvents.length > 1
    ? quickTransitions / (sortedEvents.length - 1)
    : 0;

  // 가장 긴 빈 시간 계산 (08:00 ~ 22:00 기준)
  const dayStart = new Date(sortedEvents[0].start);
  dayStart.setHours(8, 0, 0, 0);
  const dayEnd = new Date(sortedEvents[0].start);
  dayEnd.setHours(22, 0, 0, 0);

  const freeBlocks: number[] = [];

  // 첫 이벤트 전 빈 시간
  const firstStart = new Date(sortedEvents[0].start);
  if (firstStart > dayStart) {
    freeBlocks.push((firstStart.getTime() - dayStart.getTime()) / (1000 * 60));
  }

  // 이벤트 사이 빈 시간
  for (let i = 1; i < sortedEvents.length; i++) {
    const prevEnd = new Date(sortedEvents[i - 1].end);
    const currStart = new Date(sortedEvents[i].start);
    const gap = (currStart.getTime() - prevEnd.getTime()) / (1000 * 60);
    if (gap > 0) {
      freeBlocks.push(gap);
    }
  }

  // 마지막 이벤트 후 빈 시간
  const lastEnd = new Date(sortedEvents[sortedEvents.length - 1].end);
  if (lastEnd < dayEnd) {
    freeBlocks.push((dayEnd.getTime() - lastEnd.getTime()) / (1000 * 60));
  }

  const largestFreeBlockMinutes = freeBlocks.length > 0
    ? Math.max(...freeBlocks)
    : 0;

  return {
    eventCount: events.length,
    shortBlocksCount,
    switchingRate,
    totalEventMinutes,
    meetingMinutes,
    largestFreeBlockMinutes,
    lateMinutes,
    earlyStartTime,
    meetingCount
  };
}

// ============================================================
// Day Type Classification - Calendar Based
// ============================================================

interface ClassificationResult {
  dayType: DayType;
  confidence: ConfidenceLevel;
}

/**
 * 캘린더 메트릭 기반 Day Type 분류
 *
 * 우선순위:
 * 1. recovery: 늦은 일정 많음
 * 2. fragmented: 짧은 블록/전환 많음
 * 3. heavy-energy: 총 시간/미팅 많음
 * 4. open-focus: 큰 빈 블록 있음
 */
export function classifyDayType(metrics: DayMetrics): ClassificationResult {
  // 1. Recovery 체크 (늦은 일정)
  if (metrics.lateMinutes >= 120) {
    return { dayType: 'recovery', confidence: 'MED' };
  }
  if (metrics.lateMinutes >= 60 && metrics.earlyStartTime && metrics.earlyStartTime <= '10:00') {
    return { dayType: 'recovery', confidence: 'MED' };
  }

  // 2. Fragmented 체크 (쪼개진 일정)
  if (metrics.shortBlocksCount >= 3) {
    const confidence: ConfidenceLevel = metrics.shortBlocksCount >= 5 ? 'MED' : 'LOW';
    return { dayType: 'fragmented', confidence };
  }
  if (metrics.switchingRate >= 0.6) {
    return { dayType: 'fragmented', confidence: 'MED' };
  }

  // 3. Heavy-Energy 체크 (에너지 소모)
  if (metrics.totalEventMinutes >= 180) {
    const confidence: ConfidenceLevel = metrics.totalEventMinutes >= 300 ? 'MED' : 'LOW';
    return { dayType: 'heavy-energy', confidence };
  }
  if (metrics.meetingMinutes >= 150) {
    return { dayType: 'heavy-energy', confidence: 'MED' };
  }

  // 4. Open-Focus 체크 (집중 가능)
  if (metrics.largestFreeBlockMinutes >= 180) {
    return { dayType: 'open-focus', confidence: 'MED' };
  }
  if (metrics.largestFreeBlockMinutes >= 120) {
    return { dayType: 'open-focus', confidence: 'LOW' };
  }

  // 이벤트가 적으면 open-focus로 간주
  if (metrics.eventCount <= 2) {
    return { dayType: 'open-focus', confidence: 'LOW' };
  }

  // 기본값: open-focus (LOW confidence)
  return { dayType: 'open-focus', confidence: 'LOW' };
}

// ============================================================
// Day Type Classification - No Calendar
// ============================================================

interface NoCalendarContext {
  currentHour: number;
  dayOfWeek: number;
  isFirstOpenToday: boolean;
  todayVisitCount: number;
}

/**
 * 캘린더 없이 시간대/맥락 기반 Day Type 추측
 *
 * 모든 confidence는 LOW (추측이므로)
 */
export function classifyDayTypeNoCalendar(context: NoCalendarContext): ClassificationResult {
  const { currentHour, isFirstOpenToday, todayVisitCount } = context;

  // 여러 번 방문: fragmented 추측
  if (todayVisitCount > 2) {
    return { dayType: 'fragmented', confidence: 'LOW' };
  }

  // 저녁 시간 (18시 이후): recovery
  if (currentHour >= 18) {
    return { dayType: 'recovery', confidence: 'LOW' };
  }

  // 아침 첫 방문 (6-10시): open-focus
  if (isFirstOpenToday && currentHour >= 6 && currentHour < 10) {
    return { dayType: 'open-focus', confidence: 'LOW' };
  }

  // 오후 첫 방문 (14-17시): fragmented 추측
  if (isFirstOpenToday && currentHour >= 14 && currentHour < 17) {
    return { dayType: 'fragmented', confidence: 'LOW' };
  }

  // 기본값: open-focus
  return { dayType: 'open-focus', confidence: 'LOW' };
}

// ============================================================
// Unified Classifier
// ============================================================

interface ClassifyDayContext {
  integrationState: IntegrationState;
  calendarEvents?: CalendarEvent[];
  currentHour: number;
  dayOfWeek: number;
  isFirstOpenToday: boolean;
  todayVisitCount: number;
}

/**
 * 통합 Day Type 분류기
 *
 * 연동 상태에 따라 적절한 분류 로직 사용
 */
export function classifyDay(context: ClassifyDayContext): ClassificationResult & { dayMetrics?: DayMetrics } {
  if (context.integrationState === 'NONE') {
    // 캘린더 미연동: 시간대 기반 추측
    return classifyDayTypeNoCalendar({
      currentHour: context.currentHour,
      dayOfWeek: context.dayOfWeek,
      isFirstOpenToday: context.isFirstOpenToday,
      todayVisitCount: context.todayVisitCount
    });
  }

  // 캘린더 연동: 메트릭 기반 분류
  const events = context.calendarEvents || [];
  const dayMetrics = calculateDayMetrics(events);
  const result = classifyDayType(dayMetrics);

  return {
    ...result,
    dayMetrics
  };
}
