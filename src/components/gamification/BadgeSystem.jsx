import React, { useState, useEffect } from 'react';
import { Award, Lock, CheckCircle2, Star, Trophy, Sparkles, ChevronRight, X } from 'lucide-react';

// localStorage 키
var STORAGE_KEY = 'lifebutler_badges';

// 배지 정의
var BADGES = {
  // 🌟 시작 배지
  welcome: { id: 'welcome', name: '환영합니다!', icon: '👋', description: '라이프 버틀러 시작', category: 'start', xp: 10, rarity: 'common' },
  firstTask: { id: 'firstTask', name: '첫 발걸음', icon: '👣', description: '첫 번째 할일 완료', category: 'start', xp: 20, rarity: 'common' },
  firstFocus: { id: 'firstFocus', name: '집중의 시작', icon: '🎯', description: '첫 집중 세션 완료', category: 'start', xp: 20, rarity: 'common' },
  
  // ✅ 태스크 배지
  tasks10: { id: 'tasks10', name: '할일 마스터', icon: '✅', description: '할일 10개 완료', category: 'tasks', xp: 30, rarity: 'common' },
  tasks50: { id: 'tasks50', name: '생산성 챔피언', icon: '🏅', description: '할일 50개 완료', category: 'tasks', xp: 50, rarity: 'uncommon' },
  tasks100: { id: 'tasks100', name: '할일 정복자', icon: '👑', description: '할일 100개 완료', category: 'tasks', xp: 100, rarity: 'rare' },
  tasks500: { id: 'tasks500', name: '전설의 버틀러', icon: '🦸', description: '할일 500개 완료', category: 'tasks', xp: 300, rarity: 'legendary' },
  
  // 🔥 스트릭 배지
  streak3: { id: 'streak3', name: '3일 연속', icon: '🔥', description: '3일 연속 활동', category: 'streak', xp: 30, rarity: 'common' },
  streak7: { id: 'streak7', name: '일주일 마스터', icon: '📅', description: '7일 연속 활동', category: 'streak', xp: 70, rarity: 'uncommon' },
  streak30: { id: 'streak30', name: '한 달의 기적', icon: '🌟', description: '30일 연속 활동', category: 'streak', xp: 200, rarity: 'rare' },
  streak100: { id: 'streak100', name: '100일 레전드', icon: '💎', description: '100일 연속 활동', category: 'streak', xp: 500, rarity: 'legendary' },
  
  // 🎯 집중 배지
  focus1h: { id: 'focus1h', name: '집중 1시간', icon: '⏱️', description: '총 1시간 집중', category: 'focus', xp: 30, rarity: 'common' },
  focus10h: { id: 'focus10h', name: '집중 10시간', icon: '⚡', description: '총 10시간 집중', category: 'focus', xp: 80, rarity: 'uncommon' },
  focus50h: { id: 'focus50h', name: '집중의 달인', icon: '🧘', description: '총 50시간 집중', category: 'focus', xp: 200, rarity: 'rare' },
  focus100h: { id: 'focus100h', name: '마스터 오브 포커스', icon: '🏆', description: '총 100시간 집중', category: 'focus', xp: 500, rarity: 'legendary' },
  
  // ⭐ 퀘스트 배지
  quest10: { id: 'quest10', name: '퀘스트 수행자', icon: '📜', description: '퀘스트 10개 완료', category: 'quest', xp: 50, rarity: 'common' },
  quest50: { id: 'quest50', name: '퀘스트 헌터', icon: '🗡️', description: '퀘스트 50개 완료', category: 'quest', xp: 150, rarity: 'uncommon' },
  quest100: { id: 'quest100', name: '퀘스트 마스터', icon: '⚔️', description: '퀘스트 100개 완료', category: 'quest', xp: 300, rarity: 'rare' },
  
  // 🎉 특별 배지
  perfectDay: { id: 'perfectDay', name: '완벽한 하루', icon: '💯', description: '하루 모든 할일 완료', category: 'special', xp: 50, rarity: 'uncommon' },
  earlyBird: { id: 'earlyBird', name: '얼리버드', icon: '🐦', description: '오전 6시 전 활동', category: 'special', xp: 30, rarity: 'uncommon' },
  nightOwl: { id: 'nightOwl', name: '나이트아울', icon: '🦉', description: '자정에 할일 완료', category: 'special', xp: 30, rarity: 'uncommon' },
  weekendWarrior: { id: 'weekendWarrior', name: '주말 전사', icon: '⚔️', description: '주말에 5개 이상 완료', category: 'special', xp: 40, rarity: 'uncommon' },
  
  // 🐧 알프레도 배지
  alfredoFriend: { id: 'alfredoFriend', name: '알프레도의 친구', icon: '🐧', description: '알프레도와 10번 대화', category: 'alfredo', xp: 30, rarity: 'common' },
  alfredoBFF: { id: 'alfredoBFF', name: '베스트 프렌드', icon: '💜', description: '알프레도와 50번 대화', category: 'alfredo', xp: 80, rarity: 'uncommon' },
  
  // 🏆 레벨 배지
  level5: { id: 'level5', name: '성장하는 버틀러', icon: '🌱', description: '레벨 5 달성', category: 'level', xp: 50, rarity: 'common' },
  level10: { id: 'level10', name: '울트라 버틀러', icon: '🦸', description: '레벨 10 달성', category: 'level', xp: 200, rarity: 'legendary' }
};

// 희귀도 색상
var RARITY_COLORS = {
  common: { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400', label: '일반' },
  uncommon: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', label: '고급' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', label: '희귀' },
  legendary: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', label: '전설' }
};

// 카테고리 정보
var CATEGORIES = {
  start: { name: '시작', icon: '🌟' },
  tasks: { name: '태스크', icon: '✅' },
  streak: { name: '스트릭', icon: '🔥' },
  focus: { name: '집중', icon: '🎯' },
  quest: { name: '퀘스트', icon: '📜' },
  special: { name: '특별', icon: '🎉' },
  alfredo: { name: '알프레도', icon: '🐧' },
  level: { name: '레벨', icon: '🏆' }
};

// 배지 데이터 로드
function loadBadgeData() {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load badge data:', e);
  }
  return { earned: [], progress: {} };
}

// 배지 데이터 저장
function saveBadgeData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save badge data:', e);
  }
}

// 🏅 배지 카드
export var BadgeCard = function(props) {
  var badge = props.badge;
  var earned = props.earned;
  var darkMode = props.darkMode;
  var onClick = props.onClick;
  var compact = props.compact;
  
  var rarity = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common;
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  if (compact) {
    return React.createElement('button', {
      onClick: onClick,
      className: 'w-14 h-14 rounded-xl flex items-center justify-center text-2xl border-2 transition-all ' +
        (earned 
          ? rarity.bg + ' ' + rarity.border + ' hover:scale-105' 
          : (darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200') + ' opacity-40')
    },
      earned ? badge.icon : React.createElement(Lock, { size: 20, className: textSecondary })
    );
  }
  
  return React.createElement('button', {
    onClick: onClick,
    className: 'p-4 rounded-xl border-2 transition-all text-left ' +
      (earned 
        ? rarity.bg + ' ' + rarity.border + ' hover:scale-[1.02]' 
        : (darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200') + ' opacity-60')
  },
    React.createElement('div', { className: 'flex items-start gap-3' },
      React.createElement('div', { className: 'text-3xl' }, earned ? badge.icon : '🔒'),
      React.createElement('div', { className: 'flex-1 min-w-0' },
        React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
          React.createElement('p', { className: textPrimary + ' font-bold text-sm truncate' }, badge.name),
          React.createElement('span', { className: rarity.text + ' text-[10px] px-1.5 py-0.5 rounded-full ' + rarity.bg }, rarity.label)
        ),
        React.createElement('p', { className: textSecondary + ' text-xs' }, badge.description),
        earned && React.createElement('div', { className: 'flex items-center gap-1 mt-2 text-amber-400' },
          React.createElement(Star, { size: 12 }),
          React.createElement('span', { className: 'text-xs font-bold' }, '+' + badge.xp + ' XP')
        )
      )
    )
  );
};

// 🎖️ 배지 컬렉션 (그리드)
export var BadgeCollection = function(props) {
  var darkMode = props.darkMode;
  var earnedBadges = props.earnedBadges || [];
  var onBadgeClick = props.onBadgeClick;
  var filter = props.filter; // 카테고리 필터
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var allBadges = Object.values(BADGES);
  var filteredBadges = filter ? allBadges.filter(function(b) { return b.category === filter; }) : allBadges;
  var earnedCount = earnedBadges.length;
  var totalCount = allBadges.length;
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Award, { size: 20, className: 'text-amber-400' }),
        React.createElement('h3', { className: textPrimary + ' font-bold' }, '배지 컬렉션')
      ),
      React.createElement('span', { className: textSecondary + ' text-sm' }, earnedCount + '/' + totalCount)
    ),
    
    // 진행률 바
    React.createElement('div', { className: 'mb-4' },
      React.createElement('div', { className: 'h-2 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' overflow-hidden' },
        React.createElement('div', { 
          className: 'h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all',
          style: { width: (earnedCount / totalCount * 100) + '%' }
        })
      )
    ),
    
    // 배지 그리드
    React.createElement('div', { className: 'grid grid-cols-5 gap-2' },
      filteredBadges.map(function(badge) {
        var isEarned = earnedBadges.includes(badge.id);
        return React.createElement(BadgeCard, {
          key: badge.id,
          badge: badge,
          earned: isEarned,
          darkMode: darkMode,
          onClick: function() { if (onBadgeClick) onBadgeClick(badge); },
          compact: true
        });
      })
    )
  );
};

// 🎊 배지 획득 모달
export var BadgeEarnedModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var darkMode = props.darkMode;
  var badge = props.badge;
  
  if (!isOpen || !badge) return null;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var rarity = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common;
  
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: cardBg + ' rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl',
      onClick: function(e) { e.stopPropagation(); }
    },
      // 축하 효과
      React.createElement('div', { className: 'text-6xl mb-4 animate-bounce' }, '🎉'),
      
      // 배지 획득 텍스트
      React.createElement('h2', { className: rarity.text + ' text-xl font-bold mb-4' }, '새 배지 획득!'),
      
      // 배지 아이콘
      React.createElement('div', { 
        className: 'w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl mb-4 border-2 ' + rarity.bg + ' ' + rarity.border
      }, badge.icon),
      
      // 배지 이름
      React.createElement('p', { className: textPrimary + ' text-xl font-bold mb-1' }, badge.name),
      React.createElement('p', { className: textSecondary + ' mb-4' }, badge.description),
      
      // 희귀도 & XP
      React.createElement('div', { className: 'flex items-center justify-center gap-4 mb-6' },
        React.createElement('span', { className: rarity.text + ' text-sm px-3 py-1 rounded-full ' + rarity.bg }, rarity.label),
        React.createElement('div', { className: 'flex items-center gap-1 text-amber-400' },
          React.createElement(Star, { size: 16 }),
          React.createElement('span', { className: 'font-bold' }, '+' + badge.xp + ' XP')
        )
      ),
      
      // 확인 버튼
      React.createElement('button', {
        onClick: onClose,
        className: 'w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold'
      }, '멋져요! 🏅')
    )
  );
};

// 📋 배지 상세 모달
export var BadgeDetailModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var darkMode = props.darkMode;
  var badge = props.badge;
  var earned = props.earned;
  var earnedDate = props.earnedDate;
  
  if (!isOpen || !badge) return null;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var rarity = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common;
  var category = CATEGORIES[badge.category] || { name: '기타', icon: '📦' };
  
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: cardBg + ' rounded-3xl p-6 max-w-sm w-full shadow-2xl',
      onClick: function(e) { e.stopPropagation(); }
    },
      // 닫기 버튼
      React.createElement('button', {
        onClick: onClose,
        className: 'absolute top-4 right-4 ' + textSecondary
      }, React.createElement(X, { size: 20 })),
      
      // 배지 아이콘
      React.createElement('div', { 
        className: 'w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4 border-2 ' + 
          (earned ? rarity.bg + ' ' + rarity.border : (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'))
      }, earned ? badge.icon : '🔒'),
      
      // 배지 정보
      React.createElement('div', { className: 'text-center mb-4' },
        React.createElement('p', { className: textPrimary + ' text-xl font-bold mb-1' }, badge.name),
        React.createElement('p', { className: textSecondary }, badge.description)
      ),
      
      // 태그들
      React.createElement('div', { className: 'flex items-center justify-center gap-2 mb-4 flex-wrap' },
        React.createElement('span', { className: rarity.text + ' text-xs px-2 py-1 rounded-full ' + rarity.bg }, rarity.label),
        React.createElement('span', { className: textSecondary + ' text-xs px-2 py-1 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') }, 
          category.icon + ' ' + category.name
        ),
        React.createElement('span', { className: 'text-amber-400 text-xs px-2 py-1 rounded-full bg-amber-500/20' }, 
          '⭐ ' + badge.xp + ' XP'
        )
      ),
      
      // 획득 상태
      earned 
        ? React.createElement('div', { className: 'p-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-center' },
            React.createElement(CheckCircle2, { size: 20, className: 'inline mr-2' }),
            React.createElement('span', { className: 'font-medium' }, '획득 완료'),
            earnedDate && React.createElement('p', { className: 'text-xs mt-1 opacity-70' }, earnedDate + ' 획득')
          )
        : React.createElement('div', { className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' text-center' },
            React.createElement(Lock, { size: 20, className: 'inline mr-2 ' + textSecondary }),
            React.createElement('span', { className: textSecondary + ' font-medium' }, '미획득')
          )
    )
  );
};

// 🎮 배지 훅
export function useBadges() {
  var badgeDataState = useState(loadBadgeData);
  var badgeData = badgeDataState[0];
  var setBadgeData = badgeDataState[1];
  
  var newBadgeState = useState(null);
  var newBadge = newBadgeState[0];
  var setNewBadge = newBadgeState[1];
  
  // 데이터 저장
  useEffect(function() {
    saveBadgeData(badgeData);
  }, [badgeData]);
  
  // 배지 획득
  var earnBadge = function(badgeId) {
    if (badgeData.earned.includes(badgeId)) return null;
    
    var badge = BADGES[badgeId];
    if (!badge) return null;
    
    setBadgeData(function(prev) {
      return Object.assign({}, prev, {
        earned: prev.earned.concat([badgeId])
      });
    });
    
    setNewBadge(badge);
    return badge;
  };
  
  // 배지 체크 (조건 확인)
  var checkBadges = function(stats) {
    var earnedBadges = [];
    
    // 태스크 배지
    if (stats.tasksCompleted >= 10 && !badgeData.earned.includes('tasks10')) {
      earnedBadges.push(earnBadge('tasks10'));
    }
    if (stats.tasksCompleted >= 50 && !badgeData.earned.includes('tasks50')) {
      earnedBadges.push(earnBadge('tasks50'));
    }
    if (stats.tasksCompleted >= 100 && !badgeData.earned.includes('tasks100')) {
      earnedBadges.push(earnBadge('tasks100'));
    }
    if (stats.tasksCompleted >= 500 && !badgeData.earned.includes('tasks500')) {
      earnedBadges.push(earnBadge('tasks500'));
    }
    
    // 스트릭 배지
    if (stats.currentStreak >= 3 && !badgeData.earned.includes('streak3')) {
      earnedBadges.push(earnBadge('streak3'));
    }
    if (stats.currentStreak >= 7 && !badgeData.earned.includes('streak7')) {
      earnedBadges.push(earnBadge('streak7'));
    }
    if (stats.currentStreak >= 30 && !badgeData.earned.includes('streak30')) {
      earnedBadges.push(earnBadge('streak30'));
    }
    if (stats.currentStreak >= 100 && !badgeData.earned.includes('streak100')) {
      earnedBadges.push(earnBadge('streak100'));
    }
    
    // 집중 배지 (분 단위)
    if (stats.focusMinutes >= 60 && !badgeData.earned.includes('focus1h')) {
      earnedBadges.push(earnBadge('focus1h'));
    }
    if (stats.focusMinutes >= 600 && !badgeData.earned.includes('focus10h')) {
      earnedBadges.push(earnBadge('focus10h'));
    }
    if (stats.focusMinutes >= 3000 && !badgeData.earned.includes('focus50h')) {
      earnedBadges.push(earnBadge('focus50h'));
    }
    if (stats.focusMinutes >= 6000 && !badgeData.earned.includes('focus100h')) {
      earnedBadges.push(earnBadge('focus100h'));
    }
    
    // 레벨 배지
    if (stats.level >= 5 && !badgeData.earned.includes('level5')) {
      earnedBadges.push(earnBadge('level5'));
    }
    if (stats.level >= 10 && !badgeData.earned.includes('level10')) {
      earnedBadges.push(earnBadge('level10'));
    }
    
    return earnedBadges.filter(Boolean);
  };
  
  return {
    earnedBadges: badgeData.earned,
    newBadge: newBadge,
    closeNewBadge: function() { setNewBadge(null); },
    earnBadge: earnBadge,
    checkBadges: checkBadges,
    BADGES: BADGES,
    CATEGORIES: CATEGORIES
  };
}

export default {
  BadgeCard: BadgeCard,
  BadgeCollection: BadgeCollection,
  BadgeEarnedModal: BadgeEarnedModal,
  BadgeDetailModal: BadgeDetailModal,
  useBadges: useBadges,
  BADGES: BADGES,
  RARITY_COLORS: RARITY_COLORS,
  CATEGORIES: CATEGORIES
};
