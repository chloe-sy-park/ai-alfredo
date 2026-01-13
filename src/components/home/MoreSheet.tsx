import { X } from 'lucide-react';

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  why?: string;
  whatChanged?: string;
  tradeOff?: string;
}

export default function MoreSheet({
  isOpen,
  onClose,
  title = '판단 근거',
  why,
  whatChanged,
  tradeOff
}: MoreSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-card-lg shadow-sheet z-50 animate-slide-up max-h-[70vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-neutral-200 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-neutral-100">
          <h3 className="text-lg font-bold text-neutral-800">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {why && (
            <div>
              <p className="text-sm font-medium text-primary mb-1">💡 Why this is #1</p>
              <p className="text-sm text-neutral-600 leading-relaxed">{why}</p>
            </div>
          )}
          
          {whatChanged && (
            <div>
              <p className="text-sm font-medium text-warning mb-1">🔄 What changed today</p>
              <p className="text-sm text-neutral-600 leading-relaxed">{whatChanged}</p>
            </div>
          )}
          
          {tradeOff && (
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">⚖️ Trade-off</p>
              <p className="text-sm text-neutral-600 leading-relaxed">{tradeOff}</p>
            </div>
          )}
        </div>
        
        {/* Safe area padding */}
        <div className="h-6" />
      </div>
    </>
  );
}
