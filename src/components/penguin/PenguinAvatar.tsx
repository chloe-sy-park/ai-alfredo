/**
 * PenguinAvatar - 펭귄 아바타 컴포넌트
 * 장착된 아이템에 따라 커스텀 펭귄 표시
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useEquippedItems, usePenguinLevel } from '../../stores/penguinStore';

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

const TEXT_SIZES = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
  xl: 'text-7xl',
};

export const PenguinAvatar: React.FC<PenguinAvatarProps> = ({
  size = 'md',
  showLevel = false,
  animate = true,
  onClick,
}) => {
  const equippedItems = useEquippedItems();
  const levelInfo = usePenguinLevel();

  // 장착된 아이템별 이모지 오버레이
  const getAccessoryEmoji = () => {
    const hat = equippedItems.find((item) => item.category === 'hat');
    const accessory = equippedItems.find((item) => item.category === 'accessory');

    // 기본 펭귄 + 장착 아이템 조합
    // 실제 구현에서는 SVG나 이미지를 사용할 수 있음
    if (hat?.name.includes('왕관')) return '👑';
    if (hat?.name.includes('모자')) return '🎩';
    if (accessory?.name.includes('안경')) return '🤓';
    if (accessory?.name.includes('넥타이')) return '👔';

    return null;
  };

  const accessory = getAccessoryEmoji();

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
      `}
      onClick={onClick}
    >
      {/* 펭귄 이모지 */}
      <span className={TEXT_SIZES[size]} role="img" aria-label="펭귄">
        🐧
      </span>

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
 * 미니 펭귄 - 작은 상태 표시용
 */
export const MiniPenguin: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="text-2xl hover:animate-bounce"
    >
      🐧
    </motion.button>
  );
};

export default PenguinAvatar;
