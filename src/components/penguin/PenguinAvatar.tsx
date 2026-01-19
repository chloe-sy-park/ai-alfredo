/**
 * PenguinAvatar - 알프레도 아바타 컴포넌트
 * PNG 이미지 기반 커스텀 아바타
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEquippedItems, usePenguinLevel } from '../../stores/penguinStore';
import { getAvatarForSize, getAvatarSrcSet } from '../alfredo/AlfredoAssets';

interface PenguinAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  animate?: boolean;
  onClick?: () => void;
}

const SIZES = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
};

export const PenguinAvatar: React.FC<PenguinAvatarProps> = ({
  size = 'md',
  showLevel = false,
  animate = true,
  onClick,
}) => {
  const equippedItems = useEquippedItems();
  const levelInfo = usePenguinLevel();
  const [imageError, setImageError] = useState(false);

  // 장착된 아이템별 이모지 오버레이
  const getAccessoryEmoji = () => {
    const hat = equippedItems.find((item) => item.category === 'hat');
    const accessory = equippedItems.find((item) => item.category === 'accessory');

    if (hat?.name.includes('왕관')) return '👑';
    if (hat?.name.includes('모자')) return '🎩';
    if (accessory?.name.includes('안경')) return '🤓';
    if (accessory?.name.includes('넥타이')) return '👔';

    return null;
  };

  const accessory = getAccessoryEmoji();

  // 이미지 로드 실패 시 폴백
  const handleImageError = () => {
    setImageError(true);
  };

  const avatarContent = (
    <div
      className={`
        ${SIZES[size]}
        relative rounded-full
        bg-gradient-to-br from-[#E8E4FF] to-[#F0F8FF]
        dark:from-neutral-700 dark:to-neutral-800
        flex items-center justify-center
        ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
        shadow-lg
        overflow-hidden
      `}
      onClick={onClick}
    >
      {/* 알프레도 PNG 이미지 */}
      {!imageError ? (
        <img
          src={getAvatarForSize(size)}
          srcSet={getAvatarSrcSet(size)}
          alt="알프레도"
          className="w-[85%] h-[85%] object-contain"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        // 폴백: 이모지
        <span
          className={`${
            size === 'sm'
              ? 'text-xl'
              : size === 'md'
                ? 'text-3xl'
                : size === 'lg'
                  ? 'text-5xl'
                  : 'text-7xl'
          }`}
          role="img"
          aria-label="알프레도"
        >
          🎩
        </span>
      )}

      {/* 장착 아이템 오버레이 */}
      {accessory && (
        <span
          className={`absolute -top-1 -right-1 ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          }`}
        >
          {accessory}
        </span>
      )}

      {/* 레벨 뱃지 */}
      {showLevel && levelInfo && (
        <div
          className={`
            absolute -bottom-1 -right-1
            bg-[#A996FF] text-white
            rounded-full px-1.5 py-0.5
            text-xs font-bold
            shadow-md
          `}
        >
          Lv.{levelInfo.level}
        </div>
      )}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: onClick ? 1.05 : 1 }}
        whileTap={onClick ? { scale: 0.95 } : undefined}
      >
        {avatarContent}
      </motion.div>
    );
  }

  return avatarContent;
};

/**
 * 미니 펭귄 - 작은 상태 표시용 (PNG 버전)
 */
export const MiniPenguin: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center"
    >
      {!imageError ? (
        <img
          src="/assets/alfredo/avatar/alfredo-avatar-32.png"
          alt="알프레도"
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-2xl">🎩</span>
      )}
    </motion.button>
  );
};

/**
 * 인라인 알프레도 아이콘 - 텍스트 옆에 표시할 때 사용
 */
export const InlineAlfredo: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return <span className={`inline-block ${className}`}>🎩</span>;
  }

  return (
    <img
      src="/assets/alfredo/avatar/alfredo-avatar-24.png"
      alt="알프레도"
      className={`inline-block w-5 h-5 object-contain align-text-bottom ${className}`}
      onError={() => setImageError(true)}
    />
  );
};

export default PenguinAvatar;
