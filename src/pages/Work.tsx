// Work.tsx - 워크 대시보드 (알프레도 Work View 통합)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout';
import {
  ProjectTaskGroup,
  TaskModal,
  VoiceUploadCard,
  MeetingMinutesCard,
  MeetingMinutes
} from '../components/work';
import { getTasksByCategory, Task } from '../services/tasks';
import { usePostAction } from '../stores/postActionStore';
import { getTodayEvents, CalendarEvent } from '../services/calendar';
import { getActiveProjects, Project, updateProjectTaskCounts } from '../services/projects';
import {
  Briefcase,
  Plus,
  LayoutGrid,
  List,
  Timer,
  Calendar,
  Target,
  Mail,
  Clock,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { MeetingPrepSection } from '../components/work/MeetingPrepCard';
import { useWorkOSStore } from '../stores/workOSStore';

// 알프레도 브리핑 컴포넌트
function AlfredoBriefing({ tasks, events }: { tasks: Task[]; events: CalendarEvent[] }) {
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const urgentTasks = pendingTasks.filter(t => t.priority === 'high');
  const todayDeadlines = pendingTasks.filter(t => {
    if (!t.dueDate) return false;
    const today = new Date().toDateString();
    return new Date(t.dueDate).toDateString() === today;
  });

  // 브리핑 메시지 생성
  const getMessage = (): string => {
    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 12) greeting = '좋은 아침이에요';
    else if (hour < 18) greeting = '오후도 화이팅';
    else greeting = '오늘 하루 수고했어요';

    if (urgentTasks.length > 0) {
      return `${greeting}. 긴급 작업 ${urgentTasks.length}개가 대기 중이에요.`;
    }
    if (events.length > 0) {
      return `${greeting}. 오늘 ${events.length}개의 미팅이 있어요.`;
    }
    if (todayDeadlines.length > 0) {
      return `${greeting}. 오늘 마감인 작업이 ${todayDeadlines.length}개 있어요.`;
    }
    if (pendingTasks.length === 0) {
      return `${greeting}. 오늘 예정된 작업이 없어요. 여유로운 하루 되세요!`;
    }
    return `${greeting}. ${pendingTasks.length}개의 작업이 진행 중이에요.`;
  };

  return (
    <div className="bg-gradient-to-r from-lavender-100 to-lavender-50 rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
          <img
            src="/assets/alfredo/avatar/alfredo-avatar-48.png"
            alt="알프레도"
            className="w-9 h-9 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-2xl">🎩</span>'; }}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-medium text-primary">알프레도 브리핑</span>
          </div>
          <p className="text-sm text-text-primary leading-relaxed">{getMessage()}</p>
        </div>
      </div>

      {/* 퀵 통계 */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-white/70 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-text-primary">{pendingTasks.length}</p>
          <p className="text-[10px] text-neutral-500">진행 중</p>
        </div>
        <div className="bg-white/70 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-500">{urgentTasks.length}</p>
          <p className="text-[10px] text-neutral-500">긴급</p>
        </div>
        <div className="bg-white/70 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{events.length}</p>
          <p className="text-[10px] text-neutral-500">미팅</p>
        </div>
      </div>
    </div>
  );
}

// Today's Agenda 컴포넌트
function TodaysAgenda({ events }: { events: CalendarEvent[] }) {
  const now = new Date();
  const sortedEvents = [...events].sort((a, b) =>
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-primary" />
          <h3 className="font-semibold text-text-primary">Today's Agenda</h3>
        </div>
        <span className="text-xs text-neutral-500">{events.length}개 일정</span>
      </div>

      {sortedEvents.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-6">오늘 예정된 일정이 없어요</p>
      ) : (
        <div className="space-y-2">
          {sortedEvents.slice(0, 5).map((event) => {
            const startTime = new Date(event.start);
            const endTime = new Date(event.end);
            const isNow = startTime <= now && now <= endTime;
            const isPast = endTime < now;

            return (
              <div
                key={event.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isNow ? 'bg-primary/10 border-l-4 border-primary' :
                  isPast ? 'opacity-50 bg-neutral-50' : 'bg-neutral-50 hover:bg-neutral-100'
                }`}
              >
                <div className="min-w-[50px] text-center">
                  <p className={`text-sm font-medium ${isNow ? 'text-primary' : 'text-text-primary'}`}>
                    {startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isNow ? 'text-primary font-medium' : 'text-text-primary'}`}>
                    {event.title}
                  </p>
                  {event.location && (
                    <p className="text-xs text-neutral-500 truncate">{event.location}</p>
                  )}
                </div>
                {isNow && (
                  <span className="text-[10px] px-2 py-0.5 bg-primary text-white rounded-full">진행 중</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Priority Tasks 컴포넌트
function PriorityTasks({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (task: Task) => void }) {
  const priorityTasks = tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return 0;
    })
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-orange-500" />
          <h3 className="font-semibold text-text-primary">Priority Tasks</h3>
        </div>
      </div>

      {priorityTasks.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-6">우선순위 태스크가 없어요</p>
      ) : (
        <div className="space-y-2">
          {priorityTasks.map(task => (
            <button
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                task.status === 'done'
                  ? 'bg-green-500 border-green-500'
                  : task.priority === 'high'
                  ? 'border-red-400'
                  : 'border-neutral-300'
              }`}>
                {task.status === 'done' && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${task.status === 'done' ? 'text-neutral-400 line-through' : 'text-text-primary'}`}>
                  {task.title}
                </p>
              </div>
              {task.priority === 'high' && (
                <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded">긴급</span>
              )}
              <ChevronRight size={14} className="text-neutral-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// 이메일 신호 컴포넌트 (인커밍 시그널 통합)
function EmailSignals() {
  // 실제로는 이메일 API 연동 필요
  const signals = [
    { id: '1', from: '김팀장', subject: '프로젝트 리뷰 요청', time: '10분 전', isUnread: true },
    { id: '2', from: 'design 채널', subject: '새 메시지 3개', time: '30분 전', isUnread: true },
    { id: '3', from: 'GitHub', subject: 'PR에서 멘션됨', time: '1시간 전', isUnread: false },
  ];

  const unreadCount = signals.filter(s => s.isUnread).length;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-blue-500" />
          <h3 className="font-semibold text-text-primary">이메일 신호</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">{unreadCount}</span>
          )}
        </div>
        <button className="text-xs text-neutral-500 hover:text-primary">모두 보기</button>
      </div>

      <div className="space-y-2">
        {signals.map(signal => (
          <div
            key={signal.id}
            className={`p-3 rounded-xl cursor-pointer transition-colors ${
              signal.isUnread ? 'bg-blue-50 hover:bg-blue-100' : 'bg-neutral-50 hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-sm ${signal.isUnread ? 'font-medium text-text-primary' : 'text-neutral-600'}`}>
                {signal.from}
              </span>
              <span className="text-xs text-neutral-400">{signal.time}</span>
            </div>
            <p className="text-sm text-neutral-600 truncate mt-0.5">{signal.subject}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 타임라인 컴포넌트
function WorkTimelineCompact({ events }: { events: CalendarEvent[] }) {
  const now = new Date();
  const currentHour = now.getHours();

  // 9시~18시 타임라인
  const hours = Array.from({ length: 10 }, (_, i) => 9 + i);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-neutral-500" />
          <h3 className="font-semibold text-text-primary">Timeline</h3>
        </div>
      </div>

      <div className="relative">
        {hours.map(hour => {
          const hasEvent = events.some(e => {
            const start = new Date(e.start).getHours();
            const end = new Date(e.end).getHours();
            return hour >= start && hour < end;
          });
          const isNow = hour === currentHour;

          return (
            <div key={hour} className="flex items-center gap-3 h-8">
              <span className={`text-xs w-10 ${isNow ? 'text-primary font-medium' : 'text-neutral-400'}`}>
                {String(hour).padStart(2, '0')}:00
              </span>
              <div className={`flex-1 h-1.5 rounded-full ${
                isNow ? 'bg-primary' :
                hasEvent ? 'bg-lavender-300' : 'bg-neutral-100'
              }`} />
            </div>
          );
        })}

        {/* 현재 시간 인디케이터 */}
        <div
          className="absolute left-12 w-2 h-2 bg-primary rounded-full -ml-[3px]"
          style={{ top: `${(currentHour - 9) * 32 + 12}px` }}
        />
      </div>
    </div>
  );
}

// 메인 컴포넌트
export default function Work() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<'dashboard' | 'project' | 'list'>('dashboard');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultProjectId, setDefaultProjectId] = useState<string>('');
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinutes | null>(null);
  const postAction = usePostAction();

  const {
    todayContext,
    initializeToday,
    selectSuggestion,
    deselectSuggestion,
    confirmSelectedTasks
  } = useWorkOSStore();

  // 데이터 로드
  useEffect(() => {
    loadData();
    initializeToday();
  }, [initializeToday]);

  const loadData = () => {
    const workTasks = getTasksByCategory('work');
    setTasks(workTasks);

    const activeProjects = getActiveProjects();
    setProjects(activeProjects);

    const taskCounts: Record<string, number> = {};
    workTasks.forEach((task) => {
      const projectId = task.projectId || 'project_default';
      taskCounts[projectId] = (taskCounts[projectId] || 0) + 1;
    });
    updateProjectTaskCounts(taskCounts);

    getTodayEvents().then(setEvents).catch(() => {});
  };

  const getTasksByProjects = (): Record<string, Task[]> => {
    const grouped: Record<string, Task[]> = {};
    projects.forEach((project) => {
      grouped[project.id] = [];
    });
    tasks.forEach((task) => {
      const projectId = task.projectId || 'project_default';
      if (!grouped[projectId]) {
        grouped[projectId] = [];
      }
      grouped[projectId].push(task);
    });
    return grouped;
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleAddTask = (projectId?: string) => {
    setDefaultProjectId(projectId || 'project_default');
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleSaveTask = () => {
    loadData();
  };

  const handleProjectEdit = (project: Project) => {
    console.log('Edit project:', project);
  };

  return (
    <div className="min-h-screen bg-neutral-50 typo-os-work">
      <PageHeader />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
        {/* 페이지 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Briefcase size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Work Dashboard</h1>
              <p className="text-xs text-neutral-500">오늘의 업무 현황을 한눈에</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 집중 타이머 버튼 */}
            <button
              onClick={() => navigate('/focus-timer')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
            >
              <Timer size={18} />
              <span className="text-sm font-medium">집중 타이머</span>
            </button>

            {/* 보기 모드 전환 */}
            <div className="bg-white rounded-xl p-1 flex shadow-sm border border-neutral-100">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  viewMode === 'dashboard'
                    ? 'bg-primary text-white'
                    : 'text-neutral-500 hover:bg-neutral-100'
                }`}
              >
                <Sparkles size={18} />
              </button>
              <button
                onClick={() => setViewMode('project')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  viewMode === 'project'
                    ? 'bg-primary text-white'
                    : 'text-neutral-500 hover:bg-neutral-100'
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-neutral-500 hover:bg-neutral-100'
                }`}
              >
                <List size={18} />
              </button>
            </div>

            {/* 태스크 추가 버튼 */}
            <button
              onClick={() => handleAddTask()}
              className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              <span className="text-sm font-medium hidden sm:inline">새 태스크</span>
            </button>
          </div>
        </div>

        {/* 대시보드 뷰 */}
        {viewMode === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* 메인 컨텐츠 (2열) */}
            <div className="lg:col-span-2 space-y-4">
              {/* 알프레도 브리핑 */}
              <AlfredoBriefing tasks={tasks} events={events} />

              {/* 미팅 준비 섹션 */}
              {todayContext?.mode === 'meeting-based' &&
                todayContext.meetingAnalyses.filter(a => a.shouldRecommend).length > 0 && (
                <MeetingPrepSection
                  analyses={todayContext.meetingAnalyses.filter(a => a.shouldRecommend)}
                  onSelectSuggestion={selectSuggestion}
                  onDeselectSuggestion={deselectSuggestion}
                  onConfirmTasks={confirmSelectedTasks}
                />
              )}

              {/* Today's Agenda */}
              <TodaysAgenda events={events} />

              {/* Priority Tasks */}
              <PriorityTasks tasks={tasks} onTaskClick={handleTaskClick} />
            </div>

            {/* 사이드바 (1열) */}
            <div className="space-y-4">
              {/* 타임라인 */}
              <WorkTimelineCompact events={events} />

              {/* 이메일 신호 */}
              <EmailSignals />

              {/* 회의 음성 → 회의록 (하단 배치) */}
              <VoiceUploadCard
                onMinutesGenerated={(minutes) => {
                  setMeetingMinutes(minutes);
                  postAction.onMeetingMinutesGenerated();
                }}
              />

              {meetingMinutes && (
                <MeetingMinutesCard
                  minutes={meetingMinutes}
                  onClose={() => setMeetingMinutes(null)}
                />
              )}
            </div>
          </div>
        )}

        {/* 프로젝트 뷰 */}
        {viewMode === 'project' && (
          <div className="space-y-4">
            {projects.map((project) => {
              const projectTasks = getTasksByProjects()[project.id] || [];
              return (
                <ProjectTaskGroup
                  key={project.id}
                  project={project}
                  tasks={projectTasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTask}
                  onProjectEdit={handleProjectEdit}
                />
              );
            })}
          </div>
        )}

        {/* 리스트 뷰 */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
            <div className="space-y-2">
              {tasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    task.status === 'done'
                      ? 'bg-green-500 border-green-500'
                      : task.priority === 'high'
                      ? 'border-red-400'
                      : 'border-neutral-300'
                  }`}>
                    {task.status === 'done' && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.status === 'done' ? 'text-neutral-400 line-through' : 'text-text-primary'}`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-neutral-400">
                        마감: {new Date(task.dueDate).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </div>
                  {task.priority === 'high' && (
                    <AlertCircle size={14} className="text-red-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 태스크 모달 */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
          setDefaultProjectId('');
        }}
        onSave={handleSaveTask}
        task={editingTask}
        defaultProjectId={defaultProjectId}
      />
    </div>
  );
}
