import React, { useState } from 'react';
import { Shield, Flame, Heart, Sparkles, X, Check } from 'lucide-react';

// 실패 케어 메시지들
var careMessages = {
  // 0개 완료
  zero: [
    { emoji: '🤗', message: '오늘은 쉬어가는 날이에요. 내일 다시 시작하면 돼요!' },
    { emoji: '💙', message: '완벽하지 않아도 괜찮아요. 당신은 충분히 잘하고 있어요.' },
    { emoji: '🌱', message: '씨앗도 땅속에서 쉬는 시간이 필요해요. 오늘은 충전하는 날!' },
    { emoji: '☕', message: '가끔은 아무것도 안 하는 것도 생산적이에요.' },
    { emoji: '🌙', message: '오늘 하루도 버텨낸 것만으로 대단해요.' }
  ],
  // 1-2개 완료
  few: [
    { emoji: '👏', message: '조금이라도 했다는 게 중요해요! 잘했어요.' },
    { emoji: '🌟', message: '작은 진전도 진전이에요. 자랑스러워요!' },
    { emoji: '💪', message: '힘든 날에도 포기하지 않았네요. 멋져요!' }
  ],
  // 스트릭 끊김 위기
  streakRisk: [
    { emoji: '🛡️', message: '스트릭 보호권을 사용할까요? 연속 기록을 지켜드릴게요!' },
    { emoji: '💝', message: '괜찮아요, 보호권이 있잖아요. 부담 갖지 마세요.' }
  ],
  // 스트릭 끊김
  streakBroken: [
    { emoji: '🌈', message: '스트릭이 끊겼지만, 새로운 시작이에요! 다시 쌓아가요.' },
    { emoji: '🔥', message: '불꽃은 꺼져도 다시 피울 수 있어요. 화이팅!' }
  ],
  // 컨디션 안좋을 때
  lowEnergy: [
    { emoji: '🫂', message: '에너지가 없는 날도 있는 거예요. 푹 쉬세요.' },
    { emoji: '🍵', message: '따뜻한 차 한잔 어때요? 오늘은 자기 돌봄의 날!' }
  ],
  lowMood: [
    { emoji: '💜', message: '기분이 안 좋을 땐 무리하지 마세요. 당신 편이에요.' },
    { emoji: '🤍', message: '힘든 감정도 지나가요. 곁에 있을게요.' }
  ]
};

// 랜덤 메시지 선택
var getRandomMessage = function(type) {
  var messages = careMessages[type] || careMessages.zero;
  var idx = Math.floor(Math.random() * messages.length);
  return messages[idx];
};

// 스트릭 카드 컴포넌트
var StreakCard = function(props) {
  var darkMode = props.darkMode;
  var streak = props.streak || 0;
  var protectionLeft = props.protectionLeft !== undefined ? props.protectionLeft : 2;
  var onUseProtection = props.onUseProtection;
  var isStreakAtRisk = props.isStreakAtRisk;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  // 스트릭 레벨에 따른 불꽃 색상
  var getFlameColor = function() {
    if (streak >= 30) return 'text-purple-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-amber-500';
    return 'text-gray-400';
  };
  
  var getStreakMessage = function() {
    if (streak >= 30) return '🔥 전설의 집중력!';
    if (streak >= 14) return '💪 2주 연속! 대단해요!';
    if (streak >= 7) return '⭐ 일주일 달성!';
    if (streak >= 3) return '🌱 좋은 습관이 자라고 있어요';
    if (streak >= 1) return '✨ 시작이 반이에요!';
    return '🚀 오늘부터 시작해볼까요?';
  };
  
  return React.createElement('div', { 
    className: cardBg + ' rounded-2xl p-4 mb-4 border ' + borderColor
  },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Flame, { size: 20, className: getFlameColor() }),
        React.createElement('span', { className: textPrimary + ' font-bold' }, '연속 ' + streak + '일')
      ),
      // 보호권 표시
      React.createElement('div', { className: 'flex items-center gap-1' },
        Array.from({ length: 2 }).map(function(_, idx) {
          var isAvailable = idx < protectionLeft;
          return React.createElement(Shield, {
            key: idx,
            size: 16,
            className: isAvailable ? 'text-[#A996FF]' : 'text-gray-300'
          });
        }),
        React.createElement('span', { className: textSecondary + ' text-xs ml-1' }, 
          '보호권 ' + protectionLeft + '/2'
        )
      )
    ),
    
    // 메시지
    React.createElement('p', { className: textSecondary + ' text-sm mb-3' }, getStreakMessage()),
    
    // 스트릭 위험시 보호권 사용 버튼
    isStreakAtRisk && protectionLeft > 0 && React.createElement('button', {
      onClick: onUseProtection,
      className: 'w-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2'
    },
      React.createElement(Shield, { size: 16 }),
      '스트릭 보호권 사용하기'
    )
  );
};

// 실패 케어 모달 (0개 완료시)
var FailureCareModal = function(props) {
  var darkMode = props.darkMode;
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var completedCount = props.completedCount || 0;
  var totalCount = props.totalCount || 0;
  var mood = props.mood;
  var energy = props.energy;
  var streak = props.streak || 0;
  var protectionLeft = props.protectionLeft || 0;
  var onUseProtection = props.onUseProtection;
  
  if (!isOpen) return null;
  
  // 상황에 맞는 메시지 타입 결정
  var getMessageType = function() {
    if (energy && energy <= 2) return 'lowEnergy';
    if (mood && mood <= 2) return 'lowMood';
    if (completedCount === 0) {
      if (streak > 0 && protectionLeft > 0) return 'streakRisk';
      return 'zero';
    }
    return 'few';
  };
  
  var messageData = getRandomMessage(getMessageType());
  var isStreakAtRisk = streak > 0 && completedCount === 0;
  
  var bgOverlay = 'bg-black/50';
  var modalBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4 ' + bgOverlay,
    onClick: onClose
  },
    React.createElement('div', {
      className: modalBg + ' rounded-3xl p-6 max-w-sm w-full shadow-xl',
      onClick: function(e) { e.stopPropagation(); }
    },
      // 닫기 버튼
      React.createElement('button', {
        onClick: onClose,
        className: 'absolute top-4 right-4 ' + textSecondary
      },
        React.createElement(X, { size: 20 })
      ),
      
      // 이모지
      React.createElement('div', { className: 'text-center mb-4' },
        React.createElement('span', { className: 'text-6xl' }, messageData.emoji)
      ),
      
      // 메시지
      React.createElement('p', { 
        className: textPrimary + ' text-center text-lg font-medium mb-4 leading-relaxed' 
      }, messageData.message),
      
      // 통계
      React.createElement('div', { 
        className: 'flex justify-center gap-4 mb-4 text-sm ' + textSecondary 
      },
        React.createElement('span', null, '완료: ' + completedCount + '/' + totalCount),
        streak > 0 && React.createElement('span', null, '🔥 ' + streak + '일 연속')
      ),
      
      // 스트릭 위험시 보호권 버튼
      isStreakAtRisk && protectionLeft > 0 
        ? React.createElement('div', { className: 'space-y-2' },
            React.createElement('button', {
              onClick: function() {
                if (onUseProtection) onUseProtection();
                onClose();
              },
              className: 'w-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2'
            },
              React.createElement(Shield, { size: 18 }),
              '보호권 사용 (남은 횟수: ' + protectionLeft + ')'
            ),
            React.createElement('button', {
              onClick: onClose,
              className: 'w-full py-2 text-sm ' + textSecondary
            }, '괜찮아요, 새로 시작할게요')
          )
        : React.createElement('button', {
            onClick: onClose,
            className: 'w-full bg-[#A996FF]/10 text-[#A996FF] py-3 rounded-xl font-medium'
          }, '알겠어요, 고마워요 🐧')
    )
  );
};

// 저녁 리뷰 케어 컴포넌트 (하루 끝에 표시)
var EveningCareCard = function(props) {
  var darkMode = props.darkMode;
  var completedCount = props.completedCount || 0;
  var totalCount = props.totalCount || 0;
  var mood = props.mood;
  var energy = props.energy;
  var streak = props.streak || 0;
  var onOpenReview = props.onOpenReview;
  
  var cardBg = darkMode 
    ? 'bg-gradient-to-br from-[#2D2640] to-[#1F1833]' 
    : 'bg-gradient-to-br from-[#A996FF]/20 to-[#8B7CF7]/10';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  var borderColor = darkMode ? 'border-[#A996FF]/20' : 'border-[#A996FF]/30';
  
  var completionRate = totalCount > 0 ? completedCount / totalCount : 0;
  
  // 완료율에 따른 메시지
  var getMessage = function() {
    if (completionRate >= 1) {
      return { emoji: '🎉', text: '완벽한 하루였어요! 정말 대단해요!' };
    }
    if (completionRate >= 0.7) {
      return { emoji: '🌟', text: '오늘 정말 열심히 했어요! 자랑스러워요.' };
    }
    if (completionRate >= 0.5) {
      return { emoji: '👍', text: '절반 이상 해냈어요! 수고했어요.' };
    }
    if (completionRate > 0) {
      return { emoji: '💪', text: '조금이라도 한 게 중요해요. 잘했어요!' };
    }
    // 0개 완료
    if (energy && energy <= 2) {
      return { emoji: '🫂', text: '에너지가 없는 날도 있어요. 푹 쉬세요.' };
    }
    if (mood && mood <= 2) {
      return { emoji: '💜', text: '힘든 하루였죠. 내일은 더 나을 거예요.' };
    }
    return { emoji: '🤗', text: '괜찮아요, 내일 다시 시작하면 돼요!' };
  };
  
  var messageData = getMessage();
  
  return React.createElement('div', { 
    className: cardBg + ' rounded-2xl p-4 mb-4 border ' + borderColor
  },
    // 헤더
    React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
      React.createElement('span', { className: 'text-3xl' }, messageData.emoji),
      React.createElement('div', null,
        React.createElement('p', { className: textPrimary + ' font-medium' }, messageData.text),
        React.createElement('p', { className: textSecondary + ' text-xs mt-0.5' },
          '오늘 ' + completedCount + '개 완료' + (streak > 0 ? ' • 🔥 ' + streak + '일 연속' : '')
        )
      )
    ),
    
    // 진행률 바
    React.createElement('div', { className: 'mb-3' },
      React.createElement('div', { 
        className: (darkMode ? 'bg-gray-700' : 'bg-gray-200') + ' h-2 rounded-full overflow-hidden' 
      },
        React.createElement('div', {
          className: 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] h-full rounded-full transition-all',
          style: { width: Math.round(completionRate * 100) + '%' }
        })
      )
    ),
    
    // 리뷰 버튼
    onOpenReview && React.createElement('button', {
      onClick: onOpenReview,
      className: 'w-full bg-white/10 hover:bg-white/20 py-2 rounded-xl text-sm font-medium ' + textPrimary + ' transition-all'
    }, '📝 하루 돌아보기')
  );
};

export { StreakCard, FailureCareModal, EveningCareCard, careMessages, getRandomMessage };
export default StreakCard;
