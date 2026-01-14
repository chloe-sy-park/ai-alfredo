import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
}

export default function ChatInput({ onSubmit, placeholder = 'AlFredo에게 물어보세요...' }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2 flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[#1A1A1A] placeholder-[#999999] text-sm outline-none"
      />
      {value.trim() && (
        <button
          onClick={handleSubmit}
          className="w-8 h-8 flex items-center justify-center bg-[#A996FF] rounded-full text-white"
        >
          <Send size={16} />
        </button>
      )}
    </div>
  );
}
