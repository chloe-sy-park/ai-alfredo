import React, { useState, useRef, useEffect } from 'react';
import { 
  Clock, MapPin, CheckCircle2, Circle, Calendar, Plus, GripVertical
} from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

// Common Components
import { DomainBadge } from '../common';

const CalendarAgendaView = ({
  events = [],
  tasks = [],
  darkMode = false,
  onSelectDate,
  onEditEvent,
  onDragTask,
  onDragEvent,
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 14일간의 아젠다 생성
  const today = new Date();
  const agendaDays = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });
  
  const formatDateStr = (date) => date.toISOString().split('T')[0];
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 날짜별 아이템 그룹화
  const getItemsForDate = (dateStr) => {
    const dayEvents = events.filter(e => e.date === dateStr);
    const dayTasks = tasks.filter(t => {
      if (t.deadline) return t.deadline.startsWith(dateStr);
      if (t.scheduledDate) return t.scheduledDate === dateStr;
      return false;
    });
    return { events: dayEvents, tasks: dayTasks };
  };
  
  // 드래그 핸들러
  const handleDragStart = (e, item, type) => {
    setDraggedItem({ item, type });
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e, dateStr) => {
    e.preventDefault();
    setDragOverDate(dateStr);
  };
  
  const handleDragLeave = () => {
    setDragOverDate(null);
  };
  
  const handleDrop = (e, dateStr) => {
    e.preventDefault();
    setDragOverDate(null);
    
    if (!draggedItem) return;
    
    if (draggedItem.type === 'task') {
      onDragTask?.({ ...draggedItem.item, deadline: dateStr });
    } else if (draggedItem.type === 'event') {
      onDragEvent?.({ ...draggedItem.item, date: dateStr });
    }
    
    setDraggedItem(null);
  };
  
  return (
    <div className="space-y-3">
      {agendaDays.map((date, idx) => {
        const dateStr = formatDateStr(date);
        const isToday = idx === 0;
        const isTomorrow = idx === 1;
        const { events: dayEvents, tasks: dayTasks } = getItemsForDate(dateStr);
        const hasItems = dayEvents.length > 0 || dayTasks.length > 0;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isDragOver = dragOverDate === dateStr;
        
        return (
          <div
            key={dateStr}
            className={`${cardBg} rounded-xl overflow-hidden shadow-sm transition-all ${
              isDragOver ? 'ring-2 ring-[#A996FF] ring-offset-2' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, dateStr)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, dateStr)}
          >
            {/* 날짜 헤더 */}
            <div 
              className={`px-4 py-3 flex items-center justify-between ${
                isToday 
                  ? 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white' 
                  : isTomorrow 
                    ? darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    : ''
              }`}
              onClick={() => onSelectDate?.(date)}
            >
              <div className="flex items-center gap-3">
                <div className={`text-center ${isToday ? '' : ''}`}>
                  <p className={`text-2xl font-bold ${isToday ? 'text-white' : isWeekend ? (date.getDay() === 0 ? 'text-red-400' : 'text-gray-500') : textPrimary}`}>
                    {date.getDate()}
                  </p>
                  <p className={`text-xs ${isToday ? 'text-white/80' : textSecondary}`}>
                    {weekDays[date.getDay()]}
                  </p>
                </div>
                <div>
                  <p className={`font-medium ${isToday ? 'text-white' : textPrimary}`}>
                    {isToday ? '오늘' : isTomorrow ? '내일' : `${date.getMonth() + 1}월 ${date.getDate()}일`}
                  </p>
                  {hasItems && (
                    <p className={`text-xs ${isToday ? 'text-white/70' : textSecondary}`}>
                      {dayEvents.length > 0 && `일정 ${dayEvents.length}개`}
                      {dayEvents.length > 0 && dayTasks.length > 0 && ' · '}
                      {dayTasks.length > 0 && `할 일 ${dayTasks.length}개`}
                    </p>
                  )}
                </div>
              </div>
              
              {hasItems && (
                <div className="flex -space-x-1">
                  {dayEvents.slice(0, 3).map((_, i) => (
                    <div key={`e-${i}`} className="w-2 h-2 rounded-full bg-blue-500 border border-white" />
                  ))}
                  {dayTasks.filter(t => t.importance === 'high' && t.status !== 'done').slice(0, 2).map((_, i) => (
                    <div key={`t-${i}`} className="w-2 h-2 rounded-full bg-red-500 border border-white" />
                  ))}
                </div>
              )}
            </div>
            
            {/* 아이템 목록 */}
            {hasItems && (
              <div className="px-4 py-2 space-y-2">
                {/* 이벤트 */}
                {dayEvents.map((event, i) => (
                  <div
                    key={`event-${i}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event, 'event')}
                    onClick={() => onEditEvent?.(event)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      draggedItem?.item?.id === event.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className={`w-1 h-8 rounded-full ${event.color || 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${textPrimary} truncate`}>{event.title}</p>
                      <p className={`text-xs ${textSecondary}`}>
                        {event.start && event.end ? `${event.start} - ${event.end}` : '종일'}
                        {event.location && ` · ${event.location}`}
                      </p>
                    </div>
                    <GripVertical size={14} className={textSecondary} />
                  </div>
                ))}
                
                {/* 태스크 */}
                {dayTasks.map((task, i) => (
                  <div
                    key={`task-${i}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, 'task')}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      draggedItem?.item?.id === task.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      task.status === 'done' 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : task.importance === 'high' 
                          ? 'border-red-400' 
                          : 'border-[#A996FF]'
                    }`}>
                      {task.status === 'done' && <CheckCircle2 size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.status === 'done' ? 'line-through text-gray-400' : textPrimary} truncate`}>
                        {task.title}
                      </p>
                      {task.project && (
                        <p className={`text-xs ${textSecondary}`}>{task.project}</p>
                      )}
                    </div>
                    {task.importance === 'high' && task.status !== 'done' && (
                      <span className="text-xs text-red-500">!</span>
                    )}
                    <GripVertical size={14} className={textSecondary} />
                  </div>
                ))}
              </div>
            )}
            
            {/* 빈 날짜 드롭존 */}
            {!hasItems && isDragOver && (
              <div className="px-4 py-4 text-center">
                <p className={`text-sm ${textSecondary}`}>여기에 놓으세요</p>
              </div>
            )}
          </div>
        );
      })}
      
      <style>{`
        [draggable="true"] {
          user-select: none;
        }
      `}</style>
    </div>
  );
};

// 미니 주간 타임라인 (홈 위젯용)
const MiniWeekTimeline = ({
  events = [],
  tasks = [],
  darkMode = false,
  onSelectDay,
}) => {
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  const today = new Date();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 이번 주 (오늘부터 7일)
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });
  
  const formatDateStr = (date) => date.toISOString().split('T')[0];
  
  // 날짜별 아이템 개수
  const getItemCount = (dateStr) => {
    const eventCount = events.filter(e => e.date === dateStr).length;
    const taskCount = tasks.filter(t => {
      if (t.deadline) return t.deadline.startsWith(dateStr);
      if (t.scheduledDate) return t.scheduledDate === dateStr;
      return false;
    }).length;
    return eventCount + taskCount;
  };
  
  return (
    <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold ${textPrimary} flex items-center gap-2`}>
          <Calendar size={16} className="text-[#A996FF]" /> 이번 주
        </h3>
      </div>
      
      <div className="flex justify-between">
        {days.map((date, i) => {
          const dateStr = formatDateStr(date);
          const isToday = i === 0;
          const count = getItemCount(dateStr);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          
          return (
            <button
              key={dateStr}
              onClick={() => onSelectDay?.(date)}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <span className={`text-xs ${isWeekend ? (date.getDay() === 0 ? 'text-red-400' : 'text-gray-500') : textSecondary}`}>
                {weekDays[date.getDay()]}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isToday 
                  ? 'bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] text-white shadow-md' 
                  : count > 0 
                    ? darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    : ''
              }`}>
                <span className={`text-sm font-medium ${isToday ? 'text-white' : textPrimary}`}>
                  {date.getDate()}
                </span>
              </div>
              {count > 0 && (
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                    <div 
                      key={j} 
                      className={`w-1 h-1 rounded-full ${isToday ? 'bg-[#A996FF]' : 'bg-gray-400'}`} 
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 드래그 가능한 캘린더 아이템
const DraggableCalendarItem = ({
  item,
  type, // 'event' | 'task'
  darkMode = false,
  onDragStart,
  onClick,
}) => {
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  if (type === 'event') {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart?.(e, item, 'event')}
        onClick={() => onClick?.(item)}
        className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-move hover:shadow-md transition-all"
      >
        <div className={`w-1 h-6 rounded-full ${item.color || 'bg-blue-500'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${textPrimary} truncate`}>{item.title}</p>
          <p className={`text-xs ${textSecondary}`}>{item.start || '종일'}</p>
        </div>
        <GripVertical size={12} className="text-gray-400" />
      </div>
    );
  }
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, item, 'task')}
      onClick={() => onClick?.(item)}
      className={`flex items-center gap-2 p-2 rounded-lg cursor-move hover:shadow-md transition-all ${
        item.importance === 'high' 
          ? 'bg-red-50 dark:bg-red-900/30' 
          : 'bg-[#F5F3FF] dark:bg-[#A996FF]/20'
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 ${
        item.status === 'done' 
          ? 'bg-emerald-500 border-emerald-500' 
          : item.importance === 'high' 
            ? 'border-red-400' 
            : 'border-[#A996FF]'
      }`} />
      <p className={`flex-1 text-sm ${item.status === 'done' ? 'line-through text-gray-400' : textPrimary} truncate`}>
        {item.title}
      </p>
      <GripVertical size={12} className="text-gray-400" />
    </div>
  );
};

// === Phase 6: 완료 피드백 강화 ===

export { CalendarAgendaView, MiniWeekTimeline, DraggableCalendarItem };
