import { useState, useEffect } from 'react';
import { X, Calendar, Flag, Folder } from 'lucide-react';
import { Task, addTask, updateTask } from '../../services/tasks';
import { getActiveProjects, Project } from '../../services/projects';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task | null;
  defaultProjectId?: string;
}

export function TaskModal({ isOpen, onClose, onSave, task, defaultProjectId }: TaskModalProps) {
  var [title, setTitle] = useState('');
  var [description, setDescription] = useState('');
  var [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  var [dueDate, setDueDate] = useState('');
  var [projectId, setProjectId] = useState('');
  var [estimatedMinutes, setEstimatedMinutes] = useState('');
  var [projects, setProjects] = useState<Project[]>([]);
  
  useEffect(function() {
    if (isOpen) {
      // 프로젝트 목록 로드
      setProjects(getActiveProjects());
      
      if (task) {
        // 편집 모드
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setDueDate(task.dueDate || '');
        setProjectId(task.projectId || 'project_default');
        setEstimatedMinutes(task.estimatedMinutes ? String(task.estimatedMinutes) : '');
      } else {
        // 추가 모드
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
        setProjectId(defaultProjectId || 'project_default');
        setEstimatedMinutes('');
      }
    }
  }, [isOpen, task, defaultProjectId]);
  
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    var minutes = estimatedMinutes ? parseInt(estimatedMinutes) : undefined;
    
    if (task) {
      // 편집
      var updated = updateTask(task.id, {
        title: title,
        description: description || undefined,
        priority: priority,
        dueDate: dueDate || undefined,
        projectId: projectId || undefined,
        estimatedMinutes: minutes
      });
      if (updated) onSave(updated);
    } else {
      // 추가
      var newTask = addTask({
        title: title,
        description: description || undefined,
        category: 'work',
        priority: priority,
        dueDate: dueDate || undefined,
        projectId: projectId || undefined,
        estimatedMinutes: minutes
      });
      onSave(newTask);
    }
    
    onClose();
  }
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">
              {task ? '태스크 수정' : '새 태스크'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F5] rounded-lg"
            >
              <X size={20} className="text-[#666666]" />
            </button>
          </div>
          
          {/* 본문 */}
          <div className="p-6 space-y-4">
            {/* 제목 */}
            <div>
              <input
                type="text"
                value={title}
                onChange={function(e) { setTitle(e.target.value); }}
                placeholder="태스크 제목"
                className="w-full px-4 py-3 text-lg border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#A996FF]"
                autoFocus
                required
              />
            </div>
            
            {/* 설명 */}
            <div>
              <textarea
                value={description}
                onChange={function(e) { setDescription(e.target.value); }}
                placeholder="설명 (선택사항)"
                rows={3}
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#A996FF] resize-none"
              />
            </div>
            
            {/* 프로젝트 선택 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#666666] mb-2">
                <Folder size={16} />
                프로젝트
              </label>
              <select
                value={projectId}
                onChange={function(e) { setProjectId(e.target.value); }}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#A996FF]"
              >
                {projects.map(function(project) {
                  return (
                    <option key={project.id} value={project.id}>
                      {project.icon} {project.name}
                    </option>
                  );
                })}
              </select>
            </div>
            
            {/* 우선순위 & 마감일 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 우선순위 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#666666] mb-2">
                  <Flag size={16} />
                  우선순위
                </label>
                <select
                  value={priority}
                  onChange={function(e) { setPriority(e.target.value as any); }}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#A996FF]"
                >
                  <option value="high">🔴 높음</option>
                  <option value="medium">🟡 보통</option>
                  <option value="low">🔵 낮음</option>
                </select>
              </div>
              
              {/* 마감일 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#666666] mb-2">
                  <Calendar size={16} />
                  마감일
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={function(e) { setDueDate(e.target.value); }}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#A996FF]"
                />
              </div>
            </div>
            
            {/* 예상 시간 */}
            <div>
              <label className="text-sm font-medium text-[#666666] block mb-2">
                예상 시간 (분)
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={function(e) { setEstimatedMinutes(e.target.value); }}
                placeholder="예: 30"
                min="1"
                max="480"
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#A996FF]"
              />
            </div>
          </div>
          
          {/* 푸터 */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#666666] hover:bg-[#F5F5F5] rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#A996FF] text-white rounded-lg hover:bg-[#8B7BE8]"
            >
              {task ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
