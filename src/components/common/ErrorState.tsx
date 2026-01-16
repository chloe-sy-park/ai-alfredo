/**
 * ErrorState
 * PRD Component Inventory: 에러 상태 컴포넌트
 * 일관된 에러 UI와 재시도 기능 제공
 */

import { AlertCircle, WifiOff, ServerCrash, FileX, RefreshCw, Home } from 'lucide-react';

type ErrorVariant = 'default' | 'network' | 'server' | 'notfound' | 'permission';

interface ErrorStateProps {
  variant?: ErrorVariant;
  title?: string;
  description?: string;
  errorCode?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showGoHome?: boolean;
}

const variantConfig: Record<ErrorVariant, {
  icon: typeof AlertCircle;
  defaultTitle: string;
  defaultDescription: string;
  color: string;
}> = {
  default: {
    icon: AlertCircle,
    defaultTitle: '문제가 발생했어요',
    defaultDescription: '잠시 후 다시 시도해주세요',
    color: '#EF4444'
  },
  network: {
    icon: WifiOff,
    defaultTitle: '인터넷 연결을 확인해주세요',
    defaultDescription: '네트워크 연결이 불안정해요',
    color: '#F97316'
  },
  server: {
    icon: ServerCrash,
    defaultTitle: '서버에 문제가 있어요',
    defaultDescription: '잠시 후 다시 시도해주세요',
    color: '#EF4444'
  },
  notfound: {
    icon: FileX,
    defaultTitle: '페이지를 찾을 수 없어요',
    defaultDescription: '요청하신 페이지가 존재하지 않아요',
    color: '#6B7280'
  },
  permission: {
    icon: AlertCircle,
    defaultTitle: '접근 권한이 없어요',
    defaultDescription: '이 페이지에 접근할 수 없어요',
    color: '#F97316'
  }
};

export default function ErrorState({
  variant = 'default',
  title,
  description,
  errorCode,
  onRetry,
  onGoHome,
  showRetry = true,
  showGoHome = false
}: ErrorStateProps) {
  var config = variantConfig[variant];
  var IconComponent = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* 아이콘 */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: config.color + '20' }}
      >
        <IconComponent
          size={32}
          style={{ color: config.color }}
        />
      </div>

      {/* 제목 */}
      <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-white mb-2">
        {title || config.defaultTitle}
      </h3>

      {/* 설명 */}
      <p className="text-sm text-[#999999] dark:text-gray-400 max-w-[280px] leading-relaxed mb-2">
        {description || config.defaultDescription}
      </p>

      {/* 에러 코드 */}
      {errorCode && (
        <p className="text-xs text-[#CCCCCC] dark:text-gray-500 font-mono mb-4">
          오류 코드: {errorCode}
        </p>
      )}

      {/* 액션 버튼들 */}
      <div className="flex gap-3 mt-4">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-3 bg-[#A996FF] text-white rounded-xl font-medium text-sm hover:bg-[#9685E6] transition-colors min-h-[44px]"
          >
            <RefreshCw size={16} />
            다시 시도
          </button>
        )}

        {showGoHome && onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 px-5 py-3 bg-[#F5F5F5] dark:bg-gray-700 text-[#666666] dark:text-gray-300 rounded-xl font-medium text-sm hover:bg-[#E5E5E5] dark:hover:bg-gray-600 transition-colors min-h-[44px]"
          >
            <Home size={16} />
            홈으로
          </button>
        )}
      </div>
    </div>
  );
}

// Compact inline error for forms/inputs
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-500 mt-1">
      <AlertCircle size={14} />
      <span>{message}</span>
    </div>
  );
}

// Error banner for top of page
export function ErrorBanner({
  message,
  onDismiss
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-500 hover:text-red-700 dark:hover:text-red-300 p-1"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// Toast-style error notification
export function ErrorToast({
  message,
  onRetry,
  onDismiss
}: {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <div className="bg-[#1A1A1A] dark:bg-white rounded-xl p-4 shadow-lg flex items-center gap-3 max-w-sm">
      <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
      <p className="text-sm text-white dark:text-[#1A1A1A] flex-1">{message}</p>
      <div className="flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-[#A996FF] text-sm font-medium hover:underline"
          >
            재시도
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-[#999999] text-sm"
          >
            닫기
          </button>
        )}
      </div>
    </div>
  );
}
