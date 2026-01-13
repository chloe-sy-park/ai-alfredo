import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatLauncherProps {
  variant?: 'floating' | 'inline';
  label?: string;
}

export default function ChatLauncher({ 
  variant = 'floating',
  label = '같이 정리해볼까'
}: ChatLauncherProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chat');
  };

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-3 bg-lavender-50 rounded-card text-primary hover:bg-lavender-100 transition-colors w-full justify-center"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-4 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-lavender-500 transition-all duration-normal hover:scale-105 z-50"
      aria-label="채팅 열기"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
