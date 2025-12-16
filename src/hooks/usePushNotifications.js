import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 푸시 알림 훅 (Service Worker 연동)
 * - Notification API + Service Worker
 * - 권한 요청/상태 관리
 * - 즉시 알림 & 스케줄 알림
 */
export function usePushNotifications() {
  var permissionState = useState('default');
  var permission = permissionState[0];
  var setPermission = permissionState[1];
  
  var supportedState = useState(false);
  var isSupported = supportedState[0];
  var setIsSupported = supportedState[1];
  
  var swRegistrationState = useState(null);
  var swRegistration = swRegistrationState[0];
  var setSwRegistration = swRegistrationState[1];
  
  // 스케줄된 알림 타이머들
  var scheduledTimers = useRef([]);
  
  // 초기화: 브라우저 지원 확인 & Service Worker 등록 확인
  useEffect(function() {
    // Notification API 지원 확인
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
    
    // Service Worker 등록 확인
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(function(registration) {
        setSwRegistration(registration);
        console.log('[Push] Service Worker ready');
      });
    }
    
    // 클린업
    return function() {
      scheduledTimers.current.forEach(function(timer) {
        clearTimeout(timer);
      });
    };
  }, []);
  
  // 권한 요청
  var requestPermission = useCallback(async function() {
    if (!isSupported) {
      return 'unsupported';
    }
    
    if (permission === 'granted') {
      return 'granted';
    }
    
    try {
      var result = await Notification.requestPermission();
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
  var sendNotification = useCallback(function(options) {
    var title = options.title || '🐧 알프레도';
    var body = options.body || '';
    var icon = options.icon || '/icons/icon-192x192.png';
    var badge = options.badge || '/alfredo-badge.svg';
    var tag = options.tag || 'alfredo-' + Date.now();
    var data = options.data || {};
    var requireInteraction = options.requireInteraction || false;
    var actions = options.actions || [];
    
    if (!isSupported || permission !== 'granted') {
      console.log('[Push] 알림 권한 없음');
      return null;
    }
    
    // Service Worker가 있으면 SW를 통해 발송 (백그라운드 지원)
    if (swRegistration) {
      return swRegistration.showNotification(title, {
        body: body,
        icon: icon,
        badge: badge,
        tag: tag,
        data: Object.assign({ type: options.type }, data),
        requireInteraction: requireInteraction,
        actions: actions,
        vibrate: [200, 100, 200],
        silent: false
      });
    }
    
    // 폴백: 기본 Notification API
    try {
      var notification = new Notification(title, {
        body: body,
        icon: icon,
        tag: tag,
        requireInteraction: requireInteraction
      });
      
      notification.onclick = function() {
        window.focus();
        notification.close();
        if (options.onClick) options.onClick();
      };
      
      if (!requireInteraction) {
        setTimeout(function() { notification.close(); }, 5000);
      }
      
      return notification;
    } catch (error) {
      console.error('[Push] 알림 발송 실패:', error);
      return null;
    }
  }, [isSupported, permission, swRegistration]);
  
  // 스케줄 알림 (지정된 시간 후 발송)
  var scheduleNotification = useCallback(function(options, delayMs) {
    if (!isSupported || permission !== 'granted') {
      return null;
    }
    
    var timerId = setTimeout(function() {
      sendNotification(options);
    }, delayMs);
    
    scheduledTimers.current.push(timerId);
    
    return {
      cancel: function() {
        clearTimeout(timerId);
        scheduledTimers.current = scheduledTimers.current.filter(function(t) {
          return t !== timerId;
        });
      }
    };
  }, [isSupported, permission, sendNotification]);
  
  // 특정 시각에 알림 (Date 객체)
  var scheduleNotificationAt = useCallback(function(options, date) {
    var now = Date.now();
    var targetTime = date.getTime();
    var delay = targetTime - now;
    
    if (delay <= 0) {
      console.log('[Push] 이미 지난 시간:', date);
      return null;
    }
    
    return scheduleNotification(options, delay);
  }, [scheduleNotification]);
  
  // ===== 편의 함수들 =====
  
  // 일정 알림
  var sendEventReminder = useCallback(function(event, minutesBefore) {
    var body = minutesBefore > 0 
      ? minutesBefore + '분 후 시작이에요!'
      : '지금 시작이에요!';
    
    return sendNotification({
      title: '📅 ' + event.title,
      body: body + (event.location ? ' · ' + event.location : ''),
      tag: 'event-' + event.id,
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
  var sendTaskReminder = useCallback(function(task, message) {
    return sendNotification({
      title: '✅ ' + task.title,
      body: message || '이 태스크를 처리해주세요!',
      tag: 'task-' + task.id,
      type: 'task',
      data: { taskId: task.id, taskTitle: task.title },
      actions: [
        { action: 'complete', title: '완료' },
        { action: 'snooze', title: '10분 후' }
      ]
    });
  }, [sendNotification]);
  
  // 휴식 알림
  var sendBreakReminder = useCallback(function(workMinutes) {
    return sendNotification({
      title: '🐧 알프레도가 말해요',
      body: workMinutes + '분째 집중 중이에요. 잠깐 스트레칭 어때요?',
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
  var sendAlfredoMessage = useCallback(function(message, options) {
    options = options || {};
    return sendNotification({
      title: '🐧 알프레도',
      body: message,
      tag: options.tag || 'alfredo-message',
      type: 'alfredo',
      requireInteraction: options.important || false
    });
  }, [sendNotification]);
  
  // 아침 브리핑 알림
  var sendMorningBriefing = useCallback(function(taskCount, eventCount) {
    var body = '오늘 ';
    var items = [];
    if (taskCount > 0) items.push('태스크 ' + taskCount + '개');
    if (eventCount > 0) items.push('일정 ' + eventCount + '개');
    body += items.length > 0 ? items.join(', ') + '가 있어요!' : '여유로운 하루예요!';
    
    return sendNotification({
      title: '☀️ 좋은 아침이에요, Boss!',
      body: body,
      tag: 'morning-briefing',
      type: 'morning',
      requireInteraction: true,
      actions: [
        { action: 'briefing', title: '브리핑 보기' }
      ]
    });
  }, [sendNotification]);
  
  // 저녁 리뷰 알림
  var sendEveningReview = useCallback(function(completedCount, totalCount) {
    var body = completedCount > 0
      ? '오늘 ' + completedCount + '개를 완료했어요! 🎉'
      : '오늘 하루도 수고했어요 💜';
    
    return sendNotification({
      title: '🌙 하루 마무리 시간이에요',
      body: body,
      tag: 'evening-review',
      type: 'evening',
      actions: [
        { action: 'review', title: '리뷰하기' }
      ]
    });
  }, [sendNotification]);
  
  // 물 마시기 알림
  var sendWaterReminder = useCallback(function(currentIntake, goal) {
    var remaining = goal - currentIntake;
    return sendNotification({
      title: '💧 물 마실 시간!',
      body: remaining > 0 
        ? '목표까지 ' + remaining + '잔 남았어요'
        : '오늘 목표 달성! 👏',
      tag: 'water-reminder',
      type: 'water'
    });
  }, [sendNotification]);
  
  // 모든 스케줄된 알림 취소
  var cancelAllScheduled = useCallback(function() {
    scheduledTimers.current.forEach(function(timer) {
      clearTimeout(timer);
    });
    scheduledTimers.current = [];
  }, []);
  
  return {
    // 상태
    isSupported: isSupported,
    permission: permission,
    isEnabled: isSupported && permission === 'granted',
    
    // 권한
    requestPermission: requestPermission,
    
    // 알림 발송
    sendNotification: sendNotification,
    scheduleNotification: scheduleNotification,
    scheduleNotificationAt: scheduleNotificationAt,
    cancelAllScheduled: cancelAllScheduled,
    
    // 편의 함수
    sendEventReminder: sendEventReminder,
    sendTaskReminder: sendTaskReminder,
    sendBreakReminder: sendBreakReminder,
    sendAlfredoMessage: sendAlfredoMessage,
    sendMorningBriefing: sendMorningBriefing,
    sendEveningReview: sendEveningReview,
    sendWaterReminder: sendWaterReminder
  };
}

export default usePushNotifications;
