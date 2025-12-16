import React, { useState, useEffect } from 'react';
import { Plus, Clock, Target, Calendar, MessageCircle, Zap, Coffee, Droplets, Moon, Sun, ChevronUp, X, Check, Sparkles } from 'lucide-react';

// 퀵 액션 정의
export var QUICK_ACTIONS = {
  // 할일 관련
  addTask: { id: 'addTask', icon: '✏️', label: '할일 추가', color: 'bg-emerald-500', category: 'task' },
  addBig3: { id: 'addBig3', icon: '⭐', label: 'Big3 추가', color: 'bg-amber-500', category: 'task' },
  
  // 집중 관련
  startFocus: { id: 'startFocus', icon: '🎯', label: '집중 시작', color: 'bg-purple-500', category: 'focus' },
  quickFocus: { id: 'quickFocus', icon: '⚡', label: '5분 집중', color: 'bg-blue-500', category: 'focus' },
  
  // 일정 관련
  addEvent: { id: 'addEvent', icon: '📅', label: '일정 추가', color: 'bg-blue-500', category: 'calendar' },
  checkCalendar: { id: 'checkCalendar', icon: '🗓️', label: '일정 확인', color: 'bg-indigo-500', category: 'calendar' },
  
  // 알프레도 관련
  talkToAlfredo: { id: 'talkToAlfredo', icon: '🐧', label: '알프레도 채팅', color: 'bg-[#A996FF]', category: 'alfredo' },
  askAdvice: { id: 'askAdvice', icon: '💡', label: '조언 요청', color: 'bg-yellow-500', category: 'alfredo' },
  
  // 셀프케어 관련
  logMood: { id: 'logMood', icon: '😊', label: '기분 기록', color: 'bg-pink-500', category: 'care' },
  drinkWater: { id: 'drinkWater', icon: '💧', label: '물 마시기', color: 'bg-cyan-500', category: 'care' },
  takeBreak: { id: 'takeBreak', icon: '☕', label: '휴식하기', color: 'bg-orange-500', category: 'care' },
  stretch: { id: 'stretch', icon: '🧘', label: '스트레칭', color: 'bg-teal-500', category: 'care' },
  
  // 리뷰 관련
  dailyReview: { id: 'dailyReview', icon: '📝', label: '하루 리뷰', color: 'bg-violet-500', category: 'review' },
  tomorrowPlan: { id: 'tomorrowPlan', icon: '🌅', label: '내일 계획', color: 'bg-rose-500', category: 'review' }
};

// 시간대별 추천 액션
var TIME_BASED_ACTIONS = {
  morning: ['addBig3', 'startFocus', 'checkCalendar', 'logMood'], // 5-12시
  afternoon: ['startFocus', 'drinkWater', 'takeBreak', 'addTask'], // 12-18시
  evening: ['dailyReview', 'tomorrowPlan', 'talkToAlfredo', 'logMood'], // 18-22시
  night: ['tomorrowPlan', 'logMood', 'takeBreak', 'talkToAlfredo'] // 22-5시
};

// 현재 시간대 가져오기
function getCurrentTimeSlot() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// 🎯 퀵 액션 버튼
export var QuickActionButton = function(props) {
  var action = props.action;
  var onClick = props.onClick;
  var darkMode = props.darkMode;
  var size = props.size || 'medium'; // small, medium, large
  var showLabel = props.showLabel !== false;
  
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  var sizeClasses = {
    small: { button: 'w-12 h-12', icon: 'text-lg', label: 'text-[10px]' },
    medium: { button: 'w-16 h-16', icon: 'text-2xl', label: 'text-xs' },
    large: { button: 'w-20 h-20', icon: 'text-3xl', label: 'text-sm' }
  };
  
  var s = sizeClasses[size];
  
  return React.createElement('button', {
    onClick: function() { if (onClick) onClick(action); },
    className: 'flex flex-col items-center gap-1 group'
  },
    React.createElement('div', {
      className: s.button + ' rounded-2xl flex items-center justify-center ' + action.color + ' text-white shadow-lg hover:scale-105 transition-transform'
    },
      React.createElement('span', { className: s.icon }, action.icon)
    ),
    showLabel && React.createElement('span', { 
      className: textSecondary + ' ' + s.label + ' group-hover:text-[#A996FF] transition-colors'
    }, action.label)
  );
};

// 📱 퀵 액션 그리드
export var QuickActionGrid = function(props) {
  var actions = props.actions || [];
  var onAction = props.onAction;
  var darkMode = props.darkMode;
  var columns = props.columns || 4;
  var size = props.size || 'medium';
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var gridCols = {
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5'
  };
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
      React.createElement(Zap, { size: 18, className: 'text-[#A996FF]' }),
      React.createElement('h3', { className: textPrimary + ' font-bold' }, '빠른 실행')
    ),
    React.createElement('div', { className: 'grid ' + gridCols[columns] + ' gap-3' },
      actions.map(function(actionId) {
        var action = QUICK_ACTIONS[actionId];
        if (!action) return null;
        return React.createElement(QuickActionButton, {
          key: actionId,
          action: action,
          onClick: onAction,
          darkMode: darkMode,
          size: size
        });
      })
    )
  );
};

// 🚀 플로팅 액션 버튼 (FAB)
export var FloatingActionButton = function(props) {
  var onAction = props.onAction;
  var darkMode = props.darkMode;
  var primaryAction = props.primaryAction || 'addTask';
  var secondaryActions = props.secondaryActions || ['startFocus', 'logMood', 'talkToAlfredo'];
  
  var expandedState = useState(false);
  var expanded = expandedState[0];
  var setExpanded = expandedState[1];
  
  var primary = QUICK_ACTIONS[primaryAction] || QUICK_ACTIONS.addTask;
  
  return React.createElement('div', { className: 'fixed bottom-24 right-4 z-40' },
    // 확장된 액션들
    expanded && React.createElement('div', { className: 'absolute bottom-16 right-0 flex flex-col-reverse gap-3 mb-3' },
      secondaryActions.map(function(actionId, idx) {
        var action = QUICK_ACTIONS[actionId];
        if (!action) return null;
        return React.createElement('button', {
          key: actionId,
          onClick: function() { 
            if (onAction) onAction(action); 
            setExpanded(false);
          },
          className: 'w-12 h-12 rounded-full flex items-center justify-center ' + action.color + ' text-white shadow-lg animate-scale-in',
          style: { animationDelay: (idx * 50) + 'ms' }
        },
          React.createElement('span', { className: 'text-xl' }, action.icon)
        );
      })
    ),
    
    // 메인 FAB
    React.createElement('button', {
      onClick: function() { 
        if (expanded) {
          setExpanded(false);
        } else {
          setExpanded(true);
        }
      },
      className: 'w-14 h-14 rounded-full flex items-center justify-center bg-[#A996FF] text-white shadow-xl hover:bg-[#8B7CF7] transition-all ' +
        (expanded ? 'rotate-45' : '')
    },
      React.createElement(Plus, { size: 24 })
    )
  );
};

// ⚡ 컨텍스트 기반 퀵 액션 (스마트 추천)
export var SmartQuickActions = function(props) {
  var onAction = props.onAction;
  var darkMode = props.darkMode;
  var userContext = props.userContext || {}; // { energy, mood, tasksLeft, focusMinutes }
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  // 스마트 액션 추천
  var recommendedActions = React.useMemo(function() {
    var timeSlot = getCurrentTimeSlot();
    var baseActions = TIME_BASED_ACTIONS[timeSlot].slice();
    
    // 컨텍스트 기반 조정
    if (userContext.energy && userContext.energy <= 2) {
      // 에너지 낮으면 케어 액션 추천
      baseActions = ['takeBreak', 'drinkWater', 'logMood', 'talkToAlfredo'];
    } else if (userContext.energy && userContext.energy >= 4) {
      // 에너지 높으면 생산성 액션 추천
      baseActions = ['startFocus', 'addBig3', 'addTask', 'checkCalendar'];
    }
    
    if (userContext.tasksLeft === 0) {
      // 할일 없으면 계획 액션 추천
      baseActions.unshift('addTask');
    }
    
    return baseActions.slice(0, 4);
  }, [userContext]);
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
      React.createElement(Sparkles, { size: 16, className: 'text-amber-400' }),
      React.createElement('span', { className: textSecondary + ' text-xs' }, '지금 추천하는 액션')
    ),
    React.createElement('div', { className: 'grid grid-cols-4 gap-2' },
      recommendedActions.map(function(actionId) {
        var action = QUICK_ACTIONS[actionId];
        if (!action) return null;
        return React.createElement(QuickActionButton, {
          key: actionId,
          action: action,
          onClick: onAction,
          darkMode: darkMode,
          size: 'small'
        });
      })
    )
  );
};

// 🎨 미니 퀵 액션 바 (홈 상단용)
export var QuickActionBar = function(props) {
  var onAction = props.onAction;
  var darkMode = props.darkMode;
  var actions = props.actions || ['addTask', 'startFocus', 'logMood', 'talkToAlfredo'];
  
  return React.createElement('div', { className: 'flex justify-center gap-4 py-2' },
    actions.map(function(actionId) {
      var action = QUICK_ACTIONS[actionId];
      if (!action) return null;
      return React.createElement('button', {
        key: actionId,
        onClick: function() { if (onAction) onAction(action); },
        className: 'w-11 h-11 rounded-xl flex items-center justify-center text-lg ' + action.color + ' text-white shadow-md hover:scale-110 transition-transform'
      }, action.icon);
    })
  );
};

// 📋 전체 퀵 액션 시트 (바텀 시트)
export var QuickActionSheet = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var onAction = props.onAction;
  var darkMode = props.darkMode;
  
  if (!isOpen) return null;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var categories = [
    { id: 'task', label: '할일', actions: ['addTask', 'addBig3'] },
    { id: 'focus', label: '집중', actions: ['startFocus', 'quickFocus'] },
    { id: 'calendar', label: '일정', actions: ['addEvent', 'checkCalendar'] },
    { id: 'care', label: '셀프케어', actions: ['logMood', 'drinkWater', 'takeBreak', 'stretch'] },
    { id: 'alfredo', label: '알프레도', actions: ['talkToAlfredo', 'askAdvice'] },
    { id: 'review', label: '리뷰', actions: ['dailyReview', 'tomorrowPlan'] }
  ];
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-end',
    onClick: onClose
  },
    React.createElement('div', { className: 'absolute inset-0 bg-black/50' }),
    React.createElement('div', {
      className: cardBg + ' relative w-full rounded-t-3xl p-4 pb-8 max-h-[80vh] overflow-y-auto animate-slide-up',
      onClick: function(e) { e.stopPropagation(); }
    },
      // 핸들
      React.createElement('div', { className: 'flex justify-center mb-4' },
        React.createElement('div', { className: 'w-10 h-1 rounded-full ' + (darkMode ? 'bg-gray-600' : 'bg-gray-300') })
      ),
      
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('h2', { className: textPrimary + ' text-lg font-bold' }, '⚡ 빠른 실행'),
        React.createElement('button', { onClick: onClose, className: textSecondary }, React.createElement(X, { size: 20 }))
      ),
      
      // 카테고리별 액션
      categories.map(function(cat) {
        return React.createElement('div', { key: cat.id, className: 'mb-4' },
          React.createElement('p', { className: textSecondary + ' text-xs mb-2 font-medium' }, cat.label),
          React.createElement('div', { className: 'flex flex-wrap gap-2' },
            cat.actions.map(function(actionId) {
              var action = QUICK_ACTIONS[actionId];
              if (!action) return null;
              return React.createElement('button', {
                key: actionId,
                onClick: function() { if (onAction) onAction(action); onClose(); },
                className: 'flex items-center gap-2 px-3 py-2 rounded-xl ' + action.color + ' text-white text-sm'
              },
                React.createElement('span', null, action.icon),
                action.label
              );
            })
          )
        );
      })
    )
  );
};

export default {
  QUICK_ACTIONS: QUICK_ACTIONS,
  QuickActionButton: QuickActionButton,
  QuickActionGrid: QuickActionGrid,
  FloatingActionButton: FloatingActionButton,
  SmartQuickActions: SmartQuickActions,
  QuickActionBar: QuickActionBar,
  QuickActionSheet: QuickActionSheet,
  getCurrentTimeSlot: getCurrentTimeSlot
};
