import React, { useState } from 'react';
import { Trophy, Target, Award, Star, Flame, Gift, ChevronRight, Sparkles } from 'lucide-react';
import { LevelXpBar, GameStatsCard, XpGainToast, LevelUpModal } from './LevelSystem';
import { DailyQuestList, QuestCard } from './QuestSystem';
import { BadgeCollection, BadgeDetailModal, BadgeEarnedModal, BADGES, CATEGORIES, RARITY_COLORS } from './BadgeSystem';

// 🎮 게이미피케이션 메인 페이지
export var GamificationPage = function(props) {
  var darkMode = props.darkMode;
  var gameData = props.gameData || {};
  var levelInfo = props.levelInfo || {};
  var dailyQuests = props.dailyQuests || [];
  var weeklyQuests = props.weeklyQuests || [];
  var earnedBadges = props.earnedBadges || [];
  var onClaimQuest = props.onClaimQuest;
  var onBack = props.onBack;
  
  // 탭 상태
  var tabState = useState('overview'); // overview, quests, badges
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];
  
  // 배지 상세 모달
  var badgeModalState = useState({ open: false, badge: null });
  var badgeModal = badgeModalState[0];
  var setBadgeModal = badgeModalState[1];
  
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  // 탭 버튼
  var tabs = [
    { id: 'overview', label: '개요', icon: Trophy },
    { id: 'quests', label: '퀘스트', icon: Target },
    { id: 'badges', label: '배지', icon: Award }
  ];
  
  // 퀘스트 통계
  var questStats = {
    dailyCompleted: dailyQuests.filter(function(q) { return q.completed; }).length,
    dailyTotal: dailyQuests.length,
    weeklyCompleted: weeklyQuests.filter(function(q) { return q.completed; }).length,
    weeklyTotal: weeklyQuests.length
  };
  
  return React.createElement('div', { className: bgColor + ' min-h-screen pb-24' },
    // 헤더
    React.createElement('div', { className: 'px-4 pt-6 pb-4' },
      React.createElement('div', { className: 'flex items-center gap-3 mb-4' },
        React.createElement('button', {
          onClick: onBack,
          className: textSecondary + ' hover:' + textPrimary
        }, '←'),
        React.createElement('h1', { className: textPrimary + ' text-2xl font-bold' }, '🎮 게임센터')
      ),
      
      // 레벨 카드 (항상 표시)
      React.createElement(LevelXpBar, {
        darkMode: darkMode,
        totalXp: gameData.totalXp || 0,
        showDetails: true
      })
    ),
    
    // 탭 네비게이션
    React.createElement('div', { className: 'px-4 mb-4' },
      React.createElement('div', { className: 'flex gap-2 p-1 rounded-xl ' + (darkMode ? 'bg-gray-800' : 'bg-white') },
        tabs.map(function(tab) {
          var isActive = activeTab === tab.id;
          return React.createElement('button', {
            key: tab.id,
            onClick: function() { setActiveTab(tab.id); },
            className: 'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ' +
              (isActive 
                ? 'bg-[#A996FF] text-white' 
                : textSecondary + ' hover:' + textPrimary)
          },
            React.createElement(tab.icon, { size: 16 }),
            tab.label
          );
        })
      )
    ),
    
    // 탭 컨텐츠
    React.createElement('div', { className: 'px-4' },
      // 개요 탭
      activeTab === 'overview' && React.createElement('div', { className: 'space-y-4' },
        // 오늘의 퀘스트 미리보기
        React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
          React.createElement('div', { className: 'flex items-center justify-between mb-3' },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement(Target, { size: 18, className: 'text-[#A996FF]' }),
              React.createElement('h3', { className: textPrimary + ' font-bold' }, '오늘의 퀘스트')
            ),
            React.createElement('button', {
              onClick: function() { setActiveTab('quests'); },
              className: 'text-[#A996FF] text-sm flex items-center gap-1'
            }, '전체 보기', React.createElement(ChevronRight, { size: 14 }))
          ),
          React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
            React.createElement('div', { className: 'flex-1 h-2 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' overflow-hidden' },
              React.createElement('div', { 
                className: 'h-full bg-[#A996FF] rounded-full',
                style: { width: (questStats.dailyCompleted / questStats.dailyTotal * 100) + '%' }
              })
            ),
            React.createElement('span', { className: textSecondary + ' text-sm' }, 
              questStats.dailyCompleted + '/' + questStats.dailyTotal
            )
          ),
          // 상위 3개 퀘스트만 표시
          React.createElement('div', { className: 'space-y-2' },
            dailyQuests.slice(0, 3).map(function(quest) {
              return React.createElement(QuestCard, {
                key: quest.id,
                quest: quest,
                darkMode: darkMode,
                onClaim: onClaimQuest,
                compact: true
              });
            })
          )
        ),
        
        // 배지 미리보기
        React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
          React.createElement('div', { className: 'flex items-center justify-between mb-3' },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement(Award, { size: 18, className: 'text-amber-400' }),
              React.createElement('h3', { className: textPrimary + ' font-bold' }, '최근 획득 배지')
            ),
            React.createElement('button', {
              onClick: function() { setActiveTab('badges'); },
              className: 'text-[#A996FF] text-sm flex items-center gap-1'
            }, '전체 보기', React.createElement(ChevronRight, { size: 14 }))
          ),
          earnedBadges.length > 0 
            ? React.createElement('div', { className: 'flex gap-2 overflow-x-auto pb-2' },
                earnedBadges.slice(-5).reverse().map(function(badgeId) {
                  var badge = BADGES[badgeId];
                  if (!badge) return null;
                  var rarity = RARITY_COLORS[badge.rarity];
                  return React.createElement('button', {
                    key: badgeId,
                    onClick: function() { setBadgeModal({ open: true, badge: badge }); },
                    className: 'flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl border-2 ' + rarity.bg + ' ' + rarity.border
                  }, badge.icon);
                })
              )
            : React.createElement('p', { className: textSecondary + ' text-sm text-center py-4' }, '아직 획득한 배지가 없어요')
        ),
        
        // 통계 카드
        React.createElement(GameStatsCard, {
          darkMode: darkMode,
          gameData: gameData
        })
      ),
      
      // 퀘스트 탭
      activeTab === 'quests' && React.createElement('div', { className: 'space-y-4' },
        // 데일리 퀘스트
        React.createElement(DailyQuestList, {
          darkMode: darkMode,
          quests: dailyQuests,
          onClaim: onClaimQuest,
          compact: false
        }),
        
        // 주간 퀘스트
        weeklyQuests.length > 0 && React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
          React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
            React.createElement(Flame, { size: 18, className: 'text-orange-500' }),
            React.createElement('h3', { className: textPrimary + ' font-bold' }, '주간 퀘스트')
          ),
          React.createElement('div', { className: 'space-y-2' },
            weeklyQuests.map(function(quest) {
              return React.createElement(QuestCard, {
                key: quest.id,
                quest: quest,
                darkMode: darkMode,
                onClaim: onClaimQuest,
                compact: false
              });
            })
          )
        )
      ),
      
      // 배지 탭
      activeTab === 'badges' && React.createElement('div', { className: 'space-y-4' },
        // 카테고리별 필터
        Object.keys(CATEGORIES).map(function(catKey) {
          var category = CATEGORIES[catKey];
          var categoryBadges = Object.values(BADGES).filter(function(b) { return b.category === catKey; });
          var earnedInCategory = categoryBadges.filter(function(b) { return earnedBadges.includes(b.id); }).length;
          
          return React.createElement('div', { 
            key: catKey,
            className: cardBg + ' rounded-2xl p-4 border ' + borderColor
          },
            React.createElement('div', { className: 'flex items-center justify-between mb-3' },
              React.createElement('div', { className: 'flex items-center gap-2' },
                React.createElement('span', { className: 'text-lg' }, category.icon),
                React.createElement('h3', { className: textPrimary + ' font-bold' }, category.name)
              ),
              React.createElement('span', { className: textSecondary + ' text-sm' }, 
                earnedInCategory + '/' + categoryBadges.length
              )
            ),
            React.createElement('div', { className: 'grid grid-cols-5 gap-2' },
              categoryBadges.map(function(badge) {
                var isEarned = earnedBadges.includes(badge.id);
                var rarity = RARITY_COLORS[badge.rarity];
                return React.createElement('button', {
                  key: badge.id,
                  onClick: function() { setBadgeModal({ open: true, badge: badge }); },
                  className: 'w-full aspect-square rounded-xl flex items-center justify-center text-2xl border-2 transition-all ' +
                    (isEarned 
                      ? rarity.bg + ' ' + rarity.border + ' hover:scale-105' 
                      : (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200') + ' opacity-40')
                }, isEarned ? badge.icon : '🔒');
              })
            )
          );
        })
      )
    ),
    
    // 배지 상세 모달
    React.createElement(BadgeDetailModal, {
      isOpen: badgeModal.open,
      onClose: function() { setBadgeModal({ open: false, badge: null }); },
      darkMode: darkMode,
      badge: badgeModal.badge,
      earned: badgeModal.badge && earnedBadges.includes(badgeModal.badge.id)
    })
  );
};

// 📊 미니 게임 위젯 (홈페이지용)
export var GameWidget = function(props) {
  var darkMode = props.darkMode;
  var totalXp = props.totalXp || 0;
  var levelInfo = props.levelInfo || {};
  var dailyQuests = props.dailyQuests || [];
  var earnedBadges = props.earnedBadges || [];
  var onClick = props.onClick;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var questsDone = dailyQuests.filter(function(q) { return q.completed; }).length;
  
  return React.createElement('button', {
    onClick: onClick,
    className: cardBg + ' rounded-2xl p-4 border ' + borderColor + ' w-full text-left hover:border-[#A996FF]/50 transition-all'
  },
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Trophy, { size: 18, className: 'text-amber-400' }),
        React.createElement('span', { className: textPrimary + ' font-bold' }, '게임센터')
      ),
      React.createElement(ChevronRight, { size: 16, className: textSecondary })
    ),
    
    // 레벨 & XP
    React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
      React.createElement('span', { className: 'text-2xl' }, levelInfo.title ? levelInfo.title.split(' ')[0] : '🐣'),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('div', { className: 'flex justify-between text-xs mb-1' },
          React.createElement('span', { className: textPrimary + ' font-medium' }, 'Lv.' + (levelInfo.level || 1)),
          React.createElement('span', { className: 'text-[#A996FF]' }, totalXp + ' XP')
        ),
        React.createElement('div', { className: 'h-1.5 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' overflow-hidden' },
          React.createElement('div', { 
            className: 'h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full',
            style: { width: (levelInfo.progress || 0) + '%' }
          })
        )
      )
    ),
    
    // 퀘스트 & 배지
    React.createElement('div', { className: 'flex items-center gap-4 text-xs' },
      React.createElement('div', { className: 'flex items-center gap-1' },
        React.createElement(Target, { size: 12, className: 'text-[#A996FF]' }),
        React.createElement('span', { className: textSecondary }, '퀘스트 ' + questsDone + '/' + dailyQuests.length)
      ),
      React.createElement('div', { className: 'flex items-center gap-1' },
        React.createElement(Award, { size: 12, className: 'text-amber-400' }),
        React.createElement('span', { className: textSecondary }, '배지 ' + earnedBadges.length)
      )
    )
  );
};

export default {
  GamificationPage: GamificationPage,
  GameWidget: GameWidget
};
