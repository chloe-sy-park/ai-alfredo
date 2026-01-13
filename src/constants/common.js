// === 공통 상수 ===
// 여러 컴포넌트에서 사용되는 상수들

// 요일 이름 (한국어)
export var DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];
export var DAYS_FULL_KR = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// 컨디션 이모지 (1-5 레벨)
export var CONDITION_EMOJI = ['😫', '😔', '😐', '😊', '🔥'];
export var CONDITION_LABELS = ['최악', '안좋음', '보통', '좋음', '최고'];

// 우선순위
export var PRIORITY_CONFIG = {
  high: { label: '높음', color: '#EF4444', emoji: '🔴' },
  medium: { label: '보통', color: '#F59E0B', emoji: '🟡' },
  low: { label: '낮음', color: '#10B981', emoji: '🟢' }
};

// 시간대 구분
export var TIME_PHASES = {
  earlyMorning: { start: 5, end: 7, label: '이른 아침' },
  morning: { start: 7, end: 12, label: '오전' },
  afternoon: { start: 12, end: 17, label: '오후' },
  evening: { start: 17, end: 21, label: '저녁' },
  night: { start: 21, end: 5, label: '밤' }
};

// 시간대 계산 헬퍼
export var getTimePhase = function() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return 'earlyMorning';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// 날짜 포맷 헬퍼
export var formatDateKR = function(date) {
  var d = date || new Date();
  var month = d.getMonth() + 1;
  var day = d.getDate();
  var dayName = DAYS_KR[d.getDay()];
  return month + '월 ' + day + '일 ' + dayName + '요일';
};

export var formatTimeKR = function(date) {
  var d = date || new Date();
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// 상대 시간 (몇 분 전, 몇 시간 전)
export var getRelativeTime = function(date) {
  var now = new Date();
  var diff = now - new Date(date);
  var minutes = Math.floor(diff / 60000);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);
  
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return minutes + '분 전';
  if (hours < 24) return hours + '시간 전';
  if (days < 7) return days + '일 전';
  return formatDateKR(new Date(date));
};

// localStorage 키
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
  MOOD_LOGS: 'lifebutler_mood_logs',
  LAST_CONDITION_CHECK: 'lastConditionCheck'
};

// 애니메이션 설정
export var ANIMATION_CONFIG = {
  fast: 150,
  normal: 300,
  slow: 500,
  spring: { tension: 300, friction: 20 }
};

// 터치 타겟 최소 크기 (iOS 가이드라인)
export var TOUCH_TARGET = {
  min: 44, // 44px minimum
  comfortable: 48
};

export default {
  DAYS_KR: DAYS_KR,
  DAYS_FULL_KR: DAYS_FULL_KR,
  CONDITION_EMOJI: CONDITION_EMOJI,
  CONDITION_LABELS: CONDITION_LABELS,
  PRIORITY_CONFIG: PRIORITY_CONFIG,
  TIME_PHASES: TIME_PHASES,
  STORAGE_KEYS: STORAGE_KEYS,
  ANIMATION_CONFIG: ANIMATION_CONFIG,
  TOUCH_TARGET: TOUCH_TARGET,
  getTimePhase: getTimePhase,
  formatDateKR: formatDateKR,
  formatTimeKR: formatTimeKR,
  getRelativeTime: getRelativeTime
};
