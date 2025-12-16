import React, { useState, useMemo } from 'react';
import HomeHeader from './HomeHeader';
import AlfredoBriefingV2 from './AlfredoBriefingV2';
import FocusNowCard from './FocusNowCard';
import RemindersSection from './RemindersSection';
import MiniTimeline from './MiniTimeline';
import { QuickActionFloating, ChatFloating } from './QuickActionFloating';
import { useGamification } from '../gamification/LevelSystem';

// 🏠 홈페이지 메인 컴포넌트 - Apple 2025 스타일
export var HomePage = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var routines = props.routines || [];
  var weather = props.weather;
  var mood = props.mood;
  var setMood = props.setMood;
  var setView = props.setView;
  var onOpenAddTask = props.onOpenAddTask;
  var onOpenTask = props.onOpenTask;
  var onOpenEvent = props.onOpenEvent;
  var onOpenChat = props.onOpenChat;
  var onOpenInbox = props.onOpenInbox;
  var onStartFocus = props.onStartFocus;
  var onCompleteRoutine = props.onCompleteRoutine;
  var userName = props.userName || '클로이';
  
  // 상태
  var modeState = useState('focus');
  var alfredoMode = modeState[0];
  var setAlfredoMode = modeState[1];
  
  var conditionState = useState(mood || 3);
  var condition = conditionState[0];
  var setCondition = conditionState[1];
  
  var showOptionsState = useState(false);
  var showOtherOptions = showOptionsState[0];
  var setShowOtherOptions = showOptionsState[1];
  
  // 게이미피케이션
  var gamification = useGamification ? useGamification() : { totalXp: 0, level: 1, currentStreak: 0 };
  
  // Apple 스타일 배경색
  var bgColor = darkMode ? 'bg-[#1D1D1F]' : 'bg-[#F5F5F7]';
  
  // 컨디션 변경
  var handleConditionChange = function(newCondition) {
    setCondition(newCondition);
    if (setMood) setMood(newCondition);
  };
  
  // 페이지 이동
  var handleNavigate = function(page) {
    if (setView) setView(page);
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
  
  // 지금 집중할 할일 선택
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
  
  // 리마인더 목록 (샘플 데이터 - 나중에 props로 받기)
  var reminders = useMemo(function() {
    var items = [];
    
    // 마감 임박 할일을 리마인더로
    tasks.forEach(function(t) {
      if (t.completed) return;
      if (t.dueDate || t.deadline) {
        var due = new Date(t.dueDate || t.deadline);
        var now = new Date();
        var diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 3) {
          items.push({
            id: 'task-' + t.id,
            type: t.title.includes('메일') ? 'email' : 'default',
            title: t.title,
            dueDate: t.dueDate || t.deadline
          });
        }
      }
    });
    
    // 샘플 리마인더 (데모용)
    if (items.length < 3) {
      items.push({
        id: 'sample-1',
        type: 'payment',
        title: '카드대금',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
      });
      items.push({
        id: 'sample-2',
        type: 'email',
        title: 'Sarah 메일 답장',
        lastCompleted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      });
      items.push({
        id: 'sample-3',
        type: 'call',
        title: '엄마에게 연락',
        lastCompleted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return items.slice(0, 5);
  }, [tasks]);
  
  // 태스크 시작
  var handleStartTask = function(task) {
    if (onStartFocus) {
      onStartFocus(task);
    } else if (onOpenTask) {
      onOpenTask(task);
    }
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
  
  return React.createElement('div', { className: bgColor + ' min-h-screen pb-24' },
    // 고정 헤더 (Apple 글라스모피즘)
    React.createElement(HomeHeader, {
      darkMode: darkMode,
      condition: condition,
      setCondition: handleConditionChange,
      weather: weather,
      level: gamification.level || 1,
      userName: userName,
      tasks: tasks,
      events: events,
      onSelectTask: onOpenTask,
      onSelectEvent: onOpenEvent,
      onOpenSettings: function() { handleNavigate('SETTINGS'); }
    }),
    
    // 스크롤 영역
    React.createElement('div', { className: 'px-4 pt-5' },
      // 🐧 알프레도 브리핑 (그라데이션 배경)
      React.createElement(AlfredoBriefingV2, {
        darkMode: darkMode,
        condition: condition,
        tasks: tasks,
        events: events,
        weather: weather,
        mode: alfredoMode,
        setMode: setAlfredoMode,
        userName: userName,
        reminders: reminders,
        onAction: function(action, data) {
          switch (action) {
            case 'startTask':
              if (data) handleStartTask(data);
              break;
            case 'openCalendar':
              handleNavigate('CALENDAR');
              break;
            case 'openReminder':
              // TODO: 리마인더 상세
              break;
            default:
              break;
          }
        }
      }),
      
      // 🎯 지금 이거부터
      focusTask && React.createElement(FocusNowCard, {
        task: focusTask,
        darkMode: darkMode,
        userName: userName,
        onStart: handleStartTask,
        onLater: function() { /* TODO: 나중에 처리 */ },
        onShowOptions: function() { setShowOtherOptions(!showOtherOptions); }
      }),
      
      // ⚠️ 잊지 마세요
      React.createElement(RemindersSection, {
        reminders: reminders,
        darkMode: darkMode,
        onReminderClick: function(reminder) {
          // TODO: 리마인더 처리
          console.log('Reminder clicked:', reminder);
        }
      }),
      
      // 📋 오늘 한눈에 (타임라인)
      React.createElement(MiniTimeline, {
        events: todayEvents,
        tasks: tasks,
        darkMode: darkMode,
        onStartTask: handleStartTask,
        onOpenEvent: onOpenEvent
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
