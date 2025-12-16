import React from 'react';
import { ChevronDown, Zap } from 'lucide-react';

// AI 제안 문구 생성
var getAISuggestion = function(task) {
  var title = task.title || '';
  var titleLower = title.toLowerCase();
  
  // 마감 임박
  if (task.recommended) {
    if (task.deadline || task.dueDate) {
      var due = new Date(task.deadline || task.dueDate);
      var now = new Date();
      var diffHours = Math.round((due - now) / 1000 / 60 / 60);
      
      if (diffHours <= 2 && diffHours > 0) {
        return '"' + title + '" 마감이 ' + diffHours + '시간 남았어요. 먼저 시작해볼까요?';
      }
    }
  }
  
  // 메일/회신
  if (titleLower.includes('메일') || titleLower.includes('회신') || titleLower.includes('답장')) {
    return '"' + title + '" 답장이 밀려있어요. 간단하게 먼저 정리할까요?';
  }
  
  // 문서/보고서
  if (titleLower.includes('문서') || titleLower.includes('보고서') || titleLower.includes('기획')) {
    return '"' + title + '" 초안을 제가 도와드릴까요?';
  }
  
  // 회의/미팅
  if (titleLower.includes('회의') || titleLower.includes('미팅') || titleLower.includes('준비')) {
    return '"' + title + '" 준비할 시간이에요. 체크리스트 볼까요?';
  }
  
  // 연락
  if (titleLower.includes('연락') || titleLower.includes('전화') || titleLower.includes('통화')) {
    return '"' + title + '" 잊기 전에 지금 해볼까요?';
  }
  
  // 기본
  return '"' + title + '"이 제일 급해요. 먼저 시작해볼까요?';
};

// 🎯 지금 이거부터 카드 (AI 제안) - 반응형
export var FocusNowCard = function(props) {
  var task = props.task;
  var darkMode = props.darkMode;
  var onStart = props.onStart;
  var onLater = props.onLater;
  var onShowOptions = props.onShowOptions;
  
  if (!task) return null;
  
  // 프로젝트/도메인
  var project = task.project || task.domain || '';
  
  // 예상 시간
  var duration = task.estimatedTime || task.duration || 60;
  var durationText = duration >= 60 
    ? Math.floor(duration / 60) + '시간' 
    : duration + '분';
  
  // AI 제안 문구
  var suggestion = getAISuggestion(task);
  
  // 긴급 태스크 여부
  var isUrgent = task.recommended && (task.deadline || task.dueDate);
  
  return React.createElement('div', { 
    className: 'rounded-2xl md:rounded-3xl overflow-hidden shadow-lg animate-fadeInUp card-hover ' +
      (darkMode ? 'bg-[#2C2C2E]' : 'bg-white') +
      (isUrgent ? ' ring-2 ring-[#A996FF]/50' : '')
  },
    // AI 추천 헤더
    React.createElement('div', { 
      className: 'px-4 md:px-5 py-3 flex items-center gap-3 ' +
        (darkMode ? 'bg-[#3A3A3C]' : 'bg-gray-50')
    },
      React.createElement('div', { 
        className: 'w-8 h-8 rounded-full bg-[#A996FF] flex items-center justify-center text-lg shadow-lg shadow-[#A996FF]/20 flex-shrink-0'
      }, '🐧'),
      React.createElement('p', { 
        className: (darkMode ? 'text-gray-200' : 'text-gray-700') + ' text-sm md:text-base leading-snug'
      }, suggestion)
    ),
    
    // 태스크 정보
    React.createElement('div', { className: 'p-4 md:p-5' },
      // 섹션 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-3' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', { className: 'text-[#A996FF]' }, '🎯'),
          React.createElement('span', { 
            className: 'text-[#A996FF] text-sm font-medium' 
          }, '지금 이거부터'),
          isUrgent && React.createElement('span', {
            className: 'px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full animate-pulse-soft'
          }, '긴급')
        ),
        React.createElement('button', {
          onClick: onShowOptions,
          className: 'flex items-center gap-1 text-sm p-2 -mr-2 min-h-[44px] btn-press ' +
            (darkMode ? 'text-gray-400' : 'text-gray-500')
        },
          '다른 옵션',
          React.createElement(ChevronDown, { size: 14 })
        )
      ),
      
      // 태스크 카드 - 모바일에서 세로 배치
      React.createElement('div', { 
        className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'
      },
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('h3', { 
            className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold text-base md:text-lg'
          }, task.title),
          React.createElement('p', { 
            className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm mt-0.5'
          }, 
            project && (project + ' · '),
            durationText
          )
        ),
        
        // 버튼들 - 모바일에서 전체 너비
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('button', {
            onClick: function() { if (onStart) onStart(task); },
            className: 'flex-1 sm:flex-none px-5 py-3 min-h-[48px] bg-[#A996FF] text-white rounded-xl font-semibold ' +
              'shadow-lg shadow-[#A996FF]/30 hover:bg-[#8B7AE4] transition-all btn-press ' +
              'flex items-center justify-center gap-2'
          }, 
            React.createElement(Zap, { size: 16 }),
            '시작하기'
          ),
          React.createElement('button', {
            onClick: function() { if (onLater) onLater(task); },
            className: 'px-4 py-3 min-h-[48px] rounded-xl font-medium transition-all btn-press ' +
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
