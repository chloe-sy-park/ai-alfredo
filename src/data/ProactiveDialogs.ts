/**
 * ProactiveDialogs.ts
 * 알프레도 선제적 대화 데이터 (TypeScript)
 * 
 * 50개 이상의 상황별 대화 트리거와 메시지
 * ADHD 친화적 - 부드럽고 격려하는 톤
 */

import type { NudgeContext } from '@/components/home/ProactiveNudge';

// 트리거 타입
export const TRIGGER_TYPES = {
  APP_OPEN: 'app_open',           // 앱 실행 시
  TIME_BASED: 'time_based',       // 특정 시간대
  DAY_BASED: 'day_based',         // 특정 요일
  CALENDAR_AWARE: 'calendar_aware', // 캘린더 일정 기반
  TASK_CONTEXT: 'task_context',   // 태스크 상태 기반
  ENERGY_AWARE: 'energy_aware',   // 에너지 레벨 기반
  ACHIEVEMENT: 'achievement',     // 성취 기반
  IDLE: 'idle',                   // 비활성 상태
} as const;

export type TriggerType = typeof TRIGGER_TYPES[keyof typeof TRIGGER_TYPES];

// 액션 타입
export const ACTION_TYPES = {
  OPEN_BRIEFING: 'open_briefing',
  OPEN_TASKS: 'open_tasks',
  OPEN_CALENDAR: 'open_calendar',
  START_FOCUS: 'start_focus',
  LOG_CONDITION: 'log_condition',
  SHOW_ACHIEVEMENT: 'show_achievement',
  OPEN_CHAT: 'open_chat',
  DISMISS: 'dismiss',
  TAKE_BREAK: 'take_break',
  DRINK_WATER: 'drink_water',
  STRETCH: 'stretch',
  REVIEW_DAY: 'review_day',
} as const;

export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES];

// 대화 타입 정의
export interface ProactiveDialog {
  id: string;
  trigger: TriggerType;
  condition?: (ctx: NudgeContext) => boolean;
  messages: string[];
  emoji: string;
  responses?: Array<{
    label: string;
    action: ActionType | string;
    followUp?: string;
  }>;
  priority: number;       // 높을수록 우선 표시
  cooldownMinutes: number; // 같은 대화 재표시까지 대기 시간
  maxPerDay: number;       // 하루 최대 표시 횟수
  timeRange?: {           // 표시 가능 시간대
    start: number;        // 0-23
    end: number;
  };
  dayOfWeek?: number[];   // 표시 가능 요일 (0=일, 6=토)
}

// ============================================
// 선제적 대화 데이터
// ============================================

export const PROACTIVE_DIALOGS: ProactiveDialog[] = [
  // ==========================================
  // 1. 앱 실행 시 (APP_OPEN)
  // ==========================================
  {
    id: 'morning_greeting_early',
    trigger: TRIGGER_TYPES.APP_OPEN,
    condition: (ctx) => ctx.isFirstVisitToday === true,
    messages: [
      '좋은 아침이에요! ☀️ 오늘 하루도 함께해요.',
      '일찍 오셨네요! 오늘 컨디션은 어때요?',
      '새로운 하루가 시작됐어요. 천천히 시작해볼까요?',
    ],
    emoji: '🌅',
    responses: [
      { label: '브리핑 들을래', action: ACTION_TYPES.OPEN_BRIEFING, followUp: '좋아요! 오늘 일정 알려드릴게요 📋' },
      { label: '잠깐만', action: ACTION_TYPES.DISMISS, followUp: '네, 준비되면 불러주세요 😊' },
    ],
    priority: 100,
    cooldownMinutes: 60,
    maxPerDay: 1,
    timeRange: { start: 5, end: 10 },
  },
  {
    id: 'morning_greeting_late',
    trigger: TRIGGER_TYPES.APP_OPEN,
    condition: (ctx) => ctx.isFirstVisitToday === true,
    messages: [
      '안녕하세요! 오늘 하루 어떻게 보내실 건가요?',
      '점심 시간이네요! 오늘 남은 일정 확인해볼까요?',
    ],
    emoji: '👋',
    responses: [
      { label: '일정 볼래', action: ACTION_TYPES.OPEN_CALENDAR },
      { label: '괜찮아', action: ACTION_TYPES.DISMISS },
    ],
    priority: 90,
    cooldownMinutes: 60,
    maxPerDay: 1,
    timeRange: { start: 10, end: 14 },
  },
  {
    id: 'afternoon_greeting',
    trigger: TRIGGER_TYPES.APP_OPEN,
    condition: (ctx) => ctx.isFirstVisitToday === true,
    messages: [
      '오후도 화이팅! 남은 할 일 확인해볼까요?',
      '점심 맛있게 드셨어요? 오후 일정 정리해드릴게요.',
    ],
    emoji: '☕',
    responses: [
      { label: '할 일 볼래', action: ACTION_TYPES.OPEN_TASKS },
      { label: '나중에', action: ACTION_TYPES.DISMISS },
    ],
    priority: 85,
    cooldownMinutes: 60,
    maxPerDay: 1,
    timeRange: { start: 14, end: 18 },
  },
  {
    id: 'evening_greeting',
    trigger: TRIGGER_TYPES.APP_OPEN,
    condition: (ctx) => ctx.isFirstVisitToday === true,
    messages: [
      '저녁이에요! 오늘 하루 어땠어요?',
      '오늘 하루 수고하셨어요. 정리해볼까요?',
    ],
    emoji: '🌙',
    responses: [
      { label: '하루 정리', action: ACTION_TYPES.REVIEW_DAY },
      { label: '괜찮아', action: ACTION_TYPES.DISMISS },
    ],
    priority: 80,
    cooldownMinutes: 60,
    maxPerDay: 1,
    timeRange: { start: 18, end: 23 },
  },

  // ==========================================
  // 2. 시간대 기반 (TIME_BASED)
  // ==========================================
  {
    id: 'focus_time_morning',
    trigger: TRIGGER_TYPES.TIME_BASED,
    messages: [
      '오전 집중 시간이에요! 가장 중요한 일 하나 시작해볼까요?',
      '지금이 집중하기 좋은 시간이에요. 뭐부터 할까요?',
    ],
    emoji: '🎯',
    responses: [
      { label: '집중 시작', action: ACTION_TYPES.START_FOCUS },
      { label: '할 일 볼래', action: ACTION_TYPES.OPEN_TASKS },
    ],
    priority: 70,
    cooldownMinutes: 120,
    maxPerDay: 2,
    timeRange: { start: 9, end: 11 },
  },
  {
    id: 'lunch_break_reminder',
    trigger: TRIGGER_TYPES.TIME_BASED,
    messages: [
      '점심 시간이에요! 잠깐 쉬어가세요 🍱',
      '밥은 드셨어요? 잠깐 휴식 어때요?',
    ],
    emoji: '🍽️',
    responses: [
      { label: '쉴게요', action: ACTION_TYPES.TAKE_BREAK, followUp: '맛있게 드세요! 🍱' },
      { label: '조금만 더', action: ACTION_TYPES.DISMISS },
    ],
    priority: 60,
    cooldownMinutes: 180,
    maxPerDay: 1,
    timeRange: { start: 12, end: 13 },
  },
  {
    id: 'afternoon_slump',
    trigger: TRIGGER_TYPES.TIME_BASED,
    messages: [
      '오후 3시, 졸릴 수 있는 시간이에요. 물 한 잔 어때요?',
      '잠깐 스트레칭 하면 더 집중할 수 있을 거예요!',
    ],
    emoji: '💧',
    responses: [
      { label: '물 마실래', action: ACTION_TYPES.DRINK_WATER, followUp: '좋아요! 수분 보충 중요해요 💧' },
      { label: '스트레칭', action: ACTION_TYPES.STRETCH },
    ],
    priority: 55,
    cooldownMinutes: 180,
    maxPerDay: 1,
    timeRange: { start: 14, end: 16 },
  },
  {
    id: 'end_of_day',
    trigger: TRIGGER_TYPES.TIME_BASED,
    messages: [
      '퇴근 시간이 다가오고 있어요. 오늘 마무리할 것 있나요?',
      '하루를 정리할 시간이에요. 내일을 위해 준비해볼까요?',
    ],
    emoji: '📝',
    responses: [
      { label: '정리할래', action: ACTION_TYPES.REVIEW_DAY },
      { label: '내일 할게', action: ACTION_TYPES.DISMISS },
    ],
    priority: 65,
    cooldownMinutes: 240,
    maxPerDay: 1,
    timeRange: { start: 17, end: 19 },
  },

  // ==========================================
  // 3. 요일 기반 (DAY_BASED)
  // ==========================================
  {
    id: 'monday_motivation',
    trigger: TRIGGER_TYPES.DAY_BASED,
    messages: [
      '월요일이에요! 이번 주 목표는 뭔가요?',
      '새로운 한 주가 시작됐어요. 천천히 시작해봐요 💪',
    ],
    emoji: '🚀',
    responses: [
      { label: '목표 설정', action: ACTION_TYPES.OPEN_TASKS },
      { label: '천천히', action: ACTION_TYPES.DISMISS },
    ],
    priority: 75,
    cooldownMinutes: 480,
    maxPerDay: 1,
    dayOfWeek: [1], // 월요일
  },
  {
    id: 'wednesday_checkin',
    trigger: TRIGGER_TYPES.DAY_BASED,
    messages: [
      '벌써 수요일! 이번 주 절반 왔어요. 잘 하고 계세요 👍',
      '주중 반환점이에요. 남은 할 일 체크해볼까요?',
    ],
    emoji: '✨',
    responses: [
      { label: '할 일 체크', action: ACTION_TYPES.OPEN_TASKS },
      { label: '괜찮아', action: ACTION_TYPES.DISMISS },
    ],
    priority: 70,
    cooldownMinutes: 480,
    maxPerDay: 1,
    dayOfWeek: [3], // 수요일
  },
  {
    id: 'friday_wrap',
    trigger: TRIGGER_TYPES.DAY_BASED,
    messages: [
      '금요일이에요! 🎉 이번 주 마무리 잘 해봐요.',
      '주말이 코앞이에요. 이번 주 정리하고 쉬어요!',
    ],
    emoji: '🎊',
    responses: [
      { label: '주간 정리', action: ACTION_TYPES.REVIEW_DAY },
      { label: '월요일에', action: ACTION_TYPES.DISMISS },
    ],
    priority: 75,
    cooldownMinutes: 480,
    maxPerDay: 1,
    dayOfWeek: [5], // 금요일
  },

  // ==========================================
  // 4. 캘린더 기반 (CALENDAR_AWARE)
  // ==========================================
  {
    id: 'busy_day_support',
    trigger: TRIGGER_TYPES.CALENDAR_AWARE,
    condition: (ctx) => (ctx.calendarEventsToday || 0) >= 5,
    messages: [
      '오늘 일정이 많네요. 무리하지 마세요!',
      '바쁜 하루가 될 것 같아요. 중간중간 쉬어가세요.',
    ],
    emoji: '💪',
    responses: [
      { label: '일정 확인', action: ACTION_TYPES.OPEN_CALENDAR },
      { label: '알겠어', action: ACTION_TYPES.DISMISS, followUp: '화이팅! 제가 옆에 있을게요 🐧' },
    ],
    priority: 80,
    cooldownMinutes: 480,
    maxPerDay: 1,
  },
  {
    id: 'light_day',
    trigger: TRIGGER_TYPES.CALENDAR_AWARE,
    condition: (ctx) => (ctx.calendarEventsToday || 0) <= 2,
    messages: [
      '오늘은 여유로운 날이네요! 미뤄둔 일 해볼까요?',
      '일정이 적은 날이에요. 딥워크 하기 좋은 날!',
    ],
    emoji: '☀️',
    responses: [
      { label: '집중 시작', action: ACTION_TYPES.START_FOCUS },
      { label: '쉴래', action: ACTION_TYPES.DISMISS },
    ],
    priority: 65,
    cooldownMinutes: 480,
    maxPerDay: 1,
  },

  // ==========================================
  // 5. 태스크 기반 (TASK_CONTEXT)
  // ==========================================
  {
    id: 'many_tasks',
    trigger: TRIGGER_TYPES.TASK_CONTEXT,
    condition: (ctx) => (ctx.taskCount || 0) > 5,
    messages: [
      '할 일이 많네요. 가장 중요한 것 3개만 골라볼까요?',
      '우선순위를 정하면 덜 부담스러워요. 도와드릴까요?',
    ],
    emoji: '📋',
    responses: [
      { label: '정리 도와줘', action: ACTION_TYPES.OPEN_TASKS },
      { label: '혼자 할게', action: ACTION_TYPES.DISMISS },
    ],
    priority: 75,
    cooldownMinutes: 240,
    maxPerDay: 2,
  },
  {
    id: 'no_tasks',
    trigger: TRIGGER_TYPES.TASK_CONTEXT,
    condition: (ctx) => (ctx.taskCount || 0) === 0,
    messages: [
      '할 일이 비어있어요! 오늘 뭘 하고 싶으세요?',
      '깔끔하네요! 새로운 할 일을 추가해볼까요?',
    ],
    emoji: '✨',
    responses: [
      { label: '할 일 추가', action: ACTION_TYPES.OPEN_TASKS },
      { label: '쉴래', action: ACTION_TYPES.DISMISS },
    ],
    priority: 60,
    cooldownMinutes: 240,
    maxPerDay: 2,
  },

  // ==========================================
  // 6. 에너지 기반 (ENERGY_AWARE)
  // ==========================================
  {
    id: 'low_energy_support',
    trigger: TRIGGER_TYPES.ENERGY_AWARE,
    condition: (ctx) => ctx.energyLevel === 'low',
    messages: [
      '오늘 좀 힘드시군요. 작은 것부터 시작해봐요.',
      '컨디션이 안 좋을 땐 무리하지 않아도 돼요.',
      '피곤한 날엔 가벼운 일만 해도 충분해요.',
    ],
    emoji: '🫂',
    responses: [
      { label: '쉬운 일부터', action: ACTION_TYPES.OPEN_TASKS, followUp: '천천히 해도 괜찮아요 💜' },
      { label: '쉴게요', action: ACTION_TYPES.TAKE_BREAK, followUp: '푹 쉬세요! 🐧' },
    ],
    priority: 90,
    cooldownMinutes: 120,
    maxPerDay: 3,
  },
  {
    id: 'high_energy_boost',
    trigger: TRIGGER_TYPES.ENERGY_AWARE,
    condition: (ctx) => ctx.energyLevel === 'high',
    messages: [
      '오늘 컨디션 좋으시네요! 어려운 일 도전해볼까요?',
      '에너지가 넘치는 날이에요. 큰 일 해치워봐요!',
    ],
    emoji: '⚡',
    responses: [
      { label: '도전!', action: ACTION_TYPES.START_FOCUS },
      { label: '천천히', action: ACTION_TYPES.DISMISS },
    ],
    priority: 70,
    cooldownMinutes: 180,
    maxPerDay: 2,
  },

  // ==========================================
  // 7. 성취 기반 (ACHIEVEMENT)
  // ==========================================
  {
    id: 'task_completed_celebrate',
    trigger: TRIGGER_TYPES.ACHIEVEMENT,
    condition: (ctx) => (ctx.completedTaskCount || 0) >= 1,
    messages: [
      '잘했어요! 하나 끝냈네요 🎉',
      '좋아요! 이 기세로 계속 가볼까요?',
    ],
    emoji: '🎉',
    responses: [
      { label: '다음 할 일', action: ACTION_TYPES.OPEN_TASKS },
      { label: '잠깐 쉴래', action: ACTION_TYPES.TAKE_BREAK },
    ],
    priority: 85,
    cooldownMinutes: 60,
    maxPerDay: 5,
  },
  {
    id: 'all_tasks_done',
    trigger: TRIGGER_TYPES.ACHIEVEMENT,
    condition: (ctx) => 
      (ctx.taskCount || 0) > 0 && 
      (ctx.completedTaskCount || 0) === (ctx.taskCount || 0),
    messages: [
      '와! 오늘 할 일 다 끝냈어요! 🏆',
      '대단해요! 오늘 목표 달성! 🎊',
    ],
    emoji: '🏆',
    responses: [
      { label: '기분 좋아!', action: ACTION_TYPES.SHOW_ACHIEVEMENT, followUp: '정말 잘했어요! 자랑스러워요 💜' },
      { label: '더 할 거 있어', action: ACTION_TYPES.OPEN_TASKS },
    ],
    priority: 100,
    cooldownMinutes: 480,
    maxPerDay: 1,
  },
  {
    id: 'streak_celebration',
    trigger: TRIGGER_TYPES.ACHIEVEMENT,
    condition: (ctx) => (ctx.streak || 0) >= 3,
    messages: [
      `${3}일 연속 달성! 꾸준히 잘하고 계세요 🔥`,
      '연속 기록 갱신 중! 대단해요 ✨',
    ],
    emoji: '🔥',
    responses: [
      { label: '고마워!', action: ACTION_TYPES.DISMISS, followUp: '앞으로도 함께해요! 🐧' },
    ],
    priority: 80,
    cooldownMinutes: 1440, // 24시간
    maxPerDay: 1,
  },

  // ==========================================
  // 8. 격려 & 응원 메시지
  // ==========================================
  {
    id: 'random_encouragement',
    trigger: TRIGGER_TYPES.TIME_BASED,
    messages: [
      '오늘도 잘 하고 계세요. 제가 응원할게요!',
      '완벽하지 않아도 괜찮아요. 조금씩 나아가는 거예요.',
      '잠깐 쉬어가도 돼요. 마라톤이니까요.',
      '힘들 땐 말해주세요. 함께 방법을 찾아봐요.',
    ],
    emoji: '💜',
    responses: [
      { label: '고마워', action: ACTION_TYPES.DISMISS, followUp: '언제든 불러주세요! 🐧' },
    ],
    priority: 40,
    cooldownMinutes: 360,
    maxPerDay: 2,
  },
];

// ============================================
// 유틸리티 함수
// ============================================

// 대화 히스토리 저장소 키
const DIALOG_HISTORY_KEY = 'alfredo_dialog_history';

interface DialogHistoryItem {
  dialogId: string;
  timestamp: number;
  count: number;
}

interface DialogHistory {
  [dialogId: string]: DialogHistoryItem;
}

/**
 * 대화 표시 가능 여부 확인
 */
export function shouldShowDialog(dialogId: string): boolean {
  const dialog = PROACTIVE_DIALOGS.find(d => d.id === dialogId);
  if (!dialog) return false;

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  // 시간대 체크
  if (dialog.timeRange) {
    if (hour < dialog.timeRange.start || hour >= dialog.timeRange.end) {
      return false;
    }
  }

  // 요일 체크
  if (dialog.dayOfWeek && !dialog.dayOfWeek.includes(day)) {
    return false;
  }

  // 히스토리 체크
  const history = getDialogHistory();
  const dialogHistory = history[dialogId];

  if (dialogHistory) {
    const timeSinceLastShown = now.getTime() - dialogHistory.timestamp;
    const cooldownMs = dialog.cooldownMinutes * 60 * 1000;

    // 쿨다운 체크
    if (timeSinceLastShown < cooldownMs) {
      return false;
    }

    // 일일 최대 횟수 체크
    const lastShownDate = new Date(dialogHistory.timestamp).toDateString();
    const todayDate = now.toDateString();

    if (lastShownDate === todayDate && dialogHistory.count >= dialog.maxPerDay) {
      return false;
    }
  }

  return true;
}

/**
 * 대화 표시 기록
 */
export function markDialogShown(dialogId: string): void {
  const history = getDialogHistory();
  const now = new Date();
  const existing = history[dialogId];

  if (existing) {
    const lastShownDate = new Date(existing.timestamp).toDateString();
    const todayDate = now.toDateString();

    history[dialogId] = {
      dialogId,
      timestamp: now.getTime(),
      count: lastShownDate === todayDate ? existing.count + 1 : 1,
    };
  } else {
    history[dialogId] = {
      dialogId,
      timestamp: now.getTime(),
      count: 1,
    };
  }

  saveDialogHistory(history);
}

/**
 * 대화 히스토리 가져오기
 */
function getDialogHistory(): DialogHistory {
  try {
    const stored = localStorage.getItem(DIALOG_HISTORY_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * 대화 히스토리 저장
 */
function saveDialogHistory(history: DialogHistory): void {
  try {
    localStorage.setItem(DIALOG_HISTORY_KEY, JSON.stringify(history));
  } catch {
    console.warn('Failed to save dialog history');
  }
}

/**
 * 대화 히스토리 초기화
 */
export function clearDialogHistory(): void {
  try {
    localStorage.removeItem(DIALOG_HISTORY_KEY);
  } catch {
    console.warn('Failed to clear dialog history');
  }
}

/**
 * 특정 트리거 타입의 대화 목록 가져오기
 */
export function getDialogsByTrigger(trigger: TriggerType): ProactiveDialog[] {
  return PROACTIVE_DIALOGS.filter(d => d.trigger === trigger);
}

export default PROACTIVE_DIALOGS;
