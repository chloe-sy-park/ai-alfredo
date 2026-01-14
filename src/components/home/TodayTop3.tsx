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
import Card from '../common/Card';
import Button from '../common/Button';
import RingProgress from '../common/RingProgress';

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

  // Priority 스타일 (1번은 골드)
  var priorityStyles = [
    { border: 'border-l-[3px] border-l-[#FFD700]', badge: 'bg-[#FFD700] text-[#1A1A1A]', label: '1st' },
    { border: 'border-l-[3px] border-l-[#D4D4D4]', badge: 'bg-[#E5E5E5] text-[#666666]', label: '2nd' },
    { border: 'border-l-[3px] border-l-[#E5E5E5]', badge: 'bg-[#F5F5F5] text-[#999999]', label: '3rd' },
  ];

  return (
    <Card className="animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-base text-[#1A1A1A]">오늘의 Top 3</h2>
          {progress.total > 0 && (
            <RingProgress
              percent={progress.percent}
              size="sm"
              color={progress.percent === 100 ? 'success' : 'primary'}
              centerContent={
                <span className="text-[10px] font-bold text-[#666666]">
                  {progress.completed}/{progress.total}
                </span>
              }
            />
          )}
        </div>
        {progress.percent === 100 && items.length > 0 && (
          <span className="text-xs px-2 py-1 bg-[#4ADE80]/20 text-[#4ADE80] rounded-full font-medium">
            완료! 🎉
          </span>
        )}
      </div>

      {/* 아이템 리스트 */}
      <div className="space-y-2">
        {items.map(function(item, idx) {
          var style = priorityStyles[idx];
          
          return (
            <div
              key={item.id}
              draggable
              onDragStart={function() { handleDragStart(idx); }}
              onDragOver={function(e) { handleDragOver(e, idx); }}
              onDragEnd={handleDragEnd}
              className={[
                'flex items-center gap-2 p-3 rounded-xl bg-white transition-all cursor-move',
                style.border,
                item.completed ? 'opacity-60' : 'hover:shadow-card-hover',
                dragIndex === idx ? 'shadow-card-hover scale-[1.02]' : '',
              ].join(' ')}
            >
              {/* 드래그 핸들 */}
              <GripVertical size={16} className="text-[#D4D4D4] flex-shrink-0" />
              
              {/* 우선순위 뱃지 */}
              <span className={'text-[10px] font-semibold px-3 py-1 rounded-full flex-shrink-0 ' + style.badge}>
                {style.label}
              </span>
              
              {/* 체크박스 */}
              <button
                onClick={function() { handleToggle(item.id); }}
                className={[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  item.completed 
                    ? 'bg-[#4ADE80] border-[#4ADE80] text-white' 
                    : idx === 0 
                      ? 'border-[#FFD700] hover:bg-[#FFD700]/10'
                      : 'border-[#D4D4D4] hover:border-[#A996FF]',
                ].join(' ')}
              >
                {item.completed && <Check size={12} />}
              </button>
              
              {/* 제목 */}
              <span 
                className={[
                  'flex-1 text-sm',
                  item.completed ? 'text-[#999999] line-through' : 'text-[#1A1A1A]',
                ].join(' ')}
              >
                {item.title}
              </span>
              
              {/* 집중 버튼 (1순위만 골드) */}
              {!item.completed && onFocusSelect && (
                <Button
                  variant={idx === 0 ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={function() { onFocusSelect(item); }}
                  className={idx === 0 ? '' : 'text-xs text-[#999999]'}
                >
                  집중
                </Button>
              )}
              
              {/* 삭제 버튼 */}
              <button
                onClick={function() { handleDelete(item.id); }}
                className="p-1 text-[#D4D4D4] hover:text-[#EF4444] flex-shrink-0 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}

        {/* 추가 입력 */}
        {isAdding ? (
          <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-[#A996FF]/50 bg-[#F0F0FF]">
            <Plus size={16} className="text-[#A996FF] flex-shrink-0" />
            <input
              type="text"
              value={newTitle}
              onChange={function(e) { setNewTitle(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder="할 일을 입력하세요"
              className="flex-1 bg-transparent outline-none text-sm text-[#1A1A1A]"
              autoFocus
            />
            <Button size="sm" onClick={handleAdd} disabled={!newTitle.trim()}>
              추가
            </Button>
            <button
              onClick={function() { setIsAdding(false); setNewTitle(''); }}
              className="p-1 text-[#999999] hover:text-[#666666] min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>
        ) : remainingSlots > 0 ? (
          <button
            onClick={function() { setIsAdding(true); }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-[#E5E5E5] text-[#999999] hover:border-[#A996FF] hover:text-[#A996FF] transition-colors min-h-[48px]"
          >
            <Plus size={16} />
            <span className="text-sm">추가하기 ({remainingSlots}개 남음)</span>
          </button>
        ) : null}
      </div>

      {/* 빈 상태 */}
      {items.length === 0 && !isAdding && (
        <div className="text-center py-6">
          <p className="text-sm text-[#666666] mb-1">오늘 꼭 해야 할 3가지를 정해보세요</p>
          <p className="text-xs text-[#999999]">적을수록 집중하기 좋아요 🎯</p>
        </div>
      )}
    </Card>
  );
}
