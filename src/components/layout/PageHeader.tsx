import { useState } from 'react';
import { Menu, Bell, ChevronDown, X } from 'lucide-react';
import { useDrawerStore } from '../../stores';
import { useNotificationStore } from '../../stores/notificationStore';
import { SyncStatusIndicator } from '../common/SyncStatusIndicator';
import {
  ConditionLevel,
  conditionConfig,
  getTodayCondition,
  setTodayCondition
} from '../../services/condition';

type HomeMode = 'all' | 'work' | 'life' | 'finance';

interface PageHeaderProps {
  title?: string;
  showLogo?: boolean;
  showNotification?: boolean;
  // 모드 스위치 관련
  showModeSwitch?: boolean;
  activeMode?: HomeMode;
  onModeChange?: (mode: HomeMode) => void;
  // 컨디션 관련
  showCondition?: boolean;
  onConditionChange?: (level: ConditionLevel) => void;
}

const MODE_CONFIG = {
  all: { label: 'ALL', color: 'bg-os-work', textColor: '#FFFFFF' },
  work: { label: 'WORK', color: 'bg-os-work', textColor: '#FFFFFF' },
  life: { label: 'LIFE', color: 'bg-os-life', textColor: '#FFFFFF' },
  finance: { label: 'FINANCE', color: 'bg-os-finance', textColor: '#FFFFFF' }
};

export default function PageHeader({
  title,
  showLogo = true,
  showNotification = true,
  showModeSwitch = false,
  activeMode = 'all',
  onModeChange,
  showCondition = false,
  onConditionChange
}: PageHeaderProps) {
  const { open } = useDrawerStore();
  const { toggle: toggleNotification, unreadCount } = useNotificationStore();

  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [currentCondition, setCurrentCondition] = useState<ConditionLevel | null>(() => {
    const saved = getTodayCondition();
    return saved?.level || null;
  });

  function handleModeSelect(mode: HomeMode) {
    setShowModeDropdown(false);
    if (onModeChange) {
      onModeChange(mode);
    }
  }

  function handleConditionSelect(level: ConditionLevel) {
    setTodayCondition(level);
    setCurrentCondition(level);
    setShowConditionModal(false);
    if (onConditionChange) {
      onConditionChange(level);
    }
  }

  const currentModeConfig = MODE_CONFIG[activeMode];

  return (
    <>
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

          {/* Center: Mode Switch (Compact Dropdown) */}
          {showModeSwitch && (
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                aria-label={`현재 모드: ${currentModeConfig.label}, 클릭하여 변경`}
                aria-expanded={showModeDropdown}
                aria-haspopup="listbox"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 min-h-[44px] ${currentModeConfig.color}`}
                style={{ color: currentModeConfig.textColor }}
              >
                {currentModeConfig.label}
                <ChevronDown size={14} className={`transition-transform ${showModeDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {/* Mode Dropdown */}
              {showModeDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowModeDropdown(false)}
                  />
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-xl shadow-lg border overflow-hidden z-50 min-w-[120px]"
                    style={{
                      backgroundColor: 'var(--surface-default)',
                      borderColor: 'var(--border-default)'
                    }}
                  >
                    {(Object.keys(MODE_CONFIG) as HomeMode[]).map((mode) => {
                      const config = MODE_CONFIG[mode];
                      const isActive = mode === activeMode;
                      return (
                        <button
                          key={mode}
                          onClick={() => handleModeSelect(mode)}
                          className={`w-full px-4 py-2.5 text-left text-xs font-medium transition-colors flex items-center gap-2 ${config.color.includes('work') ? 'hover:bg-os-work/10' : config.color.includes('life') ? 'hover:bg-os-life/10' : 'hover:bg-os-finance/10'}`}
                          style={{
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            backgroundColor: isActive ? 'rgba(201, 162, 94, 0.1)' : undefined
                          }}
                        >
                          <span className={`w-2 h-2 rounded-full ${config.color}`} />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <SyncStatusIndicator size="sm" />

            {/* Condition Icon Button */}
            {showCondition && (
              <button
                onClick={() => setShowConditionModal(true)}
                aria-label={currentCondition ? `오늘 컨디션: ${conditionConfig[currentCondition].label}` : '오늘 컨디션 설정'}
                className="w-9 h-9 flex items-center justify-center text-lg rounded-full transition-colors touch-target hover:opacity-80"
                style={{ backgroundColor: 'transparent' }}
              >
                {currentCondition ? conditionConfig[currentCondition].emoji : '😐'}
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

      {/* Condition Modal */}
      {showConditionModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate-fadeIn"
            onClick={() => setShowConditionModal(false)}
          />
          <div
            className="relative w-full max-w-md rounded-t-2xl p-5 pb-8 animate-slideUp safe-area-bottom"
            style={{ backgroundColor: 'var(--surface-default)' }}
          >
            <div
              className="w-10 h-1 rounded-full mx-auto mb-4"
              style={{ backgroundColor: 'var(--border-default)' }}
            />

            <div className="flex items-center justify-between mb-4">
              <h3 id="condition-modal-title" className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>오늘 컨디션은?</h3>
              <button
                onClick={() => setShowConditionModal(false)}
                aria-label="닫기"
                className="p-2 rounded-full hover:opacity-80 min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3" role="group" aria-labelledby="condition-modal-title">
              {(['great', 'good', 'normal', 'bad'] as ConditionLevel[]).map((level) => {
                const info = conditionConfig[level];
                const isSelected = level === currentCondition;
                return (
                  <button
                    key={level}
                    onClick={() => handleConditionSelect(level)}
                    aria-label={`컨디션 ${info.label} 선택`}
                    aria-pressed={isSelected}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[44px]"
                    style={{
                      borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-default)',
                      backgroundColor: isSelected ? 'rgba(201, 162, 94, 0.1)' : 'transparent'
                    }}
                  >
                    <span className="text-3xl" aria-hidden="true">{info.emoji}</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{info.label}</span>
                  </button>
                );
              })}
            </div>

            {currentCondition && (
              <p className="text-sm text-center mt-4" style={{ color: 'var(--text-tertiary)' }}>
                {conditionConfig[currentCondition].message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
