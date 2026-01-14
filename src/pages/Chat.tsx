import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import ChatMessageItem from '../components/chat/ChatMessageItem';
import ChatInput from '../components/chat/ChatInput';
import { LoadingDots } from '../components/common/Skeleton';
import { CHAT_ENTRY_POINTS } from '../types/chat';

export default function Chat() {
  var navigate = useNavigate();
  var messagesEndRef = useRef<HTMLDivElement>(null);
  
  var {
    currentSession,
    entryContext,
    sendMessage,
    closeChat,
    loadInsights
  } = useChatStore();
  
  var [isLoading, setIsLoading] = useState(false);
  
  // DNA 인사이트 로드
  useEffect(function() {
    loadInsights();
  }, [loadInsights]);
  
  // 메시지 추가시 스크롤
  useEffect(function() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);
  
  // 진입 컨텍스트 확인
  if (!entryContext) {
    navigate('/');
    return null;
  }
  
  var entryPoint = CHAT_ENTRY_POINTS[entryContext.entry];
  
  async function handleSendMessage(content: string) {
    setIsLoading(true);
    await sendMessage(content);
    setIsLoading(false);
  }
  
  function handleBack() {
    closeChat();
    navigate(-1);
  }
  
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-[640px] mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-[#1A1A1A]">
              {entryPoint.icon} {entryPoint.title}
            </h1>
            <p className="text-xs text-[#666666]">알프레도와 함께 판단 조정</p>
          </div>
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-primary" />
            <span className="text-xs text-primary font-medium">DNA 분석중</span>
          </div>
        </div>
      </div>
      
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[640px] mx-auto px-4 py-6">
          {/* 진입 프롬프트 */}
          <div className="mb-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🐧</span>
            </div>
            <p className="text-sm text-[#666666]">{entryPoint.prompt}</p>
          </div>
          
          {/* 메시지 리스트 */}
          {currentSession && (
            <div className="space-y-6">
              {currentSession.messages.map(function(message) {
                return (
                  <ChatMessageItem 
                    key={message.id} 
                    message={message} 
                  />
                );
              })}
              
              {/* 로딩 인디케이터 */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">🐧</span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <LoadingDots />
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* 입력 영역 */}
      <ChatInput 
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder={entryPoint.prompt}
      />
    </div>
  );
}