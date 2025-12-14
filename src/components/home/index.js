// Home Components Index
// Week 1 개선 작업 포함

// 기존 컴포넌트
export { default as HomePage } from './HomePage';
export { default as Onboarding } from './Onboarding';
export { default as UnifiedTimelineView } from './UnifiedTimelineView';
export { default as AlfredoContextActions } from './AlfredoContextActions';

// 위젯 컴포넌트들
export { 
  QuickConditionTracker, 
  AlfredoBriefing, 
  Big3Widget, 
  UrgentWidget, 
  TimelineWidget,
  RoutineWidget 
} from './widgets';

// W1-1, W1-2: 알프레도 상태바 + 표정 시스템
export { 
  default as AlfredoStatusBar,
  ALFREDO_EXPRESSIONS,
  getAlfredoExpression,
  getStatusMessage 
} from './AlfredoStatusBar';

// W1-3, W1-4: 실패 케어 + 내일의 나 메시지
export {
  FailureCareModal,
  TomorrowMessageInput,
  TomorrowMessageDisplay,
  EveningWrapUp,
  FAILURE_CARE_MESSAGES
} from './AlfredoCareSystem';

// W2-1, W2-2, W2-3, W2-4: 알프레도 모드 시스템 + 바디 더블링
export {
  ALFREDO_MODES,
  getRecommendedMode,
  AlfredoModeSelector,
  NowCard,
  BodyDoublingMode,
  TimeBasedGreeting
} from './AlfredoModeSystem';
