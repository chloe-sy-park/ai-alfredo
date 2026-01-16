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
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">습관 관리</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="dark:text-gray-300" />
          </button>
        </div>

        {/* 습관 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {habits.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              등록된 습관이 없어요
            </p>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => {
                const streak = getStreak(habit.id);
                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <span className="text-2xl">{habit.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium dark:text-white">{habit.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {habit.frequency === 'daily' ? '매일' : '매주'} {habit.targetCount}
                        {habit.unit}
                      </p>
                    </div>
                    {streak > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                        <Flame size={14} />
                        <span className="text-xs font-bold">{streak}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 습관 추가 폼 */}
          {isAdding && (
            <div className="mt-4 p-4 bg-[#A996FF]/10 dark:bg-[#A996FF]/20 rounded-xl space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 block mb-2">
                  이모지 선택
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewHabit({ ...newHabit, icon: emoji })}
                      className={`w-10 h-10 text-xl rounded-lg transition-colors ${
                        newHabit.icon === emoji
                          ? 'bg-[#A996FF] text-white'
                          : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 block mb-2">
                  습관 이름
                </label>
                <input
                  type="text"
                  value={newHabit.title}
                  onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                  placeholder="예: 물 마시기"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A996FF]"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-300 block mb-2">
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
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A996FF]"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-20">
                  <label className="text-sm text-gray-600 dark:text-gray-300 block mb-2">
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
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-[#A996FF]"
                  />
                </div>

                <div className="w-20">
                  <label className="text-sm text-gray-600 dark:text-gray-300 block mb-2">
                    단위
                  </label>
                  <input
                    type="text"
                    value={newHabit.unit}
                    onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                    placeholder="회"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-[#A996FF]"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAddHabit}
                  disabled={!newHabit.title.trim()}
                  className="flex-1 py-2 bg-[#A996FF] text-white rounded-lg hover:bg-[#8B7BE8] disabled:opacity-50 transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        {!isAdding && (
          <div className="p-4 border-t dark:border-gray-700">
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#A996FF] text-white rounded-xl font-medium hover:bg-[#8B7BE8] transition-colors"
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
