import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ⏱️ Focus Sessions Hook (Supabase Direct Mode)
// - Supabase 클라이언트 직접 사용
// - localStorage 백업
// - 타이머 관리

// 테스트용 사용자 ID
var TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// localStorage 키
var STORAGE_KEY = 'alfredo_focus_sessions';
var ACTIVE_SESSION_KEY = 'alfredo_active_focus_session';

// localStorage 데이터 로드
var loadSessionsData = function() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

var loadActiveSession = function() {
  try {
    var data = localStorage.getItem(ACTIVE_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

// localStorage 데이터 저장
var saveSessionsData = function(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save sessions:', e);
  }
};

var saveActiveSession = function(session) {
  try {
    if (session) {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to save active session:', e);
  }
};

export function useFocusSessions() {
  var sessionsState = useState(function() {
    return loadSessionsData();
  });
  var sessions = sessionsState[0];
  var setSessions = sessionsState[1];
  
  var activeSessionState = useState(function() {
    return loadActiveSession();
  });
  var activeSession = activeSessionState[0];
  var setActiveSession = activeSessionState[1];
  
  var loadingState = useState(false);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];
  
  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];
  
  var pausedState = useState(false);
  var isPaused = pausedState[0];
  var setIsPaused = pausedState[1];
  
  var elapsedState = useState(0);
  var elapsedTime = elapsedState[0];
  var setElapsedTime = elapsedState[1];
  
  var timerRef = useRef(null);

  // 타이머 시작
  var startTimer = useCallback(function() {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(function() {
      setElapsedTime(function(prev) { return prev + 1; });
    }, 1000);
  }, []);

  // 타이머 정지
  var stopTimer = useCallback(function() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 진행 중인 세션 복원
  useEffect(function() {
    if (activeSession && !activeSession.ended_at) {
      var startedAt = new Date(activeSession.started_at).getTime();
      var elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setElapsedTime(elapsed);
      startTimer();
    }
    
    return function() {
      stopTimer();
    };
  }, []);

  // 세션 목록 조회
  var fetchSessions = useCallback(async function() {
    setIsLoading(true);
    setError(null);

    try {
      var { data, error: dbError } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .order('started_at', { ascending: false })
        .limit(50);

      if (dbError) {
        console.error('Sessions fetch error:', dbError);
        setError(dbError.message);
        return;
      }

      setSessions(data || []);
      saveSessionsData(data || []);

      // 진행 중인 세션 확인
      var active = (data || []).find(function(s) {
        return !s.ended_at;
      });
      
      if (active) {
        setActiveSession(active);
        saveActiveSession(active);
        var startedAt = new Date(active.started_at).getTime();
        var elapsed = Math.floor((Date.now() - startedAt) / 1000);
        setElapsedTime(elapsed);
        startTimer();
      }
    } catch (e) {
      console.error('Sessions fetch failed:', e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [startTimer]);

  // 세션 시작
  var startSession = useCallback(async function(options) {
    var opts = options || {};
    
    if (activeSession) {
      setError('이미 진행 중인 세션이 있습니다');
      return null;
    }

    try {
      var sessionData = {
        user_id: TEST_USER_ID,
        mode: opts.mode || 'pomodoro',
        planned_minutes: opts.plannedMinutes || 25,
        task_id: opts.taskId || null,
        started_at: new Date().toISOString()
      };

      var { data: newSession, error: dbError } = await supabase
        .from('focus_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (dbError) {
        console.error('Session start error:', dbError);
        setError(dbError.message);
        return null;
      }

      setActiveSession(newSession);
      saveActiveSession(newSession);
      setElapsedTime(0);
      setIsPaused(false);
      startTimer();

      console.log('✅ 집중 세션 시작:', newSession.mode);
      return newSession;
    } catch (e) {
      console.error('Session start failed:', e);
      setError(e.message);
      return null;
    }
  }, [activeSession, startTimer]);

  // 세션 종료
  var endSession = useCallback(async function(options) {
    var opts = options || {};
    
    if (!activeSession) {
      setError('진행 중인 세션이 없습니다');
      return null;
    }

    try {
      stopTimer();
      
      var actualMinutes = Math.floor(elapsedTime / 60);
      var endReason = opts.completed !== false ? 'completed' : 'cancelled';
      
      var { data: endedSession, error: dbError } = await supabase
        .from('focus_sessions')
        .update({
          ended_at: new Date().toISOString(),
          actual_minutes: actualMinutes,
          end_reason: endReason
        })
        .eq('id', activeSession.id)
        .select()
        .single();

      if (dbError) {
        console.error('Session end error:', dbError);
        setError(dbError.message);
        startTimer(); // 실패 시 타이머 재시작
        return null;
      }

      // XP 보상 (완료 시)
      var xpReward = 0;
      if (endReason === 'completed' && actualMinutes >= 5) {
        xpReward = Math.min(actualMinutes, 60); // 분당 1XP, 최대 60XP
        
        var { data: penguin } = await supabase
          .from('penguin_status')
          .select('current_xp, total_xp')
          .eq('user_id', TEST_USER_ID)
          .single();

        if (penguin) {
          await supabase
            .from('penguin_status')
            .update({
              current_xp: penguin.current_xp + xpReward,
              total_xp: penguin.total_xp + xpReward
            })
            .eq('user_id', TEST_USER_ID);

          await supabase
            .from('xp_history')
            .insert({
              user_id: TEST_USER_ID,
              amount: xpReward,
              source: 'focus_session',
              description: actualMinutes + '분 집중 세션 완료'
            });
        }
      }

      setActiveSession(null);
      saveActiveSession(null);
      setElapsedTime(0);
      setIsPaused(false);

      // 세션 목록 업데이트
      setSessions(function(prev) {
        var updated = [endedSession].concat(prev.filter(function(s) {
          return s.id !== endedSession.id;
        }));
        saveSessionsData(updated);
        return updated;
      });

      console.log('✅ 집중 세션 종료:', actualMinutes + '분', xpReward > 0 ? '+' + xpReward + 'XP' : '');
      return { session: endedSession, rewards: { xp: xpReward } };
    } catch (e) {
      console.error('Session end failed:', e);
      setError(e.message);
      return null;
    }
  }, [activeSession, elapsedTime, stopTimer, startTimer]);

  // 세션 일시정지
  var pauseSession = useCallback(async function() {
    if (!activeSession || isPaused) {
      return false;
    }

    try {
      stopTimer();
      setIsPaused(true);
      console.log('⏸️ 세션 일시정지');
      return true;
    } catch (e) {
      startTimer();
      setError(e.message);
      return false;
    }
  }, [activeSession, isPaused, startTimer, stopTimer]);

  // 세션 재개
  var resumeSession = useCallback(async function() {
    if (!activeSession || !isPaused) {
      return false;
    }

    try {
      setIsPaused(false);
      startTimer();
      console.log('▶️ 세션 재개');
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }, [activeSession, isPaused, startTimer]);

  // 오늘 총 집중 시간
  var todayFocusTime = sessions.reduce(function(total, session) {
    if (!session.ended_at) return total;
    
    var sessionDate = new Date(session.started_at).toDateString();
    var today = new Date().toDateString();
    
    if (sessionDate === today && session.actual_minutes) {
      return total + session.actual_minutes;
    }
    return total;
  }, 0);

  // 포맷된 경과 시간 (MM:SS)
  var formattedElapsed = (function() {
    var mins = Math.floor(elapsedTime / 60);
    var secs = elapsedTime % 60;
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  })();

  return {
    // 상태
    sessions: sessions,
    activeSession: activeSession,
    isLoading: isLoading,
    error: error,
    isPaused: isPaused,
    elapsedTime: elapsedTime,
    formattedElapsed: formattedElapsed,
    
    // 통계
    todayFocusTime: todayFocusTime,
    
    // 조회
    fetchSessions: fetchSessions,
    
    // 액션
    startSession: startSession,
    endSession: endSession,
    pauseSession: pauseSession,
    resumeSession: resumeSession
  };
}

export default useFocusSessions;
