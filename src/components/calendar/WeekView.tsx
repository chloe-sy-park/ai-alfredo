import { CalendarEvent } from '../../services/calendar';

interface WeekViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

// 로컬 날짜를 YYYY-MM-DD 형식으로 변환
function formatDateLocal(date: Date): string {
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export default function WeekView({ selectedDate, events, onSelectDate, onEventClick }: WeekViewProps) {
  var today = new Date();
  var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  // Get week dates (Sunday to Saturday)
  function getWeekDates(date: Date): Date[] {
    var week: Date[] = [];
    var current = new Date(date);
    var dayOfWeek = current.getDay();
    
    // Go to Sunday
    current.setDate(current.getDate() - dayOfWeek);
    
    for (var i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return week;
  }

  // Get events for a specific date
  function getEventsForDate(date: Date): CalendarEvent[] {
    var dateStr = formatDateLocal(date);
    return events.filter(function(event) {
      var eventDateStr = event.start.split('T')[0];
      return eventDateStr === dateStr;
    });
  }

  // Get free time slots between events
  function getFreeTimeSlots(dayEvents: CalendarEvent[]): { start: number; duration: number }[] {
    var timedEvents = dayEvents
      .filter(function(e) { return !e.allDay && e.start.includes('T'); })
      .map(function(e) {
        var startTime = new Date(e.start);
        var endTime = new Date(e.end);
        return {
          startHour: startTime.getHours() + startTime.getMinutes() / 60,
          endHour: endTime.getHours() + endTime.getMinutes() / 60
        };
      })
      .sort(function(a, b) { return a.startHour - b.startHour; });

    var freeSlots: { start: number; duration: number }[] = [];
    var workStart = 9; // 9 AM
    var workEnd = 18; // 6 PM
    var lastEnd = workStart;

    timedEvents.forEach(function(event) {
      if (event.startHour > lastEnd && event.startHour >= workStart) {
        var gapStart = Math.max(lastEnd, workStart);
        var gapEnd = Math.min(event.startHour, workEnd);
        if (gapEnd - gapStart >= 0.5) { // 30분 이상만 표시
          freeSlots.push({ start: gapStart, duration: gapEnd - gapStart });
        }
      }
      lastEnd = Math.max(lastEnd, event.endHour);
    });

    // Check remaining time until work end
    if (lastEnd < workEnd) {
      var remaining = workEnd - lastEnd;
      if (remaining >= 0.5) {
        freeSlots.push({ start: lastEnd, duration: remaining });
      }
    }

    return freeSlots;
  }

  // Format hour
  function formatHour(hour: number): string {
    var h = Math.floor(hour);
    var m = Math.round((hour - h) * 60);
    if (m === 0) return h + '시';
    return h + ':' + String(m).padStart(2, '0');
  }

  // Format duration
  function formatDuration(hours: number): string {
    if (hours < 1) {
      return Math.round(hours * 60) + '분';
    }
    var h = Math.floor(hours);
    var m = Math.round((hours - h) * 60);
    if (m === 0) return h + '시간';
    return h + '시간 ' + m + '분';
  }

  var weekDates = getWeekDates(selectedDate);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* Week header */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDates.map(function(date, idx) {
          var isToday = formatDateLocal(date) === formatDateLocal(today);
          var isSelected = formatDateLocal(date) === formatDateLocal(selectedDate);
          var dayEvents = getEventsForDate(date);
          var hasEvents = dayEvents.length > 0;
          
          var dayColor = idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-400' : 'text-gray-600';
          
          return (
            <button
              key={idx}
              onClick={function() { onSelectDate(date); }}
              className="flex flex-col items-center py-2"
            >
              <span className={'text-xs ' + dayColor}>{dayNames[idx]}</span>
              <span className={
                'w-8 h-8 flex items-center justify-center rounded-full text-sm mt-1 ' +
                (isSelected ? 'bg-lavender-400 text-white font-bold' : 
                 isToday ? 'bg-lavender-100 text-lavender-600 font-bold' : '')
              }>
                {date.getDate()}
              </span>
              {hasEvents && (
                <div className="flex gap-0.5 mt-1">
                  {dayEvents.slice(0, 3).map(function(e, i) {
                    return (
                      <span
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: e.backgroundColor || '#A996FF' }}
                      />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
          </h3>
          <span className="text-xs text-gray-400">
            {getEventsForDate(selectedDate).length}개 일정
          </span>
        </div>

        {/* Free time slots */}
        {(function() {
          var dayEvents = getEventsForDate(selectedDate);
          var freeSlots = getFreeTimeSlots(dayEvents);
          
          if (freeSlots.length > 0) {
            return (
              <div className="mb-3 p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-medium mb-1">💚 여유 시간</p>
                <div className="flex flex-wrap gap-2">
                  {freeSlots.map(function(slot, idx) {
                    return (
                      <span key={idx} className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        {formatHour(slot.start)} · {formatDuration(slot.duration)}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Events list */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(function() {
            var dayEvents = getEventsForDate(selectedDate);
            
            if (dayEvents.length === 0) {
              return (
                <p className="text-center text-gray-400 text-sm py-4">
                  일정이 없어요 ✨
                </p>
              );
            }
            
            return dayEvents.map(function(event) {
              var time = event.allDay 
                ? '종일' 
                : new Date(event.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
              
              return (
                <button
                  key={event.id}
                  onClick={function() { onEventClick(event); }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div 
                    className="w-1 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.backgroundColor || '#A996FF' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-gray-400">{time}</p>
                  </div>
                </button>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
