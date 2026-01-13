// Google Calendar/OAuth 관련 상수

// Google OAuth 설정
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '201358208682-tuujh9me9tvcdn5rsbhf86v5n4n9du9b.apps.googleusercontent.com';

// OAuth Scopes (Gmail 포함)
export const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
].join(' ');

// localStorage 키
export const CALENDAR_STORAGE_KEYS = {
  ACCESS_TOKEN: 'lifebutler_google_access_token',
  TOKEN_EXPIRY: 'lifebutler_google_token_expiry',
  EVENTS: 'lifebutler_google_events',
  USER_EMAIL: 'lifebutler_google_user_email',
};

// 이벤트 색상 맵핑
export const EVENT_COLORS = {
  1: '#7986cb',  // Lavender
  2: '#33b679',  // Sage
  3: '#8e24aa',  // Grape
  4: '#e67c73',  // Flamingo
  5: '#f6bf26',  // Banana
  6: '#f4511e',  // Tangerine
  7: '#039be5',  // Peacock
  8: '#616161',  // Graphite
  9: '#3f51b5',  // Blueberry
  10: '#0b8043', // Basil
  11: '#d50000', // Tomato
};

// 기본 색상
export const DEFAULT_EVENT_COLOR = '#4285f4';
