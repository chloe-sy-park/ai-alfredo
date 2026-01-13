import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Home, Calendar, Briefcase, Heart, MoreHorizontal
} from 'lucide-react';

// 🔐 인증 스토어
import { useAuthStore } from './stores/authStore';
// 🐧 펭귄 스토어
import { usePenguinStore } from './stores/penguinStore';

// 📦 유틸리티
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from './utils/storage';

// 🔐 인증 페이지
import LoginPage from './components/auth/LoginPage';
import AuthCallbackPage from './components/auth/AuthCallbackPage';

// 🐧 펭귄 상태바
import PenguinStatusBar from './components/common/PenguinStatusBar';

// 페이지 컴포넌트
import HomePage from './components/home/HomePage';
import Onboarding from './components/home/Onboarding';
import WorkPage from './components/work/WorkPage';
import CalendarPage from './components/calendar/CalendarPage';
import LifePage from './components/life/LifePage';
import MorePage from './components/more/MorePage';
import AlfredoChat from './components/chat/AlfredoChat';
import FocusPage from './components/focus/FocusPage';
import BodyDoublingMode from './components/focus/BodyDoublingMode';
import SettingsPage from './components/settings/SettingsPage';
import WeeklyReviewPage from './components/review/WeeklyReviewPage';
import HabitHeatmapPage from './components/review/HabitHeatmapPage';
import EnergyRhythmPage from './components/review/EnergyRhythmPage';
import ProjectDashboardPage from './components/projects/ProjectDashboardPage';
import InboxPage from './components/work/InboxPage';
import TomorrowPrep from './components/tomorrow/TomorrowPrep';

// 모달 컴포넌트
import EventModal from './components/modals/EventModal';
import TaskModal from './components/modals/TaskModal';
import AddTaskModal from './components/modals/AddTaskModal';
import RoutineManageModal from './components/modals/RoutineManageModal';
import SearchModal from './components/modals/SearchModal';
import QuickCaptureModal from './components/modals/QuickCaptureModal';
import GoogleAuthModal from './components/modals/GoogleAuthModal';
import MoodLogModal from './components/modals/MoodLogModal';
import JournalModal from './components/modals/JournalModal';
import HealthEditModal from './components/modals/HealthEditModal';

// 알림 - AlfredoNudge로 통합
import AlfredoNudge from './components/common/AlfredoNudge';

// 🤗 실패 케어 시스템
import { DayEndModal } from './components/common/FailureCareSystem';

// 훅
import { useGoogleCalendar } from './hooks/useGoogleCalendar';
import { useGmail } from './hooks/useGmail';
import { useTimeTracking } from './hooks/useTimeTracking';
import { useDNAEngine } from './hooks/useDNAEngine';
import { useDayEndCare } from './hooks/useDayEndCare';
import { useTimeEstimator } from './hooks/useTimeEstimator';

// 데이터
import { mockTasks, mockProjects, mockRoutines, mockWeather, mockRelationships } from './data/mockData';

// 상수
import { COLORS } from './constants/colors';

function App() {
  // 🔐 인증 상태
  var authStore = useAuthStore();
  var isAuthenticated = authStore.isAuthenticated;
  var isAuthLoading = authStore.isLoading;
  var authUser = authStore.user;
  var initializeAuth = authStore.initialize;
  
  // 🐧 온보딩 상태 (W2)
  var onboardingState = useState(function() {
    return !localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  });
  var showOnboarding = onboardingState[0];
  var setShowOnboarding = onboardingState[1];
  
  // 현재 페이지 상태
  var pageState = useState(function() {
    if (window.location.pathname === '/auth/callback' || window.location.search.includes('code=')) {
      return 'AUTH_CALLBACK';
    }
    return 'HOME';
  });
  var currentPage = pageState[0];
  var setCurrentPage = pageState[1];
  
  // 이전 페이지 (채팅 후 복귀용)
  var previousPageState = useState('HOME');
  var previousPage = previousPageState[0];
  var setPreviousPage = previousPageState[1];
  
  // 넛지 표시 상태
  var nudgeState = useState(null);
  var currentNudge = nudgeState[0];
  var setCurrentNudge = nudgeState[1];
  
  // 앱 상태
  var tasksState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.TASKS);
    return saved || mockTasks;
  });
  var tasks = tasksState[0];
  var setTasks = tasksState[1];
  
  var eventsState = useState([]);
  var events = eventsState[0];
  var setEvents = eventsState[1];
  
  var projectsState = useState(mockProjects);
  var projects = projectsState[0];
  var setProjects = projectsState[1];
  
  var routinesState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.ROUTINES);
    return saved || mockRoutines;
  });
  var routines = routinesState[0];
  var setRoutines = routinesState[1];
  
  var relationshipsState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.RELATIONSHIPS);
    return saved || mockRelationships;
  });
  var relationships = relationshipsState[0];
  var setRelationships = relationshipsState[1];
  
  var healthDataState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.HEALTH);
    return saved || { steps: 6234, water: 5, sleep: 7.5, heartRate: 72 };
  });
  var healthData = healthDataState[0];
  var setHealthData = healthDataState[1];
  
  // 컨디션 상태 (DNA 연동)
  var moodState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.MOOD);
    return saved || 3;
  });
  var mood = moodState[0];
  var setMood = moodState[1];
  
  var energyState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.ENERGY);
    return saved || 3;
  });
  var energy = energyState[0];
  var setEnergy = energyState[1];
  
  // 다크 모드 (localStorage에서 로드)
  var darkModeState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.DARK_MODE);
    return saved !== null ? saved : false;
  });
  var darkMode = darkModeState[0];
  var setDarkMode = darkModeState[1];
  
  // 날씨 상태
  var weatherState = useState(mockWeather);
  var weather = weatherState[0];
  var setWeather = weatherState[1];
  
  // 모달 상태들
  var showEventModalState = useState(false);
  var showEventModal = showEventModalState[0];
  var setShowEventModal = showEventModalState[1];
  
  var showTaskModalState = useState(false);
  var showTaskModal = showTaskModalState[0];
  var setShowTaskModal = showTaskModalState[1];
  
  var showAddTaskModalState = useState(false);
  var showAddTaskModal = showAddTaskModalState[0];
  var setShowAddTaskModal = showAddTaskModalState[1];
  
  var showRoutineModalState = useState(false);
  var showRoutineModal = showRoutineModalState[0];
  var setShowRoutineModal = showRoutineModalState[1];
  
  var showSearchModalState = useState(false);
  var showSearchModal = showSearchModalState[0];
  var setShowSearchModal = showSearchModalState[1];
  
  var showQuickCaptureState = useState(false);
  var showQuickCapture = showQuickCaptureState[0];
  var setShowQuickCapture = showQuickCaptureState[1];
  
  var showGoogleAuthState = useState(false);
  var showGoogleAuth = showGoogleAuthState[0];
  var setShowGoogleAuth = showGoogleAuthState[1];
  
  var showDayEndModalState = useState(false);
  var showDayEndModal = showDayEndModalState[0];
  var setShowDayEndModal = showDayEndModalState[1];
  
  var showMoodLogModalState = useState(false);
  var showMoodLogModal = showMoodLogModalState[0];
  var setShowMoodLogModal = showMoodLogModalState[1];
  
  var showJournalModalState = useState(false);
  var showJournalModal = showJournalModalState[0];
  var setShowJournalModal = showJournalModalState[1];
  
  var showHealthEditModalState = useState(false);
  var showHealthEditModal = showHealthEditModalState[0];
  var setShowHealthEditModal = showHealthEditModalState[1];
  
  // 선택된 항목
  var selectedEventState = useState(null);
  var selectedEvent = selectedEventState[0];
  var setSelectedEvent = selectedEventState[1];
  
  var selectedTaskState = useState(null);
  var selectedTask = selectedTaskState[0];
  var setSelectedTask = selectedTaskState[1];
  
  // 🔐 인증 초기화
  useEffect(function() {
    initializeAuth();
  }, [initializeAuth]);
  
  // 🌐 Google Calendar 연동
  var googleCalendar = useGoogleCalendar();
  var isConnected = googleCalendar.isConnected;
  var isLoading = googleCalendar.isLoading;
  var calendarEvents = googleCalendar.events;
  var fetchEvents = googleCalendar.fetchEvents;
  var createEvent = googleCalendar.createEvent;
  var updateEvent = googleCalendar.updateEvent;
  var deleteEvent = googleCalendar.deleteEvent;
  var disconnect = googleCalendar.disconnect;
  
  // 📧 Gmail 연동
  var gmail = useGmail();
  var gmailStats = gmail.stats;
  var getGmailBriefingMessage = gmail.getBriefingMessage;
  
  // 🧬 DNA 엔진
  var dnaEngine = useDNAEngine();
  var dnaProfile = dnaEngine.dnaProfile;
  var isAnalyzingDNA = dnaEngine.isAnalyzing;
  var analyzeCalendar = dnaEngine.analyzeCalendar;
  var getMorningBriefing = dnaEngine.getMorningBriefing;
  var getEveningMessage = dnaEngine.getEveningMessage;
  var dnaSuggestions = dnaEngine.suggestions;
  var dnaAnalysisPhase = dnaEngine.analysisPhase;
  var getStressLevel = dnaEngine.getStressLevel;
  var getBestFocusTime = dnaEngine.getBestFocusTime;
  var getPeakHours = dnaEngine.getPeakHours;
  var getChronotype = dnaEngine.getChronotype;
  var todayContext = dnaEngine.todayContext;
  var getSpecialAlerts = dnaEngine.getSpecialAlerts;
  var getBurnoutWarning = dnaEngine.getBurnoutWarning;
  var getTodayEnergyDrain = dnaEngine.getTodayEnergyDrain;
  var getRecommendedActions = dnaEngine.getRecommendedActions;
  var getBriefingTone = dnaEngine.getBriefingTone;
  
  var todayCompletedCount = useMemo(function() {
    var today = new Date().toDateString();
    return tasks.filter(function(t) {
      return t.completed && t.completedAt && new Date(t.completedAt).toDateString() === today;
    }).length;
  }, [tasks]);
  
  // 🤗 실패 케어 훅 (저녁 자동 트리거)
  var dayEndCare = useDayEndCare(todayCompletedCount, tasks.length);
  var dayEndShouldShow = dayEndCare.shouldShow;
  var dayEndCareType = dayEndCare.careType;
  var markDayEndAsShown = dayEndCare.markAsShown;
  var triggerDayEndManually = dayEndCare.triggerManually;
  
  // ⏱️ 시간 추정 코치 훅
  var timeEstimator = useTimeEstimator();
  var startTimeTimer = timeEstimator.startTimer;
  var stopTimeTimer = timeEstimator.stopTimer;
  var getTimeInsight = timeEstimator.getInsightMessage;
  var getSuggestedTime = timeEstimator.getSuggestedTime;
  var timeEstimatorData = timeEstimator.data;
  
  // 저녁 실패케어 자동 표시
  useEffect(function() {
    if (dayEndShouldShow && !showDayEndModal) {
      setShowDayEndModal(true);
    }
  }, [dayEndShouldShow]);
  
  // DNA 자동 분석
  useEffect(function() {
    if (events && events.length > 0 && analyzeCalendar && !isAnalyzingDNA) {
      var calendarEvents = events.map(function(e) {
        return {
          id: e.id || String(Date.now()),
          title: e.title || e.summary || '',
          start: new Date(e.start || e.startTime),
          end: new Date(e.end || e.endTime),
          isAllDay: e.isAllDay || false,
          location: e.location || '',
          description: e.description || ''
        };
      });
      analyzeCalendar(calendarEvents);
    }
  }, [events, analyzeCalendar, isAnalyzingDNA]);
  
  // Google Calendar 이벤트 동기화
  useEffect(function() {
    if (calendarEvents && calendarEvents.length > 0) {
      var formattedEvents = calendarEvents.map(function(event) {
        return {
          id: event.id,
          title: event.summary || event.title || '(제목 없음)',
          start: event.start ? (event.start.dateTime || event.start.date) : null,
          end: event.end ? (event.end.dateTime || event.end.date) : null,
          location: event.location || '',
          description: event.description || '',
          isAllDay: !event.start?.dateTime,
          color: event.colorId ? COLORS.calendar[event.colorId] : '#A996FF',
          source: 'google'
        };
      });
      setEvents(formattedEvents);
    }
  }, [calendarEvents]);
  
  // 데이터 저장 효과
  useEffect(function() { saveToStorage(STORAGE_KEYS.TASKS, tasks); }, [tasks]);
  useEffect(function() { saveToStorage(STORAGE_KEYS.ROUTINES, routines); }, [routines]);
  useEffect(function() { saveToStorage(STORAGE_KEYS.RELATIONSHIPS, relationships); }, [relationships]);
  useEffect(function() { saveToStorage(STORAGE_KEYS.HEALTH, healthData); }, [healthData]);
  useEffect(function() { saveToStorage(STORAGE_KEYS.DARK_MODE, darkMode); }, [darkMode]);
  useEffect(function() { saveToStorage(STORAGE_KEYS.MOOD, mood); }, [mood]);
  useEffect(function() { saveToStorage(STORAGE_KEYS.ENERGY, energy); }, [energy]);
  
  // 핸들러들
  var handlePageChange = useCallback(function(page) {
    if (page === 'CHAT') {
      setPreviousPage(currentPage);
    }
    setCurrentPage(page);
  }, [currentPage]);
  
  var handleGoogleAuthSuccess = useCallback(function() {
    setShowGoogleAuth(false);
    fetchEvents();
  }, [fetchEvents]);
  
  var handleOpenChat = useCallback(function() {
    setPreviousPage(currentPage);
    setCurrentPage('CHAT');
  }, [currentPage]);
  
  var handleBackFromChat = useCallback(function() {
    setCurrentPage(previousPage);
  }, [previousPage]);
  
  var handleOpenEvent = useCallback(function(event) {
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);
  
  var handleOpenTask = useCallback(function(task) {
    setSelectedTask(task);
    setShowTaskModal(true);
  }, []);
  
  var handleOpenAddTask = useCallback(function(defaultDate) {
    setSelectedTask(defaultDate ? { dueDate: defaultDate } : null);
    setShowAddTaskModal(true);
  }, []);
  
  var handleToggleTask = useCallback(function(taskId) {
    setTasks(function(prev) {
      return prev.map(function(t) {
        if (t.id === taskId) {
          return Object.assign({}, t, { 
            completed: !t.completed,
            completedAt: !t.completed ? new Date().toISOString() : null
          });
        }
        return t;
      });
    });
  }, []);
  
  var handleSaveTask = useCallback(function(taskData) {
    if (selectedTask && selectedTask.id) {
      setTasks(function(prev) {
        return prev.map(function(t) {
          return t.id === selectedTask.id ? Object.assign({}, t, taskData) : t;
        });
      });
    } else {
      var newTask = Object.assign({
        id: 'task_' + Date.now(),
        completed: false,
        createdAt: new Date().toISOString()
      }, taskData);
      setTasks(function(prev) { return prev.concat([newTask]); });
    }
    setShowTaskModal(false);
    setShowAddTaskModal(false);
    setSelectedTask(null);
  }, [selectedTask]);
  
  var handleDeleteTask = useCallback(function(taskId) {
    setTasks(function(prev) { return prev.filter(function(t) { return t.id !== taskId; }); });
    setShowTaskModal(false);
    setSelectedTask(null);
  }, []);
  
  var handleSaveEvent = useCallback(function(eventData) {
    if (selectedEvent && selectedEvent.id) {
      if (selectedEvent.source === 'google') {
        updateEvent(selectedEvent.id, {
          summary: eventData.title,
          start: { dateTime: eventData.start },
          end: { dateTime: eventData.end },
          location: eventData.location,
          description: eventData.description
        });
      }
      setEvents(function(prev) {
        return prev.map(function(e) {
          return e.id === selectedEvent.id ? Object.assign({}, e, eventData) : e;
        });
      });
    } else {
      if (isConnected) {
        createEvent({
          summary: eventData.title,
          start: { dateTime: eventData.start },
          end: { dateTime: eventData.end },
          location: eventData.location,
          description: eventData.description
        });
      }
      var newEvent = Object.assign({
        id: 'event_' + Date.now()
      }, eventData);
      setEvents(function(prev) { return prev.concat([newEvent]); });
    }
    setShowEventModal(false);
    setSelectedEvent(null);
  }, [selectedEvent, isConnected, createEvent, updateEvent]);
  
  var handleDeleteEvent = useCallback(function(eventId) {
    var event = events.find(function(e) { return e.id === eventId; });
    if (event && event.source === 'google') {
      deleteEvent(eventId);
    }
    setEvents(function(prev) { return prev.filter(function(e) { return e.id !== eventId; }); });
    setShowEventModal(false);
    setSelectedEvent(null);
  }, [events, deleteEvent]);
  
  var handleSaveRoutine = useCallback(function(routineData) {
    if (routineData.id) {
      setRoutines(function(prev) {
        return prev.map(function(r) {
          return r.id === routineData.id ? routineData : r;
        });
      });
    } else {
      var newRoutine = Object.assign({ id: 'routine_' + Date.now() }, routineData);
      setRoutines(function(prev) { return prev.concat([newRoutine]); });
    }
  }, []);
  
  var handleDeleteRoutine = useCallback(function(routineId) {
    setRoutines(function(prev) { return prev.filter(function(r) { return r.id !== routineId; }); });
  }, []);
  
  var handleUpdateRelationship = useCallback(function(id, updates) {
    setRelationships(function(prev) {
      return prev.map(function(r) {
        return r.id === id ? Object.assign({}, r, updates) : r;
      });
    });
  }, []);
  
  var handleAddRelationship = useCallback(function(relationship) {
    var newRelationship = Object.assign({ id: 'rel_' + Date.now() }, relationship);
    setRelationships(function(prev) { return prev.concat([newRelationship]); });
  }, []);
  
  var handleDeleteRelationship = useCallback(function(id) {
    setRelationships(function(prev) { return prev.filter(function(r) { return r.id !== id; }); });
  }, []);
  
  var handleQuickCapture = useCallback(function(data) {
    if (data.type === 'task') {
      var newTask = {
        id: 'task_' + Date.now(),
        title: data.title,
        completed: false,
        priority: 'medium',
        domain: 'work',
        createdAt: new Date().toISOString()
      };
      setTasks(function(prev) { return prev.concat([newTask]); });
    } else if (data.type === 'event') {
      var newEvent = {
        id: 'event_' + Date.now(),
        title: data.title,
        start: data.start || new Date().toISOString(),
        end: data.end || new Date(Date.now() + 3600000).toISOString()
      };
      setEvents(function(prev) { return prev.concat([newEvent]); });
    }
    setShowQuickCapture(false);
  }, []);
  
  var handleOpenRoutineManager = useCallback(function() {
    setShowRoutineModal(true);
  }, []);
  
  var handleStartFocus = useCallback(function(task) {
    setSelectedTask(task);
    setCurrentPage('FOCUS');
  }, []);
  
  var handleStartBodyDoubling = useCallback(function(task) {
    setSelectedTask(task);
    setCurrentPage('BODY_DOUBLING');
  }, []);
  
  var handleOpenReminder = useCallback(function() {
    setCurrentNudge({ type: 'reminder', message: '알림 설정' });
  }, []);
  
  var handleOpenSearch = useCallback(function() {
    setShowSearchModal(true);
  }, []);
  
  var handleOpenInbox = useCallback(function() {
    setCurrentPage('INBOX');
  }, []);
  
  var handleOpenProject = useCallback(function(projectId) {
    setCurrentPage('PROJECT_DASHBOARD');
  }, []);
  
  var handleOpenTomorrowPrep = useCallback(function() {
    setCurrentPage('TOMORROW_PREP');
  }, []);
  
  var handleSaveMoodLog = useCallback(function(data) {
    setMood(data.mood);
    setEnergy(data.energy);
    setShowMoodLogModal(false);
  }, []);
  
  var handleOpenMoodLog = useCallback(function() {
    setShowMoodLogModal(true);
  }, []);
  
  var handleOpenJournal = useCallback(function() {
    setShowJournalModal(true);
  }, []);
  
  var handleSaveJournal = useCallback(function(journalData) {
    console.log('Journal saved:', journalData);
    setShowJournalModal(false);
  }, []);
  
  var handleEditHealth = useCallback(function() {
    setShowHealthEditModal(true);
  }, []);
  
  var handleSaveHealth = useCallback(function(data) {
    setHealthData(data);
    setShowHealthEditModal(false);
  }, []);
  
  var handleCompleteOnboarding = useCallback(function() {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    setShowOnboarding(false);
  }, []);
  
  // 공통 props
  var commonProps = {
    darkMode: darkMode,
    setDarkMode: setDarkMode,
    weather: weather,
    mood: mood,
    energy: energy,
    setMood: setMood,
    setEnergy: setEnergy
  };
  
  // 온보딩
  if (showOnboarding) {
    return React.createElement(Onboarding, { onComplete: handleCompleteOnboarding, darkMode: darkMode });
  }
  
  // 인증 콜백 처리
  if (currentPage === 'AUTH_CALLBACK') {
    return React.createElement(AuthCallbackPage);
  }
  
  // 콘텐츠 렌더링
  var renderContent = function() {
    switch(currentPage) {
      case 'LOGIN': return React.createElement(LoginPage);
      case 'HOME':
        return React.createElement(HomePage, Object.assign({}, commonProps, {
          tasks: tasks, events: events, relationships: relationships,
          onOpenAddTask: handleOpenAddTask, onOpenTask: handleOpenTask, onOpenEvent: handleOpenEvent,
          onOpenChat: handleOpenChat, onOpenInbox: handleOpenInbox, onOpenSearch: handleOpenSearch,
          onStartFocus: handleStartFocus, onStartBodyDoubling: handleStartBodyDoubling,
          onOpenReminder: handleOpenReminder, onOpenTomorrowPrep: handleOpenTomorrowPrep,
          isGoogleConnected: isConnected, onConnectGoogle: function() { setShowGoogleAuth(true); },
          dnaProfile: dnaProfile, dnaSuggestions: dnaSuggestions, dnaAnalysisPhase: dnaAnalysisPhase,
          getMorningBriefing: getMorningBriefing, getEveningMessage: getEveningMessage,
          getStressLevel: getStressLevel, getBestFocusTime: getBestFocusTime,
          getPeakHours: getPeakHours, getChronotype: getChronotype,
          todayContext: todayContext, getSpecialAlerts: getSpecialAlerts, getBurnoutWarning: getBurnoutWarning,
          getTodayEnergyDrain: getTodayEnergyDrain, getRecommendedActions: getRecommendedActions, getBriefingTone: getBriefingTone,
          PenguinStatusBar: PenguinStatusBar,
          gmailBriefing: getGmailBriefingMessage ? getGmailBriefingMessage() : null, gmailStats: gmailStats,
          // ⏱️ 시간 추정 코치
          timeInsight: getTimeInsight ? getTimeInsight() : null,
          timeEstimatorData: timeEstimatorData,
          // 🤗 저녁 리뷰 수동 트리거
          onOpenEveningReview: triggerDayEndManually,
          todayCompletedCount: todayCompletedCount
        }));
      case 'WORK':
        return React.createElement(WorkPage, Object.assign({}, commonProps, {
          tasks: tasks, setTasks: setTasks, events: events, projects: projects,
          onOpenAddTask: handleOpenAddTask, onOpenTask: handleOpenTask, onToggleTask: handleToggleTask,
          onOpenEvent: handleOpenEvent, onOpenChat: handleOpenChat,
          onStartFocus: handleStartFocus, onStartBodyDoubling: handleStartBodyDoubling,
          onOpenInbox: handleOpenInbox, onOpenProject: handleOpenProject,
          // ⏱️ 시간 추정 코치
          startTimeTimer: startTimeTimer,
          stopTimeTimer: stopTimeTimer,
          getSuggestedTime: getSuggestedTime
        }));
      case 'CALENDAR':
        return React.createElement(CalendarPage, Object.assign({}, commonProps, {
          events: events, tasks: tasks, isConnected: isConnected, isLoading: isLoading,
          onOpenEvent: handleOpenEvent, onOpenTask: handleOpenTask,
          onAddEvent: function() { setSelectedEvent(null); setShowEventModal(true); },
          onConnectGoogle: function() { setShowGoogleAuth(true); }
        }));
      case 'LIFE':
        return React.createElement(LifePage, Object.assign({}, commonProps, {
          routines: routines, setRoutines: setRoutines, relationships: relationships,
          healthData: healthData, setHealthData: setHealthData,
          onOpenRoutines: handleOpenRoutineManager, onOpenRoutineManager: handleOpenRoutineManager,
          onUpdateRelationship: handleUpdateRelationship, onAddRelationship: handleAddRelationship,
          onDeleteRelationship: handleDeleteRelationship, onOpenChat: handleOpenChat,
          onOpenJournal: handleOpenJournal, onOpenMoodLog: handleOpenMoodLog, onEditHealth: handleEditHealth
        }));
      case 'MORE':
        return React.createElement(MorePage, Object.assign({}, commonProps, {
          onNavigate: handlePageChange, onOpenSettings: function() { setCurrentPage('SETTINGS'); },
          onOpenTomorrowPrep: handleOpenTomorrowPrep, isGoogleConnected: isConnected,
          onConnectGoogle: function() { setShowGoogleAuth(true); }, onDisconnectGoogle: disconnect
        }));
      case 'CHAT':
        return React.createElement(AlfredoChat, Object.assign({}, commonProps, {
          onBack: handleBackFromChat, tasks: tasks, events: events,
          getMorningBriefing: getMorningBriefing, getEveningMessage: getEveningMessage,
          dnaProfile: dnaProfile, dnaSuggestions: dnaSuggestions
        }));
      case 'FOCUS':
        return React.createElement(FocusPage, Object.assign({}, commonProps, {
          task: selectedTask, onBack: function() { setCurrentPage('HOME'); },
          onComplete: function() { if (selectedTask) handleToggleTask(selectedTask.id); setCurrentPage('HOME'); }
        }));
      case 'BODY_DOUBLING':
        return React.createElement(BodyDoublingMode, Object.assign({}, commonProps, {
          task: selectedTask, onBack: function() { setCurrentPage('HOME'); },
          onComplete: function() { if (selectedTask) handleToggleTask(selectedTask.id); setCurrentPage('HOME'); }
        }));
      case 'SETTINGS':
        return React.createElement(SettingsPage, Object.assign({}, commonProps, {
          onBack: function() { setCurrentPage('MORE'); },
          isGoogleConnected: isConnected, onConnectGoogle: function() { setShowGoogleAuth(true); },
          onDisconnectGoogle: disconnect
        }));
      case 'WEEKLY_REVIEW':
        return React.createElement(WeeklyReviewPage, Object.assign({}, commonProps, { tasks: tasks, events: events, onBack: function() { setCurrentPage('MORE'); } }));
      case 'HABIT_HEATMAP':
        return React.createElement(HabitHeatmapPage, Object.assign({}, commonProps, { onBack: function() { setCurrentPage('MORE'); } }));
      case 'ENERGY_RHYTHM':
        return React.createElement(EnergyRhythmPage, Object.assign({}, commonProps, { onBack: function() { setCurrentPage('MORE'); } }));
      case 'PROJECT_DASHBOARD':
        return React.createElement(ProjectDashboardPage, Object.assign({}, commonProps, { projects: projects, tasks: tasks, onBack: function() { setCurrentPage('WORK'); } }));
      case 'INBOX':
        return React.createElement(InboxPage, Object.assign({}, commonProps, { onBack: function() { setCurrentPage('WORK'); }, onOpenChat: handleOpenChat }));
      case 'TOMORROW_PREP':
        return React.createElement(TomorrowPrep, Object.assign({}, commonProps, { tasks: tasks, events: events, onBack: function() { setCurrentPage('HOME'); } }));
      default:
        return React.createElement(HomePage, Object.assign({}, commonProps, {
          tasks: tasks, events: events, relationships: relationships,
          onOpenAddTask: handleOpenAddTask, onOpenTask: handleOpenTask, onOpenEvent: handleOpenEvent,
          onOpenChat: handleOpenChat, onOpenInbox: handleOpenInbox, onOpenSearch: handleOpenSearch,
          onStartFocus: handleStartFocus, onStartBodyDoubling: handleStartBodyDoubling,
          onOpenReminder: handleOpenReminder, isGoogleConnected: isConnected,
          onConnectGoogle: function() { setShowGoogleAuth(true); },
          // ⏱️ 시간 추정 코치
          timeInsight: getTimeInsight ? getTimeInsight() : null,
          timeEstimatorData: timeEstimatorData,
          // 🤗 저녁 리뷰 수동 트리거
          onOpenEveningReview: triggerDayEndManually,
          todayCompletedCount: todayCompletedCount
        }));
    }
  };
  
  var navItems = [
    { id: 'HOME', icon: Home, label: '홈' },
    { id: 'CALENDAR', icon: Calendar, label: '캘린더' },
    { id: 'WORK', icon: Briefcase, label: '워크' },
    { id: 'LIFE', icon: Heart, label: '라이프' },
    { id: 'MORE', icon: MoreHorizontal, label: '더보기' }
  ];
  
  var showNavBar = ['HOME', 'CALENDAR', 'WORK', 'LIFE', 'MORE'].includes(currentPage);
  
  return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#FAFAFA', display: 'flex', flexDirection: 'column' } },
    React.createElement('main', { style: { flex: 1, paddingBottom: showNavBar ? '80px' : '0' } }, renderContent()),
    
    showNavBar && React.createElement('nav', {
      style: {
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '80px', backgroundColor: 'white',
        borderTop: '1px solid #E5E7EB',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }
    },
      navItems.map(function(item) {
        var isActive = currentPage === item.id;
        return React.createElement('button', {
          key: item.id,
          onClick: function() { handlePageChange(item.id); },
          style: {
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer'
          }
        },
          React.createElement(item.icon, {
            size: 24,
            style: { color: isActive ? '#A996FF' : '#9CA3AF' }
          }),
          React.createElement('span', {
            style: {
              fontSize: '10px', marginTop: '4px',
              color: isActive ? '#A996FF' : '#9CA3AF'
            }
          }, item.label)
        );
      })
    ),
    
    showEventModal && React.createElement(EventModal, { event: selectedEvent, onSave: handleSaveEvent, onDelete: handleDeleteEvent, onClose: function() { setShowEventModal(false); setSelectedEvent(null); } }),
    showTaskModal && React.createElement(TaskModal, { task: selectedTask, onSave: handleSaveTask, onDelete: handleDeleteTask, onClose: function() { setShowTaskModal(false); setSelectedTask(null); }, onStartFocus: handleStartFocus }),
    showAddTaskModal && React.createElement(AddTaskModal, { initialData: selectedTask, onSave: handleSaveTask, onClose: function() { setShowAddTaskModal(false); setSelectedTask(null); } }),
    React.createElement(RoutineManageModal, { isOpen: showRoutineModal, routines: routines, onSave: handleSaveRoutine, onDelete: handleDeleteRoutine, onClose: function() { setShowRoutineModal(false); } }),
    showSearchModal && React.createElement(SearchModal, { tasks: tasks, events: events, onSelectTask: handleOpenTask, onSelectEvent: handleOpenEvent, onClose: function() { setShowSearchModal(false); } }),
    showQuickCapture && React.createElement(QuickCaptureModal, { onCapture: handleQuickCapture, onClose: function() { setShowQuickCapture(false); } }),
    showGoogleAuth && React.createElement(GoogleAuthModal, { onSuccess: handleGoogleAuthSuccess, onClose: function() { setShowGoogleAuth(false); } }),
    showDayEndModal && React.createElement(DayEndModal, { completedCount: todayCompletedCount, totalTasks: tasks.filter(function(t) { return !t.completed; }).length + todayCompletedCount, careType: dayEndCareType, onClose: function() { setShowDayEndModal(false); markDayEndAsShown(); } }),
    React.createElement(MoodLogModal, { isOpen: showMoodLogModal, onClose: function() { setShowMoodLogModal(false); }, onSave: handleSaveMoodLog, currentMood: mood, currentEnergy: energy }),
    React.createElement(JournalModal, { isOpen: showJournalModal, onClose: function() { setShowJournalModal(false); }, onSave: handleSaveJournal }),
    React.createElement(HealthEditModal, { isOpen: showHealthEditModal, onClose: function() { setShowHealthEditModal(false); }, onSave: handleSaveHealth, healthData: healthData })
  );
}

export default App;
