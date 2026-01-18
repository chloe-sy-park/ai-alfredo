/**
 * 알프레도 알림 메시지 템플릿
 */

export type NotificationType = 
  | 'morning_briefing'
  | 'meeting_reminder'
  | 'task_reminder'
  | 'break_reminder'
  | 'evening_wrap'
  | 'encouragement'
  | 'body_doubling'
  | 'overload_warning'
  | 'focus_end';

export interface NotificationTemplate {
  title: string;
  body: string;
  icon?: string;
  tag: string;
  actions?: { action: string; title: string }[];
  requireInteraction?: boolean;
  data: {
    type: NotificationType;
    [key: string]: any;
  };
}

// 아침 브리핑 템플릿
export const MORNING_BRIEFING_TEMPLATES: NotificationTemplate[] = [
  {
    title: '🎩 좋은 아침이에요!',
    body: '오늘 일정 확인하러 오세요.',
    tag: 'morning-briefing',
    actions: [
      { action: 'view', title: '브리핑 보기' },
      { action: 'snooze', title: '5분 후' }
    ],
    data: { type: 'morning_briefing' }
  },
  {
    title: '🎩 일어나셨어요?',
    body: '오늘 하루 시작해볼까요?',
    tag: 'morning-briefing',
    actions: [
      { action: 'view', title: '시작하기' },
      { action: 'snooze', title: '조금만 더' }
    ],
    data: { type: 'morning_briefing' }
  }
];

// 미팅 리마인더 템플릿
export function getMeetingReminderTemplate(
  meetingTitle: string,
  minutesBefore: number
): NotificationTemplate {
  return {
    title: '🎩 미팅 알림',
    body: minutesBefore > 0 
      ? `${minutesBefore}분 후 "${meetingTitle}" 시작해요!`
      : `"${meetingTitle}" 지금 시작이에요!`,
    tag: `meeting-${Date.now()}`,
    actions: [
      { action: 'view', title: '확인' },
      { action: 'dismiss', title: '닫기' }
    ],
    requireInteraction: minutesBefore <= 5,
    data: { 
      type: 'meeting_reminder',
      meetingTitle,
      minutesBefore
    }
  };
}

// 태스크 리마인더 템플릿
export function getTaskReminderTemplate(
  taskTitle: string,
  context?: string
): NotificationTemplate {
  const bodies = [
    `"${taskTitle}" 시작할 시간이에요!`,
    `이것부터 해볼까요? "${taskTitle}"`,
    `${context || '지금'} "${taskTitle}" 어때요?`
  ];
  
  return {
    title: '🎩 태스크 알림',
    body: bodies[Math.floor(Math.random() * bodies.length)],
    tag: `task-${Date.now()}`,
    actions: [
      { action: 'start_focus', title: '집중 시작' },
      { action: 'snooze', title: '나중에' }
    ],
    data: { 
      type: 'task_reminder',
      taskTitle
    }
  };
}

// 휴식 알림 템플릿
export const BREAK_REMINDER_TEMPLATES: NotificationTemplate[] = [
  {
    title: '🎩 쉬어가요',
    body: '집중 잘 하고 있어요! 잠깐 스트레칭 어때요?',
    tag: 'break-reminder',
    actions: [
      { action: 'view', title: '5분 휴식' },
      { action: 'dismiss', title: '계속 할게요' }
    ],
    data: { type: 'break_reminder' }
  },
  {
    title: '🎩 눈 좀 쉬세요',
    body: '20-20-20 규칙! 20초간 20피트(6m) 먼 곳을 보세요.',
    tag: 'break-reminder',
    actions: [
      { action: 'dismiss', title: '알겠어요' }
    ],
    data: { type: 'break_reminder' }
  },
  {
    title: '🎩 물 마실 시간',
    body: '수분 보충도 집중력에 도움이 돼요!',
    tag: 'break-reminder',
    actions: [
      { action: 'dismiss', title: '마셨어요!' }
    ],
    data: { type: 'break_reminder' }
  }
];

// 저녁 마무리 템플릿
export const EVENING_WRAP_TEMPLATES: NotificationTemplate[] = [
  {
    title: '🎩 하루 마무리',
    body: '오늘 수고했어요! 내일 준비하고 쉬세요.',
    tag: 'evening-wrap',
    actions: [
      { action: 'view', title: '마무리 보기' },
      { action: 'dismiss', title: '나중에' }
    ],
    data: { type: 'evening_wrap' }
  },
  {
    title: '🎩 퇴근 시간이에요',
    body: '오늘 잘했어요. 이제 쉬세요!',
    tag: 'evening-wrap',
    actions: [
      { action: 'view', title: '오늘 돌아보기' }
    ],
    data: { type: 'evening_wrap' }
  }
];

// 격려 메시지 템플릿
export const ENCOURAGEMENT_TEMPLATES: NotificationTemplate[] = [
  {
    title: '🎩 잘하고 있어요!',
    body: '오늘 벌써 많이 했어요. 이 페이스 좋아요!',
    tag: 'encouragement',
    data: { type: 'encouragement' }
  },
  {
    title: '🎩 파이팅!',
    body: '힘든 일도 조금씩 하면 끝나요. 할 수 있어요!',
    tag: 'encouragement',
    data: { type: 'encouragement' }
  },
  {
    title: '🎩 대단해요!',
    body: '오늘 집중 시간이 벌써 2시간! 👏',
    tag: 'encouragement',
    data: { type: 'encouragement' }
  }
];

// 과부하 경고 템플릿
export function getOverloadWarningTemplate(
  meetingCount: number
): NotificationTemplate {
  return {
    title: '🎩 오늘 빡세네요',
    body: `미팅 ${meetingCount}개... 사이사이 숨 쉬세요!`,
    tag: 'overload-warning',
    actions: [
      { action: 'view', title: '일정 보기' }
    ],
    data: { 
      type: 'overload_warning',
      meetingCount
    }
  };
}

// 바디더블링 권유 템플릿
export const BODY_DOUBLING_TEMPLATES: NotificationTemplate[] = [
  {
    title: '🎩 같이 일할까요?',
    body: '바디더블링 모드로 옆에서 함께 할게요.',
    tag: 'body-doubling',
    actions: [
      { action: 'start_focus', title: '같이 시작' },
      { action: 'snooze', title: '나중에' }
    ],
    data: { type: 'body_doubling' }
  }
];

// 집중 종료 템플릿
export function getFocusEndTemplate(
  duration: number,
  taskTitle?: string
): NotificationTemplate {
  return {
    title: '🎩 집중 완료!',
    body: taskTitle 
      ? `${duration}분 동안 "${taskTitle}" 끝냈어요! 🎉`
      : `${duration}분 집중 완료! 수고했어요 🎉`,
    tag: 'focus-end',
    actions: [
      { action: 'view', title: '결과 보기' }
    ],
    data: { 
      type: 'focus_end',
      duration,
      taskTitle
    }
  };
}

// 랜덤 템플릿 선택
export function getRandomTemplate<T>(templates: T[]): T {
  return templates[Math.floor(Math.random() * templates.length)];
}
