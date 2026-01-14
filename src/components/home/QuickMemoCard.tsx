import { useState, useEffect } from 'react';
import { Check, Plus, X, Pin, Lightbulb } from 'lucide-react';
import { 
  MemoItem, 
  getMemos, 
  addMemo, 
  toggleMemoComplete, 
  toggleMemoPin,
  deleteMemo,
  getActiveMemoCount
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
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-400" />
          <h2 className="font-semibold text-base">기억해야 할 것</h2>
          {activeMemos.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
              {activeMemos.length}
            </span>
          )}
        </div>
        {completedMemos.length > 0 && (
          <button
            onClick={function() { setShowCompleted(!showCompleted); }}
            className="text-xs text-gray-400 hover:text-gray-600"
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
                'flex items-start gap-2 p-2.5 rounded-xl transition-all ' +
                (memo.completed 
                  ? 'bg-gray-50' 
                  : memo.pinned 
                    ? 'bg-amber-50 border border-amber-100' 
                    : 'bg-gray-50')
              }
            >
              {/* 체크박스 */}
              <button
                onClick={function() { handleToggleComplete(memo.id); }}
                className={
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ' +
                  (memo.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 hover:border-amber-400')
                }
              >
                {memo.completed && <Check size={12} />}
              </button>
              
              {/* 내용 */}
              <p className={
                'flex-1 text-sm leading-relaxed ' + 
                (memo.completed ? 'text-gray-400 line-through' : 'text-gray-700')
              }>
                {memo.content}
              </p>
              
              {/* 액션 버튼들 */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!memo.completed && (
                  <button
                    onClick={function() { handleTogglePin(memo.id); }}
                    className={
                      'p-1 rounded transition-colors ' +
                      (memo.pinned 
                        ? 'text-amber-500 hover:text-amber-600' 
                        : 'text-gray-300 hover:text-amber-400')
                    }
                  >
                    <Pin size={14} className={memo.pinned ? 'fill-current' : ''} />
                  </button>
                )}
                <button
                  onClick={function() { handleDelete(memo.id); }}
                  className="p-1 text-gray-300 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {/* 추가 입력 */}
        {isAdding ? (
          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50">
            <input
              type="text"
              value={newContent}
              onChange={function(e) { setNewContent(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder="기억할 것을 입력하세요"
              className="flex-1 bg-transparent outline-none text-sm"
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={!newContent.trim()}
              className="text-xs px-2 py-1 bg-amber-400 text-white rounded-lg hover:bg-amber-500 disabled:opacity-50"
            >
              추가
            </button>
            <button
              onClick={function() { setIsAdding(false); setNewContent(''); }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={function() { setIsAdding(true); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm">메모 추가</span>
          </button>
        )}
      </div>

      {/* 빈 상태 */}
      {displayMemos.length === 0 && !isAdding && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">기억해야 할 것을 적어두세요</p>
          <p className="text-xs text-gray-300 mt-1">중요한 건 📌 고정해서 항상 위에!</p>
        </div>
      )}
    </div>
  );
}
