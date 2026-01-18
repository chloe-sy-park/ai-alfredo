import { useState } from 'react';
import { ChatMessage } from '../../types/chat';
import { ThumbsUp, ThumbsDown, BookOpen, Check, X, Sparkles } from 'lucide-react';
import { useAlfredoStore } from '../../stores/alfredoStore';

// Date 안전 변환 헬퍼
const toDate = (value: Date | string | undefined): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return new Date(value);
};

// 스키마/JSON 패턴 감지 및 클린 텍스트 변환
const cleanResponseText = (text: string): string => {
  if (!text) return '';

  // JSON 객체 패턴 제거 (understanding, summary, judgement 등의 스키마)
  const jsonPatterns = [
    /\{[\s\S]*?"understanding"[\s\S]*?\}/g,
    /\{[\s\S]*?"summary"[\s\S]*?\}/g,
    /\{[\s\S]*?"judgement"[\s\S]*?\}/g,
    /\{[\s\S]*?"type"[\s\S]*?"message"[\s\S]*?\}/g,
    /```json[\s\S]*?```/g,
    /```[\s\S]*?```/g,
  ];

  let cleaned = text;
  jsonPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // 스키마 키 제거 (understanding:, summary: 등)
  cleaned = cleaned.replace(/^(understanding|summary|judgement|type|message|confidence|changes):\s*/gim, '');

  // 중복 공백/줄바꿈 정리
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
};

// "기억해둘게요" 학습 확인 컴포넌트
interface LearningConfirmationProps {
  learnings: Array<{ id: string; summary: string; type: string; confirmed?: boolean }>;
  onConfirm: (learningId: string, isConfirmed: boolean) => void;
}

function LearningConfirmation({ learnings, onConfirm }: LearningConfirmationProps) {
  const [confirmStates, setConfirmStates] = useState<Record<string, boolean | undefined>>({});

  const handleConfirm = (learningId: string, isConfirmed: boolean) => {
    setConfirmStates(prev => ({ ...prev, [learningId]: isConfirmed }));
    onConfirm(learningId, isConfirmed);
  };

  const allConfirmed = learnings.every(l => confirmStates[l.id] !== undefined);

  if (allConfirmed) {
    const confirmedCount = learnings.filter(l => confirmStates[l.id] === true).length;
    return (
      <div className="bg-lavender-50 rounded-xl px-3 py-2 text-xs text-lavender-700 flex items-center gap-2">
        <BookOpen size={14} />
        <span>
          {confirmedCount > 0
            ? `${confirmedCount}개 기억했어요`
            : '피드백 반영할게요'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-lavender-50 rounded-xl px-4 py-3 border border-lavender-200">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} className="text-lavender-600" />
        <span className="text-xs font-medium text-lavender-800">이렇게 기억했어요</span>
      </div>
      <div className="space-y-2">
        {learnings.map((learning) => {
          const isConfirmed = confirmStates[learning.id];

          if (isConfirmed !== undefined) {
            return (
              <div key={learning.id} className="flex items-center gap-2 text-xs">
                {isConfirmed ? (
                  <Check size={12} className="text-green-600" />
                ) : (
                  <X size={12} className="text-red-500" />
                )}
                <span className={isConfirmed ? 'text-lavender-700' : 'text-neutral-400 line-through'}>
                  {learning.summary}
                </span>
              </div>
            );
          }

          return (
            <div key={learning.id} className="flex items-center justify-between">
              <span className="text-xs text-lavender-700">• {learning.summary}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleConfirm(learning.id, true)}
                  className="px-2 py-1 text-[10px] bg-lavender-100 text-lavender-700 rounded-md hover:bg-lavender-200 transition-colors"
                >
                  맞아요
                </button>
                <button
                  onClick={() => handleConfirm(learning.id, false)}
                  className="px-2 py-1 text-[10px] bg-neutral-100 text-neutral-600 rounded-md hover:bg-neutral-200 transition-colors"
                >
                  아니야
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ChatMessageItemProps {
  message: ChatMessage;
  showAvatar?: boolean;
  previousMessageTime?: Date | string;
}

export default function ChatMessageItem({
  message,
  showAvatar = true,
  previousMessageTime
}: ChatMessageItemProps) {
  const isAlfredo = message.role === 'alfredo';
  const messageTime = toDate(message.timestamp);
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const { addNewLearning, preferences, feedbackLearning } = useAlfredoStore();

  // 피드백 핸들러
  const handleFeedback = async (isPositive: boolean) => {
    if (feedbackGiven) return;

    setFeedbackGiven(isPositive ? 'positive' : 'negative');

    if (preferences && message.judgement) {
      try {
        await addNewLearning({
          type: isPositive ? 'feedback' : 'correction',
          category: 'general',
          summary: isPositive
            ? `"${message.judgement.message.slice(0, 50)}..." 응답이 도움이 됨`
            : `"${message.judgement.message.slice(0, 50)}..." 응답이 적절하지 않음`,
          originalInput: message.content,
          source: 'feedback'
        });
      } catch (error) {
        console.error('Failed to save feedback:', error);
      }
    }
  };

  // 학습 확인 핸들러
  const handleLearningConfirm = async (learningId: string, isConfirmed: boolean) => {
    try {
      await feedbackLearning(learningId, isConfirmed);
    } catch (error) {
      console.error('Failed to confirm learning:', error);
    }
  };

  // 타임스탬프 포맷
  const timeString = messageTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // 날짜 구분선 필요 여부
  let showDateDivider = false;
  if (previousMessageTime) {
    const prevDate = toDate(previousMessageTime).toDateString();
    const currentDate = messageTime.toDateString();
    showDateDivider = prevDate !== currentDate;
  }

  const dateString = messageTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // 알프레도 응답 텍스트 추출 (스키마 노출 방지)
  const getDisplayContent = (): string => {
    if (!isAlfredo) return message.content;

    // judgement.message가 있으면 우선 사용
    if (message.judgement?.message) {
      return cleanResponseText(message.judgement.message);
    }

    // 그 외에는 content 사용 (스키마 제거)
    return cleanResponseText(message.content);
  };

  const displayContent = getDisplayContent();

  return (
    <>
      {/* 날짜 구분선 */}
      {showDateDivider && (
        <div className="flex items-center justify-center my-6">
          <div className="bg-neutral-100 rounded-full px-3 py-1">
            <span className="text-xs text-neutral-600">{dateString}</span>
          </div>
        </div>
      )}

      {/* 메시지 */}
      <div className={`flex gap-2.5 mb-3 ${isAlfredo ? '' : 'flex-row-reverse'} ${!showAvatar && isAlfredo ? 'ml-12' : ''}`}>
        {/* 아바타 */}
        {showAvatar && (
          <div className="flex-shrink-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden ${
              isAlfredo ? 'bg-lavender-100' : 'bg-neutral-100'
            }`}>
              {isAlfredo ? (
                <img
                  src="/assets/alfredo/avatar/alfredo-avatar-48.png"
                  alt="알프레도"
                  className="w-7 h-7 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-lg">🎩</span>'; }}
                />
              ) : (
                <span className="text-sm font-medium text-neutral-600">나</span>
              )}
            </div>
          </div>
        )}

        {/* 메시지 버블 */}
        <div className={`flex flex-col gap-1 max-w-[75%] ${isAlfredo ? 'items-start' : 'items-end'}`}>
          {/* 사용자 메시지 */}
          {!isAlfredo && (
            <div className={`bg-primary text-white rounded-2xl px-4 py-2.5 shadow-sm ${showAvatar ? 'rounded-tr-md' : ''}`}>
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
            </div>
          )}

          {/* 알프레도 메시지 - 단순화된 버블 */}
          {isAlfredo && (
            <div className="space-y-2">
              {/* 메인 메시지 버블 */}
              <div className={`bg-white border border-neutral-100 rounded-2xl px-4 py-3 shadow-sm ${showAvatar ? 'rounded-tl-md' : ''}`}>
                <p className="text-sm text-text-primary whitespace-pre-wrap break-words leading-relaxed">
                  {displayContent}
                </p>
              </div>

              {/* DNA 인사이트 (있을 경우) */}
              {message.dnaInsights && message.dnaInsights.length > 0 && (
                <div className="bg-lavender-50 rounded-xl px-3 py-2.5 border border-lavender-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles size={12} className="text-lavender-500" />
                    <span className="text-[10px] font-medium text-lavender-700">패턴 발견</span>
                  </div>
                  <div className="space-y-1">
                    {message.dnaInsights.slice(0, 2).map((insight, idx) => (
                      <p key={idx} className="text-xs text-lavender-600 leading-relaxed">
                        {insight.inference}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 학습 확인 UI */}
              {message.newLearnings && message.newLearnings.length > 0 && (
                <LearningConfirmation
                  learnings={message.newLearnings}
                  onConfirm={handleLearningConfirm}
                />
              )}

              {/* 피드백 버튼 */}
              {!message.isSafetyMessage && displayContent.length > 20 && (
                <div className="flex items-center gap-1 pt-1">
                  {feedbackGiven ? (
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      {feedbackGiven === 'positive' ? (
                        <><ThumbsUp size={10} className="text-green-500" /> 도움이 됐어요</>
                      ) : (
                        <><ThumbsDown size={10} className="text-neutral-400" /> 피드백 반영할게요</>
                      )}
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleFeedback(true)}
                        className="p-1.5 text-neutral-300 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        title="도움이 됐어요"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        onClick={() => handleFeedback(false)}
                        className="p-1.5 text-neutral-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        title="아니에요"
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 타임스탬프 */}
          <div className={`flex ${isAlfredo ? 'justify-start' : 'justify-end'} px-1`}>
            <span className="text-[10px] text-neutral-400">{timeString}</span>
          </div>
        </div>
      </div>
    </>
  );
}
