import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Clock, CheckCircle2, Circle, Calendar, Zap, GripVertical,
  ChevronLeft, ChevronRight
} from 'lucide-react';

// Common Components
import { DomainBadge } from '../common';

const UnifiedTimelineView = ({ 
  events = [], 
  tasks = [], 
  onEventClick, 
  onTaskClick, 
  onStartFocus,
  onUpdateTaskTime,
  onUpdateEventTime,
  darkMode = false 
}) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeStr = currentHour.toString().padStart(2, '0') + ':' + currentMinute.toString().padStart(2, '0');
  
  // 드래그 상태
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  
  // 다크모드 스타일
  const cardBg = darkMode ? 'bg-gray-800/90' : 'bg-white/90';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-[#A996FF]/20';
  
  // 시간 파싱 헬퍼
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  
  // 분을 시간 문자열로 변환
  const minutesToTimeStr = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0');
  };
  
  const currentTotalMin = currentHour * 60 + currentMinute;
  
  // 이벤트와 태스크를 통합 아이템으로 변환
  const timelineItems = [];
  
  // 이벤트 추가
  events.forEach(event => {
    const startMin = parseTime(event.start);
    if (startMin !== null) {
      const endMin = parseTime(event.end) || (startMin + 60);
      timelineItems.push({
        id: event.id,
        type: 'event',
        title: event.title,
        startTime: event.start,
        endTime: event.end,
        startMin,
        endMin,
        duration: endMin - startMin,
        location: event.location,
        color: event.color || 'bg-[#A996FF]',
        important: event.important,
        original: event,
      });
    }
  });
  
  // 시간이 있는 태스크 추가
  tasks.forEach(task => {
    if (task.scheduledTime) {
      const startMin = parseTime(task.scheduledTime);
      if (startMin !== null) {
        const duration = task.duration || task.estimatedTime || 30;
        timelineItems.push({
          id: task.id,
          type: 'task',
          title: task.title,
          startTime: task.scheduledTime,
          startMin,
          endMin: startMin + duration,
          duration,
          project: task.project,
          status: task.status,
          importance: task.importance,
          original: task,
        });
      }
    }
  });
  
  // 시간순 정렬
  timelineItems.sort((a, b) => a.startMin - b.startMin);
  
  // 빈 시간대 계산 (30분 이상 갭만 표시)
  const calculateGaps = () => {
    const gaps = [];
    const dayStart = 8 * 60; // 8:00 AM
    const dayEnd = 20 * 60; // 8:00 PM
    
    let lastEnd = dayStart;
    
    timelineItems.forEach(item => {
      if (item.startMin > lastEnd && item.startMin - lastEnd >= 30) {
        gaps.push({
          startMin: lastEnd,
          endMin: item.startMin,
          duration: item.startMin - lastEnd,
        });
      }
      lastEnd = Math.max(lastEnd, item.endMin);
    });
    
    // 마지막 아이템 이후의 빈 시간
    if (dayEnd > lastEnd && dayEnd - lastEnd >= 30) {
      gaps.push({
        startMin: lastEnd,
        endMin: dayEnd,
        duration: dayEnd - lastEnd,
      });
    }
    
    return gaps;
  };
  
  const timeGaps = calculateGaps();
  
  // 시간 미정 태스크
  const unscheduledTasks = tasks.filter(t => 
    !t.scheduledTime && t.status !== 'done'
  );
  
  // 현재 시간 위치 계산
  const getTimePosition = (minutes) => {
    const dayStart = 7 * 60;
    const dayEnd = 22 * 60;
    const range = dayEnd - dayStart;
    return Math.max(0, Math.min(100, ((minutes - dayStart) / range) * 100));
  };
  
  // 아이템 상태 확인
  const getItemStatus = (item) => {
    const startMin = item.startMin;
    const endMin = item.endMin || (startMin + (item.duration || 30));
    
    if (currentTotalMin >= startMin && currentTotalMin < endMin) return 'ongoing';
    if (currentTotalMin >= endMin) return 'past';
    if (startMin - currentTotalMin <= 30) return 'soon';
    return 'upcoming';
  };
  
  // 다음 아이템까지 남은 시간
  const getNextItemCountdown = () => {
    const upcoming = timelineItems.find(item => item.startMin > currentTotalMin);
    if (!upcoming) return null;
    
    const diffMin = upcoming.startMin - currentTotalMin;
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    
    return {
      item: upcoming,
      text: hours > 0 ? hours + '시간 ' + mins + '분' : mins + '분',
      totalMins: diffMin,
    };
  };
  
  const nextItem = getNextItemCountdown();
  
  // 통계
  const completedCount = timelineItems.filter(item => 
    item.type === 'task' ? item.original?.status === 'done' : getItemStatus(item) === 'past'
  ).length;
  
  // === 드래그 앤 드롭 핸들러 ===
  const handleDragStart = (e, item, isUnscheduled = false) => {
    setDraggedItem({ ...item, isUnscheduled });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverSlot(null);
  };
  
  const handleDragOver = (e, slotTime) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotTime);
  };
  
  const handleDragLeave = () => {
    setDragOverSlot(null);
  };
  
  const handleDrop = (e, targetTime) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const newTimeStr = minutesToTimeStr(targetTime);
    
    if (draggedItem.type === 'task') {
      onUpdateTaskTime?.(draggedItem.id, newTimeStr);
    } else if (draggedItem.type === 'event') {
      onUpdateEventTime?.(draggedItem.id, newTimeStr);
    }
    
    setDraggedItem(null);
    setDragOverSlot(null);
  };
  
  // 드롭 가능한 시간 슬롯 생성 (30분 단위)
  const timeSlots = [];
  for (let min = 7 * 60; min < 22 * 60; min += 30) {
    timeSlots.push(min);
  }
  
  // 타임라인 아이템과 빈 시간대를 합쳐서 렌더링
  const renderTimelineContent = () => {
    const allItems = [];
    let currentTime = 8 * 60; // 8:00 AM 시작
    
    // 아이템과 갭을 시간순으로 정렬
    const sortedItems = [...timelineItems];
    let gapIndex = 0;
    
    sortedItems.forEach((item, idx) => {
      // 아이템 전에 빈 시간대 체크
      const relevantGap = timeGaps.find(g => g.startMin < item.startMin && g.endMin <= item.startMin && g.startMin >= currentTime);
      if (relevantGap && !allItems.find(a => a.isGap && a.startMin === relevantGap.startMin)) {
        allItems.push({ ...relevantGap, isGap: true, id: 'gap-' + relevantGap.startMin });
      }
      
      allItems.push(item);
      currentTime = item.endMin;
    });
    
    // 마지막 갭 추가
    const lastGap = timeGaps.find(g => g.startMin >= currentTime);
    if (lastGap && !allItems.find(a => a.isGap && a.startMin === lastGap.startMin)) {
      allItems.push({ ...lastGap, isGap: true, id: 'gap-' + lastGap.startMin });
    }
    
    return allItems;
  };
  
  const timelineContent = renderTimelineContent();
  
  return (
    <div className={cardBg + " backdrop-blur-xl rounded-xl shadow-sm border " + borderColor + " overflow-hidden mb-4"}>
      {/* 헤더 */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className={"text-sm font-semibold " + textPrimary + " flex items-center gap-2"}>
            <span>📋</span> 오늘 한눈에
            <span className="text-[10px] px-1.5 py-0.5 bg-[#A996FF]/10 text-[#A996FF] rounded-full font-normal">드래그로 이동</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className={"text-xs " + textSecondary}>
              {completedCount}/{timelineItems.length + unscheduledTasks.length} 완료
            </span>
          </div>
        </div>
        
        {/* 현재 시간 인디케이터 */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#A996FF] text-white rounded-full shadow-md">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs font-bold">지금 {currentTimeStr}</span>
          </div>
          {nextItem && nextItem.totalMins <= 120 && (
            <span className={"text-xs " + textSecondary}>
              → {nextItem.item.title.length > 10 ? nextItem.item.title.slice(0, 10) + '...' : nextItem.item.title} <span className="text-[#A996FF] font-semibold">{nextItem.text} 후</span>
            </span>
          )}
        </div>
        
        {/* 미니 타임바 */}
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#A996FF]/30 to-[#A996FF]/50 rounded-full"
            style={{ width: getTimePosition(currentTotalMin) + '%' }}
          />
          <div 
            className="absolute top-1/2 w-3 h-3 bg-[#A996FF] rounded-full border-2 border-white shadow-md z-10"
            style={{ left: getTimePosition(currentTotalMin) + '%', marginLeft: '-6px', transform: 'translateY(-50%)' }}
          />
          {timelineItems.map(item => (
            <div
              key={item.id}
              className={"absolute top-1/2 w-1.5 h-1.5 rounded-full " + (item.type === 'event' ? 'bg-blue-400' : 'bg-emerald-400')}
              style={{ left: getTimePosition(item.startMin) + '%', transform: 'translateY(-50%)' }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>7:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>22:00</span>
        </div>
      </div>
      
      {/* 타임라인 리스트 */}
      <div className="px-4 pb-2">
        <div className="relative border-l-2 border-[#E5E0FF] ml-3 space-y-0">
          {timelineContent.map((item) => {
            // 빈 시간대 렌더링
            if (item.isGap) {
              const gapHours = Math.floor(item.duration / 60);
              const gapMins = item.duration % 60;
              const gapText = gapHours > 0 
                ? gapHours + '시간' + (gapMins > 0 ? ' ' + gapMins + '분' : '')
                : gapMins + '분';
              
              return (
                <div 
                  key={item.id}
                  className="relative pl-5 py-1"
                  onDragOver={(e) => handleDragOver(e, item.startMin)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, item.startMin)}
                >
                  <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-[#E5E0FF] border border-white"></div>
                  <div className={"p-2.5 rounded-xl border-2 border-dashed transition-all " + (
                    dragOverSlot === item.startMin
                      ? 'border-[#A996FF] bg-[#A996FF]/10'
                      : (darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50/50')
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={"text-xs " + textSecondary}>
                          {minutesToTimeStr(item.startMin)} - {minutesToTimeStr(item.endMin)}
                        </span>
                        <span className={"text-[10px] px-1.5 py-0.5 rounded " + (darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500')}>
                          {gapText} 비어있어요
                        </span>
                      </div>
                      {draggedItem && (
                        <span className="text-[10px] text-[#A996FF] font-medium animate-pulse">
                          여기에 드롭!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            
            // 일반 아이템 렌더링
            const status = getItemStatus(item);
            const isPast = status === 'past';
            const isOngoing = status === 'ongoing';
            const isSoon = status === 'soon';
            const isDragging = draggedItem?.id === item.id;
            
            return (
              <div 
                key={item.id}
                draggable={!isPast}
                onDragStart={(e) => handleDragStart(e, item)}
                onDragEnd={handleDragEnd}
                className={"relative pl-5 py-2 " + (isPast ? 'opacity-50' : '') + (isDragging ? ' opacity-30' : '')}
              >
                <div className={"absolute -left-[9px] top-3 w-4 h-4 rounded-full border-2 border-white " + (
                  isOngoing ? 'bg-[#A996FF] ring-4 ring-[#A996FF]/20' :
                  isPast ? 'bg-gray-300' :
                  isSoon ? 'bg-[#A996FF]/70' :
                  'bg-[#E5E0FF]'
                )}>
                  {item.type === 'task' && item.original?.status === 'done' && (
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white">✓</span>
                  )}
                </div>
                
                <div
                  onClick={() => item.type === 'event' ? onEventClick?.(item.original) : onTaskClick?.(item.original)}
                  className={"w-full text-left p-3 rounded-xl transition-all cursor-pointer " + (
                    isOngoing 
                      ? 'bg-[#A996FF]/10 border border-[#A996FF]/30 shadow-sm' 
                      : isSoon
                      ? (darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]')
                      : (darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100')
                  ) + (!isPast ? ' cursor-grab active:cursor-grabbing' : '')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={"text-xs font-bold " + (isOngoing ? 'text-[#A996FF]' : textSecondary)}>
                          {item.startTime}
                        </span>
                        <span className={"text-[10px] px-1.5 py-0.5 rounded " + (
                          item.type === 'event' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-emerald-100 text-emerald-600'
                        )}>
                          {item.type === 'event' ? '📅' : '✅'}
                        </span>
                        {item.important && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded">중요</span>
                        )}
                        {!isPast && (
                          <span className={"text-[10px] " + textSecondary}>
                            <GripVertical size={12} className="inline opacity-40" />
                          </span>
                        )}
                      </div>
                      
                      <p className={"font-medium text-sm " + (isPast ? 'line-through ' : '') + (isOngoing ? 'text-[#A996FF]' : textPrimary)}>
                        {item.title}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {item.location && (
                          <span className={"text-xs " + textSecondary}>📍 {item.location}</span>
                        )}
                        {item.project && (
                          <span className={"text-xs " + textSecondary}>{item.project}</span>
                        )}
                        {item.duration && (
                          <span className={"text-xs " + textSecondary}>~{item.duration}분</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {isOngoing && (
                        <span className="text-[10px] px-2 py-1 bg-[#A996FF] text-white rounded-full font-medium animate-pulse">
                          진행중
                        </span>
                      )}
                      {isSoon && !isOngoing && (
                        <span className={"text-[10px] px-2 py-1 rounded-full font-medium " + (darkMode ? 'bg-gray-600 text-gray-200' : 'bg-[#EDE9FE] text-[#7C6CD6]')}>
                          곧
                        </span>
                      )}
                      {item.type === 'task' && !isPast && item.original?.status !== 'done' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onStartFocus?.(item.original); }}
                          className="px-2 py-1 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-lg text-[10px] font-bold hover:opacity-90"
                        >
                          ⚡ 시작
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {timelineItems.length === 0 && (
            <div 
              className="pl-5 py-4"
              onDragOver={(e) => handleDragOver(e, 9 * 60)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 9 * 60)}
            >
              <div className={"p-4 rounded-xl border-2 border-dashed text-center transition-all " + (
                dragOverSlot === 9 * 60
                  ? 'border-[#A996FF] bg-[#A996FF]/10'
                  : (darkMode ? 'border-gray-600' : 'border-gray-200')
              )}>
                <p className={"text-sm " + textSecondary}>
                  {draggedItem ? '여기에 드롭해서 9:00에 배정' : '오늘 일정이 없어요 🎉'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 시간 미정 태스크 섹션 */}
      {unscheduledTasks.length > 0 && (
        <div className={"px-4 pb-4 pt-2 border-t " + (darkMode ? 'border-gray-700' : 'border-gray-100')}>
          <div className="flex items-center justify-between mb-2">
            <p className={"text-xs font-semibold " + textSecondary}>
              📌 시간 미정 ({unscheduledTasks.length})
            </p>
            <p className={"text-[10px] " + textSecondary}>
              위로 드래그해서 시간 배정
            </p>
          </div>
          <div className="space-y-1.5">
            {unscheduledTasks.slice(0, 5).map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, { 
                  id: task.id, 
                  type: 'task', 
                  title: task.title,
                  duration: task.duration || 30,
                  original: task 
                }, true)}
                onDragEnd={handleDragEnd}
                onClick={() => onTaskClick?.(task)}
                className={"flex items-center justify-between p-2.5 rounded-xl transition-all cursor-grab active:cursor-grabbing " + (
                  darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                ) + (draggedItem?.id === task.id ? ' opacity-30' : '')}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <GripVertical size={14} className={textSecondary + " opacity-40"} />
                  <div className={"w-1.5 h-1.5 rounded-full " + (
                    task.importance === 'high' ? 'bg-red-400' :
                    task.importance === 'low' ? 'bg-gray-300' : 'bg-[#A996FF]'
                  )}></div>
                  <span className={"text-sm truncate " + textPrimary}>{task.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {task.duration && (
                    <span className={"text-[10px] " + textSecondary}>~{task.duration}분</span>
                  )}
                  {task.deadline && (
                    <span className={"text-[10px] " + (
                      task.deadline.includes('오늘') || task.deadline.includes('D-0')
                        ? 'text-red-500 font-semibold'
                        : textSecondary
                    )}>
                      {task.deadline}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {unscheduledTasks.length > 5 && (
              <p className={"text-xs text-center " + textSecondary + " pt-1"}>
                +{unscheduledTasks.length - 5}개 더
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* 드래그 중 안내 오버레이 */}
      {draggedItem && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#A996FF] text-white text-xs rounded-full shadow-lg z-20 pointer-events-none">
          "{draggedItem.title.length > 15 ? draggedItem.title.slice(0, 15) + '...' : draggedItem.title}" 이동 중...
        </div>
      )}
    </div>
  );
};

// === Quick Capture Modal ===

export default UnifiedTimelineView;
