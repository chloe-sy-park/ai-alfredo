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

// === Common Components (직접 파일에서 import) ===
import { Button, Card, Toggle, SectionHeader, EmptyState, Modal, PageHeader, ProgressBar, Badge, AlfredoAvatar, Toast, StatusIndicator, DomainBadge } from './components/common/index.jsx';

// === Alfredo Components (직접 파일에서 import) ===
import { TimeAlertToast, AlfredoFeedback, AlfredoStatusBar, AlfredoFloatingBubble } from './components/alfredo/index.jsx';

// === Page Components (직접 파일에서 import - barrel import 사용 안함) ===
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

// === Modal Components (직접 파일에서 import) ===
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

// === Widget Components (직접 파일에서 import) ===
import { QuickConditionTracker, AlfredoBriefing, Big3Widget, UrgentWidget, TimelineWidget, RoutineWidget } from './components/home/widgets.jsx';
import UnifiedTimelineView from './components/home/UnifiedTimelineView';

// === Work Components (직접 파일에서 import) ===
import InboxPage from './components/work/InboxPage';
import SwipeableTaskItem from './components/work/SwipeableTaskItem';
import { Sparkline, PriorityIndicator } from './components/work/TaskWidgets';

// === Home Components (직접 파일에서 import) ===
import AlfredoContextActions from './components/home/AlfredoContextActions';

// === Notification Components (직접 파일에서 import) ===
import { SmartNotificationToast, NotificationCenter, NotificationItem } from './components/notifications/index.jsx';

// === Celebration Components (직접 파일에서 import) ===
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
        console.log('📂 localStorage에서 일정 로드:', parsed.length, '개');
        return parsed;
      }
    } catch (e) {
      console.error('localStorage 읽기 실패:', e);
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
    return saved ? JSON.parse(saved) : mockRoutines.map(function(r) {
      return Object.assign({}, r, {
        repeatType: 'daily',
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        reminder: true,
        history: []
      });
    });
  });
  const [showRoutineManager, setShowRoutineManager] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [currentWorkingTask, setCurrentWorkingTask] = useState(null);
  
  var timeTracking = useTimeTracking(
    currentWorkingTask,
    allEvents,
    function(alertType, data) {
      console.log('Time alert:', alertType, data);
    }
  );
  
  var handleTimeAlertAction = useCallback(function(action, alert) {
    switch (action) {
      case 'break':
        timeTracking.recordBreak();
        setCurrentWorkingTask(null);
        showToast('☕ 휴식 시간! 5분 후에 다시 시작해요.');
        break;
      case 'wrapup':
        showToast('🏁 마무리 중! 곧 다음 일정으로 이동하세요.');
        break;
      default:
        timeTracking.dismissAlert(alert.id);
    }
  }, [timeTracking]);
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [pwaInstallDismissed, setPWAInstallDismissed] = useState(false);
  
  var smartNotifications = useSmartNotifications({
    tasks: allTasks,
    events: allEvents,
    routines: routines,
    energy: userData.energy || 70
  });
  
  var handleNotificationAction = useCallback(function(action, notification) {
    switch (action.type) {
      case 'start-focus':
        if (action.data) {
          setFocusTask(action.data);
          setCurrentWorkingTask(action.data);
          setView('FOCUS');
        }
        break;
      case 'open-routines':
        setShowRoutineManager(true);
        break;
      case 'view-event':
        showToast('📅 ' + (action.data && action.data.title ? action.data.title : '일정') + ' 확인');
        break;
      case 'view-today':
        setView('HOME');
        break;
      case 'break':
        setView('CHAT');
        setChatInitialMessage({ type: 'break', message: '5분 휴식 타이머 시작해줘' });
        break;
      default:
        break;
    }
    smartNotifications.dismissNotification(notification.id);
  }, [smartNotifications]);
  
  useEffect(function() {
    if (allEvents && allEvents.length > 0) {
      localStorage.setItem('allEvents', JSON.stringify(allEvents));
      console.log('💾 allEvents 저장:', allEvents.length, '개');
    }
  }, [allEvents]);
  
  useEffect(function() {
    var handleOnline = function() { setIsOffline(false); };
    var handleOffline = function() { setIsOffline(true); };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    var handleInstallable = function() {
      if (!pwaInstallDismissed) {
        setTimeout(function() { setShowPWAInstall(true); }, 3000);
      }
    };
    
    window.addEventListener('pwa-installable', handleInstallable);
    
    return function() {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-installable', handleInstallable);
    };
  }, [pwaInstallDismissed]);
  
  var handlePWAInstall = function() {
    if (window.installPWA) {
      window.installPWA().then(function(result) {
        if (result) {
          showToast('🎉 앱이 설치되었어요!');
        }
      });
    }
    setShowPWAInstall(false);
  };
  
  var handlePWADismiss = function() {
    setShowPWAInstall(false);
    setPWAInstallDismissed(true);
  };
  
  const [connections, setConnections] = useState({
    googleCalendar: true,
    gmail: true,
    notion: false,
    slack: false
  });
  
  var STORAGE_KEYS = {
    userData: 'lifebutler_userData',
    tasks: 'lifebutler_tasks',
    allTasks: 'lifebutler_allTasks',
    allEvents: 'lifebutler_allEvents',
    inbox: 'lifebutler_inbox',
    darkMode: 'lifebutler_darkMode',
    view: 'lifebutler_view',
    gameState: 'lifebutler_gameState',
    connections: 'lifebutler_connections'
  };
  
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
      if (savedView && ['ONBOARDING', 'FOCUS', 'FOCUS_COMPLETE'].indexOf(savedView) === -1) {
        setView(savedView);
      }
    } catch (e) {
      console.error('로컬 저장소 로드 실패:', e);
    }
    setIsInitialized(true);
  }, []);
  
  useEffect(function() {
    if (!doNotDisturb || !dndEndTime) return;
    
    var timer = setInterval(function() {
      var now = Date.now();
      var remaining = Math.max(0, Math.floor((dndEndTime - now) / 1000));
      
      if (remaining <= 0) {
        setDoNotDisturb(false);
        setDndEndTime(null);
        setDndRemainingTime(null);
      } else {
        setDndRemainingTime(remaining);
      }
    }, 1000);
    
    return function() { clearInterval(timer); };
  }, [doNotDisturb, dndEndTime]);
  
  var enableDoNotDisturb = function(durationMinutes) {
    setDoNotDisturb(true);
    if (durationMinutes === -1) {
      setDndEndTime(null);
      setDndRemainingTime(null);
    } else {
      var endTime = Date.now() + durationMinutes * 60 * 1000;
      setDndEndTime(endTime);
      setDndRemainingTime(durationMinutes * 60);
    }
  };
  
  var disableDoNotDisturb = function() {
    setDoNotDisturb(false);
    setDndEndTime(null);
    setDndRemainingTime(null);
  };
  
  useEffect(function() {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify(userData)); } catch (e) {}
  }, [userData, isInitialized]);
  
  useEffect(function() {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks)); } catch (e) {}
  }, [tasks, isInitialized]);
  
  useEffect(function() {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.allTasks, JSON.stringify(allTasks)); } catch (e) {}
  }, [allTasks, isInitialized]);
  
  useEffect(function() {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.allEvents, JSON.stringify(allEvents)); } catch (e) {}
  }, [allEvents, isInitialized]);
  
  useEffect(function() {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.inbox, JSON.stringify(inbox)); } catch (e) {}
  }, [inbox, isInitialized]);
  
  useEffect(function() {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.darkMode, JSON.stringify(darkMode)); } catch (e) {}
  }, [darkMode, isInitialized]);
  
  useEffect(function() {
    if (!isInitialized) return;
    if (['ONBOARDING', 'FOCUS', 'FOCUS_COMPLETE'].indexOf(view) === -1) {
      try { localStorage.setItem(STORAGE_KEYS.view, view); } catch (e) {}
    }
  }, [view, isInitialized]);
  
  useEffect(function() {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.gameState, JSON.stringify(gameState)); } catch (e) {}
  }, [gameState, isInitialized]);
  
  useEffect(function() {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.connections, JSON.stringify(connections)); } catch (e) {}
  }, [connections, isInitialized]);
  
  var handleConnect = function(service) {
    setConnections(function(prev) { return Object.assign({}, prev, { [service]: true }); });
    var name = service === 'googleCalendar' ? 'Google Calendar' : service === 'gmail' ? 'Gmail' : service;
    showToast(name + ' 연결 완료! 🎉');
  };
  
  var handleDisconnect = function(service) {
    setConnections(function(prev) { return Object.assign({}, prev, { [service]: false }); });
    var name = service === 'googleCalendar' ? 'Google Calendar' : service === 'gmail' ? 'Gmail' : service;
    showToast(name + ' 연결 해제됨');
  };
  
  var earnXP = function(amount, reason) {
    var oldLevel = LEVEL_CONFIG.getLevel(gameState.totalXP).level;
    var newTotalXP = gameState.totalXP + amount;
    var newLevelInfo = LEVEL_CONFIG.getLevel(newTotalXP);
    
    var dayOfWeek = new Date().getDay();
    var newWeeklyXP = gameState.weeklyXP.slice();
    newWeeklyXP[dayOfWeek] += amount;
    
    setGameState(function(prev) {
      return Object.assign({}, prev, {
        totalXP: newTotalXP,
        todayXP: prev.todayXP + amount,
        weeklyXP: newWeeklyXP
      });
    });
    
    if (newLevelInfo.level > oldLevel) {
      setTimeout(function() { setShowLevelUp(newLevelInfo.level); }, 500);
    }
    
    showToast('+' + amount + ' XP! ' + reason);
  };
  
  var checkBadges = function(stats) {
    var newBadges = [];
    BADGES.forEach(function(badge) {
      if (gameState.unlockedBadges.indexOf(badge.id) === -1 && badge.condition(stats)) {
        newBadges.push(badge);
      }
    });
    
    if (newBadges.length > 0) {
      setGameState(function(prev) {
        return Object.assign({}, prev, {
          unlockedBadges: prev.unlockedBadges.concat(newBadges.map(function(b) { return b.id; }))
        });
      });
      setTimeout(function() { setShowNewBadge(newBadges[0]); }, 1000);
    }
  };
  
  var handleTaskCompleteWithXP = function(task, isBig3) {
    if (isBig3 === undefined) isBig3 = false;
    var hour = new Date().getHours();
    var xpEarned = task.importance === 'high' ? XP_REWARDS.taskCompleteHigh : XP_REWARDS.taskComplete;
    
    if (isBig3) xpEarned += XP_REWARDS.big3Complete;
    if (hour < 12 && isBig3) xpEarned += 20;
    
    var completedToday = gameState.todayTasks + 1;
    var big3Done = tasks.filter(function(t) { return t.status === 'done'; }).length + (isBig3 ? 1 : 0);
    var big3Total = tasks.length;
    
    var celebrationMsg = '';
    if (isBig3 && big3Done === big3Total) {
      celebrationMsg = '🎉 Big3 올클리어! 대단해요!';
    } else if (isBig3 && big3Done === big3Total - 1) {
      celebrationMsg = '🔥 Big3 마지막 하나만 남았어요!';
    } else if (completedToday === 1) {
      celebrationMsg = '⭐ 오늘의 첫 완료! 좋은 시작이에요!';
    } else if (completedToday === 5) {
      celebrationMsg = '💪 벌써 5개째! 달리고 있네요!';
    } else if (completedToday >= 10) {
      celebrationMsg = '🚀 10개 돌파! 오늘 진짜 열일 중!';
    } else if (hour < 9) {
      celebrationMsg = '🌅 아침부터 멋져요!';
    } else {
      celebrationMsg = isBig3 ? 'Big3 완료!' : '태스크 완료!';
    }
    
    earnXP(xpEarned, celebrationMsg);
    
    var newStats = Object.assign({}, gameState, {
      totalCompleted: gameState.totalCompleted + 1,
      todayTasks: gameState.todayTasks + 1,
      level: LEVEL_CONFIG.getLevel(gameState.totalXP + xpEarned).level
    });
    
    if (isBig3) newStats.big3Completed = gameState.big3Completed + 1;
    if (hour < 9) newStats.earlyBirdCount = gameState.earlyBirdCount + 1;
    if (hour >= 22) newStats.nightOwlCount = gameState.nightOwlCount + 1;
    
    setGameState(function(prev) {
      return Object.assign({}, prev, {
        totalCompleted: newStats.totalCompleted,
        todayTasks: newStats.todayTasks,
        big3Completed: newStats.big3Completed || prev.big3Completed,
        earlyBirdCount: newStats.earlyBirdCount || prev.earlyBirdCount,
        nightOwlCount: newStats.nightOwlCount || prev.nightOwlCount
      });
    });
    
    checkBadges(newStats);
  };
  
  var handleFocusCompleteWithXP = function(minutes) {
    earnXP(XP_REWARDS.focusSession, '집중 세션 완료!');
    
    var newStats = Object.assign({}, gameState, {
      focusSessions: gameState.focusSessions + 1,
      focusMinutes: gameState.focusMinutes + minutes,
      level: LEVEL_CONFIG.getLevel(gameState.totalXP + XP_REWARDS.focusSession).level
    });
    
    setGameState(function(prev) {
      return Object.assign({}, prev, {
        focusSessions: newStats.focusSessions,
        focusMinutes: newStats.focusMinutes
      });
    });
    
    checkBadges(newStats);
  };
  
  useEffect(function() {
    var handleKeyDown = function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
      if (e.key === 'Escape') setShowSearchModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return function() { window.removeEventListener('keydown', handleKeyDown); };
  }, []);
  
  var navItems = [
    { view: 'HOME', icon: Home, label: '홈' },
    { view: 'CALENDAR', icon: Calendar, label: '캘린더' },
    { view: 'WORK', icon: Briefcase, label: '업무' },
    { view: 'LIFE', icon: Heart, label: '일상' },
    { view: 'FOCUS', icon: Zap, label: '집중' }
  ];
  
  var showNav = ['ONBOARDING', 'CHAT', 'FOCUS', 'FOCUS_COMPLETE', 'SETTINGS'].indexOf(view) === -1;
  
  var handleOnboardingComplete = function(data) {
    setUserData(data);
    setView('HOME');
  };
  
  var showToast = function(message) {
    setToast({ visible: true, message: message });
    setTimeout(function() { setToast({ visible: false, message: '' }); }, 2500);
  };
  
  var showAlfredoFeedback = function(message, type, icon) {
    if (type === undefined) type = 'praise';
    if (icon === undefined) icon = '🐧';
    setAlfredoFeedback({ visible: true, message: message, type: type, icon: icon });
    setTimeout(function() { setAlfredoFeedback({ visible: false, message: '', type: 'praise', icon: '🐧' }); }, 3000);
  };
  
  var getTaskCompleteFeedback = function(task, completedCount, totalCount, isStreak) {
    if (isStreak === undefined) isStreak = false;
    if (completedCount === totalCount && totalCount > 0) {
      var messages = [
        { msg: "완벽해요! 오늘 할 일 끝!", icon: "🎉" },
        { msg: "대단해요! 다 끝냈어요!", icon: "✨" },
        { msg: "오늘의 영웅이에요!", icon: "🏆" }
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    if (isStreak && completedCount >= 3) {
      var msgs = [
        { msg: completedCount + "연속! 흐름 좋아요!", icon: "🔥" },
        { msg: "연속 " + completedCount + "개! 멈추지 마요!", icon: "⚡" },
        { msg: completedCount + "연타! 달리고 있어요!", icon: "🚀" }
      ];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
    if (completedCount === totalCount - 1 && totalCount > 1) {
      var msgs2 = [
        { msg: "마지막 하나! 거의 다 왔어요!", icon: "🏁" },
        { msg: "하나 남았어요! 조금만 더!", icon: "💪" },
        { msg: "끝이 보여요! 파이팅!", icon: "✨" }
      ];
      return msgs2[Math.floor(Math.random() * msgs2.length)];
    }
    if (completedCount === Math.ceil(totalCount / 2)) {
      var msgs3 = [
        { msg: "절반 왔어요! 잘하고 있어요!", icon: "👏" },
        { msg: "반 넘었어요! 이 페이스 좋아요!", icon: "🎯" }
      ];
      return msgs3[Math.floor(Math.random() * msgs3.length)];
    }
    if (completedCount === 1) {
      var msgs4 = [
        { msg: "첫 번째 완료! 시작이 반이에요!", icon: "🌟" },
        { msg: "좋은 시작이에요! 계속 가요!", icon: "👍" },
        { msg: "하나 끝! 멋진 출발이에요!", icon: "✨" }
      ];
      return msgs4[Math.floor(Math.random() * msgs4.length)];
    }
    var defaultMsgs = [
      { msg: "잘했어요! 👏", icon: "🐧" },
      { msg: "멋져요! 다음은 뭐 할까요?", icon: "✨" },
      { msg: "해냈네요! 💪", icon: "🐧" },
      { msg: "역시 Boss!", icon: "👑" },
      { msg: "Good job!", icon: "👍" }
    ];
    return defaultMsgs[Math.floor(Math.random() * defaultMsgs.length)];
  };
  
  var handleToggleTask = function(taskId) {
    var task = tasks.find(function(t) { return t.id === taskId; });
    var isCompleting = task && task.status !== 'done';
    
    var newTasks = tasks.map(function(t) {
      if (t.id === taskId) {
        return Object.assign({}, t, { status: t.status === 'done' ? 'todo' : 'done' });
      }
      return t;
    });
    setTasks(newTasks);
    
    if (isCompleting && task) {
      handleTaskCompleteWithXP(task, true);
      var completedCount = newTasks.filter(function(t) { return t.status === 'done'; }).length;
      var totalCount = newTasks.length;
      var isAllComplete = completedCount === totalCount;
      
      var now = Date.now();
      var streakTimeout = 5 * 60 * 1000;
      var newStreak = 1;
      if (lastCompletionTime && (now - lastCompletionTime) < streakTimeout) newStreak = completionStreak + 1;
      setCompletionStreak(newStreak);
      setLastCompletionTime(now);
      
      var feedback = getTaskCompleteFeedback(task, completedCount, totalCount, newStreak >= 3);
      showAlfredoFeedback(feedback.msg, 'praise', feedback.icon);
      
      var celebrationType = isAllComplete ? 'big3' : newStreak >= 3 ? 'streak' : 'task';
      var xpAmount = task.importance === 'high' ? 20 : task.importance === 'medium' ? 15 : 10;
      
      setCelebration({ visible: true, type: celebrationType, data: { xp: xpAmount, streak: newStreak, taskTitle: task.title, completedCount: completedCount, totalCount: totalCount } });
      
      if (isAllComplete) earnXP(XP_REWARDS.allBig3Complete, '🎉 Big3 전체 완료 보너스!');
    }
  };
  
  var handleToggleAllTask = function(taskId) {
    var task = allTasks.find(function(t) { return t.id === taskId; });
    var isCompleting = task && task.status !== 'done';
    
    var newTasks = allTasks.map(function(t) {
      if (t.id === taskId) {
        return Object.assign({}, t, { status: t.status === 'done' ? 'todo' : 'done' });
      }
      return t;
    });
    setAllTasks(newTasks);
    
    if (isCompleting && task) {
      handleTaskCompleteWithXP(task, false);
      var completedCount = newTasks.filter(function(t) { return t.status === 'done'; }).length;
      
      var now = Date.now();
      var streakTimeout = 5 * 60 * 1000;
      var newStreak = 1;
      if (lastCompletionTime && (now - lastCompletionTime) < streakTimeout) newStreak = completionStreak + 1;
      setCompletionStreak(newStreak);
      setLastCompletionTime(now);
      
      var feedback = getTaskCompleteFeedback(task, completedCount, newTasks.length, newStreak >= 3);
      showAlfredoFeedback(feedback.msg, 'praise', feedback.icon);
      
      var xpAmount = task.importance === 'high' ? 15 : 10;
      setCelebration({ visible: true, type: newStreak >= 3 ? 'streak' : 'task', data: { xp: xpAmount, streak: newStreak, taskTitle: task.title, completedCount: completedCount, totalCount: newTasks.length } });
    }
  };
  
  var handleAddRoutine = function(routine) {
    var newRoutines = routines.concat([routine]);
    setRoutines(newRoutines);
    localStorage.setItem('lifebutler_routines', JSON.stringify(newRoutines));
    showToast('🔄 새 루틴이 추가되었어요!');
  };
  
  var handleUpdateRoutine = function(updatedRoutine) {
    var newRoutines = routines.map(function(r) { return r.id === updatedRoutine.id ? updatedRoutine : r; });
    setRoutines(newRoutines);
    localStorage.setItem('lifebutler_routines', JSON.stringify(newRoutines));
    showToast('✅ 루틴이 수정되었어요!');
  };
  
  var handleDeleteRoutine = function(routineId) {
    var newRoutines = routines.filter(function(r) { return r.id !== routineId; });
    setRoutines(newRoutines);
    localStorage.setItem('lifebutler_routines', JSON.stringify(newRoutines));
    showToast('🗑️ 루틴이 삭제되었어요.');
  };
  
  var handleToggleRoutine = function(routineId) {
    var routine = routines.find(function(r) { return r.id === routineId; });
    if (!routine) return;
    
    var newCurrent = routine.current < routine.target ? routine.current + 1 : 0;
    var isJustCompleted = newCurrent >= routine.target && routine.current < routine.target;
    
    var newStreak = routine.streak;
    if (isJustCompleted) {
      var today = new Date().toDateString();
      var lastDone = routine.lastDoneDate;
      var yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastDone === yesterday) newStreak = routine.streak + 1;
      else if (lastDone !== today) newStreak = 1;
    }
    
    var newRoutines = routines.map(function(r) {
      if (r.id === routineId) {
        var newHistory = isJustCompleted ? (r.history || []).concat([{ date: new Date().toISOString(), completed: true }]) : r.history;
        return Object.assign({}, r, {
          current: newCurrent,
          streak: newStreak,
          lastDoneDate: isJustCompleted ? new Date().toDateString() : r.lastDoneDate,
          history: newHistory
        });
      }
      return r;
    });
    setRoutines(newRoutines);
    localStorage.setItem('lifebutler_routines', JSON.stringify(newRoutines));
    
    if (isJustCompleted) {
      var allDone = newRoutines.filter(function(r) { return r.current >= r.target; }).length === newRoutines.length;
      if (allDone) {
        showAlfredoFeedback('오늘 루틴 올클리어! 🎉', 'praise', '🏆');
        setCelebration({ visible: true, type: 'all', data: { xp: 30, streak: newStreak } });
      } else if (newStreak >= 7) {
        showAlfredoFeedback(newStreak + '일 연속! 습관이 되어가고 있어요! 🔥', 'praise', '🔥');
      } else if (newStreak >= 3) {
        showAlfredoFeedback(newStreak + '일째 연속 완료! 👏', 'praise', '✨');
      } else {
        showAlfredoFeedback('루틴 완료! 잘하고 있어요 👍', 'praise', '🐧');
      }
      earnXP(10, '루틴 완료!');
    }
  };
  
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
  
  var handleOpenChatWithMessage = function(messageData) {
    setChatInitialMessage(messageData);
    setView('CHAT');
  };
  
  var handleStartFocus = function(task) {
    setFocusTask(task);
    setCurrentWorkingTask(task);
    setView('FOCUS');
  };
  
  var handleFocusComplete = function() {
    if (focusTask) {
      setCurrentWorkingTask(null);
      setAllTasks(allTasks.map(function(t) { return t.id === focusTask.id ? Object.assign({}, t, { status: 'done' }) : t; }));
      handleFocusCompleteWithXP(25);
      handleTaskCompleteWithXP(focusTask, false);
      var todayCompleted = allTasks.filter(function(t) { return t.status === 'done'; }).length + 1;
      var remainingTasks = allTasks.filter(function(t) { return t.id !== focusTask.id && t.status !== 'done'; }).sort(function(a, b) { return (b.priorityScore || 0) - (a.priorityScore || 0); });
      var nextTask = remainingTasks[0] || null;
      setCompletedTaskInfo({ task: focusTask, nextTask: nextTask, stats: { focusTime: focusTask.duration || 25, todayCompleted: todayCompleted, streak: mockCompletedHistory.stats.streak } });
      setFocusTask(null);
      setView('FOCUS_COMPLETE');
    } else {
      setView('HOME');
    }
  };
  
  var handleStartNextFromCompletion = function(task) {
    setFocusTask(task);
    setCompletedTaskInfo(null);
    setView('FOCUS');
  };
  
  var handleGoHomeFromCompletion = function() {
    setCompletedTaskInfo(null);
    setView('HOME');
    showToast('수고했어요! 🎉');
  };
  
  var handleConvertToTask = function(item) {
    var newTask = { id: 'task-' + item.id, title: item.subject, project: 'Inbox', importance: item.urgent ? 'high' : 'medium', status: 'todo', priorityChange: 'new', priorityScore: item.urgent ? 85 : 65, priorityReason: 'Inbox에서 변환됨', sparkline: [0, 0, 30, 60, item.urgent ? 85 : 65], deadline: item.needReplyToday ? '오늘' : '내일', duration: 30 };
    setAllTasks([newTask].concat(allTasks));
    setInbox(inbox.filter(function(i) { return i.id !== item.id; }));
    showToast('Task로 전환했어요! 📋');
  };
  
  var handleAddTask = function(task) {
    setAllTasks([task].concat(allTasks));
    showToast('새 태스크가 추가되었어요! ✨');
  };
  
  var handleUpdateTask = function(taskId, updates) {
    setAllTasks(allTasks.map(function(t) {
      if (t.id === taskId) {
        return Object.assign({}, t, updates, { priorityScore: updates.importance === 'high' ? 85 : updates.importance === 'medium' ? 65 : 45 });
      }
      return t;
    }));
    showToast('태스크가 수정되었어요! ✏️');
  };
  
  var handleDeleteTask = function(taskId) {
    setAllTasks(allTasks.filter(function(t) { return t.id !== taskId; }));
    showToast('태스크가 삭제되었어요 🗑️');
  };
  
  var handleAddTaskFromChat = function(title) {
    var newTask = { id: 'task-chat-' + Date.now(), title: title, project: '기타', importance: 'medium', status: 'todo', priorityChange: 'new', priorityScore: 60, priorityReason: '채팅에서 추가됨', sparkline: [0, 0, 30, 50, 60], deadline: '오늘', duration: 30 };
    setAllTasks([newTask].concat(allTasks));
    showToast('할 일 추가했어요! 📋');
  };
  
  var handleAddEvent = function(event) {
    setAllEvents(allEvents.concat([event]));
    showToast('일정이 추가되었어요! 📅');
  };
  
  var handleUpdateEvent = function(eventId, updates) {
    setAllEvents(allEvents.map(function(e) { return e.id === eventId ? Object.assign({}, e, updates) : e; }));
    showToast('일정이 수정되었어요! ✏️');
  };
  
  var handleDeleteEvent = function(eventId) {
    setAllEvents(allEvents.filter(function(e) { return e.id !== eventId; }));
    showToast('일정이 삭제되었어요 🗑️');
  };
  
  var handleUpdateTaskTime = function(taskId, newTime) {
    setTasks(tasks.map(function(t) { return t.id === taskId ? Object.assign({}, t, { scheduledTime: newTime }) : t; }));
    setAllTasks(allTasks.map(function(t) { return t.id === taskId ? Object.assign({}, t, { scheduledTime: newTime }) : t; }));
    showToast('⏰ ' + newTime + '에 배정했어요!');
  };
  
  var handleUpdateEventTime = function(eventId, newTime) {
    setAllEvents(allEvents.map(function(e) {
      if (e.id === eventId) {
        var startParts = (e.start || '09:00').split(':');
        var oldH = parseInt(startParts[0], 10);
        var oldM = parseInt(startParts[1], 10);
        var newParts = newTime.split(':');
        var newH = parseInt(newParts[0], 10);
        var newM = parseInt(newParts[1], 10);
        var oldStartMin = oldH * 60 + oldM;
        var oldEndMin = oldStartMin + 60;
        if (e.end) {
          var endParts = e.end.split(':');
          oldEndMin = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);
        }
        var duration = oldEndMin - oldStartMin;
        var newStartMin = newH * 60 + newM;
        var newEndMin = newStartMin + duration;
        var newEndH = Math.floor(newEndMin / 60);
        var newEndM = newEndMin % 60;
        var newEnd = (newEndH < 10 ? '0' : '') + newEndH + ':' + (newEndM < 10 ? '0' : '') + newEndM;
        return Object.assign({}, e, { start: newTime, end: newEnd });
      }
      return e;
    }));
    showToast('⏰ ' + newTime + '으로 이동했어요!');
  };
  
  var handleSyncGoogleEvents = function(googleEvents) {
    console.log('📥 handleSyncGoogleEvents 호출됨!');
    console.log('📊 받은 일정 수:', googleEvents.length);
    setAllEvents(function(prev) {
      var localEvents = prev.filter(function(e) { return !e.fromGoogle; });
      var localGoogleIds = {};
      localEvents.forEach(function(e) { if (e.googleEventId) localGoogleIds[e.googleEventId] = true; });
      var newGoogleEvents = googleEvents.filter(function(ge) { return !localGoogleIds[ge.googleEventId]; });
      return localEvents.concat(newGoogleEvents);
    });
    showToast('Google Calendar 동기화 완료! 🔄');
  };
  
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  
  return React.createElement('div', { className: 'w-full h-screen ' + bgColor + ' overflow-hidden flex flex-col font-sans transition-colors duration-300' },
    React.createElement(Toast, { message: toast.message, visible: toast.visible, darkMode: darkMode }),
    React.createElement(AlfredoFeedback, { visible: alfredoFeedback.visible, message: alfredoFeedback.message, type: alfredoFeedback.type, icon: alfredoFeedback.icon, darkMode: darkMode }),
    
    React.createElement('div', { className: 'flex-1 overflow-hidden relative flex flex-col' },
      React.createElement(OfflineBanner, { isOffline: isOffline }),
      React.createElement(DoNotDisturbBanner, { isActive: doNotDisturb, remainingTime: dndRemainingTime, onDisable: disableDoNotDisturb }),
      React.createElement(PWAInstallBanner, { show: showPWAInstall, onInstall: handlePWAInstall, onDismiss: handlePWADismiss }),
      
      view === 'ONBOARDING' && React.createElement(Onboarding, { onComplete: handleOnboardingComplete }),
      view === 'HOME' && React.createElement(HomePage, { 
        onOpenChat: function() { setView('CHAT'); },
        onOpenSettings: function() { setView('SETTINGS'); },
        onOpenSearch: function() { setShowSearchModal(true); },
        onOpenStats: function() { setShowStatsModal(true); },
        onOpenWeeklyReview: function() { setView('WEEKLY_REVIEW'); },
        onOpenHabitHeatmap: function() { setView('HABIT_HEATMAP'); },
        onOpenEnergyRhythm: function() { setView('ENERGY_RHYTHM'); },
        onOpenProjectDashboard: function() { setView('PROJECT_DASHBOARD'); },
        onOpenDndModal: function() { setShowDndModal(true); },
        onOpenNotifications: function() { setShowNotificationCenter(true); },
        notificationCount: smartNotifications.notifications.length,
        doNotDisturb: doNotDisturb,
        mood: userData.mood,
        setMood: function(m) { setUserData(Object.assign({}, userData, { mood: m })); },
        energy: userData.energy,
        setEnergy: function(e) { setUserData(Object.assign({}, userData, { energy: e })); },
        oneThing: userData.oneThing,
        tasks: tasks,
        onToggleTask: handleToggleTask,
        inbox: inbox,
        onStartFocus: handleStartFocus,
        darkMode: darkMode,
        gameState: gameState,
        events: allEvents,
        connections: connections,
        onUpdateTask: handleUpdateTask,
        onDeleteTask: handleDeleteTask,
        onSaveEvent: function(eventData) { if (eventData.id) { handleUpdateEvent(eventData.id, eventData); } else { handleAddEvent(Object.assign({}, eventData, { id: 'event-' + Date.now() })); } },
        onDeleteEvent: handleDeleteEvent,
        onUpdateTaskTime: handleUpdateTaskTime,
        onUpdateEventTime: handleUpdateEventTime,
        routines: routines,
        onToggleRoutine: handleToggleRoutine,
        onOpenRoutineManager: function() { setShowRoutineManager(true); }
      }),
      view === 'SETTINGS' && React.createElement(SettingsPage, { userData: userData, onUpdateUserData: setUserData, onBack: function() { setView('HOME'); }, darkMode: darkMode, setDarkMode: setDarkMode, onOpenWidgetGallery: function() { setView('WIDGET_GALLERY'); }, connections: connections, onConnect: handleConnect, onDisconnect: handleDisconnect }),
      view === 'WIDGET_GALLERY' && React.createElement(WidgetGallery, { onBack: function() { setView('SETTINGS'); }, tasks: tasks, events: allEvents, mood: userData.mood, energy: userData.energy, darkMode: darkMode }),
      view === 'PROJECT_DASHBOARD' && React.createElement(ProjectDashboardPage, { onBack: function() { setView('HOME'); }, projects: mockProjects, allTasks: allTasks, onAddProject: function() {}, onEditProject: function() {}, onDeleteProject: function() {}, darkMode: darkMode }),
      view === 'WEEKLY_REVIEW' && React.createElement(WeeklyReviewPage, { onBack: function() { setView('HOME'); }, gameState: gameState, allTasks: allTasks, darkMode: darkMode }),
      view === 'HABIT_HEATMAP' && React.createElement(HabitHeatmapPage, { onBack: function() { setView('HOME'); }, gameState: gameState, darkMode: darkMode }),
      view === 'ENERGY_RHYTHM' && React.createElement(EnergyRhythmPage, { onBack: function() { setView('HOME'); }, gameState: gameState, userData: userData, darkMode: darkMode }),
      view === 'CALENDAR' && React.createElement(CalendarPage, { onBack: function() { setView('HOME'); }, tasks: tasks, allTasks: allTasks, events: allEvents, darkMode: darkMode, onAddEvent: handleAddEvent, onUpdateEvent: handleUpdateEvent, onDeleteEvent: handleDeleteEvent, onUpdateTask: handleUpdateTask, onSyncGoogleEvents: handleSyncGoogleEvents }),
      view === 'CHAT' && React.createElement(AlfredoChat, { onBack: function() { setChatInitialMessage(null); setView('HOME'); }, tasks: tasks, events: allEvents, mood: userData.mood, energy: userData.energy, onAddTask: handleAddTaskFromChat, onStartFocus: handleStartFocus, initialMessage: chatInitialMessage }),
      view === 'WORK' && React.createElement(WorkPage, { tasks: allTasks, onToggleTask: handleToggleAllTask, onStartFocus: handleStartFocus, inbox: inbox, onConvertToTask: handleConvertToTask, onUpdateTask: handleUpdateTask, onDeleteTask: handleDeleteTask, onAddTask: handleAddTask, onOpenChat: handleOpenChatWithMessage, darkMode: darkMode, events: allEvents, onAddEvent: handleAddEvent, onUpdateEvent: handleUpdateEvent, onDeleteEvent: handleDeleteEvent }),
      view === 'FOCUS' && React.createElement(FocusTimer, { task: focusTask, onComplete: handleFocusComplete, onExit: function() { setFocusTask(null); setView('HOME'); } }),
      view === 'FOCUS_COMPLETE' && completedTaskInfo && React.createElement(FocusCompletionScreen, { completedTask: completedTaskInfo.task, nextTask: completedTaskInfo.nextTask, stats: completedTaskInfo.stats, onStartNext: handleStartNextFromCompletion, onGoHome: handleGoHomeFromCompletion }),
      view === 'LIFE' && React.createElement(LifePage, { mood: userData.mood, setMood: function(m) { setUserData(Object.assign({}, userData, { mood: m })); }, energy: userData.energy, setEnergy: function(e) { setUserData(Object.assign({}, userData, { energy: e })); }, onOpenChat: handleOpenChatWithMessage, darkMode: darkMode })
    ),
    
    showNav && React.createElement('div', { className: 'fixed bottom-36 right-4 z-30 flex flex-col items-end gap-3' },
      React.createElement('button', { onClick: function() { setShowNLQuickAdd(true); }, className: 'w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200 hover:scale-105 transition-all group', title: '빠른 추가 (자연어)' },
        React.createElement(Sparkles, { size: 20, className: 'text-[#A996FF] group-hover:text-[#8B7CF7] transition-colors' })
      ),
      React.createElement('button', { onClick: function() { setShowQuickCapture(true); }, className: 'w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center border border-gray-100 hover:scale-105 transition-all', title: '빠른 기록' },
        React.createElement(Plus, { size: 18, className: 'text-gray-500' })
      ),
      React.createElement('button', { onClick: function() { setView('CHAT'); }, className: 'w-14 h-14 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] shadow-xl shadow-[#A996FF]/30 flex items-center justify-center ring-4 ring-white/30' },
        React.createElement('span', { className: 'text-2xl' }, '🐧')
      )
    ),
    
    showNLQuickAdd && React.createElement(NaturalLanguageQuickAdd, { isOpen: showNLQuickAdd, onClose: function() { setShowNLQuickAdd(false); }, onAddTask: function(task) { setTasks([task].concat(tasks)); setAllTasks([task].concat(allTasks)); showToast('✅ 할 일이 추가되었어요!'); }, onAddEvent: function(event) { setAllEvents([event].concat(allEvents)); showToast('📅 일정이 추가되었어요!'); }, darkMode: darkMode }),
    
    showQuickCapture && React.createElement(QuickCaptureModal, { onClose: function() { setShowQuickCapture(false); }, onAddTask: function(task) { setAllTasks([task].concat(allTasks)); showToast('할 일이 추가되었어요! ✅'); setShowQuickCapture(false); }, onAddToInbox: function(item) { setInbox([item].concat(inbox)); showToast('인박스에 저장했어요! 📥'); setShowQuickCapture(false); }, onOpenMeetingUploader: function() { setShowMeetingUploader(true); } }),
    
    showMeetingUploader && React.createElement(MeetingUploader, { onClose: function() { setShowMeetingUploader(false); }, darkMode: darkMode, onAddTasks: function(newTasks) { setAllTasks(newTasks.concat(allTasks)); showToast(newTasks.length + '개 할 일이 추가되었어요! ✅'); }, onAddEvents: function(events) { showToast(events.length + '개 일정이 추가되었어요! 📅'); }, onAddToInbox: function(items) { var newInboxItems = items.map(function(item) { return { id: item.id, type: 'idea', subject: item.text, preview: '💡 회의에서 나온 아이디어', time: '방금', fromMeeting: item.fromMeeting }; }); setInbox(newInboxItems.concat(inbox)); showToast(items.length + '개 아이디어가 인박스에 저장되었어요! 💡'); } }),
    
    React.createElement(SearchModal, { isOpen: showSearchModal, onClose: function() { setShowSearchModal(false); }, tasks: allTasks, events: allEvents, onSelectTask: function() { setView('WORK'); }, onSelectEvent: function() { setView('WORK'); } }),
    
    React.createElement(LevelUpModal, { level: showLevelUp, onClose: function() { setShowLevelUp(null); } }),
    React.createElement(NewBadgeModal, { badge: showNewBadge, onClose: function() { setShowNewBadge(null); } }),
    React.createElement(StatsModal, { isOpen: showStatsModal, onClose: function() { setShowStatsModal(false); }, gameState: gameState }),
    React.createElement(DoNotDisturbModal, { isOpen: showDndModal, onClose: function() { setShowDndModal(false); }, onEnable: enableDoNotDisturb, currentDuration: 25 }),
    
    React.createElement(CompletionCelebration, { type: celebration.type, data: celebration.data, isVisible: celebration.visible, onClose: function() { setCelebration({ visible: false, type: null, data: null }); } }),
    React.createElement(LevelUpCelebration, { isOpen: showLevelUp !== null, level: showLevelUp, onClose: function() { setShowLevelUp(null); } }),
    
    React.createElement(RoutineManagerModal, { isOpen: showRoutineManager, onClose: function() { setShowRoutineManager(false); }, routines: routines, onAddRoutine: handleAddRoutine, onUpdateRoutine: handleUpdateRoutine, onDeleteRoutine: handleDeleteRoutine, onToggleRoutine: handleToggleRoutine, darkMode: darkMode }),
    
    !doNotDisturb && view !== 'FOCUS' && React.createElement(SmartNotificationToast, { notifications: smartNotifications.notifications, onDismiss: smartNotifications.dismissNotification, onAction: handleNotificationAction, darkMode: darkMode, maxShow: 2 }),
    
    React.createElement(NotificationCenter, { isOpen: showNotificationCenter, onClose: function() { setShowNotificationCenter(false); }, notifications: smartNotifications.notifications, onDismiss: smartNotifications.dismissNotification, onDismissAll: smartNotifications.dismissAll, onAction: handleNotificationAction, darkMode: darkMode }),
    
    !doNotDisturb && React.createElement(TimeAlertToast, { alert: timeTracking.activeAlert, onAction: handleTimeAlertAction, onDismiss: timeTracking.dismissAlert, darkMode: darkMode }),
    
    showNav && (function() {
      var now = new Date();
      var todayStr = now.toISOString().split('T')[0];
      var currentMinutes = now.getHours() * 60 + now.getMinutes();
      var todayEvents = allEvents.filter(function(e) { return e.date === todayStr && e.start; }).map(function(e) { var parts = e.start.split(':'); var h = parseInt(parts[0], 10); var m = parseInt(parts[1], 10); var eventMinutes = h * 60 + m; return Object.assign({}, e, { eventMinutes: eventMinutes, minutesUntil: eventMinutes - currentMinutes }); }).filter(function(e) { return e.minutesUntil > 0; }).sort(function(a, b) { return a.minutesUntil - b.minutesUntil; });
      var nextEvent = todayEvents[0] ? { title: todayEvents[0].title, start: todayEvents[0].start, minutesUntil: todayEvents[0].minutesUntil } : null;
      var urgentTask = allTasks.find(function(t) { return !t.completed && t.deadline === todayStr; });
      return React.createElement(AlfredoStatusBar, { completedTasks: allTasks.filter(function(t) { return t.completed; }).length, totalTasks: allTasks.length, currentTask: focusTask ? focusTask.title : null, nextEvent: nextEvent, urgentTask: urgentTask ? { title: urgentTask.title } : null, energy: userData.energy, mood: userData.mood, taskElapsedMinutes: timeTracking.getElapsedTime(), taskEstimatedMinutes: currentWorkingTask ? (currentWorkingTask.estimatedMinutes || currentWorkingTask.duration || 0) : 0, sessionMinutes: timeTracking.getSessionTime(), onOpenChat: function() { setView('CHAT'); }, darkMode: darkMode });
    })(),
    
    showNav && React.createElement('nav', { className: 'h-20 ' + (darkMode ? 'bg-gray-800/90' : 'bg-white/90') + ' backdrop-blur-xl border-t ' + (darkMode ? 'border-gray-700' : 'border-black/5') + ' flex items-center justify-around px-4 pb-4' },
      navItems.map(function(item) {
        return React.createElement('button', { key: item.view, onClick: function() { setView(item.view); }, className: 'flex flex-col items-center gap-1 px-4 py-2 rounded-xl ' + (view === item.view ? 'text-[#A996FF] bg-[#A996FF]/10' : darkMode ? 'text-gray-500' : 'text-gray-400') },
          React.createElement(item.icon, { size: 22, strokeWidth: view === item.view ? 2.5 : 2 }),
          React.createElement('span', { className: 'text-[11px] font-medium' }, item.label)
        );
      })
    )
  );
}
