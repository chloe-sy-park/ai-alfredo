import React, { useState } from 'react';
import { Zap, Plus, Calendar, Droplets, Pill, Clock, X, MessageCircle } from 'lucide-react';

// 퀵액션 메뉴 아이템
var QUICK_ACTIONS = [
  { id: 'addTask', icon: Plus, label: '할일 추가', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { id: 'addEvent', icon: Calendar, label: '일정 추가', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'water', icon: Droplets, label: '물 마심', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  { id: 'vitamin', icon: Pill, label: '영양제', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { id: 'rest', icon: Clock, label: '휴식 5분', color: 'text-purple-500', bgColor: 'bg-purple-500/10' }
];

// 퀵액션 메뉴
var QuickActionMenu = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var onAction = props.onAction;
  var darkMode = props.darkMode;
  
  if (!isOpen) return null;
  
  var bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50',
    onClick: onClose
  },
    React.createElement('div', { className: 'absolute inset-0 bg-black/30' }),
    
    React.createElement('div', {
      className: 'absolute bottom-24 right-4',
      onClick: function(e) { e.stopPropagation(); }
    },
      React.createElement('div', { className: bgColor + ' rounded-2xl border ' + borderColor + ' shadow-xl overflow-hidden' },
        QUICK_ACTIONS.map(function(action, idx) {
          var Icon = action.icon;
          return React.createElement('button', {
            key: action.id,
            onClick: function() { onAction(action.id); onClose(); },
            className: 'w-full flex items-center gap-3 px-4 py-3 ' +
              (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50') +
              (idx !== QUICK_ACTIONS.length - 1 ? ' border-b ' + borderColor : '')
          },
            React.createElement('div', { className: action.bgColor + ' p-2 rounded-xl' },
              React.createElement(Icon, { size: 18, className: action.color })
            ),
            React.createElement('span', { className: textPrimary + ' text-sm font-medium' }, action.label)
          );
        })
      )
    )
  );
};

// 퀵액션 플로팅 버튼
export var QuickActionFloating = function(props) {
  var onAction = props.onAction;
  var darkMode = props.darkMode;
  
  var menuState = useState(false);
  var isMenuOpen = menuState[0];
  var setMenuOpen = menuState[1];
  
  return React.createElement(React.Fragment, null,
    React.createElement('button', {
      onClick: function() { setMenuOpen(!isMenuOpen); },
      className: 'fixed bottom-36 right-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ' +
        (isMenuOpen 
          ? (darkMode ? 'bg-gray-700' : 'bg-gray-200')
          : 'bg-gradient-to-br from-yellow-400 to-orange-500')
    },
      isMenuOpen 
        ? React.createElement(X, { size: 24, className: darkMode ? 'text-white' : 'text-gray-800' })
        : React.createElement(Zap, { size: 24, className: 'text-white' })
    ),
    
    React.createElement(QuickActionMenu, {
      isOpen: isMenuOpen,
      onClose: function() { setMenuOpen(false); },
      onAction: onAction,
      darkMode: darkMode
    })
  );
};

// 채팅 플로팅 버튼
export var ChatFloating = function(props) {
  var onClick = props.onClick;
  var darkMode = props.darkMode;
  var hasNotification = props.hasNotification;
  
  return React.createElement('button', {
    onClick: onClick,
    className: 'fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] shadow-lg flex items-center justify-center'
  },
    React.createElement('span', { className: 'text-2xl' }, '🐧'),
    hasNotification && React.createElement('div', {
      className: 'absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white'
    })
  );
};

// 페이지별 알프레도 한마디 컴포넌트
export var AlfredoPageComment = function(props) {
  var message = props.message;
  var darkMode = props.darkMode;
  var onClick = props.onClick;
  
  var bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  if (!message) return null;
  
  return React.createElement('button', {
    onClick: onClick,
    className: bgColor + ' w-full px-4 py-3 border-b ' + borderColor + ' flex items-center gap-2 text-left'
  },
    React.createElement('span', { className: 'text-lg' }, '🐧'),
    React.createElement('p', { className: textSecondary + ' text-sm flex-1' }, '"' + message + '"')
  );
};

// 페이지별 메시지 생성 함수
export var getPageComment = function(page, data) {
  var tasks = data.tasks || [];
  var events = data.events || [];
  var routines = data.routines || [];
  var streak = data.streak || 0;
  
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  var completedTasks = tasks.filter(function(t) { return t.completed; });
  var completedRoutines = routines.filter(function(r) { return r.completed; });
  
  var now = new Date();
  var today = now.toDateString();
  var todayEvents = events.filter(function(e) {
    return new Date(e.start).toDateString() === today;
  });
  var futureEvents = todayEvents.filter(function(e) {
    return new Date(e.start) > now;
  });
  
  switch (page) {
    case 'WORK':
      if (incompleteTasks.length === 0) {
        return '할 일 다 끝났어요! 🎉';
      }
      if (completedTasks.length > 0) {
        var remaining = incompleteTasks.length;
        var done = completedTasks.length;
        if (remaining <= done) {
          return '절반 넘게 했어요! 조금만 더 💪';
        }
        return done + '개 끝냈어요, ' + remaining + '개 남았어요';
      }
      return '뭐부터 할까요? 하나만 골라봐요';
      
    case 'LIFE':
      if (routines.length === 0) {
        return '루틴을 추가해보세요 ☀️';
      }
      var remainingRoutines = routines.length - completedRoutines.length;
      if (remainingRoutines === 0) {
        return '오늘 루틴 다 했어요! 대단해요 ✨';
      }
      if (remainingRoutines <= 2) {
        return remainingRoutines + '개만 더 하면 끝이에요!';
      }
      return '오늘도 나를 챙겨봐요 💜';
      
    case 'CALENDAR':
      if (futureEvents.length === 0) {
        return '남은 일정 없이 여유로워요 ✨';
      }
      var nextEvent = futureEvents[0];
      var nextTime = new Date(nextEvent.start);
      var diffMin = Math.round((nextTime - now) / 1000 / 60);
      if (diffMin <= 30) {
        return diffMin + '분 후 일정 있어요!';
      }
      return '다음 일정까지 여유 있어요';
      
    case 'STATS':
    case 'GAME':
      if (streak > 0) {
        return '🔥 ' + streak + '일 연속! 대단해요';
      }
      return '오늘부터 새로 시작해봐요!';
      
    default:
      return null;
  }
};

export default QuickActionFloating;
