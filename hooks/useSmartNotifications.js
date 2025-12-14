import { useState, useEffect, useCallback, useMemo } from 'react';

// Notification priority constants
const NOTIFICATION_PRIORITY = {
  URGENT: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

const useSmartNotifications = ({ tasks = [], events = [], routines = [], energy = 70 }) => {
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todayStr = now.toISOString().split('T')[0];
    const newNotifications = [];
    
    // 1. 마감 임박 알림 (D-1, D-day)
    tasks.filter(t => t.status !== 'done' && t.deadline).forEach(task => {
      const deadline = new Date(task.deadline);
      const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntil === 0) {
        newNotifications.push({
          id: `deadline-today-${task.id}`,
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
          id: `deadline-tomorrow-${task.id}`,
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
      const today = now.getDay();
      const incompleteRoutines = routines.filter(r => {
        if (r.current >= r.target) return false;
        if (r.repeatType === 'daily') return true;
        if (r.repeatType === 'weekdays') return today >= 1 && today <= 5;
        if (r.repeatType === 'custom') return r.repeatDays?.includes(today);
        return true;
      });
      
      if (incompleteRoutines.length > 0 && currentHour >= 19) {
        newNotifications.push({
          id: `routine-evening-${todayStr}`,
          type: 'routine',
          priority: NOTIFICATION_PRIORITY.MEDIUM,
          icon: '🌙',
          title: '오늘의 루틴',
          message: `${incompleteRoutines.length}개 남았어요`,
          action: { label: '확인하기', type: 'open-routines' },
          color: 'purple',
        });
      }
    }
    
    // 3. 집중 세션 시작 제안 (오전/오후 피크 시간)
    const isPeakHour = (currentHour >= 9 && currentHour <= 11) || (currentHour >= 14 && currentHour <= 16);
    const unfinishedImportant = tasks.find(t => t.status !== 'done' && t.importance === 'high');
    
    if (isPeakHour && unfinishedImportant && energy >= 60) {
      newNotifications.push({
        id: `focus-suggest-${currentHour}`,
        type: 'focus',
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        icon: '⚡',
        title: '지금이 집중하기 좋아요',
        message: `"${unfinishedImportant.title}" 시작해볼까요?`,
        action: { label: '집중 시작', type: 'start-focus', data: unfinishedImportant },
        color: 'blue',
      });
    }
    
    // 4. 에너지 낮을 때 휴식 제안
    if (energy <= 40 && currentHour >= 10 && currentHour <= 18) {
      newNotifications.push({
        id: `energy-low-${currentHour}`,
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
    events.filter(e => e.date === todayStr && e.start).forEach(event => {
      const [hours, mins] = event.start.split(':').map(Number);
      const eventMinutes = hours * 60 + mins;
      const minutesUntil = eventMinutes - currentMinutes;
      
      if (minutesUntil > 0 && minutesUntil <= 30) {
        const urgency = minutesUntil <= 10 ? NOTIFICATION_PRIORITY.URGENT : NOTIFICATION_PRIORITY.HIGH;
        newNotifications.push({
          id: `meeting-${event.id}-${minutesUntil <= 10 ? '10' : '30'}`,
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
      const todayTasks = tasks.filter(t => t.status !== 'done').length;
      const todayEvents = events.filter(e => e.date === todayStr).length;
      
      newNotifications.push({
        id: `morning-briefing-${todayStr}`,
        type: 'briefing',
        priority: NOTIFICATION_PRIORITY.LOW,
        icon: '🌅',
        title: '좋은 아침이에요!',
        message: `오늘 할 일 ${todayTasks}개, 일정 ${todayEvents}개`,
        action: { label: '오늘 계획 보기', type: 'view-today' },
        color: 'yellow',
      });
    }
    
    // dismissed 제외하고 우선순위 정렬
    const filtered = newNotifications
      .filter(n => !dismissedIds.has(n.id))
      .sort((a, b) => a.priority - b.priority);
    
    setNotifications(filtered);
  }, [tasks, events, routines, energy, dismissedIds]);
  
  const dismissNotification = (id) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };
  
  const dismissAll = () => {
    setDismissedIds(prev => new Set([...prev, ...notifications.map(n => n.id)]));
  };
  
  return { notifications, dismissNotification, dismissAll };
};

export { NOTIFICATION_PRIORITY };
export default useSmartNotifications;
