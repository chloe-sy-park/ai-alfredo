import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ 
  message, 
  type = 'info', 
  duration = 3000,
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 애니메이션 후 제거
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const configs = {
    success: {
      icon: <CheckCircle size={18} />,
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    },
    error: {
      icon: <AlertCircle size={18} />,
      bgColor: 'bg-red-500',
      textColor: 'text-white'
    },
    info: {
      icon: <Info size={18} />,
      bgColor: 'bg-lavender-500',
      textColor: 'text-white'
    }
  };

  const config = configs[type];

  return (
    <div 
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-50
        ${config.bgColor} ${config.textColor}
        px-4 py-3 rounded-xl shadow-lg
        flex items-center gap-3
        transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {config.icon}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => { setIsVisible(false); onClose(); }} className="ml-2">
        <X size={16} />
      </button>
    </div>
  );
}

// Toast 매니저 (Context로 사용)
import { createContext, useContext, useCallback, ReactNode } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
