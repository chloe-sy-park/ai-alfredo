import { useState, useEffect } from 'react';
import { Check, Plus, X, GripVertical } from 'lucide-react';
import { 
  Top3Item, 
  getTodayTop3, 
  addTop3Item, 
  toggleTop3Complete, 
  deleteTop3Item,
  saveTop3,
  getTop3Progress
} from '../../services/top3';

interface TodayTop3Props {
  onFocusSelect?: (item: Top3Item) => void;
}

export default function TodayTop3({ onFocusSelect }: TodayTop3Props) {
  var [items, setItems] = useState<Top3Item[]>([]);
  var [isAdding, setIsAdding] = useState(false);
  var [newTitle, setNewTitle] = useState('');
  var [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(function() {
    loadItems();
  }, []);

  function loadItems() {
    var data = getTodayTop3();
    if (data) {
      setItems(data.items);
    } else {
      setItems([]);
    }
  }

  function handleAdd() {
    if (!newTitle.trim()) return;
    
    var result = addTop3Item(newTitle.trim());
    if (result) {
      loadItems();
      setNewTitle('');
      setIsAdding(false);
    }
  }

  function handleToggle(id: string) {
    toggleTop3Complete(id);
    loadItems();
  }

  function handleDelete(id: string) {
    deleteTop3Item(id);
    loadItems();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTitle('');
    }
  }

  // 드래그 앤 드롭
  function handleDragStart(idx: number) {
    setDragIndex(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    
    var newItems = [...items];
    var dragged = newItems[dragIndex];
    newItems.splice(dragIndex, 1);
    newItems.splice(idx, 0, dragged);
    
    // 순서 업데이트
    newItems = newItems.map(function(item, i) {
      return { ...item, order: i };
    });
    
    setItems(newItems);
    setDragIndex(idx);
  }

  function handleDragEnd() {
    if (dragIndex !== null) {
      saveTop3(items);
    }
    setDragIndex(null);
  }

  var progress = getTop3Progress();
  var remainingSlots = 3 - items.length;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-base">오늘의 Top 3</h2>
          {progress.total > 0 && (
            <span className="text-xs text-gray-400">
              {progress.completed}/{progress.total}
            </span>
          )}
        </div>
        {progress.percent === 100 && items.length > 0 && (
          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">
            완료! 🎉
          </span>
        )}
      </div>

      {/* 아이템 리스트 */}
      <div className="space-y-2">
        {items.map(function(item, idx) {
          var priorityColors = [
            'bg-red-100 text-red-600 border-red-200',
            'bg-orange-100 text-orange-600 border-orange-200',
            'bg-yellow-100 text-yellow-600 border-yellow-200'
          ];
          var priorityLabel = ['1st', '2nd', '3rd'];
          
          return (
            <div
              key={item.id}
              draggable
              onDragStart={function() { handleDragStart(idx); }}
              onDragOver={function(e) { handleDragOver(e, idx); }}
              onDragEnd={handleDragEnd}
              className={
                'flex items-center gap-2 p-3 rounded-xl border transition-all cursor-move ' +
                (item.completed 
                  ? 'bg-gray-50 border-gray-100' 
                  : 'bg-white border-gray-100 hover:border-lavender-200')
              }
            >
              {/* 드래그 핸들 */}
              <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
              
              {/* 우선순위 뱃지 */}
              <span className={'text-xs font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ' + priorityColors[idx]}>
                {priorityLabel[idx]}
              </span>
              
              {/* 체크박스 */}
              <button
                onClick={function() { handleToggle(item.id); }}
                className={
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ' +
                  (item.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 hover:border-lavender-400')
                }
              >
                {item.completed && <Check size={12} />}
              </button>
              
              {/* 제목 */}
              <span 
                className={
                  'flex-1 text-sm ' + 
                  (item.completed ? 'text-gray-400 line-through' : 'text-gray-700')
                }
              >
                {item.title}
              </span>
              
              {/* 집중 버튼 */}
              {!item.completed && onFocusSelect && (
                <button
                  onClick={function() { onFocusSelect(item); }}
                  className="text-xs px-2 py-1 bg-lavender-100 text-lavender-600 rounded-lg hover:bg-lavender-200 flex-shrink-0"
                >
                  집중
                </button>
              )}
              
              {/* 삭제 버튼 */}
              <button
                onClick={function() { handleDelete(item.id); }}
                className="p-1 text-gray-300 hover:text-red-400 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}

        {/* 추가 입력 */}
        {isAdding ? (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-lavender-200 bg-lavender-50">
            <span className="text-gray-400 text-sm">+</span>
            <input
              type="text"
              value={newTitle}
              onChange={function(e) { setNewTitle(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder="할 일을 입력하세요"
              className="flex-1 bg-transparent outline-none text-sm"
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="text-xs px-2 py-1 bg-lavender-400 text-white rounded-lg hover:bg-lavender-500 disabled:opacity-50"
            >
              추가
            </button>
            <button
              onClick={function() { setIsAdding(false); setNewTitle(''); }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        ) : remainingSlots > 0 ? (
          <button
            onClick={function() { setIsAdding(true); }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-lavender-300 hover:text-lavender-500 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm">추가하기 ({remainingSlots}개 남음)</span>
          </button>
        ) : null}
      </div>

      {/* 빈 상태 */}
      {items.length === 0 && !isAdding && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400 mb-2">오늘 꼭 해야 할 3가지를 정해보세요</p>
          <p className="text-xs text-gray-300">적을수록 집중하기 좋아요 🎯</p>
        </div>
      )}

      {/* 진행률 바 */}
      {items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-400 rounded-full transition-all duration-300"
                style={{ width: progress.percent + '%' }}
              />
            </div>
            <span className="text-xs text-gray-400">{progress.percent}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
