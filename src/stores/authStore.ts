import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  isOnboarded: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        });
      },

      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Supabase 세션에서 사용자 정보 가져오기
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              set({
                user: {
                  id: profile.id,
                  email: profile.email,
                  name: profile.name,
                  avatarUrl: profile.avatar_url,
                  isOnboarded: profile.is_onboarded,
                  createdAt: profile.created_at
                },
                isAuthenticated: true,
                isLoading: false
              });
              return;
            }
          }
          
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      loginWithGoogle: async () => {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              scopes: 'openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly'
            }
          });
          
          if (error) throw error;
        } catch (error) {
          console.error('Google login failed:', error);
          throw error;
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout failed:', error);
        }
      },

      completeOnboarding: () => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, isOnboarded: true } });
        }
      }
    }),
    {
      name: 'alfredo-auth',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
