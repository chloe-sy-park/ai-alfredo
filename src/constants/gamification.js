// === Gamification System ===

export const LEVEL_CONFIG = {
  // XP 필요량: 레벨 * 100
  getRequiredXP: (level) => level * 100,
  getLevel: (totalXP) => {
    let level = 1;
    let xpNeeded = 100;
    let accumulated = 0;
    while (accumulated + xpNeeded <= totalXP) {
      accumulated += xpNeeded;
      level++;
      xpNeeded = level * 100;
    }
    return { level, currentXP: totalXP - accumulated, requiredXP: xpNeeded, totalXP };
  },
};

// XP 보상 테이블
export const XP_REWARDS = {
  taskComplete: 20,          // 일반 태스크 완료
  taskCompleteHigh: 40,      // 중요 태스크 완료
  big3Complete: 30,          // Big3 태스크 완료
  allBig3Complete: 100,      // Big3 전체 완료 보너스
  focusSession: 25,          // 집중 세션 완료
  streakBonus: 10,           // 연속 달성 보너스 (per day)
  routineComplete: 15,       // 루틴 완료
  earlyBird: 50,             // 오전 중 Big3 완료
};

// 배지 정의
export const BADGES = [
  // 시작 배지
  { id: 'first_task', name: '첫 발걸음', icon: '🎯', description: '첫 번째 태스크 완료', condition: (stats) => stats.totalCompleted >= 1 },
  { id: 'first_big3', name: 'Big3 마스터', icon: '🏆', description: 'Big3 전체 완료', condition: (stats) => stats.big3Completed >= 1 },
  { id: 'first_focus', name: '집중의 시작', icon: '⚡', description: '첫 집중 세션 완료', condition: (stats) => stats.focusSessions >= 1 },
  
  // 연속 달성
  { id: 'streak_3', name: '3일 연속', icon: '🔥', description: '3일 연속 Big3 완료', condition: (stats) => stats.streak >= 3 },
  { id: 'streak_7', name: '일주일 불꽃', icon: '🔥', description: '7일 연속 Big3 완료', condition: (stats) => stats.streak >= 7 },
  { id: 'streak_30', name: '한 달의 기적', icon: '💎', description: '30일 연속 Big3 완료', condition: (stats) => stats.streak >= 30 },
  
  // 누적 달성
  { id: 'tasks_10', name: '열 걸음', icon: '👟', description: '10개 태스크 완료', condition: (stats) => stats.totalCompleted >= 10 },
  { id: 'tasks_50', name: '반백 달성', icon: '🎖️', description: '50개 태스크 완료', condition: (stats) => stats.totalCompleted >= 50 },
  { id: 'tasks_100', name: '백 전사', icon: '🏅', description: '100개 태스크 완료', condition: (stats) => stats.totalCompleted >= 100 },
  
  // 집중 시간
  { id: 'focus_1h', name: '집중 1시간', icon: '🧘', description: '누적 집중 1시간', condition: (stats) => stats.focusMinutes >= 60 },
  { id: 'focus_10h', name: '집중 10시간', icon: '🧠', description: '누적 집중 10시간', condition: (stats) => stats.focusMinutes >= 600 },
  
  // 특별 배지
  { id: 'early_bird', name: '얼리버드', icon: '🐦', description: '오전 9시 전 Big3 완료', condition: (stats) => stats.earlyBirdCount >= 1 },
  { id: 'night_owl', name: '나이트 아울', icon: '🦉', description: '밤 10시 이후 태스크 완료', condition: (stats) => stats.nightOwlCount >= 1 },
  { id: 'perfect_week', name: '완벽한 한 주', icon: '⭐', description: '일주일 내내 Big3 완료', condition: (stats) => stats.perfectWeeks >= 1 },
  
  // 레벨 배지
  { id: 'level_5', name: '견습생', icon: '🌱', description: '레벨 5 달성', condition: (stats) => stats.level >= 5 },
  { id: 'level_10', name: '숙련자', icon: '🌿', description: '레벨 10 달성', condition: (stats) => stats.level >= 10 },
  { id: 'level_20', name: '전문가', icon: '🌳', description: '레벨 20 달성', condition: (stats) => stats.level >= 20 },
  { id: 'level_50', name: '마스터', icon: '👑', description: '레벨 50 달성', condition: (stats) => stats.level >= 50 },
];

// 초기 게임 상태
export const initialGameState = {
  totalXP: 0,
  streak: 0,
  lastCompletionDate: null,
  totalCompleted: 0,
  big3Completed: 0,
  focusSessions: 0,
  focusMinutes: 0,
  earlyBirdCount: 0,
  nightOwlCount: 0,
  perfectWeeks: 0,
  unlockedBadges: [],
  weeklyXP: [0, 0, 0, 0, 0, 0, 0], // 일~토
  todayXP: 0,
  todayTasks: 0,
};
