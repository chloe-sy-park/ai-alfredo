import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Plus, 
  Play, 
  Check, 
  Trash2,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpDown,
  Circle,
  Loader,
  CheckCircle2,
  Calendar,
  Timer
} from 'lucide-react';
import { 
  getTasksByCategory, 
  addTask, 
  deleteTask, 
  changeTaskStatus,
  sortTasks,
  filterTasks,
  getDDayLabel,
  getDDay,
  getTotalEstimatedMinutes,
  formatMinutes,
  Task,
  TaskStatus,
  SortOption,
  FilterOption
} from '../services/tasks';
import { getTodayEvents, isGoogleAuthenticated, CalendarEvent } from '../services/calendar';
import { setFocusFromTop3 } from '../services/focusNow';

export default function Work() {
  var navigate = useNavigate();
  var [tasks, setTasks] = useState<Task[]>([]);
  var [events, setEvents] = useState<CalendarEvent[]>([]);
  var [showAddModal, setShowAddModal] = useState(false);
  var [showAlfredo, setShowAlfredo] = useState(true);
  
  // 필터/정렬
  var [sortBy, setSortBy] = useState<SortOption>('priority');
  var [filterBy, setFilterBy] = useState<FilterOption>('all');
  var [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // 새 태스크 폼
  var [newTaskTitle, setNewTaskTitle] = useState('');
  var [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  var [newTaskDueDate, setNewTaskDueDate] = useState('');
  var [newTaskEstimate, setNewTaskEstimate] = useState('');
  var [newTaskDescription, setNewTaskDescription] = useState('');

  useEffect(function() {
    loadData();
  }, []);

  function loadData() {
    var workTasks = getTasksByCategory('work');
    setTasks(workTasks);
    
    if (isGoogleAuthenticated()) {
      getTodayEvents().then(function(evts) {
        setEvents(evts);
      });
    }
  }

  // 필터링 및 정렬 적용
  var filteredTasks = filterTasks(tasks, filterBy);
  var sortedTasks = sortTasks(filteredTasks, sortBy);
  
  // 상태별 분리
  var todoTasks = sortedTasks.filter(function(t) { return t.status === 'todo'; });
  var inProgressTasks = sortedTasks.filter(function(t) { return t.status === 'in_progress'; });
  var doneTasks = sortedTasks.filter(function(t) { return t.status === 'done'; });
  
  var pendingTasks = sortedTasks.filter(function(t) { return t.status !== 'done'; });
  var isEmpty = tasks.length === 0;
  
  // 총 예상 시간
  var totalEstimate = getTotalEstimatedMinutes(pendingTasks);

  function calculateFocusHours(): number {
    if (events.length === 0) return 8;
    
    var workStart = 9;
    var workEnd = 18;
    var meetingHours = 0;
    
    events.forEach(function(e) {
      if (e.title && (e.title.includes('회의') || e.title.includes('미팅') || e.title.includes('Meeting') || e.title.includes('meeting'))) {
        var start = new Date(e.start);
        var end = new Date(e.end);
        meetingHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }
    });
    
    return Math.max(workEnd - workStart - meetingHours, 0);
  }

  function handleAddTask() {
    if (!newTaskTitle.trim()) return;
    
    addTask({
      title: newTaskTitle,
      category: 'work',
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
      estimatedMinutes: newTaskEstimate ? parseInt(newTaskEstimate) : undefined,
      description: newTaskDescription || undefined
    });
    
    // 폼 리셋
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    setNewTaskEstimate('');
    setNewTaskDescription('');
    setShowAddModal(false);
    loadData();
  }

  function handleStatusChange(id: string, newStatus: TaskStatus) {
    changeTaskStatus(id, newStatus);
    loadData();
  }

  function handleDeleteTask(id: string) {
    deleteTask(id);
    loadData();
  }

  function handleStartFocus(task: Task) {
    setFocusFromTop3(task.id, task.title);
    navigate('/');
  }

  function getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-orange-500 bg-orange-50';
      case 'low': return 'text-gray-500 bg-gray-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  }

  function getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'high': return '긴급';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '';
    }
  }

  function getStatusIcon(status: TaskStatus) {
    switch (status) {
      case 'todo': return <Circle size={20} className="text-gray-300" />;
      case 'in_progress': return <Loader size={20} className="text-blue-500" />;
      case 'done': return <CheckCircle2 size={20} className="text-green-500" />;
    }
  }

  function getNextStatus(current: TaskStatus): TaskStatus {
    switch (current) {
      case 'todo': return 'in_progress';
      case 'in_progress': return 'done';
      case 'done': return 'todo';
    }
  }

  function getDueDateColor(dueDate: string): string {
    var dday = getDDay(dueDate);
    if (dday < 0) return 'text-red-600 bg-red-100';
    if (dday === 0) return 'text-orange-600 bg-orange-100';
    if (dday === 1) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  }

  function getAlfredoMessage(): string {
    if (isEmpty) {
      return '오늘 할 일을 정리해볼까요? 3개만 골라보는 것도 좋아요!';
    }
    if (pendingTasks.length === 0 && doneTasks.length > 0) {
      return '와! 오늘 할 일을 다 끝냈어요! 정말 대단해요 🎉';
    }
    if (inProgressTasks.length > 0) {
      return '진행 중인 일이 있네요. 집중해서 끝내봐요!';
    }
    return '오늘도 차근차근 해나가면 돼요. 응원할게요!';
  }

  // 태스크 카드 렌더링
  function renderTaskCard(task: Task) {
    return (
      <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
        <button
          onClick={function() { handleStatusChange(task.id, getNextStatus(task.status)); }}
          className="mt-0.5 hover:scale-110 transition-transform"
          title={task.status === 'todo' ? '시작하기' : task.status === 'in_progress' ? '완료하기' : '다시 열기'}
        >
          {getStatusIcon(task.status)}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={'font-medium ' + (task.status === 'done' ? 'line-through text-gray-400' : '')}>
              {task.title}
            </span>
            <span className={'text-xs px-2 py-0.5 rounded-full ' + getPriorityColor(task.priority)}>
              {getPriorityLabel(task.priority)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            {task.dueDate && (
              <span className={'px-1.5 py-0.5 rounded ' + getDueDateColor(task.dueDate)}>
                {getDDayLabel(task.dueDate)}
              </span>
            )}
            {task.estimatedMinutes && (
              <span className="flex items-center gap-1">
                <Timer size={12} />
                {formatMinutes(task.estimatedMinutes)}
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-gray-400 mt-1 truncate">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {task.status !== 'done' && (
            <button
              onClick={function() { handleStartFocus(task); }}
              className="p-1.5 text-lavender-500 hover:bg-lavender-100 rounded-full"
              title="집중 모드"
            >
              <Play size={16} />
            </button>
          )}
          <button
            onClick={function() { handleDeleteTask(task.id); }}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-full"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={24} className="text-lavender-500" />
            <h1 className="text-xl font-bold">업무</h1>
          </div>
          <button
            onClick={function() { setShowAddModal(true); }}
            className="p-2 bg-lavender-100 rounded-full text-lavender-600 hover:bg-lavender-200"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* 알프레도 한마디 (접기 가능) */}
        <div className="bg-gradient-to-r from-lavender-50 to-purple-50 rounded-2xl overflow-hidden">
          <button 
            onClick={function() { setShowAlfredo(!showAlfredo); }}
            className="w-full flex items-center justify-between p-3 hover:bg-white/30"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐧</span>
              <span className="text-sm font-medium text-gray-700">알프레도</span>
            </div>
            {showAlfredo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showAlfredo && (
            <div className="px-4 pb-3">
              <p className="text-sm text-gray-600">{getAlfredoMessage()}</p>
            </div>
          )}
        </div>

        {/* Empty State */}
        {isEmpty ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="font-semibold text-gray-800 mb-2">아직 등록된 업무가 없어요</h3>
            <p className="text-sm text-gray-500 mb-6">오늘 꼭 해야 할 일을 추가해보세요</p>
            <button
              onClick={function() { setShowAddModal(true); }}
              className="w-full py-4 bg-lavender-400 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-lavender-500 transition-colors"
            >
              <Plus size={20} />
              업무 추가하기
            </button>
          </div>
        ) : (
          <>
            {/* 업무 현황 요약 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold text-lavender-500">
                    {doneTasks.length}/{tasks.length}
                  </p>
                  <p className="text-xs text-gray-500">완료</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-blue-500">
                    {inProgressTasks.length}개
                  </p>
                  <p className="text-xs text-gray-500">진행중</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-500">
                    {calculateFocusHours().toFixed(1)}h
                  </p>
                  <p className="text-xs text-gray-500">집중가능</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-orange-500">
                    {totalEstimate > 0 ? formatMinutes(totalEstimate) : '-'}
                  </p>
                  <p className="text-xs text-gray-500">예상</p>
                </div>
              </div>
            </div>

            {/* 필터/정렬 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={function() { setShowFilterMenu(!showFilterMenu); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm shadow-sm"
                >
                  <Filter size={14} />
                  {filterBy === 'all' ? '전체' : filterBy === 'todo' ? '할 일' : filterBy === 'in_progress' ? '진행중' : '완료'}
                </button>
                <button
                  onClick={function() {
                    var options: SortOption[] = ['priority', 'dueDate', 'created'];
                    var currentIndex = options.indexOf(sortBy);
                    setSortBy(options[(currentIndex + 1) % options.length]);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm shadow-sm"
                >
                  <ArrowUpDown size={14} />
                  {sortBy === 'priority' ? '우선순위' : sortBy === 'dueDate' ? '마감일' : '최신순'}
                </button>
              </div>
              <span className="text-xs text-gray-400">{filteredTasks.length}개</span>
            </div>

            {/* 필터 드롭다운 */}
            {showFilterMenu && (
              <div className="bg-white rounded-xl shadow-lg p-2 space-y-1">
                {(['all', 'todo', 'in_progress', 'done'] as FilterOption[]).map(function(opt) {
                  var labels: Record<FilterOption, string> = {
                    all: '전체',
                    todo: '할 일',
                    in_progress: '진행중',
                    done: '완료'
                  };
                  return (
                    <button
                      key={opt}
                      onClick={function() { setFilterBy(opt); setShowFilterMenu(false); }}
                      className={'w-full text-left px-3 py-2 rounded-lg text-sm ' +
                        (filterBy === opt ? 'bg-lavender-100 text-lavender-600' : 'hover:bg-gray-100')
                      }
                    >
                      {labels[opt]}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 진행중 */}
            {inProgressTasks.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Loader size={18} className="text-blue-500" />
                  <h3 className="font-semibold">진행중</h3>
                  <span className="text-xs text-gray-400">{inProgressTasks.length}개</span>
                </div>
                <div className="space-y-2">
                  {inProgressTasks.map(renderTaskCard)}
                </div>
              </div>
            )}

            {/* 할 일 */}
            {todoTasks.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={18} className="text-gray-500" />
                  <h3 className="font-semibold">할 일</h3>
                  <span className="text-xs text-gray-400">{todoTasks.length}개</span>
                </div>
                <div className="space-y-2">
                  {todoTasks.map(renderTaskCard)}
                </div>
              </div>
            )}

            {/* 완료됨 */}
            {doneTasks.length > 0 && filterBy !== 'todo' && filterBy !== 'in_progress' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Check size={18} className="text-green-500" />
                  <h3 className="font-semibold text-gray-400">완료</h3>
                  <span className="text-xs text-gray-400">{doneTasks.length}개</span>
                </div>
                <div className="space-y-2">
                  {doneTasks.slice(0, 5).map(renderTaskCard)}
                  {doneTasks.length > 5 && (
                    <p className="text-xs text-gray-400 text-center py-2">
                      +{doneTasks.length - 5}개 더 있음
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 오늘 일정 */}
            {events.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={18} className="text-blue-500" />
                  <h3 className="font-semibold">오늘 일정</h3>
                </div>
                <div className="space-y-2">
                  {events.slice(0, 5).map(function(event) {
                    var startTime = new Date(event.start).toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false
                    });
                    return (
                      <div key={event.id} className="flex items-center gap-3 p-2">
                        <span className="text-sm text-gray-500 w-12">{startTime}</span>
                        <div 
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: event.backgroundColor || '#A996FF' }}
                        />
                        <span className="flex-1 text-sm">{event.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 집중 모드 시작 */}
            {pendingTasks.length > 0 && (
              <button
                onClick={function() { navigate('/'); }}
                className="w-full py-4 bg-gradient-to-r from-lavender-400 to-purple-400 text-white rounded-2xl font-semibold shadow-lg"
              >
                🎯 집중 모드 시작
              </button>
            )}
          </>
        )}
      </div>

      {/* 태스크 추가 모달 (확장) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-4 animate-slide-up max-h-[80vh] overflow-y-auto">
            <h3 className="font-semibold text-lg mb-4">새 업무 추가</h3>
            
            {/* 제목 */}
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-1 block">할 일 *</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={function(e) { setNewTaskTitle(e.target.value); }}
                placeholder="무엇을 해야 하나요?"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lavender-300 focus:border-transparent"
                autoFocus
              />
            </div>
            
            {/* 우선순위 */}
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-2 block">우선순위</label>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as const).map(function(p) {
                  return (
                    <button
                      key={p}
                      onClick={function() { setNewTaskPriority(p); }}
                      className={'flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ' +
                        (newTaskPriority === p
                          ? getPriorityColor(p)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                      }
                    >
                      {getPriorityLabel(p)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 마감일 */}
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-1 block flex items-center gap-1">
                <Calendar size={14} />
                마감일
              </label>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={function(e) { setNewTaskDueDate(e.target.value); }}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lavender-300"
              />
            </div>

            {/* 예상 소요시간 */}
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-1 block flex items-center gap-1">
                <Timer size={14} />
                예상 소요시간 (분)
              </label>
              <div className="flex gap-2">
                {[15, 30, 60, 120].map(function(min) {
                  return (
                    <button
                      key={min}
                      onClick={function() { setNewTaskEstimate(String(min)); }}
                      className={'flex-1 py-2 rounded-xl text-sm ' +
                        (newTaskEstimate === String(min)
                          ? 'bg-lavender-100 text-lavender-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                      }
                    >
                      {formatMinutes(min)}
                    </button>
                  );
                })}
              </div>
              <input
                type="number"
                value={newTaskEstimate}
                onChange={function(e) { setNewTaskEstimate(e.target.value); }}
                placeholder="직접 입력"
                className="w-full mt-2 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lavender-300"
              />
            </div>

            {/* 메모 */}
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-1 block">메모</label>
              <textarea
                value={newTaskDescription}
                onChange={function(e) { setNewTaskDescription(e.target.value); }}
                placeholder="추가 정보가 있다면 적어주세요"
                rows={2}
                className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-lavender-300"
              />
            </div>
            
            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={function() { 
                  setShowAddModal(false);
                  setNewTaskTitle('');
                  setNewTaskPriority('medium');
                  setNewTaskDueDate('');
                  setNewTaskEstimate('');
                  setNewTaskDescription('');
                }}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className={'flex-1 py-3 rounded-xl font-medium transition-colors ' +
                  (newTaskTitle.trim()
                    ? 'bg-lavender-400 text-white hover:bg-lavender-500'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                }
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
