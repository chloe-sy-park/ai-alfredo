import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Briefcase, Heart, MessageCircle } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/calendar', icon: Calendar, label: '캘린더' },
  { path: '/work', icon: Briefcase, label: '업무' },
  { path: '/life', icon: Heart, label: '라이프' },
  { path: '/chat', icon: MessageCircle, label: '알프레도' }
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                isActive ? 'text-lavender-500' : 'text-gray-400'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
