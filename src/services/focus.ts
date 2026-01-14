// Focus Service - 집중 타이머 (포모도로)

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  type: 'focus' | 'short_break' | 'long_break';
  duration: number; // 분 단위
  startedAt: string;
  endedAt?: string;
  completedAt?: string;
  isPaused: boolean;
  pausedDuration: number; // 일시정지 누적 시간 (초)
}

export interface FocusSettings {
  focusDuration: number; // 기본 25분
  shortBreakDuration: number; // 기본 5분
  longBreakDuration: number; // 기본 15분
  sessionsUntilLongBreak: number; // 기본 4회
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
}

var SESSIONS_KEY = 'alfredo_focus_sessions';
var SETTINGS_KEY = 'alfredo_focus_settings';
var CURRENT_SESSION_KEY = 'alfredo_current_focus';

// 기본 설정
var DEFAULT_SETTINGS: FocusSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true
};

// 설정 가져오기
export function getFocusSettings(): FocusSettings {
  try {
    var stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(stored) as FocusSettings;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

// 설정 저장
export function saveFocusSettings(settings: Partial<FocusSettings>): FocusSettings {
  var current = getFocusSettings();
  var updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

// 세션 목록 가져오기
export function getFocusSessions(): FocusSession[] {
  try {
    var stored = localStorage.getItem(SESSIONS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as FocusSession[];
  } catch (e) {
    return [];
  }
}

// 세션 저장
function saveFocusSessions(sessions: FocusSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions:', e);
  }
}

// 현재 세션 가져오기
export function getCurrentSession(): FocusSession | null {
  try {
    var stored = localStorage.getItem(CURRENT_SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as FocusSession;
  } catch (e) {
    return null;
  }
}

// 현재 세션 저장
function saveCurrentSession(session: FocusSession | null): void {
  try {
    if (session) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to save current session:', e);
  }
}

// 새 세션 시작
export function startFocusSession(taskId?: string, taskTitle?: string): FocusSession {
  // 이전 세션 정리
  var current = getCurrentSession();
  if (current && !current.completedAt) {
    completeSession(current.id);
  }

  var settings = getFocusSettings();
  var sessions = getFocusSessions();
  
  // 오늘 완료된 focus 세션 수 계산
  var today = new Date().toDateString();
  var todayFocusSessions = sessions.filter(function(s) {
    return s.type === 'focus' && 
           s.completedAt && 
           new Date(s.completedAt).toDateString() === today;
  }).length;
  
  // 다음 세션 타입 결정
  var type: FocusSession['type'] = 'focus';
  var duration = settings.focusDuration;
  
  if (current && current.type === 'focus') {
    // 방금 focus를 완료했다면 휴식
    var sessionCount = (todayFocusSessions % settings.sessionsUntilLongBreak);
    if (sessionCount === 0 && todayFocusSessions > 0) {
      type = 'long_break';
      duration = settings.longBreakDuration;
    } else {
      type = 'short_break';
      duration = settings.shortBreakDuration;
    }
  }
  
  var newSession: FocusSession = {
    id: 'focus_' + Date.now(),
    taskId: taskId,
    taskTitle: taskTitle,
    type: type,
    duration: duration,
    startedAt: new Date().toISOString(),
    isPaused: false,
    pausedDuration: 0
  };
  
  sessions.push(newSession);
  saveFocusSessions(sessions);
  saveCurrentSession(newSession);
  
  return newSession;
}

// 세션 일시정지
export function pauseSession(): FocusSession | null {
  var session = getCurrentSession();
  if (!session || session.isPaused || session.completedAt) return null;
  
  session.isPaused = true;
  saveCurrentSession(session);
  return session;
}

// 세션 재개
export function resumeSession(): FocusSession | null {
  var session = getCurrentSession();
  if (!session || !session.isPaused || session.completedAt) return null;
  
  session.isPaused = false;
  saveCurrentSession(session);
  return session;
}

// 세션 완료
export function completeSession(sessionId?: string): FocusSession | null {
  var session = sessionId ? 
    getFocusSessions().find(function(s) { return s.id === sessionId; }) :
    getCurrentSession();
    
  if (!session || session.completedAt) return null;
  
  session.endedAt = new Date().toISOString();
  session.completedAt = session.endedAt;
  
  // 세션 목록 업데이트
  var sessions = getFocusSessions();
  var targetSession = session; // 로컬 변수로 저장
  var index = sessions.findIndex(function(s) { return s.id === targetSession.id; });
  if (index >= 0) {
    sessions[index] = session;
    saveFocusSessions(sessions);
  }
  
  // 현재 세션이면 제거
  var current = getCurrentSession();
  if (current && current.id === session.id) {
    saveCurrentSession(null);
  }
  
  return session;
}

// 세션 취소
export function cancelSession(): boolean {
  var session = getCurrentSession();
  if (!session) return false;
  
  // 세션 목록에서 제거
  var sessions = getFocusSessions();
  var targetSessionId = session.id; // 로컬 변수로 저장
  var filtered = sessions.filter(function(s) { return s.id !== targetSessionId; });
  saveFocusSessions(filtered);
  
  // 현재 세션 제거
  saveCurrentSession(null);
  return true;
}

// 남은 시간 계산 (초 단위)
export function getRemainingTime(session: FocusSession): number {
  if (!session || session.completedAt) return 0;
  
  var now = new Date().getTime();
  var start = new Date(session.startedAt).getTime();
  var duration = session.duration * 60 * 1000; // 밀리초로 변환
  
  var elapsed = now - start - (session.pausedDuration * 1000);
  var remaining = duration - elapsed;
  
  return Math.max(0, Math.floor(remaining / 1000));
}

// 진행률 계산 (0-100)
export function getProgress(session: FocusSession): number {
  if (!session) return 0;
  
  var totalSeconds = session.duration * 60;
  var remainingSeconds = getRemainingTime(session);
  var elapsedSeconds = totalSeconds - remainingSeconds;
  
  return Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 100));
}

// 오늘의 세션 통계
export function getTodayStats(): {
  focusCount: number;
  totalFocusMinutes: number;
  totalBreakMinutes: number;
  completionRate: number;
} {
  var sessions = getFocusSessions();
  var today = new Date().toDateString();
  
  var todaySessions = sessions.filter(function(s) {
    return s.completedAt && new Date(s.completedAt).toDateString() === today;
  });
  
  var focusCount = 0;
  var totalFocusMinutes = 0;
  var totalBreakMinutes = 0;
  var totalStarted = 0;
  
  todaySessions.forEach(function(session) {
    if (session.type === 'focus') {
      focusCount++;
      totalFocusMinutes += session.duration;
    } else {
      totalBreakMinutes += session.duration;
    }
    totalStarted++;
  });
  
  // 시작했지만 완료하지 못한 세션도 계산
  var incompleteSessions = sessions.filter(function(s) {
    return s.startedAt && 
           !s.completedAt && 
           new Date(s.startedAt).toDateString() === today;
  });
  totalStarted += incompleteSessions.length;
  
  var completionRate = totalStarted > 0 ? 
    Math.round((todaySessions.length / totalStarted) * 100) : 0;
  
  return {
    focusCount: focusCount,
    totalFocusMinutes: totalFocusMinutes,
    totalBreakMinutes: totalBreakMinutes,
    completionRate: completionRate
  };
}

// 포모도로 세트 완료 여부
export function isPomodoroSetComplete(): boolean {
  var settings = getFocusSettings();
  var stats = getTodayStats();
  return stats.focusCount > 0 && 
         stats.focusCount % settings.sessionsUntilLongBreak === 0;
}
