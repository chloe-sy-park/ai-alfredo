/**
 * 과부하 감지 서비스
 * 일정 + 태스크를 분석하여 사용자의 과부하 상태를 감지
 */

import { CalendarEvent } from '../calendar';
import { Task } from '../tasks';
import {
  OverloadDetection,
  OverloadFactor,
  ProxyAction,
  TimeProtection
} from './types';

interface OverloadContext {
  events: CalendarEvent[];
  tasks: Task[];
  currentTime?: Date;
}

/**
 * 과부하 감지 메인 함수
 */
export function detectOverload(context: OverloadContext): OverloadDetection {
  const { events, tasks, currentTime = new Date() } = context;

  const factors: OverloadFactor[] = [];
  let score = 0;

  // 오늘 일정만 필터
  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    return eventDate >= today && eventDate < tomorrow;
  });

  // 미완료 태스크
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const urgentTasks = pendingTasks.filter(t =>
    t.priority === 'high' || isToday(t.dueDate)
  );

  // 1. 미팅 수 체크
  const meetingCount = countMeetings(todayEvents);
  if (meetingCount >= 6) {
    score += 30;
    factors.push({
      type: 'meetings',
      severity: 'high',
      description: `오늘 미팅이 ${meetingCount}개나 있어요`,
      value: meetingCount
    });
  } else if (meetingCount >= 4) {
    score += 20;
    factors.push({
      type: 'meetings',
      severity: 'medium',
      description: `오늘 미팅 ${meetingCount}개`,
      value: meetingCount
    });
  } else if (meetingCount >= 2) {
    score += 10;
    factors.push({
      type: 'meetings',
      severity: 'low',
      description: `미팅 ${meetingCount}개`,
      value: meetingCount
    });
  }

  // 2. 연속 미팅 체크
  const consecutiveInfo = detectConsecutiveMeetings(todayEvents);
  if (consecutiveInfo.hasConsecutive) {
    score += 15;
    factors.push({
      type: 'consecutive',
      severity: consecutiveInfo.count >= 3 ? 'high' : 'medium',
      description: `${consecutiveInfo.count}개 미팅이 연달아 있어요`,
      value: consecutiveInfo.count
    });
  }

  // 3. 점심/휴식 시간 체크
  const hasLunchBreak = checkLunchBreak(todayEvents);
  if (!hasLunchBreak && meetingCount >= 2) {
    score += 15;
    factors.push({
      type: 'no_break',
      severity: 'medium',
      description: '점심 시간이 확보되지 않았어요'
    });
  }

  // 4. 긴급 태스크 체크
  if (urgentTasks.length >= 5) {
    score += 25;
    factors.push({
      type: 'tasks',
      severity: 'high',
      description: `긴급한 태스크가 ${urgentTasks.length}개`,
      value: urgentTasks.length
    });
  } else if (urgentTasks.length >= 3) {
    score += 15;
    factors.push({
      type: 'tasks',
      severity: 'medium',
      description: `오늘 처리할 태스크 ${urgentTasks.length}개`,
      value: urgentTasks.length
    });
  }

  // 5. 오늘 마감 체크
  const todayDeadlines = pendingTasks.filter(t => isToday(t.dueDate));
  if (todayDeadlines.length >= 3) {
    score += 20;
    factors.push({
      type: 'deadlines',
      severity: 'high',
      description: `오늘 마감 ${todayDeadlines.length}개`,
      value: todayDeadlines.length
    });
  } else if (todayDeadlines.length >= 1) {
    score += 10;
    factors.push({
      type: 'deadlines',
      severity: 'medium',
      description: `오늘 마감 ${todayDeadlines.length}개`,
      value: todayDeadlines.length
    });
  }

  // 6. 야근 예상 체크
  const lastEventEnd = getLastEventEndTime(todayEvents);
  if (lastEventEnd && lastEventEnd.getHours() >= 19) {
    score += 10;
    factors.push({
      type: 'late_hours',
      severity: 'medium',
      description: '저녁 7시 이후까지 일정이 있어요'
    });
  }

  // 레벨 결정
  let level: OverloadDetection['level'] = 'none';
  if (score >= 70) level = 'critical';
  else if (score >= 50) level = 'warning';
  else if (score >= 30) level = 'watch';

  // 제안 생성
  const suggestions = generateOverloadSuggestions(factors, todayEvents, pendingTasks);

  return {
    isOverloaded: level !== 'none',
    level,
    score: Math.min(100, score),
    factors,
    suggestions
  };
}

/**
 * 시간 보호 제안 생성
 */
export function suggestTimeProtections(events: CalendarEvent[]): TimeProtection[] {
  const protections: TimeProtection[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 오늘 일정
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    return eventDate.toDateString() === today.toDateString();
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // 1. 점심 시간 보호
  const hasLunchMeeting = todayEvents.some(e => {
    const hour = new Date(e.start).getHours();
    return hour >= 11 && hour <= 13;
  });

  if (!hasLunchMeeting) {
    protections.push({
      type: 'lunch',
      suggestedSlot: {
        start: formatTime(today, 12, 0),
        end: formatTime(today, 13, 0)
      },
      reason: '점심 시간은 쉬는 것도 일의 일부예요',
      priority: 1
    });
  }

  // 2. 미팅 사이 버퍼 시간
  for (let i = 0; i < todayEvents.length - 1; i++) {
    const currentEnd = new Date(todayEvents[i].end);
    const nextStart = new Date(todayEvents[i + 1].start);
    const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);

    // 15분 이하 간격이면 버퍼 제안
    if (gapMinutes > 0 && gapMinutes <= 15) {
      protections.push({
        type: 'buffer',
        suggestedSlot: {
          start: currentEnd.toISOString(),
          end: nextStart.toISOString()
        },
        reason: '미팅 사이에 숨 돌릴 시간이 필요해요',
        priority: 2
      });
    }
  }

  // 3. 집중 시간 제안 (90분 이상 빈 시간)
  const freeSlots = findFreeSlots(todayEvents);
  freeSlots.forEach(slot => {
    const duration = (new Date(slot.end).getTime() - new Date(slot.start).getTime()) / (1000 * 60);
    if (duration >= 90) {
      protections.push({
        type: 'focus',
        suggestedSlot: {
          start: slot.start,
          end: slot.end
        },
        reason: `${Math.floor(duration / 60)}시간 집중할 수 있는 시간이에요`,
        priority: 3
      });
    }
  });

  return protections.sort((a, b) => a.priority - b.priority);
}

// 헬퍼 함수들

function countMeetings(events: CalendarEvent[]): number {
  return events.filter(e =>
    e.title.includes('미팅') ||
    e.title.includes('회의') ||
    e.title.includes('Meeting') ||
    e.title.includes('1:1') ||
    e.location?.includes('회의실')
  ).length;
}

function detectConsecutiveMeetings(events: CalendarEvent[]): { hasConsecutive: boolean; count: number } {
  const sorted = events.slice().sort((a, b) =>
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  let maxConsecutive = 1;
  let currentConsecutive = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = new Date(sorted[i - 1].end);
    const currStart = new Date(sorted[i].start);
    const gap = (currStart.getTime() - prevEnd.getTime()) / (1000 * 60);

    if (gap <= 15) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 1;
    }
  }

  return {
    hasConsecutive: maxConsecutive >= 2,
    count: maxConsecutive
  };
}

function checkLunchBreak(events: CalendarEvent[]): boolean {
  return !events.some(e => {
    const startHour = new Date(e.start).getHours();
    const endHour = new Date(e.end).getHours();
    // 11:30 ~ 13:30 사이에 일정이 있으면 점심 시간 없음
    return (startHour >= 11 && startHour <= 13) || (endHour >= 12 && endHour <= 14);
  });
}

function getLastEventEndTime(events: CalendarEvent[]): Date | null {
  if (events.length === 0) return null;

  const sorted = events.slice().sort((a, b) =>
    new Date(b.end).getTime() - new Date(a.end).getTime()
  );

  return new Date(sorted[0].end);
}

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const today = new Date().toDateString();
  return new Date(dateStr).toDateString() === today;
}

function formatTime(date: Date, hours: number, minutes: number): string {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function findFreeSlots(events: CalendarEvent[]): Array<{ start: string; end: string }> {
  const slots: Array<{ start: string; end: string }> = [];
  const today = new Date();

  // 근무 시간: 9시 ~ 18시
  const workStart = new Date(today);
  workStart.setHours(9, 0, 0, 0);
  const workEnd = new Date(today);
  workEnd.setHours(18, 0, 0, 0);

  const sorted = events
    .filter(e => !e.allDay)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  let currentTime = workStart;

  for (const event of sorted) {
    const eventStart = new Date(event.start);
    if (eventStart > currentTime) {
      slots.push({
        start: currentTime.toISOString(),
        end: eventStart.toISOString()
      });
    }
    const eventEnd = new Date(event.end);
    if (eventEnd > currentTime) {
      currentTime = eventEnd;
    }
  }

  // 마지막 일정 후 ~ 퇴근 시간
  if (currentTime < workEnd) {
    slots.push({
      start: currentTime.toISOString(),
      end: workEnd.toISOString()
    });
  }

  return slots;
}

function generateOverloadSuggestions(
  factors: OverloadFactor[],
  _events: CalendarEvent[],
  _tasks: Task[]
): ProxyAction[] {
  const suggestions: ProxyAction[] = [];
  const now = new Date().toISOString();

  // 과부하 경고
  const highSeverityFactors = factors.filter(f => f.severity === 'high');
  if (highSeverityFactors.length > 0) {
    suggestions.push({
      id: `proxy_${Date.now()}_overload`,
      type: 'overload_warn',
      title: '오늘 좀 빡세요',
      description: highSeverityFactors.map(f => f.description).join(', '),
      reasoning: '무리하지 않는 게 가장 생산적이에요',
      urgency: 'high',
      notifyStyle: 'gentle',
      userControls: {
        canUndo: false,
        canModify: false,
        canDismiss: true
      },
      status: 'pending',
      createdAt: now
    });
  }

  // 점심 시간 보호 제안
  const noBreakFactor = factors.find(f => f.type === 'no_break');
  if (noBreakFactor) {
    suggestions.push({
      id: `proxy_${Date.now()}_lunch`,
      type: 'protect_time',
      title: '점심 시간 확보해뒀어요',
      description: '12:00-13:00 점심 시간을 지켜드릴게요',
      reasoning: '쉬는 것도 일의 일부예요',
      urgency: 'medium',
      notifyStyle: 'subtle',
      userControls: {
        canUndo: true,
        canModify: true,
        canDismiss: true
      },
      relatedData: {
        timeSlot: {
          start: formatTime(new Date(), 12, 0),
          end: formatTime(new Date(), 13, 0)
        }
      },
      status: 'pending',
      createdAt: now
    });
  }

  // 우선순위 집중 제안
  const taskFactor = factors.find(f => f.type === 'tasks' && f.severity === 'high');
  if (taskFactor) {
    suggestions.push({
      id: `proxy_${Date.now()}_prioritize`,
      type: 'prioritize',
      title: '오늘은 이것만 집중해요',
      description: '가장 중요한 3개만 골랐어요',
      reasoning: '모든 걸 다 하려고 하면 아무것도 못 해요',
      urgency: 'high',
      notifyStyle: 'prominent',
      userControls: {
        canUndo: false,
        canModify: true,
        canDismiss: true
      },
      status: 'pending',
      createdAt: now
    });
  }

  return suggestions;
}
