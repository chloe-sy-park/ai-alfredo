import { Menu, Bell } from 'lucide-react';
import { useDrawerStore } from '../../stores';
import { useNotificationStore } from '../../stores/notificationStore';
import { SyncStatusIndicator } from '../common/SyncStatusIndicator';

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
    <header className="sticky top-0 z-30 bg-[#F5F5F5] dark:bg-neutral-900 safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo or Title */}
        <div className="flex items-center gap-2">
          {showLogo ? (
            <>
              <span className="text-xl">🐧</span>
              <span className="font-semibold text-[#1A1A1A] dark:text-white">AlFredo</span>
            </>
          ) : (
            <span className="font-semibold text-[#1A1A1A] dark:text-white">{title}</span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <SyncStatusIndicator size="sm" />
          {showNotification && (
            <button
              onClick={toggleNotification}
              className="relative w-11 h-11 flex items-center justify-center text-[#666666] dark:text-neutral-400 hover:bg-[#E5E5E5] dark:hover:bg-neutral-800 rounded-full transition-colors touch-target"
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
            className="w-11 h-11 flex items-center justify-center text-[#666666] dark:text-neutral-400 hover:bg-[#E5E5E5] dark:hover:bg-neutral-800 rounded-full transition-colors touch-target"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
