import { useEffect } from 'react';
import { useDrawerStore } from '../../stores';
import DrawerOverlay from './DrawerOverlay';
import DrawerHeader from './DrawerHeader';
import DrawerMenu from './DrawerMenu';

export default function Drawer() {
  const { isOpen, close } = useDrawerStore();

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // 열릴 때 스크롤 방지
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
        <div className="flex flex-col h-full safe-area-top safe-area-bottom">
          <DrawerHeader onClose={close} />
          <DrawerMenu onClose={close} />
        </div>
      </div>
    </>
  );
}
