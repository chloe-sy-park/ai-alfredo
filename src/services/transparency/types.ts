/**
 * Data Transparency 타입 정의
 */

export type DataCategory =
  | 'calendar'     // 캘린더 데이터
  | 'tasks'        // 할 일 데이터
  | 'preferences'  // 선호도
  | 'patterns'     // 학습된 패턴
  | 'history'      // 사용 이력
  | 'feedback';    // 피드백

export interface DataUsageInfo {
  category: DataCategory;
  description: string;
  purpose: string;
  storedLocally: boolean;
  sharedExternally: boolean;
  retentionDays?: number;
  canDelete: boolean;
}

export interface DataExport {
  exportedAt: string;
  categories: DataCategory[];
  format: 'json' | 'csv';
  data: Record<string, unknown>;
}

export const DATA_USAGE_INFO: Record<DataCategory, DataUsageInfo> = {
  calendar: {
    category: 'calendar',
    description: '연결된 캘린더의 일정',
    purpose: '일정 확인 및 충돌 방지',
    storedLocally: true,
    sharedExternally: false,
    canDelete: true
  },
  tasks: {
    category: 'tasks',
    description: '등록한 할 일 목록',
    purpose: '할 일 관리 및 우선순위 제안',
    storedLocally: true,
    sharedExternally: false,
    canDelete: true
  },
  preferences: {
    category: 'preferences',
    description: '설정한 선호도',
    purpose: '맞춤형 경험 제공',
    storedLocally: true,
    sharedExternally: false,
    canDelete: true
  },
  patterns: {
    category: 'patterns',
    description: '학습된 사용 패턴',
    purpose: '더 나은 제안 생성',
    storedLocally: true,
    sharedExternally: false,
    retentionDays: 90,
    canDelete: true
  },
  history: {
    category: 'history',
    description: '앱 사용 이력',
    purpose: '서비스 개선',
    storedLocally: true,
    sharedExternally: false,
    retentionDays: 30,
    canDelete: true
  },
  feedback: {
    category: 'feedback',
    description: '제출한 피드백',
    purpose: '서비스 품질 향상',
    storedLocally: true,
    sharedExternally: false,
    canDelete: true
  }
};

export const CATEGORY_LABELS: Record<DataCategory, string> = {
  calendar: '캘린더',
  tasks: '할 일',
  preferences: '선호도',
  patterns: '학습 패턴',
  history: '사용 이력',
  feedback: '피드백'
};
