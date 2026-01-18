/**
 * taskReward.ts
 * 태스크 완료 시 보상 지급 헬퍼
 * ADHD 친화적: 0.5초 이내 즉각 반응, 작은 성취 인정
 */

import { Task, toggleTaskComplete, getTodayCompletedCount } from './tasks';
import { usePenguinStore } from '../stores/penguinStore';
import { showXPReward, showCoinsReward, showLevelUpReward, showStreakReward } from '../components/reward/RewardFeedback';
import { showNotificationPriming } from '../components/notification/PermissionPriming';

/**
 * 우선순위에 따른 XP 보상 계산
 */
export function calculateXPReward(task: Task): number {
  const baseXP = task.priority === 'high' ? 20 : task.priority === 'medium' ? 15 : 10;

  // 예상 시간 보너스 (30분 이상 딥워크)
  const timeBonus = task.estimatedMinutes && task.estimatedMinutes >= 30 ? 5 : 0;

  return baseXP + timeBonus;
}

/**
 * 우선순위에 따른 코인 보상 계산
 */
export function calculateCoinReward(task: Task): number {
  return task.priority === 'high' ? 10 : task.priority === 'medium' ? 5 : 3;
}

/**
 * 태스크 완료 + 보상 지급 (통합 함수)
 * @param taskId 태스크 ID
 * @param wasCompleted 이전 완료 상태 (되돌리기 시 true)
 * @returns 업데이트된 태스크 또는 null
 */
export function completeTaskWithReward(taskId: string, wasCompleted: boolean = false): Task | null {
  const result = toggleTaskComplete(taskId);

  if (!result) return null;

  // 태스크 완료 시에만 보상 지급 (되돌리기는 제외)
  if (!wasCompleted && result.status === 'done') {
    grantTaskCompletionReward(result);
  }

  return result;
}

/**
 * 태스크 완료 보상 지급
 * @param task 완료된 태스크
 */
export function grantTaskCompletionReward(task: Task): void {
  const { addExperience, addCoins, status } = usePenguinStore.getState();

  const xpReward = calculateXPReward(task);
  const coinReward = calculateCoinReward(task);

  // 이전 레벨 저장 (레벨업 체크용)
  const prevLevel = status?.level ?? 1;

  // 펭귄 스토어에 경험치/코인 추가
  addExperience(xpReward);
  addCoins(coinReward);

  // 즉각적인 시각 피드백 (0.5초 이내)
  showXPReward(xpReward);
  setTimeout(() => showCoinsReward(coinReward), 150); // 약간 지연하여 순차 표시

  // 레벨업 체크
  const newStatus = usePenguinStore.getState().status;
  if (newStatus && newStatus.level > prevLevel) {
    setTimeout(() => showLevelUpReward(newStatus.level), 400);
  }

  // 긍정적 상호작용 타이밍: 태스크 3개 완료 후 알림 프라이밍 트리거
  const todayCompleted = getTodayCompletedCount();
  if (todayCompleted === 3 || todayCompleted === 5) {
    setTimeout(() => showNotificationPriming(), 2000); // 2초 후 부드럽게 표시
  }
}

/**
 * 연속 달성 보상 (스트릭)
 * @param days 연속 일수
 */
export function grantStreakReward(days: number): void {
  showStreakReward(days);

  // 스트릭 보너스 XP/코인
  const bonusXP = days * 5;
  const bonusCoins = days * 2;

  const { addExperience, addCoins } = usePenguinStore.getState();
  addExperience(bonusXP);
  addCoins(bonusCoins);
}

export default completeTaskWithReward;
