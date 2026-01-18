import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatLauncherProps {
  variant?: 'floating' | 'inline';
  label?: string;
}

export default function ChatLauncher({ 
  variant,
  label
}: ChatLauncherProps) {
  if (variant === undefined) variant = 'floating';
  if (label === undefined) label = '같이 정리해볼까';
  
  var navigate = useNavigate();

  function handleClick() {
    navigate('/chat');
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        aria-label="채팅으로 정리하기"
        className="flex items-center gap-2 px-4 py-3 rounded-xl transition-colors w-full justify-center min-h-[44px]"
        style={{ backgroundColor: 'rgba(169, 150, 255, 0.15)', color: 'var(--accent-primary)' }}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label="채팅 열기"
      className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-105 z-50"
      style={{ backgroundColor: 'var(--accent-primary)' }}
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
