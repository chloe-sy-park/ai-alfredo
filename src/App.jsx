import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Home, Briefcase, Heart, Zap, MessageCircle, Send, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Plus, Clock, CheckCircle2, Circle, Bell, TrendingUp, TrendingDown, Trophy, Calendar, MapPin, Sun, Moon, Cloud, CloudRain, Sparkles, Settings, RefreshCw, Mic, Battery, Umbrella, Shirt as ShirtIcon, X, FileText, Mail, AlertCircle, Inbox, Trash2, Lightbulb, Search, Award, Target, Flame, Star, Gift, Crown, Database, Upload, FileAudio, Loader2 } from 'lucide-react';
import MeetingUploader from './components/MeetingUploader';
import { useGoogleCalendar } from './hooks/useGoogleCalendar';

// === Design System ===
const COLORS = {
  // Primary
  primary: '#A996FF',
  primaryDark: '#8B7CF7',
  primaryLight: '#C4B5FD',
  
  // Background
  bgLight: '#F8F7FF',
  bgDark: '#111827', // gray-900
  
  // Card
  cardLight: '#FFFFFF',
  cardDark: '#1F2937', // gray-800
  
  // Text
  textLight: '#1F2937', // gray-800
  textDark: '#F9FAFB', // gray-50
  textSecondaryLight: '#6B7280', // gray-500
  textSecondaryDark: '#9CA3AF', // gray-400
  
  // Status
  success: '#10B981', // emerald-500
  warning: '#A996FF', // lavender
  error: '#EF4444', // red-500
  info: '#A996FF', // lavender
  
  // Accent
  mint: '#34D399',
  coral: '#FB7185',
  sunset: '#F59E0B',
};

const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
};

const RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  full: '9999px',
};

// 공통 스타일 헬퍼
const getThemeStyles = (darkMode) => ({
  // 배경
  bgPage: darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]',
  bgCard: darkMode ? 'bg-gray-800' : 'bg-white',
  bgCardHover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
  bgInput: darkMode ? 'bg-gray-700' : 'bg-gray-50',
  bgAccent: darkMode ? 'bg-gray-700' : 'bg-[#F5F3FF]',
  
  // 텍스트
  textPrimary: darkMode ? 'text-white' : 'text-gray-800',
  textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
  textTertiary: darkMode ? 'text-gray-500' : 'text-gray-400',
  
  // 테두리
  border: darkMode ? 'border-gray-700' : 'border-gray-100',
  borderStrong: darkMode ? 'border-gray-600' : 'border-gray-200',
  
  // 그림자
  shadow: darkMode ? 'shadow-lg shadow-black/20' : 'shadow-sm',
  shadowStrong: darkMode ? 'shadow-xl shadow-black/30' : 'shadow-lg',
  
  // 분리선
  divide: darkMode ? 'divide-gray-700' : 'divide-gray-100',
});

// 공통 버튼 스타일
const BUTTON_STYLES = {
  primary: 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white hover:opacity-90 active:scale-95',
  secondary: (darkMode) => darkMode 
    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 active:scale-95' 
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95',
  ghost: (darkMode) => darkMode
    ? 'text-gray-300 hover:bg-gray-700 active:scale-95'
    : 'text-gray-600 hover:bg-gray-100 active:scale-95',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
};

// 공통 카드 스타일
const CARD_STYLES = (darkMode) => `
  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
  backdrop-blur-xl rounded-xl border
  ${darkMode ? 'shadow-lg shadow-black/20' : 'shadow-sm'}
`;

// 공통 입력 스타일
const INPUT_STYLES = (darkMode) => `
  ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400'}
  rounded-xl border px-4 py-3 w-full
  focus:outline-none focus:ring-2 focus:ring-[#A996FF] focus:border-transparent
  transition-all duration-200
`;

// === Phase 2: Time Management System ===
// 시간 관리 설정
const TIME_CONFIG = {
  // 예상 시간 초과 알림 임계값 (배수)
  overtimeThreshold: 1.5, // 예상 시간의 1.5배 초과 시 알림
  // 다음 일정 알림 시간 (분)
  eventAlertTimes: [30, 10], // 30분, 10분 전
  // 휴식 권유 시간 (분)
  breakReminderTime: 120, // 2시간 연속 작업 시
  // 식사 시간대 (시작 시간)
  mealTimes: {
    lunch: { start: 11, end: 13, label: '점심' },
    dinner: { start: 17, end: 19, label: '저녁' },
  },
  // 알림 쿨다운 (분) - 같은 알림 반복 방지
  alertCooldown: 5,
};

// 시간 트래킹 훅
const useTimeTracking = (currentTask, events = [], onAlert) => {
  const [trackingState, setTrackingState] = useState({
    taskStartTime: null,           // 현재 태스크 시작 시간
    sessionStartTime: null,        // 세션 시작 시간 (연속 작업 추적)
    totalSessionMinutes: 0,        // 연속 작업 시간 (분)
    lastBreakTime: null,           // 마지막 휴식 시간
    alertHistory: {},              // 알림 히스토리 (쿨다운용)
    dismissedAlerts: new Set(),    // 닫은 알림들
  });
  
  const [activeAlert, setActiveAlert] = useState(null);
  
  // 시간 포맷 헬퍼
  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hrs > 0) return `${hrs}시간 ${mins}분`;
    return `${mins}분`;
  };
  
  // 태스크 시작
  const startTaskTracking = useCallback((task) => {
    const now = Date.now();
    setTrackingState(prev => ({
      ...prev,
      taskStartTime: now,
      sessionStartTime: prev.sessionStartTime || now,
    }));
  }, []);
  
  // 태스크 완료/중단
  const stopTaskTracking = useCallback(() => {
    setTrackingState(prev => ({
      ...prev,
      taskStartTime: null,
    }));
  }, []);
  
  // 휴식 기록
  const recordBreak = useCallback(() => {
    const now = Date.now();
    setTrackingState(prev => ({
      ...prev,
      sessionStartTime: null,
      totalSessionMinutes: 0,
      lastBreakTime: now,
    }));
    setActiveAlert(null);
  }, []);
  
  // 알림 닫기
  const dismissAlert = useCallback((alertId) => {
    setTrackingState(prev => ({
      ...prev,
      dismissedAlerts: new Set([...prev.dismissedAlerts, alertId]),
    }));
    setActiveAlert(null);
  }, []);
  
  // 알림 표시 가능 여부 체크 (쿨다운)
  const canShowAlert = useCallback((alertType, alertId) => {
    const now = Date.now();
    const lastShown = trackingState.alertHistory[alertId];
    if (lastShown && (now - lastShown) < TIME_CONFIG.alertCooldown * 60 * 1000) {
      return false;
    }
    if (trackingState.dismissedAlerts.has(alertId)) {
      return false;
    }
    return true;
  }, [trackingState.alertHistory, trackingState.dismissedAlerts]);
  
  // 알림 기록
  const recordAlert = useCallback((alertId) => {
    setTrackingState(prev => ({
      ...prev,
      alertHistory: {
        ...prev.alertHistory,
        [alertId]: Date.now(),
      },
    }));
  }, []);
  
  // 메인 시간 체크 로직 (1분마다 실행)
  useEffect(() => {
    const checkTimeAlerts = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // 1. 예상 시간 초과 체크
      if (currentTask && trackingState.taskStartTime && currentTask.estimatedMinutes) {
        const elapsedMinutes = (Date.now() - trackingState.taskStartTime) / (1000 * 60);
        const threshold = currentTask.estimatedMinutes * TIME_CONFIG.overtimeThreshold;
        
        if (elapsedMinutes >= threshold) {
          const alertId = `overtime_${currentTask.id}`;
          if (canShowAlert('overtime', alertId)) {
            setActiveAlert({
              id: alertId,
              type: 'overtime',
              title: '예상 시간 초과',
              message: `"${currentTask.title}"이 ${formatDuration(currentTask.estimatedMinutes)} 예상이었는데 ${formatDuration(elapsedMinutes)} 지났어요.`,
              subMessage: '계속할 수도 있어요. 그냥 알려드리는 거예요.',
              icon: '⏰',
              actions: [
                { label: '계속하기', action: 'continue' },
                { label: '휴식하기', action: 'break' },
              ],
            });
            recordAlert(alertId);
          }
        }
      }
      
      // 2. 다음 일정 알림 체크
      const todayStr = now.toISOString().split('T')[0];
      const todayEvents = events
        .filter(e => e.date === todayStr && e.start)
        .map(e => {
          const [h, m] = e.start.split(':').map(Number);
          const eventMinutes = h * 60 + m;
          return { ...e, eventMinutes, minutesUntil: eventMinutes - currentMinutes };
        })
        .filter(e => e.minutesUntil > 0 && e.minutesUntil <= 30)
        .sort((a, b) => a.minutesUntil - b.minutesUntil);
      
      if (todayEvents.length > 0) {
        const nextEvent = todayEvents[0];
        TIME_CONFIG.eventAlertTimes.forEach(alertTime => {
          if (nextEvent.minutesUntil <= alertTime && nextEvent.minutesUntil > alertTime - 2) {
            const alertId = `event_${nextEvent.id}_${alertTime}`;
            if (canShowAlert('event', alertId)) {
              const urgency = alertTime <= 10 ? 'high' : 'medium';
              setActiveAlert({
                id: alertId,
                type: 'event',
                urgency,
                title: alertTime <= 10 ? '일정 곧 시작!' : '다음 일정 알림',
                message: `"${nextEvent.title}"이 ${nextEvent.minutesUntil}분 후예요.`,
                subMessage: nextEvent.location ? `📍 ${nextEvent.location}` : null,
                icon: alertTime <= 10 ? '🔔' : '⏰',
                actions: [
                  { label: '확인', action: 'dismiss' },
                  { label: '지금 마무리', action: 'wrapup' },
                ],
              });
              recordAlert(alertId);
            }
          }
        });
      }
      
      // 3. 휴식 리마인더 체크 (2시간 연속 작업)
      if (trackingState.sessionStartTime) {
        const sessionMinutes = (Date.now() - trackingState.sessionStartTime) / (1000 * 60);
        
        if (sessionMinutes >= TIME_CONFIG.breakReminderTime) {
          const alertId = `break_${Math.floor(sessionMinutes / TIME_CONFIG.breakReminderTime)}`;
          if (canShowAlert('break', alertId)) {
            setActiveAlert({
              id: alertId,
              type: 'break',
              title: '휴식 시간?',
              message: `${formatDuration(sessionMinutes)}째 작업 중이에요.`,
              subMessage: '물 한 잔 어때요? 계속해도 괜찮아요.',
              icon: '☕',
              actions: [
                { label: '5분 휴식', action: 'break' },
                { label: '나중에', action: 'later' },
              ],
            });
            recordAlert(alertId);
          }
        }
      }
      
      // 4. 식사 시간 리마인더
      const hour = now.getHours();
      Object.entries(TIME_CONFIG.mealTimes).forEach(([meal, config]) => {
        if (hour >= config.start && hour < config.end) {
          const alertId = `meal_${meal}_${todayStr}`;
          if (canShowAlert('meal', alertId) && trackingState.sessionStartTime) {
            const sessionMinutes = (Date.now() - trackingState.sessionStartTime) / (1000 * 60);
            if (sessionMinutes >= 30) { // 30분 이상 작업 중일 때만
              setActiveAlert({
                id: alertId,
                type: 'meal',
                title: `${config.label} 시간이에요`,
                message: '밥 먹었어요? 챙겨 먹어요!',
                subMessage: '바쁘면 나중에 먹어도 괜찮아요.',
                icon: meal === 'lunch' ? '🍱' : '🍽️',
                actions: [
                  { label: '먹었어요', action: 'dismiss' },
                  { label: '나중에', action: 'later' },
                ],
              });
              recordAlert(alertId);
            }
          }
        }
      });
    };
    
    // 즉시 체크 + 1분마다 체크
    checkTimeAlerts();
    const interval = setInterval(checkTimeAlerts, 60000);
    
    return () => clearInterval(interval);
  }, [currentTask, events, trackingState.sessionStartTime, trackingState.taskStartTime, canShowAlert, recordAlert]);
  
  // 현재 태스크 변경 시 트래킹 시작
  useEffect(() => {
    if (currentTask) {
      startTaskTracking(currentTask);
    } else {
      stopTaskTracking();
    }
  }, [currentTask, startTaskTracking, stopTaskTracking]);
  
  return {
    trackingState,
    activeAlert,
    dismissAlert,
    recordBreak,
    formatDuration,
    getElapsedTime: () => {
      if (!trackingState.taskStartTime) return 0;
      return (Date.now() - trackingState.taskStartTime) / (1000 * 60);
    },
    getSessionTime: () => {
      if (!trackingState.sessionStartTime) return 0;
      return (Date.now() - trackingState.sessionStartTime) / (1000 * 60);
    },
  };
};

// === Time Alert Toast Component ===
const TimeAlertToast = ({ alert, onAction, onDismiss, darkMode = false }) => {
  if (!alert) return null;
  
  const bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-800';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = alert.urgency === 'high' 
    ? 'border-red-400' 
    : alert.type === 'break' || alert.type === 'meal'
      ? 'border-emerald-400'
      : 'border-[#A996FF]';
  
  const handleAction = (action) => {
    if (action === 'dismiss' || action === 'continue' || action === 'later') {
      onDismiss(alert.id);
    } else {
      onAction(action, alert);
    }
  };
  
  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className={`${bgColor} rounded-xl shadow-2xl border-l-4 ${borderColor} p-4 mx-auto max-w-md`}>
        <div className="flex items-start gap-3">
          {/* 아이콘 */}
          <div className="w-10 h-10 bg-[#F5F3FF] rounded-xl flex items-center justify-center text-xl shrink-0">
            {alert.icon}
          </div>
          
          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`font-bold ${textColor}`}>{alert.title}</p>
              <button 
                onClick={() => onDismiss(alert.id)}
                className={`${subTextColor} hover:text-gray-700 p-1`}
              >
                <X size={16} />
              </button>
            </div>
            <p className={`text-sm ${textColor} mt-1`}>{alert.message}</p>
            {alert.subMessage && (
              <p className={`text-xs ${subTextColor} mt-1`}>{alert.subMessage}</p>
            )}
            
            {/* 액션 버튼 */}
            {alert.actions && (
              <div className="flex gap-2 mt-3">
                {alert.actions.map((action, idx) => (
                  <button
                    key={action.action}
                    onClick={() => handleAction(action.action)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      idx === 0
                        ? 'bg-[#A996FF] text-white hover:bg-[#8B7CF7]'
                        : darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// === Gamification System ===
const LEVEL_CONFIG = {
  // XP 필요량: 레벨 * 100
  getRequiredXP: (level) => level * 100,
  getLevel: (totalXP) => {
    let level = 1;
    let xpNeeded = 100;
    let accumulated = 0;
    while (accumulated + xpNeeded <= totalXP) {
      accumulated += xpNeeded;
      level++;
      xpNeeded = level * 100;
    }
    return { level, currentXP: totalXP - accumulated, requiredXP: xpNeeded, totalXP };
  },
};

// XP 보상 테이블
const XP_REWARDS = {
  taskComplete: 20,          // 일반 태스크 완료
  taskCompleteHigh: 40,      // 중요 태스크 완료
  big3Complete: 30,          // Big3 태스크 완료
  allBig3Complete: 100,      // Big3 전체 완료 보너스
  focusSession: 25,          // 집중 세션 완료
  streakBonus: 10,           // 연속 달성 보너스 (per day)
  routineComplete: 15,       // 루틴 완료
  earlyBird: 50,             // 오전 중 Big3 완료
};

// 배지 정의
const BADGES = [
  // 시작 배지
  { id: 'first_task', name: '첫 발걸음', icon: '🎯', description: '첫 번째 태스크 완료', condition: (stats) => stats.totalCompleted >= 1 },
  { id: 'first_big3', name: 'Big3 마스터', icon: '🏆', description: 'Big3 전체 완료', condition: (stats) => stats.big3Completed >= 1 },
  { id: 'first_focus', name: '집중의 시작', icon: '⚡', description: '첫 집중 세션 완료', condition: (stats) => stats.focusSessions >= 1 },
  
  // 연속 달성
  { id: 'streak_3', name: '3일 연속', icon: '🔥', description: '3일 연속 Big3 완료', condition: (stats) => stats.streak >= 3 },
  { id: 'streak_7', name: '일주일 불꽃', icon: '🔥', description: '7일 연속 Big3 완료', condition: (stats) => stats.streak >= 7 },
  { id: 'streak_30', name: '한 달의 기적', icon: '💎', description: '30일 연속 Big3 완료', condition: (stats) => stats.streak >= 30 },
  
  // 누적 달성
  { id: 'tasks_10', name: '열 걸음', icon: '👟', description: '10개 태스크 완료', condition: (stats) => stats.totalCompleted >= 10 },
  { id: 'tasks_50', name: '반백 달성', icon: '🎖️', description: '50개 태스크 완료', condition: (stats) => stats.totalCompleted >= 50 },
  { id: 'tasks_100', name: '백 전사', icon: '🏅', description: '100개 태스크 완료', condition: (stats) => stats.totalCompleted >= 100 },
  
  // 집중 시간
  { id: 'focus_1h', name: '집중 1시간', icon: '🧘', description: '누적 집중 1시간', condition: (stats) => stats.focusMinutes >= 60 },
  { id: 'focus_10h', name: '집중 10시간', icon: '🧠', description: '누적 집중 10시간', condition: (stats) => stats.focusMinutes >= 600 },
  
  // 특별 배지
  { id: 'early_bird', name: '얼리버드', icon: '🐦', description: '오전 9시 전 Big3 완료', condition: (stats) => stats.earlyBirdCount >= 1 },
  { id: 'night_owl', name: '나이트 아울', icon: '🦉', description: '밤 10시 이후 태스크 완료', condition: (stats) => stats.nightOwlCount >= 1 },
  { id: 'perfect_week', name: '완벽한 한 주', icon: '⭐', description: '일주일 내내 Big3 완료', condition: (stats) => stats.perfectWeeks >= 1 },
  
  // 레벨 배지
  { id: 'level_5', name: '견습생', icon: '🌱', description: '레벨 5 달성', condition: (stats) => stats.level >= 5 },
  { id: 'level_10', name: '숙련자', icon: '🌿', description: '레벨 10 달성', condition: (stats) => stats.level >= 10 },
  { id: 'level_20', name: '전문가', icon: '🌳', description: '레벨 20 달성', condition: (stats) => stats.level >= 20 },
  { id: 'level_50', name: '마스터', icon: '👑', description: '레벨 50 달성', condition: (stats) => stats.level >= 50 },
];

// 초기 게임 상태
const initialGameState = {
  totalXP: 0,
  streak: 0,
  lastCompletionDate: null,
  totalCompleted: 0,
  big3Completed: 0,
  focusSessions: 0,
  focusMinutes: 0,
  earlyBirdCount: 0,
  nightOwlCount: 0,
  perfectWeeks: 0,
  unlockedBadges: [],
  weeklyXP: [0, 0, 0, 0, 0, 0, 0], // 일~토
  todayXP: 0,
  todayTasks: 0,
};

// === Common UI Components ===

// 공통 버튼 컴포넌트
const Button = ({ 
  children, 
  variant = 'primary', // primary, secondary, ghost, danger
  size = 'md', // sm, md, lg
  fullWidth = false,
  disabled = false,
  darkMode = false,
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3.5 text-base rounded-xl',
  };
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white hover:opacity-90',
    secondary: darkMode 
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    ghost: darkMode
      ? 'text-gray-300 hover:bg-gray-700'
      : 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  
  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
        font-medium transition-all duration-200
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// 공통 카드 컴포넌트
const Card = ({ 
  children, 
  darkMode = false, 
  padding = 'md', // sm, md, lg
  className = '',
  onClick,
  hover = false,
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };
  
  const bgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const shadowClass = darkMode ? 'shadow-lg shadow-black/20' : 'shadow-sm';
  const hoverClass = hover 
    ? darkMode ? 'hover:bg-gray-750 cursor-pointer' : 'hover:bg-gray-50 cursor-pointer'
    : '';
  
  return (
    <div
      className={`
        ${bgClass}
        ${shadowClass}
        ${hoverClass}
        ${paddingClasses[padding]}
        backdrop-blur-xl rounded-xl border
        transition-all duration-200
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// 공통 토글 컴포넌트
const Toggle = ({ 
  enabled, 
  onChange, 
  size = 'md', // sm, md
  disabled = false 
}) => {
  const sizeClasses = {
    sm: { track: 'w-9 h-5', thumb: 'w-3.5 h-3.5', translate: 'translate-x-4' },
    md: { track: 'w-12 h-7', thumb: 'w-5 h-5', translate: 'translate-x-6' },
  };
  
  const s = sizeClasses[size];
  
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      className={`
        ${s.track} rounded-full transition-all duration-200
        ${enabled ? 'bg-[#A996FF]' : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className={`
        ${s.thumb} bg-white rounded-full shadow-md 
        transition-transform duration-200 mt-1
        ${enabled ? s.translate : 'translate-x-1'}
      `} />
    </button>
  );
};

// 공통 섹션 헤더
const SectionHeader = ({ 
  title, 
  icon, 
  action, 
  darkMode = false 
}) => {
  const textClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className="flex items-center justify-between mb-3">
      <p className={`text-xs font-semibold ${textClass} flex items-center gap-1.5`}>
        {icon && <span>{icon}</span>}
        {title}
      </p>
      {action}
    </div>
  );
};

// 공통 빈 상태 컴포넌트
const EmptyState = ({ 
  icon = '📭', 
  title, 
  description, 
  action,
  darkMode = false 
}) => {
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className={`font-medium ${textPrimary}`}>{title}</p>
      {description && (
        <p className={`text-sm ${textSecondary} mt-1`}>{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

// 공통 모달 컴포넌트
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  darkMode = false,
  size = 'md' // sm, md, lg, full
}) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  };
  
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`
          ${bgCard} ${sizeClasses[size]} w-full
          rounded-xl shadow-2xl
          animate-in fade-in zoom-in-95 duration-200
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className={`text-lg font-bold ${textPrimary}`}>{title}</h2>
            <button 
              onClick={onClose}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <X size={20} className={textSecondary} />
            </button>
          </div>
        )}
        
        {/* 컨텐츠 */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// 공통 페이지 헤더 컴포넌트
const PageHeader = ({ 
  title, 
  onBack, 
  rightAction, 
  darkMode = false 
}) => {
  const bgCard = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className={`${bgCard} px-4 py-3 flex items-center justify-between border-b sticky top-0 z-10`}>
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className={textSecondary}>
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 className={`text-lg font-bold ${textPrimary}`}>{title}</h1>
      </div>
      {rightAction}
    </div>
  );
};

// 공통 프로그레스 바
const ProgressBar = ({ 
  value, // 0-100
  size = 'md', // sm, md, lg
  showLabel = false,
  color = 'primary' // primary, success, warning, danger
}) => {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };
  
  const colorClasses = {
    primary: 'from-[#A996FF] to-[#8B7CF7]',
    success: 'from-emerald-400 to-emerald-600',
    warning: 'from-[#A996FF] to-[#EDE9FE]0',
    danger: 'from-red-400 to-red-500',
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <div 
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-500">{Math.round(value)}%</span>
      )}
    </div>
  );
};

// 공통 배지/태그 컴포넌트
const Badge = ({ 
  children, 
  variant = 'default', // default, primary, success, warning, danger
  size = 'md' // sm, md
}) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[11px]',
    md: 'px-2 py-1 text-xs',
  };
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-[#F5F3FF] text-[#A996FF]',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-[#F5F3FF] text-[#8B7CF7]',
    danger: 'bg-red-50 text-red-600',
  };
  
  return (
    <span className={`
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      rounded-full font-medium inline-flex items-center
    `}>
      {children}
    </span>
  );
};

// === Mock Data ===
// 날씨 데이터
const mockWeather = {
  temp: -3,
  tempHigh: 2,
  tempLow: -5,
  high: 2,
  low: -5,
  condition: 'cloudy',
  conditionText: '흐림',
  description: '흐림',
  rain: false,
  rainChance: 20,
  rainProbability: 20,
  dust: 'bad',
  dustText: '나쁨',
  humidity: 45,
  wind: 12,
  sunset: '17:32',
  advice: '패딩',
};

const mockEvents = [
  { id: 'e1', title: '투자사 미팅', start: '14:00', end: '15:30', location: '강남 WeWork', color: 'bg-gray-1000', important: true },
  { id: 'e2', title: '팀 위클리', start: '16:00', end: '17:00', color: 'bg-[#F5F3FF]0' },
  { id: 'e3', title: 'PT 세션', start: '18:30', end: '19:30', location: '피트니스 센터', color: 'bg-emerald-500' },
];

const mockBig3 = [
  { id: 't1', title: '투자 보고서 초안 작성', domain: 'work', deadline: '14:00 전', status: 'todo', priorityChange: 'up', project: '투자 유치' },
  { id: 't2', title: '팀 위클리 미팅 준비', domain: 'work', deadline: '16:00 전', status: 'todo', project: '팀 관리' },
  { id: 't3', title: 'PT 세션', domain: 'health', deadline: '18:30', status: 'todo', project: '건강' },
];

// WORK 페이지용 전체 태스크
const mockAllTasks = [
  { 
    id: 't1', 
    title: '투자 보고서 초안 작성', 
    domain: 'work', 
    deadline: '14:00 전', 
    status: 'todo', 
    priorityChange: 'up', 
    project: '투자 유치',
    importance: 'high',
    priorityScore: 95,
    priorityReason: '대표님 긴급 요청',
    sparkline: [40, 55, 70, 85, 95],
    duration: 90,
  },
  { 
    id: 't2', 
    title: '팀 위클리 미팅 준비', 
    domain: 'work', 
    deadline: '16:00 전', 
    status: 'todo', 
    project: '팀 관리',
    importance: 'medium',
    priorityChange: 'same',
    priorityScore: 72,
    priorityReason: '정기 미팅',
    sparkline: [70, 72, 71, 73, 72],
    duration: 30,
  },
  { 
    id: 't4', 
    title: '이메일 정리', 
    domain: 'work', 
    deadline: '오늘', 
    status: 'done', 
    project: '일반',
    importance: 'low',
    priorityScore: 45,
    sparkline: [50, 48, 46, 45, 45],
    repeat: 'daily',
    repeatLabel: '매일',
  },
  { 
    id: 't5', 
    title: '클라이언트 피드백 반영', 
    domain: 'work', 
    deadline: '내일', 
    status: 'todo', 
    project: '프로젝트 A',
    importance: 'high',
    priorityChange: 'new',
    priorityScore: 82,
    priorityReason: 'Inbox에서 변환됨',
    sparkline: [0, 0, 50, 75, 82],
    duration: 60,
  },
  { 
    id: 't6', 
    title: '주간 리포트 작성', 
    domain: 'work', 
    deadline: '금요일', 
    status: 'todo', 
    project: '팀 관리',
    importance: 'medium',
    priorityChange: 'down',
    priorityScore: 55,
    priorityReason: '마감 여유',
    sparkline: [80, 75, 68, 60, 55],
    duration: 45,
  },
  { 
    id: 't7', 
    title: '디자인 리뷰 미팅', 
    domain: 'work', 
    deadline: '내일 10:00', 
    status: 'todo', 
    project: '프로젝트 A',
    importance: 'medium',
    priorityChange: 'same',
    priorityScore: 68,
    priorityReason: '일정 고정',
    sparkline: [65, 67, 68, 68, 68],
    duration: 60,
  },
  { 
    id: 't8', 
    title: '서버 배포', 
    domain: 'work', 
    deadline: '수요일', 
    status: 'done', 
    project: '프로젝트 A',
    importance: 'high',
    priorityScore: 90,
    sparkline: [60, 75, 85, 90, 90],
  },
];

// 프로젝트 데이터
const mockProjects = [
  { 
    id: 'p1', 
    name: '투자 유치', 
    icon: '💰', 
    color: 'from-[#A996FF] to-[#EDE9FE]0',
    totalTasks: 8, 
    completedTasks: 3,
    deadline: '12/20',
    status: 'active', // active, onHold, completed
  },
  { 
    id: 'p2', 
    name: '프로젝트 A', 
    icon: '🚀', 
    color: 'from-[#A996FF] to-[#8B7CF7]',
    totalTasks: 12, 
    completedTasks: 7,
    deadline: '12/31',
    status: 'active',
  },
  { 
    id: 'p3', 
    name: '팀 관리', 
    icon: '👥', 
    color: 'from-[#A996FF] to-[#8B7CF7]',
    totalTasks: 5, 
    completedTasks: 2,
    deadline: '매주',
    status: 'active',
  },
  { 
    id: 'p4', 
    name: '일반', 
    icon: '📋', 
    color: 'from-gray-400 to-gray-500',
    totalTasks: 10, 
    completedTasks: 8,
    deadline: '-',
    status: 'active',
  },
];

// 완료 히스토리
const mockCompletedHistory = {
  today: [
    { id: 'h1', title: '이메일 정리', project: '일반', completedAt: '09:30', duration: 25 },
    { id: 'h2', title: '디자인 검토 미팅', project: '프로젝트 A', completedAt: '11:00', duration: 60 },
  ],
  yesterday: [
    { id: 'h3', title: '주간 목표 설정', project: '팀 관리', completedAt: '10:15', duration: 30 },
    { id: 'h4', title: '클라이언트 콜', project: '프로젝트 A', completedAt: '14:30', duration: 45 },
    { id: 'h5', title: '보고서 초안', project: '투자 유치', completedAt: '17:00', duration: 90 },
  ],
  thisWeek: [
    { id: 'h6', title: '팀 빌딩 활동 기획', project: '팀 관리', completedAt: '월요일', duration: 40 },
    { id: 'h7', title: '투자사 자료 준비', project: '투자 유치', completedAt: '월요일', duration: 120 },
    { id: 'h8', title: '디자인 가이드 정리', project: '프로젝트 A', completedAt: '화요일', duration: 60 },
    { id: 'h9', title: '코드 리뷰', project: '프로젝트 A', completedAt: '화요일', duration: 45 },
    { id: 'h10', title: '1:1 미팅 (3명)', project: '팀 관리', completedAt: '수요일', duration: 90 },
  ],
  stats: {
    totalCompleted: 15,
    totalFocusTime: 605, // minutes
    avgPerDay: 3,
    streak: 5, // 연속 완료 일수
    mostProductiveTime: '오전 10-12시',
    topProject: '프로젝트 A',
  }
};

// 업무 - 잊지 마세요 데이터
const mockWorkReminders = [
  { 
    id: 'wr1', 
    type: 'reply', 
    icon: '📧', 
    title: 'Sarah 메일 답장', 
    detail: '디자인 시안 피드백 요청', 
    daysAgo: 3,
    urgent: true 
  },
  { 
    id: 'wr2', 
    type: 'waiting', 
    icon: '⏳', 
    title: '개발팀 API 문서', 
    detail: '3일 전 요청함', 
    daysAgo: 3,
    urgent: false 
  },
  { 
    id: 'wr3', 
    type: 'followup', 
    icon: '📞', 
    title: '클라이언트 콜 후속', 
    detail: '제안서 보내기로 함', 
    daysAgo: 2,
    urgent: true 
  },
  { 
    id: 'wr4', 
    type: 'review', 
    icon: '👀', 
    title: 'PR 리뷰 요청', 
    detail: '민수님이 리뷰 기다리는 중', 
    daysAgo: 1,
    urgent: false 
  },
];

// 잊지 마세요 (돈 관련)
const mockDontForget = [
  { id: 'df1', title: '카드대금', dDay: 1, amount: 870000, category: 'money', critical: true },
  { id: 'df2', title: '넷플릭스 구독', dDay: 5, amount: 17000, category: 'subscription', critical: false },
  { id: 'df3', title: '대출이자', dDay: 10, amount: 450000, category: 'money', critical: true },
  { id: 'df4', title: '관리비', dDay: 15, amount: 280000, category: 'money', critical: false },
];

// 관계 챙기기
const mockRelationships = [
  { id: 'rel1', name: '엄마', relationship: 'family', lastContact: '2024-12-04', daysSince: 7, note: '주 1회 통화' },
  { id: 'rel2', name: '대학 동기 민수', relationship: 'friend', lastContact: '2024-11-25', daysSince: 16, note: '' },
  { id: 'rel3', name: '여동생', relationship: 'family', lastContact: '2024-12-08', daysSince: 3, note: '' },
];

// Inbox 데이터
const mockInbox = [
  { 
    id: 'm1', 
    from: 'Sarah Kim', 
    subject: '디자인 시안 A/B안 전달드립니다', 
    preview: '요청하신 메인 배너 시안 2종입니다. 확인 부탁드립니다.', 
    time: '10분 전', 
    urgent: true, 
    needReplyToday: true, 
    source: 'gmail', 
    type: 'mail' 
  },
  { 
    id: 'm2', 
    from: 'David Park', 
    subject: '내일 미팅 관련 문의', 
    preview: '내일 오후 2시 미팅 장소가 변경되었나요? 확인 부탁드립니다.', 
    time: '30분 전', 
    urgent: false, 
    needReplyToday: true, 
    source: 'gmail', 
    type: 'mail' 
  },
  { 
    id: 'f1', 
    from: 'Meeting Bot', 
    subject: '10/24 주간회의_녹음.mp3', 
    preview: '텍스트 변환 및 요약 준비 완료', 
    time: '2시간 전', 
    urgent: false, 
    needReplyToday: false, 
    source: 'drive', 
    type: 'file', 
    fileType: 'audio' 
  },
  { 
    id: 'f2', 
    from: '법무팀', 
    subject: '용역계약서_최종.pdf', 
    preview: '금일 중 날인 부탁드립니다.', 
    time: '3시간 전', 
    urgent: true, 
    needReplyToday: true, 
    source: 'drive', 
    type: 'file', 
    fileType: 'pdf' 
  },
  { 
    id: 'm3', 
    from: 'Notion', 
    subject: '새로운 멘션이 있습니다', 
    preview: 'David님이 "Q3 기획안"에서 회원님을 멘션했습니다.', 
    time: '1시간 전', 
    urgent: false, 
    needReplyToday: false, 
    source: 'notion', 
    type: 'mail' 
  },
];

// LIFE 페이지용 데이터
const mockLifeReminders = {
  // 오늘의 Life Top 3 (D-day 기반 자동 정렬)
  todayTop3: [
    { id: 'lt1', title: '카드대금 결제', category: 'money', dDay: 1, icon: '💰', note: '신한카드 87만원', critical: true },
    { id: 'lt2', title: '엄마 생신 선물 준비', category: 'family', dDay: 3, icon: '🎂', note: '케이크 예약 + 꽃' },
    { id: 'lt3', title: '장보기', category: 'home', dDay: 0, icon: '🛒', note: '우유, 계란, 양파' },
  ],
  
  // 이번 주 다가오는 것
  upcoming: [
    { id: 'up1', title: '대학 동창 모임', date: '토요일', category: 'social', icon: '👥', note: '강남역 7시' },
    { id: 'up2', title: '엄마 생신', date: '일요일', category: 'family', icon: '🎂', note: '오후 점심 약속' },
    { id: 'up3', title: '자동차 정기검사', date: '다음주 월', category: 'admin', icon: '🚗', note: '예약 완료' },
  ],
  
  // 잊지 마세요 (정기 리마인더)
  dontForget: [
    { id: 'df1', title: '넷플릭스 구독료', date: '25일', amount: '17,000원', icon: '📺', category: 'subscription' },
    { id: 'df2', title: '아이 예방접종', date: '다음주 화', icon: '💉', category: 'kids', note: '소아과 오전 10시' },
    { id: 'df3', title: '대출이자 납부', date: '말일', amount: '45만원', icon: '🏦', category: 'money', critical: true },
    { id: 'df4', title: '강아지 심장사상충약', date: '이번달', icon: '🐕', category: 'pet', note: '매월 1일' },
  ],
  
  // 관계 챙기기
  relationships: [
    { id: 'rel1', name: '엄마', lastContact: 3, suggestion: '안부 전화', icon: '👩' },
    { id: 'rel2', name: '고등학교 친구 지영', lastContact: 14, suggestion: '카톡 안부', icon: '👭' },
    { id: 'rel3', name: '이모', lastContact: 30, suggestion: '명절 후 연락', icon: '👩‍🦳' },
  ],
};

// 개인 일정 (LIFE ↔ WORK 연동용)
const mockPersonalSchedule = [
  { 
    id: 'ps1', 
    title: 'PT', 
    time: '18:30', 
    endTime: '19:30',
    location: '애플짐 강남점',
    icon: '🏋️',
    category: 'health',
    prepTime: 30, // 준비 시간 (분)
    note: '하체 운동 예정'
  },
  { 
    id: 'ps2', 
    title: '치과 정기검진', 
    time: '10:00', 
    endTime: '10:30',
    location: '서울치과',
    icon: '🦷',
    category: 'health',
    prepTime: 20,
    daysFromNow: 2 // 이틀 후
  },
  { 
    id: 'ps3', 
    title: '대학 동창 모임', 
    time: '19:00', 
    location: '강남역 7번출구',
    icon: '👥',
    category: 'social',
    prepTime: 60,
    daysFromNow: 3
  },
];

// WORK 일정이 LIFE에 미치는 영향
const mockWorkLifeImpact = {
  // 오늘 중요 미팅이 있으면 컨디션 관리 알림
  importantMeetings: [
    { id: 'wl1', title: '투자사 미팅', time: '14:00', stressLevel: 'high', suggestion: '미팅 전 5분 명상 추천' }
  ],
  // 야근 예상되면 저녁 일정 조정 알림
  overtimeRisk: false,
};

// 건강 체크 데이터
const mockHealthCheck = {
  sleep: { hours: 6.5, quality: 'okay', note: '조금 부족' },
  water: { current: 3, target: 8, unit: '잔' },
  steps: { current: 4200, target: 10000 },
  exercise: { done: false, lastTime: '2일 전' },
};

// 약/영양제 데이터 (시간대별)
const mockMedications = [
  { 
    id: 'med1', 
    name: '종합비타민', 
    time: 'morning', 
    timeLabel: '아침 식후',
    scheduledTime: '08:30',
    taken: true, 
    takenAt: '08:35',
    icon: '💊',
    note: '공복 피하기',
    category: 'supplement'
  },
  { 
    id: 'med2', 
    name: '오메가3', 
    time: 'morning', 
    timeLabel: '아침 식후',
    scheduledTime: '08:30',
    taken: true, 
    takenAt: '08:35',
    icon: '🐟',
    note: '비타민과 함께',
    category: 'supplement'
  },
  { 
    id: 'med3', 
    name: '유산균', 
    time: 'morning', 
    timeLabel: '아침 공복',
    scheduledTime: '07:30',
    taken: false, 
    icon: '🦠',
    note: '식전 30분',
    category: 'supplement'
  },
  { 
    id: 'med4', 
    name: '혈압약', 
    time: 'morning', 
    timeLabel: '아침',
    scheduledTime: '08:00',
    taken: true, 
    takenAt: '08:05',
    icon: '💗',
    note: '매일 같은 시간에',
    category: 'prescription',
    critical: true
  },
  { 
    id: 'med5', 
    name: '철분제', 
    time: 'afternoon', 
    timeLabel: '점심 식후',
    scheduledTime: '13:00',
    taken: false, 
    icon: '🩸',
    note: '비타민C와 함께',
    category: 'supplement'
  },
  { 
    id: 'med6', 
    name: '마그네슘', 
    time: 'evening', 
    timeLabel: '저녁 식후',
    scheduledTime: '19:30',
    taken: false, 
    icon: '✨',
    note: '근육 이완',
    category: 'supplement'
  },
  { 
    id: 'med7', 
    name: '수면 영양제', 
    time: 'night', 
    timeLabel: '취침 30분 전',
    scheduledTime: '22:30',
    taken: false, 
    icon: '🌙',
    note: '멜라토닌 함유',
    category: 'supplement'
  },
];

// 시간대 정의
const timeSlots = [
  { key: 'morning', label: '아침', icon: '🌅', timeRange: '07:00-09:00' },
  { key: 'afternoon', label: '점심', icon: '☀️', timeRange: '12:00-14:00' },
  { key: 'evening', label: '저녁', icon: '🌆', timeRange: '18:00-20:00' },
  { key: 'night', label: '취침 전', icon: '🌙', timeRange: '21:00-23:00' },
];

// 오늘의 루틴
const mockRoutines = [
  { id: 'r1', title: '물 8잔', icon: '💧', current: 3, target: 8, streak: 5 },
  { id: 'r2', title: '운동', icon: '🏃', current: 0, target: 1, streak: 0, lastDone: '3일 전' },
  { id: 'r3', title: '명상', icon: '🧘', current: 1, target: 1, streak: 12 },
  { id: 'r4', title: '책 읽기', icon: '📚', current: 0, target: 1, streak: 7 },
];

// 컨디션 히스토리 (오늘)
const mockConditionHistory = [
  { time: '08:00', energy: 60, mood: 'light' },
  { time: '10:00', energy: 75, mood: 'upbeat' },
  { time: '12:00', energy: 65, mood: 'light' },
  { time: '14:00', energy: 50, mood: 'light' },
];

const mockUrgent = [
  { id: 'u1', title: '은행 업무 (공과금 납부)', urgency: 'high', dueText: '오늘 4시까지' },
  { id: 'u2', title: '보고서 최종 제출', urgency: 'medium', dueText: 'D-1' },
];

const mockHabits = [
  { id: 'h1', title: '물 마시기', icon: '💧', target: 8, current: 3, streak: 5 },
  { id: 'h2', title: '운동하기', icon: '🏃', target: 1, current: 0, streak: 3 },
  { id: 'h3', title: '책 읽기', icon: '📚', target: 1, current: 0, streak: 7 },
  { id: 'h4', title: '명상하기', icon: '🧘', target: 1, current: 1, streak: 12 },
];

const mockMonitoring = [
  { id: 'm1', label: '투자 보고서', status: 'warning', detail: '오늘 미팅 전 완료 필요', timeLeft: '4시간 후' },
  { id: 'm2', label: '투자사 미팅', status: 'ok', detail: '강남 WeWork', timeLeft: '5시간 후' },
  { id: 'm3', label: '물 마시기', status: 'ok', detail: '3/8잔 완료' },
  { id: 'm4', label: '에너지 레벨', status: 'ok', detail: '오후 2-4시 집중력 저하 예상' },
];

const mockMoodHistory = [
  { energy: 55 }, { energy: 70 }, { energy: 85 }, { energy: 65 }, { energy: 50 }, { energy: 72 }, { energy: 68 }
];

// === Components ===

// 토스트 메시지
const Toast = ({ message, visible, darkMode }) => {
  if (!visible) return null;
  
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`flex items-center gap-2 px-4 py-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#E5E0FF]'} rounded-xl shadow-xl border`}>
        <AlfredoAvatar size="sm" />
        <span className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{message}</span>
      </div>
    </div>
  );
};

const AlfredoAvatar = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-8 h-8 text-lg', md: 'w-12 h-12 text-2xl', lg: 'w-16 h-16 text-3xl', xl: 'w-24 h-24 text-5xl' };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] flex items-center justify-center shadow-lg shadow-[#A996FF]/20 ring-2 ring-white/50 ${className}`}>
      <span>🐧</span>
    </div>
  );
};

const StatusIndicator = ({ status, pulse = false }) => {
  const colors = { ok: 'bg-emerald-400', warning: 'bg-[#A996FF]', urgent: 'bg-red-400' };
  return (
    <span className="relative flex w-2 h-2">
      {pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-75`} />}
      <span className={`relative inline-flex rounded-full w-2 h-2 ${colors[status]}`} />
    </span>
  );
};

const DomainBadge = ({ domain }) => {
  const config = { work: { bg: 'bg-[#EDE9FE]', text: 'text-[#7C3AED]', label: '업무' }, health: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '건강' } };
  const { bg, text, label } = config[domain] || config.work;
  return <span className={`${bg} ${text} text-[11px] px-2 py-0.5 rounded-full font-medium`}>{label}</span>;
};

// === Onboarding ===
const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0부터 시작 (환영 화면)
  const [data, setData] = useState({ mood: 'okay', energy: 50, oneThing: '', memo: '' });
  
  const moods = [
    { val: 'down', emoji: '😔', label: '힘들어요' },
    { val: 'okay', emoji: '😐', label: '그냥 그래요' },
    { val: 'light', emoji: '🙂', label: '괜찮아요' },
    { val: 'upbeat', emoji: '😊', label: '좋아요!' },
  ];
  
  const stepLabels = ['시작', '일정', '컨디션', '목표', '완료'];
  
  const handleNext = () => step < 4 ? setStep(step + 1) : onComplete(data);
  
  const handleSkip = () => {
    // 기본값으로 온보딩 완료
    onComplete({ mood: 'light', energy: 68, oneThing: mockBig3[0]?.title || '', memo: '' });
  };
  
  return (
    <div className="h-full flex flex-col bg-[#F0EBFF] overflow-hidden">
      {/* Progress */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">{stepLabels[step]}</span>
          {step > 0 && step < 4 && (
            <button 
              onClick={handleSkip}
              className="text-xs text-gray-400 hover:text-[#A996FF]"
            >
              건너뛰기
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {[0,1,2,3,4].map(i => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-[#A996FF]' : 'bg-[#E5E0FF]'
              }`} 
            />
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {/* Step 0: 환영 화면 */}
        {step === 0 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 text-center pt-8">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] rounded-full flex items-center justify-center shadow-2xl shadow-[#A996FF]/30">
                <span className="text-6xl">🐧</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-white rounded-full shadow-md">
                <span className="text-sm font-bold text-[#A996FF]">알프레도</span>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              안녕하세요, Boss! 👋
            </h1>
            <p className="text-gray-500 mb-2">
              저는 알프레도예요.
            </p>
            <p className="text-gray-500 mb-8">
              당신의 하루를 함께 관리해드릴<br/>
              <span className="text-[#A996FF] font-semibold">개인 집사</span>입니다.
            </p>
            
            <div className="bg-white/80 rounded-xl p-5 text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-lg">📋</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">스마트한 우선순위</p>
                  <p className="text-xs text-gray-500">AI가 컨디션에 맞게 할 일을 정리해드려요</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-lg">⏰</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">타이밍 케어</p>
                  <p className="text-xs text-gray-500">미팅, 약, 중요한 것들 미리 알려드려요</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-lg">💬</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">대화로 관리</p>
                  <p className="text-xs text-gray-500">"오늘 뭐 해야 돼?"라고 물어보세요</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 1: 일정 미리보기 */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start gap-3 mb-6">
              <AlfredoAvatar size="lg" />
              <div className="flex-1 bg-white rounded-xl rounded-tl-md p-4 shadow-sm">
                <p className="font-medium text-gray-800">좋은 아침이에요, Boss! ☀️</p>
                <p className="text-sm text-gray-500 mt-1">오늘 하루를 함께 준비해볼까요?</p>
              </div>
            </div>
            
            {/* Weather */}
            <div className="bg-white border border-[#E8E3FF] rounded-xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Cloud className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{mockWeather.temp}°</p>
                    <p className="text-sm text-gray-500">{mockWeather.description}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>최고 {mockWeather.high}° / 최저 {mockWeather.low}°</p>
                  <p className="text-gray-600 font-medium mt-1">🌧️ 비 올 확률 {mockWeather.rainChance}%</p>
                </div>
              </div>
              <div className="mt-3 p-2.5 bg-gray-100 rounded-xl flex items-center gap-2">
                <span>☂️</span>
                <span className="text-sm text-gray-700">우산 챙기는 거 잊지 마세요!</span>
              </div>
            </div>
            
            {/* Schedule */}
            <div className="bg-white border border-[#E8E3FF] rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-[#A996FF]" />
                오늘의 일정
              </h3>
              <div className="space-y-2">
                {mockEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-1 h-10 rounded-full ${event.color}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{event.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} /><span>{event.start} - {event.end}</span>
                        {event.location && <><MapPin size={12} /><span>{event.location}</span></>}
                      </div>
                    </div>
                    {event.important && <span className="text-xs bg-[#EDE9FE] text-[#8B7CF7] px-2 py-1 rounded-full">중요</span>}
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2.5 bg-[#F5F3FF] rounded-xl flex items-start gap-2">
                <span>💼</span>
                <span className="text-sm text-gray-600">중요한 미팅이 있네요! 명함 챙기시고, 복장도 한번 체크해보세요.</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: 컨디션 입력 */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start gap-3 mb-8">
              <AlfredoAvatar size="lg" />
              <div className="flex-1 bg-white rounded-xl rounded-tl-md p-4 shadow-sm">
                <p className="font-medium text-gray-800">오늘 컨디션은 어떠세요? 🤔</p>
                <p className="text-sm text-gray-500 mt-1">솔직하게 알려주시면 하루 계획을 더 잘 도와드릴 수 있어요.</p>
              </div>
            </div>
            
            <div className="mb-8">
              <p className="text-sm font-medium text-gray-500 mb-3">기분</p>
              <div className="grid grid-cols-2 gap-3">
                {moods.map(m => (
                  <button key={m.val} onClick={() => setData({...data, mood: m.val})}
                    className={`p-5 rounded-xl border-2 flex flex-col items-center gap-2 ${data.mood === m.val ? 'border-[#A996FF] bg-white shadow-lg scale-[1.02]' : 'border-transparent bg-white/60'}`}>
                    <span className="text-4xl">{m.emoji}</span>
                    <span className={`text-sm font-medium ${data.mood === m.val ? 'text-[#A996FF]' : 'text-gray-500'}`}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">에너지 레벨</p>
                <span className="text-sm font-bold text-[#A996FF]">{data.energy}%</span>
              </div>
              <div className="relative">
                <input type="range" min="0" max="100" step="5" value={data.energy}
                  onChange={e => setData({...data, energy: parseInt(e.target.value)})}
                  className="w-full h-3 bg-[#E5E0FF] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#A996FF] [&::-webkit-slider-thumb]:shadow-lg" />
                <div className="absolute top-0 left-0 h-3 bg-gradient-to-r from-[#A996FF] to-[#8B7BE8] rounded-full pointer-events-none" style={{width: `${data.energy}%`}} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>🔋 방전</span><span>⚡ 충만</span>
              </div>
            </div>
            
            <div className="p-3 bg-[#F5F3FF] rounded-xl">
              <p className="text-sm text-gray-600">
                {data.energy < 30 ? '💤 에너지가 낮으시네요. 오늘은 핵심 업무만 집중하고, 작은 일들은 내일로 미뤄도 괜찮아요.'
                : data.energy < 60 ? '☕ 보통 수준이시네요. 중요한 일 먼저 처리하고, 틈틈이 휴식도 챙기세요!'
                : '💪 에너지 충만하시네요! 어려운 일도 오늘 해치울 수 있을 것 같아요!'}
              </p>
            </div>
          </div>
        )}
        
        {/* Step 3: 핵심 1가지 */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start gap-3 mb-6">
              <AlfredoAvatar size="lg" />
              <div className="flex-1 bg-white rounded-xl rounded-tl-md p-4 shadow-sm">
                <p className="font-medium text-gray-800">오늘 가장 중요한 건 뭐예요? 🎯</p>
                <p className="text-sm text-gray-500 mt-1">하나만 골라주세요. 제가 그거 중심으로 챙길게요.</p>
              </div>
            </div>
            
            {/* Big3에서 선택 */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">📌 오늘 할 일에서 선택</p>
              <div className="space-y-2">
                {mockBig3.map(task => (
                  <button 
                    key={task.id}
                    onClick={() => setData({...data, oneThing: task.title})}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      data.oneThing === task.title 
                        ? 'bg-[#A996FF] text-white' 
                        : 'bg-white text-gray-800 hover:bg-[#F5F3FF]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {data.oneThing === task.title ? <CheckCircle2 size={18} /> : <Circle size={18} className="opacity-40" />}
                      <span className="font-medium text-sm">{task.title}</span>
                    </div>
                    {task.deadline && (
                      <span className={`text-xs block mt-1 ml-7 ${data.oneThing === task.title ? 'text-white/70' : 'text-gray-400'}`}>
                        {task.deadline}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 직접 입력 */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">✏️ 또는 직접 입력</p>
              <input 
                value={data.oneThing} 
                onChange={e => setData({...data, oneThing: e.target.value})}
                placeholder="오늘 꼭 해야 할 한 가지"
                className="w-full p-4 bg-white rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A996FF]"
              />
            </div>
            
            {/* 메모 */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">💬 알프레도에게 한마디 (선택)</p>
              <textarea 
                value={data.memo}
                onChange={e => setData({...data, memo: e.target.value})}
                placeholder="예: 오후 3시 이후로는 집중이 안 돼요"
                rows={2}
                className="w-full p-4 bg-white rounded-xl text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#A996FF]"
              />
            </div>
          </div>
        )}
        
        {/* Step 4: 완료 */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 text-center pt-8">
            <AlfredoAvatar size="xl" className="mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">준비 완료! 🎉</h1>
            <p className="text-gray-500 mb-8">오늘 하루를 함께 해드릴게요.</p>
            
            <div className="bg-white border border-[#E8E3FF] rounded-xl p-5 shadow-sm text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5F3FF] flex items-center justify-center text-lg">
                  {moods.find(m => m.val === data.mood)?.emoji}
                </div>
                <div>
                  <p className="text-xs text-gray-400">오늘의 기분</p>
                  <p className="font-medium text-gray-800">{moods.find(m => m.val === data.mood)?.label} · 에너지 {data.energy}%</p>
                </div>
              </div>
              {data.oneThing && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F3FF] flex items-center justify-center"><Sparkles size={16} className="text-[#A996FF]" /></div>
                  <div>
                    <p className="text-xs text-gray-400">오늘의 핵심</p>
                    <p className="font-medium text-gray-800">{data.oneThing}</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-6">입력하신 정보를 바탕으로 오늘의 우선순위를 정리할게요!</p>
          </div>
        )}
      </div>
      
      {/* Bottom Button */}
      <div className="flex-shrink-0 p-6 bg-gradient-to-t from-[#F8F7FC] to-transparent">
        <div className="flex gap-3 max-w-lg mx-auto">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="w-14 h-14 rounded-xl bg-white border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <button onClick={handleNext} disabled={step === 3 && !data.oneThing}
            className={`flex-1 h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              (step === 3 && !data.oneThing) 
                ? 'bg-[#E5E0FF] text-gray-400' 
                : 'bg-[#A996FF] text-white shadow-lg shadow-[#A996FF]/30 hover:bg-[#8B7BE8]'
            }`}>
            {step === 0 ? '시작하기 🚀' : step === 4 ? '하루 시작하기' : '다음'} 
            {step !== 0 && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// === Quick Condition Tracker ===
const QuickConditionTracker = ({ mood, setMood, energy, setEnergy }) => {
  const [expanded, setExpanded] = useState(false);
  const moods = [{ val: 'down', emoji: '😔' }, { val: 'okay', emoji: '😐' }, { val: 'light', emoji: '🙂' }, { val: 'upbeat', emoji: '😊' }];
  const currentMood = moods.find(m => m.val === mood);
  
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl shadow-sm mb-4 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full">
            <span className="text-lg">{currentMood?.emoji}</span>
            <span className="text-sm font-medium text-gray-800">{mood === 'light' ? '괜찮아요' : mood === 'upbeat' ? '좋아요' : mood === 'down' ? '힘들어요' : '그냥'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full">
            <Zap size={14} className={energy >= 50 ? 'text-[#A996FF]' : 'text-gray-400'} />
            <span className="text-sm font-medium text-gray-800">{energy}%</span>
            {energy > 60 ? <TrendingUp size={12} className="text-emerald-500" /> : energy < 40 ? <TrendingDown size={12} className="text-red-400" /> : null}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>컨디션 변경</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      
      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-black/5">
          <p className="text-xs text-gray-400 mb-2">지금 기분은?</p>
          <div className="flex gap-2 mb-4">
            {moods.map(m => (
              <button key={m.val} onClick={() => setMood(m.val)}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 ${mood === m.val ? 'bg-[#A996FF] text-white shadow-md' : 'bg-white/60 text-gray-500'}`}>
                <span className="text-xl">{m.emoji}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-2">에너지 레벨</p>
          <div className="flex gap-2">
            {[25, 50, 75, 100].map(e => (
              <button key={e} onClick={() => setEnergy(e)}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center ${energy === e ? 'bg-[#A996FF] text-white shadow-md' : 'bg-white/60 text-gray-500'}`}>
                <span>{e === 100 ? '💪' : e >= 75 ? '⚡' : '🔋'}</span>
                <span className="text-[11px] font-medium">{e}%</span>
              </button>
            ))}
          </div>
          
          {/* Mini History */}
          <div className="mt-4 pt-3 border-t border-black/5">
            <p className="text-xs text-gray-400 mb-2">최근 7일 컨디션</p>
            <div className="flex items-end justify-between gap-1 h-12">
              {mockMoodHistory.map((entry, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className={`w-full rounded-t ${idx === 6 ? 'bg-[#A996FF]' : 'bg-[#E5E0FF]'}`} style={{height: `${entry.energy}%`}} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// === 풍부한 알프레도 브리핑 ===
const AlfredoBriefing = ({ onOpenChat, mood, energy, oneThing, completedTasks = 0, totalTasks = 3, inbox = [], onViewInbox }) => {
  const hour = new Date().getHours();
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Inbox 통계
  const urgentInboxCount = inbox.filter(i => i.urgent).length;
  const needReplyCount = inbox.filter(i => i.needReplyToday).length;
  
  // 시간대별 인사
  const getGreeting = () => {
    if (hour < 12) return '좋은 아침이에요, Boss!';
    if (hour < 17) return '좋은 오후예요, Boss!';
    return '좋은 저녁이에요, Boss!';
  };
  
  // 실용적 조언 (완료 상태 + 컨디션 기반)
  const getConditionAdvice = () => {
    if (completedTasks === totalTasks && totalTasks > 0) {
      return '오늘 할 일 끝! 남은 시간은 자유롭게 보내세요.';
    }
    if (completedTasks >= 2) {
      return `${totalTasks - completedTasks}개 남았어요. 마무리까지 힘내봐요!`;
    }
    if (completedTasks === 1) {
      return '시작이 반이에요. 다음 건 뭘로 할까요?';
    }
    if (mood === 'upbeat' && energy >= 75) return '컨디션 좋을 때 어려운 일 먼저 해치워요!';
    if (mood === 'light' && energy >= 50) return '미팅 전에 핵심 업무 끝내두면 여유롭게 마무리할 수 있어요.';
    if (mood === 'down' || energy < 30) return '오늘은 무리하지 말고, 꼭 필요한 것만 해요.';
    if (energy < 50) return '에너지가 좀 낮네요. 중요한 일 먼저, 나머진 내일로!';
    return '차근차근 하나씩 해봐요. 제가 옆에서 챙길게요.';
  };
  
  // 중요 미팅 찾기
  const importantMeeting = mockEvents.find(e => e.important || e.title.includes('미팅') || e.title.includes('투자'));
  const hasPT = mockEvents.find(e => e.title.includes('PT') || e.title.includes('운동'));
  
  // 브리핑 본문 생성 (간결 버전)
  const generateBriefingText = () => {
    const lines = [];
    
    // 1. 날씨 (한 줄로 통합)
    if (mockWeather.rainChance > 20 || mockWeather.temp < 10) {
      let weatherLine = '';
      if (mockWeather.temp < 10) weatherLine += `${mockWeather.temp}° 쌀쌀해요.`;
      if (mockWeather.rainChance > 20) weatherLine += ` 비 ${mockWeather.rainChance}%, 우산 챙기세요!`;
      lines.push(`🌤️ ${weatherLine.trim()}`);
    }
    
    // 2. 오늘의 핵심 + 마감 (한 줄)
    const mainTask = oneThing || mockBig3[0]?.title;
    if (mainTask && importantMeeting) {
      lines.push(`🎯 **${mainTask}** → ${importantMeeting.start} 미팅 전까지!`);
    } else if (mainTask) {
      lines.push(`🎯 오늘 핵심: **${mainTask}**`);
    }
    
    // 3. 중요 미팅 + 장소 + 준비물 (한 줄)
    if (importantMeeting) {
      let meetingLine = `${importantMeeting.start} ${importantMeeting.title}`;
      if (importantMeeting.location) meetingLine += ` @ ${importantMeeting.location}`;
      meetingLine += ' — 명함, 복장 체크!';
      lines.push(`💼 ${meetingLine}`);
    }
    
    // 4. 운동 (있으면)
    if (hasPT) {
      lines.push(`🏃 ${hasPT.start} ${hasPT.title} — 운동복, 물병 챙기셨죠?`);
    }
    
    // 5. 인박스 (긴급/오늘 회신 필요한 것만)
    if (urgentInboxCount > 0 || needReplyCount > 0) {
      let inboxLine = '📥 ';
      if (urgentInboxCount > 0) inboxLine += `긴급 ${urgentInboxCount}건`;
      if (urgentInboxCount > 0 && needReplyCount > 0) inboxLine += ', ';
      if (needReplyCount > 0) inboxLine += `오늘 회신 ${needReplyCount}건`;
      inboxLine += ' — 업무 탭에서 확인하세요!';
      lines.push(inboxLine);
    }
    
    return lines;
  };
  
  const briefingLines = generateBriefingText();
  
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl shadow-md overflow-hidden">
      {/* Header with Avatar */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <AlfredoAvatar size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-lg">{getGreeting()} ☀️</p>
            <p className="text-sm text-[#A996FF] font-medium">{getConditionAdvice()}</p>
          </div>
          <button onClick={onOpenChat} className="w-10 h-10 rounded-full bg-[#A996FF] text-white flex items-center justify-center shadow-lg shadow-[#A996FF]/30 hover:bg-[#8B7BE8] transition-colors">
            <MessageCircle size={18} />
          </button>
        </div>
      </div>
      
      {/* Main Briefing Content */}
      <div className="p-4 pt-3">
        <div className="bg-[#F0EBFF] rounded-xl p-4 space-y-2">
          {briefingLines.map((line, idx) => (
            <p key={idx} className="text-[14px] text-gray-700 leading-relaxed">
              {line.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="text-[#A996FF] font-semibold">{part}</strong> : part
              )}
            </p>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-black/5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-500">오늘의 진행률</span>
            <span className="font-medium text-[#A996FF]">{completedTasks}/{totalTasks} 완료</span>
          </div>
          <div className="h-2 bg-[#F0EEFF] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7BE8] rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// === Widgets ===
const Big3Widget = ({ tasks, onToggle }) => {
  const completed = tasks ? tasks.filter(t => t.status === 'done').length : 0;
  const taskList = tasks || mockBig3;
  
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm">🎯 오늘의 Big 3</h3>
        <span className="text-xs text-[#A996FF] font-medium">{completed}/3 완료</span>
      </div>
      <div className="space-y-2">
        {taskList.map((task, idx) => (
          <div 
            key={task.id} 
            className={`p-3 rounded-xl border-l-4 transition-all ${
              task.status === 'done' 
                ? 'border-l-emerald-400 bg-emerald-50/50' 
                : idx === 0 
                  ? 'border-l-[#A996FF] bg-[#F5F3FF]' 
                  : 'border-l-[#E5E0FF] bg-white/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <button 
                onClick={() => onToggle && onToggle(task.id)}
                className={`mt-0.5 transition-colors ${task.status === 'done' ? 'text-emerald-500' : 'text-[#A996FF]'}`}
              >
                {task.status === 'done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              <div className="flex-1">
                <p className={`font-medium text-sm ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <DomainBadge domain={task.domain} />
                  {task.deadline && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} />{task.deadline}
                    </span>
                  )}
                </div>
              </div>
              {task.priorityChange === 'up' && task.status !== 'done' && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#A996FF]/10 rounded">
                  <TrendingUp size={12} className="text-[#A996FF]" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 긴급/마감 위젯
const UrgentWidget = ({ items }) => {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="bg-gradient-to-r from-red-50 to-[#EDE9FE] border border-red-100 rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
        놓치면 안 돼요
      </h3>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 p-2.5 bg-white/70 rounded-xl">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              item.urgency === 'high' ? 'bg-red-400' : 'bg-[#A996FF]'
            }`}></span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
            </div>
            <span className={`text-xs font-medium flex-shrink-0 ${
              item.urgency === 'high' ? 'text-red-500' : 'text-[#8B7CF7]'
            }`}>
              {item.dueText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 타임라인 위젯
const TimelineWidget = ({ events }) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeStr = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;
  
  // 다음 일정까지 남은 시간
  const getNextEvent = () => {
    for (const event of events) {
      const [eventHour, eventMin] = event.start.split(':').map(Number);
      const eventTotalMin = eventHour * 60 + eventMin;
      const currentTotalMin = currentHour * 60 + currentMinute;
      
      if (eventTotalMin > currentTotalMin) {
        const diffMin = eventTotalMin - currentTotalMin;
        const hours = Math.floor(diffMin / 60);
        const mins = diffMin % 60;
        return {
          event,
          timeLeft: hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
        };
      }
    }
    return null;
  };
  
  const nextEvent = getNextEvent();
  
  // 진행 중인지 확인
  const isOngoing = (event) => {
    const [startH, startM] = event.start.split(':').map(Number);
    const [endH, endM] = event.end.split(':').map(Number);
    const currentTotal = currentHour * 60 + currentMinute;
    return currentTotal >= startH * 60 + startM && currentTotal < endH * 60 + endM;
  };
  
  // 지났는지 확인
  const isPast = (event) => {
    const [endH, endM] = event.end.split(':').map(Number);
    return currentHour * 60 + currentMinute >= endH * 60 + endM;
  };
  
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold text-gray-800 text-sm mb-3">📅 오늘 일정</h3>
      
      {/* 현재 시간 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#A996FF] text-white rounded-full">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">지금 {currentTimeStr}</span>
        </div>
        {nextEvent && (
          <span className="text-xs text-gray-500">
            → 다음까지 <strong className="text-[#A996FF]">{nextEvent.timeLeft}</strong>
          </span>
        )}
      </div>
      
      {/* 타임라인 */}
      <div className="relative pl-4 border-l-2 border-[#E5E0FF] space-y-3">
        {events.map((event) => {
          const ongoing = isOngoing(event);
          const past = isPast(event);
          
          return (
            <div key={event.id} className={`relative pl-4 ${past ? 'opacity-40' : ''}`}>
              <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 border-white ${
                ongoing ? 'bg-[#A996FF] ring-4 ring-[#A996FF]/20' : past ? 'bg-gray-300' : 'bg-[#E5E0FF]'
              }`}></div>
              
              <div className={`p-3 rounded-xl ${ongoing ? 'bg-[#F5F3FF] border border-[#A996FF]/30' : 'bg-white/60'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${ongoing ? 'text-[#A996FF]' : 'text-gray-800'}`}>
                      {event.title}
                      {ongoing && <span className="ml-2 text-xs bg-[#A996FF] text-white px-1.5 py-0.5 rounded">진행중</span>}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} />{event.location}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${ongoing ? 'text-[#A996FF]' : 'text-gray-400'}`}>
                    {event.start}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// HomePage에서 사용할 위젯들 (HabitsWidget 제거됨)

// === Project Modal (프로젝트 추가/편집) ===
const ProjectModal = ({ isOpen, onClose, project, onSave, onDelete }) => {
  const [name, setName] = useState(project?.name || '');
  const [icon, setIcon] = useState(project?.icon || '📁');
  const [deadline, setDeadline] = useState(project?.deadline || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    if (project) {
      setName(project.name);
      setIcon(project.icon);
      setDeadline(project.deadline || '');
    } else {
      setName('');
      setIcon('📁');
      setDeadline('');
    }
  }, [project, isOpen]);
  
  if (!isOpen) return null;
  
  const icons = ['📁', '🚀', '💰', '👥', '📊', '🎯', '💡', '🔥', '⭐', '🎨', '📱', '🛠️'];
  
  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: project?.id || `p-${Date.now()}`,
      name: name.trim(),
      icon,
      deadline,
      color: project?.color || 'from-[#A996FF] to-[#8B7CF7]',
      totalTasks: project?.totalTasks || 0,
      completedTasks: project?.completedTasks || 0,
      status: 'active',
    });
    onClose();
  };
  
  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">프로젝트 삭제</h3>
            <p className="text-sm text-gray-500">
              "{project?.name}" 프로젝트를 삭제하시겠어요?<br/>
              관련 태스크는 유지됩니다.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl">
              취소
            </button>
            <button onClick={() => { onDelete(project.id); onClose(); }} className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl">
              삭제
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              {project ? '프로젝트 수정' : '새 프로젝트'}
            </h2>
            <div className="flex items-center gap-2">
              {project && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* 아이콘 선택 */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-2 block">아이콘</label>
            <div className="flex flex-wrap gap-2">
              {icons.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    icon === ic 
                      ? 'bg-[#A996FF] ring-2 ring-[#A996FF]/30' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          
          {/* 이름 */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">프로젝트 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="프로젝트 이름 입력"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
            />
          </div>
          
          {/* 마감일 */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">마감일 (선택)</label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="예: 12/31, 매주"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
            />
          </div>
          
          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full py-3.5 bg-[#A996FF] text-white font-bold rounded-xl disabled:opacity-50"
          >
            {project ? '수정하기' : '생성하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

// === Event Modal (일정 추가/수정) ===
const EventModal = ({ isOpen, onClose, event, onSave, onDelete, googleCalendar }) => {
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState(event?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(event?.start || '09:00');
  const [endTime, setEndTime] = useState(event?.end || '10:00');
  const [location, setLocation] = useState(event?.location || '');
  const [color, setColor] = useState(event?.color || 'bg-[#A996FF]');
  const [isImportant, setIsImportant] = useState(event?.important || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [syncToGoogle, setSyncToGoogle] = useState(event?.googleEventId ? true : false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDate(event.date || new Date().toISOString().split('T')[0]);
      setStartTime(event.start || '09:00');
      setEndTime(event.end || '10:00');
      setLocation(event.location || '');
      setColor(event.color || 'bg-[#A996FF]');
      setIsImportant(event.important || false);
      setSyncToGoogle(event.googleEventId ? true : false);
    } else {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:00');
      setLocation('');
      setColor('bg-[#A996FF]');
      setIsImportant(false);
      setSyncToGoogle(googleCalendar?.isSignedIn || false);
    }
  }, [event, isOpen, googleCalendar?.isSignedIn]);
  
  if (!isOpen) return null;
  
  const colors = [
    { value: 'bg-[#A996FF]', label: '라벤더' },
    { value: 'bg-emerald-500', label: '에메랄드' },
    { value: 'bg-red-500', label: '레드' },
    { value: 'bg-gray-500', label: '그레이' },
  ];
  
  const handleSave = async () => {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    
    try {
      await onSave({
        id: event?.id || `e-${Date.now()}`,
        title: title.trim(),
        date,
        start: startTime,
        end: endTime,
        location: location.trim() || null,
        color,
        important: isImportant,
        syncToGoogle,
        googleEventId: event?.googleEventId,
      });
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await onDelete(event.id, event.googleEventId);
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">일정 삭제</h3>
            <p className="text-sm text-gray-500">
              "{event?.title}" 일정을 삭제하시겠어요?
            </p>
            {event?.googleEventId && (
              <p className="text-xs text-[#A996FF] mt-2">
                Google Calendar에서도 삭제됩니다
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowDeleteConfirm(false)} 
              disabled={isSaving}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl disabled:opacity-50"
            >
              취소
            </button>
            <button 
              onClick={handleDelete} 
              disabled={isSaving}
              className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              삭제
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white rounded-t-xl sm:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              {event ? '일정 수정' : '새 일정'}
            </h2>
            <div className="flex items-center gap-2">
              {event && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* 제목 */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">일정 이름 <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 이름 입력"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
              autoFocus
            />
          </div>
          
          {/* 날짜 */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
            />
          </div>
          
          {/* 시간 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">시작</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">종료</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
              />
            </div>
          </div>
          
          {/* 장소 */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">장소 (선택)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 강남 WeWork"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
            />
          </div>
          
          {/* 색상 */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-2 block">색상</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-xl ${c.value} transition-all ${
                    color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          
          {/* 중요 표시 */}
          <div className="mb-6 flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-500">중요 일정으로 표시</label>
            <button
              onClick={() => setIsImportant(!isImportant)}
              className={`w-12 h-7 rounded-full transition-all ${isImportant ? 'bg-[#A996FF]' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isImportant ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          {/* Google Calendar 동기화 */}
          {googleCalendar && (
            <div className="mb-6 p-3 rounded-xl bg-gray-50 border border-gray-100">
              {googleCalendar.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Google 연결 확인 중...
                </div>
              ) : googleCalendar.isSignedIn ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncToGoogle}
                    onChange={(e) => setSyncToGoogle(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-[#A996FF] focus:ring-[#A996FF]"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm text-gray-700">
                      Google Calendar 동기화
                    </span>
                  </div>
                  {googleCalendar.userInfo && (
                    <span className="text-xs text-gray-400">
                      {googleCalendar.userInfo.email}
                    </span>
                  )}
                </label>
              ) : (
                <button
                  onClick={googleCalendar.signIn}
                  className="flex items-center gap-2 text-sm text-[#A996FF] hover:underline w-full"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google 계정 연결하여 캘린더 동기화
                </button>
              )}
            </div>
          )}
          
          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
            className="w-full py-3.5 bg-[#A996FF] text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 size={18} className="animate-spin" />}
            {event ? '수정하기' : '추가하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

// === Google Auth Modal (OAuth 시뮬레이션) ===
const GoogleAuthModal = ({ isOpen, onClose, service, onConnect, onDisconnect, isConnected }) => {
  const [step, setStep] = useState(isConnected ? 'connected' : 'intro'); // intro, loading, connected
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  useEffect(() => {
    if (isOpen) {
      setStep(isConnected ? 'connected' : 'intro');
      setSelectedAccount(isConnected ? 'user@gmail.com' : null);
    }
  }, [isOpen, isConnected]);
  
  if (!isOpen) return null;
  
  const serviceInfo = {
    googleCalendar: {
      name: 'Google Calendar',
      icon: '📅',
      color: 'from-blue-500 to-blue-600',
      permissions: ['캘린더 읽기/쓰기', '일정 알림 접근'],
      benefits: ['자동 일정 동기화', '알프레도가 일정 기반 추천', '집중 시간 자동 차단']
    },
    gmail: {
      name: 'Gmail',
      icon: '📧',
      color: 'from-red-500 to-red-600',
      permissions: ['이메일 읽기', '라벨 접근'],
      benefits: ['중요 메일 알림', '인박스 자동 정리', '할 일 자동 추출']
    },
    notion: {
      name: 'Notion',
      icon: '📝',
      color: 'from-gray-700 to-gray-800',
      permissions: ['페이지 읽기/쓰기', '데이터베이스 접근'],
      benefits: ['노션 태스크 동기화', '문서 내용 분석', '자동 정리']
    },
    slack: {
      name: 'Slack',
      icon: '💬',
      color: 'from-purple-500 to-purple-600',
      permissions: ['메시지 읽기', '채널 접근'],
      benefits: ['중요 메시지 알림', '미팅 리마인더', '상태 자동 업데이트']
    }
  };
  
  const info = serviceInfo[service] || serviceInfo.googleCalendar;
  
  const handleConnect = () => {
    setStep('loading');
    // OAuth 시뮬레이션
    setTimeout(() => {
      setSelectedAccount('user@gmail.com');
      setStep('connected');
      onConnect?.(service);
    }, 1500);
  };
  
  const handleDisconnect = () => {
    if (window.confirm(`${info.name} 연결을 해제하시겠어요?\n\n연동된 데이터는 더 이상 동기화되지 않습니다.`)) {
      onDisconnect?.(service);
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${info.color} p-6 text-white text-center`}>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-3">
            {info.icon}
          </div>
          <h2 className="text-xl font-bold">{info.name}</h2>
          <p className="text-sm text-white/80 mt-1">
            {step === 'connected' ? '연결됨' : 'Life Butler와 연결'}
          </p>
        </div>
        
        {/* Content */}
        <div className="p-5">
          {step === 'intro' && (
            <>
              <div className="mb-5">
                <h3 className="font-bold text-gray-800 mb-2">🔐 요청 권한</h3>
                <ul className="space-y-1.5">
                  {info.permissions.map((p, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-5">
                <h3 className="font-bold text-gray-800 mb-2">✨ 연결하면</h3>
                <ul className="space-y-1.5">
                  {info.benefits.map((b, i) => (
                    <li key={i} className="text-sm text-emerald-600 flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={handleConnect}
                className="w-full py-3.5 bg-[#A996FF] text-white font-bold rounded-xl hover:bg-[#8B7CF7] transition-colors"
              >
                Google 계정으로 연결
              </button>
              
              <p className="text-xs text-gray-400 text-center mt-3">
                연결은 언제든지 설정에서 해제할 수 있어요
              </p>
            </>
          )}
          
          {step === 'loading' && (
            <div className="py-10 text-center">
              <div className="w-12 h-12 border-4 border-[#A996FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Google 계정 연결 중...</p>
              <p className="text-sm text-gray-400 mt-1">잠시만 기다려주세요</p>
            </div>
          )}
          
          {step === 'connected' && (
            <>
              <div className="bg-emerald-50 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800">연결 완료!</p>
                    <p className="text-sm text-emerald-600">{selectedAccount}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className="font-bold text-gray-800 mb-2">📊 동기화 상태</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">마지막 동기화</span>
                    <span className="text-gray-700">방금 전</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">동기화 항목</span>
                    <span className="text-gray-700">{service === 'gmail' ? '24개 메일' : '12개 일정'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
                >
                  연결 해제
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// === Reflect Modal ===
const ReflectModal = ({ isOpen, onClose, changes = [] }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300"
      >
        {/* Header */}
        <div className="bg-[#F5F3FF] border-b border-[#A996FF]/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#A996FF] rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-800">Alfredo Report</span>
          </div>
          <span className="text-[11px] text-gray-400">방금 전</span>
        </div>
        
        <div className="p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-1">What Changed?</h2>
          <p className="text-sm text-gray-500 mb-5">
            현재 상황에 맞춰 우선순위를 최적화했어요.
          </p>
          
          {/* Change Logs */}
          <div className="space-y-2 mb-6">
            {changes.length > 0 ? changes.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-[#F5F3FF] flex items-center justify-center text-[#A996FF] shrink-0 mt-0.5">
                  <ArrowRight size={10} />
                </div>
                <span className="text-sm text-gray-700 leading-snug">{log}</span>
              </div>
            )) : (
              <div className="text-center text-gray-400 text-sm py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                변경사항이 없습니다.
              </div>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-[#A996FF] text-white font-bold rounded-xl shadow-lg shadow-[#A996FF]/25 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#8B7BE8]"
          >
            <CheckCircle2 size={18} /> 확인
          </button>
        </div>
      </div>
    </div>
  );
};

// === Sparkline Chart (Stock Ticker Style) ===
const Sparkline = ({ data = [], color = '#A996FF', width = 50, height = 20 }) => {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 마지막 점 강조 */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="2.5"
        fill={color}
      />
    </svg>
  );
};

// === Priority Change Indicator ===
const PriorityIndicator = ({ change, reason }) => {
  const config = {
    up: { icon: <TrendingUp size={12} strokeWidth={3} />, color: 'text-[#A996FF]', bg: 'bg-[#A996FF]/10', label: '+Score' },
    down: { icon: <TrendingDown size={12} strokeWidth={3} />, color: 'text-gray-400', bg: 'bg-[#F5F3FF]', label: '-Score' },
    new: { icon: <span className="text-[11px] font-bold">N</span>, color: 'text-[#A996FF]', bg: 'bg-[#A996FF]/10', label: 'New' },
    same: { icon: <span className="text-gray-300">—</span>, color: 'text-gray-400', bg: 'bg-gray-50', label: '' },
  };
  
  const c = config[change] || config.same;
  
  return (
    <div className="flex flex-col items-end gap-0.5 min-w-[60px]">
      <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${c.bg}`}>
        <span className={c.color}>{c.icon}</span>
        {c.label && <span className={`text-[11px] font-bold ${c.color}`}>{c.label}</span>}
      </div>
      {reason && (
        <span className="text-[11px] text-gray-400 truncate max-w-[80px] text-right">{reason}</span>
      )}
    </div>
  );
};

// === Focus Timer ===
const FocusTimer = ({ task, onComplete, onExit }) => {
  const [duration] = useState(task?.duration ? task.duration * 60 : 25 * 60);
  const [timeLeft, setTimeLeft] = useState(task?.duration ? task.duration * 60 : 25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0); // 총 집중 시간 (초)
  const [breakReminderShown, setBreakReminderShown] = useState({}); // 이미 보여준 리마인더 추적
  
  // 휴식 리마인더 시점 (분 단위)
  const breakPoints = [25, 50, 90];
  
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
        setTotalFocusTime(t => t + 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);
  
  // 휴식 리마인더 체크
  useEffect(() => {
    const focusMinutes = Math.floor(totalFocusTime / 60);
    breakPoints.forEach(point => {
      if (focusMinutes >= point && !breakReminderShown[point]) {
        setShowBreakReminder(true);
        setBreakReminderShown(prev => ({ ...prev, [point]: true }));
        setIsActive(false); // 타이머 일시정지
      }
    });
  }, [totalFocusTime]);
  
  const handleDismissBreak = () => {
    setShowBreakReminder(false);
    setIsActive(true); // 타이머 재개
  };
  
  const handleTakeBreak = () => {
    setShowBreakReminder(false);
    // 5분 후 자동 재개는 FocusCompletionScreen의 휴식과 유사하게 처리
  };
  
  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = ((duration - timeLeft) / duration) * 100;
  const focusMinutes = Math.floor(totalFocusTime / 60);
  
  // 휴식 리마인더 팝업
  if (showBreakReminder) {
    return (
      <div className="h-full bg-[#F0EBFF] flex flex-col items-center justify-center p-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-6 max-w-sm w-full shadow-xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">☕</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {focusMinutes}분 집중했어요!
            </h2>
            <p className="text-gray-500">대단해요, Boss! 👏</p>
          </div>
          
          <div className="bg-[#F5F3FF] rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">🐧</span>
              <p className="text-sm text-gray-700">
                {focusMinutes >= 90 
                  ? "90분 넘게 집중하셨어요! 정말 대단해요. 이제 좀 쉬어가세요. 몸도 마음도 충전이 필요해요."
                  : focusMinutes >= 50
                  ? "50분이나 집중했어요! 슬슬 눈도 쉬고, 물 한 잔 어때요?"
                  : "25분 집중 완료! 짧게 스트레칭 하고 오면 다음 집중이 더 잘 돼요."}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleTakeBreak}
              className="w-full py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-xl font-semibold"
            >
              5분 휴식하기 ☕
            </button>
            <button
              onClick={handleDismissBreak}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
            >
              계속 집중할게요 💪
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full bg-[#F0EBFF] text-gray-800 flex flex-col relative overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-30">
        <button onClick={onExit} className="p-3 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-800 shadow-sm border border-white/50 transition-all">
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        {/* Task Info */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-[#A996FF]/20 shadow-sm text-[11px] font-bold tracking-widest text-[#A996FF] mb-5">
            <Zap size={12} fill="currentColor" />
            {task ? 'FOCUS MODE' : 'QUICK SESSION'}
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-2 text-gray-800 max-w-[280px] mx-auto">
            {task ? task.title : 'Deep Work'}
          </h2>
          <p className="text-gray-500 text-sm font-medium">
            {task ? task.project : '집중해서 작업하세요'}
          </p>
        </div>
        
        {/* Timer Circle */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-10">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="128" cy="128" r="110" stroke="#E5E5EA" strokeWidth="6" fill="none" />
            <circle 
              cx="128" cy="128" r="110" 
              stroke="#A996FF" 
              strokeWidth="10" 
              fill="none"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          <div className="flex flex-col items-center">
            <div className="text-6xl font-mono font-bold tracking-tighter tabular-nums text-gray-800">
              {formatTime(timeLeft)}
            </div>
            {!isActive && timeLeft !== 0 && timeLeft !== duration && (
              <span className="text-[#A996FF] text-xs font-bold uppercase tracking-widest mt-2">Paused</span>
            )}
            {timeLeft === 0 && (
              <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest mt-2">Finished!</span>
            )}
          </div>
        </div>
        
        {/* Alfredo Message */}
        {task && (
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-xl p-4 mb-8 max-w-xs w-full shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] flex items-center justify-center text-sm">🐧</div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Alfredo says</span>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  {task.deadline 
                    ? "마감이 임박한 업무예요. 지금 끝내두면 오후가 훨씬 가벼워질 겁니다." 
                    : "에너지가 좋을 때 어려운 일부터 처리하죠. 시작이 반입니다."}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Controls */}
        <div className="flex items-center gap-8">
          <button onClick={resetTimer} className="p-4 rounded-full bg-white hover:bg-gray-50 transition-colors text-gray-400 shadow-sm">
            <RefreshCw size={20} />
          </button>
          
          <button 
            onClick={toggleTimer}
            className="w-20 h-20 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all ring-4 ring-[#A996FF]/30"
          >
            {isActive ? (
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            ) : (
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
            )}
          </button>
          
          <button onClick={onComplete} className="p-4 rounded-full bg-[#A996FF]/10 text-[#A996FF] hover:bg-[#A996FF]/20 transition-colors border border-[#A996FF]/20">
            <CheckCircle2 size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

// === Focus Completion Screen (다음 추천) ===
const FocusCompletionScreen = ({ completedTask, nextTask, onStartNext, onTakeBreak, onGoHome, stats }) => {
  const [showBreakTimer, setShowBreakTimer] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60); // 5분
  
  useEffect(() => {
    let interval = null;
    if (showBreakTimer && breakTimeLeft > 0) {
      interval = setInterval(() => {
        setBreakTimeLeft(t => t - 1);
      }, 1000);
    } else if (breakTimeLeft === 0) {
      setShowBreakTimer(false);
    }
    return () => clearInterval(interval);
  }, [showBreakTimer, breakTimeLeft]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 휴식 화면
  if (showBreakTimer) {
    return (
      <div className="h-full bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7] flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-6">☕</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">휴식 시간</h2>
        <p className="text-gray-500 mb-8">잠시 쉬고 다시 시작해요</p>
        
        <div className="text-5xl font-mono font-bold text-emerald-600 mb-8">
          {formatTime(breakTimeLeft)}
        </div>
        
        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 max-w-xs w-full mb-8">
          <div className="flex items-start gap-3">
            <span className="text-xl">🐧</span>
            <div>
              <p className="text-sm text-gray-700">
                물 한 잔 마시고, 스트레칭 해보세요.
                <br />5분 후에 다시 달려봐요!
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowBreakTimer(false)}
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold"
        >
          휴식 끝내기
        </button>
      </div>
    );
  }
  
  return (
    <div className="h-full bg-[#F0EBFF] flex flex-col p-6">
      {/* 축하 헤더 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">완료!</h1>
        <p className="text-gray-500 mb-6">"{completedTask?.title}"</p>
        
        {/* 통계 */}
        <div className="flex gap-6 mb-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#A996FF]">{stats?.focusTime || 25}분</p>
            <p className="text-xs text-gray-400">집중 시간</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-500">{stats?.todayCompleted || 1}개</p>
            <p className="text-xs text-gray-400">오늘 완료</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#A996FF]">🔥{stats?.streak || 1}</p>
            <p className="text-xs text-gray-400">연속</p>
          </div>
        </div>
        
        {/* 알프레도 메시지 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl p-4 max-w-sm w-full mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg">
              🐧
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">
                {stats?.todayCompleted >= 3 
                  ? "대단해요, Boss! 오늘 벌써 3개째예요. 이 페이스면 오늘 목표 완전 달성이에요! 💪"
                  : "잘했어요, Boss! 하나씩 해치우는 거예요. 다음 것도 해볼까요?"}
              </p>
            </div>
          </div>
        </div>
        
        {/* 다음 추천 */}
        {nextTask && (
          <div className="w-full max-w-sm">
            <p className="text-xs text-gray-400 font-medium mb-2 text-center">다음은 이거 어때요?</p>
            <div className="bg-white border border-[#E8E3FF] rounded-xl p-4 shadow-sm border border-[#A996FF]/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#A996FF]/10 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-[#A996FF]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{nextTask.title}</p>
                  <p className="text-xs text-gray-400">{nextTask.project} {nextTask.deadline && `· ${nextTask.deadline}`}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBreakTimer(true)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  5분 쉬고 시작
                </button>
                <button
                  onClick={() => onStartNext(nextTask)}
                  className="flex-1 py-3 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1"
                >
                  <Zap size={14} />
                  바로 시작
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!nextTask && (
          <div className="bg-emerald-50 rounded-xl p-4 max-w-sm w-full text-center">
            <p className="text-emerald-700 font-medium">🎊 오늘 할 일 다 끝냈어요!</p>
            <p className="text-emerald-600 text-sm mt-1">푹 쉬세요, Boss!</p>
          </div>
        )}
      </div>
      
      {/* 하단 버튼 */}
      <div className="pt-4">
        <button
          onClick={onGoHome}
          className="w-full py-3 text-gray-500 text-sm font-medium"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

// === Quick Capture Modal ===
const QuickCaptureModal = ({ onClose, onAddTask, onAddToInbox, onOpenMeetingUploader }) => {
  const [captureType, setCaptureType] = useState(null); // 'task', 'memo', 'idea'
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [repeatType, setRepeatType] = useState('none'); // 'none', 'daily', 'weekly', 'monthly'
  
  const handleSubmit = () => {
    if (!text.trim()) return;
    
    if (captureType === 'task') {
      onAddTask({
        id: `task-quick-${Date.now()}`,
        title: text,
        project: 'Quick',
        importance: priority,
        status: 'todo',
        priorityChange: 'new',
        priorityScore: priority === 'high' ? 80 : priority === 'medium' ? 60 : 40,
        sparkline: [0, 0, 0, 0, priority === 'high' ? 80 : 60],
        repeat: repeatType !== 'none' ? repeatType : null,
        repeatLabel: repeatType === 'daily' ? '매일' : repeatType === 'weekly' ? '매주' : repeatType === 'monthly' ? '매월' : null,
      });
    } else {
      onAddToInbox({
        id: `inbox-quick-${Date.now()}`,
        type: captureType === 'idea' ? 'idea' : 'memo',
        subject: text,
        preview: captureType === 'idea' ? '💡 아이디어' : '📝 메모',
        time: '방금',
      });
    }
    
    onClose();
  };
  
  // 타입 선택 화면
  if (!captureType) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 pb-10 animate-in slide-in-from-bottom-10 duration-300"
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
          
          <h2 className="text-lg font-bold text-gray-800 text-center mb-6">빠른 기록</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => setCaptureType('task')}
              className="w-full flex items-center gap-4 p-4 bg-[#F5F3FF] hover:bg-[#EDE9FE] rounded-xl transition-all"
            >
              <div className="w-12 h-12 bg-[#F5F3FF]0 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">할 일 추가</p>
                <p className="text-xs text-gray-500">바로 태스크로 등록</p>
              </div>
            </button>
            
            <button
              onClick={() => setCaptureType('memo')}
              className="w-full flex items-center gap-4 p-4 bg-gray-100 hover:bg-gray-100 rounded-xl transition-all"
            >
              <div className="w-12 h-12 bg-gray-1000 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">빠른 메모</p>
                <p className="text-xs text-gray-500">인박스에 저장</p>
              </div>
            </button>
            
            <button
              onClick={() => setCaptureType('idea')}
              className="w-full flex items-center gap-4 p-4 bg-[#F5F3FF] hover:bg-[#EDE9FE] rounded-xl transition-all"
            >
              <div className="w-12 h-12 bg-[#F5F3FF]0 rounded-xl flex items-center justify-center">
                <Lightbulb size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">아이디어</p>
                <p className="text-xs text-gray-500">나중에 정리</p>
              </div>
            </button>
            
            {/* 회의록 정리 버튼 */}
            <button
              onClick={() => { onClose(); onOpenMeetingUploader?.(); }}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-[#A996FF]/10 to-[#8B7CF7]/10 hover:from-[#A996FF]/20 hover:to-[#8B7CF7]/20 rounded-xl transition-all border border-[#A996FF]/30"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center">
                <Mic size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">회의록 정리</p>
                <p className="text-xs text-gray-500">녹음 파일 → 요약 & 액션</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 입력 화면
  const typeConfig = {
    task: { title: '할 일 추가', icon: CheckCircle2, color: 'lavender', placeholder: '무엇을 해야 하나요?' },
    memo: { title: '빠른 메모', icon: FileText, color: 'blue', placeholder: '메모할 내용을 입력하세요' },
    idea: { title: '아이디어', icon: Lightbulb, color: 'lavender', placeholder: '떠오른 아이디어를 적어보세요' },
  };
  
  const config = typeConfig[captureType];
  const IconComponent = config.icon;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 pb-10 animate-in slide-in-from-bottom-10 duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCaptureType(null)} className="p-2 -ml-2 text-gray-400">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-800">{config.title}</h2>
          <div className="w-8" />
        </div>
        
        <div className={`bg-${config.color}-50 rounded-xl p-4 mb-4`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={config.placeholder}
            className={`w-full bg-transparent text-gray-800 placeholder-${config.color}-300 resize-none focus:outline-none text-base`}
            rows={3}
            autoFocus
          />
        </div>
        
        {captureType === 'task' && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">우선순위</p>
            <div className="flex gap-2">
              {[
                { value: 'high', label: '높음', color: 'bg-red-100 text-red-600 border-red-200' },
                { value: 'medium', label: '보통', color: 'bg-gray-100 text-gray-600 border-gray-200' },
                { value: 'low', label: '낮음', color: 'bg-gray-100 text-gray-600 border-gray-200' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    priority === opt.value 
                      ? opt.color + ' border-current' 
                      : 'bg-gray-50 text-gray-400 border-transparent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* 반복 설정 */}
        {captureType === 'task' && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">🔄 반복 설정</p>
            <div className="flex gap-2">
              {[
                { value: 'none', label: '없음' },
                { value: 'daily', label: '매일' },
                { value: 'weekly', label: '매주' },
                { value: 'monthly', label: '매월' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRepeatType(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    repeatType === opt.value 
                      ? 'bg-[#EDE9FE] text-[#8B7CF7] border-2 border-[#C4B5FD]' 
                      : 'bg-gray-50 text-gray-400 border-2 border-transparent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {repeatType !== 'none' && (
              <p className="text-[11px] text-[#F5F3FF]0 mt-2 flex items-center gap-1">
                <RefreshCw size={10} />
                완료해도 {repeatType === 'daily' ? '다음 날' : repeatType === 'weekly' ? '다음 주' : '다음 달'} 다시 생성돼요
              </p>
            )}
          </div>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className={`w-full py-3.5 bg-${config.color}-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

// === Task Modal ===
const TaskModal = ({ task, onClose, onStartFocus, onToggle, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task?.title || '');
  const [editDeadline, setEditDeadline] = useState(task?.deadline || '');
  const [editImportance, setEditImportance] = useState(task?.importance || 'medium');
  const [editProject, setEditProject] = useState(task?.project || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  if (!task) return null;
  
  const importanceLabel = {
    high: { text: 'High Priority', color: 'bg-red-100 text-red-600' },
    medium: { text: 'Medium', color: 'bg-gray-100 text-gray-600' },
    low: { text: 'Low', color: 'bg-gray-100 text-gray-500' },
  };
  
  const imp = importanceLabel[task.importance] || importanceLabel.medium;
  
  // AI가 생성하는 "왜 중요한지" 메시지
  const getWhyItMatters = () => {
    if (task.priorityChange === 'up') {
      return `이 업무의 우선순위가 올라갔어요. ${task.deadline ? `${task.deadline}까지 완료하면` : '지금 처리하면'} 오후가 훨씬 가벼워질 거예요.`;
    }
    if (task.importance === 'high') {
      return '핵심 업무예요. 집중해서 처리하면 오늘 목표 달성에 큰 도움이 됩니다.';
    }
    return '이 업무를 완료하면 전체 진행 상황이 한 단계 앞으로 나아갑니다.';
  };
  
  const handleSave = () => {
    if (onUpdate) {
      onUpdate(task.id, {
        title: editTitle,
        deadline: editDeadline,
        importance: editImportance,
        project: editProject,
      });
    }
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
    onClose();
  };
  
  // 삭제 확인 모달
  if (showDeleteConfirm) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
        onClick={() => setShowDeleteConfirm(false)}
      >
        <div 
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">태스크 삭제</h3>
            <p className="text-sm text-gray-500">
              "{task.title}"을(를) 삭제하시겠어요?<br/>
              이 작업은 되돌릴 수 없어요.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 편집 모드
  if (isEditing) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          onClick={e => e.stopPropagation()}
          className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">태스크 수정</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            {/* 제목 */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">제목</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
              />
            </div>
            
            {/* 프로젝트 */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">프로젝트</label>
              <input
                type="text"
                value={editProject}
                onChange={(e) => setEditProject(e.target.value)}
                placeholder="프로젝트명"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
              />
            </div>
            
            {/* 마감 */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">마감</label>
              <input
                type="text"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                placeholder="예: 오늘, 내일, D-3"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
              />
            </div>
            
            {/* 우선순위 */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">우선순위</label>
              <div className="flex gap-2">
                {[
                  { value: 'high', label: '높음', color: 'bg-red-100 text-red-600 border-red-300' },
                  { value: 'medium', label: '보통', color: 'bg-gray-100 text-gray-600 border-gray-300' },
                  { value: 'low', label: '낮음', color: 'bg-gray-100 text-gray-600 border-gray-300' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setEditImportance(opt.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      editImportance === opt.value 
                        ? opt.color 
                        : 'bg-gray-50 text-gray-400 border-transparent'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              disabled={!editTitle.trim()}
              className="w-full py-3.5 bg-[#A996FF] text-white font-bold rounded-xl disabled:opacity-50"
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 기본 보기 모드
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white/95 backdrop-blur-xl rounded-t-3xl sm:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
      >
        {/* Header */}
        <div className="relative p-6 pb-3">
          <div className="absolute top-5 right-5 flex items-center gap-2">
            <button 
              onClick={() => setIsEditing(true)} 
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-[#A996FF]/20 rounded-full transition-colors"
            >
              <FileText size={14} className="text-gray-500" />
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-100 rounded-full transition-colors"
            >
              <Trash2 size={14} className="text-gray-500 hover:text-red-500" />
            </button>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-[#F5F3FF] rounded-lg text-[11px] font-bold uppercase tracking-wider text-[#A996FF]">
              {task.project || 'General'}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${imp.color}`}>
              {imp.text}
            </span>
            {task.priorityChange === 'up' && (
              <span className="px-2 py-1 bg-[#A996FF] text-white rounded-lg text-[11px] font-bold flex items-center gap-1">
                <TrendingUp size={10} /> UP
              </span>
            )}
            {task.repeat && (
              <span className="px-2 py-1 bg-[#EDE9FE] text-[#8B7CF7] rounded-lg text-[11px] font-bold flex items-center gap-1">
                <RefreshCw size={10} /> {task.repeatLabel}
              </span>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 leading-tight pr-24">{task.title}</h2>
        </div>
        
        <div className="p-6 pt-2 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#A996FF]">
                <Clock size={16} />
              </div>
              <div>
                <span className="text-[11px] text-gray-400 font-bold uppercase block">마감</span>
                <span className="font-semibold text-gray-800 text-xs">{task.deadline || '유연'}</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#A996FF]">
                <Briefcase size={16} />
              </div>
              <div>
                <span className="text-[11px] text-gray-400 font-bold uppercase block">프로젝트</span>
                <span className="font-semibold text-gray-800 text-xs">{task.project || '일반'}</span>
              </div>
            </div>
          </div>
          
          {/* AI Summary - Why It Matters */}
          <div className="bg-[#F5F3FF]/60 p-4 rounded-xl border border-[#A996FF]/10 relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={12} className="text-[#A996FF]" />
              <h3 className="text-[11px] font-bold text-[#A996FF] uppercase tracking-wider">Why It Matters</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {getWhyItMatters()}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={() => { onToggle(task.id); onClose(); }}
              className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              {task.status === 'done' ? '미완료로 변경' : '완료 처리'}
            </button>
            
            {task.status !== 'done' && (
              <button 
                onClick={() => { onStartFocus(task); onClose(); }}
                className="flex-[2] py-3.5 bg-[#A996FF] text-white font-bold rounded-xl hover:bg-[#8B7BE8] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#A996FF]/30 active:scale-95 text-sm"
              >
                <Zap size={16} fill="currentColor" /> 집중 시작하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// === Swipeable Task Item ===
const SwipeableTaskItem = ({ task, onComplete, onDelete, onPress, darkMode }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showActions, setShowActions] = useState(null); // 'left' | 'right' | null
  
  const minSwipeDistance = 50;
  const actionThreshold = 80;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };
  
  const onTouchMove = (e) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    setTouchEnd(currentTouch);
    
    // 제한된 범위 내에서만 이동
    const limitedDiff = Math.max(-120, Math.min(120, diff));
    setTranslateX(limitedDiff);
    
    if (diff > actionThreshold) {
      setShowActions('right'); // 완료
    } else if (diff < -actionThreshold) {
      setShowActions('left'); // 삭제
    } else {
      setShowActions(null);
    }
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      resetPosition();
      return;
    }
    
    const distance = touchEnd - touchStart;
    const isLeftSwipe = distance < -minSwipeDistance;
    const isRightSwipe = distance > minSwipeDistance;
    
    if (isRightSwipe && distance > actionThreshold) {
      // 완료
      setTranslateX(400);
      setTimeout(() => {
        onComplete(task);
        resetPosition();
      }, 200);
    } else if (isLeftSwipe && distance < -actionThreshold) {
      // 삭제
      setTranslateX(-400);
      setTimeout(() => {
        onDelete(task);
        resetPosition();
      }, 200);
    } else {
      resetPosition();
    }
  };
  
  const resetPosition = () => {
    setTranslateX(0);
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
    setShowActions(null);
  };
  
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className="relative overflow-hidden rounded-xl mb-2">
      {/* 배경 액션 */}
      <div className="absolute inset-0 flex">
        {/* 왼쪽 (삭제) */}
        <div className={`flex-1 flex items-center justify-start pl-4 bg-red-500 transition-opacity ${
          showActions === 'left' ? 'opacity-100' : 'opacity-50'
        }`}>
          <div className="text-white flex items-center gap-2">
            <Trash2 size={20} />
            <span className="font-bold">삭제</span>
          </div>
        </div>
        {/* 오른쪽 (완료) */}
        <div className={`flex-1 flex items-center justify-end pr-4 bg-emerald-500 transition-opacity ${
          showActions === 'right' ? 'opacity-100' : 'opacity-50'
        }`}>
          <div className="text-white flex items-center gap-2">
            <span className="font-bold">완료</span>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>
      
      {/* 태스크 카드 */}
      <div
        className={`${cardBg} p-4 shadow-sm relative z-10 transition-transform ${
          isSwiping ? '' : 'transition-all duration-200'
        }`}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => !isSwiping && translateX === 0 && onPress?.(task)}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task);
            }}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              task.status === 'done'
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-gray-300 hover:border-emerald-500'
            }`}
          >
            {task.status === 'done' && <CheckCircle2 size={14} />}
          </button>
          
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${task.status === 'done' ? 'line-through text-gray-400' : textPrimary}`}>
              {task.title}
            </p>
            {task.project && (
              <p className={`text-xs ${textSecondary} truncate`}>{task.project}</p>
            )}
          </div>
          
          {task.importance === 'high' && (
            <span className="text-red-500 text-lg">!</span>
          )}
        </div>
      </div>
      
      {/* 스와이프 힌트 (첫 사용자용) */}
      {translateX === 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none opacity-0 group-hover:opacity-100">
          <ChevronLeft size={16} />
        </div>
      )}
    </div>
  );
};

// === Add Task Modal ===
const AddTaskModal = ({ isOpen, onClose, onAdd, projects }) => {
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [deadline, setDeadline] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [importance, setImportance] = useState('medium');
  const [repeat, setRepeat] = useState('none');
  const [note, setNote] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = () => {
    if (!title.trim()) return;
    
    const newTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      project: project || '일반',
      deadline: deadlineTime || (deadline ? '종일' : null),
      deadlineDate: deadline || null,
      importance,
      status: 'todo',
      priorityScore: importance === 'high' ? 95 : importance === 'medium' ? 70 : 50,
      repeat: repeat !== 'none',
      repeatType: repeat !== 'none' ? repeat : null,
      repeatLabel: repeat === 'daily' ? '매일' : repeat === 'weekly' ? '매주' : repeat === 'monthly' ? '매월' : null,
      note: note.trim() || null,
      priorityChange: 'new',
      sparkline: [50, 55, 60, 65, 70],
    };
    
    onAdd(newTask);
    
    // Reset form
    setTitle('');
    setProject('');
    setDeadline('');
    setDeadlineTime('');
    setImportance('medium');
    setRepeat('none');
    setNote('');
    onClose();
  };
  
  const importanceOptions = [
    { value: 'high', label: '높음', color: 'bg-red-100 text-red-600 ring-red-300' },
    { value: 'medium', label: '보통', color: 'bg-gray-100 text-gray-600 ring-gray-300' },
    { value: 'low', label: '낮음', color: 'bg-gray-100 text-gray-600 ring-gray-300' },
  ];
  
  const repeatOptions = [
    { value: 'none', label: '반복 안 함' },
    { value: 'daily', label: '매일' },
    { value: 'weekly', label: '매주' },
    { value: 'monthly', label: '매월' },
  ];
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:w-[420px] max-h-[90vh] bg-white rounded-t-3xl sm:rounded-xl overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-[#F5F3FF] to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#A996FF] rounded-xl flex items-center justify-center">
                <Plus size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">새 태스크</h2>
                <p className="text-xs text-gray-500">할 일을 추가하세요</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              할 일 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="무엇을 해야 하나요?"
              className="w-full p-3.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#A996FF] text-gray-800 placeholder-gray-400"
              autoFocus
            />
          </div>
          
          {/* 프로젝트 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">프로젝트</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full p-3.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#A996FF] text-gray-800"
            >
              <option value="">선택 안 함</option>
              {projects?.map(p => (
                <option key={p.id} value={p.name}>{p.icon} {p.name}</option>
              ))}
            </select>
          </div>
          
          {/* 마감일 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">마감일</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-3.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#A996FF] text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">시간</label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full p-3.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#A996FF] text-gray-800"
              />
            </div>
          </div>
          
          {/* 중요도 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">중요도</label>
            <div className="flex gap-2">
              {importanceOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setImportance(opt.value)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    importance === opt.value 
                      ? `${opt.color} ring-2` 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 반복 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">반복</label>
            <div className="flex gap-2 flex-wrap">
              {repeatOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRepeat(opt.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    repeat === opt.value 
                      ? 'bg-[#A996FF] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">메모 (선택)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="추가 정보나 메모..."
              rows={2}
              className="w-full p-3.5 bg-gray-50 rounded-xl border-none resize-none focus:ring-2 focus:ring-[#A996FF] text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className={`flex-[2] py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                title.trim()
                  ? 'bg-[#A996FF] text-white shadow-lg shadow-[#A996FF]/30 hover:bg-[#8B7BE8]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Plus size={18} /> 추가하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Level Up Modal ===
const LevelUpModal = ({ level, onClose }) => {
  if (!level) return null;
  
  const levelTitles = {
    1: '시작', 2: '초보', 3: '입문', 4: '훈련생', 5: '견습생',
    6: '도전자', 7: '수행자', 8: '실천가', 9: '노력가', 10: '숙련자',
    15: '전문가', 20: '달인', 25: '고수', 30: '마스터', 50: '그랜드마스터',
  };
  
  const getTitle = (lvl) => {
    const keys = Object.keys(levelTitles).map(Number).sort((a, b) => b - a);
    for (const key of keys) {
      if (lvl >= key) return levelTitles[key];
    }
    return '시작';
  };
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-[320px] bg-gradient-to-b from-[#A996FF] to-[#8B7CF7] rounded-xl p-8 text-center text-white animate-in zoom-in-95 shadow-2xl">
        {/* 파티클 효과 */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#A996FF] rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
        
        <div className="relative">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-white/80 text-sm mb-2">축하합니다!</p>
          <h2 className="text-4xl font-black mb-2">LEVEL {level}</h2>
          <p className="text-xl font-bold text-[#C4B5FD] mb-6">{getTitle(level)}</p>
          
          <div className="bg-white/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-white/90">
              {level === 5 && '꾸준히 노력하고 있어요! 👏'}
              {level === 10 && '대단해요! 이제 숙련자에요! 🌟'}
              {level === 20 && '정말 놀라워요! 달인의 경지! 🏆'}
              {level < 5 && '좋은 시작이에요! 계속 파이팅! 💪'}
              {level > 5 && level < 10 && '성장하고 있어요! 멋져요! ✨'}
              {level > 10 && level < 20 && '정말 잘하고 있어요! 🔥'}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-4 bg-white text-[#A996FF] font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  );
};

// === New Badge Modal ===
const NewBadgeModal = ({ badge, onClose }) => {
  if (!badge) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-[320px] bg-white rounded-xl overflow-hidden animate-in zoom-in-95 shadow-2xl">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#A996FF] to-[#EDE9FE]0 p-6 text-center">
          <div className="text-6xl mb-2">{badge.icon}</div>
          <p className="text-white/80 text-sm">새 배지 획득!</p>
        </div>
        
        {/* 내용 */}
        <div className="p-6 text-center">
          <h2 className="text-2xl font-black text-gray-800 mb-2">{badge.name}</h2>
          <p className="text-gray-500 mb-6">{badge.description}</p>
          
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-[#A996FF] to-[#EDE9FE]0 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            멋져요! 🎉
          </button>
        </div>
      </div>
    </div>
  );
};

// === Stats Modal (프로필 & 통계) ===
const StatsModal = ({ isOpen, onClose, gameState }) => {
  if (!isOpen) return null;
  
  const levelInfo = LEVEL_CONFIG.getLevel(gameState.totalXP);
  const progressPercent = (levelInfo.currentXP / levelInfo.requiredXP) * 100;
  
  const unlockedBadges = BADGES.filter(b => gameState.unlockedBadges.includes(b.id));
  const lockedBadges = BADGES.filter(b => !gameState.unlockedBadges.includes(b.id));
  
  // 주간 XP 최대값 (그래프용)
  const maxWeeklyXP = Math.max(...gameState.weeklyXP, 100);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date().getDay();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md max-h-[85vh] bg-white rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
        {/* 헤더 - 레벨 카드 */}
        <div className="bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full">
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center text-4xl">
              {levelInfo.level >= 20 ? '👑' : levelInfo.level >= 10 ? '⭐' : '🌱'}
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-sm">레벨</p>
              <h2 className="text-4xl font-black">{levelInfo.level}</h2>
              <p className="text-white/90 text-sm">{gameState.totalXP.toLocaleString()} XP</p>
            </div>
          </div>
          
          {/* XP 프로그레스 바 */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>{levelInfo.currentXP} / {levelInfo.requiredXP} XP</span>
              <span>다음 레벨까지</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gray-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* 콘텐츠 */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {/* 오늘 통계 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Flame size={18} className="text-[#A996FF]500" /> 오늘의 성과
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#A996FF]">{gameState.todayXP}</p>
                <p className="text-xs text-gray-500">XP 획득</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-500">{gameState.todayTasks}</p>
                <p className="text-xs text-gray-500">태스크 완료</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#A996FF]500">{gameState.streak}</p>
                <p className="text-xs text-gray-500">연속 달성</p>
              </div>
            </div>
          </div>
          
          {/* 주간 그래프 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-gray-600" /> 이번 주 XP
            </h3>
            <div className="flex items-end justify-between h-24 gap-1">
              {gameState.weeklyXP.map((xp, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t-lg transition-all ${
                      i === today ? 'bg-[#A996FF]' : 'bg-gray-300'
                    }`}
                    style={{ height: `${Math.max((xp / maxWeeklyXP) * 100, 4)}%` }}
                  />
                  <span className={`text-[11px] mt-1 ${i === today ? 'font-bold text-[#A996FF]' : 'text-gray-400'}`}>
                    {weekDays[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 누적 통계 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Trophy size={18} className="text-[#A996FF]" /> 누적 기록
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[#E8E3FF] rounded-xl p-3">
                <p className="text-xs text-gray-500">완료한 태스크</p>
                <p className="text-xl font-bold text-gray-800">{gameState.totalCompleted}개</p>
              </div>
              <div className="bg-white border border-[#E8E3FF] rounded-xl p-3">
                <p className="text-xs text-gray-500">Big3 완료</p>
                <p className="text-xl font-bold text-gray-800">{gameState.big3Completed}회</p>
              </div>
              <div className="bg-white border border-[#E8E3FF] rounded-xl p-3">
                <p className="text-xs text-gray-500">집중 세션</p>
                <p className="text-xl font-bold text-gray-800">{gameState.focusSessions}회</p>
              </div>
              <div className="bg-white border border-[#E8E3FF] rounded-xl p-3">
                <p className="text-xs text-gray-500">집중 시간</p>
                <p className="text-xl font-bold text-gray-800">{Math.floor(gameState.focusMinutes / 60)}시간</p>
              </div>
            </div>
          </div>
          
          {/* 배지 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Award size={18} className="text-[#F5F3FF]0" /> 배지 ({unlockedBadges.length}/{BADGES.length})
            </h3>
            
            {/* 획득한 배지 */}
            {unlockedBadges.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">획득</p>
                <div className="flex flex-wrap gap-2">
                  {unlockedBadges.map(badge => (
                    <div 
                      key={badge.id}
                      className="w-12 h-12 bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] rounded-xl flex items-center justify-center text-2xl shadow-sm"
                      title={`${badge.name}: ${badge.description}`}
                    >
                      {badge.icon}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 미획득 배지 */}
            {lockedBadges.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">미획득</p>
                <div className="flex flex-wrap gap-2">
                  {lockedBadges.slice(0, 8).map(badge => (
                    <div 
                      key={badge.id}
                      className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-2xl opacity-30"
                      title={`${badge.name}: ${badge.description}`}
                    >
                      {badge.icon}
                    </div>
                  ))}
                  {lockedBadges.length > 8 && (
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400">
                      +{lockedBadges.length - 8}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// === Weekly Review Page ===
const WeeklyReviewPage = ({ onBack, gameState, allTasks, darkMode }) => {
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = 이번 주, -1 = 지난 주
  
  // 날짜 계산
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (selectedWeek * 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const formatDate = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
  const weekLabel = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  
  // 레벨 정보
  const levelInfo = LEVEL_CONFIG.getLevel(gameState.totalXP);
  
  // 주간 통계 계산
  const weeklyXP = gameState.weeklyXP;
  const totalWeeklyXP = weeklyXP.reduce((a, b) => a + b, 0);
  const maxDailyXP = Math.max(...weeklyXP, 1);
  const avgDailyXP = Math.round(totalWeeklyXP / 7);
  
  // 완료율 계산 (오늘 기준)
  const completedTasks = allTasks?.filter(t => t.status === 'done').length || 0;
  const totalTasks = allTasks?.length || 1;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);
  
  // 프로젝트별 완료 통계
  const projectStats = {};
  allTasks?.filter(t => t.status === 'done').forEach(task => {
    const proj = task.project || '기타';
    projectStats[proj] = (projectStats[proj] || 0) + 1;
  });
  const topProjects = Object.entries(projectStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  // 요일 이름
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const today = now.getDay();
  
  // 성취 하이라이트
  const highlights = [];
  if (gameState.todayTasks >= 3) highlights.push({ icon: '🎯', text: '오늘 3개 이상 완료!' });
  if (gameState.streak >= 3) highlights.push({ icon: '🔥', text: `${gameState.streak}일 연속 달성 중!` });
  if (totalWeeklyXP >= 500) highlights.push({ icon: '⚡', text: '이번 주 500 XP 돌파!' });
  if (gameState.focusSessions >= 5) highlights.push({ icon: '🧘', text: '집중 세션 5회 이상!' });
  if (completionRate >= 80) highlights.push({ icon: '✨', text: `완료율 ${completionRate}% 달성!` });
  
  // 도넛 차트 계산
  const donutPercent = completionRate;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (donutPercent / 100) * circumference;
  
  // 스타일
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgColor}`}>
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">주간 리뷰</h1>
          <div className="w-10" />
        </div>
        
        {/* 주 선택 */}
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => setSelectedWeek(s => s - 1)}
            className="p-2 hover:bg-white/20 rounded-full"
            disabled={selectedWeek <= -4}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-white/70 text-sm">{selectedWeek === 0 ? '이번 주' : selectedWeek === -1 ? '지난 주' : `${-selectedWeek}주 전`}</p>
            <p className="font-bold">{weekLabel}</p>
          </div>
          <button 
            onClick={() => setSelectedWeek(s => Math.min(s + 1, 0))}
            className="p-2 hover:bg-white/20 rounded-full"
            disabled={selectedWeek >= 0}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4 pb-32">
        {/* 레벨 & XP 요약 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-3xl shadow-lg">
              {levelInfo.level >= 20 ? '👑' : levelInfo.level >= 10 ? '⭐' : '🌱'}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${textPrimary}`}>Lv.{levelInfo.level}</span>
                <span className="text-[#A996FF] font-bold">+{totalWeeklyXP} XP</span>
              </div>
              <p className={`text-sm ${textSecondary}`}>이번 주 획득</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all"
                  style={{ width: `${(levelInfo.currentXP / levelInfo.requiredXP) * 100}%` }}
                />
              </div>
              <p className={`text-xs ${textSecondary} mt-1`}>{levelInfo.currentXP} / {levelInfo.requiredXP} XP</p>
            </div>
          </div>
        </div>
        
        {/* 완료율 도넛 차트 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Target size={18} className="text-[#A996FF]" /> 태스크 완료율
          </h3>
          <div className="flex items-center gap-6">
            {/* 도넛 차트 */}
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  stroke={darkMode ? '#374151' : '#E5E7EB'}
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A996FF" />
                    <stop offset="100%" stopColor="#8B7CF7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-black ${textPrimary}`}>{completionRate}%</span>
              </div>
            </div>
            
            {/* 통계 */}
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <span className={textSecondary}>완료</span>
                <span className={`font-bold text-emerald-500`}>{completedTasks}개</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>진행 중</span>
                <span className={`font-bold text-[#A996FF]`}>{totalTasks - completedTasks}개</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>전체</span>
                <span className={`font-bold ${textPrimary}`}>{totalTasks}개</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 일별 XP 그래프 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <TrendingUp size={18} className="text-gray-600" /> 일별 XP 획득
          </h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyXP.map((xp, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <span className={`text-xs font-bold mb-1 ${i === today ? 'text-[#A996FF]' : textSecondary}`}>
                  {xp > 0 ? xp : ''}
                </span>
                <div 
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    i === today 
                      ? 'bg-gradient-to-t from-[#A996FF] to-[#C4B5FD]' 
                      : xp > 0 ? 'bg-gray-300' : 'bg-gray-200'
                  }`}
                  style={{ height: `${Math.max((xp / maxDailyXP) * 100, 8)}%` }}
                />
                <span className={`text-xs mt-2 ${i === today ? 'font-bold text-[#A996FF]' : textSecondary}`}>
                  {weekDays[i]}
                </span>
              </div>
            ))}
          </div>
          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between`}>
            <div className="text-center">
              <p className={`text-xl font-bold ${textPrimary}`}>{totalWeeklyXP}</p>
              <p className={`text-xs ${textSecondary}`}>총 XP</p>
            </div>
            <div className="text-center">
              <p className={`text-xl font-bold ${textPrimary}`}>{avgDailyXP}</p>
              <p className={`text-xs ${textSecondary}`}>일 평균</p>
            </div>
            <div className="text-center">
              <p className={`text-xl font-bold ${textPrimary}`}>{Math.max(...weeklyXP)}</p>
              <p className={`text-xs ${textSecondary}`}>최고 기록</p>
            </div>
          </div>
        </div>
        
        {/* 집중 시간 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Zap size={18} className="text-[#A996FF]" /> 집중 시간
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-[#F5F3FF] rounded-xl">
              <p className="text-2xl font-black text-[#8B7CF7]">{gameState.focusSessions}</p>
              <p className="text-xs text-[#8B7CF7]/70">세션</p>
            </div>
            <div className="text-center p-3 bg-[#F5F3FF] rounded-xl">
              <p className="text-2xl font-black text-[#8B7CF7]">{Math.floor(gameState.focusMinutes / 60)}h {gameState.focusMinutes % 60}m</p>
              <p className="text-xs text-[#8B7CF7]/70">총 시간</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <p className="text-2xl font-black text-emerald-600">{gameState.focusSessions > 0 ? Math.round(gameState.focusMinutes / gameState.focusSessions) : 0}분</p>
              <p className="text-xs text-emerald-600/70">평균</p>
            </div>
          </div>
        </div>
        
        {/* 프로젝트별 완료 */}
        {topProjects.length > 0 && (
          <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
            <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
              <Briefcase size={18} className="text-[#A996FF]" /> 프로젝트별 완료
            </h3>
            <div className="space-y-3">
              {topProjects.map(([project, count], i) => (
                <div key={project} className="flex items-center gap-3">
                  <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className={`font-medium ${textPrimary}`}>{project}</span>
                      <span className={`font-bold ${textPrimary}`}>{count}개</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          i === 0 ? 'bg-[#A996FF]' : i === 1 ? 'bg-gray-400' : 'bg-[#A996FF]300'
                        }`}
                        style={{ width: `${(count / topProjects[0][1]) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 성취 하이라이트 */}
        {highlights.length > 0 && (
          <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
            <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
              <Sparkles size={18} className="text-[#A996FF]" /> 이번 주 하이라이트
            </h3>
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE] rounded-xl"
                >
                  <span className="text-2xl">{h.icon}</span>
                  <span className={`font-medium ${textPrimary}`}>{h.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 연속 달성 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Flame size={18} className="text-[#A996FF]500" /> 연속 달성
          </h3>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
                <span className="text-3xl font-black text-white">{gameState.streak}</span>
              </div>
              <p className={`font-bold ${textPrimary}`}>현재 연속</p>
              <p className={`text-sm ${textSecondary}`}>일</p>
            </div>
            <div className="text-6xl">🔥</div>
          </div>
          {gameState.streak > 0 && (
            <p className={`text-center mt-4 ${textSecondary}`}>
              {gameState.streak >= 7 ? '대단해요! 일주일 넘게 연속 달성 중!' :
               gameState.streak >= 3 ? '좋아요! 3일 연속 달성!' :
               '시작이 좋아요! 계속 달려봐요!'}
            </p>
          )}
        </div>
        
        {/* 다음 목표 */}
        <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-xl p-5 text-white">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Target size={18} /> 다음 목표
          </h3>
          <div className="space-y-2">
            {levelInfo.requiredXP - levelInfo.currentXP <= 100 && (
              <div className="flex items-center gap-2 bg-white/20 rounded-xl p-3">
                <span>⬆️</span>
                <span>레벨 {levelInfo.level + 1}까지 {levelInfo.requiredXP - levelInfo.currentXP} XP</span>
              </div>
            )}
            {gameState.streak < 7 && (
              <div className="flex items-center gap-2 bg-white/20 rounded-xl p-3">
                <span>🔥</span>
                <span>7일 연속 달성까지 {7 - gameState.streak}일</span>
              </div>
            )}
            {gameState.totalCompleted < 50 && (
              <div className="flex items-center gap-2 bg-white/20 rounded-xl p-3">
                <span>🎖️</span>
                <span>50개 태스크 완료까지 {50 - gameState.totalCompleted}개</span>
              </div>
            )}
          </div>
        </div>
        
        {/* 알프레도 응원 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-xl shrink-0">
              🐧
            </div>
            <div>
              <p className={`font-bold ${textPrimary} mb-1`}>알프레도의 한마디</p>
              <p className={textSecondary}>
                {completionRate >= 80 
                  ? '이번 주 정말 멋졌어요! 다음 주도 이 기세로 가보자고요! 🚀' 
                  : completionRate >= 50 
                    ? '절반 이상 해냈어요! 조금만 더 힘내면 완벽해요! 💪'
                    : '천천히 해도 괜찮아요. 꾸준히 하는 게 중요하답니다. 🌱'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Habit Heatmap Page ===
const HabitHeatmapPage = ({ onBack, gameState, darkMode }) => {
  // 12주 (84일) 데이터 생성
  const today = new Date();
  const days = [];
  
  // 84일 전부터 오늘까지
  for (let i = 83; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push({
      date,
      dateStr: date.toISOString().split('T')[0],
      dayOfWeek: date.getDay(),
      isToday: i === 0,
    });
  }
  
  // 주별로 그룹화 (12주)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  // 활동 데이터 시뮬레이션 (실제로는 gameState에서 가져와야 함)
  // weeklyXP 기반으로 오늘 포함 7일 데이터 사용, 나머지는 랜덤
  const getActivityLevel = (dateStr, dayIndex) => {
    const daysFromToday = Math.floor((today - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    
    if (daysFromToday < 7) {
      // 최근 7일은 실제 데이터
      const xp = gameState.weeklyXP[6 - daysFromToday] || 0;
      if (xp >= 100) return 4;
      if (xp >= 60) return 3;
      if (xp >= 30) return 2;
      if (xp > 0) return 1;
      return 0;
    } else {
      // 과거 데이터는 시뮬레이션 (seed 기반)
      const seed = dateStr.split('-').reduce((a, b) => a + parseInt(b), 0);
      const rand = Math.sin(seed) * 10000;
      const normalized = rand - Math.floor(rand);
      if (normalized > 0.85) return 4;
      if (normalized > 0.65) return 3;
      if (normalized > 0.4) return 2;
      if (normalized > 0.2) return 1;
      return 0;
    }
  };
  
  // 활동 레벨별 색상
  const getLevelColor = (level, dark = false) => {
    if (dark) {
      const colors = ['#1e1e2e', '#2d4a3e', '#3d6b4f', '#4d8c5f', '#5ead6f'];
      return colors[level];
    }
    const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
    return colors[level];
  };
  
  // 통계 계산
  const activeDays = days.filter(d => getActivityLevel(d.dateStr) > 0).length;
  const totalDays = days.length;
  const activityRate = Math.round((activeDays / totalDays) * 100);
  
  // 현재 스트릭 계산
  let currentStreak = gameState.streak || 0;
  
  // 최장 스트릭 (시뮬레이션)
  let longestStreak = Math.max(currentStreak, 7);
  let tempStreak = 0;
  days.forEach(d => {
    if (getActivityLevel(d.dateStr) > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });
  
  // 월 레이블 계산
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0];
    if (firstDay && firstDay.date.getMonth() !== lastMonth) {
      monthLabels.push({ weekIndex, month: firstDay.date.getMonth() + 1 });
      lastMonth = firstDay.date.getMonth();
    }
  });
  
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 스타일
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgColor}`}>
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">습관 히트맵</h1>
          <div className="w-10" />
        </div>
        <p className="text-center text-white/80 text-sm">최근 12주 활동 기록</p>
      </div>
      
      <div className="p-4 space-y-4 pb-32">
        {/* 요약 통계 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <span className="text-2xl font-black text-white">{currentStreak}</span>
              </div>
              <p className={`text-sm font-bold ${textPrimary}`}>현재 스트릭</p>
              <p className={`text-xs ${textSecondary}`}>일 연속</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#A996FF] to-[#EDE9FE]0 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <span className="text-2xl font-black text-white">{longestStreak}</span>
              </div>
              <p className={`text-sm font-bold ${textPrimary}`}>최장 스트릭</p>
              <p className={`text-xs ${textSecondary}`}>일 연속</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <span className="text-2xl font-black text-white">{activeDays}</span>
              </div>
              <p className={`text-sm font-bold ${textPrimary}`}>활동일</p>
              <p className={`text-xs ${textSecondary}`}>/ {totalDays}일</p>
            </div>
          </div>
        </div>
        
        {/* 활동률 프로그레스 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-bold ${textPrimary}`}>12주 활동률</span>
            <span className="text-emerald-500 font-bold">{activityRate}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
              style={{ width: `${activityRate}%` }}
            />
          </div>
          <p className={`text-xs ${textSecondary} mt-2`}>
            {activityRate >= 80 ? '🔥 놀라운 꾸준함이에요!' :
             activityRate >= 60 ? '💪 아주 잘 하고 있어요!' :
             activityRate >= 40 ? '👍 좋은 습관을 만들어가고 있어요!' :
             '🌱 조금씩 시작해봐요!'}
          </p>
        </div>
        
        {/* 히트맵 그리드 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm overflow-x-auto`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Calendar size={18} className="text-emerald-500" /> 활동 히트맵
          </h3>
          
          {/* 월 레이블 */}
          <div className="flex mb-1 ml-8">
            {monthLabels.map((label, i) => (
              <div 
                key={i}
                className={`text-xs ${textSecondary}`}
                style={{ 
                  position: 'relative',
                  left: `${label.weekIndex * 14}px`,
                  marginRight: i < monthLabels.length - 1 ? `${(monthLabels[i + 1]?.weekIndex - label.weekIndex - 1) * 14}px` : 0
                }}
              >
                {label.month}월
              </div>
            ))}
          </div>
          
          {/* 히트맵 그리드 */}
          <div className="flex gap-1">
            {/* 요일 레이블 */}
            <div className="flex flex-col gap-1 mr-1">
              {weekDays.map((day, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-[12px] text-[11px] ${textSecondary} flex items-center`}
                >
                  {i % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>
            
            {/* 주별 컬럼 */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const level = getActivityLevel(day.dateStr, dayIndex);
                  return (
                    <div
                      key={day.dateStr}
                      className={`w-[12px] h-[12px] rounded-sm transition-all hover:scale-125 cursor-pointer ${
                        day.isToday ? 'ring-2 ring-emerald-500 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: getLevelColor(level, darkMode) }}
                      title={`${day.date.getMonth() + 1}/${day.date.getDate()} - ${
                        level === 0 ? '활동 없음' :
                        level === 1 ? '조금' :
                        level === 2 ? '보통' :
                        level === 3 ? '많이' : '아주 많이'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          
          {/* 범례 */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className={`text-xs ${textSecondary}`}>적음</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="w-[12px] h-[12px] rounded-sm"
                style={{ backgroundColor: getLevelColor(level, darkMode) }}
              />
            ))}
            <span className={`text-xs ${textSecondary}`}>많음</span>
          </div>
        </div>
        
        {/* 스트릭 동기부여 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Flame size={18} className="text-[#A996FF]500" /> 스트릭 챌린지
          </h3>
          
          <div className="space-y-3">
            {/* 3일 */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentStreak >= 3 ? 'bg-[#A996FF]100' : 'bg-gray-100'
              }`}>
                <span className={currentStreak >= 3 ? '' : 'grayscale opacity-50'}>🔥</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${currentStreak >= 3 ? textPrimary : textSecondary}`}>3일 연속</span>
                  {currentStreak >= 3 ? (
                    <span className="text-xs text-emerald-500 font-bold">달성! ✓</span>
                  ) : (
                    <span className={`text-xs ${textSecondary}`}>{3 - currentStreak}일 남음</span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-[#A996FF]400 rounded-full"
                    style={{ width: `${Math.min((currentStreak / 3) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* 7일 */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentStreak >= 7 ? 'bg-[#A996FF]100' : 'bg-gray-100'
              }`}>
                <span className={currentStreak >= 7 ? '' : 'grayscale opacity-50'}>🔥🔥</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${currentStreak >= 7 ? textPrimary : textSecondary}`}>7일 연속</span>
                  {currentStreak >= 7 ? (
                    <span className="text-xs text-emerald-500 font-bold">달성! ✓</span>
                  ) : (
                    <span className={`text-xs ${textSecondary}`}>{7 - currentStreak}일 남음</span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-[#A996FF]400 rounded-full"
                    style={{ width: `${Math.min((currentStreak / 7) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* 30일 */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentStreak >= 30 ? 'bg-[#EDE9FE]' : 'bg-gray-100'
              }`}>
                <span className={currentStreak >= 30 ? '' : 'grayscale opacity-50'}>💎</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${currentStreak >= 30 ? textPrimary : textSecondary}`}>30일 연속</span>
                  {currentStreak >= 30 ? (
                    <span className="text-xs text-emerald-500 font-bold">달성! ✓</span>
                  ) : (
                    <span className={`text-xs ${textSecondary}`}>{30 - currentStreak}일 남음</span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-[#A996FF] rounded-full"
                    style={{ width: `${Math.min((currentStreak / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 주간 활동 요약 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <TrendingUp size={18} className="text-gray-600" /> 주간 활동 패턴
          </h3>
          
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              // 해당 요일의 평균 활동량 계산
              const dayActivities = days.filter(d => d.dayOfWeek === i);
              const avgLevel = dayActivities.reduce((sum, d) => sum + getActivityLevel(d.dateStr), 0) / dayActivities.length;
              const percentage = Math.round((avgLevel / 4) * 100);
              
              return (
                <div key={i} className="text-center">
                  <div 
                    className="w-full aspect-square rounded-xl flex items-center justify-center mb-1"
                    style={{ 
                      backgroundColor: getLevelColor(Math.round(avgLevel), darkMode),
                      opacity: avgLevel > 0 ? 1 : 0.3
                    }}
                  >
                    <span className={`text-xs font-bold ${avgLevel >= 2 ? 'text-white' : textSecondary}`}>
                      {percentage}%
                    </span>
                  </div>
                  <span className={`text-xs ${textSecondary}`}>{day}</span>
                </div>
              );
            })}
          </div>
          
          <p className={`text-xs ${textSecondary} mt-3 text-center`}>
            {(() => {
              const dayAvgs = weekDays.map((_, i) => {
                const dayActivities = days.filter(d => d.dayOfWeek === i);
                return dayActivities.reduce((sum, d) => sum + getActivityLevel(d.dateStr), 0) / dayActivities.length;
              });
              const maxDay = dayAvgs.indexOf(Math.max(...dayAvgs));
              const minDay = dayAvgs.indexOf(Math.min(...dayAvgs));
              return `${weekDays[maxDay]}요일에 가장 활발하고, ${weekDays[minDay]}요일에 쉬는 편이에요`;
            })()}
          </p>
        </div>
        
        {/* 알프레도 응원 */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0">
              🐧
            </div>
            <div>
              <p className="font-bold mb-1">알프레도의 한마디</p>
              <p className="text-white/90 text-sm">
                {currentStreak >= 7 
                  ? '일주일 넘게 연속 달성! 이제 습관이 몸에 배고 있어요. 대단해요! 🌟' 
                  : currentStreak >= 3 
                    ? '3일 연속 달성! 습관 형성의 첫 고비를 넘겼어요. 계속 가보자고요! 💪'
                    : currentStreak >= 1
                      ? '좋은 시작이에요! 내일도 함께해요. 작은 발걸음이 큰 변화를 만들어요. 🌱'
                      : '오늘부터 시작해볼까요? 하루 하나씩, 천천히 쌓아가봐요! 🚀'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Energy Rhythm Page ===
const EnergyRhythmPage = ({ onBack, gameState, userData, darkMode }) => {
  // 오늘 날짜
  const today = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 시간대별 에너지 데이터 (실제로는 저장된 데이터에서 가져와야 함)
  // 현재는 시뮬레이션
  const [energyLog, setEnergyLog] = useState(() => {
    // 최근 7일 데이터 생성
    const logs = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];
      
      // 시간대별 에너지 (0-4 스케일)
      const seed = dateStr.split('-').reduce((a, b) => a + parseInt(b), 0);
      logs.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        morning: d === 0 ? (userData?.energy || 3) : Math.floor((Math.sin(seed * 1.1) + 1) * 2),
        afternoon: d === 0 ? Math.max(0, (userData?.energy || 3) - 1) : Math.floor((Math.sin(seed * 1.3) + 1) * 2),
        evening: d === 0 ? Math.max(0, (userData?.energy || 3) - 2) : Math.floor((Math.sin(seed * 1.5) + 1) * 2),
        mood: d === 0 ? (userData?.mood || 'good') : ['great', 'good', 'okay', 'tired'][Math.floor((Math.sin(seed * 2) + 1) * 2)],
      });
    }
    return logs;
  });
  
  // 현재 에너지 (userData에서)
  const currentEnergy = userData?.energy || 3;
  const currentMood = userData?.mood || 'good';
  
  // 에너지 레벨 색상
  const getEnergyColor = (level) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
    return colors[Math.min(level, 4)];
  };
  
  // 무드 아이콘
  const getMoodIcon = (mood) => {
    const icons = { great: '😄', good: '🙂', okay: '😐', tired: '😔', stressed: '😰' };
    return icons[mood] || '🙂';
  };
  
  // 무드 라벨
  const getMoodLabel = (mood) => {
    const labels = { great: '아주 좋음', good: '좋음', okay: '보통', tired: '피곤', stressed: '스트레스' };
    return labels[mood] || '보통';
  };
  
  // 시간대별 평균 계산
  const avgMorning = Math.round(energyLog.reduce((sum, d) => sum + d.morning, 0) / energyLog.length * 10) / 10;
  const avgAfternoon = Math.round(energyLog.reduce((sum, d) => sum + d.afternoon, 0) / energyLog.length * 10) / 10;
  const avgEvening = Math.round(energyLog.reduce((sum, d) => sum + d.evening, 0) / energyLog.length * 10) / 10;
  
  // 최적 시간대 찾기
  const bestTime = avgMorning >= avgAfternoon && avgMorning >= avgEvening ? 'morning' :
                   avgAfternoon >= avgEvening ? 'afternoon' : 'evening';
  const bestTimeLabel = { morning: '오전', afternoon: '오후', evening: '저녁' }[bestTime];
  
  // 에너지 패턴 분석
  const getPatternInsight = () => {
    if (avgMorning > avgAfternoon && avgAfternoon > avgEvening) {
      return '아침형 인간이에요! 중요한 일은 오전에 처리하는 게 좋아요.';
    } else if (avgEvening > avgAfternoon && avgAfternoon > avgMorning) {
      return '저녁형 인간이에요! 오후~저녁에 집중력이 높아져요.';
    } else if (avgAfternoon > avgMorning && avgAfternoon > avgEvening) {
      return '오후에 에너지가 가장 높아요! 점심 후가 골든타임이에요.';
    } else {
      return '에너지가 하루 종일 꾸준해요! 언제든 집중할 수 있어요.';
    }
  };
  
  // 스타일
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgColor}`}>
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#F5F3FF]0 to-[#EDE9FE]0 text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">에너지 리듬</h1>
          <div className="w-10" />
        </div>
        <p className="text-center text-white/80 text-sm">나의 하루 에너지 패턴 분석</p>
      </div>
      
      <div className="p-4 space-y-4 pb-32">
        {/* 현재 상태 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4`}>지금 내 상태</h3>
          <div className="flex items-center gap-4">
            {/* 에너지 게이지 */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className={textSecondary}>에너지</span>
                <span className="font-bold" style={{ color: getEnergyColor(currentEnergy) }}>
                  {['매우 낮음', '낮음', '보통', '높음', '매우 높음'][currentEnergy]}
                </span>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className={`flex-1 h-3 rounded-full transition-all ${
                      level <= currentEnergy ? '' : 'opacity-20'
                    }`}
                    style={{ backgroundColor: getEnergyColor(level) }}
                  />
                ))}
              </div>
            </div>
            
            {/* 무드 */}
            <div className="text-center px-4 border-l border-gray-200">
              <div className="text-3xl mb-1">{getMoodIcon(currentMood)}</div>
              <span className={`text-sm ${textSecondary}`}>{getMoodLabel(currentMood)}</span>
            </div>
          </div>
        </div>
        
        {/* 오늘의 에너지 곡선 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Zap size={18} className="text-[#A996FF]" /> 오늘의 에너지 곡선
          </h3>
          
          <div className="relative h-40">
            {/* Y축 라벨 */}
            <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-400">
              <span>높음</span>
              <span>보통</span>
              <span>낮음</span>
            </div>
            
            {/* 그래프 영역 */}
            <div className="ml-10 h-full relative">
              {/* 배경 그리드 */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2].map(i => (
                  <div key={i} className="border-b border-gray-100 border-dashed" />
                ))}
              </div>
              
              {/* 곡선 (SVG) */}
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* 영역 채우기 */}
                <path
                  d={`M 0 ${100 - (energyLog[6]?.morning || 2) * 20} 
                      Q 75 ${100 - (energyLog[6]?.morning || 2) * 22} 100 ${100 - ((energyLog[6]?.morning + energyLog[6]?.afternoon) / 2 || 2) * 20}
                      Q 125 ${100 - (energyLog[6]?.afternoon || 2) * 18} 150 ${100 - (energyLog[6]?.afternoon || 2) * 20}
                      Q 200 ${100 - (energyLog[6]?.afternoon || 2) * 22} 225 ${100 - ((energyLog[6]?.afternoon + energyLog[6]?.evening) / 2 || 2) * 20}
                      Q 275 ${100 - (energyLog[6]?.evening || 2) * 18} 300 ${100 - (energyLog[6]?.evening || 2) * 20}
                      L 300 100 L 0 100 Z`}
                  fill="url(#energyGradient)"
                />
                
                {/* 선 */}
                <path
                  d={`M 0 ${100 - (energyLog[6]?.morning || 2) * 20} 
                      Q 75 ${100 - (energyLog[6]?.morning || 2) * 22} 100 ${100 - ((energyLog[6]?.morning + energyLog[6]?.afternoon) / 2 || 2) * 20}
                      Q 125 ${100 - (energyLog[6]?.afternoon || 2) * 18} 150 ${100 - (energyLog[6]?.afternoon || 2) * 20}
                      Q 200 ${100 - (energyLog[6]?.afternoon || 2) * 22} 225 ${100 - ((energyLog[6]?.afternoon + energyLog[6]?.evening) / 2 || 2) * 20}
                      Q 275 ${100 - (energyLog[6]?.evening || 2) * 18} 300 ${100 - (energyLog[6]?.evening || 2) * 20}`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                
                {/* 포인트 */}
                <circle cx="50" cy={100 - (energyLog[6]?.morning || 2) * 20} r="6" fill="#f59e0b" />
                <circle cx="150" cy={100 - (energyLog[6]?.afternoon || 2) * 20} r="6" fill="#f59e0b" />
                <circle cx="250" cy={100 - (energyLog[6]?.evening || 2) * 20} r="6" fill="#f59e0b" />
              </svg>
              
              {/* X축 라벨 */}
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>오전</span>
                <span>오후</span>
                <span>저녁</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 시간대별 평균 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Clock size={18} className="text-gray-600" /> 시간대별 평균 (7일)
          </h3>
          
          <div className="space-y-4">
            {/* 오전 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Sun size={16} className="text-[#A996FF]" />
                  <span className={textPrimary}>오전</span>
                  {bestTime === 'morning' && <span className="text-xs bg-[#EDE9FE] text-[#8B7CF7] px-2 py-0.5 rounded-full">🏆 베스트</span>}
                </div>
                <span className="font-bold" style={{ color: getEnergyColor(Math.round(avgMorning)) }}>{avgMorning.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(avgMorning / 4) * 100}%`, backgroundColor: getEnergyColor(Math.round(avgMorning)) }}
                />
              </div>
            </div>
            
            {/* 오후 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Cloud size={16} className="text-gray-500" />
                  <span className={textPrimary}>오후</span>
                  {bestTime === 'afternoon' && <span className="text-xs bg-[#EDE9FE] text-[#8B7CF7] px-2 py-0.5 rounded-full">🏆 베스트</span>}
                </div>
                <span className="font-bold" style={{ color: getEnergyColor(Math.round(avgAfternoon)) }}>{avgAfternoon.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(avgAfternoon / 4) * 100}%`, backgroundColor: getEnergyColor(Math.round(avgAfternoon)) }}
                />
              </div>
            </div>
            
            {/* 저녁 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Moon size={16} className="text-[#A996FF]" />
                  <span className={textPrimary}>저녁</span>
                  {bestTime === 'evening' && <span className="text-xs bg-[#EDE9FE] text-[#8B7CF7] px-2 py-0.5 rounded-full">🏆 베스트</span>}
                </div>
                <span className="font-bold" style={{ color: getEnergyColor(Math.round(avgEvening)) }}>{avgEvening.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(avgEvening / 4) * 100}%`, backgroundColor: getEnergyColor(Math.round(avgEvening)) }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* 7일 에너지 트렌드 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <TrendingUp size={18} className="text-emerald-500" /> 7일 에너지 트렌드
          </h3>
          
          <div className="flex items-end justify-between h-32 gap-2">
            {energyLog.map((day, i) => {
              const avgEnergy = (day.morning + day.afternoon + day.evening) / 3;
              const isToday = i === energyLog.length - 1;
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <span className={`text-lg mb-1`}>{getMoodIcon(day.mood)}</span>
                  <div 
                    className={`w-full rounded-t-lg transition-all ${
                      isToday 
                        ? 'bg-gradient-to-t from-[#F5F3FF]0 to-[#C4B5FD]' 
                        : 'bg-gradient-to-t from-gray-300 to-gray-200'
                    }`}
                    style={{ height: `${(avgEnergy / 4) * 80 + 20}%` }}
                  />
                  <span className={`text-xs mt-2 ${isToday ? 'font-bold text-[#A996FF]' : textSecondary}`}>
                    {dayNames[day.dayOfWeek]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 무드 분포 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Sparkles size={18} className="text-[#A996FF]" /> 이번 주 무드 분포
          </h3>
          
          <div className="flex justify-around">
            {['great', 'good', 'okay', 'tired'].map(mood => {
              const count = energyLog.filter(d => d.mood === mood).length;
              const percentage = Math.round((count / 7) * 100);
              
              return (
                <div key={mood} className="text-center">
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-1 ${
                      count > 0 ? 'bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE]' : 'bg-gray-100 opacity-50'
                    }`}
                  >
                    {getMoodIcon(mood)}
                  </div>
                  <p className={`text-sm font-bold ${textPrimary}`}>{count}일</p>
                  <p className={`text-xs ${textSecondary}`}>{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 인사이트 */}
        <div className="bg-gradient-to-r from-[#F5F3FF]0 to-[#EDE9FE]0 rounded-xl p-5 text-white">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Lightbulb size={18} /> 에너지 인사이트
          </h3>
          
          <div className="space-y-3">
            <div className="bg-white/20 rounded-xl p-3">
              <p className="font-medium">🏆 골든타임: {bestTimeLabel}</p>
              <p className="text-sm text-white/80 mt-1">{getPatternInsight()}</p>
            </div>
            
            <div className="bg-white/20 rounded-xl p-3">
              <p className="font-medium">💡 추천</p>
              <p className="text-sm text-white/80 mt-1">
                {bestTime === 'morning' 
                  ? 'Big3 태스크를 오전에 배치해보세요. 집중력이 가장 높을 때 중요한 일을 끝낼 수 있어요!'
                  : bestTime === 'afternoon'
                    ? '점심 후 1-2시간이 골든타임이에요. 이 시간에 깊은 집중이 필요한 작업을 해보세요!'
                    : '저녁 시간을 활용해보세요. 방해받지 않는 조용한 시간에 집중하기 좋아요!'}
              </p>
            </div>
          </div>
        </div>
        
        {/* 알프레도 응원 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A996FF] to-[#EDE9FE]0 rounded-xl flex items-center justify-center text-xl shrink-0">
              🐧
            </div>
            <div>
              <p className={`font-bold ${textPrimary} mb-1`}>알프레도의 한마디</p>
              <p className={textSecondary}>
                {currentEnergy >= 3 
                  ? '오늘 에너지가 좋네요! 이 기운으로 Big3 하나 끝내볼까요? 🚀' 
                  : currentEnergy >= 2 
                    ? '괜찮아요, 무리하지 말고 작은 것부터 시작해봐요. 💪'
                    : '오늘은 쉬어가는 날로 해요. 충분한 휴식도 생산성의 일부예요. 🌙'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Calendar Page ===
const CalendarPage = ({ onBack, tasks, allTasks, events, darkMode, onAddEvent, onUpdateEvent, onDeleteEvent, onSyncGoogleEvents }) => {
  // Google Calendar 훅
  const googleCalendar = useGoogleCalendar();
  
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    return start;
  });
  const [showFilters, setShowFilters] = useState({ work: true, life: true });
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Google Calendar에서 일정 불러오기
  const syncFromGoogle = useCallback(async () => {
    console.log('🚀 syncFromGoogle 시작!');
    console.log('🔑 isSignedIn:', googleCalendar.isSignedIn);
    
    if (!googleCalendar.isSignedIn) {
      console.log('❌ 로그인 안됨 - signIn 호출');
      googleCalendar.signIn();
      return;
    }
    
    setIsSyncing(true);
    try {
      // 현재 달 기준 전후 1개월 일정만 가져오기 (100개 limit 대응)
      const timeMin = new Date();
      timeMin.setMonth(timeMin.getMonth() - 1);
      timeMin.setDate(1);
      timeMin.setHours(0, 0, 0, 0);
      
      const timeMax = new Date();
      timeMax.setMonth(timeMax.getMonth() + 2);
      timeMax.setDate(0);
      timeMax.setHours(23, 59, 59, 999);
      
      console.log('📅 조회 기간:', timeMin.toISOString(), '~', timeMax.toISOString());
      
      const result = await googleCalendar.listEvents(
        timeMin.toISOString(),
        timeMax.toISOString()
      );
      
      console.log('📦 API 응답:', result);
      console.log('📊 이벤트 수:', result.events?.length || 0);
      
      if (result.events && result.events.length > 0) {
        // Google Calendar 일정을 앱 형식으로 변환
        const googleEvents = result.events.map(gEvent => {
          const startDateTime = gEvent.start?.dateTime || gEvent.start?.date;
          const endDateTime = gEvent.end?.dateTime || gEvent.end?.date;
          
          let date, start, end;
          if (gEvent.start?.dateTime) {
            // 시간이 있는 일정
            const startDate = new Date(startDateTime);
            const endDate = new Date(endDateTime);
            date = startDate.toISOString().split('T')[0];
            start = startDate.toTimeString().slice(0, 5);
            end = endDate.toTimeString().slice(0, 5);
          } else {
            // 종일 일정
            date = startDateTime;
            start = '00:00';
            end = '23:59';
          }
          
          console.log('🔄 변환:', gEvent.summary, '→', date);
          
          return {
            id: `google-${gEvent.id}`,
            googleEventId: gEvent.id,
            title: gEvent.summary || '(제목 없음)',
            date,
            start,
            end,
            location: gEvent.location || null,
            color: 'bg-blue-500', // Google 일정은 파란색
            important: false,
            fromGoogle: true, // Google에서 가져온 일정 표시
            description: gEvent.description || '',
          };
        });
        
        // 12월 일정만 필터링해서 로그
        const decEvents = googleEvents.filter(e => e.date?.startsWith('2025-12'));
        console.log('📆 12월 일정:', decEvents.length, decEvents.map(e => `${e.date}: ${e.title}`));
        
        // 부모 컴포넌트에 동기화된 일정 전달
        console.log('📤 onSyncGoogleEvents 호출:', typeof onSyncGoogleEvents);
        if (onSyncGoogleEvents) {
          onSyncGoogleEvents(googleEvents);
          console.log('✅ onSyncGoogleEvents 호출 완료!');
        } else {
          console.error('❌ onSyncGoogleEvents가 undefined입니다!');
        }
        setLastSyncTime(new Date());
        console.log(`✅ ${googleEvents.length}개 일정 동기화 완료`);
      } else {
        console.log('⚠️ 가져올 일정이 없습니다');
      }
    } catch (err) {
      console.error('❌ Google Calendar 동기화 실패:', err);
      console.error('에러 메시지:', err.message);
      // 401 에러 (토큰 만료) 시 재로그인
      if (err.message?.includes('401') || err.message?.includes('Unauthorized') || err.message?.includes('로그인')) {
        console.log('🔄 토큰 만료 - 재로그인 시도');
        googleCalendar.signOut();
        setTimeout(() => googleCalendar.signIn(), 500);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [googleCalendar, onSyncGoogleEvents]);
  
  // 컴포넌트 마운트 시 자동 동기화
  useEffect(() => {
    if (googleCalendar.isSignedIn && !lastSyncTime) {
      syncFromGoogle();
    }
  }, [googleCalendar.isSignedIn]);
  
  // 이벤트 저장 (추가/수정) - Google Calendar 연동
  const handleSaveEvent = async (event) => {
    try {
      let googleEventId = event.googleEventId;
      
      // Google Calendar 동기화
      if (event.syncToGoogle && googleCalendar.isSignedIn) {
        const googleEvent = {
          title: event.title,
          date: event.date,
          start: event.start,
          end: event.end,
          location: event.location,
        };
        
        if (editingEvent && googleEventId) {
          const result = await googleCalendar.updateEvent(googleEventId, googleEvent);
          googleEventId = result.event?.id || googleEventId;
        } else {
          const result = await googleCalendar.addEvent(googleEvent);
          googleEventId = result.event?.id;
        }
      } else if (!event.syncToGoogle && editingEvent?.googleEventId) {
        try {
          await googleCalendar.deleteEvent(editingEvent.googleEventId);
        } catch (err) {
          console.log('Google event delete skipped:', err);
        }
        googleEventId = null;
      }
      
      const eventWithGoogle = { ...event, googleEventId };
      
      if (editingEvent) {
        onUpdateEvent && onUpdateEvent(editingEvent.id, eventWithGoogle);
      } else {
        onAddEvent && onAddEvent(eventWithGoogle);
      }
      
      // 동기화 후 다시 불러오기
      if (event.syncToGoogle && googleCalendar.isSignedIn) {
        setTimeout(() => syncFromGoogle(), 1000);
      }
    } catch (err) {
      console.error('Google Calendar sync error:', err);
      if (editingEvent) {
        onUpdateEvent && onUpdateEvent(editingEvent.id, event);
      } else {
        onAddEvent && onAddEvent(event);
      }
    }
    
    setEditingEvent(null);
    setShowEventModal(false);
  };
  
  // 이벤트 삭제 - Google Calendar 연동
  const handleDeleteEvent = async (eventId, googleEventId) => {
    try {
      if (googleEventId && googleCalendar.isSignedIn) {
        await googleCalendar.deleteEvent(googleEventId);
      }
    } catch (err) {
      console.error('Google Calendar delete error:', err);
    }
    
    onDeleteEvent && onDeleteEvent(eventId);
    setShowEventModal(false);
    setEditingEvent(null);
    
    // 동기화 후 다시 불러오기
    if (googleCalendar.isSignedIn) {
      setTimeout(() => syncFromGoogle(), 500);
    }
  };
  
  // 날짜 포맷
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  const formatMonthYear = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };
  
  const formatWeekRange = (startDate) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;
  };
  
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  const todayStr = formatDate(today);
  const selectedDateStr = formatDate(selectedDate);
  
  // 월간 달력 데이터 생성
  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days = [];
    
    // 이전 달 padding
    const prevMonth = new Date(year, month, 0);
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // 현재 달
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // 다음 달 padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };
  
  // 주간 달력 데이터 생성
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push({ date, isCurrentMonth: true });
    }
    return days;
  };
  
  // 해당 날짜의 아이템 가져오기
  const getItemsForDate = (dateStr) => {
    // 필터 적용
    const filterItem = (item) => {
      const isWork = item.project?.includes('투자') || item.project?.includes('팀') || item.category === 'work';
      if (isWork && !showFilters.work) return false;
      if (!isWork && !showFilters.life) return false;
      return true;
    };
    
    // 일정 (events)
    const dayEvents = (events || []).filter(e => e.date === dateStr && filterItem(e));
    
    // 태스크 (deadline 있는 것)
    const dayTasks = (allTasks || tasks || []).filter(t => {
      if (!t.deadline) return false;
      const taskDate = t.deadline.split('T')[0];
      return taskDate === dateStr && filterItem(t);
    });
    
    // 언제든 해도 되는 일 (deadline 없는 것)
    const anytimeTasks = (allTasks || tasks || []).filter(t => !t.deadline && filterItem(t));
    
    return { events: dayEvents, tasks: dayTasks, anytimeTasks };
  };
  
  // 날짜에 아이템이 있는지 확인 (dot 표시용)
  const hasItemsOnDate = (dateStr) => {
    const { events: e, tasks: t } = getItemsForDate(dateStr);
    return e.length > 0 || t.length > 0;
  };
  
  // 선택된 날짜의 아이템
  const selectedItems = getItemsForDate(selectedDateStr);
  
  // 알프레도 브리핑 생성
  const getBriefing = () => {
    if (viewMode === 'week') {
      // 주간 브리핑
      const weekTasks = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);
        const items = getItemsForDate(formatDate(date));
        weekTasks.push(...items.tasks, ...items.events);
      }
      const taskCount = weekTasks.length;
      const highPriority = weekTasks.filter(t => t.importance === 'high').length;
      
      if (taskCount === 0) {
        return "이번 주는 여유로워요! 미뤄둔 일을 처리하거나 새로운 목표를 세워볼까요? 🌟";
      } else if (highPriority >= 3) {
        return `이번 주 ${taskCount}개의 일정 중 중요한 게 ${highPriority}개나 있어요. 우선순위 잘 정해서 하나씩 해결해봐요! 💪`;
      } else {
        return `이번 주 ${taskCount}개의 일정이 있어요. 차근차근 진행하면 무리 없이 끝낼 수 있을 거예요! 👍`;
      }
    } else {
      // 월간 브리핑
      const monthDays = getMonthDays().filter(d => d.isCurrentMonth);
      let totalTasks = 0;
      let busyDays = 0;
      
      monthDays.forEach(d => {
        const items = getItemsForDate(formatDate(d.date));
        const count = items.tasks.length + items.events.length;
        totalTasks += count;
        if (count >= 3) busyDays++;
      });
      
      if (totalTasks === 0) {
        return "이번 달은 일정이 없네요. 새로운 계획을 세워볼까요? 📝";
      } else if (busyDays >= 5) {
        return `이번 달은 좀 바쁠 것 같아요. 바쁜 날이 ${busyDays}일이나 돼요. 체력 관리도 신경 쓰세요! 🏃`;
      } else {
        return `이번 달 총 ${totalTasks}개의 일정이 있어요. 균형 잡힌 한 달이 될 것 같아요! ✨`;
      }
    }
  };
  
  // 네비게이션
  const goToPrev = () => {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    } else {
      const newStart = new Date(currentWeekStart);
      newStart.setDate(currentWeekStart.getDate() - 7);
      setCurrentWeekStart(newStart);
    }
  };
  
  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    } else {
      const newStart = new Date(currentWeekStart);
      newStart.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(newStart);
    }
  };
  
  const goToToday = () => {
    setSelectedDate(new Date());
    setCurrentMonth(new Date());
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    setCurrentWeekStart(start);
  };
  
  // 스타일
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  const calendarDays = viewMode === 'month' ? getMonthDays() : getWeekDays();
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgColor}`}>
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">캘린더</h1>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-all"
          >
            오늘
          </button>
        </div>
        
        {/* 뷰 모드 토글 */}
        <div className="flex justify-center mb-3">
          <div className="bg-white/20 rounded-full p-1 flex">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                viewMode === 'month' ? 'bg-white text-[#8B7CF7]' : 'text-white/80'
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                viewMode === 'week' ? 'bg-white text-[#8B7CF7]' : 'text-white/80'
              }`}
            >
              주간
            </button>
          </div>
        </div>
        
        {/* 월/주 네비게이션 */}
        <div className="flex items-center justify-between">
          <button onClick={goToPrev} className="p-2 hover:bg-white/20 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-bold text-lg">
              {viewMode === 'month' ? formatMonthYear(currentMonth) : formatWeekRange(currentWeekStart)}
            </p>
          </div>
          <button onClick={goToNext} className="p-2 hover:bg-white/20 rounded-full">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4 pb-32">
        {/* Google Calendar 동기화 상태 */}
        <div className={`${cardBg} rounded-xl p-3 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${googleCalendar.isSignedIn ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className={`text-sm ${textPrimary}`}>
                {googleCalendar.isSignedIn 
                  ? `Google Calendar 연결됨` 
                  : 'Google Calendar 연결 안됨'}
              </span>
              {lastSyncTime && (
                <span className={`text-xs ${textSecondary}`}>
                  · {lastSyncTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 동기화
                </span>
              )}
            </div>
            <button
              onClick={googleCalendar.isSignedIn ? syncFromGoogle : googleCalendar.signIn}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                googleCalendar.isSignedIn 
                  ? 'bg-[#A996FF]/10 text-[#8B7CF7] hover:bg-[#A996FF]/20' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } ${isSyncing ? 'opacity-50' : ''}`}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? '동기화 중...' : googleCalendar.isSignedIn ? '동기화' : '연결'}
            </button>
          </div>
        </div>
        
        {/* 알프레도 브리핑 */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg shrink-0">
              🐧
            </div>
            <div>
              <p className={`text-xs ${textSecondary} mb-1`}>
                {viewMode === 'week' ? '주간 브리핑' : '월간 브리핑'}
              </p>
              <p className={`text-sm ${textPrimary}`}>{getBriefing()}</p>
            </div>
          </div>
        </div>
        
        {/* 필터 토글 */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(f => ({ ...f, work: !f.work }))}
            className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              showFilters.work 
                ? 'bg-gray-1000 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            <Briefcase size={16} />
            <span className="text-sm font-medium">업무</span>
          </button>
          <button
            onClick={() => setShowFilters(f => ({ ...f, life: !f.life }))}
            className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              showFilters.life 
                ? 'bg-[#F5F3FF]0 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            <Heart size={16} />
            <span className="text-sm font-medium">일상</span>
          </button>
        </div>
        
        {/* 달력 그리드 */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((day, i) => (
              <div 
                key={day} 
                className={`text-center text-xs font-medium py-2 ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-gray-500' : textSecondary
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* 날짜 그리드 */}
          <div className={`grid grid-cols-7 gap-1 ${viewMode === 'week' ? '' : ''}`}>
            {calendarDays.map(({ date, isCurrentMonth }, idx) => {
              const dateStr = formatDate(date);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDateStr;
              const hasItems = hasItemsOnDate(dateStr);
              const dayOfWeek = date.getDay();
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] text-white shadow-lg' 
                      : isToday 
                        ? 'bg-gray-100 text-gray-600' 
                        : !isCurrentMonth 
                          ? 'text-gray-300' 
                          : dayOfWeek === 0 
                            ? 'text-red-400 hover:bg-red-50' 
                            : dayOfWeek === 6 
                              ? 'text-gray-500 hover:bg-gray-100' 
                              : `${textPrimary} hover:bg-gray-100`
                  } ${viewMode === 'week' ? 'py-4' : ''}`}
                >
                  <span className={`text-sm font-medium ${viewMode === 'week' ? 'text-lg' : ''}`}>
                    {date.getDate()}
                  </span>
                  {hasItems && !isSelected && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-[#A996FF]' : 'bg-[#A996FF]'}`} />
                    </div>
                  )}
                  {viewMode === 'week' && (
                    <span className={`text-xs mt-1 ${isSelected ? 'text-white/80' : textSecondary}`}>
                      {weekDays[dayOfWeek]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* 선택된 날짜의 일정 */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold ${textPrimary}`}>
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 ({weekDays[selectedDate.getDay()]})
            </h3>
            {selectedDateStr === todayStr && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">오늘</span>
            )}
          </div>
          
          {/* 일정 (Events) */}
          {selectedItems.events.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs ${textSecondary} flex items-center gap-1`}>
                  <Calendar size={12} /> 일정
                </p>
                <button
                  onClick={() => { 
                    setEditingEvent(null); 
                    setShowEventModal(true); 
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#A996FF] transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {selectedItems.events.map((event, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setEditingEvent(event);
                      setShowEventModal(true);
                    }}
                    className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors active:scale-[0.98]"
                  >
                    <div className={`w-1 h-10 rounded-full ${event.fromGoogle ? 'bg-blue-500' : 'bg-[#A996FF]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{event.title}</p>
                      {(event.start && event.start !== '00:00') && (
                        <p className="text-xs text-gray-500">
                          {event.start}{event.end && event.end !== '23:59' ? ` - ${event.end}` : ''}
                        </p>
                      )}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={12} />
                        <span className="truncate max-w-[80px]">{event.location}</span>
                      </div>
                    )}
                    {event.fromGoogle && (
                      <div className="flex-shrink-0 w-5 h-5 bg-white rounded flex items-center justify-center shadow-sm">
                        <span className="text-xs">G</span>
                      </div>
                    )}
                    <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 태스크 (Deadline 있는 것) */}
          {selectedItems.tasks.length > 0 && (
            <div className="mb-4">
              <p className={`text-xs ${textSecondary} mb-2 flex items-center gap-1`}>
                <CheckCircle2 size={12} /> 마감 태스크
              </p>
              <div className="space-y-2">
                {selectedItems.tasks.map((task, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      task.status === 'done' ? 'bg-gray-50' : 'bg-[#F5F3FF]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.status === 'done' 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-[#A996FF]'
                    }`}>
                      {task.status === 'done' && <CheckCircle2 size={14} />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                      {task.project && (
                        <p className="text-xs text-gray-500">{task.project}</p>
                      )}
                    </div>
                    {task.importance === 'high' && task.status !== 'done' && (
                      <span className="text-red-500">!</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 언제든 해도 되는 일 */}
          {selectedDateStr === todayStr && selectedItems.anytimeTasks.length > 0 && (
            <div>
              <p className={`text-xs ${textSecondary} mb-2 flex items-center gap-1`}>
                <Clock size={12} /> 언제든 해도 되는 일
              </p>
              <div className="space-y-2">
                {selectedItems.anytimeTasks.slice(0, 5).map((task, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      task.status === 'done' ? 'bg-gray-50' : 'bg-[#F5F3FF]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.status === 'done' 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-[#A996FF]'
                    }`}>
                      {task.status === 'done' && <CheckCircle2 size={14} />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                    </div>
                  </div>
                ))}
                {selectedItems.anytimeTasks.length > 5 && (
                  <p className={`text-xs ${textSecondary} text-center`}>
                    +{selectedItems.anytimeTasks.length - 5}개 더
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* 아무것도 없을 때 */}
          {selectedItems.events.length === 0 && selectedItems.tasks.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className={textSecondary}>이 날은 일정이 없어요</p>
              <button 
                onClick={() => { 
                  setEditingEvent(null); 
                  setShowEventModal(true); 
                }}
                className="mt-3 text-[#A996FF] text-sm font-medium"
              >
                + 일정 추가하기
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Event Modal */}
      <EventModal 
        isOpen={showEventModal}
        onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
        event={editingEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        googleCalendar={googleCalendar}
      />
    </div>
  );
};

// === Alfredo Feedback Toast (실시간 피드백) ===
const AlfredoFeedback = ({ visible, message, type, icon, darkMode }) => {
  if (!visible) return null;
  
  const bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  
  // 타입별 테두리 색상
  const borderColors = {
    praise: 'border-[#A996FF]',
    celebrate: 'border-yellow-400',
    streak: 'border-orange-400',
    milestone: 'border-green-400',
  };
  
  const borderColor = borderColors[type] || borderColors.praise;
  
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={`${bgColor} ${textColor} px-5 py-3 rounded-2xl shadow-2xl border-2 ${borderColor} flex items-center gap-3`}>
        <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg shrink-0 shadow-md">
          🐧
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
};

// === Alfredo Status Bar (항상 보이는 상태바) ===
const AlfredoStatusBar = ({ 
  completedTasks = 0, 
  totalTasks = 0, 
  currentTask = null,
  nextEvent = null,      // 다음 일정 { title, start, minutesUntil }
  urgentTask = null,     // 마감 임박 태스크 { title, deadline }
  streak = 0,            // 연속 완료 수
  lastActivityMinutes = 0, // 마지막 활동 후 경과 시간 (분)
  mood = null,           // 사용자 무드
  energy = null,         // 사용자 에너지
  // Phase 2: 시간 트래킹 정보
  taskElapsedMinutes = 0,    // 현재 태스크 경과 시간 (분)
  taskEstimatedMinutes = 0,  // 현재 태스크 예상 시간 (분)
  sessionMinutes = 0,        // 연속 작업 시간 (분)
  onOpenChat,
  darkMode = false
}) => {
  const hour = new Date().getHours();
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // 시간 포맷 헬퍼
  const formatTime = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)}분`;
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hrs}시간 ${mins}분` : `${hrs}시간`;
  };
  
  // 메시지 풀 (같은 상황에서 랜덤하게 선택)
  const messagePools = {
    celebrate: [
      "오늘 할 일 끝! 고생했어요 🎉",
      "완벽해요! 오늘 정말 잘했어요 ✨",
      "다 끝났네요! 이제 푹 쉬어요 🌟",
    ],
    working: (task) => [
      `"${task}" 응원 중!`,
      `"${task}" 같이 보고 있어요 👀`,
      `"${task}" 파이팅! 💪`,
    ],
    // Phase 2: 작업 시간 트래킹 메시지
    workingWithTime: (task, elapsed) => [
      `"${task}" ${formatTime(elapsed)}째 👀`,
      `${formatTime(elapsed)}째 "${task}" 진행 중!`,
      `"${task}" 열심히 하는 중 (${formatTime(elapsed)})`,
    ],
    // Phase 2: 예상 시간 초과 메시지 (부드러운 톤)
    overtime: (task, estimated, elapsed) => [
      `"${task}" ${formatTime(estimated)} 예상인데 ${formatTime(elapsed)} 됐어요. 괜찮아요, 천천히!`,
      `${formatTime(elapsed)}째예요. 계속해도 되고, 쉬어도 괜찮아요.`,
      `열심히 하고 있네요! ${formatTime(elapsed)} 지났어요.`,
    ],
    // Phase 2: 다음 일정 10분 전 (긴급)
    eventVeryClose: (event, mins) => [
      `⚠️ "${event}" ${mins}분 뒤! 준비하세요!`,
      `곧 "${event}"! 마무리하고 이동할 시간이에요.`,
      `"${event}" ${mins}분 전이에요! 🔔`,
    ],
    // Phase 2: 연속 작업 휴식 권유
    needBreak: (sessionMins) => [
      `${formatTime(sessionMins)}째 작업 중! 물 한 잔 어때요? ☕`,
      `열심히 하네요! ${formatTime(sessionMins)} 됐어요. 잠깐 쉬어도 괜찮아요.`,
      `${formatTime(sessionMins)} 연속! 스트레칭 한번 해볼까요? 🧘`,
    ],
    almostDone: [
      "거의 다 왔어요! 마지막 스퍼트 💪",
      "조금만 더! 끝이 보여요 🏁",
      "마지막 하나! 할 수 있어요 ✨",
    ],
    progress: (count) => [
      `${count}개 완료! 잘하고 있어요.`,
      `${count}개 끝! 이 페이스 좋아요 👍`,
      `벌써 ${count}개! 순조로워요.`,
    ],
    streak: (count) => [
      `${count}개 연속 완료! 대단해요 🔥`,
      `연속 ${count}개! 흐름 좋아요 💫`,
      `${count}연속! 멈추지 마요 🚀`,
    ],
    nextEventSoon: (event, mins) => [
      `${mins}분 뒤 "${event}" 있어요!`,
      `곧 "${event}"! 준비됐나요?`,
      `"${event}" ${mins}분 전이에요 ⏰`,
    ],
    urgentDeadline: (task) => [
      `"${task}" 마감이 다가와요!`,
      `오늘까지 "${task}" 잊지 마세요!`,
      `"${task}" 오늘 마감! 🔔`,
    ],
    longBreak: [
      "좀 쉬고 있네요. 괜찮아요, 천천히 해요.",
      "휴식도 중요해요. 준비되면 다시 시작해요.",
      "잠깐 쉬어도 괜찮아요. 여기 있을게요.",
    ],
    lowEnergy: [
      "오늘은 무리하지 말아요. 중요한 것만!",
      "에너지 낮을 땐 쉬운 것부터 해요.",
      "컨디션 안 좋은 날도 있어요. 괜찮아요.",
    ],
    morningStart: [
      "좋은 아침! 첫 번째 할 일부터 시작해볼까요?",
      "새로운 하루예요! 뭐부터 할까요?",
      "아침이에요! 오늘도 함께해요 ☀️",
    ],
    afternoonStart: [
      "아직 시작 전이에요. 가벼운 것부터 해볼까요?",
      "오후인데 아직 시작 안 했네요. 괜찮아요!",
      "지금 시작해도 충분해요. 같이 해요!",
    ],
    eveningStart: [
      "저녁이에요. 오늘 못 한 건 내일로 미뤄도 괜찮아요.",
      "오늘 바쁜 하루였나요? 내일 하면 돼요.",
      "저녁이네요. 꼭 필요한 것만 해요.",
    ],
    morningDefault: [
      "좋은 아침이에요! 오늘도 함께해요.",
      "상쾌한 아침! 좋은 하루 될 거예요.",
      "오늘 하루도 파이팅! ☀️",
    ],
    afternoonDefault: [
      "오후도 파이팅! 옆에 있을게요.",
      "오후예요. 잘하고 있어요!",
      "점심 먹었어요? 오후도 화이팅!",
    ],
    eveningDefault: [
      "저녁이에요. 오늘 하루 어땠어요?",
      "하루 마무리 시간이에요.",
      "저녁이네요. 수고했어요!",
    ],
    nightDefault: [
      "늦은 시간이네요. 푹 쉬어요!",
      "오늘도 고생했어요. 굿나잇! 🌙",
      "이제 쉴 시간이에요. 내일 봐요!",
    ],
  };
  
  // 랜덤 메시지 선택 (같은 시간대에는 같은 메시지 유지)
  const pickMessage = (pool) => {
    if (Array.isArray(pool)) {
      // 시간 기반 인덱스로 같은 시간대에 같은 메시지 유지
      const index = Math.floor(Date.now() / (1000 * 60 * 5)) % pool.length; // 5분마다 변경
      return pool[index];
    }
    return pool;
  };
  
  // 상황별 메시지 생성 (우선순위 순)
  const getMessage = () => {
    // 1. 모든 태스크 완료 🎉
    if (completedTasks === totalTasks && totalTasks > 0) {
      return { text: pickMessage(messagePools.celebrate), mood: "celebrate", icon: "🎉" };
    }
    
    // 2. 다음 일정 10분 이내 (긴급!) ⚠️
    if (nextEvent && nextEvent.minutesUntil <= 10) {
      const msgs = messagePools.eventVeryClose(nextEvent.title, nextEvent.minutesUntil);
      return { text: pickMessage(msgs), mood: "urgent", icon: "⚠️" };
    }
    
    // 3. 다음 일정 30분 이내 ⏰
    if (nextEvent && nextEvent.minutesUntil <= 30) {
      const msgs = messagePools.nextEventSoon(nextEvent.title, nextEvent.minutesUntil);
      return { text: pickMessage(msgs), mood: "alert", icon: "⏰" };
    }
    
    // 4. 마감 임박 태스크 🔔
    if (urgentTask) {
      const msgs = messagePools.urgentDeadline(urgentTask.title);
      return { text: pickMessage(msgs), mood: "urgent", icon: "🔔" };
    }
    
    // 5. 연속 작업 2시간 이상 - 휴식 권유 ☕
    if (sessionMinutes >= 120) {
      const msgs = messagePools.needBreak(sessionMinutes);
      return { text: pickMessage(msgs), mood: "break", icon: "☕" };
    }
    
    // 6. 예상 시간 초과 (1.5배 이상) ⏰
    if (currentTask && taskEstimatedMinutes > 0 && taskElapsedMinutes >= taskEstimatedMinutes * 1.5) {
      const msgs = messagePools.overtime(currentTask, taskEstimatedMinutes, taskElapsedMinutes);
      return { text: pickMessage(msgs), mood: "overtime", icon: "⏰" };
    }
    
    // 7. 연속 완료 (3개 이상) 🔥
    if (streak >= 3) {
      const msgs = messagePools.streak(streak);
      return { text: pickMessage(msgs), mood: "streak", icon: "🔥" };
    }
    
    // 8. 현재 작업 중인 태스크 (시간 표시 포함)
    if (currentTask) {
      if (taskElapsedMinutes >= 5) {
        const msgs = messagePools.workingWithTime(currentTask, taskElapsedMinutes);
        return { text: pickMessage(msgs), mood: "working", icon: "💪" };
      }
      const msgs = messagePools.working(currentTask);
      return { text: pickMessage(msgs), mood: "working", icon: "💪" };
    }
    
    // 9. 오래 쉬고 있을 때 (30분 이상)
    if (lastActivityMinutes >= 30 && completedTasks > 0 && completedTasks < totalTasks) {
      return { text: pickMessage(messagePools.longBreak), mood: "rest", icon: "☕" };
    }
    
    // 10. 에너지 낮을 때
    if (energy !== null && energy < 30) {
      return { text: pickMessage(messagePools.lowEnergy), mood: "lowEnergy", icon: "🌿" };
    }
    
    // 11. 거의 완료 (1개 남음)
    if (completedTasks >= totalTasks - 1 && totalTasks > 1) {
      return { text: pickMessage(messagePools.almostDone), mood: "almost", icon: "🏁" };
    }
    
    // 12. 진행 중 (1개 이상 완료)
    if (completedTasks >= 1) {
      const msgs = messagePools.progress(completedTasks);
      return { text: pickMessage(msgs), mood: "progress", icon: "✨" };
    }
    
    // 13. 시작 전 (시간대별)
    if (completedTasks === 0 && totalTasks > 0) {
      if (hour < 12) return { text: pickMessage(messagePools.morningStart), mood: "morning", icon: "☀️" };
      if (hour < 17) return { text: pickMessage(messagePools.afternoonStart), mood: "afternoon", icon: "🌤️" };
      return { text: pickMessage(messagePools.eveningStart), mood: "evening", icon: "🌅" };
    }
    
    // 14. 기본 메시지 (시간대별)
    if (hour < 12) return { text: pickMessage(messagePools.morningDefault), mood: "morning", icon: "☀️" };
    if (hour < 17) return { text: pickMessage(messagePools.afternoonDefault), mood: "afternoon", icon: "🌤️" };
    if (hour < 21) return { text: pickMessage(messagePools.eveningDefault), mood: "evening", icon: "🌅" };
    return { text: pickMessage(messagePools.nightDefault), mood: "night", icon: "🌙" };
  };
  
  const { text: message, icon } = getMessage();
  
  const bgColor = darkMode ? 'bg-gray-800/95' : 'bg-white/95';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-700';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const progressBg = darkMode ? 'bg-gray-700' : 'bg-gray-200';
  
  return (
    <div 
      onClick={onOpenChat}
      className={`fixed bottom-20 left-0 right-0 z-40 ${bgColor} backdrop-blur-xl border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} cursor-pointer hover:bg-opacity-100 transition-all active:scale-[0.99]`}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* 알프레도 아이콘 */}
        <div className="w-9 h-9 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm">
          🐧
        </div>
        
        {/* 메시지 + 진행률 */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${textColor} truncate`}>
            {message}
          </p>
          
          {/* 진행률 바 */}
          {totalTasks > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex-1 h-1.5 ${progressBg} rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className={`text-xs ${subTextColor} shrink-0`}>
                {completedTasks}/{totalTasks}
              </span>
            </div>
          )}
        </div>
        
        {/* 대화 아이콘 */}
        <MessageCircle size={18} className={`${subTextColor} shrink-0`} />
      </div>
    </div>
  );
};

// === Alfredo Floating Bubble (플로팅 말풍선) ===
const AlfredoFloatingBubble = ({ message, subMessage, isVisible, onOpenChat, darkMode, quickReplies }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  
  // 5초 후 자동 축소
  useEffect(() => {
    if (isVisible && isExpanded && !hasBeenSeen) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
        setHasBeenSeen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isExpanded, hasBeenSeen]);
  
  // 메시지 변경 시 다시 펼치기
  useEffect(() => {
    if (message) {
      setIsExpanded(true);
      setHasBeenSeen(false);
    }
  }, [message]);
  
  if (!isVisible || !message) return null;
  
  const bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 채팅 열기 (메시지 + 퀵리플라이 전달)
  const handleOpenChat = () => {
    if (onOpenChat) {
      onOpenChat({
        message,
        subMessage,
        quickReplies: quickReplies || []
      });
    }
  };
  
  return (
    <div className="fixed bottom-44 right-4 z-50 flex flex-col items-end gap-2">
      {/* 말풍선 (펼쳐진 상태) */}
      {isExpanded && (
        <div 
          onClick={handleOpenChat}
          className={`${bgColor} rounded-xl shadow-2xl p-4 max-w-[280px] animate-in slide-in-from-bottom-4 duration-300 border ${darkMode ? 'border-gray-700' : 'border-gray-100'} cursor-pointer hover:shadow-xl transition-shadow`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg shrink-0 shadow-md">
              🐧
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${textColor} leading-relaxed`}>
                {message}
              </p>
              {subMessage && (
                <p className={`text-xs ${subTextColor} mt-1`}>
                  {subMessage}
                </p>
              )}
              <p className={`text-[11px] ${subTextColor} mt-2 flex items-center gap-1`}>
                <MessageCircle size={10} />
                탭해서 대화하기
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className={`${subTextColor} hover:text-gray-700 p-1`}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      
      {/* 축소된 상태에서는 아무것도 표시 안함 (버튼들이 아래에 있으므로) */}
    </div>
  );
};

// === Search Modal ===
const SearchModal = ({ isOpen, onClose, tasks, events, onSelectTask, onSelectEvent }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, tasks, events, life
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const searchResults = () => {
    if (!query.trim()) return { tasks: [], events: [], life: [] };
    
    const q = query.toLowerCase();
    
    const matchedTasks = tasks?.filter(t => 
      t.title?.toLowerCase().includes(q) || 
      t.project?.toLowerCase().includes(q)
    ) || [];
    
    const matchedEvents = events?.filter(e => 
      e.title?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q)
    ) || [];
    
    // Life items (mockLifeReminders)
    const lifeItems = [
      ...mockLifeReminders.todayTop3.filter(i => i.title?.toLowerCase().includes(q)),
      ...mockLifeReminders.upcoming.filter(i => i.title?.toLowerCase().includes(q)),
      ...mockLifeReminders.dontForget.filter(i => i.title?.toLowerCase().includes(q)),
    ];
    
    return { tasks: matchedTasks, events: matchedEvents, life: lifeItems };
  };
  
  const results = searchResults();
  const totalResults = results.tasks.length + results.events.length + results.life.length;
  
  const filters = [
    { value: 'all', label: '전체', count: totalResults },
    { value: 'tasks', label: '태스크', count: results.tasks.length },
    { value: 'events', label: '일정', count: results.events.length },
    { value: 'life', label: '일상', count: results.life.length },
  ];
  
  const filteredResults = () => {
    switch(activeFilter) {
      case 'tasks': return { tasks: results.tasks, events: [], life: [] };
      case 'events': return { tasks: [], events: results.events, life: [] };
      case 'life': return { tasks: [], events: [], life: results.life };
      default: return results;
    }
  };
  
  const displayResults = filteredResults();
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
            <Search size={20} className="text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="태스크, 일정, 메모 검색..."
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-200 rounded-full">
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Filters */}
          {query && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {filters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeFilter === f.value 
                      ? 'bg-[#A996FF] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label} {f.count > 0 && `(${f.count})`}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-4">
          {!query ? (
            <div className="text-center py-8">
              <Search size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">검색어를 입력하세요</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['미팅', '보고서', '프로젝트', '마감'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">검색 결과가 없어요</p>
              <p className="text-gray-300 text-xs mt-1">다른 키워드로 검색해보세요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tasks */}
              {displayResults.tasks.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">태스크</p>
                  <div className="space-y-2">
                    {displayResults.tasks.slice(0, 5).map(task => (
                      <div
                        key={task.id}
                        onClick={() => { onSelectTask?.(task); onClose(); }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-[#F5F3FF] transition-all"
                      >
                        <div className={`w-2 h-8 rounded-full ${
                          task.importance === 'high' ? 'bg-red-400' : 
                          task.importance === 'medium' ? 'bg-gray-400' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{task.title}</p>
                          <p className="text-xs text-gray-400">{task.project} · {task.deadline || '마감 없음'}</p>
                        </div>
                        {task.status === 'done' && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded">완료</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Events */}
              {displayResults.events.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">일정</p>
                  <div className="space-y-2">
                    {displayResults.events.slice(0, 5).map(event => (
                      <div
                        key={event.id}
                        onClick={() => { onSelectEvent?.(event); onClose(); }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all"
                      >
                        <div className={`w-2 h-8 rounded-full ${event.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{event.title}</p>
                          <p className="text-xs text-gray-400">{event.start} - {event.end} · {event.location || '장소 미정'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Life */}
              {displayResults.life.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">일상</p>
                  <div className="space-y-2">
                    {displayResults.life.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.date || item.note || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {query && totalResults > 0 ? `${totalResults}개 결과` : '⌘K로 열기'}
          </span>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            ESC로 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

// === Inbox Page ===
const InboxPage = ({ inbox, onConvertToTask }) => {
  const [filter, setFilter] = useState('all'); // all, urgent
  const [expandedId, setExpandedId] = useState(null);
  
  const sorted = [...inbox].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
  const items = filter === 'urgent' ? sorted.filter(i => i.urgent) : sorted;
  const urgentCount = inbox.filter(i => i.urgent).length;
  
  const getSourceIcon = (source) => {
    const icons = {
      gmail: '📧',
      slack: '💬',
      drive: '📁',
      notion: '📝',
    };
    return icons[source] || '📨';
  };
  
  const getSourceColor = (source) => {
    const colors = {
      gmail: 'bg-red-50 text-red-500',
      slack: 'bg-[#F5F3FF] text-[#F5F3FF]0',
      drive: 'bg-gray-100 text-gray-600',
      notion: 'bg-gray-100 text-gray-600',
    };
    return colors[source] || 'bg-gray-50 text-gray-500';
  };
  
  return (
    <div className="flex-1 overflow-y-auto bg-[#F0EBFF]">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">인박스 📥</h1>
          <span className="text-sm text-gray-500">{inbox.length}개 항목</span>
        </div>
      </div>
      
      {/* Filter */}
      <div className="px-4 mb-4">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setFilter('all')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${filter === 'all' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
          >
            전체
          </button>
          <button 
            onClick={() => setFilter('urgent')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${filter === 'urgent' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
          >
            긴급 
            {urgentCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] px-1.5 py-0.5 rounded-full">{urgentCount}</span>
            )}
          </button>
        </div>
      </div>
      
      {/* Inbox List */}
      <div className="px-4 pb-32 space-y-3">
        {items.map(item => (
          <div key={item.id}>
            <div 
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className={`p-4 rounded-xl transition-all cursor-pointer relative overflow-hidden ${
                expandedId === item.id 
                  ? 'bg-white ring-2 ring-[#A996FF]/20 shadow-md' 
                  : 'bg-white/70 border border-white/50 hover:bg-white'
              }`}
            >
              {/* 긴급 표시 바 */}
              {item.urgent && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
              )}
              
              <div className="flex items-start gap-3 pl-2">
                {/* 아바타/아이콘 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                  item.type === 'file' ? 'bg-gray-100' : 'bg-[#F5F3FF]'
                }`}>
                  {item.type === 'file' 
                    ? (item.fileType === 'audio' ? '🎙️' : item.fileType === 'pdf' ? '📄' : '📁')
                    : item.from[0]
                  }
                </div>
                
                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{item.from}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded ${getSourceColor(item.source)}`}>
                      {getSourceIcon(item.source)} {item.source}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-700 text-sm mb-1 truncate">{item.subject}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{item.preview}</p>
                </div>
                
                {/* 시간 & 상태 */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[11px] text-gray-400">{item.time}</span>
                  {item.needReplyToday && (
                    <span className="flex items-center gap-0.5 text-[11px] text-red-500 font-medium">
                      <AlertCircle size={10} /> 오늘 회신
                    </span>
                  )}
                </div>
              </div>
              
              {/* 확장 영역 - Task로 전환 */}
              {expandedId === item.id && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onConvertToTask(item);
                      setExpandedId(null);
                    }}
                    className="flex-1 py-2.5 bg-[#A996FF] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#A996FF]/20 active:scale-95 transition-transform"
                  >
                    <CheckCircle2 size={16} /> Task로 전환
                  </button>
                  <button className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">
                    Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">📭</span>
            <p className="text-gray-500 mt-2">
              {filter === 'urgent' ? '긴급한 항목이 없어요!' : '인박스가 비어있어요'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// === Life Detail Modal ===
const LifeDetailModal = ({ item, type, onClose, onSave, onDelete, medications, onTakeMed }) => {
  const isNew = !item;
  const [editMode, setEditMode] = useState(isNew);
  const [editData, setEditData] = useState(item || getDefaultData(type));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // 타입별 기본 데이터
  function getDefaultData(t) {
    switch(t) {
      case 'medication':
        return { name: '', icon: '💊', time: 'morning', scheduledTime: '08:00', note: '', category: 'supplement', critical: false };
      case 'reminder':
        return { title: '', icon: '📌', dDay: 0, note: '', critical: false };
      case 'upcoming':
        return { title: '', icon: '📅', date: '', note: '' };
      case 'dontForget':
        return { title: '', icon: '💡', date: '', amount: '', note: '', critical: false };
      case 'relationship':
        return { name: '', icon: '👤', lastContact: 0, suggestion: '연락해보기' };
      case 'routine':
        return { name: '', icon: '💪', target: 1, current: 0, unit: '회', streak: 0 };
      default:
        return {};
    }
  }
  
  const hour = new Date().getHours();
  const getCurrentTimeSlot = () => {
    if (hour < 10) return 'morning';
    if (hour < 15) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  };
  const currentTimeSlot = getCurrentTimeSlot();
  
  // 아이콘 옵션들
  const iconOptions = {
    medication: ['💊', '💉', '🩹', '🧴', '🌿', '🔬'],
    reminder: ['📌', '⚠️', '💰', '🏠', '👨‍👩‍👧', '📋', '🎯', '🔔'],
    upcoming: ['📅', '🎂', '🎉', '✈️', '🏥', '🎓', '💼', '🍽️'],
    dontForget: ['💡', '💳', '📄', '🔑', '📦', '💸', '🧾', '🏦'],
    relationship: ['👤', '👩', '👨', '👴', '👵', '👶', '🐕', '❤️'],
    routine: ['💪', '🏃', '💧', '📖', '🧘', '🛌', '🥗', '☕'],
  };
  
  const getTypeConfig = () => {
    switch(type) {
      case 'medicationList':
        return { title: '오늘의 복용', icon: '💊', fields: [], color: 'lavender' };
      case 'medication':
        return { title: isNew ? '약/영양제 추가' : '약/영양제', icon: '💊', fields: ['name', 'time', 'scheduledTime', 'note', 'category'], color: 'lavender' };
      case 'reminder':
        return { title: isNew ? '챙길 것 추가' : '챙길 것', icon: '📌', fields: ['title', 'dDay', 'note', 'category'], color: 'lavender' };
      case 'upcoming':
        return { title: isNew ? '일정 추가' : '다가오는 일정', icon: '📅', fields: ['title', 'date', 'note', 'category'], color: 'blue' };
      case 'dontForget':
        return { title: isNew ? '잊지 말 것 추가' : '잊지 말 것', icon: '💡', fields: ['title', 'date', 'amount', 'note'], color: 'lavender' };
      case 'relationship':
        return { title: isNew ? '관계 추가' : '관계 챙기기', icon: '💕', fields: ['name', 'lastContact', 'suggestion'], color: 'lavender' };
      case 'routine':
        return { title: isNew ? '루틴 추가' : '루틴 관리', icon: '🔄', fields: ['name', 'target', 'unit'], color: 'emerald' };
      default:
        return { title: '상세', icon: '📋', fields: [], color: 'gray' };
    }
  };
  
  const config = getTypeConfig();
  
  const timeOptions = [
    { value: 'morning', label: '아침 (07:00-09:00)' },
    { value: 'afternoon', label: '점심 (12:00-14:00)' },
    { value: 'evening', label: '저녁 (18:00-20:00)' },
    { value: 'night', label: '취침 전 (21:00-23:00)' },
  ];
  
  const categoryOptions = {
    medication: [
      { value: 'prescription', label: '처방약' },
      { value: 'supplement', label: '영양제' },
    ],
    reminder: [
      { value: 'money', label: '💰 돈' },
      { value: 'family', label: '👨‍👩‍👧 가족' },
      { value: 'home', label: '🏠 가정' },
      { value: 'admin', label: '📋 행정' },
      { value: 'personal', label: '🎯 개인' },
    ],
  };
  
  const handleSave = () => {
    onSave(editData);
    setEditMode(false);
  };
  
  const handleDelete = () => {
    onDelete(item?.id);
    setShowDeleteConfirm(false);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:w-[420px] max-h-[85vh] bg-white rounded-t-3xl sm:rounded-xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r from-${config.color}-100 to-${config.color}-50 border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item?.icon || config.icon}</span>
              <div>
                <h2 className="font-bold text-gray-800">{editMode ? '수정하기' : config.title}</h2>
                {!editMode && item?.name && <p className="text-sm text-gray-500">{item.name || item.title}</p>}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {type === 'medicationList' ? (
            // 약 목록 모드
            <div className="space-y-4">
              {timeSlots.map(slot => {
                const slotMeds = medications?.filter(m => m.time === slot.key) || [];
                if (slotMeds.length === 0) return null;
                
                const allTaken = slotMeds.every(m => m.taken);
                const isCurrentSlot = currentTimeSlot === slot.key;
                
                return (
                  <div 
                    key={slot.key}
                    className={`rounded-xl p-3 transition-all ${
                      isCurrentSlot && !allTaken 
                        ? 'bg-[#F5F3FF] ring-2 ring-[#C4B5FD]' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{slot.icon}</span>
                        <span className="font-bold text-gray-700">{slot.label}</span>
                        <span className="text-xs text-gray-400">{slot.timeRange}</span>
                      </div>
                      {allTaken && <span className="text-emerald-500 text-sm font-medium">✓ 완료</span>}
                      {isCurrentSlot && !allTaken && (
                        <span className="text-xs px-2 py-0.5 bg-[#DDD6FE] text-[#7C3AED] rounded-full font-semibold">지금</span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {slotMeds.map(med => (
                        <div 
                          key={med.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                            med.taken 
                              ? 'bg-emerald-50' 
                              : med.critical
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-white border border-gray-100'
                          }`}
                        >
                          <button
                            onClick={() => !med.taken && onTakeMed(med.id)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                              med.taken 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-gray-200 hover:bg-[#DDD6FE]'
                            }`}
                          >
                            {med.taken && <span className="text-sm">✓</span>}
                          </button>
                          <span className="text-lg">{med.icon}</span>
                          <div className="flex-1">
                            <p className={`font-medium ${med.taken ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                              {med.name}
                            </p>
                            <p className="text-[11px] text-gray-400">{med.scheduledTime} · {med.note}</p>
                          </div>
                          {med.critical && !med.taken && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">중요</span>
                          )}
                          {med.taken && (
                            <span className="text-xs text-emerald-500">{med.takenAt}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !editMode ? (
            // 상세 보기 모드
            <div className="space-y-4">
              {type === 'medication' && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">복용 시간</span>
                      <span className="font-semibold text-gray-800">{item?.timeLabel} ({item?.scheduledTime})</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">종류</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item?.category === 'prescription' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {item?.category === 'prescription' ? '처방약' : '영양제'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">오늘 복용</span>
                      <span className={`font-semibold ${item?.taken ? 'text-emerald-600' : 'text-[#A996FF]500'}`}>
                        {item?.taken ? `✓ ${item.takenAt}에 복용` : '아직 안 함'}
                      </span>
                    </div>
                  </div>
                  {item?.note && (
                    <div className="bg-[#F5F3FF] rounded-xl p-3">
                      <p className="text-sm text-[#7C6CD6]">💡 {item.note}</p>
                    </div>
                  )}
                  {item?.critical && (
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-sm text-red-600 font-medium">⚠️ 중요한 약입니다. 꼭 챙겨드세요!</p>
                    </div>
                  )}
                </>
              )}
              
              {type === 'reminder' && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">D-Day</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        item?.dDay === 0 ? 'bg-red-500 text-white' : 
                        item?.dDay === 1 ? 'bg-[#A996FF]500 text-white' : 'bg-[#EDE9FE] text-[#7C6CD6]'
                      }`}>
                        {item?.dDay === 0 ? '오늘' : item?.dDay === 1 ? '내일' : `D-${item?.dDay}`}
                      </span>
                    </div>
                    {item?.note && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">메모</span>
                        <span className="text-gray-700">{item.note}</span>
                      </div>
                    )}
                  </div>
                  {item?.critical && (
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-sm text-red-600 font-medium">⚠️ 안 하면 큰일나요!</p>
                    </div>
                  )}
                </>
              )}
              
              {type === 'upcoming' && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">날짜</span>
                    <span className="font-semibold text-gray-800">{item?.date}</span>
                  </div>
                  {item?.note && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">장소/메모</span>
                      <span className="text-gray-700">{item.note}</span>
                    </div>
                  )}
                </div>
              )}
              
              {type === 'dontForget' && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">날짜</span>
                    <span className="font-semibold text-gray-800">{item?.date}</span>
                  </div>
                  {item?.amount && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">금액</span>
                      <span className="font-bold text-gray-800">{item.amount}</span>
                    </div>
                  )}
                  {item?.note && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">메모</span>
                      <span className="text-gray-700">{item.note}</span>
                    </div>
                  )}
                </div>
              )}
              
              {type === 'relationship' && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">마지막 연락</span>
                    <span className="font-semibold text-gray-800">{item?.lastContact}일 전</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">추천 행동</span>
                    <span className="text-[#8B7CF7] font-medium">{item?.suggestion}</span>
                  </div>
                </div>
              )}
              
              {type === 'routine' && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">오늘 진행</span>
                    <span className="font-bold text-gray-800">{item?.current || 0} / {item?.target || 1}{item?.unit || '회'}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(((item?.current || 0) / (item?.target || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">연속 달성</span>
                    <span className="font-medium text-[#A996FF]500">🔥 {item?.streak || 0}일</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 수정 모드
            <div className="space-y-4">
              {/* 아이콘 선택 */}
              {(iconOptions[type] || (type === 'medicationList' && iconOptions['medication'])) && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">아이콘</label>
                  <div className="flex flex-wrap gap-2">
                    {(iconOptions[type] || iconOptions['medication']).map(icon => (
                      <button
                        key={icon}
                        onClick={() => setEditData({...editData, icon})}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                          editData.icon === icon 
                            ? 'bg-[#EDE9FE] ring-2 ring-[#A996FF] scale-110' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 이름/제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {(type === 'medication' || type === 'medicationList') ? '약 이름' : type === 'relationship' ? '이름' : type === 'routine' ? '루틴 이름' : '제목'}
                </label>
                <input
                  type="text"
                  value={editData.name || editData.title || ''}
                  onChange={(e) => setEditData({...editData, [type === 'relationship' || type === 'medication' || type === 'medicationList' || type === 'routine' ? 'name' : 'title']: e.target.value})}
                  placeholder={type === 'routine' ? '예: 물 마시기' : (type === 'medication' || type === 'medicationList') ? '예: 비타민 D' : ''}
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#DDD6FE]"
                />
              </div>
              
              {/* 약 관련 필드 */}
              {(type === 'medication' || type === 'medicationList') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">복용 시간대</label>
                    <select
                      value={editData.time || 'morning'}
                      onChange={(e) => setEditData({...editData, time: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    >
                      {timeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">정확한 시간</label>
                    <input
                      type="time"
                      value={editData.scheduledTime || '08:00'}
                      onChange={(e) => setEditData({...editData, scheduledTime: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">종류</label>
                    <div className="flex gap-2">
                      {categoryOptions.medication.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setEditData({...editData, category: opt.value})}
                          className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all ${
                            editData.category === opt.value 
                              ? 'bg-[#EDE9FE] text-[#7C3AED] ring-2 ring-[#C4B5FD]' 
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* 챙길 것 (reminder) - D-Day */}
              {type === 'reminder' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">D-Day (며칠 후)</label>
                  <input
                    type="number"
                    min="0"
                    value={editData.dDay || 0}
                    onChange={(e) => setEditData({...editData, dDay: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-50 rounded-xl border-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">0 = 오늘, 1 = 내일</p>
                </div>
              )}
              
              {/* 다가오는 일정 (upcoming) - 날짜 */}
              {type === 'upcoming' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">날짜</label>
                  <input
                    type="text"
                    value={editData.date || ''}
                    onChange={(e) => setEditData({...editData, date: e.target.value})}
                    placeholder="예: 12/25 (수)"
                    className="w-full p-3 bg-gray-50 rounded-xl border-none"
                  />
                </div>
              )}
              
              {/* 잊지 말 것 (dontForget) - 날짜, 금액 */}
              {type === 'dontForget' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">날짜</label>
                    <input
                      type="text"
                      value={editData.date || ''}
                      onChange={(e) => setEditData({...editData, date: e.target.value})}
                      placeholder="예: 매월 25일"
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">금액 (선택)</label>
                    <input
                      type="text"
                      value={editData.amount || ''}
                      onChange={(e) => setEditData({...editData, amount: e.target.value})}
                      placeholder="예: 50,000원"
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="critical"
                      checked={editData.critical || false}
                      onChange={(e) => setEditData({...editData, critical: e.target.checked})}
                      className="w-5 h-5 rounded text-red-500"
                    />
                    <label htmlFor="critical" className="text-sm text-gray-600">⚠️ 중요 (안 하면 큰일)</label>
                  </div>
                </>
              )}
              
              {/* 관계 (relationship) - 마지막 연락, 추천 행동 */}
              {type === 'relationship' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">마지막 연락 (며칠 전)</label>
                    <input
                      type="number"
                      min="0"
                      value={editData.lastContact || 0}
                      onChange={(e) => setEditData({...editData, lastContact: parseInt(e.target.value) || 0})}
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">추천 행동</label>
                    <select
                      value={editData.suggestion || '연락해보기'}
                      onChange={(e) => setEditData({...editData, suggestion: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    >
                      <option value="연락해보기">연락해보기</option>
                      <option value="밥 한번!">밥 한번!</option>
                      <option value="안부 전해요">안부 전해요</option>
                      <option value="선물하기">선물하기</option>
                    </select>
                  </div>
                </>
              )}
              
              {/* 루틴 (routine) - 목표, 단위 */}
              {type === 'routine' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">목표</label>
                      <input
                        type="number"
                        min="1"
                        value={editData.target || 1}
                        onChange={(e) => setEditData({...editData, target: parseInt(e.target.value) || 1})}
                        className="w-full p-3 bg-gray-50 rounded-xl border-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">단위</label>
                      <select
                        value={editData.unit || '회'}
                        onChange={(e) => setEditData({...editData, unit: e.target.value})}
                        className="w-full p-3 bg-gray-50 rounded-xl border-none"
                      >
                        <option value="회">회</option>
                        <option value="잔">잔</option>
                        <option value="분">분</option>
                        <option value="페이지">페이지</option>
                        <option value="km">km</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              
              {/* 메모 (루틴 제외) */}
              {type !== 'routine' && type !== 'relationship' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">메모</label>
                  <textarea
                    value={editData.note || ''}
                    onChange={(e) => setEditData({...editData, note: e.target.value})}
                    placeholder="추가 메모..."
                    className="w-full p-3 bg-gray-50 rounded-xl border-none resize-none h-20"
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6 z-10">
            <div className="bg-white border border-[#E8E3FF] rounded-xl p-6 w-full max-w-[300px] text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">삭제하시겠어요?</h3>
              <p className="text-sm text-gray-500 mb-4">이 작업은 되돌릴 수 없어요.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          {type === 'medicationList' ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditData(getDefaultData('medication'));
                  setEditMode(true);
                }}
                className="flex-1 py-3 bg-[#EDE9FE] text-[#7C6CD6] rounded-xl font-semibold hover:bg-[#DDD6FE] transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} /> 약/영양제 추가
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#A996FF] text-white rounded-xl font-semibold hover:bg-[#8B7CF7] transition-colors"
              >
                닫기
              </button>
            </div>
          ) : !editMode ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditMode(true)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                수정
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-3 px-4 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#F5F3FF]0 text-white rounded-xl font-semibold hover:bg-[#8B7CF7] transition-colors"
              >
                닫기
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-[#F5F3FF]0 text-white rounded-xl font-semibold"
              >
                저장
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// === Life Page ===
const LifePage = ({ mood, setMood, energy, setEnergy, onOpenChat, darkMode = false }) => {
  // localStorage 키
  const LIFE_STORAGE_KEYS = {
    medications: 'lifebutler_medications',
    routines: 'lifebutler_routines',
    lifeTop3: 'lifebutler_lifeTop3',
    upcomingItems: 'lifebutler_upcomingItems',
    dontForgetItems: 'lifebutler_dontForgetItems',
    relationshipItems: 'lifebutler_relationshipItems',
    healthCheck: 'lifebutler_healthCheck',
  };
  
  // 초기값 로드 함수
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };
  
  const [journalText, setJournalText] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [healthCheck, setHealthCheck] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.healthCheck, mockHealthCheck));
  const [medications, setMedications] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.medications, mockMedications));
  
  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  
  // 데이터 상태 (수정 가능하게) - localStorage에서 로드
  const [lifeTop3, setLifeTop3] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.lifeTop3, mockLifeReminders.todayTop3));
  const [upcomingItems, setUpcomingItems] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.upcomingItems, mockLifeReminders.upcoming));
  const [dontForgetItems, setDontForgetItems] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.dontForgetItems, mockLifeReminders.dontForget));
  const [relationshipItems, setRelationshipItems] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.relationshipItems, mockLifeReminders.relationships));
  const [routines, setRoutines] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.routines, mockRoutines));
  
  // 드래그앤드롭 상태
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [customTop3Order, setCustomTop3Order] = useState(null);
  
  // 🐧 알프레도 플로팅 메시지
  const [showAlfredo, setShowAlfredo] = useState(true);
  
  // localStorage 저장 (데이터 변경 시)
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.medications, JSON.stringify(medications)); } catch (e) {}
  }, [medications]);
  
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.routines, JSON.stringify(routines)); } catch (e) {}
  }, [routines]);
  
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.lifeTop3, JSON.stringify(lifeTop3)); } catch (e) {}
  }, [lifeTop3]);
  
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.upcomingItems, JSON.stringify(upcomingItems)); } catch (e) {}
  }, [upcomingItems]);
  
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.dontForgetItems, JSON.stringify(dontForgetItems)); } catch (e) {}
  }, [dontForgetItems]);
  
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.relationshipItems, JSON.stringify(relationshipItems)); } catch (e) {}
  }, [relationshipItems]);
  
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.healthCheck, JSON.stringify(healthCheck)); } catch (e) {}
  }, [healthCheck]);
  
  // 다크모드 스타일
  const bgGradient = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-100';
  
  const hour = new Date().getHours();
  const { todayTop3, upcoming, dontForget, relationships } = mockLifeReminders;
  
  const getAlfredoMessage = () => {
    const checkedCount = checkedItems.length;
    const totalRoutines = routines.length;
    const medicationsDue = medications.filter(m => {
      const [h] = m.time.split(':').map(Number);
      return h <= hour && !m.taken;
    });
    const upcomingBirthdays = relationships.filter(r => r.dDay <= 3);
    
    // 약 복용 시간
    if (medicationsDue.length > 0) {
      return {
        message: `${medicationsDue[0].name} 드실 시간이에요! 💊`,
        subMessage: medicationsDue[0].time + '에 복용',
        quickReplies: [
          { label: '복용했어요 ✓', key: 'took_med' },
          { label: '나중에 먹을게', key: 'later' }
        ]
      };
    }
    
    // 생일/기념일 리마인드
    if (upcomingBirthdays.length > 0) {
      const person = upcomingBirthdays[0];
      if (person.dDay === 0) {
        return {
          message: `오늘 ${person.name} ${person.event}이에요! 🎂`,
          subMessage: '연락하셨나요?',
          quickReplies: [
            { label: '연락했어요!', key: 'contacted' },
            { label: '선물 추천해줘', key: 'gift_idea' }
          ]
        };
      } else {
        return {
          message: `${person.dDay}일 후 ${person.name} ${person.event}!`,
          subMessage: '선물 준비하셨나요?',
          quickReplies: [
            { label: '선물 추천해줘', key: 'gift_idea' },
            { label: '알겠어요', key: 'ok' }
          ]
        };
      }
    }
    
    // 에너지 체크
    if (energy <= 30) {
      return {
        message: '에너지가 많이 낮으시네요 😴',
        subMessage: '잠깐 쉬거나 가벼운 산책 어때요?',
        quickReplies: [
          { label: '쉴게요', key: 'rest' },
          { label: '그래도 할 일 있어', key: 'continue' }
        ]
      };
    }
    
    // 루틴 진행률
    if (checkedCount === 0 && hour >= 12) {
      return {
        message: '오늘 아직 루틴을 시작 안 하셨네요.',
        subMessage: '작은 것부터 하나 해볼까요?',
        quickReplies: [
          { label: '시작할게요', key: 'start' },
          { label: '오늘은 쉴래요', key: 'skip' }
        ]
      };
    }
    
    if (checkedCount >= totalRoutines) {
      return {
        message: '오늘 루틴 완벽! 👏',
        subMessage: '자기 관리 정말 잘하고 계세요.',
        quickReplies: [
          { label: '고마워요 🐧', key: 'thanks' }
        ]
      };
    }
    
    // 균형 메시지
    return {
      message: '오늘 하루도 나를 위한 시간 가져요.',
      subMessage: `${totalRoutines - checkedCount}개 루틴이 남았어요.`,
      quickReplies: [
        { label: '루틴 시작할게', key: 'start' },
        { label: '뭐부터 할까?', key: 'recommend' }
      ]
    };
  };
  
  const alfredoMsg = getAlfredoMessage();
  
  // 드래그 핸들러 (오늘 꼭 챙길 것)
  const handleDragStart = (e, item, index) => {
    setDraggedItem({ item, index });
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };
  
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverIndex(null);
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };
  
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.index === targetIndex) return;
    
    const newOrder = [...lifeTop3];
    const [removed] = newOrder.splice(draggedItem.index, 1);
    newOrder.splice(targetIndex, 0, removed);
    
    setLifeTop3(newOrder);
    setCustomTop3Order(newOrder.map(t => t.id));
    setDraggedItem(null);
    setDragOverIndex(null);
  };
  
  // 현재 시간대 계산
  const getCurrentTimeSlot = () => {
    if (hour < 10) return 'morning';
    if (hour < 15) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  };
  const currentTimeSlot = getCurrentTimeSlot();
  
  // 현재 시간대에 복용해야 할 약
  const currentMeds = medications.filter(m => m.time === currentTimeSlot);
  const pendingMeds = currentMeds.filter(m => !m.taken);
  const allMedsTaken = currentMeds.length > 0 && pendingMeds.length === 0;
  
  // 오늘 전체 복용 현황
  const totalMeds = medications.length;
  const takenMeds = medications.filter(m => m.taken).length;
  
  // 오늘 챙길 것 개수
  const criticalCount = todayTop3.filter(t => t.critical || t.dDay <= 1).length;
  const upcomingCount = upcoming.length;
  
  // 모달 열기
  const openModal = (item, type) => {
    setModalItem(item);
    setModalType(type);
    setModalOpen(true);
  };
  
  // 모달에서 저장
  const handleModalSave = (updatedItem) => {
    switch(modalType) {
      case 'medication':
      case 'medicationList': // medicationList에서 약 추가 시 medication으로 처리
        if (modalItem) {
          setMedications(medications.map(m => m.id === updatedItem.id ? updatedItem : m));
        } else {
          setMedications([...medications, { ...updatedItem, id: `med-${Date.now()}` }]);
        }
        break;
      case 'reminder':
        if (modalItem) {
          setLifeTop3(lifeTop3.map(t => t.id === updatedItem.id ? updatedItem : t));
        } else {
          setLifeTop3([...lifeTop3, { ...updatedItem, id: `lt-${Date.now()}` }]);
        }
        break;
      case 'upcoming':
        if (modalItem) {
          setUpcomingItems(upcomingItems.map(u => u.id === updatedItem.id ? updatedItem : u));
        } else {
          setUpcomingItems([...upcomingItems, { ...updatedItem, id: `up-${Date.now()}` }]);
        }
        break;
      case 'dontForget':
        if (modalItem) {
          setDontForgetItems(dontForgetItems.map(d => d.id === updatedItem.id ? updatedItem : d));
        } else {
          setDontForgetItems([...dontForgetItems, { ...updatedItem, id: `df-${Date.now()}` }]);
        }
        break;
      case 'relationship':
        if (modalItem) {
          setRelationshipItems(relationshipItems.map(r => r.id === updatedItem.id ? updatedItem : r));
        } else {
          setRelationshipItems([...relationshipItems, { ...updatedItem, id: `rel-${Date.now()}` }]);
        }
        break;
      case 'routine':
        if (modalItem) {
          setRoutines(routines.map(r => r.id === updatedItem.id ? updatedItem : r));
        } else {
          setRoutines([...routines, { ...updatedItem, id: `routine-${Date.now()}` }]);
        }
        break;
    }
    setModalOpen(false);
  };
  
  // 모달에서 삭제
  const handleModalDelete = (id) => {
    switch(modalType) {
      case 'medication':
        setMedications(medications.filter(m => m.id !== id));
        break;
      case 'reminder':
        setLifeTop3(lifeTop3.filter(t => t.id !== id));
        break;
      case 'upcoming':
        setUpcomingItems(upcomingItems.filter(u => u.id !== id));
        break;
      case 'dontForget':
        setDontForgetItems(dontForgetItems.filter(d => d.id !== id));
        break;
      case 'relationship':
        setRelationshipItems(relationshipItems.filter(r => r.id !== id));
        break;
      case 'routine':
        setRoutines(routines.filter(r => r.id !== id));
        break;
    }
    setModalOpen(false);
  };
  
  // 약 복용 체크
  const handleTakeMed = (medId) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setMedications(medications.map(m => 
      m.id === medId ? { ...m, taken: true, takenAt: timeStr } : m
    ));
  };
  
  // 풍성한 알프레도 브리핑 생성
  const generateLifeBriefing = () => {
    const lines = [];
    const weather = mockWeather;
    const routines = mockRoutines;
    
    // 1. 시간대별 인사 + 날씨 (가장 먼저 알고 싶은 것)
    if (hour < 12) {
      // 아침
      if (healthCheck.sleep.hours < 6) {
        lines.push(`어젯밤 ${healthCheck.sleep.hours}시간밖에 못 주무셨네요. 오늘은 무리하지 마세요, Boss. 💤`);
      } else {
        lines.push('좋은 아침이에요, Boss! ☀️');
      }
      
      // 날씨 + 옷차림
      if (weather.temp <= 0) {
        lines.push(`\n오늘 **${weather.temp}°C**까지 떨어져요. ${weather.advice} 꼭 챙기시고, 목도리도요. 🧣`);
      } else if (weather.rain) {
        lines.push(`\n오후에 비 온대요. 우산 가방에 넣어두셨죠? ☔`);
      } else if (weather.condition === 'sunny') {
        lines.push(`\n오늘 날씨 좋아요! **${weather.tempHigh}°C**까지 올라가요. 점심에 잠깐 산책 어때요?`);
      }
      
      // 미세먼지
      if (weather.dust === 'bad' || weather.dust === 'veryBad') {
        lines.push(`\n미세먼지 **${weather.dustText}**이에요. 마스크 꼭 챙기세요.`);
      }
      
    } else if (hour < 17) {
      // 오후
      lines.push('오후도 힘내고 계시죠? ☀️');
      
      if (healthCheck.water.current < 4) {
        lines.push(`\n물 ${healthCheck.water.current}잔밖에 안 드셨어요. 지금 한 잔 어때요? 💧`);
      }
      
    } else if (hour < 21) {
      // 저녁
      lines.push('하루 마무리 잘 하고 계시죠? 🌆');
      
      if (weather.temp <= 0) {
        lines.push(`\n밖에 **${weather.temp}°C**예요. 따뜻하게 입고 다니세요.`);
      }
      
    } else {
      // 밤
      lines.push('오늘 하루 수고 많으셨어요, Boss. 🌙');
      
      if (healthCheck.sleep.hours < 7) {
        lines.push(`\n어제 ${healthCheck.sleep.hours}시간 주무셨잖아요. 오늘은 일찍 주무세요.`);
      }
    }
    
    // 2. 약 복용 (중요!)
    if (pendingMeds.length > 0) {
      const criticalMed = pendingMeds.find(m => m.critical);
      if (criticalMed) {
        lines.push(`\n💊 **${criticalMed.name}** 드셨어요? 이건 꼭 챙기셔야 해요.`);
      } else if (pendingMeds.length === 1) {
        lines.push(`\n💊 **${pendingMeds[0].name}** 드실 시간이에요.`);
      } else {
        lines.push(`\n💊 ${currentTimeSlot === 'morning' ? '아침' : currentTimeSlot === 'afternoon' ? '점심' : currentTimeSlot === 'evening' ? '저녁' : '취침 전'} 약 ${pendingMeds.length}개 아직 안 드셨어요.`);
      }
    }
    
    // 3. 긴급한 것 (돈 관련은 특별히 강조)
    const critical = todayTop3.filter(t => t.critical || t.dDay <= 1);
    if (critical.length > 0) {
      const item = critical[0];
      if (item.category === 'money') {
        lines.push(`\n💰 **${item.title}** ${item.dDay === 0 ? '오늘까지예요!' : '내일까지예요!'} ${item.note ? `${item.note}, ` : ''}이건 진짜 중요한 거 아시죠?`);
      } else {
        lines.push(`\n📌 **${item.title}** ${item.dDay === 0 ? '오늘이에요!' : 'D-1이에요!'} ${item.note ? `(${item.note})` : ''}`);
      }
    }
    
    // 4. 루틴 체크 (못 하고 있는 것)
    const missedRoutine = routines.find(r => r.current === 0 && r.lastDone);
    if (missedRoutine) {
      lines.push(`\n🔄 **${missedRoutine.title}** ${missedRoutine.lastDone}부터 안 하셨어요. 오늘은 가볍게라도 어때요?`);
    }
    
    // 5. 관계 챙기기
    const needContact = relationships.filter(r => r.lastContact >= 7);
    if (needContact.length > 0) {
      const person = needContact[0];
      if (person.lastContact >= 14) {
        lines.push(`\n💕 **${person.name}**${person.name.endsWith('님') ? '' : '님'}께 연락한 지 ${person.lastContact}일이나 됐어요. 오늘 잠깐 ${person.suggestion} 어때요?`);
      } else {
        lines.push(`\n💕 ${person.name}${person.name.endsWith('님') ? '' : '님'}께 ${person.suggestion} 보내는 건 어때요?`);
      }
    }
    
    // 6. 이번 주 일정 미리 알림
    if (upcoming.length > 0) {
      const event = upcoming[0];
      lines.push(`\n📅 ${event.date}에 **${event.title}** 있는 거 기억하시죠? ${event.note ? `${event.note}요.` : ''}`);
    }
    
    // 7. 컨디션 기반 조언
    if (energy < 30) {
      lines.push(`\n😌 에너지가 많이 낮아 보여요. 오늘은 급한 것만 하고 쉬세요. 괜찮아요.`);
    } else if (energy < 50) {
      lines.push(`\n😊 컨디션이 보통이네요. 가벼운 것부터 하나씩 해봐요.`);
    } else if (energy >= 70 && mood === 'upbeat') {
      lines.push(`\n✨ 오늘 컨디션 좋으시네요! 미뤄둔 거 처리하기 딱 좋아요.`);
    }
    
    // 8. 마무리 - 시간대별로 다르게
    if (hour < 12) {
      lines.push(`\n\n오늘 하루도 Boss답게 보내요! 제가 옆에서 다 챙길게요. 🐧`);
    } else if (hour < 18) {
      lines.push(`\n\n남은 하루도 힘내세요! 필요한 거 있으면 불러주세요. 🐧`);
    } else {
      lines.push(`\n\n오늘도 수고했어요, Boss. 푹 쉬세요. 🐧`);
    }
    
    return lines.join('');
  };
  
  const handleToggleItem = (id) => {
    setCheckedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const handleSaveJournal = () => {
    if (journalText.trim()) {
      setJournalSaved(true);
      setTimeout(() => setJournalSaved(false), 2000);
    }
  };
  
  const getDDayText = (dDay) => {
    if (dDay === 0) return '오늘';
    if (dDay === 1) return '내일';
    return `D-${dDay}`;
  };
  
  const getDDayColor = (dDay, critical) => {
    if (critical || dDay === 0) return 'bg-red-500 text-white';
    if (dDay === 1) return 'bg-[#A996FF]500 text-white';
    if (dDay <= 3) return 'bg-[#EDE9FE] text-[#7C6CD6]';
    return 'bg-gray-100 text-gray-600';
  };
  
  return (
    <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-[#FDF8F3] to-[#F5EDE4]'} transition-colors duration-300`}>
      <div className="p-4 space-y-4 pb-32">
        
        {/* 알프레도 브리핑 */}
        <div className={`${cardBg}/90 backdrop-blur-xl rounded-xl shadow-lg p-5 border ${darkMode ? 'border-gray-700' : 'border-[#EDE9FE]'}`}>
          {/* 헤더: 알프레도 + 날씨 요약 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <AlfredoAvatar size="lg" />
              <div>
                <p className={`font-bold ${textPrimary}`}>알프레도 🐧</p>
                <p className={`text-xs ${darkMode ? 'text-[#A996FF]' : 'text-[#A996FF]'}`}>오늘 챙길 것 {criticalCount}개</p>
              </div>
            </div>
            {/* 날씨 미니 카드 */}
            <div className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-gray-100 to-sky-50'} px-3 py-1.5 rounded-full`}>
              <span className="text-lg">
                {mockWeather.condition === 'sunny' ? '☀️' : 
                 mockWeather.condition === 'cloudy' ? '☁️' : 
                 mockWeather.condition === 'rain' ? '🌧️' : '❄️'}
              </span>
              <span className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>{mockWeather.temp}°</span>
              {mockWeather.dust === 'bad' && <span className="text-[11px] text-red-500 font-medium">먼지😷</span>}
            </div>
          </div>
          
          {/* 브리핑 본문 */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]'} rounded-xl p-4`}>
            <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} leading-relaxed whitespace-pre-line`}>
              {generateLifeBriefing().split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i} className={`${darkMode ? 'text-[#A996FF]' : 'text-[#7C6CD6]'} font-semibold`}>{part}</strong> : part
              )}
            </p>
          </div>
        </div>
        
        {/* 컨디션 & 건강 체크 */}
        <div className={`${cardBg}/80 backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <span className="text-lg">💫</span> 오늘의 컨디션
          </h3>
          
          {/* 에너지 & 기분 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* 에너지 */}
            <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#7C6CD6] font-medium">에너지</span>
                <span className="text-lg font-bold text-[#8B7CF7]">{energy}%</span>
              </div>
              <div className="h-2.5 bg-[#EDE9FE] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all duration-500"
                  style={{ width: `${energy}%` }}
                />
              </div>
              <div className="flex justify-between mt-3">
                {[25, 50, 75, 100].map(val => (
                  <button
                    key={val}
                    onClick={() => setEnergy(val)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                      energy === val 
                        ? 'bg-[#F5F3FF]0 text-white shadow-md scale-110' 
                        : 'bg-white text-[#8B7CF7] hover:bg-[#F5F3FF]'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 기분 */}
            <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] rounded-xl p-4">
              <span className="text-sm text-[#7C3AED] font-medium">기분</span>
              <div className="flex justify-around mt-3">
                {[
                  { key: 'down', emoji: '😔', label: '힘듦' },
                  { key: 'light', emoji: '😊', label: '괜찮음' },
                  { key: 'upbeat', emoji: '😄', label: '좋음' },
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setMood(m.key)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      mood === m.key 
                        ? 'bg-[#EDE9FE] scale-110' 
                        : 'hover:bg-[#F5F3FF]'
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[11px] text-[#8B7CF7]">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* 간단 건강 체크 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <span className="text-xl">💤</span>
              <p className="text-[11px] text-gray-600 font-medium mt-1">{healthCheck.sleep.hours}시간</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-xl">💧</span>
              <p className="text-[11px] text-gray-600 font-medium mt-1">{healthCheck.water.current}/{healthCheck.water.target}잔</p>
              <button 
                onClick={() => setHealthCheck({...healthCheck, water: {...healthCheck.water, current: healthCheck.water.current + 1}})}
                className="text-[11px] text-gray-500 underline"
              >+1잔</button>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <span className="text-xl">🚶</span>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">{(healthCheck.steps.current / 1000).toFixed(1)}k</p>
            </div>
            <button 
              onClick={() => openModal(null, 'medicationList')}
              className={`rounded-xl p-3 text-center transition-all hover:scale-105 ${
                pendingMeds.length > 0 ? 'bg-[#EDE9FE] ring-2 ring-[#C4B5FD]' : 'bg-[#F5F3FF]'
              }`}
            >
              <span className="text-xl">💊</span>
              <p className={`text-[11px] font-medium mt-1 ${pendingMeds.length > 0 ? 'text-[#7C3AED]' : 'text-[#F5F3FF]0'}`}>
                {takenMeds}/{totalMeds}
              </p>
              {pendingMeds.length > 0 && (
                <p className="text-[11px] text-[#8B7CF7] font-semibold">지금!</p>
              )}
            </button>
          </div>
        </div>
        
        {/* 오늘의 Life Top 3 */}
        <div className={`${cardBg}/80 backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
              <span className="text-lg">📌</span> 오늘 꼭 챙길 것
            </h3>
            <div className="flex items-center gap-2">
              {customTop3Order && (
                <button 
                  onClick={() => { setCustomTop3Order(null); setLifeTop3(mockLifeReminders.todayTop3); }}
                  className={`text-[11px] ${darkMode ? 'text-[#A996FF]' : 'text-[#8B7CF7]'} font-medium hover:underline`}
                >
                  순서 초기화
                </button>
              )}
              <button 
                onClick={() => openModal(null, 'reminder')}
                className={`w-7 h-7 ${darkMode ? 'bg-[#A996FF]/30 text-[#A996FF]' : 'bg-[#EDE9FE] text-[#8B7CF7]'} rounded-full flex items-center justify-center text-lg font-bold hover:opacity-80`}
              >
                +
              </button>
            </div>
          </div>
          
          {/* 드래그 안내 */}
          {!customTop3Order && lifeTop3.length > 1 && (
            <p className={`text-[11px] ${textSecondary} mb-2 flex items-center gap-1`}>
              <span>↕️</span> 드래그해서 순서를 바꿀 수 있어요
            </p>
          )}
          
          <div className="space-y-2">
            {lifeTop3.map((item, idx) => (
              <div 
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => openModal(item, 'reminder')}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-grab active:cursor-grabbing ${
                  dragOverIndex === idx && draggedItem?.index !== idx
                    ? `border-2 border-[#A996FF] ${darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]'}`
                    : checkedItems.includes(item.id) 
                      ? `${darkMode ? 'bg-gray-700' : 'bg-gray-50'} opacity-60` 
                      : `${cardBg} shadow-sm border ${borderColor} hover:shadow-md`
                }`}
              >
                {/* 드래그 핸들 */}
                <div className={textSecondary + " cursor-grab active:cursor-grabbing"}>
                  <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
                    <circle cx="3" cy="4" r="1.5"/>
                    <circle cx="9" cy="4" r="1.5"/>
                    <circle cx="3" cy="10" r="1.5"/>
                    <circle cx="9" cy="10" r="1.5"/>
                    <circle cx="3" cy="16" r="1.5"/>
                    <circle cx="9" cy="16" r="1.5"/>
                  </svg>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleToggleItem(item.id); }}
                  className={`${checkedItems.includes(item.id) ? 'text-emerald-500' : 'text-[#A996FF]'}`}
                >
                  {checkedItems.includes(item.id) ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-gray-800 ${checkedItems.includes(item.id) ? 'line-through text-gray-400' : ''}`}>
                    {item.title}
                  </p>
                  {item.note && <p className="text-xs text-gray-400 truncate">{item.note}</p>}
                </div>
                <span className={`text-[11px] px-2 py-1 rounded-full font-bold ${getDDayColor(item.dDay, item.critical)}`}>
                  {getDDayText(item.dDay)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 🔄 오늘의 루틴 */}
        <div className={`${cardBg}/90 backdrop-blur-xl border ${borderColor} rounded-xl shadow-sm p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
              <span className="text-lg">🔄</span> 오늘의 루틴
            </h3>
            <button 
              onClick={() => openModal(null, 'routine')}
              className={`w-7 h-7 ${darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600'} rounded-full flex items-center justify-center text-lg font-bold hover:opacity-80`}
            >
              +
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {routines.map(routine => {
              const completed = routine.current >= routine.target;
              const progress = Math.min((routine.current / routine.target) * 100, 100);
              
              return (
                <div 
                  key={routine.id}
                  onClick={() => openModal(routine, 'routine')}
                  className={`p-3 rounded-xl text-center transition-all cursor-pointer hover:scale-105 ${
                    completed 
                      ? darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50' 
                      : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{routine.icon}</span>
                  <p className={`text-[11px] font-medium mt-1 ${completed ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : textSecondary}`}>
                    {routine.current}/{routine.target}
                  </p>
                  {routine.streak > 0 && (
                    <p className="text-[11px] text-[#A996FF] font-medium">🔥 {routine.streak}일</p>
                  )}
                  {routine.lastDone && !completed && (
                    <p className="text-[11px] text-red-400">{routine.lastDone}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 📅 다가오는 것 (이번 주 + 잊지 말 것 통합) */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#E8E3FF] rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <span className="text-lg">📅</span> 다가오는 것
            </h3>
            <button 
              onClick={() => openModal(null, 'upcoming')}
              className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-lg font-bold hover:bg-gray-200"
            >
              +
            </button>
          </div>
          
          {/* 일정 */}
          <div className="space-y-2 mb-3">
            {upcomingItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => openModal(item, 'upcoming')}
                className="flex items-center gap-3 p-3 bg-gray-100/50 rounded-xl cursor-pointer hover:bg-gray-100/50 transition-all"
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-700">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.note}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
          
          {/* 구분선 */}
          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">💡 잊지 마세요</span>
            <button 
              onClick={() => openModal(null, 'dontForget')}
              className="w-5 h-5 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold hover:bg-gray-300"
            >
              +
            </button>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          
          {/* 잊지 말 것 */}
          <div className="grid grid-cols-2 gap-2">
            {dontForgetItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => openModal(item, 'dontForget')}
                className={`p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${item.critical ? 'bg-red-50 border border-red-100' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                <p className={`text-sm font-medium ${item.critical ? 'text-red-700' : 'text-gray-700'}`}>
                  {item.title}
                </p>
                {item.amount && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.amount}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* 관계 챙기기 */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#E8E3FF] rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <span className="text-lg">💕</span> 연락할 때 됐어요
            </h3>
            <button 
              onClick={() => openModal(null, 'relationship')}
              className="w-7 h-7 bg-[#EDE9FE] text-[#8B7CF7] rounded-full flex items-center justify-center text-lg font-bold hover:bg-[#DDD6FE]"
            >
              +
            </button>
          </div>
          
          <div className="space-y-2">
            {relationshipItems.filter(r => r.lastContact >= 7).map(person => (
              <div 
                key={person.id} 
                onClick={() => openModal(person, 'relationship')}
                className="flex items-center gap-3 p-3 bg-[#F5F3FF]/50 rounded-xl cursor-pointer hover:bg-[#EDE9FE]/50 transition-all"
              >
                <span className="text-2xl">{person.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-700">{person.name}</p>
                  <p className="text-xs text-gray-400">{person.lastContact}일 전 연락</p>
                </div>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 bg-[#EDE9FE] text-[#8B7CF7] rounded-full text-xs font-semibold hover:bg-[#DDD6FE]"
                >
                  {person.suggestion}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* 오늘 하루 기록 */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#E8E3FF] rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-lg">📝</span> 오늘 하루 기록
          </h3>
          
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="오늘 하루는 어땠나요? 감사한 일, 기억하고 싶은 것..."
            className="w-full h-28 p-3 bg-[#F5F3FF]/50 rounded-xl text-sm text-gray-700 placeholder:text-[#C4B5FD] resize-none focus:outline-none focus:ring-2 focus:ring-[#DDD6FE]"
          />
          
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSaveJournal}
              disabled={!journalText.trim()}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                journalText.trim()
                  ? 'bg-[#F5F3FF]0 text-white shadow-md active:scale-95'
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              {journalSaved ? '✓ 저장됨' : '저장하기'}
            </button>
          </div>
        </div>
        
      </div>
      
      {/* Life Detail Modal */}
      {modalOpen && (
        <LifeDetailModal
          item={modalItem}
          type={modalType}
          onClose={() => setModalOpen(false)}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          medications={medications}
          onTakeMed={handleTakeMed}
        />
      )}
      
      {/* 🐧 알프레도 플로팅 */}
      <AlfredoFloatingBubble
        message={alfredoMsg.message}
        subMessage={alfredoMsg.subMessage}
        isVisible={showAlfredo}
        onOpenChat={onOpenChat}
        darkMode={false}
        quickReplies={alfredoMsg.quickReplies}
      />
    </div>
  );
};

// === Work Page ===
const WorkPage = ({ tasks, onToggleTask, onStartFocus, onReflect, inbox, onConvertToTask, onUpdateTask, onDeleteTask, onAddTask, onOpenChat, darkMode = false, events = [], onAddEvent, onUpdateEvent, onDeleteEvent }) => {
  // Google Calendar 훅
  const googleCalendar = useGoogleCalendar();
  
  // localStorage 로드 함수
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };
  
  const [activeTab, setActiveTab] = useState('tasks'); // tasks, history, inbox
  const [filter, setFilter] = useState('all'); // all, todo, done
  const [groupBy, setGroupBy] = useState('none'); // none, project
  const [selectedTask, setSelectedTask] = useState(null);
  const [showReflectModal, setShowReflectModal] = useState(false);
  const [reflectChanges, setReflectChanges] = useState([]);
  const [expandedInboxId, setExpandedInboxId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null); // 프로젝트 필터
  const [projects, setProjects] = useState(() => loadFromStorage('lifebutler_projects', mockProjects));
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // 일정 모달 state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // 새 태스크 추가 모달
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  
  // 드래그앤드롭 state
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [customBig3Order, setCustomBig3Order] = useState(null); // 수동 정렬 시 사용
  
  // 🐧 알프레도 플로팅 메시지
  const [showAlfredo, setShowAlfredo] = useState(true);
  
  // projects localStorage 저장
  useEffect(() => {
    try { localStorage.setItem('lifebutler_projects', JSON.stringify(projects)); } catch (e) {}
  }, [projects]);
  
  // 다크모드 스타일
  const bgGradient = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-100';
  
  const getAlfredoMessage = () => {
    const todoTasks = tasks.filter(t => t.status !== 'done');
    const doneTasks = tasks.filter(t => t.status === 'done');
    const highPriorityTasks = todoTasks.filter(t => t.importance === 'high');
    const overdueCount = todoTasks.filter(t => t.deadline?.includes('D-0') || t.deadline?.includes('오늘')).length;
    const stuckTasks = todoTasks.filter(t => t.priorityChange === 'down');
    
    // 마감 임박
    if (overdueCount > 0) {
      return {
        message: `오늘 마감인 게 ${overdueCount}개 있어요! 🔥`,
        subMessage: '집중 모드로 빠르게 처리해볼까요?',
        quickReplies: [
          { label: '집중 모드 시작', key: 'start_focus' },
          { label: '나중에 할게', key: 'later' }
        ]
      };
    }
    
    // 높은 우선순위 많음
    if (highPriorityTasks.length >= 3) {
      return {
        message: `중요한 일이 ${highPriorityTasks.length}개나 쌓였네요.`,
        subMessage: '하나씩 처리하면 돼요. 어떤 것부터 할까요?',
        quickReplies: [
          { label: '추천해줘', key: 'recommend' },
          { label: '내가 고를게', key: 'choose' }
        ]
      };
    }
    
    // 오래 방치된 태스크
    if (stuckTasks.length > 0) {
      return {
        message: `${stuckTasks[0].title}이 오래 밀리고 있어요.`,
        subMessage: '정말 해야 하는 건가요? 삭제해도 괜찮아요.',
        quickReplies: [
          { label: '지금 할게', key: 'do_now' },
          { label: '삭제할게', key: 'delete' },
          { label: '나중에 할게', key: 'later' }
        ]
      };
    }
    
    // 전부 완료
    if (todoTasks.length === 0 && doneTasks.length > 0) {
      return {
        message: '업무 태스크 다 끝났어요! 🎉',
        subMessage: '새로운 일 추가하거나 쉬어가세요.',
        quickReplies: [
          { label: '새 태스크 추가', key: 'add_task' },
          { label: '오늘은 여기까지!', key: 'done' }
        ]
      };
    }
    
    // 진행 중
    if (todoTasks.length > 0) {
      const completionRate = Math.round((doneTasks.length / tasks.length) * 100);
      return {
        message: `${todoTasks.length}개 남았어요. ${completionRate}% 완료!`,
        subMessage: '이 페이스면 오늘 안에 끝낼 수 있어요 💪',
        quickReplies: [
          { label: '다음 뭐 할까?', key: 'recommend' },
          { label: '집중 모드 시작', key: 'start_focus' }
        ]
      };
    }
    
    return {
      message: '새로운 태스크를 추가해볼까요?',
      subMessage: '할 일을 정리하면 마음이 편해져요.',
      quickReplies: [
        { label: '태스크 추가', key: 'add_task' }
      ]
    };
  };
  
  const alfredoMsg = getAlfredoMessage();
  
  // 드래그 핸들러
  const handleDragStart = (e, task, index) => {
    setDraggedTask({ task, index });
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };
  
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverIndex(null);
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };
  
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.index === targetIndex) return;
    
    // Big3 순서 재정렬
    const big3Tasks = tasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
      .slice(0, 3);
    
    const newOrder = [...big3Tasks];
    const [removed] = newOrder.splice(draggedTask.index, 1);
    newOrder.splice(targetIndex, 0, removed);
    
    setCustomBig3Order(newOrder.map(t => t.id));
    setDraggedTask(null);
    setDragOverIndex(null);
  };
  
  // Big3 태스크 가져오기 (수동 정렬 적용)
  const getBig3Tasks = () => {
    const todoTasks = tasks.filter(t => t.status !== 'done');
    
    if (customBig3Order) {
      // 수동 정렬된 순서 적용
      const orderedTasks = customBig3Order
        .map(id => todoTasks.find(t => t.id === id))
        .filter(Boolean);
      
      // 새로운 태스크가 추가됐을 수 있으니 나머지도 추가
      const remainingTasks = todoTasks
        .filter(t => !customBig3Order.includes(t.id))
        .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
      
      return [...orderedTasks, ...remainingTasks].slice(0, 3);
    }
    
    return todoTasks
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
      .slice(0, 3);
  };
  
  const big3Tasks = getBig3Tasks();
  
  // 프로젝트 저장
  const handleSaveProject = (project) => {
    if (editingProject) {
      setProjects(projects.map(p => p.id === project.id ? project : p));
    } else {
      setProjects([...projects, project]);
    }
    setEditingProject(null);
  };
  
  // 프로젝트 삭제
  const handleDeleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (selectedProject === projects.find(p => p.id === projectId)?.name) {
      setSelectedProject(null);
    }
  };
  
  // 이벤트 저장 (추가/수정) - Google Calendar 연동
  const handleSaveEvent = async (event) => {
    try {
      let googleEventId = event.googleEventId;
      
      // Google Calendar 동기화
      if (event.syncToGoogle && googleCalendar.isSignedIn) {
        const googleEvent = {
          title: event.title,
          date: event.date,
          start: event.start,
          end: event.end,
          location: event.location,
        };
        
        if (editingEvent && googleEventId) {
          // 기존 Google 이벤트 수정
          const result = await googleCalendar.updateEvent(googleEventId, googleEvent);
          googleEventId = result.event?.id || googleEventId;
        } else if (editingEvent && !googleEventId) {
          // 로컬에만 있던 이벤트를 Google에 새로 추가
          const result = await googleCalendar.addEvent(googleEvent);
          googleEventId = result.event?.id;
        } else {
          // 새 이벤트 추가
          const result = await googleCalendar.addEvent(googleEvent);
          googleEventId = result.event?.id;
        }
      } else if (!event.syncToGoogle && editingEvent?.googleEventId) {
        // Google 동기화 해제 시 Google에서 삭제
        try {
          await googleCalendar.deleteEvent(editingEvent.googleEventId);
        } catch (err) {
          console.log('Google event delete skipped:', err);
        }
        googleEventId = null;
      }
      
      const eventWithGoogle = { ...event, googleEventId };
      
      if (editingEvent) {
        onUpdateEvent && onUpdateEvent(editingEvent.id, eventWithGoogle);
      } else {
        onAddEvent && onAddEvent(eventWithGoogle);
      }
    } catch (err) {
      console.error('Google Calendar sync error:', err);
      // 에러가 나도 로컬에는 저장
      if (editingEvent) {
        onUpdateEvent && onUpdateEvent(editingEvent.id, event);
      } else {
        onAddEvent && onAddEvent(event);
      }
    }
    
    setEditingEvent(null);
    setShowEventModal(false);
  };
  
  // 이벤트 삭제 - Google Calendar 연동
  const handleDeleteEventLocal = async (eventId, googleEventId) => {
    try {
      // Google Calendar에서도 삭제
      if (googleEventId && googleCalendar.isSignedIn) {
        await googleCalendar.deleteEvent(googleEventId);
      }
    } catch (err) {
      console.error('Google Calendar delete error:', err);
    }
    
    onDeleteEvent && onDeleteEvent(eventId);
    setShowEventModal(false);
    setEditingEvent(null);
  };
  
  const filteredTasks = tasks.filter(t => {
    // 프로젝트 필터
    if (selectedProject && t.project !== selectedProject) return false;
    // 상태 필터
    if (filter === 'todo') return t.status !== 'done';
    if (filter === 'done') return t.status === 'done';
    return true;
  });
  
  const todoCount = tasks.filter(t => t.status !== 'done').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const completedToday = mockCompletedHistory.today.length;
  const totalFocusTime = mockCompletedHistory.stats.totalFocusTime;
  
  // Reflect 로직 - 우선순위 재계산 시뮬레이션
  const handleReflect = () => {
    const changes = [];
    
    // 고우선순위 과부하 체크
    const highPriorityCount = tasks.filter(t => t.importance === 'high' && t.status !== 'done').length;
    if (highPriorityCount > 2) {
      changes.push("'주간 리포트 작성' 우선순위를 낮췄습니다. (과부하 방지)");
    }
    
    // 새로운 태스크 체크
    const newTasks = tasks.filter(t => t.priorityChange === 'new');
    if (newTasks.length > 0) {
      changes.push(`새로운 업무 ${newTasks.length}건을 우선순위에 반영했습니다.`);
    }
    
    // 마감 임박 체크
    const urgentDeadline = tasks.filter(t => 
      t.status !== 'done' && t.deadline && 
      (t.deadline.includes('오늘') || t.deadline.includes('전'))
    );
    if (urgentDeadline.length > 0) {
      changes.push(`마감 임박 업무 ${urgentDeadline.length}건의 우선순위를 올렸습니다.`);
    }
    
    // 기본 메시지
    if (changes.length === 0) {
      changes.push("오전 집중 시간을 30분 더 확보했습니다.");
    }
    
    setReflectChanges(changes);
    setShowReflectModal(true);
    
    // 부모에게 알림 (실제로는 여기서 우선순위 재계산)
    if (onReflect) onReflect();
  };
  
  // 업무 브리핑 생성
  const hour = new Date().getHours();
  const highPriorityTasks = tasks.filter(t => t.importance === 'high' && t.status !== 'done');
  const urgentDeadlines = tasks.filter(t => t.status !== 'done' && t.deadline && (t.deadline.includes('오늘') || t.deadline.includes('전')));
  const oldInbox = inbox?.filter(i => i.time?.includes('일 전') || i.time?.includes('어제')) || [];
  const todayMeetings = events.filter(e => e.title.includes('미팅') || e.title.includes('회의'));
  
  const generateWorkBriefing = () => {
    const lines = [];
    
    // 1. 시간대별 인사 + 오늘 요약
    if (hour < 12) {
      lines.push(`오늘 할 일 **${todoCount}개**, 미팅 **${todayMeetings.length}개** 있어요.`);
      
      // 제일 급한 거 추천
      if (urgentDeadlines.length > 0) {
        const mostUrgent = urgentDeadlines[0];
        lines.push(`\n🎯 **${mostUrgent.title}** 먼저 하는 게 좋겠어요. ${mostUrgent.deadline}까지예요.`);
      } else if (highPriorityTasks.length > 0) {
        const top = highPriorityTasks[0];
        lines.push(`\n🎯 **${top.title}** 먼저 시작해보는 건 어때요?`);
      }
    } else if (hour < 17) {
      // 오후
      const remaining = tasks.filter(t => t.status !== 'done').length;
      const done = tasks.filter(t => t.status === 'done').length;
      
      if (done > 0) {
        lines.push(`오늘 벌써 **${done}개** 완료! 남은 건 **${remaining}개**예요.`);
      } else {
        lines.push(`아직 시작 전이네요. 가벼운 것부터 하나 해볼까요?`);
      }
      
      // 다음 미팅 체크
      const nextMeeting = events.find(e => {
        const eventHour = parseInt(e.start.split(':')[0]);
        return eventHour > hour;
      });
      if (nextMeeting) {
        const timeDiff = parseInt(nextMeeting.start.split(':')[0]) - hour;
        if (timeDiff <= 1) {
          lines.push(`\n⏰ **${nextMeeting.title}** ${nextMeeting.start}이에요. 준비되셨어요?`);
        }
      }
    } else {
      // 저녁
      const remaining = tasks.filter(t => t.status !== 'done').length;
      if (remaining > 3) {
        lines.push(`오늘 남은 일이 ${remaining}개예요. 급한 것만 하고 내일 하는 것도 괜찮아요.`);
      } else if (remaining > 0) {
        lines.push(`거의 다 했어요! **${remaining}개**만 남았네요. 마무리 화이팅!`);
      } else {
        lines.push(`오늘 할 일 다 끝냈어요! 수고했어요, Boss! 🎉`);
      }
    }
    
    // 2. 과부하 경고
    if (highPriorityTasks.length >= 4) {
      lines.push(`\n⚠️ 고우선순위가 **${highPriorityTasks.length}개**나 돼요. 좀 많은데, 조정할까요?`);
    }
    
    // 3. 답장 안 한 메일
    if (oldInbox.length > 0) {
      lines.push(`\n📧 **${oldInbox.length}개** 메일이 답장 기다리고 있어요.`);
    }
    
    // 4. 에너지 기반 추천 (LIFE와 연동 가정)
    if (hour >= 10 && hour <= 12) {
      lines.push(`\n✨ 지금이 집중하기 좋은 시간이에요!`);
    }
    
    return lines.join('');
  };
  
  // 프로젝트별 그룹핑
  const groupedTasks = groupBy === 'project' 
    ? filteredTasks.reduce((acc, task) => {
        const project = task.project || '기타';
        if (!acc[project]) acc[project] = [];
        acc[project].push(task);
        return acc;
      }, {})
    : { '전체': filteredTasks };
  
  // Inbox 관련
  const urgentInboxCount = inbox?.filter(i => i.urgent).length || 0;
  
  const getSourceIcon = (source) => {
    const icons = { gmail: '📧', slack: '💬', drive: '📁', notion: '📝' };
    return icons[source] || '📨';
  };
  
  const getSourceColor = (source) => {
    const colors = {
      gmail: 'bg-red-50 text-red-500',
      slack: 'bg-[#F5F3FF] text-[#F5F3FF]0',
      drive: 'bg-gray-100 text-gray-600',
      notion: 'bg-gray-100 text-gray-600',
    };
    return colors[source] || 'bg-gray-50 text-gray-500';
  };
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgGradient} transition-colors duration-300`}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${textPrimary}`}>업무 💼</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAddTaskModal(true)}
              className="w-10 h-10 rounded-full bg-[#A996FF] flex items-center justify-center text-white shadow-lg shadow-[#A996FF]/30 active:scale-90 transition-all hover:bg-[#8B7BE8]"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={handleReflect}
              className={`w-10 h-10 rounded-full ${cardBg} flex items-center justify-center text-[#A996FF] shadow-md active:scale-90 transition-all border border-[#A996FF]/20 hover:bg-[#F5F3FF]`}
            >
              <RefreshCw size={18} />
            </button>
            <span className="text-[11px] font-bold text-[#A996FF] bg-[#A996FF]/10 px-2.5 py-1 rounded-full ring-1 ring-[#A996FF]/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#A996FF] rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
        
        {/* Tab: 할 일 | 히스토리 | 인박스 */}
        <div className={`flex ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-1 rounded-xl mt-4`}>
          <button 
            onClick={() => setActiveTab('tasks')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'tasks' ? `${cardBg} shadow-sm ${textPrimary}` : textSecondary}`}
          >
            할 일 ({todoCount})
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'history' ? `${cardBg} shadow-sm ${textPrimary}` : textSecondary}`}
          >
            히스토리 ✓
          </button>
          <button 
            onClick={() => setActiveTab('inbox')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'inbox' ? `${cardBg} shadow-sm ${textPrimary}` : textSecondary}`}
          >
            인박스 
            {urgentInboxCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] px-1.5 py-0.5 rounded-full">{urgentInboxCount}</span>
            )}
          </button>
        </div>
      </div>
      
      {/* 알프레도 업무 브리핑 */}
      <div className="px-4 mb-4">
        <div className={`${cardBg}/90 backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-full flex items-center justify-center text-lg shrink-0">
              🐧
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-bold ${textPrimary} text-sm`}>알프레도</span>
                <span className="text-[11px] px-1.5 py-0.5 bg-[#A996FF]/10 text-[#A996FF] rounded-full">업무</span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                {generateWorkBriefing().split('**').map((part, i) => 
                  i % 2 === 1 ? <strong key={i} className="text-[#A996FF] font-semibold">{part}</strong> : part
                )}
              </p>
            </div>
          </div>
          
          {/* 빠른 액션 버튼 */}
          {urgentDeadlines.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button 
                onClick={() => setSelectedTask(urgentDeadlines[0])}
                className="w-full py-2.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                {urgentDeadlines[0].title} 시작하기
              </button>
            </div>
          )}
          
          {/* LIFE → WORK: 오늘 개인 일정 알림 */}
          {(() => {
            const todayPersonal = mockPersonalSchedule.filter(s => !s.daysFromNow);
            if (todayPersonal.length === 0 || hour >= 18) return null;
            
            const event = todayPersonal[0];
            const [h, m] = event.time.split(':').map(Number);
            const prepTime = event.prepTime || 30;
            const endHour = h - Math.floor(prepTime / 60);
            const endMin = m - (prepTime % 60);
            
            return (
              <div className={`mt-3 pt-3 border-t ${borderColor}`}>
                <div className={`flex items-center gap-2 p-2 ${darkMode ? 'bg-gray-900/30' : 'bg-gray-50'} rounded-lg`}>
                  <span className="text-lg">{event.icon}</span>
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      오늘 {event.time} {event.title}
                    </p>
                    <p className={`text-[11px] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {endHour}:{endMin < 10 ? '0' + endMin : endMin}까지 업무 마무리 추천
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      
      {/* === Tasks Tab === */}
      {activeTab === 'tasks' && (
        <div className="px-4 pb-32 space-y-4">
          
          {/* 🎯 오늘의 Big 3 */}
          <div className={`${cardBg}/90 backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                <span className="text-lg">🎯</span> 오늘의 Big 3
              </h3>
              <div className="flex items-center gap-2">
                {customBig3Order && (
                  <button 
                    onClick={() => setCustomBig3Order(null)}
                    className="text-[11px] text-[#A996FF] font-medium hover:underline"
                  >
                    AI 추천으로 복원
                  </button>
                )}
                <span className={`text-xs ${textSecondary}`}>{highPriorityTasks.length > 3 ? '3' : highPriorityTasks.length}/{todoCount}</span>
              </div>
            </div>
            
            {/* 드래그 안내 */}
            {!customBig3Order && (
              <p className={`text-[11px] ${textSecondary} mb-2 flex items-center gap-1`}>
                <span>↕️</span> 드래그해서 순서를 바꿀 수 있어요
              </p>
            )}
            
            <div className="space-y-2">
              {big3Tasks.map((task, idx) => (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onClick={() => setSelectedTask(task)}
                    className={`flex items-center gap-3 p-3 ${cardBg} rounded-xl border cursor-grab active:cursor-grabbing transition-all active:scale-[0.98] ${
                      dragOverIndex === idx && draggedTask?.index !== idx
                        ? 'border-[#A996FF] border-2 bg-[#F5F3FF]' 
                        : `${borderColor} hover:shadow-md`
                    }`}
                  >
                    {/* 드래그 핸들 */}
                    <div className={`${textSecondary} cursor-grab active:cursor-grabbing`}>
                      <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
                        <circle cx="3" cy="4" r="1.5"/>
                        <circle cx="9" cy="4" r="1.5"/>
                        <circle cx="3" cy="10" r="1.5"/>
                        <circle cx="9" cy="10" r="1.5"/>
                        <circle cx="3" cy="16" r="1.5"/>
                        <circle cx="9" cy="16" r="1.5"/>
                      </svg>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                      className="text-[#A996FF]"
                    >
                      <Circle size={22} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${textPrimary} truncate`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] px-1.5 py-0.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'} rounded`}>
                          {task.project}
                        </span>
                        {task.deadline && (
                          <span className={`text-[11px] ${textSecondary} flex items-center gap-0.5`}>
                            <Clock size={10} />{task.deadline}
                          </span>
                        )}
                        {task.repeat && (
                          <span className={`text-[11px] px-1.5 py-0.5 ${darkMode ? 'bg-[#5B21B6]/50 text-[#C4B5FD]' : 'bg-[#F5F3FF] text-[#F5F3FF]0'} rounded flex items-center gap-0.5`}>
                            <RefreshCw size={8} />{task.repeatLabel}
                          </span>
                        )}
                        {customBig3Order && idx === 0 && (
                          <span className={`text-[11px] px-1.5 py-0.5 ${darkMode ? 'bg-[#A996FF]/30 text-[#C4B5FD]' : 'bg-[#F5F3FF] text-[#8B7CF7]'} rounded`}>
                            수동 1순위
                          </span>
                        )}
                      </div>
                    </div>
                    {task.sparkline && (
                      <Sparkline 
                        data={task.sparkline} 
                        color={task.priorityChange === 'down' ? '#F472B6' : '#A996FF'}
                        width={40}
                        height={16}
                      />
                    )}
                    {task.priorityChange && (
                      <PriorityIndicator change={task.priorityChange} score={task.priorityScore} />
                    )}
                  </div>
                ))}
            </div>
            
            {/* 더보기 버튼 */}
            {todoCount > 3 && (
              <button 
                onClick={() => setActiveTab('all')}
                className="w-full mt-3 py-2 text-sm text-[#A996FF] font-medium hover:bg-[#F5F3FF] rounded-lg transition-all"
              >
                전체 {todoCount}개 보기 →
              </button>
            )}
          </div>
          
          {/* 📅 오늘 일정 */}
          <div className={`${cardBg}/90 backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                <span className="text-lg">📅</span> 오늘 일정
              </h3>
              <button 
                onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
                className="text-xs text-[#A996FF] font-medium flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> 추가
              </button>
            </div>
            
            <div className="space-y-2">
              {events.length === 0 ? (
                <div className={`text-center py-6 ${textSecondary}`}>
                  <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">오늘 일정이 없어요</p>
                  <button 
                    onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
                    className="mt-2 text-xs text-[#A996FF] font-medium hover:underline"
                  >
                    + 일정 추가하기
                  </button>
                </div>
              ) : (
                events.map(event => {
                  const eventHour = parseInt(event.start.split(':')[0]);
                  const isPast = eventHour < hour;
                  const isNow = eventHour === hour;
                  const isSoon = eventHour === hour + 1;
                  
                  return (
                    <div 
                      key={event.id}
                      onClick={() => { setEditingEvent(event); setShowEventModal(true); }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer hover:shadow-md ${
                        isPast 
                          ? darkMode ? 'bg-gray-700/50 opacity-60' : 'bg-gray-50 opacity-60'
                          : isNow 
                            ? 'bg-[#A996FF]/10 ring-2 ring-[#A996FF]/30' 
                            : isSoon 
                              ? darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]'
                              : darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-100'
                      }`}
                    >
                      <div className={`w-1 h-10 rounded-full ${event.color}`}></div>
                      <div className="flex-1">
                        <p className={`font-medium ${isPast ? 'line-through' : ''} ${darkMode ? (isPast ? 'text-gray-500' : 'text-gray-100') : (isPast ? 'text-gray-400' : 'text-gray-800')}`}>
                          {event.title}
                        </p>
                        <div className={`flex items-center gap-2 text-xs ${textSecondary}`}>
                          <span>{event.start} - {event.end}</span>
                          {event.location && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin size={10} />{event.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {isNow && <span className="text-xs px-2 py-1 bg-[#A996FF] text-white rounded-full font-medium">지금</span>}
                      {isSoon && <span className="text-xs px-2 py-1 bg-[#EDE9FE] text-[#7C6CD6] rounded-full font-medium">곧</span>}
                      {isPast && <span className="text-xs text-gray-300">✓</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* ⚠️ 잊지 마세요 */}
          <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-lg">⚠️</span> 잊지 마세요
              {mockWorkReminders.filter(r => r.urgent).length > 0 && (
                <span className="text-[11px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                  {mockWorkReminders.filter(r => r.urgent).length}
                </span>
              )}
            </h3>
            
            <div className="space-y-2">
              {mockWorkReminders.map(item => (
                <div 
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer hover:shadow-sm ${
                    item.urgent ? 'bg-red-50 border border-red-100' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${item.urgent ? 'text-red-700' : 'text-gray-700'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400">{item.detail}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                    item.urgent ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {item.daysAgo}일
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 📊 프로젝트 현황 */}
          <div className={`${cardBg}/90 backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                <span className="text-lg">📊</span> 프로젝트
              </h3>
              <button 
                onClick={() => { setEditingProject(null); setShowProjectModal(true); }}
                className="text-xs text-[#A996FF] font-medium flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> 추가
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {projects.slice(0, 4).map(project => {
                const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
                
                return (
                  <button
                    key={project.id}
                    onClick={() => { setSelectedProject(project.name); setActiveTab('all'); }}
                    onContextMenu={(e) => { e.preventDefault(); setEditingProject(project); setShowProjectModal(true); }}
                    className={`p-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl text-left transition-all group relative`}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingProject(project); setShowProjectModal(true); }}
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-white'} shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <Settings size={12} className={textSecondary} />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{project.icon}</span>
                      <span className={`text-sm font-medium ${textPrimary} truncate`}>{project.name}</span>
                    </div>
                    <div className={`flex items-center justify-between text-xs ${textSecondary}`}>
                      <span>{project.completedTasks}/{project.totalTasks}</span>
                      <span className="font-semibold text-[#A996FF]">{progress}%</span>
                    </div>
                    <div className={`h-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full mt-1.5`}>
                      <div 
                        className="h-full bg-[#A996FF] rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
            
            {projects.length > 4 && (
              <button className="w-full mt-2 py-2 text-xs text-[#A996FF] font-medium hover:underline">
                모든 프로젝트 보기 ({projects.length}개)
              </button>
            )}
          </div>
          
        </div>
      )}
      
      {/* === All Tasks Tab (전체 보기) === */}
      {activeTab === 'all' && (
        <>
          {/* 헤더 */}
          <div className="px-4 mb-4">
            <button 
              onClick={() => { setActiveTab('tasks'); setSelectedProject(null); }}
              className="flex items-center gap-1 text-sm text-[#A996FF] font-medium mb-3"
            >
              <ArrowLeft size={16} /> 돌아가기
            </button>
            
            {/* 프로젝트 필터 */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedProject(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedProject === null ? 'bg-[#A996FF] text-white' : 'bg-white text-gray-600'
                }`}
              >
                전체
              </button>
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.name)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                    selectedProject === project.name ? 'bg-[#A996FF] text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  <span>{project.icon}</span>
                  {project.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* 필터 */}
          <div className="px-4 mb-4">
            <div className="flex gap-2">
              {[
                { key: 'all', label: '전체' },
                { key: 'todo', label: `할 일 (${todoCount})` },
                { key: 'done', label: `완료 (${doneCount})` },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filter === f.key ? 'bg-[#A996FF] text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 태스크 리스트 */}
          <div className="px-4 pb-32 space-y-2">
            {filteredTasks.map(task => (
              <div 
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`p-4 rounded-xl transition-all cursor-pointer active:scale-[0.98] ${
                  task.status === 'done' 
                    ? 'bg-gray-50 border border-gray-100' 
                    : 'bg-white shadow-sm border border-white/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                    className={`transition-colors ${task.status === 'done' ? 'text-emerald-500' : 'text-[#A996FF]'}`}
                  >
                    {task.status === 'done' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[15px] truncate ${
                      task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        {task.project}
                      </span>
                      {task.deadline && (
                        <span className="text-[11px] flex items-center gap-1 text-gray-400">
                          <Clock size={10} />{task.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {task.status !== 'done' && task.sparkline && (
                    <Sparkline 
                      data={task.sparkline} 
                      color={task.priorityChange === 'down' ? '#F472B6' : '#A996FF'}
                      width={40}
                      height={16}
                    />
                  )}
                </div>
              </div>
            ))}
            
            {filteredTasks.length === 0 && (
              <div className="text-center py-12 px-6">
                <div className="w-20 h-20 bg-[#F5F3FF] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">{filter === 'todo' ? '🎉' : '📋'}</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">
                  {filter === 'todo' ? '오늘 할 일 완료!' : filter === 'done' ? '아직 완료한 항목이 없어요' : '태스크가 없어요'}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {filter === 'todo' 
                    ? '멋져요! 이제 쉬거나 새 태스크를 추가해보세요.' 
                    : filter === 'done' 
                      ? '첫 번째 태스크를 완료해보세요!'
                      : '+ 버튼을 눌러 새 태스크를 추가해보세요.'}
                </p>
                {filter !== 'done' && (
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="px-5 py-2.5 bg-[#A996FF] text-white rounded-xl font-semibold hover:bg-[#8B7BE8] transition-all inline-flex items-center gap-2"
                  >
                    <Plus size={18} /> 새 태스크 추가
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* === History Tab === */}
      {activeTab === 'history' && (
        <div className="px-4 pb-32">
          {/* 통계 카드 */}
          <div className="bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl p-5 mb-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={20} />
              <span className="font-bold">이번 주 성과</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{mockCompletedHistory.stats.totalCompleted}</p>
                <p className="text-xs text-white/70">완료</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.floor(mockCompletedHistory.stats.totalFocusTime / 60)}h</p>
                <p className="text-xs text-white/70">집중 시간</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">🔥{mockCompletedHistory.stats.streak}</p>
                <p className="text-xs text-white/70">연속</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
              <span className="text-white/70">가장 생산적인 시간</span>
              <span className="font-semibold">{mockCompletedHistory.stats.mostProductiveTime}</span>
            </div>
          </div>
          
          {/* 🐧 알프레도의 주간 인사이트 */}
          <div className={`${cardBg} rounded-xl p-4 mb-4 shadow-sm border ${borderColor}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-sm">
                🐧
              </div>
              <h3 className={`font-bold ${textPrimary}`}>알프레도의 주간 인사이트</h3>
            </div>
            
            <div className="space-y-3">
              {/* 생산성 패턴 */}
              <div className={`${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'} rounded-xl p-3`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm">📈</span>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>생산성 패턴</p>
                    <p className={`text-xs ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} mt-0.5`}>
                      Boss는 <b>오전 10-12시</b>에 가장 집중이 잘 돼요.
                      이 시간에 어려운 업무를 배치하면 좋아요!
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 요일별 패턴 */}
              <div className={`${darkMode ? 'bg-gray-700/30' : 'bg-gray-100'} rounded-xl p-3`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm">📅</span>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>요일별 패턴</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-0.5`}>
                      <b>수요일</b>에 가장 많이 완료하고 (평균 4개),
                      <b>월요일</b>은 시작이 느린 편이에요.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 프로젝트 진행률 */}
              <div className={`${darkMode ? 'bg-[#5B21B6]/30' : 'bg-[#F5F3FF]'} rounded-xl p-3`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm">🎯</span>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-[#C4B5FD]' : 'text-[#6D28D9]'}`}>프로젝트 현황</p>
                    <p className={`text-xs ${darkMode ? 'text-[#A996FF]' : 'text-[#8B7CF7]'} mt-0.5`}>
                      "투자 유치" 프로젝트 <b>80% 완료!</b>
                      이번 주에 마무리할 수 있을 것 같아요.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 다음 주 제안 */}
              <div className={`${darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]'} rounded-xl p-3`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm">💡</span>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-[#C4B5FD]' : 'text-gray-700'}`}>다음 주 제안</p>
                    <p className={`text-xs ${darkMode ? 'text-[#A996FF]' : 'text-[#8B7CF7]'} mt-0.5`}>
                      • 월요일 오전에 어려운 업무 배치<br/>
                      • 금요일은 리뷰/정리 위주로<br/>
                      • 25분 집중 + 5분 휴식 루틴 추천
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 오늘 완료 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎯</span>
              <h3 className={`font-bold ${textPrimary}`}>오늘 완료</h3>
              <span className={`text-xs px-2 py-0.5 ${darkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-600'} rounded-full font-medium`}>
                {mockCompletedHistory.today.length}개
              </span>
            </div>
            {mockCompletedHistory.today.length > 0 ? (
              <div className="space-y-2">
                {mockCompletedHistory.today.map(item => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 ${cardBg} rounded-xl border ${borderColor}`}>
                    <div className={`w-8 h-8 ${darkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'} rounded-full flex items-center justify-center`}>
                      <CheckCircle2 size={16} className={`${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${textPrimary} truncate`}>{item.title}</p>
                      <p className={`text-xs ${textSecondary}`}>{item.project} · {item.duration}분</p>
                    </div>
                    <span className={`text-xs ${textSecondary}`}>{item.completedAt}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-6 text-center`}>
                <p className={textSecondary}>아직 오늘 완료한 게 없어요</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-300'} mt-1`}>첫 번째 완료를 기다리고 있어요! 💪</p>
              </div>
            )}
          </div>
          
          {/* 어제 완료 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📅</span>
              <h3 className={`font-bold ${textPrimary}`}>어제</h3>
              <span className={`text-xs ${textSecondary}`}>{mockCompletedHistory.yesterday.length}개 완료</span>
            </div>
            <div className="space-y-2">
              {mockCompletedHistory.yesterday.map(item => (
                <div key={item.id} className={`flex items-center gap-3 p-3 ${cardBg}/70 rounded-xl border ${borderColor}`}>
                  <div className={`w-8 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                    <CheckCircle2 size={16} className={textSecondary} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} truncate`}>{item.title}</p>
                    <p className={`text-xs ${textSecondary}`}>{item.project} · {item.duration}분</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 이번 주 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📊</span>
              <h3 className={`font-bold ${textPrimary}`}>이번 주</h3>
              <span className={`text-xs ${textSecondary}`}>{mockCompletedHistory.thisWeek.length}개 완료</span>
            </div>
            <div className="space-y-2">
              {mockCompletedHistory.thisWeek.map(item => (
                <div key={item.id} className={`flex items-center gap-3 p-2.5 ${cardBg}/50 rounded-xl border ${borderColor}`}>
                  <div className={`w-6 h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                    <CheckCircle2 size={12} className={darkMode ? 'text-gray-500' : 'text-gray-300'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${textSecondary} truncate`}>{item.title}</p>
                  </div>
                  <span className={`text-[11px] ${textSecondary}`}>{item.completedAt}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 알프레도 격려 */}
          <div className={`mt-6 ${darkMode ? 'bg-[#A996FF]/20' : 'bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE]'} rounded-xl p-4 flex items-start gap-3`}>
            <div className={`w-10 h-10 ${darkMode ? 'bg-[#A996FF]/30' : 'bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE]'} rounded-full flex items-center justify-center text-lg shrink-0`}>
              🐧
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-[#C4B5FD]' : 'text-gray-700'} font-medium`}>잘하고 계세요, Boss!</p>
              <p className={`text-xs ${darkMode ? 'text-[#A996FF]' : 'text-[#8B7CF7]'} mt-1`}>
                이번 주 평균보다 2개 더 완료하셨어요. {mockCompletedHistory.stats.topProject}에서 특히 성과가 좋네요! ✨
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* === Inbox Tab === */}
      {activeTab === 'inbox' && (
        <div className="px-4 pb-32 space-y-3">
          {inbox && inbox.length > 0 ? inbox.map(item => (
            <div key={item.id}>
              <div 
                onClick={() => setExpandedInboxId(expandedInboxId === item.id ? null : item.id)}
                className={`p-4 rounded-xl transition-all cursor-pointer relative overflow-hidden ${
                  expandedInboxId === item.id 
                    ? `${cardBg} ring-2 ring-[#A996FF]/20 shadow-md` 
                    : `${cardBg}/70 border ${borderColor} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white'}`
                }`}
              >
                {/* 긴급 표시 바 */}
                {item.urgent && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
                )}
                
                <div className="flex items-start gap-3 pl-2">
                  {/* 아바타/아이콘 */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                    item.type === 'file' 
                      ? (darkMode ? 'bg-gray-700/30' : 'bg-gray-100') 
                      : (darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]')
                  }`}>
                    {item.type === 'file' 
                      ? (item.fileType === 'audio' ? '🎙️' : item.fileType === 'pdf' ? '📄' : '📁')
                      : item.from[0]
                    }
                  </div>
                  
                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${textPrimary} text-sm`}>{item.from}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded ${getSourceColor(item.source)}`}>
                        {getSourceIcon(item.source)} {item.source}
                      </span>
                    </div>
                    <h4 className={`font-medium ${textPrimary} text-sm mb-1 truncate`}>{item.subject}</h4>
                    <p className={`text-xs ${textSecondary} line-clamp-1`}>{item.preview}</p>
                  </div>
                  
                  {/* 시간 & 상태 */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[11px] ${textSecondary}`}>{item.time}</span>
                    {item.needReplyToday && (
                      <span className="flex items-center gap-0.5 text-[11px] text-red-500 font-medium">
                        <AlertCircle size={10} /> 오늘 회신
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 확장 영역 - Task로 전환 */}
                {expandedInboxId === item.id && (
                  <div className={`mt-4 pt-3 border-t ${borderColor} flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200`}>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onConvertToTask(item);
                        setExpandedInboxId(null);
                      }}
                      className="flex-1 py-2.5 bg-[#A996FF] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#A996FF]/20 active:scale-95 transition-transform"
                    >
                      <CheckCircle2 size={16} /> Task로 전환
                    </button>
                    <button className={`px-5 py-2.5 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} rounded-xl text-sm font-bold`}>
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <span className="text-4xl">📭</span>
              <p className={textSecondary + " mt-2"}>인박스가 비어있어요</p>
            </div>
          )}
        </div>
      )}
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          onToggle={onToggleTask}
          onStartFocus={onStartFocus}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}
      
      {/* Reflect Modal */}
      <ReflectModal 
        isOpen={showReflectModal}
        onClose={() => setShowReflectModal(false)}
        changes={reflectChanges}
      />
      
      {/* Project Modal */}
      <ProjectModal 
        isOpen={showProjectModal}
        onClose={() => { setShowProjectModal(false); setEditingProject(null); }}
        project={editingProject}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
      />
      
      {/* Event Modal (추가/수정) */}
      <EventModal 
        isOpen={showEventModal}
        onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
        event={editingEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEventLocal}
        googleCalendar={googleCalendar}
      />
      
      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onAdd={onAddTask}
        projects={projects}
      />
      
      {/* 🐧 알프레도 플로팅 */}
      <AlfredoFloatingBubble
        message={alfredoMsg.message}
        subMessage={alfredoMsg.subMessage}
        isVisible={showAlfredo}
        onOpenChat={onOpenChat}
        darkMode={false}
        quickReplies={alfredoMsg.quickReplies}
      />
    </div>
  );
};

// === Alfredo Chat ===
const AlfredoChat = ({ onBack, tasks, events, mood, energy, onAddTask, onToggleTask, onStartFocus, initialMessage }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [contextQuickReplies, setContextQuickReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // AI 응답 로딩
  const messagesEndRef = useRef(null);
  
  const hour = new Date().getHours();
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const todoTasks = tasks.filter(t => t.status !== 'done');
  
  // Claude API 호출 함수
  const callClaudeAPI = async (userMessage, conversationHistory) => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
    const timeStr = today.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    
    // 시스템 프롬프트 - 알프레도 페르소나
    const systemPrompt = `당신은 "알프레도"입니다. 배트맨의 집사 알프레드처럼 사용자(Boss)를 돕는 AI 비서입니다.

## 성격
- 따뜻하고 친근하지만 전문적
- 간결하고 실용적인 조언
- 이모지를 적절히 사용 (과하지 않게)
- 사용자를 "Boss"라고 부름
- 펭귄 마스코트 🐧

## 현재 상황
- 날짜: ${dateStr}
- 시간: ${timeStr}
- 사용자 기분: ${mood === 'upbeat' ? '좋음 😊' : mood === 'light' ? '보통 🙂' : '힘듦 😔'}
- 에너지: ${energy}%

## 오늘의 태스크 (${tasks.length}개)
${todoTasks.length > 0 ? todoTasks.map((t, i) => `${i + 1}. ${t.title} ${t.status === 'done' ? '✅' : '⬜'}`).join('\n') : '- 모든 태스크 완료!'}

완료된 태스크: ${completedCount}개

## 오늘 일정 (${events.length}개)
${events.length > 0 ? events.map(e => `- ${e.start || ''} ${e.title}${e.location ? ` @ ${e.location}` : ''}`).join('\n') : '- 일정 없음'}

## 응답 규칙
1. 한국어로 답변
2. 2-3문장으로 간결하게 (필요시 더 길게)
3. 현재 컨텍스트(태스크, 일정, 에너지)를 활용
4. 실행 가능한 조언 제공
5. 에너지가 낮으면 쉬라고 권유
6. 특수 액션이 필요하면 JSON으로 응답 가능:
   - 태스크 추가: {"action": "add_task", "title": "태스크 제목"}
   - 집중 모드: {"action": "start_focus", "taskIndex": 0}
   
7. 액션 없이 대화만 할 때는 일반 텍스트로 응답`;

    // 대화 히스토리 구성
    const apiMessages = conversationHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    
    // 현재 메시지 추가
    apiMessages.push({ role: 'user', content: userMessage });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt: systemPrompt
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Chat failed');
      }
      
      const responseText = data.text || '죄송해요, 잠시 문제가 생겼어요 😅';
      
      // 액션 파싱 시도
      try {
        if (responseText.includes('{') && responseText.includes('}')) {
          const jsonMatch = responseText.match(/\{[^}]+\}/);
          if (jsonMatch) {
            const actionData = JSON.parse(jsonMatch[0]);
            if (actionData.action) {
              return {
                text: responseText.replace(jsonMatch[0], '').trim() || '알겠어요!',
                action: actionData
              };
            }
          }
        }
      } catch (e) {
        // JSON 파싱 실패 - 일반 텍스트로 처리
      }
      
      return { text: responseText };
    } catch (error) {
      console.error('Claude API Error:', error);
      return { text: '네트워크 오류가 발생했어요. 다시 시도해주세요 🐧' };
    }
  };
  
  // 초기 인사 (initialMessage가 있으면 사용, 없으면 기본)
  useEffect(() => {
    if (initialMessage?.message) {
      // 플로팅 버블에서 온 메시지
      const fullMessage = initialMessage.subMessage 
        ? `${initialMessage.message}\n\n${initialMessage.subMessage}`
        : initialMessage.message;
      
      setMessages([{ id: 1, type: 'alfredo', text: fullMessage }]);
      
      // 버블에서 전달된 퀵리플라이가 있으면 사용
      if (initialMessage.quickReplies?.length > 0) {
        setContextQuickReplies(initialMessage.quickReplies);
      }
    } else {
      // 기본 인사
      const getInitialGreeting = () => {
        let greeting = '';
        
        if (hour < 12) {
          greeting = '좋은 아침이에요, Boss! ☀️';
        } else if (hour < 17) {
          greeting = '오후도 힘내봐요, Boss! 💪';
        } else {
          greeting = '하루 마무리 잘 하고 계시죠? 🌙';
        }
        
        // 컨디션 기반 추가 멘트
        if (energy < 30) {
          greeting += '\n\n에너지가 좀 낮아 보여요. 무리하지 마세요.';
        } else if (completedCount === tasks.length && tasks.length > 0) {
          greeting += '\n\n오늘 할 일 다 끝냈네요! 대단해요 🎉';
        } else if (todoTasks.length > 0) {
          greeting += `\n\n오늘 ${todoTasks.length}개 남았어요. 뭐 도와드릴까요?`;
        }
        
        return greeting;
      };
      
      setMessages([{ id: 1, type: 'alfredo', text: getInitialGreeting() }]);
    }
  }, [initialMessage]);
  
  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 컨텍스트 기반 Quick Replies
  const getQuickReplies = () => {
    // contextQuickReplies가 있고 아직 첫 메시지 상태면 사용
    if (contextQuickReplies.length > 0 && messages.length <= 1) {
      return contextQuickReplies;
    }
    
    const replies = [];
    
    if (todoTasks.length > 0) {
      replies.push({ label: '지금 뭐 하면 좋을까?', key: 'recommend' });
      replies.push({ label: `"${todoTasks[0]?.title}" 시작할래`, key: 'start_first' });
    }
    
    if (events.length > 0) {
      replies.push({ label: '다음 일정 알려줘', key: 'schedule' });
    }
    
    replies.push({ label: '할 일 추가할래', key: 'add_task' });
    replies.push({ label: '오늘 어땠어?', key: 'reflect' });
    
    if (energy < 50) {
      replies.push({ label: '쉬어도 될까?', key: 'rest' });
    }
    
    return replies.slice(0, 4);
  };
  
  // 자연어 이해 (키워드 기반)
  const parseIntent = (text) => {
    const lower = text.toLowerCase();
    
    // 태스크 추가
    if (lower.includes('추가') || lower.includes('할 일') || lower.includes('해야') || lower.includes('등록')) {
      // "XXX 추가해줘" 패턴
      const match = text.match(/['""](.+?)['""]|(.+?)\s*(추가|등록|해야)/);
      if (match) {
        const taskTitle = match[1] || match[2]?.trim();
        if (taskTitle && taskTitle.length > 1) {
          return { intent: 'add_task', data: taskTitle };
        }
      }
      return { intent: 'add_task_prompt' };
    }
    
    // 태스크 완료
    if (lower.includes('완료') || lower.includes('끝냈') || lower.includes('했어') || lower.includes('체크')) {
      return { intent: 'complete_task' };
    }
    
    // 집중 모드
    if (lower.includes('집중') || lower.includes('포커스') || lower.includes('시작')) {
      return { intent: 'focus' };
    }
    
    // 일정 확인
    if (lower.includes('일정') || lower.includes('스케줄') || lower.includes('미팅') || lower.includes('약속')) {
      return { intent: 'schedule' };
    }
    
    // 추천 요청
    if (lower.includes('뭐 하') || lower.includes('추천') || lower.includes('어떤') || lower.includes('도와')) {
      return { intent: 'recommend' };
    }
    
    // 컨디션
    if (lower.includes('컨디션') || lower.includes('기분') || lower.includes('에너지') || lower.includes('피곤')) {
      return { intent: 'condition' };
    }
    
    // 휴식
    if (lower.includes('쉬') || lower.includes('휴식') || lower.includes('지쳤') || lower.includes('힘들')) {
      return { intent: 'rest' };
    }
    
    // 회고
    if (lower.includes('어땠') || lower.includes('정리') || lower.includes('리뷰')) {
      return { intent: 'reflect' };
    }
    
    // 인사
    if (lower.includes('안녕') || lower.includes('하이') || lower.includes('헬로')) {
      return { intent: 'greeting' };
    }
    
    // 감사
    if (lower.includes('고마') || lower.includes('땡큐') || lower.includes('감사')) {
      return { intent: 'thanks' };
    }
    
    return { intent: 'unknown' };
  };
  
  // 응답 생성
  const generateResponse = (intent, data) => {
    const responses = {
      recommend: () => {
        if (todoTasks.length === 0) {
          return { text: '오늘 할 일 다 끝냈어요! 🎉\n푹 쉬거나 내일 준비해도 좋겠어요.' };
        }
        
        let recommendation = '';
        if (energy >= 70) {
          const importantTask = todoTasks.find(t => t.priorityChange === 'up' || t.importance === 'high') || todoTasks[0];
          recommendation = `컨디션 좋을 때 중요한 거 먼저!\n\n👉 "${importantTask.title}"\n\n시작해볼까요?`;
          return { 
            text: recommendation, 
            action: { type: 'start_focus', task: importantTask, label: '집중 시작' }
          };
        } else if (energy >= 40) {
          return { 
            text: `무난한 컨디션이에요. 가볍게 시작해봐요!\n\n👉 "${todoTasks[0].title}"`,
            action: { type: 'start_focus', task: todoTasks[0], label: '시작하기' }
          };
        } else {
          return { 
            text: '에너지가 좀 낮네요. 오늘은 가벼운 것만 해도 괜찮아요.\n\n잠깐 쉬고 올까요? ☕'
          };
        }
      },
      
      start_first: () => {
        if (todoTasks.length > 0) {
          return {
            text: `좋아요! "${todoTasks[0].title}" 시작해볼까요?\n\n25분 집중하고 쉬어요.`,
            action: { type: 'start_focus', task: todoTasks[0], label: '집중 모드 시작' }
          };
        }
        return { text: '할 일이 없어요! 새로 추가해볼까요?' };
      },
      
      schedule: () => {
        if (events.length === 0) {
          return { text: '오늘은 일정이 없어요! 자유롭게 보내세요 ☺️' };
        }
        const nextEvent = events[0];
        let response = `다음 일정이에요:\n\n📅 ${nextEvent.start} - ${nextEvent.title}`;
        if (nextEvent.location) response += `\n📍 ${nextEvent.location}`;
        if (events.length > 1) response += `\n\n그 외 ${events.length - 1}개 일정이 더 있어요.`;
        return { text: response };
      },
      
      add_task: (taskTitle) => {
        return {
          text: `"${taskTitle}" 추가할까요?`,
          action: { type: 'add_task', title: taskTitle, label: '추가하기' }
        };
      },
      
      add_task_prompt: () => {
        return { text: '어떤 할 일을 추가할까요?\n예: "보고서 작성 추가해줘"' };
      },
      
      complete_task: () => {
        if (todoTasks.length > 0) {
          return {
            text: `어떤 걸 완료했어요?\n\n${todoTasks.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`,
          };
        }
        return { text: '이미 다 끝냈네요! 👏' };
      },
      
      focus: () => {
        if (todoTasks.length > 0) {
          return {
            text: `집중 모드 시작할까요?\n\n첫 번째 할 일: "${todoTasks[0].title}"`,
            action: { type: 'start_focus', task: todoTasks[0], label: '25분 집중 시작' }
          };
        }
        return { text: '먼저 할 일을 추가해주세요!' };
      },
      
      condition: () => {
        const moodText = mood === 'upbeat' ? '좋음 😊' : mood === 'light' ? '괜찮음 🙂' : '힘듦 😔';
        let advice = '';
        if (energy < 30) advice = '\n\n좀 쉬어가는 게 좋겠어요.';
        else if (energy < 50) advice = '\n\n가벼운 일부터 해보는 건 어때요?';
        else advice = '\n\n집중하기 좋은 컨디션이에요!';
        
        return { text: `지금 상태:\n\n😊 기분: ${moodText}\n⚡ 에너지: ${energy}%${advice}` };
      },
      
      rest: () => {
        if (energy < 30) {
          return { text: '물론이죠! 오늘은 충분히 했어요.\n\n☕ 커피 한 잔, 또는 10분 눈 감고 쉬어봐요.\n\n내일 더 좋은 컨디션으로 만나요!' };
        }
        return { text: '잠깐 쉬어가는 것도 좋아요! 5분만 눈 감고 쉬어볼까요? 🧘' };
      },
      
      reflect: () => {
        const doneCount = tasks.filter(t => t.status === 'done').length;
        if (doneCount === 0) {
          return { text: '아직 완료한 게 없지만 괜찮아요.\n\n하루가 끝나기 전에 하나만 해봐요!' };
        }
        return { 
          text: `오늘 ${doneCount}개 완료했어요! 👏\n\n${doneCount >= 2 ? '생각보다 많이 했네요! 대단해요.' : '작은 것도 해낸 거예요. 내일 또 화이팅!'}`
        };
      },
      
      greeting: () => {
        const greetings = ['안녕하세요, Boss! 🐧', '반가워요! 오늘 뭐 도와드릴까요?', '하이! 무엇이든 물어보세요 😊'];
        return { text: greetings[Math.floor(Math.random() * greetings.length)] };
      },
      
      thanks: () => {
        const replies = ['천만에요! 언제든 불러주세요 🐧', '도움이 됐다니 기뻐요!', '제가 더 감사하죠, Boss! 💜'];
        return { text: replies[Math.floor(Math.random() * replies.length)] };
      },
      
      unknown: () => {
        return { text: '음, 잘 이해하지 못했어요 😅\n\n아래 버튼을 눌러보시거나, 다시 말씀해주세요!' };
      },
    };
    
    const handler = responses[intent];
    if (handler) {
      return typeof handler === 'function' 
        ? (data ? handler(data) : handler()) 
        : handler;
    }
    return responses.unknown();
  };
  
  // Quick Reply 처리 (Claude API 사용)
  const handleQuickReply = async (reply) => {
    if (isLoading) return;
    
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const loadingId = `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setMessages(prev => [...prev, { id: userId, type: 'user', text: reply.label }]);
    setShowQuickReplies(false);
    setIsLoading(true);
    
    // 로딩 메시지 표시
    setMessages(prev => [...prev, { id: loadingId, type: 'alfredo', text: '...', isLoading: true }]);
    
    try {
      const response = await callClaudeAPI(reply.label, messages.filter(m => !m.isLoading));
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, text: response.text, isLoading: false, action: response.action?.action ? {
              type: response.action.action,
              title: response.action.title,
              task: response.action.taskIndex !== undefined ? todoTasks[response.action.taskIndex] : null,
              label: response.action.action === 'add_task' ? '추가하기' : '집중 시작'
            } : null }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, text: '죄송해요, 잠시 문제가 생겼어요 🐧', isLoading: false }
          : msg
      ));
    }
    
    setIsLoading(false);
    setShowQuickReplies(true);
  };
  
  // 자유 입력 처리 (Claude API 사용)
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input.trim();
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const loadingId = `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setMessages(prev => [...prev, { id: userId, type: 'user', text: userText }]);
    setInput('');
    setShowQuickReplies(false);
    setIsLoading(true);
    
    // 로딩 메시지 표시
    setMessages(prev => [...prev, { id: loadingId, type: 'alfredo', text: '...', isLoading: true }]);
    
    try {
      // Claude API 호출
      const response = await callClaudeAPI(userText, messages.filter(m => !m.isLoading));
      
      // 로딩 메시지를 실제 응답으로 교체
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, text: response.text, isLoading: false, action: response.action?.action ? {
              type: response.action.action,
              title: response.action.title,
              task: response.action.taskIndex !== undefined ? todoTasks[response.action.taskIndex] : null,
              label: response.action.action === 'add_task' ? '추가하기' : '집중 시작'
            } : null }
          : msg
      ));
    } catch (error) {
      // 에러 시 폴백
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, text: '죄송해요, 잠시 문제가 생겼어요. 다시 시도해주세요 🐧', isLoading: false }
          : msg
      ));
    }
    
    setIsLoading(false);
    setShowQuickReplies(true);
  };
  
  // 액션 버튼 처리
  const handleAction = (action) => {
    if (action.type === 'start_focus' && action.task && onStartFocus) {
      onStartFocus(action.task);
    } else if (action.type === 'add_task' && action.title && onAddTask) {
      onAddTask(action.title);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'alfredo', 
        text: `"${action.title}" 추가했어요! ✅\n\n업무 탭에서 확인해보세요.` 
      }]);
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-[#F0EBFF]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-black/5 flex-shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <AlfredoAvatar size="md" />
        <div className="flex-1">
          <h1 className="font-bold text-gray-800 flex items-center gap-1.5">
            알프레도
            <span className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-full font-medium">AI</span>
          </h1>
          <p className="text-xs text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Claude API 연동
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-400">에너지</p>
          <p className="text-sm font-bold text-[#A996FF]">{energy}%</p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          msg.type === 'alfredo' ? (
            <div key={msg.id} className="flex items-start gap-2">
              <AlfredoAvatar size="sm" />
              <div className="flex flex-col gap-2 max-w-[80%]">
                <div className="bg-white rounded-xl rounded-tl-md p-3 shadow-sm">
                  {msg.isLoading ? (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-[#A996FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-[#A996FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-[#A996FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-800 whitespace-pre-line">{msg.text}</p>
                  )}
                </div>
                {msg.action && !msg.isLoading && (
                  <button
                    onClick={() => handleAction(msg.action)}
                    className="self-start px-4 py-2 bg-[#A996FF] text-white text-sm font-bold rounded-xl shadow-md shadow-[#A996FF]/20 active:scale-95 transition-transform flex items-center gap-2"
                  >
                    {msg.action.type === 'start_focus' && <Zap size={14} />}
                    {msg.action.type === 'add_task' && <Plus size={14} />}
                    {msg.action.label}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-end">
              <div className="bg-[#A996FF] text-white rounded-xl rounded-tr-md p-3 shadow-sm max-w-[80%]">
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          )
        ))}
        
        {/* Quick Replies */}
        {showQuickReplies && !isLoading && (
          <div className="flex flex-wrap gap-2 pl-10">
            {getQuickReplies().map(reply => (
              <button 
                key={reply.key}
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-2 bg-white rounded-full text-sm text-[#A996FF] border border-[#E5E0FF] hover:bg-[#F5F3FF] transition-colors shadow-sm"
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-black/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={isLoading ? "알프레도가 생각 중..." : "알프레도에게 말하기..."}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#A996FF]/30 ${isLoading ? 'opacity-50' : ''}`}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !isLoading
                ? 'bg-[#A996FF] text-white shadow-lg shadow-[#A996FF]/30' 
                : 'bg-gray-100 text-gray-300'
            }`}
          >
            {isLoading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// === Do Not Disturb Banner ===
const DoNotDisturbBanner = ({ isActive, remainingTime, onDisable }) => {
  if (!isActive) return null;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <Moon size={14} />
        </div>
        <span className="text-sm font-medium">방해 금지 모드</span>
        {remainingTime && (
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {formatTime(remainingTime)}
          </span>
        )}
      </div>
      <button
        onClick={onDisable}
        className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
      >
        해제
      </button>
    </div>
  );
};

// === Offline Banner ===
const OfflineBanner = ({ isOffline }) => {
  if (!isOffline) return null;
  
  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2">
      <span className="text-lg">📡</span>
      <span className="text-sm font-medium">오프라인 상태예요 - 일부 기능이 제한될 수 있어요</span>
    </div>
  );
};

// === PWA Install Banner ===
const PWAInstallBanner = ({ show, onInstall, onDismiss }) => {
  if (!show) return null;
  
  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 z-50 animate-[slideUp_0.3s_ease-out] border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-2xl shrink-0">
          🐧
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800">Life Butler 설치하기</h3>
          <p className="text-xs text-gray-500">홈 화면에서 바로 실행해요</p>
        </div>
        <button 
          onClick={onDismiss}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onDismiss}
          className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200"
        >
          나중에
        </button>
        <button
          onClick={onInstall}
          className="flex-1 py-2.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl text-sm font-bold hover:opacity-90"
        >
          설치하기
        </button>
      </div>
    </div>
  );
};

// === Do Not Disturb Modal ===
const DoNotDisturbModal = ({ isOpen, onClose, onEnable, currentDuration }) => {
  const [duration, setDuration] = useState(currentDuration || 25);
  
  if (!isOpen) return null;
  
  const durations = [
    { value: 15, label: '15분' },
    { value: 25, label: '25분' },
    { value: 45, label: '45분' },
    { value: 60, label: '1시간' },
    { value: 120, label: '2시간' },
    { value: -1, label: '직접 해제할 때까지' },
  ];
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] p-6 text-white text-center">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-xl flex items-center justify-center text-3xl mb-3">
            🌙
          </div>
          <h2 className="text-xl font-bold">방해 금지 모드</h2>
          <p className="text-white/80 text-sm mt-1">알림 없이 집중하세요</p>
        </div>
        
        {/* 내용 */}
        <div className="p-5">
          <p className="text-sm text-gray-500 mb-4">지속 시간을 선택하세요</p>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            {durations.map(d => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  duration === d.value
                    ? 'bg-[#8B7CF7] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          
          {/* 활성화 시 차단되는 것들 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">활성화 시:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li className="flex items-center gap-2">
                <span className="text-red-400">✕</span> 푸시 알림 차단
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✕</span> 브리핑 알림 차단
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> 긴급 알림은 표시
              </li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                onEnable(duration);
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white font-medium hover:opacity-90 transition-opacity"
            >
              활성화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Widget Gallery & Editor ===
const WidgetGallery = ({ onBack, tasks, events, mood, energy, darkMode }) => {
  const [activeTab, setActiveTab] = useState('gallery'); // gallery, editor, myWidgets
  const [selectedWidget, setSelectedWidget] = useState(null); // 풀스크린 미리보기
  
  // 위젯 에디터 상태
  const [widgetConfig, setWidgetConfig] = useState({
    size: 'medium', // mini, small, medium, lockscreen
    showBig3: true,
    showSchedule: true,
    showEnergy: true,
    showMood: true,
    showAlfredo: true,
    theme: 'lavender', // lavender, dark, mint, coral, sunset
    bgStyle: 'gradient', // gradient, solid, glass
  });
  
  // 저장된 위젯 목록
  const [savedWidgets, setSavedWidgets] = useState([
    { id: 1, name: '기본 위젯', config: { size: 'medium', showBig3: true, showSchedule: true, showEnergy: true, showMood: false, showAlfredo: true, theme: 'lavender', bgStyle: 'gradient' } },
  ]);
  
  const hour = new Date().getHours();
  const now = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  
  // Big3 진행률
  const big3Done = tasks.filter(t => t.status === 'done').length;
  const big3Total = tasks.length;
  
  // 다음 일정
  const getNextEvent = () => {
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    
    for (const event of events) {
      if (event.time) {
        const [h, m] = event.time.split(':').map(Number);
        if (h > currentHour || (h === currentHour && m > currentMin)) {
          const diffMin = (h * 60 + m) - (currentHour * 60 + currentMin);
          const hours = Math.floor(diffMin / 60);
          const mins = diffMin % 60;
          return {
            ...event,
            timeLeft: hours > 0 ? `${hours}시간 ${mins}분 후` : `${mins}분 후`,
            isUrgent: diffMin <= 30
          };
        }
      }
    }
    return null;
  };
  
  const nextEvent = getNextEvent();
  
  // 기분 이모지
  const getMoodEmoji = () => {
    if (mood >= 80) return '😊';
    if (mood >= 60) return '🙂';
    if (mood >= 40) return '😐';
    if (mood >= 20) return '😔';
    return '😢';
  };
  
  // 알프레도 한마디
  const getAlfredoComment = () => {
    if (big3Done === big3Total && big3Total > 0) return '오늘 완벽해요! 🎉';
    if (big3Done >= 2) return '좋은 페이스예요! 💪';
    if (energy < 30) return '쉬어가도 괜찮아요 😴';
    if (hour < 12) return '좋은 아침이에요 ☀️';
    if (hour < 17) return '오후도 힘내요! 💪';
    return '마무리 잘 해요 🌙';
  };
  
  // 테마 색상
  const themes = {
    lavender: { 
      primary: '#A996FF', 
      secondary: '#8B7CF7', 
      bg: 'from-[#A996FF] to-[#8B7CF7]',
      name: '라벤더',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-500'
    },
    dark: { 
      primary: '#374151', 
      secondary: '#1F2937', 
      bg: 'from-gray-700 to-gray-900',
      name: '다크',
      cardBg: 'bg-gray-800',
      textPrimary: 'text-white',
      textSecondary: 'text-gray-400'
    },
    mint: { 
      primary: '#34D399', 
      secondary: '#10B981', 
      bg: 'from-emerald-400 to-emerald-600',
      name: '민트',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-500'
    },
    coral: { 
      primary: '#FB7185', 
      secondary: '#F43F5E', 
      bg: 'from-[#A996FF] to-[#8B7CF7]',
      name: '코랄',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-500'
    },
    sunset: { 
      primary: '#F59E0B', 
      secondary: '#EA580C', 
      bg: 'from-[#A996FF] to-[#EDE9FE]0',
      name: '선셋',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-500'
    },
  };
  
  const currentTheme = themes[widgetConfig.theme];
  
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // === 커스텀 위젯 렌더러 ===
  const CustomWidget = ({ config, preview = false }) => {
    const theme = themes[config.theme];
    const isLockscreen = config.size === 'lockscreen';
    
    // 배경 스타일
    const getBgClass = () => {
      if (config.bgStyle === 'gradient') {
        return `bg-gradient-to-br ${theme.bg}`;
      } else if (config.bgStyle === 'solid') {
        return theme.cardBg;
      } else { // glass
        return `${theme.cardBg} backdrop-blur-xl bg-opacity-70`;
      }
    };
    
    // 크기별 클래스
    const getSizeClass = () => {
      switch (config.size) {
        case 'mini': return 'w-20 h-20';
        case 'small': return 'w-44 h-20';
        case 'medium': return 'w-44 h-44';
        case 'lockscreen': return preview ? 'w-full h-72' : 'w-full h-screen';
        default: return 'w-44 h-44';
      }
    };
    
    const isGradient = config.bgStyle === 'gradient';
    const txtPrimary = isGradient ? 'text-white' : theme.textPrimary;
    const txtSecondary = isGradient ? 'text-white/70' : theme.textSecondary;
    
    // 미니 위젯
    if (config.size === 'mini') {
      return (
        <div className={`${getSizeClass()} ${getBgClass()} rounded-xl shadow-lg flex flex-col items-center justify-center`}>
          {config.showBig3 && (
            <>
              <span className="text-2xl">🎯</span>
              <p className={`text-sm font-bold ${txtPrimary}`}>{big3Done}/{big3Total}</p>
            </>
          )}
        </div>
      );
    }
    
    // 스몰 위젯
    if (config.size === 'small') {
      return (
        <div className={`${getSizeClass()} ${getBgClass()} rounded-xl shadow-lg flex items-center px-3 gap-3`}>
          {config.showBig3 && (
            <div className="flex flex-col items-center">
              <span className="text-xl">🎯</span>
              <p className={`text-xs font-bold ${txtPrimary}`}>{big3Done}/{big3Total}</p>
            </div>
          )}
          {config.showBig3 && config.showSchedule && (
            <div className={`w-px h-10 ${isGradient ? 'bg-white/30' : 'bg-gray-200'}`} />
          )}
          {config.showSchedule && (
            <div className="flex-1 min-w-0">
              {nextEvent ? (
                <>
                  <p className={`text-[11px] ${txtSecondary} truncate`}>📅 {nextEvent.title}</p>
                  <p className={`text-xs font-medium ${txtPrimary}`}>{nextEvent.timeLeft}</p>
                </>
              ) : (
                <p className={`text-xs ${txtSecondary}`}>일정 없음</p>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // 미디엄 위젯
    if (config.size === 'medium') {
      return (
        <div className={`${getSizeClass()} ${getBgClass()} rounded-xl shadow-lg p-3 flex flex-col`}>
          {/* Big3 */}
          {config.showBig3 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <div className="flex-1">
                <p className={`text-xs ${txtSecondary}`}>Big3</p>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 h-2 ${isGradient ? 'bg-white/30' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div 
                      className={`h-full ${isGradient ? 'bg-white' : `bg-gradient-to-r ${theme.bg}`} rounded-full`}
                      style={{ width: `${(big3Done / big3Total) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${txtPrimary}`}>{big3Done}/{big3Total}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* 다음 일정 */}
          {config.showSchedule && (
            <div className={`flex-1 ${isGradient ? 'bg-white/10' : (darkMode ? 'bg-gray-700' : 'bg-gray-50')} rounded-xl p-2 mb-2`}>
              {nextEvent ? (
                <>
                  <p className={`text-[11px] ${txtSecondary}`}>📅 다음 일정</p>
                  <p className={`text-xs font-medium ${txtPrimary} truncate`}>{nextEvent.title}</p>
                  <p className={`text-xs ${nextEvent.isUrgent ? 'text-red-400 font-medium' : txtSecondary}`}>
                    {nextEvent.timeLeft}
                  </p>
                </>
              ) : (
                <p className={`text-xs ${txtSecondary} text-center mt-2`}>오늘 남은 일정 없음</p>
              )}
            </div>
          )}
          
          {/* 에너지 & 기분 */}
          {(config.showEnergy || config.showMood) && (
            <div className="flex items-center justify-between">
              {config.showEnergy && (
                <div className="flex items-center gap-1">
                  <Zap size={12} className={isGradient ? 'text-white' : 'text-[#A996FF]'} />
                  <span className={`text-xs ${txtPrimary}`}>{energy}%</span>
                </div>
              )}
              {config.showMood && (
                <div className="flex items-center gap-1">
                  <span>{getMoodEmoji()}</span>
                  <span className={`text-xs ${txtSecondary}`}>기분</span>
                </div>
              )}
            </div>
          )}
          
          {/* 알프레도 */}
          {config.showAlfredo && (
            <div className={`mt-2 pt-2 border-t ${isGradient ? 'border-white/20' : 'border-gray-100'} flex items-center gap-1`}>
              <span className="text-sm">🐧</span>
              <span className={`text-[11px] ${txtSecondary}`}>{getAlfredoComment()}</span>
            </div>
          )}
        </div>
      );
    }
    
    // 잠금화면 위젯
    if (config.size === 'lockscreen') {
      return (
        <div 
          className={`${getSizeClass()} ${getBgClass()} rounded-xl flex flex-col items-center justify-center p-6 shadow-lg`}
          onClick={() => !preview && setSelectedWidget(null)}
        >
          {/* 시간 */}
          <p className={`text-5xl font-light ${txtPrimary} mb-1`}>
            {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
          </p>
          <p className={`text-base ${txtSecondary} mb-6`}>
            {dayNames[now.getDay()]}요일, {monthNames[now.getMonth()]} {now.getDate()}일
          </p>
          
          {/* 핵심 정보 카드 */}
          <div className={`${isGradient ? 'bg-white/10' : (darkMode ? 'bg-gray-700' : 'bg-gray-100')} backdrop-blur-md rounded-xl p-4 w-full max-w-xs`}>
            {config.showBig3 && (
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <span className={`${txtPrimary} font-medium`}>Big3</span>
                </div>
                <span className={`${txtPrimary} font-bold`}>{big3Done}/{big3Total} 완료</span>
              </div>
            )}
            
            {config.showSchedule && nextEvent && (
              <div className={`flex items-center justify-between mb-3 ${config.showBig3 ? `pt-3 border-t ${isGradient ? 'border-white/20' : 'border-gray-200'}` : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <span className={`${txtSecondary} text-sm truncate max-w-[120px]`}>{nextEvent.title}</span>
                </div>
                <span className={`text-sm font-medium ${nextEvent.isUrgent ? 'text-red-400' : txtSecondary}`}>
                  {nextEvent.timeLeft}
                </span>
              </div>
            )}
            
            {(config.showEnergy || config.showMood) && (
              <div className={`flex items-center justify-between ${(config.showBig3 || config.showSchedule) ? `pt-3 border-t ${isGradient ? 'border-white/20' : 'border-gray-200'}` : ''}`}>
                <div className="flex items-center gap-3">
                  {config.showEnergy && (
                    <div className="flex items-center gap-1">
                      <Zap size={14} className={isGradient ? 'text-white' : 'text-[#A996FF]'} />
                      <span className={`${txtSecondary} text-sm`}>{energy}%</span>
                    </div>
                  )}
                  {config.showMood && (
                    <div className="flex items-center gap-1">
                      <span>{getMoodEmoji()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* 알프레도 한마디 */}
          {config.showAlfredo && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl">🐧</span>
              <span className={`${txtSecondary} text-sm`}>{getAlfredoComment()}</span>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  // 위젯 저장
  const handleSaveWidget = () => {
    const newWidget = {
      id: Date.now(),
      name: `내 위젯 ${savedWidgets.length + 1}`,
      config: { ...widgetConfig }
    };
    setSavedWidgets([...savedWidgets, newWidget]);
    setActiveTab('myWidgets');
  };
  
  // 위젯 삭제
  const handleDeleteWidget = (id) => {
    setSavedWidgets(savedWidgets.filter(w => w.id !== id));
  };
  
  // 위젯 불러오기
  const handleLoadWidget = (config) => {
    setWidgetConfig(config);
    setActiveTab('editor');
  };
  
  // === 기존 위젯 컴포넌트들 (갤러리용) ===
  const MiniWidget = () => (
    <div className={`w-20 h-20 ${cardBg} rounded-xl shadow-lg flex flex-col items-center justify-center`}>
      <span className="text-2xl">🎯</span>
      <p className={`text-sm font-bold ${textPrimary}`}>{big3Done}/{big3Total}</p>
    </div>
  );
  
  const SmallWidget = () => (
    <div className={`w-44 h-20 ${cardBg} rounded-xl shadow-lg flex items-center px-3 gap-3`}>
      <div className="flex flex-col items-center">
        <span className="text-xl">🎯</span>
        <p className={`text-xs font-bold ${textPrimary}`}>{big3Done}/{big3Total}</p>
      </div>
      <div className="w-px h-10 bg-gray-200" />
      <div className="flex-1 min-w-0">
        {nextEvent ? (
          <>
            <p className={`text-[11px] ${textSecondary} truncate`}>📅 {nextEvent.title}</p>
            <p className={`text-xs font-medium ${textPrimary}`}>{nextEvent.timeLeft}</p>
          </>
        ) : (
          <p className={`text-xs ${textSecondary}`}>일정 없음</p>
        )}
      </div>
    </div>
  );
  
  const MediumWidget = () => (
    <div className={`w-44 h-44 ${cardBg} rounded-xl shadow-lg p-3 flex flex-col`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎯</span>
        <div className="flex-1">
          <p className={`text-xs ${textSecondary}`}>Big3</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full"
                style={{ width: `${(big3Done / big3Total) * 100}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${textPrimary}`}>{big3Done}/{big3Total}</span>
          </div>
        </div>
      </div>
      <div className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-2 mb-2`}>
        {nextEvent ? (
          <>
            <p className={`text-[11px] ${textSecondary}`}>📅 다음 일정</p>
            <p className={`text-xs font-medium ${textPrimary} truncate`}>{nextEvent.title}</p>
            <p className={`text-xs ${nextEvent.isUrgent ? 'text-red-500 font-medium' : textSecondary}`}>
              {nextEvent.timeLeft}
            </p>
          </>
        ) : (
          <p className={`text-xs ${textSecondary} text-center mt-2`}>오늘 남은 일정 없음</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Zap size={12} className="text-[#A996FF]" />
          <span className={`text-xs ${textPrimary}`}>{energy}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{getMoodEmoji()}</span>
          <span className={`text-xs ${textSecondary}`}>기분</span>
        </div>
      </div>
    </div>
  );
  
  const WatchWidget = () => (
    <div className="w-12 h-12 bg-black rounded-full flex flex-col items-center justify-center shadow-lg">
      <span className="text-[11px] text-white font-bold">{big3Done}/{big3Total}</span>
      <span className="text-[11px] text-gray-400">🎯</span>
    </div>
  );
  
  const LockScreenWidget = ({ fullscreen = false }) => (
    <div 
      className={`${fullscreen ? 'fixed inset-0 z-50' : 'w-full h-80'} bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-xl flex flex-col items-center justify-center p-6 ${fullscreen ? '' : 'shadow-lg'}`}
      onClick={() => fullscreen && setSelectedWidget(null)}
    >
      <p className="text-6xl font-light text-white mb-1">
        {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
      </p>
      <p className="text-lg text-gray-400 mb-8">
        {dayNames[now.getDay()]}요일, {monthNames[now.getMonth()]} {now.getDate()}일
      </p>
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 w-full max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="text-white font-medium">Big3</span>
          </div>
          <span className="text-white font-bold">{big3Done}/{big3Total} 완료</span>
        </div>
        {nextEvent && (
          <div className="flex items-center justify-between mb-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <span className="text-white/80 text-sm truncate max-w-[120px]">{nextEvent.title}</span>
            </div>
            <span className={`text-sm font-medium ${nextEvent.isUrgent ? 'text-red-400' : 'text-white/60'}`}>
              {nextEvent.timeLeft}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Zap size={14} className="text-[#A996FF]" />
              <span className="text-white/80 text-sm">{energy}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{getMoodEmoji()}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <span className="text-2xl">🐧</span>
        <span className="text-white/70 text-sm">{getAlfredoComment()}</span>
      </div>
      {fullscreen && (
        <p className="absolute bottom-8 text-white/40 text-xs">탭하여 닫기</p>
      )}
    </div>
  );
  
  // 토글 컴포넌트
  const Toggle = ({ enabled, onChange, label }) => (
    <button
      onClick={() => onChange(!enabled)}
      className="flex items-center justify-between w-full py-2"
    >
      <span className={`text-sm ${textPrimary}`}>{label}</span>
      <div className={`w-10 h-6 rounded-full transition-all duration-200 ${enabled ? 'bg-[#A996FF]' : 'bg-gray-300'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 mt-1 ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
    </button>
  );
  
  return (
    <div className={`min-h-screen ${bgColor} pb-24`}>
      {/* 헤더 */}
      <div className={`${cardBg} px-4 py-3 flex items-center gap-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <button onClick={onBack} className={textSecondary}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={`text-lg font-bold ${textPrimary}`}>위젯</h1>
      </div>
      
      {/* 탭 */}
      <div className={`${cardBg} px-4 py-2 flex gap-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        {[
          { id: 'gallery', label: '갤러리' },
          { id: 'editor', label: '만들기' },
          { id: 'myWidgets', label: '내 위젯' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#A996FF] text-white'
                : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 갤러리 탭 */}
      {activeTab === 'gallery' && (
        <div className="p-4 space-y-6">
          <div className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐧</span>
              <div>
                <p className={`text-sm ${textPrimary}`}>
                  기본 위젯들을 구경하고, "만들기" 탭에서 나만의 위젯을 만들어보세요!
                </p>
              </div>
            </div>
          </div>
          
          {/* 미니 */}
          <div>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>📱 미니 (1×1)</p>
            <div className="flex gap-3">
              <MiniWidget />
              <div className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-3`}>
                <p className={`text-xs ${textSecondary}`}>가장 작은 위젯</p>
                <p className={`text-xs ${textPrimary} mt-1`}>Big3 진행률만 한눈에</p>
              </div>
            </div>
          </div>
          
          {/* 스몰 */}
          <div>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>📱 스몰 (2×1)</p>
            <SmallWidget />
          </div>
          
          {/* 미디엄 */}
          <div>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>📱 미디엄 (2×2)</p>
            <div className="flex gap-3">
              <MediumWidget />
              <div className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-3`}>
                <p className={`text-xs ${textSecondary}`}>자세한 정보</p>
                <p className={`text-xs ${textPrimary} mt-1`}>Big3 + 일정 + 상태</p>
              </div>
            </div>
          </div>
          
          {/* 워치 */}
          <div>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>⌚ 워치</p>
            <div className="flex gap-3 items-center">
              <WatchWidget />
              <p className={`text-xs ${textSecondary}`}>애플워치용 초소형</p>
            </div>
          </div>
          
          {/* 잠금화면 */}
          <div>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>🔒 잠금화면</p>
            <div onClick={() => setSelectedWidget('lockscreen')} className="cursor-pointer">
              <LockScreenWidget />
            </div>
            <p className={`text-xs ${textSecondary} mt-2 text-center`}>탭하여 풀스크린 미리보기</p>
          </div>
        </div>
      )}
      
      {/* 에디터 탭 */}
      {activeTab === 'editor' && (
        <div className="p-4 space-y-4">
          {/* 실시간 미리보기 */}
          <div className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>👀 미리보기</p>
            <div className="flex justify-center">
              <CustomWidget config={widgetConfig} preview />
            </div>
          </div>
          
          {/* 크기 선택 */}
          <div className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>📐 크기</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'mini', label: '미니' },
                { id: 'small', label: '스몰' },
                { id: 'medium', label: '미디엄' },
                { id: 'lockscreen', label: '잠금화면' },
              ].map(size => (
                <button
                  key={size.id}
                  onClick={() => setWidgetConfig({ ...widgetConfig, size: size.id })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    widgetConfig.size === size.id
                      ? 'bg-[#A996FF] text-white'
                      : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 표시 항목 */}
          <div className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>📊 표시할 정보</p>
            <div className="space-y-1">
              <Toggle 
                enabled={widgetConfig.showBig3} 
                onChange={(v) => setWidgetConfig({ ...widgetConfig, showBig3: v })}
                label="🎯 Big3 진행률"
              />
              <Toggle 
                enabled={widgetConfig.showSchedule} 
                onChange={(v) => setWidgetConfig({ ...widgetConfig, showSchedule: v })}
                label="📅 다음 일정"
              />
              <Toggle 
                enabled={widgetConfig.showEnergy} 
                onChange={(v) => setWidgetConfig({ ...widgetConfig, showEnergy: v })}
                label="⚡ 에너지"
              />
              <Toggle 
                enabled={widgetConfig.showMood} 
                onChange={(v) => setWidgetConfig({ ...widgetConfig, showMood: v })}
                label="😊 기분"
              />
              <Toggle 
                enabled={widgetConfig.showAlfredo} 
                onChange={(v) => setWidgetConfig({ ...widgetConfig, showAlfredo: v })}
                label="🐧 알프레도 한마디"
              />
            </div>
          </div>
          
          {/* 테마 */}
          <div className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>🎨 테마</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setWidgetConfig({ ...widgetConfig, theme: key })}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.bg} flex items-center justify-center transition-all ${
                    widgetConfig.theme === key ? 'ring-2 ring-offset-2 ring-[#A996FF]' : ''
                  }`}
                >
                  {widgetConfig.theme === key && <CheckCircle2 size={20} className="text-white" />}
                </button>
              ))}
            </div>
            <p className={`text-xs ${textSecondary} mt-2`}>선택: {themes[widgetConfig.theme].name}</p>
          </div>
          
          {/* 배경 스타일 */}
          <div className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>🖼 배경 스타일</p>
            <div className="flex gap-2">
              {[
                { id: 'gradient', label: '그라데이션' },
                { id: 'solid', label: '단색' },
                { id: 'glass', label: '글래스' },
              ].map(style => (
                <button
                  key={style.id}
                  onClick={() => setWidgetConfig({ ...widgetConfig, bgStyle: style.id })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    widgetConfig.bgStyle === style.id
                      ? 'bg-[#A996FF] text-white'
                      : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 저장 버튼 */}
          <button
            onClick={handleSaveWidget}
            className="w-full py-4 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white font-semibold rounded-xl shadow-lg"
          >
            위젯 저장하기
          </button>
        </div>
      )}
      
      {/* 내 위젯 탭 */}
      {activeTab === 'myWidgets' && (
        <div className="p-4 space-y-4">
          {savedWidgets.length === 0 ? (
            <div className={`${cardBg} rounded-xl p-8 border ${darkMode ? 'border-gray-700' : 'border-gray-100'} text-center`}>
              <span className="text-4xl">📱</span>
              <p className={`${textPrimary} mt-2`}>저장된 위젯이 없어요</p>
              <p className={`text-sm ${textSecondary} mt-1`}>"만들기" 탭에서 위젯을 만들어보세요!</p>
            </div>
          ) : (
            savedWidgets.map(widget => (
              <div 
                key={widget.id}
                className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`font-medium ${textPrimary}`}>{widget.name}</p>
                    <p className={`text-xs ${textSecondary}`}>
                      {widget.config.size} · {themes[widget.config.theme].name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadWidget(widget.config)}
                      className="px-3 py-1 bg-[#A996FF] text-white text-xs rounded-lg"
                    >
                      편집
                    </button>
                    <button
                      onClick={() => handleDeleteWidget(widget.id)}
                      className={`px-3 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary} text-xs rounded-lg`}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <CustomWidget config={widget.config} preview />
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* 풀스크린 미리보기 */}
      {selectedWidget === 'lockscreen' && (
        <LockScreenWidget fullscreen />
      )}
    </div>
  );
};

// === Settings Page ===
const SettingsPage = ({ userData, onUpdateUserData, onBack, darkMode, setDarkMode, onOpenWidgetGallery, connections, onConnect, onDisconnect }) => {
  const [settings, setSettings] = useState({
    morningBriefing: true,
    briefingTime: '08:00',
    eveningReview: true,
    reviewTime: '21:00',
    taskReminder: true,
    focusMode: true,
    soundEnabled: true,
  });
  
  const [showTimePicker, setShowTimePicker] = useState(null);
  
  // Google Auth Modal state
  const [authModal, setAuthModal] = useState({ isOpen: false, service: null });
  
  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-12 h-7 rounded-full transition-all duration-200 ${
        enabled ? 'bg-[#A996FF]' : 'bg-gray-200'
      }`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
  
  const SettingItem = ({ icon, title, description, children }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-lg">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{title}</p>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
  
  const ConnectionItem = ({ icon, name, serviceKey, connected }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <span className="font-medium text-gray-700">{name}</span>
          {connected && <p className="text-xs text-emerald-500">user@gmail.com</p>}
        </div>
      </div>
      <button
        onClick={() => setAuthModal({ isOpen: true, service: serviceKey })}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
          connected 
            ? 'bg-emerald-50 text-emerald-600' 
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        {connected ? '연결됨 ✓' : '연결하기'}
      </button>
    </div>
  );
  
  return (
    <div className="flex-1 overflow-y-auto bg-[#F0EBFF]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">설정</h1>
      </div>
      
      <div className="p-4 pb-32 space-y-4">
        
        {/* 프로필 섹션 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] flex items-center justify-center text-2xl text-white font-bold shadow-lg">
              {userData?.name?.[0] || 'B'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">{userData?.name || 'Boss'}</h2>
              <p className="text-sm text-gray-500">Life Butler 사용자</p>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Settings size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* 외관 설정 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            {darkMode ? <Moon size={18} className="text-[#A996FF]" /> : <Sun size={18} className="text-[#A996FF]" />}
            외관
          </h3>
          
          <div className="divide-y divide-gray-100">
            <SettingItem 
              icon={darkMode ? "🌙" : "☀️"} 
              title="다크 모드" 
              description={darkMode ? '어두운 테마 사용 중' : '밝은 테마 사용 중'}
            >
              <ToggleSwitch 
                enabled={darkMode} 
                onChange={setDarkMode} 
              />
            </SettingItem>
            
            <button 
              onClick={onOpenWidgetGallery}
              className="w-full"
            >
              <SettingItem 
                icon="📱" 
                title="위젯 갤러리" 
                description="다양한 크기의 위젯 미리보기"
              >
                <ChevronRight size={20} className="text-gray-400" />
              </SettingItem>
            </button>
          </div>
        </div>
        
        {/* 알림 설정 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Bell size={18} className="text-[#A996FF]" />
            알림 설정
          </h3>
          
          <div className="divide-y divide-gray-100">
            <SettingItem 
              icon="🌅" 
              title="아침 브리핑" 
              description={settings.morningBriefing ? `매일 ${settings.briefingTime}` : '꺼짐'}
            >
              <ToggleSwitch 
                enabled={settings.morningBriefing} 
                onChange={(v) => setSettings({...settings, morningBriefing: v})} 
              />
            </SettingItem>
            
            <SettingItem 
              icon="🌙" 
              title="저녁 리뷰" 
              description={settings.eveningReview ? `매일 ${settings.reviewTime}` : '꺼짐'}
            >
              <ToggleSwitch 
                enabled={settings.eveningReview} 
                onChange={(v) => setSettings({...settings, eveningReview: v})} 
              />
            </SettingItem>
            
            <SettingItem 
              icon="⏰" 
              title="태스크 리마인더" 
              description="마감 전 알림"
            >
              <ToggleSwitch 
                enabled={settings.taskReminder} 
                onChange={(v) => setSettings({...settings, taskReminder: v})} 
              />
            </SettingItem>
            
            <SettingItem 
              icon="🔔" 
              title="소리" 
              description="알림음 및 효과음"
            >
              <ToggleSwitch 
                enabled={settings.soundEnabled} 
                onChange={(v) => setSettings({...settings, soundEnabled: v})} 
              />
            </SettingItem>
          </div>
        </div>
        
        {/* 연동 관리 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Zap size={18} className="text-[#A996FF]" />
            연동 서비스
          </h3>
          
          <div className="divide-y divide-gray-100">
            <ConnectionItem 
              icon="📅" 
              name="Google Calendar" 
              serviceKey="googleCalendar"
              connected={connections?.googleCalendar}
            />
            <ConnectionItem 
              icon="📧" 
              name="Gmail" 
              serviceKey="gmail"
              connected={connections?.gmail}
            />
            <ConnectionItem 
              icon="📝" 
              name="Notion" 
              serviceKey="notion"
              connected={connections?.notion}
            />
            <ConnectionItem 
              icon="💬" 
              name="Slack" 
              serviceKey="slack"
              connected={connections?.slack}
            />
          </div>
          
          <p className="text-xs text-gray-400 mt-3 text-center">
            연동된 서비스에서 자동으로 일정과 태스크를 가져와요
          </p>
        </div>
        
        {/* Google Auth Modal */}
        <GoogleAuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ isOpen: false, service: null })}
          service={authModal.service}
          isConnected={connections?.[authModal.service]}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
        
        {/* 집중 모드 설정 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Zap size={18} className="text-[#A996FF]" />
            집중 모드
          </h3>
          
          <div className="divide-y divide-gray-100">
            <SettingItem 
              icon="⏱️" 
              title="기본 집중 시간" 
              description="25분 (포모도로)"
            >
              <span className="text-sm text-[#A996FF] font-semibold">25분</span>
            </SettingItem>
            
            <SettingItem 
              icon="☕" 
              title="휴식 시간" 
              description="집중 후 휴식"
            >
              <span className="text-sm text-[#A996FF] font-semibold">5분</span>
            </SettingItem>
            
            <SettingItem 
              icon="🔕" 
              title="집중 시 방해 금지" 
              description="알림 일시 차단"
            >
              <ToggleSwitch 
                enabled={settings.focusMode} 
                onChange={(v) => setSettings({...settings, focusMode: v})} 
              />
            </SettingItem>
          </div>
        </div>
        
        {/* 앱 정보 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2">앱 정보</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">버전</span>
              <span className="text-gray-700 font-medium">1.0.0 (Beta)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">빌드</span>
              <span className="text-gray-700 font-medium">2024.12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">플랫폼</span>
              <span className="text-gray-700 font-medium">PWA</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
            <button className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200">
              피드백 보내기
            </button>
            <button className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200">
              도움말
            </button>
          </div>
        </div>
        
        {/* 📱 앱 설치 */}
        <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-xl p-4 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              📱
            </div>
            <div>
              <h3 className="font-bold">앱으로 설치하기</h3>
              <p className="text-sm text-white/80">홈 화면에 추가해서 더 빠르게!</p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (window.installPWA) {
                window.installPWA();
              } else {
                // iOS Safari 안내
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                if (isIOS) {
                  alert('Safari에서 공유 버튼(📤)을 누르고\n"홈 화면에 추가"를 선택하세요!');
                } else {
                  alert('브라우저 메뉴에서 "앱 설치" 또는\n"홈 화면에 추가"를 선택하세요!');
                }
              }
            }}
            className="w-full py-3 bg-white text-[#A996FF] rounded-xl font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            홈 화면에 추가
          </button>
          
          <p className="text-xs text-white/60 text-center mt-2">
            앱처럼 사용할 수 있어요 • 오프라인 지원
          </p>
        </div>
        
        {/* 데이터 관리 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Database size={18} className="text-gray-500" />
            데이터 관리
          </h3>
          
          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">저장된 데이터</span>
              <span className="text-gray-700 font-medium">로컬 저장소</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">자동 저장</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                활성화
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (window.confirm('모든 데이터를 초기화하시겠어요?\n\n태스크, 일정, 프로젝트, 루틴, 약 등 모든 데이터가 삭제됩니다.\n이 작업은 되돌릴 수 없어요.')) {
                // 모든 localStorage 키 삭제
                const keysToDelete = [
                  'lifebutler_userData', 'lifebutler_tasks', 'lifebutler_allTasks',
                  'lifebutler_allEvents', 'lifebutler_inbox', 'lifebutler_darkMode',
                  'lifebutler_view', 'lifebutler_gameState', 'lifebutler_projects',
                  'lifebutler_medications', 'lifebutler_routines', 'lifebutler_lifeTop3',
                  'lifebutler_upcomingItems', 'lifebutler_dontForgetItems',
                  'lifebutler_relationshipItems', 'lifebutler_healthCheck'
                ];
                keysToDelete.forEach(key => localStorage.removeItem(key));
                window.location.reload();
              }
            }}
            className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            🗑️ 모든 데이터 초기화
          </button>
        </div>
        
        {/* 알프레도 카드 */}
        <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7BE8] rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              🐧
            </div>
            <div className="flex-1">
              <p className="font-bold">알프레도가 함께해요</p>
              <p className="text-sm text-white/80">언제든 도움이 필요하면 불러주세요!</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

// === Home Page ===
const HomePage = ({ onOpenChat, onOpenSettings, onOpenSearch, onOpenStats, onOpenWeeklyReview, onOpenHabitHeatmap, onOpenEnergyRhythm, onOpenDndModal, doNotDisturb, mood, setMood, energy, setEnergy, oneThing, tasks, onToggleTask, inbox, onStartFocus, darkMode, gameState, events = [], connections = {} }) => {
  const [showAllReminders, setShowAllReminders] = useState(false);
  const [showEveningReview, setShowEveningReview] = useState(false);
  const [eveningNote, setEveningNote] = useState('');
  const [showTaskOptions, setShowTaskOptions] = useState(false);
  
  // 동적 날짜/시간
  const now = new Date();
  const hour = now.getHours();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 ${weekdays[now.getDay()]}요일`;
  
  const isEvening = hour >= 18;
  const isMorning = hour < 12;
  const isAfternoon = hour >= 12 && hour < 18;
  
  // 오늘의 통계
  const todoTasks = tasks?.filter(t => t.status !== 'done') || [];
  const doneTasks = tasks?.filter(t => t.status === 'done') || [];
  const todayMeetings = events.filter(e => e.title.includes('미팅') || e.title.includes('회의'));
  const urgentDeadlines = todoTasks.filter(t => t.deadline?.includes('오늘') || t.deadline?.includes('D-'));
  
  // 컨디션 기반 태스크 추천
  const getConditionAdjustedTasks = () => {
    if (todoTasks.length === 0) return [];
    
    // 에너지 낮으면 쉬운 것 먼저
    if (energy <= 40) {
      return [...todoTasks].sort((a, b) => {
        const importanceOrder = { low: 3, medium: 2, high: 1 };
        const aOrder = importanceOrder[a.importance] || 2;
        const bOrder = importanceOrder[b.importance] || 2;
        if (aOrder !== bOrder) return bOrder - aOrder; // 쉬운 것 먼저
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      });
    }
    
    // 에너지 높으면 어려운 것 먼저 (기본)
    if (energy >= 70) {
      return [...todoTasks].sort((a, b) => {
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        const aOrder = importanceOrder[a.importance] || 2;
        const bOrder = importanceOrder[b.importance] || 2;
        if (aOrder !== bOrder) return bOrder - aOrder; // 어려운 것 먼저
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      });
    }
    
    // 보통이면 priorityScore 순
    return [...todoTasks].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
  };
  
  const adjustedTasks = getConditionAdjustedTasks();
  const topTask = adjustedTasks[0];
  const isTaskAdjusted = energy <= 40 || energy >= 70; // 컨디션 조정 여부
  
  // 잊지 마세요 통합 (LIFE + WORK) - 간단 버전
  const allReminders = [
    // 돈 관련
    ...mockDontForget.filter(d => d.dDay <= 3).map(d => ({
      id: `money-${d.id}`,
      icon: '💰',
      title: d.title,
      detail: d.dDay === 0 ? '오늘!' : `D-${d.dDay}`,
      urgent: d.dDay <= 1,
      type: 'money'
    })),
    // 답장 안 한 메일
    ...mockWorkReminders.filter(r => r.type === 'reply').map(r => ({
      id: r.id,
      icon: '📧',
      title: r.title,
      detail: `${r.daysAgo}일째`,
      urgent: r.urgent,
      type: 'reply'
    })),
    // 관계 챙기기
    ...mockRelationships.filter(r => r.daysSince >= 7).slice(0, 1).map(r => ({
      id: `rel-${r.id}`,
      icon: r.relationship === 'family' ? '👨‍👩‍👧' : '👋',
      title: `${r.name}에게 연락`,
      detail: `${r.daysSince}일 전`,
      urgent: r.daysSince >= 14,
      type: 'relationship'
    })),
  ].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
  
  // 알프레도 인사 생성
  const getAlfredoGreeting = () => {
    if (isEvening) {
      if (doneTasks.length >= 3) {
        return `오늘 **${doneTasks.length}개** 완료했어요! 수고했어요, Boss! 🎉`;
      } else {
        return `하루 마무리 시간이에요. 급한 건 내일 해도 괜찮아요.`;
      }
    } else if (isMorning) {
      return `오늘 할 일 **${todoTasks.length}개**, 미팅 **${todayMeetings.length}개** 있어요.`;
    } else {
      const remaining = todoTasks.length;
      if (doneTasks.length > 0) {
        return `벌써 **${doneTasks.length}개** 완료! 남은 건 **${remaining}개**예요.`;
      }
      return `아직 시작 전이에요. 가벼운 것부터 하나 해볼까요?`;
    }
  };
  
  // 날씨 한줄
  const getWeatherLine = () => {
    const w = mockWeather;
    let line = `${w.temp}°C`;
    if (w.tempLow < 0) line += `, 패딩 입으세요 🧣`;
    else if (w.rain) line += `, 우산 챙기세요 🌧️`;
    if (w.dust === 'bad' || w.dust === 'veryBad') line += ` · 마스크 필수 😷`;
    return line;
  };
  
  // 컨디션 기반 조언
  const getConditionAdvice = () => {
    if (energy <= 40) {
      return { 
        text: "에너지 낮아서 가벼운 것부터 정리했어요. 무리하지 마세요 💜", 
        color: "text-[#8B7CF7]",
        adjusted: true
      };
    } else if (energy >= 70) {
      return { 
        text: "컨디션 좋을 때 어려운 거 먼저 해치워요! ✨", 
        color: "text-emerald-600",
        adjusted: true
      };
    }
    return null;
  };
  
  const conditionAdvice = getConditionAdvice();
  
  // 🆕 프로액티브: 다음 일정까지 카운트다운
  const getNextEventCountdown = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    
    // events에서 오늘 남은 일정 찾기
    for (const event of events) {
      if (event.time) {
        const [h, m] = event.time.split(':').map(Number);
        if (h > currentHour || (h === currentHour && m > currentMin)) {
          const diffMin = (h * 60 + m) - (currentHour * 60 + currentMin);
          const hours = Math.floor(diffMin / 60);
          const mins = diffMin % 60;
          return {
            event,
            hours,
            mins,
            totalMins: diffMin,
            text: hours > 0 ? `${hours}시간 ${mins}분 후` : `${mins}분 후`
          };
        }
      }
    }
    return null;
  };
  
  const nextEvent = getNextEventCountdown();
  
  // 🆕 프로액티브: 어제 미완료 태스크 (시뮬레이션)
  const yesterdayIncomplete = todoTasks.filter(t => 
    t.priorityChange === 'down' || t.project?.includes('밀린')
  ).slice(0, 2);
  
  // 🆕 오늘의 핵심 요약 (숫자로)
  const todaySummary = {
    meetings: todayMeetings.length,
    deadlines: urgentDeadlines.length,
    totalTasks: todoTasks.length,
    done: doneTasks.length,
  };
  
  // 다크모드 색상
  const bgGradient = darkMode 
    ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
    : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800/90' : 'bg-white/90';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-[#A996FF]/20';
  
  return (
    <div className={`flex-1 overflow-y-auto px-4 pb-32 pt-6 ${bgGradient} transition-colors duration-300`}>
      
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-sm ${textSecondary}`}>{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* 레벨 뱃지 */}
          {gameState && (
            <button 
              onClick={onOpenStats}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <span className="text-sm">⭐</span>
              <span className="text-xs font-bold">Lv.{LEVEL_CONFIG.getLevel(gameState.totalXP).level}</span>
            </button>
          )}
          {/* 방해 금지 버튼 */}
          <button 
            onClick={onOpenDndModal}
            className={`w-9 h-9 rounded-full ${
              doNotDisturb 
                ? 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white' 
                : darkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-white/50'
            } ${!doNotDisturb && 'border'} shadow-sm flex items-center justify-center ${!doNotDisturb && textSecondary} hover:opacity-90 transition-all`}
          >
            <Moon size={16} />
          </button>
          <button 
            onClick={onOpenSearch}
            className={`w-9 h-9 rounded-full ${darkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-white/50'} border shadow-sm flex items-center justify-center ${textSecondary} hover:bg-[#F5F3FF] hover:text-[#A996FF] transition-all`}
          >
            <Search size={16} />
          </button>
          <button 
            onClick={onOpenSettings}
            className={`w-9 h-9 rounded-full ${darkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-white/50'} border shadow-sm flex items-center justify-center ${textSecondary}`}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
      
      {/* 🐧 알프레도 메인 브리핑 */}
      <div className={`${cardBg} backdrop-blur-xl rounded-xl shadow-lg p-5 mb-4 border ${borderColor} transition-colors duration-300`}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-xl shrink-0 shadow-md">
            🐧
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold ${textPrimary}`}>알프레도</span>
              <span className="text-[11px] px-1.5 py-0.5 bg-[#A996FF]/10 text-[#A996FF] rounded-full font-medium">라이브</span>
            </div>
            <p className={`text-[15px] ${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
              {isMorning ? '좋은 아침이에요, Boss! ☀️' : isAfternoon ? '오후도 파이팅, Boss! 💪' : '하루 마무리예요, Boss! 🌙'}
            </p>
          </div>
        </div>
        
        {/* 🆕 다음 일정 카운트다운 (프로액티브!) */}
        {nextEvent && nextEvent.totalMins <= 180 && (
          <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-xl p-4 mb-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-bold">{nextEvent.event.title}</p>
                  <p className="text-sm text-white/80">{nextEvent.event.time} · {nextEvent.event.location || '장소 미정'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{nextEvent.text}</p>
                {nextEvent.totalMins <= 30 && (
                  <p className="text-xs text-[#C4B5FD]">⚡ 곧이에요!</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* 🆕 오늘 핵심 요약 (한눈에) */}
        <div className={`grid grid-cols-4 gap-2 mb-3 p-3 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl`}>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-600">{todaySummary.meetings}</p>
            <p className={`text-[11px] ${textSecondary}`}>미팅</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-500">{todaySummary.deadlines}</p>
            <p className={`text-[11px] ${textSecondary}`}>마감</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#A996FF]">{todaySummary.totalTasks}</p>
            <p className={`text-[11px] ${textSecondary}`}>할 일</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-500">{todaySummary.done}</p>
            <p className={`text-[11px] ${textSecondary}`}>완료</p>
          </div>
        </div>
        
        {/* 날씨 */}
        <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3 mb-3`}>
          <div className="flex items-center justify-between text-sm">
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-2`}>
              <span className="text-lg">{mockWeather.condition === 'sunny' ? '☀️' : mockWeather.condition === 'cloudy' ? '☁️' : mockWeather.rain ? '🌧️' : '⛅'}</span>
              {getWeatherLine()}
            </span>
          </div>
        </div>
        
        {/* 오늘 요약 */}
        <p className={`text-[15px] ${textPrimary} leading-relaxed mb-3`}>
          {getAlfredoGreeting().split('**').map((part, i) => 
            i % 2 === 1 ? <strong key={i} className="text-[#A996FF] font-bold">{part}</strong> : part
          )}
        </p>
        
        {/* 컨디션 기반 조언 */}
        {conditionAdvice && (
          <p className={`text-sm ${conditionAdvice.color} mb-3`}>
            💡 {conditionAdvice.text}
          </p>
        )}
        
        {/* 🔗 LIFE ↔ WORK 크로스 리마인드 */}
        {(() => {
          const todayPersonal = mockPersonalSchedule.filter(s => !s.daysFromNow);
          const todayWorkMeeting = mockWorkLifeImpact.importantMeetings[0];
          const hasLifeReminder = todayPersonal.length > 0;
          const hasWorkReminder = todayWorkMeeting && !isEvening;
          
          if (!hasLifeReminder && !hasWorkReminder) return null;
          
          return (
            <div className="space-y-2 mb-3">
              {/* LIFE → WORK: 개인 일정 때문에 업무 일찍 마무리 */}
              {hasLifeReminder && !isEvening && (
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <div className="flex items-start gap-2">
                    <span className="text-base">{todayPersonal[0].icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700">
                        오늘 {todayPersonal[0].time} {todayPersonal[0].title} 있어요
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        {(() => {
                          const [h, m] = todayPersonal[0].time.split(':').map(Number);
                          const prepTime = todayPersonal[0].prepTime || 30;
                          const endHour = h - Math.floor(prepTime / 60);
                          const endMin = m - (prepTime % 60);
                          return `${endHour}:${endMin < 10 ? '0' + endMin : endMin}까지 업무 마무리하면 좋겠어요`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* WORK → LIFE: 중요 미팅 전 컨디션 관리 */}
              {hasWorkReminder && (
                <div className="bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE] rounded-lg p-3 border border-[#EDE9FE]">
                  <div className="flex items-start gap-2">
                    <span className="text-base">🧘</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#7C6CD6]">
                        {todayWorkMeeting.time} {todayWorkMeeting.title} 앞두고 있어요
                      </p>
                      <p className="text-[11px] text-[#8B7CF7] mt-0.5">
                        {todayWorkMeeting.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        
        {/* 🎯 지금 이거부터 */}
        {topTask && !isEvening && (
          <div className="bg-gradient-to-r from-[#A996FF]/10 to-[#8B7CF7]/10 rounded-xl p-4 border border-[#A996FF]/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#A996FF] font-semibold">🎯 지금 이거부터</p>
                {conditionAdvice?.adjusted && (
                  <span className="text-[11px] px-1.5 py-0.5 bg-[#A996FF]/20 text-[#A996FF] rounded-full">
                    컨디션 맞춤
                  </span>
                )}
              </div>
              {adjustedTasks.length > 1 && (
                <button 
                  onClick={() => setShowTaskOptions(!showTaskOptions)}
                  className="text-xs text-[#A996FF] font-medium flex items-center gap-0.5"
                >
                  {showTaskOptions ? '접기' : '다른 옵션'}
                  {showTaskOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
            
            {/* 메인 추천 (1위) */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-bold ${textPrimary}`}>{topTask.title}</p>
                  <span className="text-[11px] px-1.5 py-0.5 bg-[#A996FF] text-white rounded-full">추천</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className={`text-xs ${textSecondary}`}>
                    {topTask.project} {topTask.deadline && `· ${topTask.deadline}`}
                  </p>
                  {topTask.importance === 'low' && energy <= 40 && (
                    <span className="text-[11px] px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded">가벼움</span>
                  )}
                  {topTask.importance === 'high' && energy >= 70 && (
                    <span className="text-[11px] px-1.5 py-0.5 bg-[#A996FF]100 text-[#A996FF]600 rounded">도전</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => onStartFocus && onStartFocus(topTask)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <Zap size={14} />
                시작
              </button>
            </div>
            
            {/* 다른 옵션들 (2위, 3위) */}
            {showTaskOptions && adjustedTasks.length > 1 && (
              <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-[#A996FF]/20'} space-y-2`}>
                <p className={`text-[11px] ${textSecondary} mb-2`}>🐧 다른 것부터 하고 싶으시면 여기서 골라주세요</p>
                {adjustedTasks.slice(1, 4).map((task, idx) => (
                  <div 
                    key={task.id}
                    className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-700/60 hover:bg-gray-700' : 'bg-white/60 hover:bg-white/80'} rounded-lg transition-all`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] ${textSecondary} font-medium`}>#{idx + 2}</span>
                        <p className={`font-medium ${textPrimary} text-sm truncate`}>{task.title}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={`text-[11px] ${textSecondary}`}>{task.project}</p>
                        {task.importance === 'high' && (
                          <span className="text-[11px] px-1 py-0.5 bg-red-50 text-red-500 rounded">높음</span>
                        )}
                        {task.importance === 'low' && (
                          <span className={`text-[11px] px-1 py-0.5 ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'} rounded`}>낮음</span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        onStartFocus && onStartFocus(task);
                        setShowTaskOptions(false);
                      }}
                      className={`px-3 py-1.5 ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-600'} hover:bg-[#A996FF] hover:text-white rounded-lg text-xs font-semibold transition-all`}
                    >
                      시작
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* 저녁: 오늘 하루 리뷰 */}
        {isEvening && (
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-xs text-emerald-600 font-semibold mb-2">📊 오늘 하루</p>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div>
                <p className="text-xl font-bold text-emerald-600">{doneTasks.length}</p>
                <p className="text-[11px] text-gray-500">완료</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#A996FF]">{Math.floor(mockCompletedHistory.stats.totalFocusTime / 7 / 60)}h</p>
                <p className="text-[11px] text-gray-500">집중</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#A996FF]">🔥{mockCompletedHistory.stats.streak}</p>
                <p className="text-[11px] text-gray-500">연속</p>
              </div>
            </div>
            <button
              onClick={() => setShowEveningReview(true)}
              className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-all"
            >
              🌙 하루 마무리하기
            </button>
          </div>
        )}
      </div>
      
      {/* 컨디션 퀵 체크 */}
      <div className={`${cardBg} backdrop-blur-xl rounded-xl shadow-sm p-4 mb-4 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-semibold ${textPrimary}`}>지금 컨디션</span>
          <span className={`text-xs ${textSecondary}`}>{energy}%</span>
        </div>
        <div className="flex gap-2">
          {[
            { value: 30, emoji: '😫', label: '힘듦' },
            { value: 50, emoji: '😐', label: '보통' },
            { value: 70, emoji: '😊', label: '괜찮음' },
            { value: 90, emoji: '🔥', label: '최고' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setEnergy(opt.value)}
              className={`flex-1 py-2 rounded-xl text-center transition-all ${
                Math.abs(energy - opt.value) < 15
                  ? 'bg-[#A996FF] text-white shadow-md scale-105'
                  : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <p className="text-[11px] mt-0.5">{opt.label}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* 📅 오늘 일정 */}
      {events.length > 0 && (
        <div className={`${cardBg} backdrop-blur-xl rounded-xl shadow-sm p-4 mb-4 border ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
            <span>📅</span> 오늘 일정
          </h3>
          <div className="space-y-2">
            {events.slice(0, 3).map(event => {
              const eventHour = parseInt(event.start.split(':')[0]);
              const isPast = eventHour < hour;
              const isNow = eventHour === hour;
              const isSoon = eventHour === hour + 1;
              
              return (
                <div 
                  key={event.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl ${
                    isPast ? 'opacity-50' :
                    isNow ? 'bg-[#A996FF]/10 ring-1 ring-[#A996FF]/30' :
                    isSoon ? (darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]') : (darkMode ? 'bg-gray-700/50' : 'bg-gray-50')
                  }`}
                >
                  <div className={`w-1 h-8 rounded-full ${event.color}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isPast ? (darkMode ? 'line-through text-gray-500' : 'line-through text-gray-400') : textPrimary}`}>
                      {event.title}
                    </p>
                    <p className={`text-xs ${textSecondary}`}>{event.start}</p>
                  </div>
                  {isNow && <span className="text-[11px] px-2 py-1 bg-[#A996FF] text-white rounded-full font-medium">지금</span>}
                  {isSoon && <span className={`text-[11px] px-2 py-1 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-[#EDE9FE] text-[#7C6CD6]'} rounded-full font-medium`}>곧</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* ⚠️ 잊지 마세요 */}
      {allReminders.length > 0 && (
        <div className={`${cardBg} backdrop-blur-xl rounded-xl shadow-sm p-4 mb-4 border ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
            <span>⚠️</span> 잊지 마세요
            {allReminders.filter(r => r.urgent).length > 0 && (
              <span className="text-[11px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">
                {allReminders.filter(r => r.urgent).length}
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {(showAllReminders ? allReminders : allReminders.slice(0, 3)).map(item => (
              <div 
                key={item.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl ${
                  item.urgent 
                    ? (darkMode ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-100')
                    : (darkMode ? 'bg-gray-700/50' : 'bg-gray-50')
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${item.urgent ? (darkMode ? 'text-red-300' : 'text-red-700') : textPrimary}`}>
                    {item.title}
                  </p>
                </div>
                <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                  item.urgent 
                    ? (darkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-600')
                    : (darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500')
                }`}>
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
          {allReminders.length > 3 && (
            <button 
              onClick={() => setShowAllReminders(!showAllReminders)}
              className="w-full mt-2 py-2 text-xs text-[#A996FF] font-medium"
            >
              {showAllReminders ? '접기' : `+${allReminders.length - 3}개 더 보기`}
            </button>
          )}
        </div>
      )}
      
      {/* 알프레도 채팅 바로가기 */}
      <button
        onClick={onOpenChat}
        className={`w-full ${cardBg} backdrop-blur-xl rounded-xl shadow-sm p-4 flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white/80'} transition-all mb-4 border ${borderColor}`}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF]/20 to-[#8B7CF7]/20 rounded-xl flex items-center justify-center text-lg">
          💬
        </div>
        <div className="flex-1 text-left">
          <p className={`text-sm font-medium ${textPrimary}`}>알프레도에게 물어보기</p>
          <p className={`text-xs ${textSecondary}`}>일정 변경, 조언, 뭐든 물어보세요</p>
        </div>
        <ChevronRight size={18} className={textSecondary} />
      </button>
      
      {/* 📊 인사이트 섹션 (통합) */}
      <div className={`${cardBg} backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
        <p className={`text-xs font-semibold ${textSecondary} mb-3`}>📊 나의 인사이트</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onOpenWeeklyReview}
            className={`flex flex-col items-center p-3 ${darkMode ? 'bg-[#A996FF]/10 hover:bg-[#A996FF]/20' : 'bg-gradient-to-br from-[#A996FF]/10 to-[#8B7CF7]/10 hover:from-[#A996FF]/20 hover:to-[#8B7CF7]/20'} rounded-xl transition-all`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-base shadow-md mb-2">
              📊
            </div>
            <p className={`text-xs font-medium ${textPrimary}`}>주간 리뷰</p>
          </button>
          
          <button
            onClick={onOpenHabitHeatmap}
            className={`flex flex-col items-center p-3 ${darkMode ? 'bg-emerald-900/30 hover:bg-emerald-900/50' : 'bg-gradient-to-br from-emerald-50 to-emerald-50 hover:from-emerald-100 hover:to-emerald-100'} rounded-xl transition-all`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-base shadow-md mb-2">
              🟩
            </div>
            <p className={`text-xs font-medium ${textPrimary}`}>습관 히트맵</p>
          </button>
          
          <button
            onClick={onOpenEnergyRhythm}
            className={`flex flex-col items-center p-3 ${darkMode ? 'bg-[#A996FF]/20 hover:bg-[#A996FF]/30' : 'bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] hover:from-[#EDE9FE] hover:to-[#EDE9FE]'} rounded-xl transition-all`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#EDE9FE]0 rounded-xl flex items-center justify-center text-base shadow-md mb-2">
              ⚡
            </div>
            <p className={`text-xs font-medium ${textPrimary}`}>에너지 리듬</p>
          </button>
        </div>
      </div>
      
      {/* 저녁 마무리 모달 */}
      {showEveningReview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setShowEveningReview(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] p-6 text-white text-center">
              <div className="text-4xl mb-2">🌙</div>
              <h2 className="text-xl font-bold">오늘 하루 마무리</h2>
              <p className="text-white/80 text-sm mt-1">수고했어요, Boss!</p>
            </div>
            
            {/* 통계 */}
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{doneTasks.length}</p>
                  <p className="text-[11px] text-emerald-600/70">완료</p>
                </div>
                <div className="bg-[#F5F3FF] rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-[#8B7CF7]">{Math.floor(mockCompletedHistory.stats.totalFocusTime / 7 / 60)}h</p>
                  <p className="text-[11px] text-[#8B7CF7]/70">집중</p>
                </div>
                <div className="bg-[#F5F3FF] rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-[#8B7CF7]">🔥{mockCompletedHistory.stats.streak}</p>
                  <p className="text-[11px] text-[#8B7CF7]/70">연속</p>
                </div>
              </div>
              
              {/* 오늘의 하이라이트 */}
              {doneTasks.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">🎉 오늘의 하이라이트</p>
                  <p className="text-sm text-gray-700 font-semibold">
                    "{doneTasks[0]?.title}" 완료!
                  </p>
                </div>
              )}
              
              {/* 한 줄 기록 */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-medium mb-2">📝 오늘 한 줄 (선택)</p>
                <input
                  type="text"
                  value={eveningNote}
                  onChange={(e) => setEveningNote(e.target.value)}
                  placeholder="오늘 하루는 어땠나요?"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C4B5FD] outline-none"
                />
              </div>
              
              {/* 알프레도 메시지 */}
              <div className="bg-[#F5F3FF] rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🐧</span>
                  <p className="text-sm text-[#6D28D9]">
                    {doneTasks.length >= 3 
                      ? "오늘 정말 열심히 했어요! 푹 쉬고 내일 또 같이 달려봐요." 
                      : doneTasks.length > 0
                      ? "하나씩 해낸 게 중요해요. 내일 아침에 또 정리해드릴게요."
                      : "괜찮아요, 쉬어가는 날도 필요해요. 내일 다시 시작하면 돼요."}
                  </p>
                </div>
              </div>
              
              {/* 버튼 */}
              <button
                onClick={() => {
                  setShowEveningReview(false);
                  setEveningNote('');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-semibold"
              >
                하루 마무리 완료 😴
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 📡 연동 상태 미니 카드 */}
      <div className={`${cardBg} backdrop-blur-xl rounded-xl shadow-sm p-4 mb-4 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold ${textPrimary} flex items-center gap-2`}>
            <Zap size={14} className="text-[#A996FF]" /> 연동 서비스
          </h3>
          <button 
            onClick={onOpenSettings}
            className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} hover:text-[#A996FF]`}
          >
            관리 →
          </button>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'googleCalendar', icon: '📅', name: 'Calendar' },
            { key: 'gmail', icon: '📧', name: 'Gmail' },
            { key: 'notion', icon: '📝', name: 'Notion' },
            { key: 'slack', icon: '💬', name: 'Slack' },
          ].map(service => (
            <div 
              key={service.key}
              className={`flex-1 py-2 px-2 rounded-xl text-center ${
                connections?.[service.key]
                  ? (darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                  : (darkMode ? 'bg-gray-700/50 text-gray-500' : 'bg-gray-100 text-gray-400')
              }`}
            >
              <span className="text-lg">{service.icon}</span>
              <p className={`text-[10px] mt-0.5 ${connections?.[service.key] ? '' : 'opacity-50'}`}>
                {connections?.[service.key] ? '연결됨' : '미연결'}
              </p>
            </div>
          ))}
        </div>
        {(connections?.googleCalendar || connections?.gmail) && (
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2 text-center`}>
            ✓ 마지막 동기화: 방금 전
          </p>
        )}
      </div>
      
    </div>
  );
};

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
    
    // 완료했을 때 XP & 알프레도 피드백
    if (isCompleting && task) {
      handleTaskCompleteWithXP(task, true); // Big3은 항상 true
      const completedCount = newTasks.filter(t => t.status === 'done').length;
      
      // 🐧 알프레도 피드백
      const feedback = getTaskCompleteFeedback(task, completedCount, newTasks.length);
      showAlfredoFeedback(feedback.msg, 'praise', feedback.icon);
      
      // Big3 전체 완료 보너스
      if (completedCount === newTasks.length) {
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
    
    // 완료했을 때 XP & 알프레도 피드백
    if (isCompleting && task) {
      handleTaskCompleteWithXP(task, false);
      const completedCount = newTasks.filter(t => t.status === 'done').length;
      
      // 🐧 알프레도 피드백
      const feedback = getTaskCompleteFeedback(task, completedCount, newTasks.length);
      showAlfredoFeedback(feedback.msg, 'praise', feedback.icon);
    }
  };
  
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
            onOpenDndModal={() => setShowDndModal(true)}
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
          {/* 빠른 기록 버튼 */}
          <button 
            onClick={() => setShowQuickCapture(true)} 
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200 hover:scale-105 transition-all"
          >
            <Plus size={22} className="text-gray-600" />
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
