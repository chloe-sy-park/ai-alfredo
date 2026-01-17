// Vercel Serverless Function - Google Calendar 연동
// POST /api/calendar (메인 API)
// GET /api/calendar (서비스 워커 호환용)

import { setCorsHeaders } from './_cors.js';

export default async function handler(req, res) {
  // CORS 헤더 설정
  if (setCorsHeaders(req, res)) return;

  // GET 요청 - 서비스 워커 캐싱 호환용 (빈 응답)
  if (req.method === 'GET') {
    return res.status(200).json({ 
      success: true, 
      message: 'Calendar API is ready. Use POST for operations.',
      events: [] 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authorization 헤더에서 액세스 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }
    const accessToken = authHeader.split(' ')[1];

    const { action, event, events, eventId, calendarId, calendarIds } = req.body;

    // 캘린더 목록 가져오기
    if (action === 'listCalendars') {
      const result = await listCalendars(accessToken);
      return res.status(200).json({ success: true, calendars: result });
    }

    // 단일 이벤트 추가 (캘린더 ID 지정 가능)
    if (action === 'add' && event) {
      const targetCalendar = calendarId || 'primary';
      const result = await addEvent(accessToken, event, targetCalendar);
      return res.status(200).json({ success: true, event: result });
    }

    // 여러 이벤트 추가
    if (action === 'addMultiple' && events) {
      const targetCalendar = calendarId || 'primary';
      const results = await Promise.all(
        events.map(e => addEvent(accessToken, e, targetCalendar))
      );
      return res.status(200).json({ success: true, events: results });
    }

    // 이벤트 수정 (캘린더 ID 지정 가능)
    if (action === 'update' && eventId && event) {
      const targetCalendar = calendarId || 'primary';
      const result = await updateEvent(accessToken, eventId, event, targetCalendar);
      return res.status(200).json({ success: true, event: result });
    }

    // 이벤트 삭제 (캘린더 ID 지정 가능)
    if (action === 'delete' && eventId) {
      const targetCalendar = calendarId || 'primary';
      await deleteEvent(accessToken, eventId, targetCalendar);
      return res.status(200).json({ success: true });
    }

    // 이벤트 목록 가져오기 (여러 캘린더 지원)
    if (action === 'list') {
      const { timeMin, timeMax } = req.body;
      const result = await listEvents(accessToken, timeMin, timeMax, calendarIds);
      return res.status(200).json({ success: true, events: result });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Calendar error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// 캘린더 목록 가져오기
async function listCalendars(accessToken) {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to list calendars');
  }

  const data = await response.json();
  
  // 필요한 정보만 반환 (writer/owner 권한만 추가 가능)
  return (data.items || []).map(cal => ({
    id: cal.id,
    summary: cal.summary,
    description: cal.description || '',
    backgroundColor: cal.backgroundColor,
    foregroundColor: cal.foregroundColor,
    primary: cal.primary || false,
    accessRole: cal.accessRole,
    canEdit: cal.accessRole === 'owner' || cal.accessRole === 'writer',
  }));
}

// 이벤트 추가 (캘린더 ID 지정)
async function addEvent(accessToken, event, calendarId) {
  const calendarEvent = formatEvent(event);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calendarEvent),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to add event');
  }

  const result = await response.json();
  return { ...result, calendarId };
}

// 이벤트 수정 (캘린더 ID 지정)
async function updateEvent(accessToken, eventId, event, calendarId) {
  const calendarEvent = formatEvent(event);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calendarEvent),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update event');
  }

  const result = await response.json();
  return { ...result, calendarId };
}

// 이벤트 삭제 (캘린더 ID 지정)
async function deleteEvent(accessToken, eventId, calendarId) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete event');
  }

  return true;
}

// 이벤트 포맷 변환
function formatEvent(event) {
  const calendarEvent = {
    summary: event.title,
    description: event.description || '',
    location: event.location || '',
    start: event.allDay 
      ? { date: event.date }
      : { dateTime: `${event.date}T${event.time || event.start || '09:00'}:00`, timeZone: 'Asia/Seoul' },
    end: event.allDay
      ? { date: event.endDate || event.date }
      : { dateTime: `${event.date}T${event.endTime || event.end || '10:00'}:00`, timeZone: 'Asia/Seoul' },
  };

  // 알림 설정 (선택)
  if (event.reminder) {
    calendarEvent.reminders = {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: event.reminder }
      ]
    };
  }

  return calendarEvent;
}

// 이벤트 목록 가져오기 (여러 캘린더 지원 + 중복 제거)
async function listEvents(accessToken, timeMin, timeMax, calendarIds) {
  const params = new URLSearchParams({
    timeMin: timeMin || new Date().toISOString(),
    timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
  });

  // 캘린더 ID가 없으면 primary만
  const calendarsToFetch = calendarIds && calendarIds.length > 0 
    ? calendarIds 
    : ['primary'];

  // 여러 캘린더에서 이벤트 가져오기
  const allEvents = await Promise.all(
    calendarsToFetch.map(async (calendarId) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch calendar ${calendarId}`);
          return [];
        }

        const data = await response.json();
        // 각 이벤트에 캘린더 ID 추가
        return (data.items || []).map(event => ({
          ...event,
          calendarId: calendarId,
        }));
      } catch (err) {
        console.error(`Error fetching calendar ${calendarId}:`, err);
        return [];
      }
    })
  );

  // 모든 이벤트 합치기
  const merged = allEvents.flat();
  
  // 중복 제거 (event.id 기준, 첫 번째 것만 유지)
  const seen = new Set();
  const unique = merged.filter(event => {
    if (seen.has(event.id)) {
      return false;
    }
    seen.add(event.id);
    return true;
  });
  
  // 종일 일정 먼저, 그 다음 시간순 정렬
  unique.sort((a, b) => {
    const aIsAllDay = !a.start?.dateTime;
    const bIsAllDay = !b.start?.dateTime;
    
    // 종일 일정 먼저
    if (aIsAllDay && !bIsAllDay) return -1;
    if (!aIsAllDay && bIsAllDay) return 1;
    
    // 같은 타입이면 시간순
    const aTime = a.start?.dateTime || a.start?.date || '';
    const bTime = b.start?.dateTime || b.start?.date || '';
    return aTime.localeCompare(bTime);
  });

  return unique;
}
