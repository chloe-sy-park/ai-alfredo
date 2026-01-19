// MainCardOffline.tsx - Offline State MainCard
import { MainCardShell, OSType } from './MainCardShell';
import { WifiOff, Eye, RefreshCw } from 'lucide-react';

interface MainCardOfflineProps {
  os: OSType;
  hasCache: boolean;
  lastUpdated?: string; // ISO timestamp
  onViewCache?: () => void;
  onRetry: () => void;
}

/**
 * MainCardOffline - 오프라인 상태의 MainCard
 *
 * 4블록 구조 유지:
 * A. Context: Offline icon
 * B. Insight: 오프라인 메시지
 * C. CTA: "View last update" (캐시 있을 때) 또는 "Check connection" (Gold)
 * D. Follow-up: last updated timestamp (캐시 있을 때만)
 */
export function MainCardOffline({
  os,
  hasCache,
  lastUpdated,
  onViewCache,
  onRetry
}: MainCardOfflineProps) {
  // 마지막 업데이트 시간 포맷
  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}분 전에 업데이트됨`;
    if (diffHours < 24) return `${diffHours}시간 전에 업데이트됨`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) + '에 업데이트됨';
  };

  return (
    <MainCardShell os={os}>
      <div className="flex flex-col gap-4 animate-fade-in">
        {/* A: Context */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">
            <WifiOff size={16} />
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
            Offline
          </span>
        </div>

        {/* B: Core Insight */}
        <p className="text-base text-text-primary dark:text-white leading-relaxed font-medium">
          {hasCache
            ? '오프라인 상태예요. 마지막으로 저장된 데이터를 볼 수 있어요.'
            : '인터넷에 연결되어 있지 않아요. 연결을 확인해주세요.'}
        </p>

        {/* C: CTA (Gold) */}
        <button
          onClick={hasCache && onViewCache ? onViewCache : onRetry}
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
          <span>{hasCache ? 'View last update' : 'Check connection'}</span>
          {hasCache ? <Eye size={18} /> : <RefreshCw size={18} />}
        </button>

        {/* D: Follow-up (캐시 있고 timestamp 있을 때만) */}
        {hasCache && lastUpdated && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
            {formatLastUpdated(lastUpdated)}
          </p>
        )}
      </div>
    </MainCardShell>
  );
}

export default MainCardOffline;
