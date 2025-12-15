import React from 'react';
import { Plus, Calendar, Heart, CheckCircle2, Inbox, Target, Sparkles } from 'lucide-react';

// 알프레도 Empty State 변형들
var EMPTY_STATE_VARIANTS = {
  // 할 일 없음
  noTasks: {
    emoji: '📝',
    alfredoMood: '🐧',
    title: '아직 할 일이 없어요',
    message: '새로운 할 일을 추가해볼까요?',
    suggestion: '오늘 꼭 해야 할 일 하나만 적어보세요!',
    actionLabel: '할 일 추가',
    actionIcon: Plus,
    color: 'purple'
  },
  
  // 모든 할 일 완료
  allDone: {
    emoji: '🎉',
    alfredoMood: '🐧✨',
    title: '오늘 할 일 끝!',
    message: '대단해요, Boss! 모든 일을 해치웠어요!',
    suggestion: '잠깐 쉬거나, 내일 할 일을 미리 준비해볼까요?',
    actionLabel: '내일 준비하기',
    actionIcon: Calendar,
    color: 'emerald'
  },
  
  // 오늘 일정 없음
  noEvents: {
    emoji: '📅',
    alfredoMood: '🐧',
    title: '오늘은 일정이 없어요',
    message: '여유로운 하루네요!',
    suggestion: '집중해서 할 일을 처리하기 좋은 날이에요',
    actionLabel: '일정 추가',
    actionIcon: Calendar,
    color: 'blue'
  },
  
  // 루틴 없음
  noRoutines: {
    emoji: '🔄',
    alfredoMood: '🐧',
    title: '아직 루틴이 없어요',
    message: '좋은 습관을 만들어볼까요?',
    suggestion: '물 마시기, 스트레칭 같은 작은 것부터 시작해요',
    actionLabel: '루틴 추가',
    actionIcon: Plus,
    color: 'teal'
  },
  
  // 인박스 비어있음
  emptyInbox: {
    emoji: '📭',
    alfredoMood: '🐧👍',
    title: '인박스가 깨끗해요!',
    message: '처리할 항목이 없어요',
    suggestion: '새로운 아이디어가 생기면 언제든 추가하세요',
    actionLabel: '새 항목 추가',
    actionIcon: Inbox,
    color: 'purple'
  },
  
  // 검색 결과 없음
  noResults: {
    emoji: '🔍',
    alfredoMood: '🐧🤔',
    title: '검색 결과가 없어요',
    message: '다른 키워드로 검색해볼까요?',
    suggestion: null,
    actionLabel: null,
    actionIcon: null,
    color: 'gray'
  },
  
  // 관계 챙기기 없음
  noRelationships: {
    emoji: '💝',
    alfredoMood: '🐧',
    title: '연락할 사람을 추가해보세요',
    message: '소중한 사람들과의 연락을 챙겨드릴게요',
    suggestion: '가족, 친구, 동료 누구든 좋아요!',
    actionLabel: '사람 추가',
    actionIcon: Heart,
    color: 'pink'
  },
  
  // 프로젝트 없음
  noProjects: {
    emoji: '📁',
    alfredoMood: '🐧',
    title: '아직 프로젝트가 없어요',
    message: '할 일을 프로젝트로 정리해보세요',
    suggestion: '비슷한 일들을 묶으면 관리하기 쉬워요',
    actionLabel: '프로젝트 만들기',
    actionIcon: Plus,
    color: 'indigo'
  },
  
  // 첫 사용자
  welcome: {
    emoji: '👋',
    alfredoMood: '🐧✨',
    title: '반가워요, Boss!',
    message: '저는 알프레도예요. 하루를 함께 관리해드릴게요!',
    suggestion: '먼저 오늘 할 일을 추가해볼까요?',
    actionLabel: '시작하기',
    actionIcon: Sparkles,
    color: 'purple'
  },
  
  // 완료된 항목 없음
  noCompleted: {
    emoji: '✅',
    alfredoMood: '🐧💪',
    title: '아직 완료한 항목이 없어요',
    message: '첫 번째 할 일을 완료해보세요!',
    suggestion: '작은 것부터 시작하면 탄력이 붙어요',
    actionLabel: '할 일 보기',
    actionIcon: Target,
    color: 'emerald'
  }
};

// 색상 매핑
var COLOR_CLASSES = {
  purple: {
    bg: 'bg-[#F5F3FF]',
    icon: 'bg-gradient-to-br from-[#A996FF] to-[#8B7CF7]',
    button: 'bg-[#A996FF] hover:bg-[#8B7CF7]',
    text: 'text-[#7C3AED]'
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    button: 'bg-emerald-500 hover:bg-emerald-600',
    text: 'text-emerald-600'
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-gradient-to-br from-blue-400 to-blue-600',
    button: 'bg-blue-500 hover:bg-blue-600',
    text: 'text-blue-600'
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'bg-gradient-to-br from-teal-400 to-teal-600',
    button: 'bg-teal-500 hover:bg-teal-600',
    text: 'text-teal-600'
  },
  pink: {
    bg: 'bg-pink-50',
    icon: 'bg-gradient-to-br from-pink-400 to-pink-600',
    button: 'bg-pink-500 hover:bg-pink-600',
    text: 'text-pink-600'
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
    button: 'bg-indigo-500 hover:bg-indigo-600',
    text: 'text-indigo-600'
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'bg-gradient-to-br from-gray-400 to-gray-600',
    button: 'bg-gray-500 hover:bg-gray-600',
    text: 'text-gray-600'
  }
};

// 메인 컴포넌트
var AlfredoEmptyState = function(props) {
  var variant = props.variant || 'noTasks';
  var darkMode = props.darkMode;
  var onAction = props.onAction;
  var customTitle = props.title;
  var customMessage = props.message;
  var customActionLabel = props.actionLabel;
  var compact = props.compact;
  var showSuggestion = props.showSuggestion !== false;
  var showAction = props.showAction !== false;
  
  var config = EMPTY_STATE_VARIANTS[variant] || EMPTY_STATE_VARIANTS.noTasks;
  var colors = COLOR_CLASSES[config.color] || COLOR_CLASSES.purple;
  
  var title = customTitle || config.title;
  var message = customMessage || config.message;
  var actionLabel = customActionLabel || config.actionLabel;
  var ActionIcon = config.actionIcon;
  
  // 다크모드 스타일
  var containerBg = darkMode ? 'bg-gray-800/50' : colors.bg;
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var suggestionBg = darkMode ? 'bg-gray-700/50' : 'bg-white/80';
  
  if (compact) {
    // 컴팩트 버전
    return React.createElement('div', {
      className: containerBg + ' rounded-xl p-4 text-center'
    },
      React.createElement('div', { className: 'flex items-center justify-center gap-2 mb-2' },
        React.createElement('span', { className: 'text-2xl' }, config.emoji),
        React.createElement('span', { className: 'text-lg' }, config.alfredoMood)
      ),
      React.createElement('p', { className: textPrimary + ' font-medium text-sm' }, title),
      React.createElement('p', { className: textSecondary + ' text-xs mt-1' }, message),
      showAction && actionLabel && onAction && React.createElement('button', {
        onClick: onAction,
        className: colors.button + ' text-white px-4 py-2 rounded-lg text-xs font-medium mt-3 inline-flex items-center gap-1.5 transition-all'
      },
        ActionIcon && React.createElement(ActionIcon, { size: 14 }),
        actionLabel
      )
    );
  }
  
  // 풀 버전
  return React.createElement('div', {
    className: containerBg + ' rounded-2xl p-6 text-center'
  },
    // 아이콘 영역
    React.createElement('div', { className: 'relative inline-block mb-4' },
      React.createElement('div', {
        className: colors.icon + ' w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg'
      },
        React.createElement('span', { className: 'text-4xl' }, config.emoji)
      ),
      // 알프레도 펭귄 (코너에 작게)
      React.createElement('div', {
        className: 'absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md'
      },
        React.createElement('span', { className: 'text-lg' }, config.alfredoMood)
      )
    ),
    
    // 텍스트
    React.createElement('h3', { className: textPrimary + ' font-bold text-lg mb-1' }, title),
    React.createElement('p', { className: textSecondary + ' text-sm' }, message),
    
    // 제안 (말풍선 스타일)
    showSuggestion && config.suggestion && React.createElement('div', {
      className: suggestionBg + ' rounded-xl p-3 mt-4 mx-auto max-w-xs backdrop-blur-sm border ' +
        (darkMode ? 'border-gray-600' : 'border-gray-100')
    },
      React.createElement('div', { className: 'flex items-start gap-2' },
        React.createElement('span', { className: 'text-sm' }, '🐧'),
        React.createElement('p', { className: textSecondary + ' text-xs text-left' },
          '"' + config.suggestion + '"'
        )
      )
    ),
    
    // 액션 버튼
    showAction && actionLabel && onAction && React.createElement('button', {
      onClick: onAction,
      className: colors.button + ' text-white px-6 py-3 rounded-xl font-medium mt-4 inline-flex items-center gap-2 transition-all shadow-lg active:scale-95'
    },
      ActionIcon && React.createElement(ActionIcon, { size: 18 }),
      actionLabel
    ),
    
    // 템플릿 바로가기 (welcome 변형에서)
    variant === 'welcome' && React.createElement('div', { className: 'mt-6' },
      React.createElement('p', { className: textSecondary + ' text-xs mb-3' }, '빠른 시작 템플릿'),
      React.createElement('div', { className: 'flex flex-wrap justify-center gap-2' },
        ['📧 이메일 확인', '💪 운동하기', '📖 독서 30분', '💊 약 챙기기'].map(function(template, idx) {
          return React.createElement('button', {
            key: idx,
            onClick: function() { if (onAction) onAction(template); },
            className: (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50') +
              ' px-3 py-1.5 rounded-lg text-xs font-medium ' + textSecondary +
              ' border ' + (darkMode ? 'border-gray-600' : 'border-gray-200') +
              ' transition-all'
          }, template);
        })
      )
    )
  );
};

// 빠른 사용을 위한 사전 정의 컴포넌트들
var NoTasksEmpty = function(props) {
  return React.createElement(AlfredoEmptyState, Object.assign({}, props, { variant: 'noTasks' }));
};

var AllDoneEmpty = function(props) {
  return React.createElement(AlfredoEmptyState, Object.assign({}, props, { variant: 'allDone' }));
};

var NoEventsEmpty = function(props) {
  return React.createElement(AlfredoEmptyState, Object.assign({}, props, { variant: 'noEvents' }));
};

var NoRoutinesEmpty = function(props) {
  return React.createElement(AlfredoEmptyState, Object.assign({}, props, { variant: 'noRoutines' }));
};

var EmptyInboxEmpty = function(props) {
  return React.createElement(AlfredoEmptyState, Object.assign({}, props, { variant: 'emptyInbox' }));
};

var NoResultsEmpty = function(props) {
  return React.createElement(AlfredoEmptyState, Object.assign({}, props, { variant: 'noResults' }));
};

var WelcomeEmpty = function(props) {
  return React.createElement(AlfredoEmptyState, Object.assign({}, props, { variant: 'welcome' }));
};

export {
  AlfredoEmptyState,
  NoTasksEmpty,
  AllDoneEmpty,
  NoEventsEmpty,
  NoRoutinesEmpty,
  EmptyInboxEmpty,
  NoResultsEmpty,
  WelcomeEmpty,
  EMPTY_STATE_VARIANTS
};

export default AlfredoEmptyState;
