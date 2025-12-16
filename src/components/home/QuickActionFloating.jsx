import React, { useState } from 'react';
import { Plus, MessageCircle, X, CheckSquare, Calendar, Droplets, Pill, Coffee } from 'lucide-react';

// 퀵 액션 옵션들
var QUICK_ACTIONS = [
  { id: 'addTask', icon: CheckSquare, label: '할 일', color: 'bg-green-500' },
  { id: 'addEvent', icon: Calendar, label: '일정', color: 'bg-blue-500' },
  { id: 'water', icon: Droplets, label: '물', color: 'bg-cyan-500' },
  { id: 'vitamin', icon: Pill, label: '영양제', color: 'bg-orange-500' },
  { id: 'rest', icon: Coffee, label: '휴식', color: 'bg-amber-500' }
];

// ➕ 퀵 액션 플로팅 버튼
export var QuickActionFloating = function(props) {
  var onAction = props.onAction;
  var darkMode = props.darkMode;
  
  var expandedState = useState(false);
  var isExpanded = expandedState[0];
  var setExpanded = expandedState[1];
  
  return React.createElement('div', { 
    className: 'fixed bottom-6 left-6 z-50'
  },
    // 확장된 메뉴
    isExpanded && React.createElement('div', { 
      className: 'absolute bottom-16 left-0 flex flex-col gap-3 mb-2'
    },
      QUICK_ACTIONS.map(function(action, idx) {
        var Icon = action.icon;
        return React.createElement('button', {
          key: action.id,
          onClick: function() { 
            if (onAction) onAction(action.id); 
            setExpanded(false);
          },
          className: 'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg transition-all ' +
            'hover:scale-105 active:scale-95 ' +
            (darkMode ? 'bg-[#2C2C2E]' : 'bg-white')
        },
          React.createElement('div', { 
            className: action.color + ' w-8 h-8 rounded-xl flex items-center justify-center text-white'
          },
            React.createElement(Icon, { size: 16 })
          ),
          React.createElement('span', { 
            className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-medium text-sm'
          }, action.label)
        );
      })
    ),
    
    // 메인 버튼
    React.createElement('button', {
      onClick: function() { setExpanded(!isExpanded); },
      className: 'w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ' +
        'hover:scale-105 active:scale-95 ' +
        (isExpanded 
          ? (darkMode ? 'bg-[#3A3A3C]' : 'bg-gray-200')
          : 'bg-[#A996FF] shadow-[#A996FF]/40')
    },
      isExpanded 
        ? React.createElement(X, { size: 24, className: darkMode ? 'text-white' : 'text-gray-700' })
        : React.createElement(Plus, { size: 24, className: 'text-white' })
    ),
    
    // 배경 오버레이 (펼쳤을 때)
    isExpanded && React.createElement('div', {
      className: 'fixed inset-0 -z-10',
      onClick: function() { setExpanded(false); }
    })
  );
};

// 💬 채팅 플로팅 버튼
export var ChatFloating = function(props) {
  var onClick = props.onClick;
  var darkMode = props.darkMode;
  var hasUnread = props.hasUnread;
  
  return React.createElement('button', {
    onClick: onClick,
    className: 'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center ' +
      'shadow-xl transition-all hover:scale-105 active:scale-95 ' +
      'bg-[#A996FF] shadow-[#A996FF]/40'
  },
    React.createElement('span', { className: 'text-2xl' }, '🐧'),
    
    // 읽지 않은 메시지 표시
    hasUnread && React.createElement('div', {
      className: 'absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center ' +
        'text-white text-xs font-bold ring-2 ring-white'
    }, '!')
  );
};

export default { QuickActionFloating: QuickActionFloating, ChatFloating: ChatFloating };
