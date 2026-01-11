import Dexie, { Table } from 'dexie';
import type { Task } from '../types/database';

// 오프라인 큐 아이템
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
  tasks!: Table<Task>;
  offlineQueue!: Table<OfflineQueueItem>;
  cache!: Table<CacheItem>;
  calendar!: Table<CalendarEvent>;
  briefings!: Table<BriefingHistory>;
  habits!: Table<Habit>;

  constructor() {
    super('AlfredoDB');
    
    this.version(1).stores({
      tasks: 'id, status, category, isStarred, isTopThree, dueDate, createdAt',
      offlineQueue: 'id, action, table, createdAt',
      cache: 'key, expiresAt',
      calendar: 'id, startTime, category',
      briefings: 'id, type, createdAt',
      habits: 'id, frequency, createdAt'
    });
  }
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
