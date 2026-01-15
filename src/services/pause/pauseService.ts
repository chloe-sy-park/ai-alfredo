/**
 * Exit & Pause 서비스
 * 사용자의 일시정지, 휴식, 작별 관리
 */

import {
  PauseState,
  PauseReason,
  PauseDuration,
  ExitExperience,
  WelcomeBackMessage,
  PauseReminder,
  GOODBYE_MESSAGES,
  WELCOME_BACK_TEMPLATES,
  PAUSE_DURATION_LABELS
} from './types';

const PAUSE_STATE_KEY = 'alfredo_pause_state';
const PAUSE_HISTORY_KEY = 'alfredo_pause_history';
const REMINDER_KEY = 'alfredo_pause_reminders';

/**
 * 일시정지 상태 로드
 */
export function loadPauseState(): PauseState {
  try {
    const stored = localStorage.getItem(PAUSE_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load pause state:', e);
  }
  return { isPaused: false };
}

/**
 * 일시정지 상태 저장
 */
function savePauseState(state: PauseState): void {
  try {
    localStorage.setItem(PAUSE_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save pause state:', e);
  }
}

/**
 * 일시정지 시작
 */
export function startPause(
  reason: PauseReason,
  duration: PauseDuration,
  personalMessage?: string
): PauseState {
  const expectedReturnDate = calculateExpectedReturn(duration);

  const state: PauseState = {
    isPaused: true,
    pausedAt: new Date().toISOString(),
    reason,
    duration,
    expectedReturnDate,
    personalMessage
  };

  savePauseState(state);
  recordPauseHistory('start', state);

  return state;
}

/**
 * 일시정지 종료 (복귀)
 */
export function endPause(): WelcomeBackMessage {
  const currentState = loadPauseState();
  const daysPaused = currentState.pausedAt
    ? Math.floor((Date.now() - new Date(currentState.pausedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // 상태 초기화
  const newState: PauseState = { isPaused: false };
  savePauseState(newState);
  recordPauseHistory('end', { ...currentState, returnedAt: new Date().toISOString() });

  // 환영 메시지 생성
  return generateWelcomeBack(daysPaused);
}

/**
 * 예상 복귀일 계산
 */
function calculateExpectedReturn(duration: PauseDuration): string | undefined {
  const now = new Date();

  switch (duration) {
    case 'few_days':
      now.setDate(now.getDate() + 3);
      break;
    case 'week':
      now.setDate(now.getDate() + 7);
      break;
    case 'two_weeks':
      now.setDate(now.getDate() + 14);
      break;
    case 'month':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'indefinite':
      return undefined;
  }

  return now.toISOString();
}

/**
 * 작별 인사 생성
 */
export function generateGoodbyeMessage(reason: PauseReason): string {
  const messages = GOODBYE_MESSAGES[reason];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * 복귀 환영 메시지 생성
 */
export function generateWelcomeBack(daysPaused: number): WelcomeBackMessage {
  let category: 'short' | 'medium' | 'long';

  if (daysPaused <= 3) {
    category = 'short';
  } else if (daysPaused <= 14) {
    category = 'medium';
  } else {
    category = 'long';
  }

  const templates = WELCOME_BACK_TEMPLATES[category];
  const template = templates[Math.floor(Math.random() * templates.length)];

  return {
    ...template,
    stats: {
      daysPaused
    }
  };
}

/**
 * 일시정지 이력 기록
 */
interface PauseHistoryEntry {
  action: 'start' | 'end';
  timestamp: string;
  state: PauseState & { returnedAt?: string };
}

function recordPauseHistory(
  action: 'start' | 'end',
  state: PauseState & { returnedAt?: string }
): void {
  try {
    const stored = localStorage.getItem(PAUSE_HISTORY_KEY);
    const history: PauseHistoryEntry[] = stored ? JSON.parse(stored) : [];

    history.push({
      action,
      timestamp: new Date().toISOString(),
      state
    });

    // 최근 50개만 유지
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }

    localStorage.setItem(PAUSE_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to record pause history:', e);
  }
}

/**
 * 일시정지 이력 로드
 */
export function loadPauseHistory(): PauseHistoryEntry[] {
  try {
    const stored = localStorage.getItem(PAUSE_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load pause history:', e);
  }
  return [];
}

/**
 * 리마인더 설정
 */
export function setReminder(date: Date, message?: string): PauseReminder {
  const reminder: PauseReminder = {
    id: `reminder_${Date.now()}`,
    scheduledFor: date.toISOString(),
    message: message || '알프레도가 기다리고 있어요! 다시 만날 준비 됐나요?',
    sent: false
  };

  try {
    const stored = localStorage.getItem(REMINDER_KEY);
    const reminders: PauseReminder[] = stored ? JSON.parse(stored) : [];
    reminders.push(reminder);
    localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed to set reminder:', e);
  }

  return reminder;
}

/**
 * 리마인더 로드
 */
export function loadReminders(): PauseReminder[] {
  try {
    const stored = localStorage.getItem(REMINDER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load reminders:', e);
  }
  return [];
}

/**
 * 펜딩 리마인더 체크
 */
export function checkPendingReminders(): PauseReminder[] {
  const reminders = loadReminders();
  const now = new Date();

  return reminders.filter(r =>
    !r.sent && new Date(r.scheduledFor) <= now
  );
}

/**
 * 리마인더 완료 표시
 */
export function markReminderSent(reminderId: string): void {
  try {
    const stored = localStorage.getItem(REMINDER_KEY);
    const reminders: PauseReminder[] = stored ? JSON.parse(stored) : [];

    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder) {
      reminder.sent = true;
      localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
    }
  } catch (e) {
    console.error('Failed to mark reminder sent:', e);
  }
}

/**
 * 떠남 경험 처리
 */
export function processExitExperience(experience: ExitExperience): {
  goodbyeMessage: string;
  state: PauseState;
} {
  let state: PauseState;
  let goodbyeMessage: string;

  switch (experience.type) {
    case 'pause':
      state = startPause(
        experience.reason || 'other',
        experience.duration || 'week',
        experience.feedback
      );
      goodbyeMessage = generateGoodbyeMessage(experience.reason || 'other');

      if (experience.wantReminder && experience.reminderDate) {
        setReminder(new Date(experience.reminderDate));
      }
      break;

    case 'break':
      state = startPause(
        experience.reason || 'mental_break',
        'indefinite',
        experience.feedback
      );
      goodbyeMessage = generateGoodbyeMessage(experience.reason || 'mental_break');
      break;

    case 'goodbye':
      if (!experience.keepData) {
        // 데이터 삭제 옵션 (실제 삭제는 별도 확인 후)
        state = { isPaused: true, reason: 'other' };
      } else {
        state = startPause('other', 'indefinite');
      }
      goodbyeMessage = '그동안 함께해서 좋았어요. 언제든 다시 만나요. 👋';
      break;

    default:
      state = { isPaused: false };
      goodbyeMessage = '나중에 또 만나요!';
  }

  return { goodbyeMessage, state };
}

/**
 * 일시정지 중인지 확인
 */
export function isPaused(): boolean {
  return loadPauseState().isPaused;
}

/**
 * 일시정지 기간 텍스트
 */
export function getPauseDurationText(): string {
  const state = loadPauseState();
  if (!state.isPaused || !state.pausedAt) return '';

  const daysPaused = Math.floor(
    (Date.now() - new Date(state.pausedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysPaused === 0) return '오늘부터';
  if (daysPaused === 1) return '어제부터';
  return `${daysPaused}일째`;
}

/**
 * 예상 복귀까지 남은 기간
 */
export function getDaysUntilReturn(): number | null {
  const state = loadPauseState();
  if (!state.expectedReturnDate) return null;

  const diff = new Date(state.expectedReturnDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * 일시정지 상태 요약
 */
export function getPauseSummary(): {
  isPaused: boolean;
  reason?: string;
  duration?: string;
  daysPaused?: number;
  daysUntilReturn?: number | null;
} {
  const state = loadPauseState();

  if (!state.isPaused) {
    return { isPaused: false };
  }

  const daysPaused = state.pausedAt
    ? Math.floor((Date.now() - new Date(state.pausedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    isPaused: true,
    reason: state.reason,
    duration: state.duration ? PAUSE_DURATION_LABELS[state.duration] : undefined,
    daysPaused,
    daysUntilReturn: getDaysUntilReturn()
  };
}
