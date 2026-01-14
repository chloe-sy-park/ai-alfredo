import { Play, Check, Zap } from 'lucide-react';
import { FocusItem } from '../../services/focusNow';

interface RightNowProps {
  focus: FocusItem | null;
  isActive?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
}

export default function RightNow({ focus, isActive = false, onStart, onComplete }: RightNowProps) {
  if (!focus) {
    return (
      <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7BE8] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={18} />
          <span className="text-sm font-medium opacity-90">지금 집중할 것</span>
        </div>
        <p className="text-lg font-semibold mb-3">
          아직 집중 항목이 없어요
        </p>
        <p className="text-sm opacity-80">
          Top 3에서 하나를 선택하거나, 새로 추가하세요
        </p>
      </div>
    );
  }

  return (
    <div className={'rounded-2xl p-5 transition-all ' + 
      (isActive 
        ? 'bg-gradient-to-r from-[#A996FF] to-[#8B7BE8] text-white' 
        : 'bg-white border border-[#E5E5E5]')}>
      
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={18} className={isActive ? 'text-white' : 'text-[#A996FF]'} />
          <span className={'text-sm font-medium ' + (isActive ? 'opacity-90' : 'text-[#A996FF]')}>
            지금 집중할 것
          </span>
        </div>
      </div>
      
      {/* 태스크 제목 */}
      <p className={'text-lg font-semibold mb-4 ' + (isActive ? '' : 'text-[#1A1A1A]')}>
        {focus.title}
      </p>
      
      {/* 액션 버튼 */}
      <div className="flex gap-2">
        {!isActive ? (
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#A996FF] text-white rounded-xl font-medium hover:bg-[#8B7BE8] transition-colors"
          >
            <Play size={18} />
            시작하기
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
          >
            <Check size={18} />
            완료
          </button>
        )}
      </div>
    </div>
  );
}
