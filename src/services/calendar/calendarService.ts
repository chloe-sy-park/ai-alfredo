// Calendar Service - Google Calendar API 연동
// Uses centralized auth service for token management

import { getGoogleToken, isGoogleConnected } from '../auth';

const CALENDAR_API_URL = '/api/calendar';
const SELECTED_CALENDARS_KEY = 'selected_calendars';

export interface CalendarInfo {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  primary: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  calendarId?: string;
  backgroundColor?: string;
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
  calendarId?: string;
}

// Re-export auth check for convenience
export { isGoogleConnected as isGoogleAuthenticated };

// Get selected calendar IDs from localStorage
export function getSelectedCalendars(): string[] {
  var stored = localStorage.getItem(SELECTED_CALENDARS_KEY);
  if (!stored) return [];
  try {
    var parsed = JSON.parse(stored);
    console.log('[Calendar] Selected calendars from storage:', parsed);
    return parsed;
  } catch {
    return [];
  }
}

// Save selected calendar IDs to localStorage
export function setSelectedCalendars(calendarIds: string[]): void {
  console.log('[Calendar] Saving selected calendars:', calendarIds);
  localStorage.setItem(SELECTED_CALENDARS_KEY, JSON.stringify(calendarIds));
}

// Transform Google Calendar event to our format
function transformEvent(event: GoogleEvent): CalendarEvent {
  var isAllDay = !event.start?.dateTime;
  return {
    id: event.id,
    title: event.summary || '(제목 없음)',
    start: event.start?.dateTime || event.start?.date || '',
    end: event.end?.dateTime || event.end?.date || '',
    allDay: isAllDay,
    description: event.description,
    location: event.location,
    calendarId: event.calendarId
  };
}

// Get list of calendars
export async function getCalendarList(): Promise<CalendarInfo[]> {
  var token = getGoogleToken();
  if (!token) {
    console.log('[Calendar] No Google access token');
    return [];
  }

  try {
    var response = await fetch(CALENDAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        action: 'listCalendars'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch calendars');
    }

    var data = await response.json();
    console.log('[Calendar] Fetched calendar list:', data.calendars);
    return data.calendars || [];
  } catch (error) {
    console.error('[Calendar] Calendar list API error:', error);
    return [];
  }
}

// List events for today
export async function getTodayEvents(): Promise<CalendarEvent[]> {
  var token = getGoogleToken();
  if (!token) {
    console.log('[Calendar] No Google access token');
    return [];
  }

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  var selectedCalendars = getSelectedCalendars();

  try {
    var requestBody = {
      action: 'list',
      timeMin: today.toISOString(),
      timeMax: tomorrow.toISOString(),
      calendarIds: selectedCalendars.length > 0 ? selectedCalendars : undefined
    };
    console.log('[Calendar] Fetching today events with:', requestBody);

    var response = await fetch(CALENDAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('[Calendar] Google token expired');
      }
      throw new Error('Failed to fetch events');
    }

    var data = await response.json();
    console.log('[Calendar] Today events response:', data.events?.length, 'events');
    return (data.events || []).map(transformEvent);
  } catch (error) {
    console.error('[Calendar] API error:', error);
    return [];
  }
}

// List events for a date range
export async function getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
  var token = getGoogleToken();
  if (!token) {
    console.log('[Calendar] No Google access token');
    return [];
  }

  var selectedCalendars = getSelectedCalendars();

  try {
    var requestBody = {
      action: 'list',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      calendarIds: selectedCalendars.length > 0 ? selectedCalendars : undefined
    };
    console.log('[Calendar] Fetching events with:', requestBody);

    var response = await fetch(CALENDAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('[Calendar] Google token expired');
      }
      throw new Error('Failed to fetch events');
    }

    var data = await response.json();
    console.log('[Calendar] Events response:', data.events?.length, 'events');
    return (data.events || []).map(transformEvent);
  } catch (error) {
    console.error('[Calendar] API error:', error);
    return [];
  }
}

// Add a new event
export async function addEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent | null> {
  var token = getGoogleToken();
  if (!token) return null;

  try {
    var response = await fetch(CALENDAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
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

    var data = await response.json();
    return transformEvent(data.event);
  } catch (error) {
    console.error('[Calendar] Failed to add event:', error);
    return null;
  }
}
