// Vercel Serverless Function - Google OAuth Callback
// POST /api/auth/callback

import { setCorsHeaders } from '../_cors.js';

export default async function handler(req, res) {
  // CORS 헤더 설정
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, redirect_uri } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing Google OAuth credentials', { clientId: !!clientId, clientSecret: !!clientSecret });
    return res.status(500).json({ error: 'Google OAuth credentials not configured' });
  }

  // 클라이언트에서 전달된 redirect_uri 사용, 없으면 origin 기반으로 생성
  let redirectUri;
  if (redirect_uri) {
    redirectUri = redirect_uri;
  } else {
    const origin = req.headers.origin || 'https://ai-alfredo.vercel.app';
    redirectUri = `${origin}/auth/callback`;
  }

  console.log('Token exchange redirect_uri:', redirectUri);

  try {
    // Authorization code를 access token으로 교환
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return res.status(400).json({ error: 'Token exchange failed', details: error });
    }

    const tokens = await tokenResponse.json();

    // 사용자 정보 가져오기
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return res.status(400).json({ error: 'Failed to get user info' });
    }

    const userInfo = await userResponse.json();

    return res.status(200).json({
      success: true,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
      tokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        expiresAt: Date.now() + (tokens.expires_in * 1000),
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
