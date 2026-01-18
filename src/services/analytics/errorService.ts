/**
 * Error Service
 *
 * Part F: Internal Beta Integration
 * 에러 로깅 서비스
 *
 * 원칙:
 * - 심각한 에러만 서버로 전송 (rate limiting)
 * - 민감 정보 제거
 * - Local 캐싱 후 배치 전송
 */

import { db } from '../../lib/db';
import { api } from '../../lib/api';

// ============================================================
// Types
// ============================================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorType =
  // 네트워크 에러
  | 'network_error'
  | 'api_error'
  | 'timeout_error'
  // 인증 에러
  | 'auth_error'
  | 'token_expired'
  // 데이터 에러
  | 'validation_error'
  | 'parse_error'
  | 'storage_error'
  // 런타임 에러
  | 'runtime_error'
  | 'unhandled_rejection'
  | 'uncaught_exception'
  // 동기화 에러
  | 'sync_error'
  | 'intent_failed'
  // 기타
  | 'unknown_error';

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  timestamp: string;
  synced: boolean;
}

interface ErrorPayload {
  type: ErrorType;
  severity?: ErrorSeverity;
  message: string;
  error?: Error;
  context?: Record<string, unknown>;
}

// ============================================================
// Rate Limiting
// ============================================================

const ERROR_RATE_LIMIT = {
  maxPerMinute: 10,
  maxPerHour: 100
};

let errorCountLastMinute = 0;
let errorCountLastHour = 0;
let lastMinuteReset = Date.now();
let lastHourReset = Date.now();

function checkRateLimit(): boolean {
  const now = Date.now();

  // 분 리셋
  if (now - lastMinuteReset > 60000) {
    errorCountLastMinute = 0;
    lastMinuteReset = now;
  }

  // 시간 리셋
  if (now - lastHourReset > 3600000) {
    errorCountLastHour = 0;
    lastHourReset = now;
  }

  // 제한 체크
  if (errorCountLastMinute >= ERROR_RATE_LIMIT.maxPerMinute) {
    return false;
  }
  if (errorCountLastHour >= ERROR_RATE_LIMIT.maxPerHour) {
    return false;
  }

  errorCountLastMinute++;
  errorCountLastHour++;
  return true;
}

// ============================================================
// Error Logging
// ============================================================

/**
 * 에러 로깅
 */
export async function logError(payload: ErrorPayload): Promise<void> {
  // Rate limit 체크
  if (!checkRateLimit()) {
    console.warn('[ErrorService] Rate limit exceeded, skipping error log');
    return;
  }

  const appError: AppError = {
    id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: payload.type,
    severity: payload.severity || determineSeverity(payload.type),
    message: sanitizeMessage(payload.message),
    stack: payload.error?.stack ? sanitizeStack(payload.error.stack) : undefined,
    context: sanitizeContext(payload.context || {}),
    timestamp: new Date().toISOString(),
    synced: false
  };

  try {
    // IndexedDB에 저장
    await db.cache.put({
      key: `error_${appError.id}`,
      value: JSON.stringify(appError),
      expiresAt: Date.now() + (3 * 24 * 60 * 60 * 1000) // 3일 보관
    });

    // Critical/High 에러는 즉시 전송 시도
    if (navigator.onLine && (appError.severity === 'critical' || appError.severity === 'high')) {
      syncError(appError).catch(() => {});
    }
  } catch (error) {
    console.error('[ErrorService] Failed to log error:', error);
  }
}

/**
 * 단일 에러 서버 동기화
 */
async function syncError(appError: AppError): Promise<void> {
  try {
    const response = await api.post('/app-errors', {
      errorType: appError.type,
      severity: appError.severity,
      errorMessage: appError.message,
      stackTrace: appError.stack,
      context: appError.context,
      clientTimestamp: appError.timestamp
    });

    if (response.success) {
      const cached = await db.cache.get(`error_${appError.id}`);
      if (cached) {
        const updatedError = { ...appError, synced: true };
        await db.cache.put({
          ...cached,
          value: JSON.stringify(updatedError)
        });
      }
    }
  } catch {
    // 네트워크 오류 무시
  }
}

/**
 * 미동기화 에러 배치 전송
 */
export async function syncPendingErrors(): Promise<number> {
  if (!navigator.onLine) return 0;

  try {
    const allCached = await db.cache
      .where('key')
      .startsWith('error_')
      .toArray();

    const unsyncedErrors: AppError[] = [];

    for (const cached of allCached) {
      try {
        const error = JSON.parse(String(cached.value)) as AppError;
        if (!error.synced) {
          unsyncedErrors.push(error);
        }
      } catch {
        // 파싱 실패 무시
      }
    }

    if (unsyncedErrors.length === 0) return 0;

    // 배치 전송 (최대 50개씩)
    const batches = chunkArray(unsyncedErrors, 50);
    let syncedCount = 0;

    for (const batch of batches) {
      try {
        const response = await api.post('/app-errors/batch', {
          errors: batch.map(e => ({
            errorType: e.type,
            severity: e.severity,
            errorMessage: e.message,
            stackTrace: e.stack,
            context: e.context,
            clientTimestamp: e.timestamp
          }))
        });

        if (response.success) {
          for (const error of batch) {
            const cached = await db.cache.get(`error_${error.id}`);
            if (cached) {
              const updatedError = { ...error, synced: true };
              await db.cache.put({
                ...cached,
                value: JSON.stringify(updatedError)
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
    console.error('[ErrorService] Failed to sync pending errors:', error);
    return 0;
  }
}

// ============================================================
// Global Error Handlers
// ============================================================

/**
 * 글로벌 에러 핸들러 등록
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Uncaught exceptions
  window.addEventListener('error', (event) => {
    logError({
      type: 'uncaught_exception',
      severity: 'high',
      message: event.message,
      error: event.error,
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason instanceof Error
      ? event.reason.message
      : String(event.reason);

    logError({
      type: 'unhandled_rejection',
      severity: 'high',
      message,
      error: event.reason instanceof Error ? event.reason : undefined,
      context: {
        reason: String(event.reason)
      }
    });
  });
}

// ============================================================
// Convenience Functions
// ============================================================

// API 에러
export const logApiError = (endpoint: string, status: number, message: string, details?: unknown) =>
  logError({
    type: 'api_error',
    message: `API Error: ${endpoint} returned ${status}`,
    context: { endpoint, status, message, details }
  });

// 네트워크 에러
export const logNetworkError = (url: string, error: Error) =>
  logError({
    type: 'network_error',
    message: `Network Error: ${url}`,
    error,
    context: { url }
  });

// 인증 에러
export const logAuthError = (action: string, message: string) =>
  logError({
    type: 'auth_error',
    severity: 'medium',
    message: `Auth Error: ${action} - ${message}`,
    context: { action }
  });

// 동기화 에러
export const logSyncError = (operation: string, error: Error) =>
  logError({
    type: 'sync_error',
    message: `Sync Error: ${operation}`,
    error,
    context: { operation }
  });

// Intent 실패
export const logIntentFailed = (intentId: string, intentType: string, error: Error) =>
  logError({
    type: 'intent_failed',
    message: `Intent Failed: ${intentType}`,
    error,
    context: { intentId, intentType }
  });

// 스토리지 에러
export const logStorageError = (operation: string, error: Error) =>
  logError({
    type: 'storage_error',
    message: `Storage Error: ${operation}`,
    error,
    context: { operation }
  });

// ============================================================
// Helpers
// ============================================================

function determineSeverity(type: ErrorType): ErrorSeverity {
  switch (type) {
    case 'uncaught_exception':
    case 'auth_error':
      return 'high';
    case 'api_error':
    case 'sync_error':
    case 'intent_failed':
      return 'medium';
    case 'network_error':
    case 'timeout_error':
      return 'low';
    default:
      return 'medium';
  }
}

function sanitizeMessage(message: string): string {
  // 민감 정보 제거 (이메일, 토큰 등)
  return message
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    .replace(/Bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [TOKEN]')
    .replace(/token[=:]\s*[a-zA-Z0-9._-]+/gi, 'token=[TOKEN]')
    .slice(0, 1000); // 최대 1000자
}

function sanitizeStack(stack: string): string {
  // 경로에서 사용자 이름 제거
  return stack
    .replace(/\/Users\/[^/]+\//g, '/Users/[USER]/')
    .replace(/\/home\/[^/]+\//g, '/home/[USER]/')
    .replace(/C:\\Users\\[^\\]+\\/g, 'C:\\Users\\[USER]\\')
    .slice(0, 5000); // 최대 5000자
}

function sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    // 민감한 키 제외
    if (['password', 'token', 'secret', 'key', 'credential'].some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeMessage(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

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
    syncPendingErrors().catch(() => {});
  });

  // 글로벌 에러 핸들러 자동 등록
  setupGlobalErrorHandlers();
}

// ============================================================
// Exports
// ============================================================

export default {
  logError,
  syncPendingErrors,
  setupGlobalErrorHandlers,
  logApiError,
  logNetworkError,
  logAuthError,
  logSyncError,
  logIntentFailed,
  logStorageError
};
