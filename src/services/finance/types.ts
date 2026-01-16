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

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

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
// Income Management (수입 관리)
// ============================================

export type IncomeType =
  | 'salary'        // 급여
  | 'side_income'   // 부수입 (프리랜서, 부업)
  | 'investment'    // 투자 수익 (배당, 이자)
  | 'refund'        // 환급 (세금, 보험 등)
  | 'bonus'         // 보너스, 성과급
  | 'allowance'     // 용돈, 지원금
  | 'other';        // 기타

/**
 * 수입 항목
 */
export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  incomeType: IncomeType;
  isRecurring: boolean;           // 정기 수입 여부
  recurringDay?: number;          // 매달 수입일 (1-31)
  workLife: WorkLifeType;         // Work: 급여/부수입, Life: 투자/환급
  expectedDate?: string;          // 1회성일 경우 예상 입금일 (ISO date)
  receivedDate?: string;          // 실제 입금일 (ISO date)
  note?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
  icon?: string;
}

/**
 * 수입 유형 기본 Work/Life 분류
 */
export const INCOME_TYPE_DEFAULT_WORKLIFE: Record<IncomeType, WorkLifeType> = {
  salary: 'Work',
  side_income: 'Work',
  investment: 'Life',
  refund: 'Life',
  bonus: 'Work',
  allowance: 'Life',
  other: 'Life',
};

/**
 * 수입 유형 라벨
 */
export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  salary: '급여',
  side_income: '부수입',
  investment: '투자 수익',
  refund: '환급',
  bonus: '보너스',
  allowance: '용돈/지원금',
  other: '기타',
};

// ============================================
// One-Time Expense (1회성 지출)
// ============================================

export type OneTimeExpenseCategory =
  | 'shopping'      // 쇼핑
  | 'dining'        // 식비
  | 'groceries'     // 장보기
  | 'transport'     // 교통
  | 'medical'       // 의료
  | 'event'         // 경조사
  | 'travel'        // 여행
  | 'education'     // 교육
  | 'maintenance'   // 유지보수, 수리
  | 'utility'       // 공과금 (정기가 아닌 경우)
  | 'gift'          // 선물
  | 'other';        // 기타

/**
 * 1회성 지출 항목
 */
export interface OneTimeExpense {
  id: string;
  name: string;
  amount: number;
  category: OneTimeExpenseCategory;
  workLife: WorkLifeType;
  date: string;                   // 지출일 (ISO date)
  isPlanned: boolean;             // 계획된 지출 vs 충동 지출
  linkedGoalId?: string;          // 목표와 연결 (선택)
  note?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
  icon?: string;
}

/**
 * 1회성 지출 카테고리 기본 Work/Life 분류
 */
export const EXPENSE_CATEGORY_DEFAULT_WORKLIFE: Record<OneTimeExpenseCategory, WorkLifeType> = {
  shopping: 'Life',
  dining: 'Life',
  groceries: 'Life',
  transport: 'Life',
  medical: 'Life',
  event: 'Life',
  travel: 'Life',
  education: 'Life',
  maintenance: 'Life',
  utility: 'Life',
  gift: 'Life',
  other: 'Life',
};

/**
 * 1회성 지출 카테고리 라벨
 */
export const EXPENSE_CATEGORY_LABELS: Record<OneTimeExpenseCategory, string> = {
  shopping: '쇼핑',
  dining: '식비',
  groceries: '장보기',
  transport: '교통',
  medical: '의료',
  event: '경조사',
  travel: '여행',
  education: '교육',
  maintenance: '유지보수',
  utility: '공과금',
  gift: '선물',
  other: '기타',
};

/**
 * 1회성 지출 자동 분류 키워드
 */
export const EXPENSE_KEYWORDS: Record<string, OneTimeExpenseCategory> = {
  // 쇼핑
  '쿠팡': 'shopping',
  '11번가': 'shopping',
  '지마켓': 'shopping',
  '네이버쇼핑': 'shopping',
  '무신사': 'shopping',
  '올리브영': 'shopping',
  // 식비
  '배달의민족': 'dining',
  '요기요': 'dining',
  '쿠팡이츠': 'dining',
  '카페': 'dining',
  '스타벅스': 'dining',
  '식당': 'dining',
  // 장보기
  '마트': 'groceries',
  '이마트': 'groceries',
  '홈플러스': 'groceries',
  '롯데마트': 'groceries',
  // 교통
  '택시': 'transport',
  '카카오T': 'transport',
  '지하철': 'transport',
  '버스': 'transport',
  '주유': 'transport',
  // 의료
  '병원': 'medical',
  '약국': 'medical',
  '치과': 'medical',
  '안과': 'medical',
  // 경조사
  '축의금': 'event',
  '조의금': 'event',
  '돌잔치': 'event',
  // 여행
  '호텔': 'travel',
  '항공': 'travel',
  '에어비앤비': 'travel',
};

// ============================================
// Budget (예산) - 판단을 위한 기준선
// ============================================

/**
 * 예산 상태 (숫자가 아닌 상태로 해석)
 * - Stable: 여유 있음 (70% 미만)
 * - Tight: 선택 필요 (70-100%)
 * - Over: 기준 초과 (100% 이상) → 차단 ❌, 확인 요청
 */
export type BudgetStatus = 'Stable' | 'Tight' | 'Over';

/**
 * 예산 설정 (옵션 기능, 기본값 OFF)
 */
export interface BudgetSettings {
  enabled: boolean;           // 예산 사용 여부 (기본: false)
  workRatio: number;          // Work 비중 (0-100)
  lifeRatio: number;          // Life 비중 (0-100)
  totalCap?: number;          // (선택) 총 고정지출 상한
  personalGrowthCap?: number; // (선택) Personal Growth 상한
}

/**
 * 알프레도 자동 제안
 */
export interface BudgetSuggestion {
  workRatio: number;
  lifeRatio: number;
  suggestedAt: string;        // ISO date
  basedOnDays: number;        // 분석 기반 일수
  appliedAt?: string;         // 적용한 경우
  dismissedAt?: string;       // 무시한 경우
}

/**
 * 예산 상태 정보 (실시간 계산)
 */
export interface BudgetStatusInfo {
  work: {
    budget: number;           // 예산액
    current: number;          // 현재 지출
    percentage: number;       // 사용률 (0-100+)
    status: BudgetStatus;
  };
  life: {
    budget: number;
    current: number;
    percentage: number;
    status: BudgetStatus;
  };
  overall: {
    budget: number;
    current: number;
    percentage: number;
    status: BudgetStatus;
  };
  personalGrowth?: {
    budget: number;
    current: number;
    percentage: number;
    status: BudgetStatus;
  };
}

/**
 * 예산 임계치 (상태 판단 기준)
 */
export const BUDGET_STATUS_THRESHOLDS = {
  STABLE_MAX: 70,   // 70% 미만 → Stable
  TIGHT_MAX: 100,   // 70-100% → Tight
  // 100% 이상 → Over
} as const;

// ============================================
// Finance Statistics (통계)
// ============================================

/**
 * 기간별 재정 통계 요약
 */
export interface FinanceStatsSummary {
  period: 'weekly' | 'monthly' | 'yearly';
  periodLabel: string;            // "1월 2주차", "2026년 1월"
  startDate: string;
  endDate: string;

  // 수입
  totalIncome: number;
  incomeByType: Partial<Record<IncomeType, number>>;
  recurringIncome: number;        // 정기 수입
  oneTimeIncome: number;          // 1회성 수입

  // 지출
  totalExpense: number;
  fixedExpense: number;           // 정기 지출 (구독, 대출 등)
  variableExpense: number;        // 1회성 지출

  // 분석
  netCashFlow: number;            // 수입 - 지출
  savingsRate: number;            // 저축률 (0-1)
  workLifeExpenseRatio: { work: number; life: number };

  // 트렌드 (전 기간 대비)
  comparedToPrevious: {
    incomeChange: number;         // % 변화
    expenseChange: number;        // % 변화
    savingsRateChange: number;    // 포인트 변화
  } | null;
}

/**
 * 카테고리별 분석 항목
 */
export interface CategoryAnalysis {
  category: ServiceCategory | OneTimeExpenseCategory | string;
  label: string;
  amount: number;
  percentage: number;             // 전체 대비 % (0-100)
  itemCount: number;
  trend: 'up' | 'down' | 'stable';
  changeAmount?: number;          // 전 기간 대비 변화액
}

/**
 * 절감 기회 항목
 */
export interface SavingsOpportunity {
  id: string;
  type: 'duplicate' | 'unused' | 'high_cost' | 'impulse_spending';
  title: string;
  description: string;
  estimatedMonthlySavings: number;
  relatedItemIds: string[];
  priority: 'high' | 'medium' | 'low';
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

// ============================================
// Overview State Summary (State-based IA용)
// ============================================

/**
 * Overview 메트릭스 (StatusSummaryRow용)
 */
export interface OverviewMetrics {
  fixedCostThisMonth: number;     // recurring + commitments 월 합계
  upcoming7DaysAmount: number;    // 다음 7일 결제 합계
  riskLevel: RiskLevel;           // 단일 리스크 배지
}

/**
 * Candidate Score (해지 후보 점수)
 */
export interface CandidateScore {
  itemId: string;
  score: number;                  // 0-1, 0.6 이상이면 후보
}

/**
 * Overview 상태 요약 (State Cards용)
 */
export interface OverviewStateSummary {
  overlaps: {
    countGroups: number;
    estimatedMonthlySavings: number;
  };
  candidates: {
    countItems: number;
    estimatedMonthlySavings: number;
  };
  upcoming: {
    countPayments: number;
    totalAmount: number;
    nearestDDay: number | null;    // 가장 가까운 D-day
  };
}

/**
 * 전체 Overview 데이터 (buildOverviewStateSummary 리턴)
 */
export interface OverviewData {
  metrics: OverviewMetrics;
  stateSummary: OverviewStateSummary;
  recommended: 'overlaps' | 'candidates' | 'upcoming' | 'allclear';
}

/**
 * 리스크 계산 임계치 (MVP 상수)
 */
export const RISK_THRESHOLDS = {
  UPCOMING_HIGH_AMOUNT: 300000,    // 7일 내 30만원 이상
  FIXED_HIGH_AMOUNT: 500000,       // 월 50만원 이상
  HIGH_COST_THRESHOLD: 240000,     // 연 24만원(월 2만원) 이상 고비용
} as const;

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
 * 머천트 → 클러스터 매핑 (중복 탐지용)
 * MVP: 주요 서비스들의 클러스터 키
 */
export const MERCHANT_CLUSTER_MAP: Record<string, string> = {
  // OTT
  '넷플릭스': 'OTT',
  'netflix': 'OTT',
  '디즈니플러스': 'OTT',
  '디즈니+': 'OTT',
  'disney+': 'OTT',
  '쿠팡플레이': 'OTT',
  '웨이브': 'OTT',
  'wavve': 'OTT',
  '왓챠': 'OTT',
  'watcha': 'OTT',
  '티빙': 'OTT',
  'tving': 'OTT',
  '애플tv+': 'OTT',
  'apple tv+': 'OTT',
  // 음악 스트리밍
  '스포티파이': '음악스트리밍',
  'spotify': '음악스트리밍',
  '멜론': '음악스트리밍',
  '지니뮤직': '음악스트리밍',
  'genie': '음악스트리밍',
  '플로': '음악스트리밍',
  'flo': '음악스트리밍',
  '유튜브뮤직': '음악스트리밍',
  'youtube music': '음악스트리밍',
  '애플뮤직': '음악스트리밍',
  'apple music': '음악스트리밍',
  // 클라우드
  '드롭박스': '클라우드스토리지',
  'dropbox': '클라우드스토리지',
  '구글드라이브': '클라우드스토리지',
  'google drive': '클라우드스토리지',
  '아이클라우드': '클라우드스토리지',
  'icloud': '클라우드스토리지',
  '원드라이브': '클라우드스토리지',
  'onedrive': '클라우드스토리지',
  // 생산성
  '노션': '생산성도구',
  'notion': '생산성도구',
  '에버노트': '생산성도구',
  'evernote': '생산성도구',
  '옵시디언': '생산성도구',
  'obsidian': '생산성도구',
  // 피트니스
  '런데이': '피트니스앱',
  '나이키런클럽': '피트니스앱',
  '스트라바': '피트니스앱',
  'strava': '피트니스앱',
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
