/**
 * 알림 React 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  notificationService,
  NotificationSettings,
  NotificationPermission,
  NotificationTemplate,
  MORNING_BRIEFING_TEMPLATES,
  BREAK_REMINDER_TEMPLATES,
  EVENING_WRAP_TEMPLATES,
  ENCOURAGEMENT_TEMPLATES,
  BODY_DOUBLING_TEMPLATES,
  getMeetingReminderTemplate,
  getTaskReminderTemplate,
  getOverloadWarningTemplate,
  getFocusEndTemplate,
  getRandomTemplate
} from '../services/notifications';

interface UseNotificationsReturn {
  // 상태
  permission: NotificationPermission;
  isSupported: boolean;
  isEnabled: boolean;
  settings: NotificationSettings;
  
  // 권한 관련
  requestPermission: () => Promise<NotificationPermission>;
  
  // 설정 관련
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  setEnabled: (enabled: boolean) => void;
  
  // 알림 발송
  showNotification: (template: NotificationTemplate) => Promise<boolean>;
  showMorningBriefing: () => Promise<boolean>;
  showMeetingReminder: (title: string, minutesBefore: number) => Promise<boolean>;
  showTaskReminder: (title: string, context?: string) => Promise<boolean>;
  showBreakReminder: () => Promise<boolean>;
  showEveningWrap: () => Promise<boolean>;
  showEncouragement: () => Promise<boolean>;
  showBodyDoublingInvite: () => Promise<boolean>;
  showFocusEnd: (duration: number, taskTitle?: string) => Promise<boolean>;
  showOverloadWarning: (meetingCount: number) => Promise<boolean>;
  
  // 예약
  scheduleNotification: (template: NotificationTemplate, delayMs: number, id?: string) => string;
  scheduleNotificationToday: (template: NotificationTemplate, time: string, id?: string) => string | null;
  cancelScheduledNotification: (id: string) => boolean;
  cancelAllScheduledNotifications: () => void;
  
  // 일일 알림 설정
  scheduleDailyNotifications: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(
    notificationService.getSettings()
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기화
  useEffect(() => {
    const init = async () => {
      // 서비스 워커 등록
      await notificationService.registerServiceWorker();
      
      // 권한 상태 확인
      setPermission(notificationService.getPermission());
      
      // 설정 로드
      setSettings(notificationService.getSettings());
      
      setIsInitialized(true);
    };
    
    init();
  }, []);

  // 권한 요청
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const result = await notificationService.requestPermission();
    setPermission(result);
    return result;
  }, []);

  // 설정 업데이트
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    notificationService.saveSettings(newSettings);
    setSettings(notificationService.getSettings());
  }, []);

  // 활성화/비활성화
  const setEnabled = useCallback((enabled: boolean) => {
    notificationService.setEnabled(enabled);
    setSettings(notificationService.getSettings());
  }, []);

  // 알림 발송
  const showNotification = useCallback(async (template: NotificationTemplate): Promise<boolean> => {
    return notificationService.showNotification(template);
  }, []);

  // 아침 브리핑
  const showMorningBriefing = useCallback(async (): Promise<boolean> => {
    if (!settings.morningBriefing) return false;
    const template = getRandomTemplate(MORNING_BRIEFING_TEMPLATES);
    return showNotification(template);
  }, [settings.morningBriefing, showNotification]);

  // 미팅 리마인더
  const showMeetingReminder = useCallback(async (
    title: string, 
    minutesBefore: number
  ): Promise<boolean> => {
    if (!settings.meetingReminder) return false;
    const template = getMeetingReminderTemplate(title, minutesBefore);
    return showNotification(template);
  }, [settings.meetingReminder, showNotification]);

  // 태스크 리마인더
  const showTaskReminder = useCallback(async (
    title: string,
    context?: string
  ): Promise<boolean> => {
    const template = getTaskReminderTemplate(title, context);
    return showNotification(template);
  }, [showNotification]);

  // 휴식 알림
  const showBreakReminder = useCallback(async (): Promise<boolean> => {
    if (!settings.breakReminder) return false;
    const template = getRandomTemplate(BREAK_REMINDER_TEMPLATES);
    return showNotification(template);
  }, [settings.breakReminder, showNotification]);

  // 저녁 마무리
  const showEveningWrap = useCallback(async (): Promise<boolean> => {
    if (!settings.eveningWrap) return false;
    const template = getRandomTemplate(EVENING_WRAP_TEMPLATES);
    return showNotification(template);
  }, [settings.eveningWrap, showNotification]);

  // 격려 메시지
  const showEncouragement = useCallback(async (): Promise<boolean> => {
    if (!settings.encouragement) return false;
    const template = getRandomTemplate(ENCOURAGEMENT_TEMPLATES);
    return showNotification(template);
  }, [settings.encouragement, showNotification]);

  // 바디더블링 권유
  const showBodyDoublingInvite = useCallback(async (): Promise<boolean> => {
    const template = getRandomTemplate(BODY_DOUBLING_TEMPLATES);
    return showNotification(template);
  }, [showNotification]);

  // 집중 종료
  const showFocusEnd = useCallback(async (
    duration: number,
    taskTitle?: string
  ): Promise<boolean> => {
    const template = getFocusEndTemplate(duration, taskTitle);
    return showNotification(template);
  }, [showNotification]);

  // 과부하 경고
  const showOverloadWarning = useCallback(async (
    meetingCount: number
  ): Promise<boolean> => {
    const template = getOverloadWarningTemplate(meetingCount);
    return showNotification(template);
  }, [showNotification]);

  // 알림 예약
  const scheduleNotification = useCallback((
    template: NotificationTemplate,
    delayMs: number,
    id?: string
  ): string => {
    return notificationService.scheduleNotification(template, delayMs, id);
  }, []);

  // 오늘 특정 시간에 예약
  const scheduleNotificationToday = useCallback((
    template: NotificationTemplate,
    time: string,
    id?: string
  ): string | null => {
    return notificationService.scheduleNotificationToday(template, time, id);
  }, []);

  // 예약 취소
  const cancelScheduledNotification = useCallback((id: string): boolean => {
    return notificationService.cancelScheduledNotification(id);
  }, []);

  // 모든 예약 취소
  const cancelAllScheduledNotifications = useCallback(() => {
    notificationService.cancelAllScheduledNotifications();
  }, []);

  // 일일 알림 스케줄링
  const scheduleDailyNotifications = useCallback(() => {
    if (!settings.enabled || permission !== 'granted') return;
    
    // 기존 예약 취소
    cancelAllScheduledNotifications();
    
    // 아침 브리핑
    if (settings.morningBriefing) {
      const template = getRandomTemplate(MORNING_BRIEFING_TEMPLATES);
      scheduleNotificationToday(template, settings.morningBriefingTime, 'morning-briefing');
    }
    
    // 저녁 마무리
    if (settings.eveningWrap) {
      const template = getRandomTemplate(EVENING_WRAP_TEMPLATES);
      scheduleNotificationToday(template, settings.eveningWrapTime, 'evening-wrap');
    }
  }, [
    settings,
    permission,
    cancelAllScheduledNotifications,
    scheduleNotificationToday
  ]);

  // 매일 자정에 일일 알림 재스케줄링
  useEffect(() => {
    if (!isInitialized || permission !== 'granted') return;
    
    // 초기 스케줄링
    scheduleDailyNotifications();
    
    // 자정에 재스케줄링
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    const midnightTimeout = setTimeout(() => {
      scheduleDailyNotifications();
      // 이후 24시간마다 반복
      const dailyInterval = setInterval(scheduleDailyNotifications, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);
    
    return () => clearTimeout(midnightTimeout);
  }, [isInitialized, permission, scheduleDailyNotifications]);

  return {
    permission,
    isSupported: notificationService.isSupported(),
    isEnabled: settings.enabled,
    settings,
    requestPermission,
    updateSettings,
    setEnabled,
    showNotification,
    showMorningBriefing,
    showMeetingReminder,
    showTaskReminder,
    showBreakReminder,
    showEveningWrap,
    showEncouragement,
    showBodyDoublingInvite,
    showFocusEnd,
    showOverloadWarning,
    scheduleNotification,
    scheduleNotificationToday,
    cancelScheduledNotification,
    cancelAllScheduledNotifications,
    scheduleDailyNotifications
  };
}

export default useNotifications;
