/**
 * AchievementNotification.tsx
 * 업적 해금 알림 컴포넌트 (토스트)
 *
 * ADHD 친화적: 즉각적이고 시각적인 보상 피드백
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Achievement, useAchievementStore } from '../../stores/achievementStore';
import { usePenguinStore } from '../../stores/penguinStore';

interface NotificationItem {
  id: string;
  achievement: Achievement;
}

export function AchievementNotification() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const popNotification = useAchievementStore((state) => state.popNotification);
  const pendingCount = useAchievementStore((state) => state.pendingNotifications.length);
  const { addExperience, addCoins } = usePenguinStore();

  // 대기 중인 알림이 있으면 하나씩 표시
  useEffect(() => {
    if (pendingCount > 0 && notifications.length < 3) {
      const achievement = popNotification();
      if (achievement) {
        const id = `${achievement.id}-${Date.now()}`;
        setNotifications((prev) => [...prev, { id, achievement }]);

        // 보상 지급
        addExperience(achievement.rewardXP);
        addCoins(achievement.rewardCoins);

        // 자동 제거 (4초 후)
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 4000);
      }
    }
  }, [pendingCount, notifications.length, popNotification, addExperience, addCoins]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map(({ id, achievement }) => (
          <motion.div
            key={id}
            layout
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="pointer-events-auto"
            onClick={() => removeNotification(id)}
          >
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 rounded-2xl p-0.5 shadow-lg">
              <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
                {/* 업적 아이콘 */}
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-md"
                >
                  {achievement.icon}
                </motion.div>

                {/* 내용 */}
                <div className="flex-1">
                  <div className="flex items-center gap-1 text-xs text-yellow-600 font-medium mb-0.5">
                    <Trophy size={12} />
                    업적 달성!
                  </div>
                  <p className="font-bold text-neutral-900">{achievement.name}</p>
                  <p className="text-xs text-neutral-500">{achievement.description}</p>
                </div>

                {/* 보상 */}
                <div className="flex flex-col items-end gap-0.5">
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs font-bold text-purple-600"
                  >
                    +{achievement.rewardXP} XP
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs font-bold text-yellow-600"
                  >
                    +{achievement.rewardCoins} 코인
                  </motion.span>
                </div>
              </div>
            </div>

            {/* 파티클 효과 */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-yellow-400"
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 200}%`,
                    y: `${50 + (Math.random() - 0.5) * 200}%`,
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.05,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default AchievementNotification;
