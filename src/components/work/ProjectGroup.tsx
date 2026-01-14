import { useState } from 'react';
import { Task } from '../../services/tasks';
import { Project } from '../../services/projects';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface ProjectGroupProps {
  project: Project;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: (projectId: string) => void;
}

export function ProjectGroup({ project, tasks, onTaskClick, onAddTask }: ProjectGroupProps) {
  var [isExpanded, setIsExpanded] = useState(true);
  
  var incompleteTasks = tasks.filter(function(t) { return t.status !== 'done'; });
  var completeTasks = tasks.filter(function(t) { return t.status === 'done'; });
  
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      {/* 프로젝트 헤더 */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#F5F5F5] transition-colors"
        onClick={function() { setIsExpanded(!isExpanded); }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: project.color }}
          >
            <span className="text-sm">{project.emoji || project.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#1A1A1A]">{project.name}</h3>
            <p className="text-xs text-[#999999]">
              {incompleteTasks.length}개 진행중
              {completeTasks.length > 0 && `, ${completeTasks.length}개 완료`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onAddTask && (
            <button
              onClick={function(e) {
                e.stopPropagation();
                onAddTask(project.id);
              }}
              className="w-6 h-6 rounded-full bg-[#F0F0FF] flex items-center justify-center hover:bg-[#E5E5FF] transition-colors"
            >
              <Plus size={14} className="text-[#A996FF]" />
            </button>
          )}
          {isExpanded ? <ChevronUp size={18} className="text-[#999999]" /> : <ChevronDown size={18} className="text-[#999999]" />}
        </div>
      </div>
      
      {/* 태스크 목록 */}
      {isExpanded && tasks.length > 0 && (
        <div className="border-t border-[#F0F0F0]">
          {/* 진행중 태스크 */}
          {incompleteTasks.map(function(task) {
            return (
              <div
                key={task.id}
                onClick={function() { onTaskClick && onTaskClick(task); }}
                className="flex items-start gap-3 p-4 border-b border-[#F5F5F5] hover:bg-[#FAFAFA] transition-colors cursor-pointer"
              >
                <button
                  onClick={function(e) {
                    e.stopPropagation();
                    // TODO: 완료 처리
                  }}
                  className="w-5 h-5 rounded border-2 border-[#E5E5E5] mt-0.5 hover:border-[#A996FF] transition-colors"
                />
                <div className="flex-1">
                  <p className="text-[#1A1A1A]">{task.title}</p>
                  {task.dueDate && (
                    <p className="text-xs text-[#999999] mt-1">
                      마감: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  task.priority === 'high' ? 'bg-red-100 text-red-600' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '중간' : '낮음'}
                </div>
              </div>
            );
          })}
          
          {/* 완료된 태스크 (접기 가능) */}
          {completeTasks.length > 0 && (
            <div className="p-4">
              <details>
                <summary className="text-sm text-[#999999] cursor-pointer hover:text-[#666666]">
                  완료됨 ({completeTasks.length}개)
                </summary>
                <div className="mt-2 space-y-2">
                  {completeTasks.map(function(task) {
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 opacity-60"
                      >
                        <div className="w-5 h-5 rounded bg-[#A996FF] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-[#999999] line-through">{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              </details>
            </div>
          )}
        </div>
      )}
      
      {/* 빈 상태 */}
      {isExpanded && tasks.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm text-[#999999]">아직 태스크가 없어요</p>
          {onAddTask && (
            <button
              onClick={function() { onAddTask(project.id); }}
              className="mt-3 text-sm text-[#A996FF] hover:text-[#8B7BE8] transition-colors"
            >
              첫 태스크 추가하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
