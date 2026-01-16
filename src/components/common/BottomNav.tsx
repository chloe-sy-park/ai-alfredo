import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Briefcase, Heart, MessageCircle, BarChart3 } from 'lucide-react';

// Chat을 중앙에 배치 (알프레도 핵심 기능)
const navItems = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/work', icon: Briefcase, label: '업무' },
  { path: '/chat', icon: MessageCircle, label: '대화', isCenter: true },
  { path: '/life', icon: Heart, label: '일상' },
  { path: '/report', icon: BarChart3, label: '리포트' }
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 특정 페이지에서는 네비게이션 숨기기
  const hiddenPaths = ['/onboarding', '/login', '/body-doubling', '/entry'];
  const shouldHide = hiddenPaths.some(function(path) {
    return location.pathname.startsWith(path);
  });
  
  if (shouldHide) return null;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map(function(item) {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const isCenter = 'isCenter' in item && item.isCenter;

          return (
            <button
              key={item.path}
              onClick={function() { navigate(item.path); }}
              className={[
                'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all min-w-[56px]',
                isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              ].join(' ')}
            >
              <Icon className={[
                isCenter ? 'w-6 h-6 mb-0.5' : 'w-5 h-5 mb-1',
                'transition-transform',
                isActive ? 'scale-110' : ''
              ].join(' ')} />
              <span className={[
                'text-xs transition-colors',
                isActive ? 'font-semibold' : 'font-medium'
              ].join(' ')}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;