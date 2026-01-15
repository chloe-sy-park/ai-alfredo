/**
 * Proxy Moments 서비스
 * 알프레도가 사용자를 대신해서 판단/행동하는 기능들
 */

export * from './types';
export * from './overloadDetector';
export * from './priorityRecommender';

import { CalendarEvent } from '../calendar';
import { Task } from '../tasks';
import { detectOverload, suggestTimeProtections } from './overloadDetector';
import { recommendTopPriorities, createPriorityProxyAction } from './priorityRecommender';
import { ProxyAction, ProxySummary } from './types';

interface ProxyContext {
  tasks: Task[];
  events: CalendarEvent[];
  currentTime?: Date;
}

/**
 * 오늘의 Proxy Actions 생성
 * - 과부하 감지
 * - 시간 보호 제안
 * - Top 3 우선순위 추천
 */
export function generateDailyProxyActions(context: ProxyContext): ProxyAction[] {
  const { tasks, events, currentTime = new Date() } = context;
  const actions: ProxyAction[] = [];

  // 1. 과부하 감지
  const overload = detectOverload({ tasks, events, currentTime });
  actions.push(...overload.suggestions);

  // 2. 시간 보호 제안
  const timeProtections = suggestTimeProtections(events);
  timeProtections.slice(0, 2).forEach((tp, index) => {
    // 과부하 제안과 중복되지 않도록 체크
    const isDuplicate = actions.some(a =>
      a.type === 'protect_time' &&
      a.relatedData?.timeSlot?.start === tp.suggestedSlot.start
    );

    if (!isDuplicate) {
      actions.push({
        id: `proxy_${Date.now()}_time_${index}`,
        type: 'protect_time',
        title: getTimeProtectionTitle(tp.type),
        description: tp.reason,
        reasoning: '당신의 시간을 지켜드릴게요',
        urgency: 'low',
        notifyStyle: 'subtle',
        userControls: {
          canUndo: true,
          canModify: true,
          canDismiss: true
        },
        relatedData: {
          timeSlot: tp.suggestedSlot
        },
        status: 'pending',
        createdAt: currentTime.toISOString()
      });
    }
  });

  // 3. Top 3 우선순위 추천 (과부하가 심하지 않을 때만)
  if (overload.level !== 'critical') {
    const pendingTasks = tasks.filter(t => t.status !== 'done');
    if (pendingTasks.length >= 3) {
      const recommendations = recommendTopPriorities({ tasks, events, currentTime });
      const priorityAction = createPriorityProxyAction(recommendations, tasks);
      if (priorityAction) {
        actions.push(priorityAction);
      }
    }
  }

  return actions;
}

/**
 * Proxy Summary 생성 (일일 요약)
 */
export function generateProxySummary(
  actions: ProxyAction[],
  date: string = new Date().toDateString()
): ProxySummary {
  const todayActions = actions.filter(a =>
    new Date(a.createdAt).toDateString() === date
  );

  const acceptedCount = todayActions.filter(a => a.status === 'accepted').length;
  const dismissedCount = todayActions.filter(a => a.status === 'dismissed').length;

  // 절약한 시간 추정 (분)
  let timeSavedMinutes = 0;
  todayActions.forEach(a => {
    if (a.status === 'accepted') {
      switch (a.type) {
        case 'prioritize':
          timeSavedMinutes += 15; // 우선순위 고민 시간
          break;
        case 'protect_time':
          timeSavedMinutes += 10; // 시간 관리 고민
          break;
        case 'overload_warn':
          timeSavedMinutes += 20; // 번아웃 예방
          break;
        default:
          timeSavedMinutes += 5;
      }
    }
  });

  // 하이라이트 생성
  const highlights: string[] = [];
  if (acceptedCount > 0) {
    highlights.push(`${acceptedCount}개의 제안을 수락했어요`);
  }
  if (timeSavedMinutes > 0) {
    highlights.push(`약 ${timeSavedMinutes}분의 고민 시간을 줄였어요`);
  }

  const protectedTime = todayActions.filter(
    a => a.type === 'protect_time' && a.status === 'accepted'
  );
  if (protectedTime.length > 0) {
    highlights.push('시간을 보호해드렸어요');
  }

  return {
    date,
    actionsCount: todayActions.length,
    acceptedCount,
    dismissedCount,
    timeSavedMinutes,
    highlights,
    actions: todayActions
  };
}

// 헬퍼 함수
function getTimeProtectionTitle(type: string): string {
  switch (type) {
    case 'lunch':
      return '점심 시간 확보해뒀어요';
    case 'break':
      return '잠깐 쉬는 시간 만들어뒀어요';
    case 'focus':
      return '집중할 수 있는 시간이에요';
    case 'buffer':
      return '미팅 사이 숨 돌릴 시간이에요';
    default:
      return '시간을 확보해뒀어요';
  }
}

/**
 * 알프레도 메시지 생성 (Proxy Action 기반)
 */
export function generateProxyMessage(actions: ProxyAction[]): string | null {
  if (actions.length === 0) return null;

  const pendingActions = actions.filter(a => a.status === 'pending');
  if (pendingActions.length === 0) return null;

  // 가장 긴급한 액션 선택
  const urgentAction = pendingActions.find(a => a.urgency === 'high')
    || pendingActions.find(a => a.urgency === 'medium')
    || pendingActions[0];

  if (!urgentAction) return null;

  // 톤에 따른 메시지 생성
  const messages: string[] = [];

  switch (urgentAction.type) {
    case 'overload_warn':
      messages.push('오늘 좀 바빠 보여요.');
      messages.push(urgentAction.reasoning);
      break;
    case 'protect_time':
      messages.push(urgentAction.title);
      break;
    case 'prioritize':
      messages.push('오늘의 우선순위를 정리해봤어요.');
      break;
    default:
      messages.push(urgentAction.title);
  }

  return messages.join(' ');
}
