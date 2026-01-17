import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { onAuthStateChange, signOut as supabaseSignOut } from '../lib/supabase';
import type { User } from '../types/database';

// 인증 상태 타입
interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 컨텍스트 타입
interface AuthContextType extends AuthState {
  signInWithGoogle: (redirectUri?: string) => Promise<void>;
  handleOAuthCallback: (code: string, redirectUri?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// 기본값
const defaultState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
};

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Storage 키
const USER_STORAGE_KEY = 'alfredo_user';
const SESSION_STORAGE_KEY = 'alfredo_session';

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(defaultState);

  // 로컬 스토리지에서 초기 상태 복원
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);

    if (storedUser && storedSession) {
      try {
        const user = JSON.parse(storedUser);
        const session = JSON.parse(storedSession);
        
        // 세션 만료 확인
        if (session.expires_at && session.expires_at * 1000 > Date.now()) {
          setState({
            user,
            session,
            isLoading: false,
            isAuthenticated: true,
          });
          return;
        }
      } catch (e) {
        console.error('저장된 인증 정보 파싱 오류:', e);
      }
    }

    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  // Supabase 인증 상태 변경 감지
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((session) => {
      if (session) {
        setState(prev => ({
          ...prev,
          session,
          isAuthenticated: true,
        }));
      } else {
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Google 로그인 시작 (Vercel API 사용)
  const signInWithGoogle = useCallback(async (redirectUri?: string) => {
    try {
      const finalRedirectUri = redirectUri || window.location.origin + '/auth/callback';

      // Vercel API 엔드포인트 호출
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirect_uri: finalRedirectUri }),
      });

      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }

      const data = await response.json();

      if (data.authUrl) {
        // Google 로그인 페이지로 리다이렉트
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get auth URL');
      }
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      throw error;
    }
  }, []);

  // OAuth 콜백 처리 (Vercel API 사용)
  const handleOAuthCallback = useCallback(async (code: string, redirectUri?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const finalRedirectUri = redirectUri || window.location.origin + '/auth/callback';

      // Vercel API 엔드포인트 호출
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirect_uri: finalRedirectUri }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();

      if (data.success && data.user) {
        const { user, tokens } = data;

        // 세션 형태로 변환
        const session = {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_at: Math.floor(tokens.expiresAt / 1000),
        };

        // 로컬 스토리지에 저장
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

        setState({
          user,
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('OAuth 콜백 처리 오류:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // 로그아웃
  const signOut = useCallback(async () => {
    try {
      await supabaseSignOut();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('auth-storage'); // Zustand persist 데이터도 제거

      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // 사용자 정보 새로고침
  const refreshUser = useCallback(async () => {
    if (!state.isAuthenticated || !state.session) {
      console.log('인증되지 않은 상태에서 새로고침 시도');
      return;
    }

    try {
      // 세션 만료 확인
      if (state.session.expires_at && state.session.expires_at * 1000 < Date.now()) {
        // 토큰 만료됨 - 로그아웃 처리
        console.log('세션 만료됨, 재로그인 필요');
        await signOut();
        return;
      }

      console.log('사용자 정보 새로고침 완료');
    } catch (error) {
      console.error('사용자 정보 새로고침 오류:', error);
    }
  }, [state.isAuthenticated, state.session, signOut]);

  const value: AuthContextType = {
    ...state,
    signInWithGoogle,
    handleOAuthCallback,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
