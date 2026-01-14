import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, MoreVertical } from 'lucide-react';
import { Task, toggleTaskComplete, getDDayLabel } from '../../services/tasks';
import { Project } from '../../services/projects';

interface ProjectTaskGroupProps {
  project: Project;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (projectId: string) => void;
  onProjectEdit: (project: Project) => void;
}

export function ProjectTaskGroup({ 
  project, 
  tasks, 
  onTaskClick, 
  onAddTask,
  onProjectEdit 
}: ProjectTaskGroupProps) {
  var [isExpanded, setIsExpanded] = useState(true);
  var [showMenu, setShowMenu] = useState(false);
  
  // 진행중/완료 태스크 분리
  var pendingTasks = tasks.filter(function(t) { return t.status !== 'done'; });
  var completedTasks = tasks.filter(function(t) { return t.status === 'done'; });
  
  function handleToggleTask(taskId: string, e: React.MouseEvent) {
    e.stopPropagation();
    toggleTaskComplete(taskId);
  }
  
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      {/* 프로젝트 헤더 */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#F5F5F5]"
        onClick={function() { setIsExpanded(!isExpanded); }}
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{project.icon}</span>
          <div>
            <h3 className="font-semibold text-[#1A1A1A]">{project.name}</h3>
            <p className="text-sm text-[#999999]">
              {pendingTasks.length}개 진행중 • {completedTasks.length}개 완료
            </p>
          </div>
          <div 
            className="w-3 h-3 rounded-full ml-2"
            style={{ backgroundColor: project.color }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={function(e) { 
              e.stopPropagation();
              onAddTask(project.id);
            }}
            className="p-2 hover:bg-[#E5E5E5] rounded-lg"
          >
            <Plus size={18} className="text-[#666666]" />
          </button>
          
          <div className="relative">
            <button
              onClick={function(e) { 
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-[#E5E5E5] rounded-lg"
            >
              <MoreVertical size={18} className="text-[#666666]" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                <button
                  onClick={function(e) {
                    e.stopPropagation();
                    onProjectEdit(project);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-[#F5F5F5]"
                >
                  프로젝트 편집
                </button>
              </div>
            )}
          </div>
          
          {isExpanded ? (
            <ChevronUp size={20} className="text-[#999999]" />
          ) : (
            <ChevronDown size={20} className="text-[#999999]" />
          )}
        </div>
      </div>
      
      {/* 태스크 목록 */}
      {isExpanded && (
        <div className="border-t border-[#E5E5E5]">
          {pendingTasks.length === 0 && completedTasks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#999999] mb-3">아직 태스크가 없어요</p>
              <button
                onClick={function() { onAddTask(project.id); }}
                className="text-[#A996FF] hover:underline"
              >
                첫 태스크 추가하기
              </button>
            </div>
          ) : (
            <>
              {/* 진행중 태스크 */}
              {pendingTasks.map(function(task) {
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 hover:bg-[#F5F5F5] cursor-pointer"
                    onClick={function() { onTaskClick(task); }}
                  >
                    <button
                      onClick={function(e) { handleToggleTask(task.id, e); }}
                      className="w-5 h-5 rounded border-2 border-[#E5E5E5] hover:border-[#A996FF] flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-[#1A1A1A]">{task.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {task.dueDate && (
                          <span className="text-xs text-[#999999]">
                            {getDDayLabel(task.dueDate)}
                          </span>
                        )}
                        {task.priority === 'high' && (
                          <span className="text-xs text-red-500">높음</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* 완료 태스크 (있을 경우) */}
              {completedTasks.length > 0 && (
                <details className="group">
                  <summary className="px-3 py-2 text-sm text-[#999999] cursor-pointer hover:text-[#666666] select-none">
                    완료됨 ({completedTasks.length})
                  </summary>
                  <div className="border-t border-[#E5E5E5]">
                    {completedTasks.map(function(task) {
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 hover:bg-[#F5F5F5] cursor-pointer opacity-60"
                          onClick={function() { onTaskClick(task); }}
                        >
                          <button
                            onClick={function(e) { handleToggleTask(task.id, e); }}
                            className="w-5 h-5 rounded border-2 border-[#A996FF] bg-[#A996FF] flex-shrink-0 flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <p className="text-sm text-[#666666] line-through flex-1">
                            {task.title}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
