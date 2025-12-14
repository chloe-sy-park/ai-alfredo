import { useState, useEffect, useCallback } from 'react';

/**
 * 브라우저 푸시 알림 훅
 * - Notification API 활용
 * - 권한 요청/상태 관리
 * - 알림 발송
 */
export function usePushNotifications() {
  var permission = useState('default');
  var permissionState = permission[0];
  var setPermission = permission[1];
  
  var supported = useState(false);
  var isSupported = supported[0];
  var setIsSupported = supported[1];
  
  // 브라우저 지원 여부 및 현재 권한 상태 확인
  useEffect(function() {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);
  
  // 권한 요청
  var requestPermission = useCallback(function() {
    return new Promise(function(resolve) {
      if (!isSupported) {
        resolve('unsupported');
        return;
      }
      
      if (permissionState === 'granted') {
        resolve('granted');
        return;
      }
      
      Notification.requestPermission().then(function(result) {
        setPermission(result);
        resolve(result);
      });
    });
  }, [isSupported, permissionState]);
  
  // 푸시 알림 발송
  var sendNotification = useCallback(function(options) {
    var title = options.title || '알프레도';
    var body = options.body || '';
    var icon = options.icon || '/alfredo-icon.png';
    var tag = options.tag || 'alfredo-notification';
    var onClick = options.onClick;
    var requireInteraction = options.requireInteraction || false;
    
    if (!isSupported || permissionState !== 'granted') {
      console.log('[Push] 알림 권한 없음 또는 미지원');
      return null;
    }
    
    try {
      var notification = new Notification(title, {
        body: body,
        icon: icon,
        tag: tag,
        badge: '/alfredo-badge.png',
        requireInteraction: requireInteraction,
        silent: false
      });
      
      notification.onclick = function(event) {
        event.preventDefault();
        window.focus();
        notification.close();
        if (onClick) onClick();
      };
      
      // 5초 후 자동 닫기 (requireInteraction이 false일 때)
      if (!requireInteraction) {
        setTimeout(function() {
          notification.close();
        }, 5000);
      }
      
      return notification;
    } catch (error) {
      console.error('[Push] 알림 발송 실패:', error);
      return null;
    }
  }, [isSupported, permissionState]);
  
  // 일정 알림 발송
  var sendEventReminder = useCallback(function(event, minutesBefore) {
    var body = minutesBefore > 0 
      ? minutesBefore + '분 후 시작이에요!'
      : '지금 시작이에요!';
    
    return sendNotification({
      title: '📅 ' + event.title,
      body: body + (event.location ? ' · ' + event.location : ''),
      tag: 'event-' + event.id,
      requireInteraction: minutesBefore <= 5
    });
  }, [sendNotification]);
  
  // 태스크 리마인더 발송
  var sendTaskReminder = useCallback(function(task, message) {
    return sendNotification({
      title: '✅ ' + task.title,
      body: message || '이 태스크를 처리해주세요!',
      tag: 'task-' + task.id
    });
  }, [sendNotification]);
  
  // 휴식 리마인더 발송
  var sendBreakReminder = useCallback(function(workMinutes) {
    return sendNotification({
      title: '🐧 알프레도가 말해요',
      body: workMinutes + '분째 집중 중이에요. 잠깐 스트레칭 어때요?',
      tag: 'break-reminder',
      requireInteraction: false
    });
  }, [sendNotification]);
  
  // 알프레도 메시지 발송
  var sendAlfredoMessage = useCallback(function(message, options) {
    return sendNotification({
      title: '🐧 알프레도',
      body: message,
      tag: (options && options.tag) || 'alfredo-message',
      requireInteraction: (options && options.important) || false
    });
  }, [sendNotification]);
  
  return {
    isSupported: isSupported,
    permission: permissionState,
    requestPermission: requestPermission,
    sendNotification: sendNotification,
    sendEventReminder: sendEventReminder,
    sendTaskReminder: sendTaskReminder,
    sendBreakReminder: sendBreakReminder,
    sendAlfredoMessage: sendAlfredoMessage
  };
}

export default usePushNotifications;
