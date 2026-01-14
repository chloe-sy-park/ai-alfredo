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
        className="flex items-center gap-2 px-4 py-3 bg-[#F0F0FF] rounded-xl text-[#A996FF] hover:bg-[#E5E0FF] transition-colors w-full justify-center min-h-[44px]"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-4 w-14 h-14 bg-[#A996FF] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-[#8B7BE8] transition-all duration-200 hover:scale-105 z-50"
      aria-label="채팅 열기"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
