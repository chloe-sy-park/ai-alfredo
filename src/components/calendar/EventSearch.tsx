import { useState } from 'react';
import { Search, X, Calendar, MapPin } from 'lucide-react';
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
    }).slice(0, 20);
  }

  // Format date
  function formatEventDate(dateStr: string): string {
    var date = new Date(dateStr);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    var dayOfWeek = dayNames[date.getDay()];
    
    var today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    }
    
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return '내일';
    }
    
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
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

  // Highlight matching text
  function highlightMatch(text: string, query: string): JSX.Element {
    if (!query.trim()) return <>{text}</>;
    
    var lowerText = text.toLowerCase();
    var lowerQuery = query.toLowerCase();
    var idx = lowerText.indexOf(lowerQuery);
    
    if (idx === -1) return <>{text}</>;
    
    return (
      <>
        {text.substring(0, idx)}
        <span className="bg-yellow-100 text-yellow-800 rounded px-0.5">
          {text.substring(idx, idx + query.length)}
        </span>
        {text.substring(idx + query.length)}
      </>
    );
  }

  var results = searchEvents();

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Search header */}
      <div className="sticky top-0 bg-white shadow-sm safe-area-top">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-3">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="일정 제목, 장소, 메모 검색..."
                value={query}
                onChange={function(e) { setQuery(e.target.value); }}
                className="flex-1 bg-transparent outline-none text-sm"
                autoFocus
              />
              {query && (
                <button 
                  onClick={function() { setQuery(''); }}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-lavender-500 text-sm font-medium px-2 py-2"
            >
              취소
            </button>
          </div>
        </div>
      </div>

      {/* Search results */}
      <div className="p-4 pb-20">
        {!query.trim() ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">일정 검색</p>
            <p className="text-gray-400 text-sm">제목, 장소, 메모로 검색해보세요</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">검색 결과가 없어요</p>
            <p className="text-gray-400 text-sm">"{query}"와 일치하는 일정이 없습니다</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-400 mb-3 px-1">
              {results.length}개의 일정을 찾았어요
            </p>
            <div className="space-y-2">
              {results.map(function(event) {
                return (
                  <button
                    key={event.id}
                    onClick={function() { onEventClick(event); }}
                    className="w-full bg-white rounded-xl p-4 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-1 h-full min-h-[48px] rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.backgroundColor || '#A996FF' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">
                          {highlightMatch(event.title, query)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <span className="font-medium">{formatEventDate(event.start)}</span>
                          <span>·</span>
                          <span>{formatEventTime(event)}</span>
                          {event.calendarName && (
                            <>
                              <span>·</span>
                              <span className="truncate text-gray-400">{event.calendarName}</span>
                            </>
                          )}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin size={12} />
                            <span className="truncate">{highlightMatch(event.location, query)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
