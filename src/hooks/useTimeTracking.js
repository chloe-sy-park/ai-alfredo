// useTimeTracking.js - Time tracking hook for focus sessions
import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimeTracking(currentTask, events, onAlert) {
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const alertTimeoutRef = useRef(null);
  
  // Start tracking when task changes
  useEffect(() => {
    if (currentTask) {
      const now = Date.now();
      setTaskStartTime(now);
      if (!sessionStartTime) {
        setSessionStartTime(now);
      }
    } else {
      setTaskStartTime(null);
    }
  }, [currentTask]);
  
  // Check for upcoming events and generate alerts
  useEffect(() => {
    if (!currentTask || !events || events.length === 0) return;
    
    const checkUpcomingEvents = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const todayStr = now.toISOString().split('T')[0];
      
      // Find next event today
      const upcomingEvents = events
        .filter(e => e.date === todayStr && e.start)
        .map(e => {
          const [h, m] = e.start.split(':').map(Number);
          const eventMinutes = h * 60 + m;
          return { ...e, eventMinutes, minutesUntil: eventMinutes - currentMinutes };
        })
        .filter(e => e.minutesUntil > 0 && e.minutesUntil <= 15)
        .sort((a, b) => a.minutesUntil - b.minutesUntil);
      
      if (upcomingEvents.length > 0) {
        const nextEvent = upcomingEvents[0];
        setActiveAlert({
          id: `event-${nextEvent.id}`,
          type: 'upcoming-event',
          title: nextEvent.title,
          minutesUntil: nextEvent.minutesUntil,
          message: `${nextEvent.minutesUntil}분 후 "${nextEvent.title}" 일정이 있어요!`
        });
        
        if (onAlert) {
          onAlert('upcoming-event', nextEvent);
        }
      }
    };
    
    // Check every minute
    const interval = setInterval(checkUpcomingEvents, 60000);
    checkUpcomingEvents(); // Initial check
    
    return () => clearInterval(interval);
  }, [currentTask, events, onAlert]);
  
  // Check for long work sessions (suggest break after 90 minutes)
  useEffect(() => {
    if (!taskStartTime) return;
    
    const checkBreakTime = () => {
      const elapsed = (Date.now() - taskStartTime) / 1000 / 60; // minutes
      
      if (elapsed >= 90 && !activeAlert) {
        setActiveAlert({
          id: `break-${Date.now()}`,
          type: 'break-suggestion',
          message: '90분째 집중 중이에요! 잠깐 쉬어가는 건 어때요? ☕'
        });
        
        if (onAlert) {
          onAlert('break-suggestion', { elapsed });
        }
      }
    };
    
    const interval = setInterval(checkBreakTime, 60000);
    
    return () => clearInterval(interval);
  }, [taskStartTime, activeAlert, onAlert]);
  
  // Get elapsed time in minutes
  const getElapsedTime = useCallback(() => {
    if (!taskStartTime) return 0;
    return Math.floor((Date.now() - taskStartTime) / 1000 / 60);
  }, [taskStartTime]);
  
  // Get session time in minutes
  const getSessionTime = useCallback(() => {
    if (!sessionStartTime) return 0;
    return Math.floor((Date.now() - sessionStartTime) / 1000 / 60);
  }, [sessionStartTime]);
  
  // Record a break
  const recordBreak = useCallback(() => {
    const now = Date.now();
    setBreaks(prev => [...prev, { start: now }]);
    setActiveAlert(null);
  }, []);
  
  // Dismiss current alert
  const dismissAlert = useCallback((alertId) => {
    if (activeAlert && activeAlert.id === alertId) {
      setActiveAlert(null);
    }
  }, [activeAlert]);
  
  // Reset session
  const resetSession = useCallback(() => {
    setTaskStartTime(null);
    setSessionStartTime(null);
    setActiveAlert(null);
    setBreaks([]);
  }, []);
  
  return {
    taskStartTime,
    sessionStartTime,
    activeAlert,
    breaks,
    getElapsedTime,
    getSessionTime,
    recordBreak,
    dismissAlert,
    resetSession,
  };
}

export default useTimeTracking;
