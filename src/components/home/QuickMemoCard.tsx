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
    <div className="bg-white rounded-xl p-4 shadow-card">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-[#FFD700]" />
          <h2 className="font-semibold text-base text-[#1A1A1A]">기억해야 할 것</h2>
          {activeMemos.length > 0 && (
            <span className="text-[10px] font-bold bg-[#FFD700]/20 text-[#1A1A1A] px-2 py-0.5 rounded-full">
              {activeMemos.length}
            </span>
          )}
        </div>
        {completedMemos.length > 0 && (
          <button
            onClick={function() { setShowCompleted(!showCompleted); }}
            className="text-xs text-[#999999] hover:text-[#666666]"
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
              className={
                'flex items-start gap-2 p-3 rounded-xl transition-all ' +
                (memo.completed 
                  ? 'bg-[#F5F5F5]' 
                  : memo.pinned 
                    ? 'bg-[#FFFBEB] border border-[#FFD700]/30' 
                    : 'bg-[#F5F5F5]')
              }
            >
              {/* 체크박스 */}
              <button
                onClick={function() { handleToggleComplete(memo.id); }}
                className={
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ' +
                  (memo.completed 
                    ? 'bg-[#4ADE80] border-[#4ADE80] text-white' 
                    : 'border-[#E5E5E5] hover:border-[#FFD700]')
                }
              >
                {memo.completed && <Check size={12} />}
              </button>
              
              {/* 내용 */}
              <p className={
                'flex-1 text-sm leading-relaxed ' + 
                (memo.completed ? 'text-[#999999] line-through' : 'text-[#1A1A1A]')
              }>
                {memo.content}
              </p>
              
              {/* 액션 버튼들 */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!memo.completed && (
                  <button
                    onClick={function() { handleTogglePin(memo.id); }}
                    className={
                      'p-1.5 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center ' +
                      (memo.pinned 
                        ? 'text-[#FFD700] hover:bg-[#FFD700]/10' 
                        : 'text-[#999999] hover:text-[#FFD700] hover:bg-[#F5F5F5]')
                    }
                  >
                    <Pin size={14} className={memo.pinned ? 'fill-current' : ''} />
                  </button>
                )}
                <button
                  onClick={function() { handleDelete(memo.id); }}
                  className="p-1.5 text-[#999999] hover:text-[#EF4444] hover:bg-[#F5F5F5] rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {/* 추가 입력 */}
        {isAdding ? (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-[#FFD700]/50 bg-[#FFFBEB]">
            <input
              type="text"
              value={newContent}
              onChange={function(e) { setNewContent(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder="기억할 것을 입력하세요"
              className="flex-1 bg-transparent outline-none text-sm text-[#1A1A1A] placeholder:text-[#999999]"
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={!newContent.trim()}
              className="text-xs px-3 py-1.5 bg-[#FFD700] text-[#1A1A1A] font-medium rounded-lg hover:brightness-110 disabled:opacity-50 min-h-[32px]"
            >
              추가
            </button>
            <button
              onClick={function() { setIsAdding(false); setNewContent(''); }}
              className="p-1.5 text-[#999999] hover:text-[#666666] min-w-[32px] min-h-[32px] flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={function() { setIsAdding(true); }}
            className="w-full flex items-center justify-center gap-2 py-3 text-[#999999] hover:text-[#FFD700] hover:bg-[#FFFBEB] rounded-xl transition-colors border border-dashed border-[#E5E5E5] hover:border-[#FFD700] min-h-[44px]"
          >
            <Plus size={16} />
            <span className="text-sm">메모 추가</span>
          </button>
        )}
      </div>

      {/* 빈 상태 */}
      {displayMemos.length === 0 && !isAdding && (
        <div className="text-center py-4">
          <p className="text-sm text-[#999999]">기억해야 할 것을 적어두세요</p>
          <p className="text-xs text-[#CCCCCC] mt-1">중요한 건 📌 고정해서 항상 위에!</p>
        </div>
      )}
    </div>
  );
}
