// useGoogleCalendar.js - Google Calendar 실제 연동 훅
// 🔧 단순화: 앱 시작 시 API 호출 없음, 실제 사용 시에만 401 처리
import { useState, useCallback, useEffect, useRef } from 'react';

// Google OAuth 설정
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1042496826498-3t0uuv38l48n8tgj23e0c3oknkrn8m4j.apps.googleusercontent.com';

// Gmail scope 포함
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
].join(' ');

// localStorage 키
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'lifebutler_google_access_token',
  TOKEN_EXPIRY: 'lifebutler_google_token_expiry',
  EVENTS: 'lifebutler_google_events',
  USER_EMAIL: 'lifebutler_google_user_email',
};

export function useGoogleCalendar() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  
  const tokenClientRef = useRef(null);
  const isInitializedRef = useRef(false);

  // 저장된 인증 정보 삭제
  const clearStoredAuth = useCallback(() => {
    console.log('🗑️ Clearing stored auth...');
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    setIsConnected(false);
    setUserEmail(null);
  }, []);

  // 액세스 토큰 가져오기 (만료 확인 포함)
  const getAccessToken = useCallback(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    
    if (token && expiry && Date.now() < parseInt(expiry, 10)) {
      return token;
    }
    
    // 토큰 만료 시 정리
    if (token) {
      console.log('⏰ Token expired in getAccessToken, clearing...');
      clearStoredAuth();
    }
    return null;
  }, [clearStoredAuth]);

  // 내부 이벤트 가져오기 함수
  const fetchEventsInternal = useCallback(async (accessToken) => {
    try {
      const now = new Date();
      const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'list',
          timeMin,
          timeMax,
        }),
      });

      if (!response.ok) {
        // 401/403이면 토큰 정리
        if (response.status === 401 || response.status === 403) {
          console.warn('🔐 fetchEvents: Token invalid, clearing...');
          clearStoredAuth();
          return [];
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '이벤트를 가져오는데 실패했습니다');
      }

      const data = await response.json();
      const formattedEvents = (data.events || []).map(formatGoogleEvent).filter(Boolean);
      
      setEvents(formattedEvents);
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(formattedEvents));
      
      return formattedEvents;
    } catch (err) {
      console.error('Fetch events error:', err);
      setError(err.message);
      return [];
    }
  }, [clearStoredAuth]);

  // 토큰 응답 처리 (OAuth 로그인 성공 후)
  const handleTokenResponse = useCallback(async (response) => {
    console.log('Token response received:', response.error ? 'Error' : 'Success');
    
    if (response.error) {
      console.error('OAuth error:', response.error);
      setError(response.error_description || response.error);
      setIsLoading(false);
      return;
    }

    const accessToken = response.access_token;
    const expiresIn = response.expires_in || 3600;
    const expiryTime = Date.now() + (expiresIn * 1000);

    // localStorage에 저장
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

    setIsConnected(true);
    setError(null);

    // 사용자 정보 가져오기 (로그인 직후에만 - 여기서만 userinfo API 호출)
    try {
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (userResponse.ok) {
        const userInfo = await userResponse.json();
        if (userInfo?.email) {
          setUserEmail(userInfo.email);
          localStorage.setItem(STORAGE_KEYS.USER_EMAIL, userInfo.email);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch user info:', e);
    }

    // 이벤트 가져오기
    await fetchEventsInternal(accessToken);
    setIsLoading(false);
  }, [fetchEventsInternal]);

  // Google Identity Services 초기화
  const initializeGIS = useCallback(() => {
    if (isInitializedRef.current) return;
    
    const createClient = () => {
      if (typeof google === 'undefined' || !google.accounts?.oauth2) {
        return false;
      }

      try {
        tokenClientRef.current = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: handleTokenResponse,
        });
        isInitializedRef.current = true;
        console.log('Google OAuth initialized successfully');
        return true;
      } catch (e) {
        console.error('Failed to initialize Google OAuth:', e);
        return false;
      }
    };

    if (createClient()) return;

    let attempts = 0;
    const maxAttempts = 50;
    const checkGIS = setInterval(() => {
      attempts++;
      if (createClient() || attempts >= maxAttempts) {
        clearInterval(checkGIS);
      }
    }, 100);
  }, [handleTokenResponse]);

  // 초기화 - localStorage에서 상태 복원 (API 호출 없음!)
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const storedExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
    const storedEmail = localStorage.getItem(STORAGE_KEYS.USER_EMAIL);

    // 토큰이 있고 만료 전이면 연결된 것으로 간주
    if (storedToken && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      
      if (Date.now() < expiryTime) {
        // 단순히 localStorage 기반으로 상태 복원 (API 호출 없음)
        console.log('✅ Token found in storage, restoring state...');
        setIsConnected(true);
        if (storedEmail) setUserEmail(storedEmail);
        if (storedEvents) {
          try {
            setEvents(JSON.parse(storedEvents));
          } catch (e) {
            console.warn('Failed to parse stored events');
          }
        }
      } else {
        // 토큰 만료됨 - 정리
        console.log('⏰ Token expired, clearing...');
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
        localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
      }
    }

    // Google Identity Services 초기화
    initializeGIS();
  }, [initializeGIS]);

  // Google 연결
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!tokenClientRef.current) {
        let attempts = 0;
        await new Promise((resolve, reject) => {
          const checkClient = setInterval(() => {
            attempts++;
            if (tokenClientRef.current) {
              clearInterval(checkClient);
              resolve();
            } else if (attempts >= 30) {
              clearInterval(checkClient);
              reject(new Error('Google OAuth 초기화 타임아웃'));
            }
          }, 100);
        });
      }

      if (tokenClientRef.current) {
        console.log('Requesting access token...');
        tokenClientRef.current.requestAccessToken();
      } else {
        throw new Error('Google OAuth가 초기화되지 않았습니다.');
      }
    } catch (err) {
      console.error('Connect error:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
    }
    return true;
  }, []);

  // Google 연결 해제
  const disconnect = useCallback(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && typeof google !== 'undefined' && google.accounts?.oauth2) {
      try {
        google.accounts.oauth2.revoke(token, () => {
          console.log('Token revoked');
        });
      } catch (e) {
        console.warn('Failed to revoke token:', e);
      }
    }
    
    clearStoredAuth();
    setEvents([]);
    setError(null);
  }, [clearStoredAuth]);

  // 이벤트 가져오기 (외부용)
  const fetchEvents = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      console.warn('Not connected to Google Calendar');
      return events;
    }
    
    setIsLoading(true);
    const result = await fetchEventsInternal(token);
    setIsLoading(false);
    return result;
  }, [getAccessToken, fetchEventsInternal, events]);

  // 이벤트 동기화
  const syncEvents = useCallback(async () => {
    return await fetchEvents();
  }, [fetchEvents]);

  // 이벤트 추가
  const addEvent = useCallback(async (eventData) => {
    const token = getAccessToken();
    if (!token) {
      setError('Google Calendar에 연결되어 있지 않습니다');
      return null;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'add',
          event: eventData,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearStoredAuth();
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '이벤트 추가에 실패했습니다');
      }

      const data = await response.json();
      const newEvent = formatGoogleEvent(data.event);
      
      if (newEvent) {
        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
      }
      
      return newEvent;
    } catch (err) {
      console.error('Add event error:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, events, clearStoredAuth]);

  // 이벤트 수정
  const updateEvent = useCallback(async (eventId, updates) => {
    const token = getAccessToken();
    if (!token) {
      setError('Google Calendar에 연결되어 있지 않습니다');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update',
          eventId,
          event: updates,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearStoredAuth();
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '이벤트 수정에 실패했습니다');
      }

      const data = await response.json();
      const updatedEvent = formatGoogleEvent(data.event);
      
      if (updatedEvent) {
        const updatedEvents = events.map(e => 
          e.id === eventId ? updatedEvent : e
        );
        setEvents(updatedEvents);
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
      }
      
      return true;
    } catch (err) {
      console.error('Update event error:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, events, clearStoredAuth]);

  // 이벤트 삭제
  const deleteEvent = useCallback(async (eventId) => {
    const token = getAccessToken();
    if (!token) {
      setError('Google Calendar에 연결되어 있지 않습니다');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'delete',
          eventId,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearStoredAuth();
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '이벤트 삭제에 실패했습니다');
      }

      const updatedEvents = events.filter(e => e.id !== eventId);
      setEvents(updatedEvents);
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
      
      return true;
    } catch (err) {
      console.error('Delete event error:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, events, clearStoredAuth]);

  return {
    isConnected,
    isLoading,
    error,
    events,
    userEmail,
    connect,
    disconnect,
    fetchEvents,
    createEvent: addEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    syncEvents,
    getAccessToken,
  };
}

// Google Calendar 이벤트를 앱 형식으로 변환
function formatGoogleEvent(googleEvent) {
  if (!googleEvent) return null;

  const startDateTime = googleEvent.start?.dateTime || googleEvent.start?.date;
  const endDateTime = googleEvent.end?.dateTime || googleEvent.end?.date;
  
  if (!startDateTime) return null;
  
  const isAllDay = !googleEvent.start?.dateTime;

  let start = '';
  let end = '';
  let date = '';

  if (isAllDay) {
    date = startDateTime;
  } else {
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    date = startDate.toISOString().split('T')[0];
    start = startDate.toTimeString().slice(0, 5);
    end = endDate.toTimeString().slice(0, 5);
  }

  return {
    id: googleEvent.id,
    title: googleEvent.summary || '(제목 없음)',
    description: googleEvent.description || '',
    location: googleEvent.location || '',
    start,
    end,
    date,
    allDay: isAllDay,
    color: getEventColor(googleEvent.colorId),
    fromGoogle: true,
    htmlLink: googleEvent.htmlLink,
    status: googleEvent.status,
    created: googleEvent.created,
    updated: googleEvent.updated,
  };
}

// 이벤트 색상 매핑
function getEventColor(colorId) {
  const colors = {
    '1': 'bg-blue-500',
    '2': 'bg-green-500',
    '3': 'bg-purple-500',
    '4': 'bg-red-500',
    '5': 'bg-yellow-500',
    '6': 'bg-orange-500',
    '7': 'bg-cyan-500',
    '8': 'bg-gray-500',
    '9': 'bg-indigo-500',
    '10': 'bg-emerald-500',
    '11': 'bg-pink-500',
  };
  return colors[colorId] || 'bg-[#A996FF]';
}

export default useGoogleCalendar;
