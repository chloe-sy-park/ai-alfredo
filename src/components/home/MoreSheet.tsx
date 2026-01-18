import { X, MessageCircle, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../stores/chatStore';

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  why?: string;
  whatChanged?: string;
  tradeOff?: string;
}

export default function MoreSheet({
  isOpen,
  onClose,
  title,
  why,
  whatChanged,
  tradeOff
}: MoreSheetProps) {
  var navigate = useNavigate();
  var { openChat } = useChatStore();
  
  if (title === undefined) title = '판단 근거';
  
  function handleAdjust() {
    openChat({
      entry: 'more',
      triggerData: { why, whatChanged, tradeOff }
    });
    onClose();
    navigate('/chat');
  }

  // Phase 6: Report 페이지로 이동
  function handleViewReport() {
    onClose();
    navigate('/report');
  }
  
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
        onClick={onClose}
        role="presentation"
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 rounded-t-3xl shadow-lg z-50 animate-slide-up max-h-[70vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--surface-default)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-sheet-title"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--border-default)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pb-3 border-b"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <h3 id="more-sheet-title" className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-2 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {why && (
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>💡 Why this is #1</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{why}</p>
            </div>
          )}

          {whatChanged && (
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--state-warning)' }}>🔄 What changed today</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{whatChanged}</p>
            </div>
          )}

          {tradeOff && (
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>⚖️ Trade-off</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{tradeOff}</p>
            </div>
          )}

          {/* CTA 버튼들 - Phase 6 Open Door */}
          <div className="space-y-2">
            {/* 같이 조정하기 CTA */}
            <button
              onClick={handleAdjust}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all active:scale-[0.98] min-h-[44px]"
              style={{ backgroundColor: 'var(--text-primary)', color: 'white' }}
            >
              <MessageCircle size={18} />
              <span>같이 조정해볼까?</span>
            </button>

            {/* 리포트 보기 - Phase 6: 패턴/데이터 연결 */}
            <button
              onClick={handleViewReport}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all active:scale-[0.98] min-h-[44px]"
              style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}
            >
              <BarChart2 size={18} />
              <span>내 패턴 리포트 보기</span>
            </button>
          </div>
        </div>

        {/* Safe area padding for iPhone */}
        <div className="pb-safe" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)' }} />
      </div>
    </>
  );
}