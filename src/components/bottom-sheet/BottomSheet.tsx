import { useEffect, type ReactNode } from 'react';
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
  showHandle = true 
}: BottomSheetProps) {
  
  // 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ESC 키
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      <SheetBackdrop isOpen={isOpen} onClose={onClose} />
      
      <div
        className={
          'fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 ' +
          'transform transition-transform duration-300 ease-out ' +
          heightClasses[height] + ' ' +
          (isOpen ? 'translate-y-0' : 'translate-y-full')
        }
      >
        {showHandle && <SheetHandle />}
        <div className="overflow-auto px-4 pb-6" style={{ maxHeight: 'calc(100% - 24px)' }}>
          {children}
        </div>
      </div>
    </>
  );
}
