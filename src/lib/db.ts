import Dexie, { Table } from 'dexie';
import type { Task } from '../types/database';

// ============================================================
// Intent Types (Part F: Beta Integration)
// ============================================================

export type IntentType =
  | 'task_create' | 'task_update' | 'task_complete' | 'task_delete'
  | 'checkin' | 'sleep_correct'
  | 'email_classify' | 'sender_weight_update'
  | 'habit_complete' | 'briefing_view';

export type IntentPriority = 'critical' | 'high' | 'normal' | 'low';
export type IntentStatus = 'pending' | 'synced' | 'failed';

export interface Intent {
  id: string;
  type: IntentType;
  payload: Record<string, unknown>;
  status: IntentStatus;
  priority: IntentPriority;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  syncedAt?: string;
  errorMessage?: string;
}

// ============================================================
// Email Signal Types (Part E: Email Signal MVP)
// ============================================================

export type EmailType = 'A' | 'B' | 'C' | 'D' | 'E';

export interface EmailSignal {
  id: string;
  emailId: string;
  threadId?: string;
  sender: string;
  senderDomain: string;
  subject: string;
  receivedAt: string;
  isUnread: boolean;
  hasAttachment: boolean;
  attachmentTypes?: string[];
  labels: string[];
  threadCount: number;
  emailType: EmailType;
  workScore: number;
  lifeScore: number;
  relatedMeetingId?: string;
  deepLink?: string;
  createdAt: string;
}

export interface SenderWeight {
  id: string;
  sender: string;
  domain: string;
  workScore: number;
  lifeScore: number;
  correctionCount: number;
  lastCorrectionAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Schema Info (for migrations)
// ============================================================

export interface SchemaInfo {
  key: string;
  version: number;
  migratedAt: string;
}

// ============================================================
// Legacy Types (deprecated, will be removed)
// ============================================================

// 오프라인 큐 아이템 (deprecated - use Intent instead)
export interface OfflineQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  recordId?: string;
  data?: unknown;
  createdAt: string;
}

// 캐시 아이템
export interface CacheItem {
  key: string;
  value: unknown;
  expiresAt: number;
}

// 캐린더 이벤트
export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  attendeeCount: number;
  category: 'meeting' | 'focus' | 'personal' | 'travel' | 'meal' | 'other';
  importance: 'high' | 'medium' | 'low';
  energyDrain: 'high' | 'medium' | 'low';
  syncedAt: string;
}

// 브리핑 히스토리
export interface BriefingHistory {
  id: string;
  type: 'morning' | 'evening' | 'nudge' | 'weekly';
  content: string;
  createdAt: string;
}

// 습관
export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  targetDays?: number[];
  streak: number;
  bestStreak: number;
  completedDates: string[];
  createdAt: string;
}

class AlfredoDB extends Dexie {
  // Original tables
  tasks!: Table<Task>;
  offlineQueue!: Table<OfflineQueueItem>;  // deprecated
  cache!: Table<CacheItem>;
  calendar!: Table<CalendarEvent>;
  briefings!: Table<BriefingHistory>;
  habits!: Table<Habit>;

  // New tables (v2)
  intents!: Table<Intent>;
  emailSignals!: Table<EmailSignal>;
  senderWeights!: Table<SenderWeight>;
  schemaInfo!: Table<SchemaInfo>;

  constructor() {
    super('AlfredoDB');

    // Version 1: Original schema
    this.version(1).stores({
      tasks: 'id, status, category, isStarred, isTopThree, dueDate, createdAt',
      offlineQueue: 'id, action, table, createdAt',
      cache: 'key, expiresAt',
      calendar: 'id, startTime, category',
      briefings: 'id, type, createdAt',
      habits: 'id, frequency, createdAt'
    });

    // Version 2: Beta Integration (Intent Queue + Email Signal)
    this.version(2).stores({
      tasks: 'id, status, category, isStarred, isTopThree, dueDate, createdAt',
      offlineQueue: 'id, action, table, createdAt',  // keep for migration
      cache: 'key, expiresAt',
      calendar: 'id, startTime, category',
      briefings: 'id, type, createdAt',
      habits: 'id, frequency, createdAt',
      // New tables
      intents: 'id, type, status, priority, createdAt, syncedAt',
      emailSignals: 'id, emailId, threadId, sender, emailType, receivedAt, createdAt',
      senderWeights: 'id, sender, domain, updatedAt',
      schemaInfo: 'key'
    }).upgrade(async (tx) => {
      // Migrate offlineQueue to intents
      const oldQueue = await tx.table('offlineQueue').toArray();
      const intentsTable = tx.table('intents');

      for (const item of oldQueue) {
        await intentsTable.add({
          id: `migrated_${item.id}`,
          type: mapActionToIntentType(item.action, item.table),
          payload: {
            originalAction: item.action,
            table: item.table,
            recordId: item.recordId,
            data: item.data
          },
          status: 'pending',
          priority: 'normal',
          retryCount: 0,
          maxRetries: 3,
          createdAt: item.createdAt
        });
      }

      // Record migration
      await tx.table('schemaInfo').put({
        key: 'schema_version',
        version: 2,
        migratedAt: new Date().toISOString()
      });
    });
  }
}

// Helper function to map old action to intent type
function mapActionToIntentType(action: string, table: string): IntentType {
  if (table === 'tasks') {
    switch (action) {
      case 'create': return 'task_create';
      case 'update': return 'task_update';
      case 'delete': return 'task_delete';
    }
  }
  // Default fallback
  return 'task_update';
}

export const db = new AlfredoDB();

// 오프라인 큐 동기화
export async function syncOfflineQueue(): Promise<void> {
  if (!navigator.onLine) return;

  const queue = await db.offlineQueue.toArray();
  
  for (const item of queue) {
    try {
      const { api } = await import('./api');
      
      switch (item.action) {
        case 'create':
          await api.post(`/api/${item.table}`, item.data);
          break;
        case 'update':
          await api.patch(`/api/${item.table}/${item.recordId}`, item.data);
          break;
        case 'delete':
          await api.delete(`/api/${item.table}/${item.recordId}`);
          break;
      }
      
      await db.offlineQueue.delete(item.id);
    } catch (error) {
      console.error('Failed to sync offline item:', error);
    }
  }
}

// 온라인 복귀 시 자동 동기화
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineQueue);
}
