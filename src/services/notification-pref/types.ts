/**
 * Notification Preference 타입 정의
 */

export type NotificationChannel = 'push' | 'email' | 'in_app' | 'none';
export type NotificationFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly';

export interface NotificationPreferences {
  enabled: boolean;
  channels: Record<string, NotificationChannel>;
  quietHours: { start: string; end: string } | null;
  frequency: NotificationFrequency;
  categories: {
    reminders: boolean;
    suggestions: boolean;
    milestones: boolean;
    weekly_summary: boolean;
    urgent_only: boolean;
  };
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  enabled: true,
  channels: {
    reminders: 'push',
    suggestions: 'in_app',
    milestones: 'push',
    weekly_summary: 'email'
  },
  quietHours: { start: '22:00', end: '08:00' },
  frequency: 'realtime',
  categories: {
    reminders: true,
    suggestions: true,
    milestones: true,
    weekly_summary: true,
    urgent_only: false
  }
};

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  push: '푸시 알림',
  email: '이메일',
  in_app: '앱 내 알림',
  none: '끄기'
};

export const FREQUENCY_LABELS: Record<NotificationFrequency, string> = {
  realtime: '즉시',
  hourly: '매시간 모아서',
  daily: '하루에 한 번',
  weekly: '일주일에 한 번'
};
