// Calendar Service - Google Calendar API 연동

const CALENDAR_API_URL = '/api/calendar';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  description?: string;
  location?: string;
}

interface GoogleEvent {
  id: string;
  summary?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  location?: string;
}

// Get access token from localStorage
const getAccessToken = (): string | null => {
  return localStorage.getItem('google_access_token');
};

// Save access token to localStorage
export const setAccessToken = (token: string): void => {
  localStorage.setItem('google_access_token', token);
};

// Clear access token
export const clearAccessToken = (): void => {
  localStorage.removeItem('google_access_token');
};

// Check if authenticated
export const isGoogleAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// Transform Google Calendar event to our format
const transformEvent = (event: GoogleEvent): CalendarEvent => {
  const isAllDay = !event.start?.dateTime;
  return {
    id: event.id,
    title: event.summary || '(제목 없음)',
    start: event.start?.dateTime || event.start?.date || '',
    end: event.end?.dateTime || event.end?.date || '',
    allDay: isAllDay,
    description: event.description,
    location: event.location
  };
};

// List events for today
export const getTodayEvents = async (): Promise<CalendarEvent[]> => {
  const token = getAccessToken();
  if (!token) {
    console.log('No Google access token');
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const response = await fetch(CALENDAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'list',
        timeMin: today.toISOString(),
        timeMax: tomorrow.toISOString()
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearAccessToken();
        console.log('Google token expired');
      }
      throw new Error('Failed to fetch events');
    }

    const data = await response.json();
    return (data.events || []).map(transformEvent);
  } catch (error) {
    console.error('Calendar API error:', error);
    return [];
  }
};

// List events for a date range
export const getEvents = async (startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
  const token = getAccessToken();
  if (!token) {
    console.log('No Google access token');
    return [];
  }

  try {
    const response = await fetch(CALENDAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'list',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString()
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearAccessToken();
      }
      throw new Error('Failed to fetch events');
    }

    const data = await response.json();
    return (data.events || []).map(transformEvent);
  } catch (error) {
    console.error('Calendar API error:', error);
    return [];
  }
};

// Add a new event
export const addEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent | null> => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(CALENDAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'add',
        event: {
          title: event.title,
          date: event.start.split('T')[0],
          time: event.start.includes('T') ? event.start.split('T')[1].substring(0, 5) : undefined,
          endTime: event.end.includes('T') ? event.end.split('T')[1].substring(0, 5) : undefined,
          allDay: event.allDay,
          description: event.description,
          location: event.location
        }
      })
    });

    if (!response.ok) throw new Error('Failed to add event');

    const data = await response.json();
    return transformEvent(data.event);
  } catch (error) {
    console.error('Failed to add event:', error);
    return null;
  }
};
