import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../services/tasks';
import { setFocusFromTop3 } from '../../services/focusNow';
import { Play, Clock, Calendar } from 'lucide-react';
import { formatMinutes, getDDayLabel } from '../../services/tasks';

interface FocusTaskProps {
  task: Task | null;
  onLater?: () => void;
}

export default function FocusTask({ task, onLater }: FocusTaskProps) {
  var navigate = useNavigate();
  var [isStarting, setIsStarting] = useState(false);

  if (!task) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
        <p className="text-[#999999]">지금 집중할 작업이 없어요</p>
        <p className="text-sm text-[#666666] mt-2">업무 목록에서 작업을 선택해주세요</p>
      </div>
    );
  }

  function handleStart() {
    if (!task) return;
    setIsStarting(true);
    setFocusFromTop3(task.id, task.title);
    setTimeout(function() {
      navigate('/');
    }, 300);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-[#A996FF]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#A996FF] font-medium">지금 집중</span>
        <span className="px-2 py-0.5 bg-[#FEF2F2] text-[#EF4444] text-xs rounded-full">
          {task.priority === 'high' ? '긴급' : task.priority === 'medium' ? '보통' : '낮음'}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">{task.title}</h3>
      
      <div className="flex items-center gap-4 text-sm text-[#666666] mb-4">
        {task.estimatedMinutes && (
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{formatMinutes(task.estimatedMinutes)}</span>
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{getDDayLabel(task.dueDate)}</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleStart}
          disabled={isStarting}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1A1A1A] text-white rounded-xl hover:bg-[#333333] transition-colors"
        >
          <Play size={16} />
          <span>시작하기</span>
        </button>
        <button
          onClick={onLater}
          className="px-4 py-3 text-[#666666] hover:text-[#1A1A1A] transition-colors"
        >
          나중에
        </button>
      </div>
    </div>
  );
}