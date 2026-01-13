import React, { useState, useMemo } from 'react';
import { Heart, Sparkles, Moon, Sun, Coffee, AlertCircle, TrendingDown, RefreshCw, Brain } from 'lucide-react';

/**
 * 💜 FailureCareSystem - 실패 케어 시스템
 * careType별 맞춤 케어 메시지 제공
 * 
 * careTypes:
 * - celebration: 80%+ 완료 (축하)
 * - encouragement: 50-79% 완료 (격려)
 * - gentle: 20-49% 완료 (부드러운 위로)
 * - compassion: 0-19% 완료 (깊은 공감)
 */

// 케어 타입별 메시지
var CARE_MESSAGES = {
  celebration: {
    emoji: '🎉',
    title: '오늘 정말 잘했어요!',
    messages: [
      '목표의 대부분을 달성했네요. 스스로를 칭찬해주세요!',
      '꾸준히 해내고 있어요. 내일도 이 페이스 유지해봐요.',
      '오늘 하루 고생 많았어요. 푹 쉬세요!'
    ],
    color: 'emerald',
    icon: Sparkles
  },
  encouragement: {
    emoji: '💪',
    title: '절반 이상 해냈어요!',
    messages: [
      '완벽하지 않아도 괜찮아요. 꾸준함이 중요해요.',
      '오늘 한 것들에 집중해보세요. 분명 의미있는 진전이에요.',
      '내일 마저 하면 돼요. 오늘은 여기까지!'
    ],
    color: 'blue',
    icon: Sun
  },
  gentle: {
    emoji: '🤗',
    title: '오늘 하루 어떠셨어요?',
    messages: [
      '힘든 날도 있는 거예요. 그래도 시도한 것만으로 대단해요.',
      '모든 날이 생산적일 필요는 없어요.',
      '내일은 새로운 날이에요. 오늘은 쉬어가세요.'
    ],
    color: 'amber',
    icon: Coffee
  },
  compassion: {
    emoji: '💜',
    title: '괜찮아요, 그런 날도 있어요',
    messages: [
      'ADHD와 함께 사는 건 쉽지 않아요. 당신은 충분히 잘하고 있어요.',
      '오늘 하루를 버텨낸 것만으로도 의미있어요.',
      '자신에게 너무 엄격하지 마세요. 내일은 또 다른 기회예요.'
    ],
    color: 'purple',
    icon: Heart
  }
};

// 케어 카드 컴포넌트
export var FailureCareCard = function(props) {
  var careType = props.careType || 'gentle';
  var completedCount = props.completedCount || 0;
  var totalCount = props.totalCount || 0;
  var onClose = props.onClose;
  var darkMode = props.darkMode;
  
  var care = CARE_MESSAGES[careType] || CARE_MESSAGES.gentle;
  var Icon = care.icon;
  
  // 랜덤 메시지 선택
  var message = useMemo(function() {
    var idx = Math.floor(Math.random() * care.messages.length);
    return care.messages[idx];
  }, [careType]);
  
  var colorClasses = {
    emerald: {
      bg: darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50',
      border: 'border-emerald-500/30',
      text: 'text-emerald-600',
      icon: 'text-emerald-500'
    },
    blue: {
      bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-50',
      border: 'border-blue-500/30',
      text: 'text-blue-600',
      icon: 'text-blue-500'
    },
    amber: {
      bg: darkMode ? 'bg-amber-900/30' : 'bg-amber-50',
      border: 'border-amber-500/30',
      text: 'text-amber-600',
      icon: 'text-amber-500'
    },
    purple: {
      bg: darkMode ? 'bg-purple-900/30' : 'bg-purple-50',
      border: 'border-purple-500/30',
      text: 'text-purple-600',
      icon: 'text-purple-500'
    }
  };
  
  var colors = colorClasses[care.color] || colorClasses.purple;
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', {
    className: colors.bg + ' border ' + colors.border + ' rounded-2xl p-5'
  },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('div', { className: 'w-12 h-12 rounded-xl ' + colors.bg + ' flex items-center justify-center' },
          React.createElement(Icon, { size: 24, className: colors.icon })
        ),
        React.createElement('div', null,
          React.createElement('span', { className: 'text-2xl mr-2' }, care.emoji),
          React.createElement('span', { className: 'font-bold ' + textPrimary }, care.title)
        )
      ),
      onClose && React.createElement('button', {
        onClick: onClose,
        className: textSecondary + ' hover:' + textPrimary
      }, '✕')
    ),
    
    // 메시지
    React.createElement('p', { className: textPrimary + ' mb-4 leading-relaxed' }, message),
    
    // 통계
    totalCount > 0 && React.createElement('div', {
      className: 'flex items-center gap-4 text-sm ' + textSecondary
    },
      React.createElement('span', null, '오늘 완료: ', completedCount, '/', totalCount),
      React.createElement('span', null, '•'),
      React.createElement('span', null, Math.round((completedCount / totalCount) * 100), '% 달성')
    )
  );
};

// 실패 패턴 분석 카드
export var FailurePatternCard = function(props) {
  var patterns = props.patterns || [];
  var darkMode = props.darkMode;
  var onDismiss = props.onDismiss;
  
  if (!patterns || patterns.length === 0) return null;
  
  var bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', { className: bgCard + ' rounded-2xl p-4 shadow-sm' },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Brain, { size: 18, className: 'text-purple-500' }),
        React.createElement('span', { className: 'font-bold ' + textPrimary }, '실패 패턴 분석')
      ),
      onDismiss && React.createElement('button', {
        onClick: onDismiss,
        className: 'text-xs ' + textSecondary
      }, '닫기')
    ),
    
    // 패턴 목록
    React.createElement('div', { className: 'space-y-3' },
      patterns.map(function(pattern, i) {
        return React.createElement('div', {
          key: i,
          className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50')
        },
          React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
            React.createElement('span', null, pattern.emoji || '📊'),
            React.createElement('span', { className: 'font-medium ' + textPrimary }, pattern.title)
          ),
          React.createElement('p', { className: 'text-sm ' + textSecondary }, pattern.description),
          pattern.suggestion && React.createElement('p', {
            className: 'text-sm text-purple-500 mt-1'
          }, '💡 ', pattern.suggestion)
        );
      })
    )
  );
};

// 회복 제안 카드
export var RecoverySuggestionCard = function(props) {
  var careType = props.careType || 'gentle';
  var darkMode = props.darkMode;
  var onAction = props.onAction;
  
  var suggestions = {
    celebration: [
      { icon: '🎁', text: '자신에게 작은 보상을 주세요', action: 'reward' },
      { icon: '📝', text: '오늘의 성과를 기록해보세요', action: 'journal' }
    ],
    encouragement: [
      { icon: '🎯', text: '내일 집중할 3가지만 정해보세요', action: 'plan' },
      { icon: '☕', text: '잠시 휴식을 취하세요', action: 'break' }
    ],
    gentle: [
      { icon: '🌙', text: '일찍 잠자리에 드는 건 어때요?', action: 'sleep' },
      { icon: '🚶', text: '짧은 산책이 도움될 거예요', action: 'walk' }
    ],
    compassion: [
      { icon: '💭', text: '알프레도와 대화해보세요', action: 'chat' },
      { icon: '🧘', text: '깊은 호흡을 해보세요', action: 'breathe' },
      { icon: '📞', text: '가까운 사람에게 연락해보세요', action: 'connect' }
    ]
  };
  
  var items = suggestions[careType] || suggestions.gentle;
  var bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  
  return React.createElement('div', { className: bgCard + ' rounded-2xl p-4 shadow-sm' },
    React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
      React.createElement(RefreshCw, { size: 18, className: 'text-[#A996FF]' }),
      React.createElement('span', { className: 'font-bold ' + textPrimary }, '회복 제안')
    ),
    React.createElement('div', { className: 'space-y-2' },
      items.map(function(item, i) {
        return React.createElement('button', {
          key: i,
          onClick: function() { onAction && onAction(item.action); },
          className: 'w-full p-3 rounded-xl text-left transition-colors ' +
            (darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100')
        },
          React.createElement('span', { className: 'mr-2' }, item.icon),
          React.createElement('span', { className: textPrimary }, item.text)
        );
      })
    )
  );
};

export default FailureCareCard;
