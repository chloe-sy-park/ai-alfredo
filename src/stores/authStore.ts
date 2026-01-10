import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

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
  logout: () => void;
  completeOnboarding: () => void;
  getAccessToken: () => string | null;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      isOnboarded: false,

      setAuth: (user, tokens) => {
        set({ 
          user, 
          tokens,
          isAuthenticated: true,
          isLoading: false 
        });
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/google');
          const data = await response.json();
          
          if (data.authUrl) {
            // Google OAuth 페이지로 리다이렉트
            window.location.href = data.authUrl;
          } else {
            throw new Error('Failed to get auth URL');
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
          const response = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Callback failed');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            tokens: data.tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error('Auth callback failed:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ 
          user: null, 
          tokens: null,
          isAuthenticated: false,
          isOnboarded: false 
        });
      },

      completeOnboarding: () => {
        set({ isOnboarded: true });
      },

      getAccessToken: () => {
        const { tokens } = get();
        if (!tokens) return null;
        
        // 토큰 만료 체크
        if (get().isTokenExpired()) {
          // TODO: refresh token으로 갱신
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
    }),
    {
      name: 'alfredo-auth',
      partialize: (state) => ({ 
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        isOnboarded: state.isOnboarded,
      })
    }
  )
);
