// Chat.tsx - 메신저 스타일 채팅 화면
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { Message } from '../types/chat';
import ChatMessageItem from '../components/chat/ChatMessageItem';
import ChatInput from '../components/chat/ChatInput';

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    sessions,
    currentSessionId,
    addMessage,
    createSession,
    setCurrentSession
  } = useChatStore();
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const currentSession = currentSessionId ? sessions.find(s => s.id === currentSessionId) : null;
  const messages = currentSession?.messages || [];
  
  // 세션 초기화
  useEffect(() => {
    if (!currentSessionId) {
      const newSessionId = createSession();
      setCurrentSession(newSessionId);
    }
  }, [currentSessionId, createSession, setCurrentSession]);
  
  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentSessionId) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    addMessage(currentSessionId, userMessage);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // TODO: AI 응답 구현
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '네, 알겠습니다! 제가 도와드릴게요. 🐧',
        timestamp: new Date()
      };
      
      setTimeout(() => {
        if (currentSessionId) {
          addMessage(currentSessionId, aiResponse);
        }
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      setIsLoading(false);
    }
  };
  
  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 연속 메시지 그룹핑 헬퍼
  const getMessageGroups = () => {
    const groups: Array<{ date: Date; messages: Message[] }> = [];
    let currentGroup: Message[] = [];
    let currentDate: Date | null = null;
    
    messages.forEach((message, index) => {
      const messageDate = new Date(message.timestamp);
      messageDate.setHours(0, 0, 0, 0);
      
      if (!currentDate || currentDate.getTime() !== messageDate.getTime()) {
        if (currentGroup.length > 0 && currentDate) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });
    
    if (currentGroup.length > 0 && currentDate) {
      groups.push({ date: currentDate, messages: currentGroup });
    }
    
    return groups;
  };
  
  const messageGroups = getMessageGroups();
  
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
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#A996FF] rounded-full flex items-center justify-center">
            <span className="text-xl">🐧</span>
          </div>
          <div>
            <h1 className="font-semibold">알프레도</h1>
            <p className="text-xs text-gray-500">
              {currentSession ? `대화 ${(currentSession.title || '새 대화')}` : '새 대화'}
            </p>
          </div>
        </div>
      </header>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messageGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-6xl mb-4">🐧</span>
            <p>알프레도와 대화를 시작해보세요!</p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* 날짜 구분선 */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {formatDate(group.date)}
                </div>
              </div>
              
              {/* 메시지들 */}
              {group.messages.map((message, index) => {
                const prevMessage = index > 0 ? group.messages[index - 1] : null;
                const nextMessage = index < group.messages.length - 1 ? group.messages[index + 1] : null;
                const isFirstInGroup = !prevMessage || prevMessage.role !== message.role;
                const isLastInGroup = !nextMessage || nextMessage.role !== message.role;
                
                return (
                  <ChatMessageItem
                    key={message.id}
                    message={message}
                    isFirstInGroup={isFirstInGroup}
                    isLastInGroup={isLastInGroup}
                  />
                );
              })}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <div className="w-8 h-8 bg-[#A996FF] rounded-full flex items-center justify-center">
              <span>🐧</span>
            </div>
            <div className="bg-gray-200 rounded-2xl px-4 py-3 animate-pulse">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder="알프레도에게 메시지 보내기..."
      />
    </div>
  );
};

export default Chat;