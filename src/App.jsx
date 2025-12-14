import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Home, Briefcase, Heart, Zap, MessageCircle, Send, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Plus, Clock, CheckCircle2, Circle, Bell, TrendingUp, TrendingDown, Trophy, Calendar, MapPin, Sun, Moon, Cloud, CloudRain, Sparkles, Settings, RefreshCw, Mic, Battery, Umbrella, Shirt as ShirtIcon, X, FileText, Mail, AlertCircle, Inbox, Trash2, Lightbulb, Search, Award, Target, Flame, Star, Gift, Crown, Database, Upload, FileAudio, Loader2, GripVertical } from 'lucide-react';

// === External Components ===
import MeetingUploader from './components/MeetingUploader';

// === Constants (직접 import) ===
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

// === Common Components (직접 import) ===
import { 
  Button, Card, Toggle, SectionHeader, EmptyState, Modal, 
  PageHeader, ProgressBar, Badge, AlfredoAvatar, Toast,
  StatusIndicator, DomainBadge 
} from './components/common/index.jsx';

// === Alfredo Components (직접 import - 순환 참조 해결) ===
import { TimeAlertToast, AlfredoFeedback, AlfredoFloatingBubble } from './components/alfredo/index.jsx';
import AlfredoStatusBar from './components/home/AlfredoStatusBar.jsx';

// === Page Components (직접 import) ===
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

// === Widget Components (직접 import) ===
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
  const [allEvents, setAllEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('allEvents');
      if (saved) {
        const parsed = JSON.parse(saved);
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
  
  const [routines, setRoutines] = useState(() => {
    const saved = localStorage.getItem('lifebutler_routines');
    return saved ? JSON.parse(saved) : mockRoutines.map(r => ({
      ...r,
      repeatType: 'daily',
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      reminder: true,
      history: [],
    }));
  });
  const [showRoutineManager, setShowRoutineManager] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [currentWorkingTask, setCurrentWorkingTask] = useState(null);
  
  const timeTracking = useTimeTracking(
    currentWorkingTask,
    allEvents,
    (alertType, data) => {
      console.log('Time alert:', alertType, data);
    }
  );
  
  const handleTimeAlertAction = useCallback((action, alert) => {
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
  
  const smartNotifications = useSmartNotifications({
    tasks: allTasks,
    events: allEvents,
    routines: routines,
    energy: userData.energy || 70,
  });
  
  const handleNotificationAction = useCallback((action, notification) => {
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
        showToast('📅 ' + (action.data?.title || '일정') + ' 확인');
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
  
  useEffect(() => {
    if (allEvents && allEvents.length > 0) {
      localStorage.setItem('allEvents', JSON.stringify(allEvents));
      console.log('💾 allEvents 저장:', allEvents.length, '개');
    }
  }, [allEvents]);
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const handleInstallable = () => {
      if (!pwaInstallDismissed) {
        setTimeout(() => setShowPWAInstall(true), 3000);
      }
    };
    
    window.addEventListener('pwa-installable', handleInstallable);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-installable', handleInstallable);
    };
  }, [pwaInstallDismissed]);
  
  const handlePWAInstall = async () => {
    if (window.installPWA) {
      const result = await window.installPWA();
      if (result) {
        showToast('🎉 앱이 설치되었어요!');
      }
    }
    setShowPWAInstall(false);
  };
  
  const handlePWADismiss = () => {
    setShowPWAInstall(false);
    setPWAInstallDismissed(true);
  };
  
  const [connections, setConnections] = useState({
    googleCalendar: true,
    gmail: true,
    notion: false,
    slack: false,
  });
  
  const STORAGE_KEYS = {
    userData: 'lifebutler_userData',
    tasks: 'lifebutler_tasks',
    allTasks: 'lifebutler_allTasks',
    allEvents: 'lifebutler_allEvents',
    inbox: 'lifebutler_inbox',
    darkMode: 'lifebutler_darkMode',
    view: 'lifebutler_view',
    gameState: 'lifebutler_gameState',
    connections: 'lifebutler_connections',
  };
  
  useEffect(() => {
    try {
      const savedUserData = localStorage.getItem(STORAGE_KEYS.userData);
      const savedTasks = localStorage.getItem(STORAGE_KEYS.tasks);
      const savedAllTasks = localStorage.getItem(STORAGE_KEYS.allTasks);
      const savedAllEvents = localStorage.getItem(STORAGE_KEYS.allEvents);
      const savedInbox = localStorage.getItem(STORAGE_KEYS.inbox);
      const savedDarkMode = localStorage.getItem(STORAGE_KEYS.darkMode);
      const savedView = localStorage.getItem(STORAGE_KEYS.view);
      const savedGameState = localStorage.getItem(STORAGE_KEYS.gameState);
      const savedConnections = localStorage.getItem(STORAGE_KEYS.connections);
      
      if (savedUserData) setUserData(JSON.parse(savedUserData));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedAllTasks) setAllTasks(JSON.parse(savedAllTasks));
      if (savedAllEvents) setAllEvents(JSON.parse(savedAllEvents));
      if (savedInbox) setInbox(JSON.parse(savedInbox));
      if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
      if (savedGameState) setGameState(JSON.parse(savedGameState));
      if (savedConnections) setConnections(JSON.parse(savedConnections));
      if (savedView && !['ONBOARDING', 'FOCUS', 'FOCUS_COMPLETE'].includes(savedView)) {
        setView(savedView);
      }
    } catch (e) {
      console.error('로컬 저장소 로드 실패:', e);
    }
    setIsInitialized(true);
  }, []);
  
  useEffect(() => {
    if (!doNotDisturb || !dndEndTime) return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((dndEndTime - now) / 1000));
      
      if (remaining <= 0) {
        setDoNotDisturb(false);
        setDndEndTime(null);
        setDndRemainingTime(null);
      } else {
        setDndRemainingTime(remaining);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [doNotDisturb, dndEndTime]);
  
  const enableDoNotDisturb = (durationMinutes) => {
    setDoNotDisturb(true);
    if (durationMinutes === -1) {
      setDndEndTime(null);
      setDndRemainingTime(null);
    } else {
      const endTime = Date.now() + durationMinutes * 60 * 1000;
      setDndEndTime(endTime);
      setDndRemainingTime(durationMinutes * 60);
    }
  };
  
  const disableDoNotDisturb = () => {
    setDoNotDisturb(false);
    setDndEndTime(null);
    setDndRemainingTime(null);
  };
  
  useEffect(() => {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify(userData)); } catch (e) {}
  }, [userData, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks)); } catch (e) {}
  }, [tasks, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.allTasks, JSON.stringify(allTasks)); } catch (e) {}
  }, [allTasks, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.allEvents, JSON.stringify(allEvents)); } catch (e) {}
  }, [allEvents, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.inbox, JSON.stringify(inbox)); } catch (e) {}
  }, [inbox, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.darkMode, JSON.stringify(darkMode)); } catch (e) {}
  }, [darkMode, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    if (!['ONBOARDING', 'FOCUS', 'FOCUS_COMPLETE'].includes(view)) {
      try { localStorage.setItem(STORAGE_KEYS.view, view); } catch (e) {}
    }
  }, [view, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.gameState, JSON.stringify(gameState)); } catch (e) {}
  }, [gameState, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEYS.connections, JSON.stringify(connections)); } catch (e) {}
  }, [connections, isInitialized]);
  
  const handleConnect = (service) => {
    setConnections(prev => ({ ...prev, [service]: true }));
    showToast((service === 'googleCalendar' ? 'Google Calendar' : service === 'gmail' ? 'Gmail' : service) + ' 연결 완료! 🎉');
  };
  
  const handleDisconnect = (service) => {
    setConnections(prev => ({ ...prev, [service]: false }));
    showToast((service === 'googleCalendar' ? 'Google Calendar' : service === 'gmail' ? 'Gmail' : service) + ' 연결 해제됨');
  };
  
  const earnXP = (amount, reason) => {
    const oldLevel = LEVEL_CONFIG.getLevel(gameState.totalXP).level;
    const newTotalXP = gameState.totalXP + amount;
    const newLevelInfo = LEVEL_CONFIG.getLevel(newTotalXP);
    
    const dayOfWeek = new Date().getDay();
    const newWeeklyXP = [...gameState.weeklyXP];
    newWeeklyXP[dayOfWeek] += amount;
    
    setGameState(prev => ({
      ...prev,
      totalXP: newTotalXP,
      todayXP: prev.todayXP + amount,
      weeklyXP: newWeeklyXP,
    }));
    
    if (newLevelInfo.level > oldLevel) {
      setTimeout(() => { setShowLevelUp(newLevelInfo.level); }, 500);
    }
    
    showToast('+' + amount + ' XP! ' + reason);
  };
  
  const checkBadges = (stats) => {
    const newBadges = [];
    BADGES.forEach(badge => {
      if (!gameState.unlockedBadges.includes(badge.id) && badge.condition(stats)) {
        newBadges.push(badge);
      }
    });
    
    if (newBadges.length > 0) {
      setGameState(prev => ({
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, ...newBadges.map(b => b.id)],
      }));
      setTimeout(() => { setShowNewBadge(newBadges[0]); }, 1000);
    }
  };
  
  const handleTaskCompleteWithXP = (task, isBig3 = false) => {
    const hour = new Date().getHours();
    let xpEarned = task.importance === 'high' ? XP_REWARDS.taskCompleteHigh : XP_REWARDS.taskComplete;
    
    if (isBig3) xpEarned += XP_REWARDS.big3Complete;
    if (hour < 12 && isBig3) xpEarned += 20;
    
    const completedToday = gameState.todayTasks + 1;
    const big3Done = tasks.filter(t => t.status === 'done').length + (isBig3 ? 1 : 0);
    const big3Total = tasks.length;
    
    let celebrationMsg = '';
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
    
    const newStats = {
      ...gameState,
      totalCompleted: gameState.totalCompleted + 1,
      todayTasks: gameState.todayTasks + 1,
      level: LEVEL_CONFIG.getLevel(gameState.totalXP + xpEarned).level,
    };
    
    if (isBig3) newStats.big3Completed = gameState.big3Completed + 1;
    if (hour < 9) newStats.earlyBirdCount = gameState.earlyBirdCount + 1;
    if (hour >= 22) newStats.nightOwlCount = gameState.nightOwlCount + 1;
    
    setGameState(prev => ({
      ...prev,
      totalCompleted: newStats.totalCompleted,
      todayTasks: newStats.todayTasks,
      big3Completed: newStats.big3Completed || prev.big3Completed,
      earlyBirdCount: newStats.earlyBirdCount || prev.earlyBirdCount,
      nightOwlCount: newStats.nightOwlCount || prev.nightOwlCount,
    }));
    
    checkBadges(newStats);
  };
  
  const handleFocusCompleteWithXP = (minutes) => {
    earnXP(XP_REWARDS.focusSession, '집중 세션 완료!');
    
    const newStats = {
      ...gameState,
      focusSessions: gameState.focusSessions + 1,
      focusMinutes: gameState.focusMinutes + minutes,
      level: LEVEL_CONFIG.getLevel(gameState.totalXP + XP_REWARDS.focusSession).level,
    };
    
    setGameState(prev => ({
      ...prev,
      focusSessions: newStats.focusSessions,
      focusMinutes: newStats.focusMinutes,
    }));
    
    checkBadges(newStats);
  };
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
      if (e.key === 'Escape') setShowSearchModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const navItems = [
    { view: 'HOME', icon: Home, label: '홈' },
    { view: 'CALENDAR', icon: Calendar, label: '캘린더' },
    { view: 'WORK', icon: Briefcase, label: '업무' },
    { view: 'LIFE', icon: Heart, label: '일상' },
    { view: 'FOCUS', icon: Zap, label: '집중' },
  ];
  
  const showNav = !['ONBOARDING', 'CHAT', 'FOCUS', 'FOCUS_COMPLETE', 'SETTINGS'].includes(view);
  
  const handleOnboardingComplete = (data) => {
    setUserData(data);
    setView('HOME');
  };
  
  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };
  
  const showAlfredoFeedback = (message, type = 'praise', icon = '🐧') => {
    setAlfredoFeedback({ visible: true, message, type, icon });
    setTimeout(() => setAlfredoFeedback({ visible: false, message: '', type: 'praise', icon: '🐧' }), 3000);
  };
  
  const getTaskCompleteFeedback = (task, completedCount, totalCount, isStreak = false) => {
    if (completedCount === totalCount && totalCount > 0) {
      const messages = [
        { msg: "완벽해요! 오늘 할 일 끝!", icon: "🎉" },
        { msg: "대단해요! 다 끝냈어요!", icon: "✨" },
        { msg: "오늘의 영웅이에요!", icon: "🏆" },
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    if (isStreak && completedCount >= 3) {
      const messages = [
        { msg: completedCount + "연속! 흐름 좋아요!", icon: "🔥" },
        { msg: "연속 " + completedCount + "개! 멈추지 마요!", icon: "⚡" },
        { msg: completedCount + "연타! 달리고 있어요!", icon: "🚀" },
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    if (completedCount === totalCount - 1 && totalCount > 1) {
      const messages = [
        { msg: "마지막 하나! 거의 다 왔어요!", icon: "🏁" },
        { msg: "하나 남았어요! 조금만 더!", icon: "💪" },
        { msg: "끝이 보여요! 파이팅!", icon: "✨" },
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    if (completedCount === Math.ceil(totalCount / 2)) {
      const messages = [
        { msg: "절반 왔어요! 잘하고 있어요!", icon: "👏" },
        { msg: "반 넘었어요! 이 페이스 좋아요!", icon: "🎯" },
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    if (completedCount === 1) {
      const messages = [
        { msg: "첫 번째 완료! 시작이 반이에요!", icon: "🌟" },
        { msg: "좋은 시작이에요! 계속 가요!", icon: "👍" },
        { msg: "하나 끝! 멋진 출발이에요!", icon: "✨" },
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    const messages = [
      { msg: "잘했어요! 👏", icon: "🐧" },
      { msg: "멋져요! 다음은 뭐 할까요?", icon: "✨" },
      { msg: "해냈네요! 💪", icon: "🐧" },
      { msg: "역시 Boss!", icon: "👑" },
      { msg: "Good job!", icon: "👍" },
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const handleToggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const isCompleting = task && task.status !== 'done';
    
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t);
    setTasks(newTasks);
    
    if (isCompleting && task) {
      handleTaskCompleteWithXP(task, true);
      const completedCount = newTasks.filter(t => t.status === 'done').length;
      const totalCount = newTasks.length;
      const isAllComplete = completedCount === totalCount;
      
      const now = Date.now();
      const streakTimeout = 5 * 60 * 1000;
      let newStreak = 1;
      if (lastCompletionTime && (now - lastCompletionTime) < streakTimeout) newStreak = completionStreak + 1;
      setCompletionStreak(newStreak);
      setLastCompletionTime(now);
      
      const feedback = getTaskCompleteFeedback(task, completedCount, totalCount, newStreak >= 3);
      showAlfredoFeedback(feedback.msg, 'praise', feedback.icon);
      
      const celebrationType = isAllComplete ? 'big3' : newStreak >= 3 ? 'streak' : 'task';
      const xpAmount = task.importance === 'high' ? 20 : task.importance === 'medium' ? 15 : 10;
      
      setCelebration({ visible: true, type: celebrationType, data: { xp: xpAmount, streak: newStreak, taskTitle: task.title, completedCount, totalCount } });
      
      if (isAllComplete) earnXP(XP_REWARDS.allBig3Complete, '🎉 Big3 전체 완료 보너스!');
    }
  };
  
  const handleToggleAllTask = (taskId) => {
    const task = allTasks.find(t => t.id === taskId);
    const isCompleting = task && task.status !== 'done';
    
    const newTasks = allTasks.map(t => t.id === taskId ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t);
    setAllTasks(newTasks);
    
    if (isCompleting && task) {
      handleTaskCompleteWithXP(task, false);
      const completedCount = newTasks.filter(t => t.status === 'done').length;
      
      const now = Date.now();
      const streakTimeout = 5 * 60 * 1000;
      let newStreak = 1;
      if (lastCompletionTime && (now - lastCompletionTime) < streakTimeout) newStreak = completionStreak + 1;
      setCompletionStreak(newStreak);
      setLastCompletionTime(now);
      
      const feedback = getTaskCompleteFeedback(task, completedCount, newTasks.length, newStreak >= 3);
      showAlfredoFeedback(feedback.msg, 'praise', feedback.icon);
      
      const xpAmount = task.importance === 'high' ? 15 : 10;
      setCelebration({ visible: true, type: newStreak >= 3 ? 'streak' : 'task', data: { xp: xpAmount, streak: newStreak, taskTitle: task.title, completedCount, totalCount: newTasks.length } });
    }
  };
  
  const handleAddRoutine = (routine) => {
    const newRoutines = [...routines, routine];
    setRoutines(newRoutines);
    localStorage.setItem('lifebutler_routines', JSON.stringify(newRoutines));
    showToast('🔄 새 루틴이 추가되었어요!');
  };
  
  const handleUpdateRoutine = (updatedRoutine) => {
    const newRoutines = routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r);
    setRoutines(newRoutines);
    localStorage.setItem('lifebutler_routines', JSON.stringify(newRoutines));
    showToast('✅ 루틴이 수정되었어요!');
  };
  
  const handleDeleteRoutine = (routineId) => {
    const newRoutines = routines.filter(r => r.id !== routineId);
    setRoutines(newRoutines);
    localStorage.setItem('lifebutler_routines', JSON.stringify(newRoutines));
    showToast('🗑️ 루틴이 삭제되었어요.');
  };
  
  const handleToggleRoutine = (routineId) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    
    const newCurrent = routine.current < routine.target ? routine.current + 1 : 0;
    const isJustCompleted = newCurrent >= routine.target && routine.current < routine.target;
    
    let newStreak = routine.streak;
    if (isJustCompleted) {
      const today = new Date().toDateString();
      const lastDone = routine.lastDoneDate;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastDone === yesterday) newStreak = routine.streak + 1;
      else if (lastDone !== today) newStreak = 1;
    }
    
    const newRoutines = routines.map(r => r.id === routineId ? { ...r, current: newCurrent, streak: newStreak, lastDoneDate: isJustCompleted ? new Date().toDateString() : r.lastDoneDate, history: isJustCompleted ? [...(r.history || []), { date: new Date().toISOString(), completed: true }] : r.history } : r);
    setRoutines(newRoutines);
    localStorage.setItem('lifebutler_routines', JSON.stringify(newRoutines));
    
    if (isJustCompleted) {
      const allDone = newRoutines.filter(r => r.current >= r.target).length === newRoutines.length;
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
  
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        const resetRoutines = routines.map(r => ({ ...r, current: 0 }));
        setRoutines(resetRoutines);
        localStorage.setItem('lifebutler_routines', JSON.stringify(resetRoutines));
      }
    };
    const interval = setInterval(checkMidnight, 60000);
    return () => clearInterval(interval);
  }, [routines]);
  
  const handleOpenChatWithMessage = (messageData) => {
    setChatInitialMessage(messageData);
    setView('CHAT');
  };
  
  const handleStartFocus = (task) => {
    setFocusTask(task);
    setCurrentWorkingTask(task);
    setView('FOCUS');
  };
  
  const handleFocusComplete = () => {
    if (focusTask) {
      setCurrentWorkingTask(null);
      setAllTasks(allTasks.map(t => t.id === focusTask.id ? { ...t, status: 'done' } : t));
      handleFocusCompleteWithXP(25);
      handleTaskCompleteWithXP(focusTask, false);
      const todayCompleted = allTasks.filter(t => t.status === 'done').length + 1;
      const remainingTasks = allTasks.filter(t => t.id !== focusTask.id && t.status !== 'done').sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
      const nextTask = remainingTasks[0] || null;
      setCompletedTaskInfo({ task: focusTask, nextTask, stats: { focusTime: focusTask.duration || 25, todayCompleted, streak: mockCompletedHistory.stats.streak } });
      setFocusTask(null);
      setView('FOCUS_COMPLETE');
    } else {
      setView('HOME');
    }
  };
  
  const handleStartNextFromCompletion = (task) => {
    setFocusTask(task);
    setCompletedTaskInfo(null);
    setView('FOCUS');
  };
  
  const handleGoHomeFromCompletion = () => {
    setCompletedTaskInfo(null);
    setView('HOME');
    showToast('수고했어요! 🎉');
  };
  
  const handleConvertToTask = (item) => {
    const newTask = { id: 'task-' + item.id, title: item.subject, project: 'Inbox', importance: item.urgent ? 'high' : 'medium', status: 'todo', priorityChange: 'new', priorityScore: item.urgent ? 85 : 65, priorityReason: 'Inbox에서 변환됨', sparkline: [0, 0, 30, 60, item.urgent ? 85 : 65], deadline: item.needReplyToday ? '오늘' : '내일', duration: 30 };
    setAllTasks([newTask, ...allTasks]);
    setInbox(inbox.filter(i => i.id !== item.id));
    showToast('Task로 전환했어요! 📋');
  };
  
  const handleAddTask = (task) => {
    setAllTasks([task, ...allTasks]);
    showToast('새 태스크가 추가되었어요! ✨');
  };
  
  const handleUpdateTask = (taskId, updates) => {
    setAllTasks(allTasks.map(t => t.id === taskId ? { ...t, ...updates, priorityScore: updates.importance === 'high' ? 85 : updates.importance === 'medium' ? 65 : 45 } : t));
    showToast('태스크가 수정되었어요! ✏️');
  };
  
  const handleDeleteTask = (taskId) => {
    setAllTasks(allTasks.filter(t => t.id !== taskId));
    showToast('태스크가 삭제되었어요 🗑️');
  };
  
  const handleAddTaskFromChat = (title) => {
    const newTask = { id: 'task-chat-' + Date.now(), title: title, project: '기타', importance: 'medium', status: 'todo', priorityChange: 'new', priorityScore: 60, priorityReason: '채팅에서 추가됨', sparkline: [0, 0, 30, 50, 60], deadline: '오늘', duration: 30 };
    setAllTasks([newTask, ...allTasks]);
    showToast('할 일 추가했어요! 📋');
  };
  
  const handleAddEvent = (event) => {
    setAllEvents([...allEvents, event]);
    showToast('일정이 추가되었어요! 📅');
  };
  
  const handleUpdateEvent = (eventId, updates) => {
    setAllEvents(allEvents.map(e => e.id === eventId ? { ...e, ...updates } : e));
    showToast('일정이 수정되었어요! ✏️');
  };
  
  const handleDeleteEvent = (eventId) => {
    setAllEvents(allEvents.filter(e => e.id !== eventId));
    showToast('일정이 삭제되었어요 🗑️');
  };
  
  const handleUpdateTaskTime = (taskId, newTime) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, scheduledTime: newTime } : t));
    setAllTasks(allTasks.map(t => t.id === taskId ? { ...t, scheduledTime: newTime } : t));
    showToast('⏰ ' + newTime + '에 배정했어요!');
  };
  
  const handleUpdateEventTime = (eventId, newTime) => {
    setAllEvents(allEvents.map(e => {
      if (e.id === eventId) {
        const [oldH, oldM] = (e.start || '09:00').split(':').map(Number);
        const [newH, newM] = newTime.split(':').map(Number);
        const oldStartMin = oldH * 60 + oldM;
        const oldEndMin = e.end ? (() => { const [eh, em] = e.end.split(':').map(Number); return eh * 60 + em; })() : oldStartMin + 60;
        const duration = oldEndMin - oldStartMin;
        const newStartMin = newH * 60 + newM;
        const newEndMin = newStartMin + duration;
        const newEndH = Math.floor(newEndMin / 60);
        const newEndM = newEndMin % 60;
        const newEnd = newEndH.toString().padStart(2, '0') + ':' + newEndM.toString().padStart(2, '0');
        return { ...e, start: newTime, end: newEnd };
      }
      return e;
    }));
    showToast('⏰ ' + newTime + '으로 이동했어요!');
  };
  
  const handleSyncGoogleEvents = (googleEvents) => {
    console.log('📥 handleSyncGoogleEvents 호출됨!');
    console.log('📊 받은 일정 수:', googleEvents.length);
    setAllEvents(prev => {
      const localEvents = prev.filter(e => !e.fromGoogle);
      const localGoogleIds = new Set(localEvents.filter(e => e.googleEventId).map(e => e.googleEventId));
      const newGoogleEvents = googleEvents.filter(ge => !localGoogleIds.has(ge.googleEventId));
      return [...localEvents, ...newGoogleEvents];
    });
    showToast('Google Calendar 동기화 완료! 🔄');
  };
  
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  
  return (
    <div className={['w-full', 'h-screen', bgColor, 'overflow-hidden', 'flex', 'flex-col', 'font-sans', 'transition-colors', 'duration-300'].join(' ')}>
      <Toast message={toast.message} visible={toast.visible} darkMode={darkMode} />
      <AlfredoFeedback visible={alfredoFeedback.visible} message={alfredoFeedback.message} type={alfredoFeedback.type} icon={alfredoFeedback.icon} darkMode={darkMode} />
      
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <OfflineBanner isOffline={isOffline} />
        <DoNotDisturbBanner isActive={doNotDisturb} remainingTime={dndRemainingTime} onDisable={disableDoNotDisturb} />
        <PWAInstallBanner show={showPWAInstall} onInstall={handlePWAInstall} onDismiss={handlePWADismiss} />
        
        {view === 'ONBOARDING' && <Onboarding onComplete={handleOnboardingComplete} />}
        {view === 'HOME' && (
          <HomePage 
            onOpenChat={() => setView('CHAT')} 
            onOpenSettings={() => setView('SETTINGS')}
            onOpenSearch={() => setShowSearchModal(true)}
            onOpenStats={() => setShowStatsModal(true)}
            onOpenWeeklyReview={() => setView('WEEKLY_REVIEW')}
            onOpenHabitHeatmap={() => setView('HABIT_HEATMAP')}
            onOpenEnergyRhythm={() => setView('ENERGY_RHYTHM')}
            onOpenProjectDashboard={() => setView('PROJECT_DASHBOARD')}
            onOpenDndModal={() => setShowDndModal(true)}
            onOpenNotifications={() => setShowNotificationCenter(true)}
            notificationCount={smartNotifications.notifications.length}
            doNotDisturb={doNotDisturb}
            mood={userData.mood} 
            setMood={m => setUserData({...userData, mood: m})}
            energy={userData.energy}
            setEnergy={e => setUserData({...userData, energy: e})}
            oneThing={userData.oneThing}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            inbox={inbox}
            onStartFocus={handleStartFocus}
            darkMode={darkMode}
            gameState={gameState}
            events={allEvents}
            connections={connections}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onSaveEvent={(eventData) => { if (eventData.id) { handleUpdateEvent(eventData.id, eventData); } else { handleAddEvent({ ...eventData, id: 'event-' + Date.now() }); } }}
            onDeleteEvent={handleDeleteEvent}
            onUpdateTaskTime={handleUpdateTaskTime}
            onUpdateEventTime={handleUpdateEventTime}
            routines={routines}
            onToggleRoutine={handleToggleRoutine}
            onOpenRoutineManager={() => setShowRoutineManager(true)}
          />
        )}
        {view === 'SETTINGS' && <SettingsPage userData={userData} onUpdateUserData={setUserData} onBack={() => setView('HOME')} darkMode={darkMode} setDarkMode={setDarkMode} onOpenWidgetGallery={() => setView('WIDGET_GALLERY')} connections={connections} onConnect={handleConnect} onDisconnect={handleDisconnect} />}
        {view === 'WIDGET_GALLERY' && <WidgetGallery onBack={() => setView('SETTINGS')} tasks={tasks} events={allEvents} mood={userData.mood} energy={userData.energy} darkMode={darkMode} />}
        {view === 'PROJECT_DASHBOARD' && <ProjectDashboardPage onBack={() => setView('HOME')} projects={mockProjects} allTasks={allTasks} onAddProject={() => {}} onEditProject={() => {}} onDeleteProject={() => {}} darkMode={darkMode} />}
        {view === 'WEEKLY_REVIEW' && <WeeklyReviewPage onBack={() => setView('HOME')} gameState={gameState} allTasks={allTasks} darkMode={darkMode} />}
        {view === 'HABIT_HEATMAP' && <HabitHeatmapPage onBack={() => setView('HOME')} gameState={gameState} darkMode={darkMode} />}
        {view === 'ENERGY_RHYTHM' && <EnergyRhythmPage onBack={() => setView('HOME')} gameState={gameState} userData={userData} darkMode={darkMode} />}
        {view === 'CALENDAR' && <CalendarPage onBack={() => setView('HOME')} tasks={tasks} allTasks={allTasks} events={allEvents} darkMode={darkMode} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} onDeleteEvent={handleDeleteEvent} onUpdateTask={handleUpdateTask} onSyncGoogleEvents={handleSyncGoogleEvents} />}
        {view === 'CHAT' && <AlfredoChat onBack={() => { setChatInitialMessage(null); setView('HOME'); }} tasks={tasks} events={allEvents} mood={userData.mood} energy={userData.energy} onAddTask={handleAddTaskFromChat} onStartFocus={handleStartFocus} initialMessage={chatInitialMessage} />}
        {view === 'WORK' && <WorkPage tasks={allTasks} onToggleTask={handleToggleAllTask} onStartFocus={handleStartFocus} inbox={inbox} onConvertToTask={handleConvertToTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onAddTask={handleAddTask} onOpenChat={handleOpenChatWithMessage} darkMode={darkMode} events={allEvents} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} onDeleteEvent={handleDeleteEvent} />}
        {view === 'FOCUS' && <FocusTimer task={focusTask} onComplete={handleFocusComplete} onExit={() => { setFocusTask(null); setView('HOME'); }} />}
        {view === 'FOCUS_COMPLETE' && completedTaskInfo && <FocusCompletionScreen completedTask={completedTaskInfo.task} nextTask={completedTaskInfo.nextTask} stats={completedTaskInfo.stats} onStartNext={handleStartNextFromCompletion} onGoHome={handleGoHomeFromCompletion} />}
        {view === 'LIFE' && <LifePage mood={userData.mood} setMood={m => setUserData({...userData, mood: m})} energy={userData.energy} setEnergy={e => setUserData({...userData, energy: e})} onOpenChat={handleOpenChatWithMessage} darkMode={darkMode} />}
      </div>
      
      {showNav && (
        <div className="fixed bottom-36 right-4 z-30 flex flex-col items-end gap-3">
          <button onClick={() => setShowNLQuickAdd(true)} className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200 hover:scale-105 transition-all group" title="빠른 추가 (자연어)">
            <Sparkles size={20} className="text-[#A996FF] group-hover:text-[#8B7CF7] transition-colors" />
          </button>
          <button onClick={() => setShowQuickCapture(true)} className="w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center border border-gray-100 hover:scale-105 transition-all" title="빠른 기록">
            <Plus size={18} className="text-gray-500" />
          </button>
          <button onClick={() => setView('CHAT')} className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] shadow-xl shadow-[#A996FF]/30 flex items-center justify-center ring-4 ring-white/30">
            <span className="text-2xl">🐧</span>
          </button>
        </div>
      )}
      
      {showNLQuickAdd && <NaturalLanguageQuickAdd isOpen={showNLQuickAdd} onClose={() => setShowNLQuickAdd(false)} onAddTask={(task) => { setTasks([task, ...tasks]); setAllTasks([task, ...allTasks]); showToast('✅ 할 일이 추가되었어요!'); }} onAddEvent={(event) => { setAllEvents([event, ...allEvents]); showToast('📅 일정이 추가되었어요!'); }} darkMode={darkMode} />}
      
      {showQuickCapture && <QuickCaptureModal onClose={() => setShowQuickCapture(false)} onAddTask={(task) => { setAllTasks([task, ...allTasks]); showToast('할 일이 추가되었어요! ✅'); setShowQuickCapture(false); }} onAddToInbox={(item) => { setInbox([item, ...inbox]); showToast('인박스에 저장했어요! 📥'); setShowQuickCapture(false); }} onOpenMeetingUploader={() => setShowMeetingUploader(true)} />}
      
      {showMeetingUploader && <MeetingUploader onClose={() => setShowMeetingUploader(false)} darkMode={darkMode} onAddTasks={(tasks) => { setAllTasks([...tasks, ...allTasks]); showToast(tasks.length + '개 할 일이 추가되었어요! ✅'); }} onAddEvents={(events) => { showToast(events.length + '개 일정이 추가되었어요! 📅'); }} onAddToInbox={(items) => { const newInboxItems = items.map(item => ({ id: item.id, type: 'idea', subject: item.text, preview: '💡 회의에서 나온 아이디어', time: '방금', fromMeeting: item.fromMeeting })); setInbox([...newInboxItems, ...inbox]); showToast(items.length + '개 아이디어가 인박스에 저장되었어요! 💡'); }} />}
      
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} tasks={allTasks} events={allEvents} onSelectTask={() => setView('WORK')} onSelectEvent={() => setView('WORK')} />
      
      <LevelUpModal level={showLevelUp} onClose={() => setShowLevelUp(null)} />
      <NewBadgeModal badge={showNewBadge} onClose={() => setShowNewBadge(null)} />
      <StatsModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} gameState={gameState} />
      <DoNotDisturbModal isOpen={showDndModal} onClose={() => setShowDndModal(false)} onEnable={enableDoNotDisturb} currentDuration={25} />
      
      <CompletionCelebration type={celebration.type} data={celebration.data} isVisible={celebration.visible} onClose={() => setCelebration({ visible: false, type: null, data: null })} />
      <LevelUpCelebration isOpen={showLevelUp !== null} level={showLevelUp} onClose={() => setShowLevelUp(null)} />
      
      <RoutineManagerModal isOpen={showRoutineManager} onClose={() => setShowRoutineManager(false)} routines={routines} onAddRoutine={handleAddRoutine} onUpdateRoutine={handleUpdateRoutine} onDeleteRoutine={handleDeleteRoutine} onToggleRoutine={handleToggleRoutine} darkMode={darkMode} />
      
      {!doNotDisturb && view !== 'FOCUS' && <SmartNotificationToast notifications={smartNotifications.notifications} onDismiss={smartNotifications.dismissNotification} onAction={handleNotificationAction} darkMode={darkMode} maxShow={2} />}
      
      <NotificationCenter isOpen={showNotificationCenter} onClose={() => setShowNotificationCenter(false)} notifications={smartNotifications.notifications} onDismiss={smartNotifications.dismissNotification} onDismissAll={smartNotifications.dismissAll} onAction={handleNotificationAction} darkMode={darkMode} />
      
      {!doNotDisturb && <TimeAlertToast alert={timeTracking.activeAlert} onAction={handleTimeAlertAction} onDismiss={timeTracking.dismissAlert} darkMode={darkMode} />}
      
      {showNav && (() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const todayEvents = allEvents.filter(e => e.date === todayStr && e.start).map(e => { const [h, m] = e.start.split(':').map(Number); const eventMinutes = h * 60 + m; return { ...e, eventMinutes, minutesUntil: eventMinutes - currentMinutes }; }).filter(e => e.minutesUntil > 0).sort((a, b) => a.minutesUntil - b.minutesUntil);
        const nextEvent = todayEvents[0] ? { title: todayEvents[0].title, start: todayEvents[0].start, minutesUntil: todayEvents[0].minutesUntil } : null;
        const urgentTask = allTasks.find(t => !t.completed && t.deadline === todayStr);
        return <AlfredoStatusBar completedTasks={allTasks.filter(t => t.completed).length} totalTasks={allTasks.length} currentTask={focusTask?.title} nextEvent={nextEvent} urgentTask={urgentTask ? { title: urgentTask.title } : null} energy={userData.energy} mood={userData.mood} taskElapsedMinutes={timeTracking.getElapsedTime()} taskEstimatedMinutes={currentWorkingTask?.estimatedMinutes || currentWorkingTask?.duration || 0} sessionMinutes={timeTracking.getSessionTime()} onOpenChat={() => setView('CHAT')} darkMode={darkMode} />;
      })()}
      
      {showNav && (
        <nav className={['h-20', darkMode ? 'bg-gray-800/90' : 'bg-white/90', 'backdrop-blur-xl', 'border-t', darkMode ? 'border-gray-700' : 'border-black/5', 'flex', 'items-center', 'justify-around', 'px-4', 'pb-4'].join(' ')}>
          {navItems.map(({ view: v, icon: Icon, label }) => (
            <button key={v} onClick={() => setView(v)} className={['flex', 'flex-col', 'items-center', 'gap-1', 'px-4', 'py-2', 'rounded-xl', view === v ? 'text-[#A996FF] bg-[#A996FF]/10' : darkMode ? 'text-gray-500' : 'text-gray-400'].join(' ')}>
              <Icon size={22} strokeWidth={view === v ? 2.5 : 2} />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
