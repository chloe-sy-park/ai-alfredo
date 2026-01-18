/**
 * AchievementBadge.tsx
 * 개별 업적 배지 컴포넌트
 */

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Achievement, useAchievementStore } from '../../stores/achievementStore';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showProgress = true,
}: AchievementBadgeProps) {
  const isUnlocked = useAchievementStore((state) => state.isUnlocked(achievement.id));
  const getProgress = useAchievementStore((state) => state.getProgress);
  const progress = getProgress(achievement.id);

  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const containerClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  return (
    <motion.div
      className={`flex flex-col items-center ${containerClasses[size]}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* 배지 아이콘 */}
      <div
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center
          ${isUnlocked
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
            : 'bg-neutral-200'
          }
          relative overflow-hidden
        `}
      >
        {isUnlocked ? (
          <span className="drop-shadow-sm">{achievement.icon}</span>
        ) : (
          <>
            <Lock size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} className="text-neutral-400" />
            {/* 진행도 표시 (원형) */}
            {showProgress && progress > 0 && (
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-purple-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${progress * 2.89} 289`}
                  className="text-purple-500"
                />
              </svg>
            )}
          </>
        )}
      </div>

      {/* 업적 이름 */}
      <p
        className={`
          mt-2 text-center font-medium
          ${size === 'sm' ? 'text-xs' : 'text-sm'}
          ${isUnlocked ? 'text-neutral-900' : 'text-neutral-400'}
        `}
      >
        {achievement.name}
      </p>

      {/* 설명 (md, lg 크기에서만) */}
      {size !== 'sm' && (
        <p className="text-xs text-neutral-500 text-center mt-0.5">
          {achievement.description}
        </p>
      )}

      {/* 보상 정보 (해금 시) */}
      {isUnlocked && size !== 'sm' && (
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span className="text-purple-600">+{achievement.rewardXP} XP</span>
          <span className="text-yellow-600">+{achievement.rewardCoins} 코인</span>
        </div>
      )}
    </motion.div>
  );
}

export default AchievementBadge;
