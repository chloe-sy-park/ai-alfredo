/**
 * 알림 설정 스토어
 * PWA Push 알림 설정 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationSettings {
  // 전체 알림 on/off
  enabled: boolean;

  // 알림 종류별 설정
  morningBriefing: boolean;
  taskReminders: boolean;
  meetingReminders: boolean;
  breakReminders: boolean;
  eveningReview: boolean;
  alfredoNudges: boolean; // 알프레도의 넛지

  // 리마인더 시간 설정
  taskReminderHours: number[]; // [1, 3, 24] = 마감 1시간, 3시간, 24시간 전
  meetingReminderMinutes: number; // 미팅 몇 분 전

  // 조용한 시간
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"

  // 아침 브리핑 시간
  morningBriefingTime: string; // "07:00"

  // 푸시 구독 상태
  pushSubscribed: boolean;
}

interface NotificationSettingsState extends NotificationSettings {
  // Actions
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  toggleNotification: (key: keyof Pick<NotificationSettings,
    'enabled' | 'morningBriefing' | 'taskReminders' | 'meetingReminders' |
    'breakReminders' | 'eveningReview' | 'alfredoNudges' | 'quietHoursEnabled'
  >) => void;
  setTaskReminderHours: (hours: number[]) => void;
  setMeetingReminderMinutes: (minutes: number) => void;
  setQuietHours: (start: string, end: string) => void;
  setMorningBriefingTime: (time: string) => void;
  setPushSubscribed: (subscribed: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  morningBriefing: true,
  taskReminders: true,
  meetingReminders: true,
  breakReminders: true,
  eveningReview: true,
  alfredoNudges: true,
  taskReminderHours: [1, 3, 24],
  meetingReminderMinutes: 10,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  morningBriefingTime: '07:00',
  pushSubscribed: false,
};

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),

      toggleNotification: (key) => set((state) => ({ [key]: !state[key] })),

      setTaskReminderHours: (hours) => set({ taskReminderHours: hours }),

      setMeetingReminderMinutes: (minutes) => set({ meetingReminderMinutes: minutes }),

      setQuietHours: (start, end) => set({ quietHoursStart: start, quietHoursEnd: end }),

      setMorningBriefingTime: (time) => set({ morningBriefingTime: time }),

      setPushSubscribed: (subscribed) => set({ pushSubscribed: subscribed }),

      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'notification-settings',
    }
  )
);
