/**
 * Work → Life Transition Card
 *
 * 감정적 디브리핑을 위한 2단계 전환 카드
 * - Step 1: 인정 (acknowledgement) - "사람 때문에 에너지 많이 썼던 하루였네요"
 * - Step 2: 내려두기 (declaration) - "이제는 나를 위한 시간이에요"
 *
 * 금지 사항:
 * - 체크박스, 생산성 점수 노출 금지
 * - "분석", "감지" 표현 금지
 */

import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useEmotionHealthStore, selectTransitionCard } from '../../stores/emotionHealthStore';

interface WorkLifeTransitionCardProps {
  onTransitionComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

export default function WorkLifeTransitionCard({
  onTransitionComplete,
  onSkip,
  className = ''
}: WorkLifeTransitionCardProps) {
  const transitionCard = useEmotionHealthStore(selectTransitionCard);
  const { hideTransitionCard, advanceTransitionStep, triggerDropoff } = useEmotionHealthStore();
  const [isAnimating, setIsAnimating] = useState(false);

  // Track entry time for dwell time logging
  const [entryTime] = useState(Date.now());

  // Clean up on unmount
  useEffect(function() {
    return function() {
      // Could log dwell time here
      const dwellTime = Math.floor((Date.now() - entryTime) / 1000);
      console.debug('[TransitionCard] Dwell time:', dwellTime, 'seconds');
    };
  }, [entryTime]);

  if (!transitionCard.isVisible) return null;

  function handleAcknowledge() {
    setIsAnimating(true);
    setTimeout(function() {
      advanceTransitionStep();
      setIsAnimating(false);
    }, 300);
  }

  function handleDeclaration() {
    hideTransitionCard();
    if (onTransitionComplete) {
      onTransitionComplete();
    }
  }

  function handleDropoff() {
    triggerDropoff();
    if (onTransitionComplete) {
      onTransitionComplete();
    }
  }

  function handleSkipStep1() {
    hideTransitionCard();
    if (onSkip) {
      onSkip();
    }
  }

  function handleSkipStep2() {
    hideTransitionCard();
    if (onSkip) {
      onSkip();
    }
  }

  function handleClose() {
    hideTransitionCard();
  }

  return (
    <div
      className={`rounded-2xl p-5 shadow-card transition-all duration-300 ${isAnimating ? 'opacity-50 scale-98' : 'opacity-100 scale-100'} ${className}`}
      style={{ backgroundColor: 'var(--surface-default)' }}
      role="region"
      aria-label="Work에서 Life로 전환"
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        aria-label="닫기"
        className="absolute top-4 right-4 p-2 rounded-full hover:opacity-80 min-w-[44px] min-h-[44px] flex items-center justify-center"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <X size={18} />
      </button>

      {/* Step 1: Acknowledgement */}
      {transitionCard.step === 1 && (
        <div className="space-y-4">
          {/* Emoji */}
          <div className="text-center">
            <span className="text-4xl" aria-hidden="true">🌅</span>
          </div>

          {/* Acknowledgement Message */}
          <p
            className="text-center text-lg font-medium leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          >
            {transitionCard.acknowledgementMessage}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleAcknowledge}
              className="w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              맞아요
              <ChevronRight size={18} />
            </button>
            <button
              onClick={handleSkipStep1}
              className="w-full py-3 rounded-xl transition-colors min-h-[48px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              건너뛰기
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Declaration */}
      {transitionCard.step === 2 && (
        <div className="space-y-4">
          {/* Emoji */}
          <div className="text-center">
            <span className="text-4xl" aria-hidden="true">🏠</span>
          </div>

          {/* Declaration Message */}
          <p
            className="text-center text-lg font-medium leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          >
            {transitionCard.lifeDeclarationMessage}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleDeclaration}
              className="w-full py-3 rounded-xl font-medium transition-colors min-h-[48px]"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              오늘은 여기까지
            </button>

            {/* Drop-off Button - Protected Mode */}
            <button
              onClick={handleDropoff}
              className="w-full py-3 rounded-xl border transition-colors min-h-[48px] flex items-center justify-center gap-2"
              style={{
                borderColor: 'var(--state-warning)',
                color: 'var(--state-warning)',
                backgroundColor: 'var(--state-warning-bg)'
              }}
            >
              🛟 오늘은 보호가 필요해요
            </button>

            <button
              onClick={handleSkipStep2}
              className="w-full py-2 rounded-xl transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              건너뛰기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
