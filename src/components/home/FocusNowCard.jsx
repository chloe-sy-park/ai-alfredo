import React from 'react';
import { ChevronDown, Zap, Clock } from 'lucide-react';

// 🎯 지금 이거부터 카드 (AI 제안)
export var FocusNowCard = function(props) {
  var task = props.task;
  var darkMode = props.darkMode;
  var onStart = props.onStart;
  var onLater = props.onLater;
  var onShowOptions = props.onShowOptions;
  var userName = props.userName || '클로이';
  
  if (!task) return null;
  
  // 프로젝트/도메인
  var project = task.project || task.domain || '';
  
  // 예상 시간
  var duration = task.estimatedTime || task.duration || 60;
  var durationText = duration >= 60 
    ? Math.floor(duration / 60) + '시간' 
    : duration + '분';
  
  return React.createElement('div', { 
    className: 'rounded-3xl overflow-hidden mb-6 shadow-lg ' +
      (darkMode ? 'bg-[#2C2C2E]' : 'bg-white')
  },
    // AI 추천 헤더
    React.createElement('div', { 
      className: 'px-5 py-3 flex items-center gap-3 ' +
        (darkMode ? 'bg-[#3A3A3C]' : 'bg-gray-50')
    },
      React.createElement('div', { 
        className: 'w-8 h-8 rounded-full bg-[#A996FF] flex items-center justify-center text-lg'
      }, '🐧'),
      React.createElement('p', { 
        className: (darkMode ? 'text-gray-200' : 'text-gray-700') + ' text-sm'
      }, 
        '"' + task.title + '"이 제일 급해요.',
        React.createElement('br'),
        '제가 초안을 준비할까요?'
      )
    ),
    
    // 태스크 정보
    React.createElement('div', { className: 'p-5' },
      // 섹션 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-3' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', { className: 'text-[#A996FF]' }, '🎯'),
          React.createElement('span', { 
            className: 'text-[#A996FF] text-sm font-medium' 
          }, '지금 이거부터')
        ),
        React.createElement('button', {
          onClick: onShowOptions,
          className: 'flex items-center gap-1 text-sm ' +
            (darkMode ? 'text-gray-400' : 'text-gray-500')
        },
          '다른 옵션',
          React.createElement(ChevronDown, { size: 14 })
        )
      ),
      
      // 태스크 카드
      React.createElement('div', { 
        className: 'flex items-center justify-between gap-4'
      },
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('h3', { 
            className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold text-lg'
          }, task.title),
          React.createElement('p', { 
            className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm mt-0.5'
          }, 
            project && (project + ' · '),
            durationText
          )
        ),
        
        // 버튼들
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('button', {
            onClick: function() { if (onStart) onStart(task); },
            className: 'px-5 py-2.5 bg-[#A996FF] text-white rounded-xl font-semibold ' +
              'shadow-lg shadow-[#A996FF]/30 hover:bg-[#8B7AE4] transition-all active:scale-95'
          }, '시작하기'),
          React.createElement('button', {
            onClick: function() { if (onLater) onLater(task); },
            className: 'px-4 py-2.5 rounded-xl font-medium transition-all active:scale-95 ' +
              (darkMode 
                ? 'bg-[#3A3A3C] text-gray-300 hover:bg-[#48484A]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
          }, '나중에')
        )
      )
    )
  );
};

export default FocusNowCard;
