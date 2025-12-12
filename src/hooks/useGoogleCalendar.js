// Google Calendar 연동 훅
import { useState, useEffect, useCallback } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export function useGoogleCalendar() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenClient, setTokenClient] = useState(null);

  // Google Identity Services 초기화
  useEffect(() => {
    const initGoogle = () => {
      if (!window.google || !GOOGLE_CLIENT_ID) {
        setIsLoading(false);
        return;
      }

      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.access_token) {
              setAccessToken(response.access_token);
              setIsSignedIn(true);
              localStorage.setItem('google_access_token', response.access_token);
              // 사용자 정보 가져오기
              fetchUserInfo(response.access_token);
            }
          },
          error_callback: (err) => {
            console.error('Google OAuth error:', err);
            setError(err.message || 'Google 로그인에 실패했습니다');
          }
        });
        setTokenClient(client);
      } catch (err) {
        console.error('Failed to init Google:', err);
      }
      
      // 저장된 토큰 확인
      const savedToken = localStorage.getItem('google_access_token');
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
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initGoogle();
        }
      }, 100);
      
      // 3초 후 타임아웃
      setTimeout(() => {
        clearInterval(checkGoogle);
        setIsLoading(false);
      }, 3000);
    }
  }, []);

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
