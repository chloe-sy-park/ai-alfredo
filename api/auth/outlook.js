// Microsoft/Outlook OAuth2 - Auth URL Generator
// GET /api/auth/outlook

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

  const authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' +
    new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      response_mode: 'query',
      scope: scopes.join(' '),
      prompt: 'select_account'
    }).toString();

  return res.status(200).json({ authUrl });
}
