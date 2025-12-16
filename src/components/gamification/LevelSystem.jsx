import React, { useState, useEffect, useMemo } from 'react';
import { Star, Zap, Trophy, Gift, ChevronRight, Sparkles, Target, Flame, Award } from 'lucide-react';

// localStorage 키
var STORAGE_KEY = 'lifebutler_gamification';

// 레벨 데이터
var LEVELS = [
  { level: 1, title: '🐣 새싹 버틀러', minXp: 0, maxXp: 100, perks: '기본 기능' },
  { level: 2, title: '🌱 성장하는 버틀러', minXp: 100, maxXp: 250, perks: '커스텀 테마 잠금해제' },
  { level: 3, title: '🌿 능숙한 버틀러', minXp: 250, maxXp: 500, perks: '알프레도 표정 추가' },
  { level: 4, title: '🌳 베테랑 버틀러', minXp: 500, maxXp: 850, perks: '특별 배지' },
  { level: 5, title: '⭐ 스타 버틀러', minXp: 850, maxXp: 1300, perks: '프리미엄 위젯' },
  { level: 6, title: '🌟 슈퍼 버틀러', minXp: 1300, maxXp: 1850, perks: '커스텀 알프레도' },
  { level: 7, title: '💫 마스터 버틀러', minXp: 1850, maxXp: 2500, perks: '모든 기능 해제' },
  { level: 8, title: '🏆 레전드 버틀러', minXp: 2500, maxXp: 3500, perks: '레전드 배지' },
  { level: 9, title: '👑 킹 버틀러', minXp: 3500, maxXp: 5000, perks: '황금 테마' },
  { level: 10, title: '🦸 울트라 버틀러', minXp: 5000, maxXp: 999999, perks: '전설이 되다' }
];

// XP 보상 정의
var XP_REWARDS = {
  taskComplete: 10,
  taskCompleteHigh: 20,
  focusSession: 15,
  focusSessionLong: 25, // 25분 이상
  streakDay: 30,
  streakWeek: 100,
  questComplete: 50,
  challengeComplete: 200,
  perfectDay: 50, // 모든 할일 완료
  morningRoutine: 20,
  eveningReview: 15,
  moodLog: 5,
  waterGoal: 10
};

// 게임 데이터 로드
function loadGameData() {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load game data:', e);
  }
  return {
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    tasksCompleted: 0,
    focusMinutes: 0,
    questsCompleted: 0,
    badges: [],
    lastActiveDate: null,
    xpHistory: [] // { date, amount, reason }
  };
}

// 게임 데이터 저장
function saveGameData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save game data:', e);
  }
}

// 레벨 계산
function getLevelInfo(totalXp) {
  for (var i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].minXp) {
      var level = LEVELS[i];
      var nextLevel = LEVELS[i + 1] || level;
      var xpInLevel = totalXp - level.minXp;
      var xpForLevel = level.maxXp - level.minXp;
      var progress = Math.min(100, (xpInLevel / xpForLevel) * 100);
      
      return {
        level: level.level,
        title: level.title,
        currentXp: totalXp,
        xpInLevel: xpInLevel,
        xpForLevel: xpForLevel,
        progress: progress,
        nextLevel: nextLevel,
        perks: level.perks
      };
    }
  }
  return {
    level: 1,
    title: LEVELS[0].title,
    currentXp: 0,
    xpInLevel: 0,
    xpForLevel: 100,
    progress: 0,
    nextLevel: LEVELS[1],
    perks: LEVELS[0].perks
  };
}

// 🎮 레벨 & XP 바 컴포넌트
export var LevelXpBar = function(props) {
  var darkMode = props.darkMode;
  var totalXp = props.totalXp || 0;
  var showDetails = props.showDetails;
  var onClick = props.onClick;
  var compact = props.compact;
  
  var levelInfo = getLevelInfo(totalXp);
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  if (compact) {
    return React.createElement('button', {
      onClick: onClick,
      className: 'flex items-center gap-2 px-3 py-1.5 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-white') + ' border ' + borderColor
    },
      React.createElement('span', { className: 'text-sm' }, levelInfo.title.split(' ')[0]),
      React.createElement('span', { className: textSecondary + ' text-xs' }, 'Lv.' + levelInfo.level),
      React.createElement('div', { className: 'w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden' },
        React.createElement('div', { 
          className: 'h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all',
          style: { width: levelInfo.progress + '%' }
        })
      )
    );
  }
  
  return React.createElement('div', { 
    className: cardBg + ' rounded-2xl p-4 border ' + borderColor + ' ' + (onClick ? 'cursor-pointer hover:border-[#A996FF]/50' : ''),
    onClick: onClick
  },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: 'text-2xl' }, levelInfo.title.split(' ')[0]),
        React.createElement('div', null,
          React.createElement('p', { className: textPrimary + ' font-bold' }, levelInfo.title.split(' ').slice(1).join(' ')),
          React.createElement('p', { className: textSecondary + ' text-xs' }, 'Level ' + levelInfo.level)
        )
      ),
      React.createElement('div', { className: 'text-right' },
        React.createElement('p', { className: 'text-[#A996FF] font-bold text-lg' }, totalXp.toLocaleString()),
        React.createElement('p', { className: textSecondary + ' text-xs' }, 'Total XP')
      )
    ),
    
    // XP 바
    React.createElement('div', { className: 'mb-2' },
      React.createElement('div', { className: 'flex justify-between text-xs mb-1' },
        React.createElement('span', { className: textSecondary }, levelInfo.xpInLevel + ' / ' + levelInfo.xpForLevel + ' XP'),
        React.createElement('span', { className: 'text-[#A996FF]' }, Math.round(levelInfo.progress) + '%')
      ),
      React.createElement('div', { className: 'h-3 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' overflow-hidden' },
        React.createElement('div', { 
          className: 'h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all duration-500',
          style: { width: levelInfo.progress + '%' }
        })
      )
    ),
    
    // 다음 레벨 정보
    showDetails && levelInfo.nextLevel && React.createElement('div', { 
      className: 'flex items-center justify-between mt-3 pt-3 border-t ' + (darkMode ? 'border-gray-700' : 'border-gray-100')
    },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Gift, { size: 16, className: 'text-amber-400' }),
        React.createElement('span', { className: textSecondary + ' text-sm' }, '다음 레벨 보상: ' + levelInfo.nextLevel.perks)
      ),
      onClick && React.createElement(ChevronRight, { size: 16, className: textSecondary })
    )
  );
};

// 💫 XP 획득 알림 토스트
export var XpGainToast = function(props) {
  var amount = props.amount;
  var reason = props.reason;
  var isVisible = props.isVisible;
  var onClose = props.onClose;
  
  useEffect(function() {
    if (isVisible) {
      var timer = setTimeout(function() {
        if (onClose) onClose();
      }, 2500);
      return function() { clearTimeout(timer); };
    }
  }, [isVisible, onClose]);
  
  if (!isVisible) return null;
  
  return React.createElement('div', {
    className: 'fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce'
  },
    React.createElement('div', {
      className: 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2'
    },
      React.createElement(Sparkles, { size: 18 }),
      React.createElement('span', { className: 'font-bold' }, '+' + amount + ' XP'),
      React.createElement('span', { className: 'text-white/80 text-sm' }, reason)
    )
  );
};

// 🎯 레벨업 모달
export var LevelUpModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var darkMode = props.darkMode;
  var newLevel = props.newLevel;
  var levelInfo = props.levelInfo;
  
  if (!isOpen || !levelInfo) return null;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: cardBg + ' rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl',
      onClick: function(e) { e.stopPropagation(); }
    },
      // 축하 아이콘
      React.createElement('div', { className: 'text-6xl mb-4 animate-bounce' }, '🎉'),
      
      // 레벨업 텍스트
      React.createElement('h2', { className: 'text-[#A996FF] text-2xl font-bold mb-2' }, 'LEVEL UP!'),
      
      // 새 레벨
      React.createElement('div', { className: 'text-5xl my-4' }, levelInfo.title.split(' ')[0]),
      React.createElement('p', { className: textPrimary + ' text-xl font-bold mb-1' }, levelInfo.title.split(' ').slice(1).join(' ')),
      React.createElement('p', { className: textSecondary + ' mb-4' }, 'Level ' + newLevel),
      
      // 보상
      React.createElement('div', { className: 'bg-amber-500/20 text-amber-500 px-4 py-3 rounded-xl mb-6' },
        React.createElement('div', { className: 'flex items-center justify-center gap-2 mb-1' },
          React.createElement(Gift, { size: 18 }),
          React.createElement('span', { className: 'font-bold' }, '새로운 보상!')
        ),
        React.createElement('p', { className: 'text-sm' }, levelInfo.perks)
      ),
      
      // 확인 버튼
      React.createElement('button', {
        onClick: onClose,
        className: 'w-full py-3 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-bold'
      }, '멋져요! 🎊')
    )
  );
};

// 📊 상세 통계 카드
export var GameStatsCard = function(props) {
  var darkMode = props.darkMode;
  var gameData = props.gameData || {};
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var stats = [
    { icon: '✅', label: '완료한 할일', value: gameData.tasksCompleted || 0 },
    { icon: '🎯', label: '집중 시간', value: (gameData.focusMinutes || 0) + '분' },
    { icon: '🔥', label: '현재 스트릭', value: (gameData.currentStreak || 0) + '일' },
    { icon: '🏆', label: '최장 스트릭', value: (gameData.longestStreak || 0) + '일' },
    { icon: '⭐', label: '완료한 퀘스트', value: gameData.questsCompleted || 0 },
    { icon: '🏅', label: '획득한 배지', value: (gameData.badges || []).length }
  ];
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    React.createElement('h3', { className: textPrimary + ' font-bold mb-4 flex items-center gap-2' },
      React.createElement(Trophy, { size: 18, className: 'text-amber-400' }),
      '나의 기록'
    ),
    React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
      stats.map(function(stat, idx) {
        return React.createElement('div', {
          key: idx,
          className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50')
        },
          React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
            React.createElement('span', null, stat.icon),
            React.createElement('span', { className: textSecondary + ' text-xs' }, stat.label)
          ),
          React.createElement('p', { className: textPrimary + ' text-lg font-bold' }, stat.value)
        );
      })
    )
  );
};

// 🎮 게임 훅
export function useGamification() {
  var gameDataState = useState(loadGameData);
  var gameData = gameDataState[0];
  var setGameData = gameDataState[1];
  
  var xpToastState = useState({ visible: false, amount: 0, reason: '' });
  var xpToast = xpToastState[0];
  var setXpToast = xpToastState[1];
  
  var levelUpState = useState({ open: false, level: 0, info: null });
  var levelUp = levelUpState[0];
  var setLevelUp = levelUpState[1];
  
  // 데이터 저장
  useEffect(function() {
    saveGameData(gameData);
  }, [gameData]);
  
  // XP 추가
  var addXp = function(amount, reason) {
    var oldLevel = getLevelInfo(gameData.totalXp).level;
    
    setGameData(function(prev) {
      var newXp = prev.totalXp + amount;
      var newHistory = prev.xpHistory.concat([{
        date: new Date().toISOString(),
        amount: amount,
        reason: reason
      }]).slice(-50); // 최근 50개만 유지
      
      return Object.assign({}, prev, {
        totalXp: newXp,
        xpHistory: newHistory
      });
    });
    
    // XP 토스트 표시
    setXpToast({ visible: true, amount: amount, reason: reason });
    
    // 레벨업 체크
    var newLevel = getLevelInfo(gameData.totalXp + amount).level;
    if (newLevel > oldLevel) {
      setTimeout(function() {
        var levelInfo = LEVELS.find(function(l) { return l.level === newLevel; });
        setLevelUp({ open: true, level: newLevel, info: levelInfo });
      }, 1000);
    }
  };
  
  // 태스크 완료
  var onTaskComplete = function(task) {
    var xp = task && task.priority === 'high' ? XP_REWARDS.taskCompleteHigh : XP_REWARDS.taskComplete;
    addXp(xp, '할일 완료');
    setGameData(function(prev) {
      return Object.assign({}, prev, { tasksCompleted: prev.tasksCompleted + 1 });
    });
  };
  
  // 집중 세션 완료
  var onFocusComplete = function(minutes) {
    var xp = minutes >= 25 ? XP_REWARDS.focusSessionLong : XP_REWARDS.focusSession;
    addXp(xp, '집중 완료');
    setGameData(function(prev) {
      return Object.assign({}, prev, { focusMinutes: prev.focusMinutes + minutes });
    });
  };
  
  // 스트릭 업데이트
  var updateStreak = function() {
    var today = new Date().toDateString();
    if (gameData.lastActiveDate !== today) {
      setGameData(function(prev) {
        var newStreak = prev.currentStreak + 1;
        var xp = newStreak % 7 === 0 ? XP_REWARDS.streakWeek : XP_REWARDS.streakDay;
        
        // 주간 스트릭 보너스
        if (newStreak % 7 === 0) {
          setTimeout(function() { addXp(xp, '7일 연속!'); }, 500);
        }
        
        return Object.assign({}, prev, {
          currentStreak: newStreak,
          longestStreak: Math.max(prev.longestStreak, newStreak),
          lastActiveDate: today
        });
      });
    }
  };
  
  // 퀘스트 완료
  var onQuestComplete = function() {
    addXp(XP_REWARDS.questComplete, '퀘스트 완료');
    setGameData(function(prev) {
      return Object.assign({}, prev, { questsCompleted: prev.questsCompleted + 1 });
    });
  };
  
  // 배지 획득
  var addBadge = function(badgeId) {
    if (!gameData.badges.includes(badgeId)) {
      setGameData(function(prev) {
        return Object.assign({}, prev, { badges: prev.badges.concat([badgeId]) });
      });
    }
  };
  
  return {
    gameData: gameData,
    levelInfo: getLevelInfo(gameData.totalXp),
    xpToast: xpToast,
    hideXpToast: function() { setXpToast(function(prev) { return Object.assign({}, prev, { visible: false }); }); },
    levelUp: levelUp,
    closeLevelUp: function() { setLevelUp({ open: false, level: 0, info: null }); },
    addXp: addXp,
    onTaskComplete: onTaskComplete,
    onFocusComplete: onFocusComplete,
    updateStreak: updateStreak,
    onQuestComplete: onQuestComplete,
    addBadge: addBadge,
    XP_REWARDS: XP_REWARDS
  };
}

export default {
  LevelXpBar: LevelXpBar,
  XpGainToast: XpGainToast,
  LevelUpModal: LevelUpModal,
  GameStatsCard: GameStatsCard,
  useGamification: useGamification,
  LEVELS: LEVELS,
  XP_REWARDS: XP_REWARDS,
  getLevelInfo: getLevelInfo
};
