import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Clock, Target, Calendar, Zap, Heart, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

// localStorage 키
var STORAGE_KEY = 'lifebutler_notifications';

// 알림 타입 정의
export var NOTIFICATION_TYPES = {
  reminder: { icon: '⏰', color: 'text-amber-400', bgColor: 'bg-amber-500/20', priority: 2 },
  task: { icon: '✅', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', priority: 2 },
  event: { icon: '📅', color: 'text-blue-400', bgColor: 'bg-blue-500/20', priority: 3 },
  focus: { icon: '🎯', color: 'text-purple-400', bgColor: 'bg-purple-500/20', priority: 2 },
  streak: { icon: '🔥', color: 'text-orange-400', bgColor: 'bg-orange-500/20', priority: 1 },
  achievement: { icon: '🏆', color: 'text-amber-400', bgColor: 'bg-amber-500/20', priority: 1 },
  care: { icon: '💙', color: 'text-blue-400', bgColor: 'bg-blue-500/20', priority: 1 },
  alfredo: { icon: '🐧', color: 'text-[#A996FF]', bgColor: 'bg-[#A996FF]/20', priority: 2 },
  urgent: { icon: '🚨', color: 'text-red-400', bgColor: 'bg-red-500/20', priority: 4 }
};

// 스마트 알림 메시지 템플릿
var SMART_MESSAGES = {
  // 시간대별 넛지
  morning: [
    { time: '08:00', message: '좋은 아침이에요, 보스! 오늘 할 일 확인해볼까요?', type: 'alfredo' },
    { time: '09:00', message: '오전 집중 시간! 가장 중요한 일부터 시작해요.', type: 'focus' }
  ],
  afternoon: [
    { time: '13:00', message: '점심 후 나른함 주의! 간단한 일부터 해볼까요?', type: 'care' },
    { time: '15:00', message: '오후 집중 타임! 남은 할 일 체크해요.', type: 'task' }
  ],
  evening: [
    { time: '18:00', message: '하루 마무리 시간! 오늘 성과 확인해볼까요?', type: 'alfredo' },
    { time: '21:00', message: '내일을 위해 정리하고 쉬어가요.', type: 'care' }
  ],
  
  // 상태 기반 메시지
  lowEnergy: [
    '에너지가 낮아 보여요. 잠깐 쉬어가는 건 어때요?',
    '무리하지 마요. 컨디션이 중요해요.',
    '가벼운 산책이나 스트레칭 어때요?'
  ],
  highEnergy: [
    '에너지 충만! 어려운 일에 도전해보세요!',
    '컨디션 최고예요! 오늘 목표 높여볼까요?',
    '불타오르고 있어요! 🔥'
  ],
  
  // 태스크 기반 메시지
  noTasksToday: [
    '오늘 할 일이 없어요. 새로 추가해볼까요?',
    '한가한 하루네요. 밀린 일 처리 어때요?'
  ],
  manyTasks: [
    '할 일이 많네요. 우선순위 정해볼까요?',
    'Big 3만 먼저 집중해보는 건 어때요?'
  ],
  
  // 이벤트 기반
  upcomingEvent: '곧 일정이 있어요: {title}',
  eventStarting: '지금 시작: {title}',
  
  // 스트릭
  streakReminder: '오늘 활동하면 {streak}일 연속 달성!',
  streakAchieved: '🔥 {streak}일 연속 달성! 대단해요!',
  
  // 집중
  focusComplete: '집중 세션 완료! 잠깐 쉬어가요.',
  focusBreakOver: '휴식 끝! 다시 집중할 준비 됐나요?'
};

// 알림 데이터 로드
function loadNotifications() {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load notifications:', e);
  }
  return { notifications: [], settings: { enabled: true, quiet: false, quietStart: '22:00', quietEnd: '08:00' } };
}

// 알림 데이터 저장
function saveNotifications(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save notifications:', e);
  }
}

// 🔔 단일 알림 카드
export var NotificationCard = function(props) {
  var notification = props.notification;
  var darkMode = props.darkMode;
  var onDismiss = props.onDismiss;
  var onAction = props.onAction;
  var compact = props.compact;
  
  var type = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.alfredo;
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  var timeAgo = function(date) {
    var now = new Date();
    var diff = now - new Date(date);
    var minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금';
    if (minutes < 60) return minutes + '분 전';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + '시간 전';
    return Math.floor(hours / 24) + '일 전';
  };
  
  if (compact) {
    return React.createElement('div', {
      className: 'flex items-center gap-3 p-2 rounded-xl ' + type.bgColor
    },
      React.createElement('span', { className: 'text-lg' }, type.icon),
      React.createElement('p', { className: textPrimary + ' text-sm flex-1 truncate' }, notification.message),
      onDismiss && React.createElement('button', {
        onClick: function() { onDismiss(notification.id); },
        className: textSecondary + ' hover:' + textPrimary
      }, React.createElement(X, { size: 14 }))
    );
  }
  
  return React.createElement('div', {
    className: 'p-3 rounded-xl border ' + (darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white')
  },
    React.createElement('div', { className: 'flex items-start gap-3' },
      React.createElement('div', { className: 'w-10 h-10 rounded-xl flex items-center justify-center text-xl ' + type.bgColor }, type.icon),
      React.createElement('div', { className: 'flex-1 min-w-0' },
        React.createElement('p', { className: textPrimary + ' text-sm' }, notification.message),
        React.createElement('p', { className: textSecondary + ' text-xs mt-1' }, timeAgo(notification.createdAt)),
        notification.action && React.createElement('button', {
          onClick: function() { if (onAction) onAction(notification); },
          className: 'mt-2 text-[#A996FF] text-xs font-medium flex items-center gap-1'
        }, notification.action.label, React.createElement(ChevronRight, { size: 12 }))
      ),
      onDismiss && React.createElement('button', {
        onClick: function() { onDismiss(notification.id); },
        className: textSecondary + ' hover:' + textPrimary
      }, React.createElement(X, { size: 16 }))
    )
  );
};

// 🔔 알림 센터 (드롭다운)
export var NotificationCenter = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var notifications = props.notifications || [];
  var onDismiss = props.onDismiss;
  var onDismissAll = props.onDismissAll;
  var onAction = props.onAction;
  var darkMode = props.darkMode;
  
  if (!isOpen) return null;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var unread = notifications.filter(function(n) { return !n.read; });
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50',
    onClick: onClose
  },
    React.createElement('div', {
      className: cardBg + ' absolute top-16 right-4 w-80 max-h-96 rounded-2xl shadow-xl border ' + borderColor + ' overflow-hidden',
      onClick: function(e) { e.stopPropagation(); }
    },
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between p-4 border-b ' + borderColor },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(Bell, { size: 18, className: 'text-[#A996FF]' }),
          React.createElement('h3', { className: textPrimary + ' font-bold' }, '알림'),
          unread.length > 0 && React.createElement('span', { 
            className: 'bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full'
          }, unread.length)
        ),
        notifications.length > 0 && React.createElement('button', {
          onClick: onDismissAll,
          className: textSecondary + ' text-xs hover:text-[#A996FF]'
        }, '모두 지우기')
      ),
      
      // 알림 목록
      React.createElement('div', { className: 'max-h-72 overflow-y-auto p-2' },
        notifications.length > 0 
          ? React.createElement('div', { className: 'space-y-2' },
              notifications.slice(0, 10).map(function(notif) {
                return React.createElement(NotificationCard, {
                  key: notif.id,
                  notification: notif,
                  darkMode: darkMode,
                  onDismiss: onDismiss,
                  onAction: onAction,
                  compact: true
                });
              })
            )
          : React.createElement('div', { className: 'text-center py-8' },
              React.createElement('span', { className: 'text-3xl block mb-2' }, '🔔'),
              React.createElement('p', { className: textSecondary + ' text-sm' }, '새 알림이 없어요')
            )
      )
    )
  );
};

// 🔔 알림 벨 버튼
export var NotificationBell = function(props) {
  var count = props.count || 0;
  var onClick = props.onClick;
  var darkMode = props.darkMode;
  
  return React.createElement('button', {
    onClick: onClick,
    className: 'relative w-10 h-10 rounded-full flex items-center justify-center ' +
      (darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50') + ' shadow-sm transition-all'
  },
    React.createElement(Bell, { size: 18 }),
    count > 0 && React.createElement('span', {
      className: 'absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold'
    }, count > 9 ? '9+' : count)
  );
};

// 📱 토스트 알림
export var ToastNotification = function(props) {
  var notification = props.notification;
  var isVisible = props.isVisible;
  var onDismiss = props.onDismiss;
  var onAction = props.onAction;
  var darkMode = props.darkMode;
  
  useEffect(function() {
    if (isVisible && notification) {
      var timer = setTimeout(function() {
        if (onDismiss) onDismiss();
      }, 5000);
      return function() { clearTimeout(timer); };
    }
  }, [isVisible, notification, onDismiss]);
  
  if (!isVisible || !notification) return null;
  
  var type = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.alfredo;
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  
  return React.createElement('div', {
    className: 'fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down'
  },
    React.createElement('div', {
      className: cardBg + ' rounded-2xl p-4 shadow-xl flex items-center gap-3 min-w-72 max-w-sm'
    },
      React.createElement('div', { className: 'w-10 h-10 rounded-xl flex items-center justify-center text-xl ' + type.bgColor }, type.icon),
      React.createElement('div', { className: 'flex-1 min-w-0' },
        React.createElement('p', { className: textPrimary + ' text-sm' }, notification.message),
        notification.action && React.createElement('button', {
          onClick: function() { if (onAction) onAction(notification); onDismiss(); },
          className: 'text-[#A996FF] text-xs font-medium mt-1'
        }, notification.action.label)
      ),
      React.createElement('button', {
        onClick: onDismiss,
        className: 'text-gray-400 hover:text-gray-600'
      }, React.createElement(X, { size: 16 }))
    )
  );
};

// 🎮 알림 훅
export function useNotifications() {
  var dataState = useState(loadNotifications);
  var data = dataState[0];
  var setData = dataState[1];
  
  var toastState = useState({ visible: false, notification: null });
  var toast = toastState[0];
  var setToast = toastState[1];
  
  // 저장
  useEffect(function() {
    saveNotifications(data);
  }, [data]);
  
  // 알림 추가
  var addNotification = useCallback(function(notif) {
    var newNotif = Object.assign({}, notif, {
      id: 'notif-' + Date.now(),
      createdAt: new Date().toISOString(),
      read: false
    });
    
    setData(function(prev) {
      return Object.assign({}, prev, {
        notifications: [newNotif].concat(prev.notifications).slice(0, 50)
      });
    });
    
    // 토스트 표시
    if (!data.settings.quiet || !isQuietTime(data.settings)) {
      setToast({ visible: true, notification: newNotif });
    }
    
    return newNotif;
  }, [data.settings]);
  
  // 알림 제거
  var dismissNotification = useCallback(function(id) {
    setData(function(prev) {
      return Object.assign({}, prev, {
        notifications: prev.notifications.filter(function(n) { return n.id !== id; })
      });
    });
  }, []);
  
  // 모든 알림 제거
  var dismissAll = useCallback(function() {
    setData(function(prev) {
      return Object.assign({}, prev, { notifications: [] });
    });
  }, []);
  
  // 읽음 처리
  var markAsRead = useCallback(function(id) {
    setData(function(prev) {
      return Object.assign({}, prev, {
        notifications: prev.notifications.map(function(n) {
          return n.id === id ? Object.assign({}, n, { read: true }) : n;
        })
      });
    });
  }, []);
  
  // 스마트 알림 생성
  var createSmartNotification = useCallback(function(context) {
    var message = '';
    var type = 'alfredo';
    
    if (context.type === 'lowEnergy') {
      var messages = SMART_MESSAGES.lowEnergy;
      message = messages[Math.floor(Math.random() * messages.length)];
      type = 'care';
    } else if (context.type === 'highEnergy') {
      var messages = SMART_MESSAGES.highEnergy;
      message = messages[Math.floor(Math.random() * messages.length)];
      type = 'focus';
    } else if (context.type === 'upcomingEvent') {
      message = SMART_MESSAGES.upcomingEvent.replace('{title}', context.title);
      type = 'event';
    } else if (context.type === 'streak') {
      message = SMART_MESSAGES.streakReminder.replace('{streak}', context.streak);
      type = 'streak';
    } else if (context.type === 'focusComplete') {
      message = SMART_MESSAGES.focusComplete;
      type = 'focus';
    }
    
    if (message) {
      addNotification({ message: message, type: type, action: context.action });
    }
  }, [addNotification]);
  
  // 토스트 숨기기
  var hideToast = useCallback(function() {
    setToast({ visible: false, notification: null });
  }, []);
  
  return {
    notifications: data.notifications,
    settings: data.settings,
    unreadCount: data.notifications.filter(function(n) { return !n.read; }).length,
    toast: toast,
    addNotification: addNotification,
    dismissNotification: dismissNotification,
    dismissAll: dismissAll,
    markAsRead: markAsRead,
    createSmartNotification: createSmartNotification,
    hideToast: hideToast
  };
}

// 조용한 시간 체크
function isQuietTime(settings) {
  if (!settings.quiet) return false;
  var now = new Date();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var current = hour * 60 + minute;
  
  var startParts = settings.quietStart.split(':');
  var endParts = settings.quietEnd.split(':');
  var start = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
  var end = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
  
  if (start > end) {
    // 밤~아침 (22:00~08:00)
    return current >= start || current < end;
  } else {
    return current >= start && current < end;
  }
}

export default {
  NotificationCard: NotificationCard,
  NotificationCenter: NotificationCenter,
  NotificationBell: NotificationBell,
  ToastNotification: ToastNotification,
  useNotifications: useNotifications,
  NOTIFICATION_TYPES: NOTIFICATION_TYPES
};
