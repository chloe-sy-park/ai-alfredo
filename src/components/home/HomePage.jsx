import React, { useState, useMemo } from 'react';
import { 
  Sun, Cloud, CloudRain, Zap, Battery, Coffee, Moon,
  ChevronRight, Clock, Calendar, CheckCircle2, Circle, Target,
  AlertCircle, TrendingUp, TrendingDown, Minus, Sparkles,
  Plus, MessageSquare, Search, Bell, Settings, Inbox, FolderKanban,
  Heart, Users, Activity, Smile, Rocket, Shield, Flame, Check, ChevronDown, Trophy
} from 'lucide-react';
import UnifiedTimelineView from './UnifiedTimelineView';
import { AlfredoEmptyState } from '../common/AlfredoEmptyState';
import AlfredoStatusBar from '../common/AlfredoStatusBar';
import { YesterdayMeCard, TomorrowMeButton, TomorrowMeWriteModal } from '../common/TomorrowMeMessage';

// W2: 게이미피케이션
import { LevelXpBar, GameWidget, useGamification } from '../gamification/LevelSystem';

// W3: 알프레도 UX
import { AlfredoBriefingCard } from '../alfredo/AlfredoBriefing';
import { SmartQuickActions, QuickActionBar, FloatingActionButton, QUICK_ACTIONS } from '../alfredo/QuickActions';
import { NotificationBell, NotificationCenter, ToastNotification, useNotifications } from '../alfredo/SmartNotifications';
import { ALFREDO_PERSONALITIES, DEFAULT_PERSONALITY, usePersonality } from '../alfredo/AlfredoPersonality';

// W4: 분석
import { InsightsSection, GoalProgressCard } from '../analytics/Insights';
import { HabitTracker } from '../analytics/HabitTracker';

// 🎯 통합 오늘 상태 카드 (날씨+컨디션+모드)
var TodayStatusCard = function(props) {
  var darkMode = props.darkMode;
  var mood = props.mood;
  var energy = props.energy;
  var setMood = props.setMood;
  var setEnergy = props.setEnergy;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var weather = props.weather;
  var currentMode = props.currentMode;
  var setCurrentMode = props.setCurrentMode;
  
  var conditionExpandState = useState(false);
  var isConditionExpanded = conditionExpandState[0];
  var setConditionExpanded = conditionExpandState[1];
  
  var modeExpandState = useState(false);
  var isModeExpanded = modeExpandState[0];
  var setModeExpanded = modeExpandState[1];
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  var dividerColor = darkMode ? 'border-gray-700' : 'border-gray-100';
  
  var today = new Date();
  var todayMeetings = events.filter(function(e) {
    var eventDate = new Date(e.start);
    return eventDate.toDateString() === today.toDateString();
  });
  
  var getWeatherIcon = function() {
    if (!weather) return React.createElement(Sun, { size: 14, className: "text-yellow-400" });
    var condition = (weather.condition || '').toLowerCase();
    if (condition.includes('rain') || condition.includes('비')) {
      return React.createElement(CloudRain, { size: 14, className: "text-blue-400" });
    }
    if (condition.includes('cloud') || condition.includes('구름')) {
      return React.createElement(Cloud, { size: 14, className: "text-gray-400" });
    }
    return React.createElement(Sun, { size: 14, className: "text-yellow-400" });
  };
  
  var moods = [
    { value: 1, emoji: '😫', label: '힘듦' },
    { value: 2, emoji: '😔', label: '별로' },
    { value: 3, emoji: '😐', label: '보통' },
    { value: 4, emoji: '🙂', label: '좋음' },
    { value: 5, emoji: '😄', label: '최고' }
  ];
  
  var energyLevels = [
    { value: 1, label: '방전', color: 'text-red-400' },
    { value: 2, label: '부족', color: 'text-amber-400' },
    { value: 3, label: '보통', color: 'text-yellow-400' },
    { value: 4, label: '충분', color: 'text-emerald-400' },
    { value: 5, label: '최고', color: 'text-green-400' }
  ];
  
  var currentMood = moods.find(function(m) { return m.value === mood; }) || moods[2];
  var currentEnergy = energyLevels.find(function(e) { return e.value === energy; }) || energyLevels[2];
  var batteryIcon = energy && energy <= 2 ? '🪫' : '🔋';
  var isConditionChecked = mood && energy;
  
  var modes = [
    { id: 'focus', emoji: '🔥', label: 'Focus 모드', description: '방해 최소화, 집중 극대화', color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderActive: 'border-orange-500' },
    { id: 'care', emoji: '💙', label: 'Care 모드', description: '부드럽게, 천천히', color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderActive: 'border-blue-500' },
    { id: 'challenge', emoji: '🚀', label: 'Challenge 모드', description: '도전적으로, 성취감 UP', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderActive: 'border-emerald-500' }
  ];
  
  var getRecommendedMode = function() {
    if ((energy && energy <= 2) || (mood && mood <= 2)) return 'care';
    var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
    if ((energy && energy >= 4) && incompleteTasks.length >= 3) return 'challenge';
    return 'focus';
  };
  
  var recommendedMode = getRecommendedMode();
  var activeMode = currentMode || recommendedMode;
  var recommendedModeData = modes.find(function(m) { return m.id === recommendedMode; }) || modes[0];
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl mb-4 border ' + borderColor + ' overflow-hidden' },
    React.createElement('div', { className: 'px-4 py-3 flex items-center justify-between text-xs' },
      React.createElement('div', { className: 'flex items-center gap-1.5 ' + textSecondary },
        getWeatherIcon(),
        React.createElement('span', null, (weather?.temp || '-3') + '°C')
      ),
      React.createElement('div', { className: 'flex items-center gap-1.5 ' + textSecondary },
        React.createElement(Calendar, { size: 14 }),
        React.createElement('span', null, '미팅 ' + todayMeetings.length)
      )
    ),
    React.createElement('div', { className: 'border-t ' + dividerColor }),
    isConditionExpanded 
      ? React.createElement('div', { className: 'px-4 py-3' },
          React.createElement('div', { className: 'flex items-center justify-between mb-3' },
            React.createElement('span', { className: textSecondary + ' text-xs font-medium' }, '오늘 컨디션'),
            React.createElement('button', { onClick: function() { setConditionExpanded(false); }, className: 'text-xs text-[#A996FF] font-medium' }, '완료')
          ),
          React.createElement('div', { className: 'mb-3' },
            React.createElement('p', { className: textSecondary + ' text-xs mb-2' }, '기분'),
            React.createElement('div', { className: 'flex justify-between' },
              moods.map(function(m) {
                var isSelected = mood === m.value;
                return React.createElement('button', { key: m.value, onClick: function() { if (setMood) setMood(m.value); }, className: 'flex flex-col items-center p-2 rounded-xl transition-all ' + (isSelected ? 'bg-[#A996FF]/20 scale-110' : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')) },
                  React.createElement('span', { className: 'text-xl' }, m.emoji),
                  React.createElement('span', { className: textSecondary + ' text-[10px] mt-1' }, m.label)
                );
              })
            )
          ),
          React.createElement('div', null,
            React.createElement('p', { className: textSecondary + ' text-xs mb-2' }, '에너지'),
            React.createElement('div', { className: 'flex justify-between' },
              energyLevels.map(function(e) {
                var isSelected = energy === e.value;
                var emoji = e.value <= 2 ? '🪫' : '🔋';
                return React.createElement('button', { key: e.value, onClick: function() { if (setEnergy) setEnergy(e.value); }, className: 'flex flex-col items-center p-2 rounded-xl transition-all ' + (isSelected ? 'bg-[#A996FF]/20 scale-110' : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')) },
                  React.createElement('span', { className: 'text-lg' }, emoji),
                  React.createElement('span', { className: textSecondary + ' text-[10px] mt-1' }, e.label)
                );
              })
            )
          )
        )
      : React.createElement('button', { onClick: function() { setConditionExpanded(true); }, className: 'w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all' },
          React.createElement('div', { className: 'flex items-center gap-3' },
            React.createElement('span', { className: 'text-xl' }, isConditionChecked ? currentMood.emoji : '😐'),
            React.createElement('div', { className: 'flex items-center gap-2 text-sm' },
              React.createElement('span', { className: textPrimary }, '기분 ' + currentMood.label),
              React.createElement('span', { className: textSecondary }, '•'),
              React.createElement('span', { className: currentEnergy.color }, batteryIcon + ' 에너지 ' + currentEnergy.label)
            )
          ),
          React.createElement('span', { className: textSecondary + ' text-xs' }, '수정')
        ),
    React.createElement('div', { className: 'border-t ' + dividerColor }),
    isModeExpanded
      ? React.createElement('div', { className: 'px-4 py-3' },
          React.createElement('div', { className: 'flex items-center justify-between mb-3' },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('span', null, '🐧'),
              React.createElement('span', { className: textSecondary + ' text-xs font-medium' }, '알프레도 모드')
            ),
            React.createElement('button', { onClick: function() { setModeExpanded(false); }, className: 'text-xs text-[#A996FF] font-medium' }, '완료')
          ),
          React.createElement('div', { className: 'space-y-2' },
            modes.map(function(mode) {
              var isActive = activeMode === mode.id;
              var isRecommended = recommendedMode === mode.id;
              return React.createElement('button', { key: mode.id, onClick: function() { if (setCurrentMode) setCurrentMode(mode.id); }, className: 'w-full flex items-center gap-3 p-3 rounded-xl border transition-all ' + (isActive ? mode.bgColor + ' ' + mode.borderActive + ' border-2' : (darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50')) },
                React.createElement('span', { className: 'text-2xl' }, mode.emoji),
                React.createElement('div', { className: 'flex-1 text-left' },
                  React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('span', { className: textPrimary + ' font-medium text-sm' }, mode.label),
                    isRecommended && React.createElement('span', { className: 'text-[10px] px-1.5 py-0.5 rounded-full bg-[#A996FF]/20 text-[#A996FF]' }, '추천')
                  ),
                  React.createElement('p', { className: textSecondary + ' text-xs' }, mode.description)
                ),
                isActive && React.createElement(Check, { size: 18, className: mode.color })
              );
            })
          )
        )
      : React.createElement('button', { onClick: function() { setModeExpanded(true); }, className: 'w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all' },
          React.createElement('div', { className: 'flex items-center gap-3' },
            React.createElement('span', { className: 'text-xl' }, '🐧'),
            React.createElement('span', { className: textSecondary + ' text-sm' }, '알프레도 모드')
          ),
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('span', { className: textSecondary + ' text-xs' }, '추천:'),
            React.createElement('span', { className: recommendedModeData.color + ' text-sm font-medium' }, recommendedModeData.emoji + ' ' + recommendedModeData.label)
          )
        )
  );
};

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
  
  var now = new Date();
  var threeDaysLater = new Date(now);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  
  var urgentDeadlines = tasks.filter(function(t) {
    if (t.completed || !t.dueDate) return false;
    var due = new Date(t.dueDate);
    return due <= threeDaysLater;
  }).slice(0, 2);
  
  var needContact = relationships.filter(function(r) {
    if (!r.lastContact) return true;
    var lastDate = new Date(r.lastContact);
    var daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    return daysSince > (r.contactFrequency || 30);
  }).slice(0, 2);
  
  var reminders = [];
  
  urgentDeadlines.forEach(function(task) {
    var due = new Date(task.dueDate);
    var daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    reminders.push({ type: 'deadline', icon: '⏰', title: task.title, subtitle: daysLeft <= 0 ? '오늘까지!' : daysLeft + '일 남음', color: daysLeft <= 1 ? 'text-red-400' : 'text-amber-400', data: task });
  });
  
  needContact.forEach(function(person) {
    var lastDate = person.lastContact ? new Date(person.lastContact) : null;
    var daysSince = lastDate ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)) : '?';
    reminders.push({ type: 'relationship', icon: '💝', title: person.name + '님께 연락', subtitle: daysSince + '일 전 마지막 연락', color: 'text-pink-400', data: person });
  });
  
  if (reminders.length === 0) return null;
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 mb-4 border ' + borderColor },
    React.createElement('h3', { className: textPrimary + ' font-bold mb-3 flex items-center gap-2' },
      React.createElement(Bell, { size: 18, className: 'text-amber-400' }),
      '잊지 마세요'
    ),
    React.createElement('div', { className: 'space-y-2' },
      reminders.map(function(item, idx) {
        return React.createElement('button', { key: idx, onClick: function() { if (item.type === 'deadline' && onOpenTask) onOpenTask(item.data); if (item.type === 'relationship' && onOpenReminder) onOpenReminder(item); }, className: 'w-full flex items-center gap-3 p-2 rounded-xl ' + (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50') + ' transition-all text-left' },
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

var NowCard = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var onStartTask = props.onStartTask;
  var onOpenTask = props.onOpenTask;
  var onAddTask = props.onAddTask;
  
  var now = new Date();
  var currentEvent = events.find(function(e) {
    var start = new Date(e.start);
    var end = new Date(e.end || start.getTime() + 60 * 60 * 1000);
    return start <= now && now <= end;
  });
  
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  var completedTasks = tasks.filter(function(t) { return t.completed; });
  
  var topTask = incompleteTasks.sort(function(a, b) {
    var priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
  })[0];
  
  var currentItem = currentEvent || topTask;
  
  if (tasks.length === 0) {
    return React.createElement(AlfredoEmptyState, { variant: 'noTasks', darkMode: darkMode, onAction: onAddTask, compact: false });
  }
  
  if (incompleteTasks.length === 0 && completedTasks.length > 0) {
    return React.createElement(AlfredoEmptyState, { variant: 'allDone', darkMode: darkMode, onAction: onAddTask, compact: false });
  }
  
  var isEvent = currentItem && currentItem.start !== undefined;
  var title = currentItem ? (currentItem.title || currentItem.summary || '') : '';
  var subtitle = isEvent ? new Date(currentItem.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(currentItem.end || currentItem.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : (currentItem ? (currentItem.project || '개인') : '');
  
  return React.createElement('div', { className: 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-2xl p-4 mb-4 text-white shadow-lg', onClick: function() { if (onOpenTask && !isEvent && currentItem) onOpenTask(currentItem); } },
    React.createElement('div', { className: 'flex items-center gap-2 text-white/70 text-xs mb-2' },
      React.createElement(Target, { size: 14 }),
      React.createElement('span', null, '지금 집중할 것')
    ),
    React.createElement('h2', { className: 'text-lg font-bold mb-1 truncate' }, title),
    React.createElement('p', { className: 'text-white/70 text-sm mb-3' }, subtitle),
    !isEvent && currentItem && React.createElement('button', { onClick: function(e) { e.stopPropagation(); if (onStartTask) onStartTask(currentItem); }, className: 'bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-all' }, '🎯 집중 모드 시작')
  );
};

var Big3Section = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var onOpenTask = props.onOpenTask;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var big3 = tasks.filter(function(t) { return !t.completed; }).sort(function(a, b) {
    var priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
  }).slice(0, 3);
  
  if (big3.length === 0) return null;
  
  var getRankEmoji = function(idx) { return idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'; };
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 mb-4 border ' + borderColor },
    React.createElement('h3', { className: textPrimary + ' font-bold mb-3 flex items-center gap-2' },
      React.createElement(Target, { size: 18, className: 'text-[#A996FF]' }),
      '오늘의 Top 3'
    ),
    React.createElement('div', { className: 'space-y-2' },
      big3.map(function(task, idx) {
        return React.createElement('button', { key: task.id || idx, onClick: function() { if (onOpenTask) onOpenTask(task); }, className: 'w-full flex items-center gap-3 p-2 rounded-xl ' + (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50') + ' transition-all text-left' },
          React.createElement('span', { className: 'text-lg' }, getRankEmoji(idx)),
          React.createElement('p', { className: textPrimary + ' text-sm font-medium flex-1 truncate' }, task.title),
          task.priority === 'high' && React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400' }, '긴급')
        );
      })
    )
  );
};

// 🎮 게임 위젯 (간소화)
var GameWidgetCompact = function(props) {
  var darkMode = props.darkMode;
  var onClick = props.onClick;
  var gameData = props.gameData || {};
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var level = gameData.level || 1;
  var xp = gameData.totalXp || 0;
  var streak = gameData.currentStreak || 0;
  
  return React.createElement('button', {
    onClick: onClick,
    className: cardBg + ' rounded-2xl p-4 mb-4 border ' + borderColor + ' w-full text-left hover:border-[#A996FF]/50 transition-all'
  },
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('div', { className: 'w-10 h-10 rounded-xl bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-white font-bold' }, level),
        React.createElement('div', null,
          React.createElement('p', { className: textPrimary + ' font-bold text-sm' }, 'Lv.' + level),
          React.createElement('p', { className: textSecondary + ' text-xs' }, xp.toLocaleString() + ' XP')
        )
      ),
      React.createElement('div', { className: 'flex items-center gap-4' },
        streak > 0 && React.createElement('div', { className: 'flex items-center gap-1 text-orange-500' },
          React.createElement(Flame, { size: 16 }),
          React.createElement('span', { className: 'font-bold text-sm' }, streak)
        ),
        React.createElement(ChevronRight, { size: 16, className: textSecondary })
      )
    )
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
  var onOpenGameCenter = props.onOpenGameCenter;
  
  var modeState = useState(null);
  var alfredoMode = modeState[0];
  var setAlfredoMode = modeState[1];
  
  var tomorrowMeModalState = useState(false);
  var showTomorrowMeModal = tomorrowMeModalState[0];
  var setShowTomorrowMeModal = tomorrowMeModalState[1];
  
  var notifCenterState = useState(false);
  var showNotifCenter = notifCenterState[0];
  var setShowNotifCenter = notifCenterState[1];
  
  var quickSheetState = useState(false);
  var showQuickSheet = quickSheetState[0];
  var setShowQuickSheet = quickSheetState[1];
  
  // 게이미피케이션 훅
  var gamification = useGamification ? useGamification() : { totalXp: 0, level: 1, currentStreak: 0 };
  
  // 알림 훅
  var notifications = useNotifications ? useNotifications() : { notifications: [], unreadCount: 0, toast: { visible: false } };

  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';

  var today = new Date();
  var dateStr = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
  var hour = today.getHours();
  var isMorning = hour >= 5 && hour < 12;

  var todayEvents = events.filter(function(e) {
    var eventDate = new Date(e.start);
    return eventDate.toDateString() === today.toDateString();
  });
  
  // 퀵 액션 핸들러
  var handleQuickAction = function(action) {
    if (!action) return;
    switch (action.id) {
      case 'addTask':
      case 'addBig3':
        if (onOpenAddTask) onOpenAddTask();
        break;
      case 'startFocus':
      case 'quickFocus':
        if (onStartFocus) onStartFocus();
        break;
      case 'talkToAlfredo':
      case 'askAdvice':
        if (onOpenChat) onOpenChat();
        break;
      case 'checkCalendar':
      case 'addEvent':
        if (setView) setView('CALENDAR');
        break;
      case 'logMood':
        // 기분 기록은 상태 카드에서
        break;
      default:
        break;
    }
    setShowQuickSheet(false);
  };

  return React.createElement('div', { className: bgColor + ' min-h-screen pb-24' },
    // 토스트 알림
    notifications.toast && React.createElement(ToastNotification, {
      notification: notifications.toast.notification,
      isVisible: notifications.toast.visible,
      onDismiss: notifications.hideToast,
      darkMode: darkMode
    }),
    
    // 알림 센터
    React.createElement(NotificationCenter, {
      isOpen: showNotifCenter,
      onClose: function() { setShowNotifCenter(false); },
      notifications: notifications.notifications,
      onDismiss: notifications.dismissNotification,
      onDismissAll: notifications.dismissAll,
      darkMode: darkMode
    }),
    
    React.createElement(AlfredoStatusBar, { darkMode: darkMode, mood: mood, energy: energy, tasks: tasks, events: events, onOpenChat: onOpenChat, sticky: true }),
    
    React.createElement('div', { className: 'px-4 pt-4' },
      // 헤더 with 알림 벨
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('div', null,
          React.createElement('h1', { className: textPrimary + ' text-2xl font-bold' }, '홈'),
          React.createElement('p', { className: textSecondary + ' text-sm' }, dateStr)
        ),
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement(NotificationBell, {
            count: notifications.unreadCount,
            onClick: function() { setShowNotifCenter(true); },
            darkMode: darkMode
          }),
          React.createElement('button', { onClick: onOpenSearch, className: 'w-10 h-10 rounded-full flex items-center justify-center ' + (darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600') + ' shadow-sm' },
            React.createElement(Search, { size: 18 })
          ),
          React.createElement('button', { onClick: onOpenAddTask, className: 'w-10 h-10 bg-[#A996FF] rounded-full flex items-center justify-center text-white shadow-lg' },
            React.createElement(Plus, { size: 20 })
          )
        )
      ),
      
      // 어제의 나에게서 온 메시지 (아침)
      isMorning && React.createElement(YesterdayMeCard, { darkMode: darkMode, onReply: function() { setShowTomorrowMeModal(true); } }),
      
      // 알프레도 브리핑 (새로운 컴포넌트)
      React.createElement(AlfredoBriefingCard, {
        darkMode: darkMode,
        personality: alfredoMode ? ALFREDO_PERSONALITIES[alfredoMode] : DEFAULT_PERSONALITY,
        tasks: tasks,
        events: todayEvents,
        streak: gamification.currentStreak || 0,
        energy: energy,
        weather: weather,
        onClick: onOpenChat,
        compact: true
      }),
      
      // 상태 카드 (날씨+컨디션+모드)
      React.createElement(TodayStatusCard, { darkMode: darkMode, mood: mood, energy: energy, setMood: setMood, setEnergy: setEnergy, tasks: tasks, events: events, weather: weather, currentMode: alfredoMode, setCurrentMode: setAlfredoMode }),
      
      // 스마트 퀵 액션 (새로운 컴포넌트)
      React.createElement(SmartQuickActions, {
        darkMode: darkMode,
        onAction: handleQuickAction,
        userContext: { energy: energy, mood: mood, tasksLeft: tasks.filter(function(t) { return !t.completed; }).length }
      }),
      
      // 지금 집중할 것
      React.createElement(NowCard, { darkMode: darkMode, tasks: tasks, events: events, onStartTask: onStartFocus, onOpenTask: onOpenTask, onAddTask: onOpenAddTask }),
      
      // 게임 위젯 (새로운 컴포넌트)
      React.createElement(GameWidgetCompact, {
        darkMode: darkMode,
        gameData: gamification,
        onClick: onOpenGameCenter
      }),
      
      // 오늘의 Top 3
      React.createElement(Big3Section, { darkMode: darkMode, tasks: tasks, onOpenTask: onOpenTask }),
      
      // 내일의 나에게 버튼
      React.createElement(TomorrowMeButton, { darkMode: darkMode, onClick: function() { setShowTomorrowMeModal(true); } }),
      
      // 리마인더
      React.createElement(RemindersSection, { darkMode: darkMode, tasks: tasks, relationships: relationships, onOpenTask: onOpenTask, onOpenReminder: onOpenReminder }),
      
      // 오늘 타임라인
      React.createElement('div', { className: 'mt-4' },
        React.createElement('h3', { className: textPrimary + ' font-bold mb-3 flex items-center gap-2' },
          React.createElement(Calendar, { size: 18, className: 'text-emerald-500' }),
          '오늘 타임라인'
        ),
        todayEvents.length > 0 
          ? React.createElement(UnifiedTimelineView, { darkMode: darkMode, events: events, tasks: tasks, onEventClick: onOpenEvent, onTaskClick: onOpenTask, compact: true })
          : React.createElement(AlfredoEmptyState, { variant: 'noEvents', darkMode: darkMode, onAction: function() { if (setView) setView('CALENDAR'); }, compact: true, showSuggestion: false })
      )
    ),
    
    // 플로팅 액션 버튼
    React.createElement(FloatingActionButton, {
      darkMode: darkMode,
      onAction: handleQuickAction,
      primaryAction: 'addTask',
      secondaryActions: ['startFocus', 'talkToAlfredo', 'logMood']
    }),
    
    // 내일의 나에게 모달
    React.createElement(TomorrowMeWriteModal, { isOpen: showTomorrowMeModal, onClose: function() { setShowTomorrowMeModal(false); }, darkMode: darkMode, userName: userName })
  );
};

export default HomePage;
