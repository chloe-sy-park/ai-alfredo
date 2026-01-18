/**
 * Work OS Service
 *
 * "미팅이 생기면, 준비할 일이 자동으로 정리된다"
 *
 * AlFredo는 기존 생산성 도구를 대체하지 않고,
 * 해석자/연결자/추천자 역할만 수행
 */

// Types
export * from './types';

// Meeting Analyzer
export {
  checkMeetingConditions,
  generateMeetingInterpretation,
  generateTaskSuggestions,
  analyzeMeeting,
  analyzeTodayMeetings,
  filterRecommendableMeetings,
  findNextMeeting,
  getHoursUntilMeeting
} from './meetingAnalyzer';

// Task Recommender
export {
  createTaskFromSuggestion,
  createTasksFromAnalysis,
  createManualTask,
  selectRecommendationTemplates,
  validateRecommendation,
  calculateTaskPriority,
  sortTasksByPriority,
  groupTasksByMeeting,
  getUnlinkedTasks
} from './taskRecommender';

// Today Selector
export {
  determineTodayMode,
  selectFocusTasks,
  buildMeetingBasedContext,
  buildTodayContext,
  generateTodayMessage,
  getTodaySummary,
  getMinutesToNextMeeting,
  getAvailablePrepTime,
  canCompleteBeforeMeeting
} from './todaySelector';
