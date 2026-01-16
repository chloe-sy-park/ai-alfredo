/**
 * 캘린더 데이터를 관리하는 React 훅
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getTodayEvents,
  getEvents,
  getCalendarList,
  getSelectedCalendars,
  isGoogleAuthenticated,
  CalendarEvent,
  CalendarInfo,
} from '../services/calendar';

interface UseCalendarOptions {
  autoFetch?: boolean;
  refreshInterval?: number; // ms
}

interface UseCalendarReturn {
  // 상태
  todayEvents: CalendarEvent[];
  calendars: CalendarInfo[];
  selectedCalendarIds: string[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;

  // 액션
  refreshTodayEvents: () => Promise<void>;
  fetchEvents: (start: Date, end: Date) => Promise<CalendarEvent[]>;
  refreshCalendars: () => Promise<void>;
}

export function useCalendar(options: UseCalendarOptions = {}): UseCalendarReturn {
  const { autoFetch = true, refreshInterval } = options;

  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = isGoogleAuthenticated();
  const selectedCalendarIds = getSelectedCalendars();

  const refreshTodayEvents = useCallback(async () => {
    if (!isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const events = await getTodayEvents();
      setTodayEvents(events);
    } catch (err) {
      setError('일정을 불러오는 데 실패했습니다');
      console.error('Failed to fetch today events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const fetchEvents = useCallback(async (start: Date, end: Date): Promise<CalendarEvent[]> => {
    if (!isConnected) return [];

    try {
      return await getEvents(start, end);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      return [];
    }
  }, [isConnected]);

  const refreshCalendars = useCallback(async () => {
    if (!isConnected) return;

    try {
      const list = await getCalendarList();
      setCalendars(list);
    } catch (err) {
      console.error('Failed to fetch calendars:', err);
    }
  }, [isConnected]);

  // 자동 데이터 로드
  useEffect(() => {
    if (autoFetch && isConnected) {
      refreshTodayEvents();
      refreshCalendars();
    }
  }, [autoFetch, isConnected, refreshTodayEvents, refreshCalendars]);

  // 주기적 새로고침
  useEffect(() => {
    if (!refreshInterval || !isConnected) return;

    const interval = setInterval(() => {
      refreshTodayEvents();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, isConnected, refreshTodayEvents]);

  return {
    todayEvents,
    calendars,
    selectedCalendarIds,
    isLoading,
    error,
    isConnected,
    refreshTodayEvents,
    fetchEvents,
    refreshCalendars,
  };
}

/**
 * 오늘 일정 중 다가오는 일정 찾기
 */
export function getUpcomingEvent(events: CalendarEvent[]): CalendarEvent | null {
  const now = new Date();

  const upcoming = events
    .filter(event => {
      if (event.allDay) return false;
      const start = new Date(event.start);
      return start > now;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return upcoming[0] || null;
}

/**
 * 현재 진행 중인 일정 찾기
 */
export function getCurrentEvent(events: CalendarEvent[]): CalendarEvent | null {
  const now = new Date();

  return events.find(event => {
    if (event.allDay) return false;
    const start = new Date(event.start);
    const end = new Date(event.end);
    return start <= now && now <= end;
  }) || null;
}

/**
 * 일정 시간 포맷
 */
export function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) return '종일';

  const start = new Date(event.start);
  const end = new Date(event.end);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * 일정까지 남은 시간 계산
 */
export function getTimeUntilEvent(event: CalendarEvent): string {
  const now = new Date();
  const start = new Date(event.start);
  const diffMs = start.getTime() - now.getTime();

  if (diffMs < 0) return '진행 중';

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분 후`;
  }
  return `${minutes}분 후`;
}
