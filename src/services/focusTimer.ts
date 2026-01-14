// Focus Timer Service - 집중 타이머 (포모도로)

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  startedAt: string;
  endedAt?: string;
  duration: number; // 초 단위
  type: 'focus' | 'break' | 'longBreak';
  completed: boolean;
  createdAt: string;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentType: 'focus' | 'break' | 'longBreak';
  timeRemaining: number; // 초 단위
  sessionCount: number; // 완료한 포모도로 세션 수
  currentSessionId?: string;
}

var STORAGE_KEY = 'alfredo_focus_sessions';
var TIMER_STATE_KEY = 'alfredo_timer_state';

// 포모도로 설정 (분 -> 초 변환)
export var POMODORO_CONFIG = {
  focusDuration: 25 * 60,      // 25분
  breakDuration: 5 * 60,       // 5분
  longBreakDuration: 15 * 60,  // 15분
  sessionsUntilLongBreak: 4   // 4 세션마다 긴 휴식
};

// 집중 세션 목록 가져오기
export function getFocusSessions(): FocusSession[] {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as FocusSession[];
  } catch (e) {
    return [];
  }
}

// 집중 세션 저장
function saveFocusSessions(sessions: FocusSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save focus sessions:', e);
  }
}

// 타이머 상태 가져오기
export function getTimerState(): TimerState {
  try {
    var stored = localStorage.getItem(TIMER_STATE_KEY);
    if (!stored) {
      return {
        isRunning: false,
        isPaused: false,
        currentType: 'focus',
        timeRemaining: POMODORO_CONFIG.focusDuration,
        sessionCount: 0
      };
    }
    return JSON.parse(stored) as TimerState;
  } catch (e) {
    return {
      isRunning: false,
      isPaused: false,
      currentType: 'focus',
      timeRemaining: POMODORO_CONFIG.focusDuration,
      sessionCount: 0
    };
  }
}

// 타이머 상태 저장
export function saveTimerState(state: TimerState): void {
  try {
    localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save timer state:', e);
  }
}

// 새 세션 시작
export function startFocusSession(taskId?: string, taskTitle?: string): FocusSession {
  var state = getTimerState();
  var sessions = getFocusSessions();
  
  var newSession: FocusSession = {
    id: 'session_' + Date.now(),
    taskId: taskId,
    taskTitle: taskTitle,
    startedAt: new Date().toISOString(),
    duration: 0,
    type: state.currentType,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  sessions.push(newSession);
  saveFocusSessions(sessions);
  
  // 타이머 상태 업데이트
  state.isRunning = true;
  state.isPaused = false;
  state.currentSessionId = newSession.id;
  saveTimerState(state);
  
  return newSession;
}

// 세션 완료
export function completeFocusSession(sessionId: string): FocusSession | null {
  var sessions = getFocusSessions();
  var index = sessions.findIndex(function(s) { return s.id === sessionId; });
  if (index === -1) return null;
  
  sessions[index].endedAt = new Date().toISOString();
  sessions[index].completed = true;
  sessions[index].duration = Math.floor(
    (new Date().getTime() - new Date(sessions[index].startedAt).getTime()) / 1000
  );
  
  saveFocusSessions(sessions);
  
  // 타이머 상태 업데이트
  var state = getTimerState();
  if (sessions[index].type === 'focus') {
    state.sessionCount += 1;
  }
  
  // 다음 세션 타입 결정
  if (sessions[index].type === 'focus') {
    if (state.sessionCount % POMODORO_CONFIG.sessionsUntilLongBreak === 0) {
      state.currentType = 'longBreak';
      state.timeRemaining = POMODORO_CONFIG.longBreakDuration;
    } else {
      state.currentType = 'break';
      state.timeRemaining = POMODORO_CONFIG.breakDuration;
    }
  } else {
    state.currentType = 'focus';
    state.timeRemaining = POMODORO_CONFIG.focusDuration;
  }
  
  state.isRunning = false;
  state.isPaused = false;
  state.currentSessionId = undefined;
  saveTimerState(state);
  
  return sessions[index];
}

// 세션 중단
export function cancelFocusSession(sessionId: string): boolean {
  var sessions = getFocusSessions();
  var index = sessions.findIndex(function(s) { return s.id === sessionId; });
  if (index === -1) return false;
  
  sessions[index].endedAt = new Date().toISOString();
  sessions[index].completed = false;
  sessions[index].duration = Math.floor(
    (new Date().getTime() - new Date(sessions[index].startedAt).getTime()) / 1000
  );
  
  saveFocusSessions(sessions);
  
  // 타이머 상태 리셋
  var state = getTimerState();
  state.isRunning = false;
  state.isPaused = false;
  state.currentSessionId = undefined;
  state.timeRemaining = POMODORO_CONFIG.focusDuration;
  saveTimerState(state);
  
  return true;
}

// 타이머 일시정지/재개
export function togglePause(): void {
  var state = getTimerState();
  if (state.isRunning) {
    state.isPaused = !state.isPaused;
    saveTimerState(state);
  }
}

// 남은 시간 업데이트 (1초마다 호출)
export function updateTimeRemaining(): number {
  var state = getTimerState();
  if (!state.isRunning || state.isPaused) {
    return state.timeRemaining;
  }
  
  state.timeRemaining = Math.max(0, state.timeRemaining - 1);
  saveTimerState(state);
  
  // 타이머 종료
  if (state.timeRemaining === 0 && state.currentSessionId) {
    completeFocusSession(state.currentSessionId);
  }
  
  return state.timeRemaining;
}

// 오늘 완료한 포모도로 수
export function getTodayCompletedPomodoros(): number {
  var sessions = getFocusSessions();
  var today = new Date().toDateString();
  
  return sessions.filter(function(s) {
    return s.type === 'focus' && 
           s.completed && 
           new Date(s.startedAt).toDateString() === today;
  }).length;
}

// 오늘 총 집중 시간 (분)
export function getTodayFocusMinutes(): number {
  var sessions = getFocusSessions();
  var today = new Date().toDateString();
  
  var totalSeconds = sessions
    .filter(function(s) {
      return s.type === 'focus' && 
             s.completed && 
             new Date(s.startedAt).toDateString() === today;
    })
    .reduce(function(sum, s) {
      return sum + s.duration;
    }, 0);
    
  return Math.round(totalSeconds / 60);
}

// 태스크별 집중 시간
export function getTaskFocusMinutes(taskId: string): number {
  var sessions = getFocusSessions();
  
  var totalSeconds = sessions
    .filter(function(s) {
      return s.taskId === taskId && s.type === 'focus' && s.completed;
    })
    .reduce(function(sum, s) {
      return sum + s.duration;
    }, 0);
    
  return Math.round(totalSeconds / 60);
}

// 시간 포맷 (초 -> MM:SS)
export function formatTime(seconds: number): string {
  var minutes = Math.floor(seconds / 60);
  var secs = seconds % 60;
  return minutes + ':' + (secs < 10 ? '0' : '') + secs;
}

// 다음 세션 타입 가져오기
export function getNextSessionType(): 'focus' | 'break' | 'longBreak' {
  var state = getTimerState();
  return state.currentType;
}

// 세션 스킵
export function skipSession(): void {
  var state = getTimerState();
  
  if (state.currentType === 'focus') {
    // 포커스 세션은 스킵하면 카운트 증가 안 함
    if (state.sessionCount % POMODORO_CONFIG.sessionsUntilLongBreak === 0 && state.sessionCount > 0) {
      state.currentType = 'longBreak';
      state.timeRemaining = POMODORO_CONFIG.longBreakDuration;
    } else {
      state.currentType = 'break';
      state.timeRemaining = POMODORO_CONFIG.breakDuration;
    }
  } else {
    // 휴식 스킵
    state.currentType = 'focus';
    state.timeRemaining = POMODORO_CONFIG.focusDuration;
  }
  
  state.isRunning = false;
  state.isPaused = false;
  state.currentSessionId = undefined;
  saveTimerState(state);
}
