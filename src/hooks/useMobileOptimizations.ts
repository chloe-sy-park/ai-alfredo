import { useEffect, useState, useCallback } from 'react';

/**
 * 모바일 최적화 훅
 * - 키보드 높이 감지
 * - 오프라인 상태 감지
 * - Pull-to-refresh 지원
 * - 화면 방향 감지
 */
export function useMobileOptimizations() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  // 키보드 높이 감지
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const diff = window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(diff > 100 ? diff : 0); // 100px 이상이면 키보드
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  // 온라인/오프라인 감지
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

  // 화면 방향 감지
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  return {
    keyboardHeight,
    isKeyboardOpen: keyboardHeight > 0,
    isOnline,
    isOffline: !isOnline,
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
}

/**
 * Pull-to-Refresh 훅
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const THRESHOLD = 80; // 새로고침 트리거 거리

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      const touch = e.touches[0];
      (e.target as HTMLElement).dataset.startY = String(touch.clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const startY = Number((e.target as HTMLElement).dataset.startY);
    if (!startY || window.scrollY > 0) return;

    const touch = e.touches[0];
    const diff = touch.clientY - startY;
    
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, THRESHOLD * 1.5));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isRefreshing, pullDistance, threshold: THRESHOLD };
}

/**
 * Haptic Feedback 훅 (iOS/Android)
 */
export function useHapticFeedback() {
  const trigger = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    // iOS Haptic (if available)
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  return { trigger };
}
