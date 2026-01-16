/**
 * Finance OS - Zustand Store
 *
 * 구독/정기결제/보험/적금/대출/할부 등 반복 지출 관리
 * 핵심: 입력 최소화 + 결정 보조
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  RecurringItem,
  CommitmentItem,
  Goal,
  GrowthLink,
  DuplicateGroup,
  AutoClassificationRule,
  FinanceOverview,
  FinanceNudge,
  WorkLifeType,
  PersonalGrowthType,
  UsageCheckResponse,
  IncomeItem,
  OneTimeExpense,
  INCOME_TYPE_DEFAULT_WORKLIFE,
  EXPENSE_CATEGORY_DEFAULT_WORKLIFE,
} from '../services/finance/types';
import {
  classifyWorkLife,
  updateClassificationRule,
  detectDuplicates,
  processUsageCheckResponse,
  generateFinanceOverview,
  shouldSuggestGoal,
  createRecurringItem,
  createCommitmentItem,
  createGoal,
} from '../services/finance';

// ============================================
// Store Interface
// ============================================

interface FinanceState {
  // Data
  recurringItems: RecurringItem[];
  commitmentItems: CommitmentItem[];
  goals: Goal[];
  growthLinks: GrowthLink[];
  duplicateGroups: DuplicateGroup[];
  classificationRules: AutoClassificationRule[];
  nudges: FinanceNudge[];
  incomeItems: IncomeItem[];
  oneTimeExpenses: OneTimeExpense[];

  // Computed (cached)
  overview: FinanceOverview | null;

  // UI State
  activeTab: 'overlaps' | 'candidates' | 'all';
  selectedItemId: string | null;
  showUsageCheckModal: boolean;
  currentUsageCheckItemId: string | null;
  statsViewPeriod: 'weekly' | 'monthly' | 'yearly';

  // Actions - Recurring Items
  addRecurringItem: (item: Omit<RecurringItem, 'id' | 'createdAt' | 'updatedAt' | 'usageSignalScore' | 'duplicateGroupId' | 'autoRuleId'>) => void;
  updateRecurringItem: (id: string, updates: Partial<RecurringItem>) => void;
  deleteRecurringItem: (id: string) => void;
  toggleWorkLife: (id: string) => void;
  setPersonalGrowthType: (id: string, type: PersonalGrowthType) => void;

  // Actions - Commitment Items
  addCommitmentItem: (item: Omit<CommitmentItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCommitmentItem: (id: string, updates: Partial<CommitmentItem>) => void;
  deleteCommitmentItem: (id: string) => void;

  // Actions - Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'linkedItemCount' | 'monthlyInvestment'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  linkItemToGoal: (itemId: string, goalId: string, weight: 'primary' | 'secondary') => void;
  unlinkItemFromGoal: (itemId: string, goalId: string) => void;

  // Actions - Usage Check
  submitUsageCheck: (response: UsageCheckResponse) => void;
  markAsCancelCandidate: (id: string) => void;
  dismissFromCancelCandidates: (id: string) => void;

  // Actions - Duplicates
  resolveDuplicate: (groupId: string, keepItemId: string) => void;
  dismissDuplicate: (groupId: string) => void;

  // Actions - Nudges
  dismissNudge: (nudgeId: string) => void;

  // Actions - Income Items
  addIncomeItem: (item: Omit<IncomeItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIncomeItem: (id: string, updates: Partial<IncomeItem>) => void;
  deleteIncomeItem: (id: string) => void;

  // Actions - One-Time Expenses
  addOneTimeExpense: (expense: Omit<OneTimeExpense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOneTimeExpense: (id: string, updates: Partial<OneTimeExpense>) => void;
  deleteOneTimeExpense: (id: string) => void;

  // Actions - UI
  setActiveTab: (tab: 'overlaps' | 'candidates' | 'all') => void;
  setSelectedItem: (id: string | null) => void;
  openUsageCheckModal: (itemId: string) => void;
  closeUsageCheckModal: () => void;
  setStatsViewPeriod: (period: 'weekly' | 'monthly' | 'yearly') => void;

  // Actions - Refresh
  refreshOverview: () => void;
  refreshDuplicates: () => void;
  checkGoalSuggestion: () => { suggest: boolean; suggestedTitle?: string; relatedItemIds?: string[] };
}

// ============================================
// Initial State
// ============================================

const initialState = {
  recurringItems: [],
  commitmentItems: [],
  goals: [],
  growthLinks: [],
  duplicateGroups: [],
  classificationRules: [],
  nudges: [],
  incomeItems: [],
  oneTimeExpenses: [],
  overview: null,
  activeTab: 'all' as const,
  selectedItemId: null,
  showUsageCheckModal: false,
  currentUsageCheckItemId: null,
  statsViewPeriod: 'monthly' as const,
};

// ============================================
// Store Implementation
// ============================================

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // Recurring Items Actions
      // ============================================

      addRecurringItem: (itemData) => {
        const { classificationRules, goals, growthLinks } = get();

        // 연결된 목표 찾기
        const linkedGoalIds = growthLinks
          .filter((l) => l.recurringItemId === itemData.name) // 임시로 name 사용
          .map((l) => l.goalId);
        const linkedGoals = goals.filter((g) => linkedGoalIds.includes(g.id));

        // Work/Life 자동 분류
        const workLife = classifyWorkLife(
          itemData.name,
          itemData.categoryL1,
          classificationRules,
          linkedGoals
        );

        const newItem = createRecurringItem({
          ...itemData,
          workLife: itemData.workLife || workLife,
        });

        set((state) => ({
          recurringItems: [...state.recurringItems, newItem],
        }));

        // 중복 탐지 & Overview 갱신
        get().refreshDuplicates();
        get().refreshOverview();
      },

      updateRecurringItem: (id, updates) => {
        set((state) => ({
          recurringItems: state.recurringItems.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
        get().refreshOverview();
      },

      deleteRecurringItem: (id) => {
        set((state) => ({
          recurringItems: state.recurringItems.filter((item) => item.id !== id),
          growthLinks: state.growthLinks.filter((l) => l.recurringItemId !== id),
        }));
        get().refreshDuplicates();
        get().refreshOverview();
      },

      toggleWorkLife: (id) => {
        const { recurringItems, classificationRules } = get();
        const item = recurringItems.find((i) => i.id === id);
        if (!item) return;

        const newWorkLife: WorkLifeType = item.workLife === 'Work' ? 'Life' : 'Work';

        // 분류 규칙 업데이트
        const updatedRules = updateClassificationRule(
          item.categoryL1,
          newWorkLife,
          classificationRules
        );

        set((state) => ({
          recurringItems: state.recurringItems.map((i) =>
            i.id === id
              ? { ...i, workLife: newWorkLife, updatedAt: new Date().toISOString() }
              : i
          ),
          classificationRules: updatedRules,
        }));
      },

      setPersonalGrowthType: (id, type) => {
        set((state) => ({
          recurringItems: state.recurringItems.map((item) =>
            item.id === id
              ? { ...item, personalGrowthType: type, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      // ============================================
      // Commitment Items Actions
      // ============================================

      addCommitmentItem: (itemData) => {
        const newItem = createCommitmentItem(itemData);
        set((state) => ({
          commitmentItems: [...state.commitmentItems, newItem],
        }));
        get().refreshOverview();
      },

      updateCommitmentItem: (id, updates) => {
        set((state) => ({
          commitmentItems: state.commitmentItems.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
        get().refreshOverview();
      },

      deleteCommitmentItem: (id) => {
        set((state) => ({
          commitmentItems: state.commitmentItems.filter((item) => item.id !== id),
        }));
        get().refreshOverview();
      },

      // ============================================
      // Goals Actions
      // ============================================

      addGoal: (goalData) => {
        const newGoal = createGoal(goalData);
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
              : goal
          ),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
          growthLinks: state.growthLinks.filter((l) => l.goalId !== id),
        }));
      },

      linkItemToGoal: (itemId, goalId, weight) => {
        const { growthLinks, recurringItems, goals } = get();

        // 이미 연결되어 있으면 무시
        if (growthLinks.some((l) => l.recurringItemId === itemId && l.goalId === goalId)) {
          return;
        }

        const newLink: GrowthLink = {
          id: `${itemId}-${goalId}`,
          recurringItemId: itemId,
          goalId,
          weight,
          createdAt: new Date().toISOString(),
        };

        // 목표의 연결 항목 수 & 월 투자액 업데이트
        const item = recurringItems.find((i) => i.id === itemId);
        const goal = goals.find((g) => g.id === goalId);

        if (item && goal) {
          const monthlyAmount =
            item.billingCycle === 'yearly' ? item.amount / 12 : item.amount;

          set((state) => ({
            growthLinks: [...state.growthLinks, newLink],
            goals: state.goals.map((g) =>
              g.id === goalId
                ? {
                    ...g,
                    linkedItemCount: g.linkedItemCount + 1,
                    monthlyInvestment: g.monthlyInvestment + monthlyAmount,
                    updatedAt: new Date().toISOString(),
                  }
                : g
            ),
          }));
        }
      },

      unlinkItemFromGoal: (itemId, goalId) => {
        const { recurringItems, goals } = get();
        const item = recurringItems.find((i) => i.id === itemId);
        const goal = goals.find((g) => g.id === goalId);

        if (item && goal) {
          const monthlyAmount =
            item.billingCycle === 'yearly' ? item.amount / 12 : item.amount;

          set((state) => ({
            growthLinks: state.growthLinks.filter(
              (l) => !(l.recurringItemId === itemId && l.goalId === goalId)
            ),
            goals: state.goals.map((g) =>
              g.id === goalId
                ? {
                    ...g,
                    linkedItemCount: Math.max(0, g.linkedItemCount - 1),
                    monthlyInvestment: Math.max(0, g.monthlyInvestment - monthlyAmount),
                    updatedAt: new Date().toISOString(),
                  }
                : g
            ),
          }));
        }
      },

      // ============================================
      // Usage Check Actions
      // ============================================

      submitUsageCheck: (response) => {
        const { recurringItems } = get();
        const item = recurringItems.find((i) => i.id === response.itemId);
        if (!item) return;

        const updatedItem = processUsageCheckResponse(item, response);

        set((state) => ({
          recurringItems: state.recurringItems.map((i) =>
            i.id === response.itemId ? updatedItem : i
          ),
          showUsageCheckModal: false,
          currentUsageCheckItemId: null,
        }));

        get().refreshDuplicates();
        get().refreshOverview();
      },

      markAsCancelCandidate: (id) => {
        set((state) => ({
          recurringItems: state.recurringItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  retentionIntent: 'cancel_candidate' as const,
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));
        get().refreshOverview();
      },

      dismissFromCancelCandidates: (id) => {
        set((state) => ({
          recurringItems: state.recurringItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  retentionIntent: 'keep' as const,
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));
        get().refreshOverview();
      },

      // ============================================
      // Duplicates Actions
      // ============================================

      resolveDuplicate: (groupId, keepItemId) => {
        const { duplicateGroups } = get();
        const group = duplicateGroups.find((g) => g.id === groupId);
        if (!group) return;

        // 유지하지 않는 항목들을 해지 후보로 마킹
        const itemsToCancel = group.itemIds.filter((id) => id !== keepItemId);

        set((state) => ({
          duplicateGroups: state.duplicateGroups.map((g) =>
            g.id === groupId ? { ...g, status: 'resolved' as const } : g
          ),
          recurringItems: state.recurringItems.map((item) =>
            itemsToCancel.includes(item.id)
              ? {
                  ...item,
                  retentionIntent: 'cancel_candidate' as const,
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));
        get().refreshOverview();
      },

      dismissDuplicate: (groupId) => {
        set((state) => ({
          duplicateGroups: state.duplicateGroups.map((g) =>
            g.id === groupId ? { ...g, status: 'dismissed' as const } : g
          ),
        }));
        get().refreshOverview();
      },

      // ============================================
      // Nudges Actions
      // ============================================

      dismissNudge: (nudgeId) => {
        set((state) => ({
          nudges: state.nudges.map((n) =>
            n.id === nudgeId
              ? { ...n, dismissedAt: new Date().toISOString() }
              : n
          ),
        }));
      },

      // ============================================
      // Income Items Actions
      // ============================================

      addIncomeItem: (itemData) => {
        const now = new Date().toISOString();
        const newItem: IncomeItem = {
          ...itemData,
          id: `income-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          workLife: itemData.workLife || INCOME_TYPE_DEFAULT_WORKLIFE[itemData.incomeType] || 'Life',
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          incomeItems: [...state.incomeItems, newItem],
        }));
        get().refreshOverview();
      },

      updateIncomeItem: (id, updates) => {
        set((state) => ({
          incomeItems: state.incomeItems.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
        get().refreshOverview();
      },

      deleteIncomeItem: (id) => {
        set((state) => ({
          incomeItems: state.incomeItems.filter((item) => item.id !== id),
        }));
        get().refreshOverview();
      },

      // ============================================
      // One-Time Expenses Actions
      // ============================================

      addOneTimeExpense: (expenseData) => {
        const now = new Date().toISOString();
        const newExpense: OneTimeExpense = {
          ...expenseData,
          id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          workLife: expenseData.workLife || EXPENSE_CATEGORY_DEFAULT_WORKLIFE[expenseData.category] || 'Life',
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          oneTimeExpenses: [...state.oneTimeExpenses, newExpense],
        }));
        get().refreshOverview();
      },

      updateOneTimeExpense: (id, updates) => {
        set((state) => ({
          oneTimeExpenses: state.oneTimeExpenses.map((expense) =>
            expense.id === id
              ? { ...expense, ...updates, updatedAt: new Date().toISOString() }
              : expense
          ),
        }));
        get().refreshOverview();
      },

      deleteOneTimeExpense: (id) => {
        set((state) => ({
          oneTimeExpenses: state.oneTimeExpenses.filter((expense) => expense.id !== id),
        }));
        get().refreshOverview();
      },

      // ============================================
      // UI Actions
      // ============================================

      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      setSelectedItem: (id) => {
        set({ selectedItemId: id });
      },

      openUsageCheckModal: (itemId) => {
        set({ showUsageCheckModal: true, currentUsageCheckItemId: itemId });
      },

      closeUsageCheckModal: () => {
        set({ showUsageCheckModal: false, currentUsageCheckItemId: null });
      },

      setStatsViewPeriod: (period) => {
        set({ statsViewPeriod: period });
      },

      // ============================================
      // Refresh Actions
      // ============================================

      refreshOverview: () => {
        const { recurringItems, commitmentItems, duplicateGroups } = get();
        const overview = generateFinanceOverview(
          recurringItems,
          commitmentItems,
          duplicateGroups
        );
        set({ overview });
      },

      refreshDuplicates: () => {
        const { recurringItems } = get();
        const duplicates = detectDuplicates(recurringItems);
        set({ duplicateGroups: duplicates });
      },

      checkGoalSuggestion: () => {
        const { recurringItems, goals } = get();
        return shouldSuggestGoal(recurringItems, goals);
      },
    }),
    {
      name: 'alfredo_finance',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        recurringItems: state.recurringItems,
        commitmentItems: state.commitmentItems,
        goals: state.goals,
        growthLinks: state.growthLinks,
        duplicateGroups: state.duplicateGroups,
        classificationRules: state.classificationRules,
        incomeItems: state.incomeItems,
        oneTimeExpenses: state.oneTimeExpenses,
      }),
    }
  )
);

// ============================================
// Selectors
// ============================================

export const selectRecurringByTab = (state: FinanceState) => {
  const { recurringItems, duplicateGroups, activeTab } = state;

  switch (activeTab) {
    case 'overlaps':
      const duplicateItemIds = new Set(
        duplicateGroups
          .filter((g) => g.status === 'detected')
          .flatMap((g) => g.itemIds)
      );
      return recurringItems.filter((item) => duplicateItemIds.has(item.id));

    case 'candidates':
      return recurringItems.filter(
        (item) => item.retentionIntent === 'cancel_candidate'
      );

    case 'all':
    default:
      return recurringItems;
  }
};

export const selectWorkItems = (state: FinanceState) =>
  state.recurringItems.filter((item) => item.workLife === 'Work');

export const selectLifeItems = (state: FinanceState) =>
  state.recurringItems.filter((item) => item.workLife === 'Life');

export const selectUpcomingPayments = (state: FinanceState) =>
  state.overview?.upcomingPayments || [];

export const selectMonthlyTotal = (state: FinanceState) =>
  state.overview?.monthlyFixedExpense || 0;

// Income Selectors
export const selectIncomeItems = (state: FinanceState) => state.incomeItems;

export const selectRecurringIncome = (state: FinanceState) =>
  state.incomeItems.filter((item) => item.isRecurring);

export const selectOneTimeIncome = (state: FinanceState) =>
  state.incomeItems.filter((item) => !item.isRecurring);

export const selectIncomeByType = (state: FinanceState) => {
  const byType: Record<string, number> = {};
  state.incomeItems.forEach((item) => {
    byType[item.incomeType] = (byType[item.incomeType] || 0) + item.amount;
  });
  return byType;
};

// One-Time Expense Selectors
export const selectOneTimeExpenses = (state: FinanceState) => state.oneTimeExpenses;

export const selectExpensesByCategory = (state: FinanceState) => {
  const byCategory: Record<string, number> = {};
  state.oneTimeExpenses.forEach((expense) => {
    byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
  });
  return byCategory;
};

export const selectExpensesInPeriod = (state: FinanceState, startDate: Date, endDate: Date) =>
  state.oneTimeExpenses.filter((expense) => {
    const date = new Date(expense.date);
    return date >= startDate && date <= endDate;
  });

export const selectPlannedExpenses = (state: FinanceState) =>
  state.oneTimeExpenses.filter((expense) => expense.isPlanned);

export const selectUnplannedExpenses = (state: FinanceState) =>
  state.oneTimeExpenses.filter((expense) => !expense.isPlanned);
