// Habits Service - 습관 트래커

export interface Habit {
  id: string;
  title: string;
  icon: string;
  frequency: 'daily' | 'weekly';
  targetCount: number;
  unit?: string;
  createdAt: string;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  count: number;
  completed: boolean;
}

var HABITS_KEY = 'alfredo_habits';
var LOGS_KEY = 'alfredo_habit_logs';

// 기본 습관들
var DEFAULT_HABITS: Habit[] = [
  { id: 'habit_water', title: '물 마시기', icon: '💧', frequency: 'daily', targetCount: 8, unit: '잔', createdAt: new Date().toISOString() },
  { id: 'habit_exercise', title: '운동하기', icon: '🏃', frequency: 'daily', targetCount: 1, unit: '회', createdAt: new Date().toISOString() },
  { id: 'habit_sleep', title: '7시간 수면', icon: '😴', frequency: 'daily', targetCount: 1, unit: '회', createdAt: new Date().toISOString() }
];

// 습관 목록 가져오기
export function getHabits(): Habit[] {
  try {
    var stored = localStorage.getItem(HABITS_KEY);
    if (!stored) {
      // 기본 습관 설정
      localStorage.setItem(HABITS_KEY, JSON.stringify(DEFAULT_HABITS));
      return DEFAULT_HABITS;
    }
    return JSON.parse(stored) as Habit[];
  } catch (e) {
    return DEFAULT_HABITS;
  }
}

// 습관 저장
function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits:', e);
  }
}

// 습관 추가
export function addHabit(habit: Omit<Habit, 'id' | 'createdAt'>): Habit {
  var habits = getHabits();
  var newHabit: Habit = {
    ...habit,
    id: 'habit_' + Date.now(),
    createdAt: new Date().toISOString()
  };
  habits.push(newHabit);
  saveHabits(habits);
  return newHabit;
}

// 습관 삭제
export function deleteHabit(id: string): boolean {
  var habits = getHabits();
  var filtered = habits.filter(function(h) { return h.id !== id; });
  if (filtered.length === habits.length) return false;
  saveHabits(filtered);
  return true;
}

// 로그 가져오기
function getLogs(): HabitLog[] {
  try {
    var stored = localStorage.getItem(LOGS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as HabitLog[];
  } catch (e) {
    return [];
  }
}

// 로그 저장
function saveLogs(logs: HabitLog[]): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs:', e);
  }
}

// 오늘 날짜 문자열
function getTodayString(): string {
  var now = new Date();
  var year = now.getFullYear();
  var month = String(now.getMonth() + 1).padStart(2, '0');
  var day = String(now.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// 오늘의 습관 로그 가져오기
export function getTodayLogs(): HabitLog[] {
  var logs = getLogs();
  var today = getTodayString();
  return logs.filter(function(l) { return l.date === today; });
}

// 특정 습관의 오늘 로그
export function getTodayHabitLog(habitId: string): HabitLog | null {
  var logs = getTodayLogs();
  return logs.find(function(l) { return l.habitId === habitId; }) || null;
}

// 습관 체크 (카운트 증가)
export function incrementHabit(habitId: string): HabitLog {
  var logs = getLogs();
  var today = getTodayString();
  var habits = getHabits();
  var habit = habits.find(function(h) { return h.id === habitId; });
  
  var existingIndex = logs.findIndex(function(l) {
    return l.habitId === habitId && l.date === today;
  });
  
  if (existingIndex >= 0) {
    var log = logs[existingIndex];
    log.count += 1;
    log.completed = habit ? log.count >= habit.targetCount : true;
    saveLogs(logs);
    return log;
  } else {
    var newLog: HabitLog = {
      habitId: habitId,
      date: today,
      count: 1,
      completed: habit ? 1 >= habit.targetCount : true
    };
    logs.push(newLog);
    saveLogs(logs);
    return newLog;
  }
}

// 습관 완료 토글
export function toggleHabitComplete(habitId: string): HabitLog {
  var logs = getLogs();
  var today = getTodayString();
  var habits = getHabits();
  var habit = habits.find(function(h) { return h.id === habitId; });
  
  var existingIndex = logs.findIndex(function(l) {
    return l.habitId === habitId && l.date === today;
  });
  
  if (existingIndex >= 0) {
    var log = logs[existingIndex];
    if (log.completed) {
      log.count = 0;
      log.completed = false;
    } else {
      log.count = habit ? habit.targetCount : 1;
      log.completed = true;
    }
    saveLogs(logs);
    return log;
  } else {
    var newLog: HabitLog = {
      habitId: habitId,
      date: today,
      count: habit ? habit.targetCount : 1,
      completed: true
    };
    logs.push(newLog);
    saveLogs(logs);
    return newLog;
  }
}

// 오늘 완료율
export function getTodayCompletionRate(): number {
  var habits = getHabits();
  var todayLogs = getTodayLogs();
  
  if (habits.length === 0) return 0;
  
  var completedCount = todayLogs.filter(function(l) { return l.completed; }).length;
  return Math.round((completedCount / habits.length) * 100);
}

// 스트릭 계산 (연속 완료 일수)
export function getStreak(habitId: string): number {
  var logs = getLogs().filter(function(l) { return l.habitId === habitId && l.completed; });
  if (logs.length === 0) return 0;
  
  // 날짜순 정렬 (내림차순)
  logs.sort(function(a, b) { return b.date.localeCompare(a.date); });
  
  var streak = 0;
  var currentDate = new Date();
  
  for (var i = 0; i < logs.length; i++) {
    var expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    var logDateStr = logs[i].date;
    var expectedDateStr = expectedDate.toISOString().split('T')[0];
    
    if (logDateStr === expectedDateStr) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
