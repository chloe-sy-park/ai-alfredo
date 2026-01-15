/**
 * 우선순위 자동 추천 서비스
 * 태스크 + 일정 + 컨텍스트를 분석하여 Top 3 추천
 */

import { Task } from '../tasks';
import { CalendarEvent } from '../calendar';
import { PriorityRecommendation, ProxyAction } from './types';

interface RecommendContext {
  tasks: Task[];
  events: CalendarEvent[];
  currentTime?: Date;
  userPreferences?: {
    preferMorningWork: boolean;
    preferQuickWins: boolean;
  };
}

interface ScoredTask {
  task: Task;
  score: number;
  factors: string[];
}

/**
 * Top 3 우선순위 추천
 */
export function recommendTopPriorities(context: RecommendContext): PriorityRecommendation[] {
  const { tasks, events, currentTime = new Date() } = context;

  // 미완료 태스크만
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  if (pendingTasks.length === 0) return [];

  // 오늘 빈 시간 계산
  const availableMinutes = calculateAvailableMinutes(events, currentTime);

  // 각 태스크 점수 계산
  const scoredTasks: ScoredTask[] = pendingTasks.map(task => {
    const { score, factors } = calculateTaskScore(task, currentTime, availableMinutes, context.userPreferences);
    return { task, score, factors };
  });

  // 점수순 정렬
  scoredTasks.sort((a, b) => b.score - a.score);

  // Top 3 선정
  const top3 = scoredTasks.slice(0, 3);

  // 추천 생성
  return top3.map((st, index) => ({
    taskId: st.task.id,
    rank: index + 1,
    confidence: Math.min(0.95, st.score / 100),
    reasoning: generateReasoning(st.task, st.factors, index + 1),
    factors: st.factors
  }));
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
      taskIds: recommendations.map(r => r.taskId)
    },
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

/**
 * 태스크 점수 계산
 */
function calculateTaskScore(
  task: Task,
  currentTime: Date,
  availableMinutes: number,
  preferences?: RecommendContext['userPreferences']
): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // 1. 우선순위 (30점)
  switch (task.priority) {
    case 'high':
      score += 30;
      factors.push('high_priority');
      break;
    case 'medium':
      score += 15;
      factors.push('medium_priority');
      break;
    case 'low':
      score += 5;
      break;
  }

  // 2. 마감일 (40점)
  if (task.dueDate) {
    const dday = getDDay(task.dueDate);

    if (dday < 0) {
      // 이미 지남
      score += 40;
      factors.push(`overdue: D+${Math.abs(dday)}`);
    } else if (dday === 0) {
      // 오늘 마감
      score += 35;
      factors.push('deadline: today');
    } else if (dday === 1) {
      // 내일 마감
      score += 25;
      factors.push('deadline: tomorrow');
    } else if (dday <= 3) {
      // 3일 이내
      score += 15;
      factors.push(`deadline: D-${dday}`);
    } else if (dday <= 7) {
      // 1주일 이내
      score += 8;
      factors.push(`deadline: D-${dday}`);
    }
  }

  // 3. 예상 시간 vs 가용 시간 (15점)
  if (task.estimatedMinutes) {
    if (task.estimatedMinutes <= availableMinutes) {
      // 오늘 끝낼 수 있음
      if (task.estimatedMinutes <= 30) {
        score += 15;
        factors.push('quick_win: 30min');
        // 퀵윈 선호 시 추가 점수
        if (preferences?.preferQuickWins) {
          score += 5;
        }
      } else if (task.estimatedMinutes <= 60) {
        score += 10;
        factors.push(`estimated: ${task.estimatedMinutes}min`);
      } else {
        score += 5;
        factors.push(`estimated: ${task.estimatedMinutes}min`);
      }
    } else {
      // 오늘 다 못 끝냄
      factors.push('needs_more_time');
    }
  }

  // 4. 시간대 보너스 (10점)
  const hour = currentTime.getHours();
  if (preferences?.preferMorningWork && hour < 12) {
    // 오전에 큰 일 선호
    if (task.estimatedMinutes && task.estimatedMinutes >= 60) {
      score += 10;
      factors.push('morning_deep_work');
    }
  } else if (hour >= 16) {
    // 오후 늦게는 짧은 일 선호
    if (task.estimatedMinutes && task.estimatedMinutes <= 30) {
      score += 10;
      factors.push('afternoon_quick_task');
    }
  }

  // 5. 진행 중인 태스크 보너스 (5점)
  if (task.status === 'in_progress') {
    score += 5;
    factors.push('in_progress');
  }

  return { score, factors };
}

/**
 * 추천 이유 생성
 */
function generateReasoning(_task: Task, factors: string[], rank: number): string {
  const reasons: string[] = [];

  if (factors.includes('overdue')) {
    reasons.push('이미 마감이 지났어요');
  } else if (factors.includes('deadline: today')) {
    reasons.push('오늘 마감이에요');
  } else if (factors.includes('deadline: tomorrow')) {
    reasons.push('내일 마감이에요');
  }

  if (factors.includes('high_priority')) {
    reasons.push('중요도가 높아요');
  }

  if (factors.includes('quick_win: 30min')) {
    reasons.push('30분이면 끝나요');
  }

  if (factors.includes('in_progress')) {
    reasons.push('이미 시작한 일이에요');
  }

  if (factors.includes('morning_deep_work')) {
    reasons.push('오전에 하기 좋은 일이에요');
  }

  if (reasons.length === 0) {
    if (rank === 1) reasons.push('지금 하기에 가장 적절해요');
    else if (rank === 2) reasons.push('그 다음으로 중요해요');
    else reasons.push('시간 나면 해두면 좋아요');
  }

  return reasons.join('. ') + '.';
}

/**
 * 가용 시간 계산 (분)
 */
function calculateAvailableMinutes(events: CalendarEvent[], currentTime: Date): number {
  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

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
 * D-day 계산
 */
function getDDay(dueDate: string): number {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
