import React, { useState, useMemo } from 'react';
import HomeHeader from './HomeHeader';
import AlfredoBriefingV2 from './AlfredoBriefingV2';
import { QuickActionFloating, ChatFloating } from './QuickActionFloating';
import { useGamification } from '../gamification/LevelSystem';

// 🏠 새로운 홈페이지 메인 컴포넌트
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
  
  // 브리핑 액션 처리
  var handleBriefingAction = function(action, data) {
    switch (action) {
      case 'showEssentials':
        break;
      case 'eventReady':
        if (onOpenEvent && data) onOpenEvent(data);
        break;
      case 'openCalendar':
        if (setView) setView('CALENDAR');
        break;
      case 'draftEmail':
        if (onOpenChat) onOpenChat({ type: 'email', email: data });
        break;
      case 'openEmail':
        if (onOpenInbox) onOpenInbox();
        break;
      case 'startTask':
        if (data && onStartFocus) onStartFocus(data);
        else if (data && onOpenTask) onOpenTask(data);
        break;
      case 'later':
        break;
      case 'tomorrowNote':
        break;
      case 'endDay':
        break;
      case 'prepareTomorrow':
        if (setView) setView('WORK');
        break;
      case 'rest':
        break;
      default:
        break;
    }
  };
  
  // 샘플 이메일
  var sampleEmails = useMemo(function() {
    return [];
  }, []);
  
  // 샘플 리마인더
  var sampleReminders = useMemo(function() {
    return [];
  }, []);
  
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
      // 알프레도 브리핑
      React.createElement(AlfredoBriefingV2, {
        darkMode: darkMode,
        condition: condition,
        tasks: tasks,
        events: events,
        emails: sampleEmails,
        reminders: sampleReminders,
        weather: weather,
        streak: gamification.currentStreak || 0,
        mode: alfredoMode,
        setMode: setAlfredoMode,
        onAction: handleBriefingAction
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
