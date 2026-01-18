import { useState, useEffect } from 'react';
import { Check, Plus, X, Pin, Lightbulb } from 'lucide-react';
import {
  MemoItem,
  getMemos,
  addMemo,
  toggleMemoComplete,
  toggleMemoPin,
  deleteMemo
} from '../../services/quickMemo';

export default function QuickMemoCard() {
  var [memos, setMemos] = useState<MemoItem[]>([]);
  var [isAdding, setIsAdding] = useState(false);
  var [newContent, setNewContent] = useState('');
  var [showCompleted, setShowCompleted] = useState(false);

  useEffect(function() {
    loadMemos();
  }, []);

  function loadMemos() {
    var data = getMemos();
    setMemos(data);
  }

  function handleAdd() {
    if (!newContent.trim()) return;

    addMemo(newContent.trim());
    loadMemos();
    setNewContent('');
    setIsAdding(false);
  }

  function handleToggleComplete(id: string) {
    toggleMemoComplete(id);
    loadMemos();
  }

  function handleTogglePin(id: string) {
    toggleMemoPin(id);
    loadMemos();
  }

  function handleDelete(id: string) {
    deleteMemo(id);
    loadMemos();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewContent('');
    }
  }

  var activeMemos = memos.filter(function(m) { return !m.completed; });
  var completedMemos = memos.filter(function(m) { return m.completed; });
  var displayMemos = showCompleted ? memos : activeMemos;

  return (
    <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} style={{ color: 'var(--state-warning)' }} />
          <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>기억해야 할 것</h2>
          {activeMemos.length > 0 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)', color: 'var(--text-primary)' }}
            >
              {activeMemos.length}
            </span>
          )}
        </div>
        {completedMemos.length > 0 && (
          <button
            onClick={function() { setShowCompleted(!showCompleted); }}
            className="text-xs transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {showCompleted ? '미완료만' : '완료 포함 (' + completedMemos.length + ')'}
          </button>
        )}
      </div>

      {/* 메모 리스트 */}
      <div className="space-y-2">
        {displayMemos.map(function(memo) {
          return (
            <div
              key={memo.id}
              className="flex items-start gap-2 p-3 rounded-xl transition-all"
              style={memo.completed
                ? { backgroundColor: 'var(--surface-subtle)' }
                : memo.pinned
                  ? { backgroundColor: 'var(--state-warning-bg)', border: '1px solid var(--state-warning)' }
                  : { backgroundColor: 'var(--surface-subtle)' }
              }
            >
              {/* 체크박스 */}
              <button
                onClick={function() { handleToggleComplete(memo.id); }}
                aria-label={memo.completed ? '완료 취소' : '완료 처리'}
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                style={memo.completed
                  ? { backgroundColor: 'var(--state-success)', borderColor: 'var(--state-success)', color: 'white' }
                  : { borderColor: 'var(--border-default)' }
                }
              >
                {memo.completed && <Check size={12} />}
              </button>

              {/* 내용 */}
              <p
                className={'flex-1 text-sm leading-relaxed ' + (memo.completed ? 'line-through' : '')}
                style={{ color: memo.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
              >
                {memo.content}
              </p>

              {/* 액션 버튼들 - 터치타겟 44px */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!memo.completed && (
                  <button
                    onClick={function() { handleTogglePin(memo.id); }}
                    aria-label={memo.pinned ? '고정 해제' : '상단 고정'}
                    className="p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    style={{ color: memo.pinned ? 'var(--state-warning)' : 'var(--text-tertiary)' }}
                  >
                    <Pin size={16} className={memo.pinned ? 'fill-current' : ''} />
                  </button>
                )}
                <button
                  onClick={function() { handleDelete(memo.id); }}
                  aria-label="메모 삭제"
                  className="p-2.5 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {/* 추가 입력 */}
        {isAdding ? (
          <div
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{ backgroundColor: 'var(--state-warning-bg)', border: '1px solid var(--state-warning)' }}
          >
            <input
              type="text"
              value={newContent}
              onChange={function(e) { setNewContent(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder="기억할 것을 입력하세요"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={!newContent.trim()}
              className="text-xs px-3 py-1.5 font-medium rounded-lg disabled:opacity-50 min-h-[44px]"
              style={{ backgroundColor: 'var(--state-warning)', color: 'var(--text-primary)' }}
            >
              추가
            </button>
            <button
              onClick={function() { setIsAdding(false); setNewContent(''); }}
              aria-label="입력 취소"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={function() { setIsAdding(true); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-colors border border-dashed min-h-[44px]"
            style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-default)' }}
          >
            <Plus size={16} />
            <span className="text-sm">메모 추가</span>
          </button>
        )}
      </div>

      {/* 빈 상태 */}
      {displayMemos.length === 0 && !isAdding && (
        <div className="text-center py-4">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>기억해야 할 것을 적어두세요</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)', opacity: 0.7 }}>중요한 건 📌 고정해서 항상 위에!</p>
        </div>
      )}
    </div>
  );
}
