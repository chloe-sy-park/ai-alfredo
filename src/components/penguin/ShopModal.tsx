/**
 * ShopModal - 펭귄 상점 모달
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, ShoppingBag, Lock, Check } from 'lucide-react';
import { usePenguinStore, type ShopItem } from '../../stores/penguinStore';

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

export const ShopModal: React.FC = () => {
  const { isShopOpen, closeShop, shop, status, buyItem, isLoading } = usePenguinStore();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = React.useState<string | null>(null);

  if (!isShopOpen) return null;

  const categories = [...new Set(shop.map((item) => item.category))];
  const filteredItems = selectedCategory
    ? shop.filter((item) => item.category === selectedCategory)
    : shop;

  const handleBuy = async (item: ShopItem) => {
    if (item.owned || !item.can_afford) return;

    const success = await buyItem(item.id);
    if (success) {
      setPurchaseSuccess(item.id);
      setTimeout(() => setPurchaseSuccess(null), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
        onClick={closeShop}
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
              <ShoppingBag className="w-5 h-5 text-[#A996FF]" />
              <h2 className="text-lg font-semibold text-text-primary dark:text-white">
                펭귄 상점
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* 보유 코인 */}
              <div className="flex items-center gap-1 px-3 py-1 bg-[#FFD43B]/20 rounded-full">
                <Coins size={16} className="text-[#FFD43B]" />
                <span className="font-semibold text-[#B8860B]">{status?.coins ?? 0}</span>
              </div>
              <button
                onClick={closeShop}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="닫기"
              >
                <X size={20} className="text-neutral-500" />
              </button>
            </div>
          </div>

          {/* 카테고리 필터 */}
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

          {/* 아이템 그리드 */}
          <div className="p-4 overflow-y-auto max-h-[50vh]">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto animate-bounce rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                  <img
                    src="/assets/alfredo/avatar/alfredo-avatar-64.png"
                    alt="알프레도"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-4xl">🎩</span>'; }}
                  />
                </div>
                <p className="text-sm text-neutral-500 mt-2">상점 불러오는 중...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500">아직 판매 중인 아이템이 없어요</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative p-3 rounded-xl border-2 transition-colors
                      ${
                        item.owned
                          ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                          : item.can_afford
                          ? 'border-neutral-200 dark:border-neutral-700 hover:border-[#A996FF]'
                          : 'border-neutral-200 dark:border-neutral-700 opacity-60'
                      }
                    `}
                  >
                    {/* 잠금 표시 */}
                    {status && status.level < item.required_level && (
                      <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                        <div className="text-center text-white">
                          <Lock size={24} />
                          <p className="text-xs mt-1">Lv.{item.required_level}</p>
                        </div>
                      </div>
                    )}

                    {/* 구매 완료 표시 */}
                    {purchaseSuccess === item.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 bg-green-500/90 rounded-xl flex items-center justify-center"
                      >
                        <Check size={32} className="text-white" />
                      </motion.div>
                    )}

                    {/* 아이템 정보 */}
                    <div className="text-center mb-2">
                      <span className="text-3xl">{CATEGORY_EMOJIS[item.category]}</span>
                    </div>
                    <h3 className="font-medium text-sm text-text-primary dark:text-white text-center">
                      {item.name}
                    </h3>
                    <p className="text-xs text-neutral-500 text-center mt-1 line-clamp-2">
                      {item.description}
                    </p>

                    {/* 가격 / 구매 버튼 */}
                    <div className="mt-3">
                      {item.owned ? (
                        <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                          <Check size={14} />
                          보유 중
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={!item.can_afford || isLoading}
                          className={`
                            w-full py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1
                            ${
                              item.can_afford
                                ? 'bg-[#A996FF] text-white hover:bg-[#8B7EE0]'
                                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'
                            }
                          `}
                        >
                          <Coins size={14} />
                          {item.price}
                        </button>
                      )}
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

export default ShopModal;
