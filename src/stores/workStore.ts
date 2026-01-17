/**
 * Work OS - Zustand Store
 *
 * 업무 태스크, 프로젝트, 일정 관리
 * Finance Store 패턴 적용 - 글로벌 상태 + 캐싱
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getTasksByCategory, Task, addTask as addTaskService, updateTask as updateTaskService, deleteTask as deleteTaskService } from '../services/tasks';
import { getActiveProjects, Project, updateProjectTaskCounts } from '../services/projects';
import { getTodayEvents, CalendarEvent } from '../services/calendar';

// ============================================
// Types
// ============================================

export interface PriorityItem {
  id: string;
  title: string;
  sourceTag: 'WORK' | 'LIFE';
  meta?: string;
  status: 'pending' | 'in-progress' | 'done';
}

export interface ProjectPulseData {
  id: string;
  name: string;
  signal: 'green' | 'yellow' | 'red';
}

// ============================================
// Store Interface
// ============================================

interface WorkState {
  // Data
  tasks: Task[];
  projects: Project[];
  events: CalendarEvent[];
  focusTask: Task | null;

  // UI State
  viewMode: 'project' | 'list';
  showTaskModal: boolean;
  editingTask: Task | null;
  defaultProjectId: string;
  isLoading: boolean;
  error: string | null;

  // Actions - Data
  loadData: () => Promise<void>;
  setFocusTask: (task: Task | null) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Actions - UI
  setViewMode: (mode: 'project' | 'list') => void;
  openTaskModal: (projectId?: string, task?: Task) => void;
  closeTaskModal: () => void;

  // Selectors (computed values)
  getTasksByProject: () => Record<string, Task[]>;
  getPriorityItems: () => PriorityItem[];
  getProjectPulseData: () => ProjectPulseData[];
  getPendingTasks: () => Task[];

  // Actions - Clear
  clearError: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState = {
  tasks: [] as Task[],
  projects: [] as Project[],
  events: [] as CalendarEvent[],
  focusTask: null as Task | null,
  viewMode: 'project' as const,
  showTaskModal: false,
  editingTask: null as Task | null,
  defaultProjectId: '',
  isLoading: false,
  error: null as string | null,
};

// ============================================
// Store Implementation
// ============================================

export const useWorkStore = create<WorkState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // Data Actions
      // ============================================

      loadData: async () => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });

        try {
          // 태스크 로드
          const workTasks = getTasksByCategory('work');

          // 프로젝트 로드
          const activeProjects = getActiveProjects();

          // 프로젝트별 태스크 수 업데이트
          const taskCounts: Record<string, number> = {};
          workTasks.forEach((task) => {
            const projectId = task.projectId || 'project_default';
            taskCounts[projectId] = (taskCounts[projectId] || 0) + 1;
          });
          updateProjectTaskCounts(taskCounts);

          // 포커스 태스크 선택 (우선순위 높은 미완료 태스크)
          const pendingTasks = workTasks.filter((t) => t.status !== 'done');
          const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'high');
          const nextFocusTask = highPriorityTasks[0] || pendingTasks[0] || null;

          // 캘린더 이벤트
          let todayEvents: CalendarEvent[] = [];
          try {
            todayEvents = await getTodayEvents();
          } catch (e) {
            console.warn('[WorkStore] 캘린더 로드 실패:', e);
          }

          set({
            tasks: workTasks,
            projects: activeProjects,
            events: todayEvents,
            focusTask: nextFocusTask,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '데이터 로드 실패';
          console.error('[WorkStore] 데이터 로드 실패:', error);
          set({ error: errorMessage, isLoading: false });
        }
      },

      setFocusTask: (task) => {
        set({ focusTask: task });
      },

      addTask: (taskData) => {
        const newTask = addTaskService(taskData);

        set((state) => ({
          tasks: [...state.tasks, newTask],
          focusTask: newTask, // 새로 추가한 태스크를 포커스로
        }));

        // 프로젝트 태스크 수 업데이트
        const { tasks } = get();
        const taskCounts: Record<string, number> = {};
        tasks.forEach((task) => {
          const projectId = task.projectId || 'project_default';
          taskCounts[projectId] = (taskCounts[projectId] || 0) + 1;
        });
        updateProjectTaskCounts(taskCounts);
      },

      updateTask: (id, updates) => {
        updateTaskService(id, updates);

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id) => {
        deleteTaskService(id);

        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          focusTask: state.focusTask?.id === id ? null : state.focusTask,
        }));
      },

      // ============================================
      // UI Actions
      // ============================================

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      openTaskModal: (projectId, task) => {
        set({
          showTaskModal: true,
          editingTask: task || null,
          defaultProjectId: projectId || 'project_default',
        });
      },

      closeTaskModal: () => {
        set({
          showTaskModal: false,
          editingTask: null,
          defaultProjectId: '',
        });
      },

      // ============================================
      // Selectors (Computed Values)
      // ============================================

      getTasksByProject: () => {
        const { tasks, projects } = get();
        const grouped: Record<string, Task[]> = {};

        // 모든 프로젝트에 빈 배열 초기화
        projects.forEach((project) => {
          grouped[project.id] = [];
        });

        // 태스크 분배
        tasks.forEach((task) => {
          const projectId = task.projectId || 'project_default';
          if (!grouped[projectId]) {
            grouped[projectId] = [];
          }
          grouped[projectId].push(task);
        });

        return grouped;
      },

      getPriorityItems: () => {
        const { tasks } = get();

        // 미완료 태스크만, 우선순위 높은 것 먼저
        const pendingTasks = tasks.filter((t) => t.status !== 'done');

        // 우선순위 정렬: high > medium > low
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        pendingTasks.sort((a, b) => {
          return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        });

        // Top 3만 반환
        return pendingTasks.slice(0, 3).map((task) => ({
          id: task.id,
          title: task.title,
          sourceTag: 'WORK' as const,
          meta: task.priority === 'high' ? '긴급' : task.dueDate ? '마감' : undefined,
          status: task.status === 'in_progress' ? 'in-progress' as const : 'pending' as const,
        }));
      },

      getProjectPulseData: () => {
        const { tasks, projects } = get();

        return projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const pendingCount = projectTasks.filter((t) => t.status !== 'done').length;
          const highPriorityPending = projectTasks.filter(
            (t) => t.status !== 'done' && t.priority === 'high'
          ).length;

          // 신호등 결정: 긴급 미완료 있으면 red, 미완료 많으면 yellow, 아니면 green
          let signal: 'green' | 'yellow' | 'red' = 'green';
          if (highPriorityPending > 0) {
            signal = 'red';
          } else if (pendingCount > 3) {
            signal = 'yellow';
          }

          return {
            id: project.id,
            name: project.name,
            signal,
          };
        });
      },

      getPendingTasks: () => {
        const { tasks } = get();
        return tasks.filter((t) => t.status !== 'done');
      },

      // ============================================
      // Utility Actions
      // ============================================

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'alfredo_work',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        // tasks는 서비스에서 관리하므로 persist하지 않음
      }),
    }
  )
);

// ============================================
// Selectors (외부에서 사용)
// ============================================

export const selectTasks = (state: WorkState) => state.tasks;
export const selectProjects = (state: WorkState) => state.projects;
export const selectEvents = (state: WorkState) => state.events;
export const selectFocusTask = (state: WorkState) => state.focusTask;
export const selectIsLoading = (state: WorkState) => state.isLoading;
export const selectError = (state: WorkState) => state.error;
