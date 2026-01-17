/**
 * ErrorFallbackUI - 에러 발생 시 표시되는 폴백 UI
 *
 * ADHD 친화적 설계:
 * - 간결한 메시지
 * - 명확한 다음 행동 제안
 * - 차분한 색상
 */

import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackUIProps {
  error?: Error | null;
  onRetry?: () => void;
}

export default function ErrorFallbackUI({ error, onRetry }: ErrorFallbackUIProps) {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* 아이콘 */}
        <div className="w-16 h-16 mx-auto mb-6 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>

        {/* 메시지 */}
        <h1 className="text-xl font-bold text-text-primary dark:text-white mb-2">
          앗, 문제가 생겼어요
        </h1>
        <p className="text-text-muted dark:text-gray-400 mb-6">
          일시적인 오류예요. 다시 시도해 주세요.
        </p>

        {/* 에러 상세 (개발 모드에서만) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
            <p className="text-xs font-mono text-red-500 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
          >
            <RefreshCw size={18} />
            <span>다시 시도</span>
          </button>

          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
          >
            <Home size={18} />
            <span>홈으로</span>
          </button>
        </div>

        {/* 안내 메시지 */}
        <p className="mt-8 text-sm text-text-muted dark:text-gray-500">
          문제가 계속되면 앱을 새로고침하거나
          <br />
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
    </div>
  );
}
