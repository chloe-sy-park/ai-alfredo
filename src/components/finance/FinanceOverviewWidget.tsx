/**
 * Finance Overview Widget (홈 위젯)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Calendar, AlertTriangle, ChevronRight } from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';

interface FinanceOverviewWidgetProps {
  className?: string;
  onNavigate?: () => void;
}

export function FinanceOverviewWidget({
  className = '',
  onNavigate,
}: FinanceOverviewWidgetProps) {
  const overview = useFinanceStore((s) => s.overview);
  const refreshOverview = useFinanceStore((s) => s.refreshOverview);

  React.useEffect(() => {
    refreshOverview();
  }, [refreshOverview]);

  if (!overview) return null;

  const {
    monthlyFixedExpense,
    upcomingPayments,
    warningBadge,
    duplicateCount,
    cancelCandidateCount,
  } = overview;

  const hasWarning = warningBadge || duplicateCount > 0 || cancelCandidateCount > 0;

  return (
    <motion.div
      className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onNavigate}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <Wallet size={16} className="text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-gray-800">이번 달 고정지출</span>
        </div>
        {hasWarning && (
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        )}
      </div>

      {/* Monthly Total */}
      <div className="mb-4">
        <span className="text-2xl font-bold text-gray-900">
          ₩{monthlyFixedExpense.toLocaleString()}
        </span>
        <span className="text-xs text-gray-500 ml-1">/월</span>
      </div>

      {/* Warning Badge */}
      {warningBadge && (
        <div
          className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${
            warningBadge.severity === 'critical'
              ? 'bg-red-50 text-red-700'
              : warningBadge.severity === 'warning'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-blue-50 text-blue-700'
          }`}
        >
          <AlertTriangle size={14} />
          <span className="text-xs">{warningBadge.message}</span>
        </div>
      )}

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={12} />
            <span>다음 7일</span>
          </div>
          {upcomingPayments.slice(0, 3).map((payment) => (
            <div
              key={payment.itemId}
              className="flex items-center justify-between py-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">D-{payment.daysUntil}</span>
                <span className="text-sm text-gray-700">{payment.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                ₩{payment.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100">
        <button className="flex items-center gap-1 text-xs text-primary font-medium">
          <span>자세히 보기</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
