import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, Clock, CheckCircle2, Circle, Zap, Target, Calendar,
  TrendingUp, TrendingDown, Sparkles, Mail, ChevronRight, ChevronDown,
  MessageCircle, MoreHorizontal, Trash2, Play, X, ChevronUp, RefreshCw, Settings, MapPin, Trophy, AlertCircle
} from 'lucide-react';

// Common Components
import { AlfredoAvatar, DomainBadge, Card, SectionHeader } from '../common';

// Data
import { mockProjects, mockCompletedHistory, mockWorkReminders, mockPersonalSchedule } from '../../data/mockData';

// Other Components
import TaskModal from '../modals/TaskModal';
import AddTaskModal from '../modals/AddTaskModal';
import EventModal from '../modals/EventModal';
import ReflectModal from '../modals/ReflectModal';
import ProjectEditModal from '../modals/ProjectEditModal';
import { Sparkline, PriorityIndicator } from './TaskWidgets';

// Hooks
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';

// Alfredo Components
import { AlfredoFloatingBubble } from '../alfredo/index.jsx';

var WorkPage = function(props) {
  var tasks = props.tasks || [];
  var onToggleTask = props.onToggleTask;
  var onStartFocus = props.onStartFocus;
  var onReflect = props.onReflect;
  var inbox = props.inbox || [];
  var onConvertToTask = props.onConvertToTask;
  var onUpdateTask = props.onUpdateTask;
  var onDeleteTask = props.onDeleteTask;
  var onAddTask = props.onAddTask;
  var onOpenChat = props.onOpenChat;
  var darkMode = props.darkMode !== undefined ? props.darkMode : false;
  var events = props.events || [];
  var onAddEvent = props.onAddEvent;
  var onUpdateEvent = props.onUpdateEvent;
  var onDeleteEvent = props.onDeleteEvent;

  // Google Calendar 훅
  var googleCalendar = useGoogleCalendar();
  
  // localStorage 로드 함수
  var loadFromStorage = function(key, defaultValue) {
    try {
      var saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };
  
  var activeTabState = useState('tasks');
  var activeTab = activeTabState[0];
  var setActiveTab = activeTabState[1];
  
  var filterState = useState('all');
  var filter = filterState[0];
  var setFilter = filterState[1];
  
  var groupByState = useState('none');
  var groupBy = groupByState[0];
  var setGroupBy = groupByState[1];
  
  var selectedTaskState = useState(null);
  var selectedTask = selectedTaskState[0];
  var setSelectedTask = selectedTaskState[1];
  
  var showReflectModalState = useState(false);
  var showReflectModal = showReflectModalState[0];
  var setShowReflectModal = showReflectModalState[1];
  
  var reflectChangesState = useState([]);
  var reflectChanges = reflectChangesState[0];
  var setReflectChanges = reflectChangesState[1];
  
  var expandedInboxIdState = useState(null);
  var expandedInboxId = expandedInboxIdState[0];
  var setExpandedInboxId = expandedInboxIdState[1];
  
  var selectedProjectState = useState(null);
  var selectedProject = selectedProjectState[0];
  var setSelectedProject = selectedProjectState[1];
  
  var projectsState = useState(function() { return loadFromStorage('lifebutler_projects', mockProjects); });
  var projects = projectsState[0];
  var setProjects = projectsState[1];
  
  var showProjectModalState = useState(false);
  var showProjectModal = showProjectModalState[0];
  var setShowProjectModal = showProjectModalState[1];
  
  var editingProjectState = useState(null);
  var editingProject = editingProjectState[0];
  var setEditingProject = editingProjectState[1];
  
  var selectedEventState = useState(null);
  var selectedEvent = selectedEventState[0];
  var setSelectedEvent = selectedEventState[1];
  
  var showEventModalState = useState(false);
  var showEventModal = showEventModalState[0];
  var setShowEventModal = showEventModalState[1];
  
  var editingEventState = useState(null);
  var editingEvent = editingEventState[0];
  var setEditingEvent = editingEventState[1];
  
  var showAddTaskModalState = useState(false);
  var showAddTaskModal = showAddTaskModalState[0];
  var setShowAddTaskModal = showAddTaskModalState[1];
  
  var draggedTaskState = useState(null);
  var draggedTask = draggedTaskState[0];
  var setDraggedTask = draggedTaskState[1];
  
  var dragOverIndexState = useState(null);
  var dragOverIndex = dragOverIndexState[0];
  var setDragOverIndex = dragOverIndexState[1];
  
  var customBig3OrderState = useState(null);
  var customBig3Order = customBig3OrderState[0];
  var setCustomBig3Order = customBig3OrderState[1];
  
  var showAlfredoState = useState(true);
  var showAlfredo = showAlfredoState[0];
  var setShowAlfredo = showAlfredoState[1];

  // 다크모드 스타일
  var bgGradient = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-100';

  var todoCount = tasks.filter(function(t) { return t.status !== 'done'; }).length;
  var doneCount = tasks.filter(function(t) { return t.status === 'done'; }).length;
  var highPriorityTasks = tasks.filter(function(t) { return t.importance === 'high' && t.status !== 'done'; });
  var urgentDeadlines = tasks.filter(function(t) { return t.status !== 'done' && t.deadline && (t.deadline.includes('오늘') || t.deadline.includes('전')); });
  var hour = new Date().getHours();

  var getAlfredoMessage = function() {
    var todoTasks = tasks.filter(function(t) { return t.status !== 'done'; });
    var doneTasks = tasks.filter(function(t) { return t.status === 'done'; });
    
    if (todoTasks.length === 0 && doneTasks.length > 0) {
      return { message: '업무 태스크 다 끝났어요! 🎉', subMessage: '새로운 일 추가하거나 쉬어가세요.', quickReplies: [] };
    }
    if (urgentDeadlines.length > 0) {
      return { message: '오늘 마감인 게 ' + urgentDeadlines.length + '개 있어요! 🔥', subMessage: '집중 모드로 빠르게 처리해볼까요?', quickReplies: [] };
    }
    if (todoTasks.length > 0) {
      var completionRate = Math.round((doneTasks.length / tasks.length) * 100);
      return { message: todoTasks.length + '개 남았어요. ' + completionRate + '% 완료!', subMessage: '이 페이스면 오늘 안에 끝낼 수 있어요 💪', quickReplies: [] };
    }
    return { message: '새로운 태스크를 추가해볼까요?', subMessage: '할 일을 정리하면 마음이 편해져요.', quickReplies: [] };
  };

  var alfredoMsg = getAlfredoMessage();

  var getBig3Tasks = function() {
    var todoTasks = tasks.filter(function(t) { return t.status !== 'done'; });
    return todoTasks.sort(function(a, b) { return (b.priorityScore || 0) - (a.priorityScore || 0); }).slice(0, 3);
  };

  var big3Tasks = getBig3Tasks();

  var handleReflect = function() {
    var changes = [];
    if (highPriorityTasks.length > 2) {
      changes.push("고우선순위 과부하 - 우선순위를 조정했습니다.");
    }
    if (urgentDeadlines.length > 0) {
      changes.push("마감 임박 업무 " + urgentDeadlines.length + "건의 우선순위를 올렸습니다.");
    }
    if (changes.length === 0) {
      changes.push("오전 집중 시간을 30분 더 확보했습니다.");
    }
    setReflectChanges(changes);
    setShowReflectModal(true);
    if (onReflect) onReflect();
  };

  var handleSaveEvent = function(event) {
    if (editingEvent) {
      onUpdateEvent && onUpdateEvent(editingEvent.id, event);
    } else {
      onAddEvent && onAddEvent(event);
    }
    setEditingEvent(null);
    setShowEventModal(false);
  };

  var handleDeleteEventLocal = function(eventId) {
    onDeleteEvent && onDeleteEvent(eventId);
    setShowEventModal(false);
    setEditingEvent(null);
  };

  var filteredTasks = tasks.filter(function(t) {
    if (selectedProject && t.project !== selectedProject) return false;
    if (filter === 'todo') return t.status !== 'done';
    if (filter === 'done') return t.status === 'done';
    return true;
  });

  var urgentInboxCount = inbox.filter(function(i) { return i.urgent; }).length;

  var getSourceIcon = function(source) {
    var icons = { gmail: '📧', slack: '💬', drive: '📁', notion: '📝' };
    return icons[source] || '📨';
  };

  var getSourceColor = function(source) {
    var colors = {
      gmail: 'bg-red-50 text-red-500',
      slack: 'bg-purple-50 text-purple-500',
      drive: 'bg-gray-100 text-gray-600',
      notion: 'bg-gray-100 text-gray-600',
    };
    return colors[source] || 'bg-gray-50 text-gray-500';
  };

  return (
    <div className={"flex-1 overflow-y-auto " + bgGradient + " transition-colors duration-300"}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className={"text-2xl font-bold " + textPrimary}>업무 💼</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={function() { setShowAddTaskModal(true); }}
              className="w-10 h-10 rounded-full bg-[#A996FF] flex items-center justify-center text-white shadow-lg shadow-[#A996FF]/30 active:scale-90 transition-all hover:bg-[#8B7BE8]"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={handleReflect}
              className={"w-10 h-10 rounded-full " + cardBg + " flex items-center justify-center text-[#A996FF] shadow-md active:scale-90 transition-all border border-[#A996FF]/20 hover:bg-[#F5F3FF]"}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
        
        {/* Tab */}
        <div className={"flex " + (darkMode ? "bg-gray-800" : "bg-gray-100") + " p-1 rounded-xl mt-4"}>
          <button 
            onClick={function() { setActiveTab('tasks'); }} 
            className={"flex-1 py-2 text-sm font-semibold rounded-lg transition-all " + (activeTab === 'tasks' ? cardBg + " shadow-sm " + textPrimary : textSecondary)}
          >
            할 일 ({todoCount})
          </button>
          <button 
            onClick={function() { setActiveTab('history'); }} 
            className={"flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 " + (activeTab === 'history' ? cardBg + " shadow-sm " + textPrimary : textSecondary)}
          >
            히스토리 ✓
          </button>
          <button 
            onClick={function() { setActiveTab('inbox'); }} 
            className={"flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 " + (activeTab === 'inbox' ? cardBg + " shadow-sm " + textPrimary : textSecondary)}
          >
            인박스 
            {urgentInboxCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] px-1.5 py-0.5 rounded-full">{urgentInboxCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="px-4 pb-32 space-y-4">
          {/* Big 3 */}
          <div className={cardBg + "/90 backdrop-blur-xl rounded-xl shadow-sm p-4 border " + borderColor}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={"font-bold " + textPrimary + " flex items-center gap-2"}>
                <span className="text-lg">🎯</span> 오늘의 Big 3
              </h3>
              <span className={"text-xs " + textSecondary}>{big3Tasks.length}/{todoCount}</span>
            </div>
            
            <div className="space-y-2">
              {big3Tasks.map(function(task, idx) {
                return (
                  <div 
                    key={task.id}
                    onClick={function() { setSelectedTask(task); }}
                    className={"flex items-center gap-3 p-3 " + cardBg + " rounded-xl border " + borderColor + " cursor-pointer hover:shadow-md transition-all"}
                  >
                    <button 
                      onClick={function(e) { e.stopPropagation(); onToggleTask(task.id); }}
                      className="text-[#A996FF]"
                    >
                      <Circle size={22} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={"font-semibold " + textPrimary + " truncate"}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={"text-[11px] px-1.5 py-0.5 " + (darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500") + " rounded"}>
                          {task.project}
                        </span>
                        {task.deadline && (
                          <span className={"text-[11px] " + textSecondary + " flex items-center gap-0.5"}>
                            <Clock size={10} />{task.deadline}
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
                );
              })}
            </div>

            {todoCount > 3 && (
              <button 
                onClick={function() { setActiveTab('all'); }}
                className="w-full mt-3 py-2 text-sm text-[#A996FF] font-medium hover:bg-[#F5F3FF] rounded-lg transition-all"
              >
                전체 {todoCount}개 보기 →
              </button>
            )}
          </div>

          {/* 오늘 일정 */}
          <div className={cardBg + "/90 backdrop-blur-xl rounded-xl shadow-sm p-4 border " + borderColor}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={"font-bold " + textPrimary + " flex items-center gap-2"}>
                <span className="text-lg">📅</span> 오늘 일정
              </h3>
              <button 
                onClick={function() { setEditingEvent(null); setShowEventModal(true); }}
                className="text-xs text-[#A996FF] font-medium flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> 추가
              </button>
            </div>
            
            <div className="space-y-2">
              {events.length === 0 ? (
                <div className={"text-center py-6 " + textSecondary}>
                  <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">오늘 일정이 없어요</p>
                </div>
              ) : (
                events.map(function(event) {
                  var eventHour = parseInt(event.start.split(':')[0]);
                  var isPast = eventHour < hour;
                  var isNow = eventHour === hour;
                  
                  return (
                    <div 
                      key={event.id}
                      onClick={function() { setEditingEvent(event); setShowEventModal(true); }}
                      className={"flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer hover:shadow-md " + 
                        (isPast ? (darkMode ? "bg-gray-700/50 opacity-60" : "bg-gray-50 opacity-60") : 
                         isNow ? "bg-[#A996FF]/10 ring-2 ring-[#A996FF]/30" : 
                         (darkMode ? "bg-gray-700 border border-gray-600" : "bg-white border border-gray-100"))}
                    >
                      <div className={"w-1 h-10 rounded-full " + event.color}></div>
                      <div className="flex-1">
                        <p className={"font-medium " + (isPast ? "line-through" : "") + " " + (darkMode ? (isPast ? "text-gray-500" : "text-gray-100") : (isPast ? "text-gray-400" : "text-gray-800"))}>
                          {event.title}
                        </p>
                        <div className={"flex items-center gap-2 text-xs " + textSecondary}>
                          <span>{event.start} - {event.end}</span>
                          {event.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPin size={10} />{event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      {isNow && <span className="text-xs px-2 py-1 bg-[#A996FF] text-white rounded-full font-medium">지금</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 프로젝트 현황 */}
          <div className={cardBg + "/90 backdrop-blur-xl rounded-xl shadow-sm p-4 border " + borderColor}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={"font-bold " + textPrimary + " flex items-center gap-2"}>
                <span className="text-lg">📊</span> 프로젝트
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {projects.slice(0, 4).map(function(project) {
                var progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
                
                return (
                  <button
                    key={project.id}
                    onClick={function() { setSelectedProject(project.name); setActiveTab('all'); }}
                    className={"p-3 " + (darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100") + " rounded-xl text-left transition-all"}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{project.icon}</span>
                      <span className={"text-sm font-medium " + textPrimary + " truncate"}>{project.name}</span>
                    </div>
                    <div className={"flex items-center justify-between text-xs " + textSecondary}>
                      <span>{project.completedTasks}/{project.totalTasks}</span>
                      <span className="font-semibold text-[#A996FF]">{progress}%</span>
                    </div>
                    <div className={"h-1 " + (darkMode ? "bg-gray-600" : "bg-gray-200") + " rounded-full mt-1.5"}>
                      <div 
                        className="h-full bg-[#A996FF] rounded-full"
                        style={{ width: progress + '%' }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="px-4 pb-32">
          <div className="bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl p-5 mb-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={20} />
              <span className="font-bold">이번 주 성과</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{doneCount}</p>
                <p className="text-xs text-white/70">완료</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">2h</p>
                <p className="text-xs text-white/70">집중 시간</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">🔥3</p>
                <p className="text-xs text-white/70">연속</p>
              </div>
            </div>
          </div>

          <div className={"text-center py-8 " + textSecondary}>
            <p>히스토리 기록이 표시됩니다</p>
          </div>
        </div>
      )}

      {/* Inbox Tab */}
      {activeTab === 'inbox' && (
        <div className="px-4 pb-32 space-y-3">
          {inbox && inbox.length > 0 ? inbox.map(function(item) {
            return (
              <div key={item.id}>
                <div 
                  onClick={function() { setExpandedInboxId(expandedInboxId === item.id ? null : item.id); }}
                  className={cardBg + " p-4 rounded-xl transition-all cursor-pointer border " + borderColor}
                >
                  <div className="flex items-start gap-3">
                    <div className={"w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 " + (darkMode ? "bg-[#A996FF]/20" : "bg-[#F5F3FF]")}>
                      {item.from ? item.from[0] : '📧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={"font-semibold " + textPrimary + " text-sm"}>{item.from}</span>
                        <span className={"text-[11px] px-1.5 py-0.5 rounded " + getSourceColor(item.source)}>
                          {getSourceIcon(item.source)} {item.source}
                        </span>
                      </div>
                      <h4 className={"font-medium " + textPrimary + " text-sm mb-1 truncate"}>{item.subject}</h4>
                      <p className={"text-xs " + textSecondary + " line-clamp-1"}>{item.preview}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={"text-[11px] " + textSecondary}>{item.time}</span>
                      {item.urgent && (
                        <span className="flex items-center gap-0.5 text-[11px] text-red-500 font-medium">
                          <AlertCircle size={10} /> 긴급
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {expandedInboxId === item.id && (
                    <div className={"mt-4 pt-3 border-t " + borderColor + " flex gap-2"}>
                      <button 
                        onClick={function(e) { 
                          e.stopPropagation(); 
                          onConvertToTask(item);
                          setExpandedInboxId(null);
                        }}
                        className="flex-1 py-2.5 bg-[#A996FF] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Task로 전환
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-12">
              <span className="text-4xl">📭</span>
              <p className={textSecondary + " mt-2"}>인박스가 비어있어요</p>
            </div>
          )}
        </div>
      )}

      {/* All Tasks Tab */}
      {activeTab === 'all' && (
        <div className="px-4 pb-32">
          <button 
            onClick={function() { setActiveTab('tasks'); setSelectedProject(null); }}
            className="flex items-center gap-1 text-sm text-[#A996FF] font-medium mb-3"
          >
            <ArrowLeft size={16} /> 돌아가기
          </button>
          
          <div className="flex gap-2 mb-4">
            {[
              { key: 'all', label: '전체' },
              { key: 'todo', label: '할 일 (' + todoCount + ')' },
              { key: 'done', label: '완료 (' + doneCount + ')' },
            ].map(function(f) {
              return (
                <button
                  key={f.key}
                  onClick={function() { setFilter(f.key); }}
                  className={"px-3 py-1.5 rounded-full text-xs font-medium transition-all " + (filter === f.key ? "bg-[#A996FF] text-white" : "bg-white text-gray-600")}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          
          <div className="space-y-2">
            {filteredTasks.map(function(task) {
              return (
                <div 
                  key={task.id}
                  onClick={function() { setSelectedTask(task); }}
                  className={"p-4 rounded-xl transition-all cursor-pointer " + 
                    (task.status === 'done' ? "bg-gray-50 border border-gray-100" : "bg-white shadow-sm border border-white/50 hover:shadow-md")}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={function(e) { e.stopPropagation(); onToggleTask(task.id); }}
                      className={"transition-colors " + (task.status === 'done' ? "text-emerald-500" : "text-[#A996FF]")}
                    >
                      {task.status === 'done' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={"font-semibold text-[15px] truncate " + (task.status === 'done' ? "text-gray-400 line-through" : "text-gray-800")}>
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
                  </div>
                </div>
              );
            })}
            
            {filteredTasks.length === 0 && (
              <div className="text-center py-12 px-6">
                <div className="w-20 h-20 bg-[#F5F3FF] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">{filter === 'todo' ? '🎉' : '📋'}</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">
                  {filter === 'todo' ? '오늘 할 일 완료!' : '태스크가 없어요'}
                </h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={function() { setSelectedTask(null); }}
          onToggle={onToggleTask}
          onStartFocus={onStartFocus}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}

      {showReflectModal && (
        <ReflectModal 
          isOpen={showReflectModal}
          onClose={function() { setShowReflectModal(false); }}
          changes={reflectChanges}
        />
      )}

      {showEventModal && (
        <EventModal 
          isOpen={showEventModal}
          onClose={function() { setShowEventModal(false); setEditingEvent(null); }}
          event={editingEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEventLocal}
          googleCalendar={googleCalendar}
        />
      )}

      {showAddTaskModal && (
        <AddTaskModal
          isOpen={showAddTaskModal}
          onClose={function() { setShowAddTaskModal(false); }}
          onAdd={onAddTask}
          projects={projects}
        />
      )}

      {/* Alfredo Floating */}
      {showAlfredo && (
        <AlfredoFloatingBubble
          message={alfredoMsg.message}
          subMessage={alfredoMsg.subMessage}
          isVisible={showAlfredo}
          onOpenChat={onOpenChat}
          darkMode={darkMode}
          quickReplies={alfredoMsg.quickReplies}
        />
      )}
    </div>
  );
};

export default WorkPage;
