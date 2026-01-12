import React from 'react';
import { Play, Briefcase, Heart, Clock, Users } from 'lucide-react';

// 카테고리 판단
var getCategory = function(title) {
  var lower = (title || '').toLowerCase();
  if (lower.includes('미팅') || lower.includes('회의') || lower.includes('보고') || 
      lower.includes('업무') || lower.includes('메일') || lower.includes('문서')) {
    return { icon: Briefcase, label: '업무', color: 'text-blue-500', bg: 'bg-blue-50' };
  }
  if (lower.includes('엄마') || lower.includes('가족') || lower.includes('친구') || 
      lower.includes('약속') || lower.includes('생일')) {
    return { icon: Heart, label: '일상', color: 'text-pink-500', bg: 'bg-pink-50' };
  }
  return { icon: Briefcase, label: '할일', color: 'text-purple-500', bg: 'bg-purple-50' };
};

// 날짜 유효성 체크 및 포맷
var formatDeadline = function(dateStr) {
  if (!dateStr) return null;
  var d = new Date(dateStr);
  // Invalid Date 체크
  if (isNaN(d.getTime())) return null;
  
  return d.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 알프레도 추천 이유
var getRecommendReason = function(task) {
  if (!task) return '';
  
  var now = new Date();
  
  // 마감 임박
  if (task.deadline || task.dueDate) {
    var deadline = new Date(task.deadline || task.dueDate);
    // Invalid Date 체크
    if (!isNaN(deadline.getTime())) {
      var diffHours = (deadline - now) / 1000 / 60 / 60;
      
      if (diffHours > 0 && diffHours <= 2) {
        return '⚡ 2시간 안에 마감이에요!';
      }
      if (diffHours > 0 && diffHours <= 24) {
        return '📌 오늘 마감이라 먼저 추천해요';
      }
    }
  }
  
  // 높은 우선순위
  if (task.priority === 'high' || task.importance >= 4) {
    return '🎯 중요한 일이라 먼저 추천해요';
  }
  
  // 기본
  return '✨ 이거부터 시작하면 좋을 것 같아요';
};

// 🎯 지금 이거부터 카드 - 알프레도 느낌
export var FocusNowCard = function(props) {
  var task = props.task;
  var onStart = props.onStart;
  var onStartBodyDoubling = props.onStartBodyDoubling;
  var onLater = props.onLater;
  var onAddTask = props.onAddTask;
  
  // 빈 상태 - 알프레도가 물어봄
  if (!task) {
    return React.createElement('div', {
      className: 'bg-white rounded-2xl border border-gray-100 shadow-sm p-5'
    },
      React.createElement('div', { className: 'flex items-start gap-3' },
        // 펭귄
        React.createElement('span', { className: 'text-3xl' }, '🐧'),
        
        // 메시지
        React.createElement('div', { className: 'flex-1' },
          React.createElement('p', {
            className: 'text-gray-800 font-medium text-base'
          }, '오늘 뭐 할까요?'),
          React.createElement('p', {
            className: 'text-gray-500 text-sm mt-1'
          }, '할 일을 추가하면 제가 추천해드릴게요 💜')
        )
      ),
      
      // 추가 버튼
      onAddTask && React.createElement('button', {
        onClick: onAddTask,
        className: 'mt-4 w-full min-h-[48px] py-3 rounded-xl text-sm font-medium ' +
          'bg-purple-50 text-purple-600 hover:bg-purple-100 active:bg-purple-200 transition-colors'
      }, '+ 할 일 추가하기')
    );
  }
  
  var category = getCategory(task.title);
  var reason = getRecommendReason(task);
  var CategoryIcon = category.icon;
  var deadlineStr = formatDeadline(task.deadline || task.dueDate);
  
  return React.createElement('div', {
    className: 'bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'
  },
    // 알프레도 추천 헤더
    React.createElement('div', {
      className: 'px-4 py-3 bg-gradient-to-r from-purple-50 to-white flex items-center gap-2'
    },
      React.createElement('span', { className: 'text-xl' }, '🐧'),
      React.createElement('span', {
        className: 'text-sm text-purple-600 font-medium'
      }, reason)
    ),
    
    // 태스크 내용
    React.createElement('div', { className: 'p-4' },
      // 카테고리 + 제목
      React.createElement('div', { className: 'flex items-start gap-3 mb-4' },
        // 카테고리 아이콘
        React.createElement('div', {
          className: 'w-12 h-12 rounded-xl flex items-center justify-center ' + category.bg
        },
          React.createElement(CategoryIcon, { size: 22, className: category.color })
        ),
        
        // 제목
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('p', {
            className: 'text-gray-800 font-semibold text-base leading-snug'
          }, task.title),
          
          // 마감 정보 (유효한 경우만 표시)
          deadlineStr && React.createElement('div', {
            className: 'flex items-center gap-1.5 mt-1.5 text-xs text-gray-400'
          },
            React.createElement(Clock, { size: 14 }),
            React.createElement('span', null, deadlineStr)
          )
        )
      ),
      
      // 버튼들 - 3개 버튼
      React.createElement('div', { className: 'flex items-center gap-2' },
        // 나중에
        React.createElement('button', {
          onClick: function() { if (onLater) onLater(task); },
          className: 'flex-1 min-h-[48px] py-3 rounded-xl text-sm font-medium transition-all active:scale-95 ' +
            'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
        }, '나중에'),
        
        // 같이 하기 (바디더블링)
        onStartBodyDoubling && React.createElement('button', {
          onClick: function() { onStartBodyDoubling(task); },
          className: 'flex-1 min-h-[48px] py-3 rounded-xl text-sm font-medium transition-all active:scale-95 ' +
            'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 active:bg-indigo-300 flex items-center justify-center gap-1.5'
        },
          React.createElement(Users, { size: 16 }),
          '같이'
        ),
        
        // 시작하기
        React.createElement('button', {
          onClick: function() { if (onStart) onStart(task); },
          className: 'flex-[1.5] min-h-[48px] py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ' +
            'bg-[#A996FF] text-white hover:bg-[#8B7CF7] active:bg-[#7B6AE0] flex items-center justify-center gap-2'
        },
          React.createElement(Play, { size: 18, className: 'fill-current' }),
          '시작'
        )
      )
    )
  );
};

export default FocusNowCard;
