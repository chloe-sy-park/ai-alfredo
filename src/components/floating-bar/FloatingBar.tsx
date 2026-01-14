import { Zap } from 'lucide-react';
import { useFloatingBarStore, useTimerStore } from '../../stores';
import ChatInput from './ChatInput';
import QuickActions from './QuickActions';
import TimerDisplay from './TimerDisplay';

interface FloatingBarProps {
  onChatSubmit: (message: string) => void;
  onQuickAction: (action: string) => void;
}

export default function FloatingBar({ onChatSubmit, onQuickAction }: FloatingBarProps) {
  const { mode, expand, collapse, openChat } = useFloatingBarStore();
  const { isRunning } = useTimerStore();

  // 타이머 실행 중이면 타이머 모드
  const displayMode = isRunning ? 'timer' : mode;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 safe-area-bottom">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] px-4 py-3">
          
          {displayMode === 'default' && (
            <div className="flex items-center gap-2">
              <ChatInput onSubmit={onChatSubmit} />
              <button
                onClick={expand}
                className="w-10 h-10 flex items-center justify-center bg-[#FFD43B] rounded-full"
              >
                <Zap size={20} className="text-[#1A1A1A]" />
              </button>
            </div>
          )}

          {displayMode === 'expanded' && (
            <QuickActions onAction={onQuickAction} onClose={collapse} />
          )}

          {displayMode === 'chat' && (
            <div className="flex items-center gap-2">
              <ChatInput onSubmit={onChatSubmit} />
              <button
                onClick={collapse}
                className="w-10 h-10 flex items-center justify-center bg-[#F5F5F5] rounded-full text-[#666666]"
              >
                <Zap size={20} />
              </button>
            </div>
          )}

          {displayMode === 'timer' && <TimerDisplay />}
          
        </div>
      </div>
    </div>
  );
}
