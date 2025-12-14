import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin,
  CheckCircle2, Circle, MoreHorizontal, RefreshCw, Loader2
} from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

// Common Components
import { DomainBadge } from '../common';

// Calendar 폴더 내 다른 컴포넌트들
import { CalendarAgendaView, MiniWeekTimeline } from './AgendaComponents';

// Modals
import EventModal from '../modals/EventModal';

const CalendarPage = ({ onBack, tasks, allTasks, events, darkMode, onAddEvent, onUpdateEvent, onDeleteEvent, onUpdateTask, onSyncGoogleEvents }) => {
  // Google Calendar 훅
  const googleCalendar = useGoogleCalendar();
  
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    return start;
  });
  const [showFilters, setShowFilters] = useState({ work: true, life: true });
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Google Calendar에서 일정 불러오기
  const syncFromGoogle = useCallback(async () => {
    console.log('🚀 syncFromGoogle 시작!');
    console.log('🔑 isSignedIn:', googleCalendar.isSignedIn);
    
    if (!googleCalendar.isSignedIn) {
      console.log('❌ 로그인 안됨 - signIn 호출');
      googleCalendar.signIn();
      return;
    }
    
    setIsSyncing(true);
    try {
      // 현재 달 기준 전후 1개월 일정만 가져오기 (100개 limit 대응)
      const timeMin = new Date();
      timeMin.setMonth(timeMin.getMonth() - 1);
      timeMin.setDate(1);
      timeMin.setHours(0, 0, 0, 0);
      
      const timeMax = new Date();
      timeMax.setMonth(timeMax.getMonth() + 2);
      timeMax.setDate(0);
      timeMax.setHours(23, 59, 59, 999);
      
      console.log('📅 조회 기간:', timeMin.toISOString(), '~', timeMax.toISOString());
      
      const result = await googleCalendar.listEvents(
        timeMin.toISOString(),
        timeMax.toISOString()
      );
      
      console.log('📦 API 응답:', result);
      console.log('📊 이벤트 수:', result.events?.length || 0);
      
      if (result.events && result.events.length > 0) {
        // Google Calendar 일정을 앱 형식으로 변환
        const googleEvents = result.events.map(gEvent => {
          const startDateTime = gEvent.start?.dateTime || gEvent.start?.date;
          const endDateTime = gEvent.end?.dateTime || gEvent.end?.date;
          
          let date, start, end;
          if (gEvent.start?.dateTime) {
            // 시간이 있는 일정
            const startDate = new Date(startDateTime);
            const endDate = new Date(endDateTime);
            date = startDate.toISOString().split('T')[0];
            start = startDate.toTimeString().slice(0, 5);
            end = endDate.toTimeString().slice(0, 5);
          } else {
            // 종일 일정
            date = startDateTime;
            start = '00:00';
            end = '23:59';
          }
          
          console.log('🔄 변환:', gEvent.summary, '→', date);
          
          return {
            id: `google-${gEvent.id}`,
            googleEventId: gEvent.id,
            title: gEvent.summary || '(제목 없음)',
            date,
            start,
            end,
            location: gEvent.location || null,
            color: 'bg-blue-500', // Google 일정은 파란색
            important: false,
            fromGoogle: true, // Google에서 가져온 일정 표시
            description: gEvent.description || '',
          };
        });
        
        // 12월 일정만 필터링해서 로그
        const decEvents = googleEvents.filter(e => e.date?.startsWith('2025-12'));
        console.log('📆 12월 일정:', decEvents.length, decEvents.map(e => `${e.date}: ${e.title}`));
        
        // 부모 컴포넌트에 동기화된 일정 전달
        console.log('📤 onSyncGoogleEvents 호출:', typeof onSyncGoogleEvents);
        if (onSyncGoogleEvents) {
          onSyncGoogleEvents(googleEvents);
          console.log('✅ onSyncGoogleEvents 호출 완료!');
        } else {
          console.error('❌ onSyncGoogleEvents가 undefined입니다!');
        }
        setLastSyncTime(new Date());
        console.log(`✅ ${googleEvents.length}개 일정 동기화 완료`);
      } else {
        console.log('⚠️ 가져올 일정이 없습니다');
      }
    } catch (err) {
      console.error('❌ Google Calendar 동기화 실패:', err);
      console.error('에러 메시지:', err.message);
      // 401 에러 (토큰 만료) 시 재로그인
      if (err.message?.includes('401') || err.message?.includes('Unauthorized') || err.message?.includes('로그인')) {
        console.log('🔄 토큰 만료 - 재로그인 시도');
        googleCalendar.signOut();
        setTimeout(() => googleCalendar.signIn(), 500);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [googleCalendar, onSyncGoogleEvents]);
  
  // 컴포넌트 마운트 시 자동 동기화
  useEffect(() => {
    if (googleCalendar.isSignedIn && !lastSyncTime) {
      syncFromGoogle();
    }
  }, [googleCalendar.isSignedIn]);
  
  // 이벤트 저장 (추가/수정) - Google Calendar 연동
  const handleSaveEvent = async (event) => {
    try {
      let googleEventId = event.googleEventId;
      
      // Google Calendar 동기화
      if (event.syncToGoogle && googleCalendar.isSignedIn) {
        const googleEvent = {
          title: event.title,
          date: event.date,
          start: event.start,
          end: event.end,
          location: event.location,
        };
        
        if (editingEvent && googleEventId) {
          const result = await googleCalendar.updateEvent(googleEventId, googleEvent);
          googleEventId = result.event?.id || googleEventId;
        } else {
          const result = await googleCalendar.addEvent(googleEvent);
          googleEventId = result.event?.id;
        }
      } else if (!event.syncToGoogle && editingEvent?.googleEventId) {
        try {
          await googleCalendar.deleteEvent(editingEvent.googleEventId);
        } catch (err) {
          console.log('Google event delete skipped:', err);
        }
        googleEventId = null;
      }
      
      const eventWithGoogle = { ...event, googleEventId };
      
      if (editingEvent) {
        onUpdateEvent && onUpdateEvent(editingEvent.id, eventWithGoogle);
      } else {
        onAddEvent && onAddEvent(eventWithGoogle);
      }
      
      // 동기화 후 다시 불러오기
      if (event.syncToGoogle && googleCalendar.isSignedIn) {
        setTimeout(() => syncFromGoogle(), 1000);
      }
    } catch (err) {
      console.error('Google Calendar sync error:', err);
      if (editingEvent) {
        onUpdateEvent && onUpdateEvent(editingEvent.id, event);
      } else {
        onAddEvent && onAddEvent(event);
      }
    }
    
    setEditingEvent(null);
    setShowEventModal(false);
  };
  
  // 이벤트 삭제 - Google Calendar 연동
  const handleDeleteEvent = async (eventId, googleEventId) => {
    try {
      if (googleEventId && googleCalendar.isSignedIn) {
        await googleCalendar.deleteEvent(googleEventId);
      }
    } catch (err) {
      console.error('Google Calendar delete error:', err);
    }
    
    onDeleteEvent && onDeleteEvent(eventId);
    setShowEventModal(false);
    setEditingEvent(null);
    
    // 동기화 후 다시 불러오기
    if (googleCalendar.isSignedIn) {
      setTimeout(() => syncFromGoogle(), 500);
    }
  };
  
  // 날짜 포맷
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  const formatMonthYear = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };
  
  const formatWeekRange = (startDate) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;
  };
  
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  const todayStr = formatDate(today);
  const selectedDateStr = formatDate(selectedDate);
  
  // 월간 달력 데이터 생성
  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days = [];
    
    // 이전 달 padding
    const prevMonth = new Date(year, month, 0);
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // 현재 달
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // 다음 달 padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };
  
  // 주간 달력 데이터 생성
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push({ date, isCurrentMonth: true });
    }
    return days;
  };
  
  // 해당 날짜의 아이템 가져오기
  const getItemsForDate = (dateStr) => {
    // 필터 적용
    const filterItem = (item) => {
      const isWork = item.project?.includes('투자') || item.project?.includes('팀') || item.category === 'work';
      if (isWork && !showFilters.work) return false;
      if (!isWork && !showFilters.life) return false;
      return true;
    };
    
    // 일정 (events)
    const dayEvents = (events || []).filter(e => e.date === dateStr && filterItem(e));
    
    // 태스크 (deadline 있는 것)
    const dayTasks = (allTasks || tasks || []).filter(t => {
      if (!t.deadline) return false;
      const taskDate = t.deadline.split('T')[0];
      return taskDate === dateStr && filterItem(t);
    });
    
    // 언제든 해도 되는 일 (deadline 없는 것)
    const anytimeTasks = (allTasks || tasks || []).filter(t => !t.deadline && filterItem(t));
    
    return { events: dayEvents, tasks: dayTasks, anytimeTasks };
  };
  
  // 날짜에 아이템이 있는지 확인 (dot 표시용)
  const hasItemsOnDate = (dateStr) => {
    const { events: e, tasks: t } = getItemsForDate(dateStr);
    return e.length > 0 || t.length > 0;
  };
  
  // 선택된 날짜의 아이템
  const selectedItems = getItemsForDate(selectedDateStr);
  
  // 알프레도 브리핑 생성
  const getBriefing = () => {
    if (viewMode === 'week') {
      // 주간 브리핑
      const weekTasks = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);
        const items = getItemsForDate(formatDate(date));
        weekTasks.push(...items.tasks, ...items.events);
      }
      const taskCount = weekTasks.length;
      const highPriority = weekTasks.filter(t => t.importance === 'high').length;
      
      if (taskCount === 0) {
        return "이번 주는 여유로워요! 미뤄둔 일을 처리하거나 새로운 목표를 세워볼까요? 🌟";
      } else if (highPriority >= 3) {
        return `이번 주 ${taskCount}개의 일정 중 중요한 게 ${highPriority}개나 있어요. 우선순위 잘 정해서 하나씩 해결해봐요! 💪`;
      } else {
        return `이번 주 ${taskCount}개의 일정이 있어요. 차근차근 진행하면 무리 없이 끝낼 수 있을 거예요! 👍`;
      }
    } else {
      // 월간 브리핑
      const monthDays = getMonthDays().filter(d => d.isCurrentMonth);
      let totalTasks = 0;
      let busyDays = 0;
      
      monthDays.forEach(d => {
        const items = getItemsForDate(formatDate(d.date));
        const count = items.tasks.length + items.events.length;
        totalTasks += count;
        if (count >= 3) busyDays++;
      });
      
      if (totalTasks === 0) {
        return "이번 달은 일정이 없네요. 새로운 계획을 세워볼까요? 📝";
      } else if (busyDays >= 5) {
        return `이번 달은 좀 바쁠 것 같아요. 바쁜 날이 ${busyDays}일이나 돼요. 체력 관리도 신경 쓰세요! 🏃`;
      } else {
        return `이번 달 총 ${totalTasks}개의 일정이 있어요. 균형 잡힌 한 달이 될 것 같아요! ✨`;
      }
    }
  };
  
  // 네비게이션
  const goToPrev = () => {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    } else {
      const newStart = new Date(currentWeekStart);
      newStart.setDate(currentWeekStart.getDate() - 7);
      setCurrentWeekStart(newStart);
    }
  };
  
  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    } else {
      const newStart = new Date(currentWeekStart);
      newStart.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(newStart);
    }
  };
  
  const goToToday = () => {
    setSelectedDate(new Date());
    setCurrentMonth(new Date());
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    setCurrentWeekStart(start);
  };
  
  // 스타일
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  const calendarDays = viewMode === 'month' ? getMonthDays() : getWeekDays();
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgColor}`}>
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
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                viewMode === 'month' ? 'bg-white text-[#8B7CF7]' : 'text-white/80'
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                viewMode === 'week' ? 'bg-white text-[#8B7CF7]' : 'text-white/80'
              }`}
            >
              주간
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                viewMode === 'agenda' ? 'bg-white text-[#8B7CF7]' : 'text-white/80'
              }`}
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
        <div className={`${cardBg} rounded-xl p-3 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${googleCalendar.isSignedIn ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className={`text-sm ${textPrimary}`}>
                {googleCalendar.isSignedIn 
                  ? `Google Calendar 연결됨` 
                  : 'Google Calendar 연결 안됨'}
              </span>
              {lastSyncTime && (
                <span className={`text-xs ${textSecondary}`}>
                  · {lastSyncTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 동기화
                </span>
              )}
            </div>
            <button
              onClick={googleCalendar.isSignedIn ? syncFromGoogle : googleCalendar.signIn}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                googleCalendar.isSignedIn 
                  ? 'bg-[#A996FF]/10 text-[#8B7CF7] hover:bg-[#A996FF]/20' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } ${isSyncing ? 'opacity-50' : ''}`}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? '동기화 중...' : googleCalendar.isSignedIn ? '동기화' : '연결'}
            </button>
          </div>
        </div>
        
        {/* 알프레도 브리핑 */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg shrink-0">
              🐧
            </div>
            <div>
              <p className={`text-xs ${textSecondary} mb-1`}>
                {viewMode === 'week' ? '주간 브리핑' : '월간 브리핑'}
              </p>
              <p className={`text-sm ${textPrimary}`}>{getBriefing()}</p>
            </div>
          </div>
        </div>
        
        {/* 필터 토글 */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(f => ({ ...f, work: !f.work }))}
            className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              showFilters.work 
                ? 'bg-gray-1000 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            <Briefcase size={16} />
            <span className="text-sm font-medium">업무</span>
          </button>
          <button
            onClick={() => setShowFilters(f => ({ ...f, life: !f.life }))}
            className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              showFilters.life 
                ? 'bg-[#F5F3FF]0 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}
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
            onSelectDate={(date) => setSelectedDate(date)}
            onEditEvent={(event) => { setEditingEvent(event); setShowEventModal(true); }}
            onDragTask={onUpdateTask}
            onDragEvent={onUpdateEvent}
          />
        )}
        
        {/* 달력 그리드 */}
        {viewMode !== 'agenda' && (
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((day, i) => (
              <div 
                key={day} 
                className={`text-center text-xs font-medium py-2 ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-gray-500' : textSecondary
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* 날짜 그리드 */}
          <div className={`grid grid-cols-7 gap-1 ${viewMode === 'week' ? '' : ''}`}>
            {calendarDays.map(({ date, isCurrentMonth }, idx) => {
              const dateStr = formatDate(date);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDateStr;
              const hasItems = hasItemsOnDate(dateStr);
              const dayOfWeek = date.getDay();
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] text-white shadow-lg' 
                      : isToday 
                        ? 'bg-gray-100 text-gray-600' 
                        : !isCurrentMonth 
                          ? 'text-gray-300' 
                          : dayOfWeek === 0 
                            ? 'text-red-400 hover:bg-red-50' 
                            : dayOfWeek === 6 
                              ? 'text-gray-500 hover:bg-gray-100' 
                              : `${textPrimary} hover:bg-gray-100`
                  } ${viewMode === 'week' ? 'py-4' : ''}`}
                >
                  <span className={`text-sm font-medium ${viewMode === 'week' ? 'text-lg' : ''}`}>
                    {date.getDate()}
                  </span>
                  {hasItems && !isSelected && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-[#A996FF]' : 'bg-[#A996FF]'}`} />
                    </div>
                  )}
                  {viewMode === 'week' && (
                    <span className={`text-xs mt-1 ${isSelected ? 'text-white/80' : textSecondary}`}>
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
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold ${textPrimary}`}>
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 ({weekDays[selectedDate.getDay()]})
            </h3>
            {selectedDateStr === todayStr && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">오늘</span>
            )}
          </div>
          
          {/* 일정 (Events) */}
          {selectedItems.events.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs ${textSecondary} flex items-center gap-1`}>
                  <Calendar size={12} /> 일정
                </p>
                <button
                  onClick={() => { 
                    setEditingEvent(null); 
                    setShowEventModal(true); 
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#A996FF] transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {selectedItems.events.map((event, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setEditingEvent(event);
                      setShowEventModal(true);
                    }}
                    className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors active:scale-[0.98]"
                  >
                    <div className={`w-1 h-10 rounded-full ${event.fromGoogle ? 'bg-blue-500' : 'bg-[#A996FF]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{event.title}</p>
                      {(event.start && event.start !== '00:00') && (
                        <p className="text-xs text-gray-500">
                          {event.start}{event.end && event.end !== '23:59' ? ` - ${event.end}` : ''}
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
                ))}
              </div>
            </div>
          )}
          
          {/* 태스크 (Deadline 있는 것) */}
          {selectedItems.tasks.length > 0 && (
            <div className="mb-4">
              <p className={`text-xs ${textSecondary} mb-2 flex items-center gap-1`}>
                <CheckCircle2 size={12} /> 마감 태스크
              </p>
              <div className="space-y-2">
                {selectedItems.tasks.map((task, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      task.status === 'done' ? 'bg-gray-50' : 'bg-[#F5F3FF]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.status === 'done' 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-[#A996FF]'
                    }`}>
                      {task.status === 'done' && <CheckCircle2 size={14} />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
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
                ))}
              </div>
            </div>
          )}
          
          {/* 언제든 해도 되는 일 */}
          {selectedDateStr === todayStr && selectedItems.anytimeTasks.length > 0 && (
            <div>
              <p className={`text-xs ${textSecondary} mb-2 flex items-center gap-1`}>
                <Clock size={12} /> 언제든 해도 되는 일
              </p>
              <div className="space-y-2">
                {selectedItems.anytimeTasks.slice(0, 5).map((task, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      task.status === 'done' ? 'bg-gray-50' : 'bg-[#F5F3FF]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.status === 'done' 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-[#A996FF]'
                    }`}>
                      {task.status === 'done' && <CheckCircle2 size={14} />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                    </div>
                  </div>
                ))}
                {selectedItems.anytimeTasks.length > 5 && (
                  <p className={`text-xs ${textSecondary} text-center`}>
                    +{selectedItems.anytimeTasks.length - 5}개 더
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* 아무것도 없을 때 */}
          {selectedItems.events.length === 0 && selectedItems.tasks.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className={textSecondary}>이 날은 일정이 없어요</p>
              <button 
                onClick={() => { 
                  setEditingEvent(null); 
                  setShowEventModal(true); 
                }}
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
      <EventModal 
        isOpen={showEventModal}
        onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
        event={editingEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        googleCalendar={googleCalendar}
      />
    </div>
  );
};

// === Search Modal ===

export default CalendarPage;
