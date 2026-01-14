import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout';
import { WorkBriefing, FocusTask, WorkTimeline, IncomingSignals } from '../components/work';
import { getTasksByCategory, Task } from '../services/tasks';
import { getTodayEvents, CalendarEvent } from '../services/calendar';
import { MessageSquare, Plus } from 'lucide-react';

export default function Work() {
  var navigate = useNavigate();
  var [tasks, setTasks] = useState<Task[]>([]);
  var [events, setEvents] = useState<CalendarEvent[]>([]);
  var [focusTask, setFocusTask] = useState<Task | null>(null);
  var [showChat, setShowChat] = useState(false);

  useEffect(function() {
    // 데이터 로드
    var workTasks = getTasksByCategory('work');
    setTasks(workTasks);
    
    // 포커스 태스크 선택 (우선순위 높은 미완료 태스크)
    var pendingTasks = workTasks.filter(function(t) { return t.status !== 'done'; });
    var highPriorityTasks = pendingTasks.filter(function(t) { return t.priority === 'high'; });
    var nextTask = highPriorityTasks[0] || pendingTasks[0] || null;
    setFocusTask(nextTask);
    
    // 캘린더 이벤트
    getTodayEvents().then(setEvents).catch(() => {});
  }, []);

  function handleLater() {
    // 다음 태스크로 전환
    var pendingTasks = tasks.filter(function(t) { 
      return t.status !== 'done' && t.id !== focusTask?.id; 
    });
    setFocusTask(pendingTasks[0] || null);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PageHeader />
      
      <div className="max-w-[640px] mx-auto px-4 py-4 space-y-4">
        
        {/* 상황 브리핑 */}
        <WorkBriefing tasks={tasks} events={events} />
        
        {/* 지금 집중할 것 */}
        <FocusTask task={focusTask} onLater={handleLater} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Work Timeline */}
          <WorkTimeline />
          
          {/* Incoming Signals */}
          <IncomingSignals />
        </div>
        
        {/* 빠른 액션 */}
        <div className="flex gap-2">
          <button
            onClick={function() { navigate('/'); }}
            className="flex-1 py-3 bg-white rounded-xl text-[#666666] hover:bg-[#F5F5F5] transition-colors"
          >
            홈으로
          </button>
          <button
            className="px-6 py-3 bg-[#A996FF] text-white rounded-xl hover:bg-[#8B7BE8] transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            <span>태스크 추가</span>
          </button>
        </div>
        
        {/* 작업 맥락 챗 (간단한 버전) */}
        <div className="fixed bottom-20 right-4 z-40">
          <button
            onClick={function() { setShowChat(!showChat); }}
            className="w-14 h-14 bg-[#A996FF] text-white rounded-full shadow-lg hover:bg-[#8B7BE8] transition-colors flex items-center justify-center"
          >
            <MessageSquare size={24} />
          </button>
          
          {showChat && (
            <div className="absolute bottom-16 right-0 w-80 bg-white rounded-xl shadow-xl p-4 mb-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-[#1A1A1A]">작업 맥락</h4>
                <button
                  onClick={function() { setShowChat(false); }}
                  className="text-[#999999] hover:text-[#666666]"
                >
                  ×
                </button>
              </div>
              <div className="bg-[#F5F5F5] rounded-lg p-3 mb-3">
                <p className="text-sm text-[#666666]">
                  🐧 현재 {focusTask ? `"${focusTask.title}"` : '작업'} 중이시군요! 
                  집중 모드로 전환하면 방해받지 않고 작업할 수 있어요.
                </p>
              </div>
              <input
                type="text"
                placeholder="알프레도에게 질문하기..."
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
