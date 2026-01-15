/**
 * Trust Evidence 타입 정의
 * 신뢰가 쌓이는 증거들
 */

// 신뢰 증거 카테고리
export type TrustCategory =
  | 'accuracy'      // 정확도 기반
  | 'consistency'   // 일관성 기반
  | 'accumulated';  // 축적 기반

// 마일스톤 타입
export type MilestoneType =
  | 'days_together'       // 함께한 일수
  | 'suggestions_accepted' // 제안 수락 횟수
  | 'focus_hours'         // 집중 시간
  | 'tasks_completed'     // 완료한 태스크
  | 'streak'              // 연속 사용
  | 'first_week'          // 첫 주
  | 'first_month';        // 첫 달

// 신뢰 증거 데이터
export interface TrustEvidence {
  // 정확도 기반
  accuracy: {
    briefingRelevance: number;      // 브리핑 적중률 (0-1)
    suggestionAcceptance: number;   // 제안 수락률 (0-1)
    timingPrecision: number;        // 타이밍 정확도 (0-1)
    totalSuggestions: number;       // 총 제안 수
    acceptedSuggestions: number;    // 수락한 제안 수
  };

  // 일관성 기반
  consistency: {
    toneConsistency: boolean;       // 톤 일관성
    boundaryRespect: boolean;       // 경계 존중
    promiseKeeping: number;         // 약속 이행률 (0-1)
  };

  // 축적 기반
  accumulated: {
    daysUsed: number;               // 총 사용 일수
    firstUsedAt: string;            // 첫 사용 날짜
    currentStreak: number;          // 현재 연속 사용 일수
    longestStreak: number;          // 최장 연속 사용 일수
    lastUsedAt: string;             // 마지막 사용 날짜
    insightsProvided: number;       // 제공한 인사이트 수
    focusMinutes: number;           // 총 집중 시간 (분)
    tasksCompleted: number;         // 완료한 태스크 수
    timeSavedMinutes: number;       // 절약한 시간 (추정, 분)
  };
}

// 마일스톤
export interface Milestone {
  id: string;
  type: MilestoneType;
  title: string;
  description: string;
  value: number;           // 달성 기준값
  achievedAt?: string;     // 달성 시간
  celebrated: boolean;     // 축하 표시 여부
  icon: string;            // 이모지 아이콘
}

// 마일스톤 정의
export const MILESTONES: Omit<Milestone, 'id' | 'achievedAt' | 'celebrated'>[] = [
  // 함께한 일수
  { type: 'days_together', title: '첫 만남', description: '알프레도와 첫 날', value: 1, icon: '👋' },
  { type: 'days_together', title: '일주일 함께', description: '7일 동안 함께했어요', value: 7, icon: '🌱' },
  { type: 'days_together', title: '한 달 함께', description: '30일 동안 함께했어요', value: 30, icon: '🌿' },
  { type: 'days_together', title: '100일 함께', description: '100일 동안 함께했어요', value: 100, icon: '🌳' },
  { type: 'days_together', title: '1년 함께', description: '365일 동안 함께했어요', value: 365, icon: '🎄' },

  // 제안 수락
  { type: 'suggestions_accepted', title: '첫 수락', description: '첫 제안을 수락했어요', value: 1, icon: '✨' },
  { type: 'suggestions_accepted', title: '10번 신뢰', description: '10개의 제안을 수락했어요', value: 10, icon: '💫' },
  { type: 'suggestions_accepted', title: '50번 신뢰', description: '50개의 제안을 수락했어요', value: 50, icon: '🌟' },
  { type: 'suggestions_accepted', title: '100번 신뢰', description: '100개의 제안을 수락했어요', value: 100, icon: '⭐' },

  // 집중 시간
  { type: 'focus_hours', title: '첫 집중', description: '첫 집중 시간 완료', value: 1, icon: '🎯' },
  { type: 'focus_hours', title: '10시간 집중', description: '총 10시간 집중했어요', value: 10, icon: '💪' },
  { type: 'focus_hours', title: '50시간 집중', description: '총 50시간 집중했어요', value: 50, icon: '🔥' },
  { type: 'focus_hours', title: '100시간 집중', description: '총 100시간 집중했어요', value: 100, icon: '🏆' },

  // 연속 사용
  { type: 'streak', title: '3일 연속', description: '3일 연속 사용했어요', value: 3, icon: '🔗' },
  { type: 'streak', title: '7일 연속', description: '7일 연속 사용했어요', value: 7, icon: '⛓️' },
  { type: 'streak', title: '30일 연속', description: '30일 연속 사용했어요', value: 30, icon: '🏅' },

  // 태스크 완료
  { type: 'tasks_completed', title: '첫 완료', description: '첫 태스크 완료', value: 1, icon: '✅' },
  { type: 'tasks_completed', title: '10개 완료', description: '10개 태스크 완료', value: 10, icon: '📋' },
  { type: 'tasks_completed', title: '50개 완료', description: '50개 태스크 완료', value: 50, icon: '📊' },
  { type: 'tasks_completed', title: '100개 완료', description: '100개 태스크 완료', value: 100, icon: '🎉' },
];

// 신뢰 레벨
export type TrustLevel = 'new' | 'building' | 'established' | 'strong' | 'deep';

export interface TrustLevelInfo {
  level: TrustLevel;
  name: string;
  description: string;
  minDays: number;
  minAcceptance: number;  // 최소 수락률
}

export const TRUST_LEVELS: TrustLevelInfo[] = [
  { level: 'new', name: '새로운 시작', description: '알프레도를 알아가는 중', minDays: 0, minAcceptance: 0 },
  { level: 'building', name: '신뢰 쌓는 중', description: '점점 친해지고 있어요', minDays: 7, minAcceptance: 0.3 },
  { level: 'established', name: '신뢰 형성', description: '서로를 이해하고 있어요', minDays: 30, minAcceptance: 0.5 },
  { level: 'strong', name: '깊은 신뢰', description: '믿을 수 있는 파트너', minDays: 90, minAcceptance: 0.6 },
  { level: 'deep', name: '함께하는 동반자', description: '오랜 시간 함께한 동반자', minDays: 180, minAcceptance: 0.7 },
];

// 주간/월간 요약
export interface TrustSummary {
  period: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;

  // 통계
  stats: {
    daysActive: number;
    suggestionsReceived: number;
    suggestionsAccepted: number;
    acceptanceRate: number;
    focusMinutes: number;
    tasksCompleted: number;
    timeSavedMinutes: number;
  };

  // 하이라이트
  highlights: string[];

  // 새로 달성한 마일스톤
  newMilestones: Milestone[];

  // 알프레도 메시지
  message: string;
}

// 신뢰 이벤트 (추적용)
export interface TrustEvent {
  id: string;
  type: 'suggestion_accepted' | 'suggestion_dismissed' | 'focus_completed' | 'task_completed' | 'daily_visit';
  timestamp: string;
  metadata?: Record<string, unknown>;
}
