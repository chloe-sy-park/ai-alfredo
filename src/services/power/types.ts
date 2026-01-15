/**
 * Power Balance 타입 정의
 * 사용자와 AI 간의 권력 균형
 */

/**
 * 컨트롤 영역
 */
export type ControlArea =
  | 'scheduling'       // 일정 관리
  | 'task_priority'    // 태스크 우선순위
  | 'notifications'    // 알림
  | 'suggestions'      // 제안
  | 'automation'       // 자동화
  | 'data_usage';      // 데이터 활용

/**
 * 컨트롤 레벨
 */
export type ControlLevel =
  | 'user_full'        // 사용자 완전 제어
  | 'user_primary'     // 사용자 주도, AI 보조
  | 'balanced'         // 균형 (협업)
  | 'ai_suggest'       // AI 제안, 사용자 승인
  | 'ai_auto';         // AI 자동 (사용자 설정 범위 내)

/**
 * 영역별 컨트롤 설정
 */
export interface ControlSetting {
  area: ControlArea;
  level: ControlLevel;
  description: string;
  userCanOverride: boolean;
  requiresConfirmation: boolean;
}

/**
 * 사용자 권한 설정
 */
export interface UserPowerSettings {
  controls: Record<ControlArea, ControlLevel>;
  overrideHistory: OverrideRecord[];
  lastUpdated: string;
}

/**
 * 오버라이드 기록
 */
export interface OverrideRecord {
  id: string;
  area: ControlArea;
  aiSuggestion: string;
  userDecision: string;
  reason?: string;
  timestamp: string;
}

/**
 * 권한 위임 요청
 */
export interface DelegationRequest {
  id: string;
  area: ControlArea;
  action: string;
  reason: string;
  duration?: 'once' | 'session' | 'always';
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  respondedAt?: string;
}

/**
 * 되돌리기 옵션
 */
export interface UndoOption {
  id: string;
  action: string;
  description: string;
  canUndo: boolean;
  undoDeadline?: string;  // 되돌리기 가능 기한
  undoneAt?: string;
}

/**
 * 영역 라벨
 */
export const CONTROL_AREA_LABELS: Record<ControlArea, string> = {
  scheduling: '일정 관리',
  task_priority: '우선순위 설정',
  notifications: '알림',
  suggestions: '제안',
  automation: '자동화',
  data_usage: '데이터 활용'
};

/**
 * 영역 설명
 */
export const CONTROL_AREA_DESCRIPTIONS: Record<ControlArea, string> = {
  scheduling: '일정 생성, 수정, 삭제',
  task_priority: '할 일 순서와 중요도',
  notifications: '언제, 어떻게 알릴지',
  suggestions: '추천과 제안 방식',
  automation: '자동으로 처리할 범위',
  data_usage: '데이터를 어떻게 활용할지'
};

/**
 * 컨트롤 레벨 라벨
 */
export const CONTROL_LEVEL_LABELS: Record<ControlLevel, string> = {
  user_full: '내가 전부 결정',
  user_primary: '내가 주도, 도움받기',
  balanced: '함께 결정',
  ai_suggest: '제안받고 승인하기',
  ai_auto: '알아서 해줘'
};

/**
 * 컨트롤 레벨 설명
 */
export const CONTROL_LEVEL_DESCRIPTIONS: Record<ControlLevel, string> = {
  user_full: '알프레도는 요청할 때만 도와요',
  user_primary: '알프레도가 정보를 제공하고, 결정은 내가',
  balanced: '서로 의견을 나누고 함께 결정해요',
  ai_suggest: '알프레도가 제안하고, 내가 승인해요',
  ai_auto: '설정한 범위 내에서 알프레도가 처리해요'
};

/**
 * 기본 컨트롤 설정
 */
export const DEFAULT_CONTROL_SETTINGS: Record<ControlArea, ControlLevel> = {
  scheduling: 'ai_suggest',
  task_priority: 'ai_suggest',
  notifications: 'user_primary',
  suggestions: 'balanced',
  automation: 'user_primary',
  data_usage: 'user_full'
};

/**
 * 위임 요청 메시지 템플릿
 */
export const DELEGATION_MESSAGES = {
  request: [
    '이 부분은 제가 해도 될까요?',
    '이건 제가 처리해드릴까요?',
    '맡겨주시면 제가 할게요'
  ],
  approved: [
    '알겠어요, 제가 처리할게요!',
    '믿어주셔서 감사해요',
    '잘 해볼게요'
  ],
  denied: [
    '알겠어요, 직접 하시는 거죠!',
    '네, 그럼 제가 도와드릴게요',
    '필요하면 말씀해주세요'
  ]
};

/**
 * 사용자 우선 메시지
 */
export const USER_PRIORITY_MESSAGES = [
  '당신의 결정을 존중해요',
  '언제든 바꿀 수 있어요',
  '최종 결정은 항상 당신 몫이에요',
  '제 제안이 맞지 않으면 무시해도 돼요'
];
