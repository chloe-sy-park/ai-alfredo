// Tasks Service - 업무 태스크 관리 (확장 버전)

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'work' | 'life';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  completedAt?: string;
  createdAt: string;
  // 프로젝트/폴더
  projectId?: string;
  // 서브태스크
  parentId?: string;
  // 태그
  tags?: string[];
  // 반복 설정
  recurrence?: RecurrenceRule;
  // 알림
  reminder?: ReminderSetting;
  // Google Tasks 동기화
  googleTaskId?: string;
  googleTaskListId?: string;
  lastSyncedAt?: string;
}

export interface RecurrenceRule {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number; // 매 n일/주/월
  daysOfWeek?: number[]; // 0=일, 1=월, ..., 6=토
  endDate?: string;
  nextOccurrence?: string;
}

export interface ReminderSetting {
  enabled: boolean;
  minutesBefore: number; // 마감 n분 전
  notifiedAt?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type SortOption = 'priority' | 'dueDate' | 'created' | 'project';
export type FilterOption = 'all' | 'todo' | 'in_progress' | 'done';

var STORAGE_KEY = 'alfredo_tasks';

// 태스크 목록 가져오기
export function getTasks(): Task[] {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Task[];
  } catch (e) {
    return [];
  }
}

// 태스크 저장
function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

// 태스크 추가
export function addTask(task: Omit<Task, 'id' | 'createdAt' | 'status'>): Task {
  var tasks = getTasks();
  var newTask: Task = {
    ...task,
    id: 'task_' + Date.now(),
    status: 'todo',
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

// 태스크 수정
export function updateTask(id: string, updates: Partial<Task>): Task | null {
  var tasks = getTasks();
  var index = tasks.findIndex(function(t) { return t.id === id; });
  if (index === -1) return null;
  
  tasks[index] = { ...tasks[index], ...updates };
  saveTasks(tasks);
  return tasks[index];
}

// 태스크 상태 변경
export function changeTaskStatus(id: string, status: TaskStatus): Task | null {
  var updates: Partial<Task> = { status: status };
  if (status === 'done') {
    updates.completedAt = new Date().toISOString();
  } else {
    updates.completedAt = undefined;
  }
  return updateTask(id, updates);
}

// 태스크 완료 토글
export function toggleTaskComplete(id: string): Task | null {
  var tasks = getTasks();
  var index = tasks.findIndex(function(t) { return t.id === id; });
  if (index === -1) return null;
  
  var task = tasks[index];
  if (task.status === 'done') {
    task.status = 'todo';
    task.completedAt = undefined;
  } else {
    task.status = 'done';
    task.completedAt = new Date().toISOString();
  }
  
  saveTasks(tasks);
  return task;
}

// 태스크 삭제
export function deleteTask(id: string): boolean {
  var tasks = getTasks();
  // 서브태스크도 함께 삭제
  var filtered = tasks.filter(function(t) { 
    return t.id !== id && t.parentId !== id; 
  });
  if (filtered.length === tasks.length) return false;
  saveTasks(filtered);
  return true;
}

// 카테고리별 태스크
export function getTasksByCategory(category: 'work' | 'life'): Task[] {
  var tasks = getTasks();
  return tasks.filter(function(t) { return t.category === category; });
}

// 프로젝트별 태스크
export function getTasksByProject(projectId: string | null): Task[] {
  var tasks = getTasks();
  if (projectId === null) {
    return tasks.filter(function(t) { return !t.projectId; });
  }
  return tasks.filter(function(t) { return t.projectId === projectId; });
}

// 태그별 태스크
export function getTasksByTag(tag: string): Task[] {
  var tasks = getTasks();
  return tasks.filter(function(t) { 
    return t.tags && t.tags.indexOf(tag) !== -1; 
  });
}

// 서브태스크 가져오기
export function getSubtasks(parentId: string): Task[] {
  var tasks = getTasks();
  return tasks.filter(function(t) { return t.parentId === parentId; });
}

// 부모 태스크만 가져오기 (서브태스크 제외)
export function getParentTasks(tasks: Task[]): Task[] {
  return tasks.filter(function(t) { return !t.parentId; });
}

// 오늘 완료된 태스크 수
export function getTodayCompletedCount(category?: 'work' | 'life'): number {
  var tasks = getTasks();
  var today = new Date().toDateString();
  
  return tasks.filter(function(t) {
    if (t.status !== 'done' || !t.completedAt) return false;
    if (category && t.category !== category) return false;
    return new Date(t.completedAt).toDateString() === today;
  }).length;
}

// 미완료 태스크 수
export function getPendingCount(category?: 'work' | 'life'): number {
  var tasks = getTasks();
  return tasks.filter(function(t) {
    if (t.status === 'done') return false;
    if (category && t.category !== category) return false;
    return true;
  }).length;
}

// 정렬 함수
export function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
  var sorted = [...tasks];
  
  switch (sortBy) {
    case 'priority':
      var priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      sorted.sort(function(a, b) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      break;
    case 'dueDate':
      sorted.sort(function(a, b) {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      break;
    case 'created':
      sorted.sort(function(a, b) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      break;
    case 'project':
      sorted.sort(function(a, b) {
        if (!a.projectId && !b.projectId) return 0;
        if (!a.projectId) return 1;
        if (!b.projectId) return -1;
        return a.projectId.localeCompare(b.projectId);
      });
      break;
  }
  
  return sorted;
}

// 필터 함수
export function filterTasks(tasks: Task[], filterBy: FilterOption): Task[] {
  if (filterBy === 'all') return tasks;
  return tasks.filter(function(t) { return t.status === filterBy; });
}

// D-day 계산
export function getDDay(dueDate: string): number {
  var due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var diff = due.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// D-day 라벨
export function getDDayLabel(dueDate: string): string {
  var dday = getDDay(dueDate);
  if (dday < 0) return 'D+' + Math.abs(dday);
  if (dday === 0) return '오늘';
  if (dday === 1) return '내일';
  return 'D-' + dday;
}

// 총 예상 시간 계산
export function getTotalEstimatedMinutes(tasks: Task[]): number {
  return tasks.reduce(function(sum, t) {
    return sum + (t.estimatedMinutes || 0);
  }, 0);
}

// 총 실제 시간 계산
export function getTotalActualMinutes(tasks: Task[]): number {
  return tasks.reduce(function(sum, t) {
    return sum + (t.actualMinutes || 0);
  }, 0);
}

// 시간 포맷 (분 -> 시간분)
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return minutes + '분';
  var hours = Math.floor(minutes / 60);
  var mins = minutes % 60;
  if (mins === 0) return hours + '시간';
  return hours + '시간 ' + mins + '분';
}

// 실제 시간 기록
export function recordActualTime(id: string, minutes: number): Task | null {
  return updateTask(id, { actualMinutes: minutes });
}

// 반복 태스크 생성
export function createRecurringTask(task: Task): Task | null {
  if (!task.recurrence) return null;
  
  var nextDate = calculateNextOccurrence(task.recurrence);
  if (!nextDate) return null;
  
  var newTask = addTask({
    title: task.title,
    description: task.description,
    category: task.category,
    priority: task.priority,
    projectId: task.projectId,
    tags: task.tags,
    estimatedMinutes: task.estimatedMinutes,
    dueDate: nextDate,
    recurrence: {
      ...task.recurrence,
      nextOccurrence: nextDate
    },
    reminder: task.reminder
  });
  
  return newTask;
}

// 다음 반복 날짜 계산
export function calculateNextOccurrence(rule: RecurrenceRule): string | null {
  var today = new Date();
  var next = new Date();
  
  switch (rule.type) {
    case 'daily':
      next.setDate(today.getDate() + rule.interval);
      break;
    case 'weekly':
      next.setDate(today.getDate() + (rule.interval * 7));
      break;
    case 'monthly':
      next.setMonth(today.getMonth() + rule.interval);
      break;
    case 'custom':
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        var currentDay = today.getDay();
        var daysUntilNext = 7;
        rule.daysOfWeek.forEach(function(day) {
          var diff = (day - currentDay + 7) % 7;
          if (diff === 0) diff = 7;
          if (diff < daysUntilNext) daysUntilNext = diff;
        });
        next.setDate(today.getDate() + daysUntilNext);
      }
      break;
  }
  
  if (rule.endDate && next > new Date(rule.endDate)) {
    return null;
  }
  
  return next.toISOString().split('T')[0];
}

// 알림 체크
export function checkReminders(): Task[] {
  var tasks = getTasks();
  var now = new Date();
  var tasksToNotify: Task[] = [];
  
  tasks.forEach(function(task) {
    if (!task.reminder || !task.reminder.enabled || !task.dueDate) return;
    if (task.status === 'done') return;
    if (task.reminder.notifiedAt) return;
    
    var dueTime = new Date(task.dueDate).getTime();
    var notifyTime = dueTime - (task.reminder.minutesBefore * 60 * 1000);
    
    if (now.getTime() >= notifyTime) {
      tasksToNotify.push(task);
      updateTask(task.id, { 
        reminder: { ...task.reminder, notifiedAt: now.toISOString() } 
      });
    }
  });
  
  return tasksToNotify;
}

// 모든 태그 가져오기
export function getAllTags(): string[] {
  var tasks = getTasks();
  var tagSet = new Set<string>();
  
  tasks.forEach(function(task) {
    if (task.tags) {
      task.tags.forEach(function(tag) {
        tagSet.add(tag);
      });
    }
  });
  
  return Array.from(tagSet);
}

// 태그 추가
export function addTagToTask(id: string, tag: string): Task | null {
  var tasks = getTasks();
  var task = tasks.find(function(t) { return t.id === id; });
  if (!task) return null;
  
  var currentTags = task.tags || [];
  if (currentTags.indexOf(tag) === -1) {
    currentTags.push(tag);
  }
  
  return updateTask(id, { tags: currentTags });
}

// 태그 제거
export function removeTagFromTask(id: string, tag: string): Task | null {
  var tasks = getTasks();
  var task = tasks.find(function(t) { return t.id === id; });
  if (!task || !task.tags) return null;
  
  var newTags = task.tags.filter(function(t) { return t !== tag; });
  return updateTask(id, { tags: newTags });
}
