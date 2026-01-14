import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getEvents, getSelectedCalendars, getCalendarList, addEvent, updateEvent, deleteEvent, CalendarEvent } from '../services/calendar';
import { isGoogleConnected, startGoogleAuth } from '../services/auth';
import EventModal from '../components/common/EventModal';
import WeekView from '../components/calendar/WeekView';
import EventSearch from '../components/calendar/EventSearch';

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
  
  var [viewMode, setViewMode] = useState<ViewMode>('month');
  var [showSearch, setShowSearch] = useState(false);
  
  var [modalOpen, setModalOpen] = useState(false);
  var [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  var [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  var touchStartX = useRef(0);
  var touchEndX = useRef(0);

  var year = currentDate.getFullYear();
  var month = currentDate.getMonth();
  var today = new Date();

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
        .then(function(data) { setMonthEvents(data); })
        .catch(function(err) { console.error('Failed to fetch events:', err); })
        .finally(function() { setIsLoading(false); });
    }
  }, [year, month]);

  useEffect(function() {
    fetchMonthEvents();
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') fetchMonthEvents();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return function() { document.removeEventListener('visibilitychange', handleVisibilityChange); };
  }, [fetchMonthEvents]);

  function handleTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function handleTouchMove(e: React.TouchEvent) { touchEndX.current = e.touches[0].clientX; }
  function handleTouchEnd() {
    var diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) { viewMode === 'month' ? nextMonth() : nextWeek(); }
      else { viewMode === 'month' ? prevMonth() : prevWeek(); }
    }
  }

  function getEventsForDate(date: Date): CalendarEvent[] {
    var dateStr = formatDateLocal(date);
    return monthEvents.filter(function(event) {
      return event.start.split('T')[0] === dateStr;
    });
  }

  function getCalendarColorsForDate(d: number): string[] {
    var date = new Date(year, month, d);
    var events = getEventsForDate(date);
    var colors: string[] = [];
    var seen = new Set<string>();
    events.forEach(function(event) {
      var color = event.backgroundColor || '#A996FF';
      if (!seen.has(color)) { seen.add(color); colors.push(color); }
    });
    return colors.slice(0, 3);
  }

  // 오늘 하루 요약 생성
  function getTodaySummary(): string {
    var todayStr = formatDateLocal(today);
    var todayEvents = monthEvents.filter(function(e) { return e.start.split('T')[0] === todayStr; });
    
    if (todayEvents.length === 0) return '오늘은 일정이 없는 여유로운 하루예요 ✨';
    
    var now = new Date();
    var upcoming = todayEvents.filter(function(e) {
      if (e.allDay) return false;
      return new Date(e.start) > now;
    });
    
    if (upcoming.length === 0) {
      return '오늘 일정 ' + todayEvents.length + '개 모두 완료했어요 🎉';
    }
    
    var nextEvent = upcoming[0];
    var nextTime = new Date(nextEvent.start);
    var diffMin = Math.round((nextTime.getTime() - now.getTime()) / 60000);
    
    var timeStr = '';
    if (diffMin < 60) {
      timeStr = diffMin + '분 후';
    } else {
      var h = Math.floor(diffMin / 60);
      var m = diffMin % 60;
      timeStr = m > 0 ? h + '시간 ' + m + '분 후' : h + '시간 후';
    }
    
    return timeStr + ' "' + nextEvent.title + '" · 남은 일정 ' + upcoming.length + '개';
  }

  var selectedDateEvents = getEventsForDate(selectedDate);

  function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }
  function getDaysInPrevMonth(y: number, m: number) { return new Date(y, m, 0).getDate(); }

  var daysInMonth = getDaysInMonth(year, month);
  var firstDay = getFirstDayOfMonth(year, month);
  var prevMonthDays = getDaysInPrevMonth(year, month);

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }
  function prevWeek() {
    var newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
    if (newDate.getMonth() !== month) setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
  }
  function nextWeek() {
    var newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
    if (newDate.getMonth() !== month) setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
  }

  function handleSelectDate(day: number | Date) {
    if (typeof day === 'number') {
      setSelectedDate(new Date(year, month, day));
    } else {
      setSelectedDate(day);
      if (day.getMonth() !== month) setCurrentDate(new Date(day.getFullYear(), day.getMonth(), 1));
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
    addEvent(eventData, calendarId).then(function(newEvent) { if (newEvent) fetchMonthEvents(); });
  }

  function handleUpdateEvent(eventId: string, eventData: Omit<CalendarEvent, 'id'>, calendarId?: string) {
    updateEvent(eventId, eventData, calendarId).then(function(updated) { if (updated) fetchMonthEvents(); });
  }

  function handleDeleteEvent(eventId: string, calendarId?: string) {
    deleteEvent(eventId, calendarId).then(function(success) { if (success) fetchMonthEvents(); });
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

  function formatSelectedDateShort(): string {
    var m = selectedDate.getMonth() + 1;
    var d = selectedDate.getDate();
    var dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()];
    if (selectedDate.toDateString() === today.toDateString()) {
      return '오늘 ' + m + '/' + d + ' ' + dayOfWeek;
    }
    return m + '/' + d + ' ' + dayOfWeek;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-mobile mx-auto px-4 pt-4">
        
        {/* 미니멀 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button onClick={viewMode === 'month' ? prevMonth : prevWeek} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-bold min-w-[100px] text-center">
              {year}년 {monthNames[month]}
            </h1>
            <button onClick={viewMode === 'month' ? nextMonth : nextWeek} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={function() { setViewMode('month'); }}
                className={'px-2.5 py-1 rounded-md text-xs font-medium transition-colors ' + 
                  (viewMode === 'month' ? 'bg-white shadow-sm text-lavender-600' : 'text-gray-500')}
              >
                월
              </button>
              <button
                onClick={function() { setViewMode('week'); }}
                className={'px-2.5 py-1 rounded-md text-xs font-medium transition-colors ' + 
                  (viewMode === 'week' ? 'bg-white shadow-sm text-lavender-600' : 'text-gray-500')}
              >
                주
              </button>
            </div>
            <button onClick={function() { setShowSearch(true); }} className="p-2 hover:bg-gray-100 rounded-full">
              <Search size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {viewMode === 'month' ? (
          <>
            {/* 캘린더 그리드 */}
            <div 
              className="bg-white rounded-2xl p-4 shadow-sm mb-3"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* 요일 헤더 */}
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

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-0.5">
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
                      className={'h-12 rounded-xl flex flex-col items-center justify-center transition-colors ' + bgClass}
                    >
                      <span className="text-sm">{item.day}</span>
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

            {/* 오늘 요약 - 한 줄 */}
            {googleConnected && isCurrentMonth && (
              <div className="px-1 mb-3">
                <p className="text-sm text-gray-500">{getTodaySummary()}</p>
              </div>
            )}

            {/* 선택된 날짜 일정 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-base">{formatSelectedDateShort()}</h2>
                {googleConnected && selectedCount > 0 && (
                  <span className="text-xs text-gray-400">{selectedDateEvents.length}개 일정</span>
                )}
              </div>

              {!googleConnected ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-4">
                    Google 캘린더를 연결해주세요
                  </p>
                  <button
                    onClick={handleConnectGoogle}
                    className="px-5 py-2.5 bg-lavender-400 text-white rounded-xl text-sm font-medium hover:bg-lavender-500"
                  >
                    연결하기
                  </button>
                </div>
              ) : isLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  불러오는 중...
                </div>
              ) : selectedDateEvents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm mb-3">일정이 없어요</p>
                  <button
                    onClick={handleAddEvent}
                    className="text-sm text-lavender-500 font-medium hover:text-lavender-600"
                  >
                    + 새 일정
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {selectedDateEvents.map(function(event) {
                    var time = event.allDay 
                      ? '종일' 
                      : new Date(event.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
                    return (
                      <button
                        key={event.id}
                        onClick={function() { handleEventClick(event); }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 text-left"
                      >
                        <div 
                          className="w-1 h-8 rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.backgroundColor || '#A996FF' }}
                        />
                        <span className="text-sm text-gray-500 w-12 flex-shrink-0">{time}</span>
                        <span className="text-sm font-medium truncate">{event.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
          className="fixed bottom-24 right-4 w-14 h-14 bg-lavender-400 text-white rounded-full shadow-lg hover:bg-lavender-500 transition-all hover:scale-105 flex items-center justify-center z-40"
        >
          <span className="text-2xl font-light">+</span>
        </button>
      )}

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
