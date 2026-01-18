/**
 * Sync Responsibility Badge
 *
 * Part F: Offline Trust UX
 *
 * 침묵 우선 원칙:
 * - 동기화 성공: UI 변화 없음
 * - 동기화 실패 (3회 미만): 조용히 재시도
 * - 동기화 실패 (3회 이상): 최소한의 알림
 * - 오프라인 전환: 1회만 토스트 표시
 */

import { useState, useEffect } from 'react';
import { CloudOff, Loader2 } from 'lucide-react';
import { getPendingCount, getFailedCount } from '../../services/intent/intentQueueService';

// ============================================================
// Types
// ============================================================

type SyncStatus = 'synced' | 'pending' | 'offline' | 'failed';

interface SyncResponsibilityBadgeProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

// ============================================================
// Hook: useSyncStatus
// ============================================================

function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const updateStatus = async () => {
      if (!isOnline) {
        setStatus('offline');
        return;
      }

      const pending = await getPendingCount();
      const failed = await getFailedCount();

      setPendingCount(pending);

      if (failed > 0) {
        setStatus('failed');
      } else if (pending > 0) {
        setStatus('pending');
      } else {
        setStatus('synced');
      }
    };

    updateStatus();

    // 주기적 업데이트
    const interval = setInterval(updateStatus, 5000);

    // Online/Offline 이벤트
    const handleOnline = () => {
      setIsOnline(true);
      updateStatus();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return { status, pendingCount, isOnline };
}

// ============================================================
// Component
// ============================================================

export function SyncResponsibilityBadge({
  className = '',
  showLabel = true,
  compact = false
}: SyncResponsibilityBadgeProps) {
  const { status } = useSyncStatus();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // synced 상태에서는 표시 안 함
    if (status === 'synced') {
      setVisible(false);
      return;
    }

    // pending 상태는 3초 후 숨김
    if (status === 'pending') {
      setVisible(true);
      const timeout = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timeout);
    }

    // offline, failed 상태는 계속 표시
    setVisible(true);
  }, [status]);

  // 표시 안 함
  if (!visible) return null;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full text-xs
        transition-all duration-300 animate-fade-in
        ${getStatusStyle(status)}
        ${compact ? 'px-2 py-1' : ''}
        ${className}
      `}
    >
      {/* 아이콘 */}
      {status === 'pending' && (
        <Loader2 size={compact ? 12 : 14} className="animate-spin" />
      )}
      {status === 'offline' && <CloudOff size={compact ? 12 : 14} />}
      {status === 'failed' && <CloudOff size={compact ? 12 : 14} />}

      {/* 라벨 */}
      {showLabel && (
        <span className="whitespace-nowrap">
          {getStatusLabel(status)}
        </span>
      )}
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function getStatusStyle(status: SyncStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-[#F0EDFF] text-[#7C3AED]';
    case 'offline':
      return 'bg-[#FFF3E0] text-[#E65100]';
    case 'failed':
      return 'bg-[#FFEBEE] text-[#C62828]';
    default:
      return 'bg-[#E8F5E9] text-[#2E7D32]';
  }
}

function getStatusLabel(status: SyncStatus): string {
  switch (status) {
    case 'pending':
      return '저장 중...';
    case 'offline':
      return '오프라인 - 알프레도가 기억하고 있어요';
    case 'failed':
      return '동기화 실패 - 다시 시도할게요';
    default:
      return '동기화됨';
  }
}

// ============================================================
// Offline Indicator (Minimal)
// ============================================================

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showToast, setShowToast] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setHasShownToast(false);  // 다음 오프라인 때 다시 토스트 표시
    };

    const handleOffline = () => {
      setIsOnline(false);
      // 첫 오프라인 전환 시에만 토스트 표시
      if (!hasShownToast) {
        setShowToast(true);
        setHasShownToast(true);
        // 3초 후 숨김
        setTimeout(() => setShowToast(false), 3000);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasShownToast]);

  // 온라인이면 렌더링 안 함
  if (isOnline) return null;

  return (
    <>
      {/* 상단 표시줄 */}
      <div
        className={`
          fixed top-0 left-0 right-0 z-50 h-1
          bg-gradient-to-r from-[#FFC107] via-[#FF9800] to-[#FFC107]
          animate-pulse
          ${className}
        `}
      />

      {/* 토스트 (1회만) */}
      {showToast && (
        <div
          className="
            fixed bottom-20 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-[#1A1A1A] text-white text-sm shadow-lg
            animate-slide-up
          "
        >
          <CloudOff size={16} />
          <span>오프라인 상태예요. 기록은 계속 저장돼요.</span>
        </div>
      )}
    </>
  );
}

// ============================================================
// Exports
// ============================================================

export default SyncResponsibilityBadge;
