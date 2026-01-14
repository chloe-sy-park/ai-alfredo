import { Home, Calendar, Briefcase, Heart, BarChart3, Settings, Link2, HelpCircle } from 'lucide-react';
import { ROUTES } from './routes';

export interface MenuItem {
  path: string;
  icon: typeof Home;
  label: string;
  labelEn: string;
}

// 드로어 메인 메뉴
export const DRAWER_MAIN_MENU: MenuItem[] = [
  { path: ROUTES.HOME, icon: Home, label: '홈', labelEn: 'Home' },
  { path: ROUTES.CALENDAR, icon: Calendar, label: '캘린더', labelEn: 'Calendar' },
  { path: ROUTES.WORK, icon: Briefcase, label: '워크OS', labelEn: 'Work OS' },
  { path: ROUTES.LIFE, icon: Heart, label: '라이프OS', labelEn: 'Life OS' },
  { path: ROUTES.REPORT, icon: BarChart3, label: '리포트', labelEn: 'Report' },
];

// 드로어 하단 메뉴
export const DRAWER_SECONDARY_MENU: MenuItem[] = [
  { path: ROUTES.SETTINGS, icon: Settings, label: '설정', labelEn: 'Settings' },
  { path: '/integrations', icon: Link2, label: '연동 관리', labelEn: 'Integrations' },
  { path: '/help', icon: HelpCircle, label: '도움말', labelEn: 'Help' },
];
