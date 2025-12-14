import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Home, Briefcase, Heart, Zap, MessageCircle, Send, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Plus, Clock, CheckCircle2, Circle, Bell, TrendingUp, TrendingDown, Trophy, Calendar, MapPin, Sun, Moon, Cloud, CloudRain, Sparkles, Settings, RefreshCw, Mic, Battery, Umbrella, Shirt as ShirtIcon, X, FileText, Mail, AlertCircle, Inbox, Trash2, Lightbulb, Search, Award, Target, Flame, Star, Gift, Crown, Database, Upload, FileAudio, Loader2, GripVertical } from 'lucide-react';

// === External Components ===
import MeetingUploader from './components/MeetingUploader';

// === Constants ===
import { 
  COLORS, SPACING, RADIUS, getThemeStyles, 
  BUTTON_STYLES, CARD_STYLES, INPUT_STYLES 
} from './constants/colors';
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
import { 
  Button, Card, Toggle, SectionHeader, EmptyState, Modal, 
  PageHeader, ProgressBar, Badge, AlfredoAvatar, Toast,
  StatusIndicator, DomainBadge 
} from './components/common';
import { 
  TimeAlertToast, AlfredoFeedback, AlfredoStatusBar, AlfredoFloatingBubble 
} from './components/alfredo';

// === Page Components ===
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

// === Widget Components ===
import { QuickConditionTracker, AlfredoBriefing, Big3Widget, UrgentWidget, TimelineWidget, RoutineWidget } from './components/home/widgets';
import UnifiedTimelineView from './components/home/UnifiedTimelineView';

// === Work Components ===
import InboxPage from './components/work/InboxPage';
import SwipeableTaskItem from './components/work/SwipeableTaskItem';
import { Sparkline, PriorityIndicator } from './components/work/TaskWidgets';

// === Home Components ===
import AlfredoContextActions from './components/home/AlfredoContextActions';

// === Notification Components ===
import { SmartNotificationToast, NotificationCenter, NotificationItem } from './components/notifications';

// === Celebration Components ===
import { ConfettiEffect, XPFloater, StreakBurst, LevelUpCelebration, CompletionCelebration } from './components/celebrations';

// === Banner Components ===
import { DoNotDisturbBanner, OfflineBanner, PWAInstallBanner } from './components/common/Banners';

// === Main App ===
export default function LifeButlerApp() {
  const [view, setView] = useState('HOME');
  const [userData, setUserData] = useState({ mood: 'light', energy: 68, oneThing: '투자 보고서 완성', memo: '' });
  const [tasks, setTasks] = useState(mockBig3);
  const [allTasks, setAllTasks] = useState(mockAllTasks);
  // localStorage에서 일정 불러오기 (없으면 mockEvents 사용)
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
  const [showNLQuickAdd, setShowNLQuickAdd] = useState(false); // Phase 4: 자연어 Quick Add
  const [darkMode, setDarkMode] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [gameState, setGameState] = useState(initialGameState);
  const [showLevelUp, setShowLevelUp] = useState(null); // 레벨업 모달
  const [showNewBadge, setShowNewBadge] = useState(null); // 새 배지 모달
  const [showStatsModal, setShowStatsModal] = useState(false); // 통계 모달
  const [doNotDisturb, setDoNotDisturb] = useState(false); // 방해 금지 모드
  const [dndEndTime, setDndEndTime] = useState(null); // 방해 금지 종료 시간
  const [dndRemainingTime, setDndRemainingTime] = useState(null); // 남은 시간 (초)
  const [showDndModal, setShowDndModal] = useState(false); // 방해 금지 설정 모달
  const [showMeetingUploader, setShowMeetingUploader] = useState(false); // 회의록 정리 모달
  const [chatInitialMessage, setChatInitialMessage] = useState(null); // 채팅 초기 메시지
  
  // Phase 6: 완료 축하 상태
  const [celebration, setCelebration] = useState({ visible: false, type: null, data: null });
  const [completionStreak, setCompletionStreak] = useState(0); // 연속 완료 카운트
  const [lastCompletionTime, setLastCompletionTime] = useState(null); // 마지막 완료 시간
  
  // Phase 7: 루틴 상태
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
  
  // Phase 9: 스마트 알림 상태
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  
  // Phase 2: 시간 트래킹 상태
  const [currentWorkingTask, setCurrentWorkingTask] = useState(null); // 현재 작업 중인 태스크
  
  // Phase 2: 시간 트래킹 훅 사용
  const timeTracking = useTimeTracking(
    currentWorkingTask,
    allEvents,
    (alertType, data) => {
      // 알림 콜백 처리
      console.log('Time alert:', alertType, data);
    }
  );
  
  // Phase 2: 알림 액션 핸들러
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
  
  // PWA 상태
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [pwaInstallDismissed, setPWAInstallDismissed] = useState(false);
  
  // Phase 9: 스마트 알림 훅 사용
  const smartNotifications = useSmartNotifications({
    tasks: allTasks,
    events: allEvents,
    routines: routines,
    energy: userData.energy || 70,
  });
  
  // Phase 9: 알림 액션 핸들러
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
        // TODO: 이벤트 상세 보기
        showToast(`📅 ${action.data?.title || '일정'} 확인`);
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
  
  // allEvents 변경 시 localStorage에 저장
  useEffect(() => {
    if (allEvents && allEvents.length > 0) {
      localStorage.setItem('allEvents', JSON.stringify(allEvents));
      console.log('💾 allEvents 저장:', allEvents.length, '개');
    }
  }, [allEvents]);
  
  // PWA 이벤트 리스너
  useEffect(() => {
    // 온라인/오프라인 상태 감지
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // PWA 설치 가능 이벤트
    const handleInstallable = () => {
      if (!pwaInstallDismissed) {
        setTimeout(() => setShowPWAInstall(true), 3000); // 3초 후 표시
      }
    };
    
    window.addEventListener('pwa-installable', handleInstallable);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-installable', handleInstallable);
    };
  }, [pwaInstallDismissed]);
  
  // PWA 설치 핸들러
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
  
  // Google API 연동 상태
  const [connections, setConnections] = useState({
    googleCalendar: true,
    gmail: true,
    notion: false,
    slack: false,
  });
  
  // 로컬 저장소 키
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
  
  // 로컬 저장소에서 로드 (초기화)
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
  
  // 방해 금지 타이머
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
  
  // 방해 금지 활성화
  const enableDoNotDisturb = (durationMinutes) => {
    setDoNotDisturb(true);
    if (durationMinutes === -1) {
      // 직접 해제할 때까지
      setDndEndTime(null);
      setDndRemainingTime(null);
    } else {
      const endTime = Date.now() + durationMinutes * 60 * 1000;
      setDndEndTime(endTime);
      setDndRemainingTime(durationMinutes * 60);
    }
  };
  
  // 방해 금지 해제
  const disableDoNotDisturb = () => {
    setDoNotDisturb(false);
    setDndEndTime(null);
    setDndRemainingTime(null);
  };
  
  // 데이터 변경 시 로컬 저장소에 저장
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify(userData));
    } catch (e) {}
  }, [userData, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.allTasks, JSON.stringify(allTasks));
    } catch (e) {}
  }, [allTasks, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.allEvents, JSON.stringify(allEvents));
    } catch (e) {}
  }, [allEvents, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.inbox, JSON.stringify(inbox));
    } catch (e) {}
  }, [inbox, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.darkMode, JSON.stringify(darkMode));
    } catch (e) {}
  }, [darkMode, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    if (!['ONBOARDING', 'FOCUS', 'FOCUS_COMPLETE'].includes(view)) {
      try {
        localStorage.setItem(STORAGE_KEYS.view, view);
      } catch (e) {}
    }
  }, [view, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.gameState, JSON.stringify(gameState));
    } catch (e) {}
  }, [gameState, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.connections, JSON.stringify(connections));
    } catch (e) {}
  }, [connections, isInitialized]);
  
  // 연동 연결/해제 핸들러
  const handleConnect = (service) => {
    setConnections(prev => ({ ...prev, [service]: true }));
    showToast(`${service === 'googleCalendar' ? 'Google Calendar' : service === 'gmail' ? 'Gmail' : service} 연결 완료! 🎉`);
  };
  
  const handleDisconnect = (service) => {
    setConnections(prev => ({ ...prev, [service]: false }));
    showToast(`${service === 'googleCalendar' ? 'Google Calendar' : service === 'gmail' ? 'Gmail' : service} 연결 해제됨`);
  };
  
  // XP 획득 함수
  const earnXP = (amount, reason) => {
    const oldLevel = LEVEL_CONFIG.getLevel(gameState.totalXP).level;
    const newTotalXP = gameState.totalXP + amount;
    const newLevelInfo = LEVEL_CONFIG.getLevel(newTotalXP);
    
    // 주간 XP 업데이트
    const dayOfWeek = new Date().getDay();
    const newWeeklyXP = [...gameState.weeklyXP];
    newWeeklyXP[dayOfWeek] += amount;
    
    setGameState(prev => ({
      ...prev,
      totalXP: newTotalXP,
      todayXP: prev.todayXP + amount,
      weeklyXP: newWeeklyXP,
    }));
    
    // 레벨업 체크
    if (newLevelInfo.level > oldLevel) {
      setTimeout(() => {
        setShowLevelUp(newLevelInfo.level);
      }, 500);
    }
    
    showToast(`+${amount} XP! ${reason}`);
  };
  
  // 배지 확인 함수
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
      
      // 첫 번째 새 배지 표시
      setTimeout(() => {
        setShowNewBadge(newBadges[0]);
      }, 1000);
    }
  };
  
  // 태스크 완료 시 XP 처리 + 풍성한 피드백
  const handleTaskCompleteWithXP = (task, isBig3 = false) => {
    const hour = new Date().getHours();
    let xpEarned = task.importance === 'high' ? XP_REWARDS.taskCompleteHigh : XP_REWARDS.taskComplete;
    
    if (isBig3) {
      xpEarned += XP_REWARDS.big3Complete;
    }
    
    // 오전 보너스
    if (hour < 12 && isBig3) {
      xpEarned += 20;
    }
    
    // 🆕 풍성한 피드백 메시지 생성
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
    
    // 통계 업데이트
    const newStats = {
      ...gameState,
      totalCompleted: gameState.totalCompleted + 1,
      todayTasks: gameState.todayTasks + 1,
      level: LEVEL_CONFIG.getLevel(gameState.totalXP + xpEarned).level,
    };
    
    if (isBig3) {
      newStats.big3Completed = gameState.big3Completed + 1;
    }
    
    if (hour < 9) {
      newStats.earlyBirdCount = gameState.earlyBirdCount + 1;
    }
    
    if (hour >= 22) {
      newStats.nightOwlCount = gameState.nightOwlCount + 1;
    }
    
    setGameState(prev => ({
      ...prev,
      totalCompleted: newStats.totalCompleted,
      todayTasks: newStats.todayTasks,
      big3Completed: newStats.big3Completed || prev.big3Completed,
      earlyBirdCount: newStats.earlyBirdCount || prev.earlyBirdCount,
      nightOwlCount: newStats.nightOwlCount || prev.nightOwlCount,
    }));
    
    // 배지 확인
    checkBadges(newStats);
  };
  
  // 집중 세션 완료 시 XP 처리
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
  
  // 키보드 단축키 (Cmd/Ctrl + K로 검색)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
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
  
  // 토스트 메시지 표시
  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };
  
  // 🐧 알프레도 피드백 표시
  const showAlfredoFeedback = (message, type = 'praise', icon = '🐧') => {
    setAlfredoFeedback({ visible: true, message, type, icon });
    setTimeout(() => setAlfredoFeedback({ visible: false, message: '', type: 'praise', icon: '🐧' }), 3000);
  };
  
  // 🐧 태스크 완료 시 알프레도 반응 메시지
  const getTaskCompleteFeedback = (task, completedCount, totalCount, isStreak = false) => {
    // 전체 완료! 🎉
    if (completedCount === totalCount && totalCount > 0) {
      const messages = [
        { msg: "완벽해요! 오늘 할 일 끝!", icon: "🎉" },
        { msg: "대단해요! 다 끝냈어요!", icon: "✨" },
        { msg: "오늘의 영웅이에요!", icon: "🏆" },
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    
    // 연속 완료 (3개 이상)
    if (isStreak && completedCount >= 3) {
      const messages = [
        { msg: `${completedCount}연속! 흐름 좋아요!`, icon: "🔥" },
        { msg: `연속 ${completedCount}개! 멈추지 마요!`, icon: "⚡" },
        { msg: `${completedCount}연타! 달리고 있어요!`, icon: "🚀" },
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    
    // 거의 다 완료 (1개 남음)
    if (completedCount === totalCount - 1 && totalCount > 1) {
      const messages = [
        { msg: "마지막 하나! 거의 다 왔어요!", icon: "🏁" },
        { msg: "하나 남았어요! 조금만 더!", icon: "💪" },
        { msg: "끝이 보여요! 파이팅!", icon: "✨" },
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    
    // 절반 이상
    if (completedCount === Math.ceil(totalCount / 2)) {
      const messages = [
        { msg: "절반 왔어요! 잘하고 있어요!", icon: "👏" },
        { msg: "반 넘었어요! 이 페이스 좋아요!", icon: "🎯" },
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    
    // 첫 번째 완료
    if (completedCount === 1) {
      const messages = [
        { msg: "첫 번째 완료! 시작이 반이에요!", icon: "🌟" },
        { msg: "좋은 시작이에요! 계속 가요!", icon: "👍" },
        { msg: "하나 끝! 멋진 출발이에요!", icon: "✨" },
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    
    // 일반 완료
    const messages = [
      { msg: "잘했어요! 👏", icon: "🐧" },
      { msg: "멋져요! 다음은 뭐 할까요?", icon: "✨" },
      { msg: "해냈네요! 💪", icon: "🐧" },
      { msg: "역시 Boss!", icon: "👑" },
      { msg: "Good job!", icon: "👍" },
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  // 칭찬 메시지 랜덤 선택
  const getPraiseMessage = (completedCount, total) => {
    if (completedCount === total) {
      return '완벽해요! 오늘 할 일 끝! 🎉';
    }
    const praises = ['멋져요! 👏', '잘했어요! ✨', '해냈네요! 💪', '역시 Boss! 🐧'];
    return praises[Math.floor(Math.random() * praises.length)];
  };
  
  const handleToggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const isCompleting = task && task.status !== 'done';
    
    const newTasks = tasks.map(t => 
      t.id === taskId 
        ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
        : t
    );
    setTasks(newTasks);
    
    // 완료했을 때 XP & 알프레도 피드백 & Phase 6 celebration
    if (isCompleting && task) {
      handleTaskCompleteWithXP(task, true); // Big3은 항상 true
      const completedCount = newTasks.filter(t => t.status === 'done').length;
      const totalCount = newTasks.length;
      const isAllComplete = completedCount === totalCount;
      
      // Phase 6: 스트릭 계산 (5분 이내 연속 완료)
      const now = Date.now();
      const streakTimeout = 5 * 60 * 1000; // 5분
      let newStreak = 1;
      if (lastCompletionTime && (now - lastCompletionTime) < streakTimeout) {
        newStreak = completionStreak + 1;
      }
      setCompletionStreak(newStreak);
      setLastCompletionTime(now);
      
      // 🐧 알프레도 피드백
      const feedback = getTaskCompleteFeedback(task, completedCount, totalCount, newStreak >= 3);
      showAlfredoFeedback(feedback.msg, 'praise', feedback.icon);
      
      // Phase 6: Celebration 트리거
      const celebrationType = isAllComplete ? 'big3' : newStreak >= 3 ? 'streak' : 'task';
      const xpAmount = task.importance === 'high' ? 20 : task.importance === 'medium' ? 15 : 10;
      
      setCelebration({
        visible: true,
        type: celebrationType,
        data: {
          xp: xpAmount,
          streak: newStreak,
          taskTitle: task.title,
          completedCount,
          totalCount,
        }
      });
      
      // Big3 전체 완료 보너스
      if (isAllComplete) {
        earnXP(XP_REWARDS.allBig3Complete, '🎉 Big3 전체 완료 보너스!');
      }
    }
  };
  
  // WORK 페이지용 토글
  const handleToggleAllTask = (taskId) => {
    const task = allTasks.find(t => t.id === taskId);
    const isCompleting = task && task.status !== 'done';
    const prevCompletedCount = allTasks.filter(t => t.status === 'done').length;
    
    const newTasks = allTasks.map(t => 
      t.id === taskId 
        ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
        : t
    );
    setAllTasks(newTasks);
    
    // 완료했을 때 XP & 알프레도 피드백 & Phase 6 celebration
    if (isCompleting && task) {
      handleTaskCompleteWithXP(task, false);
      const completedCount = newTasks.filter(t => t.status === 'done').length;
      
      // Phase 6: 스트릭 계산
      const now = Date.now();
      const streakTimeout = 5 * 60 * 1000;
      let newStreak = 1;
      if (lastCompletionTime && (now - lastCompletionTime) < streakTimeout) {
        newStreak = completionStreak + 1;
      }
      setCompletionStreak(newStreak);
      setLastCompletionTime(now);
      
      // 🐧 알프레도 피드백
      const feedback = getTaskCompleteFeedback(task, completedCount, newTasks.length, newStreak >= 3);
      showAlfredoFeedback(feedback.msg, 'praise', feedback.icon);
      
      // Phase 6: Celebration
      const xpAmount = task.importance === 'high' ? 15 : 10;
      setCelebration({
        visible: true,
        type: newStreak >= 3 ? 'streak' : 'task',
        data: {
          xp: xpAmount,
          streak: newStreak,
          taskTitle: task.title,
          completedCount,
          totalCount: newTasks.length,
        }
      });
    }
  };
  
  // Phase 7: 루틴 핸들러들
  const handleAddRoutine = (routine) => {
    const newRoutines = [...routines, routine];
    setRoutines(newRoutines);
    localStorage.setItem('lifebutler_routines', JSON.stringify(newRoutines));
    showToast('🔄 새 루틴이 추가되었어요!');
  };
  
  const handleUpdateRoutine = (updatedRoutine) => {
    const newRoutines = routines.map(r => 
      r.id === updatedRoutine.id ? updatedRoutine : r
    );
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
    
    // 스트릭 계산 (완료 시)
    let newStreak = routine.streak;
    if (isJustCompleted) {
      const today = new Date().toDateString();
      const lastDone = routine.lastDoneDate;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (lastDone === yesterday) {
        newStreak = routine.streak + 1;
      } else if (lastDone !== today) {
        newStreak = 1;
      }
    }
    
    const newRoutines = routines.map(r => 
      r.id === routineId 
        ? { 
            ...r, 
            current: newCurrent,
            streak: newStreak,
            lastDoneDate: isJustCompleted ? new Date().toDateString() : r.lastDoneDate,
            history: isJustCompleted 
              ? [...(r.history || []), { date: new Date().toISOString(), completed: true }]
              : r.history
          } 
        : r
    );
    setRoutines(newRoutines);
    localStorage.setItem('lifebutler_routines', JSON.stringify(newRoutines));
    
    // 완료 시 피드백
    if (isJustCompleted) {
      const allDone = newRoutines.filter(r => r.current >= r.target).length === newRoutines.length;
      if (allDone) {
        showAlfredoFeedback('오늘 루틴 올클리어! 🎉', 'praise', '🏆');
        setCelebration({
          visible: true,
          type: 'all',
          data: { xp: 30, streak: newStreak }
        });
      } else if (newStreak >= 7) {
        showAlfredoFeedback(`${newStreak}일 연속! 습관이 되어가고 있어요! 🔥`, 'praise', '🔥');
      } else if (newStreak >= 3) {
        showAlfredoFeedback(`${newStreak}일째 연속 완료! 👏`, 'praise', '✨');
      } else {
        showAlfredoFeedback('루틴 완료! 잘하고 있어요 👍', 'praise', '🐧');
      }
      
      // XP 획득
      earnXP(10, '루틴 완료!');
    }
  };
  
  // 매일 자정에 루틴 리셋
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        const resetRoutines = routines.map(r => ({ ...r, current: 0 }));
        setRoutines(resetRoutines);
        localStorage.setItem('lifebutler_routines', JSON.stringify(resetRoutines));
      }
    };
    
    const interval = setInterval(checkMidnight, 60000); // 매분 체크
    return () => clearInterval(interval);
  }, [routines]);
  
  // 🐧 플로팅 버블에서 채팅 열기
  const handleOpenChatWithMessage = (messageData) => {
    setChatInitialMessage(messageData);
    setView('CHAT');
  };
  
  // 집중 모드 시작
  const handleStartFocus = (task) => {
    setFocusTask(task);
    setCurrentWorkingTask(task); // Phase 2: 시간 트래킹용
    setView('FOCUS');
  };
  
  // 집중 모드 완료 → 완료 화면으로 이동
  const handleFocusComplete = () => {
    if (focusTask) {
      // Phase 2: 시간 트래킹 중지
      setCurrentWorkingTask(null);
      
      // 태스크 완료 처리
      setAllTasks(allTasks.map(t => 
        t.id === focusTask.id ? { ...t, status: 'done' } : t
      ));
      
      // XP 획득 (집중 세션 + 태스크 완료)
      handleFocusCompleteWithXP(25); // 25분 포모도로 기준
      handleTaskCompleteWithXP(focusTask, false);
      
      // 오늘 완료 개수 계산
      const todayCompleted = allTasks.filter(t => t.status === 'done').length + 1;
      
      // 다음 태스크 찾기 (우선순위 높은 것)
      const remainingTasks = allTasks
        .filter(t => t.id !== focusTask.id && t.status !== 'done')
        .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
      const nextTask = remainingTasks[0] || null;
      
      // 완료 정보 저장
      setCompletedTaskInfo({
        task: focusTask,
        nextTask,
        stats: {
          focusTime: focusTask.duration || 25,
          todayCompleted,
          streak: mockCompletedHistory.stats.streak,
        }
      });
      
      setFocusTask(null);
      setView('FOCUS_COMPLETE');
    } else {
      setView('HOME');
    }
  };
  
  // 완료 화면에서 다음 태스크 시작
  const handleStartNextFromCompletion = (task) => {
    setFocusTask(task);
    setCompletedTaskInfo(null);
    setView('FOCUS');
  };
  
  // 완료 화면에서 홈으로
  const handleGoHomeFromCompletion = () => {
    setCompletedTaskInfo(null);
    setView('HOME');
    showToast('수고했어요! 🎉');
  };
  
  // Inbox → Task 전환
  const handleConvertToTask = (item) => {
    const newTask = {
      id: `task-${item.id}`,
      title: item.subject,
      project: 'Inbox',
      importance: item.urgent ? 'high' : 'medium',
      status: 'todo',
      priorityChange: 'new',
      priorityScore: item.urgent ? 85 : 65,
      priorityReason: 'Inbox에서 변환됨',
      sparkline: [0, 0, 30, 60, item.urgent ? 85 : 65],
      deadline: item.needReplyToday ? '오늘' : '내일',
      duration: 30,
    };
    
    setAllTasks([newTask, ...allTasks]);
    setInbox(inbox.filter(i => i.id !== item.id));
    showToast('Task로 전환했어요! 📋');
  };
  
  // 새 태스크 추가
  const handleAddTask = (task) => {
    setAllTasks([task, ...allTasks]);
    showToast('새 태스크가 추가되었어요! ✨');
  };
  
  // 태스크 수정
  const handleUpdateTask = (taskId, updates) => {
    setAllTasks(allTasks.map(t => 
      t.id === taskId 
        ? { ...t, ...updates, priorityScore: updates.importance === 'high' ? 85 : updates.importance === 'medium' ? 65 : 45 }
        : t
    ));
    showToast('태스크가 수정되었어요! ✏️');
  };
  
  // 태스크 삭제
  const handleDeleteTask = (taskId) => {
    setAllTasks(allTasks.filter(t => t.id !== taskId));
    showToast('태스크가 삭제되었어요 🗑️');
  };
  
  // 채팅에서 태스크 추가
  const handleAddTaskFromChat = (title) => {
    const newTask = {
      id: `task-chat-${Date.now()}`,
      title: title,
      project: '기타',
      importance: 'medium',
      status: 'todo',
      priorityChange: 'new',
      priorityScore: 60,
      priorityReason: '채팅에서 추가됨',
      sparkline: [0, 0, 30, 50, 60],
      deadline: '오늘',
      duration: 30,
    };
    
    setAllTasks([newTask, ...allTasks]);
    showToast('할 일 추가했어요! 📋');
  };
  
  // === 일정(Event) CRUD ===
  const handleAddEvent = (event) => {
    setAllEvents([...allEvents, event]);
    showToast('일정이 추가되었어요! 📅');
  };
  
  const handleUpdateEvent = (eventId, updates) => {
    setAllEvents(allEvents.map(e => 
      e.id === eventId ? { ...e, ...updates } : e
    ));
    showToast('일정이 수정되었어요! ✏️');
  };
  
  const handleDeleteEvent = (eventId) => {
    setAllEvents(allEvents.filter(e => e.id !== eventId));
    showToast('일정이 삭제되었어요 🗑️');
  };
  
  // === 드래그 앤 드롭 시간 변경 ===
  const handleUpdateTaskTime = (taskId, newTime) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, scheduledTime: newTime } : t
    ));
    setAllTasks(allTasks.map(t => 
      t.id === taskId ? { ...t, scheduledTime: newTime } : t
    ));
    showToast(`⏰ ${newTime}에 배정했어요!`);
  };
  
  const handleUpdateEventTime = (eventId, newTime) => {
    setAllEvents(allEvents.map(e => {
      if (e.id === eventId) {
        // 기존 duration 유지하면서 시간만 변경
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
    showToast(`⏰ ${newTime}으로 이동했어요!`);
  };
  
  // Google Calendar 일정 동기화
  const handleSyncGoogleEvents = (googleEvents) => {
    console.log('📥 handleSyncGoogleEvents 호출됨!');
    console.log('📊 받은 일정 수:', googleEvents.length);
    console.log('📊 샘플:', googleEvents.slice(0, 2));
    
    setAllEvents(prev => {
      console.log('📊 기존 일정 수:', prev.length);
      // 기존 Google 일정 제거 (새로 불러온 것으로 대체)
      const localEvents = prev.filter(e => !e.fromGoogle);
      
      // 중복 체크 - 같은 googleEventId가 있으면 로컬 일정 우선
      const localGoogleIds = new Set(localEvents.filter(e => e.googleEventId).map(e => e.googleEventId));
      const newGoogleEvents = googleEvents.filter(ge => !localGoogleIds.has(ge.googleEventId));
      
      console.log('📊 로컬 일정:', localEvents.length);
      console.log('📊 새 Google 일정:', newGoogleEvents.length);
      console.log('📊 총 결과:', localEvents.length + newGoogleEvents.length);
      
      return [...localEvents, ...newGoogleEvents];
    });
    showToast(`Google Calendar 동기화 완료! 🔄`);
  };
  
  // 다크모드 배경색
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  
  return (
    <div className={`w-full h-screen ${bgColor} overflow-hidden flex flex-col font-sans transition-colors duration-300`}>
      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} darkMode={darkMode} />
      
      {/* 🐧 알프레도 피드백 */}
      <AlfredoFeedback 
        visible={alfredoFeedback.visible}
        message={alfredoFeedback.message}
        type={alfredoFeedback.type}
        icon={alfredoFeedback.icon}
        darkMode={darkMode}
      />
      
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {/* 오프라인 배너 */}
        <OfflineBanner isOffline={isOffline} />
        
        {/* 방해 금지 배너 */}
        <DoNotDisturbBanner 
          isActive={doNotDisturb}
          remainingTime={dndRemainingTime}
          onDisable={disableDoNotDisturb}
        />
        
        {/* PWA 설치 배너 */}
        <PWAInstallBanner 
          show={showPWAInstall}
          onInstall={handlePWAInstall}
          onDismiss={handlePWADismiss}
        />
        
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
            onSaveEvent={(eventData) => {
              if (eventData.id) {
                handleUpdateEvent(eventData.id, eventData);
              } else {
                handleAddEvent({ ...eventData, id: `event-${Date.now()}` });
              }
            }}
            onDeleteEvent={handleDeleteEvent}
            onUpdateTaskTime={handleUpdateTaskTime}
            onUpdateEventTime={handleUpdateEventTime}
            routines={routines}
            onToggleRoutine={handleToggleRoutine}
            onOpenRoutineManager={() => setShowRoutineManager(true)}
          />
        )}
        {view === 'SETTINGS' && (
          <SettingsPage 
            userData={userData}
            onUpdateUserData={setUserData}
            onBack={() => setView('HOME')}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onOpenWidgetGallery={() => setView('WIDGET_GALLERY')}
            connections={connections}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        )}
        {view === 'WIDGET_GALLERY' && (
          <WidgetGallery 
            onBack={() => setView('SETTINGS')}
            tasks={tasks}
            events={allEvents}
            mood={userData.mood}
            energy={userData.energy}
            darkMode={darkMode}
          />
        )}
        {view === 'PROJECT_DASHBOARD' && (
          <ProjectDashboardPage 
            onBack={() => setView('HOME')}
            projects={projects}
            allTasks={allTasks}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            darkMode={darkMode}
          />
        )}
        {view === 'WEEKLY_REVIEW' && (
          <WeeklyReviewPage 
            onBack={() => setView('HOME')}
            gameState={gameState}
            allTasks={allTasks}
            darkMode={darkMode}
          />
        )}
        {view === 'HABIT_HEATMAP' && (
          <HabitHeatmapPage 
            onBack={() => setView('HOME')}
            gameState={gameState}
            darkMode={darkMode}
          />
        )}
        {view === 'ENERGY_RHYTHM' && (
          <EnergyRhythmPage 
            onBack={() => setView('HOME')}
            gameState={gameState}
            userData={userData}
            darkMode={darkMode}
          />
        )}
        {view === 'CALENDAR' && (
          <CalendarPage 
            onBack={() => setView('HOME')}
            tasks={tasks}
            allTasks={allTasks}
            events={allEvents}
            darkMode={darkMode}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onUpdateTask={handleUpdateTask}
            onSyncGoogleEvents={handleSyncGoogleEvents}
          />
        )}
        {view === 'CHAT' && (
          <AlfredoChat 
            onBack={() => { setChatInitialMessage(null); setView('HOME'); }} 
            tasks={tasks} 
            events={allEvents}
            mood={userData.mood}
            energy={userData.energy}
            onAddTask={handleAddTaskFromChat}
            onStartFocus={handleStartFocus}
            initialMessage={chatInitialMessage}
          />
        )}
        {view === 'WORK' && (
          <WorkPage 
            tasks={allTasks} 
            onToggleTask={handleToggleAllTask} 
            onStartFocus={handleStartFocus}
            inbox={inbox}
            onConvertToTask={handleConvertToTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onOpenChat={handleOpenChatWithMessage}
            darkMode={darkMode}
            events={allEvents}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
        {view === 'FOCUS' && (
          <FocusTimer 
            task={focusTask} 
            onComplete={handleFocusComplete}
            onExit={() => { setFocusTask(null); setView('HOME'); }}
          />
        )}
        {view === 'FOCUS_COMPLETE' && completedTaskInfo && (
          <FocusCompletionScreen 
            completedTask={completedTaskInfo.task}
            nextTask={completedTaskInfo.nextTask}
            stats={completedTaskInfo.stats}
            onStartNext={handleStartNextFromCompletion}
            onGoHome={handleGoHomeFromCompletion}
          />
        )}
        {view === 'LIFE' && (
          <LifePage 
            mood={userData.mood}
            setMood={m => setUserData({...userData, mood: m})}
            energy={userData.energy}
            setEnergy={e => setUserData({...userData, energy: e})}
            onOpenChat={handleOpenChatWithMessage}
            darkMode={darkMode}
          />
        )}
      </div>
      
      {/* 플로팅 버튼들 - 알프레도 메시지 카드 아래에 배치되도록 */}
      {showNav && (
        <div className="fixed bottom-36 right-4 z-30 flex flex-col items-end gap-3">
          {/* Phase 4: 자연어 빠른 추가 버튼 */}
          <button 
            onClick={() => setShowNLQuickAdd(true)} 
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200 hover:scale-105 transition-all group"
            title="빠른 추가 (자연어)"
          >
            <Sparkles size={20} className="text-[#A996FF] group-hover:text-[#8B7CF7] transition-colors" />
          </button>
          
          {/* 기존 빠른 기록 버튼 */}
          <button 
            onClick={() => setShowQuickCapture(true)} 
            className="w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center border border-gray-100 hover:scale-105 transition-all"
            title="빠른 기록"
          >
            <Plus size={18} className="text-gray-500" />
          </button>
          
          {/* 알프레도 채팅 버튼 */}
          <button 
            onClick={() => setView('CHAT')} 
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] shadow-xl shadow-[#A996FF]/30 flex items-center justify-center ring-4 ring-white/30"
          >
            <span className="text-2xl">🐧</span>
          </button>
        </div>
      )}
      
      {/* Phase 4: Natural Language Quick Add */}
      {showNLQuickAdd && (
        <NaturalLanguageQuickAdd
          isOpen={showNLQuickAdd}
          onClose={() => setShowNLQuickAdd(false)}
          onAddTask={(task) => {
            setTasks([task, ...tasks]);
            setAllTasks([task, ...allTasks]);
            showToast('✅ 할 일이 추가되었어요!');
          }}
          onAddEvent={(event) => {
            setAllEvents([event, ...allEvents]);
            showToast('📅 일정이 추가되었어요!');
          }}
          darkMode={darkMode}
        />
      )}
      
      {/* Quick Capture Modal */}
      {showQuickCapture && (
        <QuickCaptureModal 
          onClose={() => setShowQuickCapture(false)}
          onAddTask={(task) => {
            setAllTasks([task, ...allTasks]);
            showToast('할 일이 추가되었어요! ✅');
            setShowQuickCapture(false);
          }}
          onAddToInbox={(item) => {
            setInbox([item, ...inbox]);
            showToast('인박스에 저장했어요! 📥');
            setShowQuickCapture(false);
          }}
          onOpenMeetingUploader={() => setShowMeetingUploader(true)}
        />
      )}
      
      {/* Meeting Uploader Modal */}
      {showMeetingUploader && (
        <MeetingUploader
          onClose={() => setShowMeetingUploader(false)}
          darkMode={darkMode}
          onAddTasks={(tasks) => {
            setAllTasks([...tasks, ...allTasks]);
            showToast(`${tasks.length}개 할 일이 추가되었어요! ✅`);
          }}
          onAddEvents={(events) => {
            // events를 캘린더에 추가하는 로직
            showToast(`${events.length}개 일정이 추가되었어요! 📅`);
          }}
          onAddToInbox={(items) => {
            const newInboxItems = items.map(item => ({
              id: item.id,
              type: 'idea',
              subject: item.text,
              preview: '💡 회의에서 나온 아이디어',
              time: '방금',
              fromMeeting: item.fromMeeting,
            }));
            setInbox([...newInboxItems, ...inbox]);
            showToast(`${items.length}개 아이디어가 인박스에 저장되었어요! 💡`);
          }}
        />
      )}
      
      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        tasks={allTasks}
        events={allEvents}
        onSelectTask={(task) => {
          setView('WORK');
        }}
        onSelectEvent={(event) => {
          setView('WORK');
        }}
      />
      
      {/* Gamification Modals */}
      <LevelUpModal 
        level={showLevelUp} 
        onClose={() => setShowLevelUp(null)} 
      />
      <NewBadgeModal 
        badge={showNewBadge} 
        onClose={() => setShowNewBadge(null)} 
      />
      <StatsModal 
        isOpen={showStatsModal} 
        onClose={() => setShowStatsModal(false)} 
        gameState={gameState}
      />
      <DoNotDisturbModal 
        isOpen={showDndModal}
        onClose={() => setShowDndModal(false)}
        onEnable={enableDoNotDisturb}
        currentDuration={25}
      />
      
      {/* Phase 6: 완료 축하 효과 */}
      <CompletionCelebration
        type={celebration.type}
        data={celebration.data}
        isVisible={celebration.visible}
        onClose={() => setCelebration({ visible: false, type: null, data: null })}
      />
      
      {/* Phase 6: 레벨업 축하 (강화) */}
      <LevelUpCelebration
        isOpen={showLevelUp !== null}
        level={showLevelUp}
        onClose={() => setShowLevelUp(null)}
      />
      
      {/* Phase 7: 루틴 관리 모달 */}
      <RoutineManagerModal
        isOpen={showRoutineManager}
        onClose={() => setShowRoutineManager(false)}
        routines={routines}
        onAddRoutine={handleAddRoutine}
        onUpdateRoutine={handleUpdateRoutine}
        onDeleteRoutine={handleDeleteRoutine}
        onToggleRoutine={handleToggleRoutine}
        darkMode={darkMode}
      />
      
      {/* Phase 9: 스마트 알림 토스트 */}
      {!doNotDisturb && view !== 'FOCUS' && (
        <SmartNotificationToast
          notifications={smartNotifications.notifications}
          onDismiss={smartNotifications.dismissNotification}
          onAction={handleNotificationAction}
          darkMode={darkMode}
          maxShow={2}
        />
      )}
      
      {/* Phase 9: 알림 센터 */}
      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        notifications={smartNotifications.notifications}
        onDismiss={smartNotifications.dismissNotification}
        onDismissAll={smartNotifications.dismissAll}
        onAction={handleNotificationAction}
        darkMode={darkMode}
      />
      
      {/* Phase 2: 시간 알림 토스트 */}
      {!doNotDisturb && (
        <TimeAlertToast
          alert={timeTracking.activeAlert}
          onAction={handleTimeAlertAction}
          onDismiss={timeTracking.dismissAlert}
          darkMode={darkMode}
        />
      )}
      
      {/* 알프레도 상태바 */}
      {showNav && (() => {
        // 다음 일정 계산 (오늘, 현재 시간 이후)
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        const todayEvents = allEvents
          .filter(e => e.date === todayStr && e.start)
          .map(e => {
            const [h, m] = e.start.split(':').map(Number);
            const eventMinutes = h * 60 + m;
            return { ...e, eventMinutes, minutesUntil: eventMinutes - currentMinutes };
          })
          .filter(e => e.minutesUntil > 0)
          .sort((a, b) => a.minutesUntil - b.minutesUntil);
        
        const nextEvent = todayEvents[0] ? {
          title: todayEvents[0].title,
          start: todayEvents[0].start,
          minutesUntil: todayEvents[0].minutesUntil
        } : null;
        
        // 마감 임박 태스크 (오늘 마감, 미완료)
        const urgentTask = allTasks.find(t => 
          !t.completed && 
          t.deadline === todayStr
        );
        
        return (
          <AlfredoStatusBar
            completedTasks={allTasks.filter(t => t.completed).length}
            totalTasks={allTasks.length}
            currentTask={focusTask?.title}
            nextEvent={nextEvent}
            urgentTask={urgentTask ? { title: urgentTask.title } : null}
            energy={userData.energy}
            mood={userData.mood}
            // Phase 2: 시간 트래킹 props
            taskElapsedMinutes={timeTracking.getElapsedTime()}
            taskEstimatedMinutes={currentWorkingTask?.estimatedMinutes || currentWorkingTask?.duration || 0}
            sessionMinutes={timeTracking.getSessionTime()}
            onOpenChat={() => setView('CHAT')}
            darkMode={darkMode}
          />
        );
      })()}
      
      {showNav && (
        <nav className={`h-20 ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-xl border-t ${darkMode ? 'border-gray-700' : 'border-black/5'} flex items-center justify-around px-4 pb-4`}>
          {navItems.map(({ view: v, icon: Icon, label }) => (
            <button key={v} onClick={() => setView(v)} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${view === v ? 'text-[#A996FF] bg-[#A996FF]/10' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <Icon size={22} strokeWidth={view === v ? 2.5 : 2} />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
