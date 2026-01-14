import { useState, useEffect } from 'react';
import { Play, Pause, Check, X, Target } from 'lucide-react';
import { 
  FocusItem, 
  getCurrentFocus, 
  setManualFocus, 
  completeFocus, 
  clearFocus,
  pauseFocus,
  resumeFocus
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
    if (!focus || focus.status === 'paused') {
      return;
    }

    var interval = setInterval(function() {
      var now = Date.now();
      var elapsed = Math.floor((now - focus.startedAt) / 1000);
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
    completeFocus();
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

  function handlePauseResume() {
    if (!focus) return;
    
    if (focus.status === 'paused') {
      var resumed = resumeFocus();
      setFocus(resumed);
    } else {
      var paused = pauseFocus();
      setFocus(paused);
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
      <div className="relative overflow-hidden rounded-xl border-2 border-accent bg-gradient-to-br from-amber-50 to-yellow-50 p-4 shadow-gold-glow animate-fade-in">
        {/* 골드 글로우 효과 */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
        
        <div className="relative flex items-center gap-4">
          {/* 링 프로그레스 */}
          <RingProgress
            percent={progressPercent}
            size="md"
            color="accent"
            centerContent={
              <div className="text-center">
                <span className="text-lg font-bold text-neutral-800">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            }
          />
          
          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-accent" />
              <span className="text-xs font-medium text-amber-600 uppercase">
                지금 집중
              </span>
            </div>
            <h3 className="font-semibold text-neutral-800 truncate">
              {focus.title}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {focus.status === 'paused' ? '일시정지됨' : '집중 중...'}
            </p>
          </div>
          
          {/* 액션 버튼들 */}
          <div className="flex items-center gap-2">
            <Button
              variant="icon"
              size="sm"
              onClick={handlePauseResume}
              aria-label={focus.status === 'paused' ? '재개' : '일시정지'}
            >
              {focus.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}
            </Button>
            
            <Button
              variant="icon"
              size="sm"
              onClick={handleComplete}
              className="bg-success text-white hover:bg-success/90"
              aria-label="완료"
            >
              <Check size={16} />
            </Button>
            
            <Button
              variant="icon"
              size="sm"
              onClick={handleClear}
              className="bg-neutral-200 text-neutral-500 hover:bg-neutral-300"
              aria-label="취소"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 입력 모드
  if (isAdding) {
    return (
      <div className="rounded-xl border-2 border-dashed border-accent/50 bg-amber-50/50 p-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Target size={20} className="text-accent flex-shrink-0" />
          <input
            type="text"
            value={newTitle}
            onChange={function(e) { setNewTitle(e.target.value); }}
            onKeyDown={function(e) {
              if (e.key === 'Enter') handleAddFocus();
              if (e.key === 'Escape') { setIsAdding(false); setNewTitle(''); }
            }}
            placeholder="지금 집중할 일을 입력하세요"
            className="flex-1 bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400"
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
      className="w-full rounded-xl border-2 border-dashed border-neutral-300 bg-white/50 p-4 text-left hover:border-accent hover:bg-amber-50/30 transition-all duration-fast group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-100 group-hover:bg-accent/20 flex items-center justify-center transition-colors">
          <Target size={20} className="text-neutral-400 group-hover:text-accent" />
        </div>
        <div>
          <p className="font-medium text-neutral-600 group-hover:text-neutral-800">
            지금 집중할 것 하나를 정하세요
          </p>
          <p className="text-xs text-neutral-400">
            한 번에 하나씩, ADHD 친화적으로 🎯
          </p>
        </div>
      </div>
    </button>
  );
}
