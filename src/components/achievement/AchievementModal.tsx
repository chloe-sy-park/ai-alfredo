/**
 * AchievementModal.tsx
 * 업적 전체 목록 모달
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Target, Flame, Star, Gift } from 'lucide-react';
import {
  useAchievementStore,
  ACHIEVEMENTS,
  AchievementCategory,
} from '../../stores/achievementStore';
import { AchievementBadge } from './AchievementBadge';
import { useState } from 'react';

const CATEGORY_INFO: Record<AchievementCategory, { label: string; icon: React.ReactNode }> = {
  task: { label: '태스크', icon: <Target size={16} /> },
  streak: { label: '연속 달성', icon: <Flame size={16} /> },
  level: { label: '레벨', icon: <Star size={16} /> },
  special: { label: '특별', icon: <Gift size={16} /> },
};

export function AchievementModal() {
  const { isModalOpen, closeModal, unlocked } = useAchievementStore();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const filteredAchievements =
    selectedCategory === 'all'
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter((a) => a.category === selectedCategory);

  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={closeModal}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg max-h-[85vh] bg-white rounded-t-3xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-500" size={24} />
                <h2 className="text-lg font-bold text-neutral-900">업적</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* 진행 상황 */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-yellow-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600">달성 진행률</span>
                <span className="text-sm font-bold text-purple-600">
                  {unlockedCount} / {totalCount}
                </span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-purple-500 to-yellow-500"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1 text-center">
                {progressPercent}% 완료
              </p>
            </div>

            {/* 카테고리 필터 */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`
                  px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1
                  ${selectedCategory === 'all'
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'bg-neutral-100 text-neutral-600'
                  }
                `}
              >
                전체
              </button>
              {(Object.keys(CATEGORY_INFO) as AchievementCategory[]).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1
                    ${selectedCategory === category
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'bg-neutral-100 text-neutral-600'
                    }
                  `}
                >
                  {CATEGORY_INFO[category].icon}
                  {CATEGORY_INFO[category].label}
                </button>
              ))}
            </div>

            {/* 업적 그리드 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 gap-2">
                {filteredAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    size="md"
                    showProgress
                  />
                ))}
              </div>

              {filteredAchievements.length === 0 && (
                <div className="text-center py-8 text-neutral-400">
                  해당 카테고리에 업적이 없습니다
                </div>
              )}
            </div>

            {/* 하단 안내 */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50">
              <p className="text-xs text-neutral-500 text-center">
                태스크를 완료하고 업적을 달성해보세요!
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AchievementModal;
