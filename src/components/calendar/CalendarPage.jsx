import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin,
  CheckCircle2, Circle, MoreHorizontal, RefreshCw, Loader2, Briefcase, Heart
} from 'lucide-react';

// Common Components
import { DomainBadge } from '../common';

// Other Components
import EventModal from '../modals/EventModal';
import { CalendarAgendaView, MiniWeekTimeline } from './AgendaComponents';

// Hooks
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';

var CalendarPage = function(props) {
  var onBack = props.onBack;
  var tasks = props.tasks || [];
  var allTasks = props.allTasks || [];
  var events = props.events || [];
  var darkMode = props.darkMode;
  var onAddEvent = props.onAddEvent;
  var onUpdateEvent = props.onUpdateEvent;
  var onDeleteEvent = props.onDeleteEvent;
  var onUpdateTask = props.onUpdateTask;
  var onSyncGoogleEvents = props.onSyncGoogleEvents;
  // App.jsx에서 전달되는 props
  var isConnectedProp = props.isConnected;
  var onConnectProp = props.onConnect;

  // Google Calendar 훅
  var googleCalendar = useGoogleCalendar();
  // 훅의 실제 속성명 사용
  var isGoogleConnected = googleCalendar.isConnected;
  var connectGoogle = googleCalendar.connect;
  var syncEvents = googleCalendar.syncEvents;
  
  var viewModeState = useState('month');
  var viewMode = viewModeState[0];
  var setViewMode = viewModeState[1];
  
  var selectedDateState = useState(new Date());
  var selectedDate = selectedDateState[0];
  var setSelectedDate = selectedDateState[1];
  
  var currentMonthState = useState(new Date());
  var currentMonth = currentMonthState[0];
  var setCurrentMonth = currentMonthState[1];
  
  var currentWeekStartState = useState(function() {
    var today = new Date();
    var dayOfWeek = today.getDay();
    var start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    return start;
  });
  var currentWeekStart = currentWeekStartState[0];
  var setCurrentWeekStart = currentWeekStartState[1];
  
  var showFiltersState = useState({ work: true, life: true });
  var showFilters = showFiltersState[0];
  var setShowFilters = showFiltersState[1];
  
  var showEventModalState = useState(false);
  var showEventModal = showEventModalState[0];
  var setShowEventModal = showEventModalState[1];
  
  var editingEventState = useState(null);
  var editingEvent = editingEventState[0];
  var setEditingEvent = editingEventState[1];
  
  var isSyncingState = useState(false);
  var isSyncing = isSyncingState[0];
  var setIsSyncing = isSyncingState[1];
  
  var lastSyncTimeState = useState(null);
  var lastSyncTime = lastSyncTimeState[0];
  var setLastSyncTime = lastSyncTimeState[1];

  // Google Calendar에서 일정 불러오기
  var syncFromGoogle = useCallback(function() {
    if (!isGoogleConnected) {
      // 연결되지 않았으면 App.jsx의 onConnect를 호출 (모달 열기)
      if (onConnectProp) {
        onConnectProp();
      } else {
        connectGoogle();
      }
      return;
    }
    
    setIsSyncing(true);
    
    // syncEvents 호출 (useGoogleCalendar 훅의 함수)
    if (syncEvents) {
      syncEvents().then(function() {
        setLastSyncTime(new Date());
      }).catch(function(err) {
        console.error('Google Calendar 동기화 실패:', err);
      }).finally(function() {
        setIsSyncing(false);
      });
    } else {
      setIsSyncing(false);
    }
  }, [isGoogleConnected, syncEvents, onConnectProp, connectGoogle]);

  // 연결 버튼 클릭 핸들러
  var handleConnectClick = function() {
    if (isGoogleConnected) {
      // 이미 연결됐으면 동기화
      syncFromGoogle();
    } else {
      // 연결 안됐으면 모달 열기 (App.jsx의 onConnect 호출)
      if (onConnectProp) {
        onConnectProp();
      } else {
        connectGoogle();
      }
    }
  };

  // 이벤트 저장
  var handleSaveEvent = function(event) {
    if (editingEvent) {
      onUpdateEvent && onUpdateEvent(editingEvent.id, event);
    } else {
      onAddEvent && onAddEvent(event);
    }
    setEditingEvent(null);
    setShowEventModal(false);
  };

  // 이벤트 삭제
  var handleDeleteEvent = function(eventId) {
    onDeleteEvent && onDeleteEvent(eventId);
    setShowEventModal(false);
    setEditingEvent(null);
  };

  // 날짜 포맷
  var formatDate = function(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  };
  
  var formatMonthYear = function(date) {
    return date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월';
  };
  
  var formatWeekRange = function(startDate) {
    var endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return (startDate.getMonth() + 1) + '/' + startDate.getDate() + ' - ' + (endDate.getMonth() + 1) + '/' + endDate.getDate();
  };

  var weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  var today = new Date();
  var todayStr = formatDate(today);
  var selectedDateStr = formatDate(selectedDate);

  // 월간 달력 데이터 생성
  var getMonthDays = function() {
    var year = currentMonth.getFullYear();
    var month = currentMonth.getMonth();
    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);
    var startPadding = firstDay.getDay();
    var days = [];
    
    var prevMonth = new Date(year, month, 0);
    for (var i = startPadding - 1; i >= 0; i--) {
      var date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({ date: date, isCurrentMonth: false });
    }
    
    for (var j = 1; j <= lastDay.getDate(); j++) {
      days.push({ date: new Date(year, month, j), isCurrentMonth: true });
    }
    
    var remaining = 42 - days.length;
    for (var k = 1; k <= remaining; k++) {
      days.push({ date: new Date(year, month + 1, k), isCurrentMonth: false });
    }
    
    return days;
  };

  // 주간 달력 데이터 생성
  var getWeekDays = function() {
    var days = [];
    for (var i = 0; i < 7; i++) {
      var date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push({ date: date, isCurrentMonth: true });
    }
    return days;
  };

  // 해당 날짜의 아이템 가져오기
  var getItemsForDate = function(dateStr) {
    var dayEvents = (events || []).filter(function(e) { return e.date === dateStr; });
    var dayTasks = (allTasks || tasks || []).filter(function(t) {
      if (!t.deadline) return false;
      var taskDate = t.deadline.split('T')[0];
      return taskDate === dateStr;
    });
    var anytimeTasks = (allTasks || tasks || []).filter(function(t) { return !t.deadline; });
    
    return { events: dayEvents, tasks: dayTasks, anytimeTasks: anytimeTasks };
  };

  // 날짜에 아이템이 있는지 확인
  var hasItemsOnDate = function(dateStr) {
    var items = getItemsForDate(dateStr);
    return items.events.length > 0 || items.tasks.length > 0;
  };

  var selectedItems = getItemsForDate(selectedDateStr);

  // 브리핑 생성
  var getBriefing = function() {
    if (viewMode === 'week') {
      var weekTasks = [];
      for (var i = 0; i < 7; i++) {
        var date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);
        var items = getItemsForDate(formatDate(date));
        weekTasks = weekTasks.concat(items.tasks, items.events);
      }
      var taskCount = weekTasks.length;
      
      if (taskCount === 0) {
        return "이번 주는 여유로워요! 미뤄둔 일을 처리하거나 새로운 목표를 세워볼까요? 🌟";
      }
      return "이번 주 " + taskCount + "개의 일정이 있어요. 차근차근 진행하면 무리 없이 끝낼 수 있을 거예요! 👍";
    }
    return "캘린더에서 일정을 확인하고 관리해보세요! ✨";
  };

  // 네비게이션
  var goToPrev = function() {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    } else {
      var newStart = new Date(currentWeekStart);
      newStart.setDate(currentWeekStart.getDate() - 7);
      setCurrentWeekStart(newStart);
    }
  };

  var goToNext = function() {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    } else {
      var newStart = new Date(currentWeekStart);
      newStart.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(newStart);
    }
  };

  var goToToday = function() {
    setSelectedDate(new Date());
    setCurrentMonth(new Date());
    var dayOfWeek = today.getDay();
    var start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    setCurrentWeekStart(start);
  };

  // 스타일
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';

  var calendarDays = viewMode === 'month' ? getMonthDays() : getWeekDays();

  return (
    <div className={"flex-1 overflow-y-auto " + bgColor}>
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">캘린더</h1>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-all"
          >
            오늘
          </button>
        </div>
        
        {/* 뷰 모드 토글 */}
        <div className="flex justify-center mb-3">
          <div className="bg-white/20 rounded-full p-1 flex">
            <button
              onClick={function() { setViewMode('month'); }}
              className={"px-3 py-1.5 rounded-full text-sm font-medium transition-all " + (viewMode === 'month' ? 'bg-white text-[#8B7CF7]' : 'text-white/80')}
            >
              월간
            </button>
            <button
              onClick={function() { setViewMode('week'); }}
              className={"px-3 py-1.5 rounded-full text-sm font-medium transition-all " + (viewMode === 'week' ? 'bg-white text-[#8B7CF7]' : 'text-white/80')}
            >
              주간
            </button>
            <button
              onClick={function() { setViewMode('agenda'); }}
              className={"px-3 py-1.5 rounded-full text-sm font-medium transition-all " + (viewMode === 'agenda' ? 'bg-white text-[#8B7CF7]' : 'text-white/80')}
            >
              아젠다
            </button>
          </div>
        </div>
        
        {/* 월/주 네비게이션 */}
        <div className="flex items-center justify-between">
          <button onClick={goToPrev} className="p-2 hover:bg-white/20 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-bold text-lg">
              {viewMode === 'month' ? formatMonthYear(currentMonth) : formatWeekRange(currentWeekStart)}
            </p>
          </div>
          <button onClick={goToNext} className="p-2 hover:bg-white/20 rounded-full">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-32">
        {/* Google Calendar 동기화 상태 */}
        <div className={cardBg + " rounded-xl p-3 shadow-sm"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={"w-2 h-2 rounded-full " + (isGoogleConnected ? 'bg-green-500' : 'bg-gray-400')} />
              <span className={"text-sm " + textPrimary}>
                {isGoogleConnected ? 'Google Calendar 연결됨' : 'Google Calendar 연결 안됨'}
              </span>
              {lastSyncTime && (
                <span className={"text-xs " + textSecondary}>
                  · {lastSyncTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 동기화
                </span>
              )}
            </div>
            <button
              onClick={handleConnectClick}
              disabled={isSyncing}
              className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all " + 
                (isGoogleConnected ? 'bg-[#A996FF]/10 text-[#8B7CF7] hover:bg-[#A996FF]/20' : 'bg-blue-500 text-white hover:bg-blue-600') + 
                (isSyncing ? ' opacity-50' : '')}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? '동기화 중...' : isGoogleConnected ? '동기화' : '연결'}
            </button>
          </div>
        </div>

        {/* 알프레도 브리핑 */}
        <div className={cardBg + " rounded-xl p-4 shadow-sm"}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg shrink-0">
              🐧
            </div>
            <div>
              <p className={"text-xs " + textSecondary + " mb-1"}>
                {viewMode === 'week' ? '주간 브리핑' : '월간 브리핑'}
              </p>
              <p className={"text-sm " + textPrimary}>{getBriefing()}</p>
            </div>
          </div>
        </div>

        {/* 필터 토글 */}
        <div className="flex gap-2">
          <button
            onClick={function() { setShowFilters(function(f) { return { work: !f.work, life: f.life }; }); }}
            className={"flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all " + 
              (showFilters.work ? 'bg-[#A996FF] text-white' : 'bg-gray-200 text-gray-500')}
          >
            <Briefcase size={16} />
            <span className="text-sm font-medium">업무</span>
          </button>
          <button
            onClick={function() { setShowFilters(function(f) { return { work: f.work, life: !f.life }; }); }}
            className={"flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all " + 
              (showFilters.life ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500')}
          >
            <Heart size={16} />
            <span className="text-sm font-medium">일상</span>
          </button>
        </div>

        {/* 아젠다 뷰 */}
        {viewMode === 'agenda' && (
          <CalendarAgendaView
            events={events}
            tasks={allTasks}
            darkMode={darkMode}
            onSelectDate={function(date) { setSelectedDate(date); }}
            onEditEvent={function(event) { setEditingEvent(event); setShowEventModal(true); }}
            onDragTask={onUpdateTask}
            onDragEvent={onUpdateEvent}
          />
        )}

        {/* 달력 그리드 */}
        {viewMode !== 'agenda' && (
          <div className={cardBg + " rounded-xl p-4 shadow-sm"}>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map(function(day, i) {
                return (
                  <div 
                    key={day} 
                    className={"text-center text-xs font-medium py-2 " + 
                      (i === 0 ? 'text-red-400' : i === 6 ? 'text-gray-500' : textSecondary)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            
            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(function(dayObj, idx) {
                var date = dayObj.date;
                var isCurrentMonth = dayObj.isCurrentMonth;
                var dateStr = formatDate(date);
                var isToday = dateStr === todayStr;
                var isSelected = dateStr === selectedDateStr;
                var hasItems = hasItemsOnDate(dateStr);
                var dayOfWeek = date.getDay();
                
                return (
                  <button
                    key={idx}
                    onClick={function() { setSelectedDate(date); }}
                    className={"relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all " + 
                      (isSelected ? 'bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] text-white shadow-lg' : 
                       isToday ? 'bg-gray-100 text-gray-600' : 
                       !isCurrentMonth ? 'text-gray-300' : 
                       dayOfWeek === 0 ? 'text-red-400 hover:bg-red-50' : 
                       dayOfWeek === 6 ? 'text-gray-500 hover:bg-gray-100' : 
                       textPrimary + ' hover:bg-gray-100') + 
                      (viewMode === 'week' ? ' py-4' : '')}
                  >
                    <span className={"text-sm font-medium " + (viewMode === 'week' ? 'text-lg' : '')}>
                      {date.getDate()}
                    </span>
                    {hasItems && !isSelected && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#A996FF]" />
                      </div>
                    )}
                    {viewMode === 'week' && (
                      <span className={"text-xs mt-1 " + (isSelected ? 'text-white/80' : textSecondary)}>
                        {weekDays[dayOfWeek]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 선택된 날짜의 일정 */}
        {viewMode !== 'agenda' && (
          <div className={cardBg + " rounded-xl p-4 shadow-sm"}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={"font-bold " + textPrimary}>
                {(selectedDate.getMonth() + 1) + "월 " + selectedDate.getDate() + "일 (" + weekDays[selectedDate.getDay()] + ")"}
              </h3>
              {selectedDateStr === todayStr && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">오늘</span>
              )}
            </div>
            
            {/* 일정 */}
            {selectedItems.events.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className={"text-xs " + textSecondary + " flex items-center gap-1"}>
                    <Calendar size={12} /> 일정
                  </p>
                  <button
                    onClick={function() { setEditingEvent(null); setShowEventModal(true); }}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#A996FF] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedItems.events.map(function(event, i) {
                    return (
                      <div 
                        key={i}
                        onClick={function() { setEditingEvent(event); setShowEventModal(true); }}
                        className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        <div className={"w-1 h-10 rounded-full " + (event.fromGoogle ? 'bg-blue-500' : 'bg-[#A996FF]')} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{event.title}</p>
                          {event.start && event.start !== '00:00' && (
                            <p className="text-xs text-gray-500">
                              {event.start}{event.end && event.end !== '23:59' ? ' - ' + event.end : ''}
                            </p>
                          )}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin size={12} />
                            <span className="truncate max-w-[80px]">{event.location}</span>
                          </div>
                        )}
                        {event.fromGoogle && (
                          <div className="flex-shrink-0 w-5 h-5 bg-white rounded flex items-center justify-center shadow-sm">
                            <span className="text-xs">G</span>
                          </div>
                        )}
                        <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 태스크 */}
            {selectedItems.tasks.length > 0 && (
              <div className="mb-4">
                <p className={"text-xs " + textSecondary + " mb-2 flex items-center gap-1"}>
                  <CheckCircle2 size={12} /> 마감 태스크
                </p>
                <div className="space-y-2">
                  {selectedItems.tasks.map(function(task, i) {
                    return (
                      <div 
                        key={i}
                        className={"flex items-center gap-3 p-3 rounded-xl " + (task.status === 'done' ? 'bg-gray-50' : 'bg-[#F5F3FF]')}
                      >
                        <div className={"w-6 h-6 rounded-full border-2 flex items-center justify-center " + 
                          (task.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[#A996FF]')}>
                          {task.status === 'done' && <CheckCircle2 size={14} />}
                        </div>
                        <div className="flex-1">
                          <p className={"font-medium " + (task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800')}>
                            {task.title}
                          </p>
                          {task.project && (
                            <p className="text-xs text-gray-500">{task.project}</p>
                          )}
                        </div>
                        {task.importance === 'high' && task.status !== 'done' && (
                          <span className="text-red-500">!</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 아무것도 없을 때 */}
            {selectedItems.events.length === 0 && selectedItems.tasks.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className={textSecondary}>이 날은 일정이 없어요</p>
                <button 
                  onClick={function() { setEditingEvent(null); setShowEventModal(true); }}
                  className="mt-3 text-[#A996FF] text-sm font-medium"
                >
                  + 일정 추가하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal 
          isOpen={showEventModal}
          onClose={function() { setShowEventModal(false); setEditingEvent(null); }}
          event={editingEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          googleCalendar={googleCalendar}
        />
      )}
    </div>
  );
};

export default CalendarPage;
