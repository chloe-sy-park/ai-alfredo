import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;

// Gmail 메시지 타입
interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload?: {
    headers: { name: string; value: string }[];
    body?: { data?: string };
    parts?: { body?: { data?: string }; mimeType?: string }[];
  };
  internalDate: string;
}

interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  importance: 'high' | 'medium' | 'low';
  category: 'work' | 'personal' | 'newsletter' | 'notification';
  summary?: string;
}

/**
 * Google 액세스 토큰 갱신
 */
async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * Gmail API에서 최근 메일 조회
 */
async function fetchRecentEmails(
  accessToken: string,
  maxResults: number = 10,
  query: string = 'is:inbox'
): Promise<GmailMessage[]> {
  // 메일 목록 조회
  const listResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const listData = await listResponse.json();

  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  // 각 메일의 상세 정보 조회
  const messages: GmailMessage[] = await Promise.all(
    listData.messages.map(async (msg: { id: string }) => {
      const msgResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return msgResponse.json();
    })
  );

  return messages;
}

/**
 * 메일에서 헤더 값 추출
 */
function getHeader(message: GmailMessage, headerName: string): string {
  const header = message.payload?.headers?.find(
    (h) => h.name.toLowerCase() === headerName.toLowerCase()
  );
  return header?.value || '';
}

/**
 * 메일 본문 추출
 */
function getEmailBody(message: GmailMessage): string {
  // 단일 파트
  if (message.payload?.body?.data) {
    return atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
  }

  // 멀티파트
  if (message.payload?.parts) {
    const textPart = message.payload.parts.find(
      (p) => p.mimeType === 'text/plain' || p.mimeType === 'text/html'
    );
    if (textPart?.body?.data) {
      return atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
  }

  return message.snippet || '';
}

/**
 * 메일을 EmailSummary로 변환
 */
function parseEmailToSummary(message: GmailMessage): EmailSummary {
  const from = getHeader(message, 'From');
  const subject = getHeader(message, 'Subject');
  const date = new Date(parseInt(message.internalDate)).toISOString();

  // 간단한 중요도 판단 (발신자 기반)
  let importance: 'high' | 'medium' | 'low' = 'medium';
  const fromLower = from.toLowerCase();

  if (fromLower.includes('ceo') || fromLower.includes('urgent') || subject.toLowerCase().includes('urgent')) {
    importance = 'high';
  } else if (fromLower.includes('noreply') || fromLower.includes('newsletter') || fromLower.includes('notification')) {
    importance = 'low';
  }

  // 카테고리 분류
  let category: 'work' | 'personal' | 'newsletter' | 'notification' = 'work';

  if (fromLower.includes('newsletter') || fromLower.includes('marketing')) {
    category = 'newsletter';
  } else if (fromLower.includes('noreply') || fromLower.includes('notification') || fromLower.includes('alert')) {
    category = 'notification';
  } else if (fromLower.includes('gmail.com') || fromLower.includes('yahoo.com') || fromLower.includes('outlook.com')) {
    category = 'personal';
  }

  return {
    id: message.id,
    from,
    subject,
    date,
    snippet: message.snippet,
    importance,
    category,
  };
}

/**
 * Claude로 메일 요약 생성
 */
async function summarizeEmailsWithClaude(emails: EmailSummary[]): Promise<string> {
  if (emails.length === 0) {
    return '읽지 않은 중요한 메일이 없습니다.';
  }

  const emailContext = emails
    .slice(0, 5) // 상위 5개만
    .map((e, i) => `${i + 1}. [${e.importance}] ${e.from}\n   제목: ${e.subject}\n   미리보기: ${e.snippet}`)
    .join('\n\n');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `다음 이메일들을 한국어로 간결하게 요약해주세요. 중요한 메일을 강조하고, 필요한 조치가 있다면 알려주세요.

이메일 목록:
${emailContext}

요약 형식:
- 중요 메일 하이라이트 (있다면)
- 전체 요약 (2-3문장)
- 필요한 조치 (있다면)`,
        },
      ],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text || '메일 요약을 생성할 수 없습니다.';
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Authorization 헤더에서 사용자 정보 추출
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authorization required', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Invalid token', 401);
    }

    // 사용자의 Google 토큰 조회
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('google_access_token, google_refresh_token')
      .eq('id', user.user_metadata?.user_id)
      .single();

    if (userError || !userData?.google_access_token) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Google account not connected', 404);
    }

    let accessToken = userData.google_access_token;

    // 토큰 만료 시 갱신
    const testResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (testResponse.status === 401 && userData.google_refresh_token) {
      const newToken = await refreshGoogleToken(userData.google_refresh_token);
      if (newToken) {
        accessToken = newToken;
        // 새 토큰 저장
        await supabaseAdmin
          .from('users')
          .update({ google_access_token: newToken })
          .eq('id', user.user_metadata?.user_id);
      } else {
        return errorResponse(ErrorCodes.UNAUTHORIZED, 'Token refresh failed', 401);
      }
    }

    // GET /gmail - 최근 메일 목록
    if (req.method === 'GET' && (!path || path === 'gmail')) {
      const maxResults = parseInt(url.searchParams.get('maxResults') || '10');
      const query = url.searchParams.get('q') || 'is:inbox is:unread';

      const messages = await fetchRecentEmails(accessToken, maxResults, query);
      const emails = messages.map(parseEmailToSummary);

      // 중요도 순 정렬
      emails.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.importance] - order[b.importance];
      });

      return successResponse({ emails, count: emails.length });
    }

    // GET /gmail/summary - 메일 AI 요약
    if (req.method === 'GET' && path === 'summary') {
      const maxResults = parseInt(url.searchParams.get('maxResults') || '10');
      const query = url.searchParams.get('q') || 'is:inbox is:unread newer_than:1d';

      const messages = await fetchRecentEmails(accessToken, maxResults, query);
      const emails = messages.map(parseEmailToSummary);

      // 중요도 순 정렬 후 상위만 요약
      emails.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.importance] - order[b.importance];
      });

      const summary = await summarizeEmailsWithClaude(emails);

      return successResponse({
        summary,
        emailCount: emails.length,
        importantCount: emails.filter((e) => e.importance === 'high').length,
      });
    }

    // GET /gmail/:id - 특정 메일 상세
    if (req.method === 'GET' && path && path !== 'gmail' && path !== 'summary') {
      const messageId = path;

      const msgResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!msgResponse.ok) {
        return errorResponse(ErrorCodes.NOT_FOUND, 'Email not found', 404);
      }

      const message: GmailMessage = await msgResponse.json();
      const email = parseEmailToSummary(message);
      const body = getEmailBody(message);

      return successResponse({ ...email, body });
    }

    return errorResponse(ErrorCodes.NOT_FOUND, 'Endpoint not found', 404);
  } catch (error) {
    console.error('Gmail API Error:', error);
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch emails',
      500,
      error instanceof Error ? error.message : undefined
    );
  }
});
