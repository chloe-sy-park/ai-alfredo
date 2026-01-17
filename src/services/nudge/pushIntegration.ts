/**
 * 넛지 - 푸시 알림 연동
 * 넛지 발생 시 푸시 알림 전송
 */

import type { Nudge, NudgeType } from './types';
import { notificationService } from '../notifications/notificationService';
import type { NotificationTemplate } from '../notifications/notificationTemplates';

// 넛지 타입 → 알림 태그 매핑
const NUDGE_TYPE_TO_TAG: Record<NudgeType, string> = {
  morning_briefing: 'morning-briefing',
  evening_wrapup: 'evening-wrap',
  meeting_reminder: 'meeting-reminder',
  focus_suggest: 'focus-suggest',
  task_nudge: 'task-reminder',
  overload_warn: 'overload-warning',
  rest_suggest: 'break-reminder',
  late_warning: 'late-warning',
  streak_celebrate: 'celebration',
  departure_alert: 'departure-alert',
};

/**
 * 넛지를 푸시 알림 템플릿으로 변환
 */
function nudgeToNotificationTemplate(nudge: Nudge): NotificationTemplate {
  return {
    title: `${nudge.emoji || '🐧'} ${nudge.title}`,
    body: nudge.body,
    tag: `${NUDGE_TYPE_TO_TAG[nudge.type]}-${nudge.id}`,
    requireInteraction: nudge.priority === 'high',
    actions: nudge.actions?.slice(0, 2).map(action => ({
      action: action.id,
      title: action.label,
    })),
    data: {
      type: nudge.type as any,
      nudgeId: nudge.id,
      relatedData: nudge.relatedData,
    },
  };
}

/**
 * 넛지를 푸시 알림으로 전송
 */
export async function sendNudgeAsPush(nudge: Nudge): Promise<boolean> {
  // 푸시 지원 및 권한 확인
  if (!notificationService.isSupported()) {
    return false;
  }

  const permission = notificationService.getPermission();
  if (permission !== 'granted') {
    return false;
  }

  const template = nudgeToNotificationTemplate(nudge);
  return notificationService.showNotification(template);
}

/**
 * 예약된 넛지를 푸시 알림으로 스케줄
 */
export function scheduleNudgeAsPush(
  nudge: Nudge,
  delayMs: number
): string {
  const template = nudgeToNotificationTemplate(nudge);
  return notificationService.scheduleNotification(
    template,
    delayMs,
    `nudge-${nudge.id}`
  );
}

/**
 * 예약된 넛지 푸시 취소
 */
export function cancelScheduledNudgePush(nudgeId: string): boolean {
  return notificationService.cancelScheduledNotification(`nudge-${nudgeId}`);
}

/**
 * 푸시 알림이 활성화되어 있는지 확인
 */
export function isPushEnabled(): boolean {
  if (!notificationService.isSupported()) {
    return false;
  }
  return notificationService.getPermission() === 'granted';
}

export default {
  sendNudgeAsPush,
  scheduleNudgeAsPush,
  cancelScheduledNudgePush,
  isPushEnabled,
};
