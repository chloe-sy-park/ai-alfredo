import React, { useState, useMemo } from 'react';
import { 
  Plus, CheckCircle2, Clock, AlertCircle, ChevronRight,
  Calendar, FolderKanban, Inbox, Search,
  Sun, Cloud, CloudRain, Target
} from 'lucide-react';
import SwipeableTaskItem from './SwipeableTaskItem';
import { AlfredoEmptyState } from '../common/AlfredoEmptyState';
import { mockTasks as fallbackTasks } from '../../data/mockData';

// 알프레도 브리핑 컴포넌트 (업무 버전)
var AlfredoBriefing = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var weather = props.weather;
  var onOpenChat = props.onOpenChat;
  
  var hour = new Date().getHours();
  
  // 시간대별 인사 (업무 맥락)
  var getGreeting = function() {
    if (hour < 6) return '새벽 근무 중이시네요 💪';
    if (hour < 9) return '일찍 시작하셨네요! ☀️';
    if (hour < 12) return '오전 업무 화이팅! 📋';
    if (hour < 14) return '점심 드시고 오셨나요? 🍚';
    if (hour < 18) return '오후 업무도 힘내세요! 💼';
    if (hour < 22) return '야근 중이시네요, 수고하세요 🌙';
    return '늦은 시간까지 고생이 많으세요 🌛';
  };
  
  // 통계 계산
  var todayTasks = tasks.filter(function(t) { return !t.completed && t.status !== 'done'; });
  var completedTasks = tasks.filter(function(t) { return t.completed || t.status === 'done'; });
  var urgentTasks = todayTasks.filter(function(t) { return t.importance === 'high' || t.priority === 'high' || t.urgent; });
  var todayMeetings = events.filter(function(e) {
    var eventDate = new Date(e.start);
    var today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });
  
  // 다음 일정
  var now = new Date();
  var upcomingEvents = events.filter(function(e) {
    return new Date(e.start) > now;
  }).sort(function(a, b) {
    return new Date(a.start) - new Date(b.start);
  });
  var nextEvent = upcomingEvents[0];
  
  // 업무 관련 브리핑 메시지
  var getBriefingMessage = function() {
    if (urgentTasks.length > 0) {
      return '긴급 업무 ' + urgentTasks.length + '개가 있어요. 먼저 처리해볼까요?';
    }
    if (todayMeetings.length > 0 && nextEvent) {
      var meetingTime = new Date(nextEvent.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      return meetingTime + '에 미팅이 있어요. 준비되셨나요?';
    }
    if (todayTasks.length === 0 && completedTasks.length > 0) {
      return '오늘 업무를 모두 완료했어요! 🎉';
    }
    if (todayTasks.length > 0) {
      return '오늘 처리할 업무가 ' + todayTasks.length + '개 있어요';
    }
    return '오늘 업무 현황을 알려드릴게요';
  };
  
  // 날씨 아이콘
  var getWeatherIcon = function() {
    if (!weather) return React.createElement(Sun, { size: 16, className: "text-yellow-400" });
    var condition = weather.condition || '';
    if (condition.includes('rain') || condition.includes('비')) return React.createElement(CloudRain, { size: 16, className: "text-blue-400" });
    if (condition.includes('cloud') || condition.includes('구름')) return React.createElement(Cloud, { size: 16, className: "text-gray-400" });
    return React.createElement(Sun, { size: 16, className: "text-yellow-400" });
  };
  
  var cardBg = darkMode ? 'bg-gradient-to-br from-[#2D2640] to-[#1F1833]' : 'bg-gradient-to-br from-[#A996FF]/20 to-[#8B7CF7]/10';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  
  return React.createElement('div', { 
    className: cardBg + ' rounded-2xl p-4 mb-4 border ' + (darkMode ? 'border-[#A996FF]/20' : 'border-[#A996FF]/30'),
    onClick: onOpenChat
  },
    // 헤더: 펭귄 + 인사
    React.createElement('div', { className: 'flex items-start gap-3 mb-3' },
      React.createElement('div', { className: 'text-2xl' }, '🐧'),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('p', { className: textPrimary + ' font-medium text-sm' }, getGreeting()),
        React.createElement('p', { className: textSecondary + ' text-xs mt-0.5' }, getBriefingMessage())
      ),
      React.createElement(ChevronRight, { size: 18, className: textSecondary })
    ),
    
    // 통계 바
    React.createElement('div', { className: 'flex items-center gap-4 mb-3 text-xs' },
      React.createElement('div', { className: 'flex items-center gap-1 ' + textSecondary },
        React.createElement(Calendar, { size: 12 }),
        React.createElement('span', null, '미팅 ' + todayMeetings.length + '개')
      ),
      React.createElement('div', { className: 'flex items-center gap-1 ' + textSecondary },
        React.createElement(Target, { size: 12 }),
        React.createElement('span', null, '할일 ' + todayTasks.length + '개')
      ),
      urgentTasks.length > 0 && React.createElement('div', { className: 'flex items-center gap-1 text-red-400' },
        React.createElement(AlertCircle, { size: 12 }),
        React.createElement('span', null, '긴급 ' + urgentTasks.length + '개')
      ),
      React.createElement('div', { className: 'flex items-center gap-1 text-emerald-400' },
        React.createElement(CheckCircle2, { size: 12 }),
        React.createElement('span', null, completedTasks.length + '개 완료')
      )
    ),
    
    // 날씨 + 다음 일정
    React.createElement('div', { className: 'flex items-center justify-between text-xs ' + textSecondary },
      weather && React.createElement('div', { className: 'flex items-center gap-1' },
        getWeatherIcon(),
        React.createElement('span', null, (weather.temp || 15) + '°C')
      ),
      nextEvent && React.createElement('div', { className: 'flex items-center gap-1' },
        React.createElement(Clock, { size: 12 }),
        React.createElement('span', null,
          new Date(nextEvent.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) +
          ' ' + (nextEvent.title || nextEvent.summary || '').substring(0, 15) + (nextEvent.title && nextEvent.title.length > 15 ? '...' : '')
        )
      )
    )
  );
};

// 퀵 액션 버튼들 (업무 맥락)
var QuickActions = function(props) {
  var darkMode = props.darkMode;
  var onAddTask = props.onAddTask;
  var onOpenProject = props.onOpenProject;
  var onStartFocus = props.onStartFocus;
  var onOpenInbox = props.onOpenInbox;
  
  var btnClass = darkMode 
    ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700' 
    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200';
  
  var actions = [
    { icon: Plus, label: '할일 추가', onClick: onAddTask, color: 'text-[#A996FF]' },
    { icon: FolderKanban, label: '프로젝트', onClick: onOpenProject, color: 'text-amber-500' },
    { icon: Target, label: '집중모드', onClick: onStartFocus, color: 'text-emerald-500' },
    { icon: Inbox, label: '인박스', onClick: onOpenInbox, color: 'text-blue-500' }
  ];
  
  return React.createElement('div', { className: 'flex gap-2 mb-4 overflow-x-auto pb-2' },
    actions.map(function(action, idx) {
      return React.createElement('button', {
        key: idx,
        onClick: action.onClick,
        className: btnClass + ' flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all'
      },
        React.createElement(action.icon, { size: 16, className: action.color }),
        React.createElement('span', null, action.label)
      );
    })
  );
};

var WorkPage = function(props) {
  var darkMode = props.darkMode;
  // Use props.tasks if available, otherwise use fallback
  var tasks = (props.tasks && props.tasks.length > 0) ? props.tasks : fallbackTasks;
  var setTasks = props.setTasks;
  var events = props.events || [];
  var onOpenAddTask = props.onOpenAddTask;
  var onOpenTask = props.onOpenTask;
  var onOpenProject = props.onOpenProject;
  var onOpenInbox = props.onOpenInbox;
  var onOpenChat = props.onOpenChat;
  var onStartFocus = props.onStartFocus;
  var weather = props.weather;
  var userName = props.userName;
  
  var tabState = useState('all'); // Default to 'all' tab
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];
  
  var searchState = useState('');
  var searchQuery = searchState[0];
  var setSearchQuery = searchState[1];

  // 필터링된 태스크
  var filteredTasks = useMemo(function() {
    var result = tasks || [];
    
    // 검색 필터
    if (searchQuery) {
      var query = searchQuery.toLowerCase();
      result = result.filter(function(t) {
        return (t.title && t.title.toLowerCase().includes(query)) ||
               (t.description && t.description.toLowerCase().includes(query)) ||
               (t.project && t.project.toLowerCase().includes(query));
      });
    }
    
    // 탭 필터
    if (activeTab === 'today') {
      result = result.filter(function(t) {
        // Check deadline field (string like "14:00 전", "오늘", "내일 10:00")
        var deadline = t.deadline || '';
        return deadline.includes('오늘') || 
               deadline.includes('전') || 
               deadline.includes(':') && !deadline.includes('내일') && !deadline.includes('금') && !deadline.includes('수');
      });
    } else if (activeTab === 'upcoming') {
      result = result.filter(function(t) {
        var deadline = t.deadline || '';
        return deadline.includes('내일') || 
               deadline.includes('금') || 
               deadline.includes('수') ||
               deadline.includes('주');
      });
    }
    // 'all' tab shows everything
    
    // 완료되지 않은 것 먼저, 우선순위순
    result = result.slice().sort(function(a, b) {
      var aCompleted = a.completed || a.status === 'done';
      var bCompleted = b.completed || b.status === 'done';
      if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
      
      // priorityScore 기준 정렬 (높을수록 먼저)
      var aScore = a.priorityScore || 50;
      var bScore = b.priorityScore || 50;
      return bScore - aScore;
    });
    
    return result;
  }, [tasks, activeTab, searchQuery]);

  var handleToggleTask = function(taskId) {
    if (setTasks) {
      setTasks(tasks.map(function(t) {
        if (t.id === taskId) {
          var newCompleted = !(t.completed || t.status === 'done');
          return Object.assign({}, t, { 
            completed: newCompleted,
            status: newCompleted ? 'done' : 'todo'
          });
        }
        return t;
      }));
    }
  };

  var handleDeleteTask = function(taskId) {
    if (setTasks) {
      setTasks(tasks.filter(function(t) { return t.id !== taskId; }));
    }
  };

  // 검색 결과 없음 vs 할 일 완료 vs 할 일 없음 구분
  var getEmptyStateVariant = function() {
    if (searchQuery) return 'noResults';
    var incompleteTasks = tasks.filter(function(t) { return !t.completed && t.status !== 'done'; });
    if (tasks.length > 0 && incompleteTasks.length === 0) return 'allDone';
    return 'noTasks';
  };

  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  var tabs = [
    { id: 'today', label: '오늘' },
    { id: 'upcoming', label: '예정' },
    { id: 'all', label: '전체' }
  ];

  return React.createElement('div', { className: bgColor + ' min-h-screen pb-24' },
    React.createElement('div', { className: 'px-4 pt-4' },
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('h1', { className: textPrimary + ' text-2xl font-bold' }, '업무'),
        React.createElement('button', {
          onClick: onOpenAddTask,
          className: 'w-10 h-10 bg-[#A996FF] rounded-full flex items-center justify-center text-white shadow-lg'
        },
          React.createElement(Plus, { size: 20 })
        )
      ),
      
      // 알프레도 브리핑 (업무 버전)
      React.createElement(AlfredoBriefing, {
        darkMode: darkMode,
        tasks: tasks,
        events: events,
        weather: weather,
        userName: userName,
        onOpenChat: onOpenChat
      }),
      
      // 퀵 액션 버튼 (업무 맥락)
      React.createElement(QuickActions, {
        darkMode: darkMode,
        onAddTask: onOpenAddTask,
        onOpenProject: onOpenProject,
        onStartFocus: onStartFocus,
        onOpenInbox: onOpenInbox
      }),
      
      // 검색바
      React.createElement('div', { className: cardBg + ' rounded-xl px-3 py-2 flex items-center gap-2 mb-4 border ' + borderColor },
        React.createElement(Search, { size: 18, className: textSecondary }),
        React.createElement('input', {
          type: 'text',
          placeholder: '할 일 검색...',
          value: searchQuery,
          onChange: function(e) { setSearchQuery(e.target.value); },
          className: 'flex-1 bg-transparent outline-none text-sm ' + textPrimary
        })
      ),
      
      // 탭
      React.createElement('div', { className: 'flex gap-2 mb-4' },
        tabs.map(function(tab) {
          var isActive = activeTab === tab.id;
          return React.createElement('button', {
            key: tab.id,
            onClick: function() { setActiveTab(tab.id); },
            className: 'px-4 py-2 rounded-full text-sm font-medium transition-all ' +
              (isActive 
                ? 'bg-[#A996FF] text-white' 
                : (darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'))
          }, tab.label);
        })
      ),
      
      // 태스크 목록
      React.createElement('div', { className: 'space-y-2' },
        filteredTasks.length === 0 
          ? React.createElement(AlfredoEmptyState, {
              variant: getEmptyStateVariant(),
              darkMode: darkMode,
              onAction: onOpenAddTask,
              title: activeTab === 'today' && getEmptyStateVariant() === 'allDone' 
                ? '오늘 업무 완료!' 
                : undefined,
              message: activeTab === 'today' && getEmptyStateVariant() === 'allDone'
                ? '오늘 할 일을 모두 해치웠어요!'
                : undefined
            })
          : filteredTasks.map(function(task) {
              return React.createElement(SwipeableTaskItem, {
                key: task.id,
                task: task,
                darkMode: darkMode,
                onToggle: function() { handleToggleTask(task.id); },
                onDelete: function() { handleDeleteTask(task.id); },
                onClick: function() { if (onOpenTask) onOpenTask(task); }
              });
            })
      )
    )
  );
};

export default WorkPage;
