export const ROUTES = {
  HOME: '/',
  CALENDAR: '/calendar',
  WORK: '/work',
  LIFE: '/life',
  REPORT: '/report',
  CHAT: '/chat',
  SETTINGS: '/settings',
  LOGIN: '/login',
  ONBOARDING: '/onboarding',
  AUTH_CALLBACK: '/auth/callback',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
