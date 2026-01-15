import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Send } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import ChatMessageItem from '../components/chat/ChatMessageItem';
import { LoadingDots } from '../components/common/Skeleton';
import { CHAT_ENTRY_POINTS } from '../types/chat';

export default function Chat() {
  var navigate = useNavigate();
  var messagesEndRef = useRef<HTMLDivElement>(null);
  var inputRef = useRef<HTMLTextAreaElement>(null);
  
  var {
    currentSession,
    entryContext,
    sendMessage,
    closeChat,
    loadInsights
  } = useChatStore();
  
  var [isLoading, setIsLoading] = useState(false);
  var [inputValue, setInputValue] = useState('');
  
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
  
  async function handleSendMessage() {
    if (!inputValue.trim() || isLoading) return;
    
    var message = inputValue;
    setInputValue('');
    setIsLoading(true);
    
    // textarea 크기 초기화
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    await sendMessage(message);
    setIsLoading(false);
  }
  
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter로 전송, Shift+Enter로 줄바꾸
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }
  
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value);
    
    // textarea 자동 크기 조정
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }
  
  function handleBack() {
    closeChat();
    navigate(-1);
  }
  
  // 연속 메시지 체크 함수
  function shouldShowAvatar(messages: any[], index: number) {
    if (index === 0) return true;
    
    var currentMessage = messages[index];
    var previousMessage = messages[index - 1];
    
    // 다른 사람의 메시지면 아바타 표시
    if (currentMessage.role !== previousMessage.role) return true;
    
    // 5분 이상 차이나면 아바타 표시
    var currentTime = new Date(currentMessage.timestamp).getTime();
    var previousTime = new Date(previousMessage.timestamp).getTime();
    return (currentTime - previousTime) > 5 * 60 * 1000;
  }
  
  return (
    <div className="min-h-screen bg-[#E8E5DE] flex flex-col"> {/* 카카오톡 배경색 */}
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
          {(!currentSession || currentSession.messages.length === 0) && (
            <div className="mb-6 text-center animate-fade-in">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <span className="text-2xl">🐧</span>
              </div>
              <p className="text-sm text-[#666666] bg-white rounded-2xl px-4 py-3 inline-block shadow-sm max-w-sm">
                {entryPoint.prompt}
              </p>
            </div>
          )}
          
          {/* 메시지 리스트 */}
          {currentSession && (
            <div className="space-y-2">
              {currentSession.messages.map(function(message, index) {
                var showAvatar = shouldShowAvatar(currentSession.messages, index);
                var previousMessage = index > 0 ? currentSession.messages[index - 1] : null;
                
                return (
                  <ChatMessageItem 
                    key={message.id} 
                    message={message}
                    showAvatar={showAvatar}
                    previousMessageTime={previousMessage ? new Date(previousMessage.timestamp) : undefined}
                  />
                );
              })}
              
              {/* 로딩 인디케이터 */}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">🐧</span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                    <LoadingDots />
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* 입력 영역 - 메신저 스타일 */}
      <div className="bg-white border-t border-neutral-200">
        <div className="max-w-[640px] mx-auto p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-neutral-50 rounded-3xl border border-neutral-200 px-4 py-2 transition-colors focus-within:bg-white focus-within:border-primary">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={entryPoint.prompt}
                disabled={isLoading}
                rows={1}
                className="w-full bg-transparent outline-none resize-none text-sm text-[#1A1A1A] placeholder:text-neutral-400"
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                inputValue.trim() && !isLoading
                  ? 'bg-primary text-white shadow-sm hover:shadow-md'
                  : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              <Send size={18} className="translate-x-0.5" />
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-2 text-center">
            Enter로 전송, Shift+Enter로 줄바꾸
          </p>
        </div>
      </div>
    </div>
  );
}