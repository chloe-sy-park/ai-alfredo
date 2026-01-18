/**
 * Email Signal Types
 *
 * Part E: Email Signal MVP
 * 이메일은 "읽고 관리할 대상"이 아니라 Today 결정을 돕는 "신호"로 취급
 *
 * 금지사항:
 * - 본문 요약/저장
 * - 자동 Task 생성
 * - 답장 초안 생성
 * - Inbox UI
 */

// ============================================================
// Email Type Classification (A-E)
// ============================================================

/**
 * Email Type Classification
 * A: 미팅 초대 (iCal, zoom/meet/teams 링크)
 * B: Work-Context (캘린더 미팅과 연결)
 * C: Work-Standalone (독립적 업무 이메일)
 * D: Life Signal (병원, 배송, 결제 알림)
 * E: Life-Finance (금융/결제)
 */
export type EmailType = 'A' | 'B' | 'C' | 'D' | 'E';

export const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
  A: '미팅 초대',
  B: '업무 관련',
  C: '업무',
  D: '생활',
  E: '금융/결제'
};

// ============================================================
// Email Metadata (본문 금지)
// ============================================================

/**
 * 이메일 메타데이터
 * 본문(body)은 절대 저장하지 않음
 */
export interface EmailMetadata {
  id: string;
  threadId: string;
  from: string;
  fromName?: string;
  fromDomain: string;
  to?: string[];
  subject: string;
  receivedAt: string;  // ISO timestamp
  isUnread: boolean;
  hasAttachment: boolean;
  attachmentTypes?: AttachmentType[];
  labels: string[];
  threadCount: number;
  messageIdHeader?: string;

  // 분류 결과
  emailType: EmailType;
  workLifeScore: WorkLifeScore;

  // 캘린더 연결
  relatedMeetingId?: string;

  // 딥링크
  deepLink?: string;
}

export type AttachmentType = 'ical' | 'pdf' | 'doc' | 'image' | 'other';

export interface WorkLifeScore {
  work: number;  // 0-1
  life: number;  // 0-1
}

// ============================================================
// Email Signal (Today에 표시)
// ============================================================

/**
 * Today에 표시될 이메일 신호
 */
export interface EmailSignal {
  id: string;
  emailId: string;
  type: EmailType;
  headline: string;         // 1줄 요약 (룰 기반, LLM 금지)
  sender: string;
  senderName?: string;
  subject: string;
  receivedAt: string;
  relatedMeetingId?: string;
  relatedMeetingTitle?: string;
  deepLink: string;
  createdAt: string;
}

// ============================================================
// Sender Weight (Silent Correction)
// ============================================================

/**
 * 발신자별 Work/Life 가중치
 * Silent Correction으로 학습
 */
export interface SenderWeight {
  id: string;
  sender: string;
  domain: string;
  workScore: number;      // 0-1
  lifeScore: number;      // 0-1
  correctionCount: number;
  lastCorrectionAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Filter Types
// ============================================================

/**
 * 3-tier 필터 설정
 */
export interface EmailFilterConfig {
  // Filter 1: 시간 필터
  timeWindowHours: number;  // default: 72

  // Filter 2: 스레드 상태 필터
  includeUnread: boolean;
  includeRecentReplies: boolean;
  includeThreaded: boolean;

  // Filter 3: 신호 조건 (2개 이상 충족 시 통과)
  minSignalConditions: number;  // default: 2
}

export const DEFAULT_FILTER_CONFIG: EmailFilterConfig = {
  timeWindowHours: 72,
  includeUnread: true,
  includeRecentReplies: true,
  includeThreaded: true,
  minSignalConditions: 2
};

/**
 * 신호 조건 결과
 */
export interface SignalConditionResult {
  keywordMatch: boolean;
  calendarParticipant: boolean;
  threadCountHigh: boolean;
  senderFrequent: boolean;
  totalMatched: number;
}

// ============================================================
// Classification Keywords
// ============================================================

/**
 * Type A 감지용 키워드/패턴
 */
export const MEETING_INVITE_PATTERNS = {
  // iCal attachment
  icalAttachment: /\.ics$/i,

  // Video call links
  videoCallLinks: [
    /zoom\.(us|com)/i,
    /meet\.google\.com/i,
    /teams\.microsoft\.com/i,
    /webex\.com/i,
    /whereby\.com/i
  ],

  // Calendar invite subjects
  inviteSubjects: [
    /초대/i,
    /invite/i,
    /meeting request/i,
    /calendar invitation/i,
    /회의 초대/i
  ]
};

/**
 * Type D (Life Signal) 키워드
 */
export const LIFE_SIGNAL_KEYWORDS = [
  // 배송
  '배송', '택배', '출고', '도착 예정', 'delivery', 'shipping',
  // 의료
  '병원', '진료', '예약 확인', '검진', '약국',
  // 예약
  '예약 확정', '예약 안내', 'reservation confirmed',
  // 알림
  '알림', '안내', 'notification'
];

/**
 * Type E (Finance) 키워드
 */
export const FINANCE_KEYWORDS = [
  // 결제
  '결제', '입금', '출금', '이체', '카드',
  // 금융
  '은행', '증권', '보험', '세금', '납부',
  // 영문
  'payment', 'transaction', 'invoice', 'receipt', 'billing'
];

/**
 * Work 관련 키워드
 */
export const WORK_KEYWORDS = [
  // 회의
  '회의', '미팅', '컨퍼런스', 'meeting', 'sync', 'standup',
  // 업무
  '보고서', '리뷰', '피드백', '마감', 'deadline', 'review',
  // 프로젝트
  '프로젝트', '태스크', 'task', 'project', 'sprint'
];

/**
 * Signal 키워드 (긴급/중요)
 */
export const SIGNAL_KEYWORDS = [
  '긴급', '중요', '확인 필요', '답변 요청',
  'urgent', 'important', 'action required', 'asap',
  'FYI', 'FW:', 'RE:'
];

// ============================================================
// API Response Types
// ============================================================

export interface FetchEmailsOptions {
  maxResults?: number;
  query?: string;
  after?: string;  // ISO timestamp
}

export interface EmailListResponse {
  emails: EmailMetadata[];
  nextPageToken?: string;
  totalCount: number;
}

// ============================================================
// Store Types
// ============================================================

export interface EmailSignalState {
  signals: EmailSignal[];
  isLoading: boolean;
  lastFetchedAt: string | null;
  error: string | null;
}
