/**
 * 푸시 알림 훅
 * notificationService와 설정 스토어를 연결
 */

import { useState, useCallback, useEffect } from 'react';
import { notificationService } from '../services/notifications/notificationService';
import { useNotificationSettingsStore } from '../stores/notificationSettingsStore';

export interface PushNotificationState {
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePushNotification() {
  const { pushSubscribed, setPushSubscribed } = useNotificationSettingsStore();

  const [state, setState] = useState<PushNotificationState>({
    permission: 'default',
    isSubscribed: pushSubscribed,
    isLoading: false,
    error: null,
  });

  // 초기화 - 권한 및 구독 상태 확인
  useEffect(() => {
    const checkStatus = async () => {
      const permission = notificationService.getPermission();
      const subscribed = await notificationService.isPushSubscribed();

      setState(prev => ({
        ...prev,
        permission,
        isSubscribed: subscribed,
      }));

      // 스토어 동기화
      if (subscribed !== pushSubscribed) {
        setPushSubscribed(subscribed);
      }
    };

    // Service Worker 등록 후 상태 확인
    notificationService.registerServiceWorker().then(() => {
      checkStatus();
    });
  }, [pushSubscribed, setPushSubscribed]);

  // 권한 요청
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await notificationService.requestPermission();
      setState(prev => ({
        ...prev,
        permission,
        isLoading: false,
      }));
      return permission;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: '권한 요청 실패',
      }));
      return 'denied';
    }
  }, []);

  // 푸시 구독
  const subscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 권한이 없으면 먼저 요청
      if (state.permission !== 'granted') {
        const permission = await requestPermission();
        if (permission !== 'granted') {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: '알림 권한이 거부되었습니다',
          }));
          return false;
        }
      }

      // 구독 시도
      const deviceName = getDeviceName();
      const result = await notificationService.subscribeToPush(deviceName);

      if (result.success) {
        setState(prev => ({
          ...prev,
          isSubscribed: true,
          isLoading: false,
        }));
        setPushSubscribed(true);
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || '구독 실패',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: String(error),
      }));
      return false;
    }
  }, [state.permission, requestPermission, setPushSubscribed]);

  // 푸시 구독 해제
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await notificationService.unsubscribeFromPush();

      if (result.success) {
        setState(prev => ({
          ...prev,
          isSubscribed: false,
          isLoading: false,
        }));
        setPushSubscribed(false);
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || '구독 해제 실패',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: String(error),
      }));
      return false;
    }
  }, [setPushSubscribed]);

  // 지원 여부
  const isSupported = notificationService.isSupported();

  return {
    ...state,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

// 디바이스 이름 생성
function getDeviceName(): string {
  const ua = navigator.userAgent;

  if (/iPhone|iPad|iPod/.test(ua)) {
    return 'iOS Device';
  }
  if (/Android/.test(ua)) {
    return 'Android Device';
  }
  if (/Mac/.test(ua)) {
    return 'Mac';
  }
  if (/Windows/.test(ua)) {
    return 'Windows PC';
  }
  if (/Linux/.test(ua)) {
    return 'Linux';
  }

  return 'Unknown Device';
}

export default usePushNotification;
