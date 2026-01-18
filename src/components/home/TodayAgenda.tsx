import { useState, useEffect } from 'react';
import {
  Check, ChevronDown, ChevronUp, Clock, Plus, X, Bot,
  RefreshCw, Briefcase, Home, Sparkles, Calendar
} from 'lucide-react';
import {
  AgendaTask, TodayAgendas,
  getTodayAgendas, generateTodayAgendas, regenerateAgendas,
  completeAgendaTask, updateAgendaTask
} from '../../services/agenda';
import { v4 as uuidv4 } from 'uuid';

type HomeMode = 'all' | 'work' | 'life';

interface TodayAgendaProps {
  mode?: HomeMode;
  onTaskComplete?: (taskId: string) => void;
}

/**
 * Today's Agenda 컴포넌트
 * - All 모드: Work 1개, Life 1개, 알프레도 추천 1개 = 총 3개 Agenda
 * - Work 모드: Work Agenda만 확대 표시
 * - Life 모드: Life Agenda만 확대 표시
 * - 각 Agenda 토글 시 하위 Task 3개 표시
 * - 알프레도가 제안하고 사용자가 수정 가능
 */
export default function TodayAgenda({ mode = 'all', onTaskComplete }: TodayAgendaProps) {
  const [agendas, setAgendas] = useState<TodayAgendas | null>(null);
  const [expandedAgenda, setExpandedAgenda] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editingTask, setEditingTask] = useState<AgendaTask | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadAgendas();
  }, []);

  // Work/Life 모드에서는 첫 번째 Agenda 자동 확장
  useEffect(() => {
    if (agendas && mode !== 'all') {
      const targetAgenda = mode === 'work' ? agendas.work : agendas.life;
      if (targetAgenda) {
        setExpandedAgenda(targetAgenda.id);
      }
    }
  }, [agendas, mode]);

  // 모드별 타이틀
  const getModeTitle = () => {
    switch (mode) {
      case 'work': return "Today's Work Agenda";
      case 'life': return "Today's Life Agenda";
      default: return "Today's Agenda";
    }
  };

  const loadAgendas = async () => {
    setIsLoading(true);
    try {
      let data = getTodayAgendas();
      if (!data) {
        data = await generateTodayAgendas();
      }
      setAgendas(data);
    } catch (error) {
      console.error('Failed to load agendas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const data = await regenerateAgendas();
      setAgendas(data);
      setExpandedAgenda(null);
    } catch (error) {
      console.error('Failed to regenerate agendas:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleAgenda = (agendaId: string) => {
    setExpandedAgenda(expandedAgenda === agendaId ? null : agendaId);
  };

  const handleCompleteTask = (category: 'work' | 'life' | 'recommended', taskId: string) => {
    completeAgendaTask(category, taskId);
    if (onTaskComplete) {
      onTaskComplete(taskId);
    }
    loadAgendas();
  };

  const handleEditTask = (task: AgendaTask) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleSaveTask = (category: 'work' | 'life' | 'recommended', taskId: string, updates: Partial<AgendaTask>) => {
    updateAgendaTask(category, taskId, updates);
    setShowEditModal(false);
    setEditingTask(null);
    loadAgendas();
  };

  // 카테고리 아이콘
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return <Briefcase size={14} className="text-blue-500" />;
      case 'life': return <Home size={14} className="text-green-500" />;
      case 'recommended': return <Sparkles size={14} className="text-amber-500" />;
      default: return <Calendar size={14} className="text-gray-500" />;
    }
  };

  // 카테고리 색상
  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'work': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', accent: 'bg-blue-500' };
      case 'life': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', accent: 'bg-green-500' };
      case 'recommended': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', accent: 'bg-amber-500' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', accent: 'bg-gray-500' };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-center gap-2">
          <RefreshCw size={18} className="animate-spin text-primary" />
          <span className="text-sm text-gray-500">알프레도가 오늘의 Agenda를 준비하고 있어요...</span>
        </div>
      </div>
    );
  }

  // 모드별 Agenda 필터링
  const getAgendaList = () => {
    const allAgendas = [
      { key: 'work' as const, data: agendas?.work },
      { key: 'life' as const, data: agendas?.life },
      { key: 'recommended' as const, data: agendas?.recommended }
    ].filter(a => a.data !== null);

    if (mode === 'work') {
      // Work 모드: Work Agenda만 표시 (없으면 recommended도 추가)
      const workAgenda = allAgendas.filter(a => a.key === 'work');
      if (workAgenda.length === 0) {
        return allAgendas.filter(a => a.key === 'recommended');
      }
      return workAgenda;
    }

    if (mode === 'life') {
      // Life 모드: Life Agenda만 표시 (없으면 recommended도 추가)
      const lifeAgenda = allAgendas.filter(a => a.key === 'life');
      if (lifeAgenda.length === 0) {
        return allAgendas.filter(a => a.key === 'recommended');
      }
      return lifeAgenda;
    }

    // All 모드: 전체 표시
    return allAgendas;
  };

  const agendaList = getAgendaList();

  if (agendaList.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 dark:text-white">{getModeTitle()}</h2>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
            새로 제안받기
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
          오늘의 할 일이 없어요.<br />
          Task를 추가하면 알프레도가 Agenda를 만들어 드릴게요.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 dark:text-white">{getModeTitle()}</h2>
            <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs font-medium text-primary">
              {agendaList.length}
            </span>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
            새로 제안받기
          </button>
        </div>

        {/* Agenda Cards */}
        <div className="space-y-3">
          {agendaList.map(({ key, data }) => {
            if (!data) return null;
            const isExpanded = expandedAgenda === data.id;
            const colors = getCategoryColors(key);

            return (
              <div
                key={data.id}
                className={`rounded-xl border overflow-hidden transition-all ${colors.border} ${isExpanded ? colors.bg : 'bg-white dark:bg-gray-800'}`}
              >
                {/* Agenda Header */}
                <button
                  onClick={() => handleToggleAgenda(data.id)}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                      {getCategoryIcon(key)}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{data.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{data.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Progress */}
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${colors.text}`}>{data.progress}%</span>
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${colors.accent} rounded-full transition-all`}
                          style={{ width: `${data.progress}%` }}
                        />
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Tasks (Top 3) */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2">
                    {/* 알프레도 제안 이유 */}
                    {data.alfredoReason && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-gray-700/50 rounded-lg mb-3">
                        <Bot size={14} className="text-primary flex-shrink-0" />
                        <p className="text-xs text-gray-600 dark:text-gray-300">{data.alfredoReason}</p>
                      </div>
                    )}

                    {/* Tasks */}
                    {data.tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 ${task.status === 'done' ? 'opacity-50' : ''}`}
                      >
                        {/* 순서 */}
                        <span className={`w-6 h-6 rounded-full ${index === 0 ? 'bg-amber-400 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'} flex items-center justify-center text-xs font-bold`}>
                          {index + 1}
                        </span>

                        {/* 완료 체크 */}
                        <button
                          onClick={() => handleCompleteTask(key, task.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'done' ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-gray-500 hover:border-primary'}`}
                        >
                          {task.status === 'done' && <Check size={14} />}
                        </button>

                        {/* Task 정보 */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-gray-900 dark:text-white truncate ${task.status === 'done' ? 'line-through' : ''}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {/* 카테고리 뱃지 */}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase
                              ${task.autoCategory === 'work' ? 'bg-blue-100 text-blue-600' : ''}
                              ${task.autoCategory === 'life' ? 'bg-green-100 text-green-600' : ''}
                              ${task.autoCategory === 'finance' ? 'bg-purple-100 text-purple-600' : ''}
                              ${task.autoCategory === 'health' ? 'bg-red-100 text-red-600' : ''}
                              ${task.autoCategory === 'social' ? 'bg-pink-100 text-pink-600' : ''}
                              ${task.autoCategory === 'other' ? 'bg-gray-100 text-gray-600' : ''}
                            `}>
                              {task.autoCategory}
                            </span>
                            {/* 예상 시간 */}
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={10} />
                              {task.estimatedMinutes}m
                            </span>
                          </div>
                        </div>

                        {/* 편집 버튼 */}
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          <span className="text-xs">수정</span>
                        </button>
                      </div>
                    ))}

                    {/* Events */}
                    {data.events.length > 0 && (
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">연결된 일정</p>
                        {data.events.map(event => (
                          <div
                            key={event.id}
                            className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg"
                          >
                            <Calendar size={14} className="text-primary" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{event.title}</span>
                            <span className="text-xs text-gray-400 ml-auto">
                              {new Date(event.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
          onSave={(updates) => {
            // 어떤 Agenda에 속하는지 찾기
            const category = agendas?.work?.tasks.find(t => t.id === editingTask.id) ? 'work'
              : agendas?.life?.tasks.find(t => t.id === editingTask.id) ? 'life'
              : 'recommended';
            handleSaveTask(category, editingTask.id, updates);
          }}
        />
      )}
    </>
  );
}

// Task 편집 모달
function TaskEditModal({
  task,
  onClose,
  onSave
}: {
  task: AgendaTask;
  onClose: () => void;
  onSave: (updates: Partial<AgendaTask>) => void;
}) {
  const [estimatedMinutes, setEstimatedMinutes] = useState(task.estimatedMinutes);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [newSubtaskPriority, setNewSubtaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const subtask = {
      id: uuidv4(),
      title: newSubtask.trim(),
      completed: false,
      priority: newSubtaskPriority
    };
    setSubtasks([...subtasks, subtask]);
    setNewSubtask('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s =>
      s.id === id ? { ...s, completed: !s.completed } : s
    ));
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSave = () => {
    // subtasks를 로컬 스토리지에 저장
    localStorage.setItem(`alfredo_subtasks_${task.id}`, JSON.stringify(subtasks));
    onSave({ estimatedMinutes, subtasks });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl p-5 pb-8 animate-slideUp safe-area-bottom max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">과업 상세 수정</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-primary uppercase mb-1 block">Title</label>
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{task.title}</h4>
        </div>

        {/* Estimated Duration */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Estimated Duration</label>
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-primary" />
            <input
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="w-20 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg text-center font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-gray-500">분</span>
          </div>
        </div>

        {/* Subtasks */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-primary uppercase">Subtasks & Priorities</label>
            <span className="text-sm font-medium text-primary">
              {subtasks.filter(s => s.completed).length}/{subtasks.length}
            </span>
          </div>

          {/* Subtask List */}
          <div className="space-y-2 mb-3">
            {subtasks.map(subtask => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <button
                  onClick={() => handleToggleSubtask(subtask.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                    ${subtask.completed ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-gray-500'}
                  `}
                >
                  {subtask.completed && <Check size={12} />}
                </button>
                <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                  {subtask.title}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded
                  ${subtask.priority === 'high' ? 'bg-red-100 text-red-600' : ''}
                  ${subtask.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : ''}
                  ${subtask.priority === 'low' ? 'bg-blue-100 text-blue-600' : ''}
                `}>
                  {subtask.priority[0].toUpperCase()}
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

          {/* Add Subtask */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="할 일의 세부 단계를 입력하세요..."
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
            {(['high', 'medium', 'low'] as const).map(p => (
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

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          수정 완료
        </button>
      </div>
    </div>
  );
}
