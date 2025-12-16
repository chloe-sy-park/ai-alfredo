import React, { useState } from 'react';
import { Zap, Clock, Folder, ChevronDown, ChevronUp, Sparkles, Timer, MessageCircle } from 'lucide-react';

// 🎯 지금 집중할 것 카드 - 알프레도가 직접 추천
export var FocusNowCard = function(props) {
  var task = props.task;
  var darkMode = props.darkMode;
  var userName = props.userName || 'Boss';
  var onStart = props.onStart;
  var onLater = props.onLater;
  var onShowOptions = props.onShowOptions;
  var condition = props.condition || 3;
  
  var showOptionsState = useState(false);
  var showOptions = showOptionsState[0];
  var setShowOptions = showOptionsState[1];
  
  if (!task) {
    // 할 일이 없을 때
    return React.createElement('div', {
      className: 'rounded-2xl overflow-hidden shadow-lg ' +
        (darkMode 
          ? 'bg-gradient-to-br from-[#2C2C2E] to-[#1D1D1F]' 
          : 'bg-gradient-to-br from-white to-gray-50')
    },
      React.createElement('div', { className: 'p-5 text-center' },
        React.createElement('div', { 
          className: 'w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg shadow-green-500/30'
        }, '🎉'),
        React.createElement('h3', {
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold text-lg mb-1'
        }, '오늘 할 일 다 끝!'),
        React.createElement('p', {
          className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm'
        }, '푹 쉬거나, 하고 싶은 거 하세요 💜')
      )
    );
  }
  
  // 긴급도 체크
  var isUrgent = false;
  if (task.deadline || task.dueDate) {
    var deadline = new Date(task.deadline || task.dueDate);
    var now = new Date();
    var diffHours = (deadline - now) / 1000 / 60 / 60;
    isUrgent = diffHours > 0 && diffHours <= 2;
  }
  
  // 알프레도 추천 이유
  var getRecommendReason = function() {
    if (isUrgent) return '마감이 코앞이에요!';
    if (task.priority === 'high' || task.importance >= 4) return '중요도가 높아요';
    if (task.recommended) return '지금 하기 딱 좋아요';
    return '이것부터 시작해봐요';
  };
  
  // 컨디션에 따른 메시지
  var getEncouragement = function() {
    if (condition <= 2) {
      return '힘들면 15분만 해보는 건 어때요?';
    }
    if (isUrgent) {
      return '지금 시작하면 충분해요. 화이팅!';
    }
    return '하나씩 차근차근 가봐요!';
  };
  
  return React.createElement('div', {
    className: 'rounded-2xl overflow-hidden shadow-lg transition-all ' +
      (darkMode 
        ? 'bg-gradient-to-br from-[#2C2C2E] to-[#1D1D1F]' 
        : 'bg-gradient-to-br from-white to-gray-50')
  },
    // 헤더 - 그라데이션
    React.createElement('div', {
      className: 'px-5 py-3 flex items-center justify-between ' +
        (darkMode 
          ? 'bg-gradient-to-r from-[#A996FF]/20 to-transparent'
          : 'bg-gradient-to-r from-[#E8E4F3] to-transparent')
    },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: 'text-lg' }, '🎯'),
        React.createElement('span', {
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold'
        }, '지금 이거부터')
      ),
      // 다른 옵션 토글
      React.createElement('button', {
        onClick: function() { 
          setShowOptions(!showOptions);
          if (onShowOptions) onShowOptions();
        },
        className: 'flex items-center gap-1 text-sm btn-press ' +
          (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700')
      },
        React.createElement('span', null, '다른 옵션'),
        showOptions 
          ? React.createElement(ChevronUp, { size: 14 })
          : React.createElement(ChevronDown, { size: 14 })
      )
    ),
    
    React.createElement('div', { className: 'p-5' },
      // 알프레도 추천 (말풍선 스타일)
      React.createElement('div', { className: 'flex items-start gap-3 mb-4' },
        // 알프레도 미니 아바타
        React.createElement('div', {
          className: 'w-10 h-10 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-lg flex-shrink-0 shadow-lg shadow-[#A996FF]/30'
        }, '🐧'),
        
        // 말풍선
        React.createElement('div', {
          className: 'flex-1 relative rounded-2xl px-4 py-3 ' +
            (darkMode ? 'bg-[#A996FF]/10' : 'bg-[#A996FF]/10')
        },
          // 꼬리
          React.createElement('div', {
            className: 'absolute left-[-6px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] ' +
              (darkMode ? 'border-r-[#A996FF]/10' : 'border-r-[#A996FF]/10')
          }),
          
          // AI 추천 배지
          React.createElement('div', {
            className: 'flex items-center gap-1 text-[#A996FF] text-xs font-medium mb-1'
          },
            React.createElement(Sparkles, { size: 12 }),
            React.createElement('span', null, 'AI 추천')
          ),
          
          // 추천 이유
          React.createElement('p', {
            className: (darkMode ? 'text-gray-200' : 'text-gray-700') + ' text-sm'
          }, getRecommendReason())
        )
      ),
      
      // 태스크 정보
      React.createElement('div', {
        className: 'rounded-xl p-4 mb-4 ' +
          (isUrgent 
            ? (darkMode ? 'bg-red-500/10 ring-1 ring-red-500/30' : 'bg-red-50 ring-1 ring-red-200')
            : (darkMode ? 'bg-white/5' : 'bg-gray-50'))
      },
        // 긴급 배지
        isUrgent && React.createElement('div', {
          className: 'inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold mb-2 animate-pulse-soft'
        },
          React.createElement('span', null, '🔥'),
          React.createElement('span', null, '긴급')
        ),
        
        // 태스크 제목
        React.createElement('h3', {
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold text-lg mb-2'
        }, task.title),
        
        // 메타 정보
        React.createElement('div', { className: 'flex flex-wrap items-center gap-2' },
          // 프로젝트
          task.project && React.createElement('div', {
            className: 'flex items-center gap-1 px-2 py-1 rounded-lg text-xs ' +
              (darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700')
          },
            React.createElement(Folder, { size: 12 }),
            React.createElement('span', null, task.project)
          ),
          
          // 예상 시간
          task.estimatedTime && React.createElement('div', {
            className: 'flex items-center gap-1 px-2 py-1 rounded-lg text-xs ' +
              (darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700')
          },
            React.createElement(Timer, { size: 12 }),
            React.createElement('span', null, task.estimatedTime + '분')
          ),
          
          // 마감
          (task.deadline || task.dueDate) && React.createElement('div', {
            className: 'flex items-center gap-1 px-2 py-1 rounded-lg text-xs ' +
              (isUrgent 
                ? 'bg-red-500/20 text-red-400'
                : (darkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-200 text-gray-600'))
          },
            React.createElement(Clock, { size: 12 }),
            React.createElement('span', null, 
              isUrgent ? '곧 마감!' : new Date(task.deadline || task.dueDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
            )
          )
        )
      ),
      
      // 격려 메시지
      React.createElement('p', {
        className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm text-center mb-4'
      }, getEncouragement()),
      
      // 액션 버튼들
      React.createElement('div', { className: 'flex gap-3' },
        // 나중에 버튼
        React.createElement('button', {
          onClick: function() { if (onLater) onLater(task); },
          className: 'flex-1 py-3 rounded-xl font-medium transition-all btn-press ' +
            (darkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
        }, '나중에'),
        
        // 시작하기 버튼
        React.createElement('button', {
          onClick: function() { if (onStart) onStart(task); },
          className: 'flex-[2] py-3 rounded-xl font-bold transition-all btn-press flex items-center justify-center gap-2 ' +
            'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white shadow-lg shadow-[#A996FF]/30 hover:shadow-xl'
        },
          React.createElement(Zap, { size: 18, className: 'fill-current' }),
          React.createElement('span', null, '시작하기')
        )
      )
    )
  );
};

export default FocusNowCard;
