import React, { useState, useMemo } from 'react';
import { 
  Sun, Cloud, CloudRain, Zap, Battery, Coffee, Moon,
  ChevronRight, Clock, Calendar, CheckCircle2, Circle, Target,
  AlertCircle, TrendingUp, TrendingDown, Minus, Sparkles,
  Plus, MessageSquare, Search, Bell, Settings, Inbox, FolderKanban,
  Heart, Users, Activity, Smile
} from 'lucide-react';
import UnifiedTimelineView from './UnifiedTimelineView';
import { AlfredoEmptyState } from '../common/AlfredoEmptyState';

// 알프레도 브리핑 컴포넌트
var AlfredoBriefing = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var weather = props.weather;
  var userName = props.userName || 'Boss';
  var onOpenChat = props.onOpenChat;
  
  var hour = new Date().getHours();
  
  // 시간대별 인사
  var getGreeting = function() {
    if (hour < 6) return '새벽이에요, ' + userName + '님 💤';
    if (hour < 12) return '좋은 아침이에요, ' + userName + '님 ☀️';
    if (hour < 14) return '점심 맛있게 드셨나요? 🍚';
    if (hour < 18) return '오후도 화이팅이에요! 💪';
    if (hour < 22) return '오늘 하루 수고하셨어요 🌙';
    return '늦은 시간이네요, ' + userName + '님 🌛';
  };
  
  // 통계 계산
  var todayTasks = tasks.filter(function(t) { return !t.completed; });
  var completedTasks = tasks.filter(function(t) { return t.completed; });
  var urgentTasks = todayTasks.filter(function(t) { return t.priority === 'high' || t.urgent; });
  
  var today = new Date();
  var todayMeetings = events.filter(function(e) {
    var eventDate = new Date(e.start);
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
  
  // 날씨 아이콘
  var getWeatherIcon = function() {
    if (!weather) return React.createElement(Sun, { size: 16, className: "text-yellow-400" });
    var condition = (weather.condition || '').toLowerCase();
    if (condition.includes('rain') || condition.includes('비')) {
      return React.createElement(CloudRain, { size: 16, className: "text-blue-400" });
    }
    if (condition.includes('cloud') || condition.includes('구름')) {
      return React.createElement(Cloud, { size: 16, className: "text-gray-400" });
    }
    return React.createElement(Sun, { size: 16, className: "text-yellow-400" });
  };
  
  var cardBg = darkMode 
    ? 'bg-gradient-to-br from-[#2D2640] to-[#1F1833]' 
    : 'bg-gradient-to-br from-[#A996FF]/20 to-[#8B7CF7]/10';
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
        React.createElement('p', { className: textSecondary + ' text-xs mt-0.5' },
          todayTasks.length > 0 
            ? '오늘 ' + todayTasks.length + '개의 할 일이 기다리고 있어요'
            : '오늘 할 일을 모두 완료했어요! 🎉'
        )
      ),
      React.createElement(ChevronRight, { size: 18, className: textSecondary })
    ),
    
    // 통계 바
    React.createElement('div', { className: 'flex items-center gap-4 mb-3 text-xs' },
      React.createElement('div', { className: 'flex items-center gap-1 ' + textSecondary },
        React.createElement(Calendar, { size: 12 }),
        React.createElement('span', null, '미팅 ' + todayMeetings.length + '개')
      ),
      urgentTasks.length > 0 && React.createElement('div', { className: 'flex items-center gap-1 text-red-400' },
        React.createElement(AlertCircle, { size: 12 }),
        React.createElement('span', null, '긴급 ' + urgentTasks.length + '개')
      ),
      React.createElement('div', { className: 'flex items-center gap-1 ' + textSecondary },
        React.createElement(Target, { size: 12 }),
        React.createElement('span', null, '할일 ' + todayTasks.length + '개')
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
        React.createElement('span', null, (weather.temp || 15) + '°C ' + (weather.condition || '맑음'))
      ),
      nextEvent && React.createElement('div', { className: 'flex items-center gap-1' },
        React.createElement(Clock, { size: 12 }),
        React.createElement('span', null,
          new Date(nextEvent.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) +
          ' ' + ((nextEvent.title || nextEvent.summary || '').substring(0, 12) + 
            ((nextEvent.title || nextEvent.summary || '').length > 12 ? '...' : ''))
        )
      )
    )
  );
};

// 퀵 액션 버튼들
var QuickActions = function(props) {
  var darkMode = props.darkMode;
  var onAddTask = props.onAddTask;
  var onOpenChat = props.onOpenChat;
  var onOpenCalendar = props.onOpenCalendar;
  var onOpenSearch = props.onOpenSearch;
  var onOpenInbox = props.onOpenInbox;
  
  var btnClass = darkMode 
    ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700' 
    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200';
  
  var actions = [
    { icon: Plus, label: '할일 추가', onClick: onAddTask, color: 'text-[#A996FF]' },
    { icon: MessageSquare, label: '알프레도', onClick: onOpenChat, color: 'text-purple-500' },
    { icon: Calendar, label: '캘린더', onClick: onOpenCalendar, color: 'text-emerald-500' },
    { icon: Inbox, label: '인박스', onClick: onOpenInbox, color: 'text-blue-500' }
  ];
  
  return React.createElement('div', { className: 'flex gap-2 mb-4 overflow-x-auto pb-2' },
    actions.map(function(action, idx) {
      return React.createElement('button', {
        key: idx,
        onClick: action.onClick,
        className: btnClass + ' flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all shadow-sm'
      },
        React.createElement(action.icon, { size: 16, className: action.color }),
        React.createElement('span', null, action.label)
      );
    })
  );
};

// 잊지 마세요 섹션
var RemindersSection = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var relationships = props.relationships || [];
  var onOpenTask = props.onOpenTask;
  var onOpenReminder = props.onOpenReminder;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  // 마감 임박 (3일 이내)
  var now = new Date();
  var threeDaysLater = new Date(now);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  
  var urgentDeadlines = tasks.filter(function(t) {
    if (t.completed || !t.dueDate) return false;
    var due = new Date(t.dueDate);
    return due <= threeDaysLater;
  }).slice(0, 2);
  
  // 연락 필요한 사람
  var needContact = relationships.filter(function(r) {
    if (!r.lastContact) return true;
    var lastDate = new Date(r.lastContact);
    var daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    return daysSince > (r.contactFrequency || 30);
  }).slice(0, 2);
  
  var reminders = [];
  
  // 마감 임박 추가
  urgentDeadlines.forEach(function(task) {
    var due = new Date(task.dueDate);
    var daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    reminders.push({
      type: 'deadline',
      icon: '⏰',
      title: task.title,
      subtitle: daysLeft <= 0 ? '오늘까지!' : daysLeft + '일 남음',
      color: daysLeft <= 1 ? 'text-red-400' : 'text-amber-400',
      data: task
    });
  });
  
  // 연락 필요 추가
  needContact.forEach(function(person) {
    var lastDate = person.lastContact ? new Date(person.lastContact) : null;
    var daysSince = lastDate ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)) : '?';
    reminders.push({
      type: 'relationship',
      icon: '💝',
      title: person.name + '님께 연락',
      subtitle: daysSince + '일 전 마지막 연락',
      color: 'text-pink-400',
      data: person
    });
  });
  
  if (reminders.length === 0) return null;
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 mb-4 border ' + borderColor },
    React.createElement('h3', { className: textPrimary + ' font-bold mb-3 flex items-center gap-2' },
      React.createElement(Bell, { size: 18, className: 'text-amber-400' }),
      '잊지 마세요'
    ),
    React.createElement('div', { className: 'space-y-2' },
      reminders.map(function(item, idx) {
        return React.createElement('button', {
          key: idx,
          onClick: function() { 
            if (item.type === 'deadline' && onOpenTask) onOpenTask(item.data);
            if (item.type === 'relationship' && onOpenReminder) onOpenReminder(item);
          },
          className: 'w-full flex items-center gap-3 p-2 rounded-xl ' + 
            (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50') + ' transition-all text-left'
        },
          React.createElement('span', { className: 'text-lg' }, item.icon),
          React.createElement('div', { className: 'flex-1 min-w-0' },
            React.createElement('p', { className: textPrimary + ' text-sm font-medium truncate' }, item.title),
            React.createElement('p', { className: item.color + ' text-xs' }, item.subtitle)
          ),
          React.createElement(ChevronRight, { size: 16, className: textSecondary })
        );
      })
    )
  );
};

// 컨디션 퀵체크
var ConditionQuickCheck = function(props) {
  var darkMode = props.darkMode;
  var mood = props.mood;
  var energy = props.energy;
  var setMood = props.setMood;
  var setEnergy = props.setEnergy;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var moods = [
    { value: 1, emoji: '😫', label: '힘듦' },
    { value: 2, emoji: '😔', label: '별로' },
    { value: 3, emoji: '😐', label: '보통' },
    { value: 4, emoji: '🙂', label: '좋음' },
    { value: 5, emoji: '😄', label: '최고' }
  ];
  
  var energyLevels = [
    { value: 1, icon: Battery, label: '방전', color: 'text-red-400' },
    { value: 2, icon: Battery, label: '부족', color: 'text-amber-400' },
    { value: 3, icon: Zap, label: '보통', color: 'text-yellow-400' },
    { value: 4, icon: Zap, label: '충분', color: 'text-emerald-400' },
    { value: 5, icon: Zap, label: '최고', color: 'text-green-400' }
  ];
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 mb-4 border ' + borderColor },
    React.createElement('h3', { className: textPrimary + ' font-bold mb-3 flex items-center gap-2' },
      React.createElement(Smile, { size: 18, className: 'text-amber-400' }),
      '오늘 컨디션'
    ),
    
    // 기분
    React.createElement('div', { className: 'mb-3' },
      React.createElement('p', { className: textSecondary + ' text-xs mb-2' }, '기분'),
      React.createElement('div', { className: 'flex justify-between' },
        moods.map(function(m) {
          var isSelected = mood === m.value;
          return React.createElement('button', {
            key: m.value,
            onClick: function() { if (setMood) setMood(m.value); },
            className: 'flex flex-col items-center p-2 rounded-xl transition-all ' +
              (isSelected 
                ? 'bg-[#A996FF]/20 scale-110' 
                : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'))
          },
            React.createElement('span', { className: 'text-xl' }, m.emoji),
            React.createElement('span', { className: textSecondary + ' text-[10px] mt-1' }, m.label)
          );
        })
      )
    ),
    
    // 에너지
    React.createElement('div', null,
      React.createElement('p', { className: textSecondary + ' text-xs mb-2' }, '에너지'),
      React.createElement('div', { className: 'flex justify-between' },
        energyLevels.map(function(e) {
          var isSelected = energy === e.value;
          return React.createElement('button', {
            key: e.value,
            onClick: function() { if (setEnergy) setEnergy(e.value); },
            className: 'flex flex-col items-center p-2 rounded-xl transition-all ' +
              (isSelected 
                ? 'bg-[#A996FF]/20 scale-110' 
                : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'))
          },
            React.createElement(e.icon, { size: 20, className: isSelected ? e.color : textSecondary }),
            React.createElement('span', { className: textSecondary + ' text-[10px] mt-1' }, e.label)
          );
        })
      )
    )
  );
};

// 지금 할 일 카드
var NowCard = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var onStartTask = props.onStartTask;
  var onOpenTask = props.onOpenTask;
  var onAddTask = props.onAddTask;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  // 현재 진행 중인 이벤트 또는 가장 우선순위 높은 태스크
  var now = new Date();
  var currentEvent = events.find(function(e) {
    var start = new Date(e.start);
    var end = new Date(e.end || start.getTime() + 60 * 60 * 1000);
    return start <= now && now <= end;
  });
  
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  var completedTasks = tasks.filter(function(t) { return t.completed; });
  
  var topTask = incompleteTasks
    .sort(function(a, b) {
      var priorityOrder = { high: 0, medium: 1, low: 2 };
      var aPriority = priorityOrder[a.priority] !== undefined ? priorityOrder[a.priority] : 1;
      var bPriority = priorityOrder[b.priority] !== undefined ? priorityOrder[b.priority] : 1;
      return aPriority - bPriority;
    })[0];
  
  var currentItem = currentEvent || topTask;
  
  // 할 일이 없는 경우
  if (tasks.length === 0) {
    return React.createElement(AlfredoEmptyState, {
      variant: 'noTasks',
      darkMode: darkMode,
      onAction: onAddTask,
      compact: false
    });
  }
  
  // 모든 할 일 완료
  if (incompleteTasks.length === 0 && completedTasks.length > 0) {
    return React.createElement(AlfredoEmptyState, {
      variant: 'allDone',
      darkMode: darkMode,
      onAction: onAddTask,
      compact: false
    });
  }
  
  // 현재 할 일이 있는 경우
  var isEvent = currentItem && currentItem.start !== undefined;
  var title = currentItem ? (currentItem.title || currentItem.summary || '') : '';
  var subtitle = isEvent 
    ? new Date(currentItem.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' - ' +
      new Date(currentItem.end || currentItem.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : (currentItem ? (currentItem.project || '개인') : '');
  
  return React.createElement('div', { 
    className: 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-2xl p-4 mb-4 text-white shadow-lg',
    onClick: function() { if (onOpenTask && !isEvent && currentItem) onOpenTask(currentItem); }
  },
    React.createElement('div', { className: 'flex items-center gap-2 text-white/70 text-xs mb-2' },
      React.createElement(Target, { size: 14 }),
      React.createElement('span', null, '지금 집중할 것')
    ),
    React.createElement('h2', { className: 'text-lg font-bold mb-1 truncate' }, title),
    React.createElement('p', { className: 'text-white/70 text-sm mb-3' }, subtitle),
    !isEvent && currentItem && React.createElement('button', {
      onClick: function(e) { 
        e.stopPropagation();
        if (onStartTask) onStartTask(currentItem); 
      },
      className: 'bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-all'
    }, '🎯 집중 모드 시작')
  );
};

var HomePage = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var relationships = props.relationships || [];
  var weather = props.weather;
  var mood = props.mood;
  var energy = props.energy;
  var setMood = props.setMood;
  var setEnergy = props.setEnergy;
  var userName = props.userName;
  var setView = props.setView;
  var onOpenAddTask = props.onOpenAddTask;
  var onOpenTask = props.onOpenTask;
  var onOpenEvent = props.onOpenEvent;
  var onOpenChat = props.onOpenChat;
  var onOpenInbox = props.onOpenInbox;
  var onStartFocus = props.onStartFocus;
  var onOpenReminder = props.onOpenReminder;
  var onOpenSearch = props.onOpenSearch;

  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';

  // 오늘 날짜
  var today = new Date();
  var dateStr = today.toLocaleDateString('ko-KR', { 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  });

  // 오늘 이벤트만 필터
  var todayEvents = events.filter(function(e) {
    var eventDate = new Date(e.start);
    return eventDate.toDateString() === today.toDateString();
  });

  return React.createElement('div', { className: bgColor + ' min-h-screen pb-24' },
    React.createElement('div', { className: 'px-4 pt-4' },
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('div', null,
          React.createElement('h1', { className: textPrimary + ' text-2xl font-bold' }, '홈'),
          React.createElement('p', { className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm' }, dateStr)
        ),
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement('button', {
            onClick: onOpenSearch,
            className: 'w-10 h-10 rounded-full flex items-center justify-center ' + 
              (darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600') + ' shadow-sm'
          },
            React.createElement(Search, { size: 18 })
          ),
          React.createElement('button', {
            onClick: onOpenAddTask,
            className: 'w-10 h-10 bg-[#A996FF] rounded-full flex items-center justify-center text-white shadow-lg'
          },
            React.createElement(Plus, { size: 20 })
          )
        )
      ),
      
      // 알프레도 브리핑
      React.createElement(AlfredoBriefing, {
        darkMode: darkMode,
        tasks: tasks,
        events: events,
        weather: weather,
        userName: userName,
        onOpenChat: onOpenChat
      }),
      
      // 퀵 액션 버튼들
      React.createElement(QuickActions, {
        darkMode: darkMode,
        onAddTask: onOpenAddTask,
        onOpenChat: onOpenChat,
        onOpenCalendar: function() { if (setView) setView('CALENDAR'); },
        onOpenSearch: onOpenSearch,
        onOpenInbox: onOpenInbox
      }),
      
      // 컨디션 퀵체크
      React.createElement(ConditionQuickCheck, {
        darkMode: darkMode,
        mood: mood,
        energy: energy,
        setMood: setMood,
        setEnergy: setEnergy
      }),
      
      // 잊지 마세요
      React.createElement(RemindersSection, {
        darkMode: darkMode,
        tasks: tasks,
        relationships: relationships,
        onOpenTask: onOpenTask,
        onOpenReminder: onOpenReminder
      }),
      
      // 지금 할 일
      React.createElement(NowCard, {
        darkMode: darkMode,
        tasks: tasks,
        events: events,
        onStartTask: onStartFocus,
        onOpenTask: onOpenTask,
        onAddTask: onOpenAddTask
      }),
      
      // 오늘 일정 타임라인
      React.createElement('div', { className: 'mt-4' },
        React.createElement('h3', { className: textPrimary + ' font-bold mb-3 flex items-center gap-2' },
          React.createElement(Calendar, { size: 18, className: 'text-emerald-500' }),
          '오늘 일정'
        ),
        todayEvents.length > 0 
          ? React.createElement(UnifiedTimelineView, {
              darkMode: darkMode,
              events: events,
              tasks: tasks,
              onEventClick: onOpenEvent,
              onTaskClick: onOpenTask,
              compact: true
            })
          : React.createElement(AlfredoEmptyState, {
              variant: 'noEvents',
              darkMode: darkMode,
              onAction: function() { if (setView) setView('CALENDAR'); },
              compact: true,
              showSuggestion: false
            })
      )
    )
  );
};

export default HomePage;
