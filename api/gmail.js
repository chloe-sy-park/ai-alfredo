// Vercel Serverless Function - Gmail 연동
// POST /api/gmail (메인 API)
// GET /api/gmail (서비스 워커 호환용)

const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1';

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET 요청 - 서비스 워커 캐싱 호환용 (빈 응답)
  if (req.method === 'GET') {
    return res.status(200).json({ 
      success: true, 
      message: 'Gmail API is ready. Use POST for operations.',
      emails: [] 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authorization 헤더에서 액세스 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }
    const accessToken = authHeader.split(' ')[1];

    const { action, messageId, maxResults, query, labelIds } = req.body;

    // 이메일 목록 가져오기
    if (action === 'list') {
      const emails = await listEmails(accessToken, { maxResults, query, labelIds });
      return res.status(200).json({ success: true, emails });
    }

    // 이메일 상세 가져오기
    if (action === 'get' && messageId) {
      const email = await getEmail(accessToken, messageId);
      return res.status(200).json({ success: true, email });
    }

    // 여러 이메일 상세 가져오기 (배치)
    if (action === 'getBatch') {
      const { messageIds } = req.body;
      const emails = await getEmailsBatch(accessToken, messageIds);
      return res.status(200).json({ success: true, emails });
    }

    // 읽음/안읽음 표시
    if (action === 'markAsRead' && messageId) {
      await modifyLabels(accessToken, messageId, [], ['UNREAD']);
      return res.status(200).json({ success: true });
    }

    if (action === 'markAsUnread' && messageId) {
      await modifyLabels(accessToken, messageId, ['UNREAD'], []);
      return res.status(200).json({ success: true });
    }

    // 라벨 가져오기
    if (action === 'labels') {
      const labels = await getLabels(accessToken);
      return res.status(200).json({ success: true, labels });
    }

    // 프로필 가져오기
    if (action === 'profile') {
      const profile = await getProfile(accessToken);
      return res.status(200).json({ success: true, profile });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Gmail API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// 이메일 목록 가져오기
async function listEmails(accessToken, options = {}) {
  const { maxResults = 20, query = '', labelIds = ['INBOX'] } = options;
  
  const params = new URLSearchParams({
    maxResults: maxResults.toString(),
  });
  
  if (query) {
    params.append('q', query);
  }
  
  if (labelIds && labelIds.length > 0) {
    labelIds.forEach(label => params.append('labelIds', label));
  }

  const response = await fetch(
    `${GMAIL_API_BASE}/users/me/messages?${params}`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to list emails');
  }

  const data = await response.json();
  return data.messages || [];
}

// 단일 이메일 상세 가져오기
async function getEmail(accessToken, messageId) {
  const response = await fetch(
    `${GMAIL_API_BASE}/users/me/messages/${messageId}?format=full`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to get email');
  }

  const email = await response.json();
  return formatEmail(email);
}

// 여러 이메일 배치로 가져오기
async function getEmailsBatch(accessToken, messageIds) {
  const emails = await Promise.all(
    messageIds.slice(0, 20).map(id => getEmail(accessToken, id))
  );
  return emails.filter(Boolean);
}

// 라벨 수정 (읽음/안읽음 등)
async function modifyLabels(accessToken, messageId, addLabels, removeLabels) {
  const response = await fetch(
    `${GMAIL_API_BASE}/users/me/messages/${messageId}/modify`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addLabelIds: addLabels,
        removeLabelIds: removeLabels,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to modify labels');
  }

  return await response.json();
}

// 라벨 목록 가져오기
async function getLabels(accessToken) {
  const response = await fetch(
    `${GMAIL_API_BASE}/users/me/labels`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to get labels');
  }

  const data = await response.json();
  return data.labels || [];
}

// 프로필 가져오기
async function getProfile(accessToken) {
  const response = await fetch(
    `${GMAIL_API_BASE}/users/me/profile`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to get profile');
  }

  return await response.json();
}

// 이메일 포맷팅
function formatEmail(email) {
  if (!email) return null;

  const headers = email.payload?.headers || [];
  const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  // 본문 추출
  let body = '';
  let snippet = email.snippet || '';
  
  const extractBody = (parts) => {
    if (!parts) return '';
    
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64(part.body.data);
      }
      if (part.parts) {
        const nested = extractBody(part.parts);
        if (nested) return nested;
      }
    }
    
    // HTML fallback
    for (const part of parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return stripHtml(decodeBase64(part.body.data));
      }
    }
    
    return '';
  };

  if (email.payload?.body?.data) {
    body = decodeBase64(email.payload.body.data);
  } else if (email.payload?.parts) {
    body = extractBody(email.payload.parts);
  }

  // 첨부파일 확인
  const attachments = [];
  const extractAttachments = (parts) => {
    if (!parts) return;
    for (const part of parts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size,
          attachmentId: part.body.attachmentId,
        });
      }
      if (part.parts) {
        extractAttachments(part.parts);
      }
    }
  };
  extractAttachments(email.payload?.parts);

  const labels = email.labelIds || [];
  const isUnread = labels.includes('UNREAD');
  const isStarred = labels.includes('STARRED');
  const isImportant = labels.includes('IMPORTANT');
  
  // 카테고리 판별
  let category = 'primary';
  if (labels.includes('CATEGORY_PROMOTIONS')) category = 'promotions';
  else if (labels.includes('CATEGORY_SOCIAL')) category = 'social';
  else if (labels.includes('CATEGORY_UPDATES')) category = 'updates';
  else if (labels.includes('CATEGORY_FORUMS')) category = 'forums';

  return {
    id: email.id,
    threadId: email.threadId,
    from: parseEmailAddress(getHeader('From')),
    to: parseEmailAddress(getHeader('To')),
    cc: getHeader('Cc') ? parseEmailAddress(getHeader('Cc')) : null,
    subject: getHeader('Subject') || '(제목 없음)',
    snippet,
    body: body.slice(0, 5000), // 본문 5000자 제한
    date: new Date(parseInt(email.internalDate)).toISOString(),
    receivedAt: email.internalDate,
    isUnread,
    isStarred,
    isImportant,
    category,
    labels,
    hasAttachments: attachments.length > 0,
    attachments,
  };
}

// 이메일 주소 파싱
function parseEmailAddress(str) {
  if (!str) return { name: '', email: '' };
  
  const match = str.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return {
      name: match[1].replace(/"/g, '').trim(),
      email: match[2].trim(),
    };
  }
  
  return {
    name: '',
    email: str.trim(),
  };
}

// Base64 디코딩
function decodeBase64(data) {
  try {
    // URL-safe base64를 표준 base64로 변환
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (e) {
    console.error('Base64 decode error:', e);
    return '';
  }
}

// HTML 태그 제거
function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
