import { useState, useRef, useEffect } from 'react';
import { Send, Mic, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConversationStore } from '../stores/conversationStore';

export default function Chat() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    messages, 
    isStreaming, 
    streamingMessage, 
    error, 
    sendMessage, 
    createConversation 
  } = useConversationStore();

  // 스크롤 to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    const message = input;
    setInput('');
    
    try {
      await sendMessage(message);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // 새 대화 시작
  const handleNewChat = async () => {
    await createConversation();
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-4 py-3 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐧</span>
            <h1 className="text-lg font-semibold text-neutral-800">알프레도</h1>
          </div>
        </div>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-neutral-500 mb-4">{error}</p>
            <button
              onClick={handleNewChat}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium"
            >
              다시 시도
            </button>
          </div>
        ) : messages.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-5xl mb-4">🐧</span>
            <h3 className="text-lg font-medium text-neutral-700 mb-2">
              안녕하세요! 알프레도예요
            </h3>
            <p className="text-sm text-neutral-500 max-w-xs">
              무엇이든 물어보세요. 일정 관리, 우선순위 정리, 또는 그냥 대화도 좋아요!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white text-neutral-800 rounded-bl-md shadow-card'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <span className="text-lg mr-2">🐧</span>
                  )}
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                </div>
              </div>
            ))}
            
            {/* 스트리밍 메시지 */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white text-neutral-800 rounded-bl-md shadow-card">
                  <span className="text-lg mr-2">🐧</span>
                  <span className="whitespace-pre-wrap">
                    {streamingMessage || (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="sticky bottom-0 p-4 bg-white border-t border-neutral-100">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="flex-1 flex items-center bg-neutral-100 rounded-full px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="알프레도에게 말하기..."
              className="flex-1 bg-transparent outline-none text-neutral-800 placeholder-neutral-400"
              disabled={isStreaming}
            />
            <button className="text-neutral-400 hover:text-neutral-600 ml-2">
              <Mic size={20} />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className={`p-3 rounded-full transition-colors ${
              input.trim() && !isStreaming
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-neutral-200 text-neutral-400'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
