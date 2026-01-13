import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Home, Calendar, Briefcase, Heart, MoreHorizontal, Sparkles, Coins
} from 'lucide-react';

// 🔐 인증 스토어
import { useAuthStore } from './stores/authStore';
// 🐧 펭귄 스토어
import { usePenguinStore } from './stores/penguinStore';

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
// 🐧 펭귄 상태바 컴포넌트
// ============================================================

function PenguinStatusBar() {
  var penguinStore = usePenguinStore();
  var status = penguinStore.status;
  var fetchStatus = penguinStore.fetchStatus;
  
  useEffect(function() {
    fetchStatus();
  }, []);
  
  if (!status) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'rgba(169, 150, 255, 0.1)',
        borderRadius: '20px'
      }
    },
      React.createElement('span', { style: { fontSize: '16px' } }, '🐧'),
      React.createElement('span', {
        style: { fontSize: '12px', color: '#8E8E93' }
      }, 'Lv.1')
    );
  }
  
  var xpPercent = Math.round((status.current_xp / status.xp_for_next_level) * 100);
  
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '6px 14px',
      backgroundColor: 'rgba(169, 150, 255, 0.1)',
      borderRadius: '20px',
      border: '1px solid rgba(169, 150, 255, 0.2)'
    }
  },
    // 펭귄 아이콘 + 레벨
    React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }
    },
      React.createElement('span', { style: { fontSize: '18px' } }, '🐧'),
      React.createElement('span', {
        style: {
          fontSize: '12px',
          fontWeight: '600',
          color: COLORS.primary
        }
      }, 'Lv.' + status.level)
    ),
    
    // XP 바
    React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    },
      React.createElement(Sparkles, {
        size: 12,
        color: '#FFB800'
      }),
      React.createElement('div', {
        style: {
          width: '40px',
          height: '4px',
          backgroundColor: 'rgba(169, 150, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden'
        }
      },
        React.createElement('div', {
          style: {
            width: xpPercent + '%',
            height: '100%',
            backgroundColor: COLORS.primary,
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }
        })
      ),
      React.createElement('span', {
        style: {
          fontSize: '10px',
          color: '#8E8E93'
        }
      }, xpPercent + '%')
    ),
    
    // 코인
    React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }
    },
      React.createElement(Coins, {
        size: 12,
        color: '#FFB800'
      }),
      React.createElement('span', {
        style: {
          fontSize: '12px',
          fontWeight: '500',
          color: '#1F2937'
        }
      }, status.coins)
    )
  );
}

// ============================================================
// 🔐 로그인 페이지 컴포넌트
// ============================================================

function LoginPage() {
  var authStore = useAuthStore();
  var loginWithGoogle = authStore.loginWithGoogle;
  var isLoading = authStore.isLoading;
  
  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];
  
  var handleGoogleLogin = function() {
    setError(null);
    loginWithGoogle().catch(function(err) {
      setError(err.message || '로그인에 실패했습니다.');
    });
  };
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F3F0FF 0%, #FAFAFA 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }
  },
    // 펭귄 캐릭터
    React.createElement('div', {
      style: {
        position: 'relative',
        marginBottom: '32px'
      }
    },
      React.createElement('div', {
        style: {
          position: 'absolute',
          inset: '-16px',
          background: 'rgba(169, 150, 255, 0.3)',
          borderRadius: '50%',
          filter: 'blur(20px)',
          animation: 'pulse 2s infinite'
        }
      }),
      React.createElement('div', {
        style: {
          position: 'relative',
          width: '128px',
          height: '128px',
          background: 'linear-gradient(180deg, #A996FF 0%, #7C6BD6 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(169, 150, 255, 0.3)'
        }
      },
        React.createElement('span', { style: { fontSize: '64px' } }, '🐧')
      )
    ),
    
    // 타이틀
    React.createElement('h1', {
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: '8px'
      }
    }, '알프레도'),
    
    React.createElement('p', {
      style: {
        color: '#6B7280',
        marginBottom: '32px',
        textAlign: 'center',
        lineHeight: '1.5'
      }
    }, '당신의 하루를 다정하게 돌봐드리는', React.createElement('br'), 'AI 버틀러 펭귄'),
    
    // 에러 메시지
    error && React.createElement('div', {
      style: {
        marginBottom: '16px',
        padding: '12px 16px',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '12px',
        color: '#DC2626',
        fontSize: '14px'
      }
    }, error),
    
    // Google 로그인 버튼
    React.createElement('button', {
      onClick: handleGoogleLogin,
      disabled: isLoading,
      style: {
        width: '100%',
        maxWidth: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '14px 24px',
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.6 : 1,
        transition: 'all 0.2s ease'
      }
    },
      isLoading
        ? React.createElement(React.Fragment, null,
            React.createElement('div', {
              style: {
                width: '20px',
                height: '20px',
                border: '2px solid #A996FF',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }
            }),
            React.createElement('span', {
              style: { color: '#374151', fontWeight: '500' }
            }, '연결 중...')
          )
        : React.createElement(React.Fragment, null,
            React.createElement('svg', {
              width: '20',
              height: '20',
              viewBox: '0 0 24 24'
            },
              React.createElement('path', {
                fill: '#4285F4',
                d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              }),
              React.createElement('path', {
                fill: '#34A853',
                d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              }),
              React.createElement('path', {
                fill: '#FBBC05',
                d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              }),
              React.createElement('path', {
                fill: '#EA4335',
                d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              })
            ),
            React.createElement('span', {
              style: { color: '#374151', fontWeight: '500' }
            }, 'Google로 시작하기')
          )
    ),
    
    // 설명
    React.createElement('p', {
      style: {
        marginTop: '24px',
        fontSize: '12px',
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: '1.5'
      }
    }, '로그인 시 Google Calendar와 Gmail에 접근하여', React.createElement('br'), '일정 및 이메일을 관리할 수 있습니다.'),
    
    // 하단 펭귄 애니메이션
    React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#9CA3AF',
        fontSize: '14px'
      }
    },
      React.createElement('span', {
        style: { animation: 'bounce 1s infinite' }
      }, '🐧'),
      React.createElement('span', null, '버틀러 펭귄이 대기 중...')
    )
  );
}

// ============================================================
// 🔐 인증 콜백 페이지 컴포넌트
// ============================================================

function AuthCallbackPage(props) {
  var onSuccess = props.onSuccess;
  var authStore = useAuthStore();
  var handleCallback = authStore.handleCallback;
  
  var statusState = useState('processing');
  var status = statusState[0];
  var setStatus = statusState[1];
  
  useEffect(function() {
    var urlParams = new URLSearchParams(window.location.search);
    var code = urlParams.get('code');
    
    if (code) {
      handleCallback(code).then(function(success) {
        if (success) {
          setStatus('success');
          // URL 정리
          window.history.replaceState({}, document.title, '/');
          setTimeout(function() {
            onSuccess();
          }, 1000);
        } else {
          setStatus('error');
        }
      });
    } else {
      setStatus('error');
    }
  }, []);
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAFAFA'
    }
  },
    React.createElement('div', {
      style: {
        textAlign: 'center'
      }
    },
      React.createElement('span', {
        style: {
          fontSize: '64px',
          display: 'block',
          marginBottom: '24px',
          animation: status === 'processing' ? 'bounce 1s infinite' : 'none'
        }
      }, status === 'success' ? '🎉' : status === 'error' ? '😢' : '🐧'),
      
      React.createElement('p', {
        style: {
          fontSize: '18px',
          color: '#374151',
          fontWeight: '500'
        }
      }, status === 'processing' ? '로그인 처리 중...'
         : status === 'success' ? '로그인 성공!'
         : '로그인에 실패했습니다.')
    )
  );
}

// ============================================================
// 메인 App 컴포넌트
// ============================================================

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
    // URL에서 auth callback 체크
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
  // 🔐 인증 초기화
  // ============================================================
  
  useEffect(function() {
    initializeAuth();
  }, []);
  
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
  var googleUserEmail = googleCalendar.userEmail;
  
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
  
  // 📅 이벤트 저장 - Google Calendar 양방향 동기화 지원
  var handleSaveEvent = useCallback(function(eventData) {
    // syncToGoogle이 true이고 Google 연결된 경우에만 Google Calendar에 저장
    var shouldSyncToGoogle = eventData.syncToGoogle !== false && isConnected;
    
    if (shouldSyncToGoogle) {
      if (selectedEvent && selectedEvent.id) {
        // 기존 이벤트 수정
        updateEvent(selectedEvent.id, eventData);
      } else {
        // 새 이벤트 추가
        addEvent(eventData);
      }
    } else {
      // 로컬 전용 이벤트 (향후 구현 가능)
      console.log('Local-only event (not synced to Google):', eventData);
    }
    
    setShowEventModal(false);
    setSelectedEvent(null);
  }, [selectedEvent, updateEvent, addEvent, isConnected]);
  
  // 📅 이벤트 삭제 - Google Calendar에서도 삭제
  var handleDeleteEvent = useCallback(function(eventId, googleEventId) {
    // googleEventId가 있으면 Google Calendar에서도 삭제
    if (googleEventId || (selectedEvent && selectedEvent.fromGoogle)) {
      deleteEvent(googleEventId || eventId);
    }
    setShowEventModal(false);
    setSelectedEvent(null);
  }, [deleteEvent, selectedEvent]);
  
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
  
  // 🆕 내일 준비 (저녁 랩업) 열기
  var handleOpenTomorrowPrep = useCallback(function() {
    setPreviousPage(currentPage);
    setCurrentPage('TOMORROW_PREP');
  }, [currentPage]);
  
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
      case 'open_tomorrow_prep':
        handleOpenTomorrowPrep();
        break;
      default:
        break;
    }
    handleDismissNudge();
  }, [handleOpenChat, handleStartFocus, handleStartBodyDoubling, handleOpenInbox, handleOpenTomorrowPrep]);
  
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
  
  // 🔐 인증 콜백 처리
  if (currentPage === 'AUTH_CALLBACK') {
    return React.createElement(AuthCallbackPage, {
      onSuccess: function() {
        setCurrentPage('HOME');
      }
    });
  }
  
  // 🔐 로그인 체크 (인증 로딩 중이면 스플래시)
  if (isAuthLoading) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAFAFA'
      }
    },
      React.createElement('span', {
        style: {
          fontSize: '64px',
          animation: 'bounce 1s infinite'
        }
      }, '🐧'),
      React.createElement('p', {
        style: {
          marginTop: '16px',
          color: '#6B7280'
        }
      }, '알프레도 준비 중...')
    );
  }
  
  // 🔐 비로그인 시 로그인 페이지
  // 참고: 현재는 개발 편의를 위해 비로그인도 허용 (원하면 아래 주석 해제)
  // if (!isAuthenticated) {
  //   return React.createElement(LoginPage);
  // }
  
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
      case 'LOGIN':
        return React.createElement(LoginPage);
        
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
          onOpenTomorrowPrep: handleOpenTomorrowPrep,
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
          getBriefingTone: getBriefingTone,
          // 🐧 펭귄 상태바
          PenguinStatusBar: PenguinStatusBar
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
          onOpenTomorrowPrep: handleOpenTomorrowPrep,
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
        
      case 'TOMORROW_PREP':
        return React.createElement(TomorrowPrep, Object.assign({}, commonProps, {
          tasks: tasks,
          events: events,
          onBack: function() { setCurrentPage(previousPage); },
          onOpenChat: handleOpenChat,
          onAddTask: handleAddTask
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
    
    // 📅 EventModal - Google Calendar 연동 prop 추가
    React.createElement(EventModal, {
      isOpen: showEventModal,
      event: selectedEvent,
      onSave: handleSaveEvent,
      onDelete: selectedEvent ? function() { handleDeleteEvent(selectedEvent.id, selectedEvent.googleEventId || selectedEvent.id); } : null,
      onClose: function() {
        setShowEventModal(false);
        setSelectedEvent(null);
      },
      googleCalendar: {
        isSignedIn: isConnected,
        isLoading: isLoading,
        signIn: connect,
        userInfo: googleUserEmail ? { email: googleUserEmail } : null
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
