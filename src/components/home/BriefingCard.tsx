import { useState } from 'react';
import { AlfredoCard } from '../common/Card';
import IntensityBadge from '../common/IntensityBadge';
import { useBriefingEvolutionStore } from '../../stores/briefingEvolutionStore';
import { useLiveBriefingStore } from '../../stores/liveBriefingStore';

type IntensityLevel = 'light' | 'normal' | 'heavy' | 'overloaded';
type FeedbackType = 'helpful' | 'different' | 'skip' | null;

interface BriefingCardProps {
  headline: string;
  subline?: string;
  intensity?: IntensityLevel;
  onMore?: () => void;
  onFeedback?: (type: FeedbackType) => void;
}

// 피드백 버튼 설정
const feedbackButtons = [
  { type: 'helpful' as const, emoji: '👍', label: '좋아요', ariaLabel: '브리핑이 도움됐어요' },
  { type: 'different' as const, emoji: '🔁', label: '다른 제안', ariaLabel: '다른 제안을 보고 싶어요' },
  { type: 'skip' as const, emoji: '🙅', label: '괜찮아요', ariaLabel: '오늘은 괜찮아요' },
];

// 피드백 응답 메시지
const feedbackResponses: Record<Exclude<FeedbackType, null>, string> = {
  helpful: '고마워요! 앞으로 더 유용한 브리핑을 준비할게요 💜',
  different: '알겠어요! 다른 관점으로 다시 생각해볼게요',
  skip: '좋아요, 필요할 때 언제든 불러주세요!',
};

export default function BriefingCard({
  headline,
  subline,
  intensity,
  onMore,
  onFeedback,
}: BriefingCardProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType>(null);
  const [showResponse, setShowResponse] = useState(false);

  // Phase 6: 브리핑 진화 시스템 연결
  var evolutionStore = useBriefingEvolutionStore();
  var liveBriefingStore = useLiveBriefingStore();
  var evolutionLevel = evolutionStore.getEvolutionLevel();

  function handleFeedback(type: FeedbackType) {
    setSelectedFeedback(type);
    setShowResponse(true);
    onFeedback?.(type);

    // Phase 6: 피드백을 진화 스토어에 기록
    if (type) {
      var feedbackMap: Record<string, 'helpful' | 'different' | 'skip'> = {
        helpful: 'helpful',
        different: 'different',
        skip: 'skip'
      };
      evolutionStore.recordFeedback(
        liveBriefingStore.briefing.status,
        0, // 현재 템플릿 인덱스 (추후 개선 가능)
        feedbackMap[type]
      );
    }

    // 3초 후 응답 메시지 숨기기
    setTimeout(function() {
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
            <span className="text-[10px] px-2 py-0.5 bg-[#F0F0FF] text-[#A996FF] rounded-full">
              {evolutionLevel.description}
            </span>
          )}
        </div>

        {/* 헤드라인 */}
        <h2 className="font-semibold text-[#1A1A1A] leading-relaxed">
          {headline}
        </h2>

        {/* 서브라인 */}
        {subline && (
          <p className="text-sm text-[#666666] leading-relaxed animate-fade-in animation-delay-150">
            {subline}
          </p>
        )}

        {/* 피드백 버튼 */}
        <div className="pt-3 border-t border-gray-100 animate-fade-in animation-delay-200">
          {showResponse && selectedFeedback ? (
            <p className="text-sm text-[#A996FF] text-center py-2 animate-fade-in">
              {feedbackResponses[selectedFeedback]}
            </p>
          ) : (
            <div className="flex justify-center gap-2">
              {feedbackButtons.map(function(btn) {
                var isSelected = selectedFeedback === btn.type;
                return (
                  <button
                    key={btn.type}
                    onClick={function() { handleFeedback(btn.type); }}
                    aria-label={btn.ariaLabel}
                    className={
                      'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all ' +
                      (isSelected
                        ? 'bg-[#A996FF] text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95')
                    }
                  >
                    <span>{btn.emoji}</span>
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