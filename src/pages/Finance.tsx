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
  Calendar,
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
  DuplicateGroup,
  FinanceOverview,
} from '../services/finance/types';

// 상태 타입 정의
type FinanceState = 'overview' | 'overlaps' | 'candidates' | 'upcoming' | 'allclear';

export default function Finance() {
  // Store
  const recurringItems = useFinanceStore((s) => s.recurringItems);
  const duplicateGroups = useFinanceStore((s) => s.duplicateGroups);
  const overview = useFinanceStore((s) => s.overview);

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

  // 상태 계산 (State Detection)
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

  // 우선순위에 따른 자동 상태 결정
  const determinePrimaryState = (): FinanceState => {
    if (stateInfo.hasOverlaps) return 'overlaps';
    if (stateInfo.hasCandidates) return 'candidates';
    if (stateInfo.hasUpcoming) return 'upcoming';
    return 'allclear';
  };

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
            overview={overview}
            stateInfo={stateInfo}
            onNavigate={setCurrentState}
            primaryState={determinePrimaryState()}
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
      </AnimatePresence>

      {/* Add Button (Overview에서만) */}
      {currentState === 'overview' && (
        <div className="fixed bottom-24 right-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-600 transition-colors"
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
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Wallet size={16} className="text-emerald-600" />
            </div>
          )}
          <span className="font-semibold text-[#1A1A1A]">{titles[currentState]}</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {currentState === 'overview' && (
            <button
              onClick={onAdd}
              className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
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
// Overview Screen (Entry Hub)
// ============================================

interface OverviewScreenProps {
  overview: FinanceOverview | null;
  stateInfo: {
    hasOverlaps: boolean;
    hasCandidates: boolean;
    hasUpcoming: boolean;
    overlapsCount: number;
    candidatesCount: number;
    upcomingCount: number;
    upcomingAmount: number;
  };
  onNavigate: (state: FinanceState) => void;
  primaryState: FinanceState;
}

function OverviewScreen({ overview, stateInfo, onNavigate, primaryState }: OverviewScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-4 pt-4 space-y-4"
    >
      {/* Monthly Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500 mb-1">이번 달 고정지출</div>
        <div className="text-3xl font-bold text-gray-900 mb-4">
          ₩{(overview?.monthlyFixedExpense || 0).toLocaleString()}
          <span className="text-sm font-normal text-gray-400 ml-1">/월</span>
        </div>

        {/* 다음 7일 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">다음 7일 결제</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">
            ₩{stateInfo.upcomingAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* State Badges - 분기점 허브 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500 px-1">확인이 필요한 항목</h3>

        {/* 중복 있음 */}
        {stateInfo.hasOverlaps && (
          <StateBadgeCard
            icon={<Repeat size={20} className="text-red-500" />}
            title="겹치는 구독"
            subtitle={`${stateInfo.overlapsCount}개 발견`}
            color="red"
            isPrimary={primaryState === 'overlaps'}
            onClick={() => onNavigate('overlaps')}
          />
        )}

        {/* 해지 후보 */}
        {stateInfo.hasCandidates && (
          <StateBadgeCard
            icon={<TrendingDown size={20} className="text-amber-500" />}
            title="해지 후보"
            subtitle={`${stateInfo.candidatesCount}개`}
            color="amber"
            isPrimary={primaryState === 'candidates'}
            onClick={() => onNavigate('candidates')}
          />
        )}

        {/* 결제 임박 */}
        {stateInfo.hasUpcoming && (
          <StateBadgeCard
            icon={<Clock size={20} className="text-blue-500" />}
            title="결제 예정"
            subtitle={`${stateInfo.upcomingCount}건 · D-7 이내`}
            color="blue"
            isPrimary={primaryState === 'upcoming'}
            onClick={() => onNavigate('upcoming')}
          />
        )}

        {/* All Clear */}
        {!stateInfo.hasOverlaps && !stateInfo.hasCandidates && !stateInfo.hasUpcoming && (
          <StateBadgeCard
            icon={<Check size={20} className="text-emerald-500" />}
            title="모두 정상"
            subtitle="확인이 필요한 항목이 없어요"
            color="emerald"
            isPrimary={true}
            onClick={() => onNavigate('allclear')}
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-400 mb-1">총 구독</div>
            <div className="text-lg font-semibold text-gray-800">
              {overview?.upcomingPayments?.length || 0}개
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">중복</div>
            <div className={`text-lg font-semibold ${stateInfo.hasOverlaps ? 'text-red-500' : 'text-gray-800'}`}>
              {stateInfo.overlapsCount}개
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">해지 후보</div>
            <div className={`text-lg font-semibold ${stateInfo.hasCandidates ? 'text-amber-500' : 'text-gray-800'}`}>
              {stateInfo.candidatesCount}개
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// State Badge Card
// ============================================

interface StateBadgeCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: 'red' | 'amber' | 'blue' | 'emerald';
  isPrimary: boolean;
  onClick: () => void;
}

function StateBadgeCard({ icon, title, subtitle, color, isPrimary, onClick }: StateBadgeCardProps) {
  const colorClasses = {
    red: 'bg-red-50 border-red-200 hover:border-red-300',
    amber: 'bg-amber-50 border-amber-200 hover:border-amber-300',
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-300',
    emerald: 'bg-emerald-50 border-emerald-200 hover:border-emerald-300',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${colorClasses[color]} ${
        isPrimary ? 'ring-2 ring-offset-2 ring-' + color + '-300' : ''
      }`}
    >
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium text-gray-800">{title}</div>
        <div className="text-sm text-gray-500">{subtitle}</div>
      </div>
      {isPrimary && (
        <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-500 shadow-sm">
          우선
        </span>
      )}
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
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">중복 해결 완료!</h3>
        <p className="text-sm text-gray-500 mb-6">겹치는 구독이 모두 정리되었어요</p>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
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
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">해지 후보 없음</h3>
        <p className="text-sm text-gray-500 mb-6">모든 구독을 잘 활용하고 계시네요!</p>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
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
              className="flex-1 py-2.5 bg-emerald-100 text-emerald-700 font-medium rounded-lg text-sm hover:bg-emerald-200 transition-colors"
            >
              유지
            </button>
            <button className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-lg text-sm hover:bg-gray-200 transition-colors">
              보류
            </button>
            <button className="flex-1 py-2.5 bg-red-100 text-red-700 font-medium rounded-lg text-sm hover:bg-red-200 transition-colors">
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
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check size={40} className="text-emerald-500" />
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
          className="w-full py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
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
// Add Item Modal
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
    nextPaymentDate.setDate(Math.min(day, 28));

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
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          구독/정기결제 추가
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">서비스명</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: Netflix, Notion"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">금액 (원)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="예: 17000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">결제 주기</label>
            <div className="flex gap-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                월간
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
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
              value={billingDay}
              onChange={(e) => setBillingDay(e.target.value)}
              placeholder="1-31"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

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
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
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
