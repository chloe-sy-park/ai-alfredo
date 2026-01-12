import React from 'react';
import { Play, Users, Clock, ChevronRight, Plus, Sparkles, AlertTriangle } from 'lucide-react';
import EmptyState from '../common/EmptyState';

// ============================================
// 🎯 지금 이거부터 카드 (W1 개선)
// Empty State 핸들링 추가
// ============================================

var FocusNowCard = function(props) {
  var task = props.task;
  var darkMode = props.darkMode;
  var onStart = props.onStart;
  var onStartBodyDoubling = props.onStartBodyDoubling;
  var onLater = props.onLater;
  var onAddTask = props.onAddTask;
  
  // 🆕 Empty State: 할 일 없을 때
  if (!task) {
    return React.createElement('div', {
      className: 'rounded-2xl overflow-hidden ' +
        (darkMode ? 'bg-gray-800/50' : 'bg-white/80') +
        ' backdrop-blur-sm border ' +
        (darkMode ? 'border-gray-700' : 'border-gray-100')
    },
      React.createElement(EmptyState, {
        type: 'focus',
        darkMode: darkMode,
        compact: true,
        onAction: onAddTask,
        actionLabel: '할 일 추가'
      })
    );
  }
  
  // 긴급 여부
  var isUrgent = false;
  if (task.deadline || task.dueDate) {
    var deadline = new Date(task.deadline || task.dueDate);
    var diffHours = (deadline - new Date()) / 1000 / 60 / 60;
    isUrgent = diffHours > 0 && diffHours <= 2;
  }
  
  // 우선순위 색상
  var priorityColor = task.priority === 'high' || task.importance >= 4
    ? 'from-red-500 to-orange-500'
    : task.priority === 'medium' || task.importance >= 3
      ? 'from-amber-500 to-yellow-500'
      : 'from-purple-500 to-pink-500';
  
  // 예상 소요 시간
  var estimatedTime = task.estimatedTime || task.duration || 25;
  
  return React.createElement('div', {
    className: 'rounded-2xl overflow-hidden ' +
      (darkMode ? 'bg-gray-800' : 'bg-white') +
      ' shadow-lg border ' +
      (darkMode ? 'border-gray-700' : 'border-gray-100')
  },
    // 헤더
    React.createElement('div', {
      className: 'px-4 pt-4 pb-3 flex items-center justify-between'
    },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', {
          className: 'w-8 h-8 rounded-full bg-gradient-to-r ' + priorityColor + 
            ' flex items-center justify-center'
        },
          isUrgent 
            ? React.createElement(AlertTriangle, { size: 16, className: 'text-white' })
            : React.createElement(Sparkles, { size: 16, className: 'text-white' })
        ),
        React.createElement('span', {
          className: 'font-bold ' + (darkMode ? 'text-white' : 'text-gray-800')
        }, isUrgent ? '🔥 긴급!' : '지금 이거부터')
      ),
      
      task.recommended && React.createElement('span', {
        className: 'text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600 font-medium'
      }, 'AI 추천')
    ),
    
    // 태스크 정보
    React.createElement('div', { className: 'px-4 pb-3' },
      React.createElement('h3', {
        className: 'text-lg font-semibold mb-1 ' + (darkMode ? 'text-white' : 'text-gray-800')
      }, task.title || task.name),
      
      React.createElement('div', { className: 'flex items-center gap-3 text-sm ' + 
        (darkMode ? 'text-gray-400' : 'text-gray-500')
      },
        React.createElement('span', { className: 'flex items-center gap-1' },
          React.createElement(Clock, { size: 14 }),
          estimatedTime + '분'
        ),
        
        task.project && React.createElement('span', {
          className: 'px-2 py-0.5 rounded-full text-xs ' +
            (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
        }, task.project)
      )
    ),
    
    // 액션 버튼들
    React.createElement('div', {
      className: 'px-4 pb-4 flex gap-2'
    },
      // 집중 시작 버튼
      React.createElement('button', {
        onClick: function() { onStart && onStart(task); },
        className: 'flex-1 min-h-[48px] py-3 px-4 rounded-xl font-medium text-white ' +
          'bg-gradient-to-r ' + priorityColor + ' ' +
          'flex items-center justify-center gap-2 ' +
          'hover:opacity-90 active:scale-[0.98] transition-all shadow-md'
      },
        React.createElement(Play, { size: 18 }),
        '집중 시작'
      ),
      
      // 바디더블링 버튼
      React.createElement('button', {
        onClick: function() { onStartBodyDoubling && onStartBodyDoubling(task); },
        className: 'min-w-[48px] min-h-[48px] px-4 py-3 rounded-xl font-medium ' +
          (darkMode 
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200') +
          ' flex items-center justify-center gap-2 active:scale-[0.98] transition-all'
      },
        React.createElement(Users, { size: 18 }),
        React.createElement('span', { className: 'hidden sm:inline' }, '함께')
      )
    ),
    
    // 나중에 버튼
    React.createElement('button', {
      onClick: onLater,
      className: 'w-full py-3 text-sm border-t ' +
        (darkMode 
          ? 'border-gray-700 text-gray-400 hover:bg-gray-700/50' 
          : 'border-gray-100 text-gray-500 hover:bg-gray-50') +
        ' transition-colors flex items-center justify-center gap-1'
    },
      '다른 거 할래요',
      React.createElement(ChevronRight, { size: 14 })
    )
  );
};

export default FocusNowCard;
