import { WifiOff } from 'lucide-react';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';

export default function OfflineBanner() {
  const { isOffline } = useMobileOptimizations();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white py-2 px-4 flex items-center justify-center gap-2 z-50 safe-area-top animate-slideDown">
      <WifiOff size={16} />
      <span className="text-sm font-medium">오프라인 상태예요</span>
    </div>
  );
}
