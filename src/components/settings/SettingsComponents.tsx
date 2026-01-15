/**
 * Settings UI 컴포넌트
 * Onboarding, Feedback, Notification, Transparency, Customization, Accessibility, Performance
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Download, Trash2, Moon, Sun, Monitor,
  Eye, Volume2, Vibrate, Star, MessageCircle
} from 'lucide-react';

// ========== Feedback ==========

interface FeedbackWidgetProps {
  context?: string;
  onSubmit?: (rating: number) => void;
}

export function FeedbackWidget({ context, onSubmit }: FeedbackWidgetProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (r: number) => {
    setRating(r);
    setSubmitted(true);
    onSubmit?.(r);
  };

  if (submitted) {
    return (
      <div className="text-center py-3 text-green-600 text-sm">
        피드백 감사해요! 💚
      </div>
    );
  }

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-2">
        {context || '이 경험은 어땠나요?'}
      </p>
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map(r => (
          <button
            key={r}
            onClick={() => handleSubmit(r)}
            className={`p-2 rounded-lg transition-colors ${
              rating === r
                ? 'bg-yellow-100 text-yellow-600'
                : 'hover:bg-gray-100'
            }`}
          >
            <Star className={`w-5 h-5 ${r <= (rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ========== Notification Preferences ==========

interface NotificationToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function NotificationToggle({
  label,
  description,
  enabled,
  onChange
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-11 h-6 rounded-full transition-colors ${
          enabled ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow"
          animate={{ x: enabled ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

// ========== Data Transparency ==========

interface DataCardProps {
  title: string;
  description: string;
  size?: string;
  onExport?: () => void;
  onDelete?: () => void;
}

export function DataCard({
  title,
  description,
  size,
  onExport,
  onDelete
}: DataCardProps) {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        {size && (
          <span className="text-xs text-gray-400">{size}</span>
        )}
      </div>
      <div className="flex gap-2 mt-3">
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Download className="w-4 h-4" />
            내보내기
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
        )}
      </div>
    </div>
  );
}

// ========== Customization ==========

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeSelectorProps {
  current: ThemeMode;
  onChange: (theme: ThemeMode) => void;
}

export function ThemeSelector({ current, onChange }: ThemeSelectorProps) {
  const themes: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'light', icon: <Sun className="w-5 h-5" />, label: '라이트' },
    { mode: 'dark', icon: <Moon className="w-5 h-5" />, label: '다크' },
    { mode: 'system', icon: <Monitor className="w-5 h-5" />, label: '시스템' }
  ];

  return (
    <div className="flex gap-2">
      {themes.map(({ mode, icon, label }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${
            current === mode
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {icon}
          <span className="text-xs">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ========== Accessibility ==========

interface AccessibilityToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function AccessibilityToggle({
  label,
  description,
  enabled,
  onChange
}: AccessibilityToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <Eye className="w-5 h-5 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-11 h-6 rounded-full transition-colors ${
          enabled ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow"
          animate={{ x: enabled ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

// ========== Performance ==========

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
}

export function ProgressBar({ progress, showLabel = true }: ProgressBarProps) {
  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>로딩 중...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ========== Quick Actions ==========

interface QuickSettingsProps {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  onSoundToggle: () => void;
  onHapticToggle: () => void;
}

export function QuickSettings({
  soundEnabled,
  hapticEnabled,
  onSoundToggle,
  onHapticToggle
}: QuickSettingsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onSoundToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
          soundEnabled
            ? 'bg-blue-100 text-blue-600'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        <Volume2 className="w-4 h-4" />
        <span className="text-sm">소리</span>
      </button>
      <button
        onClick={onHapticToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
          hapticEnabled
            ? 'bg-blue-100 text-blue-600'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        <Vibrate className="w-4 h-4" />
        <span className="text-sm">진동</span>
      </button>
    </div>
  );
}

// ========== Feedback Request ==========

export function FeedbackRequest() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
    >
      <div className="flex items-start gap-3">
        <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            알프레도를 어떻게 개선하면 좋을까요?
          </p>
          <p className="text-xs text-gray-600 mt-1">
            의견을 주시면 더 나아지는 데 도움이 돼요
          </p>
          <FeedbackWidget onSubmit={() => setDismissed(true)} />
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}
