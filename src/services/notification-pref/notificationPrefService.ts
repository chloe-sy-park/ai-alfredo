/**
 * Notification Preference 서비스
 */

import {
  NotificationPreferences,
  NotificationChannel,
  NotificationFrequency,
  DEFAULT_NOTIFICATION_PREFS
} from './types';

const PREF_KEY = 'alfredo_notification_prefs';

export function loadNotificationPrefs(): NotificationPreferences {
  try {
    const stored = localStorage.getItem(PREF_KEY);
    if (stored) return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(stored) };
  } catch (e) {
    console.error('Failed to load notification prefs:', e);
  }
  return { ...DEFAULT_NOTIFICATION_PREFS };
}

export function saveNotificationPrefs(prefs: Partial<NotificationPreferences>): void {
  try {
    const current = loadNotificationPrefs();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREF_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save notification prefs:', e);
  }
}

export function toggleNotifications(enabled: boolean): void {
  saveNotificationPrefs({ enabled });
}

export function setQuietHours(start: string, end: string): void {
  saveNotificationPrefs({ quietHours: { start, end } });
}

export function disableQuietHours(): void {
  saveNotificationPrefs({ quietHours: null });
}

export function setChannel(category: string, channel: NotificationChannel): void {
  const prefs = loadNotificationPrefs();
  prefs.channels[category] = channel;
  saveNotificationPrefs({ channels: prefs.channels });
}

export function setFrequency(frequency: NotificationFrequency): void {
  saveNotificationPrefs({ frequency });
}

export function toggleCategory(category: keyof NotificationPreferences['categories'], enabled: boolean): void {
  const prefs = loadNotificationPrefs();
  prefs.categories[category] = enabled;
  saveNotificationPrefs({ categories: prefs.categories });
}

export function isInQuietHours(): boolean {
  const prefs = loadNotificationPrefs();
  if (!prefs.quietHours) return false;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const { start, end } = prefs.quietHours;

  if (start < end) {
    return currentTime >= start && currentTime < end;
  } else {
    return currentTime >= start || currentTime < end;
  }
}

export function shouldSendNotification(category: keyof NotificationPreferences['categories']): boolean {
  const prefs = loadNotificationPrefs();
  if (!prefs.enabled) return false;
  if (isInQuietHours()) return false;
  return prefs.categories[category] ?? true;
}
