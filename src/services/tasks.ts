// Tasks Service - 업무 태스크 관리

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'work' | 'life';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  estimatedMinutes?: number;
  completedAt?: string;
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type SortOption = 'priority' | 'dueDate' | 'created';
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
  var filtered = tasks.filter(function(t) { return t.id !== id; });
  if (filtered.length === tasks.length) return false;
  saveTasks(filtered);
  return true;
}

// 카테고리별 태스크
export function getTasksByCategory(category: 'work' | 'life'): Task[] {
  var tasks = getTasks();
  return tasks.filter(function(t) { return t.category === category; });
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

// 시간 포맷 (분 -> 시간분)
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return minutes + '분';
  var hours = Math.floor(minutes / 60);
  var mins = minutes % 60;
  if (mins === 0) return hours + '시간';
  return hours + '시간 ' + mins + '분';
}
