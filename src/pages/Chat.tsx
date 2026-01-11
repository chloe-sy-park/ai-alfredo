import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Plus, ChevronLeft } from 'lucide-react';
import { useConversationStore } from '../stores/conversationStore';
import type { Message } from '../types/database';

export default function Chat() {
  const {
    messages,
    isStreaming,
    streamingMessage,
    error,
    sendMessage,
    createConversation,
    currentConversation,
  } = useConversationStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Textarea 자동 높이 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const messageText = input.trim();
    setInput('');

    await sendMessage(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    await createConversation();
  };

  // 메시지 렌더링
  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
      >
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center mr-2 flex-shrink-0">
            <span className="text-lg">🐧</span>
          </div>
        )}
        <div
          className={`max-w-[75%] px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-lavender-400 text-white rounded-br-md'
              : 'bg-white shadow-sm rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐧</span>
          <span className="font-medium text-gray-800">알프레도</span>
        </div>
        <button
          onClick={handleNewChat}
          className="p-2 rounded-full hover:bg-lavender-50 transition-colors"
          title="새 대화"
        >
          <Plus size={20} className="text-gray-600" />
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* 초기 메시지 */}
        {messages.length === 0 && !isStreaming && (
          <div className="flex justify-start animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center mr-2">
              <span className="text-lg">🐧</span>
            </div>
            <div className="bg-white shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
              <p className="text-sm leading-relaxed">오늘 뽐부터 시작할까요?</p>
            </div>
          </div>
        )}

        {/* 메시지 목록 */}
        {messages.map(renderMessage)}

        {/* 스트리밍 중인 메시지 */}
        {isStreaming && streamingMessage && (
          <div className="flex justify-start animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center mr-2">
              <span className="text-lg">🐧</span>
            </div>
            <div className="bg-white shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {streamingMessage}
                <span className="inline-block w-1.5 h-4 bg-lavender-400 ml-0.5 animate-pulse" />
              </p>
            </div>
          </div>
        )}

        {/* 로딩 */}
        {isStreaming && !streamingMessage && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center mr-2">
              <span className="text-lg">🐧</span>
            </div>
            <div className="bg-white shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-lavender-300 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 bg-lavender-300 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 bg-lavender-300 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="flex justify-center">
            <div className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              disabled={isStreaming}
              className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-lavender-400 focus:border-transparent transition-all disabled:opacity-50"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              disabled={isStreaming}
            >
              <Mic size={20} />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="w-12 h-12 rounded-full bg-lavender-400 text-white flex items-center justify-center hover:bg-lavender-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
