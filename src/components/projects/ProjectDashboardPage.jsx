import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, ChevronRight, Clock, Target, Calendar, 
  CheckCircle2, TrendingUp, MoreHorizontal, HardDrive, Settings
} from 'lucide-react';

// Other Components
import ProjectEditModal from '../modals/ProjectEditModal';
import { ProjectTimeline, ProjectTimeWidget } from './ProjectWidgets';

const ProjectDashboardPage = ({ 
  onBack, 
  projects = [], 
  allTasks = [],
  onOpenProject,
  onAddProject,
  onEditProject,
  onDeleteProject,
  darkMode = false 
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'timeline'
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 프로젝트별 태스크 통계 계산
  const getProjectStats = (project) => {
    const projectTasks = allTasks.filter(t => t.project === project.name);
    const completed = projectTasks.filter(t => t.status === 'done').length;
    const total = projectTasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // 마감까지 남은 일수
    let daysLeft = null;
    if (project.deadline) {
      const deadlineDate = new Date(project.deadline);
      const today = new Date();
      daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    }
    
    // 우선순위 태스크
    const highPriority = projectTasks.filter(t => t.importance === 'high' && t.status !== 'done').length;
    
    return { completed, total, progress, daysLeft, highPriority, tasks: projectTasks };
  };
  
  // 전체 통계
  const totalStats = {
    projects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter(t => t.status === 'done').length,
  };
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgColor}`}>
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">프로젝트 관리</h1>
          <button 
            onClick={() => { setSelectedProject(null); setShowProjectModal(true); }}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
        
        {/* 전체 통계 */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/20 rounded-xl p-2 text-center">
            <p className="text-xl font-bold">{totalStats.projects}</p>
            <p className="text-[10px] text-white/80">전체</p>
          </div>
          <div className="bg-white/20 rounded-xl p-2 text-center">
            <p className="text-xl font-bold">{totalStats.activeProjects}</p>
            <p className="text-[10px] text-white/80">진행중</p>
          </div>
          <div className="bg-white/20 rounded-xl p-2 text-center">
            <p className="text-xl font-bold">{totalStats.completedTasks}</p>
            <p className="text-[10px] text-white/80">완료</p>
          </div>
          <div className="bg-white/20 rounded-xl p-2 text-center">
            <p className="text-xl font-bold">{totalStats.totalTasks - totalStats.completedTasks}</p>
            <p className="text-[10px] text-white/80">남음</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4 pb-32">
        {/* 뷰 모드 토글 */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-[#A996FF]'
                : textSecondary
            }`}
          >
            <HardDrive size={16} /> 카드뷰
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              viewMode === 'timeline'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-[#A996FF]'
                : textSecondary
            }`}
          >
            <Calendar size={16} /> 타임라인
          </button>
        </div>
        
        {/* 카드뷰 */}
        {viewMode === 'grid' && (
          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl">📁</span>
                <p className={`mt-4 font-medium ${textPrimary}`}>아직 프로젝트가 없어요</p>
                <p className={`text-sm ${textSecondary} mb-4`}>새 프로젝트를 만들어보세요!</p>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="px-6 py-3 bg-[#A996FF] text-white rounded-xl font-medium"
                >
                  + 새 프로젝트
                </button>
              </div>
            ) : (
              projects.map(project => {
                const stats = getProjectStats(project);
                const isOverdue = stats.daysLeft !== null && stats.daysLeft < 0;
                const isUrgent = stats.daysLeft !== null && stats.daysLeft <= 3 && stats.daysLeft >= 0;
                
                return (
                  <div 
                    key={project.id}
                    className={`${cardBg} rounded-xl p-4 shadow-sm ${isOverdue ? 'ring-2 ring-red-400' : isUrgent ? 'ring-2 ring-orange-400' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* 아이콘 */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.color || 'from-[#A996FF] to-[#8B7CF7]'} flex items-center justify-center text-xl shadow-md`}>
                        {project.icon || '📁'}
                      </div>
                      
                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold ${textPrimary} truncate`}>{project.name}</h3>
                          {isOverdue && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded">마감초과</span>}
                          {isUrgent && !isOverdue && <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded">D-{stats.daysLeft}</span>}
                          {stats.highPriority > 0 && <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded">🔥 {stats.highPriority}</span>}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-sm ${textSecondary}`}>
                            {stats.completed}/{stats.total} 완료
                          </span>
                          {project.deadline && (
                            <span className={`text-sm ${isOverdue ? 'text-red-500' : textSecondary}`}>
                              📅 {project.deadline}
                            </span>
                          )}
                        </div>
                        
                        {/* 진행률 바 */}
                        <div className="mt-2">
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                stats.progress === 100 
                                  ? 'bg-emerald-500' 
                                  : isOverdue 
                                    ? 'bg-red-500' 
                                    : 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7]'
                              }`}
                              style={{ width: `${stats.progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className={`text-xs ${textSecondary}`}>{stats.progress}%</span>
                            {stats.progress === 100 && <span className="text-xs text-emerald-500">✓ 완료!</span>}
                          </div>
                        </div>
                      </div>
                      
                      {/* 액션 버튼 */}
                      <button
                        onClick={() => { setSelectedProject(project); setShowProjectModal(true); }}
                        className={`p-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                    
                    {/* 마일스톤 (있을 경우) */}
                    {project.milestones && project.milestones.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className={`text-xs font-medium ${textSecondary} mb-2`}>마일스톤</p>
                        <div className="flex gap-2 overflow-x-auto">
                          {project.milestones.slice(0, 3).map((ms, i) => (
                            <div 
                              key={i}
                              className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs ${
                                ms.completed 
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                  : 'bg-gray-100 dark:bg-gray-700 ' + textSecondary
                              }`}
                            >
                              {ms.completed ? '✓ ' : '○ '}{ms.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
        
        {/* 타임라인 (간트차트 스타일) */}
        {viewMode === 'timeline' && (
          <ProjectTimeline 
            projects={projects} 
            allTasks={allTasks}
            darkMode={darkMode}
          />
        )}
      </div>
      
      {/* 프로젝트 편집 모달 */}
      <ProjectEditModal
        isOpen={showProjectModal}
        onClose={() => { setShowProjectModal(false); setSelectedProject(null); }}
        project={selectedProject}
        onSave={(data) => {
          if (selectedProject) {
            onEditProject?.(data);
          } else {
            onAddProject?.(data);
          }
          setShowProjectModal(false);
          setSelectedProject(null);
        }}
        onDelete={onDeleteProject}
        darkMode={darkMode}
      />
    </div>
  );
};

// 프로젝트 타임라인 (간트차트 스타일)

export default ProjectDashboardPage;
