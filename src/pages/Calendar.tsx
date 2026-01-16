import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getEvents, getSelectedCalendars, getCalendarList, addEvent, updateEvent, deleteEvent, CalendarEvent } from '../services/calendar';
import { isGoogleConnected, startGoogleAuth } from '../services/auth';
import { PageHeader } from '../components/layout';
import EventModal from '../components/common/EventModal';
import WeekView from '../components/calendar/WeekView';
import EventSearch from '../components/calendar/EventSearch';
import LoadingState from '../components/common/LoadingState';

const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type ViewMode = 'month' | 'week';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showSearch, setShowSearch] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const fetchMonthEvents = useCallback(() => {
    const connected = isGoogleConnected();
    setGoogleConnected(connected);
    setSelectedCount(getSelectedCalendars().length);

    if (connected) {
      setIsLoading(true);

      getCalendarList()
        .then(() => {
          const startOfMonth = new Date(year, month, 1, 0, 0, 0);
          const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
          return getEvents(startOfMonth, endOfMonth);
        })
        .then((data) => setMonthEvents(data))
        .catch((err) => console.error('Failed to fetch events:', err))
        .finally(() => setIsLoading(false));
    }
  }, [year, month]);

  useEffect(() => {
    fetchMonthEvents();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchMonthEvents();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchMonthEvents]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        viewMode === 'month' ? nextMonth() : nextWeek();
      } else {
        viewMode === 'month' ? prevMonth() : prevWeek();
      }
    }
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = formatDateLocal(date);
    return monthEvents.filter((event) => event.start.split('T')[0] === dateStr);
  };

  const getCalendarColorsForDate = (d: number): string[] => {
    const date = new Date(year, month, d);
    const events = getEventsForDate(date);
    const colors: string[] = [];
    const seen = new Set<string>();
    events.forEach((event) => {
      const color = event.backgroundColor || '#A996FF';
      if (!seen.has(color)) {
        seen.add(color);
        colors.push(color);
      }
    });
    return colors.slice(0, 3);
  };

  // 오늘 하루 요약 생성
  const getTodaySummary = (): string => {
    const todayStr = formatDateLocal(today);
    const todayEvents = monthEvents.filter((e) => e.start.split('T')[0] === todayStr);

    if (todayEvents.length === 0) return '오늘은 일정이 없는 여유로운 하루예요';

    const now = new Date();
    const upcoming = todayEvents.filter((e) => {
      if (e.allDay) return false;
      return new Date(e.start) > now;
    });

    if (upcoming.length === 0) {
      return `오늘 일정 ${todayEvents.length}개 모두 완료했어요`;
    }

    const nextEvent = upcoming[0];
    const nextTime = new Date(nextEvent.start);
    const diffMin = Math.round((nextTime.getTime() - now.getTime()) / 60000);

    let timeStr = '';
    if (diffMin < 60) {
      timeStr = `${diffMin}분 후`;
    } else {
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      timeStr = m > 0 ? `${h}시간 ${m}분 후` : `${h}시간 후`;
    }

    return `${timeStr} "${nextEvent.title}" · 남은 일정 ${upcoming.length}개`;
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
  const getDaysInPrevMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInPrevMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
    if (newDate.getMonth() !== month) {
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  };
  const nextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
    if (newDate.getMonth() !== month) {
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  };

  const handleSelectDate = (day: number | Date) => {
    if (typeof day === 'number') {
      setSelectedDate(new Date(year, month, day));
    } else {
      setSelectedDate(day);
      if (day.getMonth() !== month) {
        setCurrentDate(new Date(day.getFullYear(), day.getMonth(), 1));
      }
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalMode('view');
    setModalOpen(true);
    setShowSearch(false);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>, calendarId?: string) => {
    addEvent(eventData, calendarId).then((newEvent) => {
      if (newEvent) fetchMonthEvents();
    });
  };

  const handleUpdateEvent = (eventId: string, eventData: Omit<CalendarEvent, 'id'>, calendarId?: string) => {
    updateEvent(eventId, eventData, calendarId).then((updated) => {
      if (updated) fetchMonthEvents();
    });
  };

  const handleDeleteEvent = (eventId: string, calendarId?: string) => {
    deleteEvent(eventId, calendarId).then((success) => {
      if (success) fetchMonthEvents();
    });
  };

  const handleConnectGoogle = () => {
    startGoogleAuth().catch((err) => {
      console.error('Failed to connect Google:', err);
      alert('Google 연결에 실패했습니다.');
    });
  };

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Build calendar grid
  const calendarDays: Array<{
    day: number;
    isOtherMonth: boolean;
    isToday?: boolean;
    isSelected?: boolean;
    colors?: string[];
    key: string;
  }> = [];

  for (let i = 0; i < firstDay; i++) {
    const prevDay = prevMonthDays - firstDay + 1 + i;
    calendarDays.push({ day: prevDay, isOtherMonth: true, key: `prev-${prevDay}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    const isSelected = selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === d;
    const colors = getCalendarColorsForDate(d);
    calendarDays.push({
      day: d,
      isToday,
      isSelected,
      colors,
      isOtherMonth: false,
      key: `day-${d}`
    });
  }

  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  let nextDay = 1;
  while (calendarDays.length < totalCells) {
    calendarDays.push({ day: nextDay, isOtherMonth: true, key: `next-${nextDay}` });
    nextDay++;
  }

  const formatSelectedDateShort = (): string => {
    const m = selectedDate.getMonth() + 1;
    const d = selectedDate.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()];
    if (selectedDate.toDateString() === today.toDateString()) {
      return `오늘 ${m}/${d} ${dayOfWeek}`;
    }
    return `${m}/${d} ${dayOfWeek}`;
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <PageHeader />

      <div className="max-w-mobile mx-auto px-4 py-2">
        {/* 년/월 네비게이션 */}
        <nav className="flex items-center justify-between mb-4" aria-label="캘린더 네비게이션">
          <div className="flex items-center">
            <button
              onClick={viewMode === 'month' ? prevMonth : prevWeek}
              aria-label={viewMode === 'month' ? '이전 달' : '이전 주'}
              className="p-2 -ml-2 hover:bg-neutral-200 dark:hover:bg-gray-700 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft size={20} className="text-text-secondary dark:text-gray-400" aria-hidden="true" />
            </button>
            <h2 className="text-lg font-bold min-w-[100px] text-center text-text-primary dark:text-white">
              {year}년 {monthNames[month]}
            </h2>
            <button
              onClick={viewMode === 'month' ? nextMonth : nextWeek}
              aria-label={viewMode === 'month' ? '다음 달' : '다음 주'}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-gray-700 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronRight size={20} className="text-text-secondary dark:text-gray-400" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex bg-background dark:bg-gray-800 rounded-lg p-0.5" role="group" aria-label="보기 모드 선택">
              <button
                onClick={() => setViewMode('month')}
                aria-pressed={viewMode === 'month'}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[32px] ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary'
                    : 'text-text-muted dark:text-gray-400'
                }`}
              >
                월
              </button>
              <button
                onClick={() => setViewMode('week')}
                aria-pressed={viewMode === 'week'}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[32px] ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary'
                    : 'text-text-muted dark:text-gray-400'
                }`}
              >
                주
              </button>
            </div>
            <button
              onClick={() => setShowSearch(true)}
              aria-label="일정 검색"
              className="p-2 hover:bg-neutral-200 dark:hover:bg-gray-700 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Search size={18} className="text-text-muted dark:text-gray-400" aria-hidden="true" />
            </button>
          </div>
        </nav>

        {viewMode === 'month' ? (
          <>
            {/* 캘린더 그리드 */}
            <div
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card mb-3"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              role="grid"
              aria-label={`${year}년 ${monthNames[month]} 캘린더`}
            >
              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 mb-2" role="row">
                {dayNames.map((name, idx) => {
                  const color = idx === 0
                    ? 'text-red-500 dark:text-red-400'
                    : idx === 6
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-text-muted dark:text-gray-400';
                  return (
                    <div key={name} role="columnheader" className={`text-center text-xs font-medium ${color}`}>
                      {name}
                    </div>
                  );
                })}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-0.5" role="rowgroup">
                {calendarDays.map((item) => {
                  if (item.isOtherMonth) {
                    return (
                      <div key={item.key} role="gridcell" className="h-12 flex flex-col items-center justify-center">
                        <span className="text-sm text-neutral-300 dark:text-gray-600">{item.day}</span>
                      </div>
                    );
                  }

                  let bgClass = '';
                  if (item.isSelected) {
                    bgClass = 'bg-primary text-white font-bold';
                  } else if (item.isToday) {
                    bgClass = 'bg-primary/10 text-primary font-bold';
                  } else {
                    bgClass = 'hover:bg-primary/10 text-text-primary dark:text-white';
                  }

                  const colors = item.colors || [];

                  return (
                    <button
                      key={item.key}
                      role="gridcell"
                      aria-selected={item.isSelected}
                      aria-current={item.isToday ? 'date' : undefined}
                      onClick={() => handleSelectDate(item.day)}
                      className={`h-12 rounded-xl flex flex-col items-center justify-center transition-colors ${bgClass}`}
                    >
                      <span className="text-sm">{item.day}</span>
                      {colors.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5" aria-hidden="true">
                          {colors.map((color, idx) => (
                            <span
                              key={idx}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: item.isSelected ? 'white' : color }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 오늘 요약 - 한 줄 */}
            {googleConnected && isCurrentMonth && (
              <div className="px-1 mb-3">
                <p className="text-sm text-text-muted dark:text-gray-400">{getTodaySummary()}</p>
              </div>
            )}

            {/* 선택된 날짜 일정 */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card" aria-label="선택된 날짜 일정">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-base text-text-primary dark:text-white">{formatSelectedDateShort()}</h2>
                {googleConnected && selectedCount > 0 && (
                  <span className="text-xs text-text-muted dark:text-gray-400">{selectedDateEvents.length}개 일정</span>
                )}
              </div>

              {!googleConnected ? (
                <div className="text-center py-8">
                  <p className="text-sm text-text-muted dark:text-gray-400 mb-4">
                    Google 캘린더를 연결해주세요
                  </p>
                  <button
                    onClick={handleConnectGoogle}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark min-h-[44px]"
                  >
                    연결하기
                  </button>
                </div>
              ) : isLoading ? (
                <LoadingState variant="spinner" message="불러오는 중..." />
              ) : selectedDateEvents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-text-muted dark:text-gray-400 text-sm mb-3">일정이 없어요</p>
                  <button
                    onClick={handleAddEvent}
                    className="text-sm text-primary font-medium hover:text-primary-dark min-h-[44px]"
                  >
                    + 새 일정
                  </button>
                </div>
              ) : (
                <ul className="space-y-1" role="list">
                  {selectedDateEvents.map((event) => {
                    const time = event.allDay
                      ? '종일'
                      : new Date(event.start).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        });
                    return (
                      <li key={event.id}>
                        <button
                          onClick={() => handleEventClick(event)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-background dark:hover:bg-gray-700 text-left min-h-[44px]"
                        >
                          <div
                            className="w-1 h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: event.backgroundColor || '#A996FF' }}
                            aria-hidden="true"
                          />
                          <span className="text-sm text-text-muted dark:text-gray-400 w-12 flex-shrink-0">{time}</span>
                          <span className="text-sm font-medium truncate text-text-primary dark:text-white">{event.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        ) : (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <WeekView
              selectedDate={selectedDate}
              events={monthEvents}
              onSelectDate={handleSelectDate}
              onEventClick={handleEventClick}
            />
          </div>
        )}
      </div>

      {/* FAB */}
      {googleConnected && (
        <button
          onClick={handleAddEvent}
          aria-label="새 일정 추가"
          className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all hover:scale-105 flex items-center justify-center z-40"
        >
          <span className="text-2xl font-light" aria-hidden="true">+</span>
        </button>
      )}

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        selectedDate={selectedDate}
        mode={modalMode}
        onSave={handleSaveEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />

      {showSearch && (
        <EventSearch
          events={monthEvents}
          onEventClick={handleEventClick}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
}
