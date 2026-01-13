import { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';
import { useConversationStore } from '../stores/conversationStore';
import ErrorState from '../components/common/ErrorState';
import { ConversationsEmptyState } from '../components/common/EmptyState';

export default function Chat() {
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error ? (
          <ErrorState 
            type="network" 
            message={error} 
            onRetry={handleNewChat}
          />
        ) : messages.length === 0 && !isStreaming ? (
          <ConversationsEmptyState />
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
                      ? 'bg-lavender-500 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
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
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white text-gray-800 rounded-bl-md shadow-sm">
                  <span className="text-lg mr-2">🐧</span>
                  <span className="whitespace-pre-wrap">
                    {streamingMessage || (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="알프레도에게 말하기..."
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
              disabled={isStreaming}
            />
            <button className="text-gray-400 hover:text-gray-600 ml-2">
              <Mic size={20} />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className={`p-3 rounded-full transition-colors ${
              input.trim() && !isStreaming
                ? 'bg-lavender-500 text-white hover:bg-lavender-600'
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
