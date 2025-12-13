// Google Calendar 연동 훅
import { useState, useEffect, useCallback } from 'react';

// 환경변수 또는 localStorage에서 Client ID 가져오기
const getClientId = () => {
  // 1. 환경변수 확인
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (envClientId) return envClientId;
  
  // 2. localStorage에서 확인 (테스트용)
  const savedClientId = localStorage.getItem('GOOGLE_CLIENT_ID');
  if (savedClientId) return savedClientId;
  
  return null;
};

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export function useGoogleCalendar() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenClient, setTokenClient] = useState(null);
  const [clientId, setClientId] = useState(getClientId());

  // Client ID 설정 함수 (외부에서 호출 가능)
  const setGoogleClientId = useCallback((id) => {
    localStorage.setItem('GOOGLE_CLIENT_ID', id);
    setClientId(id);
    window.location.reload(); // 새로고침하여 재초기화
  }, []);

  // Google Identity Services 초기화
  useEffect(() => {
    console.log('🔍 Google Calendar Init Debug:');
    console.log('  - Client ID:', clientId ? `${clientId.substring(0, 20)}...` : '없음 ❌');
    console.log('  - window.google:', window.google ? '로드됨 ✅' : '없음 ❌');
    console.log('  - 환경변수:', import.meta.env.VITE_GOOGLE_CLIENT_ID ? '있음' : '없음');
    
    const initGoogle = () => {
      if (!window.google) {
        console.error('❌ window.google이 없습니다. GSI 스크립트가 로드되지 않았습니다.');
        setIsLoading(false);
        return;
      }
      
      if (!clientId) {
        console.error('❌ Google Client ID가 설정되지 않았습니다.');
        console.log('💡 콘솔에서 다음 명령으로 설정 가능:');
        console.log('   localStorage.setItem("GOOGLE_CLIENT_ID", "YOUR_CLIENT_ID")');
        console.log('   그 후 새로고침');
        setIsLoading(false);
        return;
      }

      try {
        console.log('✅ Google OAuth 초기화 시작...');
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: (response) => {
            console.log('📥 OAuth 응답:', response);
            if (response.access_token) {
              setAccessToken(response.access_token);
              setIsSignedIn(true);
              localStorage.setItem('google_access_token', response.access_token);
              fetchUserInfo(response.access_token);
            }
          },
          error_callback: (err) => {
            console.error('Google OAuth error:', err);
            setError(err.message || 'Google 로그인에 실패했습니다');
          }
        });
        setTokenClient(client);
        console.log('✅ Token client 생성 완료');
      } catch (err) {
        console.error('Failed to init Google:', err);
      }
      
      // 저장된 토큰 확인
      const savedToken = localStorage.getItem('google_access_token');
      console.log('💾 저장된 토큰:', savedToken ? '있음' : '없음');
      if (savedToken) {
        validateToken(savedToken);
      } else {
        setIsLoading(false);
      }
    };

    // Google Identity Services 스크립트 로드 확인
    if (window.google) {
      initGoogle();
    } else {
      console.log('⏳ window.google 로드 대기 중...');
      const checkGoogle = setInterval(() => {
        if (window.google) {
          console.log('✅ window.google 로드됨!');
          clearInterval(checkGoogle);
          initGoogle();
        }
      }, 100);
      
      // 3초 후 타임아웃
      setTimeout(() => {
        clearInterval(checkGoogle);
        if (!window.google) {
          console.error('❌ 3초 타임아웃: window.google 로드 실패');
        }
        setIsLoading(false);
      }, 3000);
    }
  }, [clientId]);

  // 토큰 유효성 검사
  const validateToken = async (token) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
      );
      
      if (response.ok) {
        setAccessToken(token);
        setIsSignedIn(true);
        fetchUserInfo(token);
      } else {
        // 토큰 만료됨
        localStorage.removeItem('google_access_token');
      }
    } catch (err) {
      localStorage.removeItem('google_access_token');
    }
    setIsLoading(false);
  };

  // 사용자 정보 가져오기
  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const info = await response.json();
        setUserInfo(info);
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  };

  // 로그인
  const signIn = useCallback(() => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else {
      setError('Google 로그인을 초기화하지 못했습니다');
    }
  }, [tokenClient]);

  // 로그아웃
  const signOut = useCallback(() => {
    if (accessToken) {
      window.google?.accounts.oauth2.revoke(accessToken);
    }
    setAccessToken(null);
    setIsSignedIn(false);
    setUserInfo(null);
    localStorage.removeItem('google_access_token');
  }, [accessToken]);

  // 이벤트 추가
  const addEvent = useCallback(async (event) => {
    if (!accessToken) {
      throw new Error('로그인이 필요합니다');
    }

    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action: 'add', event }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '일정 추가에 실패했습니다');
    }

    return await response.json();
  }, [accessToken]);

  // 여러 이벤트 추가
  const addEvents = useCallback(async (events) => {
    if (!accessToken) {
      throw new Error('로그인이 필요합니다');
    }

    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action: 'addMultiple', events }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '일정 추가에 실패했습니다');
    }

    return await response.json();
  }, [accessToken]);

  // 이벤트 수정
  const updateEvent = useCallback(async (eventId, event) => {
    if (!accessToken) {
      throw new Error('로그인이 필요합니다');
    }

    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action: 'update', eventId, event }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '일정 수정에 실패했습니다');
    }

    return await response.json();
  }, [accessToken]);

  // 이벤트 삭제
  const deleteEvent = useCallback(async (eventId) => {
    if (!accessToken) {
      throw new Error('로그인이 필요합니다');
    }

    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action: 'delete', eventId }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '일정 삭제에 실패했습니다');
    }

    return await response.json();
  }, [accessToken]);

  // 이벤트 목록 가져오기
  const listEvents = useCallback(async (timeMin, timeMax) => {
    if (!accessToken) {
      throw new Error('로그인이 필요합니다');
    }

    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action: 'list', timeMin, timeMax }),
    });

    if (!response.ok) {
      // 401 에러 시 토큰 제거
      if (response.status === 401) {
        localStorage.removeItem('google_access_token');
        setAccessToken(null);
        setIsSignedIn(false);
        throw new Error('401 Unauthorized - 토큰이 만료되었습니다');
      }
      const err = await response.json();
      throw new Error(err.error || '일정 조회에 실패했습니다');
    }

    return await response.json();
  }, [accessToken]);

  return {
    isSignedIn,
    isLoading,
    userInfo,
    error,
    clientId,
    setGoogleClientId,
    signIn,
    signOut,
    addEvent,
    addEvents,
    updateEvent,
    deleteEvent,
    listEvents,
  };
}

export default useGoogleCalendar;
