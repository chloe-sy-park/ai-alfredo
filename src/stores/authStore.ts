import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/api';
import { supabase, signOut as supabaseSignOut } from '../lib/supabase';
import type { User } from '../types/database';

export interface Tokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

interface AuthState {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  setAuth: (user: User, tokens: Tokens) => void;
  loginWithGoogle: () => Promise<void>;
  handleCallback: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  getAccessToken: () => string | null;
  isTokenExpired: () => boolean;
  refreshToken: () => Promise<boolean>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,
      isOnboarded: false,

      // 초기화 - 앱 시작 시 세션 확인
      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Supabase 세션이 있으면 상태 업데이트
            set({
              isAuthenticated: true,
              isLoading: false,
              tokens: {
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
              },
            });
          } else {
            // 로컬 저장소에서 복원 시도
            const storedState = get();
            if (storedState.tokens && !storedState.isTokenExpired()) {
              set({ isLoading: false });
            } else {
              set({ 
                isLoading: false, 
                isAuthenticated: false,
                user: null,
                tokens: null,
              });
            }
          }
        } catch (error) {
          console.error('인증 초기화 오류:', error);
          set({ isLoading: false });
        }
      },

      setAuth: (user, tokens) => {
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const redirectUri = `${window.location.origin}/auth/callback`;
          const response = await authApi.getGoogleAuthUrl(redirectUri);

          if (response.success && response.data?.auth_url) {
            // CSRF state 저장
            if (response.data.state) {
              localStorage.setItem('oauth_state', response.data.state);
            }
            // Google OAuth 페이지로 리다이렉트
            window.location.href = response.data.auth_url;
          } else {
            throw new Error(response.error?.message || 'Failed to get auth URL');
          }
        } catch (error) {
          console.error('Google login failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      handleCallback: async (code: string) => {
        set({ isLoading: true });
        try {
          const redirectUri = `${window.location.origin}/auth/callback`;
          const response = await authApi.handleCallback(code, redirectUri);

          if (response.success && response.data) {
            const { user, session } = response.data;

            set({
              user,
              tokens: session ? {
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
              } : null,
              isAuthenticated: true,
              isLoading: false,
              isOnboarded: user?.is_onboarded || false,
            });

            // OAuth state 정리
            localStorage.removeItem('oauth_state');

            return true;
          } else {
            throw new Error(response.error?.message || 'Callback failed');
          }
        } catch (error) {
          console.error('Auth callback failed:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
          await supabaseSignOut();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isOnboarded: false,
          });
          // 로컬 스토리지 정리
          localStorage.removeItem('alfredo-auth');
          localStorage.removeItem('oauth_state');
        }
      },

      completeOnboarding: () => {
        set({ isOnboarded: true });
      },

      getAccessToken: () => {
        const { tokens } = get();
        if (!tokens) return null;

        if (get().isTokenExpired()) {
          // 토큰 만료 시 refresh 시도
          get().refreshToken();
          return null;
        }

        return tokens.accessToken;
      },

      isTokenExpired: () => {
        const { tokens } = get();
        if (!tokens) return true;

        // 5분 여유를 두고 만료 체크
        return Date.now() > (tokens.expiresAt - 5 * 60 * 1000);
      },

      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) return false;

        try {
          const response = await authApi.refreshToken(tokens.refreshToken);

          if (response.success && response.data) {
            set({
              tokens: {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresAt: response.data.expires_at * 1000,
              },
            });
            return true;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          // 리프레시 실패 시 로그아웃
          get().logout();
        }
        return false;
      },
    }),
    {
      name: 'alfredo-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);
