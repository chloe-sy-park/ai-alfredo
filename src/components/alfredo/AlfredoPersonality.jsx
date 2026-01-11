import React, { useState, useMemo } from 'react';

// 🐧 새 코멘트 시스템 import
import {
  TIME_GREETINGS,
  DAY_COMMENTS,
  CALENDAR_COMMENTS,
  TASK_COMMENTS,
  ENERGY_COMMENTS,
  RECOVERY_COMMENTS,
  NUDGE_COMMENTS,
  ACHIEVEMENT_COMMENTS,
  BRIEFING_COMMENTS,
  HUMOR_COMMENTS,
  getRandomMessage as getRandomMsg,
  getTimeGreeting,
  getDayComment,
  getCalendarComment,
  getEnergyComment,
  getTaskCompleteComment,
  getStreakComment,
  maybeGetHumorComment,
  generateContextualComment,
  COMMENT_STATS,
} from '../../data/AlfredoComments.js';

// 🐧 알프레도 모드별 성격 정의
export var ALFREDO_PERSONALITIES = {
  focus: {
    id: 'focus',
    name: 'Focus 모드',
    emoji: '🔥',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    traits: ['집중', '효율', '간결'],
    tone: 'professional',
    // 레거시 메시지 (하위 호환용)
    greetings: [
      '보스, 집중 모드 ON!',
      '방해 요소 차단 완료. 시작하죠!',
      '오늘 목표에 집중합시다, 보스.',
      '효율 200% 모드 가동 중!'
    ],
    encouragements: [
      '좋아요, 보스! 이 페이스 유지!',
      '집중력 최고예요. 계속 가시죠!',
      '잘하고 있어요. 한 개 더!',
      '훌륭해요! 목표가 가까워지고 있어요.'
    ],
    taskComplete: [
      '완료! 다음으로 넘어가죠.',
      '하나 끝! 효율적이에요, 보스.',
      '체크! 다음 타겟은요?',
      '좋습니다. 계속 이어가요!'
    ],
    breakSuggestions: [
      '25분 집중 완료. 5분 휴식 어때요?',
      '잠깐 스트레칭 하고 다시 시작하죠.',
      '물 한 잔 마시고 이어가요!'
    ],
    endOfDay: [
      '오늘 집중력 좋았어요, 보스!',
      '생산적인 하루였습니다.',
      '목표 달성률 높아요. 잘했어요!'
    ]
  },
  
  care: {
    id: 'care',
    name: 'Care 모드',
    emoji: '💙',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    traits: ['따뜻함', '이해', '격려'],
    tone: 'warm',
    greetings: [
      '보스, 오늘 하루도 함께해요.',
      '천천히 가도 괜찮아요. 제가 옆에 있을게요.',
      '오늘은 부드럽게 시작해볼까요?',
      '보스의 페이스대로 가요. 응원할게요!'
    ],
    encouragements: [
      '잘하고 있어요, 보스. 정말이에요.',
      '한 걸음씩 가는 것도 대단한 거예요.',
      '힘들면 쉬어가도 돼요. 괜찮아요.',
      '보스가 자랑스러워요. 진심이에요.'
    ],
    taskComplete: [
      '와, 해냈어요! 정말 대단해요.',
      '보스, 하나 끝냈어요! 축하해요!',
      '훌륭해요. 스스로를 칭찬해주세요!',
      '멋져요! 이렇게 하나씩 해나가는 거예요.'
    ],
    breakSuggestions: [
      '잠깐 쉬어가요. 마음도 쉬어야 해요.',
      '따뜻한 차 한 잔 어때요?',
      '창밖 바라보며 심호흡 한 번요.',
      '눈 감고 1분만 쉬어볼까요?'
    ],
    endOfDay: [
      '오늘 하루도 수고했어요, 보스.',
      '완벽하지 않아도 괜찮아요. 충분히 잘했어요.',
      '내일도 함께할게요. 푹 쉬세요.',
      '오늘의 보스, 정말 최고였어요!'
    ],
    lowEnergy: [
      '에너지가 낮은 것 같아요. 무리하지 마요.',
      '오늘은 쉬어가는 날로 해도 괜찮아요.',
      '컨디션이 안 좋을 땐 쉬는 게 최고예요.'
    ],
    badMood: [
      '기분이 안 좋아 보여요. 괜찮아요?',
      '힘든 일 있으면 말해줘요. 들을게요.',
      '때로는 그냥 쉬어가는 것도 방법이에요.'
    ]
  },
  
  challenge: {
    id: 'challenge',
    name: 'Challenge 모드',
    emoji: '🚀',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    traits: ['도전', '성취', '열정'],
    tone: 'energetic',
    greetings: [
      '보스! 오늘도 도전하는 거죠?',
      '새로운 기록 세워볼까요!',
      '레벨업 준비 완료! 시작하죠!',
      '오늘의 챌린지, 준비됐어요!'
    ],
    encouragements: [
      '이 기세로 쭉 가요!',
      '보스 대단해요! 한계를 넘어서고 있어요!',
      '와! 이 속도면 신기록 가능해요!',
      '멈추지 마요! 거의 다 왔어요!'
    ],
    taskComplete: [
      '하나 클리어! 다음 챌린지 가즈아!',
      '경험치 획득! 레벨업 가까워요!',
      '완료! 연속 콤보 유지 중!',
      '미션 컴플리트! 다음은?!'
    ],
    breakSuggestions: [
      '에너지 충전 타임! 파워업하고 다시 시작!',
      '잠깐 쉬고 더 강해져서 돌아오죠!',
      '휴식도 전략이에요. 충전하고 가요!'
    ],
    endOfDay: [
      '오늘 대단했어요, 보스!',
      '기록 갱신! 내일은 더 높이!',
      '오늘의 성과, 축하해요! 내일도 도전!',
      '보스 최고! 레전드가 되고 있어요!'
    ],
    streakMessages: [
      '연속 3일! 불타오르고 있어요!',
      '일주일 연속! 대단해요!',
      '한 달 연속! 진정한 챌린저!'
    ],
    achievementUnlock: [
      '새 업적 달성! 보스 대단해요!',
      '레벨업! 성장하고 있어요!',
      '새 배지 획득! 컬렉션 확인해보세요!'
    ]
  }
};

// 기본 모드 (모드 미선택 시) - 이대표 스타일 적용
export var DEFAULT_PERSONALITY = {
  id: 'default',
  name: '기본',
  emoji: '🐧',
  color: 'text-[#A996FF]',
  bgColor: 'bg-[#A996FF]/10',
  traits: ['친절', '도움', '유머'],
  tone: 'friendly',
  greetings: [
    '보스, 오늘도 같이 해요.',
    '무엇부터 시작해볼까요?',
    '보스, 반가워요!',
    '준비되면 말해요.'
  ],
  encouragements: [
    '잘하고 있어요, 보스.',
    '이 페이스로 가요.',
    '보스라면 할 수 있어요.',
    '좋아요, 이 조자예요.'
  ],
  taskComplete: [
    '완료! 잘했어요, 보스.',
    '하나 끝! 역시.',
    '체크! 다음은?',
    '해냈네요.'
  ],
  breakSuggestions: [
    '잠깐 쉬어가요.',
    '휴식도 중요해요.',
    '스트레칭 한 번 어때요?'
  ],
  endOfDay: [
    '오늘도 수고했어요, 보스.',
    '좋은 하루였어요.',
    '내일도 함께해요.'
  ]
};

// ═══════════════════════════════════════════════════════════════
// 메시지 함수들 (새 시스템과 레거시 호환)
// ═══════════════════════════════════════════════════════════════

// 메시지 랜덤 선택 (레거시 호환)
export function getRandomMessage(messages) {
  if (!messages || messages.length === 0) return '';
  return messages[Math.floor(Math.random() * messages.length)];
}

// 컨텍스트 기반 메시지 선택 (새 시스템 활용)
export function getContextualMessage(personality, context) {
  var p = personality || DEFAULT_PERSONALITY;
  
  // 새 시스템 우선 사용
  if (context.useNewSystem !== false) {
    // 에너지 기반 메시지
    if (context.energy && context.energy <= 2) {
      return getEnergyComment(context.energy);
    }
    
    // 복귀 메시지
    if (context.isReturning) {
      return getRandomMsg(RECOVERY_COMMENTS.returnAfterBreak);
    }
    
    // 목표 미달성
    if (context.goalMissed) {
      return getRandomMsg(RECOVERY_COMMENTS.goalMissed);
    }
    
    // 스트릭 축하
    if (context.streak) {
      var streakMsg = getStreakComment(context.streak);
      if (streakMsg) return streakMsg;
    }
  }
  
  // 컨텍스트별 메시지 선택 (레거시 + 새 시스템 혼합)
  if (context.type === 'greeting') {
    // 새 시스템의 시간대별 인사 사용
    var hour = context.hour || new Date().getHours();
    return getTimeGreeting(hour);
  }
  
  if (context.type === 'encouragement') {
    return getRandomMessage(p.encouragements);
  }
  
  if (context.type === 'taskComplete') {
    // 새 시스템 사용
    return getTaskCompleteComment({
      completedCount: context.completedCount || 1,
      isFirstToday: context.isFirstToday,
      isBigTask: context.isBigTask,
      wasLongDeferred: context.wasLongDeferred,
    });
  }
  
  if (context.type === 'break') {
    return getRandomMessage(p.breakSuggestions);
  }
  
  if (context.type === 'endOfDay') {
    // 새 시스템의 저녁 브리핑 사용
    if (context.wasGoodDay) {
      return getRandomMsg(BRIEFING_COMMENTS.evening.good);
    }
    if (context.wasToughDay) {
      return getRandomMsg(BRIEFING_COMMENTS.evening.tough);
    }
    return getRandomMsg(BRIEFING_COMMENTS.evening.normal);
  }
  
  // Care 모드 특별 메시지
  if (p.id === 'care') {
    if (context.energy && context.energy <= 2 && p.lowEnergy) {
      return getRandomMessage(p.lowEnergy);
    }
    if (context.mood && context.mood <= 2 && p.badMood) {
      return getRandomMessage(p.badMood);
    }
  }
  
  // Challenge 모드 특별 메시지
  if (p.id === 'challenge') {
    if (context.streak && context.streak >= 3 && p.streakMessages) {
      if (context.streak >= 30) return p.streakMessages[2];
      if (context.streak >= 7) return p.streakMessages[1];
      return p.streakMessages[0];
    }
    if (context.achievement && p.achievementUnlock) {
      return getRandomMessage(p.achievementUnlock);
    }
  }
  
  // 기본: 새 시스템의 종합 컨텍스트 메시지
  return generateContextualComment(context);
}

// 시간대별 인사말 생성 (새 시스템 활용)
export function getTimeBasedGreeting(personality, hour) {
  // 새 시스템 우선 사용
  return getTimeGreeting(hour);
}

// ═══════════════════════════════════════════════════════════════
// 새로운 메시지 함수들 (AlfredoComments.js 래핑)
// ═══════════════════════════════════════════════════════════════

// 캘린더 상황별 메시지
export function getCalendarBasedMessage(context) {
  return getCalendarComment(context);
}

// 넛지 메시지
export function getNudgeMessage(situation) {
  if (NUDGE_COMMENTS[situation]) {
    return getRandomMsg(NUDGE_COMMENTS[situation]);
  }
  return null;
}

// 아침 브리핑 메시지
export function getMorningBriefing(context) {
  var intro = getRandomMsg(BRIEFING_COMMENTS.morning.intro);
  var situation = context.isBusy 
    ? getRandomMsg(BRIEFING_COMMENTS.morning.busy)
    : getRandomMsg(BRIEFING_COMMENTS.morning.light);
  var suggestion = getRandomMsg(BRIEFING_COMMENTS.morning.suggestion);
  
  return { intro, situation, suggestion };
}

// 저녁 브리핑 메시지
export function getEveningBriefing(context) {
  var intro = getRandomMsg(BRIEFING_COMMENTS.evening.intro);
  var dayReview;
  
  if (context.wasGoodDay) {
    dayReview = getRandomMsg(BRIEFING_COMMENTS.evening.good);
  } else if (context.wasToughDay) {
    dayReview = getRandomMsg(BRIEFING_COMMENTS.evening.tough);
  } else {
    dayReview = getRandomMsg(BRIEFING_COMMENTS.evening.normal);
  }
  
  var tomorrow = getRandomMsg(BRIEFING_COMMENTS.evening.tomorrow);
  
  return { intro, dayReview, tomorrow };
}

// 회복/케어 메시지
export function getRecoveryMessage(situation) {
  if (RECOVERY_COMMENTS[situation]) {
    return getRandomMsg(RECOVERY_COMMENTS[situation]);
  }
  return null;
}

// 유머 메시지 (10% 확률)
export function getHumorMessage() {
  return maybeGetHumorComment();
}

// ═══════════════════════════════════════════════════════════════
// 컴포넌트들
// ═══════════════════════════════════════════════════════════════

// 알프레도 메시지 컴포넌트
export var AlfredoMessage = function(props) {
  var message = props.message;
  var personality = props.personality || DEFAULT_PERSONALITY;
  var darkMode = props.darkMode;
  var showEmoji = props.showEmoji !== false;
  var size = props.size || 'medium'; // small, medium, large
  
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  var sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };
  
  return React.createElement('div', { className: 'flex items-start gap-2' },
    showEmoji && React.createElement('span', { className: size === 'small' ? 'text-lg' : 'text-xl' }, '🐧'),
    React.createElement('div', { 
      className: personality.bgColor + ' rounded-2xl rounded-tl-sm px-3 py-2'
    },
      React.createElement('p', { className: textPrimary + ' ' + sizeClasses[size] }, message)
    )
  );
};

// 알프레도 성격 선택기
export var PersonalitySelector = function(props) {
  var currentMode = props.currentMode;
  var onSelect = props.onSelect;
  var darkMode = props.darkMode;
  var compact = props.compact;
  
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var modes = Object.values(ALFREDO_PERSONALITIES);
  
  if (compact) {
    return React.createElement('div', { className: 'flex gap-2' },
      modes.map(function(mode) {
        var isActive = currentMode === mode.id;
        return React.createElement('button', {
          key: mode.id,
          onClick: function() { if (onSelect) onSelect(mode.id); },
          className: 'w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ' +
            (isActive ? mode.bgColor + ' ring-2 ring-' + mode.color.replace('text-', '') : (darkMode ? 'bg-gray-700' : 'bg-gray-100'))
        }, mode.emoji);
      })
    );
  }
  
  return React.createElement('div', { className: 'space-y-2' },
    modes.map(function(mode) {
      var isActive = currentMode === mode.id;
      return React.createElement('button', {
        key: mode.id,
        onClick: function() { if (onSelect) onSelect(mode.id); },
        className: 'w-full flex items-center gap-3 p-3 rounded-xl border transition-all ' +
          (isActive 
            ? mode.bgColor + ' border-2 ' + mode.color.replace('text-', 'border-')
            : 'border ' + borderColor + ' ' + (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'))
      },
        React.createElement('span', { className: 'text-2xl' }, mode.emoji),
        React.createElement('div', { className: 'flex-1 text-left' },
          React.createElement('p', { className: textPrimary + ' font-medium' }, mode.name),
          React.createElement('p', { className: textSecondary + ' text-xs' }, mode.traits.join(' · '))
        ),
        isActive && React.createElement('span', { className: mode.color + ' text-sm' }, '✓')
      );
    })
  );
};

// 훅: 현재 성격 가져오기
export function usePersonality(modeId) {
  return useMemo(function() {
    if (!modeId) return DEFAULT_PERSONALITY;
    return ALFREDO_PERSONALITIES[modeId] || DEFAULT_PERSONALITY;
  }, [modeId]);
}

// ═══════════════════════════════════════════════════════════════
// 새 코멘트 시스템 Re-export
// ═══════════════════════════════════════════════════════════════

export {
  TIME_GREETINGS,
  DAY_COMMENTS,
  CALENDAR_COMMENTS,
  TASK_COMMENTS,
  ENERGY_COMMENTS,
  RECOVERY_COMMENTS,
  NUDGE_COMMENTS,
  ACHIEVEMENT_COMMENTS,
  BRIEFING_COMMENTS,
  HUMOR_COMMENTS,
  COMMENT_STATS,
  getTimeGreeting,
  getDayComment,
  getCalendarComment,
  getEnergyComment,
  getTaskCompleteComment,
  getStreakComment,
  maybeGetHumorComment,
  generateContextualComment,
};

export default {
  // 레거시
  ALFREDO_PERSONALITIES: ALFREDO_PERSONALITIES,
  DEFAULT_PERSONALITY: DEFAULT_PERSONALITY,
  getRandomMessage: getRandomMessage,
  getContextualMessage: getContextualMessage,
  getTimeBasedGreeting: getTimeBasedGreeting,
  AlfredoMessage: AlfredoMessage,
  PersonalitySelector: PersonalitySelector,
  usePersonality: usePersonality,
  
  // 새 시스템
  getCalendarBasedMessage: getCalendarBasedMessage,
  getNudgeMessage: getNudgeMessage,
  getMorningBriefing: getMorningBriefing,
  getEveningBriefing: getEveningBriefing,
  getRecoveryMessage: getRecoveryMessage,
  getHumorMessage: getHumorMessage,
  
  // 새 코멘트 데이터
  TIME_GREETINGS: TIME_GREETINGS,
  DAY_COMMENTS: DAY_COMMENTS,
  CALENDAR_COMMENTS: CALENDAR_COMMENTS,
  TASK_COMMENTS: TASK_COMMENTS,
  ENERGY_COMMENTS: ENERGY_COMMENTS,
  RECOVERY_COMMENTS: RECOVERY_COMMENTS,
  NUDGE_COMMENTS: NUDGE_COMMENTS,
  ACHIEVEMENT_COMMENTS: ACHIEVEMENT_COMMENTS,
  BRIEFING_COMMENTS: BRIEFING_COMMENTS,
  HUMOR_COMMENTS: HUMOR_COMMENTS,
  COMMENT_STATS: COMMENT_STATS,
};
