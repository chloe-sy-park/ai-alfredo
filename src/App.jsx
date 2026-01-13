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
import DayEndModal from './components/modals/DayEndModal';

// Common 컴포넌트
import { FloatingCaptureButton, NotificationToast } from './components/common';

// ADHD 훅
import { useDayEndCare } from './components/adhd/useDayEndCare';
import { useTimeEstimator } from './components/adhd/useTimeEstimator';

// Data
import { mockTasks, mockEvents, mockRoutines, mockProjects } from './data/mockData';

// Google Calendar API
import { fetchGoogleCalendarEvents, fetchPrimaryCalendarId, syncEventsToGoogleCalendar } from './utils/googleCalendarApi';
import { fetchEmails, fetchUnreadEmailCount } from './utils/gmailApi';

// 환경 확인
var isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

function App() {
  // 🔐 Zustand 인증 상태 (Supabase)
  var authStore = useAuthStore();
  var user = authStore.user;
  var session = authStore.session;
  var isLoading = authStore.isLoading;
  var signOut = authStore.signOut;
  var googleAccessToken = authStore.googleAccessToken;
  var hasGoogleConnection = authStore.hasGoogleConnection;
  
  // 🐧 Zustand 펭귄 상태
  var penguinStore = usePenguinStore();
  var penguinState = penguinStore.state;
  var penguinMood = penguinStore.mood;
  var penguinEnergy = penguinStore.energy;
  var penguinLevel = penguinStore.level;
  var penguinName = penguinStore.name;
  var addExperience = penguinStore.addExperience;
  var updateMood = penguinStore.updateMood;
  var updateEnergy = penguinStore.updateEnergy;
  
  // 🌙 저녁 케어 훅
  var dayEndCare = useDayEndCare();
  var showDayEndModal = dayEndCare.showModal;
  var setShowDayEndModal = dayEndCare.setShowModal;
  var dayEndCareType = dayEndCare.careType;
  var markDayEndAsShown = dayEndCare.markAsShown;
  var triggerDayEndManually = dayEndCare.triggerManually;
  
  // ⏱️ 시간 추정 코치 훅
  var timeEstimator = useTimeEstimator();
  var startTimeTimer = timeEstimator.startTimer;
  var stopTimeTimer = timeEstimator.stopTimer;
  var getSuggestedTime = timeEstimator.getSuggestedTime;
  var getTimeInsight = timeEstimator.getInsight;
  var timeEstimatorData = timeEstimator.data;
  
  // 시간 인사이트 (오후 모드용)
  var timeInsight = useMemo(function() {
    var hour = new Date().getHours();
    if (hour >= 12 && hour < 21) {
      return getTimeInsight();
    }
    return null;
  }, [getTimeInsight]);
  
  // URL 기반 라우팅
  var pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  
  // OAuth 콜백 처리
  if (pathname === '/auth/callback') {
    return React.createElement(AuthCallbackPage, null);
  }
  
  // 로딩 상태
  if (isLoading) {
    return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-[#F0EBFF]' },
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { className: 'text-4xl mb-4 animate-bounce' }, '🐧'),
        React.createElement('p', { className: 'text-gray-600' }, '알프레도가 준비 중이에요...')
      )
    );
  }
  
  // 미인증 사용자 -> 로그인 페이지
  if (!user) {
    return React.createElement(LoginPage, null);
  }
  
  // 상태 관리
  var pageState = useState('home');
  var currentPage = pageState[0];
  var setCurrentPage = pageState[1];
  
  var tasksState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.TASKS);
    return saved || mockTasks;
  });
  var tasks = tasksState[0];
  var setTasks = tasksState[1];
  
  var eventsState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.EVENTS);
    return saved || mockEvents;
  });
  var events = eventsState[0];
  var setEvents = eventsState[1];
  
  var routinesState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.ROUTINES);
    return saved || mockRoutines;
  });
  var routines = routinesState[0];
  var setRoutines = routinesState[1];
  
  var projectsState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.PROJECTS);
    return saved || mockProjects;
  });
  var projects = projectsState[0];
  var setProjects = projectsState[1];
  
  // 온보딩 상태
  var hasCompletedOnboardingState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
    return saved || false;
  });
  var hasCompletedOnboarding = hasCompletedOnboardingState[0];
  var setHasCompletedOnboarding = hasCompletedOnboardingState[1];
  
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
  
  var showMoodLogModalState = useState(false);
  var showMoodLogModal = showMoodLogModalState[0];
  var setShowMoodLogModal = showMoodLogModalState[1];
  
  var showJournalModalState = useState(false);
  var showJournalModal = showJournalModalState[0];
  var setShowJournalModal = showJournalModalState[1];
  
  var showHealthEditModalState = useState(false);
  var showHealthEditModal = showHealthEditModalState[0];
  var setShowHealthEditModal = showHealthEditModalState[1];
  
  // 선택된 아이템
  var selectedEventState = useState(null);
  var selectedEvent = selectedEventState[0];
  var setSelectedEvent = selectedEventState[1];
  
  var selectedTaskState = useState(null);
  var selectedTask = selectedTaskState[0];
  var setSelectedTask = selectedTaskState[1];
  
  // Focus 모드 상태
  var focusTaskState = useState(null);
  var focusTask = focusTaskState[0];
  var setFocusTask = focusTaskState[1];
  
  var focusModeState = useState(false);
  var isFocusMode = focusModeState[0];
  var setIsFocusMode = focusModeState[1];
  
  // 바디더블링 모드
  var bodyDoublingState = useState(false);
  var isBodyDoubling = bodyDoublingState[0];
  var setIsBodyDoubling = bodyDoublingState[1];
  
  // 알림 상태
  var notificationState = useState(null);
  var notification = notificationState[0];
  var setNotification = notificationState[1];
  
  // 사용자 상태 (컨디션)
  var moodState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.MOOD);
    return saved || 'good';
  });
  var mood = moodState[0];
  var setMood = moodState[1];
  
  var energyState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.ENERGY);
    return saved || 70;
  });
  var energy = energyState[0];
  var setEnergy = energyState[1];
  
  // 건강 데이터
  var healthDataState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEYS.HEALTH_DATA);
    return saved || { steps: 0, sleep: 7, water: 0 };
  });
  var healthData = healthDataState[0];
  var setHealthData = healthDataState[1];
  
  // 날씨 데이터
  var weatherState = useState({ temp: 15, condition: 'sunny', icon: '☀️' });
  var weather = weatherState[0];
  var setWeather = weatherState[1];
  
  // 이메일 데이터
  var emailsState = useState([]);
  var emails = emailsState[0];
  var setEmails = emailsState[1];
  
  var unreadCountState = useState(0);
  var unreadCount = unreadCountState[0];
  var setUnreadCount = unreadCountState[1];
  
  // Google Calendar 동기화
  var syncGoogleCalendar = useCallback(function() {
    if (!googleAccessToken) return;
    
    fetchGoogleCalendarEvents(googleAccessToken)
      .then(function(googleEvents) {
        if (googleEvents && googleEvents.length > 0) {
          setEvents(function(prev) {
            var existingIds = new Set(prev.map(function(e) { return e.googleEventId; }).filter(Boolean));
            var newEvents = googleEvents.filter(function(e) { return !existingIds.has(e.googleEventId); });
            var merged = prev.concat(newEvents);
            saveToStorage(STORAGE_KEYS.EVENTS, merged);
            return merged;
          });
          showNotification('캘린더 동기화 완료', 'success');
        }
      })
      .catch(function(err) {
        console.error('Calendar sync error:', err);
      });
  }, [googleAccessToken]);
  
  // Gmail 동기화
  var syncGmail = useCallback(function() {
    if (!googleAccessToken) return;
    
    fetchUnreadEmailCount(googleAccessToken)
      .then(function(count) {
        setUnreadCount(count);
      })
      .catch(function(err) {
        console.error('Gmail count error:', err);
      });
    
    fetchEmails(googleAccessToken, 10)
      .then(function(emailList) {
        setEmails(emailList);
      })
      .catch(function(err) {
        console.error('Gmail fetch error:', err);
      });
  }, [googleAccessToken]);
  
  // 초기 동기화
  useEffect(function() {
    if (googleAccessToken) {
      syncGoogleCalendar();
      syncGmail();
    }
  }, [googleAccessToken, syncGoogleCalendar, syncGmail]);
  
  // 저장 효과
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.EVENTS, events);
  }, [events]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.ROUTINES, routines);
  }, [routines]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.MOOD, mood);
    updateMood(mood);
  }, [mood, updateMood]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.ENERGY, energy);
    updateEnergy(energy);
  }, [energy, updateEnergy]);
  
  useEffect(function() {
    saveToStorage(STORAGE_KEYS.HEALTH_DATA, healthData);
  }, [healthData]);
  
  // 오늘 완료한 태스크 수
  var todayCompletedCount = useMemo(function() {
    var today = new Date().toDateString();
    return tasks.filter(function(t) {
      return (t.completed || t.status === 'done') && 
             t.completedAt && 
             new Date(t.completedAt).toDateString() === today;
    }).length;
  }, [tasks]);
  
  // 저녁 케어 훅에 완료율 전달
  useEffect(function() {
    var totalToday = tasks.filter(function(t) {
      return t.deadline && (t.deadline.includes('오늘') || t.deadline.includes('전'));
    }).length;
    var completionRate = totalToday > 0 ? (todayCompletedCount / totalToday) * 100 : 0;
    dayEndCare.setCompletionRate(completionRate);
  }, [todayCompletedCount, tasks, dayEndCare]);
  
  // 알림 표시
  var showNotification = useCallback(function(message, type) {
    setNotification({ message: message, type: type || 'info' });
    setTimeout(function() { setNotification(null); }, 3000);
  }, []);
  
  // 핸들러들
  var handleOpenEvent = function(event) {
    setSelectedEvent(event);
    setShowEventModal(true);
  };
  
  var handleOpenTask = function(task) {
    setSelectedTask(task);
    setShowTaskModal(true);
  };
  
  var handleOpenAddTask = function() {
    setSelectedTask(null);
    setShowAddTaskModal(true);
  };
  
  var handleSaveEvent = function(eventData) {
    if (eventData.id) {
      setEvents(events.map(function(e) { return e.id === eventData.id ? eventData : e; }));
    } else {
      var newEvent = Object.assign({}, eventData, { id: 'event-' + Date.now() });
      setEvents(events.concat([newEvent]));
    }
    setShowEventModal(false);
    setSelectedEvent(null);
    showNotification('일정이 저장되었습니다', 'success');
  };
  
  var handleDeleteEvent = function(eventId) {
    setEvents(events.filter(function(e) { return e.id !== eventId; }));
    setShowEventModal(false);
    setSelectedEvent(null);
    showNotification('일정이 삭제되었습니다', 'info');
  };
  
  var handleSaveTask = function(taskData) {
    if (taskData.id) {
      setTasks(tasks.map(function(t) { return t.id === taskData.id ? taskData : t; }));
    } else {
      var newTask = Object.assign({}, taskData, { id: 'task-' + Date.now() });
      setTasks(tasks.concat([newTask]));
    }
    setShowTaskModal(false);
    setShowAddTaskModal(false);
    setSelectedTask(null);
    showNotification('태스크가 저장되었습니다', 'success');
  };
  
  var handleDeleteTask = function(taskId) {
    setTasks(tasks.filter(function(t) { return t.id !== taskId; }));
    setShowTaskModal(false);
    setSelectedTask(null);
    showNotification('태스크가 삭제되었습니다', 'info');
  };
  
  var handleToggleTask = function(taskId) {
    setTasks(tasks.map(function(t) {
      if (t.id === taskId) {
        var newCompleted = !(t.completed || t.status === 'done');
        if (newCompleted) {
          addExperience(10);
          showNotification('+10 XP 획득! 🎉', 'success');
        }
        return Object.assign({}, t, {
          completed: newCompleted,
          status: newCompleted ? 'done' : 'todo',
          completedAt: newCompleted ? new Date().toISOString() : null
        });
      }
      return t;
    }));
  };
  
  var handleSaveRoutine = function(routineData) {
    if (routineData.id) {
      setRoutines(routines.map(function(r) { return r.id === routineData.id ? routineData : r; }));
    } else {
      var newRoutine = Object.assign({}, routineData, { id: 'routine-' + Date.now() });
      setRoutines(routines.concat([newRoutine]));
    }
    showNotification('루틴이 저장되었습니다', 'success');
  };
  
  var handleDeleteRoutine = function(routineId) {
    setRoutines(routines.filter(function(r) { return r.id !== routineId; }));
    showNotification('루틴이 삭제되었습니다', 'info');
  };
  
  var handleStartFocus = function(task) {
    setFocusTask(task);
    setIsFocusMode(true);
    setCurrentPage('focus');
  };
  
  var handleExitFocus = function() {
    setIsFocusMode(false);
    setFocusTask(null);
    setCurrentPage('work');
  };
  
  var handleCompleteFocus = function() {
    if (focusTask) {
      handleToggleTask(focusTask.id);
    }
    handleExitFocus();
  };
  
  var handleQuickCapture = function(text) {
    var newTask = {
      id: 'task-' + Date.now(),
      title: text,
      project: '인박스',
      status: 'todo',
      importance: 'medium',
      priorityScore: 50,
      priorityChange: 'new'
    };
    setTasks(tasks.concat([newTask]));
    setShowQuickCapture(false);
    showNotification('인박스에 추가됨', 'success');
  };
  
  var handleGoogleAuthSuccess = function() {
    setShowGoogleAuth(false);
    syncGoogleCalendar();
    syncGmail();
    showNotification('Google 연결 완료!', 'success');
  };
  
  var handleSaveMoodLog = function(moodData) {
    setMood(moodData.mood);
    setEnergy(moodData.energy);
    setShowMoodLogModal(false);
    showNotification('컨디션이 기록되었습니다', 'success');
  };
  
  var handleSaveJournal = function(journalData) {
    setShowJournalModal(false);
    addExperience(15);
    showNotification('저널이 저장되었습니다 (+15 XP)', 'success');
  };
  
  var handleSaveHealth = function(data) {
    setHealthData(data);
    setShowHealthEditModal(false);
    showNotification('건강 데이터가 업데이트되었습니다', 'success');
  };
  
  var handleCompleteOnboarding = function() {
    setHasCompletedOnboarding(true);
    saveToStorage(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, true);
  };
  
  var handleLogout = function() {
    signOut();
  };
  
  // 온보딩 표시
  if (!hasCompletedOnboarding) {
    return React.createElement(Onboarding, {
      onComplete: handleCompleteOnboarding,
      userName: user.user_metadata && user.user_metadata.name || user.email
    });
  }
  
  // 집중 모드
  if (isFocusMode && currentPage === 'focus') {
    return React.createElement(FocusPage, {
      task: focusTask,
      onComplete: handleCompleteFocus,
      onExit: handleExitFocus,
      onStartBodyDoubling: function() { setIsBodyDoubling(true); }
    });
  }
  
  // 바디더블링 모드
  if (isBodyDoubling) {
    return React.createElement(BodyDoublingMode, {
      task: focusTask,
      onExit: function() { setIsBodyDoubling(false); },
      onComplete: handleCompleteFocus
    });
  }
  
  // 채팅 페이지
  if (currentPage === 'chat') {
    return React.createElement(AlfredoChat, {
      onBack: function() { setCurrentPage('home'); },
      tasks: tasks,
      events: events,
      mood: mood,
      energy: energy,
      weather: weather,
      userName: user.user_metadata && user.user_metadata.name || user.email
    });
  }
  
  // 설정 페이지
  if (currentPage === 'settings') {
    return React.createElement(SettingsPage, {
      onBack: function() { setCurrentPage('more'); },
      onLogout: handleLogout,
      user: user,
      hasGoogleConnection: hasGoogleConnection,
      onConnectGoogle: function() { setShowGoogleAuth(true); }
    });
  }
  
  // 주간 리뷰
  if (currentPage === 'weeklyReview') {
    return React.createElement(WeeklyReviewPage, {
      onBack: function() { setCurrentPage('more'); },
      tasks: tasks,
      events: events,
      routines: routines
    });
  }
  
  // 습관 히트맵
  if (currentPage === 'habitHeatmap') {
    return React.createElement(HabitHeatmapPage, {
      onBack: function() { setCurrentPage('more'); },
      routines: routines
    });
  }
  
  // 에너지 리듬
  if (currentPage === 'energyRhythm') {
    return React.createElement(EnergyRhythmPage, {
      onBack: function() { setCurrentPage('more'); }
    });
  }
  
  // 프로젝트 대시보드
  if (currentPage === 'projects') {
    return React.createElement(ProjectDashboardPage, {
      onBack: function() { setCurrentPage('work'); },
      projects: projects,
      tasks: tasks
    });
  }
  
  // 인박스
  if (currentPage === 'inbox') {
    return React.createElement(InboxPage, {
      onBack: function() { setCurrentPage('work'); },
      tasks: tasks.filter(function(t) { return t.project === '인박스'; }),
      onMoveTask: function(taskId, project) {
        setTasks(tasks.map(function(t) {
          return t.id === taskId ? Object.assign({}, t, { project: project }) : t;
        }));
      },
      onDeleteTask: handleDeleteTask
    });
  }
  
  // 내일 준비
  if (currentPage === 'tomorrowPrep') {
    return React.createElement(TomorrowPrep, {
      onBack: function() { setCurrentPage('home'); },
      tasks: tasks,
      events: events,
      onUpdateTasks: setTasks
    });
  }
  
  // 페이지 렌더링
  var renderPage = function() {
    switch (currentPage) {
      case 'home':
        return React.createElement(HomePage, {
          tasks: tasks,
          setTasks: setTasks,
          events: events,
          routines: routines,
          weather: weather,
          mood: mood,
          energy: energy,
          onOpenChat: function() { setCurrentPage('chat'); },
          onOpenTask: handleOpenTask,
          onOpenEvent: handleOpenEvent,
          onOpenAddTask: handleOpenAddTask,
          onOpenMoodLog: function() { setShowMoodLogModal(true); },
          onStartFocus: handleStartFocus,
          onOpenTomorrowPrep: function() { setCurrentPage('tomorrowPrep'); },
          onToggleTask: handleToggleTask,
          userName: user.user_metadata && user.user_metadata.name || user.email,
          unreadCount: unreadCount,
          emails: emails,
          hasGoogleConnection: hasGoogleConnection,
          onConnectGoogle: function() { setShowGoogleAuth(true); },
          penguinState: penguinState,
          penguinMood: penguinMood,
          penguinEnergy: penguinEnergy,
          penguinLevel: penguinLevel,
          penguinName: penguinName,
          timeInsight: timeInsight,
          timeEstimatorData: timeEstimatorData,
          onOpenEveningReview: triggerDayEndManually,
          todayCompletedCount: todayCompletedCount
        });
      case 'calendar':
        return React.createElement(CalendarPage, {
          events: events,
          tasks: tasks,
          onOpenEvent: handleOpenEvent,
          onOpenTask: handleOpenTask,
          onAddEvent: function() { setSelectedEvent(null); setShowEventModal(true); },
          hasGoogleConnection: hasGoogleConnection,
          onSyncGoogle: syncGoogleCalendar
        });
      case 'work':
        return React.createElement(WorkPage, {
          darkMode: false,
          tasks: tasks,
          setTasks: setTasks,
          events: events,
          weather: weather,
          userName: user.user_metadata && user.user_metadata.name || user.email,
          onOpenTask: handleOpenTask,
          onOpenAddTask: handleOpenAddTask,
          onOpenProject: function() { setCurrentPage('projects'); },
          onOpenInbox: function() { setCurrentPage('inbox'); },
          onOpenChat: function() { setCurrentPage('chat'); },
          onStartFocus: handleStartFocus,
          startTimeTimer: startTimeTimer,
          stopTimeTimer: stopTimeTimer,
          getSuggestedTime: getSuggestedTime
        });
      case 'life':
        return React.createElement(LifePage, {
          darkMode: false,
          routines: routines,
          healthData: healthData,
          mood: mood,
          energy: energy,
          onOpenRoutineManage: function() { setShowRoutineModal(true); },
          onOpenMoodLog: function() { setShowMoodLogModal(true); },
          onOpenJournal: function() { setShowJournalModal(true); },
          onOpenHealthEdit: function() { setShowHealthEditModal(true); },
          onToggleRoutine: function(routineId) {
            setRoutines(routines.map(function(r) {
              if (r.id === routineId) {
                var newCompleted = !r.completedToday;
                if (newCompleted) addExperience(5);
                return Object.assign({}, r, { completedToday: newCompleted });
              }
              return r;
            }));
          }
        });
      case 'more':
        return React.createElement(MorePage, {
          onNavigate: setCurrentPage,
          onLogout: handleLogout,
          user: user,
          penguinLevel: penguinLevel,
          penguinName: penguinName
        });
      default:
        return null;
    }
  };
  
  // 네비게이션 아이템
  var navItems = [
    { id: 'home', icon: Home, label: '홈' },
    { id: 'calendar', icon: Calendar, label: '캘린더' },
    { id: 'work', icon: Briefcase, label: '업무' },
    { id: 'life', icon: Heart, label: '라이프' },
    { id: 'more', icon: MoreHorizontal, label: '더보기' }
  ];
  
  var bgColor = 'bg-[#F0EBFF]';
  
  return React.createElement('div', { className: bgColor + ' min-h-screen' },
    // 펭귄 상태바
    React.createElement(PenguinStatusBar, {
      state: penguinState,
      mood: penguinMood,
      energy: penguinEnergy,
      level: penguinLevel,
      name: penguinName,
      onClick: function() { setCurrentPage('chat'); }
    }),
    
    // 메인 콘텐츠
    React.createElement('main', { className: 'pb-20' },
      renderPage()
    ),
    
    // 플로팅 캡처 버튼
    currentPage !== 'chat' && React.createElement(FloatingCaptureButton, {
      onClick: function() { setShowQuickCapture(true); }
    }),
    
    // 알림 토스트
    notification && React.createElement(NotificationToast, {
      message: notification.message,
      type: notification.type,
      onClose: function() { setNotification(null); }
    }),
    
    // 하단 네비게이션
    React.createElement('nav', { className: 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-safe z-40' },
      React.createElement('div', { className: 'flex justify-around items-center h-16 max-w-lg mx-auto' },
        navItems.map(function(item) {
          var isActive = currentPage === item.id;
          return React.createElement('button', {
            key: item.id,
            onClick: function() { setCurrentPage(item.id); },
            className: 'flex flex-col items-center justify-center w-16 h-full transition-colors ' + (isActive ? 'text-[#A996FF]' : 'text-gray-400')
          },
            React.createElement(item.icon, { size: 22, strokeWidth: isActive ? 2.5 : 2 }),
            React.createElement('span', { className: 'text-[10px] mt-1 font-medium' + (isActive ? ' text-[#A996FF]' : '') }, item.label)
          );
        })
      )
    ),
    
    showEventModal && React.createElement(EventModal, { event: selectedEvent, onSave: handleSaveEvent, onDelete: handleDeleteEvent, onClose: function() { setShowEventModal(false); setSelectedEvent(null); } }),
    showTaskModal && React.createElement(TaskModal, { task: selectedTask, onSave: handleSaveTask, onDelete: handleDeleteTask, onClose: function() { setShowTaskModal(false); setSelectedTask(null); }, onStartFocus: handleStartFocus, getSuggestedTime: getSuggestedTime }),
    showAddTaskModal && React.createElement(AddTaskModal, { isOpen: showAddTaskModal, onClose: function() { setShowAddTaskModal(false); setSelectedTask(null); }, onAdd: handleSaveTask, projects: projects, getSuggestedTime: getSuggestedTime }),
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
