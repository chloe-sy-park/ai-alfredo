/**
 * 알프레도 알림 서비스
 * PWA 푸시 알림 관리
 */

import { NotificationTemplate } from './notificationTemplates';

export type NotificationPermission = 'granted' | 'denied' | 'default';

export interface NotificationSettings {
  enabled: boolean;
  morningBriefing: boolean;
  morningBriefingTime: string; // "08:00"
  meetingReminder: boolean;
  meetingReminderMinutes: number; // 10, 15, 30
  breakReminder: boolean;
  breakReminderInterval: number; // 분 단위
  eveningWrap: boolean;
  eveningWrapTime: string; // "18:00"
  encouragement: boolean;
}

// Service Worker Notification Options (확장된 타입)
interface ServiceWorkerNotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: unknown;
  actions?: { action: string; title: string }[];
  requireInteraction?: boolean;
  vibrate?: number[];
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  morningBriefing: true,
  morningBriefingTime: '08:00',
  meetingReminder: true,
  meetingReminderMinutes: 10,
  breakReminder: true,
  breakReminderInterval: 25,
  eveningWrap: true,
  eveningWrapTime: '18:00',
  encouragement: true
};

const SETTINGS_KEY = 'alfredo_notification_settings';
const SW_PATH = '/sw.js';

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private settings: NotificationSettings;
  private scheduledNotifications: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * 서비스 워커 등록
   */
  async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register(SW_PATH);
      console.log('Service Worker registered:', this.swRegistration);
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * 알림 권한 확인
   */
  getPermission(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission as NotificationPermission;
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  }

  /**
   * 알림 지원 여부 확인
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * 즉시 알림 표시
   */
  async showNotification(template: NotificationTemplate): Promise<boolean> {
    if (!this.settings.enabled) return false;
    
    const permission = this.getPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    try {
      if (this.swRegistration) {
        // Service Worker를 통한 알림 (확장 옵션 지원)
        const options: ServiceWorkerNotificationOptions = {
          body: template.body,
          icon: template.icon || '/alfredo-icon.svg',
          badge: '/alfredo-badge.svg',
          tag: template.tag,
          data: template.data,
          vibrate: [100, 50, 100]
        };
        
        if (template.actions) {
          options.actions = template.actions;
        }
        if (template.requireInteraction) {
          options.requireInteraction = template.requireInteraction;
        }
        
        await this.swRegistration.showNotification(
          template.title, 
          options as NotificationOptions
        );
      } else {
        // 폴백: 기본 Notification API 사용
        new Notification(template.title, {
          body: template.body,
          icon: template.icon || '/alfredo-icon.svg',
          tag: template.tag
        });
      }
      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }

  /**
   * 알림 예약
   */
  scheduleNotification(
    template: NotificationTemplate,
    delayMs: number,
    id?: string
  ): string {
    const notificationId = id || `notification-${Date.now()}`;
    
    // 기존 예약 취소
    this.cancelScheduledNotification(notificationId);
    
    const timeout = setTimeout(() => {
      this.showNotification(template);
      this.scheduledNotifications.delete(notificationId);
    }, delayMs);
    
    this.scheduledNotifications.set(notificationId, timeout);
    return notificationId;
  }

  /**
   * 특정 시간에 알림 예약
   */
  scheduleNotificationAt(
    template: NotificationTemplate,
    time: Date,
    id?: string
  ): string | null {
    const now = new Date();
    const delay = time.getTime() - now.getTime();
    
    if (delay <= 0) {
      console.warn('Cannot schedule notification in the past');
      return null;
    }
    
    return this.scheduleNotification(template, delay, id);
  }

  /**
   * 오늘 특정 시간에 알림 예약
   */
  scheduleNotificationToday(
    template: NotificationTemplate,
    timeString: string, // "08:00" 형식
    id?: string
  ): string | null {
    const [hours, minutes] = timeString.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);
    
    // 이미 지난 시간이면 null 반환
    if (targetTime.getTime() <= Date.now()) {
      return null;
    }
    
    return this.scheduleNotificationAt(template, targetTime, id);
  }

  /**
   * 예약된 알림 취소
   */
  cancelScheduledNotification(id: string): boolean {
    const timeout = this.scheduledNotifications.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledNotifications.delete(id);
      return true;
    }
    return false;
  }

  /**
   * 모든 예약된 알림 취소
   */
  cancelAllScheduledNotifications(): void {
    this.scheduledNotifications.forEach((timeout) => clearTimeout(timeout));
    this.scheduledNotifications.clear();
  }

  /**
   * 설정 로드
   */
  loadSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * 설정 저장
   */
  saveSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  /**
   * 현재 설정 가져오기
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * 알림 활성화/비활성화
   */
  setEnabled(enabled: boolean): void {
    this.saveSettings({ enabled });
    if (!enabled) {
      this.cancelAllScheduledNotifications();
    }
  }

  /**
   * 서비스 워커에 메시지 전송
   */
  async sendToServiceWorker(message: unknown): Promise<void> {
    if (!this.swRegistration?.active) {
      console.warn('No active service worker');
      return;
    }
    this.swRegistration.active.postMessage(message);
  }
}

// 싱글톤 인스턴스
export const notificationService = new NotificationService();

export default notificationService;
