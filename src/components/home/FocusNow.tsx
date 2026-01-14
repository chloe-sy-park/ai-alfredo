import { useState, useEffect } from 'react';
import { Target, X, Clock, Zap } from 'lucide-react';
import { 
  FocusItem, 
  getCurrentFocus, 
  setManualFocus, 
  clearFocus,
  getFormattedDuration
} from '../../services/focusNow';

interface FocusNowProps {
  externalFocus?: FocusItem | null;
  onFocusChange?: (focus: FocusItem | null) => void;
}

export default function FocusNow({ externalFocus, onFocusChange }: FocusNowProps) {
  var [focus, setFocus] = useState<FocusItem | null>(null);
  var [duration, setDuration] = useState<string>('');
  var [isAdding, setIsAdding] = useState(false);
  var [newTitle, setNewTitle] = useState('');

  useEffect(function() {
    // 외부에서 설정된 포커스 우선
    if (externalFocus) {
      setFocus(externalFocus);
    } else {
      var current = getCurrentFocus();
      setFocus(current);
    }
  }, [externalFocus]);

  // 시간 업데이트 (1분마다)
  useEffect(function() {
    function updateDuration() {
      setDuration(getFormattedDuration());
    }
    
    updateDuration();
    var interval = setInterval(updateDuration, 60000);
    
    return function() { clearInterval(interval); };
  }, [focus]);

  function handleSetManualFocus() {
    if (!newTitle.trim()) return;
    
    var item = setManualFocus(newTitle.trim());
    setFocus(item);
    setNewTitle('');
    setIsAdding(false);
    
    if (onFocusChange) {
      onFocusChange(item);
    }
  }

  function handleClearFocus() {
    clearFocus();
    setFocus(null);
    
    if (onFocusChange) {
      onFocusChange(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSetManualFocus();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTitle('');
    }
  }

  // 집중 중인 상태
  if (focus) {
    var sourceIcon = focus.sourceType === 'top3' ? '🎯' : focus.sourceType === 'calendar' ? '📅' : '✏️';
    
    return (
      <div className="bg-gradient-to-r from-lavender-400 to-lavender-500 rounded-2xl p-4 shadow-sm text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Target size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {sourceIcon} 지금 집중
                </span>
              </div>
              <h3 className="font-semibold text-lg mt-1">{focus.title}</h3>
              <div className="flex items-center gap-1 mt-1 text-white/80 text-sm">
                <Clock size={14} />
                <span>{duration}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClearFocus}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* 응원 메시지 */}
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-sm text-white/80 flex items-center gap-2">
            <Zap size={14} />
            <span>한 가지에 집중하고 있어요. 잘하고 있어요! 💪</span>
          </p>
        </div>
      </div>
    );
  }

  // 집중 항목 없음 - 설정 UI
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-lavender-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-lavender-100 rounded-full flex items-center justify-center">
          <Target size={20} className="text-lavender-500" />
        </div>
        <div>
          <h3 className="font-semibold text-base">지금 집중할 것</h3>
          <p className="text-xs text-gray-400">하나만 정하면 나머지는 기다려요</p>
        </div>
      </div>

      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={function(e) { setNewTitle(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder="집중할 일을 입력하세요"
            className="flex-1 px-3 py-2 border border-lavender-200 rounded-xl text-sm outline-none focus:border-lavender-400"
            autoFocus
          />
          <button
            onClick={handleSetManualFocus}
            disabled={!newTitle.trim()}
            className="px-3 py-2 bg-lavender-400 text-white rounded-xl text-sm hover:bg-lavender-500 disabled:opacity-50"
          >
            시작
          </button>
          <button
            onClick={function() { setIsAdding(false); setNewTitle(''); }}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={function() { setIsAdding(true); }}
          className="w-full py-3 text-center text-lavender-500 hover:bg-lavender-50 rounded-xl transition-colors text-sm font-medium"
        >
          + 집중할 일 정하기
        </button>
      )}

      <p className="text-xs text-gray-300 text-center mt-2">
        또는 Top3에서 "집중" 버튼을 눌러보세요
      </p>
    </div>
  );
}
