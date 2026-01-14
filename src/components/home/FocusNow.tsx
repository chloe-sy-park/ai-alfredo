import { useState, useEffect } from 'react';
import { Check, X, Target } from 'lucide-react';
import { 
  FocusItem, 
  getCurrentFocus, 
  setManualFocus, 
  clearFocus,
} from '../../services/focusNow';
import Button from '../common/Button';
import RingProgress from '../common/RingProgress';

interface FocusNowProps {
  externalFocus?: FocusItem | null;
  onFocusChange?: (focus: FocusItem | null) => void;
}

export default function FocusNow({ externalFocus, onFocusChange }: FocusNowProps) {
  var [focus, setFocus] = useState<FocusItem | null>(null);
  var [isAdding, setIsAdding] = useState(false);
  var [newTitle, setNewTitle] = useState('');
  var [elapsedTime, setElapsedTime] = useState(0);

  // 외부 focus 동기화
  useEffect(function() {
    if (externalFocus !== undefined) {
      setFocus(externalFocus);
    } else {
      var saved = getCurrentFocus();
      setFocus(saved);
    }
  }, [externalFocus]);

  // 타이머
  useEffect(function() {
    if (!focus) {
      return;
    }

    // 초기 경과 시간 계산
    var start = new Date(focus.startedAt).getTime();
    var initialElapsed = Math.floor((Date.now() - start) / 1000);
    setElapsedTime(initialElapsed);

    var interval = setInterval(function() {
      var now = Date.now();
      var elapsed = Math.floor((now - start) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return function() { clearInterval(interval); };
  }, [focus]);

  function handleAddFocus() {
    if (!newTitle.trim()) return;
    
    var newFocus = setManualFocus(newTitle.trim());
    setFocus(newFocus);
    setNewTitle('');
    setIsAdding(false);
    
    if (onFocusChange) {
      onFocusChange(newFocus);
    }
  }

  function handleComplete() {
    clearFocus();
    setFocus(null);
    setElapsedTime(0);
    
    if (onFocusChange) {
      onFocusChange(null);
    }
  }

  function handleClear() {
    clearFocus();
    setFocus(null);
    setElapsedTime(0);
    
    if (onFocusChange) {
      onFocusChange(null);
    }
  }

  function formatTime(seconds: number): string {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  // 예상 시간 대비 진행률 (기본 25분 뽀모도로)
  var expectedDuration = 25 * 60; // 25분
  var progressPercent = Math.min((elapsedTime / expectedDuration) * 100, 100);

  // 집중 중인 상태
  if (focus) {
    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-[#FFD700] bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] p-4 shadow-[0_0_12px_rgba(255,215,0,0.4)] animate-fade-in">
        {/* 골드 글로우 효과 */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FFD700]/20 rounded-full blur-2xl" />
        
        <div className="relative flex items-center gap-4">
          {/* 링 프로그레스 */}
          <RingProgress
            percent={progressPercent}
            size="md"
            color="accent"
            centerContent={
              <div className="text-center">
                <span className="text-lg font-bold text-[#1A1A1A]">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            }
          />
          
          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-[#FFD700]" />
              <span className="text-xs font-semibold text-[#B45309] uppercase">
                지금 집중
              </span>
            </div>
            <h3 className="font-semibold text-[#1A1A1A] truncate">
              {focus.title}
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">
              집중 중...
            </p>
          </div>
          
          {/* 액션 버튼들 - 48x48 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleComplete}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#4ADE80] text-white hover:bg-[#4ADE80]/90 transition-colors"
              aria-label="완료"
            >
              <Check size={20} />
            </button>
            
            <button
              onClick={handleClear}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#E5E5E5] text-[#666666] hover:bg-[#D4D4D4] transition-colors"
              aria-label="취소"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 입력 모드
  if (isAdding) {
    return (
      <div className="rounded-xl border-2 border-dashed border-[#FFD700]/50 bg-[#F0F0FF] p-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Target size={20} className="text-[#FFD700] flex-shrink-0" />
          <input
            type="text"
            value={newTitle}
            onChange={function(e) { setNewTitle(e.target.value); }}
            onKeyDown={function(e) {
              if (e.key === 'Enter') handleAddFocus();
              if (e.key === 'Escape') { setIsAdding(false); setNewTitle(''); }
            }}
            placeholder="지금 집중할 일을 입력하세요"
            className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder:text-[#999999]"
            autoFocus
          />
          <Button size="sm" onClick={handleAddFocus} disabled={!newTitle.trim()}>
            시작
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={function() { setIsAdding(false); setNewTitle(''); }}
          >
            취소
          </Button>
        </div>
      </div>
    );
  }

  // 빈 상태
  return (
    <button
      onClick={function() { setIsAdding(true); }}
      className="w-full rounded-xl border-2 border-dashed border-[#E5E5E5] bg-white p-4 text-left hover:border-[#FFD700] hover:bg-[#FFFBEB] transition-all duration-200 group min-h-[72px]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#F5F5F5] group-hover:bg-[#FFD700]/20 flex items-center justify-center transition-colors">
          <Target size={20} className="text-[#999999] group-hover:text-[#FFD700]" />
        </div>
        <div>
          <p className="font-medium text-[#666666] group-hover:text-[#1A1A1A]">
            지금 집중할 것 하나를 정하세요
          </p>
          <p className="text-xs text-[#999999]">
            한 번에 하나씩, ADHD 친화적으로 🎯
          </p>
        </div>
      </div>
    </button>
  );
}
