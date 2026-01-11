import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { onAuthStateChange, signOut as supabaseSignOut } from '../lib/supabase';
import { authApi } from '../lib/api';
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

  // Google 로그인 시작
  const signInWithGoogle = useCallback(async (redirectUri?: string) => {
    try {
      const response = await authApi.getGoogleAuthUrl(redirectUri);
      
      if (response.success && response.data?.auth_url) {
        // state 저장 (CSRF 방지)
        localStorage.setItem('oauth_state', response.data.state);
        // Google 로그인 페이지로 리다이렉트
        window.location.href = response.data.auth_url;
      } else {
        throw new Error(response.error?.message || 'Failed to get auth URL');
      }
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      throw error;
    }
  }, []);

  // OAuth 콜백 처리
  const handleOAuthCallback = useCallback(async (code: string, redirectUri?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await authApi.handleCallback(code, redirectUri);

      if (response.success && response.data) {
        const { user, session } = response.data;

        // 로컬 스토리지에 저장
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        if (session) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        }

        setState({
          user,
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        throw new Error(response.error?.message || 'Authentication failed');
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
      await authApi.logout();
      await supabaseSignOut();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('oauth_state');
      
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
    // TODO: 사용자 정보 API 호출
    console.log('사용자 정보 새로고침');
  }, []);

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
