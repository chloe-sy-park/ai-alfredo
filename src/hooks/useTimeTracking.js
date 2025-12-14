import { useState, useEffect, useCallback } from 'react';
import { TIME_CONFIG } from '../constants/timeConfig';

// 시간 트래킹 훅
export const useTimeTracking = (currentTask, events = [], onAlert) => {
  const [trackingState, setTrackingState] = useState({
    taskStartTime: null,           // 현재 태스크 시작 시간
    sessionStartTime: null,        // 세션 시작 시간 (연속 작업 추적)
    totalSessionMinutes: 0,        // 연속 작업 시간 (분)
    lastBreakTime: null,           // 마지막 휴식 시간
    alertHistory: {},              // 알림 히스토리 (쿨다운용)
    dismissedAlerts: new Set(),    // 닫은 알림들
  });
  
  const [activeAlert, setActiveAlert] = useState(null);
  
  // 시간 포맷 헬퍼
  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hrs > 0) return `${hrs}시간 ${mins}분`;
    return `${mins}분`;
  };
  
  // 태스크 시작
  const startTaskTracking = useCallback((task) => {
    const now = Date.now();
    setTrackingState(prev => ({
      ...prev,
      taskStartTime: now,
      sessionStartTime: prev.sessionStartTime || now,
    }));
  }, []);
  
  // 태스크 완료/중단
  const stopTaskTracking = useCallback(() => {
    setTrackingState(prev => ({
      ...prev,
      taskStartTime: null,
    }));
  }, []);
  
  // 휴식 기록
  const recordBreak = useCallback(() => {
    const now = Date.now();
    setTrackingState(prev => ({
      ...prev,
      sessionStartTime: null,
      totalSessionMinutes: 0,
      lastBreakTime: now,
    }));
    setActiveAlert(null);
  }, []);
  
  // 알림 닫기
  const dismissAlert = useCallback((alertId) => {
    setTrackingState(prev => ({
      ...prev,
      dismissedAlerts: new Set([...prev.dismissedAlerts, alertId]),
    }));
    setActiveAlert(null);
  }, []);
  
  // 알림 표시 가능 여부 체크 (쿨다운)
  const canShowAlert = useCallback((alertType, alertId) => {
    const now = Date.now();
    const lastShown = trackingState.alertHistory[alertId];
    if (lastShown && (now - lastShown) < TIME_CONFIG.alertCooldown * 60 * 1000) {
      return false;
    }
    if (trackingState.dismissedAlerts.has(alertId)) {
      return false;
    }
    return true;
  }, [trackingState.alertHistory, trackingState.dismissedAlerts]);
  
  // 알림 기록
  const recordAlert = useCallback((alertId) => {
    setTrackingState(prev => ({
      ...prev,
      alertHistory: {
        ...prev.alertHistory,
        [alertId]: Date.now(),
      },
    }));
  }, []);
  
  // 메인 시간 체크 로직 (1분마다 실행)
  useEffect(() => {
    const checkTimeAlerts = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // 1. 예상 시간 초과 체크
      if (currentTask && trackingState.taskStartTime && currentTask.estimatedMinutes) {
        const elapsedMinutes = (Date.now() - trackingState.taskStartTime) / (1000 * 60);
        const threshold = currentTask.estimatedMinutes * TIME_CONFIG.overtimeThreshold;
        
        if (elapsedMinutes >= threshold) {
          const alertId = `overtime_${currentTask.id}`;
          if (canShowAlert('overtime', alertId)) {
            setActiveAlert({
              id: alertId,
              type: 'overtime',
              title: '예상 시간 초과',
              message: `"${currentTask.title}"이 ${formatDuration(currentTask.estimatedMinutes)} 예상이었는데 ${formatDuration(elapsedMinutes)} 지났어요.`,
              subMessage: '계속할 수도 있어요. 그냥 알려드리는 거예요.',
              icon: '⏰',
              actions: [
                { label: '계속하기', action: 'continue' },
                { label: '휴식하기', action: 'break' },
              ],
            });
            recordAlert(alertId);
          }
        }
      }
      
      // 2. 다음 일정 알림 체크
      const todayStr = now.toISOString().split('T')[0];
      const todayEvents = events
        .filter(e => e.date === todayStr && e.start)
        .map(e => {
          const [h, m] = e.start.split(':').map(Number);
          const eventMinutes = h * 60 + m;
          return { ...e, eventMinutes, minutesUntil: eventMinutes - currentMinutes };
        })
        .filter(e => e.minutesUntil > 0 && e.minutesUntil <= 30)
        .sort((a, b) => a.minutesUntil - b.minutesUntil);
      
      if (todayEvents.length > 0) {
        const nextEvent = todayEvents[0];
        TIME_CONFIG.eventAlertTimes.forEach(alertTime => {
          if (nextEvent.minutesUntil <= alertTime && nextEvent.minutesUntil > alertTime - 2) {
            const alertId = `event_${nextEvent.id}_${alertTime}`;
            if (canShowAlert('event', alertId)) {
              const urgency = alertTime <= 10 ? 'high' : 'medium';
              setActiveAlert({
                id: alertId,
                type: 'event',
                urgency,
                title: alertTime <= 10 ? '일정 곧 시작!' : '다음 일정 알림',
                message: `"${nextEvent.title}"이 ${nextEvent.minutesUntil}분 후예요.`,
                subMessage: nextEvent.location ? `📍 ${nextEvent.location}` : null,
                icon: alertTime <= 10 ? '🔔' : '⏰',
                actions: [
                  { label: '확인', action: 'dismiss' },
                  { label: '지금 마무리', action: 'wrapup' },
                ],
              });
              recordAlert(alertId);
            }
          }
        });
      }
      
      // 3. 휴식 리마인더 체크 (2시간 연속 작업)
      if (trackingState.sessionStartTime) {
        const sessionMinutes = (Date.now() - trackingState.sessionStartTime) / (1000 * 60);
        
        if (sessionMinutes >= TIME_CONFIG.breakReminderTime) {
          const alertId = `break_${Math.floor(sessionMinutes / TIME_CONFIG.breakReminderTime)}`;
          if (canShowAlert('break', alertId)) {
            setActiveAlert({
              id: alertId,
              type: 'break',
              title: '휴식 시간?',
              message: `${formatDuration(sessionMinutes)}째 작업 중이에요.`,
              subMessage: '물 한 잔 어때요? 계속해도 괜찮아요.',
              icon: '☕',
              actions: [
                { label: '5분 휴식', action: 'break' },
                { label: '나중에', action: 'later' },
              ],
            });
            recordAlert(alertId);
          }
        }
      }
      
      // 4. 식사 시간 리마인더
      const hour = now.getHours();
      Object.entries(TIME_CONFIG.mealTimes).forEach(([meal, config]) => {
        if (hour >= config.start && hour < config.end) {
          const alertId = `meal_${meal}_${todayStr}`;
          if (canShowAlert('meal', alertId) && trackingState.sessionStartTime) {
            const sessionMinutes = (Date.now() - trackingState.sessionStartTime) / (1000 * 60);
            if (sessionMinutes >= 30) { // 30분 이상 작업 중일 때만
              setActiveAlert({
                id: alertId,
                type: 'meal',
                title: `${config.label} 시간이에요`,
                message: '밥 먹었어요? 챙겨 먹어요!',
                subMessage: '바쁘면 나중에 먹어도 괜찮아요.',
                icon: meal === 'lunch' ? '🍱' : '🍽️',
                actions: [
                  { label: '먹었어요', action: 'dismiss' },
                  { label: '나중에', action: 'later' },
                ],
              });
              recordAlert(alertId);
            }
          }
        }
      });
    };
    
    // 즉시 체크 + 1분마다 체크
    checkTimeAlerts();
    const interval = setInterval(checkTimeAlerts, 60000);
    
    return () => clearInterval(interval);
  }, [currentTask, events, trackingState.sessionStartTime, trackingState.taskStartTime, canShowAlert, recordAlert]);
  
  // 현재 태스크 변경 시 트래킹 시작
  useEffect(() => {
    if (currentTask) {
      startTaskTracking(currentTask);
    } else {
      stopTaskTracking();
    }
  }, [currentTask, startTaskTracking, stopTaskTracking]);
  
  return {
    trackingState,
    activeAlert,
    dismissAlert,
    recordBreak,
    formatDuration,
    getElapsedTime: () => {
      if (!trackingState.taskStartTime) return 0;
      return (Date.now() - trackingState.taskStartTime) / (1000 * 60);
    },
    getSessionTime: () => {
      if (!trackingState.sessionStartTime) return 0;
      return (Date.now() - trackingState.sessionStartTime) / (1000 * 60);
    },
  };
};
