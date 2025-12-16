import React, { useState, useMemo } from 'react';
import HomeHeader from './HomeHeader';
import { 
  AlfredoGreeting, 
  TodaySummary, 
  UpcomingEventCard, 
  FocusNow, 
  MiniTimeline 
} from './HomeDashboard';
import { QuickActionFloating, ChatFloating } from './QuickActionFloating';
import { useGamification } from '../gamification/LevelSystem';

// 🏠 홈페이지 메인 컴포넌트 - 대시보드 스타일
export var HomePage = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var routines = props.routines || [];
  var weather = props.weather;
  var mood = props.mood;
  var energy = props.energy;
  var setMood = props.setMood;
  var setEnergy = props.setEnergy;
  var setView = props.setView;
  var onOpenAddTask = props.onOpenAddTask;
  var onOpenTask = props.onOpenTask;
  var onOpenEvent = props.onOpenEvent;
  var onOpenChat = props.onOpenChat;
  var onOpenInbox = props.onOpenInbox;
  var onStartFocus = props.onStartFocus;
  var onAddTask = props.onAddTask;
  var onAddEvent = props.onAddEvent;
  var onAddRoutine = props.onAddRoutine;
  var onCompleteRoutine = props.onCompleteRoutine;
  
  // 상태
  var modeState = useState('focus');
  var alfredoMode = modeState[0];
  var setAlfredoMode = modeState[1];
  
  var conditionState = useState(mood || 3);
  var condition = conditionState[0];
  var setCondition = conditionState[1];
  
  var otherOptionsState = useState(false);
  var showOtherOptions = otherOptionsState[0];
  var setShowOtherOptions = otherOptionsState[1];
  
  // 게이미피케이션 훅
  var gamification = useGamification ? useGamification() : { totalXp: 0, level: 1, currentStreak: 0 };
  
  // 스타일
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F8F6FF]';
  
  // 컨디션 변경 시 부모에게도 전달
  var handleConditionChange = function(newCondition) {
    setCondition(newCondition);
    if (setMood) setMood(newCondition);
  };
  
  // 페이지 이동
  var handleNavigate = function(page) {
    if (setView) setView(page);
  };
  
  // 퀵액션 처리
  var handleQuickAction = function(actionId) {
    switch (actionId) {
      case 'addTask':
        if (onOpenAddTask) onOpenAddTask();
        break;
      case 'addEvent':
        if (setView) setView('CALENDAR');
        break;
      case 'water':
        if (onCompleteRoutine) onCompleteRoutine({ id: 'water', title: '물 마시기' });
        break;
      case 'vitamin':
        if (onCompleteRoutine) onCompleteRoutine({ id: 'vitamin', title: '영양제' });
        break;
      case 'rest':
        if (onStartFocus) onStartFocus({ type: 'rest', duration: 5 });
        break;
      default:
        break;
    }
  };
  
  // 오늘 일정만 필터
  var todayEvents = useMemo(function() {
    var now = new Date();
    var today = now.toDateString();
    
    return events.filter(function(e) {
      var eventDate = new Date(e.start);
      return eventDate.toDateString() === today;
    }).sort(function(a, b) {
      return new Date(a.start) - new Date(b.start);
    });
  }, [events]);
  
  // 다가오는 일정 (30분 이내 또는 다음 2개)
  var upcomingEvents = useMemo(function() {
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    
    return todayEvents.filter(function(e) {
      var eventDate = new Date(e.start);
      var eventMin = eventDate.getHours() * 60 + eventDate.getMinutes();
      return eventMin > nowMin - 30; // 지나간 것 제외 (30분 여유)
    }).slice(0, 3);
  }, [todayEvents]);
  
  // 지금 집중할 할일 선택 (우선순위 높은 것 또는 마감 임박)
  var focusTask = useMemo(function() {
    var now = new Date();
    var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
    
    if (incompleteTasks.length === 0) return null;
    
    // 1. 마감 임박 (2시간 이내)
    var urgentTask = incompleteTasks.find(function(t) {
      if (!t.deadline && !t.dueDate) return false;
      var deadline = new Date(t.deadline || t.dueDate);
      var diffHours = (deadline - now) / 1000 / 60 / 60;
      return diffHours > 0 && diffHours <= 2;
    });
    if (urgentTask) return { ...urgentTask, recommended: true };
    
    // 2. 우선순위 높은 것
    var highPriority = incompleteTasks.find(function(t) {
      return t.priority === 'high' || t.importance >= 4;
    });
    if (highPriority) return { ...highPriority, recommended: true };
    
    // 3. 시간 지정된 것 중 가장 빠른 것
    var scheduled = incompleteTasks.filter(function(t) { return t.scheduledTime; })
      .sort(function(a, b) { return a.scheduledTime.localeCompare(b.scheduledTime); });
    if (scheduled.length > 0) return scheduled[0];
    
    // 4. 그냥 첫 번째
    return incompleteTasks[0];
  }, [tasks]);
  
  // 다른 옵션들 (focusTask 제외한 상위 3개)
  var otherTasks = useMemo(function() {
    if (!focusTask) return [];
    return tasks.filter(function(t) { 
      return !t.completed && t.id !== focusTask.id; 
    }).slice(0, 3);
  }, [tasks, focusTask]);
  
  // 태스크 시작
  var handleStartTask = function(task) {
    if (onStartFocus) {
      onStartFocus(task);
    } else if (onOpenTask) {
      onOpenTask(task);
    }
  };
  
  return React.createElement('div', { className: bgColor + ' min-h-screen pb-24' },
    // 고정 헤더
    React.createElement(HomeHeader, {
      darkMode: darkMode,
      condition: condition,
      setCondition: handleConditionChange,
      weather: weather,
      tasks: tasks,
      events: events,
      routines: routines,
      streak: gamification.currentStreak || 0,
      onNavigate: handleNavigate
    }),
    
    // 스크롤 영역
    React.createElement('div', { className: 'px-4 pt-4' },
      // 🐧 알프레도 인사
      React.createElement(AlfredoGreeting, {
        darkMode: darkMode,
        condition: condition,
        mode: alfredoMode,
        setMode: setAlfredoMode
      }),
      
      // 📊 오늘 요약
      React.createElement(TodaySummary, {
        darkMode: darkMode,
        tasks: tasks,
        events: events
      }),
      
      // 📅 다가오는 일정들
      upcomingEvents.length > 0 && upcomingEvents.map(function(event, idx) {
        var now = new Date();
        var eventTime = new Date(event.start);
        var diffMin = Math.round((eventTime - now) / 1000 / 60);
        var isUrgent = diffMin <= 60 && diffMin > -30;
        
        return React.createElement(UpcomingEventCard, {
          key: event.id || idx,
          event: event,
          darkMode: darkMode,
          isUrgent: isUrgent,
          onClick: function() { if (onOpenEvent) onOpenEvent(event); }
        });
      }),
      
      // ⚡ 지금 이거부터
      React.createElement(FocusNow, {
        task: focusTask,
        darkMode: darkMode,
        onStart: handleStartTask,
        onMore: function() { setShowOtherOptions(!showOtherOptions); }
      }),
      
      // 다른 옵션들 (펼쳤을 때)
      showOtherOptions && otherTasks.length > 0 && React.createElement('div', {
        className: 'mb-4 space-y-2'
      },
        otherTasks.map(function(task) {
          return React.createElement('button', {
            key: task.id,
            onClick: function() { handleStartTask(task); },
            className: (darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200') + 
              ' w-full p-3 rounded-xl border text-left flex items-center justify-between'
          },
            React.createElement('div', null,
              React.createElement('p', { className: darkMode ? 'text-white' : 'text-gray-800' }, task.title),
              React.createElement('p', { className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm' },
                task.project || task.domain || ''
              )
            ),
            React.createElement('span', { className: 'text-[#A996FF] text-sm' }, '선택')
          );
        })
      ),
      
      // 📋 오늘 한눈에 (타임라인)
      React.createElement(MiniTimeline, {
        events: todayEvents,
        tasks: tasks,
        darkMode: darkMode,
        onExpand: function() { handleNavigate('WORK'); },
        onStartTask: handleStartTask
      })
    ),
    
    // 플로팅 버튼들
    React.createElement(QuickActionFloating, {
      onAction: handleQuickAction,
      darkMode: darkMode
    }),
    
    React.createElement(ChatFloating, {
      onClick: onOpenChat,
      darkMode: darkMode
    })
  );
};

export default HomePage;
