import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, Clock, CheckCircle2, Circle, Zap, Target, Calendar,
  TrendingUp, TrendingDown, Sparkles, Mail, ChevronRight, ChevronDown,
  MessageCircle, MoreHorizontal, Trash2, Play, X, ChevronUp
} from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

// Data
import { mockProjects } from '../../data/mockData';

// Common Components
import { AlfredoAvatar, DomainBadge, Card, SectionHeader } from '../common';

// Work 폴더 내 다른 컴포넌트들
import { Sparkline, PriorityIndicator } from './TaskWidgets';
import SwipeableTaskItem from './SwipeableTaskItem';

// Modals
import TaskModal from '../modals/TaskModal';
import AddTaskModal from '../modals/AddTaskModal';
import EventModal from '../modals/EventModal';

const WorkPage = ({ tasks, onToggleTask, onStartFocus, onReflect, inbox, onConvertToTask, onUpdateTask, onDeleteTask, onAddTask, onOpenChat, darkMode = false, events = [], onAddEvent, onUpdateEvent, onDeleteEvent }) => {
  // Google Calendar 훅
  const googleCalendar = useGoogleCalendar();
  
  // localStorage 로드 함수
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };
  
  const [activeTab, setActiveTab] = useState('tasks'); // tasks, history, inbox
  const [filter, setFilter] = useState('all'); // all, todo, done
  const [groupBy, setGroupBy] = useState('none'); // none, project
  const [selectedTask, setSelectedTask] = useState(null);
  const [showReflectModal, setShowReflectModal] = useState(false);
  const [reflectChanges, setReflectChanges] = useState([]);
  const [expandedInboxId, setExpandedInboxId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null); // 프로젝트 필터
  const [projects, setProjects] = useState(() => loadFromStorage('lifebutler_projects', mockProjects));
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // 일정 모달 state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // 새 태스크 추가 모달
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  
  // 드래그앤드롭 state
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [customBig3Order, setCustomBig3Order] = useState(null); // 수동 정렬 시 사용
  
  // 🐧 알프레도 플로팅 메시지
  const [showAlfredo, setShowAlfredo] = useState(true);
  
  // projects localStorage 저장
  useEffect(() => {
    try { localStorage.setItem('lifebutler_projects', JSON.stringify(projects)); } catch (e) {}
  }, [projects]);
  
  // 다크모드 스타일
  const bgGradient = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-100';
  
  const getAlfredoMessage = () => {
    const todoTasks = tasks.filter(t => t.status !== 'done');
    const doneTasks = tasks.filter(t => t.status === 'done');
    const highPriorityTasks = todoTasks.filter(t => t.importance === 'high');
    const overdueCount = todoTasks.filter(t => t.deadline?.includes('D-0') || t.deadline?.includes('오늘')).length;
    const stuckTasks = todoTasks.filter(t => t.priorityChange === 'down');
    
    // 마감 임박
    if (overdueCount > 0) {
      return {
        message: `오늘 마감인 게 ${overdueCount}개 있어요! 🔥`,
        subMessage: '집중 모드로 빠르게 처리해볼까요?',
        quickReplies: [
          { label: '집중 모드 시작', key: 'start_focus' },
          { label: '나중에 할게', key: 'later' }
        ]
      };
    }
    
    // 높은 우선순위 많음
    if (highPriorityTasks.length >= 3) {
      return {
        message: `중요한 일이 ${highPriorityTasks.length}개나 쌓였네요.`,
        subMessage: '하나씩 처리하면 돼요. 어떤 것부터 할까요?',
        quickReplies: [
          { label: '추천해줘', key: 'recommend' },
          { label: '내가 고를게', key: 'choose' }
        ]
      };
    }
    
    // 오래 방치된 태스크
    if (stuckTasks.length > 0) {
      return {
        message: `${stuckTasks[0].title}이 오래 밀리고 있어요.`,
        subMessage: '정말 해야 하는 건가요? 삭제해도 괜찮아요.',
        quickReplies: [
          { label: '지금 할게', key: 'do_now' },
          { label: '삭제할게', key: 'delete' },
          { label: '나중에 할게', key: 'later' }
        ]
      };
    }
    
    // 전부 완료
    if (todoTasks.length === 0 && doneTasks.length > 0) {
      return {
        message: '업무 태스크 다 끝났어요! 🎉',
        subMessage: '새로운 일 추가하거나 쉬어가세요.',
        quickReplies: [
          { label: '새 태스크 추가', key: 'add_task' },
          { label: '오늘은 여기까지!', key: 'done' }
        ]
      };
    }
    
    // 진행 중
    if (todoTasks.length > 0) {
      const completionRate = Math.round((doneTasks.length / tasks.length) * 100);
      return {
        message: `${todoTasks.length}개 남았어요. ${completionRate}% 완료!`,
        subMessage: '이 페이스면 오늘 안에 끝낼 수 있어요 💪',
        quickReplies: [
          { label: '다음 뭐 할까?', key: 'recommend' },
          { label: '집중 모드 시작', key: 'start_focus' }
        ]
      };
    }
    
    return {
      message: '새로운 태스크를 추가해볼까요?',
      subMessage: '할 일을 정리하면 마음이 편해져요.',
      quickReplies: [
        { label: '태스크 추가', key: 'add_task' }
      ]
    };
  };
  
  const alfredoMsg = getAlfredoMessage();
  
  // 드래그 핸들러
  const handleDragStart = (e, task, index) => {
    setDraggedTask({ task, index });
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };
  
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverIndex(null);
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };
  
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.index === targetIndex) return;
    
    // Big3 순서 재정렬
    const big3Tasks = tasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
      .slice(0, 3);
    
    const newOrder = [...big3Tasks];
    const [removed] = newOrder.splice(draggedTask.index, 1);
    newOrder.splice(targetIndex, 0, removed);
    
    setCustomBig3Order(newOrder.map(t => t.id));
    setDraggedTask(null);
    setDragOverIndex(null);
  };
  
  // Big3 태스크 가져오기 (수동 정렬 적용)
  const getBig3Tasks = () => {
    const todoTasks = tasks.filter(t => t.status !== 'done');
    
    if (customBig3Order) {
      // 수동 정렬된 순서 적용
      const orderedTasks = customBig3Order
        .map(id => todoTasks.find(t => t.id === id))
        .filter(Boolean);
      
      // 새로운 태스크가 추가됐을 수 있으니 나머지도 추가
      const remainingTasks = todoTasks
        .filter(t => !customBig3Order.includes(t.id))
        .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
      
      return [...orderedTasks, ...remainingTasks].slice(0, 3);
    }
    
    return todoTasks
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
      .slice(0, 3);
  };
  
  const big3Tasks = getBig3Tasks();
  
  // 프로젝트 저장
  const handleSaveProject = (project) => {
    if (editingProject) {
      setProjects(projects.map(p => p.id === project.id ? project : p));
    } else {
      setProjects([...projects, project]);
    }
    setEditingProject(null);
  };
  
  // Phase 10: 프로젝트 추가
  const handleAddProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: `p-${Date.now()}`,
      totalTasks: 0,
      completedTasks: 0,
      status: 'active',
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    saveToStorage('lifebutler_projects', updated);
    showToast(`📁 "${newProject.name}" 프로젝트가 생성되었어요!`);
  };
  
  // Phase 10: 프로젝트 수정
  const handleEditProject = (projectData) => {
    const updated = projects.map(p => 
      p.id === projectData.id ? { ...p, ...projectData } : p
    );
    setProjects(updated);
    saveToStorage('lifebutler_projects', updated);
    showToast(`📁 "${projectData.name}" 프로젝트가 수정되었어요!`);
  };
  
  // 프로젝트 삭제
  const handleDeleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (selectedProject === projects.find(p => p.id === projectId)?.name) {
      setSelectedProject(null);
    }
  };
  
  // 이벤트 저장 (추가/수정) - Google Calendar 연동
  const handleSaveEvent = async (event) => {
    try {
      let googleEventId = event.googleEventId;
      
      // Google Calendar 동기화
      if (event.syncToGoogle && googleCalendar.isSignedIn) {
        const googleEvent = {
          title: event.title,
          date: event.date,
          start: event.start,
          end: event.end,
          location: event.location,
        };
        
        if (editingEvent && googleEventId) {
          // 기존 Google 이벤트 수정
          const result = await googleCalendar.updateEvent(googleEventId, googleEvent);
          googleEventId = result.event?.id || googleEventId;
        } else if (editingEvent && !googleEventId) {
          // 로컬에만 있던 이벤트를 Google에 새로 추가
          const result = await googleCalendar.addEvent(googleEvent);
          googleEventId = result.event?.id;
        } else {
          // 새 이벤트 추가
          const result = await googleCalendar.addEvent(googleEvent);
          googleEventId = result.event?.id;
        }
      } else if (!event.syncToGoogle && editingEvent?.googleEventId) {
        // Google 동기화 해제 시 Google에서 삭제
        try {
          await googleCalendar.deleteEvent(editingEvent.googleEventId);
        } catch (err) {
          console.log('Google event delete skipped:', err);
        }
        googleEventId = null;
      }
      
      const eventWithGoogle = { ...event, googleEventId };
      
      if (editingEvent) {
        onUpdateEvent && onUpdateEvent(editingEvent.id, eventWithGoogle);
      } else {
        onAddEvent && onAddEvent(eventWithGoogle);
      }
    } catch (err) {
      console.error('Google Calendar sync error:', err);
      // 에러가 나도 로컬에는 저장
      if (editingEvent) {
        onUpdateEvent && onUpdateEvent(editingEvent.id, event);
      } else {
        onAddEvent && onAddEvent(event);
      }
    }
    
    setEditingEvent(null);
    setShowEventModal(false);
  };
  
  // 이벤트 삭제 - Google Calendar 연동
  const handleDeleteEventLocal = async (eventId, googleEventId) => {
    try {
      // Google Calendar에서도 삭제
      if (googleEventId && googleCalendar.isSignedIn) {
        await googleCalendar.deleteEvent(googleEventId);
      }
    } catch (err) {
      console.error('Google Calendar delete error:', err);
    }
    
    onDeleteEvent && onDeleteEvent(eventId);
    setShowEventModal(false);
    setEditingEvent(null);
  };
  
  const filteredTasks = tasks.filter(t => {
    // 프로젝트 필터
    if (selectedProject && t.project !== selectedProject) return false;
    // 상태 필터
    if (filter === 'todo') return t.status !== 'done';
    if (filter === 'done') return t.status === 'done';
    return true;
  });
  
  const todoCount = tasks.filter(t => t.status !== 'done').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const completedToday = mockCompletedHistory.today.length;
  const totalFocusTime = mockCompletedHistory.stats.totalFocusTime;
  
  // Reflect 로직 - 우선순위 재계산 시뮬레이션
  const handleReflect = () => {
    const changes = [];
    
    // 고우선순위 과부하 체크
    const highPriorityCount = tasks.filter(t => t.importance === 'high' && t.status !== 'done').length;
    if (highPriorityCount > 2) {
      changes.push("'주간 리포트 작성' 우선순위를 낮췄습니다. (과부하 방지)");
    }
    
    // 새로운 태스크 체크
    const newTasks = tasks.filter(t => t.priorityChange === 'new');
    if (newTasks.length > 0) {
      changes.push(`새로운 업무 ${newTasks.length}건을 우선순위에 반영했습니다.`);
    }
    
    // 마감 임박 체크
    const urgentDeadline = tasks.filter(t => 
      t.status !== 'done' && t.deadline && 
      (t.deadline.includes('오늘') || t.deadline.includes('전'))
    );
    if (urgentDeadline.length > 0) {
      changes.push(`마감 임박 업무 ${urgentDeadline.length}건의 우선순위를 올렸습니다.`);
    }
    
    // 기본 메시지
    if (changes.length === 0) {
      changes.push("오전 집중 시간을 30분 더 확보했습니다.");
    }
    
    setReflectChanges(changes);
    setShowReflectModal(true);
    
    // 부모에게 알림 (실제로는 여기서 우선순위 재계산)
    if (onReflect) onReflect();
  };
  
  // 업무 브리핑 생성
  const hour = new Date().getHours();
  const highPriorityTasks = tasks.filter(t => t.importance === 'high' && t.status !== 'done');
  const urgentDeadlines = tasks.filter(t => t.status !== 'done' && t.deadline && (t.deadline.includes('오늘') || t.deadline.includes('전')));
  const oldInbox = inbox?.filter(i => i.time?.includes('일 전') || i.time?.includes('어제')) || [];
  const todayMeetings = events.filter(e => e.title.includes('미팅') || e.title.includes('회의'));
  
  const generateWorkBriefing = () => {
    const lines = [];
    
    // 1. 시간대별 인사 + 오늘 요약
    if (hour < 12) {
      lines.push(`오늘 할 일 **${todoCount}개**, 미팅 **${todayMeetings.length}개** 있어요.`);
      
      // 제일 급한 거 추천
      if (urgentDeadlines.length > 0) {
        const mostUrgent = urgentDeadlines[0];
        lines.push(`\n🎯 **${mostUrgent.title}** 먼저 하는 게 좋겠어요. ${mostUrgent.deadline}까지예요.`);
      } else if (highPriorityTasks.length > 0) {
        const top = highPriorityTasks[0];
        lines.push(`\n🎯 **${top.title}** 먼저 시작해보는 건 어때요?`);
      }
    } else if (hour < 17) {
      // 오후
      const remaining = tasks.filter(t => t.status !== 'done').length;
      const done = tasks.filter(t => t.status === 'done').length;
      
      if (done > 0) {
        lines.push(`오늘 벌써 **${done}개** 완료! 남은 건 **${remaining}개**예요.`);
      } else {
        lines.push(`아직 시작 전이네요. 가벼운 것부터 하나 해볼까요?`);
      }
      
      // 다음 미팅 체크
      const nextMeeting = events.find(e => {
        const eventHour = parseInt(e.start.split(':')[0]);
        return eventHour > hour;
      });
      if (nextMeeting) {
        const timeDiff = parseInt(nextMeeting.start.split(':')[0]) - hour;
        if (timeDiff <= 1) {
          lines.push(`\n⏰ **${nextMeeting.title}** ${nextMeeting.start}이에요. 준비되셨어요?`);
        }
      }
    } else {
      // 저녁
      const remaining = tasks.filter(t => t.status !== 'done').length;
      if (remaining > 3) {
        lines.push(`오늘 남은 일이 ${remaining}개예요. 급한 것만 하고 내일 하는 것도 괜찮아요.`);
      } else if (remaining > 0) {
        lines.push(`거의 다 했어요! **${remaining}개**만 남았네요. 마무리 화이팅!`);
      } else {
        lines.push(`오늘 할 일 다 끝냈어요! 수고했어요, Boss! 🎉`);
      }
    }
    
    // 2. 과부하 경고
    if (highPriorityTasks.length >= 4) {
      lines.push(`\n⚠️ 고우선순위가 **${highPriorityTasks.length}개**나 돼요. 좀 많은데, 조정할까요?`);
    }
    
    // 3. 답장 안 한 메일
    if (oldInbox.length > 0) {
      lines.push(`\n📧 **${oldInbox.length}개** 메일이 답장 기다리고 있어요.`);
    }
    
    // 4. 에너지 기반 추천 (LIFE와 연동 가정)
    if (hour >= 10 && hour <= 12) {
      lines.push(`\n✨ 지금이 집중하기 좋은 시간이에요!`);
    }
    
    return lines.join('');
  };
  
  // 프로젝트별 그룹핑
  const groupedTasks = groupBy === 'project' 
    ? filteredTasks.reduce((acc, task) => {
        const project = task.project || '기타';
        if (!acc[project]) acc[project] = [];
        acc[project].push(task);
        return acc;
      }, {})
    : { '전체': filteredTasks };
  
  // Inbox 관련
  const urgentInboxCount = inbox?.filter(i => i.urgent).length || 0;
  
  const getSourceIcon = (source) => {
    const icons = { gmail: '📧', slack: '💬', drive: '📁', notion: '📝' };
    return icons[source] || '📨';
  };
  
  const getSourceColor = (source) => {
    const colors = {
      gmail: 'bg-red-50 text-red-500',
      slack: 'bg-[#F5F3FF] text-[#F5F3FF]0',
      drive: 'bg-gray-100 text-gray-600',
      notion: 'bg-gray-100 text-gray-600',
    };
    return colors[source] || 'bg-gray-50 text-gray-500';
  };
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgGradient} transition-colors duration-300`}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${textPrimary}`}>업무 💼</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAddTaskModal(true)}
              className="w-10 h-10 rounded-full bg-[#A996FF] flex items-center justify-center text-white shadow-lg shadow-[#A996FF]/30 active:scale-90 transition-all hover:bg-[#8B7BE8]"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={handleReflect}
              className={`w-10 h-10 rounded-full ${cardBg} flex items-center justify-center text-[#A996FF] shadow-md active:scale-90 transition-all border border-[#A996FF]/20 hover:bg-[#F5F3FF]`}
            >
              <RefreshCw size={18} />
            </button>
            <span className="text-[11px] font-bold text-[#A996FF] bg-[#A996FF]/10 px-2.5 py-1 rounded-full ring-1 ring-[#A996FF]/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#A996FF] rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
        
        {/* Tab: 할 일 | 히스토리 | 인박스 */}
        <div className={`flex ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-1 rounded-xl mt-4`}>
          <button 
            onClick={() => setActiveTab('tasks')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'tasks' ? `${cardBg} shadow-sm ${textPrimary}` : textSecondary}`}
          >
            할 일 ({todoCount})
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'history' ? `${cardBg} shadow-sm ${textPrimary}` : textSecondary}`}
          >
            히스토리 ✓
          </button>
          <button 
            onClick={() => setActiveTab('inbox')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'inbox' ? `${cardBg} shadow-sm ${textPrimary}` : textSecondary}`}
          >
            인박스 
            {urgentInboxCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] px-1.5 py-0.5 rounded-full">{urgentInboxCount}</span>
            )}
          </button>
        </div>
      </div>
      
      {/* 알프레도 업무 브리핑 */}
      <div className="px-4 mb-4">
        <div className={`${cardBg}/90 backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-full flex items-center justify-center text-lg shrink-0">
              🐧
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-bold ${textPrimary} text-sm`}>알프레도</span>
                <span className="text-[11px] px-1.5 py-0.5 bg-[#A996FF]/10 text-[#A996FF] rounded-full">업무</span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                {generateWorkBriefing().split('**').map((part, i) => 
                  i % 2 === 1 ? <strong key={i} className="text-[#A996FF] font-semibold">{part}</strong> : part
                )}
              </p>
            </div>
          </div>
          
          {/* 빠른 액션 버튼 */}
          {urgentDeadlines.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button 
                onClick={() => setSelectedTask(urgentDeadlines[0])}
                className="w-full py-2.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                {urgentDeadlines[0].title} 시작하기
              </button>
            </div>
          )}
          
          {/* LIFE → WORK: 오늘 개인 일정 알림 */}
          {(() => {
            const todayPersonal = mockPersonalSchedule.filter(s => !s.daysFromNow);
            if (todayPersonal.length === 0 || hour >= 18) return null;
            
            const event = todayPersonal[0];
            const [h, m] = event.time.split(':').map(Number);
            const prepTime = event.prepTime || 30;
            const endHour = h - Math.floor(prepTime / 60);
            const endMin = m - (prepTime % 60);
            
            return (
              <div className={`mt-3 pt-3 border-t ${borderColor}`}>
                <div className={`flex items-center gap-2 p-2 ${darkMode ? 'bg-gray-900/30' : 'bg-gray-50'} rounded-lg`}>
                  <span className="text-lg">{event.icon}</span>
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      오늘 {event.time} {event.title}
                    </p>
                    <p className={`text-[11px] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {endHour}:{endMin < 10 ? '0' + endMin : endMin}까지 업무 마무리 추천
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      
      {/* === Tasks Tab === */}
      {activeTab === 'tasks' && (
        <div className="px-4 pb-32 space-y-4">
          
          {/* 🎯 오늘의 Big 3 */}
          <div className={`${cardBg}/90 backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                <span className="text-lg">🎯</span> 오늘의 Big 3
              </h3>
              <div className="flex items-center gap-2">
                {customBig3Order && (
                  <button 
                    onClick={() => setCustomBig3Order(null)}
                    className="text-[11px] text-[#A996FF] font-medium hover:underline"
                  >
                    AI 추천으로 복원
                  </button>
                )}
                <span className={`text-xs ${textSecondary}`}>{highPriorityTasks.length > 3 ? '3' : highPriorityTasks.length}/{todoCount}</span>
              </div>
            </div>
            
            {/* 드래그 안내 */}
            {!customBig3Order && (
              <p className={`text-[11px] ${textSecondary} mb-2 flex items-center gap-1`}>
                <span>↕️</span> 드래그해서 순서를 바꿀 수 있어요
              </p>
            )}
            
            <div className="space-y-2">
              {big3Tasks.map((task, idx) => (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onClick={() => setSelectedTask(task)}
                    className={`flex items-center gap-3 p-3 ${cardBg} rounded-xl border cursor-grab active:cursor-grabbing transition-all active:scale-[0.98] ${
                      dragOverIndex === idx && draggedTask?.index !== idx
                        ? 'border-[#A996FF] border-2 bg-[#F5F3FF]' 
                        : `${borderColor} hover:shadow-md`
                    }`}
                  >
                    {/* 드래그 핸들 */}
                    <div className={`${textSecondary} cursor-grab active:cursor-grabbing`}>
                      <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
                        <circle cx="3" cy="4" r="1.5"/>
                        <circle cx="9" cy="4" r="1.5"/>
                        <circle cx="3" cy="10" r="1.5"/>
                        <circle cx="9" cy="10" r="1.5"/>
                        <circle cx="3" cy="16" r="1.5"/>
                        <circle cx="9" cy="16" r="1.5"/>
                      </svg>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                      className="text-[#A996FF]"
                    >
                      <Circle size={22} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${textPrimary} truncate`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] px-1.5 py-0.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'} rounded`}>
                          {task.project}
                        </span>
                        {task.deadline && (
                          <span className={`text-[11px] ${textSecondary} flex items-center gap-0.5`}>
                            <Clock size={10} />{task.deadline}
                          </span>
                        )}
                        {task.repeat && (
                          <span className={`text-[11px] px-1.5 py-0.5 ${darkMode ? 'bg-[#5B21B6]/50 text-[#C4B5FD]' : 'bg-[#F5F3FF] text-[#F5F3FF]0'} rounded flex items-center gap-0.5`}>
                            <RefreshCw size={8} />{task.repeatLabel}
                          </span>
                        )}
                        {customBig3Order && idx === 0 && (
                          <span className={`text-[11px] px-1.5 py-0.5 ${darkMode ? 'bg-[#A996FF]/30 text-[#C4B5FD]' : 'bg-[#F5F3FF] text-[#8B7CF7]'} rounded`}>
                            수동 1순위
                          </span>
                        )}
                      </div>
                    </div>
                    {task.sparkline && (
                      <Sparkline 
                        data={task.sparkline} 
                        color={task.priorityChange === 'down' ? '#F472B6' : '#A996FF'}
                        width={40}
                        height={16}
                      />
                    )}
                    {task.priorityChange && (
                      <PriorityIndicator change={task.priorityChange} score={task.priorityScore} />
                    )}
                  </div>
                ))}
            </div>
            
            {/* 더보기 버튼 */}
            {todoCount > 3 && (
              <button 
                onClick={() => setActiveTab('all')}
                className="w-full mt-3 py-2 text-sm text-[#A996FF] font-medium hover:bg-[#F5F3FF] rounded-lg transition-all"
              >
                전체 {todoCount}개 보기 →
              </button>
            )}
          </div>
          
          {/* 📅 오늘 일정 */}
          <div className={`${cardBg}/90 backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                <span className="text-lg">📅</span> 오늘 일정
              </h3>
              <button 
                onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
                className="text-xs text-[#A996FF] font-medium flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> 추가
              </button>
            </div>
            
            <div className="space-y-2">
              {events.length === 0 ? (
                <div className={`text-center py-6 ${textSecondary}`}>
                  <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">오늘 일정이 없어요</p>
                  <button 
                    onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
                    className="mt-2 text-xs text-[#A996FF] font-medium hover:underline"
                  >
                    + 일정 추가하기
                  </button>
                </div>
              ) : (
                events.map(event => {
                  const eventHour = parseInt(event.start.split(':')[0]);
                  const isPast = eventHour < hour;
                  const isNow = eventHour === hour;
                  const isSoon = eventHour === hour + 1;
                  
                  return (
                    <div 
                      key={event.id}
                      onClick={() => { setEditingEvent(event); setShowEventModal(true); }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer hover:shadow-md ${
                        isPast 
                          ? darkMode ? 'bg-gray-700/50 opacity-60' : 'bg-gray-50 opacity-60'
                          : isNow 
                            ? 'bg-[#A996FF]/10 ring-2 ring-[#A996FF]/30' 
                            : isSoon 
                              ? darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]'
                              : darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-100'
                      }`}
                    >
                      <div className={`w-1 h-10 rounded-full ${event.color}`}></div>
                      <div className="flex-1">
                        <p className={`font-medium ${isPast ? 'line-through' : ''} ${darkMode ? (isPast ? 'text-gray-500' : 'text-gray-100') : (isPast ? 'text-gray-400' : 'text-gray-800')}`}>
                          {event.title}
                        </p>
                        <div className={`flex items-center gap-2 text-xs ${textSecondary}`}>
                          <span>{event.start} - {event.end}</span>
                          {event.location && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin size={10} />{event.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {isNow && <span className="text-xs px-2 py-1 bg-[#A996FF] text-white rounded-full font-medium">지금</span>}
                      {isSoon && <span className="text-xs px-2 py-1 bg-[#EDE9FE] text-[#7C6CD6] rounded-full font-medium">곧</span>}
                      {isPast && <span className="text-xs text-gray-300">✓</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* ⚠️ 잊지 마세요 */}
          <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-lg">⚠️</span> 잊지 마세요
              {mockWorkReminders.filter(r => r.urgent).length > 0 && (
                <span className="text-[11px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                  {mockWorkReminders.filter(r => r.urgent).length}
                </span>
              )}
            </h3>
            
            <div className="space-y-2">
              {mockWorkReminders.map(item => (
                <div 
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer hover:shadow-sm ${
                    item.urgent ? 'bg-red-50 border border-red-100' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${item.urgent ? 'text-red-700' : 'text-gray-700'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400">{item.detail}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                    item.urgent ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {item.daysAgo}일
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 📊 프로젝트 현황 */}
          <div className={`${cardBg}/90 backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                <span className="text-lg">📊</span> 프로젝트
              </h3>
              <button 
                onClick={() => { setEditingProject(null); setShowProjectModal(true); }}
                className="text-xs text-[#A996FF] font-medium flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> 추가
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {projects.slice(0, 4).map(project => {
                const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
                
                return (
                  <button
                    key={project.id}
                    onClick={() => { setSelectedProject(project.name); setActiveTab('all'); }}
                    onContextMenu={(e) => { e.preventDefault(); setEditingProject(project); setShowProjectModal(true); }}
                    className={`p-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl text-left transition-all group relative`}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingProject(project); setShowProjectModal(true); }}
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-white'} shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <Settings size={12} className={textSecondary} />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{project.icon}</span>
                      <span className={`text-sm font-medium ${textPrimary} truncate`}>{project.name}</span>
                    </div>
                    <div className={`flex items-center justify-between text-xs ${textSecondary}`}>
                      <span>{project.completedTasks}/{project.totalTasks}</span>
                      <span className="font-semibold text-[#A996FF]">{progress}%</span>
                    </div>
                    <div className={`h-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full mt-1.5`}>
                      <div 
                        className="h-full bg-[#A996FF] rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
            
            {projects.length > 4 && (
              <button className="w-full mt-2 py-2 text-xs text-[#A996FF] font-medium hover:underline">
                모든 프로젝트 보기 ({projects.length}개)
              </button>
            )}
          </div>
          
        </div>
      )}
      
      {/* === All Tasks Tab (전체 보기) === */}
      {activeTab === 'all' && (
        <>
          {/* 헤더 */}
          <div className="px-4 mb-4">
            <button 
              onClick={() => { setActiveTab('tasks'); setSelectedProject(null); }}
              className="flex items-center gap-1 text-sm text-[#A996FF] font-medium mb-3"
            >
              <ArrowLeft size={16} /> 돌아가기
            </button>
            
            {/* 프로젝트 필터 */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedProject(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedProject === null ? 'bg-[#A996FF] text-white' : 'bg-white text-gray-600'
                }`}
              >
                전체
              </button>
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.name)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                    selectedProject === project.name ? 'bg-[#A996FF] text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  <span>{project.icon}</span>
                  {project.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* 필터 */}
          <div className="px-4 mb-4">
            <div className="flex gap-2">
              {[
                { key: 'all', label: '전체' },
                { key: 'todo', label: `할 일 (${todoCount})` },
                { key: 'done', label: `완료 (${doneCount})` },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filter === f.key ? 'bg-[#A996FF] text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 태스크 리스트 */}
          <div className="px-4 pb-32 space-y-2">
            {filteredTasks.map(task => (
              <div 
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`p-4 rounded-xl transition-all cursor-pointer active:scale-[0.98] ${
                  task.status === 'done' 
                    ? 'bg-gray-50 border border-gray-100' 
                    : 'bg-white shadow-sm border border-white/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                    className={`transition-colors ${task.status === 'done' ? 'text-emerald-500' : 'text-[#A996FF]'}`}
                  >
                    {task.status === 'done' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[15px] truncate ${
                      task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        {task.project}
                      </span>
                      {task.deadline && (
                        <span className="text-[11px] flex items-center gap-1 text-gray-400">
                          <Clock size={10} />{task.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {task.status !== 'done' && task.sparkline && (
                    <Sparkline 
                      data={task.sparkline} 
                      color={task.priorityChange === 'down' ? '#F472B6' : '#A996FF'}
                      width={40}
                      height={16}
                    />
                  )}
                </div>
              </div>
            ))}
            
            {filteredTasks.length === 0 && (
              <div className="text-center py-12 px-6">
                <div className="w-20 h-20 bg-[#F5F3FF] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">{filter === 'todo' ? '🎉' : '📋'}</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">
                  {filter === 'todo' ? '오늘 할 일 완료!' : filter === 'done' ? '아직 완료한 항목이 없어요' : '태스크가 없어요'}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {filter === 'todo' 
                    ? '멋져요! 이제 쉬거나 새 태스크를 추가해보세요.' 
                    : filter === 'done' 
                      ? '첫 번째 태스크를 완료해보세요!'
                      : '+ 버튼을 눌러 새 태스크를 추가해보세요.'}
                </p>
                {filter !== 'done' && (
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="px-5 py-2.5 bg-[#A996FF] text-white rounded-xl font-semibold hover:bg-[#8B7BE8] transition-all inline-flex items-center gap-2"
                  >
                    <Plus size={18} /> 새 태스크 추가
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* === History Tab === */}
      {activeTab === 'history' && (
        <div className="px-4 pb-32">
          {/* 통계 카드 */}
          <div className="bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl p-5 mb-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={20} />
              <span className="font-bold">이번 주 성과</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{mockCompletedHistory.stats.totalCompleted}</p>
                <p className="text-xs text-white/70">완료</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.floor(mockCompletedHistory.stats.totalFocusTime / 60)}h</p>
                <p className="text-xs text-white/70">집중 시간</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">🔥{mockCompletedHistory.stats.streak}</p>
                <p className="text-xs text-white/70">연속</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
              <span className="text-white/70">가장 생산적인 시간</span>
              <span className="font-semibold">{mockCompletedHistory.stats.mostProductiveTime}</span>
            </div>
          </div>
          
          {/* 🐧 알프레도의 주간 인사이트 */}
          <div className={`${cardBg} rounded-xl p-4 mb-4 shadow-sm border ${borderColor}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-sm">
                🐧
              </div>
              <h3 className={`font-bold ${textPrimary}`}>알프레도의 주간 인사이트</h3>
            </div>
            
            <div className="space-y-3">
              {/* 생산성 패턴 */}
              <div className={`${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'} rounded-xl p-3`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm">📈</span>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>생산성 패턴</p>
                    <p className={`text-xs ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} mt-0.5`}>
                      Boss는 <b>오전 10-12시</b>에 가장 집중이 잘 돼요.
                      이 시간에 어려운 업무를 배치하면 좋아요!
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 요일별 패턴 */}
              <div className={`${darkMode ? 'bg-gray-700/30' : 'bg-gray-100'} rounded-xl p-3`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm">📅</span>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>요일별 패턴</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-0.5`}>
                      <b>수요일</b>에 가장 많이 완료하고 (평균 4개),
                      <b>월요일</b>은 시작이 느린 편이에요.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 프로젝트 진행률 */}
              <div className={`${darkMode ? 'bg-[#5B21B6]/30' : 'bg-[#F5F3FF]'} rounded-xl p-3`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm">🎯</span>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-[#C4B5FD]' : 'text-[#6D28D9]'}`}>프로젝트 현황</p>
                    <p className={`text-xs ${darkMode ? 'text-[#A996FF]' : 'text-[#8B7CF7]'} mt-0.5`}>
                      "투자 유치" 프로젝트 <b>80% 완료!</b>
                      이번 주에 마무리할 수 있을 것 같아요.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 다음 주 제안 */}
              <div className={`${darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]'} rounded-xl p-3`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm">💡</span>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-[#C4B5FD]' : 'text-gray-700'}`}>다음 주 제안</p>
                    <p className={`text-xs ${darkMode ? 'text-[#A996FF]' : 'text-[#8B7CF7]'} mt-0.5`}>
                      • 월요일 오전에 어려운 업무 배치<br/>
                      • 금요일은 리뷰/정리 위주로<br/>
                      • 25분 집중 + 5분 휴식 루틴 추천
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 오늘 완료 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎯</span>
              <h3 className={`font-bold ${textPrimary}`}>오늘 완료</h3>
              <span className={`text-xs px-2 py-0.5 ${darkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-600'} rounded-full font-medium`}>
                {mockCompletedHistory.today.length}개
              </span>
            </div>
            {mockCompletedHistory.today.length > 0 ? (
              <div className="space-y-2">
                {mockCompletedHistory.today.map(item => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 ${cardBg} rounded-xl border ${borderColor}`}>
                    <div className={`w-8 h-8 ${darkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'} rounded-full flex items-center justify-center`}>
                      <CheckCircle2 size={16} className={`${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${textPrimary} truncate`}>{item.title}</p>
                      <p className={`text-xs ${textSecondary}`}>{item.project} · {item.duration}분</p>
                    </div>
                    <span className={`text-xs ${textSecondary}`}>{item.completedAt}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-6 text-center`}>
                <p className={textSecondary}>아직 오늘 완료한 게 없어요</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-300'} mt-1`}>첫 번째 완료를 기다리고 있어요! 💪</p>
              </div>
            )}
          </div>
          
          {/* 어제 완료 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📅</span>
              <h3 className={`font-bold ${textPrimary}`}>어제</h3>
              <span className={`text-xs ${textSecondary}`}>{mockCompletedHistory.yesterday.length}개 완료</span>
            </div>
            <div className="space-y-2">
              {mockCompletedHistory.yesterday.map(item => (
                <div key={item.id} className={`flex items-center gap-3 p-3 ${cardBg}/70 rounded-xl border ${borderColor}`}>
                  <div className={`w-8 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                    <CheckCircle2 size={16} className={textSecondary} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} truncate`}>{item.title}</p>
                    <p className={`text-xs ${textSecondary}`}>{item.project} · {item.duration}분</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 이번 주 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📊</span>
              <h3 className={`font-bold ${textPrimary}`}>이번 주</h3>
              <span className={`text-xs ${textSecondary}`}>{mockCompletedHistory.thisWeek.length}개 완료</span>
            </div>
            <div className="space-y-2">
              {mockCompletedHistory.thisWeek.map(item => (
                <div key={item.id} className={`flex items-center gap-3 p-2.5 ${cardBg}/50 rounded-xl border ${borderColor}`}>
                  <div className={`w-6 h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                    <CheckCircle2 size={12} className={darkMode ? 'text-gray-500' : 'text-gray-300'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${textSecondary} truncate`}>{item.title}</p>
                  </div>
                  <span className={`text-[11px] ${textSecondary}`}>{item.completedAt}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 알프레도 격려 */}
          <div className={`mt-6 ${darkMode ? 'bg-[#A996FF]/20' : 'bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE]'} rounded-xl p-4 flex items-start gap-3`}>
            <div className={`w-10 h-10 ${darkMode ? 'bg-[#A996FF]/30' : 'bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE]'} rounded-full flex items-center justify-center text-lg shrink-0`}>
              🐧
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-[#C4B5FD]' : 'text-gray-700'} font-medium`}>잘하고 계세요, Boss!</p>
              <p className={`text-xs ${darkMode ? 'text-[#A996FF]' : 'text-[#8B7CF7]'} mt-1`}>
                이번 주 평균보다 2개 더 완료하셨어요. {mockCompletedHistory.stats.topProject}에서 특히 성과가 좋네요! ✨
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* === Inbox Tab === */}
      {activeTab === 'inbox' && (
        <div className="px-4 pb-32 space-y-3">
          {inbox && inbox.length > 0 ? inbox.map(item => (
            <div key={item.id}>
              <div 
                onClick={() => setExpandedInboxId(expandedInboxId === item.id ? null : item.id)}
                className={`p-4 rounded-xl transition-all cursor-pointer relative overflow-hidden ${
                  expandedInboxId === item.id 
                    ? `${cardBg} ring-2 ring-[#A996FF]/20 shadow-md` 
                    : `${cardBg}/70 border ${borderColor} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white'}`
                }`}
              >
                {/* 긴급 표시 바 */}
                {item.urgent && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
                )}
                
                <div className="flex items-start gap-3 pl-2">
                  {/* 아바타/아이콘 */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                    item.type === 'file' 
                      ? (darkMode ? 'bg-gray-700/30' : 'bg-gray-100') 
                      : (darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]')
                  }`}>
                    {item.type === 'file' 
                      ? (item.fileType === 'audio' ? '🎙️' : item.fileType === 'pdf' ? '📄' : '📁')
                      : item.from[0]
                    }
                  </div>
                  
                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${textPrimary} text-sm`}>{item.from}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded ${getSourceColor(item.source)}`}>
                        {getSourceIcon(item.source)} {item.source}
                      </span>
                    </div>
                    <h4 className={`font-medium ${textPrimary} text-sm mb-1 truncate`}>{item.subject}</h4>
                    <p className={`text-xs ${textSecondary} line-clamp-1`}>{item.preview}</p>
                  </div>
                  
                  {/* 시간 & 상태 */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[11px] ${textSecondary}`}>{item.time}</span>
                    {item.needReplyToday && (
                      <span className="flex items-center gap-0.5 text-[11px] text-red-500 font-medium">
                        <AlertCircle size={10} /> 오늘 회신
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 확장 영역 - Task로 전환 */}
                {expandedInboxId === item.id && (
                  <div className={`mt-4 pt-3 border-t ${borderColor} flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200`}>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onConvertToTask(item);
                        setExpandedInboxId(null);
                      }}
                      className="flex-1 py-2.5 bg-[#A996FF] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#A996FF]/20 active:scale-95 transition-transform"
                    >
                      <CheckCircle2 size={16} /> Task로 전환
                    </button>
                    <button className={`px-5 py-2.5 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} rounded-xl text-sm font-bold`}>
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <span className="text-4xl">📭</span>
              <p className={textSecondary + " mt-2"}>인박스가 비어있어요</p>
            </div>
          )}
        </div>
      )}
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          onToggle={onToggleTask}
          onStartFocus={onStartFocus}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}
      
      {/* Reflect Modal */}
      <ReflectModal 
        isOpen={showReflectModal}
        onClose={() => setShowReflectModal(false)}
        changes={reflectChanges}
      />
      
      {/* Project Modal */}
      <ProjectModal 
        isOpen={showProjectModal}
        onClose={() => { setShowProjectModal(false); setEditingProject(null); }}
        project={editingProject}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
      />
      
      {/* Event Modal (추가/수정) */}
      <EventModal 
        isOpen={showEventModal}
        onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
        event={editingEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEventLocal}
        googleCalendar={googleCalendar}
      />
      
      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onAdd={onAddTask}
        projects={projects}
      />
      
      {/* 🐧 알프레도 플로팅 */}
      <AlfredoFloatingBubble
        message={alfredoMsg.message}
        subMessage={alfredoMsg.subMessage}
        isVisible={showAlfredo}
        onOpenChat={onOpenChat}
        darkMode={false}
        quickReplies={alfredoMsg.quickReplies}
      />
    </div>
  );
};

// === Alfredo Chat ===

export default WorkPage;
