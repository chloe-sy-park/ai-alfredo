import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Briefcase, 
  Heart, 
  BarChart3, 
  Settings, 
  Link2, 
  HelpCircle,
  X
} from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const mainMenuItems: MenuItem[] = [
    { path: '/', icon: Home, label: '홈' },
    { path: '/calendar', icon: Calendar, label: '캘린더', badge: 3 },
    { path: '/work', icon: Briefcase, label: '워크OS' },
    { path: '/life', icon: Heart, label: '라이프OS' },
    { path: '/report', icon: BarChart3, label: '리포트', badge: 'NEW' },
  ];

  const secondaryMenuItems: MenuItem[] = [
    { path: '/settings', icon: Settings, label: '설정' },
    { path: '/integrations', icon: Link2, label: '연동 관리' },
    { path: '/help', icon: HelpCircle, label: '도움말' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    
    return (
      <button
        key={item.path}
        onClick={() => handleNavigation(item.path)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
          ${isActive 
            ? 'bg-[#F5F3FF] text-[#A996FF]' 
            : 'text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <Icon className="w-5 h-5" />
        <span className="flex-1 text-left font-medium">{item.label}</span>
        {item.badge && (
          <span className={`
            px-2 py-0.5 text-xs rounded-full
            ${typeof item.badge === 'string' 
              ? 'bg-[#A996FF] text-white' 
              : 'bg-gray-100 text-gray-600'
            }
          `}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* 오버레이 */}
      <div 
        className={`
          fixed inset-0 bg-black/50 z-50 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      
      {/* 드로어 패널 */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🐧</div>
            <div>
              <h2 className="font-bold text-gray-900">AlFredo</h2>
              <p className="text-xs text-gray-500">함께한 지 14일째</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* 메인 메뉴 */}
        <div className="p-3">
          <div className="space-y-1">
            {mainMenuItems.map(renderMenuItem)}
          </div>
        </div>
        
        {/* 구분선 */}
        <div className="mx-4 border-t border-gray-100" />
        
        {/* 부가 메뉴 */}
        <div className="p-3">
          <div className="space-y-1">
            {secondaryMenuItems.map(renderMenuItem)}
          </div>
        </div>
        
        {/* 하단 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">
            AlFredo v1.0.0
          </p>
        </div>
      </div>
    </>
  );
};

export default Drawer;
