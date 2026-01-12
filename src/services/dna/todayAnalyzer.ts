/**
 * 오늘의 컨텍스트 분석기
 * 복합 인사이트 생성 (바쁜 날/발표 전날/번아웃 경고)
 */

import {
  CalendarEvent,
  TodayContext,
  SpecialEventAlert,
  BurnoutWarning,
  DNAProfile
} from './types';
import {
  classifyEvents,
  getPresentationEvents,
  detectConsecutiveMeetings,
  predictDailyEnergyDrain
} from './eventClassifier';

/**
 * 오늘의 컨텍스트 분석
 */
export function analyzeTodayContext(
  events: CalendarEvent[],
  profile?: DNAProfile
): TodayContext {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // 오늘 일정만 필터
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    return eventDate >= today && eventDate < tomorrow;
  });
  
  const classifiedEvents = classifyEvents(todayEvents);
  
  // 미팅 수
  const meetings = classifiedEvents.filter(e => 
    e.category === 'meeting' || e.category === 'one_on_one' || e.category === 'presentation'
  );
  
  // 빈 시간 계산 (9-18시 기준, 540분)
  const busyMinutes = classifiedEvents
    .filter(e => !e.isAllDay)
    .reduce((sum, e) => {
      const duration = (new Date(e.end).getTime() - new Date(e.start).getTime()) / (1000 * 60);
      return sum + duration;
    }, 0);
  const freeMinutes = Math.max(0, 540 - busyMinutes);
  
  // 연속 미팅 감지
  const consecutiveResult = detectConsecutiveMeetings(classifiedEvents);
  
  // 발표 있는지
  const presentations = getPresentationEvents(classifiedEvents);
  
  // 내일 발표 있는지
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  const tomorrowEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    return eventDate >= tomorrow && eventDate < tomorrowEnd;
  });
  const tomorrowPresentations = getPresentationEvents(classifyEvents(tomorrowEvents));
  
  // 점심 시간 확보 여부 (11:30-13:30)
  const hasLunchBreak = !classifiedEvents.some(e => {
    const startHour = new Date(e.start).getHours();
    const startMin = new Date(e.start).getMinutes();
    const startTime = startHour * 60 + startMin;
    return startTime >= 690 && startTime <= 810; // 11:30-13:30
  });
  
  // 첫/마지막 일정 시간
  const sortedEvents = classifiedEvents
    .filter(e => !e.isAllDay)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  
  const firstEvent = sortedEvents[0];
  const lastEvent = sortedEvents[sortedEvents.length - 1];
  
  // 바쁜 정도 결정
  let busyLevel: TodayContext['busyLevel'];
  const energyDrain = predictDailyEnergyDrain(classifiedEvents);
  
  if (meetings.length >= 6 || freeMinutes < 60 || energyDrain >= 80) {
    busyLevel = 'extreme';
  } else if (meetings.length >= 4 || freeMinutes < 120 || energyDrain >= 60) {
    busyLevel = 'heavy';
  } else if (meetings.length >= 2 || freeMinutes < 240 || energyDrain >= 40) {
    busyLevel = 'normal';
  } else {
    busyLevel = 'light';
  }
  
  // 알프레도 톤 결정
  let suggestedTone: TodayContext['suggestedTone'] = 'energetic';
  
  if (profile?.stressIndicators.level === 'burnout' || busyLevel === 'extreme') {
    suggestedTone = 'supportive';
  } else if (profile?.stressIndicators.level === 'high' || busyLevel === 'heavy') {
    suggestedTone = 'gentle';
  }
  
  return {
    date: today,
    isBusyDay: busyLevel === 'heavy' || busyLevel === 'extreme',
    busyLevel,
    totalMeetings: meetings.length,
    totalFreeMinutes: freeMinutes,
    hasConsecutiveMeetings: consecutiveResult.hasConsecutive,
    hasPresentationToday: presentations.length > 0,
    hasPresentationTomorrow: tomorrowPresentations.length > 0,
    hasLunchBreak,
    firstEventTime: firstEvent 
      ? `${String(new Date(firstEvent.start).getHours()).padStart(2, '0')}:${String(new Date(firstEvent.start).getMinutes()).padStart(2, '0')}`
      : undefined,
    lastEventTime: lastEvent
      ? `${String(new Date(lastEvent.end).getHours()).padStart(2, '0')}:${String(new Date(lastEvent.end).getMinutes()).padStart(2, '0')}`
      : undefined,
    suggestedTone
  };
}

/**
 * 특별 이벤트 알림 생성
 */
export function detectSpecialEvents(
  events: CalendarEvent[],
  daysAhead: number = 3
): SpecialEventAlert[] {
  const alerts: SpecialEventAlert[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const classifiedEvents = classifyEvents(events);
  
  // 발표 감지
  const presentations = getPresentationEvents(classifiedEvents);
  presentations.forEach(p => {
    const eventDate = new Date(p.start);
    eventDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil >= 0 && daysUntil <= daysAhead) {
      let message = '';
      if (daysUntil === 0) {
        message = `오늘 발표 있어요! "${p.title}" 화이팅!`;
      } else if (daysUntil === 1) {
        message = `내일 발표예요. "${p.title}" 준비 마무리하세요!`;
      } else {
        message = `${daysUntil}일 후 발표 있어요: "${p.title}"`;
      }
      
      alerts.push({
        type: 'presentation',
        eventTitle: p.title,
        eventTime: `${new Date(p.start).getHours()}:${String(new Date(p.start).getMinutes()).padStart(2, '0')}`,
        daysUntil,
        message
      });
    }
  });
  
  // 과부하 감지 (오늘 기준)
  const todayContext = analyzeTodayContext(events);
  if (todayContext.busyLevel === 'extreme') {
    alerts.push({
      type: 'overload',
      daysUntil: 0,
      message: '오늘 일정이 빡빡해요. 무리하지 마세요!'
    });
  }
  
  return alerts;
}

/**
 * 번아웃 경고 분석
 */
export function analyzeBurnoutRisk(
  events: CalendarEvent[],
  profile?: DNAProfile
): BurnoutWarning {
  const signals: string[] = [];
  const today = new Date();
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  // 최근 2주 이벤트
  const recentEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    return eventDate >= twoWeeksAgo && eventDate <= today;
  });
  
  // 신호 1: 주말 업무 (최근 2주)
  const weekendWork = recentEvents.filter(e => {
    const day = new Date(e.start).getDay();
    return (day === 0 || day === 6) && e.calendarType !== 'personal';
  });
  if (weekendWork.length >= 4) {
    signals.push('2주 연속 주말에 일하셨네요');
  } else if (weekendWork.length >= 2) {
    signals.push('최근 주말에도 일정이 있었어요');
  }
  
  // 신호 2: 취소 빈도 증가
  const recentCancellations = recentEvents.filter(e => e.status === 'cancelled').length;
  if (recentCancellations >= 5) {
    signals.push('최근 일정 취소가 많아졌어요');
  }
  
  // 신호 3: 야근 빈도
  const afterHoursEvents = recentEvents.filter(e => {
    const hour = new Date(e.start).getHours();
    return hour >= 19 && e.calendarType !== 'personal';
  });
  if (afterHoursEvents.length >= 6) {
    signals.push('저녁 7시 이후 일정이 많아요');
  }
  
  // 신호 4: 빈 시간 급감
  if (profile && profile.stressIndicators.averageFreeTimePerDay < 60) {
    signals.push('하루 여유 시간이 1시간도 안 돼요');
  }
  
  // 레벨 결정
  let level: BurnoutWarning['level'] = 'none';
  let recommendation = '';
  
  if (signals.length >= 4) {
    level = 'critical';
    recommendation = '지금 당장 쉬어야 해요. 오늘은 현상유지만 해도 성공이에요.';
  } else if (signals.length >= 3) {
    level = 'warning';
    recommendation = '요즘 너무 무리하고 있어요. 이번 주는 좀 쉬엄쉬엄 해요.';
  } else if (signals.length >= 1) {
    level = 'watch';
    recommendation = '조금 피곤할 수 있어요. 틈틈이 숨 돌리세요.';
  }
  
  return {
    level,
    signals,
    recommendation
  };
}

/**
 * 컨텍스트 기반 알프레도 메시지 생성
 */
export function generateContextMessage(context: TodayContext): string {
  const messages: string[] = [];
  
  // 바쁜 정도에 따른 인사
  if (context.busyLevel === 'extreme') {
    messages.push('오늘 빡세네요.');
  } else if (context.busyLevel === 'heavy') {
    messages.push('오늘 좀 바빠요.');
  } else if (context.busyLevel === 'light') {
    messages.push('오늘 여유 있어요!');
  }
  
  // 발표 관련
  if (context.hasPresentationToday) {
    messages.push('오늘 발표 화이팅!');
  } else if (context.hasPresentationTomorrow) {
    messages.push('내일 발표 있으니까 오늘 마무리 준비해요.');
  }
  
  // 연속 미팅
  if (context.hasConsecutiveMeetings) {
    messages.push('미팅 연달아 있으니까 사이사이 숨 쉬세요.');
  }
  
  // 점심
  if (!context.hasLunchBreak && context.totalMeetings >= 3) {
    messages.push('점심 시간 챙기세요!');
  }
  
  return messages.join(' ');
}

/**
 * 오늘 추천 태스크 유형
 */
export function getRecommendedTaskType(context: TodayContext): 'deep_work' | 'light_work' | 'rest' {
  if (context.busyLevel === 'extreme') return 'rest';
  if (context.busyLevel === 'heavy' || context.hasConsecutiveMeetings) return 'light_work';
  if (context.totalFreeMinutes >= 120) return 'deep_work';
  return 'light_work';
}
