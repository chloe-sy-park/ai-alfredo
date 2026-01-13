// Google OAuth Service
// Handles Google Calendar authentication flow

const GOOGLE_TOKEN_KEY = 'google_access_token';
const GOOGLE_REFRESH_TOKEN_KEY = 'google_refresh_token';
const GOOGLE_TOKEN_EXPIRY_KEY = 'google_token_expiry';
const GOOGLE_USER_KEY = 'google_user';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

// Check if Google Calendar is connected
export function isGoogleConnected(): boolean {
  const token = localStorage.getItem(GOOGLE_TOKEN_KEY);
  const expiry = localStorage.getItem(GOOGLE_TOKEN_EXPIRY_KEY);
  
  if (!token || !expiry) return false;
  
  // Check if token is expired (with 5 min buffer)
  const isExpired = Date.now() > (parseInt(expiry) - 5 * 60 * 1000);
  return !isExpired;
}

// Get stored Google user info
export function getGoogleUser(): GoogleUser | null {
  const userJson = localStorage.getItem(GOOGLE_USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

// Get Google access token
export function getGoogleToken(): string | null {
  if (!isGoogleConnected()) return null;
  return localStorage.getItem(GOOGLE_TOKEN_KEY);
}

// Start OAuth flow - redirect to Google
export async function startGoogleAuth(): Promise<void> {
  try {
    const response = await fetch('/api/auth/google');
    
    if (!response.ok) {
      throw new Error('Failed to get auth URL');
    }
    
    const data = await response.json();
    
    // Redirect to Google OAuth
    window.location.href = data.authUrl;
  } catch (error) {
    console.error('Failed to start Google auth:', error);
    throw error;
  }
}

// Handle OAuth callback - exchange code for tokens
export async function handleGoogleCallback(code: string): Promise<{ user: GoogleUser; tokens: GoogleTokens }> {
  try {
    const response = await fetch('/api/auth/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Token exchange failed');
    }
    
    const data = await response.json();
    
    // Store tokens
    localStorage.setItem(GOOGLE_TOKEN_KEY, data.tokens.accessToken);
    localStorage.setItem(GOOGLE_TOKEN_EXPIRY_KEY, data.tokens.expiresAt.toString());
    
    if (data.tokens.refreshToken) {
      localStorage.setItem(GOOGLE_REFRESH_TOKEN_KEY, data.tokens.refreshToken);
    }
    
    // Store user info
    localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(data.user));
    
    return {
      user: data.user,
      tokens: data.tokens,
    };
  } catch (error) {
    console.error('Google callback failed:', error);
    throw error;
  }
}

// Disconnect Google Calendar
export function disconnectGoogle(): void {
  localStorage.removeItem(GOOGLE_TOKEN_KEY);
  localStorage.removeItem(GOOGLE_REFRESH_TOKEN_KEY);
  localStorage.removeItem(GOOGLE_TOKEN_EXPIRY_KEY);
  localStorage.removeItem(GOOGLE_USER_KEY);
}

// Export for calendar service compatibility
export { isGoogleConnected as isGoogleAuthenticated };
