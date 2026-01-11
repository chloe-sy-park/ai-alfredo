import { create } from 'zustand';
import { tasksApi } from '../lib/api';
import type { Task, TaskStatus, TaskCategory, PriorityLevel } from '../types/database';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: {
    status?: TaskStatus;
    category?: TaskCategory;
    priority?: PriorityLevel;
    isTop3?: boolean;
  };

  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  completeTask: (id: string) => Promise<{ task: Task; rewards?: any } | null>;
  deferTask: (id: string) => Promise<Task | null>;
  setFilter: (filter: Partial<TaskState['filter']>) => void;
  clearError: () => void;

  // Selectors
  getTop3Tasks: () => Task[];
  getPendingTasks: () => Task[];
  getTasksByCategory: (category: TaskCategory) => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  filter: {},

  fetchTasks: async () => {
    set({ isLoading: true, error: null });

    try {
      const { filter } = get();
      const params: Record<string, string> = {};
      
      if (filter.status) params.status = filter.status;
      if (filter.category) params.category = filter.category;
      if (filter.priority) params.priority = filter.priority;
      if (filter.isTop3 !== undefined) params.is_top3 = String(filter.isTop3);

      const response = await tasksApi.list(params);

      if (response.success && response.data) {
        set({ tasks: response.data, isLoading: false });
      } else {
        set({ error: response.error?.message || '태스크 조회 실패', isLoading: false });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류', isLoading: false });
    }
  },

  createTask: async (data) => {
    try {
      const response = await tasksApi.create(data as any);

      if (response.success && response.data) {
        set(state => ({ tasks: [response.data!, ...state.tasks] }));
        return response.data;
      } else {
        set({ error: response.error?.message || '태스크 생성 실패' });
        return null;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return null;
    }
  },

  updateTask: async (id, data) => {
    try {
      const response = await tasksApi.update(id, data);

      if (response.success && response.data) {
        set(state => ({
          tasks: state.tasks.map(t => (t.id === id ? response.data! : t)),
        }));
        return response.data;
      } else {
        set({ error: response.error?.message || '태스크 수정 실패' });
        return null;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return null;
    }
  },

  deleteTask: async (id) => {
    try {
      const response = await tasksApi.delete(id);

      if (response.success) {
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== id),
        }));
        return true;
      } else {
        set({ error: response.error?.message || '태스크 삭제 실패' });
        return false;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return false;
    }
  },

  completeTask: async (id) => {
    try {
      const response = await tasksApi.complete(id);

      if (response.success && response.data) {
        const result = response.data;
        const updatedTask = result.task || result;
        
        set(state => ({
          tasks: state.tasks.map(t => (t.id === id ? updatedTask : t)),
        }));
        
        return result;
      } else {
        set({ error: response.error?.message || '태스크 완료 실패' });
        return null;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return null;
    }
  },

  deferTask: async (id) => {
    try {
      const response = await tasksApi.defer(id);

      if (response.success && response.data) {
        set(state => ({
          tasks: state.tasks.map(t => (t.id === id ? response.data! : t)),
        }));
        return response.data;
      } else {
        set({ error: response.error?.message || '태스크 미루기 실패' });
        return null;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return null;
    }
  },

  setFilter: (filter) => {
    set(state => ({ filter: { ...state.filter, ...filter } }));
  },

  clearError: () => set({ error: null }),

  // Selectors
  getTop3Tasks: () => {
    return get().tasks.filter(t => t.is_top3 && t.status !== 'done');
  },

  getPendingTasks: () => {
    return get().tasks.filter(t => t.status === 'pending');
  },

  getTasksByCategory: (category) => {
    return get().tasks.filter(t => t.category === category);
  },
}));
