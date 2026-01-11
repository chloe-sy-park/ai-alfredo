import React from 'react';

interface AlfredoAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  mood?: 'happy' | 'neutral' | 'thinking' | 'tired';
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const moodEmoji = {
  happy: '🐧',
  neutral: '🐧',
  thinking: '🐧',
  tired: '🐧',
};

/**
 * 알프레도 펭귄 아바타 컴포넌트
 */
const AlfredoAvatar: React.FC<AlfredoAvatarProps> = ({ 
  size = 'md', 
  mood = 'neutral',
  className = '' 
}) => {
  return (
    <div 
      className={`
        ${sizeMap[size]} 
        rounded-full 
        bg-gradient-to-br from-[#A996FF] to-[#8B7CF7]
        flex items-center justify-center
        shadow-md shadow-[#A996FF]/20
        flex-shrink-0
        ${className}
      `}
    >
      <span role="img" aria-label="Alfredo penguin">
        {moodEmoji[mood]}
      </span>
    </div>
  );
};

export default AlfredoAvatar;
