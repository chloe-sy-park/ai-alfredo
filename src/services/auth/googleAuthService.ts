// Google OAuth Service
// Handles Google authentication flow (Calendar, Gmail, Drive)
// 토큰 저장소: authStore (단일 source of truth)
// Vercel API 엔드포인트 사용 (CORS 문제 해결)

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

// Start OAuth flow - redirect to Google (Vercel API 사용)
export async function startGoogleAuth(): Promise<void> {
  try {
    const redirectUri = window.location.origin + '/auth/callback';

    // Vercel API 엔드포인트 호출
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ redirect_uri: redirectUri }),
    });

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

// Handle OAuth callback - exchange code for tokens (Vercel API 사용)
export async function handleGoogleCallback(code: string): Promise<{ user: GoogleUser; tokens: GoogleTokens }> {
  try {
    const redirectUri = window.location.origin + '/auth/callback';

    // Vercel API 엔드포인트 호출
    const response = await fetch('/api/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Token exchange failed');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Token exchange failed');
    }

    const { user, tokens } = data;

    // Update auth store (단일 source of truth)
    const authStore = useAuthStore.getState();
    authStore.setAuth(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      {
        access: tokens.accessToken,
        refresh: tokens.refreshToken || '',
        googleAccess: tokens.accessToken,
        googleRefresh: tokens.refreshToken,
        googleExpiry: tokens.expiresAt,
      }
    );

    const googleUser: GoogleUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.picture,
    };

    return {
      user: googleUser,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
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
