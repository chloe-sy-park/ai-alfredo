/**
 * Recurring Item Card Component
 */
import { motion } from 'framer-motion';
import { Briefcase, Heart, TrendingDown } from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import { RecurringItem } from '../../services/finance/types';

interface RecurringItemCardProps {
  item: RecurringItem;
  onToggleWorkLife: () => void;
  onSelect: () => void;
  showSwipeActions?: boolean;
}

export function RecurringItemCard({
  item,
  onToggleWorkLife,
  onSelect,
  showSwipeActions = true,
}: RecurringItemCardProps) {
  const markAsCancelCandidate = useFinanceStore((s) => s.markAsCancelCandidate);
  const dismissFromCancelCandidates = useFinanceStore(
    (s) => s.dismissFromCancelCandidates
  );

  // 결제일까지 남은 일수 계산
  const daysUntil = Math.ceil(
    (new Date(item.nextPaymentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      layout
    >
      {/* Main Content */}
      <div className="flex items-start justify-between" onClick={onSelect}>
        <div className="flex-1">
          {/* Name & Amount */}
          <div className="flex items-center gap-2 mb-2">
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <span className="font-medium text-gray-900">{item.name}</span>
            <span className="text-sm font-semibold text-gray-700">
              ₩{item.amount.toLocaleString()}
            </span>
          </div>

          {/* Work/Life Toggle Chips */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWorkLife();
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                item.workLife === 'Work'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Briefcase size={12} />
              Work
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWorkLife();
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                item.workLife === 'Life'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Heart size={12} />
              Life
            </button>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.personalGrowthType && (
              <span className="text-xs text-gray-500">
                {item.personalGrowthType === 'Career'
                  ? 'Personal Growth · 커리어'
                  : item.personalGrowthType === 'Wellbeing'
                  ? 'Personal Growth · 웰빙'
                  : 'Personal Growth · 미정'}
              </span>
            )}
            {item.retentionIntent === 'cancel_candidate' && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <TrendingDown size={10} />
                해지 후보
              </span>
            )}
          </div>
        </div>

        {/* Due Date Badge */}
        <div className="flex flex-col items-end">
          {daysUntil <= 7 && daysUntil > 0 && (
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                daysUntil <= 3
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              D-{daysUntil}
            </span>
          )}
          <span className="text-xs text-gray-400 mt-1">
            {item.billingCycle === 'yearly' ? '연간' : '월간'}
          </span>
        </div>
      </div>

      {/* Swipe Actions (simplified as buttons for now) */}
      {showSwipeActions && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          {item.retentionIntent !== 'cancel_candidate' ? (
            <button
              onClick={() => markAsCancelCandidate(item.id)}
              className="flex-1 py-2 text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              해지 후보로 이동
            </button>
          ) : (
            <button
              onClick={() => dismissFromCancelCandidates(item.id)}
              className="flex-1 py-2 text-xs text-gray-500 hover:text-green-500 transition-colors"
            >
              유지하기
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
