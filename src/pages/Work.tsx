import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Plus, Play, Trash2, Clock, Target,
  ChevronDown, ChevronUp, ChevronRight, Filter, ArrowUpDown,
  Circle, Loader, CheckCircle2, Calendar, Timer,
  FolderOpen, Tag, RefreshCw, Download, Upload,
  LayoutList, LayoutGrid, Bell, Repeat, MoreVertical,
  X, Check, Edit2, StopCircle
} from 'lucide-react';
import { 
  getTasksByCategory, addTask, deleteTask, changeTaskStatus, updateTask,
  sortTasks, filterTasks, getDDayLabel, getDDay, getSubtasks,
  getTotalEstimatedMinutes, getTotalActualMinutes, formatMinutes,
  getParentTasks, getAllTags, recordActualTime, createRecurringTask,
  Task, TaskStatus, SortOption, FilterOption, RecurrenceRule, ReminderSetting
} from '../services/tasks';
import { 
  getProjectsByCategory, addProject, Project, getDefaultColors 
} from '../services/projects';
import { 
  syncWithGoogleTasks, getGoogleTaskLists, GoogleTaskList 
} from '../services/taskSync';
import { 
  exportTasksToCSV, downloadCSV, importTasksFromCSV, readCSVFile 
} from '../services/taskImportExport';
import { getTodayEvents, isGoogleAuthenticated, CalendarEvent } from '../services/calendar';
import { setFocusFromTop3 } from '../services/focusNow';

type ViewMode = 'list' | 'kanban';

export default function Work() {
  var navigate = useNavigate();
  var fileInputRef = useRef<HTMLInputElement>(null);
  
  // 기본 상태
  var [tasks, setTasks] = useState<Task[]>([]);
  var [projects, setProjects] = useState<Project[]>([]);
  var [events, setEvents] = useState<CalendarEvent[]>([]);
  var [allTags, setAllTags] = useState<string[]>([]);
  
  // UI 상태
  var [viewMode, setViewMode] = useState<ViewMode>('list');
  var [showAddModal, setShowAddModal] = useState(false);
  var [showProjectModal, setShowProjectModal] = useState(false);
  var [showSyncModal, setShowSyncModal] = useState(false);
  var [showImportModal, setShowImportModal] = useState(false);
  var [showAlfredo, setShowAlfredo] = useState(true);
  var [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  var [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  var [trackingTaskId, setTrackingTaskId] = useState<string | null>(null);
  var [trackingStartTime, setTrackingStartTime] = useState<number | null>(null);
  
  // 필터/정렬
  var [sortBy, setSortBy] = useState<SortOption>('priority');
  var [filterBy, setFilterBy] = useState<FilterOption>('all');
  var [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  var [selectedTag, setSelectedTag] = useState<string | null>(null);
  var [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // 새 태스크 폼
  var [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '',
    estimatedMinutes: '',
    description: '',
    projectId: '',
    tags: '' as string,
    parentId: '',
    recurrenceType: '' as '' | 'daily' | 'weekly' | 'monthly',
    recurrenceInterval: '1',
    reminderEnabled: false,
    reminderMinutes: '30'
  });
  
  // 새 프로젝트
  var [newProject, setNewProject] = useState({ name: '', color: '#A996FF' });
  
  // Google Tasks
  var [googleTaskLists, setGoogleTaskLists] = useState<GoogleTaskList[]>([]);
  var [selectedTaskListId, setSelectedTaskListId] = useState('');
  var [syncing, setSyncing] = useState(false);
  var [syncResult, setSyncResult] = useState<{ imported: number; exported: number; updated: number } | null>(null);

  useEffect(function() {
    loadData();
  }, []);

  useEffect(function() {
    // 시간 추적 타이머
    var interval: NodeJS.Timeout | null = null;
    if (trackingTaskId && trackingStartTime) {
      interval = setInterval(function() {
        // 강제 리렌더링
        setTasks([...tasks]);
      }, 60000); // 1분마다
    }
    return function() {
      if (interval) clearInterval(interval);
    };
  }, [trackingTaskId, trackingStartTime]);

  function loadData() {
    var workTasks = getTasksByCategory('work');
    setTasks(workTasks);
    setProjects(getProjectsByCategory('work'));
    setAllTags(getAllTags());
    
    if (isGoogleAuthenticated()) {
      getTodayEvents().then(setEvents);
      getGoogleTaskLists().then(setGoogleTaskLists);
    }
  }

  // 필터링
  var filteredTasks = tasks;
  if (selectedProjectId) {
    filteredTasks = filteredTasks.filter(function(t) { return t.projectId === selectedProjectId; });
  }
  if (selectedTag) {
    filteredTasks = filteredTasks.filter(function(t) { return t.tags && t.tags.indexOf(selectedTag) !== -1; });
  }
  filteredTasks = filterTasks(filteredTasks, filterBy);
  
  // 부모 태스크만
  var parentTasks = getParentTasks(filteredTasks);
  var sortedTasks = sortTasks(parentTasks, sortBy);
  
  // 상태별 분리
  var todoTasks = sortedTasks.filter(function(t) { return t.status === 'todo'; });
  var inProgressTasks = sortedTasks.filter(function(t) { return t.status === 'in_progress'; });
  var doneTasks = sortedTasks.filter(function(t) { return t.status === 'done'; });
  var pendingTasks = sortedTasks.filter(function(t) { return t.status !== 'done'; });
  var isEmpty = tasks.length === 0;
  
  var totalEstimate = getTotalEstimatedMinutes(pendingTasks);
  var totalActual = getTotalActualMinutes(tasks.filter(function(t) { return t.status === 'done'; }));

  function calculateFocusHours(): number {
    if (events.length === 0) return 8;
    var meetingHours = 0;
    events.forEach(function(e) {
      if (e.title && (e.title.includes('회의') || e.title.includes('미팅') || e.title.toLowerCase().includes('meeting'))) {
        meetingHours += (new Date(e.end).getTime() - new Date(e.start).getTime()) / (1000 * 60 * 60);
      }
    });
    return Math.max(8 - meetingHours, 0);
  }

  function handleAddTask() {
    if (!newTask.title.trim()) return;
    
    var recurrence: RecurrenceRule | undefined;
    if (newTask.recurrenceType) {
      recurrence = {
        type: newTask.recurrenceType,
        interval: parseInt(newTask.recurrenceInterval) || 1
      };
    }
    
    var reminder: ReminderSetting | undefined;
    if (newTask.reminderEnabled && newTask.dueDate) {
      reminder = {
        enabled: true,
        minutesBefore: parseInt(newTask.reminderMinutes) || 30
      };
    }
    
    var tags = newTask.tags ? newTask.tags.split(',').map(function(t) { return t.trim(); }).filter(Boolean) : undefined;
    
    addTask({
      title: newTask.title,
      category: 'work',
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      estimatedMinutes: newTask.estimatedMinutes ? parseInt(newTask.estimatedMinutes) : undefined,
      description: newTask.description || undefined,
      projectId: newTask.projectId || undefined,
      parentId: newTask.parentId || undefined,
      tags: tags,
      recurrence: recurrence,
      reminder: reminder
    });
    
    resetNewTask();
    setShowAddModal(false);
    loadData();
  }

  function resetNewTask() {
    setNewTask({
      title: '', priority: 'medium', dueDate: '', estimatedMinutes: '',
      description: '', projectId: '', tags: '', parentId: '',
      recurrenceType: '', recurrenceInterval: '1',
      reminderEnabled: false, reminderMinutes: '30'
    });
  }

  function handleStatusChange(id: string, newStatus: TaskStatus) {
    var task = tasks.find(function(t) { return t.id === id; });
    changeTaskStatus(id, newStatus);
    
    // 반복 태스크 완료 시 다음 태스크 생성
    if (newStatus === 'done' && task && task.recurrence) {
      createRecurringTask(task);
    }
    
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

  function handleAddProject() {
    if (!newProject.name.trim()) return;
    addProject({ name: newProject.name, color: newProject.color, category: 'work' });
    setNewProject({ name: '', color: '#A996FF' });
    setShowProjectModal(false);
    loadData();
  }

  async function handleSync() {
    if (!selectedTaskListId) return;
    setSyncing(true);
    var result = await syncWithGoogleTasks(selectedTaskListId, 'work');
    setSyncResult(result);
    setSyncing(false);
    loadData();
  }

  function handleExport() {
    var csv = exportTasksToCSV('work');
    var date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, 'alfredo-tasks-' + date + '.csv');
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    var file = e.target.files?.[0];
    if (!file) return;
    
    try {
      var csv = await readCSVFile(file);
      var result = importTasksFromCSV(csv, 'work');
      alert('가져오기 완료: ' + result.success + '개 성공, ' + result.failed + '개 실패');
      loadData();
    } catch (err) {
      alert('파일 읽기 실패');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function startTimeTracking(taskId: string) {
    setTrackingTaskId(taskId);
    setTrackingStartTime(Date.now());
  }

  function stopTimeTracking() {
    if (trackingTaskId && trackingStartTime) {
      var elapsed = Math.round((Date.now() - trackingStartTime) / 60000);
      var task = tasks.find(function(t) { return t.id === trackingTaskId; });
      var current = task?.actualMinutes || 0;
      recordActualTime(trackingTaskId, current + elapsed);
      loadData();
    }
    setTrackingTaskId(null);
    setTrackingStartTime(null);
  }

  function getTrackingTime(): string {
    if (!trackingStartTime) return '0분';
    var elapsed = Math.round((Date.now() - trackingStartTime) / 60000);
    return formatMinutes(elapsed);
  }

  function toggleTaskExpand(taskId: string) {
    var newSet = new Set(expandedTasks);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setExpandedTasks(newSet);
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
      case 'todo': return <Circle size={18} className="text-gray-300" />;
      case 'in_progress': return <Loader size={18} className="text-blue-500" />;
      case 'done': return <CheckCircle2 size={18} className="text-green-500" />;
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

  function getProjectColor(projectId: string | undefined): string {
    if (!projectId) return '#E5E7EB';
    var project = projects.find(function(p) { return p.id === projectId; });
    return project?.color || '#E5E7EB';
  }

  function getProjectName(projectId: string | undefined): string {
    if (!projectId) return '';
    var project = projects.find(function(p) { return p.id === projectId; });
    return project?.name || '';
  }

  function getAlfredoMessage(): string {
    if (isEmpty) return '오늘 할 일을 정리해볼까요?';
    if (pendingTasks.length === 0) return '오늘 할 일을 다 끝냈어요! 🎉';
    if (inProgressTasks.length > 0) return '진행 중인 일이 있네요. 집중해서 끝내봐요!';
    return '오늘도 차근차근 해나가면 돼요!';
  }

  // 태스크 카드
  function renderTaskCard(task: Task, isSubtask?: boolean) {
    var subtasks = getSubtasks(task.id);
    var hasSubtasks = subtasks.length > 0;
    var isExpanded = expandedTasks.has(task.id);
    var isTracking = trackingTaskId === task.id;
    
    return (
      <div key={task.id} className={isSubtask ? 'ml-6 border-l-2 border-gray-200 pl-3' : ''}>
        <div className={'flex items-start gap-2 p-3 rounded-xl transition-colors ' + 
          (isTracking ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-gray-50 hover:bg-gray-100')}>
          
          {/* 상태 버튼 */}
          <button
            onClick={function() { handleStatusChange(task.id, getNextStatus(task.status)); }}
            className="mt-0.5 hover:scale-110 transition-transform"
          >
            {getStatusIcon(task.status)}
          </button>
          
          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* 프로젝트 표시 */}
              {task.projectId && (
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: getProjectColor(task.projectId) }}
                />
              )}
              
              {/* 제목 */}
              <span className={'font-medium ' + (task.status === 'done' ? 'line-through text-gray-400' : '')}>
                {task.title}
              </span>
              
              {/* 우선순위 */}
              <span className={'text-xs px-1.5 py-0.5 rounded ' + getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </span>
              
              {/* 반복 아이콘 */}
              {task.recurrence && (
                <Repeat size={12} className="text-purple-500" />
              )}
              
              {/* 알림 아이콘 */}
              {task.reminder?.enabled && (
                <Bell size={12} className="text-yellow-500" />
              )}
            </div>
            
            {/* 메타 정보 */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {task.dueDate && (
                <span className={'text-xs px-1.5 py-0.5 rounded ' + getDueDateColor(task.dueDate)}>
                  {getDDayLabel(task.dueDate)}
                </span>
              )}
              {task.estimatedMinutes && (
                <span className="text-xs text-gray-500 flex items-center gap-0.5">
                  <Timer size={10} />{formatMinutes(task.estimatedMinutes)}
                </span>
              )}
              {task.actualMinutes && (
                <span className="text-xs text-blue-500 flex items-center gap-0.5">
                  ✓{formatMinutes(task.actualMinutes)}
                </span>
              )}
              {isTracking && (
                <span className="text-xs text-blue-600 font-medium animate-pulse">
                  ⏱ {getTrackingTime()}
                </span>
              )}
            </div>
            
            {/* 태그 */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {task.tags.map(function(tag) {
                  return (
                    <span key={tag} className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">
                      #{tag}
                    </span>
                  );
                })}
              </div>
            )}
            
            {/* 설명 */}
            {task.description && (
              <p className="text-xs text-gray-400 mt-1 truncate">{task.description}</p>
            )}
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex items-center gap-1">
            {/* 서브태스크 확장 */}
            {hasSubtasks && (
              <button
                onClick={function() { toggleTaskExpand(task.id); }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            
            {/* 시간 추적 */}
            {task.status !== 'done' && (
              isTracking ? (
                <button
                  onClick={stopTimeTracking}
                  className="p-1.5 text-red-500 hover:bg-red-100 rounded-full"
                  title="시간 추적 중지"
                >
                  <StopCircle size={16} />
                </button>
              ) : (
                <button
                  onClick={function() { startTimeTracking(task.id); }}
                  className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-full"
                  title="시간 추적 시작"
                >
                  <Timer size={16} />
                </button>
              )
            )}
            
            {/* 집중 모드 */}
            {task.status !== 'done' && !isTracking && (
              <button
                onClick={function() { handleStartFocus(task); }}
                className="p-1.5 text-lavender-500 hover:bg-lavender-100 rounded-full"
                title="집중 모드"
              >
                <Play size={16} />
              </button>
            )}
            
            {/* 삭제 */}
            <button
              onClick={function() { handleDeleteTask(task.id); }}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-full"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {/* 서브태스크 */}
        {hasSubtasks && isExpanded && (
          <div className="mt-1 space-y-1">
            {subtasks.map(function(sub) {
              return renderTaskCard(sub, true);
            })}
          </div>
        )}
      </div>
    );
  }

  // 칸반 컨테이너
  function renderKanbanColumn(title: string, columnTasks: Task[], status: TaskStatus) {
    return (
      <div className="flex-1 min-w-[280px] bg-gray-100 rounded-xl p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
            {columnTasks.length}
          </span>
        </div>
        <div className="space-y-2">
          {columnTasks.map(function(task) {
            return renderTaskCard(task);
          })}
          {columnTasks.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">
              태스크 없음
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={24} className="text-lavender-500" />
            <h1 className="text-xl font-bold">업무</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* 뷰 모드 토글 */}
            <button
              onClick={function() { setViewMode(viewMode === 'list' ? 'kanban' : 'list'); }}
              className="p-2 bg-white rounded-lg shadow-sm"
              title={viewMode === 'list' ? '칸반 뷰' : '리스트 뷰'}
            >
              {viewMode === 'list' ? <LayoutGrid size={18} /> : <LayoutList size={18} />}
            </button>
            
            {/* Import/Export */}
            <button
              onClick={handleExport}
              className="p-2 bg-white rounded-lg shadow-sm"
              title="CSV 내보내기"
            >
              <Download size={18} />
            </button>
            <button
              onClick={function() { fileInputRef.current?.click(); }}
              className="p-2 bg-white rounded-lg shadow-sm"
              title="CSV 가져오기"
            >
              <Upload size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
            
            {/* Google Tasks 동기화 */}
            {isGoogleAuthenticated() && (
              <button
                onClick={function() { setShowSyncModal(true); }}
                className="p-2 bg-white rounded-lg shadow-sm"
                title="Google Tasks 동기화"
              >
                <RefreshCw size={18} />
              </button>
            )}
            
            {/* 프로젝트 관리 */}
            <button
              onClick={function() { setShowProjectModal(true); }}
              className="p-2 bg-white rounded-lg shadow-sm"
              title="프로젝트 관리"
            >
              <FolderOpen size={18} />
            </button>
            
            {/* 추가 */}
            <button
              onClick={function() { setShowAddModal(true); }}
              className="p-2 bg-lavender-100 rounded-lg text-lavender-600"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* 알프레도 */}
        <div className="bg-gradient-to-r from-lavender-50 to-purple-50 rounded-xl overflow-hidden">
          <button 
            onClick={function() { setShowAlfredo(!showAlfredo); }}
            className="w-full flex items-center justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🐧</span>
              <span className="text-sm font-medium">알프레도</span>
            </div>
            {showAlfredo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showAlfredo && (
            <div className="px-4 pb-3">
              <p className="text-sm text-gray-600">{getAlfredoMessage()}</p>
            </div>
          )}
        </div>

        {/* 필터 바 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 프로젝트 필터 */}
          <select
            value={selectedProjectId || ''}
            onChange={function(e) { setSelectedProjectId(e.target.value || null); }}
            className="px-3 py-1.5 bg-white rounded-full text-sm shadow-sm"
          >
            <option value="">모든 프로젝트</option>
            {projects.map(function(p) {
              return <option key={p.id} value={p.id}>{p.name}</option>;
            })}
          </select>
          
          {/* 태그 필터 */}
          {allTags.length > 0 && (
            <select
              value={selectedTag || ''}
              onChange={function(e) { setSelectedTag(e.target.value || null); }}
              className="px-3 py-1.5 bg-white rounded-full text-sm shadow-sm"
            >
              <option value="">모든 태그</option>
              {allTags.map(function(tag) {
                return <option key={tag} value={tag}>#{tag}</option>;
              })}
            </select>
          )}
          
          {/* 상태 필터 */}
          <button
            onClick={function() { setShowFilterMenu(!showFilterMenu); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm shadow-sm"
          >
            <Filter size={14} />
            {filterBy === 'all' ? '전체' : filterBy === 'todo' ? '할 일' : filterBy === 'in_progress' ? '진행중' : '완료'}
          </button>
          
          {/* 정렬 */}
          <button
            onClick={function() {
              var options: SortOption[] = ['priority', 'dueDate', 'created', 'project'];
              var idx = options.indexOf(sortBy);
              setSortBy(options[(idx + 1) % options.length]);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm shadow-sm"
          >
            <ArrowUpDown size={14} />
            {sortBy === 'priority' ? '우선순위' : sortBy === 'dueDate' ? '마감일' : sortBy === 'created' ? '최신순' : '프로젝트'}
          </button>
          
          <span className="text-xs text-gray-400 ml-auto">{parentTasks.length}개</span>
        </div>

        {/* 필터 드롭다운 */}
        {showFilterMenu && (
          <div className="bg-white rounded-xl shadow-lg p-2 space-y-1">
            {(['all', 'todo', 'in_progress', 'done'] as FilterOption[]).map(function(opt) {
              var labels: Record<FilterOption, string> = { all: '전체', todo: '할 일', in_progress: '진행중', done: '완료' };
              return (
                <button
                  key={opt}
                  onClick={function() { setFilterBy(opt); setShowFilterMenu(false); }}
                  className={'w-full text-left px-3 py-2 rounded-lg text-sm ' +
                    (filterBy === opt ? 'bg-lavender-100 text-lavender-600' : 'hover:bg-gray-100')}
                >
                  {labels[opt]}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {isEmpty ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-semibold mb-2">아직 등록된 업무가 없어요</h3>
            <p className="text-sm text-gray-500 mb-4">CSV를 가져오거나 새 업무를 추가해보세요</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={function() { fileInputRef.current?.click(); }}
                className="px-4 py-2 bg-gray-100 rounded-xl text-sm"
              >
                CSV 가져오기
              </button>
              <button
                onClick={function() { setShowAddModal(true); }}
                className="px-4 py-2 bg-lavender-400 text-white rounded-xl text-sm"
              >
                업무 추가
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 현황 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="grid grid-cols-5 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-lavender-500">{doneTasks.length}/{parentTasks.length}</p>
                  <p className="text-xs text-gray-500">완료</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-500">{inProgressTasks.length}</p>
                  <p className="text-xs text-gray-500">진행중</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-500">{calculateFocusHours().toFixed(1)}h</p>
                  <p className="text-xs text-gray-500">집중가능</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-500">
                    {totalEstimate > 0 ? formatMinutes(totalEstimate) : '-'}
                  </p>
                  <p className="text-xs text-gray-500">예상</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-500">
                    {totalActual > 0 ? formatMinutes(totalActual) : '-'}
                  </p>
                  <p className="text-xs text-gray-500">실제</p>
                </div>
              </div>
            </div>

            {/* 컨텐츠 */}
            {viewMode === 'kanban' ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {renderKanbanColumn('할 일', todoTasks, 'todo')}
                {renderKanbanColumn('진행중', inProgressTasks, 'in_progress')}
                {renderKanbanColumn('완료', doneTasks, 'done')}
              </div>
            ) : (
              <div className="space-y-4">
                {/* 진행중 */}
                {inProgressTasks.length > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Loader size={16} className="text-blue-500" />
                      <h3 className="font-semibold text-sm">진행중</h3>
                      <span className="text-xs text-gray-400">{inProgressTasks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {inProgressTasks.map(function(t) { return renderTaskCard(t); })}
                    </div>
                  </div>
                )}

                {/* 할 일 */}
                {todoTasks.length > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Target size={16} className="text-gray-500" />
                      <h3 className="font-semibold text-sm">할 일</h3>
                      <span className="text-xs text-gray-400">{todoTasks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {todoTasks.map(function(t) { return renderTaskCard(t); })}
                    </div>
                  </div>
                )}

                {/* 완료 */}
                {doneTasks.length > 0 && filterBy !== 'todo' && filterBy !== 'in_progress' && (
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Check size={16} className="text-green-500" />
                      <h3 className="font-semibold text-sm text-gray-400">완료</h3>
                      <span className="text-xs text-gray-400">{doneTasks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {doneTasks.slice(0, 5).map(function(t) { return renderTaskCard(t); })}
                      {doneTasks.length > 5 && (
                        <p className="text-xs text-gray-400 text-center py-2">+{doneTasks.length - 5}개 더</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 태스크 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">새 업무</h3>
              <button onClick={function() { setShowAddModal(false); resetNewTask(); }}>
                <X size={20} />
              </button>
            </div>
            
            {/* 제목 */}
            <input
              type="text"
              value={newTask.title}
              onChange={function(e) { setNewTask({...newTask, title: e.target.value}); }}
              placeholder="무엇을 해야 하나요?"
              className="w-full p-3 border rounded-xl mb-3"
              autoFocus
            />
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* 프로젝트 */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">프로젝트</label>
                <select
                  value={newTask.projectId}
                  onChange={function(e) { setNewTask({...newTask, projectId: e.target.value}); }}
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  <option value="">없음</option>
                  {projects.map(function(p) {
                    return <option key={p.id} value={p.id}>{p.name}</option>;
                  })}
                </select>
              </div>
              
              {/* 마감일 */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">마감일</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={function(e) { setNewTask({...newTask, dueDate: e.target.value}); }}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
            </div>
            
            {/* 우선순위 */}
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">우선순위</label>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as const).map(function(p) {
                  return (
                    <button
                      key={p}
                      onClick={function() { setNewTask({...newTask, priority: p}); }}
                      className={'flex-1 py-2 rounded-lg text-sm ' +
                        (newTask.priority === p ? getPriorityColor(p) : 'bg-gray-100')}
                    >
                      {getPriorityLabel(p)}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* 예상 시간 */}
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">예상 시간</label>
              <div className="flex gap-2">
                {[15, 30, 60, 120].map(function(m) {
                  return (
                    <button
                      key={m}
                      onClick={function() { setNewTask({...newTask, estimatedMinutes: String(m)}); }}
                      className={'flex-1 py-2 rounded-lg text-sm ' +
                        (newTask.estimatedMinutes === String(m) ? 'bg-lavender-100 text-lavender-600' : 'bg-gray-100')}
                    >
                      {formatMinutes(m)}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* 태그 */}
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">태그 (쉼표로 구분)</label>
              <input
                type="text"
                value={newTask.tags}
                onChange={function(e) { setNewTask({...newTask, tags: e.target.value}); }}
                placeholder="예: 회의, 리뷰, 기획"
                className="w-full p-2 border rounded-lg text-sm"
              />
            </div>
            
            {/* 반복 */}
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">반복</label>
              <select
                value={newTask.recurrenceType}
                onChange={function(e) { setNewTask({...newTask, recurrenceType: e.target.value as '' | 'daily' | 'weekly' | 'monthly'}); }}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="">반복 안함</option>
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>
            
            {/* 알림 */}
            {newTask.dueDate && (
              <div className="mb-3 flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newTask.reminderEnabled}
                    onChange={function(e) { setNewTask({...newTask, reminderEnabled: e.target.checked}); }}
                  />
                  알림
                </label>
                {newTask.reminderEnabled && (
                  <select
                    value={newTask.reminderMinutes}
                    onChange={function(e) { setNewTask({...newTask, reminderMinutes: e.target.value}); }}
                    className="p-1 border rounded text-sm"
                  >
                    <option value="15">15분 전</option>
                    <option value="30">30분 전</option>
                    <option value="60">1시간 전</option>
                    <option value="1440">1일 전</option>
                  </select>
                )}
              </div>
            )}
            
            {/* 메모 */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">메모</label>
              <textarea
                value={newTask.description}
                onChange={function(e) { setNewTask({...newTask, description: e.target.value}); }}
                placeholder="추가 정보"
                rows={2}
                className="w-full p-2 border rounded-lg text-sm resize-none"
              />
            </div>
            
            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={function() { setShowAddModal(false); resetNewTask(); }}
                className="flex-1 py-3 bg-gray-100 rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTask.title.trim()}
                className={'flex-1 py-3 rounded-xl ' +
                  (newTask.title.trim() ? 'bg-lavender-400 text-white' : 'bg-gray-200 text-gray-400')}
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 모달 */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">프로젝트 관리</h3>
              <button onClick={function() { setShowProjectModal(false); }}>
                <X size={20} />
              </button>
            </div>
            
            {/* 프로젝트 목록 */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {projects.map(function(p) {
                return (
                  <div key={p.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="flex-1 text-sm">{p.name}</span>
                  </div>
                );
              })}
              {projects.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">프로젝트가 없어요</p>
              )}
            </div>
            
            {/* 새 프로젝트 */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-2">새 프로젝트</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newProject.name}
                  onChange={function(e) { setNewProject({...newProject, name: e.target.value}); }}
                  placeholder="프로젝트 이름"
                  className="flex-1 p-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-2 mb-3">
                {getDefaultColors().map(function(c) {
                  return (
                    <button
                      key={c}
                      onClick={function() { setNewProject({...newProject, color: c}); }}
                      className={'w-6 h-6 rounded-full ' + (newProject.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : '')}
                      style={{ backgroundColor: c }}
                    />
                  );
                })}
              </div>
              <button
                onClick={handleAddProject}
                disabled={!newProject.name.trim()}
                className={'w-full py-2 rounded-lg text-sm ' +
                  (newProject.name.trim() ? 'bg-lavender-400 text-white' : 'bg-gray-200 text-gray-400')}
              >
                프로젝트 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Tasks 동기화 모달 */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Google Tasks 동기화</h3>
              <button onClick={function() { setShowSyncModal(false); setSyncResult(null); }}>
                <X size={20} />
              </button>
            </div>
            
            {syncResult ? (
              <div className="text-center py-4">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
                <p className="font-medium mb-2">동기화 완료!</p>
                <p className="text-sm text-gray-500">
                  가져옴: {syncResult.imported}개 / 내보냄: {syncResult.exported}개 / 업데이트: {syncResult.updated}개
                </p>
                <button
                  onClick={function() { setShowSyncModal(false); setSyncResult(null); }}
                  className="mt-4 px-4 py-2 bg-lavender-400 text-white rounded-lg"
                >
                  확인
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Google Tasks와 양방향 동기화합니다.
                </p>
                
                <select
                  value={selectedTaskListId}
                  onChange={function(e) { setSelectedTaskListId(e.target.value); }}
                  className="w-full p-2 border rounded-lg text-sm mb-4"
                >
                  <option value="">태스크 리스트 선택</option>
                  {googleTaskLists.map(function(list) {
                    return <option key={list.id} value={list.id}>{list.title}</option>;
                  })}
                </select>
                
                <button
                  onClick={handleSync}
                  disabled={!selectedTaskListId || syncing}
                  className={'w-full py-3 rounded-xl flex items-center justify-center gap-2 ' +
                    (selectedTaskListId && !syncing ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400')}
                >
                  {syncing ? (
                    <><RefreshCw size={18} className="animate-spin" /> 동기화 중...</>
                  ) : (
                    <><RefreshCw size={18} /> 동기화 시작</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
