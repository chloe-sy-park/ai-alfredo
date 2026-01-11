import React, { useEffect, useState } from 'react';
import { usePersonalityStore, EMOTIONAL_EXPRESSIONS } from '../../stores/personalityStore';

/**
 * 🐧 Alfredo Avatar - 감정 표현 + 애니메이션
 * Focus Friend 스타일: 캐릭터의 감정이 사용자 행동과 연결
 * "캐릭터를 실망시키고 싶지 않음" - 부드러운 동기부여
 */

// 기본 펜귄 이모지
// const PENGUIN_FACES = {
//   neutral: '🐧',
//   happy: '😊',
//   proud: '🥹',
//   sad: '😢',
//   worried: '😟',
//   excited: '🤩',
//   sleepy: '😴',
//   encouraging: '💪',
// };

const AlfredoAvatar = ({ 
  size = 'md', 
  showBubble = false, 
  bubbleText = '',
  onClick,
  className = '',
}) => {
  const { currentEmotion, getEmoji, getAnimation } = usePersonalityStore();
  const [isAnimating, setIsAnimating] = useState(false);

  const emoji = getEmoji();
  const animation = getAnimation();

  // 애니메이션 트리거
  useEffect(() => {
    if (animation !== 'none') {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentEmotion, animation]);

  // 사이즈 클래스
  const sizeClasses = {
    xs: 'w-8 h-8 text-lg',
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-4xl',
    lg: 'w-24 h-24 text-6xl',
    xl: 'w-32 h-32 text-7xl',
  };

  // 애니메이션 클래스
  const animationClasses = {
    none: '',
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    shake: 'animate-shake',
    spin: 'animate-spin',
    droop: 'animate-droop',
    tremble: 'animate-tremble',
    sway: 'animate-sway',
  };

  // 배경색 (감정에 따라)
  const bgColors = {
    neutral: 'bg-purple-100',
    happy: 'bg-green-100',
    proud: 'bg-yellow-100',
    sad: 'bg-blue-100',
    worried: 'bg-orange-100',
    excited: 'bg-pink-100',
    sleepy: 'bg-gray-100',
    encouraging: 'bg-purple-100',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* 메인 아바타 */}
      <button
        onClick={onClick}
        className={`
          ${sizeClasses[size]}
          ${bgColors[currentEmotion] || bgColors.neutral}
          ${isAnimating ? animationClasses[animation] : ''}
          rounded-full flex items-center justify-center
          shadow-lg hover:shadow-xl
          transition-all duration-300
          transform hover:scale-105
        `}
      >
        <span className="select-none">{emoji}</span>
      </button>

      {/* 말풍선 */}
      {showBubble && bubbleText && (
        <div className="absolute -top-2 left-full ml-2 w-max max-w-48">
          <div className="relative bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100">
            {/* 삼각형 포인터 */}
            <div className="absolute top-4 -left-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white" />
            <p className="text-sm text-gray-700">{bubbleText}</p>
          </div>
        </div>
      )}

      {/* 감정 인디케이터 (작은 동그라미) */}
      {currentEmotion !== 'neutral' && size !== 'xs' && size !== 'sm' && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center">
          <span className="text-xs">
            {EMOTIONAL_EXPRESSIONS[currentEmotion]?.emoji}
          </span>
        </div>
      )}
    </div>
  );
};

export default AlfredoAvatar;
