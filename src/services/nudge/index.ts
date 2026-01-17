/**
 * 넛지 시스템 메인 엔트리
 *
 * 7+ 가지 트리거:
 * 1. 미팅 전 리마인더 (15분/5분 전)
 * 2. 집중시간 제안 (피크 시간대)
 * 3. 방치 태스크 넛지 (24시간+)
 * 4. 과부하 경고 (일정 밀집)
 * 5. 휴식 권유 (장시간 작업)
 * 6. 퇴근 권유 (업무 종료)
 * 7. 지각 방지 (출발 시간)
 * + 아침/저녁 브리핑, 연속 달성 축하
 */

// Types
export type {
  Nudge,
  NudgeType,
  NudgePriority,
  NudgeAction,
  NudgeTrigger,
  TriggerContext,
  TriggerResult,
  NudgeHistoryItem,
  NudgeLimits,
  CooldownRules,
  NotificationSettings
} from './types';

export {
  DEFAULT_NUDGE_LIMITS,
  DEFAULT_COOLDOWN_RULES
} from './types';

// Triggers
export {
  meetingReminderTrigger,
  focusSuggestTrigger,
  neglectedTaskTrigger,
  overloadWarnTrigger,
  restSuggestTrigger,
  lateWarningTrigger,
  departureAlertTrigger,
  allTriggers,
  triggerMap
} from './triggers';

// Messages
export {
  NUDGE_TEMPLATES,
  NUDGE_EMOJIS,
  applyTemplate,
  applyToneToNudge
} from './messages';

// Scheduler
export {
  addToHistory,
  markAsRead,
  markAction,
  getRecentNudges,
  clearHistory,
  isQuietHours,
  checkLimits,
  checkCooldown,
  runAllTriggers,
  runTrigger,
  startScheduler,
  stopScheduler,
  isSchedulerRunning,
  INTENSITY_PRESETS
} from './scheduler';

// Push Integration
export {
  sendNudgeAsPush,
  scheduleNudgeAsPush,
  cancelScheduledNudgePush,
  isPushEnabled
} from './pushIntegration';

// === 편의 함수 ===
import type { Nudge, TriggerContext, NotificationSettings } from './types';
import { runAllTriggers, addToHistory } from './scheduler';

/**
 * 넛지 시스템 초기화 및 넛지 체크
 */
export function checkForNudges(
  context: TriggerContext,
  settings?: Partial<NotificationSettings>
): Nudge[] {
  const nudges = runAllTriggers(context, settings);

  // 히스토리에 추가
  nudges.forEach(addToHistory);

  return nudges;
}

/**
 * 간단한 컨텍스트 기반 넛지 생성
 * (기존 createContextualNudge 대체)
 */
export function createContextualNudge(
  context: {
    time?: Date;
    condition?: string;
    workMode?: boolean;
    focusTime?: number;  // 초 단위
  }
): Omit<Nudge, 'id' | 'createdAt'> | null {
  const hour = context.time?.getHours() || new Date().getHours();

  // 아침 인사 (6-9시)
  if (hour >= 6 && hour < 9) {
    return {
      type: 'morning_briefing',
      title: '좋은 아침이에요!',
      body: '오늘 가장 중요한 일부터 시작해볼까요?',
      emoji: '🌅',
      priority: 'medium'
    };
  }

  // 점심시간 (12시)
  if (hour === 12) {
    return {
      type: 'rest_suggest',
      title: '점심 시간이에요',
      body: '잠깐 쉬고 에너지를 충전하세요!',
      emoji: '🥗',
      priority: 'high'
    };
  }

  // 장시간 집중 (90분+ 초단위로 입력됨)
  if (context.focusTime && context.focusTime > 90 * 60) {
    return {
      type: 'rest_suggest',
      title: '잠깐 쉬어가요',
      body: '90분 넘게 집중하셨네요! 5분만 스트레칭하고 올까요?',
      emoji: '💆',
      priority: 'high',
      actions: [
        { id: 'rest', label: '5분 휴식하기' }
      ]
    };
  }

  // 저녁 마무리 (18-20시, workMode true)
  if (hour >= 18 && hour < 20 && context.workMode) {
    return {
      type: 'evening_wrapup',
      title: '오늘 하루도 수고했어요',
      body: '마무리할 시간이에요!',
      emoji: '🌆',
      priority: 'low'
    };
  }

  // 늦은 시간 (20시 이후, workMode true)
  if (hour >= 20 && context.workMode) {
    return {
      type: 'late_warning',
      title: '퇴근 시간이에요',
      body: `벌써 ${hour}시예요. 내일을 위해 충전하세요!`,
      emoji: '🌙',
      priority: 'medium'
    };
  }

  return null;
}
