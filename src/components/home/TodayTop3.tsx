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
  mode?: 'all' | 'work' | 'life';
}

export default function TodayTop3({ onFocusSelect, mode = 'all' }: TodayTop3Props) {
  const [allItems, setAllItems] = useState<Top3Item[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [justCompletedAll, setJustCompletedAll] = useState(false);
  const [previousProgress, setPreviousProgress] = useState(0);

  useEffect(() => {
    loadItems();
  }, []);

  const items = allItems.filter((item) => {
    if (mode === 'all') return true;
    if (mode === 'work') return !item.isPersonal;
    if (mode === 'life') return item.isPersonal;
    return true;
  });

  useEffect(() => {
    const progress = getTop3Progress();
    if (previousProgress < 100 && progress.percent === 100 && progress.total > 0) {
      setJustCompletedAll(true);
      const timer = setTimeout(() => setJustCompletedAll(false), 3000);
      return () => clearTimeout(timer);
    }
    setPreviousProgress(progress.percent);
  }, [items, previousProgress]);

  function loadItems() {
    const data = getTodayTop3();
    if (data) {
      setAllItems(data.items);
    } else {
      setAllItems([]);
    }
  }

  function handleAdd() {
    if (!newTitle.trim()) return;
    const result = addTop3Item(newTitle.trim());
    if (result) {
      loadItems();
      setNewTitle('');
      setIsAdding(false);
    }
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

  function handleDragStart(idx: number) {
    setDragIndex(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;

    const filteredItems = [...items];
    const dragged = filteredItems[dragIndex];
    filteredItems.splice(dragIndex, 1);
    filteredItems.splice(idx, 0, dragged);

    const newAllItems = allItems.map((item) => {
      const filteredIdx = filteredItems.findIndex((f) => f.id === item.id);
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

  const progress = getTop3Progress();
  const remainingSlots = 3 - items.length;

  return (
    <>
      <Card className="animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
              오늘의 Top 3
            </h2>
            {progress.total > 0 && (
              <RingProgress
                percent={progress.percent}
                size="sm"
                color={progress.percent === 100 ? 'success' : 'primary'}
                centerContent={
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                    {progress.completed}/{progress.total}
                  </span>
                }
              />
            )}
          </div>
          {progress.percent === 100 && items.length > 0 && (
            <span
              className="text-xs px-2 py-1 rounded-full font-medium animate-scale-in"
              style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)', color: 'var(--state-success)' }}
            >
              완료!
            </span>
          )}
        </div>

        {/* 아이템 리스트 */}
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 p-3 rounded-xl transition-all cursor-move ${
                item.completed ? 'opacity-60' : 'hover:shadow-card-hover'
              } ${dragIndex === idx ? 'shadow-card-hover scale-[1.02]' : ''}`}
              style={{
                backgroundColor: 'var(--surface-default)',
                borderLeft: `3px solid ${idx === 0 ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                animationDelay: `${idx * 50}ms`
              }}
            >
              {/* 드래그 핸들 */}
              <GripVertical size={16} style={{ color: 'var(--text-disabled)' }} className="flex-shrink-0" />

              {/* 우선순위 뱃지 */}
              <span
                className="text-[10px] font-semibold px-3 py-1 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: idx === 0 ? 'var(--accent-primary)' : 'var(--surface-subtle)',
                  color: idx === 0 ? 'var(--accent-on)' : 'var(--text-tertiary)'
                }}
              >
                {idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'}
              </span>

              {/* 완료 상태 표시 (읽기 전용) */}
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: item.completed ? 'var(--state-success)' : 'var(--surface-default)',
                  borderColor: item.completed ? 'var(--state-success)' : 'var(--border-default)',
                  color: item.completed ? 'white' : 'transparent'
                }}
              >
                {item.completed && <Check size={12} />}
              </div>

              {/* 제목 */}
              <span
                className={`flex-1 text-sm transition-all ${item.completed ? 'line-through' : ''}`}
                style={{ color: item.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
              >
                {item.title}
              </span>

              {/* 집중 버튼 */}
              {!item.completed && onFocusSelect && (
                <Button
                  variant={idx === 0 ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onFocusSelect(item)}
                  className={idx === 0 ? '' : 'text-xs'}
                  style={idx !== 0 ? { color: 'var(--text-tertiary)' } : {}}
                >
                  집중
                </Button>
              )}

              {/* 완료된 항목 표시 */}
              {item.completed && (
                <span className="text-xs font-medium px-2" style={{ color: 'var(--state-success)' }}>
                  완료
                </span>
              )}

              {/* 삭제 버튼 */}
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 flex-shrink-0 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
                style={{ color: 'var(--text-disabled)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--state-danger)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-disabled)')}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* 추가 입력 */}
          {isAdding ? (
            <div
              className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed animate-fade-in"
              style={{
                borderColor: 'var(--accent-primary)',
                backgroundColor: 'var(--surface-subtle)'
              }}
            >
              <Plus size={16} style={{ color: 'var(--accent-primary)' }} className="flex-shrink-0" />
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="할 일을 입력하세요"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
                autoFocus
              />
              <Button size="sm" onClick={handleAdd} disabled={!newTitle.trim()}>
                추가
              </Button>
              <button
                onClick={() => { setIsAdding(false); setNewTitle(''); }}
                className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <X size={14} />
              </button>
            </div>
          ) : remainingSlots > 0 ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed transition-all min-h-[48px] active:scale-[0.98]"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--text-tertiary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <Plus size={16} />
              <span className="text-sm">추가하기 ({remainingSlots}개 남음)</span>
            </button>
          ) : null}
        </div>

        {/* 빈 상태 */}
        {items.length === 0 && !isAdding && (
          <div className="text-center py-6 animate-fade-in">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: 'var(--surface-subtle)' }}
            >
              <Plus size={20} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              오늘 꼭 해야 할 3가지를 정해보세요
            </p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              적을수록 집중하기 좋아요
            </p>
          </div>
        )}

        {/* 완료 안내 */}
        {items.length > 0 && items.some((i) => !i.completed) && (
          <div
            className="flex items-center justify-center gap-1.5 pt-3 mt-3"
            style={{ borderTop: '1px solid var(--border-default)' }}
          >
            <MessageCircle size={12} style={{ color: 'var(--accent-primary)' }} />
            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              완료하려면 채팅에서 "1번 완료" 라고 말해보세요
            </span>
          </div>
        )}
      </Card>

      <CelebrationParticles trigger={justCompletedAll} />
    </>
  );
}
