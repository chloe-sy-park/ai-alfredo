// ============================================================
// 📦 localStorage 유틸리티
// ============================================================

export var STORAGE_KEYS = {
  TASKS: 'lifebutler_tasks',
  ROUTINES: 'lifebutler_routines',
  HEALTH: 'lifebutler_health',
  RELATIONSHIPS: 'lifebutler_relationships',
  USER_SETTINGS: 'lifebutler_user_settings',
  MOOD_ENERGY: 'lifebutler_mood_energy',
  STREAK_DATA: 'lifebutler_streak_data',
  ONBOARDING_COMPLETE: 'lifebutler_onboarding_complete',
  JOURNAL_ENTRIES: 'lifebutler_journal_entries',
  MOOD_LOGS: 'lifebutler_mood_logs'
};

// localStorage에서 데이터 로드
export function loadFromStorage(key, defaultValue) {
  try {
    var stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // 로드 실패 시 기본값 반환
  }
  return defaultValue;
}

// localStorage에 데이터 저장
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // 저장 실패 무시
  }
}
