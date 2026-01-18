import { useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useDrawerStore } from '../../stores';
import { useNotificationStore } from '../../stores/notificationStore';
import { SyncStatusIndicator } from '../common/SyncStatusIndicator';
import {
  ConditionLevel,
  conditionConfig,
  getTodayCondition
} from '../../services/condition';

interface PageHeaderProps {
  title?: string;
  showLogo?: boolean;
  showNotification?: boolean;
  // 컨디션 관련
  showCondition?: boolean;
  onConditionClick?: () => void; // 컨디션 클릭 시 DailyCheckInModal 열기
}

export default function PageHeader({
  title,
  showLogo = true,
  showNotification = true,
  showCondition = false,
  onConditionClick
}: PageHeaderProps) {
  const { open } = useDrawerStore();
  const { toggle: toggleNotification, unreadCount } = useNotificationStore();

  const [currentCondition] = useState<ConditionLevel | null>(() => {
    const saved = getTodayCondition();
    return saved?.level || null;
  });

  // 오늘 감정 가져오기
  const getTodayEmotion = (): string | null => {
    const today = new Date().toDateString();
    return localStorage.getItem(`alfredo_emotion_${today}`);
  };

  const todayEmotion = getTodayEmotion();

  // 감정 이모지 매핑
  const emotionEmojis: Record<string, string> = {
    happy: '😊',
    calm: '😌',
    excited: '🤩',
    tired: '😴',
    stressed: '😰',
    sad: '😢',
    anxious: '😟',
    neutral: '😐',
  };

  return (
    <header
      className="sticky top-0 z-30 safe-area-top"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="flex items-center justify-between px-4 py-2 gap-2">
        {/* Left: Logo or Title */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showLogo ? (
            <>
              <div className="w-7 h-7 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                <img
                  src="/assets/alfredo/avatar/alfredo-avatar-32.png"
                  alt="알프레도"
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-lg">🎩</span>'; }}
                />
              </div>
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>AlFredo</span>
            </>
          ) : (
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <SyncStatusIndicator size="sm" />

          {/* Condition Icon Button - 클릭 시 DailyCheckInModal 열기 */}
          {showCondition && (
            <button
              onClick={onConditionClick}
              aria-label={currentCondition ? `오늘 컨디션: ${conditionConfig[currentCondition].label}` : '오늘 체크인하기'}
              className="flex items-center gap-0.5 px-2 py-1 rounded-full transition-colors touch-target hover:opacity-80"
              style={{ backgroundColor: 'var(--surface-subtle)' }}
            >
              {/* 컨디션 이모지 */}
              <span className="text-lg">
                {currentCondition ? conditionConfig[currentCondition].emoji : '😐'}
              </span>
              {/* 감정 이모지 (있으면 표시) */}
              {todayEmotion && emotionEmojis[todayEmotion] && (
                <span className="text-lg">
                  {emotionEmojis[todayEmotion]}
                </span>
              )}
            </button>
          )}

          {showNotification && (
            <button
              onClick={toggleNotification}
              aria-label={unreadCount > 0 ? `알림 ${unreadCount}개` : '알림'}
              className="relative w-9 h-9 flex items-center justify-center rounded-full transition-colors touch-target hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-0.5 right-0.5 w-3.5 h-3.5 text-white text-[9px] font-medium rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={open}
            aria-label="메뉴 열기"
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors touch-target hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
