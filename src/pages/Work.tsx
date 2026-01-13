import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Plus, Star, Clock, Filter, CheckCircle2, Trash2, X } from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import type { Task, TaskStatus } from '../types/database';

export default function Work() {
  const { 
    tasks, 
    isLoading, 
    fetchTasks, 
    createTask, 
    completeTask, 
    deleteTask,
    updateTask 
  } = useTaskStore();
  
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 필터링된 태스크
  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  // 상태별 분류
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const doneTasks = filteredTasks.filter(t => t.status === 'done');

  // 새 태스크 생성
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    await createTask({
      title: newTaskTitle,
      category: 'work',
      status: 'pending',
      priority: 'medium',
    });
    
    setNewTaskTitle('');
    setShowNewTaskModal(false);
  };

  // 태스크 완료
  const handleComplete = async (id: string) => {
    await completeTask(id);
  };

  // 태스크 삭제
  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠어요?')) {
      await deleteTask(id);
    }
  };

  // 별표 토글
  const handleToggleStar = async (task: Task) => {
    await updateTask(task.id, { is_top3: !task.is_top3 });
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">워크</h1>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setFilterStatus(filterStatus === 'all' ? 'pending' : 'all')}
          >
            <Filter size={18} className={filterStatus !== 'all' ? 'text-lavender-500' : ''} />
          </Button>
          <Button size="sm" leftIcon={<Plus size={18} />} onClick={() => setShowNewTaskModal(true)}>
            새 태스크
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* 진행 중 */}
          {inProgressTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-gray-500 mb-2">진행 중</h2>
              <div className="space-y-2">
                {inProgressTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={() => handleComplete(task.id)}
                    onDelete={() => handleDelete(task.id)}
                    onToggleStar={() => handleToggleStar(task)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 할 일 */}
          {pendingTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-gray-500 mb-2">할 일 ({pendingTasks.length})</h2>
              <div className="space-y-2">
                {pendingTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={() => handleComplete(task.id)}
                    onDelete={() => handleDelete(task.id)}
                    onToggleStar={() => handleToggleStar(task)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 완료 */}
          {doneTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-gray-500 mb-2">완료 ({doneTasks.length})</h2>
              <div className="space-y-2 opacity-60">
                {doneTasks.slice(0, 5).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={() => {}}
                    onDelete={() => handleDelete(task.id)}
                    onToggleStar={() => handleToggleStar(task)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">📝</p>
              <p className="text-gray-500 mb-4">아직 태스크가 없어요</p>
              <Button onClick={() => setShowNewTaskModal(true)} leftIcon={<Plus size={18} />}>
                첫 태스크 만들기
              </Button>
            </div>
          )}
        </>
      )}

      {/* 새 태스크 모달 */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">새 태스크</h3>
              <button onClick={() => setShowNewTaskModal(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="태스크 제목"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-400 mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
            />
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setShowNewTaskModal(false)}>
                취소
              </Button>
              <Button className="flex-1" onClick={handleCreateTask}>
                추가
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  onToggleStar: () => void;
}

function TaskCard({ task, onComplete, onDelete, onToggleStar }: TaskCardProps) {
  const isCompleted = task.status === 'done';

  return (
    <Card className={`${isCompleted ? 'bg-gray-50' : ''}`}>
      <div className="flex items-start gap-3">
        <button 
          onClick={onComplete}
          disabled={isCompleted}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            isCompleted
              ? 'bg-lavender-400 border-lavender-400 text-white'
              : 'border-gray-300 hover:border-lavender-400'
          }`}
        >
          {isCompleted && <CheckCircle2 size={12} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={onToggleStar} className="p-1">
                <Star 
                  size={16} 
                  className={task.is_top3 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} 
                />
              </button>
              <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {task.due_date && (
              <span className="text-xs text-gray-500">
                {new Date(task.due_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {task.estimated_minutes && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {task.estimated_minutes}분
              </span>
            )}
          </div>
          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-lavender-100 text-lavender-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
