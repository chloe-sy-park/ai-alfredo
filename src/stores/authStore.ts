import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;
  login: () => void;
  logout: () => void;
  completeOnboarding: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isOnboarded: false,
      
      login: () => {
        set({
          user: { id: '1', name: 'Boss', email: 'boss@example.com' },
          isAuthenticated: true,
          isLoading: false
        });
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isOnboarded: false
        });
      },
      
      completeOnboarding: () => {
        set({ isOnboarded: true });
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      }
    }),
    { name: 'alfredo-auth' }
  )
);
