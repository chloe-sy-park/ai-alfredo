/**
 * achievementStore.ts
 * 업적(Achievement) 시스템 상태 관리
 *
 * 알프레도 철학: 작은 성취 인정 - ADHD 친화적 즉각 보상
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// === 업적 정의 ===

export type AchievementCategory = 'task' | 'streak' | 'level' | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string; // emoji
  requirement: number; // 달성 조건 수치
  rewardXP: number;
  rewardCoins: number;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
  notified: boolean; // 알림 표시 여부
}

// === 업적 정의 목록 ===

export const ACHIEVEMENTS: Achievement[] = [
  // 태스크 관련
  {
    id: 'first-task',
    name: '첫 발걸음',
    description: '첫 번째 태스크 완료',
    category: 'task',
    icon: '🎯',
    requirement: 1,
    rewardXP: 10,
    rewardCoins: 5,
  },
  {
    id: 'task-10',
    name: '꾸준한 시작',
    description: '태스크 10개 완료',
    category: 'task',
    icon: '⭐',
    requirement: 10,
    rewardXP: 30,
    rewardCoins: 15,
  },
  {
    id: 'task-50',
    name: '성실한 일꾼',
    description: '태스크 50개 완료',
    category: 'task',
    icon: '🏆',
    requirement: 50,
    rewardXP: 100,
    rewardCoins: 50,
  },
  {
    id: 'task-100',
    name: '백전백승',
    description: '태스크 100개 완료',
    category: 'task',
    icon: '👑',
    requirement: 100,
    rewardXP: 200,
    rewardCoins: 100,
  },
  {
    id: 'task-500',
    name: '마스터 플래너',
    description: '태스크 500개 완료',
    category: 'task',
    icon: '🎖️',
    requirement: 500,
    rewardXP: 500,
    rewardCoins: 250,
  },

  // 연속 달성 (스트릭)
  {
    id: 'streak-3',
    name: '3일 연속',
    description: '3일 연속 태스크 완료',
    category: 'streak',
    icon: '🔥',
    requirement: 3,
    rewardXP: 20,
    rewardCoins: 10,
  },
  {
    id: 'streak-7',
    name: '일주일 챔피언',
    description: '7일 연속 태스크 완료',
    category: 'streak',
    icon: '💪',
    requirement: 7,
    rewardXP: 50,
    rewardCoins: 25,
  },
  {
    id: 'streak-14',
    name: '2주의 기적',
    description: '14일 연속 태스크 완료',
    category: 'streak',
    icon: '🌟',
    requirement: 14,
    rewardXP: 100,
    rewardCoins: 50,
  },
  {
    id: 'streak-30',
    name: '한 달의 습관',
    description: '30일 연속 태스크 완료',
    category: 'streak',
    icon: '🏅',
    requirement: 30,
    rewardXP: 200,
    rewardCoins: 100,
  },

  // 레벨 관련
  {
    id: 'level-5',
    name: '성장하는 펭귄',
    description: '레벨 5 달성',
    category: 'level',
    icon: '🐧',
    requirement: 5,
    rewardXP: 50,
    rewardCoins: 25,
  },
  {
    id: 'level-10',
    name: '숙련된 펭귄',
    description: '레벨 10 달성',
    category: 'level',
    icon: '🎓',
    requirement: 10,
    rewardXP: 100,
    rewardCoins: 50,
  },

  // 특별 업적
  {
    id: 'early-bird',
    name: '일찍 일어난 새',
    description: '오전 6시 전에 태스크 완료',
    category: 'special',
    icon: '🌅',
    requirement: 1,
    rewardXP: 30,
    rewardCoins: 15,
  },
  {
    id: 'night-owl',
    name: '밤의 올빼미',
    description: '자정 이후에 태스크 완료',
    category: 'special',
    icon: '🦉',
    requirement: 1,
    rewardXP: 30,
    rewardCoins: 15,
  },
  {
    id: 'weekend-warrior',
    name: '주말 전사',
    description: '주말에 태스크 5개 완료',
    category: 'special',
    icon: '⚔️',
    requirement: 5,
    rewardXP: 40,
    rewardCoins: 20,
  },
];

// === 스토어 인터페이스 ===

interface AchievementState {
  // 잠금 해제된 업적
  unlocked: UnlockedAchievement[];

  // 진행 상황 추적
  progress: {
    totalTasksCompleted: number;
    currentStreak: number;
    maxStreak: number;
    weekendTasksCompleted: number;
    earlyBirdCompleted: boolean;
    nightOwlCompleted: boolean;
    currentLevel: number;
  };

  // 알림 큐
  pendingNotifications: string[]; // achievement IDs

  // 모달 상태
  isModalOpen: boolean;

  // Actions
  checkAndUnlockAchievements: () => Achievement[];
  incrementTasksCompleted: () => void;
  updateStreak: (days: number) => void;
  updateLevel: (level: number) => void;
  checkSpecialConditions: () => void;
  markNotified: (achievementId: string) => void;
  popNotification: () => Achievement | null;
  openModal: () => void;
  closeModal: () => void;

  // Getters
  isUnlocked: (achievementId: string) => boolean;
  getProgress: (achievementId: string) => number;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlocked: [],
      progress: {
        totalTasksCompleted: 0,
        currentStreak: 0,
        maxStreak: 0,
        weekendTasksCompleted: 0,
        earlyBirdCompleted: false,
        nightOwlCompleted: false,
        currentLevel: 1,
      },
      pendingNotifications: [],
      isModalOpen: false,

      // 업적 달성 체크 및 잠금 해제
      checkAndUnlockAchievements: () => {
        const { unlocked, progress } = get();
        const newlyUnlocked: Achievement[] = [];

        ACHIEVEMENTS.forEach((achievement) => {
          // 이미 해금됨
          if (unlocked.some(u => u.achievementId === achievement.id)) {
            return;
          }

          let shouldUnlock = false;

          switch (achievement.category) {
            case 'task':
              shouldUnlock = progress.totalTasksCompleted >= achievement.requirement;
              break;
            case 'streak':
              shouldUnlock = progress.currentStreak >= achievement.requirement;
              break;
            case 'level':
              shouldUnlock = progress.currentLevel >= achievement.requirement;
              break;
            case 'special':
              if (achievement.id === 'early-bird') {
                shouldUnlock = progress.earlyBirdCompleted;
              } else if (achievement.id === 'night-owl') {
                shouldUnlock = progress.nightOwlCompleted;
              } else if (achievement.id === 'weekend-warrior') {
                shouldUnlock = progress.weekendTasksCompleted >= achievement.requirement;
              }
              break;
          }

          if (shouldUnlock) {
            newlyUnlocked.push(achievement);
          }
        });

        if (newlyUnlocked.length > 0) {
          set((state) => ({
            unlocked: [
              ...state.unlocked,
              ...newlyUnlocked.map((a) => ({
                achievementId: a.id,
                unlockedAt: new Date().toISOString(),
                notified: false,
              })),
            ],
            pendingNotifications: [
              ...state.pendingNotifications,
              ...newlyUnlocked.map((a) => a.id),
            ],
          }));
        }

        return newlyUnlocked;
      },

      // 태스크 완료 수 증가
      incrementTasksCompleted: () => {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        set((state) => ({
          progress: {
            ...state.progress,
            totalTasksCompleted: state.progress.totalTasksCompleted + 1,
            earlyBirdCompleted: state.progress.earlyBirdCompleted || hour < 6,
            nightOwlCompleted: state.progress.nightOwlCompleted || hour >= 0 && hour < 5,
            weekendTasksCompleted: isWeekend
              ? state.progress.weekendTasksCompleted + 1
              : state.progress.weekendTasksCompleted,
          },
        }));
      },

      // 스트릭 업데이트
      updateStreak: (days) => {
        set((state) => ({
          progress: {
            ...state.progress,
            currentStreak: days,
            maxStreak: Math.max(state.progress.maxStreak, days),
          },
        }));
      },

      // 레벨 업데이트
      updateLevel: (level) => {
        set((state) => ({
          progress: {
            ...state.progress,
            currentLevel: level,
          },
        }));
      },

      // 특별 조건 체크 (시간대 기반)
      checkSpecialConditions: () => {
        // 이미 incrementTasksCompleted에서 처리됨
      },

      // 알림 표시 완료
      markNotified: (achievementId) => {
        set((state) => ({
          unlocked: state.unlocked.map((u) =>
            u.achievementId === achievementId ? { ...u, notified: true } : u
          ),
          pendingNotifications: state.pendingNotifications.filter(
            (id) => id !== achievementId
          ),
        }));
      },

      // 다음 알림 가져오기
      popNotification: () => {
        const { pendingNotifications } = get();
        if (pendingNotifications.length === 0) return null;

        const achievementId = pendingNotifications[0];
        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);

        if (achievement) {
          get().markNotified(achievementId);
        }

        return achievement || null;
      },

      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),

      // 잠금 해제 여부 확인
      isUnlocked: (achievementId) => {
        return get().unlocked.some((u) => u.achievementId === achievementId);
      },

      // 진행도 계산 (0-100%)
      getProgress: (achievementId) => {
        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (!achievement) return 0;

        const { progress } = get();
        let current = 0;

        switch (achievement.category) {
          case 'task':
            current = progress.totalTasksCompleted;
            break;
          case 'streak':
            current = progress.currentStreak;
            break;
          case 'level':
            current = progress.currentLevel;
            break;
          case 'special':
            if (achievement.id === 'early-bird') {
              current = progress.earlyBirdCompleted ? 1 : 0;
            } else if (achievement.id === 'night-owl') {
              current = progress.nightOwlCompleted ? 1 : 0;
            } else if (achievement.id === 'weekend-warrior') {
              current = progress.weekendTasksCompleted;
            }
            break;
        }

        return Math.min(100, (current / achievement.requirement) * 100);
      },
    }),
    {
      name: 'achievement-store',
      partialize: (state: AchievementState) => ({
        unlocked: state.unlocked,
        progress: state.progress,
      }),
    }
  )
);

// === 헬퍼 함수 ===

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function getUnlockedCount(): number {
  return useAchievementStore.getState().unlocked.length;
}

export function getTotalAchievements(): number {
  return ACHIEVEMENTS.length;
}

export default useAchievementStore;
