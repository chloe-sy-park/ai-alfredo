import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { getEvents, getSelectedCalendars, getCalendarList, addEvent, updateEvent, deleteEvent, CalendarEvent } from '../services/calendar';
import { isGoogleConnected, startGoogleAuth } from '../services/auth';
import EventModal from '../components/common/EventModal';

// 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (타임존 문제 해결)
function formatDateLocal(date: Date): string {
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export default function CalendarPage() {
  var [currentDate, setCurrentDate] = useState(new Date());
  var [selectedDate, setSelectedDate] = useState(new Date());
  var [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  var [isLoading, setIsLoading] = useState(false);
  var [googleConnected, setGoogleConnected] = useState(false);
  var [selectedCount, setSelectedCount] = useState(0);
  
  // Modal state
  var [modalOpen, setModalOpen] = useState(false);
  var [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  var [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Swipe state
  var touchStartX = useRef(0);
  var touchEndX = useRef(0);
  var calendarRef = useRef<HTMLDivElement>(null);

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
      
      // 캘린더 목록 먼저 캐싱
      getCalendarList().then(function() {
        // 월의 시작과 끝 (로컬 타임존 기준)
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

  // Initial load and refresh on visibility change
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
        // Swipe left -> next month
        nextMonth();
      } else {
        // Swipe right -> prev month
        prevMonth();
      }
    }
  }

  // Get events for a specific date (로컬 날짜 기준)
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
    
    return colors.slice(0, 3); // 최대 3개 색상만 표시
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

  // Get selected date events
  var selectedDateEvents = getEventsForDate(selectedDate);
  var nextEvent = getNextEvent();

  // Get days in month
  function getDaysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  // Get first day of month (0 = Sunday)
  function getFirstDayOfMonth(y: number, m: number) {
    return new Date(y, m, 1).getDay();
  }

  // Get days in previous month
  function getDaysInPrevMonth(y: number, m: number) {
    return new Date(y, m, 0).getDate();
  }

  var daysInMonth = getDaysInMonth(year, month);
  var firstDay = getFirstDayOfMonth(year, month);
  var prevMonthDays = getDaysInPrevMonth(year, month);

  // Navigate months
  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToToday() {
    var now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  }

  // Select date
  function handleSelectDate(day: number) {
    setSelectedDate(new Date(year, month, day));
  }

  // Event click
  function handleEventClick(event: CalendarEvent) {
    setSelectedEvent(event);
    setModalMode('view');
    setModalOpen(true);
  }

  // Add event
  function handleAddEvent() {
    setSelectedEvent(null);
    setModalMode('create');
    setModalOpen(true);
  }

  // Save event (create)
  function handleSaveEvent(eventData: Omit<CalendarEvent, 'id'>, calendarId?: string) {
    addEvent(eventData, calendarId).then(function(newEvent) {
      if (newEvent) {
        fetchMonthEvents();
      }
    });
  }

  // Update event
  function handleUpdateEvent(eventId: string, eventData: Omit<CalendarEvent, 'id'>, calendarId?: string) {
    updateEvent(eventId, eventData, calendarId).then(function(updated) {
      if (updated) {
        fetchMonthEvents();
      }
    });
  }

  // Delete event
  function handleDeleteEvent(eventId: string, calendarId?: string) {
    deleteEvent(eventId, calendarId).then(function(success) {
      if (success) {
        fetchMonthEvents();
      }
    });
  }

  // Month name
  var monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // Day names
  var dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // Check if current view is showing today's month
  var isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Build calendar grid with prev/next month days
  var calendarDays = [];
  
  // Previous month days
  for (var i = 0; i < firstDay; i++) {
    var prevDay = prevMonthDays - firstDay + 1 + i;
    calendarDays.push({ day: prevDay, isOtherMonth: true, key: 'prev-' + prevDay });
  }
  
  // Current month days
  for (var d = 1; d <= daysInMonth; d++) {
    var isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    var isSelected = selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === d;
    var colors = getCalendarColorsForDate(d);
    calendarDays.push({ day: d, isToday: isToday, isSelected: isSelected, colors: colors, isOtherMonth: false, key: 'day-' + d });
  }
  
  // Next month days (fill remaining cells)
  var totalCells = Math.ceil(calendarDays.length / 7) * 7;
  var nextDay = 1;
  while (calendarDays.length < totalCells) {
    calendarDays.push({ day: nextDay, isOtherMonth: true, key: 'next-' + nextDay });
    nextDay++;
  }

  function handleConnectGoogle() {
    startGoogleAuth().catch(function(err) {
      console.error('Failed to connect Google:', err);
      alert('Google 연결에 실패했습니다.');
    });
  }

  function handleRefresh() {
    fetchMonthEvents();
  }

  // Format selected date
  function formatSelectedDate() {
    var m = selectedDate.getMonth() + 1;
    var d = selectedDate.getDate();
    var dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()];
    
    var isToday = selectedDate.toDateString() === today.toDateString();
    if (isToday) {
      return '오늘 (' + m + '/' + d + ' ' + dayOfWeek + ')';
    }
    return m + '월 ' + d + '일 ' + dayOfWeek + '요일';
  }

  // Format time until next event
  function formatTimeUntil(minutes: number): string {
    if (minutes < 60) {
      return minutes + '분 후';
    }
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    if (mins === 0) {
      return hours + '시간 후';
    }
    return hours + '시간 ' + mins + '분 후';
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-mobile mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              {year}년 {monthNames[month]}
            </h1>
            {!isCurrentMonth && (
              <button 
                onClick={goToToday}
                className="px-2 py-1 text-xs bg-lavender-100 text-lavender-600 rounded-full hover:bg-lavender-200 transition-colors"
              >
                오늘
              </button>
            )}
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Next Event Banner (ADHD friendly) */}
        {nextEvent && isCurrentMonth && (
          <div className="bg-gradient-to-r from-lavender-100 to-lavender-50 rounded-xl p-3 flex items-center gap-3">
            <div 
              className="w-1 h-10 rounded-full"
              style={{ backgroundColor: nextEvent.event.backgroundColor || '#A996FF' }}
            />
            <div className="flex-1">
              <p className="text-xs text-lavender-600 font-medium">
                {formatTimeUntil(nextEvent.minutesUntil)}
              </p>
              <p className="font-medium text-sm">{nextEvent.event.title}</p>
            </div>
            <CalendarIcon size={20} className="text-lavender-400" />
          </div>
        )}

        {/* Calendar Grid */}
        <div 
          ref={calendarRef}
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
                <div key={name} className={'text-center text-sm font-medium ' + color}>
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
                  <div key={item.key} className="h-12 flex flex-col items-center justify-center">
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
                  className={'h-12 rounded-xl flex flex-col items-center justify-center text-sm transition-colors ' + bgClass}
                >
                  <span>{item.day}</span>
                  {colors.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {colors.map(function(color, idx) {
                        return (
                          <span 
                            key={idx}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ 
                              backgroundColor: item.isSelected ? 'white' : color 
                            }}
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
            <div className="flex items-center gap-2">
              {googleConnected && (
                <button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
                >
                  <RefreshCw size={18} className={'text-gray-400 ' + (isLoading ? 'animate-spin' : '')} />
                </button>
              )}
              <button 
                onClick={handleAddEvent}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <Plus size={20} className="text-lavender-400" />
              </button>
            </div>
          </div>

          {!googleConnected ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">
                Google 캘린더를 연결하면 일정을 볼 수 있어요
              </p>
              <button
                onClick={handleConnectGoogle}
                className="px-4 py-2 bg-lavender-400 text-white rounded-xl text-sm hover:bg-lavender-500 transition-colors"
              >
                Google 캘린더 연결
              </button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-6 text-gray-400">
              일정 불러오는 중...
            </div>
          ) : selectedDateEvents.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              일정이 없어요 🎉
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
                      className="w-1 h-10 rounded-full"
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
      </div>

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
    </div>
  );
}
