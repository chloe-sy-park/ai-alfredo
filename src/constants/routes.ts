export const ROUTES = {
  HOME: '/',
  CALENDAR: '/calendar',
  WORK: '/work',
  LIFE: '/life',
  FINANCE: '/finance',
  REPORT: '/report',
  CHAT: '/chat',
  SETTINGS: '/settings',
  LOGIN: '/login',
  ONBOARDING: '/onboarding',
  AUTH_CALLBACK: '/auth/callback',
  AUTH_OUTLOOK_CALLBACK: '/auth/outlook/callback',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
