// Chat.tsx - 메신저 스타일 채팅 화면
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

  // 톤 스토어 연결
  const { getMessage, shouldUseEmoji } = useToneStore();
  const useEmoji = shouldUseEmoji();

  const {
    currentSession,
    isOpen,
    entryContext,
    openChat,
    closeChat,
    sendMessage,
    // 안전 상태 (향후 지속적 알림에 사용)
    activeSafetyLevel: _activeSafetyLevel,
    activeCrisisResources: _activeCrisisResources,
    clearSafetyAlert: _clearSafetyAlert
  } = useChatStore();

  const entry = searchParams.get('entry') || 'manual';
  // location.state와 searchParams 모두 지원
  const locationState = location.state as { initialMessage?: string } | null;
  const initialMessage = locationState?.initialMessage || searchParams.get('message');
  
  // 메시지 timestamp를 안전하게 Date로 변환
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
  const emptyPrompt = entryInfo.prompt || (useEmoji ? '알프레도와 대화를 시작해보세요! 💬' : '알프레도와 대화를 시작해보세요.');

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
            <img
              src="/assets/alfredo/avatar/alfredo-avatar-48.png"
              alt="알프레도"
              className="w-8 h-8 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-xl">🎩</span>'; }}
            />
          </div>
          <div>
            <h1 className="font-semibold" style={{ color: 'var(--text-primary)' }}>알프레도</h1>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {entryInfo.title}
            </p>
          </div>
        </div>
      </header>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-24 h-24 mb-4 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
              <img
                src="/assets/alfredo/avatar/alfredo-avatar-120.png"
                alt="알프레도"
                className="w-20 h-20 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-5xl">🎩</span>'; }}
              />
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{emptyGreeting}</p>
            <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {emptyPrompt}
            </p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* 날짜 구분선 */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-100 text-text-secondary text-xs px-3 py-1 rounded-full">
                  {group.date}
                </div>
              </div>
              
              {/* 메시지들 */}
              {group.messages.map(({ message, index }) => {
                const prevMessage = index > 0 ? messages[index - 1] : null;

                // 연속 메시지 체크 - 안전한 Date 비교
                const showAvatar = !prevMessage ||
                  prevMessage.role !== message.role ||
                  (message.timestamp.getTime() - prevMessage.timestamp.getTime()) > 60000; // 1분 이상 차이

                // 안전 메시지인 경우 SafetyMessage 컴포넌트 사용
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
      
      {/* Input */}
      <ChatInput
        onSend={handleSend}
        placeholder="알프레도에게 메시지 보내기..."
        disabled={false}
      />
    </div>
  );
};

export default Chat;
