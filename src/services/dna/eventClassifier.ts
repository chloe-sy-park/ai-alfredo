/**
 * 일정 제목/참석자 수 기반 분류기
 * dna_expansion_engine_kr.md 섹션 3 기반
 */

import {
  CalendarEvent,
  ClassifiedEvent,
  EventCategory,
  EnergyLevel,
  MeetingIntensity
} from './types';

// 카테고리별 키워드 매핑
const CATEGORY_KEYWORDS: Record<EventCategory, string[]> = {
  meeting: ['미팅', '회의', 'meeting', 'sync', 'call', '전체회의', '스탠드업', 'standup', '정기회의'],
  focus: ['보고서', '작성', '정리', '리뷰', '검토', 'deep work', '집중', 'focus', '분석', '기획'],
  presentation: ['발표', '프레젠테이션', 'PT', 'presentation', '데모', 'demo', '피칭', 'pitch'],
  one_on_one: ['1:1', '1on1', '면담', '상담', 'one on one', '개인 미팅'],
  meal: ['점심', '저녁', '아침', '식사', 'lunch', 'dinner', 'breakfast', '회식', '티타임'],
  health: ['운동', '헬스', '요가', '필라테스', '러닝', '수영', 'gym', 'workout', 'exercise', 
           '치과', '병원', '진료', '검진', '의사'],
  personal: ['휴가', '연차', '반차', '개인', 'personal', '휴일', 'off'],
  break: ['휴식', 'break', '쉬는 시간'],
  other: []
};

// 카테고리별 에너지 소모
const CATEGORY_ENERGY: Record<EventCategory, EnergyLevel> = {
  meeting: 'medium',
  focus: 'medium',
  presentation: 'high',
  one_on_one: 'medium',
  meal: 'low',
  health: 'recovery',
  personal: 'low',
  break: 'recovery',
  other: 'low'
};

/**
 * 일정 제목 → 카테고리 분류
 */
export function classifyByTitle(title: string): EventCategory {
  const lowerTitle = title.toLowerCase();
  
  // 각 카테고리 키워드 체크 (순서 중요: 더 구체적인 것 먼저)
  const categoryOrder: EventCategory[] = [
    'presentation', // 발표는 미팅보다 우선
    'one_on_one',   // 1:1은 미팅보다 우선
    'health',
    'meal',
    'personal',
    'break',
    'focus',
    'meeting',
  ];
  
  for (const category of categoryOrder) {
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords.some(kw => lowerTitle.includes(kw.toLowerCase()))) {
      return category;
    }
  }
  
  return 'other';
}

/**
 * 참석자 수 → 미팅 강도 분류
 */
export function classifyByAttendees(attendees?: number): MeetingIntensity {
  if (!attendees || attendees <= 1) return 'solo';
  if (attendees === 2) return 'one_on_one';
  if (attendees <= 5) return 'small';
  if (attendees <= 10) return 'medium';
  return 'large';
}

/**
 * 미팅 강도 → 에너지 소모 조정
 */
export function getEnergyFromIntensity(intensity: MeetingIntensity): EnergyLevel {
  switch (intensity) {
    case 'solo': return 'low';
    case 'one_on_one': return 'medium';
    case 'small': return 'medium';
    case 'medium': return 'high';
    case 'large': return 'high';
  }
}

/**
 * 일정 전체 분류
 */
export function classifyEvent(event: CalendarEvent): ClassifiedEvent {
  const category = classifyByTitle(event.title);
  const meetingIntensity = classifyByAttendees(event.attendees);
  
  // 에너지 레벨 결정 (카테고리 기반, 참석자 수로 조정)
  let energyLevel = CATEGORY_ENERGY[category];
  
  // 미팅/발표이고 참석자 많으면 에너지 상향
  if ((category === 'meeting' || category === 'presentation') && 
      (meetingIntensity === 'medium' || meetingIntensity === 'large')) {
    energyLevel = 'high';
  }
  
  return {
    ...event,
    category,
    energyLevel,
    meetingIntensity: category === 'meeting' || category === 'presentation' || category === 'one_on_one'
      ? meetingIntensity
      : undefined
  };
}

/**
 * 여러 일정 일괄 분류
 */
export function classifyEvents(events: CalendarEvent[]): ClassifiedEvent[] {
  return events.map(classifyEvent);
}

/**
 * 고에너지 일정 필터
 */
export function getHighEnergyEvents(events: ClassifiedEvent[]): ClassifiedEvent[] {
  return events.filter(e => e.energyLevel === 'high');
}

/**
 * 발표/PT 일정 필터
 */
export function getPresentationEvents(events: ClassifiedEvent[]): ClassifiedEvent[] {
  return events.filter(e => e.category === 'presentation');
}

/**
 * 오늘의 총 에너지 소모 예측 (0-100)
 */
export function predictDailyEnergyDrain(events: ClassifiedEvent[]): number {
  const energyScores: Record<EnergyLevel, number> = {
    high: 25,
    medium: 15,
    low: 5,
    recovery: -10
  };
  
  const totalDrain = events.reduce((sum, event) => {
    let score = energyScores[event.energyLevel];
    
    // 시간 길이에 따른 가중치 (1시간 기준)
    const durationHours = (new Date(event.end).getTime() - new Date(event.start).getTime()) 
      / (1000 * 60 * 60);
    score *= Math.min(durationHours, 2); // 최대 2시간 기준
    
    return sum + score;
  }, 0);
  
  // 0-100 범위로 정규화
  return Math.min(100, Math.max(0, totalDrain));
}

/**
 * 연속 미팅 감지 (30분 이내 간격)
 */
export function detectConsecutiveMeetings(events: ClassifiedEvent[]): {
  hasConsecutive: boolean;
  count: number;
  events: ClassifiedEvent[];
} {
  const meetings = events
    .filter(e => e.category === 'meeting' || e.category === 'one_on_one' || e.category === 'presentation')
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  
  if (meetings.length < 2) {
    return { hasConsecutive: false, count: 0, events: [] };
  }
  
  let maxConsecutive = 1;
  let currentConsecutive = 1;
  let consecutiveEvents: ClassifiedEvent[] = [meetings[0]];
  let maxConsecutiveEvents: ClassifiedEvent[] = [];
  
  for (let i = 1; i < meetings.length; i++) {
    const prevEnd = new Date(meetings[i - 1].end).getTime();
    const currStart = new Date(meetings[i].start).getTime();
    const gapMinutes = (currStart - prevEnd) / (1000 * 60);
    
    if (gapMinutes <= 30) {
      currentConsecutive++;
      consecutiveEvents.push(meetings[i]);
    } else {
      if (currentConsecutive > maxConsecutive) {
        maxConsecutive = currentConsecutive;
        maxConsecutiveEvents = [...consecutiveEvents];
      }
      currentConsecutive = 1;
      consecutiveEvents = [meetings[i]];
    }
  }
  
  // 마지막 체크
  if (currentConsecutive > maxConsecutive) {
    maxConsecutive = currentConsecutive;
    maxConsecutiveEvents = consecutiveEvents;
  }
  
  return {
    hasConsecutive: maxConsecutive >= 3,
    count: maxConsecutive,
    events: maxConsecutiveEvents
  };
}
