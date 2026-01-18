/**
 * 습관 관리 컴포넌트
 * 습관 추가, 삭제 및 상세 관리
 */

import { useState } from 'react';
import { X, Plus, Trash2, Flame } from 'lucide-react';
import { addHabit, deleteHabit, getStreak, Habit } from '../../services/habits';

const EMOJI_OPTIONS = ['💧', '🏃', '😴', '📖', '🧘', '🍎', '💊', '🌅', '✍️', '🎯', '💪', '🧠'];

const FREQUENCY_OPTIONS = [
  { id: 'daily', label: '매일' },
  { id: 'weekly', label: '매주' },
] as const;

interface HabitManagerProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  onUpdate: () => void;
}

export default function HabitManager({ isOpen, onClose, habits, onUpdate }: HabitManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    icon: '💧',
    frequency: 'daily' as 'daily' | 'weekly',
    targetCount: 1,
    unit: '회',
  });

  const handleAddHabit = () => {
    if (!newHabit.title.trim()) return;

    addHabit(newHabit);
    setNewHabit({
      title: '',
      icon: '💧',
      frequency: 'daily',
      targetCount: 1,
      unit: '회',
    });
    setIsAdding(false);
    onUpdate();
  };

  const handleDeleteHabit = (habitId: string) => {
    if (confirm('이 습관을 삭제하시겠어요?')) {
      deleteHabit(habitId);
      onUpdate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--surface-default)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-manager-title"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <h2 id="habit-manager-title" className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>습관 관리</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 습관 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {habits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                등록된 습관이 없어요
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                새로운 습관을 추가해보세요
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => {
                const streak = getStreak(habit.id);
                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: 'var(--surface-subtle)' }}
                  >
                    <span className="text-2xl">{habit.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{habit.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {habit.frequency === 'daily' ? '매일' : '매주'} {habit.targetCount}
                        {habit.unit}
                      </p>
                    </div>
                    {streak > 0 && (
                      <div
                        className="flex items-center gap-1 px-2 py-1 rounded-lg"
                        style={{ backgroundColor: 'var(--state-warning-bg)', color: 'var(--state-warning)' }}
                      >
                        <Flame size={14} />
                        <span className="text-xs font-bold">{streak}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      aria-label={`${habit.title} 삭제`}
                      className="p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 습관 추가 폼 */}
          {isAdding && (
            <div
              className="mt-4 p-4 rounded-xl space-y-4"
              style={{ backgroundColor: 'rgba(169, 150, 255, 0.1)' }}
            >
              <div>
                <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>
                  이모지 선택
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewHabit({ ...newHabit, icon: emoji })}
                      aria-label={`이모지 ${emoji} 선택`}
                      aria-pressed={newHabit.icon === emoji}
                      className="w-10 h-10 text-xl rounded-lg transition-colors"
                      style={newHabit.icon === emoji
                        ? { backgroundColor: 'var(--accent-primary)', color: 'white' }
                        : { backgroundColor: 'var(--surface-default)' }
                      }
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>
                  습관 이름
                </label>
                <input
                  type="text"
                  value={newHabit.title}
                  onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                  placeholder="예: 물 마시기"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--surface-default)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                    '--tw-ring-color': 'var(--accent-primary)'
                  } as React.CSSProperties}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>
                    빈도
                  </label>
                  <select
                    value={newHabit.frequency}
                    onChange={(e) =>
                      setNewHabit({
                        ...newHabit,
                        frequency: e.target.value as 'daily' | 'weekly',
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--surface-default)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                      '--tw-ring-color': 'var(--accent-primary)'
                    } as React.CSSProperties}
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-20">
                  <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>
                    목표
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={newHabit.targetCount}
                    onChange={(e) =>
                      setNewHabit({ ...newHabit, targetCount: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 rounded-lg border text-center focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--surface-default)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                      '--tw-ring-color': 'var(--accent-primary)'
                    } as React.CSSProperties}
                  />
                </div>

                <div className="w-20">
                  <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>
                    단위
                  </label>
                  <input
                    type="text"
                    value={newHabit.unit}
                    onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                    placeholder="회"
                    className="w-full px-3 py-2 rounded-lg border text-center focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--surface-default)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                      '--tw-ring-color': 'var(--accent-primary)'
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 rounded-lg transition-colors min-h-[44px]"
                  style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}
                >
                  취소
                </button>
                <button
                  onClick={handleAddHabit}
                  disabled={!newHabit.title.trim()}
                  className="flex-1 py-2 rounded-lg disabled:opacity-50 transition-colors min-h-[44px]"
                  style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                >
                  추가
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        {!isAdding && (
          <div className="p-4 border-t" style={{ borderColor: 'var(--border-default)', paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors min-h-[44px]"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
            >
              <Plus size={18} />
              새 습관 추가
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
