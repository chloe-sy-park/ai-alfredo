// Microsoft/Outlook OAuth2 - Token Exchange
// POST /api/auth/outlook-callback

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${process.env.VITE_APP_URL || 'http://localhost:5173'}/auth/outlook/callback`;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Microsoft credentials not configured' });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token exchange error:', error);
      return res.status(400).json({ error: error.error_description || 'Token exchange failed' });
    }

    const tokenData = await tokenResponse.json();

    // Get user info from Microsoft Graph
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return res.status(400).json({ error: 'Failed to get user info' });
    }

    const userData = await userResponse.json();

    // Get user photo (optional)
    let picture = null;
    try {
      const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (photoResponse.ok) {
        const photoBlob = await photoResponse.blob();
        const photoBuffer = await photoBlob.arrayBuffer();
        const base64 = Buffer.from(photoBuffer).toString('base64');
        picture = `data:image/jpeg;base64,${base64}`;
      }
    } catch (e) {
      // Photo is optional, ignore errors
    }

    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.mail || userData.userPrincipalName,
        name: userData.displayName,
        picture: picture,
      },
      tokens: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
      },
    });
  } catch (error) {
    console.error('Outlook callback error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
