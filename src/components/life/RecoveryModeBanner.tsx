/**
 * Recovery Mode Banner
 *
 * 보호 모드 활성화 시 Life 페이지 상단에 표시되는 배너
 * - 부드러운 톤으로 현재 상태 안내
 * - 회복에 집중할 수 있도록 유도
 */

import { Shield, X } from 'lucide-react';

interface RecoveryModeBannerProps {
  onDismiss?: () => void;
  reason?: string;
  className?: string;
}

export default function RecoveryModeBanner({
  onDismiss,
  reason,
  className = ''
}: RecoveryModeBannerProps) {
  return (
    <div
      className={`rounded-xl p-4 relative ${className}`}
      style={{
        backgroundColor: 'var(--state-warning-bg)',
        borderLeft: '4px solid var(--state-warning)'
      }}
      role="status"
      aria-live="polite"
    >
      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="배너 닫기"
          className="absolute top-3 right-3 p-1 rounded-full hover:opacity-80 min-w-[32px] min-h-[32px] flex items-center justify-center"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <X size={16} />
        </button>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--state-warning)', color: 'white' }}
          aria-hidden="true"
        >
          <Shield size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 pr-6">
          <h3
            className="font-semibold text-base mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            오늘은 회복이 우선이에요
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {reason || '무리하지 않아도 괜찮아요. 필요한 것만 천천히 해요.'}
          </p>
        </div>
      </div>
    </div>
  );
}
