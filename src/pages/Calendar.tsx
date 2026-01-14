import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { getEvents, getSelectedCalendars, CalendarEvent } from '../services/calendar';
import { isGoogleConnected, startGoogleAuth } from '../services/auth';

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

  var year = currentDate.getFullYear();
  var month = currentDate.getMonth();

  // Fetch month events
  var fetchMonthEvents = useCallback(function() {
    var connected = isGoogleConnected();
    setGoogleConnected(connected);
    setSelectedCount(getSelectedCalendars().length);
    
    if (connected) {
      setIsLoading(true);
      
      // 월의 시작과 끝 (로컬 타임존 기준)
      var startOfMonth = new Date(year, month, 1, 0, 0, 0);
      var endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
      
      getEvents(startOfMonth, endOfMonth)
        .then(function(data) {
          console.log('[Calendar] Received events:', data);
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

  // Get events for a specific date (로컬 날짜 기준)
  function getEventsForDate(date: Date): CalendarEvent[] {
    var dateStr = formatDateLocal(date);
    return monthEvents.filter(function(event) {
      // 종일 이벤트는 date 형식 (2026-01-14), 시간 이벤트는 dateTime 형식
      var eventDateStr = event.start.split('T')[0];
      return eventDateStr === dateStr;
    });
  }

  // Get selected date events
  var selectedDateEvents = getEventsForDate(selectedDate);

  // Check if date has events
  function hasEvents(d: number): boolean {
    var date = new Date(year, month, d);
    return getEventsForDate(date).length > 0;
  }

  // Get days in month
  function getDaysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  // Get first day of month (0 = Sunday)
  function getFirstDayOfMonth(y: number, m: number) {
    return new Date(y, m, 1).getDay();
  }

  var daysInMonth = getDaysInMonth(year, month);
  var firstDay = getFirstDayOfMonth(year, month);
  var today = new Date();

  // Navigate months
  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  // Select date
  function handleSelectDate(day: number) {
    setSelectedDate(new Date(year, month, day));
  }

  // Month name
  var monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // Day names
  var dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // Build calendar grid
  var calendarDays = [];
  
  // Empty cells before first day
  for (var i = 0; i < firstDay; i++) {
    calendarDays.push({ day: null, key: 'empty-' + i });
  }
  
  // Days of month
  for (var d = 1; d <= daysInMonth; d++) {
    var isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    var isSelected = selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === d;
    calendarDays.push({ day: d, isToday: isToday, isSelected: isSelected, hasEvents: hasEvents(d), key: 'day-' + d });
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-mobile mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">
            {year}년 {monthNames[month]}
          </h1>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
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
              if (item.day === null) {
                return <div key={item.key} className="h-12" />;
              }
              
              var bgClass = '';
              if (item.isSelected) {
                bgClass = 'bg-lavender-400 text-white font-bold';
              } else if (item.isToday) {
                bgClass = 'bg-lavender-100 text-lavender-600 font-bold';
              } else {
                bgClass = 'hover:bg-lavender-50';
              }
              
              return (
                <button
                  key={item.key}
                  onClick={function() { handleSelectDate(item.day as number); }}
                  className={'h-12 rounded-xl flex flex-col items-center justify-center text-sm transition-colors ' + bgClass}
                >
                  <span>{item.day}</span>
                  {item.hasEvents && !item.isSelected && (
                    <span className="w-1 h-1 bg-lavender-400 rounded-full mt-0.5" />
                  )}
                  {item.hasEvents && item.isSelected && (
                    <span className="w-1 h-1 bg-white rounded-full mt-0.5" />
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
              <button className="p-1 hover:bg-gray-100 rounded-full">
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
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                    <div className="w-1 h-8 bg-lavender-400 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-gray-400">{time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
