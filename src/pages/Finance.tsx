/**
 * Finance OS - Main Page
 *
 * Finance OS는 돈을 세는 도구가 아니라,
 * 사용자의 '선택을 대신 기억해주는 집사'다.
 *
 * 8.2 Recurring 상세 (3탭 고정):
 * 1. Overlaps (중복)
 * 2. Candidates (해지 후보)
 * 3. All (전체)
 */

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Menu, Bell } from 'lucide-react';
import { useDrawerStore } from '../stores';
import { useNotificationStore } from '../stores/notificationStore';
import {
  useFinanceStore,
  selectRecurringByTab,
} from '../stores/financeStore';
import {
  FinanceTabBar,
  RecurringItemCard,
  DuplicateCard,
  UsageCheckModal,
  GoalSuggestionCard,
  FinanceEmptyState,
  AddItemButton,
} from '../components/finance';

export default function Finance() {
  const activeTab = useFinanceStore((s) => s.activeTab);
  const setActiveTab = useFinanceStore((s) => s.setActiveTab);
  const recurringItems = useFinanceStore((s) => s.recurringItems);
  const duplicateGroups = useFinanceStore((s) => s.duplicateGroups);
  const overview = useFinanceStore((s) => s.overview);

  const { open: openDrawer } = useDrawerStore();
  const { toggle: toggleNotification, unreadCount } = useNotificationStore();

  const toggleWorkLife = useFinanceStore((s) => s.toggleWorkLife);
  const setSelectedItem = useFinanceStore((s) => s.setSelectedItem);
  const resolveDuplicate = useFinanceStore((s) => s.resolveDuplicate);
  const dismissDuplicate = useFinanceStore((s) => s.dismissDuplicate);
  const addGoal = useFinanceStore((s) => s.addGoal);
  const checkGoalSuggestion = useFinanceStore((s) => s.checkGoalSuggestion);
  const refreshOverview = useFinanceStore((s) => s.refreshOverview);
  const refreshDuplicates = useFinanceStore((s) => s.refreshDuplicates);

  const showUsageCheckModal = useFinanceStore((s) => s.showUsageCheckModal);
  const currentUsageCheckItemId = useFinanceStore((s) => s.currentUsageCheckItemId);
  const closeUsageCheckModal = useFinanceStore((s) => s.closeUsageCheckModal);
  const submitUsageCheck = useFinanceStore((s) => s.submitUsageCheck);

  // 목표 제안 상태
  const [goalSuggestion, setGoalSuggestion] = useState<{
    suggest: boolean;
    suggestedTitle?: string;
    relatedItemIds?: string[];
  } | null>(null);
  const [showGoalSuggestion, setShowGoalSuggestion] = useState(false);

  // 새 항목 추가 모달 (간단 버전)
  const [showAddModal, setShowAddModal] = useState(false);

  // 탭별 아이템 필터링
  const filteredItems = useFinanceStore(selectRecurringByTab);

  // 카운트 계산
  const counts = {
    overlaps: duplicateGroups.filter((g) => g.status === 'detected').length > 0
      ? recurringItems.filter((item) =>
          duplicateGroups
            .filter((g) => g.status === 'detected')
            .flatMap((g) => g.itemIds)
            .includes(item.id)
        ).length
      : 0,
    candidates: recurringItems.filter(
      (item) => item.retentionIntent === 'cancel_candidate'
    ).length,
    all: recurringItems.length,
  };

  // 초기 로드
  useEffect(() => {
    refreshOverview();
    refreshDuplicates();

    // 목표 제안 확인
    const suggestion = checkGoalSuggestion();
    if (suggestion.suggest) {
      setGoalSuggestion(suggestion);
      setShowGoalSuggestion(true);
    }
  }, []);

  // 현재 사용여부 체크 대상 아이템
  const currentUsageCheckItem = currentUsageCheckItemId
    ? recurringItems.find((i) => i.id === currentUsageCheckItemId)
    : null;

  // 활성 중복 그룹
  const activeDuplicateGroups = duplicateGroups.filter(
    (g) => g.status === 'detected'
  );

  // 목표 제안 수락 핸들러
  const handleAcceptGoalSuggestion = () => {
    if (goalSuggestion?.suggestedTitle) {
      addGoal({
        title: goalSuggestion.suggestedTitle,
        goalType: goalSuggestion.suggestedTitle.includes('커리어') ? 'Career' : 'Life',
        status: 'active',
      });
      setShowGoalSuggestion(false);
    }
  };

  // 관련 아이템 이름 가져오기
  const getRelatedItemNames = (itemIds: string[]) => {
    return itemIds
      .map((id) => recurringItems.find((i) => i.id === id)?.name)
      .filter(Boolean) as string[];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Custom Header for Finance OS */}
      <header className="sticky top-0 z-30 bg-[#F5F5F5] safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Title with Icon */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Wallet size={16} className="text-emerald-600" />
            </div>
            <span className="font-semibold text-[#1A1A1A]">Finance OS</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={toggleNotification}
              className="relative w-10 h-10 flex items-center justify-center text-[#666666] hover:bg-[#E5E5E5] rounded-full transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#A996FF] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={openDrawer}
              className="w-10 h-10 flex items-center justify-center text-[#666666] hover:bg-[#E5E5E5] rounded-full transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Overview Summary */}
        {overview && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">이번 달 고정지출</span>
              {overview.warningBadge && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {overview.warningBadge.message}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ₩{overview.monthlyFixedExpense.toLocaleString()}
              <span className="text-sm font-normal text-gray-400 ml-1">/월</span>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <div className="flex-1">
                <div className="text-xs text-gray-400">구독</div>
                <div className="text-sm font-medium text-gray-700">
                  {recurringItems.filter((i) => i.billingCycle === 'monthly').length}개
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-400">연간 결제</div>
                <div className="text-sm font-medium text-gray-700">
                  {recurringItems.filter((i) => i.billingCycle === 'yearly').length}개
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-400">다음 7일</div>
                <div className="text-sm font-medium text-gray-700">
                  {overview.upcomingPayments.length}건
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goal Suggestion */}
        {showGoalSuggestion && goalSuggestion?.suggestedTitle && (
          <GoalSuggestionCard
            suggestedTitle={goalSuggestion.suggestedTitle}
            relatedItemNames={getRelatedItemNames(goalSuggestion.relatedItemIds || [])}
            onAccept={handleAcceptGoalSuggestion}
            onDismiss={() => setShowGoalSuggestion(false)}
          />
        )}

        {/* Duplicate Cards (항상 상단에 표시) */}
        {activeTab !== 'candidates' && activeDuplicateGroups.length > 0 && (
          <div className="space-y-3">
            {activeDuplicateGroups.map((group) => (
              <DuplicateCard
                key={group.id}
                group={group}
                items={recurringItems}
                onResolve={(keepItemId) => resolveDuplicate(group.id, keepItemId)}
                onDismiss={() => dismissDuplicate(group.id)}
              />
            ))}
          </div>
        )}

        {/* Tab Bar */}
        <FinanceTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        {/* Item List */}
        <div className="space-y-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <RecurringItemCard
                key={item.id}
                item={item}
                onToggleWorkLife={() => toggleWorkLife(item.id)}
                onSelect={() => setSelectedItem(item.id)}
              />
            ))
          ) : (
            <FinanceEmptyState type={activeTab} />
          )}
        </div>

        {/* Add Button */}
        {activeTab === 'all' && (
          <AddItemButton onClick={() => setShowAddModal(true)} />
        )}
      </div>

      {/* Usage Check Modal */}
      <AnimatePresence>
        {showUsageCheckModal && currentUsageCheckItem && (
          <UsageCheckModal
            item={currentUsageCheckItem}
            onSubmit={(response) => {
              submitUsageCheck({
                itemId: currentUsageCheckItem.id,
                ...response,
                checkedAt: new Date().toISOString(),
              });
            }}
            onClose={closeUsageCheckModal}
          />
        )}
      </AnimatePresence>

      {/* Add Item Modal (간단 버전 - 추후 확장) */}
      <AnimatePresence>
        {showAddModal && (
          <AddItemModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Add Item Modal (Simple Version)
// ============================================

interface AddItemModalProps {
  onClose: () => void;
}

function AddItemModal({ onClose }: AddItemModalProps) {
  const addRecurringItem = useFinanceStore((s) => s.addRecurringItem);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [billingDay, setBillingDay] = useState('1');
  const [workLife, setWorkLife] = useState<'Work' | 'Life'>('Life');

  const handleSubmit = () => {
    if (!name || !amount) return;

    const now = new Date();
    const nextPaymentDate = new Date(now);
    const day = parseInt(billingDay) || 1;

    if (now.getDate() >= day) {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }
    nextPaymentDate.setDate(Math.min(day, 28)); // 간단하게 28일 최대

    addRecurringItem({
      name,
      amount: parseInt(amount) || 0,
      billingCycle,
      billingDay: day,
      categoryL1: 'other',
      workLife,
      personalGrowthType: null,
      nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          구독/정기결제 추가
        </h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">서비스명</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: Netflix, Notion"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A996FF]"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">금액 (원)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="예: 17000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A996FF]"
            />
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">결제 주기</label>
            <div className="flex gap-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'border-[#A996FF] bg-[#F8F8FF] text-[#A996FF]'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                월간
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'border-[#A996FF] bg-[#F8F8FF] text-[#A996FF]'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                연간
              </button>
            </div>
          </div>

          {/* Billing Day */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">결제일</label>
            <input
              type="number"
              min="1"
              max="31"
              value={billingDay}
              onChange={(e) => setBillingDay(e.target.value)}
              placeholder="1-31"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A996FF]"
            />
          </div>

          {/* Work/Life */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">분류</label>
            <div className="flex gap-2">
              <button
                onClick={() => setWorkLife('Work')}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  workLife === 'Work'
                    ? 'border-blue-400 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                Work
              </button>
              <button
                onClick={() => setWorkLife('Life')}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  workLife === 'Life'
                    ? 'border-rose-400 bg-rose-50 text-rose-600'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                Life
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-500 font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || !amount}
            className={`flex-1 py-3 font-medium rounded-xl transition-colors ${
              name && amount
                ? 'bg-[#A996FF] text-white hover:bg-[#8B7FE8]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}
