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
  
  // 애니메이션 딜레이 클래스
  var getDelayClass = function(idx) {
    return 'animate-delay-' + (idx * 100);
  };
  
  return React.createElement('div', { 
    // 반응형 위치: 모바일은 왼쪽 하단, 태블릿+는 콘텐츠 영역 기준
    className: 'fixed bottom-6 left-4 md:left-[calc(50%-384px+24px)] lg:left-[calc(50%-384px+32px)] z-50'
  },
    // 확장된 메뉴
    isExpanded && React.createElement('div', { 
      className: 'absolute bottom-16 left-0 flex flex-col gap-2 md:gap-3 mb-2'
    },
      QUICK_ACTIONS.map(function(action, idx) {
        var Icon = action.icon;
        var delayClass = getDelayClass(QUICK_ACTIONS.length - 1 - idx);
        return React.createElement('button', {
          key: action.id,
          onClick: function() { 
            if (onAction) onAction(action.id); 
            setExpanded(false);
          },
          // 터치 타겟 최소 44px 보장
          className: 'flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-2xl shadow-lg ' +
            'animate-fadeInUp ' + delayClass + ' btn-press card-hover ' +
            (darkMode ? 'bg-[#2C2C2E]' : 'bg-white')
        },
          React.createElement('div', { 
            className: action.color + ' w-9 h-9 md:w-8 md:h-8 rounded-xl flex items-center justify-center text-white shadow-sm'
          },
            React.createElement(Icon, { size: 18 })
          ),
          React.createElement('span', { 
            className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-medium text-sm md:text-base'
          }, action.label)
        );
      })
    ),
    
    // 메인 버튼 - 터치 타겟 56px (Apple 권장)
    React.createElement('button', {
      onClick: function() { setExpanded(!isExpanded); },
      className: 'w-14 h-14 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-xl transition-all btn-press ' +
        (isExpanded 
          ? (darkMode ? 'bg-[#3A3A3C] rotate-45' : 'bg-gray-200 rotate-45')
          : 'bg-[#A996FF] shadow-[#A996FF]/40 hover:shadow-xl hover:shadow-[#A996FF]/50')
    },
      React.createElement(Plus, { 
        size: 24, 
        className: isExpanded 
          ? (darkMode ? 'text-white' : 'text-gray-700') 
          : 'text-white'
      })
    ),
    
    // 배경 오버레이 (펼쳤을 때)
    isExpanded && React.createElement('div', {
      className: 'fixed inset-0 -z-10 bg-black/20 backdrop-blur-sm animate-fadeIn',
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
    // 반응형 위치: 모바일은 오른쪽 하단, 태블릿+는 콘텐츠 영역 기준
    // 터치 타겟 56px
    className: 'fixed bottom-6 right-4 md:right-[calc(50%-384px+24px)] lg:right-[calc(50%-384px+32px)] z-50 ' +
      'w-14 h-14 md:w-12 md:h-12 rounded-full flex items-center justify-center ' +
      'shadow-xl transition-all btn-press ' +
      'bg-[#A996FF] shadow-[#A996FF]/40 hover:shadow-xl hover:shadow-[#A996FF]/50 hover:scale-105'
  },
    React.createElement('span', { className: 'text-2xl md:text-xl' }, '🐧'),
    
    // 읽지 않은 메시지 표시
    hasUnread && React.createElement('div', {
      className: 'absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center ' +
        'text-white text-xs font-bold ring-2 ring-white notif-badge'
    }, '!')
  );
};

export default { QuickActionFloating: QuickActionFloating, ChatFloating: ChatFloating };
