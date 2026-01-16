// Outlook OAuth Service
// Handles Microsoft/Outlook Calendar authentication flow

const OUTLOOK_TOKEN_KEY = 'outlook_access_token';
const OUTLOOK_REFRESH_TOKEN_KEY = 'outlook_refresh_token';
const OUTLOOK_TOKEN_EXPIRY_KEY = 'outlook_token_expiry';
const OUTLOOK_USER_KEY = 'outlook_user';

export interface OutlookUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface OutlookTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

// Check if Outlook Calendar is connected
export function isOutlookConnected(): boolean {
  var token = localStorage.getItem(OUTLOOK_TOKEN_KEY);
  var expiry = localStorage.getItem(OUTLOOK_TOKEN_EXPIRY_KEY);

  if (!token || !expiry) return false;

  // Check if token is expired (with 5 min buffer)
  var isExpired = Date.now() > (parseInt(expiry) - 5 * 60 * 1000);
  return !isExpired;
}

// Get stored Outlook user info
export function getOutlookUser(): OutlookUser | null {
  var userJson = localStorage.getItem(OUTLOOK_USER_KEY);
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

// Get Outlook access token
export function getOutlookToken(): string | null {
  if (!isOutlookConnected()) return null;
  return localStorage.getItem(OUTLOOK_TOKEN_KEY);
}

// Start OAuth flow - redirect to Microsoft
export async function startOutlookAuth(): Promise<void> {
  try {
    var response = await fetch('/api/auth/outlook');

    if (!response.ok) {
      throw new Error('Failed to get auth URL');
    }

    var data = await response.json();

    // Redirect to Microsoft OAuth
    window.location.href = data.authUrl;
  } catch (error) {
    console.error('Failed to start Outlook auth:', error);
    throw error;
  }
}

// Handle OAuth callback - exchange code for tokens
export async function handleOutlookCallback(code: string): Promise<{ user: OutlookUser; tokens: OutlookTokens }> {
  try {
    var response = await fetch('/api/auth/outlook-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      var error = await response.json();
      throw new Error(error.error || 'Token exchange failed');
    }

    var data = await response.json();

    // Store tokens
    localStorage.setItem(OUTLOOK_TOKEN_KEY, data.tokens.accessToken);
    localStorage.setItem(OUTLOOK_TOKEN_EXPIRY_KEY, data.tokens.expiresAt.toString());

    if (data.tokens.refreshToken) {
      localStorage.setItem(OUTLOOK_REFRESH_TOKEN_KEY, data.tokens.refreshToken);
    }

    // Store user info
    localStorage.setItem(OUTLOOK_USER_KEY, JSON.stringify(data.user));

    return {
      user: data.user,
      tokens: data.tokens,
    };
  } catch (error) {
    console.error('Outlook callback failed:', error);
    throw error;
  }
}

// Disconnect Outlook Calendar
export function disconnectOutlook(): void {
  localStorage.removeItem(OUTLOOK_TOKEN_KEY);
  localStorage.removeItem(OUTLOOK_REFRESH_TOKEN_KEY);
  localStorage.removeItem(OUTLOOK_TOKEN_EXPIRY_KEY);
  localStorage.removeItem(OUTLOOK_USER_KEY);
}

// Export for calendar service compatibility
export { isOutlookConnected as isOutlookAuthenticated };
