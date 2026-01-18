/**
 * Intent Types
 *
 * Part F: Internal Beta Integration
 * Intent Queue 시스템 타입 정의
 */

// ============================================================
// Intent Core Types
// ============================================================

export type IntentType =
  | 'task_create'
  | 'task_update'
  | 'task_complete'
  | 'task_delete'
  | 'checkin'
  | 'sleep_correct'
  | 'email_classify'
  | 'sender_weight_update'
  | 'habit_complete'
  | 'briefing_view';

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
// Intent Payloads
// ============================================================

export interface TaskCreatePayload {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  category: 'work' | 'life';
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
  projectId?: string;
}

export interface TaskUpdatePayload {
  taskId: string;
  updates: Partial<TaskCreatePayload>;
}

export interface TaskCompletePayload {
  taskId: string;
  completedAt: string;
}

export interface TaskDeletePayload {
  taskId: string;
}

export interface CheckinPayload {
  date: string;
  tag: 'play' | 'travel' | 'social' | 'rest' | 'other';
  note?: string;
}

export interface SleepCorrectPayload {
  date: string;
  bedtimeTs: string;
  waketimeTs: string;
}

export interface EmailClassifyPayload {
  emailId: string;
  emailType: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface SenderWeightUpdatePayload {
  sender: string;
  domain: string;
  isWork: boolean;
}

export interface HabitCompletePayload {
  habitId: string;
  date: string;
}

export interface BriefingViewPayload {
  briefingId: string;
  viewedAt: string;
}

// ============================================================
// Intent Factory Types
// ============================================================

export type IntentPayloadMap = {
  task_create: TaskCreatePayload;
  task_update: TaskUpdatePayload;
  task_complete: TaskCompletePayload;
  task_delete: TaskDeletePayload;
  checkin: CheckinPayload;
  sleep_correct: SleepCorrectPayload;
  email_classify: EmailClassifyPayload;
  sender_weight_update: SenderWeightUpdatePayload;
  habit_complete: HabitCompletePayload;
  briefing_view: BriefingViewPayload;
};

// ============================================================
// Intent Queue State
// ============================================================

export interface IntentQueueState {
  pending: number;
  synced: number;
  failed: number;
  lastProcessedAt: string | null;
}

// ============================================================
// Sync Types
// ============================================================

export interface SyncCheckpoint {
  tableName: string;
  lastSyncAt: string;
  lastIntentId: string | null;
  version: number;
}

export interface SyncResult {
  success: boolean;
  intentId: string;
  error?: string;
}

// ============================================================
// Priority Weights
// ============================================================

export const INTENT_PRIORITY_WEIGHTS: Record<IntentPriority, number> = {
  critical: 100,
  high: 75,
  normal: 50,
  low: 25
};

export const DEFAULT_MAX_RETRIES = 3;

// ============================================================
// Intent Type to Priority Mapping
// ============================================================

export const INTENT_TYPE_PRIORITY: Record<IntentType, IntentPriority> = {
  task_complete: 'high',
  task_create: 'normal',
  task_update: 'normal',
  task_delete: 'normal',
  checkin: 'normal',
  sleep_correct: 'high',
  email_classify: 'low',
  sender_weight_update: 'low',
  habit_complete: 'high',
  briefing_view: 'low'
};
