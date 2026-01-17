/**
 * 넛지 트리거 구현
 * 7+ 가지 상황별 넛지 트리거
 */

import type { NudgeTrigger, TriggerContext, TriggerResult } from './types';

// 미팅 링크 추출 (description에서 Zoom, Meet, Teams 링크 찾기)
function extractMeetingLink(description?: string): string | null {
  if (!description) return null;

  // Zoom, Google Meet, Microsoft Teams 링크 패턴
  const patterns = [
    /https:\/\/[^\s]*zoom\.us\/[^\s]*/i,
    /https:\/\/meet\.google\.com\/[^\s]*/i,
    /https:\/\/teams\.microsoft\.com\/[^\s]*/i
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) return match[0];
  }

  return null;
}

// === 1. 미팅 전 리마인더 (15분 전) ===
export const meetingReminderTrigger: NudgeTrigger = {
  type: 'meeting_reminder',
  name: '미팅 리마인더',
  description: '미팅 15분/5분 전 알림',

  checkCondition(context: TriggerContext): boolean {
    const { events, currentTime } = context;
    const now = currentTime.getTime();

    // 15분 후까지의 미팅 체크
    const in15min = now + 15 * 60 * 1000;

    return events.some(event => {
      const eventStart = new Date(event.start).getTime();
      // 15분 이내 미팅 체크
      return (eventStart > now && eventStart <= in15min);
    });
  },

  generateNudge(context: TriggerContext): TriggerResult {
    const { events, currentTime } = context;
    const now = currentTime.getTime();

    // 가장 가까운 미팅 찾기
    const upcomingMeeting = events
      .filter(e => new Date(e.start).getTime() > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

    if (!upcomingMeeting) {
      return { shouldTrigger: false, reason: 'no_upcoming_meeting' };
    }

    const eventStart = new Date(upcomingMeeting.start).getTime();
    const minutesUntil = Math.floor((eventStart - now) / (60 * 1000));

    if (minutesUntil > 15) {
      return { shouldTrigger: false, reason: 'too_far_away' };
    }

    let timing: '15min' | '5min' | 'now' = '15min';
    if (minutesUntil <= 5) timing = '5min';
    if (minutesUntil <= 1) timing = 'now';

    return {
      shouldTrigger: true,
      nudge: {
        type: 'meeting_reminder',
        title: '곧 미팅이에요',
        body: timing === 'now'
          ? `${upcomingMeeting.title} 시작 시간이에요`
          : `${upcomingMeeting.title} ${minutesUntil}분 전이에요`,
        emoji: '📅',
        priority: minutesUntil <= 5 ? 'high' : 'medium',
        // 미팅 링크는 description에서 추출 (Zoom, Meet, Teams 등)
        actions: extractMeetingLink(upcomingMeeting.description) ? [
          { id: 'join', label: '미팅 참여', url: extractMeetingLink(upcomingMeeting.description)! }
        ] : [],
        relatedData: { eventId: upcomingMeeting.id },
        dismissible: true,
        autoHide: 60000
      }
    };
  },

  cooldownRules: { sameTarget: 10, afterAction: 60 }
};

// === 2. 집중시간 제안 (피크 시간대) ===
export const focusSuggestTrigger: NudgeTrigger = {
  type: 'focus_suggest',
  name: '집중시간 제안',
  description: '빈 시간이 있을 때 집중 작업 제안',

  checkCondition(context: TriggerContext): boolean {
    const { events, tasks, currentTime, dna } = context;
    const hour = currentTime.getHours();

    // 미완료 태스크가 있어야 함
    const pendingTasks = tasks.filter(t => t.status !== 'done');
    if (pendingTasks.length === 0) return false;

    // 현재부터 2시간 동안 미팅 없음 체크
    const now = currentTime.getTime();
    const in2hours = now + 2 * 60 * 60 * 1000;

    const hasUpcomingMeeting = events.some(e => {
      const start = new Date(e.start).getTime();
      return start > now && start < in2hours;
    });

    if (hasUpcomingMeeting) return false;

    // 피크 시간대인지 체크
    const peakHours = dna?.peakHours || [9, 10, 11, 14, 15];
    return peakHours.includes(hour);
  },

  generateNudge(context: TriggerContext): TriggerResult {
    const { tasks, events, currentTime } = context;
    const now = currentTime.getTime();

    // 빈 시간 계산
    const upcomingEvents = events
      .filter(e => new Date(e.start).getTime() > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    let availableMinutes = 120; // 기본 2시간
    if (upcomingEvents.length > 0) {
      const nextEventStart = new Date(upcomingEvents[0].start).getTime();
      availableMinutes = Math.floor((nextEventStart - now) / (60 * 1000));
    }

    if (availableMinutes < 30) {
      return { shouldTrigger: false, reason: 'not_enough_time' };
    }

    // 우선순위 높은 태스크 찾기
    const topTask = tasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })[0];

    if (!topTask) {
      return { shouldTrigger: false, reason: 'no_task' };
    }

    const duration = availableMinutes >= 60
      ? `${Math.floor(availableMinutes / 60)}시간`
      : `${availableMinutes}분`;

    return {
      shouldTrigger: true,
      nudge: {
        type: 'focus_suggest',
        title: '집중하기 좋은 시간이에요',
        body: `지금부터 ${duration} 비어있어요. "${topTask.title}" 해볼까요?`,
        emoji: '🎯',
        priority: 'low',
        actions: [
          { id: 'start', label: '시작하기' },
          { id: 'later', label: '나중에' }
        ],
        relatedData: { taskId: topTask.id },
        dismissible: true,
        autoHide: 30000
      }
    };
  },

  cooldownRules: { sameTarget: 120, afterAction: 60 }
};

// === 3. 방치 태스크 넛지 (24시간+) ===
export const neglectedTaskTrigger: NudgeTrigger = {
  type: 'task_nudge',
  name: '방치 태스크',
  description: '24시간 이상 방치된 태스크 알림',

  checkCondition(context: TriggerContext): boolean {
    const { tasks, currentTime } = context;
    const now = currentTime.getTime();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    // 24시간 이상 방치된 in_progress 태스크 체크
    return tasks.some(t => {
      if (t.status !== 'in_progress') return false;
      const createdAt = new Date(t.createdAt).getTime();
      return createdAt < dayAgo;
    });
  },

  generateNudge(context: TriggerContext): TriggerResult {
    const { tasks, currentTime } = context;
    const now = currentTime.getTime();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    // 가장 오래 방치된 태스크
    const neglectedTask = tasks
      .filter(t => t.status === 'in_progress')
      .filter(t => new Date(t.createdAt).getTime() < dayAgo)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

    if (!neglectedTask) {
      return { shouldTrigger: false, reason: 'no_neglected_task' };
    }

    return {
      shouldTrigger: true,
      nudge: {
        type: 'task_nudge',
        title: '잊지 마세요',
        body: `"${neglectedTask.title}"... 잊고 계신 건 아니죠?`,
        emoji: '📋',
        priority: 'medium',
        actions: [
          { id: 'complete', label: '완료하기' },
          { id: 'postpone', label: '내일로' }
        ],
        relatedData: { taskId: neglectedTask.id },
        dismissible: true
      }
    };
  },

  cooldownRules: { sameTarget: 240, afterAction: 60 * 24 }
};

// === 4. 과부하 경고 (일정 밀집) ===
export const overloadWarnTrigger: NudgeTrigger = {
  type: 'overload_warn',
  name: '과부하 경고',
  description: '일정이 너무 많을 때 경고',

  checkCondition(context: TriggerContext): boolean {
    const { events, tasks, currentTime } = context;
    const now = currentTime.getTime();
    const endOfDay = new Date(currentTime);
    endOfDay.setHours(23, 59, 59, 999);

    // 오늘 남은 미팅 수
    const todayMeetings = events.filter(e => {
      const start = new Date(e.start).getTime();
      return start > now && start < endOfDay.getTime();
    });

    // 미완료 태스크 수
    const pendingTasks = tasks.filter(t => t.status !== 'done');

    // 미팅 5개 이상 또는 태스크 10개 이상
    return todayMeetings.length >= 5 || pendingTasks.length >= 10;
  },

  generateNudge(context: TriggerContext): TriggerResult {
    const { events, currentTime } = context;
    const now = currentTime.getTime();
    const endOfDay = new Date(currentTime);
    endOfDay.setHours(23, 59, 59, 999);

    const todayMeetings = events.filter(e => {
      const start = new Date(e.start).getTime();
      return start > now && start < endOfDay.getTime();
    });

    // 연속 미팅 체크
    let hasConsecutive = false;
    for (let i = 0; i < todayMeetings.length - 1; i++) {
      const end1 = new Date(todayMeetings[i].end).getTime();
      const start2 = new Date(todayMeetings[i + 1].start).getTime();
      if (start2 - end1 < 15 * 60 * 1000) {  // 15분 이내 간격
        hasConsecutive = true;
        break;
      }
    }

    const body = hasConsecutive
      ? '미팅이 연속으로 있네요. 사이사이 숨 돌리세요.'
      : `미팅 ${todayMeetings.length}개에 할 일도 많아요. 천천히 해요!`;

    return {
      shouldTrigger: true,
      nudge: {
        type: 'overload_warn',
        title: '오늘 좀 바빠요',
        body,
        emoji: '😮‍💨',
        priority: 'medium',
        dismissible: true,
        autoHide: 10000
      }
    };
  },

  cooldownRules: { sameTarget: 240, afterAction: 120 }
};

// === 5. 휴식 권유 (장시간 작업) ===
export const restSuggestTrigger: NudgeTrigger = {
  type: 'rest_suggest',
  name: '휴식 권유',
  description: '장시간 작업 시 휴식 제안',

  checkCondition(context: TriggerContext): boolean {
    const { user, currentTime } = context;
    if (!user?.focusStartTime) return false;

    const focusDuration = (currentTime.getTime() - user.focusStartTime.getTime()) / (60 * 1000);
    // 60분 이상 집중
    return focusDuration >= 60;
  },

  generateNudge(context: TriggerContext): TriggerResult {
    const { user, currentTime } = context;
    if (!user?.focusStartTime) {
      return { shouldTrigger: false, reason: 'no_focus_time' };
    }

    const focusDuration = Math.floor(
      (currentTime.getTime() - user.focusStartTime.getTime()) / (60 * 1000)
    );

    let body: string;
    if (focusDuration >= 120) {
      body = '벌써 2시간째... 스트레칭 어때요?';
    } else if (focusDuration >= 90) {
      body = '90분 넘게 집중하셨네요! 5분만 스트레칭하고 올까요?';
    } else {
      body = '1시간 집중했어요! 5분만 쉬어갈까요?';
    }

    return {
      shouldTrigger: true,
      nudge: {
        type: 'rest_suggest',
        title: '잠깐 쉬어가요',
        body,
        emoji: '☕',
        priority: focusDuration >= 120 ? 'high' : 'medium',
        actions: [
          { id: 'rest', label: '5분 휴식하기' },
          { id: 'continue', label: '더 할게요' }
        ],
        dismissible: true
      }
    };
  },

  cooldownRules: { sameTarget: 60, afterAction: 60 }
};

// === 6. 퇴근 권유 (업무 종료) ===
export const lateWarningTrigger: NudgeTrigger = {
  type: 'late_warning',
  name: '퇴근 권유',
  description: '업무 시간 초과 시 퇴근 권유',

  checkCondition(context: TriggerContext): boolean {
    const { currentTime, user } = context;
    const hour = currentTime.getHours();

    // 19시 이후 + 아직 작업 중
    return hour >= 19 && user?.isWorking === true;
  },

  generateNudge(context: TriggerContext): TriggerResult {
    const { currentTime, recentNudges } = context;
    const hour = currentTime.getHours();

    // 이미 오늘 퇴근 권유를 받았는지 체크
    const alreadyWarned = recentNudges?.some(
      n => n.type === 'late_warning' &&
        new Date(n.sentAt).toDateString() === currentTime.toDateString()
    );

    const isSecondWarning = alreadyWarned;

    return {
      shouldTrigger: true,
      nudge: {
        type: 'late_warning',
        title: '퇴근 시간이에요',
        body: isSecondWarning
          ? `${hour}시... 진짜 가셔야 해요`
          : `벌써 ${hour}시예요. 마무리할 시간!`,
        emoji: '🌙',
        priority: isSecondWarning ? 'high' : 'medium',
        actions: [
          { id: 'wrapup', label: '마무리하기' }
        ],
        dismissible: true
      }
    };
  },

  cooldownRules: { sameTarget: 60, afterAction: 30 }
};

// === 7. 지각 방지 (출발 시간) ===
export const departureAlertTrigger: NudgeTrigger = {
  type: 'departure_alert',
  name: '지각 방지',
  description: '외부 미팅 출발 시간 알림',

  checkCondition(context: TriggerContext): boolean {
    const { events, currentTime } = context;
    const now = currentTime.getTime();

    // 1시간 내 외부 미팅 체크 (location이 있는 미팅)
    const in1hour = now + 60 * 60 * 1000;

    return events.some(e => {
      const start = new Date(e.start).getTime();
      return start > now && start < in1hour && e.location;
    });
  },

  generateNudge(context: TriggerContext): TriggerResult {
    const { events, currentTime } = context;
    const now = currentTime.getTime();

    // 외부 미팅 찾기
    const externalMeeting = events
      .filter(e => {
        const start = new Date(e.start).getTime();
        return start > now && e.location;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

    if (!externalMeeting) {
      return { shouldTrigger: false, reason: 'no_external_meeting' };
    }

    const eventStart = new Date(externalMeeting.start).getTime();
    const minutesUntil = Math.floor((eventStart - now) / (60 * 1000));

    // 30분 전 출발 권유 (이동 시간 가정)
    const travelTime = 30; // TODO: Google Maps API로 실제 이동 시간 계산
    const shouldLeaveIn = minutesUntil - travelTime;

    if (shouldLeaveIn > 15) {
      return { shouldTrigger: false, reason: 'too_early' };
    }

    return {
      shouldTrigger: true,
      nudge: {
        type: 'departure_alert',
        title: '출발 시간이에요',
        body: shouldLeaveIn <= 0
          ? `"${externalMeeting.title}" 지금 출발해야 해요!`
          : `"${externalMeeting.title}" ${shouldLeaveIn}분 후 출발하세요`,
        emoji: '🚗',
        priority: shouldLeaveIn <= 5 ? 'high' : 'medium',
        actions: [
          { id: 'navigate', label: '길찾기', url: `https://maps.google.com/?q=${encodeURIComponent(externalMeeting.location || '')}` }
        ],
        relatedData: { eventId: externalMeeting.id },
        dismissible: false,
        autoHide: 0  // 수동 닫기
      }
    };
  },

  cooldownRules: { sameTarget: 30, afterAction: 60 }
};

// === 모든 트리거 export ===
export const allTriggers: NudgeTrigger[] = [
  meetingReminderTrigger,
  focusSuggestTrigger,
  neglectedTaskTrigger,
  overloadWarnTrigger,
  restSuggestTrigger,
  lateWarningTrigger,
  departureAlertTrigger
];

export const triggerMap: Record<string, NudgeTrigger> = {
  meeting_reminder: meetingReminderTrigger,
  focus_suggest: focusSuggestTrigger,
  task_nudge: neglectedTaskTrigger,
  overload_warn: overloadWarnTrigger,
  rest_suggest: restSuggestTrigger,
  late_warning: lateWarningTrigger,
  departure_alert: departureAlertTrigger
};
