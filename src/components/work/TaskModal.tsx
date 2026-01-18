import { useState, useEffect } from 'react';
import {
  X, Calendar, Flag, Folder, Star, Users, CalendarCheck,
  Trash2, Clock, AlignLeft, Briefcase, Home, ChevronDown
} from 'lucide-react';
import { Task, addTask, updateTask, deleteTask } from '../../services/tasks';
import { getActiveProjects, Project } from '../../services/projects';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  task?: Task | null;
  defaultProjectId?: string;
  defaultCategory?: 'work' | 'life';
  mode?: 'view' | 'edit' | 'create';
}

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task,
  defaultProjectId,
  defaultCategory = 'work',
  mode: initialMode
}: TaskModalProps) {
  // 폼 상태
  var [title, setTitle] = useState('');
  var [description, setDescription] = useState('');
  var [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  var [dueDate, setDueDate] = useState('');
  var [projectId, setProjectId] = useState('');
  var [estimatedMinutes, setEstimatedMinutes] = useState('');
  var [projects, setProjects] = useState<Project[]>([]);

  // 새로 추가된 필드
  var [starred, setStarred] = useState(false);
  var [waitingFor, setWaitingFor] = useState<'external' | 'boss' | 'team' | null>(null);
  var [scheduledDate, setScheduledDate] = useState('');
  var [category, setCategory] = useState<'work' | 'life'>('work');

  // UI 상태
  var [isEditing, setIsEditing] = useState(true);
  var [showWaitingPicker, setShowWaitingPicker] = useState(false);

  // 모드 결정
  var mode = initialMode || (task ? 'view' : 'create');

  useEffect(function() {
    if (isOpen) {
      // 프로젝트 목록 로드
      setProjects(getActiveProjects());

      if (task) {
        // 편집/보기 모드
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setDueDate(task.dueDate || '');
        setProjectId(task.projectId || 'project_default');
        setEstimatedMinutes(task.estimatedMinutes ? String(task.estimatedMinutes) : '');
        setStarred(task.starred || false);
        setWaitingFor(task.waitingFor || null);
        setScheduledDate(task.scheduledDate || '');
        setCategory(task.category || 'work');
        setIsEditing(mode === 'edit' || mode === 'create');
      } else {
        // 추가 모드
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
        setProjectId(defaultProjectId || 'project_default');
        setEstimatedMinutes('');
        setStarred(false);
        setWaitingFor(null);
        setScheduledDate('');
        setCategory(defaultCategory);
        setIsEditing(true);
      }
    }
  }, [isOpen, task, defaultProjectId, defaultCategory, mode]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return;

    var minutes = estimatedMinutes ? parseInt(estimatedMinutes) : undefined;

    if (task) {
      // 편집
      var updated = updateTask(task.id, {
        title: title,
        description: description || undefined,
        priority: priority,
        dueDate: dueDate || undefined,
        projectId: projectId || undefined,
        estimatedMinutes: minutes,
        starred: starred,
        waitingFor: waitingFor,
        scheduledDate: scheduledDate || undefined,
        category: category
      });
      if (updated) onSave(updated);
    } else {
      // 추가
      var newTask = addTask({
        title: title,
        description: description || undefined,
        category: category,
        priority: priority,
        dueDate: dueDate || undefined,
        projectId: projectId || undefined,
        estimatedMinutes: minutes,
        starred: starred,
        waitingFor: waitingFor,
        scheduledDate: scheduledDate || undefined
      });
      onSave(newTask);
    }

    onClose();
  }

  function handleDelete() {
    if (task && confirm('이 태스크를 삭제할까요?')) {
      deleteTask(task.id);
      if (onDelete) {
        onDelete(task.id);
      }
      onClose();
    }
  }

  function handleEdit() {
    setIsEditing(true);
  }

  function getWaitingForLabel(value: 'external' | 'boss' | 'team' | null): string {
    switch (value) {
      case 'external': return '외부 클라이언트';
      case 'boss': return '상사';
      case 'team': return '팀원';
      default: return '없음';
    }
  }

  function formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    var dayOfWeek = dayNames[d.getDay()];
    return month + '월 ' + day + '일 (' + dayOfWeek + ')';
  }

  function getPriorityLabel(p: 'high' | 'medium' | 'low'): string {
    switch (p) {
      case 'high': return '🔴 높음';
      case 'medium': return '🟡 보통';
      case 'low': return '🔵 낮음';
    }
  }

  function getProjectName(pid: string): string {
    var project = projects.find(function(p) { return p.id === pid; });
    return project ? (project.icon + ' ' + project.name) : '미분류';
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal - 바텀 시트 형태 */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl p-5 pb-8 animate-slideUp safe-area-bottom max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? '새 태스크' : isEditing ? '태스크 수정' : '태스크 상세'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="닫기"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* View Mode */}
        {!isEditing && task && (
          <div className="space-y-4">
            {/* 카테고리 & 중요 표시 */}
            <div className="flex items-center gap-2">
              <span className={
                'px-2 py-1 rounded-full text-xs font-medium ' +
                (task.category === 'work'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300')
              }>
                {task.category === 'work' ? '💼 업무' : '🏠 일상'}
              </span>
              {starred && (
                <span className="text-yellow-500">
                  <Star size={18} fill="currentColor" />
                </span>
              )}
            </div>

            {/* 제목 */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{task.title}</h3>

            {/* 설명 */}
            {task.description && (
              <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                <AlignLeft size={18} className="mt-0.5 flex-shrink-0" />
                <p className="whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* 프로젝트 */}
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Folder size={18} />
              <span>{getProjectName(task.projectId || 'project_default')}</span>
            </div>

            {/* 우선순위 */}
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Flag size={18} />
              <span>{getPriorityLabel(task.priority)}</span>
            </div>

            {/* 마감일 */}
            {task.dueDate && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Calendar size={18} />
                <span>마감: {formatDisplayDate(task.dueDate)}</span>
              </div>
            )}

            {/* 오늘 예정 */}
            {scheduledDate && (
              <div className="flex items-center gap-3 text-lavender-500">
                <CalendarCheck size={18} />
                <span>예정: {formatDisplayDate(scheduledDate)}</span>
              </div>
            )}

            {/* 예상 시간 */}
            {task.estimatedMinutes && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Clock size={18} />
                <span>예상 {task.estimatedMinutes}분</span>
              </div>
            )}

            {/* 누군가 기다림 */}
            {waitingFor && (
              <div className="flex items-center gap-3 text-orange-500">
                <Users size={18} />
                <span>👤 {getWaitingForLabel(waitingFor)} 대기 중</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleEdit}
                className="flex-1 py-3 bg-lavender-400 text-white rounded-xl font-medium hover:bg-lavender-500 transition-colors"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="p-3 text-red-500 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Edit/Create Mode */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 카테고리 선택 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={function() { setCategory('work'); }}
                className={
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ' +
                  (category === 'work'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                    : 'border-gray-200 text-gray-500 dark:border-gray-600 dark:text-gray-400')
                }
              >
                <Briefcase size={18} />
                <span>업무</span>
              </button>
              <button
                type="button"
                onClick={function() { setCategory('life'); }}
                className={
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ' +
                  (category === 'life'
                    ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300'
                    : 'border-gray-200 text-gray-500 dark:border-gray-600 dark:text-gray-400')
                }
              >
                <Home size={18} />
                <span>일상</span>
              </button>
            </div>

            {/* 제목 + 중요 표시 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={function(e) { setTitle(e.target.value); }}
                placeholder="태스크 제목"
                className="flex-1 px-4 py-3 text-lg font-medium border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={function() { setStarred(!starred); }}
                className={
                  'w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ' +
                  (starred
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-700'
                    : 'border-gray-200 text-gray-300 dark:border-gray-600 dark:text-gray-500')
                }
              >
                <Star size={20} fill={starred ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* 설명 */}
            <div className="flex items-start gap-3">
              <AlignLeft size={18} className="text-gray-400 mt-3" />
              <textarea
                value={description}
                onChange={function(e) { setDescription(e.target.value); }}
                placeholder="설명 (선택사항)"
                rows={2}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* 프로젝트 선택 */}
            <div className="flex items-center gap-3">
              <Folder size={18} className="text-gray-400" />
              <select
                value={projectId}
                onChange={function(e) { setProjectId(e.target.value); }}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {projects.map(function(project) {
                  return (
                    <option key={project.id} value={project.id}>
                      {project.icon} {project.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 우선순위 & 마감일 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 우선순위 */}
              <div className="flex items-center gap-3">
                <Flag size={18} className="text-gray-400" />
                <select
                  value={priority}
                  onChange={function(e) { setPriority(e.target.value as any); }}
                  className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="high">🔴 높음</option>
                  <option value="medium">🟡 보통</option>
                  <option value="low">🔵 낮음</option>
                </select>
              </div>

              {/* 마감일 */}
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={function(e) { setDueDate(e.target.value); }}
                  className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* 오늘 예정 날짜 */}
            <div className="flex items-center gap-3">
              <CalendarCheck size={18} className="text-gray-400" />
              <input
                type="date"
                value={scheduledDate}
                onChange={function(e) { setScheduledDate(e.target.value); }}
                placeholder="오늘 예정"
                className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">예정일</span>
            </div>

            {/* 예상 시간 */}
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-400" />
              <input
                type="number"
                value={estimatedMinutes}
                onChange={function(e) { setEstimatedMinutes(e.target.value); }}
                placeholder="예상 시간"
                min="1"
                max="480"
                className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">분</span>
            </div>

            {/* 누군가 기다림 */}
            <div className="relative">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-gray-400" />
                <button
                  type="button"
                  onClick={function() { setShowWaitingPicker(!showWaitingPicker); }}
                  className="flex-1 flex items-center justify-between px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-left"
                >
                  <span className={waitingFor ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}>
                    {waitingFor ? '👤 ' + getWaitingForLabel(waitingFor) + ' 대기 중' : '누군가 기다림 (선택)'}
                  </span>
                  <ChevronDown size={18} className={'text-gray-400 transition-transform ' + (showWaitingPicker ? 'rotate-180' : '')} />
                </button>
              </div>

              {showWaitingPicker && (
                <div className="absolute top-full left-7 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 overflow-hidden">
                  {[
                    { value: null, label: '없음' },
                    { value: 'external' as const, label: '👤 외부 클라이언트' },
                    { value: 'boss' as const, label: '👤 상사' },
                    { value: 'team' as const, label: '👤 팀원' }
                  ].map(function(option) {
                    return (
                      <button
                        key={option.value || 'none'}
                        type="button"
                        onClick={function() {
                          setWaitingFor(option.value);
                          setShowWaitingPicker(false);
                        }}
                        className={'w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 ' +
                          (waitingFor === option.value ? 'bg-lavender-50 dark:bg-lavender-900/20' : '')}
                      >
                        <span className={option.value ? 'text-orange-500' : 'text-gray-600 dark:text-gray-300'}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 pt-2">
              {task && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-3 text-red-500 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 bg-lavender-400 text-white rounded-xl font-medium hover:bg-lavender-500 transition-colors"
              >
                {task ? '수정 완료' : '추가'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
