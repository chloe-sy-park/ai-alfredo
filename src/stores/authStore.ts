import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type User = {
  email: string;
  name?: string;
  picture?: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  googleAccessToken: string | null;
  isLoading: boolean;
  isOnboarded: boolean;
  onboardingStep: number | null;
  
  // Actions
  setAuth: (user: User, tokens: { access: string; refresh: string; googleAccess?: string }) => void;
  setUser: (user: User) => void;
  setGoogleAccessToken: (token: string) => void;
  clearAuth: () => void;
  signOut: () => void;
  setLoading: (loading: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  setOnboardingStep: (step: number | null) => void;
  checkAuthStatus: () => boolean;
  getAuthHeader: () => { Authorization: string } | {};
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      googleAccessToken: null,
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
        });
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      setGoogleAccessToken: (token) => {
        set({ googleAccessToken: token });
      },
      
      clearAuth: () => {
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          googleAccessToken: null,
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
      
      getAuthHeader: () => {
        const token = get().accessToken;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);