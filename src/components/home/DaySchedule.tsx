import { useState, useEffect } from 'react';
import {
  Clock, ChevronDown, ChevronUp, MapPin, ExternalLink, Check, Plus,
  RefreshCw, Bot, Briefcase, Home, DollarSign, Heart, Users
} from 'lucide-react';
import { getTodayEvents, getCalendarList, CalendarEvent, isCalendarConnected, getCalendarProvider } from '../../services/calendar';
import { getTimelineItems } from '../../services/agenda';
import { useNavigate } from 'react-router-dom';

interface ScheduleItem {
  id: string;
  type: 'task' | 'event';
  title: string;
  start?: string;
  end?: string;
  category: string;
  estimatedMinutes?: number;
  completed: boolean;
  isExpanded?: boolean;
  // Event specific
  description?: string;
  location?: string;
  backgroundColor?: string;
}

interface TimeSlot {
  hour: number;
  items: ScheduleItem[];
  isEmpty: boolean;
}

/**
 * DaySchedule 컴포넌트
 * - Event와 Task를 통합하여 시간대별로 표시
 * - 알프레도가 빈 시간에 Task 자동 배치
 * - 카테고리별 색상 표시
 */
export default function DaySchedule() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const navigate = useNavigate();

  const currentHour = new Date().getHours();
  const calendarProvider = getCalendarProvider();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      // Agenda 서비스에서 통합 아이템 가져오기
      const timelineItems = await getTimelineItems();

      // Calendar Events도 추가로 가져오기
      let calendarEvents: CalendarEvent[] = [];
      if (isCalendarConnected()) {
        await getCalendarList();
        calendarEvents = await getTodayEvents();
      }

      // Timeline 아이템과 Calendar 이벤트 병합
      const mergedItems: ScheduleItem[] = [];

      // Timeline 아이템 추가
      timelineItems.forEach(item => {
        mergedItems.push({
          id: item.id,
          type: item.type,
          title: item.title,
          start: item.start,
          end: item.end,
          category: item.category,
          estimatedMinutes: item.estimatedMinutes,
          completed: item.completed,
          isExpanded: false
        });
      });

      // Calendar Events 중 Timeline에 없는 것만 추가
      const timelineEventIds = new Set(timelineItems.filter(i => i.type === 'event').map(i => i.sourceId));
      calendarEvents.forEach(event => {
        if (!timelineEventIds.has(event.id) && !event.allDay) {
          mergedItems.push({
            id: event.id,
            type: 'event',
            title: event.title,
            start: event.start,
            end: event.end,
            category: autoClassifyCategory(event.title),
            completed: false,
            isExpanded: false,
            description: event.description,
            location: event.location,
            backgroundColor: event.backgroundColor
          });
        }
      });

      // 시간순 정렬
      mergedItems.sort((a, b) => {
        const timeA = a.start ? new Date(a.start).getTime() : Infinity;
        const timeB = b.start ? new Date(b.start).getTime() : Infinity;
        return timeA - timeB;
      });

      setItems(mergedItems);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to load schedule items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 자동 분류
  function autoClassifyCategory(title: string): string {
    const text = title.toLowerCase();
    if (/회의|미팅|업무|프로젝트|보고|발표/.test(text)) return 'work';
    if (/운동|헬스|병원|건강/.test(text)) return 'health';
    if (/결제|송금|은행|세금/.test(text)) return 'finance';
    if (/친구|가족|모임|약속/.test(text)) return 'social';
    return 'life';
  }

  const handleSync = async () => {
    setIsSyncing(true);
    await loadItems();
    setIsSyncing(false);
  };

  const handleToggleExpand = (itemId: string) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  const handleCompleteItem = (itemId: string) => {
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, completed: !i.completed } : i
    ));
  };

  const handleViewDetails = (item: ScheduleItem) => {
    if (item.type === 'event') {
      navigate('/calendar', { state: { selectedEvent: item } });
    } else {
      navigate('/work', { state: { selectedTask: item } });
    }
  };

  const handleAddToEmptySlot = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    navigate('/calendar', { state: { createEventAt: date.toISOString() } });
  };

  // 카테고리 아이콘
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return <Briefcase size={12} className="text-blue-500" />;
      case 'life': return <Home size={12} className="text-green-500" />;
      case 'finance': return <DollarSign size={12} className="text-purple-500" />;
      case 'health': return <Heart size={12} className="text-red-500" />;
      case 'social': return <Users size={12} className="text-pink-500" />;
      default: return <Clock size={12} className="text-gray-500" />;
    }
  };

  // 카테고리 색상
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-600';
      case 'life': return 'bg-green-100 text-green-600';
      case 'finance': return 'bg-purple-100 text-purple-600';
      case 'health': return 'bg-red-100 text-red-600';
      case 'social': return 'bg-pink-100 text-pink-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // 시간대별로 아이템 그룹화
  const getTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    for (let hour = 6; hour <= 23; hour++) {
      const hourItems = items.filter(item => {
        if (!item.start) return false;
        const itemHour = new Date(item.start).getHours();
        return itemHour === hour;
      });

      slots.push({
        hour,
        items: hourItems,
        isEmpty: hourItems.length === 0
      });
    }

    return slots;
  };

  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const isCurrentHour = (hour: number): boolean => hour === currentHour;
  const isPastHour = (hour: number): boolean => hour < currentHour;

  // AI 제안 메시지
  const getAISuggestion = (hour: number): string | null => {
    if (hour <= currentHour) return null;

    const suggestions: Record<number, string> = {
      9: '집중력이 높은 시간 - 중요 업무 추천',
      10: '협업하기 좋은 시간',
      14: '창의적 작업에 적합',
      15: '리뷰/피드백 시간',
      17: '하루 마무리 정리'
    };

    return suggestions[hour] || null;
  };

  const timeSlots = getTimeSlots();

  // 현재 시간 기준 앞뒤로 표시
  const visibleSlots = timeSlots.filter(slot => {
    return (slot.hour >= currentHour - 1 && slot.hour <= currentHour + 6) || slot.items.length > 0;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <span className="font-semibold text-xs text-primary uppercase tracking-wider">Schedule</span>
            <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs font-medium text-primary">
              {items.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {lastSyncTime && isCalendarConnected() && (
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
      ) : items.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            오늘 일정이 없어요
          </p>
          <button
            onClick={() => navigate('/calendar')}
            className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            일정 추가하기
          </button>
        </div>
      ) : (
        <div className="p-4">
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
                      ${slot.items.length > 0 ? 'top-4' : 'top-1/2 -translate-y-1/2'}
                    `}>
                      <div className={`rounded-full transition-all
                        ${isCurrent
                          ? 'w-3 h-3 bg-primary ring-4 ring-primary/20'
                          : slot.items.length > 0
                            ? 'w-3 h-3 bg-primary'
                            : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'
                        }
                      `} />
                    </div>

                    {/* 아이템 또는 빈 시간 */}
                    <div className="ml-10 min-h-[40px]">
                      {slot.items.length > 0 ? (
                        <div className="space-y-2">
                          {slot.items.map(item => {
                            const isExpanded = expandedItemId === item.id;

                            return (
                              <div
                                key={item.id}
                                className={`rounded-xl overflow-hidden transition-all
                                  ${isCurrent ? 'bg-primary/5 border border-primary/20' : 'bg-gray-50 dark:bg-gray-700/50'}
                                  ${item.completed ? 'opacity-50' : ''}
                                `}
                              >
                                {/* 기본 정보 */}
                                <button
                                  onClick={() => handleToggleExpand(item.id)}
                                  className="w-full p-3 text-left"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className={`text-xs font-medium
                                          ${isCurrent ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}
                                        `}>
                                          {item.start ? formatTime(item.start) : formatHour(slot.hour)}
                                        </p>
                                        {/* 타입 & 카테고리 뱃지 */}
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase flex items-center gap-1 ${getCategoryBadgeClass(item.category)}`}>
                                          {getCategoryIcon(item.category)}
                                          {item.type === 'task' ? 'Task' : 'Event'}
                                        </span>
                                      </div>
                                      <h4 className={`font-semibold text-gray-900 dark:text-white
                                        ${item.completed ? 'line-through' : ''}
                                      `}>
                                        {item.title}
                                      </h4>
                                      {/* 예상 시간 (Task만) */}
                                      {item.type === 'task' && item.estimatedMinutes && (
                                        <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                          <Clock size={10} />
                                          {item.estimatedMinutes}분 예상
                                        </span>
                                      )}
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
                                    {/* 설명 */}
                                    {item.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
                                        {item.description}
                                      </p>
                                    )}

                                    {/* 위치 (Event만) */}
                                    {item.location && (
                                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        <MapPin size={14} />
                                        <span className="uppercase text-xs font-medium">{item.location}</span>
                                      </div>
                                    )}

                                    {/* 액션 버튼들 */}
                                    <div className="flex items-center gap-2 mt-4">
                                      <button
                                        onClick={() => handleViewDetails(item)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                                      >
                                        <ExternalLink size={16} />
                                        상세 보기
                                      </button>
                                      <button
                                        onClick={() => handleCompleteItem(item.id)}
                                        className={`p-2.5 rounded-xl border transition-colors
                                          ${item.completed
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
