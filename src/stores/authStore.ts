import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type User = {
  id?: string;
  email: string;
  name?: string;
  picture?: string;
  onboarded?: boolean;
  preferences?: {
    context?: 'work' | 'life' | 'unsure';
    boundary?: 'soft' | 'balanced' | 'firm';
    calendarConnected?: boolean;
    notifications?: {
      enabled: boolean;
      times: string[];
    };
  };
};

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  googleAccessToken: string | null;
  googleRefreshToken: string | null;
  googleTokenExpiry: number | null;
  isLoading: boolean;
  isOnboarded: boolean;
  onboardingStep: number | null;

  // Actions
  setAuth: (user: User, tokens: { access: string; refresh: string; googleAccess?: string; googleRefresh?: string; googleExpiry?: number }) => void;
  setUser: (user: User) => void;
  setGoogleTokens: (tokens: { accessToken: string; refreshToken?: string; expiresAt: number }) => void;
  clearAuth: () => void;
  signOut: () => void;
  setLoading: (loading: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  setOnboardingStep: (step: number | null) => void;
  checkAuthStatus: () => boolean;
  isGoogleTokenValid: () => boolean;
  getAuthHeader: () => { Authorization: string } | {};
  getGoogleAuthHeader: () => { Authorization: string } | {};
  completeOnboarding: () => void;
  login: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      googleAccessToken: null,
      googleRefreshToken: null,
      googleTokenExpiry: null,
      isLoading: false,
      isOnboarded: false,
      onboardingStep: null,

      setAuth: (user, tokens) => {
        set({
          isAuthenticated: true,
          user,
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          googleAccessToken: tokens.googleAccess || null,
          googleRefreshToken: tokens.googleRefresh || null,
          googleTokenExpiry: tokens.googleExpiry || null,
        });
      },

      setUser: (user) => {
        set({ user });
      },

      setGoogleTokens: (tokens) => {
        set({
          googleAccessToken: tokens.accessToken,
          googleRefreshToken: tokens.refreshToken || null,
          googleTokenExpiry: tokens.expiresAt,
        });
      },

      clearAuth: () => {
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          googleAccessToken: null,
          googleRefreshToken: null,
          googleTokenExpiry: null,
          isOnboarded: false,
          onboardingStep: null,
        });
      },

      signOut: () => {
        get().clearAuth();
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setOnboarded: (onboarded) => {
        set({ isOnboarded: onboarded });
      },

      setOnboardingStep: (step) => {
        set({ onboardingStep: step });
      },

      checkAuthStatus: () => {
        const state = get();
        return state.isAuthenticated && !!state.accessToken;
      },

      isGoogleTokenValid: () => {
        const state = get();
        if (!state.googleAccessToken || !state.googleTokenExpiry) return false;
        // 5분 버퍼로 만료 체크
        return Date.now() < (state.googleTokenExpiry - 5 * 60 * 1000);
      },

      getAuthHeader: () => {
        const token = get().accessToken;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },

      getGoogleAuthHeader: () => {
        const state = get();
        if (!state.isGoogleTokenValid()) return {};
        return { Authorization: `Bearer ${state.googleAccessToken}` };
      },

      completeOnboarding: () => {
        set({ isOnboarded: true });
      },

      login: () => {
        // 임시 로그인 처리 (실제로는 Google OAuth 등을 사용)
        const mockUser: User = {
          email: 'user@example.com',
          name: 'User',
        };

        set({
          isAuthenticated: true,
          user: mockUser,
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token',
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);