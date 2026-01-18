import { useState, useEffect } from 'react';
import { Check, Plus, X, GripVertical, MessageCircle } from 'lucide-react';
import {
  Top3Item,
  getTodayTop3,
  addTop3Item,
  deleteTop3Item,
  saveTop3,
  getTop3Progress
} from '../../services/top3';
import Card from '../common/Card';
import Button from '../common/Button';
import RingProgress from '../common/RingProgress';
import { CelebrationParticles } from '../common/SuccessFeedback';

interface TodayTop3Props {
  onFocusSelect?: (item: Top3Item) => void;
  mode?: 'all' | 'work' | 'life';  // 페이지별 필터링 모드
}

export default function TodayTop3({ onFocusSelect, mode = 'all' }: TodayTop3Props) {
  var [allItems, setAllItems] = useState<Top3Item[]>([]);
  var [isAdding, setIsAdding] = useState(false);
  var [newTitle, setNewTitle] = useState('');
  var [dragIndex, setDragIndex] = useState<number | null>(null);
  var [justCompletedAll, setJustCompletedAll] = useState(false);
  var [previousProgress, setPreviousProgress] = useState(0);

  useEffect(function() {
    loadItems();
  }, []);

  // mode에 따른 필터링된 아이템
  var items = allItems.filter(function(item) {
    if (mode === 'all') return true;
    if (mode === 'work') return !item.isPersonal;
    if (mode === 'life') return item.isPersonal;
    return true;
  });

  // 진도 추적 및 100% 달성 감지
  useEffect(function() {
    var progress = getTop3Progress();
    
    // 방금 100% 달성했을 때
    if (previousProgress < 100 && progress.percent === 100 && progress.total > 0) {
      setJustCompletedAll(true);
      var timer = setTimeout(function() { setJustCompletedAll(false); }, 3000);
      return function() { clearTimeout(timer); };
    }
    
    setPreviousProgress(progress.percent);
  }, [items, previousProgress]);

  function loadItems() {
    var data = getTodayTop3();
    if (data) {
      setAllItems(data.items);
    } else {
      setAllItems([]);
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

  // PRD R4: 완료는 집중 세션 종료 또는 채팅으로만 처리
  // 직접 체크박스 토글 제거됨

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

    // 필터링된 아이템 재정렬
    var filteredItems = [...items];
    var dragged = filteredItems[dragIndex];
    filteredItems.splice(dragIndex, 1);
    filteredItems.splice(idx, 0, dragged);

    // 전체 아이템에서 필터링된 아이템의 순서 반영
    var newAllItems = allItems.map(function(item) {
      var filteredIdx = filteredItems.findIndex(function(f) { return f.id === item.id; });
      if (filteredIdx !== -1) {
        return { ...item, order: filteredIdx };
      }
      return item;
    });

    setAllItems(newAllItems);
    setDragIndex(idx);
  }

  function handleDragEnd() {
    if (dragIndex !== null) {
      saveTop3(allItems);
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
    <>
      <Card className="animate-slide-up">
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
            <span className="text-xs px-2 py-1 bg-[#4ADE80]/20 text-[#4ADE80] rounded-full font-medium animate-scale-in">
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
                style={{ animationDelay: (idx * 50) + 'ms' }}
              >
                {/* 드래그 핸들 */}
                <GripVertical size={16} className="text-[#D4D4D4] flex-shrink-0" />
                
                {/* 우선순위 뱃지 */}
                <span className={'text-[10px] font-semibold px-3 py-1 rounded-full flex-shrink-0 ' + style.badge}>
                  {style.label}
                </span>

                {/* PRD R4: 완료 상태 표시 (읽기 전용) */}
                <div
                  className={[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    item.completed
                      ? 'bg-[#4ADE80] border-[#4ADE80] text-white'
                      : 'border-[#E5E5E5] bg-white',
                  ].join(' ')}
                >
                  {item.completed && <Check size={12} />}
                </div>

                {/* 제목 */}
                <span 
                  className={[
                    'flex-1 text-sm transition-all',
                    item.completed ? 'text-[#999999] line-through' : 'text-[#1A1A1A]',
                  ].join(' ')}
                >
                  {item.title}
                </span>
                
                {/* 집중 버튼 - PRD R4: 주요 액션은 "집중"으로 */}
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
                {/* 완료된 항목 표시 */}
                {item.completed && (
                  <span className="text-xs text-[#4ADE80] font-medium px-2">완료</span>
                )}
                
                {/* 삭제 버튼 */}
                <button
                  onClick={function() { handleDelete(item.id); }}
                  className="p-1 text-[#D4D4D4] hover:text-[#EF4444] flex-shrink-0 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}

          {/* 추가 입력 */}
          {isAdding ? (
            <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-[#A996FF]/50 bg-[#F0F0FF] animate-fade-in">
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
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-[#E5E5E5] text-[#999999] hover:border-[#A996FF] hover:text-[#A996FF] transition-all duration-fast min-h-[48px] active:scale-[0.98]"
            >
              <Plus size={16} />
              <span className="text-sm">추가하기 ({remainingSlots}개 남음)</span>
            </button>
          ) : null}
        </div>

        {/* 빈 상태 */}
        {items.length === 0 && !isAdding && (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-12 h-12 bg-neutral-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Plus size={20} className="text-neutral-400" />
            </div>
            <p className="text-sm text-[#666666] mb-1">오늘 꼭 해야 할 3가지를 정해보세요</p>
            <p className="text-xs text-[#999999]">적을수록 집중하기 좋아요 🎯</p>
          </div>
        )}

        {/* PRD R4: 완료는 채팅으로 안내 */}
        {items.length > 0 && items.some(function(i) { return !i.completed; }) && (
          <div className="flex items-center justify-center gap-1.5 pt-3 border-t border-[#F0F0F0] mt-3">
            <MessageCircle size={12} className="text-[#A996FF]" />
            <span className="text-[11px] text-[#999999]">
              완료하려면 채팅에서 "1번 완료" 라고 말해보세요
            </span>
          </div>
        )}
      </Card>

      {/* 100% 달성 축하 */}
      <CelebrationParticles trigger={justCompletedAll} />
    </>
  );
}