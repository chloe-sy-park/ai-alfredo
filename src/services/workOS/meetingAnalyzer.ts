/**
 * Meeting Analyzer
 *
 * 미팅 분석 및 추천 조건 판정
 * - 미팅 키워드 탐지
 * - 참석자 수 확인
 * - 미팅 길이 확인
 * - 미팅 해석 문구 생성
 */

import { CalendarEvent } from '../calendar';
import {
  MeetingAnalysis,
  MeetingRecommendationConditions,
  TaskSuggestion,
  MEETING_KEYWORDS,
  MEETING_INTERPRETATION_KEYWORDS,
  MEETING_PREP_TASK_TEMPLATES
} from './types';

// ============================================================
// Helper Functions
// ============================================================

function generateSuggestionId(): string {
  return `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 미팅 키워드 포함 여부 확인
 */
function hasMeetingKeyword(title: string): boolean {
  const normalizedTitle = title.toLowerCase();
  const allKeywords = [...MEETING_KEYWORDS.english, ...MEETING_KEYWORDS.korean];

  return allKeywords.some(keyword =>
    normalizedTitle.includes(keyword.toLowerCase())
  );
}

/**
 * 미팅 키워드에서 해석 문구 추출
 */
function extractInterpretationFromTitle(title: string): string | null {
  const normalizedTitle = title.toLowerCase();

  for (const [keyword, interpretation] of Object.entries(MEETING_INTERPRETATION_KEYWORDS)) {
    if (normalizedTitle.includes(keyword.toLowerCase())) {
      return interpretation;
    }
  }

  return null;
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
 * 참석자 수 추출 (CalendarEvent에서)
 */
function getAttendeeCount(event: CalendarEvent): number {
  // CalendarEvent 타입에 attendees가 있다고 가정
  // 없으면 description이나 다른 필드에서 추론 시도
  const eventAny = event as CalendarEvent & { attendees?: string[] };

  if (eventAny.attendees && Array.isArray(eventAny.attendees)) {
    return eventAny.attendees.length;
  }

  // 참석자 정보가 없으면 1명으로 가정 (본인)
  return 1;
}

// ============================================================
// Main Analyzer
// ============================================================

/**
 * 미팅 추천 조건 확인
 *
 * 2개 이상 충족 시 준비 Task 추천
 * - 참석자 2인 이상
 * - 30분 이상
 * - 미팅 키워드 포함
 * - 과거 유사 회의 존재 (현재 미구현, 항상 false)
 */
export function checkMeetingConditions(event: CalendarEvent): MeetingRecommendationConditions {
  const title = event.title || '';
  const duration = getEventDurationMinutes(event);
  const attendeeCount = getAttendeeCount(event);

  const hasMultipleAttendees = attendeeCount >= 2;
  const isLongMeeting = duration >= 30;
  const hasKeyword = hasMeetingKeyword(title);
  const hasSimilarPastMeeting = false; // TODO: 과거 패턴 분석

  let conditionsMet = 0;
  if (hasMultipleAttendees) conditionsMet++;
  if (isLongMeeting) conditionsMet++;
  if (hasKeyword) conditionsMet++;
  if (hasSimilarPastMeeting) conditionsMet++;

  return {
    hasMultipleAttendees,
    isLongMeeting,
    hasMeetingKeyword: hasKeyword,
    hasSimilarPastMeeting,
    conditionsMet
  };
}

/**
 * 미팅 해석 문구 생성
 *
 * 예: "이 회의는 'OOO를 결정하기 위한 미팅'으로 보입니다"
 */
export function generateMeetingInterpretation(event: CalendarEvent): string {
  const title = event.title || '미팅';

  // 키워드 기반 해석
  const keywordInterpretation = extractInterpretationFromTitle(title);

  if (keywordInterpretation) {
    return `이 회의는 '${keywordInterpretation} 미팅'으로 보여요`;
  }

  // 기본 해석
  return `'${title}' 미팅이에요`;
}

/**
 * 미팅에 맞는 준비 Task 추천 생성
 *
 * 최대 2개 추천
 */
export function generateTaskSuggestions(
  _event: CalendarEvent,
  conditions: MeetingRecommendationConditions
): TaskSuggestion[] {
  if (conditions.conditionsMet < 2) {
    return [];
  }

  const suggestions: TaskSuggestion[] = [];

  // 긴 미팅이면 "논의할 포인트 정리" 추천
  if (conditions.isLongMeeting) {
    const template = MEETING_PREP_TASK_TEMPLATES[0]; // 논의할 포인트 정리
    suggestions.push({
      id: generateSuggestionId(),
      title: template.title,
      description: template.description,
      estimatedMinutes: template.estimatedMinutes,
      reason: template.reason,
      isSelected: false
    });
  }

  // 참석자가 많으면 "관련 자료 확인" 추천
  if (conditions.hasMultipleAttendees) {
    const template = MEETING_PREP_TASK_TEMPLATES[1]; // 관련 자료 확인
    suggestions.push({
      id: generateSuggestionId(),
      title: template.title,
      description: template.description,
      estimatedMinutes: template.estimatedMinutes,
      reason: template.reason,
      isSelected: false
    });
  }

  // 미팅 키워드가 있으면 "질문 목록 준비" 추천 (이미 2개면 스킵)
  if (conditions.hasMeetingKeyword && suggestions.length < 2) {
    const template = MEETING_PREP_TASK_TEMPLATES[2]; // 질문 목록 준비
    suggestions.push({
      id: generateSuggestionId(),
      title: template.title,
      description: template.description,
      estimatedMinutes: template.estimatedMinutes,
      reason: template.reason,
      isSelected: false
    });
  }

  // 최대 2개로 제한
  return suggestions.slice(0, 2);
}

/**
 * 단일 미팅 분석
 */
export function analyzeMeeting(event: CalendarEvent): MeetingAnalysis {
  const conditions = checkMeetingConditions(event);
  const shouldRecommend = conditions.conditionsMet >= 2;
  const interpretation = generateMeetingInterpretation(event);
  const suggestedTasks = generateTaskSuggestions(event, conditions);

  return {
    meeting: event,
    conditions,
    shouldRecommend,
    interpretation,
    suggestedTasks
  };
}

/**
 * 오늘 미팅 전체 분석
 */
export function analyzeTodayMeetings(events: CalendarEvent[]): MeetingAnalysis[] {
  // 시간순 정렬
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return sortedEvents.map(event => analyzeMeeting(event));
}

/**
 * 추천 가능한 미팅만 필터링
 */
export function filterRecommendableMeetings(analyses: MeetingAnalysis[]): MeetingAnalysis[] {
  return analyses.filter(a => a.shouldRecommend);
}

/**
 * 가장 가까운 미팅 찾기
 */
export function findNextMeeting(analyses: MeetingAnalysis[]): MeetingAnalysis | null {
  const now = new Date();

  const upcomingAnalyses = analyses.filter(a => {
    const meetingStart = new Date(a.meeting.start);
    return meetingStart > now;
  });

  if (upcomingAnalyses.length === 0) {
    return null;
  }

  // 가장 가까운 미팅
  return upcomingAnalyses[0];
}

/**
 * 미팅까지 남은 시간 (시간 단위)
 */
export function getHoursUntilMeeting(meeting: CalendarEvent): number {
  const now = new Date();
  const meetingStart = new Date(meeting.start);
  const diffMs = meetingStart.getTime() - now.getTime();

  return diffMs / (1000 * 60 * 60);
}
