/**
 * Capability Boundary 타입 정의
 * 알프레도가 할 수 있는 것과 없는 것의 경계
 */

/**
 * 능력 카테고리
 */
export type CapabilityCategory =
  | 'scheduling'      // 일정 관리
  | 'task_management' // 태스크 관리
  | 'analysis'        // 분석
  | 'suggestion'      // 제안
  | 'automation'      // 자동화
  | 'communication'   // 소통
  | 'learning';       // 학습

/**
 * 능력 상태
 */
export type CapabilityStatus =
  | 'available'       // 가능
  | 'limited'         // 제한적 가능
  | 'unavailable'     // 불가능
  | 'coming_soon';    // 곧 추가 예정

/**
 * 단일 능력
 */
export interface Capability {
  id: string;
  category: CapabilityCategory;
  name: string;
  description: string;
  status: CapabilityStatus;
  limitations?: string[];     // 제한 사항
  examples?: string[];        // 사용 예시
  tips?: string[];            // 활용 팁
}

/**
 * 경계 상황 (못하는 것을 요청받았을 때)
 */
export interface BoundaryMoment {
  id: string;
  requestedAction: string;
  reason: BoundaryReason;
  alternativeSuggestion?: string;
  timestamp: string;
}

/**
 * 경계 사유
 */
export type BoundaryReason =
  | 'technical_limit'    // 기술적 한계
  | 'data_access'        // 데이터 접근 불가
  | 'user_safety'        // 사용자 안전
  | 'ethical'            // 윤리적 이유
  | 'out_of_scope';      // 범위 밖

/**
 * 경계 응답
 */
export interface BoundaryResponse {
  message: string;
  tone: 'apologetic' | 'honest' | 'helpful';
  alternative?: string;
  learnMore?: string;
}

/**
 * 카테고리 라벨
 */
export const CAPABILITY_CATEGORY_LABELS: Record<CapabilityCategory, string> = {
  scheduling: '일정 관리',
  task_management: '할 일 관리',
  analysis: '분석',
  suggestion: '제안',
  automation: '자동화',
  communication: '소통',
  learning: '학습'
};

/**
 * 카테고리 아이콘
 */
export const CAPABILITY_CATEGORY_ICONS: Record<CapabilityCategory, string> = {
  scheduling: '📅',
  task_management: '✅',
  analysis: '📊',
  suggestion: '💡',
  automation: '⚡',
  communication: '💬',
  learning: '🧠'
};

/**
 * 상태 라벨
 */
export const CAPABILITY_STATUS_LABELS: Record<CapabilityStatus, string> = {
  available: '가능',
  limited: '제한적',
  unavailable: '불가능',
  coming_soon: '준비 중'
};

/**
 * 알프레도의 기본 능력 목록
 */
export const DEFAULT_CAPABILITIES: Capability[] = [
  // 일정 관리
  {
    id: 'cap_calendar_view',
    category: 'scheduling',
    name: '일정 확인',
    description: '연결된 캘린더의 일정을 보여드려요',
    status: 'available',
    examples: ['오늘 일정이 뭐야?', '이번 주 미팅은?']
  },
  {
    id: 'cap_calendar_suggest',
    category: 'scheduling',
    name: '일정 제안',
    description: '빈 시간에 적절한 일정을 제안해요',
    status: 'available',
    examples: ['집중 시간 추천해줘', '휴식 시간 언제가 좋을까?']
  },
  {
    id: 'cap_calendar_create',
    category: 'scheduling',
    name: '일정 생성',
    description: '새 일정을 캘린더에 추가해요',
    status: 'limited',
    limitations: ['사용자 확인 후에만 생성', '반복 일정은 제한적'],
    examples: ['내일 3시에 미팅 잡아줘']
  },

  // 태스크 관리
  {
    id: 'cap_task_view',
    category: 'task_management',
    name: '할 일 확인',
    description: '등록된 할 일 목록을 보여드려요',
    status: 'available',
    examples: ['오늘 할 일은?', '급한 일 뭐 있어?']
  },
  {
    id: 'cap_task_prioritize',
    category: 'task_management',
    name: '우선순위 제안',
    description: '중요도와 긴급도를 고려해 순서를 제안해요',
    status: 'available',
    examples: ['뭐부터 해야 할까?', 'Top 3 추천해줘']
  },
  {
    id: 'cap_task_create',
    category: 'task_management',
    name: '할 일 생성',
    description: '새 할 일을 추가해요',
    status: 'available',
    examples: ['내일까지 보고서 작성 추가해줘']
  },

  // 분석
  {
    id: 'cap_workload_analysis',
    category: 'analysis',
    name: '업무량 분석',
    description: '일정과 할 일을 보고 과부하 여부를 판단해요',
    status: 'available',
    examples: ['오늘 많이 바빠?', '이번 주 어때?']
  },
  {
    id: 'cap_pattern_analysis',
    category: 'analysis',
    name: '패턴 분석',
    description: '사용 패턴을 분석해 인사이트를 제공해요',
    status: 'limited',
    limitations: ['충분한 데이터가 쌓여야 가능'],
    examples: ['내 집중 패턴은?']
  },

  // 제안
  {
    id: 'cap_suggestion',
    category: 'suggestion',
    name: '맞춤 제안',
    description: '상황에 맞는 제안을 드려요',
    status: 'available',
    examples: ['지금 뭐하면 좋을까?']
  },
  {
    id: 'cap_reminder',
    category: 'suggestion',
    name: '리마인더',
    description: '중요한 일을 알려드려요',
    status: 'available'
  },

  // 자동화
  {
    id: 'cap_auto_categorize',
    category: 'automation',
    name: '자동 분류',
    description: '할 일을 자동으로 분류해요',
    status: 'limited',
    limitations: ['정확도가 100%가 아닐 수 있어요']
  },
  {
    id: 'cap_auto_schedule',
    category: 'automation',
    name: '자동 일정 조정',
    description: '일정을 자동으로 조정해요',
    status: 'unavailable',
    limitations: ['아직 준비 중이에요']
  },

  // 소통
  {
    id: 'cap_conversation',
    category: 'communication',
    name: '대화',
    description: '자연스러운 대화로 도움을 드려요',
    status: 'available'
  },
  {
    id: 'cap_email',
    category: 'communication',
    name: '이메일 연동',
    description: '이메일을 읽거나 보내요',
    status: 'unavailable',
    limitations: ['현재 지원하지 않아요']
  },

  // 학습
  {
    id: 'cap_learn_preference',
    category: 'learning',
    name: '선호도 학습',
    description: '사용 패턴을 통해 선호도를 학습해요',
    status: 'available'
  },
  {
    id: 'cap_learn_feedback',
    category: 'learning',
    name: '피드백 학습',
    description: '피드백을 통해 더 나아져요',
    status: 'available'
  }
];

/**
 * 못하는 것들 (명시적)
 */
export const CANNOT_DO: string[] = [
  '실제 이메일 보내기',
  '다른 사람 대신 결정하기',
  '외부 시스템 직접 제어',
  '개인정보 외부 전송',
  '사용자 동의 없는 자동 실행',
  '100% 정확한 예측'
];

/**
 * 경계 응답 템플릿
 */
export const BOUNDARY_RESPONSES: Record<BoundaryReason, BoundaryResponse[]> = {
  technical_limit: [
    {
      message: '아직 그건 제가 할 수 없어요',
      tone: 'honest',
      alternative: '대신 이렇게 해볼 수 있어요'
    },
    {
      message: '기술적으로 어려운 부분이에요',
      tone: 'apologetic'
    }
  ],
  data_access: [
    {
      message: '그 정보에는 접근할 수 없어요',
      tone: 'honest',
      alternative: '연결해주시면 도움드릴 수 있어요'
    }
  ],
  user_safety: [
    {
      message: '그건 직접 확인하시는 게 좋을 것 같아요',
      tone: 'helpful',
      learnMore: '중요한 결정은 직접 하시는 게 안전해요'
    }
  ],
  ethical: [
    {
      message: '그건 제가 해드리기 어려워요',
      tone: 'honest'
    }
  ],
  out_of_scope: [
    {
      message: '그건 제 전문 분야가 아니에요',
      tone: 'honest',
      alternative: '일정과 할 일 관리는 도와드릴 수 있어요!'
    }
  ]
};
