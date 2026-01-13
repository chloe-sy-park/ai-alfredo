// 컨디션 관련 상수 및 유틸리티

// 컨디션 레벨 정의
export var CONDITION_LEVELS = {
  1: { emoji: '😫', label: '힘들어요', color: '#ef4444' },
  2: { emoji: '😔', label: '그저그래요', color: '#f97316' },
  3: { emoji: '😐', label: '보통이에요', color: '#6b7280' },
  4: { emoji: '🙂', label: '괜찮아요', color: '#22c55e' },
  5: { emoji: '😊', label: '좋아요!', color: '#a855f7' }
};

// 레벨 라벨
export var LEVEL_LABELS = {
  energy: { 1: '피곤', 2: '나른', 3: '보통', 4: '활기', 5: '최상' },
  mood: { 1: '우울', 2: '가라앉음', 3: '평온', 4: '좋음', 5: '행복' },
  focus: { 1: '산만', 2: '흐릿', 3: '보통', 4: '집중', 5: '몰입' }
};

// 요일 이름
export var DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// localStorage 키
export var STORAGE_KEY = 'alfredo_daily_conditions';
export var SYNC_QUEUE_KEY = 'alfredo_conditions_sync_queue';

// 테스트용 사용자 ID
export var TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// 날짜 키 생성 (YYYY-MM-DD)
export var getDateKey = function(date) {
  var d = date || new Date();
  var year = d.getFullYear();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
};

// 시간대 구분
export var getTimeOfDay = function(date) {
  var hour = (date || new Date()).getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// localStorage 데이터 로드
export var loadConditions = function() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load conditions:', e);
    return {};
  }
};

// localStorage 데이터 저장
export var saveConditions = function(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save conditions:', e);
  }
};

// 동기화 큐 관리
export var getSyncQueue = function() {
  try {
    var data = localStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export var addToSyncQueue = function(action) {
  var queue = getSyncQueue();
  queue.push(Object.assign({ timestamp: Date.now() }, action));
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
};

export var clearSyncQueue = function() {
  localStorage.removeItem(SYNC_QUEUE_KEY);
};
