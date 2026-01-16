import { Menu, Bell } from 'lucide-react';
import { useDrawerStore } from '../../stores';
import { useNotificationStore } from '../../stores/notificationStore';

interface PageHeaderProps {
  title?: string;
  showLogo?: boolean;
  showNotification?: boolean;
}

export default function PageHeader({
  title,
  showLogo = true,
  showNotification = true
}: PageHeaderProps) {
  const { open } = useDrawerStore();
  const { toggle: toggleNotification, unreadCount } = useNotificationStore();

  return (
    <header className="sticky top-0 z-30 bg-[#F5F5F5] safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo or Title */}
        <div className="flex items-center gap-2">
          {showLogo ? (
            <>
              <span className="text-xl">🐧</span>
              <span className="font-semibold text-[#1A1A1A]">AlFredo</span>
            </>
          ) : (
            <span className="font-semibold text-[#1A1A1A]">{title}</span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {showNotification && (
            <button
              onClick={toggleNotification}
              className="relative w-9 h-9 flex items-center justify-center text-[#666666] hover:bg-[#E5E5E5] rounded-full transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#A996FF] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={open}
            className="w-9 h-9 flex items-center justify-center text-[#666666] hover:bg-[#E5E5E5] rounded-full transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
