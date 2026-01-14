// 로컬 스토리지 기반 데이터 관리

// ============ 컨디션 ============
export type ConditionLevel = 'great' | 'good' | 'okay' | 'tired' | 'bad';

export interface DailyCondition {
  date: string; // YYYY-MM-DD
  level: ConditionLevel;
  updatedAt: string;
}

export function getTodayCondition(): DailyCondition | null {
  var today = formatDate(new Date());
  var data = localStorage.getItem('alfredo_condition');
  if (!data) return null;
  
  try {
    var condition = JSON.parse(data) as DailyCondition;
    if (condition.date === today) return condition;
    return null;
  } catch (e) {
    return null;
  }
}

export function setTodayCondition(level: ConditionLevel): DailyCondition {
  var today = formatDate(new Date());
  var condition: DailyCondition = {
    date: today,
    level: level,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem('alfredo_condition', JSON.stringify(condition));
  return condition;
}

// ============ 탑3 태스크 ============
export interface TopTask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt: string;
}

export interface DailyTasks {
  date: string;
  tasks: TopTask[];
}

export function getTodayTasks(): TopTask[] {
  var today = formatDate(new Date());
  var data = localStorage.getItem('alfredo_top3');
  if (!data) return [];
  
  try {
    var dailyTasks = JSON.parse(data) as DailyTasks;
    if (dailyTasks.date === today) return dailyTasks.tasks;
    return [];
  } catch (e) {
    return [];
  }
}

export function saveTodayTasks(tasks: TopTask[]): void {
  var today = formatDate(new Date());
  var dailyTasks: DailyTasks = {
    date: today,
    tasks: tasks
  };
  localStorage.setItem('alfredo_top3', JSON.stringify(dailyTasks));
}

export function addTask(title: string): TopTask[] {
  var tasks = getTodayTasks();
  if (tasks.length >= 3) return tasks;
  
  var newTask: TopTask = {
    id: 'task_' + Date.now(),
    title: title,
    completed: false,
    order: tasks.length,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  saveTodayTasks(tasks);
  return tasks;
}

export function toggleTask(taskId: string): TopTask[] {
  var tasks = getTodayTasks();
  var task = tasks.find(function(t) { return t.id === taskId; });
  if (task) {
    task.completed = !task.completed;
    saveTodayTasks(tasks);
  }
  return tasks;
}

export function removeTask(taskId: string): TopTask[] {
  var tasks = getTodayTasks().filter(function(t) { return t.id !== taskId; });
  // Reorder
  tasks.forEach(function(t, idx) { t.order = idx; });
  saveTodayTasks(tasks);
  return tasks;
}

export function reorderTasks(taskIds: string[]): TopTask[] {
  var tasks = getTodayTasks();
  var reordered: TopTask[] = [];
  
  taskIds.forEach(function(id, idx) {
    var task = tasks.find(function(t) { return t.id === id; });
    if (task) {
      task.order = idx;
      reordered.push(task);
    }
  });
  
  saveTodayTasks(reordered);
  return reordered;
}

// ============ 기억해야할거 (퀵메모) ============
export interface QuickMemo {
  id: string;
  content: string;
  createdAt: string;
  reminder?: string; // ISO datetime
}

export function getMemos(): QuickMemo[] {
  var data = localStorage.getItem('alfredo_memos');
  if (!data) return [];
  
  try {
    return JSON.parse(data) as QuickMemo[];
  } catch (e) {
    return [];
  }
}

export function addMemo(content: string, reminder?: string): QuickMemo[] {
  var memos = getMemos();
  var newMemo: QuickMemo = {
    id: 'memo_' + Date.now(),
    content: content,
    createdAt: new Date().toISOString(),
    reminder: reminder
  };
  
  memos.unshift(newMemo); // 최신이 위로
  localStorage.setItem('alfredo_memos', JSON.stringify(memos));
  return memos;
}

export function removeMemo(memoId: string): QuickMemo[] {
  var memos = getMemos().filter(function(m) { return m.id !== memoId; });
  localStorage.setItem('alfredo_memos', JSON.stringify(memos));
  return memos;
}

// ============ 유틸 ============
function formatDate(date: Date): string {
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// 컨디션 라벨
export function getConditionLabel(level: ConditionLevel): string {
  var labels: Record<ConditionLevel, string> = {
    great: '최고 💪',
    good: '좋아요 😊',
    okay: '보통 😐',
    tired: '피곤 😮‍💨',
    bad: '힘들어 😢'
  };
  return labels[level];
}

export function getConditionEmoji(level: ConditionLevel): string {
  var emojis: Record<ConditionLevel, string> = {
    great: '💪',
    good: '😊',
    okay: '😐',
    tired: '😮‍💨',
    bad: '😢'
  };
  return emojis[level];
}

export function getConditionColor(level: ConditionLevel): string {
  var colors: Record<ConditionLevel, string> = {
    great: '#22c55e',
    good: '#84cc16',
    okay: '#eab308',
    tired: '#f97316',
    bad: '#ef4444'
  };
  return colors[level];
}
