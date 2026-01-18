import { useState } from 'react';
import { ChatMessage } from '../../types/chat';
import { CheckCircle2, AlertCircle, Lightbulb, ThumbsUp, ThumbsDown, BookOpen, Check, X } from 'lucide-react';
import { useAlfredoStore } from '../../stores/alfredoStore';

// Date 안전 변환 헬퍼
const toDate = (value: Date | string | undefined): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return new Date(value);
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
      <div className="bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700 flex items-center gap-2">
        <BookOpen size={14} />
        <span>
          {confirmedCount > 0
            ? `${confirmedCount}개 기억했어요!`
            : '피드백 반영할게요'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-200">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen size={14} className="text-blue-600" />
        <span className="text-xs font-medium text-blue-800">이렇게 기억했어요</span>
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
                <span className={isConfirmed ? 'text-blue-700' : 'text-neutral-400 line-through'}>
                  {learning.summary}
                </span>
              </div>
            );
          }

          return (
            <div key={learning.id} className="flex items-center justify-between">
              <span className="text-xs text-blue-700">• {learning.summary}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleConfirm(learning.id, true)}
                  className="px-2 py-1 text-[10px] bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
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
  showAvatar?: boolean; // 연속 메시지일 때 아바타 숨김
  previousMessageTime?: Date | string; // 이전 메시지 시간 (날짜 구분선용)
}

export default function ChatMessageItem({
  message,
  showAvatar = true,
  previousMessageTime
}: ChatMessageItemProps) {
  const isAlfredo = message.role === 'alfredo';
  const messageTime = toDate(message.timestamp);
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const { addNewLearning, preferences } = useAlfredoStore();

  const { feedbackLearning } = useAlfredoStore();

  // 피드백 핸들러
  const handleFeedback = async (isPositive: boolean) => {
    if (feedbackGiven) return; // 이미 피드백 줌

    setFeedbackGiven(isPositive ? 'positive' : 'negative');

    // 피드백을 학습으로 저장
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

  // 학습 확인 핸들러 ("기억해둘게요" UI)
  const handleLearningConfirm = async (learningId: string, isConfirmed: boolean) => {
    try {
      // 피드백을 통해 학습 신뢰도 조정
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
  
  // 날짜 구분선 필요 여부 체크
  let showDateDivider = false;
  if (previousMessageTime) {
    const prevDate = toDate(previousMessageTime).toDateString();
    const currentDate = messageTime.toDateString();
    showDateDivider = prevDate !== currentDate;
  }
  
  // 날짜 포맷
  const dateString = messageTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  
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
      <div className={`flex gap-2 ${isAlfredo ? '' : 'flex-row-reverse'} ${!showAvatar && isAlfredo ? 'ml-12' : ''} animate-slide-up`}>
        {/* 아바타 (연속 메시지일 때는 숨김) */}
        {showAvatar && (
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
              isAlfredo ? '' : 'bg-neutral-100'
            }`} style={isAlfredo ? { backgroundColor: 'var(--surface-subtle)' } : undefined}>
              {isAlfredo ? (
                <img
                  src="/assets/alfredo/avatar/alfredo-avatar-48.png"
                  alt="알프레도"
                  className="w-8 h-8 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-lg">🎩</span>'; }}
                />
              ) : (
                <span className="text-sm font-medium text-neutral-600">나</span>
              )}
            </div>
          </div>
        )}
        
        {/* 메시지 버블 그룹 */}
        <div className={`flex flex-col gap-1 max-w-[70%] ${isAlfredo ? 'items-start' : 'items-end'}`}>
          {/* 사용자 메시지 */}
          {!isAlfredo && (
            <div className="relative">
              <div className={`bg-primary text-white rounded-2xl px-4 py-2.5 shadow-sm relative
                ${showAvatar ? 'rounded-tr-md' : ''}`}>
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                
                {/* 말풍선 꼬리 (첫 메시지일 때만) */}
                {showAvatar && (
                  <div className="absolute -right-2 top-2 w-0 h-0 
                    border-l-[10px] border-l-primary 
                    border-t-[10px] border-t-transparent
                    border-b-[5px] border-b-transparent" />
                )}
              </div>
            </div>
          )}
          
          {/* 알프레도 메시지 (3단 구조) */}
          {isAlfredo && (
            <div className="space-y-1.5">
              {/* R1: 이해 선언 */}
              {message.understanding && (
                <div className="relative">
                  <div className={`bg-white border border-neutral-200 rounded-2xl px-4 py-2.5 shadow-sm
                    ${showAvatar ? 'rounded-tl-md' : ''}`}>
                    <p className="text-sm text-neutral-600 whitespace-pre-wrap break-words">{message.understanding}</p>
                    
                    {/* 말풍선 꼬리 (첫 메시지일 때만) */}
                    {showAvatar && (
                      <div className="absolute -left-2 top-2 w-0 h-0 
                        border-r-[10px] border-r-white 
                        border-t-[10px] border-t-transparent
                        border-b-[5px] border-b-transparent" />
                    )}
                  </div>
                </div>
              )}
              
              {/* R2: 구조화 요약 */}
              {message.summary && (
                <div className="bg-neutral-100 rounded-2xl px-4 py-2.5">
                  <p className="text-sm text-text-primary font-medium whitespace-pre-wrap break-words">{message.summary}</p>
                </div>
              )}
              
              {/* R3: 판단 반영 */}
              {message.judgement && (
                <div className={`rounded-2xl px-4 py-3 flex items-start gap-2 ${
                  message.judgement.type === 'apply' 
                    ? 'bg-green-50 border border-green-200' 
                    : message.judgement.type === 'consider'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-neutral-50 border border-neutral-200'
                }`}>
                  {message.judgement.type === 'apply' && <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />}
                  {message.judgement.type === 'consider' && <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary break-words">{message.judgement.message}</p>
                    {message.judgement.changes && (
                      <ul className="mt-1 space-y-0.5">
                        {message.judgement.changes.map((change, idx) => (
                          <li key={idx} className="text-xs text-neutral-600 break-words">• {change}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
              
              {/* DNA 인사이트 (있을 경우) */}
              {message.dnaInsights && message.dnaInsights.length > 0 && (
                <div className="bg-purple-50 rounded-2xl px-4 py-3 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={14} className="text-purple-600" />
                    <span className="text-xs font-medium text-purple-800">발견한 패턴</span>
                  </div>
                  <div className="space-y-1">
                    {message.dnaInsights.map((insight, idx) => (
                      <p key={idx} className="text-xs text-purple-700 break-words">
                        {insight.inference} ({insight.signal})
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* "기억해둘게요" 학습 확인 UI */}
              {message.newLearnings && message.newLearnings.length > 0 && (
                <LearningConfirmation
                  learnings={message.newLearnings}
                  onConfirm={(learningId, isConfirmed) => handleLearningConfirm(learningId, isConfirmed)}
                />
              )}

              {/* 피드백 버튼 (판단이 있는 메시지에만) */}
              {message.judgement && !message.isSafetyMessage && (
                <div className="flex items-center gap-1 mt-1">
                  {feedbackGiven ? (
                    <span className="text-xs text-neutral-400">
                      {feedbackGiven === 'positive' ? '👍 도움이 됐어요' : '👎 피드백 반영할게요'}
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleFeedback(true)}
                        className="p-1.5 text-neutral-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        title="도움이 됐어요"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        onClick={() => handleFeedback(false)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="아니에요"
                      >
                        <ThumbsDown size={14} />
                      </button>
                      <span className="text-[10px] text-neutral-300 ml-1">이 응답이 도움이 됐나요?</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* 타임스탬프 */}
          <div className={`flex ${isAlfredo ? 'justify-start' : 'justify-end'} px-1`}>
            <span className="text-[10px] text-neutral-500">{timeString}</span>
          </div>
        </div>
      </div>
    </>
  );
}
