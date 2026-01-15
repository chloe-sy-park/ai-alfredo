/**
 * Human Imperfection 서비스
 * 인간의 불완전함을 허용하고 수용
 */

import {
  ImperfectionType,
  ImperfectionMoment,
  ComfortResponse,
  FlexibilitySettings,
  GracePeriod,
  COMFORT_MESSAGES,
  ENCOURAGEMENT_MESSAGES,
  GENTLE_REMINDERS,
  DEFAULT_FLEXIBILITY_SETTINGS
} from './types';

const IMPERFECTION_HISTORY_KEY = 'alfredo_imperfection_history';
const FLEXIBILITY_SETTINGS_KEY = 'alfredo_flexibility_settings';
const GRACE_PERIODS_KEY = 'alfredo_grace_periods';

// ========== 불완전함 기록 ==========

/**
 * 불완전함 순간 기록
 */
export function recordImperfection(
  type: ImperfectionType,
  context: string
): ImperfectionMoment {
  const response = getComfortResponse(type);

  const moment: ImperfectionMoment = {
    id: `imperfection_${Date.now()}`,
    type,
    context,
    timestamp: new Date().toISOString(),
    response
  };

  try {
    const stored = localStorage.getItem(IMPERFECTION_HISTORY_KEY);
    const history: ImperfectionMoment[] = stored ? JSON.parse(stored) : [];

    history.push(moment);

    // 최근 100개만 유지
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    localStorage.setItem(IMPERFECTION_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to record imperfection:', e);
  }

  return moment;
}

/**
 * 불완전함 이력 로드
 */
export function loadImperfectionHistory(): ImperfectionMoment[] {
  try {
    const stored = localStorage.getItem(IMPERFECTION_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load imperfection history:', e);
  }
  return [];
}

/**
 * 사용자 피드백 기록
 */
export function recordFeedback(
  momentId: string,
  feeling: 'better' | 'same' | 'worse'
): void {
  try {
    const stored = localStorage.getItem(IMPERFECTION_HISTORY_KEY);
    const history: ImperfectionMoment[] = stored ? JSON.parse(stored) : [];

    const moment = history.find(m => m.id === momentId);
    if (moment) {
      moment.userFeeling = feeling;
      localStorage.setItem(IMPERFECTION_HISTORY_KEY, JSON.stringify(history));
    }
  } catch (e) {
    console.error('Failed to record feedback:', e);
  }
}

// ========== 위로 응답 ==========

/**
 * 위로 응답 생성
 */
export function getComfortResponse(type: ImperfectionType): ComfortResponse {
  const responses = COMFORT_MESSAGES[type];
  if (!responses || responses.length === 0) {
    return {
      message: '괜찮아요',
      tone: 'understanding'
    };
  }

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * 격려 메시지
 */
export function getEncouragementMessage(): string {
  return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
}

/**
 * 부드러운 리마인더
 */
export function getGentleReminder(): string {
  return GENTLE_REMINDERS[Math.floor(Math.random() * GENTLE_REMINDERS.length)];
}

// ========== 유연성 설정 ==========

/**
 * 유연성 설정 로드
 */
export function loadFlexibilitySettings(): FlexibilitySettings {
  try {
    const stored = localStorage.getItem(FLEXIBILITY_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_FLEXIBILITY_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load flexibility settings:', e);
  }
  return { ...DEFAULT_FLEXIBILITY_SETTINGS };
}

/**
 * 유연성 설정 저장
 */
export function saveFlexibilitySettings(settings: Partial<FlexibilitySettings>): void {
  try {
    const current = loadFlexibilitySettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(FLEXIBILITY_SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save flexibility settings:', e);
  }
}

/**
 * 개별 설정 토글
 */
export function toggleFlexibilitySetting(
  key: keyof FlexibilitySettings
): boolean {
  const settings = loadFlexibilitySettings();
  const newValue = !settings[key];
  saveFlexibilitySettings({ [key]: newValue });
  return newValue;
}

// ========== 그레이스 기간 (유예) ==========

/**
 * 그레이스 기간 요청
 */
export function requestGracePeriod(
  taskId: string,
  originalDeadline: string,
  extensionDays: number = 1,
  reason?: string
): GracePeriod {
  const extended = new Date(originalDeadline);
  extended.setDate(extended.getDate() + extensionDays);

  const gracePeriod: GracePeriod = {
    taskId,
    originalDeadline,
    extendedDeadline: extended.toISOString(),
    reason,
    granted: true  // 항상 허용 (사용자 친화적)
  };

  try {
    const stored = localStorage.getItem(GRACE_PERIODS_KEY);
    const periods: GracePeriod[] = stored ? JSON.parse(stored) : [];
    periods.push(gracePeriod);
    localStorage.setItem(GRACE_PERIODS_KEY, JSON.stringify(periods));
  } catch (e) {
    console.error('Failed to save grace period:', e);
  }

  return gracePeriod;
}

/**
 * 태스크의 그레이스 기간 확인
 */
export function getGracePeriod(taskId: string): GracePeriod | null {
  try {
    const stored = localStorage.getItem(GRACE_PERIODS_KEY);
    const periods: GracePeriod[] = stored ? JSON.parse(stored) : [];
    return periods.find(p => p.taskId === taskId) || null;
  } catch (e) {
    console.error('Failed to get grace period:', e);
  }
  return null;
}

// ========== 상황별 응답 ==========

/**
 * 할 일 놓쳤을 때
 */
export function onTaskMissed(taskTitle: string): ComfortResponse {
  recordImperfection('missed_task', taskTitle);
  return getComfortResponse('missed_task');
}

/**
 * 연속 기록 끊겼을 때
 */
export function onStreakBroken(streakDays: number): ComfortResponse {
  recordImperfection('broken_streak', `${streakDays}일 연속 기록`);
  return getComfortResponse('broken_streak');
}

/**
 * 계획 변경했을 때
 */
export function onPlanChanged(context: string): ComfortResponse {
  recordImperfection('changed_mind', context);
  return getComfortResponse('changed_mind');
}

/**
 * 미뤘을 때
 */
export function onProcrastinated(taskTitle: string): ComfortResponse {
  recordImperfection('procrastinated', taskTitle);
  return getComfortResponse('procrastinated');
}

/**
 * 너무 많이 계획했을 때
 */
export function onOvercommitted(taskCount: number): ComfortResponse {
  recordImperfection('overcommitted', `${taskCount}개 태스크`);
  return getComfortResponse('overcommitted');
}

// ========== 분석 ==========

/**
 * 불완전함 패턴 분석
 */
export function analyzeImperfectionPatterns(): {
  mostCommon: ImperfectionType | null;
  totalCount: number;
  responseEffectiveness: number;
} {
  const history = loadImperfectionHistory();

  if (history.length === 0) {
    return {
      mostCommon: null,
      totalCount: 0,
      responseEffectiveness: 0
    };
  }

  // 가장 흔한 타입
  const typeCounts: Record<string, number> = {};
  history.forEach(m => {
    typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
  });

  let mostCommon: ImperfectionType | null = null;
  let maxCount = 0;
  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = type as ImperfectionType;
    }
  });

  // 응답 효과 (better 비율)
  const withFeedback = history.filter(m => m.userFeeling);
  const betterCount = withFeedback.filter(m => m.userFeeling === 'better').length;
  const responseEffectiveness = withFeedback.length > 0
    ? (betterCount / withFeedback.length) * 100
    : 0;

  return {
    mostCommon,
    totalCount: history.length,
    responseEffectiveness
  };
}

/**
 * 오늘 격려가 필요한지 확인
 */
export function needsEncouragement(): boolean {
  const today = new Date().toDateString();
  const history = loadImperfectionHistory();

  const todayCount = history.filter(
    m => new Date(m.timestamp).toDateString() === today
  ).length;

  return todayCount >= 2;
}

/**
 * 사용자에게 맞는 메시지 스타일 추천
 */
export function getPreferredComfortStyle(): string {
  const history = loadImperfectionHistory();
  const withFeedback = history.filter(m => m.userFeeling === 'better' && m.response);

  if (withFeedback.length < 3) {
    return 'understanding';  // 기본값
  }

  // 효과적이었던 톤 분석
  const toneCounts: Record<string, number> = {};
  withFeedback.forEach(m => {
    const tone = m.response?.tone;
    if (tone) {
      toneCounts[tone] = (toneCounts[tone] || 0) + 1;
    }
  });

  let bestTone = 'understanding';
  let maxCount = 0;
  Object.entries(toneCounts).forEach(([tone, count]) => {
    if (count > maxCount) {
      maxCount = count;
      bestTone = tone;
    }
  });

  return bestTone;
}
