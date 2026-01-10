import { useAuthStore } from '@/stores/authStore';
import { Bell, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function StatusBar() {
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);

  const greeting = getGreeting(currentTime.getHours());

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        {/* 왔쪽: 인사 */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐧</span>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {greeting}, {user?.name?.split(' ')[0] || '친구'}
            </p>
          </div>
        </div>

        {/* 오른쪽: 상태 아이콘 */}
        <div className="flex items-center gap-3">
          {!isOnline && (
            <div className="flex items-center gap-1 text-amber-500">
              <WifiOff size={16} />
              <span className="text-xs">오프라인</span>
            </div>
          )}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Bell size={20} />
            {/* 알림 배지 */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-lavender-400 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}

function getGreeting(hour: number): string {
  if (hour < 6) return '새벽이에요';
  if (hour < 12) return '좋은 아침이에요';
  if (hour < 18) return '좋은 오후예요';
  return '좋은 저녁이에요';
}
