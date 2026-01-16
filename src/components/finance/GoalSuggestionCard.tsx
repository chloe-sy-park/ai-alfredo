/**
 * Goal Suggestion Card Component
 */
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

interface GoalSuggestionProps {
  suggestedTitle: string;
  relatedItemNames: string[];
  onAccept: () => void;
  onDismiss: () => void;
}

export function GoalSuggestionCard({
  suggestedTitle,
  relatedItemNames,
  onAccept,
  onDismiss,
}: GoalSuggestionProps) {
  return (
    <motion.div
      className="bg-gradient-to-r from-lavender-50 to-lavender-100 rounded-xl p-4 border border-lavender-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <Target size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-800">
            비슷한 성장이 반복돼요.
            <br />
            이걸 하나의 방향으로 묶어볼까요?
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {relatedItemNames.slice(0, 3).join(', ')}
            {relatedItemNames.length > 3 && ` 외 ${relatedItemNames.length - 3}개`}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="flex-1 py-2.5 bg-primary text-white font-medium rounded-lg text-sm hover:bg-lavender-600 transition-colors"
        >
          "{suggestedTitle}" 목표 만들기
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2.5 text-gray-500 text-sm hover:text-gray-700"
        >
          나중에
        </button>
      </div>
    </motion.div>
  );
}
