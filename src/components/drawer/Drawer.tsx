import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useDrawerStore } from '../../stores';
import { DRAWER_MAIN_MENU, DRAWER_SECONDARY_MENU } from '../../constants';
import DrawerOverlay from './DrawerOverlay';
import DrawerHeader from './DrawerHeader';
import DrawerMenu from './DrawerMenu';

export default function Drawer() {
  const { isOpen, close } = useDrawerStore();

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, close]);

  // 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <DrawerOverlay isOpen={isOpen} onClose={close} />
      
      <div
        className={
          'fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl ' +
          'transform transition-transform duration-300 ease-out ' +
          (isOpen ? 'translate-x-0' : 'translate-x-full')
        }
      >
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#999999] hover:text-[#666666]"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <DrawerHeader daysWithAlfredo={14} />

        {/* Main Menu */}
        <DrawerMenu items={DRAWER_MAIN_MENU} onItemClick={close} />

        {/* Divider */}
        <div className="mx-6 border-t border-[#E5E5E5]" />

        {/* Secondary Menu */}
        <DrawerMenu items={DRAWER_SECONDARY_MENU} onItemClick={close} />
      </div>
    </>
  );
}
