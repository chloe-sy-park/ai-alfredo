import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Home, Calendar, Briefcase, Heart, MoreHorizontal
} from 'lucide-react';

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
import { useTimeTracking } from './hooks/useTimeTracking';
import { useDNAEngine } from './hooks/useDNAEngine';

// 데이터
import { mockTasks, mockProjects, mockRoutines, mockWeather, mockRelationships } from './data/mockData';

// 상수
import { COLORS } from './constants/colors';

// localStorage 키
var STORAGE_KEYS = {
  TASKS: 'lifebutler_tasks',
  ROUTINES: 'lifebutler_routines',
  HEALTH: 'lifebutler_health',
  RELATIONSHIPS: 'lifebutler_relationships',
  USER_SETTINGS: 'lifebutler_user_settings',
  MOOD_ENERGY: 'lifebutler_mood_energy',
  STREAK_DATA: 'lifebutler_streak_data',
  ONBOARDING_COMPLETE: 'lifebutler_onboarding_complete',
  JOURNAL_ENTRIES: 'lifebutler_journal_entries',
  MOOD_LOGS: 'lifebutler_mood_logs'
};

// localStorage에서 데이터 로드
function loadFromStorage(key, defaultValue) {
  try {
    var stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // 로드 실패 시 기본값 반환
  }
  return defaultValue;
}

// localStorage에 데이터 저장
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // 저장 실패 무시
  }
}

// ============================================================
// 메인 App 컴포넌트
// ============================================================

function App() {
  // 🐧 온보딩 상태 (W2)
  var onboardingState = useState(function() {
    return !localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  });
  var showOnboarding = onboardingState[0];
  var setShowOnboarding = onboardingState[1];
  
  // 현재 페이지 상태
  var pageState = useState('HOME');
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
  
  // 🆕 토스트 상태
  var toastState = useState(null);
  var toast = toastState[0];
  var setToast = toastState[1];
  
  // 데이터 상태
  var tasksState = useState(function() {
    return loadFromStorage(STORAGE_KEYS.TASKS, mockTasks);
  });
  var tasks = tasksState[0];
  var setTasks = tasksState[1];
  
  var projectsState = useState(mockProjects);
  var projects = projectsState[0];
  
  var routinesState = useState(function() {
    return loadFromStorage(STORAGE_KEYS.ROUTINES, mockRoutines);
  });
  var routines = routinesState[0];
  var setRoutines = routinesState[1];
  
  var weatherState = useState(mockWeather);
  var weather = weatherState[0];
  
  var relationshipsState = useState(function() {
    return loadFromStorage(STORAGE_KEYS.RELATIONSHIPS, mockRelationships);
  });
  var relationships = relationshipsState[0];
  var setRelationships = relationshipsState[1];
  
  // 건강 데이터 상태
  var healthDataState = useState(function() {
    return loadFromStorage(STORAGE_KEYS.HEALTH, {
      waterIntake: 0,
      waterGoal: 8,
      steps: 0,
      sleepHours: 0,
      medication: false
    });
  });
  var healthData = healthDataState[0];
  var setHealthData = healthDataState[1];
  
  // 사용자 설정
  var userSettingsState = useState(function() {
    return loadFromStorage(STORAGE_KEYS.USER_SETTINGS, {
      name: 'Boss',
      wakeTime: '07:00',
      sleepTime: '23:00',
      workStart: '09:00',
      workEnd: '18:00',
      focusPreference: 'morning',
      notificationEnabled: true
    });
  });
  var userSettings = userSettingsState[0];
  var setUserSettings = userSettingsState[1];
  
  // 기분 & 에너지 상태
  var moodEnergyState = useState(function() {
    return loadFromStorage(STORAGE_KEYS.MOOD_ENERGY, {
      mood: 3,
      energy: 3,
      condition: 0,
      lastUpdated: null
    });
  });
  var moodEnergy = moodEnergyState[0];
  var setMoodEnergy = moodEnergyState[1];
  
  var mood = moodEnergy.mood;
  var energy = moodEnergy.energy;
  var condition = moodEnergy.condition;
  
  // 일기 기록
  var journalEntriesState = useState(function() {
    return loadFromStorage(STORAGE_KEYS.JOURNAL_ENTRIES, []);
  });
  var journalEntries = journalEntriesState[0];
  var setJournalEntries = journalEntriesState[1];
  
  // 기분 로그
  var moodLogsState = useState(function() {
    return loadFromStorage(STORAGE_KEYS.MOOD_LOGS, []);
  });
  var moodLogs = moodLogsState[0];
  var setMoodLogs = moodLogsState[1];
  
  // 스트릭 데이터
  var streakState = useState(function() {
    return loadFromStorage(STORAGE_KEYS.STREAK_DATA, {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      totalActiveDays: 0
    });
  });
  var streakData = streakState[0];
  var setStreakData = streakState[1];
  
  // 모달 상태
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
  
  // 🆕 일기/기분 모달 상태
  var showMoodLogModalState = useState(false);
  var showMoodLogModal = showMoodLogModalState[0];
  var setShowMoodLogModal = showMoodLogModalState[1];
  
  var showJournalModalState = useState(false);
  var showJournalModal = showJournalModalState[0];
  var setShowJournalModal = showJournalModalState[1];
  
  // 🆕 건강 편집 모달 상태
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
  
  // 포커스 모드
  var focusModeState = useState(false);
  var setIsFocusMode = focusModeState[1];
  
  var focusTaskState = useState(null);
  var focusTask = focusTaskState[0];
  var setFocusTask = focusTaskState[1];
  
  // 바디더블링 태스크
  var bodyDoublingTaskState = useState(null);
  var bodyDoublingTask = bodyDoublingTaskState[0];
  var setBodyDoublingTask = bodyDoublingTaskState[1];
  
  // ============================================================
  // Google 캘린더 연동
  // ============================================================
  
  var googleCalendar = useGoogleCalendar();
  var events = googleCalendar.events;
  var isConnected = googleCalendar.isConnected;
  var isLoading = googleCalendar.isLoading;
  var connect = googleCalendar.connect;
  var disconnect = googleCalendar.disconnect;
  var addEvent = googleCalendar.addEvent;
  var updateEvent = googleCalendar.updateEvent;
  var deleteEvent = googleCalendar.deleteEvent;
  var refreshEvents = googleCalendar.refreshEvents;
  
  // 시간 추적 (향후 사용 예정)
  useTimeTracking();
  
  // 🧬 DNA 엔진 (캘린더 기반 인사이트) - 확장된 함수 추출
  var dnaEngine = useDNAEngine();
  var dnaProfile = dnaEngine.profile;
  var dnaSuggestions = dnaEngine.suggestions;
  var isAnalyzingDNA = dnaEngine.isAnalyzing;
  var dnaAnalysisPhase = dnaEngine.analysisPhase;
  var getMorningBriefing = dnaEngine.getMorningBriefing;
  var getEveningMessage = dnaEngine.getEveningMessage;
  var getStressLevel = dnaEngine.getStressLevel;
  var getBestFocusTime = dnaEngine.getBestFocusTime;
  var getPeakHours = dnaEngine.getPeakHours;
  var getChronotype = dnaEngine.getChronotype;
  // 🆕 DNA 자동 분석용 추가 함수
  var analyzeCalendar = dnaEngine.analyzeCalendar;
  var todayContext = dnaEngine.todayContext;
  var refreshTodayContext = dnaEngine.refreshTodayContext;
  var getSpecialAlerts = dnaEngine.getSpecialAlerts;
  var getBurnoutWarning = dnaEngine.getBurnoutWarning;
  var getTodayEnergyDrain = dnaEngine.getTodayEnergyDrain;
  var getRecommendedActions = dnaEngine.getRecommendedActions;
  var getBriefingTone = dnaEngine.getBriefingTone;
  
  // 오늘 완료한 태스크 수 계산
  var todayCompletedCount = useMemo(function() {
    var today = new Date().toDateString();
    return tasks.filter(function(t) {
      return t.completed && t.completedAt && new Date(t.completedAt).toDateString() === today;
    }).length;
  }, [tasks]);
  
  // ============================================================
  // 🧬 DNA 자동 분석 Effects
  // ============================================================
  
  // events 변경 시 DNA 자동 분석
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
  
  // 매 시간 todayContext 새로고침
  useEffect(function() {
    if (!refreshTodayContext) return;
    var interval = setInterval(function() {
      refreshTodayContext();
    }, 60 * 60 * 1000); // 1시간
    return function() { clearInterval(interval); };
  }, [refreshTodayContext]);
  
  // ============================================================
  // 데이터 저장 Effects
  // ============================================================
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.ROUTINES, routines);
  }, [routines]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.RELATIONSHIPS, relationships);
  }, [relationships]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.USER_SETTINGS, userSettings);
  }, [userSettings]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.MOOD_ENERGY, moodEnergy);
  }, [moodEnergy]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.STREAK_DATA, streakData);
  }, [streakData]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.HEALTH, healthData);
  }, [healthData]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.JOURNAL_ENTRIES, journalEntries);
  }, [journalEntries]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.MOOD_LOGS, moodLogs);
  }, [moodLogs]);
  
  // ============================================================
  // 스트릭 업데이트
  // ============================================================
  
  useEffect(function() {
    var today = new Date().toDateString();
    var lastActive = streakData.lastActiveDate;
    
    if (lastActive !== today) {
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive === yesterday.toDateString()) {
        setStreakData(function(prev) {
          var newStreak = prev.currentStreak + 1;
          return {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, prev.longestStreak),
            lastActiveDate: today,
            totalActiveDays: prev.totalActiveDays + 1
          };
        });
      } else if (lastActive !== today) {
        setStreakData(function(prev) {
          return {
            currentStreak: 1,
            longestStreak: prev.longestStreak,
            lastActiveDate: today,
            totalActiveDays: prev.totalActiveDays + 1
          };
        });
      }
    }
  }, []);
  
  // ============================================================
  // 핸들러 함수들
  // ============================================================
  
  // 🆕 토스트 표시 함수
  var showToast = useCallback(function(message) {
    setToast(message);
    setTimeout(function() {
      setToast(null);
    }, 2000);
  }, []);
  
  // 컨디션 업데이트 (1-5)
  var handleUpdateCondition = useCallback(function(newCondition) {
    setMoodEnergy(function(prev) {
      return Object.assign({}, prev, {
        condition: newCondition,
        lastUpdated: new Date().toISOString()
      });
    });
  }, []);
  
  // 🐧 온보딩 완료 핸들러 (W2)
  var handleOnboardingComplete = useCallback(function(data) {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    if (data && data.condition) {
      handleUpdateCondition(data.condition);
    }
    setShowOnboarding(false);
  }, [handleUpdateCondition]);
  
  // 🐧 온보딩 중 캘린더 연결 (W2)
  var handleOnboardingCalendarConnect = useCallback(function() {
    if (connect) {
      connect();
    }
  }, [connect]);
  
  // 네비게이션
  var handlePageChange = useCallback(function(newPage) {
    if (newPage !== 'CHAT') {
      setPreviousPage(currentPage);
    }
    setCurrentPage(newPage);
  }, [currentPage]);
  
  var handleOpenChat = useCallback(function() {
    setPreviousPage(currentPage);
    setCurrentPage('CHAT');
  }, [currentPage]);
  
  var handleCloseChat = useCallback(function() {
    setCurrentPage(previousPage);
  }, [previousPage]);
  
  // 태스크 관련
  var handleOpenTask = useCallback(function(task) {
    setSelectedTask(task);
    setShowTaskModal(true);
  }, []);
  
  var handleOpenAddTask = useCallback(function() {
    setShowAddTaskModal(true);
  }, []);
  
  var handleAddTask = useCallback(function(newTask) {
    var taskWithId = Object.assign({}, newTask, {
      id: newTask.id || Date.now(),
      createdAt: new Date().toISOString()
    });
    setTasks(function(prev) { return [taskWithId].concat(prev); });
    setShowAddTaskModal(false);
  }, []);
  
  var handleUpdateTask = useCallback(function(updatedTask) {
    setTasks(function(prev) {
      return prev.map(function(t) {
        return t.id === updatedTask.id ? updatedTask : t;
      });
    });
    setShowTaskModal(false);
    setSelectedTask(null);
  }, []);
  
  var handleDeleteTask = useCallback(function(taskId) {
    setTasks(function(prev) {
      return prev.filter(function(t) { return t.id !== taskId; });
    });
    setShowTaskModal(false);
    setSelectedTask(null);
  }, []);
  
  var handleToggleTask = useCallback(function(taskId) {
    setTasks(function(prev) {
      return prev.map(function(t) {
        if (t.id === taskId) {
          var nowCompleted = !t.completed;
          return Object.assign({}, t, {
            completed: nowCompleted,
            completedAt: nowCompleted ? new Date().toISOString() : null
          });
        }
        return t;
      });
    });
  }, []);
  
  // 이벤트 관련
  var handleOpenEvent = useCallback(function(event) {
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);
  
  var handleSaveEvent = useCallback(function(eventData) {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
    setShowEventModal(false);
    setSelectedEvent(null);
  }, [selectedEvent, updateEvent, addEvent]);
  
  var handleDeleteEvent = useCallback(function(eventId) {
    deleteEvent(eventId);
    setShowEventModal(false);
    setSelectedEvent(null);
  }, [deleteEvent]);
  
  // 기분/에너지 업데이트
  var handleUpdateMoodEnergy = useCallback(function(updates) {
    setMoodEnergy(function(prev) {
      return Object.assign({}, prev, updates, {
        lastUpdated: new Date().toISOString()
      });
    });
  }, []);
  
  // 설정 업데이트
  var handleUpdateSettings = useCallback(function(updates) {
    setUserSettings(function(prev) {
      return Object.assign({}, prev, updates);
    });
  }, []);
  
  // 루틴 관련
  var handleOpenRoutineManager = useCallback(function() {
    setShowRoutineModal(true);
  }, []);
  
  var handleSaveRoutine = useCallback(function(routine, isEditing) {
    if (isEditing) {
      setRoutines(function(prev) {
        return prev.map(function(r) {
          return r.id === routine.id ? routine : r;
        });
      });
    } else {
      setRoutines(function(prev) { return prev.concat([routine]); });
    }
  }, []);
  
  var handleDeleteRoutine = useCallback(function(routineId) {
    setRoutines(function(prev) {
      return prev.filter(function(r) { return r.id !== routineId; });
    });
  }, []);
  
  // 검색 열기
  var handleOpenSearch = useCallback(function() {
    setShowSearchModal(true);
  }, []);
  
  // 인박스 열기
  var handleOpenInbox = useCallback(function() {
    setPreviousPage(currentPage);
    setCurrentPage('INBOX');
  }, [currentPage]);
  
  // 프로젝트 페이지 열기
  var handleOpenProject = useCallback(function() {
    setPreviousPage(currentPage);
    setCurrentPage('PROJECTS');
  }, [currentPage]);
  
  // 🔧 FIX: 리마인더 열기 → 토스트로 안내
  var handleOpenReminder = useCallback(function() {
    showToast('리마인더 기능 준비 중이에요 🐧');
  }, [showToast]);
  
  // 🆕 일기 열기
  var handleOpenJournal = useCallback(function() {
    setShowJournalModal(true);
  }, []);
  
  // 🆕 기분 기록 열기
  var handleOpenMoodLog = useCallback(function() {
    setShowMoodLogModal(true);
  }, []);
  
  // 🆕 일기 저장
  var handleSaveJournal = useCallback(function(entry) {
    setJournalEntries(function(prev) {
      return [entry].concat(prev);
    });
    setShowJournalModal(false);
  }, []);
  
  // 🆕 기분 저장
  var handleSaveMoodLog = useCallback(function(log) {
    setMoodLogs(function(prev) {
      return [log].concat(prev);
    });
    handleUpdateMoodEnergy({
      mood: log.mood,
      energy: log.energy
    });
    setShowMoodLogModal(false);
  }, [handleUpdateMoodEnergy]);
  
  // 🆕 건강 편집 열기
  var handleEditHealth = useCallback(function() {
    setShowHealthEditModal(true);
  }, []);
  
  // 🆕 건강 데이터 저장
  var handleSaveHealth = useCallback(function(newHealthData) {
    setHealthData(newHealthData);
    setShowHealthEditModal(false);
  }, []);
  
  // 포커스 모드
  var handleStartFocus = useCallback(function(task) {
    setFocusTask(task || null);
    setIsFocusMode(true);
    setPreviousPage(currentPage);
    setCurrentPage('FOCUS');
  }, [currentPage]);
  
  var handleEndFocus = useCallback(function() {
    setIsFocusMode(false);
    setFocusTask(null);
    setCurrentPage(previousPage);
  }, [previousPage]);
  
  // 바디더블링 모드
  var handleStartBodyDoubling = useCallback(function(task) {
    setBodyDoublingTask(task || null);
    setPreviousPage(currentPage);
    setCurrentPage('BODY_DOUBLING');
  }, [currentPage]);
  
  var handleEndBodyDoubling = useCallback(function() {
    setBodyDoublingTask(null);
    setCurrentPage(previousPage);
  }, [previousPage]);
  
  // 퀵 캡처
  var handleQuickCapture = useCallback(function(text) {
    var newTask = {
      id: Date.now(),
      title: text,
      completed: false,
      priority: 'medium',
      category: 'inbox',
      createdAt: new Date().toISOString()
    };
    setTasks(function(prev) { return [newTask].concat(prev); });
    setShowQuickCapture(false);
  }, []);
  
  // 넛지 관련
  var handleDismissNudge = useCallback(function() {
    setCurrentNudge(null);
  }, []);
  
  var handleNudgeAction = useCallback(function(action) {
    switch(action) {
      case 'open_chat':
        handleOpenChat();
        break;
      case 'start_focus':
        handleStartFocus();
        break;
      case 'start_body_doubling':
        handleStartBodyDoubling();
        break;
      case 'open_inbox':
        handleOpenInbox();
        break;
      case 'check_calendar':
        setCurrentPage('CALENDAR');
        break;
      default:
        break;
    }
    handleDismissNudge();
  }, [handleOpenChat, handleStartFocus, handleStartBodyDoubling, handleOpenInbox]);
  
  // Google 연동
  var handleGoogleAuthSuccess = useCallback(function() {
    setShowGoogleAuth(false);
    refreshEvents();
  }, [refreshEvents]);
  
  // 관계 업데이트
  var handleUpdateRelationship = useCallback(function(updatedRelationship) {
    setRelationships(function(prev) {
      return prev.map(function(r) {
        return r.id === updatedRelationship.id ? updatedRelationship : r;
      });
    });
  }, []);
  
  var handleAddRelationship = useCallback(function(newRelationship) {
    var relationshipWithId = Object.assign({}, newRelationship, {
      id: Date.now()
    });
    setRelationships(function(prev) { return prev.concat([relationshipWithId]); });
  }, []);
  
  var handleDeleteRelationship = useCallback(function(relationshipId) {
    setRelationships(function(prev) {
      return prev.filter(function(r) { return r.id !== relationshipId; });
    });
  }, []);
  
  // ============================================================
  // 공통 Props
  // ============================================================
  
  var commonProps = {
    mood: mood,
    energy: energy,
    condition: condition,
    weather: weather,
    userSettings: userSettings,
    streakData: streakData,
    onUpdateMoodEnergy: handleUpdateMoodEnergy,
    onUpdateCondition: handleUpdateCondition,
    onNavigate: handlePageChange,
    currentPage: currentPage
  };
  
  // ============================================================
  // 렌더링
  // ============================================================
  
  if (showOnboarding) {
    return React.createElement(Onboarding, {
      onComplete: handleOnboardingComplete,
      onCalendarConnect: handleOnboardingCalendarConnect,
      isCalendarConnected: isConnected,
      calendarEvents: events,
      weather: weather
    });
  }
  
  var renderContent = function() {
    switch(currentPage) {
      case 'HOME':
        return React.createElement(HomePage, Object.assign({}, commonProps, {
          tasks: tasks,
          events: events,
          relationships: relationships,
          onOpenAddTask: handleOpenAddTask,
          onOpenTask: handleOpenTask,
          onOpenEvent: handleOpenEvent,
          onOpenChat: handleOpenChat,
          onOpenInbox: handleOpenInbox,
          onOpenSearch: handleOpenSearch,
          onStartFocus: handleStartFocus,
          onStartBodyDoubling: handleStartBodyDoubling,
          onOpenReminder: handleOpenReminder,
          isGoogleConnected: isConnected,
          onConnectGoogle: function() { setShowGoogleAuth(true); },
          // 기존 DNA props
          dnaProfile: dnaProfile,
          dnaSuggestions: dnaSuggestions,
          dnaAnalysisPhase: dnaAnalysisPhase,
          getMorningBriefing: getMorningBriefing,
          getEveningMessage: getEveningMessage,
          getStressLevel: getStressLevel,
          getBestFocusTime: getBestFocusTime,
          getPeakHours: getPeakHours,
          getChronotype: getChronotype,
          // 🆕 DNA 확장 props
          todayContext: todayContext,
          getSpecialAlerts: getSpecialAlerts,
          getBurnoutWarning: getBurnoutWarning,
          getTodayEnergyDrain: getTodayEnergyDrain,
          getRecommendedActions: getRecommendedActions,
          getBriefingTone: getBriefingTone
        }));
        
      case 'WORK':
        return React.createElement(WorkPage, Object.assign({}, commonProps, {
          tasks: tasks,
          setTasks: setTasks,
          events: events,
          projects: projects,
          onOpenAddTask: handleOpenAddTask,
          onOpenTask: handleOpenTask,
          onToggleTask: handleToggleTask,
          onOpenEvent: handleOpenEvent,
          onOpenChat: handleOpenChat,
          onStartFocus: handleStartFocus,
          onStartBodyDoubling: handleStartBodyDoubling,
          onOpenInbox: handleOpenInbox,
          onOpenProject: handleOpenProject
        }));
        
      case 'CALENDAR':
        return React.createElement(CalendarPage, Object.assign({}, commonProps, {
          events: events,
          tasks: tasks,
          isConnected: isConnected,
          isLoading: isLoading,
          onOpenEvent: handleOpenEvent,
          onOpenTask: handleOpenTask,
          onAddEvent: function() {
            setSelectedEvent(null);
            setShowEventModal(true);
          },
          onConnectGoogle: function() { setShowGoogleAuth(true); }
        }));
        
      case 'LIFE':
        return React.createElement(LifePage, Object.assign({}, commonProps, {
          routines: routines,
          setRoutines: setRoutines,
          relationships: relationships,
          healthData: healthData,
          setHealthData: setHealthData,
          onOpenRoutines: handleOpenRoutineManager,
          onOpenRoutineManager: handleOpenRoutineManager,
          onUpdateRelationship: handleUpdateRelationship,
          onAddRelationship: handleAddRelationship,
          onDeleteRelationship: handleDeleteRelationship,
          onOpenChat: handleOpenChat,
          onOpenJournal: handleOpenJournal,
          onOpenMoodLog: handleOpenMoodLog,
          onEditHealth: handleEditHealth
        }));
        
      case 'MORE':
        return React.createElement(MorePage, Object.assign({}, commonProps, {
          onNavigate: handlePageChange,
          onOpenSettings: function() { setCurrentPage('SETTINGS'); },
          isGoogleConnected: isConnected,
          onConnectGoogle: function() { setShowGoogleAuth(true); },
          onDisconnectGoogle: disconnect
        }));
        
      case 'CHAT':
        return React.createElement(AlfredoChat, Object.assign({}, commonProps, {
          tasks: tasks,
          events: events,
          onBack: handleCloseChat,
          onAddTask: handleAddTask,
          onUpdateTask: handleUpdateTask,
          onToggleTask: handleToggleTask,
          onStartFocus: handleStartFocus,
          onStartBodyDoubling: handleStartBodyDoubling,
          dnaProfile: dnaProfile,
          getChronotype: getChronotype,
          getStressLevel: getStressLevel,
          getPeakHours: getPeakHours
        }));
        
      case 'FOCUS':
        return React.createElement(FocusPage, Object.assign({}, commonProps, {
          task: focusTask,
          tasks: tasks,
          onEnd: handleEndFocus,
          onComplete: function() {
            if (focusTask) {
              handleToggleTask(focusTask.id);
            }
            handleEndFocus();
          },
          onOpenChat: handleOpenChat,
          onSwitchToBodyDoubling: function() {
            handleEndFocus();
            handleStartBodyDoubling(focusTask);
          }
        }));
        
      case 'BODY_DOUBLING':
        return React.createElement(BodyDoublingMode, Object.assign({}, commonProps, {
          task: bodyDoublingTask,
          onEnd: handleEndBodyDoubling,
          onComplete: function() {
            if (bodyDoublingTask) {
              handleToggleTask(bodyDoublingTask.id);
            }
            handleEndBodyDoubling();
          },
          onOpenChat: handleOpenChat,
          onSwitchToFocus: function() {
            handleEndBodyDoubling();
            handleStartFocus(bodyDoublingTask);
          }
        }));
        
      case 'SETTINGS':
        return React.createElement(SettingsPage, Object.assign({}, commonProps, {
          onUpdateSettings: handleUpdateSettings,
          onBack: function() { setCurrentPage('MORE'); },
          isGoogleConnected: isConnected,
          onConnectGoogle: function() { setShowGoogleAuth(true); },
          onDisconnectGoogle: disconnect
        }));
        
      case 'WEEKLY_REVIEW':
        return React.createElement(WeeklyReviewPage, Object.assign({}, commonProps, {
          tasks: tasks,
          events: events,
          onBack: function() { setCurrentPage('MORE'); }
        }));
        
      case 'HABIT_HEATMAP':
        return React.createElement(HabitHeatmapPage, Object.assign({}, commonProps, {
          tasks: tasks,
          routines: routines,
          onBack: function() { setCurrentPage('MORE'); }
        }));
        
      case 'ENERGY_RHYTHM':
        return React.createElement(EnergyRhythmPage, Object.assign({}, commonProps, {
          tasks: tasks,
          onBack: function() { setCurrentPage('MORE'); }
        }));
        
      case 'PROJECTS':
        return React.createElement(ProjectDashboardPage, Object.assign({}, commonProps, {
          projects: projects,
          tasks: tasks,
          onBack: function() { setCurrentPage(previousPage); }
        }));
        
      case 'INBOX':
        return React.createElement(InboxPage, Object.assign({}, commonProps, {
          onBack: function() { setCurrentPage(previousPage); },
          onOpenChat: handleOpenChat,
          isGoogleConnected: isConnected,
          onConnectGoogle: function() { setShowGoogleAuth(true); }
        }));
        
      default:
        return React.createElement(HomePage, Object.assign({}, commonProps, {
          tasks: tasks,
          events: events,
          relationships: relationships,
          onOpenAddTask: handleOpenAddTask,
          onOpenTask: handleOpenTask,
          onOpenEvent: handleOpenEvent,
          onOpenChat: handleOpenChat,
          onOpenInbox: handleOpenInbox,
          onOpenSearch: handleOpenSearch,
          onStartFocus: handleStartFocus,
          onStartBodyDoubling: handleStartBodyDoubling,
          onOpenReminder: handleOpenReminder,
          isGoogleConnected: isConnected,
          onConnectGoogle: function() { setShowGoogleAuth(true); }
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
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      display: 'flex',
      flexDirection: 'column'
    }
  },
    React.createElement('main', {
      style: {
        flex: 1,
        paddingBottom: showNavBar ? '80px' : '0'
      }
    }, renderContent()),
    
    showNavBar && React.createElement('nav', {
      style: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: '8px',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        zIndex: 1000
      }
    },
      navItems.map(function(item) {
        var isActive = currentPage === item.id;
        return React.createElement('button', {
          key: item.id,
          onClick: function() { handlePageChange(item.id); },
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }
        },
          React.createElement(item.icon, {
            size: 24,
            strokeWidth: isActive ? 2.5 : 1.5,
            color: isActive ? COLORS.primary : '#8E8E93'
          }),
          React.createElement('span', {
            style: {
              fontSize: '10px',
              fontWeight: isActive ? '600' : '400',
              color: isActive ? COLORS.primary : '#8E8E93'
            }
          }, item.label)
        );
      })
    ),
    
    currentNudge && React.createElement(AlfredoNudge, {
      nudge: currentNudge,
      onDismiss: handleDismissNudge,
      onAction: handleNudgeAction
    }),
    
    // 🆕 전역 토스트 알림
    toast && React.createElement('div', {
      style: {
        position: 'fixed',
        bottom: showNavBar ? '96px' : '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease'
      }
    },
      React.createElement('div', {
        style: {
          backgroundColor: '#1F2937',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '9999px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '14px'
        }
      }, toast)
    ),
    
    // 모달들
    React.createElement(AddTaskModal, {
      isOpen: showAddTaskModal,
      onAdd: handleAddTask,
      onClose: function() { setShowAddTaskModal(false); },
      projects: projects
    }),
    
    React.createElement(TaskModal, {
      isOpen: showTaskModal,
      task: selectedTask,
      onSave: handleUpdateTask,
      onDelete: selectedTask ? function() { handleDeleteTask(selectedTask.id); } : null,
      onClose: function() {
        setShowTaskModal(false);
        setSelectedTask(null);
      }
    }),
    
    React.createElement(EventModal, {
      isOpen: showEventModal,
      event: selectedEvent,
      onSave: handleSaveEvent,
      onDelete: selectedEvent ? function() { handleDeleteEvent(selectedEvent.id); } : null,
      onClose: function() {
        setShowEventModal(false);
        setSelectedEvent(null);
      }
    }),
    
    React.createElement(RoutineManageModal, {
      isOpen: showRoutineModal,
      routines: routines,
      onSave: handleSaveRoutine,
      onDelete: handleDeleteRoutine,
      onClose: function() { setShowRoutineModal(false); }
    }),
    
    showSearchModal && React.createElement(SearchModal, {
      tasks: tasks,
      events: events,
      onSelectTask: handleOpenTask,
      onSelectEvent: handleOpenEvent,
      onClose: function() { setShowSearchModal(false); }
    }),
    
    showQuickCapture && React.createElement(QuickCaptureModal, {
      onCapture: handleQuickCapture,
      onClose: function() { setShowQuickCapture(false); }
    }),
    
    showGoogleAuth && React.createElement(GoogleAuthModal, {
      onSuccess: handleGoogleAuthSuccess,
      onClose: function() { setShowGoogleAuth(false); }
    }),
    
    showDayEndModal && React.createElement(DayEndModal, {
      completedCount: todayCompletedCount,
      totalTasks: tasks.filter(function(t) { return !t.completed; }).length + todayCompletedCount,
      onClose: function() { setShowDayEndModal(false); }
    }),
    
    React.createElement(MoodLogModal, {
      isOpen: showMoodLogModal,
      onClose: function() { setShowMoodLogModal(false); },
      onSave: handleSaveMoodLog,
      currentMood: mood,
      currentEnergy: energy
    }),
    
    React.createElement(JournalModal, {
      isOpen: showJournalModal,
      onClose: function() { setShowJournalModal(false); },
      onSave: handleSaveJournal
    }),
    
    // 🆕 건강 편집 모달
    React.createElement(HealthEditModal, {
      isOpen: showHealthEditModal,
      onClose: function() { setShowHealthEditModal(false); },
      onSave: handleSaveHealth,
      healthData: healthData
    })
  );
}

export default App;
