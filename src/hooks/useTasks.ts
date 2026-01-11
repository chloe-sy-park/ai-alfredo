import { useState, useCallback, useEffect } from 'react';
import { tasksApi } from '../lib/api';
import type { Task } from '../types/database';

interface UseTasksOptions {
  autoFetch?: boolean;
  status?: string;
  category?: string;
  priority?: string;
  isTop3?: boolean;
}

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  completeTask: (id: string) => Promise<{ task: Task; rewards?: any } | null>;
  deferTask: (id: string) => Promise<Task | null>;
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { autoFetch = true, status, category, priority, isTop3 } = options;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  });

  // 태스크 목록 조회
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (category) params.category = category;
      if (priority) params.priority = priority;
      if (isTop3 !== undefined) params.is_top3 = String(isTop3);

      const response = await tasksApi.list(params);

      if (response.success && response.data) {
        setTasks(response.data);
        if (response.meta) {
          setMeta(response.meta as typeof meta);
        }
      } else {
        setError(response.error?.message || '태스크 조회 실패');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }, [status, category, priority, isTop3]);

  // 태스크 생성
  const createTask = useCallback(async (data: Partial<Task>): Promise<Task | null> => {
    try {
      const response = await tasksApi.create(data as any);

      if (response.success && response.data) {
        setTasks(prev => [response.data, ...prev]);
        return response.data;
      } else {
        setError(response.error?.message || '태스크 생성 실패');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return null;
    }
  }, []);

  // 태스크 수정
  const updateTask = useCallback(async (id: string, data: Partial<Task>): Promise<Task | null> => {
    try {
      const response = await tasksApi.update(id, data);

      if (response.success && response.data) {
        setTasks(prev => prev.map(t => (t.id === id ? response.data : t)));
        return response.data;
      } else {
        setError(response.error?.message || '태스크 수정 실패');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return null;
    }
  }, []);

  // 태스크 삭제
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await tasksApi.delete(id);

      if (response.success) {
        setTasks(prev => prev.filter(t => t.id !== id));
        return true;
      } else {
        setError(response.error?.message || '태스크 삭제 실패');
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return false;
    }
  }, []);

  // 태스크 완료
  const completeTask = useCallback(async (id: string): Promise<{ task: Task; rewards?: any } | null> => {
    try {
      const response = await tasksApi.complete(id);

      if (response.success && response.data) {
        const result = response.data;
        const updatedTask = result.task || result;
        setTasks(prev => prev.map(t => (t.id === id ? updatedTask : t)));
        return result;
      } else {
        setError(response.error?.message || '태스크 완료 실패');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return null;
    }
  }, []);

  // 태스크 미루기
  const deferTask = useCallback(async (id: string): Promise<Task | null> => {
    try {
      const response = await tasksApi.defer(id);

      if (response.success && response.data) {
        setTasks(prev => prev.map(t => (t.id === id ? response.data : t)));
        return response.data;
      } else {
        setError(response.error?.message || '태스크 미루기 실패');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return null;
    }
  }, []);

  // 자동 fetch
  useEffect(() => {
    if (autoFetch) {
      fetchTasks();
    }
  }, [autoFetch, fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    deferTask,
    meta,
  };
}

export default useTasks;
