/**
 * 캘린더 설정 컴포넌트
 * 연동할 캘린더 선택 및 동기화 상태 표시
 */

import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Check, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getCalendarList,
  getSelectedCalendars,
  setSelectedCalendars,
  getTodayEvents,
  CalendarInfo,
  CalendarEvent,
} from '../../services/calendar';

interface CalendarSettingsProps {
  onSyncComplete?: () => void;
}

export default function CalendarSettings({ onSyncComplete }: CalendarSettingsProps) {
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  useEffect(() => {
    loadCalendars();
    setSelectedIds(getSelectedCalendars());

    // 마지막 동기화 시간 로드
    const lastSync = localStorage.getItem('calendar_last_sync');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }
  }, []);

  const loadCalendars = async () => {
    setIsLoading(true);
    try {
      const calendarList = await getCalendarList();
      setCalendars(calendarList);

      // 선택된 캘린더가 없으면 기본 캘린더 선택
      const selected = getSelectedCalendars();
      if (selected.length === 0 && calendarList.length > 0) {
        const primaryCalendar = calendarList.find(c => c.primary);
        if (primaryCalendar) {
          setSelectedIds([primaryCalendar.id]);
          setSelectedCalendars([primaryCalendar.id]);
        }
      }
    } catch (error) {
      console.error('Failed to load calendars:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCalendar = (calendarId: string) => {
    const newSelected = selectedIds.includes(calendarId)
      ? selectedIds.filter(id => id !== calendarId)
      : [...selectedIds, calendarId];

    setSelectedIds(newSelected);
    setSelectedCalendars(newSelected);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const events = await getTodayEvents();
      setTodayEvents(events);
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('calendar_last_sync', now.toISOString());
      onSyncComplete?.();
    } catch (error) {
      console.error('Failed to sync calendar:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatEventTime = (start: string, end: string, allDay?: boolean) => {
    if (allDay) return '종일';
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  };

  if (calendars.length === 0 && !isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="text-[#A996FF]" size={20} />
          <span className="font-medium text-gray-900 dark:text-white">캘린더 설정</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Google Calendar를 먼저 연동해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Calendar className="text-[#A996FF]" size={20} />
          <div className="text-left">
            <span className="font-medium text-gray-900 dark:text-white">캘린더 설정</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedIds.length}개 캘린더 선택됨
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="text-gray-400" size={20} />
        ) : (
          <ChevronDown className="text-gray-400" size={20} />
        )}
      </button>

      {expanded && (
        <div className="border-t dark:border-gray-700">
          {/* 동기화 상태 */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-300">마지막 동기화: </span>
              <span className="text-gray-900 dark:text-white font-medium">
                {lastSyncTime
                  ? `${lastSyncTime.toLocaleDateString('ko-KR')} ${formatTime(lastSyncTime)}`
                  : '없음'
                }
              </span>
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#A996FF] text-white rounded-lg text-sm hover:bg-[#8B7BE8] disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? '동기화 중...' : '동기화'}
            </button>
          </div>

          {/* 캘린더 목록 */}
          <div className="p-4 space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              연동할 캘린더 선택
            </p>
            {isLoading ? (
              <div className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                캘린더 목록 로딩 중...
              </div>
            ) : (
              calendars.map((calendar) => (
                <label
                  key={calendar.id}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                >
                  <button
                    onClick={() => handleToggleCalendar(calendar.id)}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      selectedIds.includes(calendar.id)
                        ? 'bg-[#A996FF] text-white'
                        : 'border-2 border-gray-300 dark:border-gray-500'
                    }`}
                  >
                    {selectedIds.includes(calendar.id) && <Check size={14} />}
                  </button>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: calendar.backgroundColor || '#A996FF' }}
                  />
                  <span className="flex-1 text-sm text-gray-900 dark:text-white">
                    {calendar.summary}
                    {calendar.primary && (
                      <span className="ml-2 text-xs text-[#A996FF]">기본</span>
                    )}
                  </span>
                </label>
              ))
            )}
          </div>

          {/* 오늘 일정 미리보기 */}
          {todayEvents.length > 0 && (
            <div className="border-t dark:border-gray-700 p-4">
              <button
                onClick={() => setShowEvents(!showEvents)}
                className="w-full flex items-center justify-between text-sm"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  오늘 일정 ({todayEvents.length}개)
                </span>
                {showEvents ? (
                  <ChevronUp className="text-gray-400" size={16} />
                ) : (
                  <ChevronDown className="text-gray-400" size={16} />
                )}
              </button>

              {showEvents && (
                <div className="mt-3 space-y-2">
                  {todayEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-2 py-1.5"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: event.backgroundColor || '#A996FF' }}
                      />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {event.title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatEventTime(event.start, event.end, event.allDay)}
                      </span>
                    </div>
                  ))}
                  {todayEvents.length > 5 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                      외 {todayEvents.length - 5}개 일정
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
