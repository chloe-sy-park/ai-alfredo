import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Calendar as CalendarIcon, Search, Clock } from 'lucide-react';
import { getEvents, getSelectedCalendars, getCalendarList, addEvent, updateEvent, deleteEvent, CalendarEvent } from '../services/calendar';
import { isGoogleConnected, startGoogleAuth } from '../services/auth';
import EventModal from '../components/common/EventModal';
import WeekView from '../components/calendar/WeekView';
import EventSearch from '../components/calendar/EventSearch';

// 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (타임존 문제 해결)
function formatDateLocal(date: Date): string {
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

type ViewMode = 'month' | 'week';

export default function CalendarPage() {
  var [currentDate, setCurrentDate] = useState(new Date());
  var [selectedDate, setSelectedDate] = useState(new Date());
  var [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  var [isLoading, setIsLoading] = useState(false);
  var [googleConnected, setGoogleConnected] = useState(false);
  var [selectedCount, setSelectedCount] = useState(0);
  
  // View mode
  var [viewMode, setViewMode] = useState<ViewMode>('month');
  var [showSearch, setShowSearch] = useState(false);
  
  // Modal state
  var [modalOpen, setModalOpen] = useState(false);
  var [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  var [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Swipe state
  var touchStartX = useRef(0);
  var touchEndX = useRef(0);

  var year = currentDate.getFullYear();
  var month = currentDate.getMonth();
  var today = new Date();

  // Fetch month events
  var fetchMonthEvents = useCallback(function() {
    var connected = isGoogleConnected();
    setGoogleConnected(connected);
    setSelectedCount(getSelectedCalendars().length);
    
    if (connected) {
      setIsLoading(true);
      
      getCalendarList().then(function() {
        var startOfMonth = new Date(year, month, 1, 0, 0, 0);
        var endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
        
        return getEvents(startOfMonth, endOfMonth);
      })
        .then(function(data) {
          setMonthEvents(data);
        })
        .catch(function(err) {
          console.error('Failed to fetch events:', err);
        })
        .finally(function() {
          setIsLoading(false);
        });
    }
  }, [year, month]);

  useEffect(function() {
    fetchMonthEvents();

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        fetchMonthEvents();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return function() {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchMonthEvents]);

  // Swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    var diff = touchStartX.current - touchEndX.current;
    var threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        viewMode === 'month' ? nextMonth() : nextWeek();
      } else {
        viewMode === 'month' ? prevMonth() : prevWeek();
      }
    }
  }

  // Get events for a specific date
  function getEventsForDate(date: Date): CalendarEvent[] {
    var dateStr = formatDateLocal(date);
    return monthEvents.filter(function(event) {
      var eventDateStr = event.start.split('T')[0];
      return eventDateStr === dateStr;
    });
  }

  // Get unique calendar colors for a date
  function getCalendarColorsForDate(d: number): string[] {
    var date = new Date(year, month, d);
    var events = getEventsForDate(date);
    var colors: string[] = [];
    var seen = new Set<string>();
    
    events.forEach(function(event) {
      var color = event.backgroundColor || '#A996FF';
      if (!seen.has(color)) {
        seen.add(color);
        colors.push(color);
      }
    });
    
    return colors.slice(0, 3);
  }

  // Get next upcoming event for today
  function getNextEvent(): { event: CalendarEvent; minutesUntil: number } | null {
    var now = new Date();
    var todayStr = formatDateLocal(now);
    var todayEvents = monthEvents.filter(function(e) {
      return e.start.split('T')[0] === todayStr && !e.allDay;
    });

    for (var i = 0; i < todayEvents.length; i++) {
      var event = todayEvents[i];
      var eventTime = new Date(event.start);
      if (eventTime > now) {
        var diff = Math.round((eventTime.getTime() - now.getTime()) / 60000);
        return { event: event, minutesUntil: diff };
      }
    }
    return null;
  }

  // Calculate today's free time (9AM-6PM)
  function getTodayFreeTime(): number {
    var now = new Date();
    var todayStr = formatDateLocal(now);
    var todayEvents = monthEvents.filter(function(e) {
      return e.start.split('T')[0] === todayStr && !e.allDay && e.start.includes('T');
    });

    var workStart = 9;
    var workEnd = 18;
    var currentHour = now.getHours() + now.getMinutes() / 60;
    
    // Start from current time if past 9AM
    var effectiveStart = Math.max(workStart, currentHour);
    if (effectiveStart >= workEnd) return 0;

    var busyMinutes = 0;
    todayEvents.forEach(function(event) {
      var startTime = new Date(event.start);
      var endTime = new Date(event.end);
      var eventStart = startTime.getHours() + startTime.getMinutes() / 60;
      var eventEnd = endTime.getHours() + endTime.getMinutes() / 60;
      
      // Only count events within remaining work hours
      var overlapStart = Math.max(eventStart, effectiveStart);
      var overlapEnd = Math.min(eventEnd, workEnd);
      
      if (overlapEnd > overlapStart) {
        busyMinutes += (overlapEnd - overlapStart) * 60;
      }
    });

    var totalRemaining = (workEnd - effectiveStart) * 60;
    return Math.max(0, totalRemaining - busyMinutes);
  }

  // Format free time
  function formatFreeTime(minutes: number): string {
    if (minutes < 60) return minutes + '분';
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    if (mins === 0) return hours + '시간';
    return hours + '시간 ' + mins + '분';
  }

  var selectedDateEvents = getEventsForDate(selectedDate);
  var nextEvent = getNextEvent();
  var todayFreeMinutes = getTodayFreeTime();

  // Calendar calculations
  function getDaysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  function getFirstDayOfMonth(y: number, m: number) {
    return new Date(y, m, 1).getDay();
  }

  function getDaysInPrevMonth(y: number, m: number) {
    return new Date(y, m, 0).getDate();
  }

  var daysInMonth = getDaysInMonth(year, month);
  var firstDay = getFirstDayOfMonth(year, month);
  var prevMonthDays = getDaysInPrevMonth(year, month);

  // Navigation
  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function prevWeek() {
    var newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
    if (newDate.getMonth() !== month) {
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  }

  function nextWeek() {
    var newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
    if (newDate.getMonth() !== month) {
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  }

  function goToToday() {
    var now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  }

  function handleSelectDate(day: number | Date) {
    if (typeof day === 'number') {
      setSelectedDate(new Date(year, month, day));
    } else {
      setSelectedDate(day);
      if (day.getMonth() !== month) {
        setCurrentDate(new Date(day.getFullYear(), day.getMonth(), 1));
      }
    }
  }

  function handleEventClick(event: CalendarEvent) {
    setSelectedEvent(event);
    setModalMode('view');
    setModalOpen(true);
    setShowSearch(false);
  }

  function handleAddEvent() {
    setSelectedEvent(null);
    setModalMode('create');
    setModalOpen(true);
  }

  function handleSaveEvent(eventData: Omit<CalendarEvent, 'id'>, calendarId?: string) {
    addEvent(eventData, calendarId).then(function(newEvent) {
      if (newEvent) {
        fetchMonthEvents();
      }
    });
  }

  function handleUpdateEvent(eventId: string, eventData: Omit<CalendarEvent, 'id'>, calendarId?: string) {
    updateEvent(eventId, eventData, calendarId).then(function(updated) {
      if (updated) {
        fetchMonthEvents();
      }
    });
  }

  function handleDeleteEvent(eventId: string, calendarId?: string) {
    deleteEvent(eventId, calendarId).then(function(success) {
      if (success) {
        fetchMonthEvents();
      }
    });
  }

  function handleConnectGoogle() {
    startGoogleAuth().catch(function(err) {
      console.error('Failed to connect Google:', err);
      alert('Google 연결에 실패했습니다.');
    });
  }

  var monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  var isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Build calendar grid
  var calendarDays = [];
  
  for (var i = 0; i < firstDay; i++) {
    var prevDay = prevMonthDays - firstDay + 1 + i;
    calendarDays.push({ day: prevDay, isOtherMonth: true, key: 'prev-' + prevDay });
  }
  
  for (var d = 1; d <= daysInMonth; d++) {
    var isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    var isSelected = selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === d;
    var colors = getCalendarColorsForDate(d);
    calendarDays.push({ day: d, isToday: isToday, isSelected: isSelected, colors: colors, isOtherMonth: false, key: 'day-' + d });
  }
  
  var totalCells = Math.ceil(calendarDays.length / 7) * 7;
  var nextDay = 1;
  while (calendarDays.length < totalCells) {
    calendarDays.push({ day: nextDay, isOtherMonth: true, key: 'next-' + nextDay });
    nextDay++;
  }

  function formatSelectedDate() {
    var m = selectedDate.getMonth() + 1;
    var d = selectedDate.getDate();
    var dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()];
    
    if (selectedDate.toDateString() === today.toDateString()) {
      return '오늘 (' + m + '/' + d + ' ' + dayOfWeek + ')';
    }
    return m + '월 ' + d + '일 ' + dayOfWeek + '요일';
  }

  function formatTimeUntil(minutes: number): string {
    if (minutes < 60) return minutes + '분 후';
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    if (mins === 0) return hours + '시간 후';
    return hours + '시간 ' + mins + '분 후';
  }

  function getHeaderTitle(): string {
    if (viewMode === 'week') {
      var weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      var weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return year + '년 ' + monthNames[weekStart.getMonth()];
      }
      return (weekStart.getMonth() + 1) + '월 - ' + (weekEnd.getMonth() + 1) + '월';
    }
    return year + '년 ' + monthNames[month];
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-mobile mx-auto p-4 space-y-3">
        
        {/* Header - 통합된 디자인 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {/* 상단: 월 네비게이션 + 뷰 토글 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <button 
                onClick={viewMode === 'month' ? prevMonth : prevWeek} 
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-lg font-bold min-w-[120px] text-center">
                {getHeaderTitle()}
              </h1>
              <button 
                onClick={viewMode === 'month' ? nextMonth : nextWeek} 
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight size={20} />
              </button>
              {!isCurrentMonth && (
                <button 
                  onClick={goToToday}
                  className="ml-1 px-2 py-1 text-xs bg-lavender-100 text-lavender-600 rounded-full hover:bg-lavender-200"
                >
                  오늘
                </button>
              )}
            </div>
            
            {/* 뷰 토글 - 텍스트 레이블 */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={function() { setViewMode('month'); }}
                className={'px-3 py-1 rounded-md text-xs font-medium transition-colors ' + 
                  (viewMode === 'month' ? 'bg-white shadow-sm text-lavender-600' : 'text-gray-500')}
              >
                월
              </button>
              <button
                onClick={function() { setViewMode('week'); }}
                className={'px-3 py-1 rounded-md text-xs font-medium transition-colors ' + 
                  (viewMode === 'week' ? 'bg-white shadow-sm text-lavender-600' : 'text-gray-500')}
              >
                주
              </button>
            </div>
          </div>
          
          {/* 검색 바 */}
          <button
            onClick={function() { setShowSearch(true); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-gray-400 text-sm"
          >
            <Search size={16} />
            <span>일정 검색...</span>
          </button>
        </div>

        {/* 오늘 요약 배너 - 다음 일정 + 여유 시간 */}
        {googleConnected && isCurrentMonth && (nextEvent || todayFreeMinutes > 0) && (
          <div className="bg-gradient-to-r from-lavender-100 to-lavender-50 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              {/* 다음 일정 */}
              {nextEvent && (
                <div className="flex-1 flex items-center gap-3">
                  <div 
                    className="w-1 h-12 rounded-full"
                    style={{ backgroundColor: nextEvent.event.backgroundColor || '#A996FF' }}
                  />
                  <div>
                    <p className="text-xs text-lavender-600 font-medium">
                      {formatTimeUntil(nextEvent.minutesUntil)}
                    </p>
                    <p className="font-semibold text-sm">{nextEvent.event.title}</p>
                  </div>
                </div>
              )}
              
              {/* 구분선 */}
              {nextEvent && todayFreeMinutes > 0 && (
                <div className="w-px h-10 bg-lavender-200" />
              )}
              
              {/* 오늘 여유 시간 */}
              {todayFreeMinutes > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium">여유 시간</p>
                    <p className="font-semibold text-sm text-green-700">{formatFreeTime(todayFreeMinutes)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'month' ? (
          <>
            {/* Month Grid */}
            <div 
              className="bg-white rounded-2xl p-4 shadow-sm"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {dayNames.map(function(name, idx) {
                  var color = idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-400' : 'text-gray-500';
                  return (
                    <div key={name} className={'text-center text-xs font-medium ' + color}>
                      {name}
                    </div>
                  );
                })}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(function(item) {
                  if (item.isOtherMonth) {
                    return (
                      <div key={item.key} className="h-11 flex flex-col items-center justify-center">
                        <span className="text-sm text-gray-300">{item.day}</span>
                      </div>
                    );
                  }
                  
                  var bgClass = '';
                  if (item.isSelected) {
                    bgClass = 'bg-lavender-400 text-white font-bold';
                  } else if (item.isToday) {
                    bgClass = 'bg-lavender-100 text-lavender-600 font-bold';
                  } else {
                    bgClass = 'hover:bg-lavender-50';
                  }
                  
                  var colors = item.colors || [];
                  
                  return (
                    <button
                      key={item.key}
                      onClick={function() { handleSelectDate(item.day as number); }}
                      className={'h-11 rounded-xl flex flex-col items-center justify-center text-sm transition-colors ' + bgClass}
                    >
                      <span>{item.day}</span>
                      {colors.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {colors.map(function(color, idx) {
                            return (
                              <span 
                                key={idx}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: item.isSelected ? 'white' : color }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Events */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold">{formatSelectedDate()}</h2>
                  {googleConnected && selectedCount > 0 && (
                    <p className="text-xs text-gray-400">{selectedCount}개 캘린더</p>
                  )}
                </div>
                {googleConnected && (
                  <button 
                    onClick={fetchMonthEvents}
                    disabled={isLoading}
                    className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={'text-gray-400 ' + (isLoading ? 'animate-spin' : '')} />
                  </button>
                )}
              </div>

              {!googleConnected ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-lavender-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon size={28} className="text-lavender-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Google 캘린더를 연결하면<br />일정을 볼 수 있어요
                  </p>
                  <button
                    onClick={handleConnectGoogle}
                    className="px-5 py-2.5 bg-lavender-400 text-white rounded-xl text-sm font-medium hover:bg-lavender-500 transition-colors"
                  >
                    Google 캘린더 연결
                  </button>
                </div>
              ) : isLoading ? (
                <div className="text-center py-8 text-gray-400">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                  <p className="text-sm">일정 불러오는 중...</p>
                </div>
              ) : selectedDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-gray-500 text-sm mb-3">일정이 없는 날이에요</p>
                  <button
                    onClick={handleAddEvent}
                    className="px-4 py-2 bg-lavender-50 text-lavender-600 rounded-xl text-sm font-medium hover:bg-lavender-100 transition-colors"
                  >
                    + 새 일정 추가하기
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDateEvents.map(function(event) {
                    var time = event.allDay 
                      ? '종일' 
                      : new Date(event.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
                    return (
                      <button
                        key={event.id}
                        onClick={function() { handleEventClick(event); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left transition-colors"
                      >
                        <div 
                          className="w-1 h-10 rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.backgroundColor || '#A996FF' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{time}</span>
                            {event.calendarName && (
                              <>
                                <span>·</span>
                                <span className="truncate">{event.calendarName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Week View */
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

      {/* FAB - 플로팅 액션 버튼 */}
      {googleConnected && (
        <button
          onClick={handleAddEvent}
          className="fixed bottom-24 right-4 w-14 h-14 bg-lavender-400 text-white rounded-full shadow-lg hover:bg-lavender-500 transition-all hover:scale-105 flex items-center justify-center z-40"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Event Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={function() { setModalOpen(false); }}
        event={selectedEvent}
        selectedDate={selectedDate}
        mode={modalMode}
        onSave={handleSaveEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Search */}
      {showSearch && (
        <EventSearch
          events={monthEvents}
          onEventClick={handleEventClick}
          onClose={function() { setShowSearch(false); }}
        />
      )}
    </div>
  );
}
