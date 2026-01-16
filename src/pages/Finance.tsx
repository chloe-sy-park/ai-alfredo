/**
 * Finance OS - State-based Decision IA
 *
 * 핵심 원칙:
 * - 진입은 명시적 (Right Nav)
 * - 내부 이동은 자동 상태 분기
 * - 메뉴 트리 ❌, 탭 탐색 ❌
 * - 상황 → 결정 → 종료
 *
 * 상태 흐름:
 * Overview → Overlaps / Candidates / Upcoming / AllClear
 */

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Wallet,
  Plus,
  Menu,
  Bell,
  ChevronLeft,
  Clock,
  Check,
  Repeat,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Shield,
  BarChart3,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { useDrawerStore } from '../stores';
import { useNotificationStore } from '../stores/notificationStore';
import { useFinanceStore } from '../stores/financeStore';
import {
  RecurringItemCard,
  DuplicateCard,
  UsageCheckModal,
} from '../components/finance';
import {
  RecurringItem,
  CommitmentItem,
  DuplicateGroup,
  GrowthLink,
  RiskLevel,
  OverviewMetrics,
  OverviewStateSummary,
  IncomeItem,
  IncomeType,
  OneTimeExpense,
  OneTimeExpenseCategory,
  INCOME_TYPE_LABELS,
  EXPENSE_CATEGORY_LABELS,
} from '../services/finance/types';
import {
  buildOverviewStateSummary,
  classifyOneTimeExpense,
  calculateFinanceStats,
  analyzeByCategory,
  findSavingsOpportunities,
} from '../services/finance';

// 상태 타입 정의
type FinanceState = 'overview' | 'overlaps' | 'candidates' | 'upcoming' | 'allclear' | 'stats';

export default function Finance() {
  // Store
  const recurringItems = useFinanceStore((s) => s.recurringItems);
  const commitmentItems = useFinanceStore((s) => s.commitmentItems);
  const duplicateGroups = useFinanceStore((s) => s.duplicateGroups);
  const growthLinks = useFinanceStore((s) => s.growthLinks);
  const incomeItems = useFinanceStore((s) => s.incomeItems);
  const oneTimeExpenses = useFinanceStore((s) => s.oneTimeExpenses);

  const { open: openDrawer } = useDrawerStore();
  const { toggle: toggleNotification, unreadCount } = useNotificationStore();

  const toggleWorkLife = useFinanceStore((s) => s.toggleWorkLife);
  const setSelectedItem = useFinanceStore((s) => s.setSelectedItem);
  const resolveDuplicate = useFinanceStore((s) => s.resolveDuplicate);
  const dismissDuplicate = useFinanceStore((s) => s.dismissDuplicate);
  const refreshOverview = useFinanceStore((s) => s.refreshOverview);
  const refreshDuplicates = useFinanceStore((s) => s.refreshDuplicates);

  const showUsageCheckModal = useFinanceStore((s) => s.showUsageCheckModal);
  const currentUsageCheckItemId = useFinanceStore((s) => s.currentUsageCheckItemId);
  const closeUsageCheckModal = useFinanceStore((s) => s.closeUsageCheckModal);
  const submitUsageCheck = useFinanceStore((s) => s.submitUsageCheck);

  // UI State
  const [currentState, setCurrentState] = useState<FinanceState>('overview');
  const [showAddModal, setShowAddModal] = useState(false);

  // 초기 로드
  useEffect(() => {
    refreshOverview();
    refreshDuplicates();
  }, [refreshOverview, refreshDuplicates]);

  // Overview State Summary (State-based IA 핵심 계산)
  const overviewData = useMemo(() => {
    return buildOverviewStateSummary(
      recurringItems,
      commitmentItems,
      duplicateGroups,
      growthLinks
    );
  }, [recurringItems, commitmentItems, duplicateGroups, growthLinks]);

  // 이번 달 수입/지출 요약 계산
  const monthlyFinanceSummary = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 이번 달 총 수입
    const monthlyIncome = incomeItems
      .filter((item) => {
        if (item.isRecurring) return true; // 정기 수입 포함
        const date = item.receivedDate
          ? new Date(item.receivedDate)
          : item.expectedDate
          ? new Date(item.expectedDate)
          : null;
        return date && date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, item) => sum + item.amount, 0);

    // 이번 달 1회성 지출
    const monthlyOneTimeExpense = oneTimeExpenses
      .filter((expense) => {
        const date = new Date(expense.date);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    // 이번 달 고정지출
    const fixedExpense = overviewData.metrics.fixedCostThisMonth;

    // 순 현금흐름
    const netCashFlow = monthlyIncome - fixedExpense - monthlyOneTimeExpense;

    return {
      income: monthlyIncome,
      oneTimeExpense: monthlyOneTimeExpense,
      fixedExpense,
      netCashFlow,
      hasIncomeData: incomeItems.length > 0,
    };
  }, [incomeItems, oneTimeExpenses, overviewData.metrics.fixedCostThisMonth]);

  // 상태 계산 (State Detection) - 기존 호환성 유지
  const stateInfo = useMemo(() => {
    const activeDuplicates = duplicateGroups.filter((g) => g.status === 'detected');
    const cancelCandidates = recurringItems.filter(
      (item) => item.retentionIntent === 'cancel_candidate'
    );

    // 다음 7일 내 결제 항목
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const upcomingPayments = recurringItems.filter((item) => {
      const nextPayment = new Date(item.nextPaymentDate);
      return nextPayment >= now && nextPayment <= sevenDaysLater;
    });

    return {
      hasOverlaps: activeDuplicates.length > 0,
      hasCandidates: cancelCandidates.length > 0,
      hasUpcoming: upcomingPayments.length > 0,
      overlapsCount: activeDuplicates.length,
      candidatesCount: cancelCandidates.length,
      upcomingCount: upcomingPayments.length,
      upcomingAmount: upcomingPayments.reduce((sum, item) => sum + item.amount, 0),
      duplicates: activeDuplicates,
      candidates: cancelCandidates,
      upcoming: upcomingPayments,
    };
  }, [duplicateGroups, recurringItems]);

  // 현재 사용여부 체크 대상 아이템
  const currentUsageCheckItem = currentUsageCheckItemId
    ? recurringItems.find((i) => i.id === currentUsageCheckItemId)
    : null;

  // 뒤로가기 핸들러
  const handleBack = () => {
    setCurrentState('overview');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <FinanceHeader
        currentState={currentState}
        onBack={handleBack}
        onAdd={() => setShowAddModal(true)}
        onNotification={toggleNotification}
        onMenu={openDrawer}
        unreadCount={unreadCount}
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        {currentState === 'overview' && (
          <OverviewScreen
            key="overview"
            metrics={overviewData.metrics}
            stateSummary={overviewData.stateSummary}
            recommended={overviewData.recommended}
            itemCount={recurringItems.length}
            financeSummary={monthlyFinanceSummary}
            onNavigate={setCurrentState}
            onQuickAddRecurring={() => setShowAddModal(true)}
          />
        )}

        {currentState === 'overlaps' && (
          <OverlapsScreen
            key="overlaps"
            duplicates={stateInfo.duplicates}
            items={recurringItems}
            onResolve={resolveDuplicate}
            onDismiss={dismissDuplicate}
            onComplete={handleBack}
          />
        )}

        {currentState === 'candidates' && (
          <CandidatesScreen
            key="candidates"
            candidates={stateInfo.candidates}
            onToggleWorkLife={toggleWorkLife}
            onSelect={setSelectedItem}
            onComplete={handleBack}
          />
        )}

        {currentState === 'upcoming' && (
          <UpcomingScreen
            key="upcoming"
            upcoming={stateInfo.upcoming}
            onAcknowledge={handleBack}
          />
        )}

        {currentState === 'allclear' && (
          <AllClearScreen
            key="allclear"
            itemCount={recurringItems.length}
            onViewAll={() => {}}
            onComplete={handleBack}
          />
        )}

        {currentState === 'stats' && (
          <StatsScreen
            key="stats"
            incomeItems={incomeItems}
            recurringItems={recurringItems}
            commitmentItems={commitmentItems}
            oneTimeExpenses={oneTimeExpenses}
            duplicateGroups={duplicateGroups}
            growthLinks={growthLinks}
            onBack={handleBack}
          />
        )}
      </AnimatePresence>

      {/* Add Button (Overview에서만) */}
      {currentState === 'overview' && (
        <div className="fixed bottom-24 right-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-lavender-500 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      )}

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

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddItemModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Header Component
// ============================================

interface FinanceHeaderProps {
  currentState: FinanceState;
  onBack: () => void;
  onAdd: () => void;
  onNotification: () => void;
  onMenu: () => void;
  unreadCount: number;
}

function FinanceHeader({
  currentState,
  onBack,
  onAdd,
  onNotification,
  onMenu,
  unreadCount,
}: FinanceHeaderProps) {
  const titles: Record<FinanceState, string> = {
    overview: 'Finance OS',
    overlaps: '중복 지출',
    candidates: '해지 후보',
    upcoming: '결제 예정',
    allclear: '모두 정상',
    stats: '재정 통계',
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F5F5F5] safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left */}
        <div className="flex items-center gap-2">
          {currentState !== 'overview' ? (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div className="w-8 h-8 bg-lavender-100 rounded-full flex items-center justify-center">
              <Wallet size={16} className="text-lavender-600" />
            </div>
          )}
          <span className="font-semibold text-[#1A1A1A]">{titles[currentState]}</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {currentState === 'overview' && (
            <button
              onClick={onAdd}
              className="w-10 h-10 flex items-center justify-center text-primary hover:bg-lavender-50 rounded-full transition-colors"
            >
              <Plus size={20} />
            </button>
          )}
          <button
            onClick={onNotification}
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
            onClick={onMenu}
            className="w-10 h-10 flex items-center justify-center text-[#666666] hover:bg-[#E5E5E5] rounded-full transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================
// Overview Screen (Entry Hub) - State-based IA 명세 기반
// ============================================

interface FinanceSummary {
  income: number;
  oneTimeExpense: number;
  fixedExpense: number;
  netCashFlow: number;
  hasIncomeData: boolean;
}

interface OverviewScreenProps {
  metrics: OverviewMetrics;
  stateSummary: OverviewStateSummary;
  recommended: 'overlaps' | 'candidates' | 'upcoming' | 'allclear';
  itemCount: number;
  financeSummary: FinanceSummary;
  onNavigate: (state: FinanceState) => void;
  onQuickAddRecurring?: () => void;
}

function OverviewScreen({
  metrics,
  stateSummary,
  recommended,
  itemCount,
  financeSummary,
  onNavigate,
  onQuickAddRecurring,
}: OverviewScreenProps) {
  const hasOverlaps = stateSummary.overlaps.countGroups > 0;
  const hasCandidates = stateSummary.candidates.countItems > 0;
  const hasUpcoming = stateSummary.upcoming.countPayments > 0;
  const isAllClear = !hasOverlaps && !hasCandidates && !hasUpcoming;

  // Empty State (데이터 없음)
  if (itemCount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="px-4 pt-8 text-center"
      >
        <div className="w-20 h-20 bg-lavender-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet size={40} className="text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">시작하기</h3>
        <p className="text-sm text-gray-500 mb-6">
          구독/정기결제를 추가하면<br />
          AlFredo가 똑똑하게 관리해줄게요
        </p>
        <button
          onClick={onQuickAddRecurring}
          className="px-6 py-3 bg-accent text-accent-dark font-medium rounded-xl hover:bg-accent-muted transition-colors"
        >
          첫 구독 추가하기
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-4 pt-4 space-y-4"
    >
      {/* ================================ */}
      {/* StatusSummaryRow - 3 Metrics */}
      {/* ================================ */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        {/* 이번 달 고정지출 */}
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">이번 달 고정지출</div>
          <div className="text-3xl font-bold text-gray-900">
            ₩{metrics.fixedCostThisMonth.toLocaleString()}
            <span className="text-sm font-normal text-gray-400 ml-1">/월</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">구독 + 대출 + 보험 + 적금</div>
        </div>

        {/* 하단 2개 메트릭 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 7일 결제 예정 */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">7일 결제 예정</span>
            </div>
            <div className="text-lg font-semibold text-gray-800">
              ₩{metrics.upcoming7DaysAmount.toLocaleString()}
            </div>
            {stateSummary.upcoming.nearestDDay !== null && (
              <div className="text-xs text-gray-400 mt-0.5">
                최대 D-{stateSummary.upcoming.nearestDDay}
              </div>
            )}
          </div>

          {/* Risk Badge */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">Risk</span>
            </div>
            <RiskBadge level={metrics.riskLevel} />
          </div>
        </div>
      </div>

      {/* ================================ */}
      {/* Monthly Cash Flow Summary */}
      {/* ================================ */}
      {financeSummary.hasIncomeData && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">이번 달 현금흐름</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* 수입 */}
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <ArrowDownCircle size={16} className="text-blue-500 mx-auto mb-1" />
              <div className="text-xs text-gray-500 mb-0.5">수입</div>
              <div className="text-sm font-semibold text-blue-700">
                +₩{financeSummary.income.toLocaleString()}
              </div>
            </div>

            {/* 지출 */}
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <ArrowUpCircle size={16} className="text-red-500 mx-auto mb-1" />
              <div className="text-xs text-gray-500 mb-0.5">총 지출</div>
              <div className="text-sm font-semibold text-red-700">
                -₩{(financeSummary.fixedExpense + financeSummary.oneTimeExpense).toLocaleString()}
              </div>
            </div>

            {/* 순 현금흐름 */}
            <div className={`text-center p-2 rounded-lg ${
              financeSummary.netCashFlow >= 0 ? 'bg-emerald-50' : 'bg-amber-50'
            }`}>
              {financeSummary.netCashFlow >= 0 ? (
                <TrendingUp size={16} className="text-emerald-500 mx-auto mb-1" />
              ) : (
                <TrendingDown size={16} className="text-amber-500 mx-auto mb-1" />
              )}
              <div className="text-xs text-gray-500 mb-0.5">순 흐름</div>
              <div className={`text-sm font-semibold ${
                financeSummary.netCashFlow >= 0 ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {financeSummary.netCashFlow >= 0 ? '+' : ''}₩{financeSummary.netCashFlow.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 세부 내역 (접힌 상태) */}
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
            고정 ₩{financeSummary.fixedExpense.toLocaleString()} +
            1회성 ₩{financeSummary.oneTimeExpense.toLocaleString()}
          </div>
        </div>
      )}

      {/* ================================ */}
      {/* StateCards - 분기점 허브 */}
      {/* ================================ */}
      <div className="space-y-3">
        {/* Overlaps Card */}
        {hasOverlaps && (
          <StateCard
            icon={<Repeat size={20} className="text-red-500" />}
            title="겹치는 구독"
            subtitle={`${stateSummary.overlaps.countGroups} 그룹`}
            highlight={`월 최대 ₩${stateSummary.overlaps.estimatedMonthlySavings.toLocaleString()} 절감 가능`}
            ctaText="정리하기"
            color="red"
            isPrimary={recommended === 'overlaps'}
            onClick={() => onNavigate('overlaps')}
          />
        )}

        {/* Candidates Card */}
        {hasCandidates && (
          <StateCard
            icon={<TrendingDown size={20} className="text-amber-500" />}
            title="해지 후보"
            subtitle={`${stateSummary.candidates.countItems}개`}
            highlight={`정리하면 월 ₩${stateSummary.candidates.estimatedMonthlySavings.toLocaleString()} 줄일 수 있어요`}
            ctaText="확인하기"
            color="amber"
            isPrimary={recommended === 'candidates'}
            onClick={() => onNavigate('candidates')}
          />
        )}

        {/* Upcoming Card */}
        {hasUpcoming && (
          <StateCard
            icon={<Clock size={20} className="text-blue-500" />}
            title="결제 임박"
            subtitle={stateSummary.upcoming.nearestDDay === 0
              ? '오늘'
              : `D-${stateSummary.upcoming.nearestDDay}`}
            highlight={`7일 내 ₩${stateSummary.upcoming.totalAmount.toLocaleString()}`}
            ctaText="일정 확인"
            color="blue"
            isPrimary={recommended === 'upcoming'}
            onClick={() => onNavigate('upcoming')}
          />
        )}

        {/* All Clear Card */}
        {isAllClear && (
          <StateCard
            icon={<Check size={20} className="text-emerald-500" />}
            title="All Clear"
            subtitle="이번 주는 안정적이에요"
            ctaText="전체 보기"
            color="emerald"
            isPrimary={true}
            onClick={() => onNavigate('allclear')}
          />
        )}
      </div>

      {/* Quick Actions (Optional) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onQuickAddRecurring}
          className="flex items-center justify-center gap-1.5 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Plus size={14} />
          추가
        </button>
        <button
          onClick={() => onNavigate('stats')}
          className="flex items-center justify-center gap-1.5 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <BarChart3 size={14} />
          통계
        </button>
        <button
          onClick={() => onNavigate('allclear')}
          className="flex items-center justify-center gap-1.5 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          전체 {itemCount}개
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// Risk Badge Component
// ============================================

function RiskBadge({ level }: { level: RiskLevel }) {
  const config = {
    LOW: {
      text: '안정',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      icon: <Shield size={14} className="text-emerald-600" />,
    },
    MEDIUM: {
      text: '주의',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      icon: <AlertTriangle size={14} className="text-amber-600" />,
    },
    HIGH: {
      text: '과부하',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      icon: <AlertTriangle size={14} className="text-red-600" />,
    },
  };

  const { text, bgColor, textColor, icon } = config[level];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${bgColor}`}>
      {icon}
      <span className={`text-sm font-medium ${textColor}`}>{text}</span>
    </div>
  );
}

// ============================================
// State Card (명세 기반)
// ============================================

interface StateCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  highlight?: string;
  ctaText: string;
  color: 'red' | 'amber' | 'blue' | 'emerald';
  isPrimary: boolean;
  onClick: () => void;
}

function StateCard({
  icon,
  title,
  subtitle,
  highlight,
  ctaText,
  color,
  isPrimary,
  onClick,
}: StateCardProps) {
  const colorConfig = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      hoverBorder: 'hover:border-red-300',
      ring: 'ring-red-300',
      ctaBg: 'bg-red-500 hover:bg-red-600',
      highlightText: 'text-red-600',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      hoverBorder: 'hover:border-amber-300',
      ring: 'ring-amber-300',
      ctaBg: 'bg-amber-500 hover:bg-amber-600',
      highlightText: 'text-amber-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-300',
      ring: 'ring-blue-300',
      ctaBg: 'bg-blue-500 hover:bg-blue-600',
      highlightText: 'text-blue-600',
    },
    emerald: {
      bg: 'bg-lavender-50',
      border: 'border-lavender-200',
      hoverBorder: 'hover:border-lavender-300',
      ring: 'ring-lavender-300',
      ctaBg: 'bg-primary hover:bg-lavender-500',
      highlightText: 'text-lavender-600',
    },
  };

  const { bg, border, hoverBorder, ring, ctaBg, highlightText } = colorConfig[color];

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${bg} ${border} ${hoverBorder} ${
        isPrimary ? `ring-2 ring-offset-2 ${ring}` : ''
      }`}
      aria-label={`${title} - ${subtitle}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-medium text-gray-800">{title}</div>
              <div className="text-sm text-gray-500">{subtitle}</div>
            </div>
            {isPrimary && (
              <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-500 shadow-sm flex-shrink-0">
                우선
              </span>
            )}
          </div>
          {highlight && (
            <div className={`text-sm font-medium mt-2 ${highlightText}`}>
              {highlight}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <span
          className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white ${ctaBg} transition-colors`}
        >
          {ctaText}
        </span>
      </div>
    </button>
  );
}

// ============================================
// Overlaps Screen
// ============================================

interface OverlapsScreenProps {
  duplicates: DuplicateGroup[];
  items: RecurringItem[];
  onResolve: (groupId: string, keepItemId: string) => void;
  onDismiss: (groupId: string) => void;
  onComplete: () => void;
}

function OverlapsScreen({ duplicates, items, onResolve, onDismiss, onComplete }: OverlapsScreenProps) {
  const activeDuplicates = duplicates.filter((g) => g.status === 'detected');

  if (activeDuplicates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="px-4 pt-8 text-center"
      >
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-success" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">중복 해결 완료!</h3>
        <p className="text-sm text-gray-500 mb-6">겹치는 구독이 모두 정리되었어요</p>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-lavender-500 transition-colors"
        >
          완료
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-4 pt-4 space-y-4"
    >
      <p className="text-sm text-gray-500 px-1">
        하나만 선택하면 나머지는 해지 후보로 이동해요
      </p>

      {activeDuplicates.map((group) => (
        <DuplicateCard
          key={group.id}
          group={group}
          items={items}
          onResolve={(keepItemId) => onResolve(group.id, keepItemId)}
          onDismiss={() => onDismiss(group.id)}
        />
      ))}
    </motion.div>
  );
}

// ============================================
// Candidates Screen
// ============================================

interface CandidatesScreenProps {
  candidates: RecurringItem[];
  onToggleWorkLife: (id: string) => void;
  onSelect: (id: string | null) => void;
  onComplete: () => void;
}

function CandidatesScreen({ candidates, onToggleWorkLife, onSelect, onComplete }: CandidatesScreenProps) {
  const dismissFromCancelCandidates = useFinanceStore((s) => s.dismissFromCancelCandidates);

  if (candidates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="px-4 pt-8 text-center"
      >
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-success" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">해지 후보 없음</h3>
        <p className="text-sm text-gray-500 mb-6">모든 구독을 잘 활용하고 계시네요!</p>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-lavender-500 transition-colors"
        >
          완료
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-4 pt-4 space-y-4"
    >
      <p className="text-sm text-gray-500 px-1">
        유지하거나 해지할 항목을 결정해주세요
      </p>

      {candidates.map((item) => (
        <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <RecurringItemCard
            item={item}
            onToggleWorkLife={() => onToggleWorkLife(item.id)}
            onSelect={() => onSelect(item.id)}
            showSwipeActions={false}
          />
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => dismissFromCancelCandidates(item.id)}
              className="flex-1 py-2.5 bg-lavender-100 text-lavender-700 font-medium rounded-lg text-sm hover:bg-lavender-200 transition-colors"
            >
              유지
            </button>
            <button className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-lg text-sm hover:bg-gray-200 transition-colors">
              보류
            </button>
            <button className="flex-1 py-2.5 bg-error/10 text-error font-medium rounded-lg text-sm hover:bg-error/20 transition-colors">
              해지
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ============================================
// Upcoming Screen
// ============================================

interface UpcomingScreenProps {
  upcoming: RecurringItem[];
  onAcknowledge: () => void;
}

function UpcomingScreen({ upcoming, onAcknowledge }: UpcomingScreenProps) {
  const totalAmount = upcoming.reduce((sum, item) => sum + item.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-4 pt-4 space-y-4"
    >
      {/* Summary */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="text-sm text-blue-600 mb-1">다음 7일 예정 결제</div>
        <div className="text-2xl font-bold text-blue-800">
          ₩{totalAmount.toLocaleString()}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {upcoming.map((item) => {
          const daysUntil = Math.ceil(
            (new Date(item.nextPaymentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    daysUntil <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  D-{daysUntil}
                </span>
                <div>
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-400">
                    {item.workLife === 'Work' ? '워크' : '라이프'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">
                  ₩{item.amount.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action */}
      <div className="pt-4">
        <button
          onClick={onAcknowledge}
          className="w-full py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
        >
          확인했어요
        </button>
        <button className="w-full py-3 text-gray-500 text-sm mt-2 hover:text-gray-700">
          이번 달만 알림 끄기
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// All Clear Screen
// ============================================

interface AllClearScreenProps {
  itemCount: number;
  onViewAll: () => void;
  onComplete: () => void;
}

function AllClearScreen({ itemCount, onViewAll, onComplete }: AllClearScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pt-8 text-center"
    >
      <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check size={40} className="text-success" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">모두 정상이에요!</h3>
      <p className="text-sm text-gray-500 mb-8">
        중복도 없고, 해지 후보도 없어요.
        <br />
        효율적으로 관리하고 계시네요!
      </p>

      <div className="space-y-3">
        <button
          onClick={onComplete}
          className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-lavender-500 transition-colors"
        >
          완료
        </button>
        {itemCount > 0 && (
          <button
            onClick={onViewAll}
            className="w-full py-3 text-gray-500 text-sm hover:text-gray-700"
          >
            전체 {itemCount}개 보기
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// Stats Screen
// ============================================

interface StatsScreenProps {
  incomeItems: IncomeItem[];
  recurringItems: RecurringItem[];
  commitmentItems: CommitmentItem[];
  oneTimeExpenses: OneTimeExpense[];
  duplicateGroups: DuplicateGroup[];
  growthLinks: GrowthLink[];
  onBack: () => void;
}

function StatsScreen({
  incomeItems,
  recurringItems,
  commitmentItems,
  oneTimeExpenses,
  duplicateGroups,
  growthLinks,
  onBack,
}: StatsScreenProps) {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  // 통계 계산
  const stats = useMemo(() => {
    return calculateFinanceStats(
      incomeItems,
      recurringItems,
      commitmentItems,
      oneTimeExpenses,
      period
    );
  }, [incomeItems, recurringItems, commitmentItems, oneTimeExpenses, period]);

  // 카테고리 분석
  const categoryAnalysis = useMemo(() => {
    return analyzeByCategory(recurringItems, oneTimeExpenses, period);
  }, [recurringItems, oneTimeExpenses, period]);

  // 절감 기회
  const opportunities = useMemo(() => {
    return findSavingsOpportunities(recurringItems, oneTimeExpenses, duplicateGroups, growthLinks);
  }, [recurringItems, oneTimeExpenses, duplicateGroups, growthLinks]);

  const totalPossibleSavings = opportunities.reduce((sum, o) => sum + o.estimatedMonthlySavings, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-4 pt-4 space-y-4 pb-8"
    >
      {/* Period Selector */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
        {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              period === p
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p === 'weekly' ? '주간' : p === 'monthly' ? '월간' : '연간'}
          </button>
        ))}
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500 mb-1">{stats.periodLabel}</div>

        {/* 수입 vs 지출 */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">총 수입</div>
            <div className="text-xl font-bold text-blue-600">
              +₩{stats.totalIncome.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              정기 ₩{stats.recurringIncome.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">총 지출</div>
            <div className="text-xl font-bold text-red-600">
              -₩{stats.totalExpense.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              고정 ₩{stats.fixedExpense.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 순 현금흐름 & 저축률 */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div className={`text-center p-3 rounded-xl ${
            stats.netCashFlow >= 0 ? 'bg-emerald-50' : 'bg-amber-50'
          }`}>
            <div className="text-xs text-gray-500 mb-1">순 현금흐름</div>
            <div className={`text-lg font-bold ${
              stats.netCashFlow >= 0 ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {stats.netCashFlow >= 0 ? '+' : ''}₩{stats.netCashFlow.toLocaleString()}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">저축률</div>
            <div className={`text-lg font-bold ${
              stats.savingsRate >= 20 ? 'text-emerald-600' : stats.savingsRate >= 0 ? 'text-gray-700' : 'text-red-600'
            }`}>
              {stats.savingsRate}%
            </div>
          </div>
        </div>

        {/* 전월 대비 (선택적) */}
        {stats.comparedToPrevious && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className={stats.comparedToPrevious.incomeChange >= 0 ? 'text-blue-500' : 'text-gray-500'}>
                수입 {stats.comparedToPrevious.incomeChange >= 0 ? '+' : ''}
                ₩{stats.comparedToPrevious.incomeChange.toLocaleString()}
              </span>
              <span className={stats.comparedToPrevious.expenseChange <= 0 ? 'text-emerald-500' : 'text-red-500'}>
                지출 {stats.comparedToPrevious.expenseChange >= 0 ? '+' : ''}
                ₩{stats.comparedToPrevious.expenseChange.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Work/Life 비율 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-sm font-medium text-gray-700 mb-3">Work / Life 지출 비율</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400"
              style={{ width: `${stats.workLifeExpenseRatio.work}%` }}
            />
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-blue-600">Work {stats.workLifeExpenseRatio.work}%</span>
            <span className="text-rose-600">Life {stats.workLifeExpenseRatio.life}%</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryAnalysis.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-3">카테고리별 지출</div>
          <div className="space-y-2">
            {categoryAnalysis.slice(0, 5).map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <div className="w-20 text-xs text-gray-600 truncate">{cat.label}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <div className="w-24 text-right text-xs text-gray-500">
                  ₩{cat.amount.toLocaleString()} ({cat.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savings Opportunities */}
      {opportunities.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">절감 기회</div>
            <div className="text-sm font-semibold text-emerald-600">
              월 ₩{totalPossibleSavings.toLocaleString()} 절감 가능
            </div>
          </div>
          <div className="space-y-2">
            {opportunities.slice(0, 3).map((opp) => (
              <div
                key={opp.id}
                className={`p-3 rounded-xl border ${
                  opp.priority === 'high'
                    ? 'bg-red-50 border-red-200'
                    : opp.priority === 'medium'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{opp.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opp.description}</div>
                  </div>
                  <div className="text-sm font-semibold text-emerald-600">
                    ₩{opp.estimatedMonthlySavings.toLocaleString()}/월
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {incomeItems.length === 0 && oneTimeExpenses.length === 0 && (
        <div className="text-center py-8">
          <BarChart3 size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">데이터를 추가해보세요</h3>
          <p className="text-sm text-gray-500">
            수입과 지출을 기록하면<br />
            자세한 통계를 볼 수 있어요
          </p>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
      >
        돌아가기
      </button>
    </motion.div>
  );
}

// ============================================
// Add Item Modal (탭 기반)
// ============================================

type AddItemTab = 'recurring' | 'income' | 'expense';

interface AddItemModalProps {
  onClose: () => void;
}

function AddItemModal({ onClose }: AddItemModalProps) {
  const addRecurringItem = useFinanceStore((s) => s.addRecurringItem);
  const addIncomeItem = useFinanceStore((s) => s.addIncomeItem);
  const addOneTimeExpense = useFinanceStore((s) => s.addOneTimeExpense);

  const [activeTab, setActiveTab] = useState<AddItemTab>('recurring');

  // === 정기결제 상태 ===
  const [recName, setRecName] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recBillingCycle, setRecBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [recBillingDay, setRecBillingDay] = useState('1');
  const [recWorkLife, setRecWorkLife] = useState<'Work' | 'Life'>('Life');

  // === 수입 상태 ===
  const [incName, setIncName] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incType, setIncType] = useState<IncomeType>('salary');
  const [incIsRecurring, setIncIsRecurring] = useState(true);
  const [incRecurringDay, setIncRecurringDay] = useState('25');
  const [incWorkLife, setIncWorkLife] = useState<'Work' | 'Life'>('Work');

  // === 1회성 지출 상태 ===
  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<OneTimeExpenseCategory>('other');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expIsPlanned, setExpIsPlanned] = useState(false);
  const [expWorkLife, setExpWorkLife] = useState<'Work' | 'Life'>('Life');

  // 지출명 입력 시 자동 분류
  const handleExpNameChange = (value: string) => {
    setExpName(value);
    if (value.length >= 2) {
      const classification = classifyOneTimeExpense(value, parseInt(expAmount) || undefined);
      setExpCategory(classification.category);
      setExpWorkLife(classification.workLife);
    }
  };

  const handleSubmitRecurring = () => {
    if (!recName || !recAmount) return;

    const now = new Date();
    const nextPaymentDate = new Date(now);
    const day = parseInt(recBillingDay) || 1;

    if (now.getDate() >= day) {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }
    nextPaymentDate.setDate(Math.min(day, 28));

    addRecurringItem({
      name: recName,
      amount: parseInt(recAmount) || 0,
      billingCycle: recBillingCycle,
      billingDay: day,
      categoryL1: 'other',
      workLife: recWorkLife,
      personalGrowthType: null,
      nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
    });

    onClose();
  };

  const handleSubmitIncome = () => {
    if (!incName || !incAmount) return;

    const expectedDate = new Date();
    if (incIsRecurring) {
      const day = parseInt(incRecurringDay) || 25;
      if (expectedDate.getDate() > day) {
        expectedDate.setMonth(expectedDate.getMonth() + 1);
      }
      expectedDate.setDate(day);
    }

    addIncomeItem({
      name: incName,
      amount: parseInt(incAmount) || 0,
      incomeType: incType,
      isRecurring: incIsRecurring,
      recurringDay: incIsRecurring ? parseInt(incRecurringDay) || 25 : undefined,
      workLife: incWorkLife,
      expectedDate: expectedDate.toISOString().split('T')[0],
    });

    onClose();
  };

  const handleSubmitExpense = () => {
    if (!expName || !expAmount) return;

    addOneTimeExpense({
      name: expName,
      amount: parseInt(expAmount) || 0,
      category: expCategory,
      workLife: expWorkLife,
      date: expDate,
      isPlanned: expIsPlanned,
    });

    onClose();
  };

  const handleSubmit = () => {
    if (activeTab === 'recurring') {
      handleSubmitRecurring();
    } else if (activeTab === 'income') {
      handleSubmitIncome();
    } else {
      handleSubmitExpense();
    }
  };

  const isValid = () => {
    if (activeTab === 'recurring') return recName && recAmount;
    if (activeTab === 'income') return incName && incAmount;
    return expName && expAmount;
  };

  const tabConfig = [
    { key: 'recurring' as AddItemTab, label: '정기결제', color: 'emerald' },
    { key: 'income' as AddItemTab, label: '수입', color: 'blue' },
    { key: 'expense' as AddItemTab, label: '1회지출', color: 'amber' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 탭 헤더 */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 정기결제 폼 */}
        {activeTab === 'recurring' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">서비스명</label>
              <input
                type="text"
                value={recName}
                onChange={(e) => setRecName(e.target.value)}
                placeholder="예: Netflix, Notion"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">금액 (원)</label>
              <input
                type="number"
                value={recAmount}
                onChange={(e) => setRecAmount(e.target.value)}
                placeholder="예: 17000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">결제 주기</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setRecBillingCycle('monthly')}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    recBillingCycle === 'monthly'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  월간
                </button>
                <button
                  onClick={() => setRecBillingCycle('yearly')}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    recBillingCycle === 'yearly'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  연간
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">결제일</label>
              <input
                type="number"
                min="1"
                max="31"
                value={recBillingDay}
                onChange={(e) => setRecBillingDay(e.target.value)}
                placeholder="1-31"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">분류</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setRecWorkLife('Work')}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    recWorkLife === 'Work'
                      ? 'border-work-border bg-work-bg text-work-text'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  Work
                </button>
                <button
                  onClick={() => setRecWorkLife('Life')}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    recWorkLife === 'Life'
                      ? 'border-life-border bg-life-bg text-life-text'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  Life
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수입 폼 */}
        {activeTab === 'income' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">수입명</label>
              <input
                type="text"
                value={incName}
                onChange={(e) => setIncName(e.target.value)}
                placeholder="예: 월급, 프리랜서 수입"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">금액 (원)</label>
              <input
                type="number"
                value={incAmount}
                onChange={(e) => setIncAmount(e.target.value)}
                placeholder="예: 4500000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">수입 유형</label>
              <select
                value={incType}
                onChange={(e) => setIncType(e.target.value as IncomeType)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
              >
                {Object.entries(INCOME_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">반복 여부</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIncIsRecurring(true)}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    incIsRecurring
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  매달 반복
                </button>
                <button
                  onClick={() => setIncIsRecurring(false)}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    !incIsRecurring
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  1회성
                </button>
              </div>
            </div>

            {incIsRecurring && (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">수입일</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={incRecurringDay}
                  onChange={(e) => setIncRecurringDay(e.target.value)}
                  placeholder="25"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-gray-600 mb-1 block">분류</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIncWorkLife('Work')}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    incWorkLife === 'Work'
                      ? 'border-work-border bg-work-bg text-work-text'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  Work
                </button>
                <button
                  onClick={() => setIncWorkLife('Life')}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    incWorkLife === 'Life'
                      ? 'border-life-border bg-life-bg text-life-text'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  Life
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1회지출 폼 */}
        {activeTab === 'expense' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">지출 내역</label>
              <input
                type="text"
                value={expName}
                onChange={(e) => handleExpNameChange(e.target.value)}
                placeholder="예: 쿠팡 쇼핑, 커피"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
              {expName && expCategory !== 'other' && (
                <div className="text-xs text-amber-600 mt-1">
                  자동 분류: {EXPENSE_CATEGORY_LABELS[expCategory]}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">금액 (원)</label>
              <input
                type="number"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                placeholder="예: 35000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">카테고리</label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value as OneTimeExpenseCategory)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white"
              >
                {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">지출일</label>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">지출 유형</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpIsPlanned(true)}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    expIsPlanned
                      ? 'border-amber-500 bg-amber-50 text-amber-600'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  계획된 지출
                </button>
                <button
                  onClick={() => setExpIsPlanned(false)}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    !expIsPlanned
                      ? 'border-amber-500 bg-amber-50 text-amber-600'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  즉흥 지출
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">분류</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpWorkLife('Work')}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    expWorkLife === 'Work'
                      ? 'border-work-border bg-work-bg text-work-text'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  Work
                </button>
                <button
                  onClick={() => setExpWorkLife('Life')}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    expWorkLife === 'Life'
                      ? 'border-life-border bg-life-bg text-life-text'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  Life
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-500 font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid()}
            className={`flex-1 py-3 font-medium rounded-xl transition-colors ${
              isValid()
                ? activeTab === 'recurring'
                  ? 'bg-primary text-white hover:bg-lavender-500'
                  : activeTab === 'income'
                  ? 'bg-info text-white hover:bg-blue-600'
                  : 'bg-warning text-white hover:bg-amber-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            추가
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
