import React, { useState, useEffect } from 'react';
import { 
  Settings, Bell, Search, Zap, Calendar, CheckCircle2, Circle, 
  ChevronRight, ChevronDown, Clock, MapPin, Moon, ChevronUp
} from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';
import { LEVEL_CONFIG } from '../../constants/gamification';

// Data
import { mockWeather } from '../../data/mockData';

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

  // 다크모드 색상
  var bgGradient = darkMode 
    ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
    : 'bg-[#F0EBFF]';
  var cardBg = darkMode ? 'bg-gray-800/90' : 'bg-white/90';
  var textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-[#A996FF]/20';

  return (
    <div className={bgGradient + ' flex-1 overflow-y-auto transition-colors duration-300'}>
      <div className="px-4 pb-32 pt-4">
        
        {/* ===== 헤더 (간소화) ===== */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={textSecondary + ' text-sm'}>{dateStr}</p>
            <h1 className={textPrimary + ' text-xl font-bold mt-0.5'}>{getGreeting()}</h1>
          </div>
          <div className="flex items-center gap-2">
            {gameState && (
              <button 
                onClick={onOpenStats}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <span className="text-sm">⭐</span>
                <span className="text-xs font-bold">Lv.{LEVEL_CONFIG.getLevel(gameState.totalXP).level}</span>
              </button>
            )}
            <button 
              onClick={onOpenNotifications}
              className={(darkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-white/50') + ' w-9 h-9 rounded-full border shadow-sm flex items-center justify-center ' + textSecondary + ' relative'}
            >
              <Bell size={16} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            <button 
              onClick={onOpenSettings}
              className={(darkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-white/50') + ' w-9 h-9 rounded-full border shadow-sm flex items-center justify-center ' + textSecondary}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* ===== 섹션 1: 컨디션 퀵체크 ===== */}
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

        {/* ===== 섹션 2: 지금 할 일 (NowCard) ===== */}
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
            
            {/* 다음 일정 카운트다운 */}
            {nextEvent && nextEvent.totalMins <= 60 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 mb-4 border border-amber-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">{nextEvent.event.title}</span>
                  </div>
                  <span className="text-sm font-bold text-amber-600">{nextEvent.text}</span>
                </div>
              </div>
            )}
            
            {/* 추천 태스크 */}
            <div className="bg-gradient-to-r from-[#A996FF]/10 to-[#8B7CF7]/10 rounded-xl p-4 border border-[#A996FF]/20">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className={textPrimary + ' font-bold text-base'}>{topTask.title}</p>
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
                  onClick={function() { if (onStartFocus) onStartFocus(topTask); }}
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
                          className={(darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white/60 hover:bg-white') + ' flex items-center justify-between p-3 rounded-xl transition-all'}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={textPrimary + ' font-medium text-sm truncate'}>{task.title}</p>
                            <p className={textSecondary + ' text-[11px]'}>{task.project}</p>
                          </div>
                          <button 
                            onClick={function() {
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

        {/* ===== 섹션 3: 오늘 일정 (타임라인) ===== */}
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

    </div>
  );
};

export default HomePage;
