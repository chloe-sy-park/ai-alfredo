import { useEffect, ReactNode } from 'react';
import SheetBackdrop from './SheetBackdrop';
import SheetHandle from './SheetHandle';

type SheetHeight = 'small' | 'half' | 'full';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  height?: SheetHeight;
  children: ReactNode;
  showHandle?: boolean;
}

const heightClasses: Record<SheetHeight, string> = {
  small: 'max-h-[30vh]',
  half: 'max-h-[50vh]',
  full: 'max-h-[90vh]',
};

export default function BottomSheet({
  isOpen,
  onClose,
  height = 'half',
  children,
  showHandle = true,
}: BottomSheetProps) {
  
  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      <SheetBackdrop isOpen={isOpen} onClose={onClose} />
      
      <div
        className={
          'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl ' +
          'transform transition-transform duration-300 ease-out ' +
          heightClasses[height] + ' ' +
          (isOpen ? 'translate-y-0' : 'translate-y-full')
        }
      >
        {showHandle && <SheetHandle />}
        <div className="overflow-y-auto px-4 pb-6 safe-area-bottom">
          {children}
        </div>
      </div>
    </>
  );
}
