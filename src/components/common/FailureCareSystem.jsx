import React, { useState } from 'react';
import { Shield, Heart, Sparkles, ChevronRight, X } from 'lucide-react';

// 🤗 실패 케어 메시지들
var careMessages = {
  zeroComplete: [
    { emoji: '🤗', message: '오늘 하루도 수고했어요, 보스. 내일은 새로운 시작이에요.', subtext: '완벽하지 않아도 괜찮아요' },
    { emoji: '🌙', message: '쉬어가는 것도 중요해요. 내일 더 힘낼 수 있을 거예요.', subtext: '오늘은 충전하는 날' },
    { emoji: '💜', message: '못한 게 아니라, 아직 안 한 거예요. 내일 함께해요!', subtext: '알프레도가 응원할게요' },
    { emoji: '🐧', message: '보스, 저도 가끔 빈둥빈둥해요. 괜찮아요!', subtext: '같이 천천히 가요' },
    { emoji: '☁️', message: '구름 낀 날도 있는 법이에요. 곧 맑아질 거예요.', subtext: '내일은 더 좋은 하루' }
  ],
  lowEnergy: [
    { emoji: '🔋', message: '에너지가 부족한 날이었네요. 충분히 쉬세요!', subtext: '몸이 먼저예요' },
    { emoji: '😴', message: '피곤한 날엔 쉬는 게 최고의 생산성이에요.', subtext: '내일을 위한 투자' },
    { emoji: '🍵', message: '따뜻한 차 한 잔 어때요? 오늘은 여기까지!', subtext: '자신을 돌보는 시간' }
  ],
  badMood: [
    { emoji: '💝', message: '기분이 안 좋은 날엔 아무것도 안 해도 돼요.', subtext: '감정도 중요해요' },
    { emoji: '🫂', message: '힘든 날이었죠? 알프레도가 여기 있어요.', subtext: '혼자가 아니에요' },
    { emoji: '🌈', message: '비 온 뒤에 무지개가 뜨듯, 곧 좋아질 거예요.', subtext: '잠깐 쉬어가요' }
  ],
  partialComplete: [
    { emoji: '👏', message: '조금이라도 한 거면 대단한 거예요!', subtext: '작은 진전도 진전이에요' },
    { emoji: '🌱', message: '작은 씨앗이 큰 나무가 되듯, 천천히 가요.', subtext: '꾸준함이 힘이에요' },
    { emoji: '⭐', message: '완벽하지 않아도 빛나요, 보스!', subtext: '이미 충분히 잘하고 있어요' }
  ]
};

// 🛡️ 스트릭 보호권 카드
export var StreakProtectionCard = function(props) {
  var darkMode = props.darkMode;
  var streakCount = props.streakCount || 0;
  var protectionsLeft = props.protectionsLeft !== undefined ? props.protectionsLeft : 2;
  var onUseProtection = props.onUseProtection;
  var onDismiss = props.onDismiss;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var canUseProtection = protectionsLeft > 0;
  
  return React.createElement('div', { 
    className: cardBg + ' rounded-2xl p-4 border ' + borderColor + ' mb-4'
  },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Shield, { size: 20, className: 'text-[#A996FF]' }),
        React.createElement('span', { className: textPrimary + ' font-bold' }, '스트릭 보호권')
      ),
      onDismiss && React.createElement('button', {
        onClick: onDismiss,
        className: textSecondary + ' hover:text-gray-400'
      }, React.createElement(X, { size: 18 }))
    ),
    
    // 현재 스트릭
    React.createElement('div', { className: 'flex items-center gap-3 mb-4 p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
      React.createElement('span', { className: 'text-2xl' }, '🔥'),
      React.createElement('div', null,
        React.createElement('p', { className: textPrimary + ' font-bold text-lg' }, streakCount + '일 연속'),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '이 기록을 지킬 수 있어요!')
      )
    ),
    
    // 보호권 현황
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('span', { className: textSecondary + ' text-sm' }, '이번 달 남은 보호권'),
      React.createElement('div', { className: 'flex gap-1' },
        [0, 1].map(function(i) {
          var isAvailable = i < protectionsLeft;
          return React.createElement('div', {
            key: i,
            className: 'w-8 h-8 rounded-full flex items-center justify-center ' +
              (isAvailable ? 'bg-[#A996FF]/20' : (darkMode ? 'bg-gray-700' : 'bg-gray-200'))
          },
            React.createElement(Shield, { 
              size: 16, 
              className: isAvailable ? 'text-[#A996FF]' : textSecondary 
            })
          );
        })
      )
    ),
    
    // 액션 버튼
    canUseProtection
      ? React.createElement('button', {
          onClick: onUseProtection,
          className: 'w-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2'
        },
          React.createElement(Shield, { size: 18 }),
          '보호권 사용하기'
        )
      : React.createElement('div', { className: 'text-center p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-100') },
          React.createElement('p', { className: textSecondary + ' text-sm' }, '이번 달 보호권을 모두 사용했어요'),
          React.createElement('p', { className: textSecondary + ' text-xs mt-1' }, '다음 달에 2개 충전돼요! 🔄')
        )
  );
};

// 🤗 실패 케어 카드 (하루 마무리 시)
export var FailureCareCard = function(props) {
  var darkMode = props.darkMode;
  var completedCount = props.completedCount || 0;
  var totalCount = props.totalCount || 0;
  var mood = props.mood;
  var energy = props.energy;
  var onDismiss = props.onDismiss;
  var onOpenChat = props.onOpenChat;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  // 상황에 맞는 메시지 선택
  var getMessage = function() {
    var messages;
    
    if (energy && energy <= 2) {
      messages = careMessages.lowEnergy;
    } else if (mood && mood <= 2) {
      messages = careMessages.badMood;
    } else if (completedCount === 0) {
      messages = careMessages.zeroComplete;
    } else {
      messages = careMessages.partialComplete;
    }
    
    var randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };
  
  var careMessage = getMessage();
  
  return React.createElement('div', { 
    className: 'bg-gradient-to-br from-[#A996FF]/20 to-[#E8E0FF]/30 rounded-2xl p-5 border border-[#A996FF]/30 mb-4'
  },
    // 닫기 버튼
    onDismiss && React.createElement('div', { className: 'flex justify-end mb-2' },
      React.createElement('button', {
        onClick: onDismiss,
        className: textSecondary + ' hover:text-gray-400'
      }, React.createElement(X, { size: 18 }))
    ),
    
    // 메인 메시지
    React.createElement('div', { className: 'text-center mb-4' },
      React.createElement('span', { className: 'text-4xl block mb-3' }, careMessage.emoji),
      React.createElement('p', { className: textPrimary + ' text-lg font-medium mb-1' }, careMessage.message),
      React.createElement('p', { className: 'text-[#A996FF] text-sm' }, careMessage.subtext)
    ),
    
    // 통계
    React.createElement('div', { className: 'flex justify-center gap-6 mb-4 text-center' },
      React.createElement('div', null,
        React.createElement('p', { className: textPrimary + ' text-2xl font-bold' }, completedCount),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '완료')
      ),
      React.createElement('div', { className: 'w-px ' + (darkMode ? 'bg-gray-700' : 'bg-gray-200') }),
      React.createElement('div', null,
        React.createElement('p', { className: textPrimary + ' text-2xl font-bold' }, totalCount - completedCount),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '내일로')
      )
    ),
    
    // 알프레도에게 말하기 버튼
    onOpenChat && React.createElement('button', {
      onClick: onOpenChat,
      className: 'w-full bg-white/50 hover:bg-white/70 text-[#7C6BD6] py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all'
    },
      React.createElement('span', null, '🐧'),
      '알프레도에게 말하기'
    )
  );
};

// 💝 미니 격려 배지 (인라인용)
export var EncouragementBadge = function(props) {
  var darkMode = props.darkMode;
  var type = props.type || 'default'; // 'streak', 'comeback', 'firstStep', 'default'
  
  var badges = {
    streak: { emoji: '🔥', text: '연속 달성 중!', color: 'bg-orange-500/20 text-orange-500' },
    comeback: { emoji: '💪', text: '다시 시작했어요!', color: 'bg-emerald-500/20 text-emerald-500' },
    firstStep: { emoji: '🌱', text: '첫 걸음!', color: 'bg-green-500/20 text-green-500' },
    perfect: { emoji: '⭐', text: '완벽한 하루!', color: 'bg-amber-500/20 text-amber-500' },
    default: { emoji: '💜', text: '화이팅!', color: 'bg-[#A996FF]/20 text-[#A996FF]' }
  };
  
  var badge = badges[type] || badges.default;
  
  return React.createElement('span', { 
    className: badge.color + ' px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1'
  },
    React.createElement('span', null, badge.emoji),
    badge.text
  );
};

// 🌙 하루 마무리 모달
export var DayEndModal = function(props) {
  var darkMode = props.darkMode;
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var completedCount = props.completedCount || 0;
  var totalCount = props.totalCount || 0;
  var streakCount = props.streakCount || 0;
  var protectionsLeft = props.protectionsLeft !== undefined ? props.protectionsLeft : 2;
  var mood = props.mood;
  var energy = props.energy;
  var onUseProtection = props.onUseProtection;
  var onOpenChat = props.onOpenChat;
  
  if (!isOpen) return null;
  
  var isSuccess = completedCount > 0;
  var needsProtection = !isSuccess && streakCount > 0;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', { 
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
  },
    React.createElement('div', { className: cardBg + ' rounded-3xl p-6 max-w-sm w-full shadow-2xl' },
      
      // 성공 케이스
      isSuccess 
        ? React.createElement('div', { className: 'text-center' },
            React.createElement('span', { className: 'text-5xl block mb-4' }, '🎉'),
            React.createElement('h2', { className: textPrimary + ' text-xl font-bold mb-2' }, '오늘도 수고했어요!'),
            React.createElement('p', { className: textSecondary + ' text-sm mb-4' }, 
              completedCount + '개의 할 일을 완료했어요'
            ),
            streakCount > 0 && React.createElement('div', { 
              className: 'inline-flex items-center gap-2 bg-orange-500/20 text-orange-500 px-4 py-2 rounded-full mb-4'
            },
              React.createElement('span', null, '🔥'),
              React.createElement('span', { className: 'font-bold' }, streakCount + '일 연속!')
            ),
            React.createElement('button', {
              onClick: onClose,
              className: 'w-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white py-3 rounded-xl font-medium'
            }, '좋아요!')
          )
        
        // 실패 케이스 (스트릭 있음)
        : needsProtection
          ? React.createElement('div', null,
              React.createElement(FailureCareCard, {
                darkMode: darkMode,
                completedCount: completedCount,
                totalCount: totalCount,
                mood: mood,
                energy: energy,
                onOpenChat: onOpenChat
              }),
              React.createElement(StreakProtectionCard, {
                darkMode: darkMode,
                streakCount: streakCount,
                protectionsLeft: protectionsLeft,
                onUseProtection: function() {
                  if (onUseProtection) onUseProtection();
                  onClose();
                }
              }),
              React.createElement('button', {
                onClick: onClose,
                className: 'w-full text-center ' + textSecondary + ' text-sm py-2'
              }, '괜찮아요, 다음에 할게요')
            )
          
          // 실패 케이스 (스트릭 없음)
          : React.createElement('div', null,
              React.createElement(FailureCareCard, {
                darkMode: darkMode,
                completedCount: completedCount,
                totalCount: totalCount,
                mood: mood,
                energy: energy,
                onOpenChat: onOpenChat
              }),
              React.createElement('button', {
                onClick: onClose,
                className: 'w-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white py-3 rounded-xl font-medium'
              }, '내일 다시 시작할게요! 💪')
            )
    )
  );
};

export default {
  FailureCareCard: FailureCareCard,
  StreakProtectionCard: StreakProtectionCard,
  EncouragementBadge: EncouragementBadge,
  DayEndModal: DayEndModal,
  careMessages: careMessages
};
