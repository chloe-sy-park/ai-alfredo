import { useEffect, useState } from 'react';
import { getTodayEvents, CalendarEvent } from '../../services/calendar';
import { getTasksByCategory, Task } from '../../services/tasks';
import { Briefcase, Calendar, Target, Clock } from 'lucide-react';

interface WorkBriefingProps {
  tasks?: Task[];
  events?: CalendarEvent[];
}

export default function WorkBriefing({ tasks: propTasks, events: propEvents }: WorkBriefingProps) {
  var [tasks, setTasks] = useState<Task[]>(propTasks || []);
  var [events, setEvents] = useState<CalendarEvent[]>(propEvents || []);

  useEffect(function() {
    if (!propTasks) {
      var workTasks = getTasksByCategory('work');
      setTasks(workTasks);
    }
    if (!propEvents) {
      getTodayEvents().then(setEvents).catch(() => {});
    }
  }, [propTasks, propEvents]);

  // 통계 계산
  var pendingTasks = tasks.filter(function(t) { return t.status !== 'done'; });
  var urgentTasks = pendingTasks.filter(function(t) { return t.priority === 'high'; });
  var todayDeadlines = pendingTasks.filter(function(t) {
    if (!t.dueDate) return false;
    var today = new Date().toDateString();
    return new Date(t.dueDate).toDateString() === today;
  });
  
  // 브리핑 메시지
  function getMessage(): string {
    if (urgentTasks.length > 0) {
      return `긴급 작업 ${urgentTasks.length}개가 기다리고 있어요`;
    }
    if (todayDeadlines.length > 0) {
      return `오늘 마감인 작업이 ${todayDeadlines.length}개 있어요`;
    }
    if (pendingTasks.length === 0) {
      return '오늘 예정된 작업이 없어요';
    }
    return `${pendingTasks.length}개의 작업이 진행 중이에요`;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Briefcase size={20} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">업무 상황</h2>
          <p className="text-sm text-[#666666]">{getMessage()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/70 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-[#F97316]" />
            <span className="text-xs text-[#999999]">전체</span>
          </div>
          <p className="text-2xl font-bold text-[#1A1A1A]">{pendingTasks.length}</p>
        </div>
        
        <div className="bg-white/70 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-[#EF4444]" />
            <span className="text-xs text-[#999999]">긴급</span>
          </div>
          <p className="text-2xl font-bold text-[#EF4444]">{urgentTasks.length}</p>
        </div>
        
        <div className="bg-white/70 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-[#A996FF]" />
            <span className="text-xs text-[#999999]">미팅</span>
          </div>
          <p className="text-2xl font-bold text-[#A996FF]">{events.length}</p>
        </div>
      </div>
    </div>
  );
}