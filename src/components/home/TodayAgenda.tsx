import { useState, useEffect } from 'react';
import { Check, Pencil, Star, Clock, Plus, X, Bot, ChevronDown, ChevronUp, Pause, SkipForward, RotateCcw, Sparkles } from 'lucide-react';
import { Task, getTasks, updateTask, addTask } from '../../services/tasks';
import { v4 as uuidv4 } from 'uuid';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface AgendaItem extends Omit<Task, 'status'> {
  subtasks?: Subtask[];
  progress?: number;
  status: 'todo' | 'in_progress' | 'done' | 'deferred' | 'stopped';
  alfredoReason?: string;
}

interface TodayAgendaProps {
  onCompleteTask?: (taskId: string) => void;
}

/**
 * Today's Agenda 컴포넌트
 * - 오늘의 주요 할 일 3가지를 카드 형태로 표시
 * - Subtask 지원, Progress 표시
 * - 미루기/중단/추가 기능
 * - 알프레도 제안 기준 표시
 */
export default function TodayAgenda({ onCompleteTask }: TodayAgendaProps) {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [newSubtask, setNewSubtask] = useState('');
  const [newSubtaskPriority, setNewSubtaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showReorganizeToast, setShowReorganizeToast] = useState(false);

  useEffect(() => {
    loadAgendaItems();
  }, []);

  const loadAgendaItems = () => {
    const allTasks = getTasks();
    const today = new Date().toISOString().split('T')[0];

    // 오늘의 agenda 조건: starred, 오늘 예정, 마감일이 오늘
    const todayTasks = allTasks.filter((task) => {
      if (task.status === 'done') return false;
      return task.starred || task.scheduledDate === today || task.dueDate === today;
    });

    const items: AgendaItem[] = todayTasks.map((task) => {
      const savedSubtasks = loadSubtasks(task.id);
      const savedReason = loadAlfredoReason(task.id);
      const completedCount = savedSubtasks.filter((s) => s.completed).length;
      const progress = savedSubtasks.length > 0
        ? Math.round((completedCount / savedSubtasks.length) * 100)
        : 0;

      return {
        ...task,
        subtasks: savedSubtasks,
        progress,
        alfredoReason: savedReason
      };
    });

    // starred 먼저, 그 다음 priority 순
    items.sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setAgendaItems(items.slice(0, 3));
  };

  // Subtasks 로컬 스토리지 관리
  const loadSubtasks = (taskId: string): Subtask[] => {
    const saved = localStorage.getItem(`alfredo_subtasks_${taskId}`);
    return saved ? JSON.parse(saved) : [];
  };

  const saveSubtasks = (taskId: string, subtasks: Subtask[]) => {
    localStorage.setItem(`alfredo_subtasks_${taskId}`, JSON.stringify(subtasks));
  };

  // 알프레도 제안 기준 저장
  const loadAlfredoReason = (taskId: string): string | undefined => {
    const saved = localStorage.getItem(`alfredo_reason_${taskId}`);
    return saved || undefined;
  };

  const saveAlfredoReason = (taskId: string, reason: string) => {
    localStorage.setItem(`alfredo_reason_${taskId}`, reason);
  };

  // 완료 처리
  const handleComplete = (item: AgendaItem) => {
    updateTask(item.id, { status: 'done' });
    if (onCompleteTask) {
      onCompleteTask(item.id);
    }
    triggerReorganize();
    loadAgendaItems();
  };

  // 미루기 처리
  const handleDefer = (item: AgendaItem) => {
    // 내일로 미루기
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    updateTask(item.id, {
      scheduledDate: tomorrow.toISOString().split('T')[0],
      starred: false
    });
    triggerReorganize();
    loadAgendaItems();
  };

  // 중단 처리
  const handleStop = (item: AgendaItem) => {
    updateTask(item.id, { status: 'todo', starred: false });
    triggerReorganize();
    loadAgendaItems();
  };

  // 재정리 알림 표시
  const triggerReorganize = () => {
    setShowReorganizeToast(true);
    setTimeout(() => setShowReorganizeToast(false), 3000);
  };

  // 편집 모달 열기
  const handleEdit = (item: AgendaItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  // 새 Agenda 추가
  const handleAddAgenda = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: 'medium',
      starred: true, // 오늘의 agenda로 추가하므로 starred
      category: 'work'
    };

    const added = addTask(newTask as Task);
    if (added) {
      // AI 제안 이유 저장
      saveAlfredoReason(added.id, '사용자가 직접 추가함');
      loadAgendaItems();
    }

    setNewTaskTitle('');
    setShowAddModal(false);
  };

  // Subtask 추가
  const handleAddSubtask = () => {
    if (!newSubtask.trim() || !editingItem) return;

    const subtask: Subtask = {
      id: uuidv4(),
      title: newSubtask.trim(),
      completed: false,
      priority: newSubtaskPriority
    };

    const updatedSubtasks = [...(editingItem.subtasks || []), subtask];
    saveSubtasks(editingItem.id, updatedSubtasks);

    setEditingItem({
      ...editingItem,
      subtasks: updatedSubtasks,
      progress: calculateProgress(updatedSubtasks)
    });

    setNewSubtask('');
    loadAgendaItems();
  };

  // Subtask 완료 토글
  const handleToggleSubtask = (subtaskId: string) => {
    if (!editingItem) return;

    const updatedSubtasks = (editingItem.subtasks || []).map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    saveSubtasks(editingItem.id, updatedSubtasks);

    setEditingItem({
      ...editingItem,
      subtasks: updatedSubtasks,
      progress: calculateProgress(updatedSubtasks)
    });

    loadAgendaItems();
  };

  // Subtask 삭제
  const handleDeleteSubtask = (subtaskId: string) => {
    if (!editingItem) return;

    const updatedSubtasks = (editingItem.subtasks || []).filter((s) => s.id !== subtaskId);
    saveSubtasks(editingItem.id, updatedSubtasks);

    setEditingItem({
      ...editingItem,
      subtasks: updatedSubtasks,
      progress: calculateProgress(updatedSubtasks)
    });

    loadAgendaItems();
  };

  const calculateProgress = (subtasks: Subtask[]): number => {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter((s) => s.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  // AI 서브태스크 제안
  const handleAIMentorCare = () => {
    if (!editingItem) return;

    // AI가 제안하는 서브태스크 (실제로는 API 호출)
    const suggestions: Subtask[] = [
      { id: uuidv4(), title: '자료 수집 및 검토', completed: false, priority: 'high' },
      { id: uuidv4(), title: '초안 작성', completed: false, priority: 'medium' },
      { id: uuidv4(), title: '피드백 반영', completed: false, priority: 'low' }
    ];

    const updatedSubtasks = [...(editingItem.subtasks || []), ...suggestions];
    saveSubtasks(editingItem.id, updatedSubtasks);

    // 알프레도 제안 이유 저장
    saveAlfredoReason(editingItem.id, '작업 효율성을 위해 3단계로 분할 제안');

    setEditingItem({
      ...editingItem,
      subtasks: updatedSubtasks,
      progress: calculateProgress(updatedSubtasks),
      alfredoReason: '작업 효율성을 위해 3단계로 분할 제안'
    });

    loadAgendaItems();
  };

  // 알프레도 재정리 요청
  const handleAlfredoReorganize = () => {
    // 실제로는 API 호출하여 재정리
    triggerReorganize();
  };

  // 추가 모달 컴포넌트 - 조건부 반환 전에 정의
  const AddAgendaModal = () => (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={() => setShowAddModal(false)}
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl p-5 pb-8 animate-slideUp safe-area-bottom">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">새 Agenda 추가</h3>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="오늘 해야 할 일을 입력하세요..."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
          autoFocus
          onKeyPress={(e) => e.key === 'Enter' && handleAddAgenda()}
        />
        <button
          onClick={handleAddAgenda}
          disabled={!newTaskTitle.trim()}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          추가하기
        </button>
      </div>
    </div>
  );

  if (agendaItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 dark:text-white">Today's Agenda</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus size={14} />
            추가
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
          오늘의 주요 일정이 없습니다.<br />
          Task에 별표를 추가하거나 직접 추가하세요.
        </p>

        {/* 추가 모달 */}
        {showAddModal && <AddAgendaModal />}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Today's Agenda</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAlfredoReorganize}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RotateCcw size={12} />
              재정리
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus size={14} />
              추가
            </button>
          </div>
        </div>

        {/* Agenda Items */}
        <div className="space-y-3">
          {agendaItems.map((item) => (
            <AgendaCard
              key={item.id}
              item={item}
              isExpanded={expandedItemId === item.id}
              onToggleExpand={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
              onComplete={() => handleComplete(item)}
              onDefer={() => handleDefer(item)}
              onStop={() => handleStop(item)}
              onEdit={() => handleEdit(item)}
            />
          ))}
        </div>
      </div>

      {/* 재정리 토스트 */}
      {showReorganizeToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-900 text-white rounded-full text-sm flex items-center gap-2 animate-fadeIn">
          <Sparkles size={14} className="text-amber-400" />
          알프레도가 일정을 재정리했어요
        </div>
      )}

      {/* 추가 모달 */}
      {showAddModal && <AddAgendaModal />}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate-fadeIn"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl p-5 pb-8 animate-slideUp safe-area-bottom max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4" />

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Agenda 상세</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-primary uppercase mb-1 block">Title</label>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{editingItem.title}</h4>
            </div>

            {/* 알프레도 제안 기준 */}
            {editingItem.alfredoReason && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Bot size={14} className="text-primary" />
                  <label className="text-xs font-semibold text-primary uppercase">알프레도 제안 기준</label>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{editingItem.alfredoReason}</p>
              </div>
            )}

            {/* Estimated Duration */}
            {editingItem.estimatedMinutes && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Estimated Duration</label>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Clock size={18} className="text-primary" />
                  <span className="font-medium">{editingItem.estimatedMinutes}m</span>
                </div>
              </div>
            )}

            {/* Subtasks */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-primary uppercase">우선순위별 Subtasks</label>
                <span className="text-sm font-medium text-primary">
                  {editingItem.subtasks?.filter((s) => s.completed).length || 0}/{editingItem.subtasks?.length || 0}
                </span>
              </div>

              {/* Priority Groups */}
              {(['high', 'medium', 'low'] as const).map((priority) => {
                const prioritySubtasks = editingItem.subtasks?.filter(s => s.priority === priority) || [];
                if (prioritySubtasks.length === 0) return null;

                return (
                  <div key={priority} className="mb-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2
                      ${priority === 'high' ? 'bg-red-100 text-red-600' : ''}
                      ${priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : ''}
                      ${priority === 'low' ? 'bg-blue-100 text-blue-600' : ''}
                    `}>
                      {priority.toUpperCase()}
                    </span>
                    <div className="space-y-2">
                      {prioritySubtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                        >
                          <button
                            onClick={() => handleToggleSubtask(subtask.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                              ${subtask.completed
                                ? 'bg-primary border-primary text-white'
                                : 'border-gray-300 dark:border-gray-500'
                              }
                            `}
                          >
                            {subtask.completed && <Check size={12} />}
                          </button>
                          <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {subtask.title}
                          </span>
                          <button
                            onClick={() => handleDeleteSubtask(subtask.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Add Subtask */}
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="세부 단계 추가..."
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <button
                  onClick={handleAddSubtask}
                  className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Priority Selector */}
              <div className="flex gap-2 mt-3">
                {(['high', 'medium', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewSubtaskPriority(p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase transition-colors
                      ${newSubtaskPriority === p
                        ? 'bg-primary/10 text-primary border-2 border-primary'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 border-2 border-transparent'
                      }
                    `}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Mentor Care Button */}
            <button
              onClick={handleAIMentorCare}
              className="w-full py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl text-sm font-medium text-primary hover:from-primary/20 hover:to-secondary/20 transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <Bot size={16} />
              AI가 서브태스크 제안
            </button>

            {/* Close button */}
            <button
              onClick={() => setShowEditModal(false)}
              className="w-full py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Agenda Card Component
function AgendaCard({
  item,
  isExpanded,
  onToggleExpand,
  onComplete,
  onDefer,
  onStop,
  onEdit
}: {
  item: AgendaItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onComplete: () => void;
  onDefer: () => void;
  onStop: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Card Header */}
      <div className="p-4">
        {/* Tags */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
              ${item.category === 'work'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-green-100 text-green-600'
              }
            `}>
              {item.category === 'work' ? 'WORK' : 'LIFE'}
            </span>
            {item.estimatedMinutes && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">
                <Clock size={12} />
                {item.estimatedMinutes}m
              </span>
            )}
          </div>
          {item.starred && (
            <Star size={18} className="text-amber-400" fill="currentColor" />
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{item.title}</h3>

        {/* 알프레도 제안 기준 (간략) */}
        {item.alfredoReason && (
          <div className="flex items-center gap-1.5 text-xs text-primary mb-3">
            <Bot size={12} />
            <span>{item.alfredoReason}</span>
          </div>
        )}

        {/* Progress */}
        {item.subtasks && item.subtasks.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500 uppercase font-medium">Progress</span>
              <span className="text-primary font-semibold">{item.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Expanded Subtasks */}
        {isExpanded && item.subtasks && item.subtasks.length > 0 && (
          <div className="space-y-2 mb-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            {item.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                  ${subtask.completed ? 'bg-primary border-primary text-white' : 'border-gray-300'}
                `}>
                  {subtask.completed && <Check size={10} />}
                </div>
                <span className={subtask.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}>
                  {subtask.title}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded ml-auto
                  ${subtask.priority === 'high' ? 'bg-red-100 text-red-600' : ''}
                  ${subtask.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : ''}
                  ${subtask.priority === 'low' ? 'bg-blue-100 text-blue-600' : ''}
                `}>
                  {subtask.priority[0].toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expand Toggle */}
        {item.subtasks && item.subtasks.length > 0 && (
          <button
            onClick={onToggleExpand}
            className="w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isExpanded ? '접기' : `서브태스크 ${item.subtasks.length}개`}
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={onComplete}
          className="flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          <Check size={14} />
          완료
        </button>
        <button
          onClick={onDefer}
          className="flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors border-l border-gray-100 dark:border-gray-700"
        >
          <SkipForward size={14} />
          미루기
        </button>
        <button
          onClick={onStop}
          className="flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors border-l border-gray-100 dark:border-gray-700"
        >
          <Pause size={14} />
          중단
        </button>
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l border-gray-100 dark:border-gray-700"
        >
          <Pencil size={14} />
          상세
        </button>
      </div>
    </div>
  );
}
