import { useState, useRef, useEffect } from 'react';
import { Send, Mic, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Chat() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, role: string, content: string}>>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    
    setTimeout(() => {
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '안녕하세요! 알프레도예요. 무엇을 도와드릴까요? 🐧'
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(false);
    }, 1000);
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-center gap-3 -mx-4 px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-neutral-100">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-2xl">🐧</span>
        <h1 className="text-lg font-semibold text-neutral-800">알프레도</h1>
      </div>

      {/* 메시지 영역 */}
      <div className="space-y-4 min-h-[50vh]">
        {messages.length === 0 && !isStreaming ? (
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
                  {msg.role === 'assistant' && <span className="text-lg mr-2">🐧</span>}
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                </div>
              </div>
            ))}
            
            {isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white text-neutral-800 rounded-bl-md shadow-card">
                  <span className="text-lg mr-2">🐧</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-neutral-100">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="flex-1 flex items-center bg-neutral-100 rounded-full px-4 py-2">
            <input
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
