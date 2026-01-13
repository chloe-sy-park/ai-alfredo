import React from 'react';
import { Plus, Calendar, Inbox, Target, Sparkles, Coffee } from 'lucide-react';

// 🐧 알프레도 Empty State 컴포넌트
// ADHD 친화적: 긍정적인 메시지, 명확한 다음 행동

// 프리셋 설정
var PRESETS = {
  tasks: {
    emoji: '🐧',
    title: '오늘 할 일이 없네요!',
    messages: [
      '완벽해요! 여유로운 하루 되세요 ☀️',
      '오늘은 쉬어가는 날인가요? 💜',
      '할 일 없는 날도 좋은 날이에요 ✨',
      '여유가 있을 때 뭔가 해볼까요?'
    ],
    actionText: '할 일 추가하기',
    actionIcon: Plus
  },
  events: {
    emoji: '📅',
    title: '오늘 일정이 없어요',
    messages: [
      '자유로운 하루네요! 뭐든 할 수 있어요 🎉',
      '미팅 없는 날이에요. 집중하기 좋겠네요!',
      '오늘은 나만의 시간이에요 💜',
      '캘린더 연결하면 일정을 볼 수 있어요'
    ],
    actionText: '일정 추가하기',
    actionIcon: Calendar
  },
  inbox: {
    emoji: '📬',
    title: '인박스가 비어있어요',
    messages: [
      '깔끔하게 정리되어 있네요! 👏',
      '새로운 메일이 없어요. 좋은 신호예요!',
      'Gmail 연결하면 중요 메일을 알려드릴게요'
    ],
    actionText: null,
    actionIcon: Inbox
  },
  focus: {
    emoji: '🎯',
    title: '집중할 태스크가 없어요',
    messages: [
      '먼저 할 일을 추가해볼까요?',
      '오늘 뭘 해볼까요? 같이 정해봐요!',
      '작은 것부터 시작해보는 건 어때요?'
    ],
    actionText: '태스크 추가',
    actionIcon: Target
  },
  habits: {
    emoji: '🌱',
    title: '습관이 아직 없어요',
    messages: [
      '작은 습관부터 시작해볼까요?',
      '물 마시기, 스트레칭 같은 건 어때요?',
      '하루 5분으로 시작해보세요!'
    ],
    actionText: '습관 만들기',
    actionIcon: Sparkles
  },
  timeline: {
    emoji: '⏰',
    title: '타임라인이 비어있어요',
    messages: [
      '오늘은 여유로운 하루네요 ☀️',
      '자유 시간이 많아요! 뭐든 해보세요',
      '캘린더 연결하면 일정이 여기에 나와요'
    ],
    actionText: null,
    actionIcon: Calendar
  },
  default: {
    emoji: '🐧',
    title: '아직 비어있어요',
    messages: [
      '뭔가 시작해볼까요?',
      '차근차근 채워나가요!',
      '알프레도가 도와드릴게요 💜'
    ],
    actionText: null,
    actionIcon: Plus
  }
};

// 랜덤 메시지 선택
var getRandomMessage = function(messages) {
  var index = Math.floor(Math.random() * messages.length);
  return messages[index];
};

// 시간대별 추가 멘트
var getTimeBasedHint = function() {
  var hour = new Date().getHours();
  
  if (hour >= 5 && hour < 9) {
    return '아침이에요! 오늘 하루 화이팅 💪';
  }
  if (hour >= 9 && hour < 12) {
    return '오전은 집중하기 좋은 시간이에요';
  }
  if (hour >= 12 && hour < 14) {
    return '점심 맛있게 드셨나요? 🍽️';
  }
  if (hour >= 14 && hour < 17) {
    return '오후 파이팅! 조금만 더 힘내요';
  }
  if (hour >= 17 && hour < 21) {
    return '저녁이에요. 오늘도 수고했어요 ✨';
  }
  return '푹 쉬세요. 내일도 함께할게요 🌙';
};

// 메인 EmptyState 컴포넌트
var EmptyState = function(props) {
  var type = props.type || 'default';
  var darkMode = props.darkMode;
  var onAction = props.onAction;
  var customTitle = props.title;
  var customMessage = props.message;
  var customEmoji = props.emoji;
  var customActionText = props.actionText;
  var showTimeHint = props.showTimeHint;
  var compact = props.compact;
  var className = props.className || '';
  
  // 프리셋 가져오기
  var preset = PRESETS[type] || PRESETS.default;
  
  // 최종 값
  var emoji = customEmoji || preset.emoji;
  var title = customTitle || preset.title;
  var message = customMessage || getRandomMessage(preset.messages);
  var actionText = customActionText !== undefined ? customActionText : preset.actionText;
  var ActionIcon = preset.actionIcon;
  
  // 스타일
  var containerStyle = compact
    ? 'py-6 px-4'
    : 'py-10 px-6';
  
  var bgStyle = darkMode
    ? 'bg-gray-800/50'
    : 'bg-white/60';
  
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var textTertiary = darkMode ? 'text-gray-500' : 'text-gray-400';
  
  return React.createElement('div', {
    className: bgStyle + ' backdrop-blur-sm rounded-2xl ' + containerStyle + ' text-center ' + className
  },
    // 이모지
    React.createElement('div', {
      className: 'text-4xl mb-3 ' + (compact ? 'text-3xl mb-2' : '')
    }, emoji),
    
    // 타이틀
    React.createElement('h3', {
      className: textPrimary + ' font-semibold ' + (compact ? 'text-base mb-1' : 'text-lg mb-2')
    }, title),
    
    // 메시지
    React.createElement('p', {
      className: textSecondary + ' ' + (compact ? 'text-sm' : 'text-sm mb-1')
    }, message),
    
    // 시간대 힌트 (선택적)
    showTimeHint && React.createElement('p', {
      className: textTertiary + ' text-xs mt-2'
    }, getTimeBasedHint()),
    
    // 액션 버튼 (선택적)
    actionText && onAction && React.createElement('button', {
      onClick: onAction,
      className: 'mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ' +
        'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white ' +
        'hover:shadow-lg hover:shadow-purple-500/25 active:scale-95'
    },
      React.createElement(ActionIcon, { size: 16 }),
      actionText
    )
  );
};

// 미니 Empty State (인라인용)
var EmptyStateMini = function(props) {
  var message = props.message || '아직 비어있어요';
  var emoji = props.emoji || '🐧';
  var darkMode = props.darkMode;
  
  var textColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', {
    className: 'flex items-center justify-center gap-2 py-4 ' + textColor
  },
    React.createElement('span', null, emoji),
    React.createElement('span', { className: 'text-sm' }, message)
  );
};

// 첫 사용자 가이드
var FirstTimeGuide = function(props) {
  var darkMode = props.darkMode;
  var onGetStarted = props.onGetStarted;
  var onConnectCalendar = props.onConnectCalendar;
  var isCalendarConnected = props.isCalendarConnected;
  
  var bgStyle = darkMode ? 'bg-gray-800/80' : 'bg-white/80';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  var steps = [
    {
      emoji: '📅',
      title: '캘린더 연결',
      desc: '일정을 자동으로 가져와요',
      done: isCalendarConnected
    },
    {
      emoji: '✅',
      title: '첫 태스크 추가',
      desc: '오늘 할 일을 적어보세요',
      done: false
    },
    {
      emoji: '🐧',
      title: '알프레도와 대화',
      desc: '도움이 필요하면 말해주세요',
      done: false
    }
  ];
  
  return React.createElement('div', {
    className: bgStyle + ' backdrop-blur-xl rounded-2xl p-6 mx-4'
  },
    // 헤더
    React.createElement('div', { className: 'text-center mb-6' },
      React.createElement('span', { className: 'text-5xl block mb-3' }, '🐧'),
      React.createElement('h2', {
        className: textPrimary + ' text-xl font-bold mb-1'
      }, '처음 오셨군요!'),
      React.createElement('p', {
        className: textSecondary + ' text-sm'
      }, '알프레도가 도와드릴게요')
    ),
    
    // 스텝들
    React.createElement('div', { className: 'space-y-3 mb-6' },
      steps.map(function(step, index) {
        return React.createElement('div', {
          key: index,
          className: (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') + 
            ' rounded-xl p-4 flex items-center gap-3 ' +
            (step.done ? 'opacity-60' : '')
        },
          React.createElement('span', { className: 'text-2xl' }, 
            step.done ? '✅' : step.emoji
          ),
          React.createElement('div', { className: 'flex-1' },
            React.createElement('p', {
              className: textPrimary + ' font-medium text-sm ' +
                (step.done ? 'line-through' : '')
            }, step.title),
            React.createElement('p', {
              className: textSecondary + ' text-xs'
            }, step.desc)
          )
        );
      })
    ),
    
    // 액션 버튼
    !isCalendarConnected && onConnectCalendar && React.createElement('button', {
      onClick: onConnectCalendar,
      className: 'w-full py-3 rounded-xl font-medium text-sm transition-all ' +
        'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white ' +
        'hover:shadow-lg active:scale-[0.98]'
    }, '🚀 시작하기'),
    
    isCalendarConnected && onGetStarted && React.createElement('button', {
      onClick: onGetStarted,
      className: 'w-full py-3 rounded-xl font-medium text-sm transition-all ' +
        'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white ' +
        'hover:shadow-lg active:scale-[0.98]'
    }, '첫 태스크 추가하기')
  );
};

// 휴식 유도 Empty State
var RestSuggestion = function(props) {
  var darkMode = props.darkMode;
  var onTakeBreak = props.onTakeBreak;
  
  var suggestions = [
    { emoji: '☕', text: '커피 한 잔 어때요?' },
    { emoji: '🚶', text: '잠깐 스트레칭 해볼까요?' },
    { emoji: '💧', text: '물 한 잔 마셔요' },
    { emoji: '🌿', text: '창밖을 잠깐 봐요' }
  ];
  
  var randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  
  var bgStyle = darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50';
  var textPrimary = darkMode ? 'text-emerald-300' : 'text-emerald-700';
  var textSecondary = darkMode ? 'text-emerald-400/70' : 'text-emerald-600/70';
  
  return React.createElement('div', {
    className: bgStyle + ' rounded-2xl p-5 text-center mx-4'
  },
    React.createElement('span', { className: 'text-3xl block mb-2' }, randomSuggestion.emoji),
    React.createElement('p', {
      className: textPrimary + ' font-medium'
    }, randomSuggestion.text),
    React.createElement('p', {
      className: textSecondary + ' text-sm mt-1'
    }, '모든 할 일을 끝냈어요! 🎉'),
    
    onTakeBreak && React.createElement('button', {
      onClick: onTakeBreak,
      className: 'mt-3 px-4 py-2 rounded-lg text-sm font-medium ' +
        (darkMode ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-100 text-emerald-700') +
        ' hover:opacity-80 active:scale-95 transition-all'
    }, '5분 휴식 타이머')
  );
};

export { 
  EmptyState, 
  EmptyStateMini, 
  FirstTimeGuide, 
  RestSuggestion,
  PRESETS 
};

export default EmptyState;
