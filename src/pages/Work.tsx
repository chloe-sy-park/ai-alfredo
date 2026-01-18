import { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import {
  WorkBriefing,
  WorkTimeline,
  IncomingSignals,
  ProjectTaskGroup,
  FocusTimer,
  TaskModal,
  VoiceUploadCard,
  MeetingMinutesCard,
  MeetingMinutes
} from '../components/work';
import { getTasksByCategory, Task } from '../services/tasks';
import { usePostAction } from '../stores/postActionStore';
import { getTodayEvents, CalendarEvent } from '../services/calendar';
import { getActiveProjects, Project, updateProjectTaskCounts } from '../services/projects';
import { Briefcase, Plus, LayoutGrid, List } from 'lucide-react';
import TodayTop3 from '../components/home/TodayTop3';
import ProjectPulse from '../components/home/ProjectPulse';
import ActionCard from '../components/home/ActionCard';

export default function Work() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'project' | 'list'>('project');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultProjectId, setDefaultProjectId] = useState<string>('');
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinutes | null>(null);
  const postAction = usePostAction();

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // 태스크 로드
    const workTasks = getTasksByCategory('work');
    setTasks(workTasks);

    // 프로젝트 로드
    const activeProjects = getActiveProjects();
    setProjects(activeProjects);

    // 프로젝트별 태스크 수 업데이트
    const taskCounts: Record<string, number> = {};
    workTasks.forEach((task) => {
      const projectId = task.projectId || 'project_default';
      taskCounts[projectId] = (taskCounts[projectId] || 0) + 1;
    });
    updateProjectTaskCounts(taskCounts);

    // 포커스 태스크 선택 (우선순위 높은 미완료 태스크)
    const pendingTasks = workTasks.filter((t) => t.status !== 'done');
    const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'high');
    const nextTask = highPriorityTasks[0] || pendingTasks[0] || null;
    setFocusTask(nextTask);

    // 캘린더 이벤트
    getTodayEvents().then(setEvents).catch(() => {});
  };

  // 프로젝트별 태스크 그룹핑
  const getTasksByProjects = (): Record<string, Task[]> => {
    const grouped: Record<string, Task[]> = {};

    // 모든 프로젝트에 빈 배열 초기화
    projects.forEach((project) => {
      grouped[project.id] = [];
    });

    // 태스크 분배
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

  const handleSaveTask = (task: Task) => {
    loadData(); // 데이터 새로고침
    setFocusTask(task); // 새로 추가/수정한 태스크를 포커스로
  };

  const handleProjectEdit = (project: Project) => {
    // 프로젝트 편집 모달 (나중에 구현)
    console.log('Edit project:', project);
  };

  // PRD: ProjectPulse용 데이터 변환
  const getProjectPulseData = () => {
    return projects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      const pendingCount = projectTasks.filter((t) => t.status !== 'done').length;
      const highPriorityPending = projectTasks.filter(
        (t) => t.status !== 'done' && t.priority === 'high'
      ).length;

      // 신호등 결정: 긴급 미완료 있으면 red, 미완료 많으면 yellow, 아니면 green
      let signal: 'green' | 'yellow' | 'red' = 'green';
      if (highPriorityPending > 0) {
        signal = 'red';
      } else if (pendingCount > 3) {
        signal = 'yellow';
      }

      return {
        id: project.id,
        name: project.name,
        signal: signal
      };
    });
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <PageHeader />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
        {/* 페이지 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <Briefcase size={24} className="text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">Work</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 보기 모드 전환 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 flex" role="group" aria-label="보기 모드 선택">
              <button
                onClick={() => setViewMode('project')}
                aria-pressed={viewMode === 'project'}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded flex items-center justify-center touch-target ${
                  viewMode === 'project'
                    ? 'bg-primary text-white'
                    : 'text-text-secondary dark:text-gray-400 hover:bg-background dark:hover:bg-gray-700'
                }`}
              >
                <LayoutGrid size={18} aria-hidden="true" />
                <span className="sr-only">프로젝트 뷰</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded flex items-center justify-center touch-target ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-text-secondary dark:text-gray-400 hover:bg-background dark:hover:bg-gray-700'
                }`}
              >
                <List size={18} aria-hidden="true" />
                <span className="sr-only">리스트 뷰</span>
              </button>
            </div>

            {/* 태스크 추가 버튼 */}
            <button
              onClick={() => handleAddTask()}
              className="px-4 py-2.5 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2 min-h-[44px]"
            >
              <Plus size={18} />
              <span className="text-sm sm:text-base">태스크 추가</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* 메인 컨텐츠 (2열) */}
          <div className="lg:col-span-2 space-y-4">
            {/* 상황 브리핑 */}
            <WorkBriefing tasks={tasks} events={events} />

            {/* PRD R5: 오늘의 우선순위 (순서로 표시) */}
            <TodayTop3 mode="work" />

            {/* PRD: ActionCards - 대응이 필요한 항목 */}
            {events.length > 0 && (
              <section className="space-y-2" aria-labelledby="action-needed-heading">
                <h3 id="action-needed-heading" className="text-sm font-semibold text-text-primary dark:text-white px-1">대응 필요</h3>
                {events.slice(0, 2).map((event) => (
                  <ActionCard
                    key={event.id}
                    variant="meeting"
                    title={event.title}
                    summary={event.location || '장소 미정'}
                    meta={new Date(event.start).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    recommendedAction="회의 준비 자료를 확인하세요"
                  />
                ))}
              </section>
            )}

            {/* 프로젝트별 태스크 그룹 */}
            {viewMode === 'project' ? (
              <div className="space-y-4">
                {projects.map((project) => {
                  const projectTasks = getTasksByProjects()[project.id] || [];
                  return (
                    <div key={project.id} id={`project-${project.id}`}>
                      <ProjectTaskGroup
                        project={project}
                        tasks={projectTasks}
                        onTaskClick={handleTaskClick}
                        onAddTask={handleAddTask}
                        onProjectEdit={handleProjectEdit}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              // 리스트 뷰 (나중에 구현)
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card">
                <p className="text-text-muted dark:text-gray-400">리스트 뷰는 준비중입니다</p>
              </div>
            )}
          </div>
          
          {/* 사이드바 (1열) */}
          <div className="space-y-4">
            {/* 집중 타이머 */}
            <FocusTimer currentTask={focusTask} />

            {/* PRD: 회의 음성 → 회의록 */}
            <VoiceUploadCard
              onMinutesGenerated={(minutes) => {
                setMeetingMinutes(minutes);
                postAction.onMeetingMinutesGenerated();
              }}
            />

            {/* 생성된 회의록 표시 */}
            {meetingMinutes && (
              <MeetingMinutesCard
                minutes={meetingMinutes}
                onClose={() => setMeetingMinutes(null)}
              />
            )}

            {/* 타임라인 & 시그널 */}
            <WorkTimeline />
            <IncomingSignals />

            {/* PRD: ProjectPulse - 프로젝트 상태 신호등 */}
            {projects.length > 0 && (
              <ProjectPulse
                projects={getProjectPulseData()}
                onOpen={(id) => {
                  // 해당 프로젝트로 스크롤
                  const element = document.getElementById(`project-${id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              />
            )}
          </div>
        </div>
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
