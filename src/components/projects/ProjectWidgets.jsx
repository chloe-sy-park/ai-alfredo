import React from 'react';
import { Clock, Target, Calendar, CheckCircle2, TrendingUp, ChevronRight } from 'lucide-react';

const ProjectTimeline = ({ projects = [], allTasks = [], darkMode = false }) => {
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  
  // 날짜 범위 계산 (오늘부터 30일)
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  
  // 프로젝트별 타임라인 데이터
  const projectsWithTimeline = projects.map(project => {
    const projectTasks = allTasks.filter(t => t.project === project.name);
    const completed = projectTasks.filter(t => t.status === 'done').length;
    const total = projectTasks.length;
    
    // 마감일 계산
    let endDay = 30;
    if (project.deadline) {
      const deadline = new Date(project.deadline);
      const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      endDay = Math.min(Math.max(diffDays, 0), 30);
    }
    
    return {
      ...project,
      completed,
      total,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      endDay,
    };
  });
  
  return (
    <div className={`${cardBg} rounded-xl p-4 shadow-sm overflow-x-auto`}>
      <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
        <Calendar size={18} className="text-[#A996FF]" /> 프로젝트 타임라인
      </h3>
      
      {/* 날짜 헤더 */}
      <div className="min-w-[600px]">
        <div className="flex mb-2">
          <div className="w-32 shrink-0" />
          <div className="flex-1 flex">
            {days.filter((_, i) => i % 5 === 0).map((d, i) => (
              <div key={i} className="flex-1 text-center">
                <span className={`text-[10px] ${textSecondary}`}>
                  {d.getMonth() + 1}/{d.getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 프로젝트 바 */}
        <div className="space-y-2">
          {projectsWithTimeline.map(project => (
            <div key={project.id} className="flex items-center gap-2">
              {/* 프로젝트 이름 */}
              <div className="w-32 shrink-0 flex items-center gap-2">
                <span className="text-lg">{project.icon}</span>
                <span className={`text-sm font-medium ${textPrimary} truncate`}>{project.name}</span>
              </div>
              
              {/* 타임라인 바 */}
              <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg relative">
                {/* 진행 바 */}
                <div 
                  className={`absolute left-0 top-0 h-full rounded-lg bg-gradient-to-r ${project.color || 'from-[#A996FF] to-[#8B7CF7]'} opacity-80`}
                  style={{ width: `${(project.endDay / 30) * 100}%` }}
                >
                  {/* 완료된 부분 */}
                  <div 
                    className="h-full bg-emerald-500/50 rounded-l-lg"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                
                {/* 오늘 마커 */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500" />
                
                {/* 진행률 텍스트 */}
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-xs font-medium text-white drop-shadow">
                    {project.progress}% ({project.completed}/{project.total})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 범례 */}
        <div className={`flex gap-4 mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-sm" />
            <span className={`text-xs ${textSecondary}`}>오늘</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#A996FF] rounded-sm" />
            <span className={`text-xs ${textSecondary}`}>남은 기간</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
            <span className={`text-xs ${textSecondary}`}>완료</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 프로젝트 편집 모달 (마일스톤 포함)

const ProjectTimeWidget = ({ project, tasks = [], darkMode = false }) => {
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  
  // 프로젝트 태스크들의 시간 합계 (예시 - 실제로는 태스크에 timeSpent 필드가 있어야 함)
  const projectTasks = tasks.filter(t => t.project === project?.name);
  const totalMinutes = projectTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  const completedTasks = projectTasks.filter(t => t.status === 'done').length;
  const avgTimePerTask = completedTasks > 0 ? Math.round(totalMinutes / completedTasks) : 0;
  
  return (
    <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock size={18} className="text-[#A996FF]" />
        <h3 className={`font-semibold ${textPrimary}`}>시간 추적</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-[#F5F3FF] dark:bg-[#A996FF]/20 rounded-xl">
          <p className="text-xl font-bold text-[#A996FF]">{hours}h {mins}m</p>
          <p className={`text-xs ${textSecondary}`}>총 시간</p>
        </div>
        <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <p className={`text-xl font-bold ${textPrimary}`}>{completedTasks}</p>
          <p className={`text-xs ${textSecondary}`}>완료</p>
        </div>
        <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <p className={`text-xl font-bold ${textPrimary}`}>{avgTimePerTask}분</p>
          <p className={`text-xs ${textSecondary}`}>평균</p>
        </div>
      </div>
    </div>
  );
};

// === Phase 11: 캘린더 뷰 강화 ===

export { ProjectTimeline, ProjectTimeWidget };
