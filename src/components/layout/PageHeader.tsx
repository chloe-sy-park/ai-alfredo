import { Menu, Bell } from 'lucide-react';
import { useDrawerStore } from '../../stores';

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
            <button className="w-9 h-9 flex items-center justify-center text-[#666666]">
              <Bell size={20} />
            </button>
          )}
          <button 
            onClick={open}
            className="w-9 h-9 flex items-center justify-center text-[#666666]"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
