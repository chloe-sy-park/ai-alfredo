import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// 💜 Forgiving UX 시스템 (Headspace/Duolingo 스타일)
// "실패해도 괜찮아요" - 비처벌적 동기부여
// ============================================

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  
  // Forgiving 기능
  streakFreezes: number; // 사용 가능한 프리즈 수
  freezesUsed: number; // 사용한 프리즈 수
  
  // 설정
  hideStreak: boolean; // 스트릭 숨기기
  streakNotifications: boolean;
}

interface RolloverTask {
  id: string;
  title: string;
  originalDate: string;
  rolledOverAt: string;
  rolloverCount: number;
}

interface ForgivingState {
  streak: StreakData;
  rolloverTasks: RolloverTask[];
  
  // 격려 메시지 히스토리
  encouragementHistory: Array<{
    message: string;
    context: 'missed' | 'returned' | 'freeze' | 'rollover';
    timestamp: string;
  }>;
  
  // 액션
  recordActivity: () => void;
  useStreakFreeze: () => boolean;
  addStreakFreeze: (count?: number) => void;
  toggleHideStreak: () => void;
  
  // 롤오버
  rolloverTask: (taskId: string, title: string) => void;
  clearRollover: (taskId: string) => void;
  
  // 상태 체크
  checkStreakStatus: () => { 
    isActive: boolean; 
    needsFreeze: boolean; 
    daysGap: number;
    encouragement: string;
  };
  
  // 격려 메시지
  getEncouragement: (context: 'missed' | 'returned' | 'freeze' | 'rollover') => string;
}

const ENCOURAGEMENT_MESSAGES = {
  missed: [
    '괜찮아요, 쉬어간 것도 필요했던 거예요 💜',
    '완벽하지 않아도 돼요. 다시 시작하면 돼요!',
    '어제는 어제고, 오늘은 새로운 시작이에요',
    '멈춰도 괜찮아요. 중요한 건 다시 시작하는 거예요',
    '자책하지 마세요. Boss는 충분히 잘하고 있어요',
  ],
  returned: [
    '다시 돌아왔네요! 반가워요 🫂',
    '돌아와줘서 고마워요! 같이 다시 해봐요',
    '새로운 스트릭, 오늘부터 시작이에요!',
    '다시 만나서 기뻐요! 화이팅!',
    'Boss가 돌아왔어요! 응원할게요 💪',
  ],
  freeze: [
    '스트릭 프리즈 사용! 내일 다시 만나요 ❄️',
    '오늘은 쉬어도 스트릭은 지켜줄게요!',
    '프리즈 발동! 건강이 더 중요해요',
    '스트릭 보호 완료! 푹 쉬세요~',
    '오늘 하루 면제! 내일 봐요 🐧',
  ],
  rollover: [
    '내일로 미뤘어요. 괜찮아요, 기다릴게요!',
    '오늘 못 한 건 내일의 Boss가 해줄 거예요',
    '미뤄도 돼요. 사라지지 않아요~',
    '자동으로 내일로 옮겨놨어요!',
    '오늘은 쉬고 내일 해요. 응원할게요!',
  ],
};

export const useForgivingStore = create<ForgivingState>()(
  persist(
    (set, get) => ({
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakFreezes: 2, // 기본 2개
        freezesUsed: 0,
        hideStreak: false,
        streakNotifications: true,
      },
      rolloverTasks: [],
      encouragementHistory: [],

      recordActivity: () => {
        const today = new Date().toISOString().split('T')[0];
        
        set(state => {
          const { lastActiveDate, currentStreak, longestStreak } = state.streak;
          
          if (lastActiveDate === today) {
            // 오늘 이미 활동함
            return state;
          }
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          let newStreak = 1;
          if (lastActiveDate === yesterdayStr) {
            // 연속 달성
            newStreak = currentStreak + 1;
          }
          
          return {
            streak: {
              ...state.streak,
              currentStreak: newStreak,
              longestStreak: Math.max(longestStreak, newStreak),
              lastActiveDate: today,
            },
          };
        });
      },

      useStreakFreeze: () => {
        const { streak } = get();
        
        if (streak.streakFreezes <= 0) {
          return false;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const message = get().getEncouragement('freeze');
        
        set(state => ({
          streak: {
            ...state.streak,
            streakFreezes: state.streak.streakFreezes - 1,
            freezesUsed: state.streak.freezesUsed + 1,
            lastActiveDate: today, // 프리즈가 활동으로 간주
          },
          encouragementHistory: [
            ...state.encouragementHistory.slice(-20),
            { message, context: 'freeze', timestamp: new Date().toISOString() }
          ],
        }));
        
        return true;
      },

      addStreakFreeze: (count = 1) => {
        set(state => ({
          streak: {
            ...state.streak,
            streakFreezes: Math.min(state.streak.streakFreezes + count, 5), // 최대 5개
          },
        }));
      },

      toggleHideStreak: () => {
        set(state => ({
          streak: {
            ...state.streak,
            hideStreak: !state.streak.hideStreak,
          },
        }));
      },

      rolloverTask: (taskId, title) => {
        const now = new Date().toISOString();
        const today = now.split('T')[0];
        const message = get().getEncouragement('rollover');
        
        set(state => {
          const existing = state.rolloverTasks.find(t => t.id === taskId);
          
          if (existing) {
            return {
              rolloverTasks: state.rolloverTasks.map(t =>
                t.id === taskId
                  ? { ...t, rolledOverAt: now, rolloverCount: t.rolloverCount + 1 }
                  : t
              ),
            };
          }
          
          return {
            rolloverTasks: [
              ...state.rolloverTasks,
              { id: taskId, title, originalDate: today, rolledOverAt: now, rolloverCount: 1 }
            ],
            encouragementHistory: [
              ...state.encouragementHistory.slice(-20),
              { message, context: 'rollover', timestamp: now }
            ],
          };
        });
      },

      clearRollover: (taskId) => {
        set(state => ({
          rolloverTasks: state.rolloverTasks.filter(t => t.id !== taskId),
        }));
      },

      checkStreakStatus: () => {
        const { streak } = get();
        const { lastActiveDate, currentStreak } = streak;
        
        if (!lastActiveDate) {
          return {
            isActive: false,
            needsFreeze: false,
            daysGap: 0,
            encouragement: '첫 스트릭을 시작해볼까요? 🌱',
          };
        }
        
        const today = new Date();
        const lastActive = new Date(lastActiveDate);
        const diffTime = today.getTime() - lastActive.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          return {
            isActive: true,
            needsFreeze: false,
            daysGap: 0,
            encouragement: `${currentStreak}일 연속! 대단해요 🔥`,
          };
        } else if (diffDays === 1) {
          return {
            isActive: true,
            needsFreeze: false,
            daysGap: 1,
            encouragement: '오늘도 이어가볼까요? 💪',
          };
        } else {
          return {
            isActive: false,
            needsFreeze: streak.streakFreezes > 0,
            daysGap: diffDays,
            encouragement: get().getEncouragement('missed'),
          };
        }
      },

      getEncouragement: (context) => {
        const messages = ENCOURAGEMENT_MESSAGES[context];
        return messages[Math.floor(Math.random() * messages.length)];
      },
    }),
    {
      name: 'alfredo-forgiving-store',
    }
  )
);

export default useForgivingStore;
