/**
 * Duplicate Detection Card Component
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Repeat, X, Check } from 'lucide-react';
import { RecurringItem, DuplicateGroup } from '../../services/finance/types';

interface DuplicateCardProps {
  group: DuplicateGroup;
  items: RecurringItem[];
  onResolve: (keepItemId: string) => void;
  onDismiss: () => void;
}

export function DuplicateCard({
  group,
  items,
  onResolve,
  onDismiss,
}: DuplicateCardProps) {
  const [selectedKeep, setSelectedKeep] = useState<string | null>(
    group.suggestedKeep || null
  );

  const groupItems = items.filter((item) => group.itemIds.includes(item.id));

  return (
    <motion.div
      className="bg-amber-50 rounded-xl p-4 border border-amber-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <Repeat size={16} className="text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-amber-800">
              {group.purpose} {groupItems.length}개
            </h4>
            <p className="text-xs text-amber-600">
              하나만 유지하면 월 ₩{group.potentialSavings.toLocaleString()} 절약
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-amber-400 hover:text-amber-600"
        >
          <X size={18} />
        </button>
      </div>

      {/* Items Selection */}
      <div className="space-y-2 mb-3">
        {groupItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedKeep(item.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
              selectedKeep === item.id
                ? 'bg-white border-2 border-amber-400'
                : 'bg-amber-100/50 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              {item.icon && <span>{item.icon}</span>}
              <span className="text-sm font-medium text-gray-800">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                ₩{item.amount.toLocaleString()}
              </span>
              {selectedKeep === item.id && (
                <Check size={16} className="text-amber-600" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={() => selectedKeep && onResolve(selectedKeep)}
        disabled={!selectedKeep}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
          selectedKeep
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-amber-200 text-amber-400 cursor-not-allowed'
        }`}
      >
        {selectedKeep ? '선택한 것만 유지' : '유지할 항목 선택'}
      </button>
    </motion.div>
  );
}
