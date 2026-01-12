import React from 'react';
import { Inbox, Calendar, CheckCircle2, Coffee, Sparkles, Plus } from 'lucide-react';

// ============================================
// 🐧 Empty State 컴포넌트
// ADHD 친화적: 비난 없이 따뜻하게
// ============================================

// 빈 상태 타입별 설정
var EMPTY_CONFIGS = {
  tasks: {
    icon: CheckCircle2,
    emoji: '🎉',
    title: '오늘 할 일 완료!',
    message: '푹 쉬어도 돼요. 수고했어요.',
    subMessage: '새 할 일을 추가하거나, 그냥 쉬세요',
    actionLabel: '할 일 추가',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50'
  },
  inbox: {
    icon: Inbox,
    emoji: '📭',
    title: '인박스가 비어있어요',
    message: '새로운 할 일이 생기면 여기에 모여요',
    subMessage: null,
    actionLabel: '할 일 추가',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  events: {
    icon: Calendar,
    emoji: '📅',
    title: '오늘은 일정이 없어요',
    message: '여유로운 하루 되세요!',
    subMessage: '캘린더를 연결하면 일정이 보여요',
    actionLabel: '캘린더 연결',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50'
  },
  focus: {
    icon: Coffee,
    emoji: '☕',
    title: '지금은 쉬는 시간',
    message: '집중할 태스크가 없어요',
    subMessage: '할 일을 추가하거나, 잠깐 쉬어가세요',
    actionLabel: '할 일 추가',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50'
  },
  search: {
    icon: Sparkles,
    emoji: '🔍',
    title: '검색 결과가 없어요',
    message: '다른 키워드로 찾아볼까요?',
    subMessage: null,
    actionLabel: null,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50'
  }
};

// 메인 EmptyState 컴포넌트
var EmptyState = function(props) {
  var type = props.type || 'tasks';
  var darkMode = props.darkMode;
  var onAction = props.onAction;
  var customTitle = props.title;
  var customMessage = props.message;
  var customActionLabel = props.actionLabel;
  var compact = props.compact;
  var showAction = props.showAction !== false;
  
  var config = EMPTY_CONFIGS[type] || EMPTY_CONFIGS.tasks;
  var IconComponent = config.icon;
  
  var title = customTitle || config.title;
  var message = customMessage || config.message;
  var actionLabel = customActionLabel || config.actionLabel;
  
  // 컴팩트 모드 (카드 내부용)
  if (compact) {
    return React.createElement('div', {
      className: 'flex flex-col items-center justify-center py-6 px-4 text-center'
    },
      React.createElement('span', {
        className: 'text-3xl mb-2'
      }, config.emoji),
      
      React.createElement('p', {
        className: 'font-medium ' + (darkMode ? 'text-gray-200' : 'text-gray-700')
      }, title),
      
      React.createElement('p', {
        className: 'text-sm mt-1 ' + (darkMode ? 'text-gray-400' : 'text-gray-500')
      }, message),
      
      showAction && actionLabel && onAction && React.createElement('button', {
        onClick: onAction,
        className: 'mt-3 flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium ' +
          config.color + ' ' + config.bgColor + ' hover:opacity-80 active:scale-95 transition-all'
      },
        React.createElement(Plus, { size: 16 }),
        actionLabel
      )
    );
  }
  
  // 풀 모드 (페이지용)
  return React.createElement('div', {
    className: 'flex flex-col items-center justify-center py-12 px-6 text-center'
  },
    // 아이콘 배경
    React.createElement('div', {
      className: 'w-20 h-20 rounded-full flex items-center justify-center mb-4 ' +
        (darkMode ? 'bg-gray-700' : config.bgColor)
    },
      React.createElement('span', { className: 'text-4xl' }, config.emoji)
    ),
    
    // 제목
    React.createElement('h3', {
      className: 'text-lg font-bold mb-2 ' + (darkMode ? 'text-white' : 'text-gray-800')
    }, title),
    
    // 메시지
    React.createElement('p', {
      className: 'text-sm mb-1 ' + (darkMode ? 'text-gray-300' : 'text-gray-600')
    }, message),
    
    // 서브 메시지
    config.subMessage && React.createElement('p', {
      className: 'text-xs ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
    }, config.subMessage),
    
    // 액션 버튼
    showAction && actionLabel && onAction && React.createElement('button', {
      onClick: onAction,
      className: 'mt-6 flex items-center gap-2 px-6 py-3 rounded-xl font-medium ' +
        'bg-gradient-to-r from-purple-500 to-pink-500 text-white ' +
        'hover:opacity-90 active:scale-95 transition-all shadow-lg'
    },
      React.createElement(Plus, { size: 18 }),
      actionLabel
    )
  );
};

// 태스크 빈 상태
export var TasksEmptyState = function(props) {
  return React.createElement(EmptyState, Object.assign({}, props, { type: 'tasks' }));
};

// 인박스 빈 상태
export var InboxEmptyState = function(props) {
  return React.createElement(EmptyState, Object.assign({}, props, { type: 'inbox' }));
};

// 일정 빈 상태
export var EventsEmptyState = function(props) {
  return React.createElement(EmptyState, Object.assign({}, props, { type: 'events' }));
};

// 포커스 빈 상태
export var FocusEmptyState = function(props) {
  return React.createElement(EmptyState, Object.assign({}, props, { type: 'focus' }));
};

// 검색 빈 상태
export var SearchEmptyState = function(props) {
  return React.createElement(EmptyState, Object.assign({}, props, { type: 'search' }));
};

export default EmptyState;
