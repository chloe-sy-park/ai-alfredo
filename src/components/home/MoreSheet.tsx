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
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg z-50 animate-slide-up max-h-[70vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#E5E5E5] rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-3 border-b border-[#E5E5E5]">
          <h3 className="text-lg font-bold text-[#1A1A1A]">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5 text-[#666666]" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-5">
          {why && (
            <div>
              <p className="text-sm font-semibold text-[#A996FF] mb-2">💡 Why this is #1</p>
              <p className="text-sm text-[#666666] leading-relaxed">{why}</p>
            </div>
          )}
          
          {whatChanged && (
            <div>
              <p className="text-sm font-semibold text-[#FBBF24] mb-2">🔄 What changed today</p>
              <p className="text-sm text-[#666666] leading-relaxed">{whatChanged}</p>
            </div>
          )}
          
          {tradeOff && (
            <div>
              <p className="text-sm font-semibold text-[#999999] mb-2">⚖️ Trade-off</p>
              <p className="text-sm text-[#666666] leading-relaxed">{tradeOff}</p>
            </div>
          )}
          
          {/* CTA 버튼들 - Phase 6 Open Door */}
          <div className="space-y-2">
            {/* 같이 조정하기 CTA */}
            <button
              onClick={handleAdjust}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#1A1A1A] text-white rounded-xl font-medium hover:bg-[#333333] transition-all active:scale-[0.98]"
            >
              <MessageCircle size={18} />
              <span>같이 조정해볼까?</span>
            </button>

            {/* 리포트 보기 - Phase 6: 패턴/데이터 연결 */}
            <button
              onClick={handleViewReport}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#F5F5F5] text-[#666666] rounded-xl font-medium hover:bg-[#EBEBEB] transition-all active:scale-[0.98]"
            >
              <BarChart2 size={18} />
              <span>내 패턴 리포트 보기</span>
            </button>
          </div>
        </div>
        
        {/* Safe area padding */}
        <div className="h-8" />
      </div>
    </>
  );
}