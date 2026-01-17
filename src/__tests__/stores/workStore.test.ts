/**
 * workStore 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkStore } from '../../stores/workStore';

// Mock services
vi.mock('../../services/tasks', () => ({
  getTasksByCategory: vi.fn(() => [
    { id: '1', title: '태스크 1', status: 'todo', priority: 'high', category: 'work', createdAt: '2024-01-01' },
    { id: '2', title: '태스크 2', status: 'in_progress', priority: 'medium', category: 'work', createdAt: '2024-01-01' },
    { id: '3', title: '태스크 3', status: 'done', priority: 'low', category: 'work', createdAt: '2024-01-01' },
  ]),
  addTask: vi.fn((task) => ({ ...task, id: 'new-task-id', createdAt: new Date().toISOString() })),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

vi.mock('../../services/projects', () => ({
  getActiveProjects: vi.fn(() => [
    { id: 'p1', name: '프로젝트 1', status: 'active' },
    { id: 'p2', name: '프로젝트 2', status: 'active' },
  ]),
  updateProjectTaskCounts: vi.fn(),
}));

vi.mock('../../services/calendar', () => ({
  getTodayEvents: vi.fn(() => Promise.resolve([
    { id: 'e1', title: '회의 1', start: '2024-01-15T10:00:00', end: '2024-01-15T11:00:00' },
  ])),
}));

describe('workStore', () => {
  beforeEach(() => {
    // 스토어 상태 초기화
    useWorkStore.setState({
      tasks: [],
      projects: [],
      events: [],
      focusTask: null,
      viewMode: 'project',
      showTaskModal: false,
      editingTask: null,
      defaultProjectId: '',
      isLoading: false,
      error: null,
    });
  });

  describe('loadData', () => {
    it('should load tasks and projects', async () => {
      const { loadData } = useWorkStore.getState();
      await loadData();

      const { tasks, projects, isLoading } = useWorkStore.getState();

      expect(tasks.length).toBe(3);
      expect(projects.length).toBe(2);
      expect(isLoading).toBe(false);
    });

    it('should set focus task to high priority pending task', async () => {
      const { loadData } = useWorkStore.getState();
      await loadData();

      const { focusTask } = useWorkStore.getState();

      expect(focusTask).toBeDefined();
      expect(focusTask?.priority).toBe('high');
    });
  });

  describe('viewMode', () => {
    it('should default to project view', () => {
      const { viewMode } = useWorkStore.getState();
      expect(viewMode).toBe('project');
    });

    it('should change view mode', () => {
      const { setViewMode } = useWorkStore.getState();
      setViewMode('list');

      const { viewMode } = useWorkStore.getState();
      expect(viewMode).toBe('list');
    });
  });

  describe('modal actions', () => {
    it('should open task modal for new task', () => {
      const { openTaskModal } = useWorkStore.getState();
      openTaskModal('p1');

      const { showTaskModal, defaultProjectId, editingTask } = useWorkStore.getState();

      expect(showTaskModal).toBe(true);
      expect(defaultProjectId).toBe('p1');
      expect(editingTask).toBeNull();
    });

    it('should open task modal for editing', () => {
      const mockTask = { id: '1', title: '태스크 1', status: 'todo' as const, priority: 'high' as const, category: 'work' as const, createdAt: '2024-01-01' };
      const { openTaskModal } = useWorkStore.getState();
      openTaskModal('p1', mockTask);

      const { showTaskModal, editingTask } = useWorkStore.getState();

      expect(showTaskModal).toBe(true);
      expect(editingTask).toEqual(mockTask);
    });

    it('should close task modal', () => {
      useWorkStore.setState({ showTaskModal: true, editingTask: { id: '1' } as any });

      const { closeTaskModal } = useWorkStore.getState();
      closeTaskModal();

      const { showTaskModal, editingTask, defaultProjectId } = useWorkStore.getState();

      expect(showTaskModal).toBe(false);
      expect(editingTask).toBeNull();
      expect(defaultProjectId).toBe('');
    });
  });

  describe('selectors', () => {
    it('should get priority items (top 3 pending tasks)', async () => {
      const { loadData } = useWorkStore.getState();
      await loadData();

      const { getPriorityItems } = useWorkStore.getState();
      const priorityItems = getPriorityItems();

      // done 상태 태스크 제외 후 최대 3개
      expect(priorityItems.length).toBeLessThanOrEqual(3);
      expect(priorityItems.every((item) => item.status !== 'done')).toBe(true);
    });

    it('should get project pulse data', async () => {
      const { loadData } = useWorkStore.getState();
      await loadData();

      const { getProjectPulseData } = useWorkStore.getState();
      const pulseData = getProjectPulseData();

      expect(pulseData.length).toBe(2);
      pulseData.forEach((project) => {
        expect(['green', 'yellow', 'red']).toContain(project.signal);
      });
    });
  });
});
