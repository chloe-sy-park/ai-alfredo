// Microsoft/Outlook OAuth2 - Auth URL Generator
// GET /api/auth/outlook

import { setCorsHeaders } from '../_cors.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS 헤더 설정
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${process.env.VITE_APP_URL || 'http://localhost:5173'}/auth/outlook/callback`;

  if (!clientId) {
    return res.status(500).json({ error: 'Microsoft client ID not configured' });
  }

  // Microsoft OAuth2 scopes for calendar access
  const scopes = [
    'openid',
    'profile',
    'email',
    'offline_access',
    'Calendars.Read',
    'Calendars.ReadWrite',
    'User.Read'
  ];

  // 보안 강화: crypto.randomUUID() 사용
  const state = crypto.randomUUID();

  const authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' +
    new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      response_mode: 'query',
      scope: scopes.join(' '),
      prompt: 'select_account',
      state: state
    }).toString();

  return res.status(200).json({ authUrl, state });
}
