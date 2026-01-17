// Vercel Serverless Function - Google OAuth URL 생성
// GET /api/auth/google

import { setCorsHeaders } from '../_cors.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS 헤더 설정
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error('Missing GOOGLE_CLIENT_ID env var');
    return res.status(500).json({ error: 'Google Client ID not configured' });
  }

  // 메인 도메인 고정 (환경변수 우선, 없으면 하드코딩)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.my-alfredo.com';
  const redirectUri = `${baseUrl}/auth/callback`;

  console.log('OAuth redirect_uri:', redirectUri);

  const scopes = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly'
  ].join(' ');

  // 보안 강화: crypto.randomUUID() 사용
  const state = crypto.randomUUID();

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
