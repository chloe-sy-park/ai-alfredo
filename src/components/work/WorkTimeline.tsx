import { useState, useEffect } from 'react';
import { getTodayEvents, CalendarEvent } from '../../services/calendar';
import { Play } from 'lucide-react';

interface TimelineItem {
  id: string;
  type: 'event' | 'task' | 'break';
  time: string;
  duration: number; // minutes
  title: string;
  isNow?: boolean;
  isPast?: boolean;
}

export default function WorkTimeline() {
  var [events, setEvents] = useState<CalendarEvent[]>([]);
  var [items, setItems] = useState<TimelineItem[]>([]);

  useEffect(function() {
    getTodayEvents().then(setEvents).catch(() => {});
  }, []);

  useEffect(function() {
    // 타임라인 아이템 생성
    var now = new Date();
    var timelineItems: TimelineItem[] = [];
    
    // 캘린더 이벤트 추가
    events.forEach(function(event) {
      var start = new Date(event.start);
      var end = new Date(event.end);
      var duration = Math.round((end.getTime() - start.getTime()) / 60000);
      
      timelineItems.push({
        id: event.id,
        type: 'event',
        time: start.toTimeString().slice(0, 5),
        duration: duration,
        title: event.title,
        isPast: end < now,
        isNow: start <= now && now <= end
      });
    });
    
    // 정렬
    timelineItems.sort(function(a, b) {
      return a.time.localeCompare(b.time);
    });
    
    setItems(timelineItems);
  }, [events]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#1A1A1A]">오늘 일정</h3>
        <button className="text-sm text-[#A996FF]">
          전체보기
        </button>
      </div>
      
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-[#999999] py-8">오늘 예정된 일정이 없어요</p>
        ) : (
          items.map(function(item) {
            return (
              <div 
                key={item.id} 
                className={'flex items-center gap-3 p-3 rounded-xl transition-all ' + 
                  (item.isNow ? 'bg-[#F0F0FF] border-l-4 border-[#A996FF]' : 
                   item.isPast ? 'opacity-50' : 'hover:bg-[#F5F5F5]')}
              >
                <div className="min-w-[48px] text-center">
                  <p className="text-sm font-medium text-[#1A1A1A]">{item.time}</p>
                  <p className="text-xs text-[#999999]">{item.duration}분</p>
                </div>
                
                <div className="h-8 w-0.5 bg-[#E5E5E5]" />
                
                <div className="flex-1">
                  <p className="text-sm text-[#1A1A1A]">{item.title}</p>
                </div>
                
                {!item.isPast && (
                  <button className="p-2 hover:bg-[#F0F0FF] rounded-lg transition-colors">
                    <Play size={16} className="text-[#A996FF]" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}