/**
 * Trust Evidence 추적 서비스
 * 신뢰가 쌓이는 증거를 추적하고 계산
 */

import {
  TrustEvidence,
  TrustEvent,
  Milestone,
  MILESTONES,
  TrustLevelInfo,
  TRUST_LEVELS,
  TrustSummary
} from './types';

const STORAGE_KEY = 'alfredo_trust_evidence';
const EVENTS_KEY = 'alfredo_trust_events';
const MILESTONES_KEY = 'alfredo_milestones';

/**
 * 기본 신뢰 증거 데이터
 */
function getDefaultTrustEvidence(): TrustEvidence {
  return {
    accuracy: {
      briefingRelevance: 0,
      suggestionAcceptance: 0,
      timingPrecision: 0,
      totalSuggestions: 0,
      acceptedSuggestions: 0
    },
    consistency: {
      toneConsistency: true,
      boundaryRespect: true,
      promiseKeeping: 1
    },
    accumulated: {
      daysUsed: 0,
      firstUsedAt: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      lastUsedAt: new Date().toISOString(),
      insightsProvided: 0,
      focusMinutes: 0,
      tasksCompleted: 0,
      timeSavedMinutes: 0
    }
  };
}

/**
 * 신뢰 증거 로드
 */
export function loadTrustEvidence(): TrustEvidence {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...getDefaultTrustEvidence(), ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load trust evidence:', e);
  }
  return getDefaultTrustEvidence();
}

/**
 * 신뢰 증거 저장
 */
export function saveTrustEvidence(evidence: TrustEvidence): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(evidence));
  } catch (e) {
    console.error('Failed to save trust evidence:', e);
  }
}

/**
 * 신뢰 이벤트 기록
 */
export function recordTrustEvent(
  type: TrustEvent['type'],
  metadata?: Record<string, unknown>
): void {
  const event: TrustEvent = {
    id: `event_${Date.now()}`,
    type,
    timestamp: new Date().toISOString(),
    metadata
  };

  try {
    const stored = localStorage.getItem(EVENTS_KEY);
    const events: TrustEvent[] = stored ? JSON.parse(stored) : [];

    events.push(event);

    // 최근 1000개만 유지
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }

    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

    // 신뢰 증거 업데이트
    updateTrustEvidence(event);
  } catch (e) {
    console.error('Failed to record trust event:', e);
  }
}

/**
 * 신뢰 증거 업데이트
 */
function updateTrustEvidence(event: TrustEvent): void {
  const evidence = loadTrustEvidence();

  switch (event.type) {
    case 'suggestion_accepted':
      evidence.accuracy.totalSuggestions++;
      evidence.accuracy.acceptedSuggestions++;
      evidence.accuracy.suggestionAcceptance =
        evidence.accuracy.acceptedSuggestions / evidence.accuracy.totalSuggestions;
      evidence.accumulated.timeSavedMinutes += 5; // 제안당 5분 절약 추정
      break;

    case 'suggestion_dismissed':
      evidence.accuracy.totalSuggestions++;
      evidence.accuracy.suggestionAcceptance =
        evidence.accuracy.acceptedSuggestions / evidence.accuracy.totalSuggestions;
      break;

    case 'focus_completed':
      const focusMinutes = (event.metadata?.minutes as number) || 25;
      evidence.accumulated.focusMinutes += focusMinutes;
      break;

    case 'task_completed':
      evidence.accumulated.tasksCompleted++;
      break;

    case 'daily_visit':
      updateStreak(evidence);
      break;
  }

  evidence.accumulated.insightsProvided++;
  saveTrustEvidence(evidence);

  // 마일스톤 체크
  checkAndUpdateMilestones(evidence);
}

/**
 * 연속 사용 업데이트
 */
function updateStreak(evidence: TrustEvidence): void {
  const today = new Date().toDateString();
  const lastUsed = new Date(evidence.accumulated.lastUsedAt).toDateString();

  if (today === lastUsed) {
    // 오늘 이미 방문함
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastUsed === yesterday.toDateString()) {
    // 어제 방문 -> 연속 유지
    evidence.accumulated.currentStreak++;
  } else {
    // 연속 끊김
    evidence.accumulated.currentStreak = 1;
  }

  // 최장 연속 업데이트
  if (evidence.accumulated.currentStreak > evidence.accumulated.longestStreak) {
    evidence.accumulated.longestStreak = evidence.accumulated.currentStreak;
  }

  // 사용 일수 증가
  evidence.accumulated.daysUsed++;
  evidence.accumulated.lastUsedAt = new Date().toISOString();
}

/**
 * 일일 방문 기록 (앱 시작시 호출)
 */
export function recordDailyVisit(): void {
  recordTrustEvent('daily_visit');
}

/**
 * 제안 수락 기록
 */
export function recordSuggestionAccepted(suggestionId?: string): void {
  recordTrustEvent('suggestion_accepted', { suggestionId });
}

/**
 * 제안 무시 기록
 */
export function recordSuggestionDismissed(suggestionId?: string): void {
  recordTrustEvent('suggestion_dismissed', { suggestionId });
}

/**
 * 집중 완료 기록
 */
export function recordFocusCompleted(minutes: number): void {
  recordTrustEvent('focus_completed', { minutes });
}

/**
 * 태스크 완료 기록
 */
export function recordTaskCompleted(taskId?: string): void {
  recordTrustEvent('task_completed', { taskId });
}

/**
 * 마일스톤 로드
 */
export function loadMilestones(): Milestone[] {
  try {
    const stored = localStorage.getItem(MILESTONES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load milestones:', e);
  }

  // 초기화
  const milestones: Milestone[] = MILESTONES.map((m) => ({
    ...m,
    id: `milestone_${m.type}_${m.value}`,
    celebrated: false
  }));

  localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones));
  return milestones;
}

/**
 * 마일스톤 저장
 */
function saveMilestones(milestones: Milestone[]): void {
  try {
    localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones));
  } catch (e) {
    console.error('Failed to save milestones:', e);
  }
}

/**
 * 마일스톤 달성 체크 및 업데이트
 */
function checkAndUpdateMilestones(evidence: TrustEvidence): Milestone[] {
  const milestones = loadMilestones();
  const newlyAchieved: Milestone[] = [];

  milestones.forEach(milestone => {
    if (milestone.achievedAt) return; // 이미 달성

    let achieved = false;

    switch (milestone.type) {
      case 'days_together':
        achieved = evidence.accumulated.daysUsed >= milestone.value;
        break;
      case 'suggestions_accepted':
        achieved = evidence.accuracy.acceptedSuggestions >= milestone.value;
        break;
      case 'focus_hours':
        achieved = evidence.accumulated.focusMinutes / 60 >= milestone.value;
        break;
      case 'streak':
        achieved = evidence.accumulated.currentStreak >= milestone.value;
        break;
      case 'tasks_completed':
        achieved = evidence.accumulated.tasksCompleted >= milestone.value;
        break;
    }

    if (achieved) {
      milestone.achievedAt = new Date().toISOString();
      newlyAchieved.push(milestone);
    }
  });

  if (newlyAchieved.length > 0) {
    saveMilestones(milestones);
  }

  return newlyAchieved;
}

/**
 * 달성한 마일스톤 가져오기
 */
export function getAchievedMilestones(): Milestone[] {
  return loadMilestones().filter(m => m.achievedAt);
}

/**
 * 미축하 마일스톤 가져오기
 */
export function getUncelebratedMilestones(): Milestone[] {
  return loadMilestones().filter(m => m.achievedAt && !m.celebrated);
}

/**
 * 마일스톤 축하 표시
 */
export function celebrateMilestone(milestoneId: string): void {
  const milestones = loadMilestones();
  const milestone = milestones.find(m => m.id === milestoneId);
  if (milestone) {
    milestone.celebrated = true;
    saveMilestones(milestones);
  }
}

/**
 * 신뢰 레벨 계산
 */
export function calculateTrustLevel(evidence: TrustEvidence): TrustLevelInfo {
  const { daysUsed } = evidence.accumulated;
  const acceptanceRate = evidence.accuracy.suggestionAcceptance;

  // 역순으로 체크 (높은 레벨부터)
  for (let i = TRUST_LEVELS.length - 1; i >= 0; i--) {
    const level = TRUST_LEVELS[i];
    if (daysUsed >= level.minDays && acceptanceRate >= level.minAcceptance) {
      return level;
    }
  }

  return TRUST_LEVELS[0];
}

/**
 * 함께한 기간 포맷
 */
export function formatDaysTogether(days: number): string {
  if (days === 0) return '오늘 처음 만났어요';
  if (days === 1) return '어제 만났어요';
  if (days < 7) return `${days}일 함께했어요`;
  if (days < 30) return `${Math.floor(days / 7)}주 함께했어요`;
  if (days < 365) return `${Math.floor(days / 30)}개월 함께했어요`;
  return `${Math.floor(days / 365)}년 ${Math.floor((days % 365) / 30)}개월 함께했어요`;
}

/**
 * 주간 요약 생성
 */
export function generateWeeklySummary(): TrustSummary {
  const events = loadTrustEvents();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weekEvents = events.filter(e =>
    new Date(e.timestamp) >= weekAgo
  );

  const suggestionsReceived = weekEvents.filter(e =>
    e.type === 'suggestion_accepted' || e.type === 'suggestion_dismissed'
  ).length;

  const suggestionsAccepted = weekEvents.filter(e =>
    e.type === 'suggestion_accepted'
  ).length;

  const focusEvents = weekEvents.filter(e => e.type === 'focus_completed');
  const focusMinutes = focusEvents.reduce((sum, e) =>
    sum + ((e.metadata?.minutes as number) || 25), 0
  );

  const tasksCompleted = weekEvents.filter(e =>
    e.type === 'task_completed'
  ).length;

  const daysActive = new Set(
    weekEvents.map(e => new Date(e.timestamp).toDateString())
  ).size;

  const acceptanceRate = suggestionsReceived > 0
    ? suggestionsAccepted / suggestionsReceived
    : 0;

  // 하이라이트 생성
  const highlights: string[] = [];
  if (daysActive >= 5) highlights.push(`이번 주 ${daysActive}일 동안 함께했어요`);
  if (suggestionsAccepted >= 5) highlights.push(`${suggestionsAccepted}개의 제안을 믿어줬어요`);
  if (focusMinutes >= 120) highlights.push(`${Math.floor(focusMinutes / 60)}시간 집중했어요`);
  if (tasksCompleted >= 10) highlights.push(`${tasksCompleted}개의 일을 완료했어요`);

  // 새 마일스톤
  const allMilestones = loadMilestones();
  const newMilestones = allMilestones.filter(m =>
    m.achievedAt && new Date(m.achievedAt) >= weekAgo
  );

  // 메시지 생성
  let message = '';
  if (acceptanceRate >= 0.7) {
    message = '이번 주도 잘 맞아떨어졌네요! 계속 이렇게 함께해요.';
  } else if (acceptanceRate >= 0.5) {
    message = '조금씩 서로를 알아가고 있어요.';
  } else if (daysActive >= 3) {
    message = '꾸준히 함께해줘서 고마워요.';
  } else {
    message = '바빴던 한 주였나요? 언제든 여기 있을게요.';
  }

  return {
    period: 'weekly',
    startDate: weekAgo.toISOString(),
    endDate: now.toISOString(),
    stats: {
      daysActive,
      suggestionsReceived,
      suggestionsAccepted,
      acceptanceRate,
      focusMinutes,
      tasksCompleted,
      timeSavedMinutes: suggestionsAccepted * 5
    },
    highlights,
    newMilestones,
    message
  };
}

/**
 * 신뢰 이벤트 로드
 */
function loadTrustEvents(): TrustEvent[] {
  try {
    const stored = localStorage.getItem(EVENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load trust events:', e);
  }
  return [];
}

/**
 * 신뢰 점수 계산 (0-100)
 */
export function calculateTrustScore(evidence: TrustEvidence): number {
  let score = 0;

  // 사용 일수 (최대 30점)
  const dayScore = Math.min(30, evidence.accumulated.daysUsed * 0.3);
  score += dayScore;

  // 수락률 (최대 30점)
  const acceptanceScore = evidence.accuracy.suggestionAcceptance * 30;
  score += acceptanceScore;

  // 연속 사용 (최대 20점)
  const streakScore = Math.min(20, evidence.accumulated.currentStreak * 2);
  score += streakScore;

  // 집중 시간 (최대 10점)
  const focusScore = Math.min(10, evidence.accumulated.focusMinutes / 60);
  score += focusScore;

  // 태스크 완료 (최대 10점)
  const taskScore = Math.min(10, evidence.accumulated.tasksCompleted * 0.2);
  score += taskScore;

  return Math.round(Math.min(100, score));
}
