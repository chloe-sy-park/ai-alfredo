import { useState } from 'react';
import { ChevronDown, ChevronUp, Home } from 'lucide-react';
import { useAlfredoStore } from '../../stores/alfredoStore';

/**
 * AlfredoInsights 컴포넌트
 * 최하단 배치 - 알프레도가 사용자에 대해 배운 것을 간략 표시
 * 클릭하면 확장하여 상세 정보 표시
 */
export default function AlfredoInsights() {
  const { understanding, learnings, preferences } = useAlfredoStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!understanding) return null;

  const { understandingScore, level, daysTogether, title } = understanding;
  const currentDomain = preferences?.currentDomain || 'work';
  const recentLearnings = learnings.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      {/* 미니 카드 (항상 표시) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* 원형 프로그레스 */}
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-gray-200 dark:stroke-gray-600"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-primary"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - understandingScore / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {understandingScore}%
              </span>
            </div>
          </div>

          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Lv.{level} · {daysTogether}일째 함께
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
            ${currentDomain === 'work'
              ? 'bg-work-bg text-work-text'
              : 'bg-life-bg text-life-text'
            }
          `}>
            <Home size={12} />
            {currentDomain === 'work' ? 'Work' : 'Life'}
          </span>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* 확장 영역 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
          <div className="pt-4">
            <h4 className="text-xs font-semibold text-primary uppercase mb-3">
              알프레도가 배운 것
            </h4>

            {recentLearnings.length > 0 ? (
              <div className="space-y-2">
                {recentLearnings.map((learning) => (
                  <div
                    key={learning.id}
                    className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                      ${learning.learningType === 'preference' ? 'bg-primary' : ''}
                      ${learning.learningType === 'pattern' ? 'bg-teal-400' : ''}
                      ${learning.learningType === 'feedback' ? 'bg-amber-400' : ''}
                      ${learning.learningType === 'correction' ? 'bg-red-400' : ''}
                      ${learning.learningType === 'context' ? 'bg-blue-400' : ''}
                    `} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {learning.summary}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        신뢰도 {learning.confidence}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                아직 배운 것이 없어요.<br />
                대화하면서 알아갈게요!
              </p>
            )}

            {learnings.length > 5 && (
              <p className="text-xs text-center text-gray-400 mt-3">
                +{learnings.length - 5}개 더 있어요
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
