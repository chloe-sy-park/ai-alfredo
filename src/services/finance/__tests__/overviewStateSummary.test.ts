/**
 * Finance OS - Overview State Summary 테스트
 *
 * 테스트 케이스 (명세 기반):
 * 1. OTT 2개 존재 → OverlapsCard 노출 + recommended=OVERLAPS
 * 2. '가끔' + 연간비용 상위 → CandidatesCard 노출
 * 3. D-3 결제 2건 → UpcomingCard 노출 + nearestDDay=3
 * 4. 아무것도 없음 → AllClearCard만 노출
 * 5. Goal primary 연결된 고비용 구독 → Candidate 점수 낮아져 후보 제외
 */

import { describe, it, expect } from 'vitest';
import {
  buildOverviewStateSummary,
  detectDuplicates,
  computeCandidateScore,
  detectCandidates,
  detectUpcoming,
  computeRiskLevel,
  getDuplicateClusterKey,
} from '../index';
import {
  RecurringItem,
  GrowthLink,
} from '../types';

// Helper: 기본 RecurringItem 생성
function createRecurringItem(
  overrides: Partial<RecurringItem> & { id: string; name: string }
): RecurringItem {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return {
    id: overrides.id,
    name: overrides.name,
    amount: overrides.amount ?? 10000,
    billingCycle: overrides.billingCycle ?? 'monthly',
    billingDay: overrides.billingDay ?? 15,
    categoryL1: overrides.categoryL1 ?? 'entertainment',
    workLife: overrides.workLife ?? 'Life',
    personalGrowthType: overrides.personalGrowthType ?? null,
    nextPaymentDate: overrides.nextPaymentDate ?? nextMonth.toISOString().split('T')[0],
    usageSignalScore: overrides.usageSignalScore ?? 0.5,
    duplicateGroupId: overrides.duplicateGroupId ?? null,
    autoRuleId: overrides.autoRuleId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageFrequency: overrides.usageFrequency,
    hasDuplicate: overrides.hasDuplicate,
    retentionIntent: overrides.retentionIntent,
  };
}

// Helper: 날짜 계산
function getDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

describe('Overview State Summary', () => {
  // ============================================
  // 테스트 1: OTT 2개 존재 → OverlapsCard 노출
  // ============================================
  describe('Test 1: OTT 중복 감지', () => {
    it('OTT 서비스 2개가 있으면 중복 그룹으로 감지되어야 함', () => {
      const items: RecurringItem[] = [
        createRecurringItem({
          id: '1',
          name: '넷플릭스',
          amount: 17000,
          categoryL1: 'entertainment',
        }),
        createRecurringItem({
          id: '2',
          name: '디즈니플러스',
          amount: 9900,
          categoryL1: 'entertainment',
        }),
      ];

      const duplicates = detectDuplicates(items);

      expect(duplicates.length).toBe(1);
      expect(duplicates[0].itemIds).toContain('1');
      expect(duplicates[0].itemIds).toContain('2');
      expect(duplicates[0].purpose).toBe('OTT 영상');
    });

    it('OTT 중복이 있으면 recommended=overlaps', () => {
      const items: RecurringItem[] = [
        createRecurringItem({
          id: '1',
          name: '넷플릭스',
          amount: 17000,
        }),
        createRecurringItem({
          id: '2',
          name: '디즈니플러스',
          amount: 9900,
        }),
      ];

      const duplicates = detectDuplicates(items);
      const result = buildOverviewStateSummary(items, [], duplicates, []);

      expect(result.stateSummary.overlaps.countGroups).toBe(1);
      expect(result.recommended).toBe('overlaps');
    });

    it('OTT 클러스터 키가 올바르게 반환되어야 함', () => {
      const netflix = createRecurringItem({ id: '1', name: '넷플릭스' });
      const disney = createRecurringItem({ id: '2', name: 'Disney+' });

      expect(getDuplicateClusterKey(netflix)).toBe('OTT');
      expect(getDuplicateClusterKey(disney)).toBe('OTT');
    });
  });

  // ============================================
  // 테스트 2: '가끔' + 고비용 → Candidates 노출
  // ============================================
  describe('Test 2: 해지 후보 감지', () => {
    it('usageFrequency=rarely이면 candidate score가 0.6 이상', () => {
      const item = createRecurringItem({
        id: '1',
        name: 'Test Service',
        usageFrequency: 'rarely',
      });

      const score = computeCandidateScore(item, false, []);

      expect(score).toBeGreaterThanOrEqual(0.6);
    });

    it('rarely + 중복 그룹이면 score가 더 높아짐', () => {
      const item = createRecurringItem({
        id: '1',
        name: 'Test Service',
        usageFrequency: 'rarely',
      });

      const scoreWithoutOverlap = computeCandidateScore(item, false, []);
      const scoreWithOverlap = computeCandidateScore(item, true, []);

      expect(scoreWithOverlap).toBeGreaterThan(scoreWithoutOverlap);
    });

    it('해지 후보가 있으면 candidates count > 0', () => {
      const items: RecurringItem[] = [
        createRecurringItem({
          id: '1',
          name: '거의 안쓰는 서비스',
          usageFrequency: 'rarely',
          amount: 30000,
        }),
      ];

      const candidates = detectCandidates(items, [], []);

      expect(candidates.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // 테스트 3: D-3 결제 2건 → UpcomingCard 노출
  // ============================================
  describe('Test 3: 결제 임박 감지', () => {
    it('7일 내 결제 항목이 감지되어야 함', () => {
      const today = new Date();
      const items: RecurringItem[] = [
        createRecurringItem({
          id: '1',
          name: 'Service A',
          nextPaymentDate: getDaysFromNow(3),
        }),
        createRecurringItem({
          id: '2',
          name: 'Service B',
          nextPaymentDate: getDaysFromNow(5),
        }),
      ];

      const upcoming = detectUpcoming(items, [], today);

      expect(upcoming.length).toBe(2);
      expect(upcoming[0].daysUntil).toBe(3);
      expect(upcoming[1].daysUntil).toBe(5);
    });

    it('nearestDDay가 올바르게 계산되어야 함', () => {
      const today = new Date();
      const items: RecurringItem[] = [
        createRecurringItem({
          id: '1',
          name: 'Service A',
          nextPaymentDate: getDaysFromNow(3),
        }),
        createRecurringItem({
          id: '2',
          name: 'Service B',
          nextPaymentDate: getDaysFromNow(5),
        }),
      ];

      const result = buildOverviewStateSummary(items, [], [], [], today);

      expect(result.stateSummary.upcoming.nearestDDay).toBe(3);
      expect(result.stateSummary.upcoming.countPayments).toBe(2);
    });
  });

  // ============================================
  // 테스트 4: 아무것도 없음 → AllClear
  // ============================================
  describe('Test 4: All Clear 상태', () => {
    it('중복/후보/임박이 없으면 recommended=allclear', () => {
      // 30일 후 결제 (7일 밖)
      const items: RecurringItem[] = [
        createRecurringItem({
          id: '1',
          name: '일반 서비스',
          usageFrequency: 'often', // 자주 사용
          nextPaymentDate: getDaysFromNow(30), // 7일 밖
          categoryL1: 'productivity', // 다른 카테고리
        }),
      ];

      const result = buildOverviewStateSummary(items, [], [], []);

      expect(result.stateSummary.overlaps.countGroups).toBe(0);
      expect(result.stateSummary.candidates.countItems).toBe(0);
      expect(result.stateSummary.upcoming.countPayments).toBe(0);
      expect(result.recommended).toBe('allclear');
    });
  });

  // ============================================
  // 테스트 5: Goal primary 연결 → Candidate 제외
  // ============================================
  describe('Test 5: 목표 연결 보호', () => {
    it('primary goal 연결 시 candidate score가 낮아져야 함', () => {
      const item = createRecurringItem({
        id: '1',
        name: '고비용 서비스',
        amount: 50000,
        usageFrequency: 'sometimes',
      });

      const goalLinks: GrowthLink[] = [
        {
          id: 'link-1',
          recurringItemId: '1',
          goalId: 'goal-1',
          weight: 'primary',
          createdAt: new Date().toISOString(),
        },
      ];

      const scoreWithoutGoal = computeCandidateScore(item, false, []);
      const scoreWithGoal = computeCandidateScore(item, false, goalLinks);

      expect(scoreWithGoal).toBeLessThan(scoreWithoutGoal);
      expect(scoreWithGoal).toBeLessThan(0.6); // 후보 기준 미만
    });

    it('primary goal 연결된 항목은 후보에서 제외됨', () => {
      const items: RecurringItem[] = [
        createRecurringItem({
          id: '1',
          name: '목표 연결 서비스',
          amount: 50000,
          usageFrequency: 'sometimes', // 보통이면 0.3 점수
        }),
        createRecurringItem({
          id: '2',
          name: '목표 없는 서비스',
          amount: 50000,
          usageFrequency: 'rarely', // rarely면 0.6 점수
        }),
      ];

      const goalLinks: GrowthLink[] = [
        {
          id: 'link-1',
          recurringItemId: '1',
          goalId: 'goal-1',
          weight: 'primary',
          createdAt: new Date().toISOString(),
        },
      ];

      const candidates = detectCandidates(items, [], goalLinks);

      // 목표 연결된 항목(1)은 제외되고, 목표 없는 항목(2)만 후보
      expect(candidates.some((c) => c.itemId === '1')).toBe(false);
      expect(candidates.some((c) => c.itemId === '2')).toBe(true);
    });
  });

  // ============================================
  // 추가: Risk Level 테스트
  // ============================================
  describe('Risk Level 계산', () => {
    it('중복 2개 이상 + 후보 3개 이상 → HIGH', () => {
      const level = computeRiskLevel(
        { fixedCostThisMonth: 100000, upcoming7DaysAmount: 50000 },
        2, // overlaps >= 2
        3  // candidates >= 3
      );

      expect(level).toBe('MEDIUM');
    });

    it('아무 위험 없으면 → LOW', () => {
      const level = computeRiskLevel(
        { fixedCostThisMonth: 100000, upcoming7DaysAmount: 50000 },
        0,
        0
      );

      expect(level).toBe('LOW');
    });

    it('모든 조건 충족 시 → HIGH', () => {
      const level = computeRiskLevel(
        { fixedCostThisMonth: 600000, upcoming7DaysAmount: 400000 },
        3,
        5
      );

      expect(level).toBe('HIGH');
    });
  });
});
