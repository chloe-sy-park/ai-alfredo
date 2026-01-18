/**
 * PenguinWidget - 홈 화면용 펭귄 위젯
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Sparkles, ShoppingBag, Backpack, TrendingUp } from 'lucide-react';
import { usePenguinStore, usePenguinLevel, getLevelTitle } from '../../stores/penguinStore';
import { PenguinAvatar } from './PenguinAvatar';

export const PenguinWidget: React.FC = () => {
  const { status, fetchStatus, openShop, openInventory } = usePenguinStore();
  const levelInfo = usePenguinLevel();

  useEffect(() => {
    if (!status) {
      fetchStatus();
    }
  }, [status, fetchStatus]);

  if (!status) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-card animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24" />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-card"
    >
      {/* 메인 정보 */}
      <div className="flex items-center gap-4">
        {/* 펭귄 아바타 */}
        <PenguinAvatar size="lg" showLevel onClick={openInventory} />

        {/* 상태 정보 */}
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary dark:text-white">
            {getLevelTitle(status.level)}
          </h3>

          {/* 경험치 바 */}
          {levelInfo && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} />
                  {levelInfo.currentExp} / {levelInfo.expForNextLevel} XP
                </span>
                <span>Lv.{levelInfo.level}</span>
              </div>
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#A996FF] to-[#7B68EE] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* 통계 */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-sm">
              <Coins size={14} className="text-[#FFD43B]" />
              <span className="font-medium text-text-primary dark:text-white">
                {status.coins}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
              <TrendingUp size={14} />
              <span>{status.streak_days}일 연속</span>
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={openShop}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#A996FF]/10 hover:bg-[#A996FF]/20 text-[#A996FF] rounded-lg transition-colors"
        >
          <ShoppingBag size={16} />
          <span className="text-sm font-medium">상점</span>
        </button>
        <button
          onClick={openInventory}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 rounded-lg transition-colors"
        >
          <Backpack size={16} />
          <span className="text-sm font-medium">인벤토리</span>
        </button>
      </div>
    </motion.div>
  );
};

/**
 * 미니 펭귄 상태 바 - 하단 바용
 */
export const PenguinStatusBar: React.FC = () => {
  const { status, openShop } = usePenguinStore();
  const levelInfo = usePenguinLevel();

  if (!status) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={openShop}
      className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-800 rounded-full shadow-md"
    >
      <div className="w-6 h-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
        <img
          src="/assets/alfredo/avatar/alfredo-avatar-24.png"
          alt="알프레도"
          className="w-full h-full object-contain"
          onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-xl">🎩</span>'; }}
        />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-[#A996FF]">Lv.{status.level}</span>
        <span className="text-neutral-300 dark:text-neutral-600">|</span>
        <span className="flex items-center gap-1">
          <Coins size={12} className="text-[#FFD43B]" />
          <span className="text-neutral-600 dark:text-neutral-400">{status.coins}</span>
        </span>
      </div>
      {levelInfo && levelInfo.progress > 80 && (
        <span className="text-xs text-[#A996FF] animate-pulse">✨</span>
      )}
    </motion.button>
  );
};

export default PenguinWidget;
