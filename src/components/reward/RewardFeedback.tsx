/**
 * RewardFeedback.tsx
 * 태스크 완료 시 즉각적인 보상 피드백 컴포넌트
 * ADHD 친화적: 0.5초 이내 즉각 반응, 작은 성취 인정
 */

import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';

// === 보상 피드백 스토어 ===
interface RewardNotification {
  id: string;
  type: 'xp' | 'coins' | 'levelUp' | 'streak';
  amount?: number;
  message?: string;
}

interface RewardFeedbackStore {
  notifications: RewardNotification[];
  showReward: (notification: Omit<RewardNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useRewardFeedbackStore = create<RewardFeedbackStore>((set) => ({
  notifications: [],

  showReward: (notification) => {
    const id = `reward-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }]
    }));

    // 자동 제거 (2초 후)
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }));
    }, 2000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }));
  }
}));

// === 개별 보상 알림 컴포넌트 ===
interface RewardToastProps {
  notification: RewardNotification;
  index: number;
}

function RewardToast({ notification, index }: RewardToastProps) {
  const getContent = () => {
    switch (notification.type) {
      case 'xp':
        return {
          icon: '✨',
          text: `+${notification.amount} XP`,
          color: 'from-purple-500 to-indigo-500',
          bgColor: 'bg-purple-50'
        };
      case 'coins':
        return {
          icon: '🪙',
          text: `+${notification.amount}`,
          color: 'from-yellow-400 to-orange-400',
          bgColor: 'bg-yellow-50'
        };
      case 'levelUp':
        return {
          icon: '🎉',
          text: notification.message || '레벨 업!',
          color: 'from-pink-500 to-rose-500',
          bgColor: 'bg-pink-50'
        };
      case 'streak':
        return {
          icon: '🔥',
          text: notification.message || '연속 달성!',
          color: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-50'
        };
      default:
        return {
          icon: '⭐',
          text: '+1',
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50'
        };
    }
  };

  const content = getContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 300,
        delay: index * 0.1
      }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full shadow-lg
        ${content.bgColor} border border-white/50
      `}
    >
      <span className="text-xl">{content.icon}</span>
      <span
        className={`
          font-bold text-transparent bg-clip-text bg-gradient-to-r
          ${content.color}
        `}
      >
        {content.text}
      </span>
    </motion.div>
  );
}

// === 메인 피드백 컨테이너 ===
export function RewardFeedbackContainer() {
  const notifications = useRewardFeedbackStore((state) => state.notifications);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => (
          <RewardToast
            key={notification.id}
            notification={notification}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// === 헬퍼 함수 ===
export function showXPReward(amount: number = 10) {
  useRewardFeedbackStore.getState().showReward({ type: 'xp', amount });
}

export function showCoinsReward(amount: number) {
  useRewardFeedbackStore.getState().showReward({ type: 'coins', amount });
}

export function showLevelUpReward(level: number) {
  useRewardFeedbackStore.getState().showReward({
    type: 'levelUp',
    message: `Level ${level} 달성!`
  });
}

export function showStreakReward(days: number) {
  useRewardFeedbackStore.getState().showReward({
    type: 'streak',
    message: `${days}일 연속!`
  });
}

export default RewardFeedbackContainer;
