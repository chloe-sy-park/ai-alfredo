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

// W3-4, W3-5: 퀘스트 시스템 + "만약에" 미리보기
export {
  QUEST_TIERS,
  taskToQuest,
  QuestCard,
  QuestList,
  WhatIfPreview,
  WhatIfFloating,
  QuestCompleteModal
} from './AlfredoQuestSystem';

// W2-5, W2-6: 알프레도 한마디 + Empty State
export {
  ALFREDO_COMMENTS,
  getAlfredoComment,
  getContextualComment,
  EmptyState,
  EmptyStateInline,
  LoadingState,
  ErrorState
} from './AlfredoComments';

// W3-1, W3-2, W3-3: 능동적 알림 시스템
export {
  NOTIFICATION_TYPES,
  generateProactiveNotifications,
  generateWeatherNotifications,
  WeatherChecklist,
  MeetingPrepCard,
  NotificationCenter,
  NotificationBell
} from './AlfredoProactive';
