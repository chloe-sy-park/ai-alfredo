/**
 * Event Service
 *
 * Part F: Internal Beta Integration
 * 이벤트 로깅 서비스
 *
 * Local-first 원칙:
 * - IndexedDB에 먼저 저장
 * - 온라인 시 서버로 백업
 * - 오프라인에서도 이벤트 수집
 */

import { db } from '../../lib/db';
import { api } from '../../lib/api';

// ============================================================
// Types
// ============================================================

export type EventType =
  // 앱 라이프사이클
  | 'app_open'
  | 'app_close'
  | 'app_background'
  | 'app_foreground'
  // 네비게이션
  | 'page_view'
  | 'modal_open'
  | 'modal_close'
  // 태스크
  | 'task_created'
  | 'task_completed'
  | 'task_updated'
  | 'task_deleted'
  | 'task_deferred'
  // 습관
  | 'habit_completed'
  | 'habit_skipped'
  // 컨디션
  | 'condition_recorded'
  | 'sleep_corrected'
  | 'checkin_submitted'
  // 이메일
  | 'email_signal_viewed'
  | 'email_deeplink_clicked'
  | 'email_classification_corrected'
  // 인사이트
  | 'insight_viewed'
  | 'insight_cta_clicked'
  | 'insight_dismissed'
  // 브리핑
  | 'briefing_viewed'
  | 'briefing_cta_clicked'
  // 동기화
  | 'sync_started'
  | 'sync_completed'
  | 'sync_failed'
  // 기타
  | 'feature_used'
  | 'error_occurred';

export interface AppEvent {
  id: string;
  type: EventType;
  data: Record<string, unknown>;
  sessionId: string;
  timestamp: string;
  synced: boolean;
}

interface EventPayload {
  type: EventType;
  data?: Record<string, unknown>;
}

// ============================================================
// Session Management
// ============================================================

let currentSessionId: string | null = null;

function getOrCreateSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return currentSessionId;
}

export function startNewSession(): string {
  currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return currentSessionId;
}

export function getCurrentSessionId(): string {
  return getOrCreateSessionId();
}

// ============================================================
// Event Logging
// ============================================================

/**
 * 이벤트 로깅 (Local-first)
 */
export async function logEvent(payload: EventPayload): Promise<void> {
  const event: AppEvent = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: payload.type,
    data: payload.data || {},
    sessionId: getOrCreateSessionId(),
    timestamp: new Date().toISOString(),
    synced: false
  };

  try {
    // IndexedDB에 저장 (cache 테이블 활용)
    await db.cache.put({
      key: `event_${event.id}`,
      value: JSON.stringify(event),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7일 보관
    });

    // 온라인이면 즉시 서버 전송 시도
    if (navigator.onLine) {
      syncEvent(event).catch(() => {
        // 실패해도 무시 (나중에 배치로 전송)
      });
    }
  } catch (error) {
    console.error('[EventService] Failed to log event:', error);
  }
}

/**
 * 단일 이벤트 서버 동기화
 */
async function syncEvent(event: AppEvent): Promise<void> {
  try {
    const response = await api.post('/app-events', {
      eventType: event.type,
      eventData: event.data,
      sessionId: event.sessionId,
      clientTimestamp: event.timestamp
    });

    if (response.success) {
      // 동기화 성공 시 로컬에서 synced 표시
      const cached = await db.cache.get(`event_${event.id}`);
      if (cached) {
        const updatedEvent = { ...event, synced: true };
        await db.cache.put({
          ...cached,
          value: JSON.stringify(updatedEvent)
        });
      }
    }
  } catch (error) {
    // 네트워크 오류는 무시 (배치 처리)
  }
}

/**
 * 미동기화 이벤트 배치 전송
 */
export async function syncPendingEvents(): Promise<number> {
  if (!navigator.onLine) return 0;

  try {
    const allCached = await db.cache
      .where('key')
      .startsWith('event_')
      .toArray();

    const unsyncedEvents: AppEvent[] = [];

    for (const cached of allCached) {
      try {
        const event = JSON.parse(String(cached.value)) as AppEvent;
        if (!event.synced) {
          unsyncedEvents.push(event);
        }
      } catch {
        // 파싱 실패 무시
      }
    }

    if (unsyncedEvents.length === 0) return 0;

    // 배치 전송 (최대 100개씩)
    const batches = chunkArray(unsyncedEvents, 100);
    let syncedCount = 0;

    for (const batch of batches) {
      try {
        const response = await api.post('/app-events/batch', {
          events: batch.map(e => ({
            eventType: e.type,
            eventData: e.data,
            sessionId: e.sessionId,
            clientTimestamp: e.timestamp
          }))
        });

        if (response.success) {
          // 성공한 이벤트 로컬에서 synced 표시
          for (const event of batch) {
            const cached = await db.cache.get(`event_${event.id}`);
            if (cached) {
              const updatedEvent = { ...event, synced: true };
              await db.cache.put({
                ...cached,
                value: JSON.stringify(updatedEvent)
              });
            }
          }
          syncedCount += batch.length;
        }
      } catch {
        // 배치 실패 시 다음 배치 계속
      }
    }

    return syncedCount;
  } catch (error) {
    console.error('[EventService] Failed to sync pending events:', error);
    return 0;
  }
}

/**
 * 오래된 이벤트 정리
 */
export async function cleanupOldEvents(daysOld: number = 7): Promise<number> {
  const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

  try {
    const oldEvents = await db.cache
      .where('key')
      .startsWith('event_')
      .filter(item => {
        try {
          const event = JSON.parse(String(item.value)) as AppEvent;
          return event.synced && new Date(event.timestamp).getTime() < cutoff;
        } catch {
          return false;
        }
      })
      .toArray();

    for (const event of oldEvents) {
      await db.cache.delete(event.key);
    }

    return oldEvents.length;
  } catch (error) {
    console.error('[EventService] Failed to cleanup old events:', error);
    return 0;
  }
}

// ============================================================
// Convenience Functions
// ============================================================

// 페이지 뷰
export const trackPageView = (pageName: string, params?: Record<string, unknown>) =>
  logEvent({ type: 'page_view', data: { pageName, ...params } });

// 태스크 이벤트
export const trackTaskCreated = (taskId: string, title: string) =>
  logEvent({ type: 'task_created', data: { taskId, title } });

export const trackTaskCompleted = (taskId: string, title: string) =>
  logEvent({ type: 'task_completed', data: { taskId, title } });

export const trackTaskDeferred = (taskId: string, title: string) =>
  logEvent({ type: 'task_deferred', data: { taskId, title } });

// 습관 이벤트
export const trackHabitCompleted = (habitId: string, title: string) =>
  logEvent({ type: 'habit_completed', data: { habitId, title } });

// 인사이트 이벤트
export const trackInsightViewed = (insightId: string, insightType: string) =>
  logEvent({ type: 'insight_viewed', data: { insightId, insightType } });

export const trackInsightCtaClicked = (insightId: string, ctaAction: string) =>
  logEvent({ type: 'insight_cta_clicked', data: { insightId, ctaAction } });

// 이메일 이벤트
export const trackEmailSignalViewed = (signalId: string, emailType: string) =>
  logEvent({ type: 'email_signal_viewed', data: { signalId, emailType } });

export const trackEmailDeeplinkClicked = (signalId: string) =>
  logEvent({ type: 'email_deeplink_clicked', data: { signalId } });

// 기능 사용 이벤트
export const trackFeatureUsed = (featureName: string, details?: Record<string, unknown>) =>
  logEvent({ type: 'feature_used', data: { featureName, ...details } });

// ============================================================
// Helpers
// ============================================================

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================================
// Auto-sync on Online
// ============================================================

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingEvents().catch(() => {});
  });

  // 페이지 로드 시 pending 이벤트 동기화
  if (navigator.onLine) {
    setTimeout(() => {
      syncPendingEvents().catch(() => {});
    }, 5000); // 5초 후 시작 (앱 초기화 완료 대기)
  }
}

// ============================================================
// Exports
// ============================================================

export default {
  logEvent,
  syncPendingEvents,
  cleanupOldEvents,
  startNewSession,
  getCurrentSessionId,
  trackPageView,
  trackTaskCreated,
  trackTaskCompleted,
  trackTaskDeferred,
  trackHabitCompleted,
  trackInsightViewed,
  trackInsightCtaClicked,
  trackEmailSignalViewed,
  trackEmailDeeplinkClicked,
  trackFeatureUsed
};
