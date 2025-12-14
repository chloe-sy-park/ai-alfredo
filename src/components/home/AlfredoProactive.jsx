import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, BellRing, X, Clock, Calendar, Cloud, Sun, 
  Umbrella, Thermometer, AlertTriangle, Coffee,
  FileText, Users, MapPin, ChevronRight, Zap,
  Briefcase, Car, Train, Bike, Footprints
} from 'lucide-react';

// ============================================
// 🔔 W3-1: 능동적 알림 시스템
// 알프레도가 먼저 알려주는 스마트 알림
// ============================================

// 알림 타입 정의
const NOTIFICATION_TYPES = {
  reminder: {
    id: 'reminder',
    icon: Bell,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  weather: {
    id: 'weather',
    icon: Cloud,
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  meeting: {
    id: 'meeting',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  deadline: {
    id: 'deadline',
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  suggestion: {
    id: 'suggestion',
    icon: Zap,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  break: {
    id: 'break',
    icon: Coffee,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
};

// 알림 생성 엔진
export const generateProactiveNotifications = ({
  currentTime = new Date(),
  events = [],
  tasks = [],
  weather = null,
  energy = 50,
  lastBreak = null,
  commutePlan = null,
}) => {
  const notifications = [];
  const hour = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  
  // 1. 다음 일정 알림 (30분/15분/5분 전)
  events.forEach(event => {
    const eventTime = new Date(event.start);
    const diffMinutes = Math.round((eventTime - currentTime) / (1000 * 60));
    
    if (diffMinutes === 30 || diffMinutes === 15 || diffMinutes === 5) {
      notifications.push({
        id: `meeting-${event.id}-${diffMinutes}`,
        type: 'meeting',
        priority: diffMinutes === 5 ? 'high' : 'medium',
        title: `${diffMinutes}분 후 미팅`,
        message: event.title,
        subMessage: event.location ? `📍 ${event.location}` : null,
        action: { type: 'openEvent', payload: event },
        timestamp: currentTime,
        alfredoSays: diffMinutes === 5 
          ? "곧 시작해요! 준비됐나요? 🐧"
          : "미리 준비해두면 여유로워요~",
      });
    }
  });
  
  // 2. 마감 임박 알림
  tasks.forEach(task => {
    if (task.deadline) {
      const isToday = task.deadline.includes('오늘') || task.deadline.includes('D-0');
      const isTomorrow = task.deadline.includes('D-1') || task.deadline.includes('내일');
      
      if (isToday && task.status !== 'done') {
        notifications.push({
          id: `deadline-${task.id}`,
          type: 'deadline',
          priority: 'high',
          title: '오늘 마감!',
          message: task.title,
          action: { type: 'focusTask', payload: task },
          timestamp: currentTime,
          alfredoSays: "급한 건 먼저 처리해요! 💪",
        });
      } else if (isTomorrow && hour >= 18 && task.status !== 'done') {
        notifications.push({
          id: `deadline-tomorrow-${task.id}`,
          type: 'deadline',
          priority: 'medium',
          title: '내일 마감 예정',
          message: task.title,
          action: { type: 'focusTask', payload: task },
          timestamp: currentTime,
          alfredoSays: "오늘 미리 해두면 내일이 편해요~",
        });
      }
    }
  });
  
  // 3. 휴식 알림 (2시간 이상 연속 작업 시)
  if (lastBreak) {
    const minutesSinceBreak = Math.round((currentTime - new Date(lastBreak)) / (1000 * 60));
    if (minutesSinceBreak >= 120) {
      notifications.push({
        id: 'break-reminder',
        type: 'break',
        priority: 'low',
        title: '잠깐 쉬어가요',
        message: `${Math.floor(minutesSinceBreak / 60)}시간째 집중 중이에요`,
        action: { type: 'takeBreak' },
        timestamp: currentTime,
        alfredoSays: "스트레칭하고 물 마시고 올까요? 🧘",
      });
    }
  }
  
  // 4. 에너지 기반 제안
  if (energy < 30 && hour >= 14 && hour <= 17) {
    notifications.push({
      id: 'low-energy-suggestion',
      type: 'suggestion',
      priority: 'low',
      title: '에너지 충전 타임',
      message: '오후 슬럼프가 온 것 같아요',
      action: { type: 'showEnergySuggestions' },
      timestamp: currentTime,
      alfredoSays: "짧은 산책이나 커피 한 잔 어때요? ☕",
    });
  }
  
  // 5. 아침 브리핑 시간 (8-9시)
  if (hour === 8 && minutes < 30) {
    const todayEvents = events.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate.toDateString() === currentTime.toDateString();
    });
    const todayTasks = tasks.filter(t => t.status !== 'done');
    
    notifications.push({
      id: 'morning-briefing',
      type: 'reminder',
      priority: 'medium',
      title: '좋은 아침이에요! ☀️',
      message: `오늘 일정 ${todayEvents.length}개, 할 일 ${todayTasks.length}개`,
      action: { type: 'showBriefing' },
      timestamp: currentTime,
      alfredoSays: "오늘 하루도 같이 해봐요! 🐧",
    });
  }
  
  // 6. 저녁 정리 시간 (20-21시)
  if (hour === 20 && minutes < 30) {
    const completedToday = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    
    notifications.push({
      id: 'evening-review',
      type: 'reminder',
      priority: 'low',
      title: '하루 마무리 시간',
      message: `오늘 ${completedToday}/${totalTasks}개 완료!`,
      action: { type: 'showReview' },
      timestamp: currentTime,
      alfredoSays: "오늘도 수고했어요! 내일 준비해볼까요?",
    });
  }
  
  return notifications.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};


// ============================================
// ⛅ W3-2: 날씨 기반 알림
// ============================================

// 날씨 상태별 알림 생성
export const generateWeatherNotifications = ({
  weather,
  commuteTimes = [], // ['08:30', '18:00'] 출퇴근 시간
  currentTime = new Date(),
}) => {
  if (!weather) return [];
  
  const notifications = [];
  const hour = currentTime.getHours();
  
  // 비 예보
  if (weather.willRain) {
    // 출근 전 (6-8시)
    if (hour >= 6 && hour <= 8) {
      notifications.push({
        id: 'weather-rain-morning',
        type: 'weather',
        priority: 'medium',
        title: '오늘 비 소식 🌧️',
        message: `${weather.rainTime || '오후'}에 비가 올 수 있어요`,
        icon: Umbrella,
        action: { type: 'showWeather' },
        alfredoSays: "우산 챙기는 거 잊지 마세요! ☂️",
        quickAction: {
          label: '우산 챙김 ✓',
          action: 'dismissWithConfirm',
        },
      });
    }
  }
  
  // 기온 알림
  if (weather.tempHigh >= 30) {
    notifications.push({
      id: 'weather-hot',
      type: 'weather',
      priority: 'low',
      title: '오늘 더워요 🥵',
      message: `최고 ${weather.tempHigh}°C`,
      icon: Thermometer,
      alfredoSays: "물 많이 마시고, 시원하게 입으세요!",
    });
  } else if (weather.tempLow <= 5) {
    notifications.push({
      id: 'weather-cold',
      type: 'weather',
      priority: 'low',
      title: '오늘 추워요 🥶',
      message: `최저 ${weather.tempLow}°C`,
      icon: Thermometer,
      alfredoSays: "따뜻하게 입고 나가세요!",
    });
  }
  
  // 미세먼지
  if (weather.airQuality === 'bad' || weather.airQuality === 'veryBad') {
    notifications.push({
      id: 'weather-air',
      type: 'weather',
      priority: 'medium',
      title: '미세먼지 주의 😷',
      message: weather.airQuality === 'veryBad' ? '매우 나쁨' : '나쁨',
      alfredoSays: "마스크 챙기시고, 야외 활동은 줄이세요!",
    });
  }
  
  return notifications;
};

// 날씨 기반 리마인더 체크리스트
export const WeatherChecklist = ({
  weather,
  onItemCheck,
  darkMode = false,
}) => {
  const [checkedItems, setCheckedItems] = useState([]);
  
  const items = [];
  
  if (weather?.willRain) {
    items.push({ id: 'umbrella', icon: Umbrella, label: '우산' });
  }
  if (weather?.tempLow <= 10) {
    items.push({ id: 'jacket', icon: '🧥', label: '겉옷' });
  }
  if (weather?.tempHigh >= 28) {
    items.push({ id: 'water', icon: '💧', label: '물병' });
  }
  if (weather?.airQuality === 'bad' || weather?.airQuality === 'veryBad') {
    items.push({ id: 'mask', icon: '😷', label: '마스크' });
  }
  
  if (items.length === 0) return null;
  
  const handleCheck = (itemId) => {
    const newChecked = checkedItems.includes(itemId)
      ? checkedItems.filter(id => id !== itemId)
      : [...checkedItems, itemId];
    setCheckedItems(newChecked);
    onItemCheck?.(itemId, !checkedItems.includes(itemId));
  };
  
  return (
    <div className={`${darkMode ? 'bg-sky-900/30' : 'bg-sky-50'} rounded-xl p-4`}>
      <p className={`text-sm font-medium ${darkMode ? 'text-sky-300' : 'text-sky-700'} mb-3`}>
        🐧 나가기 전 체크!
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => handleCheck(item.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
              checkedItems.includes(item.id)
                ? 'bg-sky-500 text-white'
                : darkMode 
                  ? 'bg-sky-800/50 text-sky-200' 
                  : 'bg-white text-sky-700 border border-sky-200'
            }`}
          >
            <span>{typeof item.icon === 'string' ? item.icon : <item.icon size={14} />}</span>
            <span>{item.label}</span>
            {checkedItems.includes(item.id) && <span>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
};


// ============================================
// 📋 W3-3: 미팅 준비 도우미
// ============================================

// 미팅 타입별 준비물 추천
const MEETING_PREP_ITEMS = {
  external: [ // 외부 미팅
    { id: 'businessCard', icon: '💳', label: '명함', essential: true },
    { id: 'laptop', icon: '💻', label: '노트북', essential: true },
    { id: 'charger', icon: '🔌', label: '충전기', essential: false },
    { id: 'documents', icon: '📄', label: '자료', essential: true },
    { id: 'notebook', icon: '📓', label: '노트', essential: false },
  ],
  presentation: [ // 발표
    { id: 'slides', icon: '📊', label: '발표자료', essential: true },
    { id: 'clicker', icon: '🎮', label: '클리커', essential: false },
    { id: 'backup', icon: '💾', label: '백업파일', essential: true },
    { id: 'water', icon: '💧', label: '물', essential: false },
  ],
  interview: [ // 면접
    { id: 'resume', icon: '📄', label: '이력서', essential: true },
    { id: 'portfolio', icon: '📁', label: '포트폴리오', essential: false },
    { id: 'questions', icon: '❓', label: '질문 준비', essential: true },
  ],
  internal: [ // 내부 미팅
    { id: 'agenda', icon: '📝', label: '안건', essential: true },
    { id: 'notebook', icon: '📓', label: '노트', essential: false },
  ],
  default: [
    { id: 'notebook', icon: '📓', label: '노트', essential: false },
    { id: 'pen', icon: '🖊️', label: '펜', essential: false },
  ],
};

// 미팅 타입 감지
const detectMeetingType = (event) => {
  const title = (event.title || '').toLowerCase();
  const description = (event.description || '').toLowerCase();
  const combined = title + ' ' + description;
  
  if (combined.includes('발표') || combined.includes('presentation') || combined.includes('pt')) {
    return 'presentation';
  }
  if (combined.includes('면접') || combined.includes('interview')) {
    return 'interview';
  }
  if (combined.includes('외부') || combined.includes('client') || combined.includes('고객')) {
    return 'external';
  }
  if (event.location && !event.location.includes('회의실') && !event.location.includes('zoom')) {
    return 'external';
  }
  if (combined.includes('팀') || combined.includes('내부') || combined.includes('싱크')) {
    return 'internal';
  }
  return 'default';
};

// 출발 시간 계산
const calculateDepartureTime = (event, travelMode = 'transit') => {
  const eventTime = new Date(event.start);
  const travelTimes = {
    walking: 15,
    transit: 30,
    driving: 20,
    bike: 20,
  };
  
  // 외부 미팅이면 여유시간 추가
  const bufferMinutes = event.location && !event.location.includes('회의실') ? 15 : 5;
  const travelMinutes = travelTimes[travelMode] || 30;
  
  const departureTime = new Date(eventTime);
  departureTime.setMinutes(departureTime.getMinutes() - travelMinutes - bufferMinutes);
  
  return {
    time: departureTime,
    travelMinutes,
    bufferMinutes,
    mode: travelMode,
  };
};

// 미팅 준비 카드 컴포넌트
export const MeetingPrepCard = ({
  event,
  onDismiss,
  onComplete,
  darkMode = false,
}) => {
  const [checkedItems, setCheckedItems] = useState([]);
  const meetingType = detectMeetingType(event);
  const prepItems = MEETING_PREP_ITEMS[meetingType] || MEETING_PREP_ITEMS.default;
  const departure = calculateDepartureTime(event);
  
  const eventTime = new Date(event.start);
  const now = new Date();
  const minutesUntil = Math.round((eventTime - now) / (1000 * 60));
  
  const handleCheck = (itemId) => {
    setCheckedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  const allEssentialChecked = prepItems
    .filter(item => item.essential)
    .every(item => checkedItems.includes(item.id));
  
  // 이동 수단 아이콘
  const travelIcons = {
    walking: Footprints,
    transit: Train,
    driving: Car,
    bike: Bike,
  };
  const TravelIcon = travelIcons[departure.mode] || Train;
  
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm opacity-80">
            {minutesUntil}분 후 미팅
          </span>
          <button onClick={onDismiss} className="p-1 hover:bg-white/20 rounded">
            <X size={16} />
          </button>
        </div>
        <h3 className="font-bold text-lg">{event.title}</h3>
        {event.location && (
          <p className="text-sm opacity-80 flex items-center gap-1 mt-1">
            <MapPin size={14} />
            {event.location}
          </p>
        )}
      </div>
      
      {/* 준비물 체크리스트 */}
      <div className="p-4">
        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
          🐧 준비물 체크!
        </p>
        <div className="space-y-2">
          {prepItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleCheck(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                checkedItems.includes(item.id)
                  ? 'bg-emerald-100 text-emerald-700'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-50 text-gray-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
              {item.essential && !checkedItems.includes(item.id) && (
                <span className="text-xs text-red-400">필수</span>
              )}
              {checkedItems.includes(item.id) && (
                <span className="text-emerald-500">✓</span>
              )}
            </button>
          ))}
        </div>
        
        {/* 출발 시간 안내 */}
        <div className={`mt-4 p-3 ${darkMode ? 'bg-amber-900/30' : 'bg-amber-50'} rounded-xl`}>
          <div className="flex items-center gap-2">
            <TravelIcon size={16} className={darkMode ? 'text-amber-400' : 'text-amber-600'} />
            <span className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
              {departure.time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}에 출발하면 여유로워요
            </span>
          </div>
        </div>
        
        {/* 알프레도 코멘트 */}
        <div className={`mt-4 p-3 ${darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]'} rounded-xl`}>
          <p className={`text-sm ${darkMode ? 'text-[#C4B5FD]' : 'text-[#8B7CF7]'}`}>
            🐧 {allEssentialChecked 
              ? "준비 완료! 화이팅이에요 💪" 
              : "필수 항목 체크 잊지 마세요~"}
          </p>
        </div>
        
        {/* 완료 버튼 */}
        <button
          onClick={onComplete}
          disabled={!allEssentialChecked}
          className={`w-full mt-4 py-3 rounded-xl font-bold transition-all ${
            allEssentialChecked
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
              : darkMode
                ? 'bg-gray-700 text-gray-500'
                : 'bg-gray-100 text-gray-400'
          }`}
        >
          {allEssentialChecked ? '준비 완료! 🚀' : '필수 항목을 체크해주세요'}
        </button>
      </div>
    </div>
  );
};


// ============================================
// 🔔 통합 알림 센터
// ============================================

export const NotificationCenter = ({
  notifications = [],
  onNotificationAction,
  onDismiss,
  onDismissAll,
  darkMode = false,
}) => {
  if (notifications.length === 0) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 text-center`}>
        <div className="text-4xl mb-3">🐧</div>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          새로운 알림이 없어요
        </p>
        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
          필요하면 제가 먼저 알려드릴게요!
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-1">
        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          🔔 알림 {notifications.length}개
        </p>
        <button
          onClick={onDismissAll}
          className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
        >
          모두 지우기
        </button>
      </div>
      
      {/* 알림 목록 */}
      {notifications.map(notification => {
        const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.reminder;
        const IconComponent = notification.icon || typeConfig.icon;
        
        return (
          <div
            key={notification.id}
            className={`${typeConfig.bgColor} border ${typeConfig.borderColor} rounded-xl p-4`}
          >
            <div className="flex items-start gap-3">
              {/* 아이콘 */}
              <div className={`p-2 rounded-lg bg-white ${typeConfig.color}`}>
                <IconComponent size={18} />
              </div>
              
              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-800 text-sm">
                    {notification.title}
                  </h4>
                  {notification.priority === 'high' && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                      긴급
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">
                  {notification.message}
                </p>
                {notification.subMessage && (
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.subMessage}
                  </p>
                )}
                
                {/* 알프레도 코멘트 */}
                {notification.alfredoSays && (
                  <p className="text-xs text-[#8B7CF7] mt-2">
                    🐧 {notification.alfredoSays}
                  </p>
                )}
                
                {/* 빠른 액션 */}
                <div className="flex items-center gap-2 mt-3">
                  {notification.action && (
                    <button
                      onClick={() => onNotificationAction?.(notification)}
                      className={`text-xs font-medium ${typeConfig.color} flex items-center gap-1`}
                    >
                      자세히 보기
                      <ChevronRight size={12} />
                    </button>
                  )}
                  {notification.quickAction && (
                    <button
                      onClick={() => {
                        onNotificationAction?.({ ...notification, quickAction: true });
                        onDismiss?.(notification.id);
                      }}
                      className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded"
                    >
                      {notification.quickAction.label}
                    </button>
                  )}
                </div>
              </div>
              
              {/* 닫기 */}
              <button
                onClick={() => onDismiss?.(notification.id)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 알림 벨 버튼 (헤더용)
export const NotificationBell = ({
  count = 0,
  hasUrgent = false,
  onClick,
  darkMode = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-full ${
        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
      } transition-colors`}
    >
      {hasUrgent ? (
        <BellRing size={22} className={darkMode ? 'text-amber-400' : 'text-amber-500'} />
      ) : (
        <Bell size={22} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
      )}
      
      {count > 0 && (
        <span className={`absolute -top-0.5 -right-0.5 w-5 h-5 ${
          hasUrgent ? 'bg-red-500' : 'bg-[#8B7CF7]'
        } text-white text-xs font-bold rounded-full flex items-center justify-center`}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};

export {
  NOTIFICATION_TYPES,
  detectMeetingType,
  calculateDepartureTime,
  MEETING_PREP_ITEMS,
};
