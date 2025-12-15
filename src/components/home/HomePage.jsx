import React, { useState, useEffect } from 'react';
import { 
  Settings, Bell, Search, Zap, Calendar, CheckCircle2, Circle, 
  ChevronRight, ChevronDown, Clock, MapPin, Moon, ChevronUp, TrendingUp, TrendingDown, Minus,
  AlertTriangle
} from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';
import { LEVEL_CONFIG } from '../../constants/gamification';

// Data
import { mockWeather, mockLifeReminders } from '../../data/mockData';

// Common Components
import { AlfredoAvatar } from '../common';

// Home Components
import UnifiedTimelineView from './UnifiedTimelineView';

// Modals
import EventModal from '../modals/EventModal';
import TaskModal from '../modals/TaskModal';

var HomePage = function(props) {
  var onOpenChat = props.onOpenChat;
  var onOpenSettings = props.onOpenSettings;
  var onOpenSearch = props.onOpenSearch;
  var onOpenStats = props.onOpenStats;
  var onOpenDndModal = props.onOpenDndModal;
  var onOpenNotifications = props.onOpenNotifications;
  var notificationCount = props.notificationCount || 0;
  var doNotDisturb = props.doNotDisturb;
  var mood = props.mood;
  var setMood = props.setMood;
  var energy = props.energy;
  var setEnergy = props.setEnergy;
  var tasks = props.tasks || [];
  var onToggleTask = props.onToggleTask;
  var onStartFocus = props.onStartFocus;
  var darkMode = props.darkMode;
  var gameState = props.gameState;
  var events = props.events || [];
  var connections = props.connections || {};
  var onUpdateTask = props.onUpdateTask;
  var onDeleteTask = props.onDeleteTask;
  var onSaveEvent = props.onSaveEvent;
  var onDeleteEvent = props.onDeleteEvent;
  var onUpdateTaskTime = props.onUpdateTaskTime;
  var onUpdateEventTime = props.onUpdateEventTime;

  // 모달 상태
  var selectedTaskState = useState(null);
  var selectedTask = selectedTaskState[0];
  var setSelectedTask = selectedTaskState[1];
  
  var selectedEventState = useState(null);
  var selectedEvent = selectedEventState[0];
  var setSelectedEvent = selectedEventState[1];
  
  var showEventModalState = useState(false);
  var showEventModal = showEventModalState[0];
  var setShowEventModal = showEventModalState[1];
  
  var showTaskOptionsState = useState(false);
  var showTaskOptions = showTaskOptionsState[0];
  var setShowTaskOptions = showTaskOptionsState[1];

  // 잊지 마세요 모달
  var selectedReminderState = useState(null);
  var selectedReminder = selectedReminderState[0];
  var setSelectedReminder = selectedReminderState[1];

  // 동적 날짜/시간
  var now = new Date();
  var hour = now.getHours();
  var weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  var dateStr = (now.getMonth() + 1) + '월 ' + now.getDate() + '일 ' + weekdays[now.getDay()] + '요일';
  
  var isEvening = hour >= 18;
  var isMorning = hour < 12;
  var isAfternoon = hour >= 12 && hour < 18;

  // 태스크 분류
  var todoTasks = tasks.filter(function(t) { return t.status !== 'done'; });
  var doneTasks = tasks.filter(function(t) { return t.status === 'done'; });

  // 오늘 미팅 수
  var todayMeetings = events.filter(function(e) { 
    return e.type === 'meeting' || e.title.includes('미팅') || e.title.includes('회의'); 
  });

  // 마감임박
  var urgentTasks = todoTasks.filter(function(t) { 
    return t.deadline && (t.deadline.includes('오늘') || t.deadline.includes('D-0') || t.deadline.includes('D-1')); 
  });

  // 잊지 마세요 데이터 (mockData + 동적 생성)
  var reminders = [];
  
  // 마감 임박 태스크
  urgentTasks.forEach(function(task) {
    reminders.push({
      id: 'task-' + task.id,
      type: 'task',
      icon: '📋',
      title: task.title,
      subtitle: task.deadline || '',
      dDay: task.deadline && task.deadline.includes('오늘') ? 0 : 1,
      critical: true,
      priorityChange: task.priorityChange || 0,
      data: task
    });
  });
  
  // mockLifeReminders에서 가져오기
  if (mockLifeReminders && mockLifeReminders.todayTop3) {
    mockLifeReminders.todayTop3.forEach(function(item) {
      reminders.push({
        id: item.id,
        type: 'life',
        icon: item.icon,
        title: item.title,
        subtitle: item.note || '',
        dDay: item.dDay,
        critical: item.critical || item.dDay <= 1,
        priorityChange: item.priorityChange || 0,
        data: item
      });
    });
  }
  
  // 연락 필요
  if (mockLifeReminders && mockLifeReminders.relationships) {
    mockLifeReminders.relationships.filter(function(r) { return r.lastContact >= 7; }).slice(0, 2).forEach(function(person) {
      reminders.push({
        id: 'rel-' + person.id,
        type: 'relationship',
        icon: '👥',
        title: person.name + '에게 연락',
        subtitle: person.lastContact + '일 전',
        dDay: null,
        critical: person.lastContact >= 14,
        priorityChange: 0,
        data: person
      });
    });
  }

  // 우선순위 변동 아이콘
  var getPriorityChangeIcon = function(change) {
    if (change > 0) return { icon: TrendingUp, color: 'text-red-500', label: '↑' };
    if (change < 0) return { icon: TrendingDown, color: 'text-blue-500', label: '↓' };
    return null;
  };

  // 컨디션 기반 태스크 추천
  var getConditionAdjustedTasks = function() {
    if (todoTasks.length === 0) return [];
    
    if (energy <= 40) {
      return todoTasks.slice().sort(function(a, b) {
        var importanceOrder = { low: 3, medium: 2, high: 1 };
        var aOrder = importanceOrder[a.importance] || 2;
        var bOrder = importanceOrder[b.importance] || 2;
        if (aOrder !== bOrder) return bOrder - aOrder;
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      });
    }
    
    if (energy >= 70) {
      return todoTasks.slice().sort(function(a, b) {
        var importanceOrder = { high: 3, medium: 2, low: 1 };
        var aOrder = importanceOrder[a.importance] || 2;
        var bOrder = importanceOrder[b.importance] || 2;
        if (aOrder !== bOrder) return bOrder - aOrder;
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      });
    }
    
    return todoTasks.slice().sort(function(a, b) { 
      return (b.priorityScore || 0) - (a.priorityScore || 0); 
    });
  };

  var adjustedTasks = getConditionAdjustedTasks();
  var topTask = adjustedTasks[0];

  // 다음 일정까지 카운트다운
  var getNextEventCountdown = function() {
    var now = new Date();
    var currentHour = now.getHours();
    var currentMin = now.getMinutes();
    
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      if (event.time) {
        var parts = event.time.split(':');
        var h = parseInt(parts[0], 10);
        var m = parseInt(parts[1], 10);
        if (h > currentHour || (h === currentHour && m > currentMin)) {
          var diffMin = (h * 60 + m) - (currentHour * 60 + currentMin);
          var hours = Math.floor(diffMin / 60);
          var mins = diffMin % 60;
          return {
            event: event,
            hours: hours,
            mins: mins,
            totalMins: diffMin,
            text: hours > 0 ? hours + '시간 ' + mins + '분 후' : mins + '분 후'
          };
        }
      }
    }
    return null;
  };

  var nextEvent = getNextEventCountdown();

  // 컨디션 기반 조언
  var getConditionAdvice = function() {
    if (energy <= 40) {
      return { 
        text: '에너지 낮아서 가벼운 것부터 정리했어요 💜', 
        color: 'text-[#8B7CF7]',
        adjusted: true
      };
    } else if (energy >= 70) {
      return { 
        text: '컨디션 좋을 때 어려운 거 먼저! ✨', 
        color: 'text-emerald-600',
        adjusted: true
      };
    }
    return null;
  };

  var conditionAdvice = getConditionAdvice();

  // 알프레도 인사
  var getGreeting = function() {
    if (isEvening) {
      return doneTasks.length >= 3 
        ? '수고했어요, Boss! 🌙' 
        : '하루 마무리예요 🌙';
    } else if (isMorning) {
      return '좋은 아침이에요, Boss! ☀️';
    } else {
      return '오후도 파이팅! 💪';
    }
  };

  // 날씨 아이콘
  var getWeatherIcon = function() {
    var condition = mockWeather && mockWeather.condition;
    if (condition === 'rain' || condition === 'rainy') return '🌧️';
    if (condition === 'cloudy') return '☁️';
    if (condition === 'snow') return '❄️';
    return '☀️';
  };

  // 날씨 조언
  var getWeatherAdvice = function() {
    var temp = mockWeather && mockWeather.temp;
    var dust = mockWeather && mockWeather.dust;
    var advice = [];
    
    if (temp !== undefined) {
      if (temp <= 0) advice.push('패딩 입으세요 🧥');
      else if (temp <= 10) advice.push('따뜻하게 입으세요');
    }
    
    if (dust === 'bad' || dust === 'veryBad') {
      advice.push('마스크 필수 😷');
    }
    
    return advice.join(' · ');
  };

  // 다크모드 색상
  var bgGradient = darkMode 
    ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
    : 'bg-[#F0EBFF]';
  var cardBg = darkMode ? 'bg-gray-800/90' : 'bg-white/90';
  var textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-[#A996FF]/20';

  // 리마인더 클릭 핸들러
  var handleReminderClick = function(reminder) {
    if (reminder.type === 'task' && reminder.data) {
      setSelectedTask(reminder.data);
    } else {
      setSelectedReminder(reminder);
    }
  };

  return (
    <div className={bgGradient + ' flex-1 overflow-y-auto transition-colors duration-300'}>
      <div className="px-4 pb-32 pt-4">
        
        {/* ===== 알프레도 브리핑 카드 ===== */}
        <div className={cardBg + ' backdrop-blur-xl rounded-2xl shadow-lg p-5 mb-4 border ' + borderColor}>
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlfredoAvatar size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <span className={textPrimary + ' font-bold text-lg'}>알프레도</span>
                  <span className="px-2 py-0.5 bg-[#A996FF]/20 text-[#A996FF] text-[10px] font-bold rounded-full">라이브</span>
                </div>
                <p className={textPrimary + ' text-sm mt-0.5'}>{getGreeting()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {gameState && (
                <button 
                  onClick={onOpenStats}
                  className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all"
                >
                  ⭐ Lv.{LEVEL_CONFIG.getLevel(gameState.totalXP).level}
                </button>
              )}
              <button 
                onClick={onOpenSettings}
                className={(darkMode ? 'bg-gray-700/70' : 'bg-gray-100') + ' w-8 h-8 rounded-full flex items-center justify-center ' + textSecondary}
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
          
          {/* 통계 요약 */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <p className={textPrimary + ' text-2xl font-bold'}>{todayMeetings.length}</p>
              <p className={textSecondary + ' text-xs'}>미팅</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">{urgentTasks.length}</p>
              <p className={textSecondary + ' text-xs'}>마감</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#A996FF]">{todoTasks.length}</p>
              <p className={textSecondary + ' text-xs'}>할 일</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">{doneTasks.length}</p>
              <p className={textSecondary + ' text-xs'}>완료</p>
            </div>
          </div>
          
          {/* 날씨 */}
          <div className={(darkMode ? 'bg-gray-700/50' : 'bg-gray-50') + ' rounded-xl px-4 py-3 mb-4'}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{getWeatherIcon()}</span>
              <span className={textPrimary + ' font-medium'}>
                {(mockWeather && mockWeather.temp) || 0}°C
              </span>
              {getWeatherAdvice() && (
                <>
                  <span className={textSecondary}>,</span>
                  <span className={textSecondary + ' text-sm'}>{getWeatherAdvice()}</span>
                </>
              )}
            </div>
          </div>
          
          {/* 오늘 요약 문장 */}
          <p className={textPrimary + ' text-base font-medium mb-3'}>
            오늘 할 일 <span className="text-[#A996FF] font-bold">{todoTasks.length}개</span>, 
            미팅 <span className="text-[#A996FF] font-bold">{todayMeetings.length}개</span> 있어요.
          </p>
          
          {/* 다음 일정 알림 */}
          {nextEvent && (
            <div 
              onClick={function() { 
                setSelectedEvent(nextEvent.event); 
                setShowEventModal(true); 
              }}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-3 border border-emerald-100 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🦁</span>
                <div className="flex-1">
                  <p className="text-emerald-700 font-bold">
                    오늘 {nextEvent.event.time} {nextEvent.event.title.includes('PT') ? 'PT' : nextEvent.event.title} 있어요
                  </p>
                  <p className="text-emerald-600 text-sm">
                    {nextEvent.event.time && parseInt(nextEvent.event.time.split(':')[0]) - 1 + ':00'}까지 업무 마무리하면 좋겠어요
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* 중요 미팅 알림 */}
          {todayMeetings.length > 0 && todayMeetings[0] && (
            <div 
              onClick={function() { 
                setSelectedEvent(todayMeetings[0]); 
                setShowEventModal(true); 
              }}
              className="bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE] rounded-xl p-4 border border-[#DDD6FE] cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🙌</span>
                <div className="flex-1">
                  <p className="text-[#7C3AED] font-bold">
                    {todayMeetings[0].time} {todayMeetings[0].title} 앞두고 있어요
                  </p>
                  <p className="text-[#A78BFA] text-sm">미팅 전 5분 명상 추천</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== 잊지 마세요 섹션 ===== */}
        {reminders.length > 0 && (
          <div className={cardBg + ' backdrop-blur-xl rounded-2xl shadow-sm p-4 mb-4 border ' + borderColor}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-500" />
              <span className={textPrimary + ' font-bold'}>잊지 마세요</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                {reminders.filter(function(r) { return r.critical; }).length}
              </span>
            </div>
            
            <div className="space-y-2">
              {reminders.slice(0, 5).map(function(reminder) {
                var priorityChange = getPriorityChangeIcon(reminder.priorityChange);
                var isCritical = reminder.critical;
                
                return (
                  <div 
                    key={reminder.id}
                    onClick={function() { handleReminderClick(reminder); }}
                    className={
                      (isCritical 
                        ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                        : (darkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-100 hover:bg-gray-100')
                      ) + ' flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all'
                    }
                  >
                    <span className="text-xl">{reminder.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={(isCritical ? 'text-red-700' : textPrimary) + ' font-semibold truncate'}>
                          {reminder.title}
                        </p>
                        {priorityChange && (
                          <span className={priorityChange.color + ' text-xs font-bold'}>
                            {priorityChange.label}
                          </span>
                        )}
                      </div>
                      {reminder.subtitle && (
                        <p className={(isCritical ? 'text-red-500' : textSecondary) + ' text-xs truncate'}>
                          {reminder.subtitle}
                        </p>
                      )}
                    </div>
                    {reminder.dDay !== null && (
                      <span className={
                        (reminder.dDay === 0 ? 'bg-red-500 text-white' : 
                         reminder.dDay === 1 ? 'bg-[#A996FF] text-white' :
                         reminder.dDay <= 3 ? 'bg-amber-100 text-amber-700' :
                         'bg-gray-100 text-gray-600') + 
                        ' px-2.5 py-1 rounded-full text-xs font-bold'
                      }>
                        {reminder.dDay === 0 ? 'D-1' : reminder.dDay + '일째'}
                      </span>
                    )}
                    {reminder.dDay === null && reminder.subtitle && (
                      <span className={(darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600') + ' px-2.5 py-1 rounded-full text-xs font-medium'}>
                        {reminder.subtitle}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== 컨디션 퀵체크 ===== */}
        <div className={cardBg + ' backdrop-blur-xl rounded-2xl shadow-sm p-4 mb-4 border ' + borderColor}>
          <div className="flex items-center justify-between mb-3">
            <span className={textPrimary + ' text-sm font-semibold'}>지금 컨디션</span>
            <span className={textSecondary + ' text-xs'}>{energy}%</span>
          </div>
          <div className="flex gap-2">
            {[
              { value: 30, emoji: '😫', label: '힘듦' },
              { value: 50, emoji: '😐', label: '보통' },
              { value: 70, emoji: '😊', label: '괜찮음' },
              { value: 90, emoji: '🔥', label: '최고' },
            ].map(function(opt) {
              return (
                <button
                  key={opt.value}
                  onClick={function() { setEnergy(opt.value); }}
                  className={
                    (Math.abs(energy - opt.value) < 15
                      ? 'bg-[#A996FF] text-white shadow-md scale-105'
                      : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')) +
                    ' flex-1 py-2.5 rounded-xl text-center transition-all'
                  }
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <p className="text-[11px] mt-0.5 font-medium">{opt.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== 지금 할 일 (NowCard) ===== */}
        {topTask && !isEvening && (
          <div className={cardBg + ' backdrop-blur-xl rounded-2xl shadow-lg p-5 mb-4 border ' + borderColor}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg shadow-md">
                🐧
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={textPrimary + ' font-bold text-sm'}>지금 이거부터</span>
                  {conditionAdvice && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#A996FF]/20 text-[#A996FF] rounded-full font-medium">
                      컨디션 맞춤
                    </span>
                  )}
                </div>
                {conditionAdvice && (
                  <p className={'text-xs mt-0.5 ' + conditionAdvice.color}>{conditionAdvice.text}</p>
                )}
              </div>
            </div>
            
            {/* 추천 태스크 */}
            <div 
              onClick={function() { setSelectedTask(topTask); }}
              className="bg-gradient-to-r from-[#A996FF]/10 to-[#8B7CF7]/10 rounded-xl p-4 border border-[#A996FF]/20 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={textPrimary + ' font-bold text-base'}>{topTask.title}</p>
                    {topTask.priorityChange > 0 && (
                      <TrendingUp size={14} className="text-red-500" />
                    )}
                    {topTask.priorityChange < 0 && (
                      <TrendingDown size={14} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={textSecondary + ' text-xs'}>
                      {topTask.project}
                      {topTask.deadline && (' · ' + topTask.deadline)}
                    </p>
                    {topTask.importance === 'high' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">중요</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={function(e) { 
                    e.stopPropagation();
                    if (onStartFocus) onStartFocus(topTask); 
                  }}
                  className="px-5 py-3 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Zap size={16} />
                  시작
                </button>
              </div>
            </div>
            
            {/* 다른 옵션 */}
            {adjustedTasks.length > 1 && (
              <div className="mt-3">
                <button 
                  onClick={function() { setShowTaskOptions(!showTaskOptions); }}
                  className={'w-full py-2 text-xs font-medium flex items-center justify-center gap-1 ' + (darkMode ? 'text-gray-400' : 'text-gray-500')}
                >
                  {showTaskOptions ? '접기' : '다른 것 할래요'}
                  {showTaskOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                
                {showTaskOptions && (
                  <div className="space-y-2 mt-2">
                    {adjustedTasks.slice(1, 4).map(function(task) {
                      return (
                        <div 
                          key={task.id}
                          onClick={function() { setSelectedTask(task); }}
                          className={(darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white/60 hover:bg-white') + ' flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer'}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={textPrimary + ' font-medium text-sm truncate'}>{task.title}</p>
                              {task.priorityChange > 0 && <TrendingUp size={12} className="text-red-500" />}
                              {task.priorityChange < 0 && <TrendingDown size={12} className="text-blue-500" />}
                            </div>
                            <p className={textSecondary + ' text-[11px]'}>{task.project}</p>
                          </div>
                          <button 
                            onClick={function(e) {
                              e.stopPropagation();
                              if (onStartFocus) onStartFocus(task);
                              setShowTaskOptions(false);
                            }}
                            className={(darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-600') + ' px-3 py-1.5 hover:bg-[#A996FF] hover:text-white rounded-lg text-xs font-semibold transition-all'}
                          >
                            시작
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 저녁: 오늘 하루 요약 */}
        {isEvening && (
          <div className={cardBg + ' backdrop-blur-xl rounded-2xl shadow-lg p-5 mb-4 border ' + borderColor}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg shadow-md">
                🐧
              </div>
              <div>
                <p className={textPrimary + ' font-bold'}>오늘 하루 수고했어요!</p>
                <p className={textSecondary + ' text-xs'}>
                  {doneTasks.length > 0 
                    ? doneTasks.length + '개 완료했어요 🎉' 
                    : '내일 다시 시작하면 돼요 💜'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className={(darkMode ? 'bg-gray-700/50' : 'bg-emerald-50') + ' rounded-xl p-3 text-center'}>
                <p className="text-2xl font-bold text-emerald-500">{doneTasks.length}</p>
                <p className={textSecondary + ' text-[11px]'}>완료</p>
              </div>
              <div className={(darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]') + ' rounded-xl p-3 text-center'}>
                <p className="text-2xl font-bold text-[#A996FF]">{todoTasks.length}</p>
                <p className={textSecondary + ' text-[11px]'}>남음</p>
              </div>
              <div className={(darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]') + ' rounded-xl p-3 text-center'}>
                <p className="text-2xl font-bold text-[#A996FF]">{events.length}</p>
                <p className={textSecondary + ' text-[11px]'}>일정</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== 오늘 일정 (타임라인) ===== */}
        <UnifiedTimelineView
          events={events}
          tasks={tasks}
          onEventClick={function(event) {
            setSelectedEvent(event);
            setShowEventModal(true);
          }}
          onTaskClick={function(task) {
            setSelectedTask(task);
          }}
          onStartFocus={onStartFocus}
          onUpdateTaskTime={onUpdateTaskTime}
          onUpdateEventTime={onUpdateEventTime}
          darkMode={darkMode}
        />

      </div>

      {/* 태스크 상세 모달 */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={function() { setSelectedTask(null); }}
          onStartFocus={function(task) {
            setSelectedTask(null);
            if (onStartFocus) onStartFocus(task);
          }}
          onToggle={function(taskId) {
            if (onToggleTask) onToggleTask(taskId);
            setSelectedTask(null);
          }}
          onUpdate={function(taskId, updates) {
            if (onUpdateTask) onUpdateTask(taskId, updates);
          }}
          onDelete={function(taskId) {
            if (onDeleteTask) onDeleteTask(taskId);
            setSelectedTask(null);
          }}
        />
      )}

      {/* 이벤트 편집 모달 */}
      <EventModal
        isOpen={showEventModal}
        onClose={function() {
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSave={function(eventData) {
          if (onSaveEvent) onSaveEvent(eventData);
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        onDelete={function(eventId) {
          if (onDeleteEvent) onDeleteEvent(eventId);
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        googleCalendar={connections.googleCalendar ? { isSignedIn: true } : null}
      />

      {/* 리마인더 상세 모달 */}
      {selectedReminder && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
          onClick={function() { setSelectedReminder(null); }}
        >
          <div 
            className="bg-white rounded-t-3xl w-full max-w-lg p-6 animate-slide-up"
            onClick={function(e) { e.stopPropagation(); }}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{selectedReminder.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedReminder.title}</h3>
                {selectedReminder.subtitle && (
                  <p className="text-gray-500">{selectedReminder.subtitle}</p>
                )}
              </div>
            </div>
            {selectedReminder.type === 'relationship' && selectedReminder.data && (
              <div className="space-y-3 mb-6">
                <button className="w-full py-3 bg-[#A996FF] text-white rounded-xl font-bold hover:bg-[#8B7CF7] transition-all">
                  📱 전화하기
                </button>
                <button className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all">
                  💬 메시지 보내기
                </button>
              </div>
            )}
            {selectedReminder.type === 'life' && (
              <div className="space-y-3 mb-6">
                <button className="w-full py-3 bg-[#A996FF] text-white rounded-xl font-bold hover:bg-[#8B7CF7] transition-all">
                  ✅ 완료했어요
                </button>
                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
                  ⏰ 나중에 알림
                </button>
              </div>
            )}
            <button 
              onClick={function() { setSelectedReminder(null); }}
              className="w-full py-3 text-gray-500 font-medium"
            >
              닫기
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
