/**
 * Error Recovery 서비스
 * 에러 처리 및 복구 관리
 */

import {
  FriendlyError,
  ErrorCategory,
  ErrorSeverity,
  ErrorHistory,
  RecoveryOption,
  ERROR_MESSAGES,
  ERROR_COMFORT_MESSAGES,
  RECOVERY_SUCCESS_MESSAGES
} from './types';

const ERROR_HISTORY_KEY = 'alfredo_error_history';
let currentErrorHandlers: ((error: FriendlyError) => void)[] = [];

/**
 * 에러 핸들러 등록
 */
export function onError(handler: (error: FriendlyError) => void): () => void {
  currentErrorHandlers.push(handler);
  return () => {
    currentErrorHandlers = currentErrorHandlers.filter(h => h !== handler);
  };
}

/**
 * 사용자 친화적 에러 생성
 */
export function createFriendlyError(
  category: ErrorCategory,
  options: {
    severity?: ErrorSeverity;
    title?: string;
    message?: string;
    suggestion?: string;
    canRetry?: boolean;
    retryAction?: () => void;
    fallbackAction?: { label: string; action: () => void };
  } = {}
): FriendlyError {
  const defaults = ERROR_MESSAGES[category];

  const error: FriendlyError = {
    id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category,
    severity: options.severity || 'error',
    title: options.title || defaults.title,
    message: options.message || defaults.message,
    suggestion: options.suggestion || defaults.suggestion,
    canRetry: options.canRetry ?? true,
    retryAction: options.retryAction,
    fallbackAction: options.fallbackAction,
    timestamp: new Date().toISOString(),
    resolved: false
  };

  // 이력에 저장
  recordError(error);

  // 핸들러 호출
  currentErrorHandlers.forEach(handler => handler(error));

  return error;
}

/**
 * 에러 기록
 */
function recordError(error: FriendlyError): void {
  try {
    const history = loadErrorHistory();
    history.errors.push(error);
    history.lastError = error;

    // 최근 50개만 유지
    if (history.errors.length > 50) {
      history.errors.splice(0, history.errors.length - 50);
    }

    localStorage.setItem(ERROR_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to record error:', e);
  }
}

/**
 * 에러 이력 로드
 */
export function loadErrorHistory(): ErrorHistory {
  try {
    const stored = localStorage.getItem(ERROR_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load error history:', e);
  }
  return {
    errors: [],
    recoveryAttempts: 0,
    successfulRecoveries: 0
  };
}

/**
 * 에러 해결됨 표시
 */
export function markErrorResolved(errorId: string): void {
  try {
    const history = loadErrorHistory();
    const error = history.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      history.successfulRecoveries++;
      localStorage.setItem(ERROR_HISTORY_KEY, JSON.stringify(history));
    }
  } catch (e) {
    console.error('Failed to mark error resolved:', e);
  }
}

/**
 * 복구 시도 기록
 */
export function recordRecoveryAttempt(): void {
  try {
    const history = loadErrorHistory();
    history.recoveryAttempts++;
    localStorage.setItem(ERROR_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to record recovery attempt:', e);
  }
}

/**
 * 재시도 실행
 */
export async function executeRetry(
  error: FriendlyError,
  retryFn: () => Promise<void>
): Promise<boolean> {
  recordRecoveryAttempt();

  try {
    await retryFn();
    markErrorResolved(error.id);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 복구 옵션 생성
 */
export function createRecoveryOptions(
  error: FriendlyError
): RecoveryOption[] {
  const options: RecoveryOption[] = [];

  // 재시도 옵션
  if (error.canRetry && error.retryAction) {
    options.push({
      id: 'retry',
      label: '다시 시도',
      action: error.retryAction,
      isPrimary: true
    });
  }

  // 대체 옵션
  if (error.fallbackAction) {
    options.push({
      id: 'fallback',
      label: error.fallbackAction.label,
      action: error.fallbackAction.action,
      isPrimary: !error.canRetry
    });
  }

  // 새로고침 옵션 (심각한 에러)
  if (error.severity === 'critical' || error.severity === 'error') {
    options.push({
      id: 'refresh',
      label: '새로고침',
      description: '페이지를 새로고침합니다',
      action: () => window.location.reload(),
      isPrimary: options.length === 0
    });
  }

  // 무시 옵션 (경미한 에러)
  if (error.severity === 'info' || error.severity === 'warning') {
    options.push({
      id: 'dismiss',
      label: '닫기',
      action: () => markErrorResolved(error.id),
      isPrimary: false
    });
  }

  return options;
}

/**
 * 위로 메시지 가져오기
 */
export function getErrorComfortMessage(): string {
  return ERROR_COMFORT_MESSAGES[Math.floor(Math.random() * ERROR_COMFORT_MESSAGES.length)];
}

/**
 * 복구 성공 메시지
 */
export function getRecoverySuccessMessage(): string {
  return RECOVERY_SUCCESS_MESSAGES[Math.floor(Math.random() * RECOVERY_SUCCESS_MESSAGES.length)];
}

/**
 * 네트워크 에러 생성 헬퍼
 */
export function createNetworkError(retryAction?: () => void): FriendlyError {
  return createFriendlyError('network', {
    severity: 'warning',
    canRetry: true,
    retryAction
  });
}

/**
 * 동기화 에러 생성 헬퍼
 */
export function createSyncError(retryAction?: () => void): FriendlyError {
  return createFriendlyError('sync', {
    severity: 'warning',
    canRetry: true,
    retryAction
  });
}

/**
 * 데이터 에러 생성 헬퍼
 */
export function createDataError(): FriendlyError {
  return createFriendlyError('data', {
    severity: 'error',
    canRetry: false,
    fallbackAction: {
      label: '캐시 지우기',
      action: () => {
        localStorage.clear();
        window.location.reload();
      }
    }
  });
}

/**
 * 최근 에러 가져오기
 */
export function getRecentErrors(limit: number = 5): FriendlyError[] {
  const history = loadErrorHistory();
  return history.errors
    .filter(e => !e.resolved)
    .slice(-limit)
    .reverse();
}

/**
 * 에러 통계
 */
export function getErrorStats(): {
  totalErrors: number;
  unresolvedErrors: number;
  recoveryRate: number;
} {
  const history = loadErrorHistory();
  const unresolvedErrors = history.errors.filter(e => !e.resolved).length;

  return {
    totalErrors: history.errors.length,
    unresolvedErrors,
    recoveryRate: history.recoveryAttempts > 0
      ? (history.successfulRecoveries / history.recoveryAttempts) * 100
      : 100
  };
}
