import { create } from 'zustand';
import { db } from '@/lib/db';
import { api } from '@/lib/api';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'deferred';
export type TaskCategory = 'work' | 'life';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  category: TaskCategory;
  isStarred: boolean;
  isTopThree: boolean;
  dueDate?: string;
  dueTime?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  deferCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface TaskFilters {
  status?: TaskStatus[];
  category?: TaskCategory;
  isStarred?: boolean;
  isTopThree?: boolean;
  searchQuery?: string;
}

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  isLoading: boolean;
  
  // Actions
  setFilters: (filters: TaskFilters) => void;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'deferCount'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  toggleTopThree: (id: string) => Promise<void>;
  deferTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  
  // Computed
  getFilteredTasks: () => Task[];
  getTodayTopThree: () => Task[];
  getTasksByCategory: (category: TaskCategory) => Task[];
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  filters: {},
  isLoading: false,

  setFilters: (filters) => set({ filters }),

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      // 먼저 로컬 DB에서 로드
      const localTasks = await db.tasks.toArray();
      set({ tasks: localTasks });

      // 온라인이면 서버와 동기화
      if (navigator.onLine) {
        const serverTasks = await api.get<Task[]>('/api/tasks');
        await db.tasks.clear();
        await db.tasks.bulkPut(serverTasks);
        set({ tasks: serverTasks });
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addTask: async (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      deferCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Optimistic update
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    await db.tasks.add(newTask);

    // 온라인이면 서버에도 저장
    if (navigator.onLine) {
      try {
        await api.post('/api/tasks', newTask);
      } catch (error) {
        // 오프라인 큐에 추가
        await db.offlineQueue.add({
          id: crypto.randomUUID(),
          action: 'create',
          table: 'tasks',
          data: newTask,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      await db.offlineQueue.add({
        id: crypto.randomUUID(),
        action: 'create',
        table: 'tasks',
        data: newTask,
        createdAt: new Date().toISOString()
      });
    }

    return newTask;
  },

  updateTask: async (id, updates) => {
    const updatedData = { ...updates, updatedAt: new Date().toISOString() };

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updatedData } : t
      )
    }));
    await db.tasks.update(id, updatedData);

    if (navigator.onLine) {
      try {
        await api.patch(`/api/tasks/${id}`, updatedData);
      } catch (error) {
        await db.offlineQueue.add({
          id: crypto.randomUUID(),
          action: 'update',
          table: 'tasks',
          recordId: id,
          data: updatedData,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      await db.offlineQueue.add({
        id: crypto.randomUUID(),
        action: 'update',
        table: 'tasks',
        recordId: id,
        data: updatedData,
        createdAt: new Date().toISOString()
      });
    }
  },

  deleteTask: async (id) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id)
    }));
    await db.tasks.delete(id);

    if (navigator.onLine) {
      try {
        await api.delete(`/api/tasks/${id}`);
      } catch (error) {
        await db.offlineQueue.add({
          id: crypto.randomUUID(),
          action: 'delete',
          table: 'tasks',
          recordId: id,
          createdAt: new Date().toISOString()
        });
      }
    }
  },

  toggleStar: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (task) {
      await get().updateTask(id, { isStarred: !task.isStarred });
    }
  },

  toggleTopThree: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (task) {
      await get().updateTask(id, { isTopThree: !task.isTopThree });
    }
  },

  deferTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (task) {
      await get().updateTask(id, {
        status: 'deferred',
        deferCount: task.deferCount + 1
      });
    }
  },

  completeTask: async (id) => {
    await get().updateTask(id, {
      status: 'done',
      completedAt: new Date().toISOString()
    });
  },

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      if (filters.status && !filters.status.includes(task.status)) return false;
      if (filters.category && task.category !== filters.category) return false;
      if (filters.isStarred !== undefined && task.isStarred !== filters.isStarred) return false;
      if (filters.isTopThree !== undefined && task.isTopThree !== filters.isTopThree) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return task.title.toLowerCase().includes(query) ||
               task.description?.toLowerCase().includes(query);
      }
      return true;
    });
  },

  getTodayTopThree: () => {
    return get().tasks.filter((t) => t.isTopThree && t.status !== 'done');
  },

  getTasksByCategory: (category) => {
    return get().tasks.filter((t) => t.category === category);
  }
}));
