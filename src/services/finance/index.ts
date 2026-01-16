/**
 * Finance OS - Core Service
 *
 * 핵심 설계 원칙:
 * 1. 사용자는 분류자 ❌ / 판단 제공자 ⭕
 * 2. 모든 질문은 10초 이내 응답 가능
 * 3. 목표는 강제 설정 ❌ / 나중에 발견 ⭕
 * 4. 자동 분류는 항상 수정 가능 + 수정은 곧 규칙
 * 5. 화면은 "보기 → 결정"만 있고 "관리 노동"은 없음
 */

import { v4 as uuidv4 } from 'uuid';
import {
  RecurringItem,
  CommitmentItem,
  Goal,
  WorkLifeType,
  ServiceCategory,
  DuplicateGroup,
  FinanceOverview,
  UpcomingPayment,
  FinanceWarning,
  UsageCheckQuestion,
  UsageCheckResponse,
  UsageFrequency,
  AutoClassificationRule,
  CATEGORY_DEFAULT_WORKLIFE,
  WORK_KEYWORDS,
  USAGE_CHECK_QUESTIONS,
} from './types';

// ============================================
// 4.1 Work / Life 자동 분류
// ============================================

/**
 * 서비스명과 카테고리를 기반으로 Work/Life 자동 분류
 */
export function classifyWorkLife(
  name: string,
  categoryL1: ServiceCategory,
  userRules: AutoClassificationRule[],
  linkedGoals?: Goal[]
): WorkLifeType {
  // 1. 사용자 수동 변경 이력 (최우선)
  const userRule = userRules.find(
    (r) => r.categoryL1 === categoryL1 && r.overrideCount >= 2
  );
  if (userRule) {
    return userRule.workLife;
  }

  // 2. 목표 연결 확인
  if (linkedGoals && linkedGoals.length > 0) {
    const hasCareerGoal = linkedGoals.some((g) => g.goalType === 'Career');
    if (hasCareerGoal) {
      return 'Work';
    }
  }

  // 3. 키워드 보조 (Work 가중치)
  const nameLower = name.toLowerCase();
  const hasWorkKeyword = WORK_KEYWORDS.some((keyword) =>
    nameLower.includes(keyword.toLowerCase())
  );
  if (hasWorkKeyword) {
    return 'Work';
  }

  // 4. 카테고리 기본값
  return CATEGORY_DEFAULT_WORKLIFE[categoryL1] || 'Life';
}

/**
 * 사용자가 Work/Life를 수정했을 때 규칙 업데이트
 */
export function updateClassificationRule(
  categoryL1: ServiceCategory,
  newWorkLife: WorkLifeType,
  existingRules: AutoClassificationRule[]
): AutoClassificationRule[] {
  const existingRule = existingRules.find((r) => r.categoryL1 === categoryL1);

  if (existingRule) {
    // 같은 값으로 변경하면 카운트 증가
    if (existingRule.workLife === newWorkLife) {
      return existingRules.map((r) =>
        r.id === existingRule.id
          ? { ...r, overrideCount: r.overrideCount + 1, updatedAt: new Date().toISOString() }
          : r
      );
    }
    // 다른 값으로 변경하면 리셋
    return existingRules.map((r) =>
      r.id === existingRule.id
        ? { ...r, workLife: newWorkLife, overrideCount: 1, updatedAt: new Date().toISOString() }
        : r
    );
  }

  // 새 규칙 생성
  return [
    ...existingRules,
    {
      id: uuidv4(),
      categoryL1,
      workLife: newWorkLife,
      overrideCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// ============================================
// 5. 중복 지출 탐지 (Duplicate Detector)
// ============================================

/**
 * 중복 구독 탐지
 * 기준: 동일 서비스군, 최근 60일 내 2개 이상 결제, 목적 동일
 */
export function detectDuplicates(items: RecurringItem[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processedIds = new Set<string>();

  // 카테고리별로 그룹화
  const categoryGroups = new Map<ServiceCategory, RecurringItem[]>();
  items.forEach((item) => {
    const existing = categoryGroups.get(item.categoryL1) || [];
    categoryGroups.set(item.categoryL1, [...existing, item]);
  });

  // 각 카테고리에서 중복 탐지
  categoryGroups.forEach((categoryItems, category) => {
    if (categoryItems.length < 2) return;

    // 같은 목적의 서비스들 그룹화
    const purposeMap = getPurposeForCategory(category);
    if (!purposeMap) {
      // 같은 카테고리 내 2개 이상이면 중복 가능성
      const itemIds = categoryItems
        .filter((item) => !processedIds.has(item.id))
        .map((item) => item.id);

      if (itemIds.length >= 2) {
        const relevantItems = categoryItems.filter((i) => itemIds.includes(i.id));
        const potentialSavings = Math.min(...relevantItems.map((i) => i.amount));

        groups.push({
          id: uuidv4(),
          purpose: getCategoryLabel(category),
          itemIds,
          potentialSavings,
          suggestedKeep: relevantItems.reduce((a, b) =>
            a.usageSignalScore > b.usageSignalScore ? a : b
          ).id,
          status: 'detected',
          createdAt: new Date().toISOString(),
        });

        itemIds.forEach((id) => processedIds.add(id));
      }
    }
  });

  return groups;
}

function getPurposeForCategory(category: ServiceCategory): string | null {
  const purposeMap: Partial<Record<ServiceCategory, string>> = {
    entertainment: '엔터테인먼트',
    fitness: '운동/피트니스',
    wellbeing: '명상/웰빙',
    cloud_storage: '클라우드 스토리지',
    collaboration: '업무 협업',
  };
  return purposeMap[category] || null;
}

function getCategoryLabel(category: ServiceCategory): string {
  const labels: Record<ServiceCategory, string> = {
    productivity: '생산성 도구',
    collaboration: '협업 도구',
    development: '개발 도구',
    design: '디자인 도구',
    education_career: '커리어 교육',
    entertainment: '엔터테인먼트',
    fitness: '운동/피트니스',
    wellbeing: '웰빙/명상',
    hobby: '취미',
    education_life: '자기계발',
    cloud_storage: '클라우드 스토리지',
    communication: '커뮤니케이션',
    finance: '금융 서비스',
    insurance: '보험',
    savings: '적금',
    other: '기타',
  };
  return labels[category];
}

// ============================================
// 6. 사용여부 추정 시스템 (Usage Guess)
// ============================================

/**
 * 사용여부 질문 대상 항목 필터링
 * 결제 D-3에 질문, 결제 직후에는 질문 ❌
 */
export function getItemsForUsageCheck(
  items: RecurringItem[],
  currentDate: Date = new Date()
): UsageCheckQuestion[] {
  return items
    .filter((item) => {
      const nextPayment = new Date(item.nextPaymentDate);
      const daysUntil = Math.ceil(
        (nextPayment.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      // D-3 ~ D-1 사이에만 질문
      return daysUntil >= 1 && daysUntil <= 3;
    })
    .map((item) => {
      const nextPayment = new Date(item.nextPaymentDate);
      const daysUntil = Math.ceil(
        (nextPayment.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        itemId: item.id,
        itemName: item.name,
        amount: item.amount,
        daysUntilPayment: daysUntil,
        questions: USAGE_CHECK_QUESTIONS,
      };
    });
}

/**
 * 사용여부 응답 처리 및 아이템 업데이트
 */
export function processUsageCheckResponse(
  item: RecurringItem,
  response: UsageCheckResponse
): RecurringItem {
  // Usage signal score 계산
  let usageScore = item.usageSignalScore;

  if (response.frequency === 'often') {
    usageScore = Math.min(1, usageScore + 0.2);
  } else if (response.frequency === 'sometimes') {
    usageScore = Math.max(0, Math.min(1, usageScore)); // 유지
  } else if (response.frequency === 'rarely') {
    usageScore = Math.max(0, usageScore - 0.3);
  }

  return {
    ...item,
    usageFrequency: response.frequency,
    hasDuplicate: response.hasDuplicate,
    retentionIntent: response.retention,
    usageSignalScore: usageScore,
    lastUsageCheck: response.checkedAt,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * '가끔' 처리 규칙 적용
 * - 2회 연속 '가끔' → 회색 상태 유지
 * - 연간 비용 상위 30% + '가끔' → 연간 비용 힌트 노출
 * - 중복 존재 + '가끔' → 중복 카드 상단 고정
 */
export function analyzeSometimesPattern(
  item: RecurringItem,
  allItems: RecurringItem[],
  previousFrequency?: UsageFrequency
): {
  showAnnualCostHint: boolean;
  prioritizeInDuplicates: boolean;
  isConsecutiveSometimes: boolean;
} {
  const isSometimes = item.usageFrequency === 'sometimes';
  const isConsecutiveSometimes = isSometimes && previousFrequency === 'sometimes';

  // 연간 비용 계산
  const annualCost =
    item.billingCycle === 'yearly' ? item.amount : item.amount * 12;
  const allAnnualCosts = allItems.map((i) =>
    i.billingCycle === 'yearly' ? i.amount : i.amount * 12
  );
  allAnnualCosts.sort((a, b) => b - a);
  const top30Threshold = allAnnualCosts[Math.floor(allAnnualCosts.length * 0.3)] || 0;

  const showAnnualCostHint = isSometimes && annualCost >= top30Threshold;
  const prioritizeInDuplicates = isSometimes && item.hasDuplicate === true;

  return {
    showAnnualCostHint,
    prioritizeInDuplicates,
    isConsecutiveSometimes,
  };
}

// ============================================
// 8. Finance Overview (홈 위젯)
// ============================================

/**
 * Finance Overview 데이터 생성
 */
export function generateFinanceOverview(
  recurringItems: RecurringItem[],
  commitmentItems: CommitmentItem[],
  duplicateGroups: DuplicateGroup[],
  currentDate: Date = new Date()
): FinanceOverview {
  // 이번 달 고정지출 계산
  const monthlyRecurring = recurringItems
    .filter((item) => item.billingCycle === 'monthly')
    .reduce((sum, item) => sum + item.amount, 0);

  const yearlyAsMonthly = recurringItems
    .filter((item) => item.billingCycle === 'yearly')
    .reduce((sum, item) => sum + item.amount / 12, 0);

  const monthlyCommitments = commitmentItems.reduce(
    (sum, item) => sum + item.monthlyPayment,
    0
  );

  const monthlyFixedExpense = monthlyRecurring + yearlyAsMonthly + monthlyCommitments;

  // 다음 7일 결제 항목
  const sevenDaysLater = new Date(currentDate);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  const upcomingPayments: UpcomingPayment[] = recurringItems
    .filter((item) => {
      const nextPayment = new Date(item.nextPaymentDate);
      return nextPayment >= currentDate && nextPayment <= sevenDaysLater;
    })
    .map((item) => {
      const nextPayment = new Date(item.nextPaymentDate);
      const daysUntil = Math.ceil(
        (nextPayment.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        itemId: item.id,
        name: item.name,
        amount: item.amount,
        dueDate: item.nextPaymentDate,
        daysUntil,
        workLife: item.workLife,
        icon: item.icon,
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // 경고 배지 결정
  const warningBadge = determineWarningBadge(
    recurringItems,
    duplicateGroups
  );

  // 카운트
  const duplicateCount = duplicateGroups.filter(
    (g) => g.status === 'detected'
  ).length;
  const cancelCandidateCount = recurringItems.filter(
    (i) => i.retentionIntent === 'cancel_candidate'
  ).length;

  return {
    monthlyFixedExpense,
    upcomingPayments,
    warningBadge,
    duplicateCount,
    cancelCandidateCount,
  };
}

function determineWarningBadge(
  items: RecurringItem[],
  duplicateGroups: DuplicateGroup[]
): FinanceWarning | null {
  // 1. 중복 감지
  const activeDuplicates = duplicateGroups.filter((g) => g.status === 'detected');
  if (activeDuplicates.length > 0) {
    return {
      type: 'duplicate',
      message: `겹치는 구독 ${activeDuplicates.length}개 발견`,
      severity: 'warning',
      relatedItemIds: activeDuplicates.flatMap((g) => g.itemIds),
    };
  }

  // 2. 미사용 항목
  const unusedItems = items.filter(
    (i) => i.usageFrequency === 'rarely' && i.retentionIntent !== 'keep'
  );
  if (unusedItems.length >= 2) {
    return {
      type: 'unused',
      message: `거의 안 쓰는 구독 ${unusedItems.length}개`,
      severity: 'info',
      relatedItemIds: unusedItems.map((i) => i.id),
    };
  }

  // 3. 연간 갱신 예정
  const now = new Date();
  const thirtyDaysLater = new Date(now);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  const upcomingAnnual = items.filter((i) => {
    if (i.billingCycle !== 'yearly') return false;
    const nextPayment = new Date(i.nextPaymentDate);
    return nextPayment >= now && nextPayment <= thirtyDaysLater;
  });

  if (upcomingAnnual.length > 0) {
    return {
      type: 'annual_renewal',
      message: `연간 결제 ${upcomingAnnual.length}개 곧 갱신`,
      severity: 'info',
      relatedItemIds: upcomingAnnual.map((i) => i.id),
    };
  }

  return null;
}

// ============================================
// 7. 목표(Goal) 연동
// ============================================

/**
 * 목표 제안 조건 확인
 * 비슷한 성장 지출이 반복되면 목표를 제안
 */
export function shouldSuggestGoal(
  items: RecurringItem[],
  existingGoals: Goal[]
): { suggest: boolean; suggestedTitle?: string; relatedItemIds?: string[] } {
  // Career-oriented Personal Growth 항목 필터링
  const careerGrowthItems = items.filter(
    (i) => i.workLife === 'Life' && i.personalGrowthType === 'Career'
  );

  // Wellbeing-oriented Personal Growth 항목 필터링
  const wellbeingGrowthItems = items.filter(
    (i) => i.workLife === 'Life' && i.personalGrowthType === 'Wellbeing'
  );

  // 3개 이상 비슷한 성장 지출이 있으면 제안
  if (careerGrowthItems.length >= 3) {
    const hasCareerGoal = existingGoals.some(
      (g) => g.goalType === 'Career' && g.status === 'active'
    );
    if (!hasCareerGoal) {
      return {
        suggest: true,
        suggestedTitle: '커리어 성장',
        relatedItemIds: careerGrowthItems.map((i) => i.id),
      };
    }
  }

  if (wellbeingGrowthItems.length >= 3) {
    const hasLifeGoal = existingGoals.some(
      (g) => g.goalType === 'Life' && g.status === 'active'
    );
    if (!hasLifeGoal) {
      return {
        suggest: true,
        suggestedTitle: '웰빙 & 자기관리',
        relatedItemIds: wellbeingGrowthItems.map((i) => i.id),
      };
    }
  }

  return { suggest: false };
}

// ============================================
// Utility Functions
// ============================================

/**
 * 다음 결제일 계산
 */
export function calculateNextPaymentDate(
  billingDay: number,
  billingCycle: 'monthly' | 'yearly',
  fromDate: Date = new Date()
): string {
  const result = new Date(fromDate);

  if (billingCycle === 'monthly') {
    // 이번 달 결제일이 지났으면 다음 달로
    if (fromDate.getDate() >= billingDay) {
      result.setMonth(result.getMonth() + 1);
    }
    result.setDate(Math.min(billingDay, getDaysInMonth(result)));
  } else {
    // 연간: 다음 해당 월의 결제일
    if (fromDate.getDate() >= billingDay) {
      result.setFullYear(result.getFullYear() + 1);
    }
    result.setDate(Math.min(billingDay, getDaysInMonth(result)));
  }

  return result.toISOString().split('T')[0];
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * 새 RecurringItem 생성 헬퍼
 */
export function createRecurringItem(
  data: Omit<RecurringItem, 'id' | 'createdAt' | 'updatedAt' | 'usageSignalScore' | 'duplicateGroupId' | 'autoRuleId'>
): RecurringItem {
  const now = new Date().toISOString();
  return {
    ...data,
    id: uuidv4(),
    usageSignalScore: 0.5, // 초기값
    duplicateGroupId: null,
    autoRuleId: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 새 CommitmentItem 생성 헬퍼
 */
export function createCommitmentItem(
  data: Omit<CommitmentItem, 'id' | 'createdAt' | 'updatedAt'>
): CommitmentItem {
  const now = new Date().toISOString();
  return {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 새 Goal 생성 헬퍼
 */
export function createGoal(
  data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'linkedItemCount' | 'monthlyInvestment'>
): Goal {
  const now = new Date().toISOString();
  return {
    ...data,
    id: uuidv4(),
    linkedItemCount: 0,
    monthlyInvestment: 0,
    createdAt: now,
    updatedAt: now,
  };
}
