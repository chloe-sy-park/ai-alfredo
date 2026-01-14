import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Plus, 
  Play, 
  Check, 
  Trash2,
  Clock,
  Target
} from 'lucide-react';
import { getTasksByCategory, addTask, toggleTaskComplete, deleteTask, Task } from '../services/tasks';
import { getTodayEvents, isGoogleAuthenticated, CalendarEvent } from '../services/calendar';
import { setFocusFromTop3 } from '../services/focusNow';

export default function Work() {
  var navigate = useNavigate();
  var [tasks, setTasks] = useState<Task[]>([]);
  var [events, setEvents] = useState<CalendarEvent[]>([]);
  var [showAddModal, setShowAddModal] = useState(false);
  var [newTaskTitle, setNewTaskTitle] = useState('');
  var [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(function() {
    loadData();
  }, []);

  function loadData() {
    // 업무 태스크만 로드
    var workTasks = getTasksByCategory('work');
    setTasks(workTasks);
    
    // 캘린더 이벤트
    if (isGoogleAuthenticated()) {
      getTodayEvents().then(function(evts) {
        setEvents(evts);
      });
    }
  }

  // 완료/미완료 분리
  var pendingTasks = tasks.filter(function(t) { return t.status !== 'done'; });
  var completedTasks = tasks.filter(function(t) { return t.status === 'done'; });
  
  // 우선순위별 정렬
  var priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  pendingTasks.sort(function(a, b) {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  // Top3 (높은 우선순위)
  var top3Tasks = pendingTasks.filter(function(t) { return t.priority === 'high'; }).slice(0, 3);
  var otherTasks = pendingTasks.filter(function(t) { return t.priority !== 'high' || !top3Tasks.includes(t); });

  // 집중 시간 계산 (미팅 사이 gap)
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
      priority: newTaskPriority
    });
    
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setShowAddModal(false);
    loadData();
  }

  function handleToggleComplete(id: string) {
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
      case 'medium': return '중간';
      case 'low': return '낮음';
      default: return '';
    }
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

        {/* 업무 현황 요약 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-lavender-500">
                {completedTasks.length}/{tasks.length}
              </p>
              <p className="text-xs text-gray-500">완료</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">
                {events.length}개
              </p>
              <p className="text-xs text-gray-500">미팅</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">
                {calculateFocusHours().toFixed(1)}시간
              </p>
              <p className="text-xs text-gray-500">집중가능</p>
            </div>
          </div>
        </div>

        {/* Work Top 3 */}
        {top3Tasks.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-red-500" />
              <h3 className="font-semibold">오늘 꼭 해야할 일</h3>
            </div>
            <div className="space-y-2">
              {top3Tasks.map(function(task, idx) {
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                    <span className="text-lg font-bold text-red-400">{idx + 1}</span>
                    <span className="flex-1 font-medium">{task.title}</span>
                    <button
                      onClick={function() { handleStartFocus(task); }}
                      className="p-2 bg-red-100 rounded-full text-red-500 hover:bg-red-200"
                    >
                      <Play size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 기타 태스크 */}
        {otherTasks.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3">다른 할 일</h3>
            <div className="space-y-2">
              {otherTasks.map(function(task) {
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <button
                      onClick={function() { handleToggleComplete(task.id); }}
                      className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-lavender-400"
                    >
                      {task.status === 'done' && <Check size={14} className="text-lavender-500" />}
                    </button>
                    <span className="flex-1">{task.title}</span>
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + getPriorityColor(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </span>
                    <button
                      onClick={function() { handleDeleteTask(task.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 완료된 태스크 */}
        {completedTasks.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-400">완료됨</h3>
            <div className="space-y-2">
              {completedTasks.slice(0, 5).map(function(task) {
                return (
                  <div key={task.id} className="flex items-center gap-3 p-2 opacity-50">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={14} className="text-green-500" />
                    </div>
                    <span className="flex-1 line-through text-gray-400">{task.title}</span>
                  </div>
                );
              })}
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
        <button
          onClick={function() { navigate('/'); }}
          className="w-full py-4 bg-gradient-to-r from-lavender-400 to-purple-400 text-white rounded-2xl font-semibold shadow-lg"
        >
          🎯 집중 모드 시작
        </button>
      </div>

      {/* 태스크 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-4 animate-slide-up">
            <h3 className="font-semibold text-lg mb-4">새 업무 추가</h3>
            
            <div className="mb-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={function(e) { setNewTaskTitle(e.target.value); }}
                placeholder="할 일 입력"
                className="w-full p-3 border border-gray-200 rounded-xl"
                autoFocus
              />
            </div>
            
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-2 block">우선순위</label>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as const).map(function(p) {
                  return (
                    <button
                      key={p}
                      onClick={function() { setNewTaskPriority(p); }}
                      className={'flex-1 py-2 px-3 rounded-xl text-sm font-medium ' +
                        (newTaskPriority === p
                          ? getPriorityColor(p)
                          : 'bg-gray-100 text-gray-600')
                      }
                    >
                      {getPriorityLabel(p)}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={function() { setShowAddModal(false); }}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={handleAddTask}
                className="flex-1 py-3 bg-lavender-400 text-white rounded-xl font-medium"
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
