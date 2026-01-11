import { NavLink } from 'react-router-dom';
import { Home, Briefcase, Heart, MessageCircle, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: '홈' },
  { to: '/work', icon: Briefcase, label: '워크' },
  { to: '/life', icon: Heart, label: '라이프' },
  { to: '/chat', icon: MessageCircle, label: '채팅' },
  { to: '/settings', icon: Settings, label: '설정' }
];

export default function BottomNav() {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[56px] transition-all duration-200 ${
                isActive
                  ? 'text-lavender-500 scale-105'
                  : 'text-gray-400 active:text-gray-600 active:scale-95'
              }`
            }
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? 'bg-lavender-100' : ''
                }`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-xs mt-0.5 font-medium transition-all ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
