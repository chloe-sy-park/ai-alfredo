import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * ChatLauncher - 채팅 진입점
 */
function ChatLauncher({ variant = 'floating', label = '같이 정리해볼까', onOpen }) {
  if (variant === 'inline') {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl p-3 shadow-card text-md font-medium text-primary transition-all duration-200 hover:shadow-lg"
      >
        <MessageCircle size={18} />
        {label}
      </button>
    );
  }
  
  // Floating variant
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
      aria-label="채팅 열기"
    >
      <MessageCircle size={24} />
    </button>
  );
}

export default ChatLauncher;
