/**
 * 동기화 서비스
 * 오프라인/온라인 데이터 동기화 관리
 */

import { db, syncOfflineQueue, type OfflineQueueItem } from '../../lib/db';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: Date | null;
  pendingCount: number;
  error: string | null;
}

// 동기화 상태
let syncState: SyncState = {
  status: 'idle',
  lastSyncedAt: null,
  pendingCount: 0,
  error: null,
};

// 상태 변경 리스너
type SyncStateListener = (state: SyncState) => void;
const listeners: Set<SyncStateListener> = new Set();

/**
 * 상태 업데이트
 */
function updateState(updates: Partial<SyncState>): void {
  syncState = { ...syncState, ...updates };
  listeners.forEach((listener) => listener(syncState));
}

/**
 * 상태 리스너 등록
 */
export function subscribeSyncState(listener: SyncStateListener): () => void {
  listeners.add(listener);
  listener(syncState);
  return () => listeners.delete(listener);
}

/**
 * 현재 동기화 상태 조회
 */
export function getSyncState(): SyncState {
  return { ...syncState };
}

/**
 * 온라인 상태 확인
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * 동기화 큐에 작업 추가
 */
export async function addToSyncQueue(
  action: OfflineQueueItem['action'],
  table: string,
  data?: unknown,
  recordId?: string
): Promise<void> {
  const item: OfflineQueueItem = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    action,
    table,
    data,
    recordId,
    createdAt: new Date().toISOString(),
  };

  await db.offlineQueue.add(item);
  await updatePendingCount();

  // 온라인이면 바로 동기화 시도
  if (isOnline()) {
    scheduleSync();
  }
}

/**
 * 대기 중인 동기화 수 업데이트
 */
async function updatePendingCount(): Promise<void> {
  const count = await db.offlineQueue.count();
  updateState({ pendingCount: count });
}

/**
 * 동기화 스케줄
 */
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
const SYNC_DELAY = 2000; // 2초 디바운스

function scheduleSync(): void {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(() => {
    performSync();
  }, SYNC_DELAY);
}

/**
 * 동기화 수행
 */
export async function performSync(): Promise<void> {
  if (!isOnline()) {
    updateState({ status: 'offline' });
    return;
  }

  if (syncState.status === 'syncing') {
    return; // 이미 동기화 중
  }

  updateState({ status: 'syncing', error: null });

  try {
    await syncOfflineQueue();
    await updatePendingCount();

    updateState({
      status: 'idle',
      lastSyncedAt: new Date(),
    });
  } catch (error) {
    updateState({
      status: 'error',
      error: error instanceof Error ? error.message : '동기화 실패',
    });
  }
}

/**
 * 강제 동기화
 */
export async function forceSync(): Promise<boolean> {
  if (!isOnline()) {
    return false;
  }

  await performSync();
  return syncState.status === 'idle';
}

/**
 * 충돌 해결 전략
 */
export type ConflictResolution = 'local' | 'remote' | 'merge';

export interface ConflictItem<T> {
  localData: T;
  remoteData: T;
  field: string;
}

/**
 * Last-Write-Wins 충돌 해결
 */
export function resolveConflictLWW<T extends { updatedAt?: string }>(
  local: T,
  remote: T
): T {
  const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
  const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;

  return localTime > remoteTime ? local : remote;
}

/**
 * 온라인/오프라인 이벤트 리스너 설정
 */
export function initSyncListeners(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    updateState({ status: 'idle' });
    performSync();
  });

  window.addEventListener('offline', () => {
    updateState({ status: 'offline' });
  });

  // 초기 상태 설정
  updateState({
    status: isOnline() ? 'idle' : 'offline',
  });

  // 초기 대기 수 로드
  updatePendingCount();
}

// 자동 초기화
initSyncListeners();

export default {
  subscribeSyncState,
  getSyncState,
  isOnline,
  addToSyncQueue,
  performSync,
  forceSync,
  resolveConflictLWW,
};
