/**
 * Finance OS - Data Models & Types
 *
 * Finance OS는 '지출 기록 앱'이 아니라, 사용자의 Work/Life 균형과 목표에
 * 기여하는 지출을 자동으로 정리하고 중복·비효율·리스크를 먼저 알려주는
 * '결정 보조 시스템'이다.
 */

// ============================================
// Core Enums & Types
// ============================================

export type WorkLifeType = 'Work' | 'Life';

export type BillingCycle = 'monthly' | 'yearly';

export type PersonalGrowthType = 'Career' | 'Wellbeing' | 'Unclear' | null;

export type GoalType = 'Career' | 'Life';

export type GoalStatus = 'active' | 'paused';

export type GrowthWeight = 'primary' | 'secondary';

export type UsageFrequency = 'often' | 'sometimes' | 'rarely';

export type RetentionIntent = 'keep' | 'considering' | 'cancel_candidate';

export type FatigueLevel = 'low' | 'moderate' | 'high';

// ============================================
// Service Categories (자동 분류 기준)
// ============================================

export type ServiceCategory =
  // Work-leaning categories
  | 'productivity'      // 업무툴/생산성
  | 'collaboration'     // 협업
  | 'development'       // 개발 도구
  | 'design'           // 디자인 도구
  | 'education_career' // 자격증/커리어 교육
  // Life-leaning categories
  | 'entertainment'    // OTT/음악
  | 'fitness'          // 운동/헬스
  | 'wellbeing'        // 명상/웰빙
  | 'hobby'            // 취미
  | 'education_life'   // 자기계발/취미 교육
  // Neutral categories
  | 'cloud_storage'    // 클라우드 스토리지
  | 'communication'    // 커뮤니케이션
  | 'finance'          // 금융 서비스
  | 'insurance'        // 보험
  | 'savings'          // 적금
  | 'other';           // 기타

export type ServiceSubCategory = string; // 세부 카테고리 (유연하게)

// ============================================
// Data Models
// ============================================

/**
 * 3.1 RecurringItem (구독 / 정기결제 / 보험 / 적금)
 */
export interface RecurringItem {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  billingDay: number; // 1-31
  categoryL1: ServiceCategory;
  categoryL2?: ServiceSubCategory;
  workLife: WorkLifeType;
  personalGrowthType: PersonalGrowthType;
  nextPaymentDate: string; // ISO date
  usageSignalScore: number; // 0-1
  duplicateGroupId: string | null;
  autoRuleId: string | null;
  // Usage tracking
  lastUsageCheck?: string; // ISO date
  usageFrequency?: UsageFrequency;
  hasDuplicate?: boolean;
  retentionIntent?: RetentionIntent;
  // Metadata
  createdAt: string;
  updatedAt: string;
  icon?: string; // emoji or icon name
  color?: string; // brand color
}

/**
 * 3.2 CommitmentItem (대출 / 할부 / 연간 약정)
 */
export interface CommitmentItem {
  id: string;
  name: string;
  monthlyPayment: number;
  dueDay: number; // 1-31
  endDate?: string; // ISO date (optional)
  workLife: WorkLifeType;
  totalAmount?: number;
  remainingAmount?: number;
  remainingMonths?: number;
  // Metadata
  createdAt: string;
  updatedAt: string;
  icon?: string;
}

/**
 * 3.3 Goal (목표)
 */
export interface Goal {
  id: string;
  title: string;
  goalType: GoalType;
  status: GoalStatus;
  description?: string;
  // Progress tracking
  linkedItemCount: number;
  monthlyInvestment: number; // 연결된 항목의 월 합계
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * 3.4 GrowthLink (성장 ↔ 목표 연결)
 */
export interface GrowthLink {
  id: string;
  recurringItemId: string;
  goalId: string;
  weight: GrowthWeight;
  createdAt: string;
}

// ============================================
// Auto Classification Rules
// ============================================

/**
 * 사용자 수동 변경으로 생성된 자동 분류 규칙
 */
export interface AutoClassificationRule {
  id: string;
  categoryL1: ServiceCategory;
  workLife: WorkLifeType;
  overrideCount: number; // 같은 카테고리에서 몇 번 변경했는지
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Duplicate Detection
// ============================================

export interface DuplicateGroup {
  id: string;
  purpose: string; // e.g., '음악 스트리밍', 'OTT', '클라우드'
  itemIds: string[];
  potentialSavings: number; // 월 기준
  suggestedKeep?: string; // 주 사용으로 추천되는 item id
  status: 'detected' | 'resolved' | 'dismissed';
  createdAt: string;
}

// ============================================
// Usage Check (사용여부 질문)
// ============================================

export interface UsageCheckQuestion {
  itemId: string;
  itemName: string;
  amount: number;
  daysUntilPayment: number;
  questions: {
    frequency: {
      question: string;
      options: { value: UsageFrequency; label: string; emoji: string }[];
    };
    duplicate: {
      question: string;
      options: { value: 'none' | 'exists' | 'using'; label: string; emoji: string }[];
    };
    retention: {
      question: string;
      options: { value: RetentionIntent; label: string; emoji: string }[];
    };
  };
}

export interface UsageCheckResponse {
  itemId: string;
  frequency: UsageFrequency;
  hasDuplicate: boolean;
  retention: RetentionIntent;
  checkedAt: string;
}

// ============================================
// Finance Overview (홈 위젯용)
// ============================================

export interface FinanceOverview {
  monthlyFixedExpense: number;
  upcomingPayments: UpcomingPayment[];
  warningBadge: FinanceWarning | null;
  duplicateCount: number;
  cancelCandidateCount: number;
}

export interface UpcomingPayment {
  itemId: string;
  name: string;
  amount: number;
  dueDate: string;
  daysUntil: number;
  workLife: WorkLifeType;
  icon?: string;
}

export interface FinanceWarning {
  type: 'overload' | 'duplicate' | 'unused' | 'annual_renewal';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  relatedItemIds: string[];
}

// ============================================
// Nudge & Notification Triggers
// ============================================

export type FinanceNudgeType =
  | 'payment_d3'           // 결제 D-3 → 사용여부 질문
  | 'annual_d30'           // 연간 결제 D-30 → 유지 여부 확인
  | 'duplicate_detected'   // 중복 감지 → 절감 카드
  | 'goal_no_progress';    // 목표 연결된 성장 지출 + 목표 진척 없음

export interface FinanceNudge {
  id: string;
  type: FinanceNudgeType;
  title: string;
  message: string;
  relatedItemIds: string[];
  actionType: 'usage_check' | 'review' | 'decide';
  createdAt: string;
  dismissedAt?: string;
}

// ============================================
// Service Configuration
// ============================================

/**
 * 카테고리별 기본 Work/Life 분류
 */
export const CATEGORY_DEFAULT_WORKLIFE: Record<ServiceCategory, WorkLifeType> = {
  // Work-leaning
  productivity: 'Work',
  collaboration: 'Work',
  development: 'Work',
  design: 'Work',
  education_career: 'Work',
  // Life-leaning
  entertainment: 'Life',
  fitness: 'Life',
  wellbeing: 'Life',
  hobby: 'Life',
  education_life: 'Life',
  // Neutral (default to Life)
  cloud_storage: 'Life',
  communication: 'Life',
  finance: 'Life',
  insurance: 'Life',
  savings: 'Life',
  other: 'Life',
};

/**
 * 중복 탐지를 위한 목적 그룹
 */
export const DUPLICATE_PURPOSE_GROUPS: Record<string, ServiceCategory[]> = {
  '음악 스트리밍': ['entertainment'],
  'OTT 영상': ['entertainment'],
  '클라우드 스토리지': ['cloud_storage'],
  '업무 협업': ['collaboration', 'productivity'],
  '운동/피트니스': ['fitness'],
  '명상/웰빙': ['wellbeing'],
};

/**
 * Work 가중치를 높이는 키워드
 */
export const WORK_KEYWORDS = [
  '프로젝트',
  '클라이언트',
  '자격증',
  '업무',
  '비즈니스',
  'B2B',
  '기업용',
  '팀',
  'Pro',
  'Business',
  'Enterprise',
];

/**
 * 사용여부 질문 기본 텍스트
 */
export const USAGE_CHECK_QUESTIONS = {
  frequency: {
    question: '최근 30일에 이 서비스 썼어?',
    options: [
      { value: 'often' as UsageFrequency, label: '자주', emoji: '🙂' },
      { value: 'sometimes' as UsageFrequency, label: '가끔', emoji: '😐' },
      { value: 'rarely' as UsageFrequency, label: '거의 안 씀', emoji: '🙅' },
    ],
  },
  duplicate: {
    question: '비슷한 서비스가 있어?',
    options: [
      { value: 'none' as const, label: '없음', emoji: '❌' },
      { value: 'exists' as const, label: '있음', emoji: '🤔' },
      { value: 'using' as const, label: '이미 사용 중', emoji: '✅' },
    ],
  },
  retention: {
    question: '다음 결제에도 유지할까?',
    options: [
      { value: 'keep' as RetentionIntent, label: '유지', emoji: '✅' },
      { value: 'considering' as RetentionIntent, label: '고민', emoji: '🤔' },
      { value: 'cancel_candidate' as RetentionIntent, label: '해지 후보', emoji: '❌' },
    ],
  },
};
