import { usePullToRefresh } from '@/hooks/useMobileOptimizations';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { isRefreshing, pullDistance, threshold } = usePullToRefresh(onRefresh);
  
  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShow = pullDistance > 20;

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 transition-all duration-200 z-10 ${
          shouldShow ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          top: Math.min(pullDistance - 40, 20),
          transform: `translateX(-50%) rotate(${progress * 360}deg)`
        }}
      >
        <div className={`p-2 rounded-full bg-white shadow-lg ${
          isRefreshing ? 'animate-spin' : ''
        }`}>
          <RefreshCw 
            size={20} 
            className={`text-lavender-500 transition-colors ${
              progress >= 1 ? 'text-lavender-600' : ''
            }`}
          />
        </div>
      </div>

      {/* Content */}
      <div 
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
}
