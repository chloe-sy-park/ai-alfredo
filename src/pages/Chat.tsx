import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendToAPI = async (allMessages: Message[]) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          context: {
            // TODO: Add real context from stores
            energy: 70,
            mood: '보통',
            tasks: [],
            events: []
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API 호출 실패');
      }

      const data = await response.json();
      return data.text;
    } catch (err) {
      console.error('Chat API error:', err);
      throw err;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await sendToAPI(updatedMessages);
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '응답을 받지 못했어요');
      // Add error message to chat
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '죄송해요, 지금 응답하기 어려워요. 잠시 후 다시 시도해주세요. 🐧'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    // Find last user message
    const lastUserMsgIndex = messages.map(m => m.role).lastIndexOf('user');
    if (lastUserMsgIndex === -1) return;
    
    // Remove error messages and retry
    const messagesUpToLastUser = messages.slice(0, lastUserMsgIndex + 1);
    setMessages(messagesUpToLastUser);
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await sendToAPI(messagesUpToLastUser);
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '응답을 받지 못했어요');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span className="text-2xl">🐧</span>
        <span className="font-semibold text-gray-800">알프레도</span>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🐧</div>
            <p className="text-gray-600 font-medium">안녕하세요! 알프레도예요</p>
            <p className="text-gray-400 text-sm mt-1">무엇이든 물어보세요</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <span className="animate-pulse">생각 중</span>
                <span className="animate-bounce">...</span>
              </span>
            </div>
          </div>
        )}
        {error && !isLoading && (
          <div className="flex justify-center">
            <button 
              onClick={handleRetry}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <RefreshCw size={14} />
              다시 시도
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-primary/30"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-full transition-colors ${
              input.trim() && !isLoading 
                ? 'bg-primary text-white hover:bg-primary/90' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
