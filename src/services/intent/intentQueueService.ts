/**
 * Intent Queue Service
 *
 * Part F: Internal Beta Integration
 * Local-first Intent Queue 시스템
 *
 * 원칙:
 * - IndexedDB에 먼저 저장
 * - 서버는 "확인 + 백업" 역할
 * - 오프라인에서도 완전한 사용 경험
 */

import { db, Intent, IntentType, IntentPriority } from '../../lib/db';
import {
  IntentQueueState,
  SyncResult,
  INTENT_TYPE_PRIORITY,
  DEFAULT_MAX_RETRIES,
  INTENT_PRIORITY_WEIGHTS
} from './types';

// ============================================================
// Intent Creation
// ============================================================

/**
 * Intent 생성 및 큐에 추가
 */
export async function queueIntent<T extends Record<string, unknown>>(
  type: IntentType,
  payload: T,
  priority?: IntentPriority
): Promise<string> {
  const id = generateIntentId();
  const now = new Date().toISOString();

  const intent: Intent = {
    id,
    type,
    payload,
    status: 'pending',
    priority: priority || INTENT_TYPE_PRIORITY[type] || 'normal',
    retryCount: 0,
    maxRetries: DEFAULT_MAX_RETRIES,
    createdAt: now
  };

  await db.intents.add(intent);

  // 온라인 상태면 즉시 동기화 시도
  if (navigator.onLine) {
    scheduleProcessing();
  }

  return id;
}

/**
 * Intent ID 생성
 */
function generateIntentId(): string {
  return `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================
// Intent Processing
// ============================================================

let processingScheduled = false;
let isProcessing = false;

/**
 * 처리 스케줄링 (debounced)
 */
function scheduleProcessing(): void {
  if (processingScheduled || isProcessing) return;

  processingScheduled = true;
  setTimeout(async () => {
    processingScheduled = false;
    await processIntents();
  }, 1000);  // 1초 디바운스
}

/**
 * Pending Intent 처리
 */
export async function processIntents(): Promise<void> {
  if (isProcessing || !navigator.onLine) return;

  isProcessing = true;

  try {
    // Priority 기준으로 정렬하여 가져오기
    const pendingIntents = await db.intents
      .where('status')
      .equals('pending')
      .toArray();

    // Priority 정렬
    const sorted = pendingIntents.sort((a, b) => {
      const weightA = INTENT_PRIORITY_WEIGHTS[a.priority];
      const weightB = INTENT_PRIORITY_WEIGHTS[b.priority];
      if (weightA !== weightB) return weightB - weightA;
      // 같은 priority면 생성 시간 순
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    for (const intent of sorted) {
      await processIntent(intent);
    }
  } catch (error) {
    console.error('Failed to process intents:', error);
  } finally {
    isProcessing = false;
  }
}

/**
 * 단일 Intent 처리
 */
async function processIntent(intent: Intent): Promise<void> {
  try {
    const result = await executeIntent(intent);

    if (result.success) {
      await db.intents.update(intent.id, {
        status: 'synced',
        syncedAt: new Date().toISOString()
      });
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (intent.retryCount < intent.maxRetries) {
      // 재시도 카운트 증가
      await db.intents.update(intent.id, {
        retryCount: intent.retryCount + 1,
        errorMessage
      });
    } else {
      // 최대 재시도 초과 - failed 상태로 변경
      await db.intents.update(intent.id, {
        status: 'failed',
        errorMessage
      });
    }
  }
}

/**
 * Intent 실행 (서버 전송)
 */
async function executeIntent(intent: Intent): Promise<SyncResult> {
  try {
    const { api } = await import('../../lib/api');

    // Supabase Edge Function 호출
    await api.post('/functions/v1/intents', {
      clientIntentId: intent.id,
      type: intent.type,
      payload: intent.payload,
      priority: intent.priority,
      createdAt: intent.createdAt
    });

    return {
      success: true,
      intentId: intent.id
    };
  } catch (error) {
    return {
      success: false,
      intentId: intent.id,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

// ============================================================
// Queue Status
// ============================================================

/**
 * Intent Queue 상태 조회
 */
export async function getIntentStatus(): Promise<IntentQueueState> {
  const allIntents = await db.intents.toArray();

  const pending = allIntents.filter(i => i.status === 'pending').length;
  const synced = allIntents.filter(i => i.status === 'synced').length;
  const failed = allIntents.filter(i => i.status === 'failed').length;

  const lastSynced = allIntents
    .filter(i => i.syncedAt)
    .sort((a, b) => new Date(b.syncedAt!).getTime() - new Date(a.syncedAt!).getTime())[0];

  return {
    pending,
    synced,
    failed,
    lastProcessedAt: lastSynced?.syncedAt || null
  };
}

/**
 * Pending Intent 개수
 */
export async function getPendingCount(): Promise<number> {
  return await db.intents.where('status').equals('pending').count();
}

/**
 * Failed Intent 개수
 */
export async function getFailedCount(): Promise<number> {
  return await db.intents.where('status').equals('failed').count();
}

// ============================================================
// Retry & Cleanup
// ============================================================

/**
 * Failed Intent 재시도
 */
export async function retryFailedIntents(): Promise<void> {
  const failedIntents = await db.intents
    .where('status')
    .equals('failed')
    .toArray();

  for (const intent of failedIntents) {
    // 재시도를 위해 pending으로 변경
    await db.intents.update(intent.id, {
      status: 'pending',
      retryCount: 0,
      errorMessage: undefined
    });
  }

  // 처리 시작
  scheduleProcessing();
}

/**
 * 오래된 synced Intent 정리
 */
export async function cleanupSyncedIntents(daysOld: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  const cutoffTimestamp = cutoffDate.toISOString();

  const oldIntents = await db.intents
    .where('status')
    .equals('synced')
    .filter(intent => !!(intent.syncedAt && intent.syncedAt < cutoffTimestamp))
    .toArray();

  for (const intent of oldIntents) {
    await db.intents.delete(intent.id);
  }

  return oldIntents.length;
}

// ============================================================
// Event Listeners
// ============================================================

/**
 * 온라인 복귀 시 자동 동기화
 */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[IntentQueue] Online - processing pending intents');
    processIntents();
  });

  window.addEventListener('offline', () => {
    console.log('[IntentQueue] Offline - intents will be queued locally');
  });
}

// ============================================================
// Convenience Functions
// ============================================================

/**
 * Task 생성 Intent
 */
export async function queueTaskCreate(task: {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  category?: 'work' | 'life';
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
  projectId?: string;
}): Promise<string> {
  return queueIntent('task_create', {
    ...task,
    status: task.status || 'todo',
    category: task.category || 'work'
  });
}

/**
 * Task 완료 Intent
 */
export async function queueTaskComplete(taskId: string): Promise<string> {
  return queueIntent('task_complete', {
    taskId,
    completedAt: new Date().toISOString()
  }, 'high');
}

/**
 * Task 업데이트 Intent
 */
export async function queueTaskUpdate(
  taskId: string,
  updates: Record<string, unknown>
): Promise<string> {
  return queueIntent('task_update', { taskId, updates });
}

/**
 * Task 삭제 Intent
 */
export async function queueTaskDelete(taskId: string): Promise<string> {
  return queueIntent('task_delete', { taskId });
}

/**
 * Check-in Intent
 */
export async function queueCheckin(
  date: string,
  tag: 'play' | 'travel' | 'social' | 'rest' | 'other',
  note?: string
): Promise<string> {
  return queueIntent('checkin', { date, tag, note });
}

/**
 * Sleep 정정 Intent
 */
export async function queueSleepCorrect(
  date: string,
  bedtimeTs: string,
  waketimeTs: string
): Promise<string> {
  return queueIntent('sleep_correct', { date, bedtimeTs, waketimeTs }, 'high');
}

/**
 * Habit 완료 Intent
 */
export async function queueHabitComplete(habitId: string, date: string): Promise<string> {
  return queueIntent('habit_complete', { habitId, date }, 'high');
}

// ============================================================
// Exports
// ============================================================

export default {
  queueIntent,
  processIntents,
  getIntentStatus,
  getPendingCount,
  getFailedCount,
  retryFailedIntents,
  cleanupSyncedIntents,
  queueTaskCreate,
  queueTaskComplete,
  queueTaskUpdate,
  queueTaskDelete,
  queueCheckin,
  queueSleepCorrect,
  queueHabitComplete
};
