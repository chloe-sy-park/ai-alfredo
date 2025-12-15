import { useState, useEffect, useCallback, useMemo } from 'react';

// Notification priority constants
var NOTIFICATION_PRIORITY = {
  URGENT: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

var useSmartNotifications = function(options) {
  var tasks = options.tasks || [];
  var events = options.events || [];
  var routines = options.routines || [];
  var energy = options.energy || 70;
  
  var notificationsState = useState([]);
  var notifications = notificationsState[0];
  var setNotifications = notificationsState[1];
  
  var dismissedState = useState(new Set());
  var dismissedIds = dismissedState[0];
  var setDismissedIds = dismissedState[1];
  
  useEffect(function() {
    var now = new Date();
    var currentHour = now.getHours();
    var currentMinutes = now.getHours() * 60 + now.getMinutes();
    var todayStr = now.toISOString().split('T')[0];
    var newNotifications = [];
    
    // 1. 마감 임박 알림 (D-1, D-day)
    tasks.filter(function(t) { return t.status !== 'done' && t.deadline; }).forEach(function(task) {
      var deadline = new Date(task.deadline);
      var daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntil === 0) {
        newNotifications.push({
          id: 'deadline-today-' + task.id,
          type: 'deadline',
          priority: NOTIFICATION_PRIORITY.URGENT,
          icon: '🔴',
          title: '오늘 마감!',
          message: task.title,
          action: { label: '지금 처리', type: 'start-focus', data: task },
          color: 'red',
        });
      } else if (daysUntil === 1) {
        newNotifications.push({
          id: 'deadline-tomorrow-' + task.id,
          type: 'deadline',
          priority: NOTIFICATION_PRIORITY.HIGH,
          icon: '🟠',
          title: '내일 마감',
          message: task.title,
          action: { label: '오늘 시작하기', type: 'start-focus', data: task },
          color: 'orange',
        });
      }
    });
    
    // 2. 미완료 루틴 저녁 리마인더 (18시 이후)
    if (currentHour >= 18 && currentHour < 22) {
      var today = now.getDay();
      var incompleteRoutines = routines.filter(function(r) {
        if (r.current >= r.target) return false;
        if (r.repeatType === 'daily') return true;
        if (r.repeatType === 'weekdays') return today >= 1 && today <= 5;
        if (r.repeatType === 'custom') return r.repeatDays && r.repeatDays.indexOf(today) !== -1;
        return true;
      });
      
      if (incompleteRoutines.length > 0 && currentHour >= 19) {
        newNotifications.push({
          id: 'routine-evening-' + todayStr,
          type: 'routine',
          priority: NOTIFICATION_PRIORITY.MEDIUM,
          icon: '🌙',
          title: '오늘의 루틴',
          message: incompleteRoutines.length + '개 남았어요',
          action: { label: '확인하기', type: 'open-routines' },
          color: 'purple',
        });
      }
    }
    
    // 3. 집중 세션 시작 제안 (오전/오후 피크 시간)
    var isPeakHour = (currentHour >= 9 && currentHour <= 11) || (currentHour >= 14 && currentHour <= 16);
    var unfinishedImportant = tasks.find(function(t) { return t.status !== 'done' && t.importance === 'high'; });
    
    if (isPeakHour && unfinishedImportant && energy >= 60) {
      newNotifications.push({
        id: 'focus-suggest-' + currentHour,
        type: 'focus',
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        icon: '⚡',
        title: '지금이 집중하기 좋아요',
        message: '"' + unfinishedImportant.title + '" 시작해볼까요?',
        action: { label: '집중 시작', type: 'start-focus', data: unfinishedImportant },
        color: 'blue',
      });
    }
    
    // 4. 에너지 낮을 때 휴식 제안
    if (energy <= 40 && currentHour >= 10 && currentHour <= 18) {
      newNotifications.push({
        id: 'energy-low-' + currentHour,
        type: 'energy',
        priority: NOTIFICATION_PRIORITY.LOW,
        icon: '☕',
        title: '에너지 충전 필요',
        message: '잠깐 쉬어가는 건 어때요?',
        action: { label: '5분 휴식', type: 'break' },
        color: 'teal',
      });
    }
    
    // 5. 다가오는 미팅 알림 (30분, 10분 전)
    events.filter(function(e) { return e.date === todayStr && e.start; }).forEach(function(event) {
      var timeParts = event.start.split(':');
      var hours = parseInt(timeParts[0], 10);
      var mins = parseInt(timeParts[1], 10);
      var eventMinutes = hours * 60 + mins;
      var minutesUntil = eventMinutes - currentMinutes;
      
      if (minutesUntil > 0 && minutesUntil <= 30) {
        var urgency = minutesUntil <= 10 ? NOTIFICATION_PRIORITY.URGENT : NOTIFICATION_PRIORITY.HIGH;
        newNotifications.push({
          id: 'meeting-' + event.id + '-' + (minutesUntil <= 10 ? '10' : '30'),
          type: 'meeting',
          priority: urgency,
          icon: minutesUntil <= 10 ? '🔴' : '📅',
          title: minutesUntil <= 10 ? '곧 시작!' : '30분 후 일정',
          message: event.title,
          action: { label: event.location ? '위치 확인' : '준비하기', type: 'view-event', data: event },
          color: minutesUntil <= 10 ? 'red' : 'blue',
        });
      }
    });
    
    // 6. 아침 브리핑 (9시)
    if (currentHour === 9 && now.getMinutes() < 30) {
      var todayTasks = tasks.filter(function(t) { return t.status !== 'done'; }).length;
      var todayEvents = events.filter(function(e) { return e.date === todayStr; }).length;
      
      newNotifications.push({
        id: 'morning-briefing-' + todayStr,
        type: 'briefing',
        priority: NOTIFICATION_PRIORITY.LOW,
        icon: '🌅',
        title: '좋은 아침이에요!',
        message: '오늘 할 일 ' + todayTasks + '개, 일정 ' + todayEvents + '개',
        action: { label: '오늘 계획 보기', type: 'view-today' },
        color: 'yellow',
      });
    }
    
    // dismissed 제외하고 우선순위 정렬
    var filtered = newNotifications
      .filter(function(n) { return !dismissedIds.has(n.id); })
      .sort(function(a, b) { return a.priority - b.priority; });
    
    setNotifications(filtered);
  }, [tasks, events, routines, energy, dismissedIds]);
  
  var dismissNotification = function(id) {
    setDismissedIds(function(prev) { 
      var newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };
  
  var dismissAll = function() {
    setDismissedIds(function(prev) {
      var newSet = new Set(prev);
      notifications.forEach(function(n) { newSet.add(n.id); });
      return newSet;
    });
  };
  
  return { notifications: notifications, dismissNotification: dismissNotification, dismissAll: dismissAll };
};

// Named export와 default export 모두 제공
export { useSmartNotifications, NOTIFICATION_PRIORITY };
export default useSmartNotifications;
