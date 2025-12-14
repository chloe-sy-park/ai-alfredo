import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Home, Briefcase, Heart, Zap, MessageCircle, Send, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Plus, Clock, CheckCircle2, Circle, Bell, TrendingUp, TrendingDown, Trophy, Calendar, MapPin, Sun, Moon, Cloud, CloudRain, Sparkles, Settings, RefreshCw, Mic, Battery, Umbrella, Shirt as ShirtIcon, X, FileText, Mail, AlertCircle, Inbox, Trash2, Lightbulb, Search, Award, Target, Flame, Star, Gift, Crown, Database, Upload, FileAudio, Loader2, GripVertical } from 'lucide-react';

// === External Components ===
import MeetingUploader from './components/MeetingUploader';

// === Constants ===
import { COLORS, SPACING, RADIUS, getThemeStyles, BUTTON_STYLES, CARD_STYLES, INPUT_STYLES } from './constants/colors';
import { TIME_CONFIG } from './constants/timeConfig';
import { LEVEL_CONFIG, XP_REWARDS, BADGES, initialGameState } from './constants/gamification';

// === Data ===
import { 
  mockWeather, mockEvents, mockBig3, mockAllTasks, mockProjects,
  mockCompletedHistory, mockWorkReminders, mockDontForget, mockRelationships,
  mockInbox, mockLifeReminders, mockPersonalSchedule, mockWorkLifeImpact,
  mockHealthCheck, mockMedications, timeSlots, mockRoutines,
  mockConditionHistory, mockUrgent, mockHabits, mockMonitoring, mockMoodHistory
} from './data/mockData';

// === Hooks ===
import { useTimeTracking } from './hooks/useTimeTracking';
import useSmartNotifications, { NOTIFICATION_PRIORITY } from './hooks/useSmartNotifications';

// === Common Components ===
import { Button, Card, Toggle, SectionHeader, EmptyState, Modal, PageHeader, ProgressBar, Badge, AlfredoAvatar, Toast, StatusIndicator, DomainBadge } from './components/common/index.jsx';

// === Alfredo Components ===
import { TimeAlertToast, AlfredoFeedback, AlfredoStatusBar, AlfredoFloatingBubble } from './components/alfredo/index.jsx';

// === Page Components (직접 파일 import) ===
import HomePage from './components/home/HomePage';
import Onboarding from './components/home/Onboarding';
import WorkPage from './components/work/WorkPage';
import CalendarPage from './components/calendar/CalendarPage';
import AlfredoChat from './components/chat/AlfredoChat';
import WeeklyReviewPage from './components/review/WeeklyReviewPage';
import HabitHeatmapPage from './components/review/HabitHeatmapPage';
import EnergyRhythmPage from './components/review/EnergyRhythmPage';
import { FocusTimer, FocusCompletionScreen } from './components/focus/FocusPage';
import ProjectDashboardPage from './components/projects/ProjectDashboardPage';
import LifePage from './components/life/LifePage';
import SettingsPage from './components/settings/SettingsPage';
import WidgetGallery from './components/settings/WidgetGallery';

// === Modal Components ===
import EventModal from './components/modals/EventModal';
import TaskModal from './components/modals/TaskModal';
import AddTaskModal from './components/modals/AddTaskModal';
import RoutineManagerModal from './components/modals/RoutineManagerModal';
import ProjectEditModal from './components/modals/ProjectEditModal';
import SearchModal from './components/modals/SearchModal';
import LifeDetailModal from './components/modals/LifeDetailModal';
import GoogleAuthModal from './components/modals/GoogleAuthModal';
import ReflectModal from './components/modals/ReflectModal';
import QuickCaptureModal from './components/modals/QuickCaptureModal';
import NaturalLanguageQuickAdd from './components/modals/NaturalLanguageQuickAdd';
import DoNotDisturbModal from './components/modals/DoNotDisturbModal';
import { LevelUpModal, NewBadgeModal, StatsModal } from './components/modals/StatsModals';

// === Widget Components (직접 파일 import) ===
import { QuickConditionTracker, AlfredoBriefing, Big3Widget, UrgentWidget, TimelineWidget, RoutineWidget } from './components/home/widgets.jsx';
import UnifiedTimelineView from './components/home/UnifiedTimelineView';

// === Work Components ===
import InboxPage from './components/work/InboxPage';
import SwipeableTaskItem from './components/work/SwipeableTaskItem';
import { Sparkline, PriorityIndicator } from './components/work/TaskWidgets';

// === Home Components ===
import AlfredoContextActions from './components/home/AlfredoContextActions';

// === Notification Components ===
import { SmartNotificationToast, NotificationCenter, NotificationItem } from './components/notifications/index.jsx';

// === Celebration Components ===
import { ConfettiEffect, XPFloater, StreakBurst, LevelUpCelebration, CompletionCelebration } from './components/celebrations/index.jsx';

// === Banner Components ===
import { DoNotDisturbBanner, OfflineBanner, PWAInstallBanner } from './components/common/Banners';

// === Main App ===
export default function LifeButlerApp() {
  const [view, setView] = useState('HOME');
  const [userData, setUserData] = useState({ mood: 'light', energy: 68, oneThing: '투자 보고서 완성', memo: '' });
  const [tasks, setTasks] = useState(mockBig3);
  const [allTasks, setAllTasks] = useState(mockAllTasks);
  const [allEvents, setAllEvents] = useState(function() {
    try {
      var saved = localStorage.getItem('allEvents');
      if (saved) {
        var parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {
      console.error('localStorage error:', e);
    }
    return mockEvents;
  });
  const [inbox, setInbox] = useState(mockInbox);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [alfredoFeedback, setAlfredoFeedback] = useState({ visible: false, message: '', type: 'praise', icon: '🐧' });
  const [focusTask, setFocusTask] = useState(null);
  const [completedTaskInfo, setCompletedTaskInfo] = useState(null);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [showNLQuickAdd, setShowNLQuickAdd] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [gameState, setGameState] = useState(initialGameState);
  const [showLevelUp, setShowLevelUp] = useState(null);
  const [showNewBadge, setShowNewBadge] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [dndEndTime, setDndEndTime] = useState(null);
  const [dndRemainingTime, setDndRemainingTime] = useState(null);
  const [showDndModal, setShowDndModal] = useState(false);
  const [showMeetingUploader, setShowMeetingUploader] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState(null);
  const [celebration, setCelebration] = useState({ visible: false, type: null, data: null });
  const [completionStreak, setCompletionStreak] = useState(0);
  const [lastCompletionTime, setLastCompletionTime] = useState(null);
  const [routines, setRoutines] = useState(function() {
    var saved = localStorage.getItem('lifebutler_routines');
    if (saved) {
      return JSON.parse(saved);
    }
    return mockRoutines.map(function(r) {
      return Object.assign({}, r, { repeatType: 'daily', repeatDays: [0,1,2,3,4,5,6], reminder: true, history: [] });
    });
  });
  const [showRoutineManager, setShowRoutineManager] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [currentWorkingTask, setCurrentWorkingTask] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [pwaInstallDismissed, setPWAInstallDismissed] = useState(false);
  const [connections, setConnections] = useState({ googleCalendar: true, gmail: true, notion: false, slack: false });

  var timeTracking = useTimeTracking(currentWorkingTask, allEvents, function(alertType, data) { console.log('Time alert:', alertType, data); });
  var smartNotifications = useSmartNotifications({ tasks: allTasks, events: allEvents, routines: routines, energy: userData.energy || 70 });

  var STORAGE_KEYS = { userData: 'lifebutler_userData', tasks: 'lifebutler_tasks', allTasks: 'lifebutler_allTasks', allEvents: 'lifebutler_allEvents', inbox: 'lifebutler_inbox', darkMode: 'lifebutler_darkMode', view: 'lifebutler_view', gameState: 'lifebutler_gameState', connections: 'lifebutler_connections' };

  // Initialize from localStorage
  useEffect(function() {
    try {
      var savedUserData = localStorage.getItem(STORAGE_KEYS.userData);
      var savedTasks = localStorage.getItem(STORAGE_KEYS.tasks);
      var savedAllTasks = localStorage.getItem(STORAGE_KEYS.allTasks);
      var savedAllEvents = localStorage.getItem(STORAGE_KEYS.allEvents);
      var savedInbox = localStorage.getItem(STORAGE_KEYS.inbox);
      var savedDarkMode = localStorage.getItem(STORAGE_KEYS.darkMode);
      var savedView = localStorage.getItem(STORAGE_KEYS.view);
      var savedGameState = localStorage.getItem(STORAGE_KEYS.gameState);
      var savedConnections = localStorage.getItem(STORAGE_KEYS.connections);
      if (savedUserData) setUserData(JSON.parse(savedUserData));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedAllTasks) setAllTasks(JSON.parse(savedAllTasks));
      if (savedAllEvents) setAllEvents(JSON.parse(savedAllEvents));
      if (savedInbox) setInbox(JSON.parse(savedInbox));
      if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
      if (savedGameState) setGameState(JSON.parse(savedGameState));
      if (savedConnections) setConnections(JSON.parse(savedConnections));
      if (savedView && ['ONBOARDING', 'FOCUS', 'FOCUS_COMPLETE'].indexOf(savedView) === -1) setView(savedView);
    } catch (e) { console.error('Load error:', e); }
    setIsInitialized(true);
  }, []);

  // Save to localStorage
  useEffect(function() { if (isInitialized) try { localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify(userData)); } catch(e){} }, [userData, isInitialized]);
  useEffect(function() { if (isInitialized) try { localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks)); } catch(e){} }, [tasks, isInitialized]);
  useEffect(function() { if (isInitialized) try { localStorage.setItem(STORAGE_KEYS.allTasks, JSON.stringify(allTasks)); } catch(e){} }, [allTasks, isInitialized]);
  useEffect(function() { if (isInitialized) try { localStorage.setItem(STORAGE_KEYS.allEvents, JSON.stringify(allEvents)); } catch(e){} }, [allEvents, isInitialized]);
  useEffect(function() { if (isInitialized) try { localStorage.setItem(STORAGE_KEYS.inbox, JSON.stringify(inbox)); } catch(e){} }, [inbox, isInitialized]);
  useEffect(function() { if (isInitialized) try { localStorage.setItem(STORAGE_KEYS.darkMode, JSON.stringify(darkMode)); } catch(e){} }, [darkMode, isInitialized]);
  useEffect(function() { if (isInitialized) try { localStorage.setItem(STORAGE_KEYS.gameState, JSON.stringify(gameState)); } catch(e){} }, [gameState, isInitialized]);
  useEffect(function() { if (isInitialized) try { localStorage.setItem(STORAGE_KEYS.connections, JSON.stringify(connections)); } catch(e){} }, [connections, isInitialized]);
  useEffect(function() { if (isInitialized && ['ONBOARDING','FOCUS','FOCUS_COMPLETE'].indexOf(view) === -1) try { localStorage.setItem(STORAGE_KEYS.view, view); } catch(e){} }, [view, isInitialized]);

  // PWA & Network
  useEffect(function() {
    var handleOnline = function() { setIsOffline(false); };
    var handleOffline = function() { setIsOffline(true); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return function() { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  // DND Timer
  useEffect(function() {
    if (!doNotDisturb || !dndEndTime) return;
    var timer = setInterval(function() {
      var remaining = Math.max(0, Math.floor((dndEndTime - Date.now()) / 1000));
      if (remaining <= 0) { setDoNotDisturb(false); setDndEndTime(null); setDndRemainingTime(null); }
      else { setDndRemainingTime(remaining); }
    }, 1000);
    return function() { clearInterval(timer); };
  }, [doNotDisturb, dndEndTime]);

  // Keyboard shortcuts
  useEffect(function() {
    var handleKeyDown = function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearchModal(true); }
      if (e.key === 'Escape') setShowSearchModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return function() { window.removeEventListener('keydown', handleKeyDown); };
  }, []);

  // Midnight routine reset
  useEffect(function() {
    var checkMidnight = function() {
      var now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        var resetRoutines = routines.map(function(r) { return Object.assign({}, r, { current: 0 }); });
        setRoutines(resetRoutines);
        localStorage.setItem('lifebutler_routines', JSON.stringify(resetRoutines));
      }
    };
    var interval = setInterval(checkMidnight, 60000);
    return function() { clearInterval(interval); };
  }, [routines]);

  // Helper functions
  var showToast = function(message) { setToast({ visible: true, message: message }); setTimeout(function() { setToast({ visible: false, message: '' }); }, 2500); };
  var showAlfredoFeedback = function(message, type, icon) { setAlfredoFeedback({ visible: true, message: message, type: type || 'praise', icon: icon || '🐧' }); setTimeout(function() { setAlfredoFeedback({ visible: false, message: '', type: 'praise', icon: '🐧' }); }, 3000); };
  var enableDoNotDisturb = function(mins) { setDoNotDisturb(true); if (mins === -1) { setDndEndTime(null); setDndRemainingTime(null); } else { setDndEndTime(Date.now() + mins * 60000); setDndRemainingTime(mins * 60); } };
  var disableDoNotDisturb = function() { setDoNotDisturb(false); setDndEndTime(null); setDndRemainingTime(null); };

  var earnXP = function(amount, reason) {
    var oldLevel = LEVEL_CONFIG.getLevel(gameState.totalXP).level;
    var newTotalXP = gameState.totalXP + amount;
    var newLevelInfo = LEVEL_CONFIG.getLevel(newTotalXP);
    var dayOfWeek = new Date().getDay();
    var newWeeklyXP = gameState.weeklyXP.slice();
    newWeeklyXP[dayOfWeek] += amount;
    setGameState(function(prev) { return Object.assign({}, prev, { totalXP: newTotalXP, todayXP: prev.todayXP + amount, weeklyXP: newWeeklyXP }); });
    if (newLevelInfo.level > oldLevel) setTimeout(function() { setShowLevelUp(newLevelInfo.level); }, 500);
    showToast('+' + amount + ' XP! ' + reason);
  };

  var checkBadges = function(stats) {
    var newBadges = [];
    BADGES.forEach(function(badge) { if (gameState.unlockedBadges.indexOf(badge.id) === -1 && badge.condition(stats)) newBadges.push(badge); });
    if (newBadges.length > 0) {
      setGameState(function(prev) { return Object.assign({}, prev, { unlockedBadges: prev.unlockedBadges.concat(newBadges.map(function(b) { return b.id; })) }); });
      setTimeout(function() { setShowNewBadge(newBadges[0]); }, 1000);
    }
  };

  var handleTaskCompleteWithXP = function(task, isBig3) {
    var hour = new Date().getHours();
    var xpEarned = task.importance === 'high' ? XP_REWARDS.taskCompleteHigh : XP_REWARDS.taskComplete;
    if (isBig3) xpEarned += XP_REWARDS.big3Complete;
    if (hour < 12 && isBig3) xpEarned += 20;
    earnXP(xpEarned, isBig3 ? 'Big3 완료!' : '태스크 완료!');
    var newStats = Object.assign({}, gameState, { totalCompleted: gameState.totalCompleted + 1, todayTasks: gameState.todayTasks + 1 });
    if (isBig3) newStats.big3Completed = gameState.big3Completed + 1;
    if (hour < 9) newStats.earlyBirdCount = (gameState.earlyBirdCount || 0) + 1;
    if (hour >= 22) newStats.nightOwlCount = (gameState.nightOwlCount || 0) + 1;
    setGameState(function(prev) { return Object.assign({}, prev, newStats); });
    checkBadges(newStats);
  };

  var handleFocusCompleteWithXP = function(minutes) {
    earnXP(XP_REWARDS.focusSession, '집중 세션 완료!');
    setGameState(function(prev) { return Object.assign({}, prev, { focusSessions: prev.focusSessions + 1, focusMinutes: prev.focusMinutes + minutes }); });
  };

  var getTaskCompleteFeedback = function(task, completedCount, totalCount, isStreak) {
    if (completedCount === totalCount && totalCount > 0) return { msg: "완벽해요! 오늘 할 일 끝!", icon: "🎉" };
    if (isStreak && completedCount >= 3) return { msg: completedCount + "연속! 흐름 좋아요!", icon: "🔥" };
    if (completedCount === totalCount - 1 && totalCount > 1) return { msg: "마지막 하나! 거의 다 왔어요!", icon: "🏁" };
    if (completedCount === 1) return { msg: "첫 번째 완료! 시작이 반이에요!", icon: "🌟" };
    return { msg: "잘했어요! 👏", icon: "🐧" };
  };

  var handleToggleTask = function(taskId) {
    var task = tasks.find(function(t) { return t.id === taskId; });
    var isCompleting = task && task.status !== 'done';
    var newTasks = tasks.map(function(t) { return t.id === taskId ? Object.assign({}, t, { status: t.status === 'done' ? 'todo' : 'done' }) : t; });
    setTasks(newTasks);
    if (isCompleting && task) {
      handleTaskCompleteWithXP(task, true);
      var completedCount = newTasks.filter(function(t) { return t.status === 'done'; }).length;
      var totalCount = newTasks.length;
      var now = Date.now();
      var newStreak = (lastCompletionTime && (now - lastCompletionTime) < 300000) ? completionStreak + 1 : 1;
      setCompletionStreak(newStreak);
      setLastCompletionTime(now);
      var feedback = getTaskCompleteFeedback(task, completedCount, totalCount, newStreak >= 3);
      showAlfredoFeedback(feedback.msg, 'praise', feedback.icon);
      setCelebration({ visible: true, type: completedCount === totalCount ? 'big3' : newStreak >= 3 ? 'streak' : 'task', data: { xp: 20, streak: newStreak, taskTitle: task.title, completedCount: completedCount, totalCount: totalCount } });
      if (completedCount === totalCount) earnXP(XP_REWARDS.allBig3Complete, '🎉 Big3 전체 완료!');
    }
  };

  var handleToggleAllTask = function(taskId) {
    var task = allTasks.find(function(t) { return t.id === taskId; });
    var isCompleting = task && task.status !== 'done';
    var newTasks = allTasks.map(function(t) { return t.id === taskId ? Object.assign({}, t, { status: t.status === 'done' ? 'todo' : 'done' }) : t; });
    setAllTasks(newTasks);
    if (isCompleting && task) {
      handleTaskCompleteWithXP(task, false);
      var feedback = getTaskCompleteFeedback(task, newTasks.filter(function(t) { return t.status === 'done'; }).length, newTasks.length, false);
      showAlfredoFeedback(feedback.msg, 'praise', feedback.icon);
    }
  };

  var handleAddRoutine = function(routine) { var n = routines.concat([routine]); setRoutines(n); localStorage.setItem('lifebutler_routines', JSON.stringify(n)); showToast('🔄 새 루틴 추가!'); };
  var handleUpdateRoutine = function(r) { var n = routines.map(function(x) { return x.id === r.id ? r : x; }); setRoutines(n); localStorage.setItem('lifebutler_routines', JSON.stringify(n)); showToast('✅ 루틴 수정!'); };
  var handleDeleteRoutine = function(id) { var n = routines.filter(function(r) { return r.id !== id; }); setRoutines(n); localStorage.setItem('lifebutler_routines', JSON.stringify(n)); showToast('🗑️ 루틴 삭제'); };
  var handleToggleRoutine = function(routineId) {
    var routine = routines.find(function(r) { return r.id === routineId; });
    if (!routine) return;
    var newCurrent = routine.current < routine.target ? routine.current + 1 : 0;
    var isJustCompleted = newCurrent >= routine.target && routine.current < routine.target;
    var newStreak = routine.streak || 0;
    if (isJustCompleted) {
      var today = new Date().toDateString();
      var yesterday = new Date(Date.now() - 86400000).toDateString();
      if (routine.lastDoneDate === yesterday) newStreak = routine.streak + 1;
      else if (routine.lastDoneDate !== today) newStreak = 1;
    }
    var newRoutines = routines.map(function(r) {
      if (r.id === routineId) {
        return Object.assign({}, r, { current: newCurrent, streak: newStreak, lastDoneDate: isJustCompleted ? new Date().toDateString() : r.lastDoneDate, history: isJustCompleted ? (r.history || []).concat([{ date: new Date().toISOString(), completed: true }]) : r.history });
      }
      return r;
    });
    setRoutines(newRoutines);
    localStorage.setItem('lifebutler_routines', JSON.stringify(newRoutines));
    if (isJustCompleted) { showAlfredoFeedback('루틴 완료! 👍', 'praise', '🐧'); earnXP(10, '루틴 완료!'); }
  };

  var handleStartFocus = function(task) { setFocusTask(task); setCurrentWorkingTask(task); setView('FOCUS'); };
  var handleFocusComplete = function() {
    if (focusTask) {
      setCurrentWorkingTask(null);
      setAllTasks(allTasks.map(function(t) { return t.id === focusTask.id ? Object.assign({}, t, { status: 'done' }) : t; }));
      handleFocusCompleteWithXP(25);
      handleTaskCompleteWithXP(focusTask, false);
      var remaining = allTasks.filter(function(t) { return t.id !== focusTask.id && t.status !== 'done'; }).sort(function(a,b) { return (b.priorityScore||0) - (a.priorityScore||0); });
      setCompletedTaskInfo({ task: focusTask, nextTask: remaining[0] || null, stats: { focusTime: focusTask.duration || 25, todayCompleted: allTasks.filter(function(t) { return t.status === 'done'; }).length + 1, streak: 1 } });
      setFocusTask(null);
      setView('FOCUS_COMPLETE');
    } else { setView('HOME'); }
  };

  var handleAddTask = function(task) { setAllTasks([task].concat(allTasks)); showToast('새 태스크 추가! ✨'); };
  var handleUpdateTask = function(id, updates) { setAllTasks(allTasks.map(function(t) { return t.id === id ? Object.assign({}, t, updates) : t; })); showToast('태스크 수정! ✏️'); };
  var handleDeleteTask = function(id) { setAllTasks(allTasks.filter(function(t) { return t.id !== id; })); showToast('태스크 삭제 🗑️'); };
  var handleAddTaskFromChat = function(title) { var t = { id: 'task-chat-' + Date.now(), title: title, project: '기타', importance: 'medium', status: 'todo', priorityChange: 'new', priorityScore: 60, deadline: '오늘', duration: 30 }; setAllTasks([t].concat(allTasks)); showToast('할 일 추가! 📋'); };
  var handleConvertToTask = function(item) { var t = { id: 'task-' + item.id, title: item.subject, project: 'Inbox', importance: item.urgent ? 'high' : 'medium', status: 'todo', priorityScore: item.urgent ? 85 : 65, deadline: item.needReplyToday ? '오늘' : '내일', duration: 30 }; setAllTasks([t].concat(allTasks)); setInbox(inbox.filter(function(i) { return i.id !== item.id; })); showToast('Task로 전환! 📋'); };

  var handleAddEvent = function(event) { setAllEvents(allEvents.concat([event])); showToast('일정 추가! 📅'); };
  var handleUpdateEvent = function(id, updates) { setAllEvents(allEvents.map(function(e) { return e.id === id ? Object.assign({}, e, updates) : e; })); showToast('일정 수정! ✏️'); };
  var handleDeleteEvent = function(id) { setAllEvents(allEvents.filter(function(e) { return e.id !== id; })); showToast('일정 삭제 🗑️'); };
  var handleUpdateTaskTime = function(id, time) { setTasks(tasks.map(function(t) { return t.id === id ? Object.assign({}, t, { scheduledTime: time }) : t; })); setAllTasks(allTasks.map(function(t) { return t.id === id ? Object.assign({}, t, { scheduledTime: time }) : t; })); showToast('⏰ ' + time + '에 배정!'); };
  var handleUpdateEventTime = function(id, newTime) {
    setAllEvents(allEvents.map(function(e) {
      if (e.id === id) {
        var parts = (e.start || '09:00').split(':');
        var oldStart = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        var endParts = e.end ? e.end.split(':') : null;
        var oldEnd = endParts ? parseInt(endParts[0]) * 60 + parseInt(endParts[1]) : oldStart + 60;
        var duration = oldEnd - oldStart;
        var newParts = newTime.split(':');
        var newStart = parseInt(newParts[0]) * 60 + parseInt(newParts[1]);
        var newEnd = newStart + duration;
        var newEndH = Math.floor(newEnd / 60);
        var newEndM = newEnd % 60;
        return Object.assign({}, e, { start: newTime, end: (newEndH < 10 ? '0' : '') + newEndH + ':' + (newEndM < 10 ? '0' : '') + newEndM });
      }
      return e;
    }));
    showToast('⏰ ' + newTime + '으로 이동!');
  };
  var handleSyncGoogleEvents = function(googleEvents) {
    setAllEvents(function(prev) {
      var local = prev.filter(function(e) { return !e.fromGoogle; });
      var ids = {};
      local.forEach(function(e) { if (e.googleEventId) ids[e.googleEventId] = true; });
      var newEvents = googleEvents.filter(function(ge) { return !ids[ge.googleEventId]; });
      return local.concat(newEvents);
    });
    showToast('Google Calendar 동기화 완료! 🔄');
  };

  var handleConnect = function(service) { setConnections(function(p) { return Object.assign({}, p, { [service]: true }); }); showToast((service === 'googleCalendar' ? 'Google Calendar' : service) + ' 연결!'); };
  var handleDisconnect = function(service) { setConnections(function(p) { return Object.assign({}, p, { [service]: false }); }); showToast((service === 'googleCalendar' ? 'Google Calendar' : service) + ' 해제'); };

  var handleTimeAlertAction = useCallback(function(action, alert) {
    if (action === 'break') { timeTracking.recordBreak(); setCurrentWorkingTask(null); showToast('☕ 휴식!'); }
    else if (action === 'wrapup') { showToast('🏁 마무리 중!'); }
    else { timeTracking.dismissAlert(alert.id); }
  }, [timeTracking]);

  var handleNotificationAction = useCallback(function(action, notification) {
    if (action.type === 'start-focus' && action.data) { setFocusTask(action.data); setCurrentWorkingTask(action.data); setView('FOCUS'); }
    else if (action.type === 'open-routines') { setShowRoutineManager(true); }
    else if (action.type === 'view-today') { setView('HOME'); }
    smartNotifications.dismissNotification(notification.id);
  }, [smartNotifications]);

  var navItems = [
    { view: 'HOME', icon: Home, label: '홈' },
    { view: 'CALENDAR', icon: Calendar, label: '캘린더' },
    { view: 'WORK', icon: Briefcase, label: '업무' },
    { view: 'LIFE', icon: Heart, label: '일상' },
    { view: 'FOCUS', icon: Zap, label: '집중' }
  ];

  var showNav = ['ONBOARDING', 'CHAT', 'FOCUS', 'FOCUS_COMPLETE', 'SETTINGS'].indexOf(view) === -1;
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';

  return (
    <div className={"w-full h-screen " + bgColor + " overflow-hidden flex flex-col font-sans transition-colors duration-300"}>
      <Toast message={toast.message} visible={toast.visible} darkMode={darkMode} />
      <AlfredoFeedback visible={alfredoFeedback.visible} message={alfredoFeedback.message} type={alfredoFeedback.type} icon={alfredoFeedback.icon} darkMode={darkMode} />

      <div className="flex-1 overflow-hidden relative flex flex-col">
        <OfflineBanner isOffline={isOffline} />
        <DoNotDisturbBanner isActive={doNotDisturb} remainingTime={dndRemainingTime} onDisable={disableDoNotDisturb} />
        <PWAInstallBanner show={showPWAInstall} onInstall={function() { if (window.installPWA) window.installPWA(); setShowPWAInstall(false); }} onDismiss={function() { setShowPWAInstall(false); setPWAInstallDismissed(true); }} />

        {view === 'ONBOARDING' && <Onboarding onComplete={function(d) { setUserData(d); setView('HOME'); }} />}
        {view === 'HOME' && <HomePage onOpenChat={function() { setView('CHAT'); }} onOpenSettings={function() { setView('SETTINGS'); }} onOpenSearch={function() { setShowSearchModal(true); }} onOpenStats={function() { setShowStatsModal(true); }} onOpenWeeklyReview={function() { setView('WEEKLY_REVIEW'); }} onOpenHabitHeatmap={function() { setView('HABIT_HEATMAP'); }} onOpenEnergyRhythm={function() { setView('ENERGY_RHYTHM'); }} onOpenProjectDashboard={function() { setView('PROJECT_DASHBOARD'); }} onOpenDndModal={function() { setShowDndModal(true); }} onOpenNotifications={function() { setShowNotificationCenter(true); }} notificationCount={smartNotifications.notifications.length} doNotDisturb={doNotDisturb} mood={userData.mood} setMood={function(m) { setUserData(Object.assign({}, userData, { mood: m })); }} energy={userData.energy} setEnergy={function(e) { setUserData(Object.assign({}, userData, { energy: e })); }} oneThing={userData.oneThing} tasks={tasks} onToggleTask={handleToggleTask} inbox={inbox} onStartFocus={handleStartFocus} darkMode={darkMode} gameState={gameState} events={allEvents} connections={connections} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onSaveEvent={function(d) { if (d.id) handleUpdateEvent(d.id, d); else handleAddEvent(Object.assign({}, d, { id: 'event-' + Date.now() })); }} onDeleteEvent={handleDeleteEvent} onUpdateTaskTime={handleUpdateTaskTime} onUpdateEventTime={handleUpdateEventTime} routines={routines} onToggleRoutine={handleToggleRoutine} onOpenRoutineManager={function() { setShowRoutineManager(true); }} />}
        {view === 'SETTINGS' && <SettingsPage userData={userData} onUpdateUserData={setUserData} onBack={function() { setView('HOME'); }} darkMode={darkMode} setDarkMode={setDarkMode} onOpenWidgetGallery={function() { setView('WIDGET_GALLERY'); }} connections={connections} onConnect={handleConnect} onDisconnect={handleDisconnect} />}
        {view === 'WIDGET_GALLERY' && <WidgetGallery onBack={function() { setView('SETTINGS'); }} tasks={tasks} events={allEvents} mood={userData.mood} energy={userData.energy} darkMode={darkMode} />}
        {view === 'PROJECT_DASHBOARD' && <ProjectDashboardPage onBack={function() { setView('HOME'); }} projects={mockProjects} allTasks={allTasks} onAddProject={function(){}} onEditProject={function(){}} onDeleteProject={function(){}} darkMode={darkMode} />}
        {view === 'WEEKLY_REVIEW' && <WeeklyReviewPage onBack={function() { setView('HOME'); }} gameState={gameState} allTasks={allTasks} darkMode={darkMode} />}
        {view === 'HABIT_HEATMAP' && <HabitHeatmapPage onBack={function() { setView('HOME'); }} gameState={gameState} darkMode={darkMode} />}
        {view === 'ENERGY_RHYTHM' && <EnergyRhythmPage onBack={function() { setView('HOME'); }} gameState={gameState} userData={userData} darkMode={darkMode} />}
        {view === 'CALENDAR' && <CalendarPage onBack={function() { setView('HOME'); }} tasks={tasks} allTasks={allTasks} events={allEvents} darkMode={darkMode} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} onDeleteEvent={handleDeleteEvent} onUpdateTask={handleUpdateTask} onSyncGoogleEvents={handleSyncGoogleEvents} />}
        {view === 'CHAT' && <AlfredoChat onBack={function() { setChatInitialMessage(null); setView('HOME'); }} tasks={tasks} events={allEvents} mood={userData.mood} energy={userData.energy} onAddTask={handleAddTaskFromChat} onStartFocus={handleStartFocus} initialMessage={chatInitialMessage} />}
        {view === 'WORK' && <WorkPage tasks={allTasks} onToggleTask={handleToggleAllTask} onStartFocus={handleStartFocus} inbox={inbox} onConvertToTask={handleConvertToTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onAddTask={handleAddTask} onOpenChat={function(m) { setChatInitialMessage(m); setView('CHAT'); }} darkMode={darkMode} events={allEvents} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} onDeleteEvent={handleDeleteEvent} />}
        {view === 'FOCUS' && <FocusTimer task={focusTask} onComplete={handleFocusComplete} onExit={function() { setFocusTask(null); setView('HOME'); }} />}
        {view === 'FOCUS_COMPLETE' && completedTaskInfo && <FocusCompletionScreen completedTask={completedTaskInfo.task} nextTask={completedTaskInfo.nextTask} stats={completedTaskInfo.stats} onStartNext={function(t) { setFocusTask(t); setCompletedTaskInfo(null); setView('FOCUS'); }} onGoHome={function() { setCompletedTaskInfo(null); setView('HOME'); showToast('수고했어요! 🎉'); }} />}
        {view === 'LIFE' && <LifePage mood={userData.mood} setMood={function(m) { setUserData(Object.assign({}, userData, { mood: m })); }} energy={userData.energy} setEnergy={function(e) { setUserData(Object.assign({}, userData, { energy: e })); }} onOpenChat={function(m) { setChatInitialMessage(m); setView('CHAT'); }} darkMode={darkMode} />}
      </div>

      {showNav && (
        <div className="fixed bottom-36 right-4 z-30 flex flex-col items-end gap-3">
          <button onClick={function() { setShowNLQuickAdd(true); }} className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200 hover:scale-105 transition-all" title="빠른 추가"><Sparkles size={20} className="text-[#A996FF]" /></button>
          <button onClick={function() { setShowQuickCapture(true); }} className="w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center border border-gray-100 hover:scale-105 transition-all" title="빠른 기록"><Plus size={18} className="text-gray-500" /></button>
          <button onClick={function() { setView('CHAT'); }} className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] shadow-xl flex items-center justify-center ring-4 ring-white/30"><span className="text-2xl">🐧</span></button>
        </div>
      )}

      {showNLQuickAdd && <NaturalLanguageQuickAdd isOpen={showNLQuickAdd} onClose={function() { setShowNLQuickAdd(false); }} onAddTask={function(t) { setTasks([t].concat(tasks)); setAllTasks([t].concat(allTasks)); showToast('✅ 할 일 추가!'); }} onAddEvent={function(e) { setAllEvents([e].concat(allEvents)); showToast('📅 일정 추가!'); }} darkMode={darkMode} />}
      {showQuickCapture && <QuickCaptureModal onClose={function() { setShowQuickCapture(false); }} onAddTask={function(t) { setAllTasks([t].concat(allTasks)); showToast('할 일 추가! ✅'); setShowQuickCapture(false); }} onAddToInbox={function(i) { setInbox([i].concat(inbox)); showToast('인박스 저장! 📥'); setShowQuickCapture(false); }} onOpenMeetingUploader={function() { setShowMeetingUploader(true); }} />}
      {showMeetingUploader && <MeetingUploader onClose={function() { setShowMeetingUploader(false); }} darkMode={darkMode} onAddTasks={function(ts) { setAllTasks(ts.concat(allTasks)); showToast(ts.length + '개 할 일 추가! ✅'); }} onAddEvents={function(es) { showToast(es.length + '개 일정 추가! 📅'); }} onAddToInbox={function(items) { var newItems = items.map(function(i) { return { id: i.id, type: 'idea', subject: i.text, preview: '💡 회의 아이디어', time: '방금', fromMeeting: i.fromMeeting }; }); setInbox(newItems.concat(inbox)); showToast(items.length + '개 아이디어 저장! 💡'); }} />}

      <SearchModal isOpen={showSearchModal} onClose={function() { setShowSearchModal(false); }} tasks={allTasks} events={allEvents} onSelectTask={function() { setView('WORK'); }} onSelectEvent={function() { setView('WORK'); }} />
      <LevelUpModal level={showLevelUp} onClose={function() { setShowLevelUp(null); }} />
      <NewBadgeModal badge={showNewBadge} onClose={function() { setShowNewBadge(null); }} />
      <StatsModal isOpen={showStatsModal} onClose={function() { setShowStatsModal(false); }} gameState={gameState} />
      <DoNotDisturbModal isOpen={showDndModal} onClose={function() { setShowDndModal(false); }} onEnable={enableDoNotDisturb} currentDuration={25} />
      <CompletionCelebration type={celebration.type} data={celebration.data} isVisible={celebration.visible} onClose={function() { setCelebration({ visible: false, type: null, data: null }); }} />
      <LevelUpCelebration isOpen={showLevelUp !== null} level={showLevelUp} onClose={function() { setShowLevelUp(null); }} />
      <RoutineManagerModal isOpen={showRoutineManager} onClose={function() { setShowRoutineManager(false); }} routines={routines} onAddRoutine={handleAddRoutine} onUpdateRoutine={handleUpdateRoutine} onDeleteRoutine={handleDeleteRoutine} onToggleRoutine={handleToggleRoutine} darkMode={darkMode} />

      {!doNotDisturb && view !== 'FOCUS' && <SmartNotificationToast notifications={smartNotifications.notifications} onDismiss={smartNotifications.dismissNotification} onAction={handleNotificationAction} darkMode={darkMode} maxShow={2} />}
      <NotificationCenter isOpen={showNotificationCenter} onClose={function() { setShowNotificationCenter(false); }} notifications={smartNotifications.notifications} onDismiss={smartNotifications.dismissNotification} onDismissAll={smartNotifications.dismissAll} onAction={handleNotificationAction} darkMode={darkMode} />
      {!doNotDisturb && <TimeAlertToast alert={timeTracking.activeAlert} onAction={handleTimeAlertAction} onDismiss={timeTracking.dismissAlert} darkMode={darkMode} />}

      {showNav && (function() {
        var now = new Date();
        var todayStr = now.toISOString().split('T')[0];
        var currentMin = now.getHours() * 60 + now.getMinutes();
        var todayEvents = allEvents.filter(function(e) { return e.date === todayStr && e.start; }).map(function(e) { var p = e.start.split(':'); return Object.assign({}, e, { minutesUntil: (parseInt(p[0]) * 60 + parseInt(p[1])) - currentMin }); }).filter(function(e) { return e.minutesUntil > 0; }).sort(function(a,b) { return a.minutesUntil - b.minutesUntil; });
        var nextEvent = todayEvents[0] ? { title: todayEvents[0].title, start: todayEvents[0].start, minutesUntil: todayEvents[0].minutesUntil } : null;
        var urgentTask = allTasks.find(function(t) { return !t.completed && t.deadline === todayStr; });
        return <AlfredoStatusBar completedTasks={allTasks.filter(function(t) { return t.completed; }).length} totalTasks={allTasks.length} currentTask={focusTask ? focusTask.title : null} nextEvent={nextEvent} urgentTask={urgentTask ? { title: urgentTask.title } : null} energy={userData.energy} mood={userData.mood} taskElapsedMinutes={timeTracking.getElapsedTime()} taskEstimatedMinutes={currentWorkingTask ? (currentWorkingTask.estimatedMinutes || currentWorkingTask.duration || 0) : 0} sessionMinutes={timeTracking.getSessionTime()} onOpenChat={function() { setView('CHAT'); }} darkMode={darkMode} />;
      })()}

      {showNav && (
        <nav className={"h-20 " + (darkMode ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-black/5") + " backdrop-blur-xl border-t flex items-center justify-around px-4 pb-4"}>
          {navItems.map(function(item) {
            return <button key={item.view} onClick={function() { setView(item.view); }} className={"flex flex-col items-center gap-1 px-4 py-2 rounded-xl " + (view === item.view ? "text-[#A996FF] bg-[#A996FF]/10" : darkMode ? "text-gray-500" : "text-gray-400")}>
              <item.icon size={22} strokeWidth={view === item.view ? 2.5 : 2} />
              <span className="text-[11px] font-medium">{item.label}</span>
            </button>;
          })}
        </nav>
      )}
    </div>
  );
}
