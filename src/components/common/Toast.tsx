import { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type']) => void;
}

var ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  var [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(message: string, type?: Toast['type']) {
    var toastType = type || 'info';
    var id = Date.now();
    setToasts(function(prev) { return prev.concat([{ id: id, message: message, type: toastType }]); });
    setTimeout(function() {
      setToasts(function(prev) { return prev.filter(function(t) { return t.id !== id; }); });
    }, 3000);
  }

  // 라이트모드 색상
  function getToastStyle(type: Toast['type']): string {
    if (type === 'success') return 'bg-[#4ADE80] text-white';
    if (type === 'error') return 'bg-[#EF4444] text-white';
    return 'bg-[#1A1A1A] text-white'; // info
  }

  return (
    <ToastContext.Provider value={{ showToast: showToast }}>
      {children}
      <div className="fixed top-4 left-4 right-4 z-50 space-y-2 max-w-[640px] mx-auto">
        {toasts.map(function(toast) {
          return (
            <div
              key={toast.id}
              className={'p-4 rounded-xl shadow-lg text-sm font-medium animate-fade-in ' + getToastStyle(toast.type)}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  var context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
