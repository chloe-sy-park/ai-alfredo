import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { CalendarEvent } from '../../services/calendar';

interface EventSearchProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onClose: () => void;
}

export default function EventSearch({ events, onEventClick, onClose }: EventSearchProps) {
  var [query, setQuery] = useState('');

  // Search events
  function searchEvents(): CalendarEvent[] {
    if (!query.trim()) return [];
    
    var q = query.toLowerCase();
    return events.filter(function(event) {
      var title = (event.title || '').toLowerCase();
      var location = (event.location || '').toLowerCase();
      var description = (event.description || '').toLowerCase();
      var calendarName = (event.calendarName || '').toLowerCase();
      
      return title.includes(q) || 
             location.includes(q) || 
             description.includes(q) ||
             calendarName.includes(q);
    }).slice(0, 20); // 최대 20개
  }

  // Format date
  function formatEventDate(dateStr: string): string {
    var date = new Date(dateStr);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    var dayOfWeek = dayNames[date.getDay()];
    
    // Check if today
    var today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    }
    
    // Check if tomorrow
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return '내일';
    }
    
    return month + '/' + day + ' (' + dayOfWeek + ')';
  }

  // Format time
  function formatEventTime(event: CalendarEvent): string {
    if (event.allDay) return '종일';
    var time = new Date(event.start).toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    return time;
  }

  var results = searchEvents();

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Search header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="일정 검색..."
              value={query}
              onChange={function(e) { setQuery(e.target.value); }}
              className="flex-1 bg-transparent outline-none text-sm"
              autoFocus
            />
            {query && (
              <button onClick={function() { setQuery(''); }}>
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-lavender-500 text-sm font-medium"
          >
            취소
          </button>
        </div>
      </div>

      {/* Search results */}
      <div className="p-4">
        {!query.trim() ? (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">일정 제목, 장소, 메모로 검색하세요</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">"{query}" 검색 결과가 없어요</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 mb-3">{results.length}개 결과</p>
            {results.map(function(event) {
              return (
                <button
                  key={event.id}
                  onClick={function() { onEventClick(event); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left"
                >
                  <div 
                    className="w-1 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.backgroundColor || '#A996FF' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatEventDate(event.start)}</span>
                      <span>·</span>
                      <span>{formatEventTime(event)}</span>
                      {event.calendarName && (
                        <>
                          <span>·</span>
                          <span className="truncate">{event.calendarName}</span>
                        </>
                      )}
                    </div>
                    {event.location && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">📍 {event.location}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
