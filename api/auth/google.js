// Vercel Serverless Function - Google OAuth URL 생성
// GET /api/auth/google

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // VITE_ prefix 환경변수도 체크 (Vercel에서 둘 다 설정 가능)
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    console.error('Missing GOOGLE_CLIENT_ID env var');
    return res.status(500).json({ error: 'Google Client ID not configured' });
  }

  // 프로덕션 도메인 우선, 없으면 VERCEL_URL 사용
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || 'http://localhost:5173';
  
  const redirectUri = `${baseUrl}/auth/callback`;

  const scopes = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly'
  ].join(' ');

  // crypto.randomUUID() 대신 간단한 랜덤 생성
  const state = Math.random().toString(36).substring(2) + Date.now().toString(36);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    state: state
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return res.status(200).json({ 
    authUrl,
    redirectUri 
  });
}
