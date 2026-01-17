/**
 * 동기화 서비스 모듈
 */

export {
  subscribeSyncState,
  getSyncState,
  isOnline,
  addToSyncQueue,
  performSync,
  forceSync,
  resolveConflictLWW,
  type SyncStatus,
  type ConflictResolution,
} from './syncService';
