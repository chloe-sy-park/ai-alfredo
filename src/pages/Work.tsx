import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Calendar,
  Plus,
  Target,
  Play,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  Task, 
  getTasks, 
  addTask, 
  toggleTaskComplete, 
  deleteTask,
  getTasksByCategory,
  getTodayCompletedCount,
  getPendingCount,
  sortByPriority
} from '../services/tasks';
import { 
  getTodayEvents, 
  isGoogleAuthenticated, 
  CalendarEvent 
} from '../services/calendar';
import { getCurrentFocus, setFocusFromTop3 } from '../services/focusNow';

export default function Work() {
  var navigate = useNavigate();
  var [tasks, setTasks] = useState<Task[]>([]);
  var [events, setEvents] = useState<CalendarEvent[]>([]);
  var [isAddingTask, setIsAddingTask] = useState(false);
  var [newTaskTitle, setNewTaskTitle] = useState('');
  var [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(function() {
    loadData();
  }, []);

  function loadData() {
    // 업무 태스크
    var workTasks = getTasksByCategory('work');
    setTasks(sortByPriority(workTasks));
    
    // 캘린더 이벤트
    if (isGoogleAuthenticated()) {
      getTodayEvents()
        .then(function(evts) { setEvents(evts); })
        .catch(function(err) { console.error('Calendar error:', err); });
    }
  }

  function handleAddTask() {
    if (!newTaskTitle.trim()) return;
    
    addTask({
      title: newTaskTitle.trim(),
      category: 'work',
      priority: newTaskPriority
    });
    
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setIsAddingTask(false);
    loadData();
  }

  function handleToggleTask(id: string) {
    toggleTaskComplete(id);
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

  // 통계
  var completedToday = getTodayCompletedCount('work');
  var pendingCount = getPendingCount('work');
  var meetingCount = events.filter(function(e) { 
    return e.summary && (e.summary.includes('미팅') || e.summary.includes('회의') || e.summary.includes('meeting'));
  }).length;

  // 집중 시간 계산 (미팅 제외한 시간)
  var now = new Date();
  var focusHours = 0;
  var lastEventEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
  
  events.forEach(function(e) {
    if (e.start && e.end) {
      var start = new Date(e.start);
      var end = new Date(e.end);
      if (start > lastEventEnd) {
        focusHours += (start.getTime() - lastEventEnd.getTime()) / (1000 * 60 * 60);
      }
      lastEventEnd = end > lastEventEnd ? end : lastEventEnd;
    }
  });
  focusHours = Math.max(0, Math.round(focusHours));

  // 업무 탑3 (high priority)
  var top3Tasks = tasks.filter(function(t) { return t.status !== 'done'; }).slice(0, 3);
  var otherTasks = tasks.filter(function(t) { return t.status !== 'done'; }).slice(3);
  var doneTasks = tasks.filter(function(t) { return t.status === 'done'; });

  var priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-600 border-red-200',
    medium: 'bg-orange-100 text-orange-600 border-orange-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200'
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-mobile mx-auto p-4 space-y-4">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="text-lavender-500" size={24} />
            <h1 className="text-xl font-bold">업무</h1>
          </div>
          <button
            onClick={function() { setIsAddingTask(true); }}
            className="p-2 bg-lavender-100 rounded-full text-lavender-500 hover:bg-lavender-200"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* 업무 현황 요약 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-sm text-gray-500 mb-3">📊 오늘 업무 현황</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                <CheckCircle size={16} />
                <span className="font-bold text-lg">{completedToday}/{completedToday + pendingCount}</span>
              </div>
              <p className="text-xs text-gray-400">완료</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                <Calendar size={16} />
                <span className="font-bold text-lg">{meetingCount}개</span>
              </div>
              <p className="text-xs text-gray-400">미팅</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                <Clock size={16} />
                <span className="font-bold text-lg">{focusHours}시간</span>
              </div>
              <p className="text-xs text-gray-400">집중 가능</p>
            </div>
          </div>
        </div>

        {/* 업무 탑3 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-red-400" />
              <h2 className="font-semibold">🎯 업무 탑3</h2>
            </div>
          </div>
          
          {top3Tasks.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm">
              오늘의 중요 업무를 추가하세요
            </p>
          ) : (
            <div className="space-y-2">
              {top3Tasks.map(function(task, index) {
                return (
                  <div 
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-sm font-bold text-gray-400 w-5">
                      {index + 1}.
                    </span>
                    <button
                      onClick={function() { handleToggleTask(task.id); }}
                      className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-green-400 flex-shrink-0"
                    />
                    <span className="flex-1 text-sm">{task.title}</span>
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + priorityColors[task.priority]}>
                      {task.priority === 'high' ? '긴급' : task.priority === 'medium' ? '중간' : '낮음'}
                    </span>
                    <button
                      onClick={function() { handleStartFocus(task); }}
                      className="p-1.5 bg-lavender-100 rounded-lg text-lavender-500 hover:bg-lavender-200"
                    >
                      <Play size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 기타 업무 */}
        {otherTasks.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold text-sm text-gray-500 mb-3">📋 기타 업무</h2>
            <div className="space-y-2">
              {otherTasks.map(function(task) {
                return (
                  <div 
                    key={task.id}
                    className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl"
                  >
                    <button
                      onClick={function() { handleToggleTask(task.id); }}
                      className="w-4 h-4 rounded-full border-2 border-gray-300 hover:border-green-400 flex-shrink-0"
                    />
                    <span className="flex-1 text-sm text-gray-600">{task.title}</span>
                    <button
                      onClick={function() { handleDeleteTask(task.id); }}
                      className="p-1 text-gray-300 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 완료된 업무 */}
        {doneTasks.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold text-sm text-gray-400 mb-3">✅ 완료됨</h2>
            <div className="space-y-2">
              {doneTasks.slice(0, 5).map(function(task) {
                return (
                  <div 
                    key={task.id}
                    className="flex items-center gap-3 p-2 opacity-60"
                  >
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="flex-1 text-sm text-gray-400 line-through">{task.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 업무 일정 */}
        {events.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold text-sm text-gray-500 mb-3">📅 오늘 일정</h2>
            <div className="space-y-2">
              {events.slice(0, 5).map(function(event) {
                var startTime = event.start ? new Date(event.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';
                return (
                  <div 
                    key={event.id}
                    className="flex items-center gap-3 p-2.5 bg-blue-50 rounded-xl"
                  >
                    <span className="text-xs text-blue-500 font-medium w-12">{startTime}</span>
                    <span className="flex-1 text-sm">{event.summary}</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 집중 모드 버튼 */}
        <button
          onClick={function() { navigate('/'); }}
          className="w-full py-4 bg-gradient-to-r from-lavender-400 to-purple-400 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Play size={20} />
          집중 모드 시작
        </button>
      </div>

      {/* 태스크 추가 모달 */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-lg animate-slide-up">
            <h3 className="font-bold text-lg mb-4">업무 추가</h3>
            
            <input
              type="text"
              value={newTaskTitle}
              onChange={function(e) { setNewTaskTitle(e.target.value); }}
              placeholder="할 일을 입력하세요"
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 outline-none focus:border-lavender-400"
              autoFocus
            />
            
            <div className="flex gap-2 mb-4">
              {(['high', 'medium', 'low'] as const).map(function(p) {
                var labels = { high: '긴급', medium: '중간', low: '낮음' };
                return (
                  <button
                    key={p}
                    onClick={function() { setNewTaskPriority(p); }}
                    className={
                      'flex-1 py-2 rounded-xl text-sm font-medium transition-colors ' +
                      (newTaskPriority === p 
                        ? priorityColors[p] + ' border'
                        : 'bg-gray-100 text-gray-500')
                    }
                  >
                    {labels[p]}
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={function() { setIsAddingTask(false); setNewTaskTitle(''); }}
                className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="flex-1 py-3 bg-lavender-400 text-white rounded-xl disabled:opacity-50"
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
