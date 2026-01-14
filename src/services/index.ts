// Auth
export * from './auth';

// Calendar
export * from './calendar';

// Condition
export * from './condition';

// Focus
export * from './focusNow';

// Notes
export * from './notes';

// Tasks - getTodayCompletedCount
export {
  addTask,
  updateTask,
  changeTaskStatus,
  toggleTaskComplete,
  deleteTask,
  getTasksByCategory,
  getTasksByProject,
  getTasksByTag,
  getSubtasks,
  getParentTasks,
  getTodayCompletedCount,
  getPendingCount,
  sortTasks,
  filterTasks,
  getDDay,
  getDDayLabel,
  getTotalEstimatedMinutes,
  getTotalActualMinutes,
  formatMinutes,
  formatRemainingTime,
  recordActualTime,
  createRecurringTask,
  calculateNextOccurrence,
  checkReminders,
  getAllTags,
  addTagToTask,
  removeTagFromTask,
  getTasks,
  type Task,
  type RecurrenceRule,
  type ReminderSetting,
  type TaskStatus,
  type SortOption,
  type FilterOption
} from './tasks';

// Top3 - getTop3TodayCompletedCount (renamed)
export {
  getTop3,
  saveTop3,
  addTop3Item,
  toggleTop3Complete,
  updateTop3Item,
  deleteTop3Item,
  reorderTop3,
  toggleTop3Star,
  getTop3TodayCompletedCount,
  getWorkItems,
  getLifeItems,
  getTodayTop3,
  getTop3Progress,
  type Top3Item,
  type Top3Data,
  type Progress
} from './top3';

// Weather
export * from './weather';

// DNA Engine
export * from './dnaEngine';