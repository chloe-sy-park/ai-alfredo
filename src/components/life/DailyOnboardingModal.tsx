/**
 * Daily Onboarding Modal
 *
 * 하루 시작 시 사용자의 리듬 선택을 받는 모달
 * - "오늘은 어떤 리듬으로 갈까요?"
 * - 선택 후 선언: "알겠어요. 오늘은 '___' 기준으로 제안할게요."
 * - 건너뛰기 옵션 제공 (steady로 기본 적용)
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { useEmotionHealthStore } from '../../stores/emotionHealthStore';
import {
  DailyMode,
  DAILY_ONBOARDING_OPTIONS
} from '../../services/emotionHealth/types';

interface DailyOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyOnboardingModal({
  isOpen,
  onClose
}: DailyOnboardingModalProps) {
  const { setDailyMode } = useEmotionHealthStore();
  const [selectedMode, setSelectedMode] = useState<DailyMode | null>(null);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  function handleSelect(mode: DailyMode) {
    setSelectedMode(mode);
    setStep('confirm');
  }

  function handleConfirm() {
    if (selectedMode) {
      setDailyMode(selectedMode);
      onClose();
    }
  }

  function handleSkip() {
    // 건너뛰면 dailyMode를 설정하지 않고 닫음 (effectiveMode는 steady로 유지)
    onClose();
  }

  function handleBack() {
    setStep('select');
    setSelectedMode(null);
  }

  function getDeclarationMessage(mode: DailyMode): string {
    const option = DAILY_ONBOARDING_OPTIONS.find(function(opt) {
      return opt.mode === mode;
    });
    return option ? option.label : '';
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal - Bottom Sheet */}
      <div
        className="relative w-full max-w-md rounded-t-2xl p-5 pb-8 animate-slideUp safe-area-bottom"
        style={{ backgroundColor: 'var(--surface-default)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-onboarding-title"
      >
        {/* Handle */}
        <div
          className="w-10 h-1 rounded-full mx-auto mb-4"
          style={{ backgroundColor: 'var(--border-default)' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="daily-onboarding-title"
            className="text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {step === 'select' ? '오늘은 어떤 리듬으로 갈까요?' : '오늘의 리듬'}
          </h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-2 rounded-full hover:opacity-80 min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Selection */}
        {step === 'select' && (
          <>
            <div
              className="space-y-3"
              role="group"
              aria-label="하루 리듬 선택"
            >
              {DAILY_ONBOARDING_OPTIONS.map(function(option) {
                return (
                  <button
                    key={option.mode}
                    onClick={function() { handleSelect(option.mode); }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all min-h-[72px] text-left"
                    style={{
                      borderColor: 'var(--border-default)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={function(e) {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.backgroundColor = 'rgba(201, 162, 94, 0.08)';
                    }}
                    onMouseLeave={function(e) {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="text-3xl" aria-hidden="true">{option.emoji}</span>
                    <div className="flex-1">
                      <span
                        className="font-semibold block"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {option.label}
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {option.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="w-full mt-4 py-3 text-center rounded-xl transition-colors min-h-[44px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              나중에 할게요
            </button>
          </>
        )}

        {/* Step 2: Confirmation */}
        {step === 'confirm' && selectedMode && (
          <div className="text-center">
            {/* Selected Option Display */}
            <div className="mb-6">
              <span className="text-5xl block mb-3" aria-hidden="true">
                {DAILY_ONBOARDING_OPTIONS.find(function(opt) {
                  return opt.mode === selectedMode;
                })?.emoji}
              </span>
            </div>

            {/* Declaration Message */}
            <p
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              알겠어요.
            </p>
            <p
              className="text-base mb-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              오늘은 <strong style={{ color: 'var(--accent-primary)' }}>
                '{getDeclarationMessage(selectedMode)}'
              </strong> 기준으로 제안할게요.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-xl border transition-colors min-h-[48px] font-medium"
                style={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)'
                }}
              >
                다시 선택
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl transition-colors min-h-[48px] font-medium"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white'
                }}
              >
                시작하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
