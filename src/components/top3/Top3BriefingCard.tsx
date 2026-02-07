/**
 * Top 3 Briefing Card - MVP 핵심 컴포넌트
 * 오늘의 Top 3 + 알프레도 판단 + 드래그 정렬
 */

import { useState, useEffect, useCallback } from 'react';
import { Check, Plus, X, GripVertical, Sparkles } from 'lucide-react';
import {
  Top3Item,
  getTodayTop3,
  addTop3Item,
  deleteTop3Item,
  toggleTop3Complete,
  saveTop3,
  getTop3Progress
} from '../../services/top3';
import Card from '../common/Card';
import Button from '../common/Button';
import RingProgress from '../common/RingProgress';

interface JudgmentData {
  headline: string;
  reason: string;
  suggestion?: string;
}

interface Top3BriefingCardProps {
  judgment?: JudgmentData | null;
  isLoadingJudgment?: boolean;
  onRequestBriefing?: () => void;
}

export default function Top3BriefingCard({
  judgment,
  isLoadingJudgment = false,
  onRequestBriefing,
}: Top3BriefingCardProps) {
  const [allItems, setAllItems] = useState<Top3Item[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = useCallback(() => {
    const data = getTodayTop3();
    if (data) {
      setAllItems(data.items);
    } else {
      setAllItems([]);
    }
  }, []);

  function handleAdd() {
    if (!newTitle.trim()) return;
    const result = addTop3Item(newTitle.trim());
    if (result) {
      loadItems();
      setNewTitle('');
      setIsAdding(false);
    }
  }

  function handleToggleComplete(id: string) {
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

    const newItems = [...allItems];
    const dragged = newItems[dragIndex];
    newItems.splice(dragIndex, 1);
    newItems.splice(idx, 0, dragged);

    setAllItems(newItems);
    setDragIndex(idx);
  }

  function handleDragEnd() {
    if (dragIndex !== null) {
      saveTop3(allItems);
    }
    setDragIndex(null);
  }

  const progress = getTop3Progress();
  const remainingSlots = 3 - allItems.length;

  return (
    <div className="space-y-3">
      {/* 알프레도 판단 섹션 */}
      {(judgment || isLoadingJudgment) && (
        <Card className="animate-fade-in">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: 'var(--surface-subtle)' }}
            >
              <img
                src="/assets/alfredo/avatar/alfredo-avatar-48.png"
                alt="알프레도"
                className="w-8 h-8 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-xl">🎩</span>'; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              {isLoadingJudgment ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ) : judgment ? (
                <>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {judgment.headline}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {judgment.reason}
                  </p>
                  {judgment.suggestion && (
                    <p className="text-xs mt-2 px-3 py-2 rounded-lg" style={{
                      backgroundColor: 'var(--surface-subtle)',
                      color: 'var(--text-secondary)'
                    }}>
                      {judgment.suggestion}
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </Card>
      )}

      {/* Top 3 리스트 */}
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
          {progress.percent === 100 && allItems.length > 0 && (
            <span
              className="text-xs px-2 py-1 rounded-full font-medium animate-scale-in"
              style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)', color: 'var(--state-success)' }}
            >
              완료!
            </span>
          )}
          {onRequestBriefing && !judgment && !isLoadingJudgment && allItems.length > 0 && (
            <button
              onClick={onRequestBriefing}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                color: 'var(--accent-primary)',
              }}
            >
              <Sparkles size={12} />
              판단 요청
            </button>
          )}
        </div>

        {/* 아이템 리스트 */}
        <div className="space-y-2">
          {allItems.map((item, idx) => (
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

              {/* 완료 토글 */}
              <button
                onClick={() => handleToggleComplete(item.id)}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors min-w-[24px] min-h-[24px]"
                style={{
                  backgroundColor: item.completed ? 'var(--state-success)' : 'var(--surface-default)',
                  borderColor: item.completed ? 'var(--state-success)' : 'var(--border-default)',
                  color: item.completed ? 'white' : 'transparent'
                }}
              >
                {item.completed && <Check size={14} />}
              </button>

              {/* 제목 */}
              <span
                className={`flex-1 text-sm transition-all ${item.completed ? 'line-through' : ''}`}
                style={{ color: item.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
              >
                {item.title}
              </span>

              {/* 시간 표시 */}
              {item.timeRange && (
                <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                  {item.timeRange}
                </span>
              )}

              {/* 삭제 버튼 */}
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 flex-shrink-0 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                style={{ color: 'var(--text-disabled)' }}
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
                className="p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
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
            >
              <Plus size={16} />
              <span className="text-sm">추가하기 ({remainingSlots}개 남음)</span>
            </button>
          ) : null}
        </div>

        {/* 빈 상태 */}
        {allItems.length === 0 && !isAdding && (
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
      </Card>
    </div>
  );
}
