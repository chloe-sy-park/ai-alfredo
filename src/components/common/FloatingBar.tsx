import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  MessageCircle, 
  Plus, 
  Smile, 
  FileText, 
  Timer, 
  Calendar,
  X
} from 'lucide-react';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  action: () => void;
}

const FloatingBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // 특정 페이지에서는 플로팅 바 숨기기
  const hiddenPaths = ['/onboarding', '/login', '/body-doubling', '/entry', '/chat'];
  const shouldHide = hiddenPaths.some(function(path) {
    return location.pathname.startsWith(path);
  });
  
  if (shouldHide) return null;

  const quickActions: QuickAction[] = [
    { 
      icon: MessageCircle, 
      label: '채팅', 
      action: () => {
        setIsExpanded(false);
      }
    },
    { 
      icon: Plus, 
      label: '태스크', 
      action: () => {
        setIsExpanded(false);
        navigate('/entry');
      }
    },
    { 
      icon: Smile, 
      label: '컨디션', 
      action: () => {
        setIsExpanded(false);
        // TODO: 컨디션 변경 모달
      }
    },
    { 
      icon: FileText, 
      label: '메모', 
      action: () => {
        setIsExpanded(false);
        // TODO: 메모 바텀시트
      }
    },
    { 
      icon: Timer, 
      label: '타이머', 
      action: () => {
        setIsExpanded(false);
        navigate('/body-doubling');
      }
    },
    { 
      icon: Calendar, 
      label: '일정', 
      action: () => {
        setIsExpanded(false);
        // TODO: 일정 추가 바텀시트
      }
    },
  ];

  const handleSubmit = () => {
    if (inputValue.trim()) {
      navigate('/chat', { state: { initialMessage: inputValue } });
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 sm:px-6 pb-6 pt-2 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent safe-area-bottom">
      <div className="max-w-md sm:max-w-lg mx-auto">
        {/* 퀵액션 확장 상태 */}
        {isExpanded && (
          <div className="mb-3 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3">
              <div className="flex justify-around">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 active:scale-95 transition-all touch-target"
                    >
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F5F3FF] flex items-center justify-center">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#A996FF]" />
                      </div>
                      <span className="text-xs text-gray-600">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 메인 입력 바 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full shadow-lg border border-gray-100 flex items-center overflow-hidden">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="AlFredo에게 물어보세요..."
              className="flex-1 px-5 py-3.5 text-sm bg-transparent outline-none placeholder:text-gray-400"
            />
            {inputValue && (
              <button
                onClick={handleSubmit}
                className="pr-4 text-[#A996FF] hover:text-[#8B7BE8] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* 퀵액션 토글 버튼 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              w-12 h-12 rounded-full shadow-lg
              flex items-center justify-center
              transition-all duration-300
              ${isExpanded 
                ? 'bg-gray-200 text-gray-600 rotate-45' 
                : 'bg-[#A996FF] text-white shadow-[#A996FF]/30'
              }
            `}
          >
            {isExpanded ? <X className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingBar;
