import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { getTodayEvents, getSelectedCalendars, CalendarEvent } from '../services/calendar';
import { isGoogleConnected, startGoogleAuth } from '../services/auth';

export default function CalendarPage() {
  var [currentDate, setCurrentDate] = useState(new Date());
  var [events, setEvents] = useState<CalendarEvent[]>([]);
  var [isLoading, setIsLoading] = useState(false);
  var [googleConnected, setGoogleConnected] = useState(false);
  var [selectedCount, setSelectedCount] = useState(0);

  var year = currentDate.getFullYear();
  var month = currentDate.getMonth();

  // Fetch events function
  var fetchEvents = useCallback(function() {
    var connected = isGoogleConnected();
    setGoogleConnected(connected);
    setSelectedCount(getSelectedCalendars().length);
    
    if (connected) {
      setIsLoading(true);
      getTodayEvents()
        .then(function(data) {
          setEvents(data);
        })
        .catch(function(err) {
          console.error('Failed to fetch events:', err);
        })
        .finally(function() {
          setIsLoading(false);
        });
    }
  }, []);

  // Initial load and refresh on visibility change
  useEffect(function() {
    fetchEvents();

    // Refresh when page becomes visible (tab switch)
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        fetchEvents();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return function() {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchEvents]);

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
    calendarDays.push({ day: d, isToday: isToday, key: 'day-' + d });
  }

  function handleConnectGoogle() {
    startGoogleAuth().catch(function(err) {
      console.error('Failed to connect Google:', err);
      alert('Google 연결에 실패했습니다.');
    });
  }

  function handleRefresh() {
    fetchEvents();
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
                return <div key={item.key} className="h-10" />;
              }
              return (
                <button
                  key={item.key}
                  className={'h-10 rounded-full flex items-center justify-center text-sm transition-colors ' +
                    (item.isToday 
                      ? 'bg-lavender-400 text-white font-bold' 
                      : 'hover:bg-lavender-50')}
                >
                  {item.day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's Events */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold">오늘 일정</h2>
              {googleConnected && selectedCount > 0 && (
                <p className="text-xs text-gray-400">{selectedCount}개 캘린더에서</p>
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
          ) : events.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              오늘 일정이 없어요 🎉
            </div>
          ) : (
            <div className="space-y-2">
              {events.map(function(event) {
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
