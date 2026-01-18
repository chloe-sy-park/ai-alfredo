/**
 * Analytics Services
 *
 * Part F: Internal Beta Integration
 * 이벤트 및 에러 로깅 통합 export
 */

// Event Service
export {
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
} from './eventService';

export type { EventType, AppEvent } from './eventService';

// Error Service
export {
  logError,
  syncPendingErrors,
  setupGlobalErrorHandlers,
  logApiError,
  logNetworkError,
  logAuthError,
  logSyncError,
  logIntentFailed,
  logStorageError
} from './errorService';

export type { ErrorType, ErrorSeverity, AppError } from './errorService';

// Default exports
import eventService from './eventService';
import errorService from './errorService';

export { eventService, errorService };

export default {
  event: eventService,
  error: errorService
};
