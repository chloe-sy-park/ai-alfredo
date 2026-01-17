// Google OAuth Service
// Handles Google authentication flow (Calendar, Gmail, Drive)

import { authApi } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

const GOOGLE_TOKEN_KEY = 'google_access_token';
const GOOGLE_REFRESH_TOKEN_KEY = 'google_refresh_token';
const GOOGLE_TOKEN_EXPIRY_KEY = 'google_token_expiry';
const GOOGLE_USER_KEY = 'google_user';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

// Check if Google is connected
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
    const redirectUri = window.location.origin + '/auth/callback';
    const response = await authApi.getGoogleAuthUrl(redirectUri);

    if (!response.success || !response.data) {
      throw new Error('Failed to get auth URL');
    }

    // Store state for CSRF verification
    sessionStorage.setItem('oauth_state', response.data.state);

    // Redirect to Google OAuth
    window.location.href = response.data.auth_url;
  } catch (error) {
    console.error('Failed to start Google auth:', error);
    throw error;
  }
}

// Handle OAuth callback - exchange code for tokens
export async function handleGoogleCallback(code: string): Promise<{ user: GoogleUser; tokens: GoogleTokens }> {
  try {
    const redirectUri = window.location.origin + '/auth/callback';
    const response = await authApi.handleCallback(code, redirectUri);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Token exchange failed');
    }

    const { user, session } = response.data;

    // Store tokens in localStorage
    if (session?.access_token) {
      localStorage.setItem(GOOGLE_TOKEN_KEY, session.access_token);
      localStorage.setItem(GOOGLE_TOKEN_EXPIRY_KEY, (Date.now() + 3600 * 1000).toString());

      if (session.refresh_token) {
        localStorage.setItem(GOOGLE_REFRESH_TOKEN_KEY, session.refresh_token);
      }
    }

    // Store user info
    const googleUser: GoogleUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
    };
    localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(googleUser));

    // Update auth store
    const authStore = useAuthStore.getState();
    authStore.setAuth(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.avatar_url,
      },
      {
        access: session?.access_token || '',
        refresh: session?.refresh_token || '',
        googleAccess: session?.access_token,
      }
    );

    return {
      user: googleUser,
      tokens: {
        accessToken: session?.access_token || '',
        refreshToken: session?.refresh_token,
        expiresAt: Date.now() + 3600 * 1000,
      },
    };
  } catch (error) {
    console.error('Google callback failed:', error);
    throw error;
  }
}

// Disconnect Google
export function disconnectGoogle(): void {
  localStorage.removeItem(GOOGLE_TOKEN_KEY);
  localStorage.removeItem(GOOGLE_REFRESH_TOKEN_KEY);
  localStorage.removeItem(GOOGLE_TOKEN_EXPIRY_KEY);
  localStorage.removeItem(GOOGLE_USER_KEY);
}

// Export for calendar service compatibility
export { isGoogleConnected as isGoogleAuthenticated };
