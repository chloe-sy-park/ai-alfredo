/**
 * 우선순위 자동 추천 서비스
 * 태스크 + 일정 + 컨텍스트를 분석하여 Top 3 추천
 *
 * 6가지 기준 (docs/05-priority-logic.md):
 * 1. ⏰ 마감 임박 (deadline) - 0~100점
 * 2. ⭐ 중요 표시 (starred) - 0 or 70점
 * 3. 👤 누군가 기다림 (waiting) - 0~80점
 * 4. ⏱️ 소요시간 (duration) - 0~50점
 * 5. 🔄 반복 미룸 (deferred) - 0~60점
 * 6. 📅 오늘 예정 (scheduled) - 0 or 50점
 */

import { Task } from '../tasks';
import { CalendarEvent } from '../calendar';
import { PriorityRecommendation, ProxyAction, ScoreBreakdown } from './types';

// === 가중치 레벨 ===
export const WEIGHT_LEVELS = {
  off: 0,
  low: 0.5,
  medium: 1.0,
  high: 1.5,
  very_high: 2.0
} as const;

export type WeightLevel = keyof typeof WEIGHT_LEVELS;

// === 뷰별 기본 가중치 프리셋 ===
export const VIEW_WEIGHT_PRESETS: Record<'work' | 'life' | 'all', WeightConfig> = {
  work: {
    deadline: 'very_high',
    starred: 'high',
    waiting: 'very_high',
    duration: 'medium',
    deferred: 'medium',
    scheduled: 'high'
  },
  life: {
    deadline: 'medium',
    starred: 'very_high',
    waiting: 'low',
    duration: 'off',
    deferred: 'high',
    scheduled: 'high'
  },
  all: {
    deadline: 'high',
    starred: 'high',
    waiting: 'high',
    duration: 'low',
    deferred: 'medium',
    scheduled: 'high'
  }
};

// === 타입 정의 ===
export interface WeightConfig {
  deadline: WeightLevel;
  starred: WeightLevel;
  waiting: WeightLevel;
  duration: WeightLevel;
  deferred: WeightLevel;
  scheduled: WeightLevel;
}

export interface UserPreferences {
  durationPreference: 'big_first' | 'small_first' | 'none';
  preferMorningWork?: boolean;
}

// ScoreBreakdown은 ./types.ts에서 import

export interface PriorityScore {
  total: number;
  breakdown: ScoreBreakdown;
  isOverdue?: boolean;
  energyAdjusted?: boolean;
}

export interface ScoredTask {
  task: Task;
  priority: PriorityScore;
  factors: string[];
}

export interface RecommendContext {
  tasks: Task[];
  events: CalendarEvent[];
  currentTime?: Date;
  viewMode?: 'work' | 'life' | 'all';
  userWeights?: Partial<WeightConfig>;
  userPreferences?: UserPreferences;
  currentEnergy?: 'low' | 'medium' | 'high';
  peakHours?: number[];
}

// === 기준별 점수 계산 함수 ===

/**
 * 1. 마감 임박 점수 (0-100)
 * 시간 기반으로 세밀하게 계산
 */
export function deadlineScore(task: Task): number {
  if (!task.dueDate) return 0;

  const due = new Date(task.dueDate);
  const now = new Date();
  const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursLeft < 0) return 100;      // 이미 지남 🔴
  if (hoursLeft < 3) return 95;       // 3시간 이내
  if (hoursLeft < 12) return 80;      // 12시간 이내
  if (hoursLeft < 24) return 60;      // 오늘 중
  if (hoursLeft < 48) return 40;      // 내일까지
  if (hoursLeft < 72) return 25;      // 3일 이내
  if (hoursLeft < 168) return 10;     // 일주일 이내
  return 0;                           // 일주일 이상
}

/**
 * 2. 중요 표시 점수 (0 or 70)
 */
export function starredScore(task: Task): number {
  return task.starred ? 70 : 0;
}

/**
 * 3. 누군가 기다림 점수 (0-80)
 */
export function waitingScore(task: Task): number {
  switch (task.waitingFor) {
    case 'external': return 80;  // 외부 (클라이언트 등)
    case 'boss': return 75;      // 상사
    case 'team': return 60;      // 팀원
    default: return 0;
  }
}

/**
 * 4. 소요시간 점수 (0-50)
 * 선호도에 따라 큰 것/작은 것 먼저
 */
export function durationScore(task: Task, preference: UserPreferences['durationPreference']): number {
  if (!task.estimatedMinutes || preference === 'none') return 0;

  const hours = task.estimatedMinutes / 60;

  if (preference === 'big_first') {
    // Eat the frog - 큰 것 먼저
    if (hours >= 2) return 50;
    if (hours >= 1) return 30;
    return 10;
  }

  if (preference === 'small_first') {
    // Quick wins - 작은 것 먼저
    if (hours <= 0.25) return 50;  // 15분 이하
    if (hours <= 0.5) return 30;   // 30분 이하
    return 10;
  }

  return 0;
}

/**
 * 5. 반복 미룸 점수 (0-60)
 */
export function deferredScore(task: Task): number {
  const count = task.deferCount || 0;

  if (count >= 5) return 60;   // 5번 이상 미룸 🚨
  if (count >= 3) return 45;   // 3-4번
  if (count >= 2) return 30;   // 2번
  if (count >= 1) return 15;   // 1번
  return 0;
}

/**
 * 6. 오늘 예정 점수 (0 or 50)
 */
export function scheduledTodayScore(task: Task): number {
  if (!task.scheduledDate) return 0;
  return isToday(task.scheduledDate) ? 50 : 0;
}

/**
 * 오늘 날짜인지 확인
 */
function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

// === 최종 점수 계산 ===

/**
 * 태스크 우선순위 점수 계산
 */
export function calculatePriorityScore(
  task: Task,
  weights: WeightConfig,
  preferences: UserPreferences
): PriorityScore {
  const breakdown: ScoreBreakdown = {
    deadline: deadlineScore(task) * WEIGHT_LEVELS[weights.deadline],
    starred: starredScore(task) * WEIGHT_LEVELS[weights.starred],
    waiting: waitingScore(task) * WEIGHT_LEVELS[weights.waiting],
    duration: durationScore(task, preferences.durationPreference) * WEIGHT_LEVELS[weights.duration],
    deferred: deferredScore(task) * WEIGHT_LEVELS[weights.deferred],
    scheduled: scheduledTodayScore(task) * WEIGHT_LEVELS[weights.scheduled]
  };

  const total = Object.values(breakdown).reduce((sum, s) => sum + s, 0);

  // 마감 지난 것 체크
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  return {
    total,
    breakdown,
    isOverdue
  };
}

/**
 * 마감 지난 태스크 긴급 오버라이드
 */
function applyUrgencyOverride(scoredTasks: ScoredTask[]): ScoredTask[] {
  return scoredTasks.map(st => {
    if (st.priority.isOverdue) {
      return {
        ...st,
        priority: {
          ...st.priority,
          total: 9999,  // 무조건 최상위
        },
        factors: [...st.factors, 'overdue_urgent']
      };
    }
    return st;
  });
}

/**
 * 에너지 기반 조정
 */
function adjustForEnergy(
  scoredTasks: ScoredTask[],
  currentEnergy: 'low' | 'medium' | 'high' | undefined,
  peakHours: number[] | undefined
): ScoredTask[] {
  if (!currentEnergy && !peakHours?.length) return scoredTasks;

  const currentHour = new Date().getHours();

  return scoredTasks.map(st => {
    let multiplier = 1;

    // 에너지 낮을 때: 작은 태스크 부스트
    if (currentEnergy === 'low' && st.task.estimatedMinutes && st.task.estimatedMinutes <= 15) {
      multiplier = 1.3;
    }

    // 피크 시간대: 딥워크 태스크 부스트
    if (peakHours?.includes(currentHour)) {
      if (st.task.estimatedMinutes && st.task.estimatedMinutes >= 60) {
        multiplier = 1.2;
      }
    }

    if (multiplier === 1) return st;

    return {
      ...st,
      priority: {
        ...st.priority,
        total: st.priority.total * multiplier,
        energyAdjusted: true
      },
      factors: [...st.factors, 'energy_adjusted']
    };
  });
}

/**
 * 추천 요인(factor) 생성
 */
function generateFactors(task: Task, _breakdown: ScoreBreakdown): string[] {
  const factors: string[] = [];

  // 마감 관련
  if (task.dueDate) {
    const hoursLeft = (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft < 0) {
      factors.push(`overdue: D+${Math.ceil(Math.abs(hoursLeft / 24))}`);
    } else if (hoursLeft < 24) {
      factors.push('deadline: today');
    } else if (hoursLeft < 48) {
      factors.push('deadline: tomorrow');
    } else if (hoursLeft < 72) {
      factors.push('deadline: D-3');
    } else if (hoursLeft < 168) {
      factors.push(`deadline: D-${Math.ceil(hoursLeft / 24)}`);
    }
  }

  // 중요 표시
  if (task.starred) {
    factors.push('starred');
  }

  // 누군가 기다림
  if (task.waitingFor) {
    factors.push(`waiting: ${task.waitingFor}`);
  }

  // 소요시간
  if (task.estimatedMinutes) {
    if (task.estimatedMinutes <= 15) {
      factors.push('quick_win: 15min');
    } else if (task.estimatedMinutes <= 30) {
      factors.push('quick_win: 30min');
    } else if (task.estimatedMinutes >= 120) {
      factors.push('deep_work: 2h+');
    }
  }

  // 반복 미룸
  if (task.deferCount && task.deferCount > 0) {
    factors.push(`deferred: ${task.deferCount}x`);
  }

  // 오늘 예정
  if (task.scheduledDate && isToday(task.scheduledDate)) {
    factors.push('scheduled_today');
  }

  // 진행 중
  if (task.status === 'in_progress') {
    factors.push('in_progress');
  }

  return factors;
}

// === 메인 추천 함수 ===

/**
 * Top 3 우선순위 추천
 */
export function recommendTopPriorities(context: RecommendContext): PriorityRecommendation[] {
  const {
    tasks,
    viewMode = 'all',
    userWeights,
    userPreferences = { durationPreference: 'none' },
    currentEnergy,
    peakHours
  } = context;

  // 미완료 태스크만 필터링
  let pendingTasks = tasks.filter(t => t.status !== 'done');

  // 뷰 모드에 따라 필터링
  if (viewMode === 'work') {
    pendingTasks = pendingTasks.filter(t => t.category === 'work');
  } else if (viewMode === 'life') {
    pendingTasks = pendingTasks.filter(t => t.category === 'life');
  }

  if (pendingTasks.length === 0) return [];

  // 가중치 설정 (사용자 커스텀 > 뷰별 프리셋)
  const weights: WeightConfig = {
    ...VIEW_WEIGHT_PRESETS[viewMode],
    ...userWeights
  };

  // 각 태스크 점수 계산
  let scoredTasks: ScoredTask[] = pendingTasks.map(task => {
    const priority = calculatePriorityScore(task, weights, userPreferences);
    const factors = generateFactors(task, priority.breakdown);
    return { task, priority, factors };
  });

  // 마감 지난 태스크 긴급 오버라이드
  scoredTasks = applyUrgencyOverride(scoredTasks);

  // 에너지 기반 조정
  scoredTasks = adjustForEnergy(scoredTasks, currentEnergy, peakHours);

  // 점수순 정렬
  scoredTasks.sort((a, b) => b.priority.total - a.priority.total);

  // Top 3 선정
  const top3 = scoredTasks.slice(0, 3);

  // 추천 생성
  return top3.map((st, index) => ({
    taskId: st.task.id,
    rank: index + 1,
    confidence: Math.min(0.99, st.priority.total / 400),  // 400점 기준 정규화
    reasoning: generateReasoning(st.task, st.factors, st.priority, index + 1),
    factors: st.factors,
    scoreBreakdown: st.priority.breakdown
  }));
}

/**
 * 추천 이유 생성
 */
function generateReasoning(
  _task: Task,
  factors: string[],
  priority: PriorityScore,
  rank: number
): string {
  const reasons: string[] = [];

  // 마감 관련
  if (priority.isOverdue) {
    reasons.push('마감이 지났어요');
  } else if (factors.some(f => f === 'deadline: today')) {
    reasons.push('오늘 마감이에요');
  } else if (factors.some(f => f === 'deadline: tomorrow')) {
    reasons.push('내일 마감이에요');
  }

  // 중요 표시
  if (factors.includes('starred')) {
    reasons.push('중요 표시된 일이에요');
  }

  // 누군가 기다림
  if (factors.some(f => f.startsWith('waiting:'))) {
    const waitingFactor = factors.find(f => f.startsWith('waiting:'));
    const who = waitingFactor?.split(': ')[1];
    if (who === 'external') {
      reasons.push('외부에서 기다리고 있어요');
    } else if (who === 'boss') {
      reasons.push('상사가 기다리고 있어요');
    } else if (who === 'team') {
      reasons.push('팀원이 기다리고 있어요');
    }
  }

  // 퀵윈
  if (factors.some(f => f.startsWith('quick_win:'))) {
    const quickFactor = factors.find(f => f.startsWith('quick_win:'));
    const time = quickFactor?.split(': ')[1];
    reasons.push(`${time}이면 끝나요`);
  }

  // 반복 미룸
  if (factors.some(f => f.startsWith('deferred:'))) {
    const deferFactor = factors.find(f => f.startsWith('deferred:'));
    const count = deferFactor?.split(': ')[1];
    reasons.push(`${count} 미뤘어요`);
  }

  // 오늘 예정
  if (factors.includes('scheduled_today')) {
    reasons.push('오늘 하기로 한 일이에요');
  }

  // 진행 중
  if (factors.includes('in_progress')) {
    reasons.push('이미 시작한 일이에요');
  }

  // 에너지 조정됨
  if (factors.includes('energy_adjusted')) {
    reasons.push('지금 컨디션에 맞아요');
  }

  // 기본 이유
  if (reasons.length === 0) {
    if (rank === 1) reasons.push('지금 하기에 가장 적절해요');
    else if (rank === 2) reasons.push('그 다음으로 중요해요');
    else reasons.push('시간 나면 해두면 좋아요');
  }

  return reasons.join('. ') + '.';
}

/**
 * Top 3 추천 Proxy Action 생성
 */
export function createPriorityProxyAction(
  recommendations: PriorityRecommendation[],
  tasks: Task[]
): ProxyAction | null {
  if (recommendations.length === 0) return null;

  const topTaskTitles = recommendations.map(r => {
    const task = tasks.find(t => t.id === r.taskId);
    return task?.title || '';
  }).filter(Boolean);

  return {
    id: `proxy_${Date.now()}_top3`,
    type: 'prioritize',
    title: '오늘의 Top 3 정리해뒀어요',
    description: topTaskTitles.map((t, i) => `${i + 1}. ${t}`).join('\n'),
    reasoning: recommendations[0]?.reasoning || '가장 급한 것부터 정리했어요',
    urgency: 'medium',
    notifyStyle: 'gentle',
    userControls: {
      canUndo: false,
      canModify: true,
      canDismiss: true
    },
    relatedData: {
      taskIds: recommendations.map(r => r.taskId),
      scoreBreakdowns: recommendations.map(r => r.scoreBreakdown).filter((s): s is ScoreBreakdown => s !== undefined)
    },
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

/**
 * 가용 시간 계산 (분)
 */
export function calculateAvailableMinutes(events: CalendarEvent[], currentTime: Date): number {
  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);

  // 오늘 남은 시간 (18시까지)
  const workEnd = new Date(today);
  workEnd.setHours(18, 0, 0, 0);

  if (currentTime >= workEnd) return 0;

  const remainingMinutes = (workEnd.getTime() - currentTime.getTime()) / (1000 * 60);

  // 남은 미팅 시간 계산
  const todayEvents = events.filter(e => {
    const eventStart = new Date(e.start);
    return eventStart >= currentTime && eventStart < workEnd;
  });

  const busyMinutes = todayEvents.reduce((sum, e) => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    return sum + duration;
  }, 0);

  return Math.max(0, remainingMinutes - busyMinutes);
}

/**
 * 패턴 기반 추천 조정
 */
export function adjustForUserPatterns(
  recommendations: PriorityRecommendation[],
  userHistory: { taskId: string; accepted: boolean }[]
): PriorityRecommendation[] {
  if (userHistory.length < 5) return recommendations;

  // 자주 수락한 태스크 유형에 보너스
  const acceptedTaskIds = new Set(
    userHistory.filter(h => h.accepted).map(h => h.taskId)
  );

  return recommendations.map(r => {
    if (acceptedTaskIds.has(r.taskId)) {
      return {
        ...r,
        confidence: Math.min(0.99, r.confidence * 1.1),
        factors: [...r.factors, 'user_preferred']
      };
    }
    return r;
  });
}

/**
 * 알프레도 Top 3 코멘트 생성
 */
export function generateTop3Comment(
  top3: ScoredTask[],
  context: { tone: string; energy?: 'low' | 'medium' | 'high' }
): string | null {
  const { tone, energy } = context;

  const toneMessages = {
    friendly: {
      overdue: "마감 지난 게 있어요. 괜찮아요, 지금이라도 해봐요. 💪",
      waiting: "기다리는 사람들이 있네요. 하나씩 해결해봐요. 🙌",
      lowEnergy: "지금 좀 힘들 수 있어요. 2번이나 3번 먼저 해도 괜찮아요. 😊"
    },
    butler: {
      overdue: "마감 지난 게 있네요. 먼저 처리해볼까요?",
      waiting: "응답 대기 중인 게 많아요. 우선 처리 추천해요.",
      lowEnergy: "에너지 낮아 보여요. 작은 것부터 시작해볼까요?"
    },
    secretary: {
      overdue: "마감 초과 1건. 즉시 처리 권장.",
      waiting: "대기 중 응답 2건 이상. 우선 처리.",
      lowEnergy: "컨디션 고려, 소규모 태스크부터."
    },
    coach: {
      overdue: "마감 지났어요! 지금 바로 시작해요! 🔥",
      waiting: "기다리는 사람들 있어요! 빠르게 쳐내요! 💨",
      lowEnergy: "컨디션 보고 순서 조정해도 돼요! 👍"
    },
    trainer: {
      overdue: "마감 지남. 변명 없이 바로 처리.",
      waiting: "대기자 있음. 지금 당장.",
      lowEnergy: "힘들어도 움직여야 함. 작은 것부터."
    }
  };

  const messages = toneMessages[tone as keyof typeof toneMessages] || toneMessages.butler;

  // 첫 번째가 마감 지난 것
  if (top3[0]?.priority.isOverdue) {
    return messages.overdue;
  }

  // 외부 대기가 많음
  const waitingCount = top3.filter(st => st.task.waitingFor).length;
  if (waitingCount >= 2) {
    return messages.waiting;
  }

  // 에너지 낮은데 큰 태스크가 1순위
  if (energy === 'low' && top3[0]?.task.estimatedMinutes && top3[0].task.estimatedMinutes >= 60) {
    return messages.lowEnergy;
  }

  return null;
}
