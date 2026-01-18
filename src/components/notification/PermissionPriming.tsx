/**
 * PermissionPriming.tsx
 * 푸시 알림 권한 요청 프라이밍 UI
 *
 * 알프레도 철학: "먼저 다가감" - 적절한 타이밍에 친근하게 알림 권한 요청
 * - 강요하지 않고 가치를 설명
 * - 거절해도 다시 묻지 않음 (존중)
 * - 적절한 타이밍에 표시 (온보딩 후, 긍정적 상호작용 후)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Sun, Coffee, Calendar } from 'lucide-react';
import { usePushNotification } from '../../hooks/usePushNotification';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// === 프라이밍 상태 스토어 ===
interface PrimingStore {
  dismissed: boolean;
  dismissedAt: string | null;
  shownCount: number;
  lastShownAt: string | null;
  setDismissed: (dismissed: boolean) => void;
  incrementShown: () => void;
  shouldShow: () => boolean;
}

export const usePrimingStore = create<PrimingStore>()(
  persist(
    (set, get) => ({
      dismissed: false,
      dismissedAt: null,
      shownCount: 0,
      lastShownAt: null,

      setDismissed: (dismissed) => {
        set({
          dismissed,
          dismissedAt: dismissed ? new Date().toISOString() : null
        });
      },

      incrementShown: () => {
        set({
          shownCount: get().shownCount + 1,
          lastShownAt: new Date().toISOString()
        });
      },

      shouldShow: () => {
        const state = get();

        // 이미 거절했으면 표시 안 함
        if (state.dismissed) return false;

        // 3번 이상 봤으면 표시 안 함
        if (state.shownCount >= 3) return false;

        // 마지막으로 본 지 1일 이내면 표시 안 함
        if (state.lastShownAt) {
          const lastShown = new Date(state.lastShownAt);
          const daysSince = (Date.now() - lastShown.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince < 1) return false;
        }

        return true;
      }
    }),
    {
      name: 'alfredo-notification-priming'
    }
  )
);

// === 프라이밍 컴포넌트 ===
interface PermissionPrimingProps {
  trigger?: 'auto' | 'manual';
  onComplete?: (granted: boolean) => void;
}

export function PermissionPriming({
  trigger = 'auto',
  onComplete
}: PermissionPrimingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { permission, isSupported, subscribe, isLoading } = usePushNotification();
  const { dismissed, setDismissed, incrementShown, shouldShow } = usePrimingStore();

  // 자동 트리거: 조건 충족 시 표시
  useEffect(() => {
    if (trigger !== 'auto') return;

    // 이미 권한이 있거나 지원 안 하면 표시 안 함
    if (permission === 'granted' || permission === 'denied' || !isSupported) {
      return;
    }

    // 조건 체크
    if (!shouldShow()) return;

    // 3초 후 표시 (사용자가 안정화된 후)
    const timeout = setTimeout(() => {
      setIsVisible(true);
      incrementShown();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [trigger, permission, isSupported, shouldShow, incrementShown]);

  // 권한이 이미 결정됐거나 지원 안 하면 렌더링 안 함
  if (permission === 'granted' || permission === 'denied' || !isSupported) {
    return null;
  }

  const handleEnable = async () => {
    const success = await subscribe();
    setIsVisible(false);
    onComplete?.(success);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    onComplete?.(false);
  };

  const handleLater = () => {
    setIsVisible(false);
    // dismissed는 설정하지 않음 - 나중에 다시 보여줌
    onComplete?.(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
          onClick={handleLater}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-t-3xl p-6 safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={handleLater}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100"
            >
              <X size={20} />
            </button>

            {/* 알프레도 아바타 */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                <img
                  src="/assets/alfredo/avatar/alfredo-avatar-64.png"
                  alt="알프레도"
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-4xl">🎩</span>'; }}
                />
              </div>
            </div>

            {/* 제목 */}
            <h2 className="text-xl font-bold text-center text-neutral-900 mb-2">
              알프레도가 먼저 다가갈게요
            </h2>
            <p className="text-center text-neutral-600 text-sm mb-6">
              알림을 켜면 중요한 순간에 먼저 챙겨드릴 수 있어요
            </p>

            {/* 혜택 리스트 */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sun size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">아침 브리핑</p>
                  <p className="text-xs text-neutral-500">하루 시작 전 오늘 일정 정리</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">미팅 리마인더</p>
                  <p className="text-xs text-neutral-500">10분 전 미리 알림</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Coffee size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">휴식 알림</p>
                  <p className="text-xs text-neutral-500">집중 시간 후 휴식 권유</p>
                </div>
              </div>
            </div>

            {/* 버튼들 */}
            <div className="space-y-2">
              <button
                onClick={handleEnable}
                disabled={isLoading}
                className={`
                  w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2
                  ${isLoading
                    ? 'bg-neutral-200 text-neutral-400'
                    : 'bg-[#A996FF] text-white hover:bg-[#8B7EE0]'
                  }
                  transition-colors
                `}
              >
                <Bell size={18} />
                {isLoading ? '설정 중...' : '알림 켜기'}
              </button>

              <button
                onClick={handleDismiss}
                className="w-full py-3 text-neutral-500 text-sm hover:text-neutral-700"
              >
                괜찮아요, 다시 묻지 마세요
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// === 프로그래매틱 트리거 함수 ===
export function showNotificationPriming(): void {
  // 이 함수는 적절한 타이밍에 호출됨 (예: 태스크 5개 완료 후)
  const store = usePrimingStore.getState();
  if (store.shouldShow()) {
    // 트리거 이벤트 발생 - 컴포넌트가 이를 감지
    window.dispatchEvent(new CustomEvent('alfredo-show-notification-priming'));
  }
}

export default PermissionPriming;
