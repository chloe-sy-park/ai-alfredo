import { useState } from 'react';
import { AlfredoCard } from '../common/Card';
import IntensityBadge from '../common/IntensityBadge';
import { useBriefingEvolutionStore } from '../../stores/briefingEvolutionStore';
import { useLiveBriefingStore } from '../../stores/liveBriefingStore';
import { useToneStore, TonePreset } from '../../stores/toneStore';

type IntensityLevel = 'light' | 'normal' | 'heavy' | 'overloaded';
type FeedbackType = 'helpful' | 'different' | 'skip' | null;

interface BriefingCardProps {
  headline: string;
  subline?: string;
  intensity?: IntensityLevel;
  emailSummary?: string;
  hasImportantEmail?: boolean;
  onMore?: () => void;
  onFeedback?: (type: FeedbackType) => void;
}

// 톤별 피드백 버튼 설정
const getToneFeedbackButtons = (preset: TonePreset, useEmoji: boolean) => {
  const emojiMap = {
    friendly: { helpful: '👍', different: '🔁', skip: '🙅' },
    butler: { helpful: '✓', different: '↻', skip: '–' },
    secretary: { helpful: '✓', different: '↻', skip: '–' },
    coach: { helpful: '💪', different: '🔄', skip: '👋' },
    trainer: { helpful: '✓', different: '↻', skip: '–' },
  };

  const labelMap = {
    friendly: { helpful: '좋아요', different: '다른 제안', skip: '괜찮아요' },
    butler: { helpful: '유용합니다', different: '다른 제안', skip: '건너뛰기' },
    secretary: { helpful: '확인', different: '변경', skip: '건너뛰기' },
    coach: { helpful: '최고예요!', different: '다른 건?', skip: '됐어요' },
    trainer: { helpful: '알겠습니다', different: '변경', skip: '건너뛰기' },
  };

  const emojis = emojiMap[preset];
  const labels = labelMap[preset];

  return [
    {
      type: 'helpful' as const,
      emoji: useEmoji ? emojis.helpful : '',
      label: labels.helpful,
      ariaLabel: '브리핑이 도움됐어요',
    },
    {
      type: 'different' as const,
      emoji: useEmoji ? emojis.different : '',
      label: labels.different,
      ariaLabel: '다른 제안을 보고 싶어요',
    },
    {
      type: 'skip' as const,
      emoji: useEmoji ? emojis.skip : '',
      label: labels.skip,
      ariaLabel: '오늘은 괜찮아요',
    },
  ];
};

// 톤별 피드백 응답 메시지
const getToneFeedbackResponses = (
  preset: TonePreset
): Record<Exclude<FeedbackType, null>, string> => {
  const responses: Record<TonePreset, Record<Exclude<FeedbackType, null>, string>> = {
    friendly: {
      helpful: '고마워요! 앞으로 더 유용한 브리핑을 준비할게요 💜',
      different: '알겠어요! 다른 관점으로 다시 생각해볼게요',
      skip: '좋아요, 필요할 때 언제든 불러주세요!',
    },
    butler: {
      helpful: '감사합니다. 더 나은 브리핑을 준비하겠습니다.',
      different: '알겠습니다. 다른 관점으로 검토하겠습니다.',
      skip: '네, 필요하실 때 말씀해주세요.',
    },
    secretary: {
      helpful: '확인됨. 브리핑 개선 반영.',
      different: '변경 요청 접수.',
      skip: '건너뛰기 처리 완료.',
    },
    coach: {
      helpful: '좋아요! 다음엔 더 좋은 브리핑 가져올게요! 🔥',
      different: '그렇죠! 새로운 시각으로 다시 준비해볼게요!',
      skip: '알겠어요! 필요할 때 불러주세요! 👊',
    },
    trainer: {
      helpful: '피드백 반영하겠습니다.',
      different: '다시 준비하겠습니다.',
      skip: '다음에 하세요.',
    },
  };
  return responses[preset];
};

export default function BriefingCard({
  headline,
  subline,
  intensity,
  emailSummary,
  hasImportantEmail,
  onMore,
  onFeedback,
}: BriefingCardProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType>(null);
  const [showResponse, setShowResponse] = useState(false);

  // 톤 스토어 연결
  const { preset, shouldUseEmoji } = useToneStore();
  const useEmoji = shouldUseEmoji();
  const feedbackButtons = getToneFeedbackButtons(preset, useEmoji);
  const feedbackResponses = getToneFeedbackResponses(preset);

  // Phase 6: 브리핑 진화 시스템 연결
  const evolutionStore = useBriefingEvolutionStore();
  const liveBriefingStore = useLiveBriefingStore();
  const evolutionLevel = evolutionStore.getEvolutionLevel();

  function handleFeedback(type: FeedbackType) {
    setSelectedFeedback(type);
    setShowResponse(true);
    onFeedback?.(type);

    // Phase 6: 피드백을 진화 스토어에 기록
    if (type) {
      const feedbackMap: Record<string, 'helpful' | 'different' | 'skip'> = {
        helpful: 'helpful',
        different: 'different',
        skip: 'skip',
      };
      evolutionStore.recordFeedback(
        liveBriefingStore.briefing.status,
        0, // 현재 템플릿 인덱스 (추후 개선 가능)
        feedbackMap[type]
      );
    }

    // 3초 후 응답 메시지 숨기기
    setTimeout(() => {
      setShowResponse(false);
    }, 3000);
  }

  return (
    <AlfredoCard onMore={onMore} className="animate-slide-down">
      <div className="space-y-3">
        {/* 강도 뱃지 + 진화 레벨 */}
        <div className="flex items-center gap-2 mb-2 animate-fade-in animation-delay-100">
          {intensity && (
            <IntensityBadge level={intensity} size="sm" />
          )}
          {/* Phase 6: 브리핑 진화 레벨 표시 */}
          {evolutionLevel.level > 1 && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--accent-primary)' }}
            >
              {evolutionLevel.description}
            </span>
          )}
          {/* 중요 메일 배지 */}
          {hasImportantEmail && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(224, 70, 70, 0.1)', color: 'var(--state-danger)' }}
            >
              📧 중요 메일
            </span>
          )}
        </div>

        {/* 헤드라인 */}
        <h2 className="font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {headline}
        </h2>

        {/* 서브라인 */}
        {subline && (
          <p
            className="text-sm leading-relaxed animate-fade-in animation-delay-150"
            style={{ color: 'var(--text-secondary)' }}
          >
            {subline}
          </p>
        )}

        {/* 이메일 요약 */}
        {emailSummary && (
          <div
            className="mt-2 p-3 rounded-lg animate-fade-in animation-delay-150"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">📬</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                메일 요약
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {emailSummary}
            </p>
          </div>
        )}

        {/* 피드백 버튼 */}
        <div className="pt-3 animate-fade-in animation-delay-200" style={{ borderTop: '1px solid var(--border-default)' }}>
          {showResponse && selectedFeedback ? (
            <p className="text-sm text-center py-2 animate-fade-in" style={{ color: 'var(--accent-primary)' }}>
              {feedbackResponses[selectedFeedback]}
            </p>
          ) : (
            <div className="flex justify-center gap-2">
              {feedbackButtons.map((btn) => {
                const isSelected = selectedFeedback === btn.type;
                return (
                  <button
                    key={btn.type}
                    onClick={() => handleFeedback(btn.type)}
                    aria-label={btn.ariaLabel}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all active:scale-95"
                    style={isSelected ? {
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--accent-on)',
                    } : {
                      backgroundColor: 'var(--surface-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {btn.emoji && <span>{btn.emoji}</span>}
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AlfredoCard>
  );
}
