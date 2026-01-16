/**
 * Error Recovery UI 컴포넌트
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, X, WifiOff, CheckCircle } from 'lucide-react';
import {
  FriendlyError,
  ErrorSeverity
} from '../../services/error/types';
import {
  onError,
  createRecoveryOptions,
  getErrorComfortMessage,
  getRecoverySuccessMessage
} from '../../services/error/errorService';

/**
 * 에러 토스트
 */
interface ErrorToastProps {
  error: FriendlyError;
  onDismiss: () => void;
}

export function ErrorToast({ error, onDismiss }: ErrorToastProps) {
  const [recovering] = useState(false);
  const options = createRecoveryOptions(error);

  const severityColors: Record<ErrorSeverity, string> = {
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
    critical: 'bg-red-100 border-red-300'
  };

  const severityIcons: Record<ErrorSeverity, React.ReactNode> = {
    info: <AlertCircle className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    critical: <WifiOff className="w-5 h-5 text-red-600" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`p-4 rounded-xl border shadow-lg ${severityColors[error.severity]} max-w-sm`}
    >
      <div className="flex items-start gap-3">
        {severityIcons[error.severity]}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{error.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{error.message}</p>
          {error.suggestion && (
            <p className="text-xs text-gray-500 mt-2">{error.suggestion}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {options.length > 0 && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
          {options.slice(0, 2).map(option => (
            <button
              key={option.id}
              onClick={() => option.action()}
              disabled={recovering}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                option.isPrimary
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              } ${recovering ? 'opacity-50' : ''}`}
            >
              {recovering && option.id === 'retry' ? (
                <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                option.label
              )}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/**
 * 에러 컨테이너 (전역)
 */
export function ErrorContainer() {
  const [errors, setErrors] = useState<FriendlyError[]>([]);

  useEffect(() => {
    const unsubscribe = onError((error) => {
      setErrors(prev => [...prev, error]);
    });
    return unsubscribe;
  }, []);

  const handleDismiss = (errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {errors.slice(-3).map(error => (
          <ErrorToast
            key={error.id}
            error={error}
            onDismiss={() => handleDismiss(error.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * 에러 바운더리 폴백 UI
 */
interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const comfortMessage = getErrorComfortMessage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          문제가 생겼어요
        </h1>

        <p className="text-gray-600 mb-4">
          {comfortMessage}
        </p>

        {error && (
          <p className="text-xs text-gray-400 mb-6 font-mono bg-gray-50 p-2 rounded">
            {error.message}
          </p>
        )}

        <div className="space-y-2">
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
            >
              다시 시도
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
          >
            새로고침
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 네트워크 상태 배너
 */
export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRecovered, setShowRecovered] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRecovered(true);
      setTimeout(() => setShowRecovered(false), 3000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRecovered) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-0 left-0 right-0 z-50 p-3 text-center text-sm ${
          isOnline
            ? 'bg-green-500 text-white'
            : 'bg-yellow-500 text-white'
        }`}
      >
        {isOnline ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {getRecoverySuccessMessage()}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            인터넷 연결이 끊겼어요
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * 로딩 실패 리트라이
 */
interface RetryLoadingProps {
  onRetry: () => void;
  message?: string;
}

export function RetryLoading({ onRetry, message }: RetryLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-600 mb-4">
        {message || '데이터를 불러올 수 없어요'}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
      >
        <RefreshCw className="w-4 h-4" />
        다시 시도
      </button>
    </div>
  );
}
