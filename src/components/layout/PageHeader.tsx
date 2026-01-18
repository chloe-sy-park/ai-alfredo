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
  all: { label: 'ALL', color: 'bg-primary text-white' },
  work: { label: 'WORK', color: 'bg-blue-500 text-white' },
  life: { label: 'LIFE', color: 'bg-green-500 text-white' },
  finance: { label: 'FINANCE', color: 'bg-emerald-600 text-white' }
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
      <header className="sticky top-0 z-30 bg-[#F5F5F5] dark:bg-neutral-900 safe-area-top">
        <div className="flex items-center justify-between px-4 py-2 gap-2">
          {/* Left: Logo or Title */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showLogo ? (
              <>
                <span className="text-lg">🐧</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-white text-sm">AlFredo</span>
              </>
            ) : (
              <span className="font-semibold text-[#1A1A1A] dark:text-white text-sm">{title}</span>
            )}
          </div>

          {/* Center: Mode Switch (Compact Dropdown) */}
          {showModeSwitch && (
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold
                  transition-all duration-200 ${currentModeConfig.color}
                `}
              >
                {currentModeConfig.label}
                <ChevronDown size={14} className={`transition-transform ${showModeDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Mode Dropdown */}
              {showModeDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowModeDropdown(false)}
                  />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50 min-w-[120px]">
                    {(Object.keys(MODE_CONFIG) as HomeMode[]).map((mode) => {
                      const config = MODE_CONFIG[mode];
                      const isActive = mode === activeMode;
                      return (
                        <button
                          key={mode}
                          onClick={() => handleModeSelect(mode)}
                          className={`
                            w-full px-4 py-2.5 text-left text-xs font-medium
                            transition-colors flex items-center gap-2
                            ${isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          <span className={`w-2 h-2 rounded-full ${config.color.split(' ')[0]}`} />
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
                className="w-9 h-9 flex items-center justify-center text-lg hover:bg-[#E5E5E5] dark:hover:bg-neutral-800 rounded-full transition-colors touch-target"
                title="오늘 컨디션"
              >
                {currentCondition ? conditionConfig[currentCondition].emoji : '😐'}
              </button>
            )}

            {showNotification && (
              <button
                onClick={toggleNotification}
                className="relative w-9 h-9 flex items-center justify-center text-[#666666] dark:text-neutral-400 hover:bg-[#E5E5E5] dark:hover:bg-neutral-800 rounded-full transition-colors touch-target"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#A996FF] text-white text-[9px] font-medium rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={open}
              className="w-9 h-9 flex items-center justify-center text-[#666666] dark:text-neutral-400 hover:bg-[#E5E5E5] dark:hover:bg-neutral-800 rounded-full transition-colors touch-target"
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
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl p-5 pb-8 animate-slideUp safe-area-bottom">
            <div className="w-10 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">오늘 컨디션은?</h3>
              <button
                onClick={() => setShowConditionModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {(['great', 'good', 'normal', 'bad'] as ConditionLevel[]).map((level) => {
                const info = conditionConfig[level];
                const isSelected = level === currentCondition;
                return (
                  <button
                    key={level}
                    onClick={() => handleConditionSelect(level)}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <span className="text-3xl">{info.emoji}</span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{info.label}</span>
                  </button>
                );
              })}
            </div>

            {currentCondition && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                {conditionConfig[currentCondition].message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
