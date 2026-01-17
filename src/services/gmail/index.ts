/**
 * Gmail 서비스 모듈
 */

export {
  fetchEmails,
  fetchEmailSummary,
  fetchEmailDetail,
  getUnreadImportantCount,
  getEmailBriefing,
  getImportanceLabel,
  getCategoryLabel,
  getCategoryEmoji,
  getImportanceColor,
} from './gmailService';

export type {
  EmailImportance,
  EmailCategory,
  EmailSummary,
  EmailListResponse,
  EmailSummaryResponse,
} from './gmailService';
