// MainCardError.tsx - Error State MainCard
import { MainCardShell, OSType } from './MainCardShell';
import { AlertCircle, RefreshCw, Settings } from 'lucide-react';

export type ErrorType = 'generic' | 'permission' | 'network';

interface MainCardErrorProps {
  os: OSType;
  errorType?: ErrorType;
  onRetry: () => void;
  onSettings?: () => void;
}

// 에러 타입별 콘텐츠
const errorContent: Record<ErrorType, {
  insight: string;
  cta: string;
  followUp: string;
}> = {
  generic: {
    insight: '데이터를 불러오는 중 문제가 발생했어요.',
    cta: 'Try again',
    followUp: 'Your data is safe. This is a temporary issue.'
  },
  permission: {
    insight: '데이터에 접근하기 위해 권한이 필요해요.',
    cta: 'Review permissions',
    followUp: 'Your data is safe. We only access what you allow.'
  },
  network: {
    insight: '인터넷 연결을 확인해주세요.',
    cta: 'Try again',
    followUp: 'Your data is safe. This is a connection issue.'
  }
};

/**
 * MainCardError - 에러 상태의 MainCard
 *
 * 4블록 구조 유지:
 * A. Context: Error icon
 * B. Insight: 에러 메시지
 * C. CTA: "Try again" 또는 "Review permissions" (Gold)
 * D. Follow-up: "Your data is safe..."
 */
export function MainCardError({
  os,
  errorType = 'generic',
  onRetry,
  onSettings
}: MainCardErrorProps) {
  const content = errorContent[errorType];
  const isPermissionError = errorType === 'permission';

  return (
    <MainCardShell os={os}>
      <div className="flex flex-col gap-4 animate-fade-in">
        {/* A: Context */}
        <div className="flex items-center gap-2">
          <span className="text-state-danger">
            <AlertCircle size={16} />
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
            Something went wrong
          </span>
        </div>

        {/* B: Core Insight */}
        <p className="text-base text-text-primary dark:text-white leading-relaxed font-medium">
          {content.insight}
        </p>

        {/* C: CTA (Gold) */}
        <button
          onClick={isPermissionError && onSettings ? onSettings : onRetry}
          className="
            w-full
            flex items-center justify-between
            px-4 py-3
            rounded-xl
            bg-gold-500
            text-[#1A140B]
            font-medium
            hover:bg-gold-600
            focus:outline-none
            focus:ring-[3px]
            focus:ring-gold-500/28
            transition-all
            duration-200
            ease-out
          "
        >
          <span>{content.cta}</span>
          {isPermissionError ? <Settings size={18} /> : <RefreshCw size={18} />}
        </button>

        {/* D: Follow-up */}
        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
          {content.followUp}
        </p>
      </div>
    </MainCardShell>
  );
}

export default MainCardError;
