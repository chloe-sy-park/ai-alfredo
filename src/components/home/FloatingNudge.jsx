import React, { useState, useEffect, useCallback } from 'react';
import {
  X, ChevronRight, Clock, Calendar, Coffee,
  AlertTriangle, Zap, Sun, Moon, Umbrella,
  Battery, BatteryLow, BatteryCharging, Heart
} from 'lucide-react';
import { getContextualComment, getTimeBasedTone, getSpecialDayComment } from './AlfredoComments';

// ============================================
// 🐧 W1: 플로팅 넛지 시스템
// 알프레도가 먼저 말을 거는 선제적 대화
// ============================================

// 넛지 타입 설정
const NUDGE_TYPES = {
  greeting: {
    id: 'greeting',
    icon: Sun,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    priority: 1,
  },
  reminder: {
    id: 'reminder',
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    priority: 2,
  },
  deadline: {
    id: 'deadline',
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    priority: 3,
  },
  break: {
    id: 'break',
    icon: Coffee,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    priority: 2,
  },
  energy: {
    id: 'energy',
    icon: Battery,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    priority: 1,
  },
  care: {
    id: 'care',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    priority: 2,
  },
  weather: {
    id: 'weather',
    icon: Umbrella,
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    priority: 1,
  },
  suggestion: {
    id: 'suggestion',
    icon: Zap,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    priority: 1,
  },
};

// 넛지 생성 엔진
export const generateNudges = ({
  currentTime = new Date(),
  energy = 50,
  mood = 'neutral',
  pendingTasks = [],
  completedToday = 0,
  streak = 0,
  hasUpcomingMeeting = null, // { title, minutesUntil }
  todayDeadlines = [],
  minutesSinceBreak = 0,
  weather = null,
  lastActivity = null,
}) => {
  const nudges = [];
  const hour = currentTime.getHours();
  const timeTone = getTimeBasedTone(hour);
  
  // ===== 1. 마감 임박 (가장 높은 우선순위) =====
  if (todayDeadlines.length > 0) {
    const urgentTask = todayDeadlines[0];
    nudges.push({
      id: 'deadline-urgent',
      type: 'deadline',
      message: `오늘 마감: ${urgentTask.title}`,
      subMessage: '급한 거 먼저 처리해요',
      action: { type: 'focusTask', payload: urgentTask },
      dismissible: true,
      priority: 10,
    });
  }
  
  // ===== 2. 미팅 임박 =====
  if (hasUpcomingMeeting && hasUpcomingMeeting.minutesUntil <= 30) {
    nudges.push({
      id: 'meeting-soon',
      type: 'reminder',
      message: `${hasUpcomingMeeting.minutesUntil}분 후 미팅`,
      subMessage: hasUpcomingMeeting.title,
      action: { type: 'showMeeting', payload: hasUpcomingMeeting },
      dismissible: true,
      priority: 9,
    });
  }
  
  // ===== 3. 휴식 필요 (2시간 이상 연속 작업) =====
  if (minutesSinceBreak >= 120) {
    nudges.push({
      id: 'break-needed',
      type: 'break',
      message: '2시간째예요. 잠깐 쉬어가요',
      subMessage: '스트레칭하고 물 마시고 와요',
      action: { type: 'takeBreak' },
      dismissible: true,
      priority: 7,
    });
  } else if (minutesSinceBreak >= 60) {
    nudges.push({
      id: 'break-suggestion',
      type: 'break',
      message: '1시간 지났어요. 눈 좀 쉬게 해요',
      subMessage: null,
      action: { type: 'takeBreak' },
      dismissible: true,
      priority: 4,
    });
  }
  
  // ===== 4. 에너지/기분 기반 케어 =====
  if (energy < 30) {
    nudges.push({
      id: 'low-energy-care',
      type: 'energy',
      message: '오늘은 천천히 가도 돼요',
      subMessage: '컨디션 안 좋으면 쉬는 게 나아요',
      action: { type: 'rest' },
      dismissible: true,
      priority: 5,
    });
  }
  
  if (mood === 'down') {
    nudges.push({
      id: 'mood-care',
      type: 'care',
      message: '옆에 있을게요',
      subMessage: '아무것도 안 해도 괜찮아요',
      action: null,
      dismissible: true,
      priority: 6,
    });
  }
  
  // ===== 5. 할 일 관련 =====
  const pendingCount = pendingTasks.length;
  
  if (pendingCount === 0 && completedToday > 0) {
    nudges.push({
      id: 'all-done',
      type: 'suggestion',
      message: '오늘 할 일 올클. 수고했어요',
      subMessage: '푹 쉬어도 돼요',
      action: { type: 'rest' },
      dismissible: true,
      priority: 3,
    });
  } else if (pendingCount >= 5 && energy >= 50) {
    nudges.push({
      id: 'many-tasks',
      type: 'suggestion',
      message: '많긴 한데, 하나씩 가요',
      subMessage: '제일 급한 것만 먼저',
      action: { type: 'prioritize' },
      dismissible: true,
      priority: 3,
    });
  }
  
  // ===== 6. 시간대별 인사 (기본) =====
  if (nudges.length === 0) {
    const specialDay = getSpecialDayComment(currentTime);
    if (specialDay) {
      nudges.push({
        id: 'special-day',
        type: 'greeting',
        message: specialDay,
        subMessage: null,
        action: null,
        dismissible: true,
        priority: 1,
      });
    } else {
      // 컨텍스트 기반 코멘트
      const contextComment = getContextualComment({
        hour,
        energy,
        mood,
        pendingTasks: pendingCount,
        completedToday,
        streak,
      });
      
      nudges.push({
        id: 'contextual-greeting',
        type: 'greeting',
        message: contextComment,
        subMessage: null,
        action: null,
        dismissible: true,
        priority: 1,
      });
    }
  }
  
  // ===== 7. 날씨 알림 =====
  if (weather) {
    if (weather.willRain && hour >= 6 && hour <= 9) {
      nudges.push({
        id: 'weather-rain',
        type: 'weather',
        message: '오늘 비 와요. 우산 챙기세요',
        subMessage: null,
        action: null,
        dismissible: true,
        priority: 2,
      });
    }
    if (weather.tempLow <= 5 && hour >= 6 && hour <= 9) {
      nudges.push({
        id: 'weather-cold',
        type: 'weather',
        message: '추워요. 따뜻하게 입으세요',
        subMessage: null,
        action: null,
        dismissible: true,
        priority: 2,
      });
    }
  }
  
  // 우선순위로 정렬하고 최대 2개만 반환
  return nudges
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 2);
};

// 플로팅 넛지 컴포넌트
export const FloatingNudge = ({
  nudge,
  onDismiss,
  onAction,
  darkMode = false,
  position = 'bottom', // 'top' | 'bottom'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  
  const typeConfig = NUDGE_TYPES[nudge.type] || NUDGE_TYPES.suggestion;
  const IconComponent = typeConfig.icon;
  
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.(nudge.id);
    }, 300);
  }, [nudge.id, onDismiss]);
  
  const handleAction = useCallback(() => {
    if (nudge.action) {
      onAction?.(nudge.action);
    }
    handleDismiss();
  }, [nudge.action, onAction, handleDismiss]);
  
  // 자동 dismiss (30초 후)
  useEffect(() => {
    if (nudge.dismissible) {
      const timer = setTimeout(handleDismiss, 30000);
      return () => clearTimeout(timer);
    }
  }, [nudge.dismissible, handleDismiss]);
  
  if (!isVisible) return null;
  
  const positionClasses = position === 'top' 
    ? 'top-4' 
    : 'bottom-24'; // 하단 네비 위
  
  return (
    <div 
      className={`fixed left-4 right-4 ${positionClasses} z-40 transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div 
        className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} 
          rounded-2xl shadow-lg border overflow-hidden`}
      >
        <div className="flex items-start gap-3 p-4">
          {/* 아이콘 */}
          <div className={`p-2 rounded-xl ${typeConfig.bgColor} ${typeConfig.color}`}>
            <IconComponent size={20} />
          </div>
          
          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              🐧 {nudge.message}
            </p>
            {nudge.subMessage && (
              <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {nudge.subMessage}
              </p>
            )}
            
            {/* 액션 버튼 */}
            {nudge.action && (
              <button
                onClick={handleAction}
                className={`mt-2 text-sm font-medium ${typeConfig.color} flex items-center gap-1`}
              >
                {nudge.action.type === 'focusTask' && '이거 먼저 하기'}
                {nudge.action.type === 'showMeeting' && '준비하기'}
                {nudge.action.type === 'takeBreak' && '잠깐 쉬기'}
                {nudge.action.type === 'rest' && '쉬러 가기'}
                {nudge.action.type === 'prioritize' && '우선순위 정하기'}
                <ChevronRight size={14} />
              </button>
            )}
          </div>
          
          {/* 닫기 버튼 */}
          {nudge.dismissible && (
            <button
              onClick={handleDismiss}
              className={`p-1 rounded-lg ${
                darkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-100 text-gray-400'
              }`}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 넛지 스택 (여러 개 표시)
export const NudgeStack = ({
  nudges = [],
  onDismiss,
  onAction,
  darkMode = false,
}) => {
  const [dismissedIds, setDismissedIds] = useState(new Set());
  
  const handleDismiss = useCallback((id) => {
    setDismissedIds(prev => new Set([...prev, id]));
    onDismiss?.(id);
  }, [onDismiss]);
  
  const visibleNudges = nudges.filter(n => !dismissedIds.has(n.id));
  
  if (visibleNudges.length === 0) return null;
  
  // 가장 중요한 넛지만 표시
  const topNudge = visibleNudges[0];
  
  return (
    <FloatingNudge
      nudge={topNudge}
      onDismiss={handleDismiss}
      onAction={onAction}
      darkMode={darkMode}
      position="bottom"
    />
  );
};

// 컴팩트 넛지 (상태바 내장용)
export const CompactNudge = ({
  message,
  type = 'suggestion',
  onTap,
  darkMode = false,
}) => {
  const typeConfig = NUDGE_TYPES[type] || NUDGE_TYPES.suggestion;
  
  return (
    <button
      onClick={onTap}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
        darkMode 
          ? 'bg-gray-700 hover:bg-gray-600' 
          : `${typeConfig.bgColor} hover:opacity-80`
      }`}
    >
      <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        🐧 {message}
      </span>
      <ChevronRight size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
    </button>
  );
};

// 넛지 훅 (상태 관리)
export const useNudges = ({
  energy = 50,
  mood = 'neutral',
  pendingTasks = [],
  completedToday = 0,
  streak = 0,
  hasUpcomingMeeting = null,
  todayDeadlines = [],
  minutesSinceBreak = 0,
  weather = null,
  refreshInterval = 60000, // 1분마다 갱신
}) => {
  const [nudges, setNudges] = useState([]);
  
  const refresh = useCallback(() => {
    const newNudges = generateNudges({
      currentTime: new Date(),
      energy,
      mood,
      pendingTasks,
      completedToday,
      streak,
      hasUpcomingMeeting,
      todayDeadlines,
      minutesSinceBreak,
      weather,
    });
    setNudges(newNudges);
  }, [
    energy, mood, pendingTasks, completedToday, streak,
    hasUpcomingMeeting, todayDeadlines, minutesSinceBreak, weather
  ]);
  
  // 초기 로드
  useEffect(() => {
    refresh();
  }, [refresh]);
  
  // 주기적 갱신
  useEffect(() => {
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return {
    nudges,
    refresh,
    hasUrgent: nudges.some(n => n.priority >= 8),
  };
};

export default FloatingNudge;
