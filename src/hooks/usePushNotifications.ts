import { useState, useEffect, useCallback, useRef } from 'react';
import { useDNAStore } from '@/stores/dnaStore';

// =============================================================================
// Types
// =============================================================================

export type NotificationType = 
  | 'event' 
  | 'task' 
  | 'break' 
  | 'alfredo' 
  | 'morning' 
  | 'evening' 
  | 'water'
  | 'dna_insight'
  | 'stress_warning'
  | 'focus_reminder';

export interface NotificationOptions {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  type?: NotificationType;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  onClick?: () => void;
}

export interface NotificationAction {
  action: string;
  title: string;
}

export interface ScheduledNotification {
  cancel: () => void;
}

export interface CalendarEvent {
  id: string;
  title: string;
  location?: string;
}

export interface Task {
  id: string;
  title: string;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * 푸시 알림 훅 (Service Worker 연동 + DNA 기반 스마트 알림)
 * - Notification API + Service Worker
 * - 권한 요청/상태 관리
 * - 즉시 알림 & 스케줄 알림
 * - DNA 기반 맞춤형 알림 타이밍
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  
  // DNA 스토어에서 프로필 가져오기
  const { profile } = useDNAStore();
  
  // 스케줄된 알림 타이머들
  const scheduledTimers = useRef<NodeJS.Timeout[]>([]);
  
  // 초기화: 브라우저 지원 확인 & Service Worker 등록 확인
  useEffect(() => {
    // Notification API 지원 확인
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
    
    // Service Worker 등록 확인
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);
        console.log('[Push] Service Worker ready');
      });
    }
    
    // 클린업
    return () => {
      scheduledTimers.current.forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);
  
  // 권한 요청
  const requestPermission = useCallback(async (): Promise<NotificationPermission | 'unsupported'> => {
    if (!isSupported) {
      return 'unsupported';
    }
    
    if (permission === 'granted') {
      return 'granted';
    }
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      // 권한 획득 시 환영 알림
      if (result === 'granted') {
        sendNotification({
          title: '🐧 알프레도가 연결됐어요!',
          body: '이제 중요한 일정과 태스크를 알려드릴게요.',
          tag: 'welcome'
        });
      }
      
      return result;
    } catch (error) {
      console.error('[Push] Permission request failed:', error);
      return 'denied';
    }
  }, [isSupported, permission]);
  
  // 즉시 알림 발송 (Service Worker 사용)
  const sendNotification = useCallback((options: NotificationOptions): Promise<void> | Notification | null => {
    const {
      title = '🐧 알프레도',
      body = '',
      icon = '/icons/icon-192x192.png',
      badge = '/alfredo-badge.svg',
      tag = `alfredo-${Date.now()}`,
      type,
      data = {},
      requireInteraction = false,
      actions = [],
      onClick
    } = options;
    
    if (!isSupported || permission !== 'granted') {
      console.log('[Push] 알림 권한 없음');
      return null;
    }
    
    // Service Worker가 있으면 SW를 통해 발송 (백그라운드 지원)
    if (swRegistration) {
      return swRegistration.showNotification(title, {
        body,
        icon,
        badge,
        tag,
        data: { type, actions, ...data },
        requireInteraction,
        vibrate: [200, 100, 200],
        silent: false
      });
    }
    
    // 폴백: 기본 Notification API
    try {
      const notification = new Notification(title, {
        body,
        icon,
        tag,
        requireInteraction
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (onClick) onClick();
      };
      
      if (!requireInteraction) {
        setTimeout(() => { notification.close(); }, 5000);
      }
      
      return notification;
    } catch (error) {
      console.error('[Push] 알림 발송 실패:', error);
      return null;
    }
  }, [isSupported, permission, swRegistration]);
  
  // 스케줄 알림 (지정된 시간 후 발송)
  const scheduleNotification = useCallback((options: NotificationOptions, delayMs: number): ScheduledNotification | null => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }
    
    const timerId = setTimeout(() => {
      sendNotification(options);
    }, delayMs);
    
    scheduledTimers.current.push(timerId);
    
    return {
      cancel: () => {
        clearTimeout(timerId);
        scheduledTimers.current = scheduledTimers.current.filter(t => t !== timerId);
      }
    };
  }, [isSupported, permission, sendNotification]);
  
  // 특정 시각에 알림 (Date 객체)
  const scheduleNotificationAt = useCallback((options: NotificationOptions, date: Date): ScheduledNotification | null => {
    const now = Date.now();
    const targetTime = date.getTime();
    const delay = targetTime - now;
    
    if (delay <= 0) {
      console.log('[Push] 이미 지난 시간:', date);
      return null;
    }
    
    return scheduleNotification(options, delay);
  }, [scheduleNotification]);
  
  // ===== 기본 편의 함수들 =====
  
  // 일정 알림
  const sendEventReminder = useCallback((event: CalendarEvent, minutesBefore: number): Promise<void> | Notification | null => {
    const body = minutesBefore > 0 
      ? `${minutesBefore}분 후 시작이에요!`
      : '지금 시작이에요!';
    
    return sendNotification({
      title: `📅 ${event.title}`,
      body: body + (event.location ? ` · ${event.location}` : ''),
      tag: `event-${event.id}`,
      type: 'event',
      data: { eventId: event.id, eventTitle: event.title },
      requireInteraction: minutesBefore <= 5,
      actions: [
        { action: 'view', title: '보기' },
        { action: 'dismiss', title: '닫기' }
      ]
    });
  }, [sendNotification]);
  
  // 태스크 알림
  const sendTaskReminder = useCallback((task: Task, message?: string): Promise<void> | Notification | null => {
    return sendNotification({
      title: `✅ ${task.title}`,
      body: message || '이 태스크를 처리해주세요!',
      tag: `task-${task.id}`,
      type: 'task',
      data: { taskId: task.id, taskTitle: task.title },
      actions: [
        { action: 'complete', title: '완료' },
        { action: 'snooze', title: '10분 후' }
      ]
    });
  }, [sendNotification]);
  
  // 휴식 알림
  const sendBreakReminder = useCallback((workMinutes: number): Promise<void> | Notification | null => {
    return sendNotification({
      title: '🐧 알프레도가 말해요',
      body: `${workMinutes}분째 집중 중이에요. 잠깐 스트레칭 어때요?`,
      tag: 'break-reminder',
      type: 'break',
      requireInteraction: true,
      actions: [
        { action: 'break', title: '휴식하기' },
        { action: 'skip', title: '조금 더' }
      ]
    });
  }, [sendNotification]);
  
  // 알프레도 일반 메시지
  const sendAlfredoMessage = useCallback((message: string, options?: { tag?: string; important?: boolean }): Promise<void> | Notification | null => {
    return sendNotification({
      title: '🐧 알프레도',
      body: message,
      tag: options?.tag || 'alfredo-message',
      type: 'alfredo',
      requireInteraction: options?.important || false
    });
  }, [sendNotification]);
  
  // 아침 브리핑 알림
  const sendMorningBriefing = useCallback((taskCount: number, eventCount: number): Promise<void> | Notification | null => {
    let body = '오늘 ';
    const items: string[] = [];
    if (taskCount > 0) items.push(`태스크 ${taskCount}개`);
    if (eventCount > 0) items.push(`일정 ${eventCount}개`);
    body += items.length > 0 ? `${items.join(', ')}가 있어요!` : '여유로운 하루예요!';
    
    return sendNotification({
      title: '☀️ 좋은 아침이에요, Boss!',
      body,
      tag: 'morning-briefing',
      type: 'morning',
      requireInteraction: true,
      actions: [
        { action: 'briefing', title: '브리핑 보기' }
      ]
    });
  }, [sendNotification]);
  
  // 저녁 리뷰 알림
  const sendEveningReview = useCallback((completedCount: number, _totalCount: number): Promise<void> | Notification | null => {
    const body = completedCount > 0
      ? `오늘 ${completedCount}개를 완료했어요! 🎉`
      : '오늘 하루도 수고했어요 💜';
    
    return sendNotification({
      title: '🌙 하루 마무리 시간이에요',
      body,
      tag: 'evening-review',
      type: 'evening',
      actions: [
        { action: 'review', title: '리뷰하기' }
      ]
    });
  }, [sendNotification]);
  
  // 물 마시기 알림
  const sendWaterReminder = useCallback((currentIntake: number, goal: number): Promise<void> | Notification | null => {
    const remaining = goal - currentIntake;
    return sendNotification({
      title: '💧 물 마실 시간!',
      body: remaining > 0 
        ? `목표까지 ${remaining}잔 남았어요`
        : '오늘 목표 달성! 👏',
      tag: 'water-reminder',
      type: 'water'
    });
  }, [sendNotification]);
  
  // ===== DNA 기반 스마트 알림 =====
  
  // DNA 인사이트 알림
  const sendDNAInsight = useCallback((insight: string): Promise<void> | Notification | null => {
    return sendNotification({
      title: '🧬 알프레도가 발견했어요',
      body: insight,
      tag: 'dna-insight',
      type: 'dna_insight',
      requireInteraction: true,
      actions: [
        { action: 'view', title: '자세히 보기' },
        { action: 'dismiss', title: '나중에' }
      ]
    });
  }, [sendNotification]);
  
  // 스트레스 경고 알림
  const sendStressWarning = useCallback((): Promise<void> | Notification | null => {
    if (!profile) return null;
    
    const stressLevel = profile.stressIndicators.level;
    if (stressLevel === 'burnout') {
      return sendNotification({
        title: '🐧 잠깐, Boss...',
        body: '요즘 너무 바쁘셨던 것 같아요. 오늘은 좀 쉬어도 괜찮아요 💜',
        tag: 'stress-warning',
        type: 'stress_warning',
        requireInteraction: true,
        actions: [
          { action: 'rest', title: '휴식 모드' },
          { action: 'dismiss', title: '괜찮아요' }
        ]
      });
    } else if (stressLevel === 'high') {
      return sendNotification({
        title: '🐧 컨디션 체크!',
        body: '미팅이 좀 많았죠? 다음 미팅 전에 커피 한 잔 어때요?',
        tag: 'stress-warning',
        type: 'stress_warning',
        actions: [
          { action: 'break', title: '잠깐 쉬기' }
        ]
      });
    }
    return null;
  }, [profile, sendNotification]);
  
  // 피크 시간 알림
  const sendPeakTimeReminder = useCallback((): Promise<void> | Notification | null => {
    if (!profile) return null;
    
    const peakHours = profile.energyPattern.peakHours;
    const currentHour = new Date().getHours();
    
    if (peakHours.includes(currentHour)) {
      return sendNotification({
        title: '🧠 피크 시간이에요!',
        body: '지금이 집중하기 가장 좋은 시간이에요. 중요한 일 하나 해볼까요?',
        tag: 'peak-time',
        type: 'focus_reminder',
        actions: [
          { action: 'focus', title: '집중 모드' },
          { action: 'skip', title: '나중에' }
        ]
      });
    }
    return null;
  }, [profile, sendNotification]);
  
  // 슬럼프 시간 케어 알림
  const sendSlumpTimeCare = useCallback((): Promise<void> | Notification | null => {
    if (!profile) return null;
    
    const lowHours = profile.energyPattern.lowHours;
    const currentHour = new Date().getHours();
    
    if (lowHours.includes(currentHour)) {
      return sendNotification({
        title: '🐧 에너지 충전 시간',
        body: '이 시간대엔 가벼운 일 위주로 하는 게 좋아요. 산책 어때요?',
        tag: 'slump-care',
        type: 'break',
        actions: [
          { action: 'light_tasks', title: '가벼운 일 보기' },
          { action: 'walk', title: '산책하기' }
        ]
      });
    }
    return null;
  }, [profile, sendNotification]);
  
  // DNA 기반 스마트 아침 브리핑
  const sendSmartMorningBriefing = useCallback((taskCount: number, eventCount: number): Promise<void> | Notification | null => {
    if (!profile) {
      return sendMorningBriefing(taskCount, eventCount);
    }
    
    const chronotype = profile.chronotype.type;
    const stressLevel = profile.stressIndicators.level;
    const busiestDay = profile.weekdayPatterns.busiestDay;
    const today = new Date().getDay();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    
    let greeting = '☀️ 좋은 아침이에요!';
    let body = '';
    
    // 크로노타입 기반 인사
    if (chronotype === 'evening') {
      greeting = '☕ 천천히 일어나셨나요?';
    } else if (chronotype === 'morning') {
      greeting = '🌅 역시 아침형이시네요!';
    }
    
    // 스트레스 레벨 기반 메시지
    if (stressLevel === 'burnout' || stressLevel === 'high') {
      body = '오늘은 무리하지 마시고, ';
    }
    
    // 오늘이 가장 바쁜 요일인지 체크
    if (today === busiestDay) {
      body += `${dayNames[busiestDay]}요일은 보통 바쁘시잖아요. 컨디션 관리 잘 하세요!`;
    } else {
      const items: string[] = [];
      if (taskCount > 0) items.push(`태스크 ${taskCount}개`);
      if (eventCount > 0) items.push(`미팅 ${eventCount}개`);
      body += items.length > 0 ? `오늘 ${items.join(', ')} 있어요!` : '오늘은 여유로워요 ✨';
    }
    
    return sendNotification({
      title: greeting,
      body,
      tag: 'morning-briefing',
      type: 'morning',
      requireInteraction: true,
      actions: [
        { action: 'briefing', title: '상세 브리핑' }
      ]
    });
  }, [profile, sendMorningBriefing, sendNotification]);
  
  // 모든 스케줄된 알림 취소
  const cancelAllScheduled = useCallback(() => {
    scheduledTimers.current.forEach((timer) => {
      clearTimeout(timer);
    });
    scheduledTimers.current = [];
  }, []);
  
  return {
    // 상태
    isSupported,
    permission,
    isEnabled: isSupported && permission === 'granted',
    
    // 권한
    requestPermission,
    
    // 알림 발송
    sendNotification,
    scheduleNotification,
    scheduleNotificationAt,
    cancelAllScheduled,
    
    // 기본 편의 함수
    sendEventReminder,
    sendTaskReminder,
    sendBreakReminder,
    sendAlfredoMessage,
    sendMorningBriefing,
    sendEveningReview,
    sendWaterReminder,
    
    // DNA 기반 스마트 알림
    sendDNAInsight,
    sendStressWarning,
    sendPeakTimeReminder,
    sendSlumpTimeCare,
    sendSmartMorningBriefing,
  };
}

export default usePushNotifications;
