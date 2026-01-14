import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({ 
  onSend, 
  placeholder = '생각을 자유롭게 적어주세요...',
  disabled = false 
}: ChatInputProps) {
  var [message, setMessage] = useState('');
  var textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 자동 높이 조절
  useEffect(function() {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);
  
  function handleSubmit() {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  }
  
  function handleKeyDown(e: React.KeyboardEvent) {
    // Shift+Enter는 줄바꿈, Enter만 누르면 전송
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }
  
  return (
    <div className="border-t border-neutral-200 bg-white p-4">
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={function(e) { setMessage(e.target.value); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 resize-none outline-none text-sm text-[#1A1A1A] placeholder:text-[#999999] min-h-[44px] max-h-[200px] py-3 px-0 bg-transparent"
          rows={1}
        />
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            message.trim() && !disabled
              ? 'bg-[#1A1A1A] text-white hover:bg-[#333333] active:scale-95'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          <Send size={18} />
        </button>
      </div>
      <p className="text-xs text-[#999999] mt-2">
        Shift+Enter로 줄바꿈 • Enter로 전송
      </p>
    </div>
  );
}