import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Briefcase, Heart, MessageCircle } from 'lucide-react';

var navItems = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/calendar', icon: Calendar, label: '캘린더' },
  { path: '/work', icon: Briefcase, label: '업무' },
  { path: '/life', icon: Heart, label: '라이프' },
  { path: '/chat', icon: MessageCircle, label: '알프레도' }
];

export default function BottomNav() {
  var location = useLocation();
  var navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map(function(item) {
          var isActive = location.pathname === item.path;
          var Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={function() { navigate(item.path); }}
              className={
                'flex flex-col items-center justify-center min-w-[56px] h-full transition-colors ' +
                (isActive ? 'text-[#A996FF]' : 'text-[#999999]')
              }
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={'text-[10px] mt-1 font-medium ' + (isActive ? 'text-[#A996FF]' : 'text-[#999999]')}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
