/**
 * Gmail 서비스
 * Gmail API 연동 및 메일 요약 기능
 */

import { supabase } from '../../lib/supabase';

// 타입 정의
export type EmailImportance = 'high' | 'medium' | 'low';
export type EmailCategory = 'work' | 'personal' | 'newsletter' | 'notification';

export interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  importance: EmailImportance;
  category: EmailCategory;
  summary?: string;
  body?: string;
}

export interface EmailListResponse {
  emails: EmailSummary[];
  count: number;
}

export interface EmailSummaryResponse {
  summary: string;
  emailCount: number;
  importantCount: number;
}

// API 베이스 URL
const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FUNCTIONS_URL = `${API_BASE_URL}/functions/v1`;

/**
 * 인증 헤더 가져오기
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

/**
 * 최근 메일 목록 조회
 */
export async function fetchEmails(options?: {
  maxResults?: number;
  query?: string;
}): Promise<EmailListResponse> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();

  if (options?.maxResults) {
    params.set('maxResults', options.maxResults.toString());
  }
  if (options?.query) {
    params.set('q', options.query);
  }

  const url = `${FUNCTIONS_URL}/gmail${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch emails');
  }

  const data = await response.json();
  return data.data;
}

/**
 * 메일 AI 요약 가져오기
 */
export async function fetchEmailSummary(options?: {
  maxResults?: number;
  query?: string;
}): Promise<EmailSummaryResponse> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();

  if (options?.maxResults) {
    params.set('maxResults', options.maxResults.toString());
  }
  if (options?.query) {
    params.set('q', options.query);
  }

  const url = `${FUNCTIONS_URL}/gmail/summary${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch email summary');
  }

  const data = await response.json();
  return data.data;
}

/**
 * 특정 메일 상세 조회
 */
export async function fetchEmailDetail(emailId: string): Promise<EmailSummary & { body: string }> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${FUNCTIONS_URL}/gmail/${emailId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch email detail');
  }

  const data = await response.json();
  return data.data;
}

/**
 * 읽지 않은 중요 메일 수 가져오기
 */
export async function getUnreadImportantCount(): Promise<number> {
  try {
    const { emails } = await fetchEmails({
      maxResults: 20,
      query: 'is:inbox is:unread',
    });

    return emails.filter((e) => e.importance === 'high').length;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
}

/**
 * 브리핑용 메일 요약 가져오기
 * 오늘 받은 읽지 않은 메일 중 중요한 것만 요약
 */
export async function getEmailBriefing(): Promise<{
  summary: string;
  hasImportant: boolean;
  count: number;
} | null> {
  try {
    const result = await fetchEmailSummary({
      maxResults: 10,
      query: 'is:inbox is:unread newer_than:1d',
    });

    return {
      summary: result.summary,
      hasImportant: result.importantCount > 0,
      count: result.emailCount,
    };
  } catch (error) {
    console.error('Failed to get email briefing:', error);
    return null;
  }
}

/**
 * 메일 중요도 라벨 텍스트
 */
export function getImportanceLabel(importance: EmailImportance): string {
  switch (importance) {
    case 'high':
      return '중요';
    case 'medium':
      return '보통';
    case 'low':
      return '낮음';
  }
}

/**
 * 메일 카테고리 라벨 텍스트
 */
export function getCategoryLabel(category: EmailCategory): string {
  switch (category) {
    case 'work':
      return '업무';
    case 'personal':
      return '개인';
    case 'newsletter':
      return '뉴스레터';
    case 'notification':
      return '알림';
  }
}

/**
 * 메일 카테고리 아이콘
 */
export function getCategoryEmoji(category: EmailCategory): string {
  switch (category) {
    case 'work':
      return '💼';
    case 'personal':
      return '👤';
    case 'newsletter':
      return '📰';
    case 'notification':
      return '🔔';
  }
}

/**
 * 메일 중요도 색상 클래스
 */
export function getImportanceColor(importance: EmailImportance): string {
  switch (importance) {
    case 'high':
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
    case 'low':
      return 'text-gray-500 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';
  }
}

export default {
  fetchEmails,
  fetchEmailSummary,
  fetchEmailDetail,
  getUnreadImportantCount,
  getEmailBriefing,
  getImportanceLabel,
  getCategoryLabel,
  getCategoryEmoji,
  getImportanceColor,
};
