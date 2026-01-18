import { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp, MapPin, ExternalLink, Check, Plus, RefreshCw, Bot } from 'lucide-react';
import { getTodayEvents, getCalendarList, CalendarEvent, isCalendarConnected, getCalendarProvider } from '../../services/calendar';
import { useNavigate } from 'react-router-dom';

interface ScheduleItem extends CalendarEvent {
  isExpanded?: boolean;
  isCompleted?: boolean;
}

interface TimeSlot {
  hour: number;
  events: ScheduleItem[];
  isEmpty: boolean;
}

/**
 * DaySchedule 컴포넌트
 * 시간대별 일정 표시 (세로 타임라인)
 * 클릭하면 상세 정보 확장
 * Google Calendar 연동
 */
export default function DaySchedule() {
  const [events, setEvents] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const navigate = useNavigate();

  const currentHour = new Date().getHours();
  const calendarProvider = getCalendarProvider();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    if (!isCalendarConnected()) return;

    setIsLoading(true);
    try {
      await getCalendarList();
      const todayEvents = await getTodayEvents();
      setEvents(todayEvents.map(e => ({ ...e, isExpanded: false, isCompleted: false })));
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await loadEvents();
    setIsSyncing(false);
  };

  const handleToggleExpand = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const handleCompleteEvent = (eventId: string) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, isCompleted: !e.isCompleted } : e
    ));
  };

  const handleViewDetails = (event: ScheduleItem) => {
    navigate('/calendar', { state: { selectedEvent: event } });
  };

  const handleAddToEmptySlot = (hour: number) => {
    // 빈 시간에 일정 추가 - 캘린더로 이동
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    navigate('/calendar', { state: { createEventAt: date.toISOString() } });
  };

  // 시간대별로 이벤트 그룹화 (6시 ~ 23시)
  const getTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    for (let hour = 6; hour <= 23; hour++) {
      const hourEvents = events.filter(event => {
        if (event.allDay) return false;
        const eventHour = new Date(event.start).getHours();
        return eventHour === hour;
      });

      slots.push({
        hour,
        events: hourEvents,
        isEmpty: hourEvents.length === 0
      });
    }

    return slots;
  };

  const formatHour = (hour: number): string => {
    const h = hour.toString().padStart(2, '0');
    return `${h}:00`;
  };

  const formatEventTime = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    return `${startTime} - ${endTime}`;
  };

  const isCurrentHour = (hour: number): boolean => hour === currentHour;
  const isPastHour = (hour: number): boolean => hour < currentHour;

  // 빈 시간에 대한 AI 제안 생성 (시뮬레이션)
  const getAISuggestion = (hour: number): string | null => {
    // 현재 시간 이후의 빈 시간에만 제안
    if (hour <= currentHour) return null;

    const suggestions: Record<number, string> = {
      9: '오전 집중 시간 - 중요한 업무 처리',
      10: '미팅 또는 협업 시간',
      14: '오후 에너지 - 창의적 작업',
      15: '회의 또는 리뷰 시간',
      17: '하루 마무리 정리'
    };

    return suggestions[hour] || null;
  };

  if (!isCalendarConnected()) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={18} className="text-primary" />
          <span className="font-semibold text-xs text-primary uppercase tracking-wider">Schedule</span>
        </div>
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            캘린더를 연결하면 일정을 볼 수 있어요
          </p>
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            캘린더 연결하기
          </button>
        </div>
      </div>
    );
  }

  const timeSlots = getTimeSlots();
  const allDayEvents = events.filter(e => e.allDay);

  // 표시할 시간 범위 결정 (현재 시간 기준으로 앞뒤 일부만 표시)
  const visibleSlots = timeSlots.filter(slot => {
    // 현재 시간 -1시간 부터 +6시간까지 또는 이벤트가 있는 시간
    return (slot.hour >= currentHour - 1 && slot.hour <= currentHour + 6) || slot.events.length > 0;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <span className="font-semibold text-xs text-primary uppercase tracking-wider">Schedule</span>
          </div>
          <div className="flex items-center gap-2">
            {/* 동기화 상태 */}
            {lastSyncTime && (
              <span className="text-xs text-gray-400">
                {calendarProvider === 'google' ? 'Google' : 'Outlook'} 연동
              </span>
            )}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 text-center">
          <RefreshCw size={24} className="mx-auto text-primary animate-spin mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">일정을 불러오는 중...</p>
        </div>
      ) : (
        <div className="p-4">
          {/* All-day events */}
          {allDayEvents.length > 0 && (
            <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              {allDayEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 py-2"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: event.backgroundColor || '#A996FF' }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">종일</span>
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            {/* 세로 라인 */}
            <div className="absolute left-[14px] top-0 bottom-0 w-[2px] bg-gray-100 dark:bg-gray-700" />

            <div className="space-y-1">
              {visibleSlots.map(slot => {
                const isCurrent = isCurrentHour(slot.hour);
                const isPast = isPastHour(slot.hour);
                const aiSuggestion = slot.isEmpty ? getAISuggestion(slot.hour) : null;

                return (
                  <div key={slot.hour} className={`relative ${isPast && slot.isEmpty ? 'opacity-40' : ''}`}>
                    {/* 시간 dot */}
                    <div className={`absolute left-0 w-[30px] flex items-center justify-center z-10
                      ${slot.events.length > 0 ? 'top-4' : 'top-1/2 -translate-y-1/2'}
                    `}>
                      <div className={`rounded-full transition-all
                        ${isCurrent
                          ? 'w-3 h-3 bg-primary ring-4 ring-primary/20'
                          : slot.events.length > 0
                            ? 'w-3 h-3 bg-primary'
                            : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'
                        }
                      `} />
                    </div>

                    {/* 일정 또는 빈 시간 */}
                    <div className="ml-10 min-h-[40px]">
                      {slot.events.length > 0 ? (
                        <div className="space-y-2">
                          {slot.events.map(event => {
                            const isExpanded = expandedEventId === event.id;

                            return (
                              <div
                                key={event.id}
                                className={`rounded-xl overflow-hidden transition-all
                                  ${isCurrent ? 'bg-primary/5 border border-primary/20' : 'bg-gray-50 dark:bg-gray-700/50'}
                                  ${event.isCompleted ? 'opacity-50' : ''}
                                `}
                              >
                                {/* 기본 정보 */}
                                <button
                                  onClick={() => handleToggleExpand(event.id)}
                                  className="w-full p-3 text-left"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className={`text-xs font-medium mb-1
                                        ${isCurrent ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}
                                      `}>
                                        {formatHour(slot.hour)}
                                      </p>
                                      <h4 className={`font-semibold text-gray-900 dark:text-white
                                        ${event.isCompleted ? 'line-through' : ''}
                                      `}>
                                        {event.title}
                                      </h4>
                                    </div>
                                    {isExpanded ? (
                                      <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                                    ) : (
                                      <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                                    )}
                                  </div>
                                </button>

                                {/* 확장 영역 */}
                                {isExpanded && (
                                  <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-600">
                                    {/* 시간 */}
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
                                      {formatEventTime(event.start, event.end)}
                                    </p>

                                    {/* 설명 */}
                                    {event.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                        {event.description}
                                      </p>
                                    )}

                                    {/* 위치 */}
                                    {event.location && (
                                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        <MapPin size={14} />
                                        <span className="uppercase text-xs font-medium">{event.location}</span>
                                      </div>
                                    )}

                                    {/* 액션 버튼들 */}
                                    <div className="flex items-center gap-2 mt-4">
                                      <button
                                        onClick={() => handleViewDetails(event)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                                      >
                                        <ExternalLink size={16} />
                                        View Details
                                      </button>
                                      <button
                                        onClick={() => handleCompleteEvent(event.id)}
                                        className={`p-2.5 rounded-xl border transition-colors
                                          ${event.isCompleted
                                            ? 'bg-green-100 border-green-200 text-green-600'
                                            : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:text-green-600 hover:border-green-200'
                                          }
                                        `}
                                      >
                                        <Check size={18} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        // 빈 시간
                        <div className="py-2 flex items-center justify-between">
                          <span className={`text-sm ${isPast ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {formatHour(slot.hour)}
                          </span>

                          {/* AI 제안 또는 추가 버튼 */}
                          {!isPast && (
                            aiSuggestion ? (
                              <button
                                onClick={() => handleAddToEmptySlot(slot.hour)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary rounded-lg text-xs hover:bg-primary/10 transition-colors"
                              >
                                <Bot size={12} />
                                {aiSuggestion}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddToEmptySlot(slot.hour)}
                                className="p-1.5 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 전체 일정 보기 */}
          <button
            onClick={() => navigate('/calendar')}
            className="w-full mt-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors"
          >
            전체 일정 보기
          </button>
        </div>
      )}
    </div>
  );
}
