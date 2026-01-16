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
import PriorityStack from '../components/home/PriorityStack';
import ProjectPulse from '../components/home/ProjectPulse';
import ActionCard from '../components/home/ActionCard';

export default function Work() {
  var [tasks, setTasks] = useState<Task[]>([]);
  var [projects, setProjects] = useState<Project[]>([]);
  var [events, setEvents] = useState<CalendarEvent[]>([]);
  var [focusTask, setFocusTask] = useState<Task | null>(null);
  var [viewMode, setViewMode] = useState<'project' | 'list'>('project');
  var [showTaskModal, setShowTaskModal] = useState(false);
  var [editingTask, setEditingTask] = useState<Task | null>(null);
  var [defaultProjectId, setDefaultProjectId] = useState<string>('');
  var [meetingMinutes, setMeetingMinutes] = useState<MeetingMinutes | null>(null);
  var postAction = usePostAction();

  // 데이터 로드
  useEffect(function() {
    loadData();
  }, []);

  function loadData() {
    // 태스크 로드
    var workTasks = getTasksByCategory('work');
    setTasks(workTasks);
    
    // 프로젝트 로드
    var activeProjects = getActiveProjects();
    setProjects(activeProjects);
    
    // 프로젝트별 태스크 수 업데이트
    var taskCounts: Record<string, number> = {};
    workTasks.forEach(function(task) {
      var projectId = task.projectId || 'project_default';
      taskCounts[projectId] = (taskCounts[projectId] || 0) + 1;
    });
    updateProjectTaskCounts(taskCounts);
    
    // 포커스 태스크 선택 (우선순위 높은 미완료 태스크)
    var pendingTasks = workTasks.filter(function(t) { return t.status !== 'done'; });
    var highPriorityTasks = pendingTasks.filter(function(t) { return t.priority === 'high'; });
    var nextTask = highPriorityTasks[0] || pendingTasks[0] || null;
    setFocusTask(nextTask);
    
    // 캘린더 이벤트
    getTodayEvents().then(setEvents).catch(() => {});
  }

  // 프로젝트별 태스크 그룹핑
  function getTasksByProjects(): Record<string, Task[]> {
    var grouped: Record<string, Task[]> = {};
    
    // 모든 프로젝트에 빈 배열 초기화
    projects.forEach(function(project) {
      grouped[project.id] = [];
    });
    
    // 태스크 분배
    tasks.forEach(function(task) {
      var projectId = task.projectId || 'project_default';
      if (!grouped[projectId]) {
        grouped[projectId] = [];
      }
      grouped[projectId].push(task);
    });
    
    return grouped;
  }

  function handleTaskClick(task: Task) {
    setEditingTask(task);
    setShowTaskModal(true);
  }

  function handleAddTask(projectId?: string) {
    setDefaultProjectId(projectId || 'project_default');
    setEditingTask(null);
    setShowTaskModal(true);
  }

  function handleSaveTask(task: Task) {
    loadData(); // 데이터 새로고침
    setFocusTask(task); // 새로 추가/수정한 태스크를 포커스로
  }

  function handleProjectEdit(project: Project) {
    // 프로젝트 편집 모달 (나중에 구현)
    console.log('Edit project:', project);
  }

  // PRD: ProjectPulse용 데이터 변환
  function getProjectPulseData() {
    return projects.map(function(project) {
      var projectTasks = tasks.filter(function(t) {
        return t.projectId === project.id;
      });
      var pendingCount = projectTasks.filter(function(t) {
        return t.status !== 'done';
      }).length;
      var highPriorityPending = projectTasks.filter(function(t) {
        return t.status !== 'done' && t.priority === 'high';
      }).length;

      // 신호등 결정: 긴급 미완료 있으면 red, 미완료 많으면 yellow, 아니면 green
      var signal: 'green' | 'yellow' | 'red' = 'green';
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
  }

  // PRD R5: 우선순위는 순서다 - 업무 태스크를 우선순위로 변환
  function getWorkPriorityItems() {
    // 미완료 태스크만, 우선순위 높은 것 먼저
    var pendingTasks = tasks.filter(function(t) { return t.status !== 'done'; });

    // 우선순위 정렬: high > medium > low
    var priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    pendingTasks.sort(function(a, b) {
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });

    // Top 3만 반환
    return pendingTasks.slice(0, 3).map(function(task) {
      return {
        id: task.id,
        title: task.title,
        sourceTag: 'WORK' as const,
        meta: task.priority === 'high' ? '긴급' : task.dueDate ? '마감' : undefined,
        status: task.status === 'in_progress' ? 'in-progress' as const : 'pending' as const
      };
    });
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PageHeader />
      
      <div className="max-w-[1200px] mx-auto px-4 py-4">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase size={24} className="text-[#A996FF]" />
            <h1 className="text-xl font-bold text-[#1A1A1A]">Work</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 보기 모드 전환 */}
            <div className="bg-white rounded-lg p-1 flex">
              <button
                onClick={function() { setViewMode('project'); }}
                className={`p-2 rounded ${
                  viewMode === 'project' 
                    ? 'bg-[#A996FF] text-white' 
                    : 'text-[#666666] hover:bg-[#F5F5F5]'
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={function() { setViewMode('list'); }}
                className={`p-2 rounded ${
                  viewMode === 'list' 
                    ? 'bg-[#A996FF] text-white' 
                    : 'text-[#666666] hover:bg-[#F5F5F5]'
                }`}
              >
                <List size={18} />
              </button>
            </div>
            
            {/* 태스크 추가 버튼 */}
            <button
              onClick={function() { handleAddTask(); }}
              className="px-4 py-2 bg-[#A996FF] text-white rounded-lg hover:bg-[#8B7BE8] flex items-center gap-2"
            >
              <Plus size={18} />
              <span>태스크 추가</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 컨텐츠 (2열) */}
          <div className="lg:col-span-2 space-y-4">
            {/* 상황 브리핑 */}
            <WorkBriefing tasks={tasks} events={events} />

            {/* PRD R5: 오늘의 우선순위 (순서로 표시) */}
            {getWorkPriorityItems().length > 0 && (
              <PriorityStack
                items={getWorkPriorityItems()}
                count={3}
              />
            )}

            {/* PRD: ActionCards - 대응이 필요한 항목 */}
            {events.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#1A1A1A] px-1">대응 필요</h3>
                {events.slice(0, 2).map(function(event) {
                  return (
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
                  );
                })}
              </div>
            )}

            {/* 프로젝트별 태스크 그룹 */}
            {viewMode === 'project' ? (
              <div className="space-y-4">
                {projects.map(function(project) {
                  var projectTasks = getTasksByProjects()[project.id] || [];
                  return (
                    <div key={project.id} id={'project-' + project.id}>
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
              <div className="bg-white rounded-xl p-4 shadow-card">
                <p className="text-[#999999]">리스트 뷰는 준비중입니다</p>
              </div>
            )}
          </div>
          
          {/* 사이드바 (1열) */}
          <div className="space-y-4">
            {/* 집중 타이머 */}
            <FocusTimer currentTask={focusTask} />

            {/* PRD: 회의 음성 → 회의록 */}
            <VoiceUploadCard
              onMinutesGenerated={function(minutes) {
                setMeetingMinutes(minutes);
                postAction.onMeetingMinutesGenerated();
              }}
            />

            {/* 생성된 회의록 표시 */}
            {meetingMinutes && (
              <MeetingMinutesCard
                minutes={meetingMinutes}
                onClose={function() { setMeetingMinutes(null); }}
              />
            )}

            {/* 타임라인 & 시그널 */}
            <WorkTimeline />
            <IncomingSignals />

            {/* PRD: ProjectPulse - 프로젝트 상태 신호등 */}
            {projects.length > 0 && (
              <ProjectPulse
                projects={getProjectPulseData()}
                onOpen={function(id) {
                  // 해당 프로젝트로 스크롤
                  var element = document.getElementById('project-' + id);
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
        onClose={function() { 
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
