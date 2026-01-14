import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Briefcase, Heart, BarChart3, Settings, Link2, HelpCircle } from 'lucide-react';
import { useNavigationStore } from '../../stores';

interface MenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  section: 'main' | 'secondary';
}

const menuItems: MenuItem[] = [
  { path: '/', icon: Home, label: '홈', section: 'main' },
  { path: '/calendar', icon: Calendar, label: '캘린더', section: 'main' },
  { path: '/work', icon: Briefcase, label: '워크OS', section: 'main' },
  { path: '/life', icon: Heart, label: '라이프OS', section: 'main' },
  { path: '/report', icon: BarChart3, label: '리포트', section: 'main' },
  { path: '/settings', icon: Settings, label: '설정', section: 'secondary' },
  { path: '/integrations', icon: Link2, label: '연동 관리', section: 'secondary' },
  { path: '/help', icon: HelpCircle, label: '도움말', section: 'secondary' },
];

interface DrawerMenuProps {
  onClose: () => void;
}

export default function DrawerMenu({ onClose }: DrawerMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { badges } = useNavigationStore();

  const handleClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const mainItems = menuItems.filter(item => item.section === 'main');
  const secondaryItems = menuItems.filter(item => item.section === 'secondary');

  const renderItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    const badge = badges[item.path.slice(1) as keyof typeof badges] || {};

    return (
      <button
        key={item.path}
        onClick={() => handleClick(item.path)}
        className={
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ' +
          (isActive ? 'bg-[#A996FF]/10 text-[#A996FF]' : 'text-[#1A1A1A] hover:bg-[#F5F5F5]')
        }
      >
        <Icon size={20} />
        <span className="flex-1 text-left font-medium">{item.label}</span>
        {badge.count && (
          <span className="px-2 py-0.5 bg-[#A996FF] text-white text-xs rounded-full">
            {badge.count}
          </span>
        )}
        {badge.isNew && (
          <span className="px-2 py-0.5 bg-[#FFD43B] text-[#1A1A1A] text-xs rounded-full font-medium">
            NEW
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto py-2">
      <div className="px-3 space-y-1">
        {mainItems.map(renderItem)}
      </div>
      
      <div className="my-4 mx-5 border-t border-[#E5E5E5]" />
      
      <div className="px-3 space-y-1">
        {secondaryItems.map(renderItem)}
      </div>
    </div>
  );
}
