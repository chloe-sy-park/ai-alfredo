import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  type?: 'default' | 'network' | 'auth' | 'notFound';
}

export default function ErrorState({ 
  title,
  message, 
  onRetry,
  type = 'default'
}: ErrorStateProps) {
  const configs = {
    default: {
      icon: <AlertCircle className="text-red-400" size={32} />,
      emoji: '😖',
      defaultTitle: '문제가 생겼어요',
      defaultMessage: '잘못된 것 같아요. 다시 시도해주세요.'
    },
    network: {
      icon: <WifiOff className="text-gray-400" size={32} />,
      emoji: '📡',
      defaultTitle: '연결이 안 돼요',
      defaultMessage: '인터넷 연결을 확인해주세요.'
    },
    auth: {
      icon: <AlertCircle className="text-amber-400" size={32} />,
      emoji: '🔐',
      defaultTitle: '로그인이 필요해요',
      defaultMessage: '다시 로그인해주세요.'
    },
    notFound: {
      icon: <AlertCircle className="text-gray-400" size={32} />,
      emoji: '🔍',
      defaultTitle: '찾을 수 없어요',
      defaultMessage: '요청하신 내용을 찾을 수 없어요.'
    }
  };

  const config = configs[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-5xl mb-4">{config.emoji}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">
        {message || config.defaultMessage}
      </p>
      {onRetry && (
        <Button 
          variant="secondary" 
          onClick={onRetry}
          leftIcon={<RefreshCw size={16} />}
        >
          다시 시도
        </Button>
      )}
    </div>
  );
}
