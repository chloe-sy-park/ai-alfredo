// Gmail 관련 상수 및 유틸리티

// localStorage 키
export const STORAGE_KEYS = {
  EMAILS: 'lifebutler_gmail_emails',
  ACTIONS: 'lifebutler_gmail_actions',
  LAST_FETCH: 'lifebutler_gmail_last_fetch',
  SETTINGS: 'lifebutler_gmail_settings',
  VIP_SENDERS: 'lifebutler_gmail_vip_senders',
};

// 기본 이메일 설정
export const DEFAULT_SETTINGS = {
  fetchPeriod: 3,           // 1, 3, 7일
  maxEmails: 20,            // 10, 20, 50
  autoSyncMinutes: 30,      // 15, 30, 60, 0(수동)
  enabled: true,            // Gmail 연동 활성화
  priorityFilter: 'all',    // 'smart' | 'important' | 'all'
};

// 액션 타입 정의
export const ACTION_TYPES = {
  REPLY: 'reply',
  SCHEDULE: 'schedule',
  TASK: 'task',
  FYI: 'fyi',
  ARCHIVE: 'archive',
};

// 우선순위 정의
export const PRIORITIES = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// 시간 차이 텍스트 생성
export function getTimeDiffText(date) {
  if (!date) return '동기화 안됨';
  
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000 / 60);
  
  if (diff < 1) return '방금 전';
  if (diff < 60) return `${diff}분 전`;
  if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
  return `${Math.floor(diff / 1440)}일 전`;
}
