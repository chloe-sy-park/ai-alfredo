import React from 'react';
import { ChevronDown, Zap, Sparkles, Timer, Folder } from 'lucide-react';

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
        return '마감이 ' + diffHours + '시간 남았어요!';
      }
    }
  }
  
  // 메일/회신
  if (titleLower.includes('메일') || titleLower.includes('회신') || titleLower.includes('답장')) {
    return '답장이 밀려있어요. 빨리 정리해요!';
  }
  
  // 문서/보고서
  if (titleLower.includes('문서') || titleLower.includes('보고서') || titleLower.includes('기획')) {
    return '초안을 제가 도와드릴까요?';
  }
  
  // 회의/미팅
  if (titleLower.includes('회의') || titleLower.includes('미팅') || titleLower.includes('준비')) {
    return '준비할 시간이에요!';
  }
  
  // 기본
  return '이게 제일 급해요. 먼저 시작해볼까요?';
};

// 🎯 지금 이거부터 카드 - 시각적 강화 버전
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
  var isUrgent = task.recommended || task.priority === 'high';
  
  return React.createElement('div', { 
    className: 'rounded-2xl md:rounded-3xl overflow-hidden shadow-xl animate-fadeInUp ' +
      'ring-1 ' +
      (isUrgent 
        ? 'ring-[#A996FF]/50 shadow-[#A996FF]/20' 
        : (darkMode ? 'ring-white/10' : 'ring-black/5')) +
      (darkMode ? ' bg-[#2C2C2E]' : ' bg-white')
  },
    // AI 추천 헤더 - 그라데이션 배경
    React.createElement('div', { 
      className: 'px-4 md:px-5 py-3 flex items-center gap-3 ' +
        (darkMode 
          ? 'bg-gradient-to-r from-[#3A3A3C] to-[#4A4A5C]' 
          : 'bg-gradient-to-r from-[#F8F6FF] to-[#F0F4FF]')
    },
      // 펭귄 아바타 - 그라데이션 배경
      React.createElement('div', { 
        className: 'w-11 h-11 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7AE4] ' +
          'flex items-center justify-center text-xl shadow-lg shadow-[#A996FF]/30 flex-shrink-0'
      }, '🐧'),
      // AI 추천 메시지
      React.createElement('div', { className: 'flex-1 min-w-0' },
        React.createElement('div', { className: 'flex items-center gap-1.5 mb-0.5' },
          React.createElement(Sparkles, { 
            size: 14, 
            className: 'text-[#A996FF]' 
          }),
          React.createElement('span', { 
            className: 'text-xs font-bold text-[#A996FF]'
          }, 'AI 추천')
        ),
        React.createElement('p', { 
          className: (darkMode ? 'text-gray-200' : 'text-gray-700') + ' text-sm leading-snug truncate'
        }, suggestion)
      )
    ),
    
    // 태스크 정보
    React.createElement('div', { className: 'p-4 md:p-5' },
      // 섹션 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('div', { 
          className: 'flex items-center gap-2 px-3 py-1.5 rounded-full ' +
            (darkMode ? 'bg-[#A996FF]/20' : 'bg-[#A996FF]/10')
        },
          React.createElement('span', { className: 'text-lg' }, '🎯'),
          React.createElement('span', { 
            className: 'text-[#A996FF] text-sm font-bold' 
          }, '지금 이거부터'),
          isUrgent && React.createElement('span', {
            className: 'ml-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full animate-pulse-soft'
          }, '🔥')
        ),
        React.createElement('button', {
          onClick: onShowOptions,
          className: 'flex items-center gap-1 text-sm font-medium min-h-[44px] px-3 ' +
            'rounded-lg transition-colors btn-press ' +
            (darkMode ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-black/5')
        },
          '다른 옵션',
          React.createElement(ChevronDown, { size: 14 })
        )
      ),
      
      // 태스크 카드 - 배경 추가
      React.createElement('div', { 
        className: 'p-4 rounded-xl ' +
          (darkMode ? 'bg-[#3A3A3C]/50' : 'bg-gray-50/80')
      },
        React.createElement('div', { className: 'mb-4' },
          React.createElement('h3', { 
            className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold text-lg mb-2'
          }, task.title),
          React.createElement('div', { 
            className: 'flex items-center gap-3 flex-wrap'
          },
            // 프로젝트 태그
            project && React.createElement('span', { 
              className: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ' +
                (darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700')
            }, 
              React.createElement(Folder, { size: 12 }),
              project
            ),
            // 예상 시간
            React.createElement('span', { 
              className: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ' +
                (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600')
            }, 
              React.createElement(Timer, { size: 12 }),
              durationText
            )
          )
        ),
        
        // 버튼들 - 모바일 세로, 태블릿+ 가로
        React.createElement('div', { className: 'flex flex-col sm:flex-row items-stretch sm:items-center gap-2' },
          React.createElement('button', {
            onClick: function() { if (onStart) onStart(task); },
            className: 'flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] ' +
              'bg-gradient-to-r from-[#A996FF] to-[#8B7AE4] text-white rounded-xl font-bold ' +
              'shadow-lg shadow-[#A996FF]/30 hover:shadow-xl hover:shadow-[#A996FF]/40 ' +
              'transition-all btn-press'
          }, 
            React.createElement(Zap, { size: 18, className: 'fill-current' }),
            '시작하기'
          ),
          React.createElement('button', {
            onClick: function() { if (onLater) onLater(task); },
            className: 'flex-1 sm:flex-none px-5 py-3 min-h-[48px] rounded-xl font-medium transition-all btn-press ' +
              (darkMode 
                ? 'bg-[#48484A] text-gray-300 hover:bg-[#58585A]' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300')
          }, '나중에')
        )
      )
    )
  );
};

export default FocusNowCard;
