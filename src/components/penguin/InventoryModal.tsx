/**
 * InventoryModal - 펭귄 인벤토리 모달
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Backpack, Check, Star } from 'lucide-react';
import { usePenguinStore, type InventoryItem } from '../../stores/penguinStore';

const CATEGORY_LABELS: Record<string, string> = {
  hat: '모자',
  accessory: '악세서리',
  background: '배경',
  outfit: '의상',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  hat: '🎩',
  accessory: '✨',
  background: '🖼️',
  outfit: '👔',
};

export const InventoryModal: React.FC = () => {
  const { isInventoryOpen, closeInventory, inventory, equipItem, isLoading } = usePenguinStore();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  if (!isInventoryOpen) return null;

  const categories = [...new Set(inventory.map((item) => item.penguin_items.category))];
  const filteredItems = selectedCategory
    ? inventory.filter((item) => item.penguin_items.category === selectedCategory)
    : inventory;

  const handleEquip = async (item: InventoryItem) => {
    await equipItem(item.item_id, !item.is_equipped);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
        onClick={closeInventory}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <Backpack className="w-5 h-5 text-[#A996FF]" />
              <h2 className="text-lg font-semibold text-text-primary dark:text-white">
                인벤토리
              </h2>
              <span className="text-sm text-neutral-500">({inventory.length})</span>
            </div>
            <button
              onClick={closeInventory}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              <X size={20} className="text-neutral-500" />
            </button>
          </div>

          {/* 카테고리 필터 */}
          {categories.length > 0 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === null
                    ? 'bg-[#A996FF] text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                전체
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
                    selectedCategory === category
                      ? 'bg-[#A996FF] text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <span>{CATEGORY_EMOJIS[category]}</span>
                  {CATEGORY_LABELS[category]}
                </button>
              ))}
            </div>
          )}

          {/* 아이템 그리드 */}
          <div className="p-4 overflow-y-auto max-h-[50vh]">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-4xl animate-bounce">🐧</div>
                <p className="text-sm text-neutral-500 mt-2">인벤토리 불러오는 중...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-neutral-500">아직 아이템이 없어요</p>
                <p className="text-sm text-neutral-400 mt-1">상점에서 아이템을 구매해보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative p-3 rounded-xl border-2 transition-colors cursor-pointer
                      ${
                        item.is_equipped
                          ? 'border-[#A996FF] bg-[#A996FF]/10'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-[#A996FF]/50'
                      }
                    `}
                    onClick={() => handleEquip(item)}
                  >
                    {/* 장착 표시 */}
                    {item.is_equipped && (
                      <div className="absolute top-2 right-2">
                        <Star size={16} className="text-[#A996FF] fill-[#A996FF]" />
                      </div>
                    )}

                    {/* 아이템 정보 */}
                    <div className="text-center mb-2">
                      <span className="text-3xl">
                        {CATEGORY_EMOJIS[item.penguin_items.category]}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm text-text-primary dark:text-white text-center">
                      {item.penguin_items.name}
                    </h3>
                    <p className="text-xs text-neutral-500 text-center mt-1">
                      {CATEGORY_LABELS[item.penguin_items.category]}
                    </p>

                    {/* 장착 버튼 */}
                    <div className="mt-3">
                      <button
                        className={`
                          w-full py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1
                          ${
                            item.is_equipped
                              ? 'bg-[#A996FF] text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }
                        `}
                      >
                        {item.is_equipped ? (
                          <>
                            <Check size={14} />
                            장착 중
                          </>
                        ) : (
                          '장착하기'
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InventoryModal;
