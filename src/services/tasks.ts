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

// 우선순위순 정렬
export function sortByPriority(tasks: Task[]): Task[] {
  var priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort(function(a, b) {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
