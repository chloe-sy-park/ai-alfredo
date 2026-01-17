/**
 * 넛지 스케줄러
 * 트리거 체크 및 쿨다운 관리
 */

import type {
  Nudge,
  NudgeType,
  NudgeHistoryItem,
  NudgeLimits,
  TriggerContext,
  NotificationSettings,
  CooldownRules
} from './types';
import { DEFAULT_NUDGE_LIMITS, DEFAULT_COOLDOWN_RULES } from './types';
import { allTriggers, triggerMap } from './triggers';
import { applyToneToNudge, NUDGE_EMOJIS } from './messages';

// === 넛지 히스토리 저장소 (메모리) ===
let nudgeHistory: NudgeHistoryItem[] = [];

// === 히스토리 관리 ===
export function addToHistory(nudge: Nudge): void {
  nudgeHistory.push({
    id: nudge.id,
    type: nudge.type,
    targetId: nudge.relatedData?.taskId || nudge.relatedData?.eventId,
    sentAt: nudge.createdAt,
    readAt: undefined,
    actionTaken: undefined
  });

  // 24시간 이상 된 히스토리 정리
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  nudgeHistory = nudgeHistory.filter(h =>
    new Date(h.sentAt).getTime() > oneDayAgo
  );
}

export function markAsRead(nudgeId: string): void {
  const item = nudgeHistory.find(h => h.id === nudgeId);
  if (item) {
    item.readAt = new Date().toISOString();
  }
}

export function markAction(nudgeId: string, action: NudgeHistoryItem['actionTaken']): void {
  const item = nudgeHistory.find(h => h.id === nudgeId);
  if (item) {
    item.actionTaken = action;
  }
}

export function getRecentNudges(hours: number = 24): NudgeHistoryItem[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return nudgeHistory.filter(h => new Date(h.sentAt).getTime() > cutoff);
}

export function clearHistory(): void {
  nudgeHistory = [];
}

// === 조용한 시간 체크 ===
export function isQuietHours(
  currentTime: Date,
  settings?: Partial<NotificationSettings>
): boolean {
  const quietStart = settings?.quietStart || '22:00';
  const quietEnd = settings?.quietEnd || '07:00';

  const hour = currentTime.getHours();
  const minute = currentTime.getMinutes();
  const currentMinutes = hour * 60 + minute;

  const [startHour, startMinute] = quietStart.split(':').map(Number);
  const [endHour, endMinute] = quietEnd.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  // 자정을 넘는 경우 (예: 22:00 ~ 07:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

// === 제한 체크 ===
export function checkLimits(
  type: NudgeType,
  recentNudges: NudgeHistoryItem[],
  limits: NudgeLimits = DEFAULT_NUDGE_LIMITS
): { allowed: boolean; reason?: string } {
  // 일일 최대 체크
  if (recentNudges.length >= limits.dailyMax) {
    return { allowed: false, reason: 'daily_limit_exceeded' };
  }

  // 타입별 최대 체크
  const typeCount = recentNudges.filter(n => n.type === type).length;
  const typeLimit = limits.perType[type] || 5;
  if (typeCount >= typeLimit) {
    return { allowed: false, reason: 'type_limit_exceeded' };
  }

  // 최소 간격 체크
  const lastNudgeOfType = recentNudges
    .filter(n => n.type === type)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];

  if (lastNudgeOfType) {
    const minInterval = limits.minInterval[type] || limits.minInterval.default;
    const elapsed = (Date.now() - new Date(lastNudgeOfType.sentAt).getTime()) / (60 * 1000);

    if (elapsed < minInterval) {
      return { allowed: false, reason: 'min_interval_not_met' };
    }
  }

  return { allowed: true };
}

// === 쿨다운 체크 ===
export function checkCooldown(
  type: NudgeType,
  targetId: string | undefined,
  recentNudges: NudgeHistoryItem[],
  rules?: CooldownRules
): { allowed: boolean; reason?: string } {
  if (!targetId) return { allowed: true };

  const cooldownRules = rules || DEFAULT_COOLDOWN_RULES[type];
  if (!cooldownRules) return { allowed: true };

  // 같은 대상에 대한 마지막 넛지 찾기
  const lastNudge = recentNudges
    .filter(n => n.type === type && n.targetId === targetId)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];

  if (!lastNudge) return { allowed: true };

  const elapsed = (Date.now() - new Date(lastNudge.sentAt).getTime()) / (60 * 1000);

  // 액션 후 쿨다운
  if (lastNudge.actionTaken && cooldownRules.afterAction) {
    if (elapsed < cooldownRules.afterAction) {
      return { allowed: false, reason: 'post_action_cooldown' };
    }
  }

  // 같은 대상 쿨다운
  if (cooldownRules.sameTarget && elapsed < cooldownRules.sameTarget) {
    return { allowed: false, reason: 'same_target_cooldown' };
  }

  return { allowed: true };
}

// === 넛지 생성 ID ===
function generateNudgeId(): string {
  return `nudge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// === 모든 트리거 실행 ===
export function runAllTriggers(
  context: TriggerContext,
  settings?: Partial<NotificationSettings>
): Nudge[] {
  const results: Nudge[] = [];
  const currentTime = context.currentTime || new Date();
  const recentNudges = context.recentNudges || getRecentNudges(24);
  const tonePreset = context.user?.tonePreset || 'butler';

  // 조용한 시간 체크
  const quiet = isQuietHours(currentTime, settings);
  const quietExceptions = DEFAULT_NUDGE_LIMITS.quietHours.exceptions;

  for (const trigger of allTriggers) {
    // 조용한 시간이면 예외 타입만 실행
    if (quiet && !quietExceptions.includes(trigger.type)) {
      continue;
    }

    // 설정에서 비활성화된 타입 건너뛰기
    if (settings?.types && settings.types[trigger.type] === false) {
      continue;
    }

    // 제한 체크
    const limitCheck = checkLimits(trigger.type, recentNudges);
    if (!limitCheck.allowed) {
      continue;
    }

    // 조건 체크
    if (!trigger.checkCondition(context)) {
      continue;
    }

    // 넛지 생성
    const result = trigger.generateNudge(context);
    if (!result.shouldTrigger || !result.nudge) {
      continue;
    }

    // 쿨다운 체크
    const targetId = result.nudge.relatedData?.taskId || result.nudge.relatedData?.eventId;
    const cooldownCheck = checkCooldown(
      trigger.type,
      targetId,
      recentNudges,
      trigger.cooldownRules
    );
    if (!cooldownCheck.allowed) {
      continue;
    }

    // 톤 적용
    const toneApplied = applyToneToNudge(result.nudge, tonePreset as any);

    // 넛지 완성
    const nudge: Nudge = {
      ...toneApplied,
      id: generateNudgeId(),
      emoji: toneApplied.emoji || NUDGE_EMOJIS[trigger.type],
      createdAt: currentTime.toISOString()
    };

    results.push(nudge);
  }

  return results;
}

// === 특정 타입 트리거 실행 ===
export function runTrigger(
  type: NudgeType,
  context: TriggerContext,
  _settings?: Partial<NotificationSettings>
): Nudge | null {
  const trigger = triggerMap[type];
  if (!trigger) return null;

  const currentTime = context.currentTime || new Date();
  const recentNudges = context.recentNudges || getRecentNudges(24);
  const tonePreset = context.user?.tonePreset || 'butler';

  // 제한 체크
  const limitCheck = checkLimits(type, recentNudges);
  if (!limitCheck.allowed) return null;

  // 조건 체크
  if (!trigger.checkCondition(context)) return null;

  // 넛지 생성
  const result = trigger.generateNudge(context);
  if (!result.shouldTrigger || !result.nudge) return null;

  // 쿨다운 체크
  const targetId = result.nudge.relatedData?.taskId || result.nudge.relatedData?.eventId;
  const cooldownCheck = checkCooldown(type, targetId, recentNudges, trigger.cooldownRules);
  if (!cooldownCheck.allowed) return null;

  // 톤 적용
  const toneApplied = applyToneToNudge(result.nudge, tonePreset as any);

  // 넛지 완성
  const nudge: Nudge = {
    ...toneApplied,
    id: generateNudgeId(),
    emoji: toneApplied.emoji || NUDGE_EMOJIS[type],
    createdAt: currentTime.toISOString()
  };

  return nudge;
}

// === 주기적 체크 스케줄러 ===
let schedulerInterval: ReturnType<typeof setInterval> | null = null;

export interface SchedulerCallbacks {
  onNudge: (nudge: Nudge) => void;
  getContext: () => TriggerContext;
  getSettings?: () => Partial<NotificationSettings>;
}

export function startScheduler(
  callbacks: SchedulerCallbacks,
  intervalMs: number = 60000  // 1분
): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  schedulerInterval = setInterval(() => {
    const context = callbacks.getContext();
    const settings = callbacks.getSettings?.();

    const nudges = runAllTriggers(context, settings);

    for (const nudge of nudges) {
      addToHistory(nudge);
      callbacks.onNudge(nudge);
    }
  }, intervalMs);

  // 즉시 한 번 실행
  const context = callbacks.getContext();
  const settings = callbacks.getSettings?.();
  const nudges = runAllTriggers(context, settings);

  for (const nudge of nudges) {
    addToHistory(nudge);
    callbacks.onNudge(nudge);
  }
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

export function isSchedulerRunning(): boolean {
  return schedulerInterval !== null;
}

// === 강도별 프리셋 ===
export const INTENSITY_PRESETS: Record<NotificationSettings['nudgeIntensity'], Partial<NotificationSettings>> = {
  minimal: {
    types: {
      morning_briefing: true,
      evening_wrapup: false,
      meeting_reminder: true,
      focus_suggest: false,
      task_nudge: false,
      overload_warn: false,
      rest_suggest: false,
      late_warning: false,
      streak_celebrate: true,
      departure_alert: true
    }
  },
  balanced: {
    types: {
      morning_briefing: true,
      evening_wrapup: true,
      meeting_reminder: true,
      focus_suggest: true,
      task_nudge: true,
      overload_warn: true,
      rest_suggest: true,
      late_warning: true,
      streak_celebrate: true,
      departure_alert: true
    }
  },
  proactive: {
    types: {
      morning_briefing: true,
      evening_wrapup: true,
      meeting_reminder: true,
      focus_suggest: true,
      task_nudge: true,
      overload_warn: true,
      rest_suggest: true,
      late_warning: true,
      streak_celebrate: true,
      departure_alert: true
    }
  }
};
