// Calendar Service - Google Calendar API 연동
// Uses centralized auth service for token management

import { getGoogleToken, isGoogleConnected } from '../auth';

const CALENDAR_API_URL = '/api/calendar';
const SELECTED_CALENDARS_KEY = 'selected_calendars';
const CALENDARS_CACHE_KEY = 'calendars_cache';

export interface CalendarInfo {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  primary: boolean;
  canEdit?: boolean;
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
  calendarName?: string;
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
    return parsed;
  } catch {
    return [];
  }
}

// Save selected calendar IDs to localStorage
export function setSelectedCalendars(calendarIds: string[]): void {
  localStorage.setItem(SELECTED_CALENDARS_KEY, JSON.stringify(calendarIds));
}

// Get cached calendars
export function getCachedCalendars(): CalendarInfo[] {
  var stored = localStorage.getItem(CALENDARS_CACHE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Cache calendars
function cacheCalendars(calendars: CalendarInfo[]): void {
  localStorage.setItem(CALENDARS_CACHE_KEY, JSON.stringify(calendars));
}

// Get calendar info by ID
export function getCalendarById(calendarId: string): CalendarInfo | undefined {
  var calendars = getCachedCalendars();
  return calendars.find(function(cal) { return cal.id === calendarId; });
}

// Get editable calendars (owner or writer)
export function getEditableCalendars(): CalendarInfo[] {
  var calendars = getCachedCalendars();
  return calendars.filter(function(cal) { return cal.canEdit; });
}

// Transform Google Calendar event to our format (with calendar info)
function transformEvent(event: GoogleEvent, calendars: CalendarInfo[]): CalendarEvent {
  var isAllDay = !event.start?.dateTime;
  var calendarInfo = calendars.find(function(cal) { return cal.id === event.calendarId; });
  
  return {
    id: event.id,
    title: event.summary || '(제목 없음)',
    start: event.start?.dateTime || event.start?.date || '',
    end: event.end?.dateTime || event.end?.date || '',
    allDay: isAllDay,
    description: event.description,
    location: event.location,
    calendarId: event.calendarId,
    calendarName: calendarInfo?.summary || '',
    backgroundColor: calendarInfo?.backgroundColor || '#A996FF'
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
    var calendars = data.calendars || [];
    
    // Cache calendars
    cacheCalendars(calendars);
    
    return calendars;
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
  var cachedCalendars = getCachedCalendars();

  try {
    var requestBody = {
      action: 'list',
      timeMin: today.toISOString(),
      timeMax: tomorrow.toISOString(),
      calendarIds: selectedCalendars.length > 0 ? selectedCalendars : undefined
    };

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
    return (data.events || []).map(function(e: GoogleEvent) { 
      return transformEvent(e, cachedCalendars); 
    });
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
  var cachedCalendars = getCachedCalendars();

  // If no cached calendars, fetch them first
  if (cachedCalendars.length === 0) {
    cachedCalendars = await getCalendarList();
  }

  try {
    var requestBody = {
      action: 'list',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      calendarIds: selectedCalendars.length > 0 ? selectedCalendars : undefined
    };

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
    return (data.events || []).map(function(e: GoogleEvent) { 
      return transformEvent(e, cachedCalendars); 
    });
  } catch (error) {
    console.error('[Calendar] API error:', error);
    return [];
  }
}

// Add a new event
export async function addEvent(event: Omit<CalendarEvent, 'id'>, calendarId?: string): Promise<CalendarEvent | null> {
  var token = getGoogleToken();
  if (!token) return null;

  var cachedCalendars = getCachedCalendars();

  try {
    var response = await fetch(CALENDAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        action: 'add',
        calendarId: calendarId || 'primary',
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
    return transformEvent({ ...data.event, calendarId: calendarId || 'primary' }, cachedCalendars);
  } catch (error) {
    console.error('[Calendar] Failed to add event:', error);
    return null;
  }
}

// Update an event
export async function updateEvent(eventId: string, event: Omit<CalendarEvent, 'id'>, calendarId?: string): Promise<CalendarEvent | null> {
  var token = getGoogleToken();
  if (!token) return null;

  var cachedCalendars = getCachedCalendars();

  try {
    var response = await fetch(CALENDAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        action: 'update',
        eventId: eventId,
        calendarId: calendarId || 'primary',
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

    if (!response.ok) throw new Error('Failed to update event');

    var data = await response.json();
    return transformEvent({ ...data.event, calendarId: calendarId || 'primary' }, cachedCalendars);
  } catch (error) {
    console.error('[Calendar] Failed to update event:', error);
    return null;
  }
}

// Delete an event
export async function deleteEvent(eventId: string, calendarId?: string): Promise<boolean> {
  var token = getGoogleToken();
  if (!token) return false;

  try {
    var response = await fetch(CALENDAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        action: 'delete',
        eventId: eventId,
        calendarId: calendarId || 'primary'
      })
    });

    if (!response.ok) throw new Error('Failed to delete event');

    return true;
  } catch (error) {
    console.error('[Calendar] Failed to delete event:', error);
    return false;
  }
}
