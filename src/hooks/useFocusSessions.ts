import { useState, useCallback, useRef } from 'react';
import { focusApi } from '../lib/api';
import type { FocusSession, FocusMode } from '../types/database';

interface UseFocusSessionsReturn {
  sessions: FocusSession[];
  activeSession: FocusSession | null;
  isLoading: boolean;
  error: string | null;
  fetchSessions: () => Promise<void>;
  startSession: (options?: {
    mode?: FocusMode;
    plannedDuration?: number;
    taskId?: string;
    taskTitle?: string;
  }) => Promise<FocusSession | null>;
  endSession: (options?: {
    completed?: boolean;
    notes?: string;
  }) => Promise<{ session: FocusSession; rewards?: any } | null>;
  pauseSession: () => Promise<boolean>;
  resumeSession: () => Promise<boolean>;
  isPaused: boolean;
  elapsedTime: number;
}

export function useFocusSessions(): UseFocusSessionsReturn {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 시작
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, []);

  // 타이머 정지
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 세션 목록 조회
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await focusApi.list();

      if (response.success && response.data) {
        setSessions(response.data);
        
        // 진행 중인 세션 확인
        const active = response.data.find(s => !s.ended_at);
        if (active) {
          setActiveSession(active);
          const startedAt = new Date(active.started_at).getTime();
          const elapsed = Math.floor((Date.now() - startedAt) / 1000);
          setElapsedTime(elapsed);
          startTimer();
        }
      } else {
        setError(response.error?.message || '세션 조회 실패');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }, [startTimer]);

  // 세션 시작
  const startSession = useCallback(
    async (options?: {
      mode?: FocusMode;
      plannedDuration?: number;
      taskId?: string;
      taskTitle?: string;
    }): Promise<FocusSession | null> => {
      if (activeSession) {
        setError('이미 진행 중인 세션이 있습니다');
        return null;
      }

      try {
        const response = await focusApi.start({
          mode: options?.mode || 'pomodoro',
          planned_duration: options?.plannedDuration,
          task_id: options?.taskId,
          task_title: options?.taskTitle,
        });

        if (response.success && response.data) {
          setActiveSession(response.data);
          setElapsedTime(0);
          setIsPaused(false);
          startTimer();
          return response.data;
        } else {
          setError(response.error?.message || '세션 시작 실패');
          return null;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '알 수 없는 오류');
        return null;
      }
    },
    [activeSession, startTimer]
  );

  // 세션 종료
  const endSession = useCallback(
    async (options?: {
      completed?: boolean;
      notes?: string;
    }): Promise<{ session: FocusSession; rewards?: any } | null> => {
      if (!activeSession) {
        setError('진행 중인 세션이 없습니다');
        return null;
      }

      try {
        stopTimer();

        const response = await focusApi.end(activeSession.id, {
          actual_duration: Math.floor(elapsedTime / 60),
          completed: options?.completed ?? true,
          notes: options?.notes,
        });

        if (response.success && response.data) {
          setActiveSession(null);
          setElapsedTime(0);
          setIsPaused(false);
          
          // 세션 목록 업데이트
          const result = response.data;
          const endedSession = result.session || result;
          setSessions(prev => [endedSession, ...prev]);
          
          return result;
        } else {
          setError(response.error?.message || '세션 종료 실패');
          return null;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '알 수 없는 오류');
        return null;
      }
    },
    [activeSession, elapsedTime, stopTimer]
  );

  // 세션 일시정지
  const pauseSession = useCallback(async (): Promise<boolean> => {
    if (!activeSession || isPaused) {
      return false;
    }

    try {
      stopTimer();
      const response = await focusApi.pause(activeSession.id);

      if (response.success) {
        setIsPaused(true);
        return true;
      } else {
        startTimer(); // 실패 시 타이머 재시작
        setError(response.error?.message || '일시정지 실패');
        return false;
      }
    } catch (e) {
      startTimer();
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return false;
    }
  }, [activeSession, isPaused, startTimer, stopTimer]);

  // 세션 재개
  const resumeSession = useCallback(async (): Promise<boolean> => {
    if (!activeSession || !isPaused) {
      return false;
    }

    try {
      const response = await focusApi.resume(activeSession.id);

      if (response.success) {
        setIsPaused(false);
        startTimer();
        return true;
      } else {
        setError(response.error?.message || '재개 실패');
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return false;
    }
  }, [activeSession, isPaused, startTimer]);

  return {
    sessions,
    activeSession,
    isLoading,
    error,
    fetchSessions,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    isPaused,
    elapsedTime,
  };
}

export default useFocusSessions;
