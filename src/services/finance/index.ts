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
  RiskLevel,
  OverviewMetrics,
  OverviewStateSummary,
  OverviewData,
  CandidateScore,
  GrowthLink,
  CATEGORY_DEFAULT_WORKLIFE,
  WORK_KEYWORDS,
  USAGE_CHECK_QUESTIONS,
  MERCHANT_CLUSTER_MAP,
  RISK_THRESHOLDS,
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
 * 아이템의 중복 클러스터 키 반환
 * 우선순위: 머천트 매핑 → categoryL2 → categoryL1
 */
export function getDuplicateClusterKey(item: RecurringItem): string {
  const nameLower = item.name.toLowerCase();

  // 1. 머천트 매핑 테이블에서 찾기
  for (const [merchant, cluster] of Object.entries(MERCHANT_CLUSTER_MAP)) {
    if (nameLower.includes(merchant.toLowerCase())) {
      return cluster;
    }
  }

  // 2. categoryL2가 있으면 사용
  if (item.categoryL2) {
    return item.categoryL2;
  }

  // 3. categoryL1 사용
  return item.categoryL1;
}

/**
 * 중복 구독 탐지 (개선된 버전)
 * 클러스터 키 기반으로 그룹화하고 절감 예상액 계산
 */
export function detectDuplicates(items: RecurringItem[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processedIds = new Set<string>();

  // 클러스터 키로 그룹화
  const clusterGroups = new Map<string, RecurringItem[]>();
  items.forEach((item) => {
    const clusterKey = getDuplicateClusterKey(item);
    const existing = clusterGroups.get(clusterKey) || [];
    clusterGroups.set(clusterKey, [...existing, item]);
  });

  // 각 클러스터에서 중복 탐지
  clusterGroups.forEach((clusterItems, clusterKey) => {
    if (clusterItems.length < 2) return;

    const itemIds = clusterItems
      .filter((item) => !processedIds.has(item.id))
      .map((item) => item.id);

    if (itemIds.length >= 2) {
      const relevantItems = clusterItems.filter((i) => itemIds.includes(i.id));

      // 절감 예상액: 가장 저렴한 것 하나만 유지한다고 가정
      // (모든 금액 합계 - 가장 비싼 것)
      const amounts = relevantItems.map((i) => i.amount);
      const maxAmount = Math.max(...amounts);
      const totalAmount = amounts.reduce((a, b) => a + b, 0);
      const potentialSavings = totalAmount - maxAmount;

      groups.push({
        id: uuidv4(),
        purpose: getClusterLabel(clusterKey),
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
  });

  return groups;
}

function getClusterLabel(clusterKey: string): string {
  const labels: Record<string, string> = {
    'OTT': 'OTT 영상',
    '음악스트리밍': '음악 스트리밍',
    '클라우드스토리지': '클라우드 스토리지',
    '생산성도구': '생산성 도구',
    '피트니스앱': '피트니스 앱',
  };
  return labels[clusterKey] || getCategoryLabel(clusterKey as ServiceCategory);
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
// 9. Overview State Summary (State-based IA)
// ============================================

/**
 * 해지 후보 점수 계산
 * 점수 >= 0.6이면 해지 후보로 분류
 */
export function computeCandidateScore(
  item: RecurringItem,
  isInOverlapGroup: boolean,
  goalLinks: GrowthLink[]
): number {
  let score = 0;

  // 1. 사용 빈도 신호
  if (item.usageFrequency === 'rarely') {
    score += 0.6;
  } else if (item.usageFrequency === 'sometimes') {
    score += 0.3;
  }

  // 2. 중복 압력
  if (isInOverlapGroup || item.hasDuplicate) {
    score += 0.3;
  }

  // 3. 고비용 압력 (연간 비용 기준)
  const annualCost = item.billingCycle === 'yearly' ? item.amount : item.amount * 12;
  if (annualCost >= RISK_THRESHOLDS.HIGH_COST_THRESHOLD) {
    score += 0.2;
  }

  // 4. 목표 연결 보호 (점수 감소)
  const itemGoalLinks = goalLinks.filter((l) => l.recurringItemId === item.id);
  const hasPrimaryGoal = itemGoalLinks.some((l) => l.weight === 'primary');
  const hasSecondaryGoal = itemGoalLinks.some((l) => l.weight === 'secondary');

  if (hasPrimaryGoal) {
    score -= 0.4;
  } else if (hasSecondaryGoal) {
    score -= 0.2;
  }

  // 5. 명시적 유지 의사
  if (item.retentionIntent === 'keep') {
    score -= 0.5;
  }

  // 0-1 범위로 클램프
  return Math.max(0, Math.min(1, score));
}

/**
 * 해지 후보 항목 탐지
 */
export function detectCandidates(
  items: RecurringItem[],
  duplicateGroups: DuplicateGroup[],
  goalLinks: GrowthLink[]
): CandidateScore[] {
  // 중복 그룹에 속한 아이템 ID Set
  const itemsInOverlaps = new Set<string>();
  duplicateGroups
    .filter((g) => g.status === 'detected')
    .forEach((g) => g.itemIds.forEach((id) => itemsInOverlaps.add(id)));

  const candidates: CandidateScore[] = [];

  for (const item of items) {
    // 이미 명시적 해지 후보로 마킹된 경우 포함
    if (item.retentionIntent === 'cancel_candidate') {
      candidates.push({ itemId: item.id, score: 1.0 });
      continue;
    }

    const score = computeCandidateScore(
      item,
      itemsInOverlaps.has(item.id),
      goalLinks
    );

    if (score >= 0.6) {
      candidates.push({ itemId: item.id, score });
    }
  }

  // 점수 내림차순 정렬
  return candidates.sort((a, b) => b.score - a.score);
}

/**
 * 7일 내 결제 임박 항목 탐지
 */
export function detectUpcoming(
  recurringItems: RecurringItem[],
  commitmentItems: CommitmentItem[],
  today: Date = new Date()
): UpcomingPayment[] {
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  const upcoming: UpcomingPayment[] = [];

  // Recurring Items
  for (const item of recurringItems) {
    const nextPayment = new Date(item.nextPaymentDate);
    if (nextPayment >= today && nextPayment <= sevenDaysLater) {
      const daysUntil = Math.ceil(
        (nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      upcoming.push({
        itemId: item.id,
        name: item.name,
        amount: item.amount,
        dueDate: item.nextPaymentDate,
        daysUntil,
        workLife: item.workLife,
        icon: item.icon,
      });
    }
  }

  // Commitment Items
  for (const item of commitmentItems) {
    const nextPaymentDate = calculateNextCommitmentPaymentDate(item.dueDay, today);
    const nextPayment = new Date(nextPaymentDate);
    if (nextPayment >= today && nextPayment <= sevenDaysLater) {
      const daysUntil = Math.ceil(
        (nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      upcoming.push({
        itemId: item.id,
        name: item.name,
        amount: item.monthlyPayment,
        dueDate: nextPaymentDate,
        daysUntil,
        workLife: item.workLife,
        icon: item.icon,
      });
    }
  }

  // D-day 오름차순 정렬
  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

function calculateNextCommitmentPaymentDate(dueDay: number, fromDate: Date): string {
  const result = new Date(fromDate);
  if (fromDate.getDate() > dueDay) {
    result.setMonth(result.getMonth() + 1);
  }
  result.setDate(Math.min(dueDay, getDaysInMonth(result)));
  return result.toISOString().split('T')[0];
}

/**
 * 리스크 레벨 계산 (단일 배지)
 */
export function computeRiskLevel(
  metrics: { fixedCostThisMonth: number; upcoming7DaysAmount: number },
  overlapsCount: number,
  candidatesCount: number
): RiskLevel {
  let riskScore = 0;

  // 중복 2개 이상
  if (overlapsCount >= 2) riskScore += 1;

  // 해지 후보 3개 이상
  if (candidatesCount >= 3) riskScore += 1;

  // 7일 내 결제액이 임계치 이상
  if (metrics.upcoming7DaysAmount >= RISK_THRESHOLDS.UPCOMING_HIGH_AMOUNT) {
    riskScore += 1;
  }

  // 월 고정지출이 임계치 이상
  if (metrics.fixedCostThisMonth >= RISK_THRESHOLDS.FIXED_HIGH_AMOUNT) {
    riskScore += 1;
  }

  if (riskScore >= 3) return 'HIGH';
  if (riskScore >= 2) return 'MEDIUM';
  return 'LOW';
}

/**
 * Overview State Summary 빌드 (메인 함수)
 */
export function buildOverviewStateSummary(
  recurringItems: RecurringItem[],
  commitmentItems: CommitmentItem[],
  duplicateGroups: DuplicateGroup[],
  goalLinks: GrowthLink[],
  today: Date = new Date()
): OverviewData {
  // 1. 중복 감지
  const activeDuplicates = duplicateGroups.filter((g) => g.status === 'detected');

  // 2. 해지 후보 감지
  const candidates = detectCandidates(recurringItems, duplicateGroups, goalLinks);

  // 3. 결제 임박 감지
  const upcoming = detectUpcoming(recurringItems, commitmentItems, today);

  // 4. 메트릭스 계산
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

  const fixedCostThisMonth = monthlyRecurring + yearlyAsMonthly + monthlyCommitments;
  const upcoming7DaysAmount = upcoming.reduce((sum, p) => sum + p.amount, 0);

  // 5. 리스크 레벨 계산
  const riskLevel = computeRiskLevel(
    { fixedCostThisMonth, upcoming7DaysAmount },
    activeDuplicates.length,
    candidates.length
  );

  // 6. 상태 요약 구성
  const overlapsEstimatedSavings = activeDuplicates.reduce(
    (sum, g) => sum + g.potentialSavings,
    0
  );

  // 해지 후보 절감 예상액: 상위 5개 항목의 월 금액 합
  const candidateItems = candidates
    .slice(0, 5)
    .map((c) => recurringItems.find((i) => i.id === c.itemId))
    .filter((item): item is RecurringItem => item !== undefined);
  const candidatesEstimatedSavings = candidateItems.reduce(
    (sum, item) => sum + (item.billingCycle === 'yearly' ? item.amount / 12 : item.amount),
    0
  );

  const metrics: OverviewMetrics = {
    fixedCostThisMonth,
    upcoming7DaysAmount,
    riskLevel,
  };

  const stateSummary: OverviewStateSummary = {
    overlaps: {
      countGroups: activeDuplicates.length,
      estimatedMonthlySavings: overlapsEstimatedSavings,
    },
    candidates: {
      countItems: candidates.length,
      estimatedMonthlySavings: candidatesEstimatedSavings,
    },
    upcoming: {
      countPayments: upcoming.length,
      totalAmount: upcoming7DaysAmount,
      nearestDDay: upcoming.length > 0 ? upcoming[0].daysUntil : null,
    },
  };

  // 7. 추천 상태 결정 (우선순위)
  let recommended: OverviewData['recommended'];
  if (activeDuplicates.length > 0) {
    recommended = 'overlaps';
  } else if (candidates.length > 0) {
    recommended = 'candidates';
  } else if (upcoming.length > 0) {
    recommended = 'upcoming';
  } else {
    recommended = 'allclear';
  }

  return { metrics, stateSummary, recommended };
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
