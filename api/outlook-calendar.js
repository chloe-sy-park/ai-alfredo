// Vercel Serverless Function - Microsoft Outlook Calendar 연동
// POST /api/outlook-calendar (메인 API)
// Uses Microsoft Graph API

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET 요청 - 서비스 워커 캐싱 호환용 (빈 응답)
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Outlook Calendar API is ready. Use POST for operations.',
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
      const targetCalendar = calendarId || null;
      const result = await addEvent(accessToken, event, targetCalendar);
      return res.status(200).json({ success: true, event: result });
    }

    // 여러 이벤트 추가
    if (action === 'addMultiple' && events) {
      const targetCalendar = calendarId || null;
      const results = await Promise.all(
        events.map(e => addEvent(accessToken, e, targetCalendar))
      );
      return res.status(200).json({ success: true, events: results });
    }

    // 이벤트 수정 (캘린더 ID 지정 가능)
    if (action === 'update' && eventId && event) {
      const targetCalendar = calendarId || null;
      const result = await updateEvent(accessToken, eventId, event, targetCalendar);
      return res.status(200).json({ success: true, event: result });
    }

    // 이벤트 삭제 (캘린더 ID 지정 가능)
    if (action === 'delete' && eventId) {
      const targetCalendar = calendarId || null;
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
    console.error('Outlook Calendar error:', error);
    return res.status(500).json({ error: error.message });
  }
}

const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';

// 캘린더 목록 가져오기
async function listCalendars(accessToken) {
  const response = await fetch(`${GRAPH_BASE_URL}/me/calendars`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to list calendars');
  }

  const data = await response.json();

  // 필요한 정보만 반환
  return (data.value || []).map(cal => ({
    id: cal.id,
    summary: cal.name,
    description: '',
    backgroundColor: cal.hexColor || '#A996FF',
    foregroundColor: '#FFFFFF',
    primary: cal.isDefaultCalendar || false,
    canEdit: cal.canEdit !== false,
  }));
}

// 이벤트 추가
async function addEvent(accessToken, event, calendarId) {
  const outlookEvent = formatEvent(event);
  const endpoint = calendarId
    ? `${GRAPH_BASE_URL}/me/calendars/${calendarId}/events`
    : `${GRAPH_BASE_URL}/me/events`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(outlookEvent),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to add event');
  }

  const result = await response.json();
  return transformOutlookEvent(result, calendarId);
}

// 이벤트 수정
async function updateEvent(accessToken, eventId, event, calendarId) {
  const outlookEvent = formatEvent(event);
  const endpoint = calendarId
    ? `${GRAPH_BASE_URL}/me/calendars/${calendarId}/events/${eventId}`
    : `${GRAPH_BASE_URL}/me/events/${eventId}`;

  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(outlookEvent),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update event');
  }

  const result = await response.json();
  return transformOutlookEvent(result, calendarId);
}

// 이벤트 삭제
async function deleteEvent(accessToken, eventId, calendarId) {
  const endpoint = calendarId
    ? `${GRAPH_BASE_URL}/me/calendars/${calendarId}/events/${eventId}`
    : `${GRAPH_BASE_URL}/me/events/${eventId}`;

  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete event');
  }

  return true;
}

// 이벤트 포맷 변환 (AlFredo -> Outlook)
function formatEvent(event) {
  const outlookEvent = {
    subject: event.title,
    body: {
      contentType: 'text',
      content: event.description || '',
    },
    location: event.location ? { displayName: event.location } : undefined,
    start: event.allDay
      ? { dateTime: `${event.date}T00:00:00`, timeZone: 'Asia/Seoul' }
      : { dateTime: `${event.date}T${event.time || event.start || '09:00'}:00`, timeZone: 'Asia/Seoul' },
    end: event.allDay
      ? { dateTime: `${event.endDate || event.date}T23:59:59`, timeZone: 'Asia/Seoul' }
      : { dateTime: `${event.date}T${event.endTime || event.end || '10:00'}:00`, timeZone: 'Asia/Seoul' },
    isAllDay: event.allDay || false,
  };

  // 알림 설정 (선택)
  if (event.reminder) {
    outlookEvent.reminderMinutesBeforeStart = event.reminder;
    outlookEvent.isReminderOn = true;
  }

  return outlookEvent;
}

// Outlook 이벤트를 공통 포맷으로 변환
function transformOutlookEvent(event, calendarId) {
  const isAllDay = event.isAllDay;

  return {
    id: event.id,
    summary: event.subject,
    start: {
      dateTime: isAllDay ? undefined : event.start?.dateTime,
      date: isAllDay ? event.start?.dateTime?.split('T')[0] : undefined,
    },
    end: {
      dateTime: isAllDay ? undefined : event.end?.dateTime,
      date: isAllDay ? event.end?.dateTime?.split('T')[0] : undefined,
    },
    description: event.body?.content,
    location: event.location?.displayName,
    calendarId: calendarId,
  };
}

// 이벤트 목록 가져오기
async function listEvents(accessToken, timeMin, timeMax, calendarIds) {
  const startDateTime = timeMin || new Date().toISOString();
  const endDateTime = timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // 캘린더 ID가 없으면 기본 캘린더만
  const calendarsToFetch = calendarIds && calendarIds.length > 0 ? calendarIds : [null];

  // 여러 캘린더에서 이벤트 가져오기
  const allEvents = await Promise.all(
    calendarsToFetch.map(async (calendarId) => {
      try {
        const endpoint = calendarId
          ? `${GRAPH_BASE_URL}/me/calendars/${calendarId}/calendarView`
          : `${GRAPH_BASE_URL}/me/calendarView`;

        const params = new URLSearchParams({
          startDateTime: startDateTime,
          endDateTime: endDateTime,
          $orderby: 'start/dateTime',
          $top: '100',
        });

        const response = await fetch(`${endpoint}?${params}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'outlook.timezone="Asia/Seoul"',
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch calendar ${calendarId}`);
          return [];
        }

        const data = await response.json();
        // 각 이벤트를 공통 포맷으로 변환
        return (data.value || []).map(event => transformOutlookEvent(event, calendarId));
      } catch (err) {
        console.error(`Error fetching calendar ${calendarId}:`, err);
        return [];
      }
    })
  );

  // 모든 이벤트 합치기
  const merged = allEvents.flat();

  // 중복 제거 (event.id 기준)
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

    if (aIsAllDay && !bIsAllDay) return -1;
    if (!aIsAllDay && bIsAllDay) return 1;

    const aTime = a.start?.dateTime || a.start?.date || '';
    const bTime = b.start?.dateTime || b.start?.date || '';
    return aTime.localeCompare(bTime);
  });

  return unique;
}
