// Google OAuth Service
// Handles Google authentication flow (Calendar, Gmail, Drive)
// 토큰 저장소: authStore (단일 source of truth)

import { authApi } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

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

// Check if Google is connected (authStore 사용)
export function isGoogleConnected(): boolean {
  return useAuthStore.getState().isGoogleTokenValid();
}

// Get stored Google user info (authStore에서 가져옴)
export function getGoogleUser(): GoogleUser | null {
  const user = useAuthStore.getState().user;
  if (!user) return null;

  return {
    id: user.id || '',
    email: user.email,
    name: user.name || '',
    avatar_url: user.picture,
  };
}

// Get Google access token (authStore에서 가져옴)
export function getGoogleToken(): string | null {
  const state = useAuthStore.getState();
  if (!state.isGoogleTokenValid()) return null;
  return state.googleAccessToken;
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

    const expiresAt = Date.now() + 3600 * 1000; // 1시간 후

    // Update auth store (단일 source of truth)
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
        googleRefresh: session?.refresh_token,
        googleExpiry: expiresAt,
      }
    );

    const googleUser: GoogleUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
    };

    return {
      user: googleUser,
      tokens: {
        accessToken: session?.access_token || '',
        refreshToken: session?.refresh_token,
        expiresAt: expiresAt,
      },
    };
  } catch (error) {
    console.error('Google callback failed:', error);
    throw error;
  }
}

// Disconnect Google (authStore 클리어)
export function disconnectGoogle(): void {
  const authStore = useAuthStore.getState();
  authStore.clearAuth();
}

// Export for calendar service compatibility
export { isGoogleConnected as isGoogleAuthenticated };
