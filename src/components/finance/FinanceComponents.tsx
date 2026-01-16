/**
 * Finance OS - UI Components
 *
 * 화면 설계 원칙:
 * - "보기 → 결정"만 있고 "관리 노동"은 없음
 * - Work/Life 토글 칩으로 즉시 수정
 * - 알프레도 톤: "정리하세요" ❌ → "이런 선택지가 있어요" ⭕
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Calendar,
  AlertTriangle,
  TrendingDown,
  ChevronRight,
  X,
  Check,
  Briefcase,
  Heart,
  Target,
  Clock,
  Repeat,
  CreditCard,
} from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import {
  RecurringItem,
  DuplicateGroup,
  UsageFrequency,
  RetentionIntent,
  USAGE_CHECK_QUESTIONS,
} from '../../services/finance/types';

// ============================================
// Finance Overview Widget (홈 위젯)
// ============================================

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
        <button className="flex items-center gap-1 text-xs text-[#A996FF] font-medium">
          <span>자세히 보기</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// Tab Bar Component
// ============================================

interface TabBarProps {
  activeTab: 'overlaps' | 'candidates' | 'all';
  onTabChange: (tab: 'overlaps' | 'candidates' | 'all') => void;
  counts: { overlaps: number; candidates: number; all: number };
}

export function FinanceTabBar({ activeTab, onTabChange, counts }: TabBarProps) {
  const tabs = [
    { key: 'overlaps' as const, label: '겹침', count: counts.overlaps },
    { key: 'candidates' as const, label: '해지 후보', count: counts.candidates },
    { key: 'all' as const, label: '전체', count: counts.all },
  ];

  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
          {tab.count > 0 && (
            <span
              className={`ml-1 text-xs ${
                activeTab === tab.key ? 'text-[#A996FF]' : 'text-gray-400'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================
// Recurring Item Card
// ============================================

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

// ============================================
// Duplicate Detection Card
// ============================================

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

// ============================================
// Usage Check Modal
// ============================================

interface UsageCheckModalProps {
  item: RecurringItem;
  onSubmit: (response: {
    frequency: UsageFrequency;
    hasDuplicate: boolean;
    retention: RetentionIntent;
  }) => void;
  onClose: () => void;
}

export function UsageCheckModal({ item, onSubmit, onClose }: UsageCheckModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [frequency, setFrequency] = useState<UsageFrequency | null>(null);
  const [duplicate, setDuplicate] = useState<'none' | 'exists' | 'using' | null>(null);
  const [retention, setRetention] = useState<RetentionIntent | null>(null);

  const handleComplete = () => {
    if (frequency && duplicate !== null && retention) {
      onSubmit({
        frequency,
        hasDuplicate: duplicate === 'exists' || duplicate === 'using',
        retention,
      });
    }
  };

  const questions = USAGE_CHECK_QUESTIONS;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">
              ₩{item.amount.toLocaleString()} · D-
              {Math.ceil(
                (new Date(item.nextPaymentDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-[#A996FF]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Questions */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-base font-medium text-gray-800">
                {questions.frequency.question}
              </p>
              <div className="flex gap-2">
                {questions.frequency.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFrequency(opt.value);
                      setStep(2);
                    }}
                    className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                      frequency === opt.value
                        ? 'border-[#A996FF] bg-[#F8F8FF]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="text-sm font-medium text-gray-700">
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-base font-medium text-gray-800">
                {questions.duplicate.question}
              </p>
              <div className="flex gap-2">
                {questions.duplicate.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setDuplicate(opt.value);
                      setStep(3);
                    }}
                    className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                      duplicate === opt.value
                        ? 'border-[#A996FF] bg-[#F8F8FF]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="text-sm font-medium text-gray-700">
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-base font-medium text-gray-800">
                {questions.retention.question}
              </p>
              <div className="flex gap-2">
                {questions.retention.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setRetention(opt.value);
                    }}
                    className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                      retention === opt.value
                        ? 'border-[#A996FF] bg-[#F8F8FF]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="text-sm font-medium text-gray-700">
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>

              {retention && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleComplete}
                  className="w-full py-3 bg-[#A996FF] text-white font-medium rounded-xl hover:bg-[#8B7FE8] transition-colors mt-4"
                >
                  완료
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button */}
        {step > 1 && (
          <button
            onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            이전으로
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

// ============================================
// Personal Growth Question (최초 질문)
// ============================================

interface GrowthQuestionProps {
  itemName: string;
  onAnswer: (type: 'Career' | 'Wellbeing' | 'Unclear') => void;
}

export function GrowthQuestion({ itemName, onAnswer }: GrowthQuestionProps) {
  return (
    <motion.div
      className="bg-[#F8F8FF] rounded-xl p-4 border border-[#E8E4FF]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-sm text-gray-700 mb-3">
        <span className="font-medium">{itemName}</span>의 성장은
        <br />
        어디에 더 도움 되나요?
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onAnswer('Career')}
          className="flex-1 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all"
        >
          <Briefcase size={14} className="inline mr-1" />
          일에 도움
        </button>
        <button
          onClick={() => onAnswer('Wellbeing')}
          className="flex-1 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-green-300 hover:bg-green-50 transition-all"
        >
          <Heart size={14} className="inline mr-1" />
          삶에 도움
        </button>
        <button
          onClick={() => onAnswer('Unclear')}
          className="flex-1 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:border-gray-300 transition-all"
        >
          <Clock size={14} className="inline mr-1" />
          아직 몰라요
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// Goal Suggestion Card
// ============================================

interface GoalSuggestionProps {
  suggestedTitle: string;
  relatedItemNames: string[];
  onAccept: () => void;
  onDismiss: () => void;
}

export function GoalSuggestionCard({
  suggestedTitle,
  relatedItemNames,
  onAccept,
  onDismiss,
}: GoalSuggestionProps) {
  return (
    <motion.div
      className="bg-gradient-to-r from-[#F8F8FF] to-[#F0EFFF] rounded-xl p-4 border border-[#E8E4FF]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-[#A996FF] rounded-full flex items-center justify-center">
          <Target size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-800">
            비슷한 성장이 반복돼요.
            <br />
            이걸 하나의 방향으로 묶어볼까요?
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {relatedItemNames.slice(0, 3).join(', ')}
            {relatedItemNames.length > 3 && ` 외 ${relatedItemNames.length - 3}개`}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="flex-1 py-2.5 bg-[#A996FF] text-white font-medium rounded-lg text-sm hover:bg-[#8B7FE8] transition-colors"
        >
          "{suggestedTitle}" 목표 만들기
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2.5 text-gray-500 text-sm hover:text-gray-700"
        >
          나중에
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// Empty State
// ============================================

interface EmptyStateProps {
  type: 'overlaps' | 'candidates' | 'all';
}

export function FinanceEmptyState({ type }: EmptyStateProps) {
  const messages = {
    overlaps: {
      icon: <Check size={32} className="text-emerald-500" />,
      title: '겹치는 구독이 없어요',
      description: '효율적으로 관리하고 계시네요!',
    },
    candidates: {
      icon: <Check size={32} className="text-emerald-500" />,
      title: '해지 후보가 없어요',
      description: '모든 구독을 잘 활용하고 계시네요!',
    },
    all: {
      icon: <CreditCard size={32} className="text-gray-400" />,
      title: '등록된 구독이 없어요',
      description: '구독/정기결제를 추가해보세요',
    },
  };

  const content = messages[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {content.icon}
      </div>
      <h3 className="text-base font-medium text-gray-800 mb-1">{content.title}</h3>
      <p className="text-sm text-gray-500">{content.description}</p>
    </div>
  );
}

// ============================================
// Add Item Button
// ============================================

interface AddItemButtonProps {
  onClick: () => void;
}

export function AddItemButton({ onClick }: AddItemButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-[#A996FF] hover:text-[#A996FF] transition-all flex items-center justify-center gap-2"
    >
      <span className="text-xl">+</span>
      <span className="text-sm font-medium">구독/정기결제 추가</span>
    </button>
  );
}
