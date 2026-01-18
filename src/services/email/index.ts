/**
 * Email Signal Service
 *
 * Part E: Email Signal MVP
 *
 * 이메일은 "읽고 관리할 대상"이 아니라 Today 결정을 돕는 "신호"로 취급
 */

// Types
export * from './types';

// Filter Service
export {
  filterByTimeWindow,
  filterByThreadState,
  checkSignalConditions,
  filterBySignalConditions,
  applyThreeTierFilter,
  filterForToday,
  findRelatedEmails,
  extractCalendarParticipants,
  calculateSenderFrequency
} from './emailFilterService';

// Type Classifier
export {
  hasICalAttachment,
  hasVideoCallLink,
  isMeetingInvite,
  matchesCalendarParticipant,
  matchesMeetingTitle,
  isLifeSignal,
  isFinanceRelated,
  classifyEmail,
  classifyEmails,
  generateHeadline,
  applySilentCorrection,
  calculateWorkLifeScore
} from './emailTypeClassifier';

// Store
export { useEmailSignalStore } from './emailSignalStore';
