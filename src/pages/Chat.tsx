// Chat.tsx - 알프레도 메신저 스타일 채팅 화면
import React, { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { useToneStore } from '../stores/toneStore';
import { ChatContext, CHAT_ENTRY_POINTS } from '../types/chat';
import ChatMessageItem from '../components/chat/ChatMessageItem';
import ChatInput from '../components/chat/ChatInput';
import SafetyMessage from '../components/chat/SafetyMessage';

// Date 안전 변환 헬퍼
const toDate = (value: Date | string | undefined): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return new Date(value);
};

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { getMessage, shouldUseEmoji } = useToneStore();
  const useEmoji = shouldUseEmoji();

  const {
    currentSession,
    isOpen,
    entryContext,
    openChat,
    closeChat,
    sendMessage,
    activeSafetyLevel: _activeSafetyLevel,
    activeCrisisResources: _activeCrisisResources,
    clearSafetyAlert: _clearSafetyAlert
  } = useChatStore();

  const entry = searchParams.get('entry') || 'manual';
  const locationState = location.state as { initialMessage?: string } | null;
  const initialMessage = locationState?.initialMessage || searchParams.get('message');

  const messages = (currentSession?.messages || []).map(msg => ({
    ...msg,
    timestamp: toDate(msg.timestamp)
  }));

  // 채팅 열기 초기화
  useEffect(() => {
    if (!isOpen) {
      const context: ChatContext = {
        entry: entry as keyof typeof CHAT_ENTRY_POINTS,
        currentState: {
          intensity: 'balance',
          condition: 'stable',
          top3Count: 3,
          calendarEvents: 2
        }
      };
      openChat(context);
    }
  }, [entry, isOpen, openChat]);

  // FloatingBar에서 전달된 초기 메시지 처리
  useEffect(() => {
    if (initialMessage && isOpen && messages.length === 0) {
      sendMessage(decodeURIComponent(initialMessage));
    }
  }, [initialMessage, isOpen, messages.length, sendMessage]);

  // 메시지 전송 핸들러
  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 뒤로가기 핸들러
  const handleBack = () => {
    closeChat();
    navigate(-1);
  };

  // 날짜 포맷터
  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return '오늘';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return '어제';
    } else {
      return messageDate.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  // 메시지 그룹핑 (날짜별)
  const messageGroups = messages.reduce((groups, message, index) => {
    const date = formatDate(message.timestamp);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push({ message, index });
    } else {
      groups.push({
        date,
        messages: [{ message, index }]
      });
    }

    return groups;
  }, [] as Array<{ date: string; messages: Array<{ message: typeof messages[0]; index: number }> }>);

  const entryInfo = entryContext ? CHAT_ENTRY_POINTS[entryContext.entry] : CHAT_ENTRY_POINTS.manual;

  // 톤 기반 빈 화면 메시지
  const emptyGreeting = getMessage('greeting');
  const emptyPrompt = entryInfo.prompt || (useEmoji ? '알프레도와 대화를 시작해보세요' : '알프레도와 대화를 시작해보세요.');

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Header - 컴팩트하게 */}
      <header className="bg-white border-b border-neutral-100 px-4 py-2.5 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-neutral-100 rounded-xl transition-colors -ml-1"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-lavender-100">
            <img
              src="/assets/alfredo/avatar/alfredo-avatar-48.png"
              alt="알프레도"
              className="w-7 h-7 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-lg">🎩</span>'; }}
            />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-text-primary">알프레도</h1>
            <p className="text-[11px] text-neutral-500">
              {entryInfo.title}
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full -mt-8">
            <div className="w-20 h-20 mb-4 rounded-full flex items-center justify-center overflow-hidden bg-lavender-100">
              <img
                src="/assets/alfredo/avatar/alfredo-avatar-120.png"
                alt="알프레도"
                className="w-16 h-16 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-4xl">🎩</span>'; }}
              />
            </div>
            <p className="text-sm text-neutral-700 mb-1">{emptyGreeting}</p>
            <p className="text-center text-sm text-neutral-500 max-w-[240px]">
              {emptyPrompt}
            </p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* 날짜 구분선 */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-neutral-100 text-neutral-500 text-[11px] px-3 py-1 rounded-full">
                  {group.date}
                </div>
              </div>

              {/* 메시지들 */}
              {group.messages.map(({ message, index }) => {
                const prevMessage = index > 0 ? messages[index - 1] : null;

                // 연속 메시지 체크
                const showAvatar = !prevMessage ||
                  prevMessage.role !== message.role ||
                  (message.timestamp.getTime() - prevMessage.timestamp.getTime()) > 60000;

                // 안전 메시지인 경우
                if (message.role === 'alfredo' && message.isSafetyMessage && message.safetyLevel) {
                  return (
                    <div key={message.id} className="my-3">
                      <SafetyMessage
                        level={message.safetyLevel}
                        message={message.content}
                        resources={message.crisisResources}
                      />
                    </div>
                  );
                }

                return (
                  <ChatMessageItem
                    key={message.id}
                    message={message}
                    showAvatar={showAvatar}
                    previousMessageTime={prevMessage?.timestamp}
                  />
                );
              })}
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - 하단에 고정, 여백 최소화 */}
      <ChatInput
        onSend={handleSend}
        placeholder="알프레도에게 메시지 보내기..."
        disabled={false}
      />
    </div>
  );
};

export default Chat;
