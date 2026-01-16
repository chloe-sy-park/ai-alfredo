/**
 * PostActionToast
 * PRD: 액션 완료 후 브리핑 토스트
 * 작업 완료, 집중 설정 등 액션 후 피드백 표시
 */

import { useEffect, useState } from 'react';
import { PostActionBriefing } from '../../services/briefing';

interface PostActionToastProps {
  briefing: PostActionBriefing | null;
  onDismiss?: () => void;
}

export default function PostActionToast({ briefing, onDismiss }: PostActionToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(function() {
    if (briefing) {
      setIsVisible(true);
      setIsExiting(false);

      // 자동 닫힘
      var exitTimer = setTimeout(function() {
        setIsExiting(true);
      }, briefing.duration - 300);

      var hideTimer = setTimeout(function() {
        setIsVisible(false);
        if (onDismiss) {
          onDismiss();
        }
      }, briefing.duration);

      return function() {
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setIsVisible(false);
    }
  }, [briefing, onDismiss]);

  if (!isVisible || !briefing) {
    return null;
  }

  // 톤에 따른 스타일
  var toneStyles = {
    celebration: 'bg-gradient-to-r from-[#A996FF] to-[#8B7BE8] text-white',
    encouragement: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    neutral: 'bg-white dark:bg-gray-800 text-[#1A1A1A] dark:text-white border border-[#E5E5E5] dark:border-gray-700',
    gentle: 'bg-gradient-to-r from-green-400 to-green-500 text-white'
  };

  var baseStyle = toneStyles[briefing.tone];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div
        className={`
          ${baseStyle}
          rounded-xl shadow-lg px-4 py-3
          transform transition-all duration-300 ease-out
          ${isExiting ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}
        `}
      >
        <p className="font-semibold text-sm">{briefing.headline}</p>
        {briefing.subline && (
          <p className={`text-xs mt-0.5 ${
            briefing.tone === 'neutral'
              ? 'text-[#666666] dark:text-gray-400'
              : 'opacity-90'
          }`}>
            {briefing.subline}
          </p>
        )}
      </div>
    </div>
  );
}
