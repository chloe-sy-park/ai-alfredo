import { useState, useEffect } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { getTodayEvents, getCalendarList, CalendarEvent } from '../../services/calendar';
import { isGoogleConnected } from '../../services/auth';
import { useNavigate } from 'react-router-dom';

export default function TodayTimeline() {
  var [events, setEvents] = useState<CalendarEvent[]>([]);
  var [isLoading, setIsLoading] = useState(false);
  var [currentHour, setCurrentHour] = useState(new Date().getHours());
  var navigate = useNavigate();

  useEffect(function() {
    if (isGoogleConnected()) {
      setIsLoading(true);
      getCalendarList().then(function() {
        return getTodayEvents();
      }).then(function(data) {
        setEvents(data);
      }).finally(function() {
        setIsLoading(false);
      });
    }

    // Update current hour every minute
    var interval = setInterval(function() {
      setCurrentHour(new Date().getHours());
    }, 60000);

    return function() { clearInterval(interval); };
  }, []);

  // Generate time slots from 6am to 11pm
  var timeSlots = [];
  for (var h = 6; h <= 23; h++) {
    timeSlots.push(h);
  }

  // Get events for a specific hour
  function getEventsForHour(hour: number): CalendarEvent[] {
    return events.filter(function(event) {
      if (event.allDay) return false;
      var eventHour = new Date(event.start).getHours();
      return eventHour === hour;
    });
  }

  // Get all-day events
  var allDayEvents = events.filter(function(e) { return e.allDay; });

  // Format time
  function formatHour(hour: number): string {
    if (hour === 0) return '오전 12시';
    if (hour < 12) return '오전 ' + hour + '시';
    if (hour === 12) return '오후 12시';
    return '오후 ' + (hour - 12) + '시';
  }

  function formatEventTime(dateStr: string): string {
    var d = new Date(dateStr);
    var hours = d.getHours();
    var mins = d.getMinutes();
    var period = hours < 12 ? '오전' : '오후';
    var h = hours % 12 || 12;
    if (mins === 0) return period + ' ' + h + '시';
    return period + ' ' + h + ':' + String(mins).padStart(2, '0');
  }

  // Check if time slot is current
  function isCurrentHour(hour: number): boolean {
    return hour === currentHour;
  }

  // Check if time slot is past
  function isPastHour(hour: number): boolean {
    return hour < currentHour;
  }

  if (!isGoogleConnected()) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-lavender-400" />
          <h3 className="font-semibold">오늘 타임라인</h3>
        </div>
        <button 
          onClick={function() { navigate('/calendar'); }}
          className="flex items-center text-sm text-lavender-500 hover:text-lavender-600"
        >
          캘린더
          <ChevronRight size={16} />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-4 text-gray-400 text-sm">불러오는 중...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-4 text-gray-400 text-sm">
          오늘 일정이 없어요 ✨
        </div>
      ) : (
        <div className="space-y-1">
          {/* All-day events */}
          {allDayEvents.length > 0 && (
            <div className="mb-3 pb-3 border-b border-gray-100">
              {allDayEvents.map(function(event) {
                return (
                  <div 
                    key={event.id}
                    className="flex items-center gap-2 py-1"
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: event.backgroundColor || '#A996FF' }}
                    />
                    <span className="text-sm font-medium">{event.title}</span>
                    <span className="text-xs text-gray-400">종일</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Time slots */}
          <div className="relative max-h-64 overflow-y-auto scrollbar-hide">
            {timeSlots.map(function(hour) {
              var hourEvents = getEventsForHour(hour);
              var isCurrent = isCurrentHour(hour);
              var isPast = isPastHour(hour);

              return (
                <div 
                  key={hour}
                  className={'flex gap-3 py-1.5 ' + (isPast ? 'opacity-40' : '')}
                >
                  {/* Time label */}
                  <div className={'w-14 text-xs flex-shrink-0 ' + (isCurrent ? 'text-lavender-500 font-bold' : 'text-gray-400')}>
                    {formatHour(hour)}
                  </div>

                  {/* Events or empty line */}
                  <div className="flex-1 min-h-[24px] border-l-2 border-gray-100 pl-3 relative">
                    {/* Current time indicator */}
                    {isCurrent && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-2 h-2 bg-lavender-400 rounded-full" />
                    )}

                    {hourEvents.length > 0 ? (
                      <div className="space-y-1">
                        {hourEvents.map(function(event) {
                          return (
                            <div 
                              key={event.id}
                              className="flex items-center gap-2"
                            >
                              <div 
                                className="w-1.5 h-4 rounded-full"
                                style={{ backgroundColor: event.backgroundColor || '#A996FF' }}
                              />
                              <span className="text-sm truncate">{event.title}</span>
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {formatEventTime(event.start)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
