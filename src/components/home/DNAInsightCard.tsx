import { useDNAStore } from '@/stores/dnaStore';
import { DNABasedSuggestion } from '@/services/dna/types';
import { Lightbulb, AlertTriangle, PartyPopper, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';

interface DNAInsightCardProps {
  suggestion: DNABasedSuggestion;
  onAction?: (action: string) => void;
}

export default function DNAInsightCard({ suggestion, onAction }: DNAInsightCardProps) {
  const { correctInsight } = useDNAStore();
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const getIcon = () => {
    switch (suggestion.type) {
      case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
      case 'celebration': return <PartyPopper className="text-green-500" size={18} />;
      case 'briefing': return <MessageCircle className="text-lavender-500" size={18} />;
      default: return <Lightbulb className="text-blue-500" size={18} />;
    }
  };

  const getBgColor = () => {
    switch (suggestion.type) {
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'celebration': return 'bg-green-50 border-green-200';
      case 'briefing': return 'bg-lavender-50 border-lavender-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const handleFeedback = (isCorrect: boolean) => {
    suggestion.basedOn.forEach(type => {
      correctInsight(type, isCorrect);
    });
    setFeedbackGiven(true);
  };

  return (
    <div className={`p-4 rounded-xl border ${getBgColor()} animate-fadeInUp`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <p className="text-gray-800 text-sm">{suggestion.message}</p>
          
          {suggestion.actionable && onAction && (
            <button
              onClick={() => onAction(suggestion.actionable!.action)}
              className="mt-2 text-sm text-lavender-600 font-medium hover:text-lavender-700"
            >
              {suggestion.actionable.label} →
            </button>
          )}
        </div>
      </div>

      {/* 피드백 버튼 */}
      {!feedbackGiven && suggestion.basedOn.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-400">이 정보가 맞나요?</span>
          <div className="flex gap-2">
            <button 
              onClick={() => handleFeedback(true)}
              className="p-1.5 rounded-lg hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors"
            >
              <ThumbsUp size={14} />
            </button>
            <button 
              onClick={() => handleFeedback(false)}
              className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
            >
              <ThumbsDown size={14} />
            </button>
          </div>
        </div>
      )}

      {feedbackGiven && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-400">피드백 감사합니다! 학습할게요 📝</span>
        </div>
      )}
    </div>
  );
}

/**
 * DNA 인사이트 리스트
 */
export function DNAInsightList({ onAction }: { onAction?: (action: string) => void }) {
  const { suggestions, profile } = useDNAStore();

  if (!profile || suggestions.length === 0) {
    return null;
  }

  // 우선순위별 정렬
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // 상위 3개만 표시
  const displaySuggestions = sortedSuggestions.slice(0, 3);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-500">🧬 알프레도가 배운 것</h3>
      {displaySuggestions.map((suggestion, index) => (
        <DNAInsightCard 
          key={index} 
          suggestion={suggestion} 
          onAction={onAction}
        />
      ))}
    </div>
  );
}
