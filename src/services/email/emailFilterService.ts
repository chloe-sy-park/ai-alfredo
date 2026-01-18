/**
 * Email Filter Service
 *
 * 3-tier 필터 구조:
 * 1. 시간 필터: 최근 72시간
 * 2. 스레드 상태 필터: isUnread, hasRecentReply, isInThread
 * 3. 신호 조건 필터: 2개 이상 충족 시 통과
 */

import {
  EmailMetadata,
  EmailFilterConfig,
  SignalConditionResult,
  DEFAULT_FILTER_CONFIG,
  SIGNAL_KEYWORDS
} from './types';
import { CalendarEvent } from '../../lib/db';

// ============================================================
// Filter 1: 시간 필터
// ============================================================

/**
 * 시간 윈도우 내의 이메일만 필터링
 */
export function filterByTimeWindow(
  emails: EmailMetadata[],
  hoursAgo: number = DEFAULT_FILTER_CONFIG.timeWindowHours
): EmailMetadata[] {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);
  const cutoffTimestamp = cutoffTime.toISOString();

  return emails.filter(email => email.receivedAt >= cutoffTimestamp);
}

// ============================================================
// Filter 2: 스레드 상태 필터
// ============================================================

export interface ThreadStateFilter {
  includeUnread: boolean;
  includeRecentReplies: boolean;
  includeThreaded: boolean;
}

/**
 * 스레드 상태로 필터링
 */
export function filterByThreadState(
  emails: EmailMetadata[],
  filter: ThreadStateFilter
): EmailMetadata[] {
  return emails.filter(email => {
    // 읽지 않은 이메일
    if (filter.includeUnread && email.isUnread) {
      return true;
    }

    // 스레드에 포함된 이메일 (답장이 있는)
    if (filter.includeThreaded && email.threadCount > 1) {
      return true;
    }

    // 최근 답장이 있는 이메일 (RE: 패턴)
    if (filter.includeRecentReplies && /^RE:/i.test(email.subject)) {
      return true;
    }

    return false;
  });
}

// ============================================================
// Filter 3: 신호 조건 필터
// ============================================================

/**
 * 신호 조건 체크
 */
export function checkSignalConditions(
  email: EmailMetadata,
  context: {
    calendarParticipants: string[];
    recentSenderCounts: Map<string, number>;
  }
): SignalConditionResult {
  const result: SignalConditionResult = {
    keywordMatch: false,
    calendarParticipant: false,
    threadCountHigh: false,
    senderFrequent: false,
    totalMatched: 0
  };

  // 1. 키워드 매칭
  const textToCheck = `${email.subject} ${email.from}`.toLowerCase();
  result.keywordMatch = SIGNAL_KEYWORDS.some(keyword =>
    textToCheck.includes(keyword.toLowerCase())
  );
  if (result.keywordMatch) result.totalMatched++;

  // 2. 캘린더 참석자 매칭
  const emailDomain = email.fromDomain.toLowerCase();
  const senderEmail = email.from.toLowerCase();
  result.calendarParticipant = context.calendarParticipants.some(participant => {
    const participantLower = participant.toLowerCase();
    return participantLower === senderEmail ||
           participantLower.endsWith(`@${emailDomain}`);
  });
  if (result.calendarParticipant) result.totalMatched++;

  // 3. 스레드 카운트 (3개 이상)
  result.threadCountHigh = email.threadCount >= 3;
  if (result.threadCountHigh) result.totalMatched++;

  // 4. 발신자 빈도 (최근 7일 3회 이상)
  const senderCount = context.recentSenderCounts.get(senderEmail) || 0;
  result.senderFrequent = senderCount >= 3;
  if (result.senderFrequent) result.totalMatched++;

  return result;
}

/**
 * 신호 조건으로 필터링
 */
export function filterBySignalConditions(
  emails: EmailMetadata[],
  context: {
    calendarParticipants: string[];
    recentSenderCounts: Map<string, number>;
  },
  minConditions: number = DEFAULT_FILTER_CONFIG.minSignalConditions
): EmailMetadata[] {
  return emails.filter(email => {
    const conditions = checkSignalConditions(email, context);
    return conditions.totalMatched >= minConditions;
  });
}

// ============================================================
// Combined 3-Tier Filter
// ============================================================

export interface FilterContext {
  todayCalendarEvents: CalendarEvent[];
  allRecentEmails: EmailMetadata[];  // For sender frequency calculation
}

/**
 * 캘린더 이벤트에서 참석자 이메일 추출
 */
export function extractCalendarParticipants(_events: CalendarEvent[]): string[] {
  // CalendarEvent에 attendees 필드가 없는 경우, 빈 배열 반환
  // 실제 구현 시 이벤트에서 참석자 정보를 추출해야 함
  return [];
}

/**
 * 최근 이메일에서 발신자 빈도 계산
 */
export function calculateSenderFrequency(
  emails: EmailMetadata[],
  daysAgo: number = 7
): Map<string, number> {
  const cutoffTime = new Date();
  cutoffTime.setDate(cutoffTime.getDate() - daysAgo);
  const cutoffTimestamp = cutoffTime.toISOString();

  const recentEmails = emails.filter(e => e.receivedAt >= cutoffTimestamp);
  const senderCounts = new Map<string, number>();

  for (const email of recentEmails) {
    const sender = email.from.toLowerCase();
    senderCounts.set(sender, (senderCounts.get(sender) || 0) + 1);
  }

  return senderCounts;
}

/**
 * 3-tier 필터 적용
 */
export function applyThreeTierFilter(
  emails: EmailMetadata[],
  context: FilterContext,
  config: EmailFilterConfig = DEFAULT_FILTER_CONFIG
): EmailMetadata[] {
  // Filter 1: 시간 필터
  let filtered = filterByTimeWindow(emails, config.timeWindowHours);

  // Filter 2: 스레드 상태 필터
  filtered = filterByThreadState(filtered, {
    includeUnread: config.includeUnread,
    includeRecentReplies: config.includeRecentReplies,
    includeThreaded: config.includeThreaded
  });

  // Filter 3: 신호 조건 필터
  const calendarParticipants = extractCalendarParticipants(context.todayCalendarEvents);
  const recentSenderCounts = calculateSenderFrequency(context.allRecentEmails);

  filtered = filterBySignalConditions(
    filtered,
    { calendarParticipants, recentSenderCounts },
    config.minSignalConditions
  );

  return filtered;
}

// ============================================================
// Today 표시용 필터 (Type A/B만)
// ============================================================

/**
 * Today에 표시할 이메일만 필터링
 * Type A (미팅 초대) 또는 Type B (Work-Context)만 표시
 */
export function filterForToday(emails: EmailMetadata[]): EmailMetadata[] {
  return emails.filter(email =>
    email.emailType === 'A' || email.emailType === 'B'
  );
}

/**
 * 미팅과 연결된 이메일 찾기
 */
export function findRelatedEmails(
  emails: EmailMetadata[],
  meeting: CalendarEvent
): EmailMetadata[] {
  // 미팅 제목의 키워드로 검색
  const meetingKeywords = meeting.title.toLowerCase().split(/\s+/);

  return emails.filter(email => {
    // 이미 미팅과 연결됨
    if (email.relatedMeetingId === meeting.id) return true;

    // 제목에 미팅 키워드 포함
    const subjectLower = email.subject.toLowerCase();
    return meetingKeywords.some(keyword =>
      keyword.length > 2 && subjectLower.includes(keyword)
    );
  });
}
