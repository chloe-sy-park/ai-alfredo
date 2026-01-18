/**
 * Health Input Sheet
 *
 * 건강 상태 입력 바텀시트
 * - 선택 기반 입력만 허용 (숫자/서술 입력 금지)
 * - 3단계: 문제없음 / 좀 불편해요 / 보호가 필요해요
 * - 추가 사유 선택 (선택사항)
 */

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useEmotionHealthStore } from '../../stores/emotionHealthStore';
import {
  HealthLevel,
  HealthReason,
  HEALTH_LEVEL_OPTIONS,
  HEALTH_REASON_OPTIONS
} from '../../services/emotionHealth/types';

interface HealthInputSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HealthInputSheet({
  isOpen,
  onClose
}: HealthInputSheetProps) {
  const { setHealthInput } = useEmotionHealthStore();
  const [selectedLevel, setSelectedLevel] = useState<HealthLevel | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<HealthReason[]>([]);
  const [step, setStep] = useState<'level' | 'reason'>('level');

  function handleLevelSelect(level: HealthLevel) {
    setSelectedLevel(level);

    // If "fine", submit directly without reason step
    if (level === 'fine') {
      handleSubmit(level, []);
      return;
    }

    // Move to reason step for uncomfortable/needProtection
    setStep('reason');
  }

  function handleReasonToggle(reason: HealthReason) {
    setSelectedReasons(function(prev) {
      if (prev.includes(reason)) {
        return prev.filter(function(r) { return r !== reason; });
      }
      return [...prev, reason];
    });
  }

  function handleSubmit(level?: HealthLevel, reasons?: HealthReason[]) {
    const finalLevel = level || selectedLevel;
    const finalReasons = reasons || selectedReasons;

    if (finalLevel) {
      setHealthInput({
        level: finalLevel,
        reasons: finalReasons.length > 0 ? finalReasons : undefined
      });
    }

    // Reset and close
    setSelectedLevel(null);
    setSelectedReasons([]);
    setStep('level');
    onClose();
  }

  function handleBack() {
    setStep('level');
    setSelectedReasons([]);
  }

  function handleClose() {
    setSelectedLevel(null);
    setSelectedReasons([]);
    setStep('level');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-md rounded-t-2xl p-5 pb-8 animate-slideUp safe-area-bottom"
        style={{ backgroundColor: 'var(--surface-default)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="health-input-title"
      >
        {/* Handle */}
        <div
          className="w-10 h-1 rounded-full mx-auto mb-4"
          style={{ backgroundColor: 'var(--border-default)' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="health-input-title"
            className="text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {step === 'level' ? '오늘 몸 상태는 어때요?' : '어떤 부분이 불편해요?'}
          </h2>
          <button
            onClick={handleClose}
            aria-label="닫기"
            className="p-2 rounded-full hover:opacity-80 min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Level Selection */}
        {step === 'level' && (
          <div
            className="space-y-3"
            role="group"
            aria-label="건강 상태 선택"
          >
            {HEALTH_LEVEL_OPTIONS.map(function(option) {
              const isSelected = selectedLevel === option.level;
              return (
                <button
                  key={option.level}
                  onClick={function() { handleLevelSelect(option.level); }}
                  aria-pressed={isSelected}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all min-h-[64px] text-left"
                  style={{
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-default)',
                    backgroundColor: isSelected ? 'rgba(201, 162, 94, 0.08)' : 'transparent'
                  }}
                >
                  <span className="text-3xl" aria-hidden="true">{option.emoji}</span>
                  <span
                    className="font-medium flex-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Reason Selection (Optional) */}
        {step === 'reason' && (
          <div className="space-y-4">
            <p
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              해당하는 항목을 모두 선택해주세요 (선택사항)
            </p>

            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="불편한 사유 선택"
            >
              {HEALTH_REASON_OPTIONS.map(function(option) {
                const isSelected = selectedReasons.includes(option.reason);
                return (
                  <button
                    key={option.reason}
                    onClick={function() { handleReasonToggle(option.reason); }}
                    aria-pressed={isSelected}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-all min-h-[44px]"
                    style={{
                      borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-default)',
                      backgroundColor: isSelected ? 'rgba(201, 162, 94, 0.08)' : 'transparent',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)'
                    }}
                  >
                    {isSelected && <Check size={16} />}
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-xl border transition-colors min-h-[48px] font-medium"
                style={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)'
                }}
              >
                뒤로
              </button>
              <button
                onClick={function() { handleSubmit(); }}
                className="flex-1 py-3 rounded-xl transition-colors min-h-[48px] font-medium"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white'
                }}
              >
                {selectedReasons.length > 0 ? '확인' : '건너뛰기'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
