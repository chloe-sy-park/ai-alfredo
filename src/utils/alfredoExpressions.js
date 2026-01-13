/**
 * 🐧 알프레도 표정 시스템
 * 상황에 따라 알프레도의 표정을 결정합니다.
 */

// 표정 정의
export var ALFREDO_EXPRESSIONS = {
  default: { emoji: '🐧', label: '기본' },
  happy: { emoji: '😊🐧', label: '기쁨' },
  excited: { emoji: '🎉🐧', label: '신남' },
  cheer: { emoji: '💪🐧', label: '응원' },
  comfort: { emoji: '🤗🐧', label: '위로' },
  worried: { emoji: '😰🐧', label: '걱정' },
  sleepy: { emoji: '😴🐧', label: '졸림' },
  thinking: { emoji: '🤔🐧', label: '생각' },
  love: { emoji: '💜🐧', label: '애정' },
  proud: { emoji: '🌟🐧', label: '자랑' },
  alert: { emoji: '⚡🐧', label: '긴급' },
  care: { emoji: '💜🐧', label: '케어' },
  peak: { emoji: '🔥🐧', label: '피크' }
};

/**
 * 상황에 따른 표정 결정
 * @param {Object} props
 * @param {Array} props.tasks - 태스크 목록
 * @param {number} props.condition - 컨디션 (1-5)
 * @param {Object} props.urgentEvent - 긴급 이벤트
 * @param {string} props.messageType - 메시지 타입
 * @param {Object} props.todayContext - DNA 오늘 컨텍스트
 * @param {Object} props.burnoutWarning - 번아웃 경고
 * @param {Array} props.specialAlerts - 특별 알림
 * @returns {Object} 표정 객체
 */
export var getAlfredoExpression = function(props) {
  var tasks = props.tasks || [];
  var condition = props.condition || 0;
  var urgentEvent = props.urgentEvent;
  var messageType = props.messageType || '';
  var todayContext = props.todayContext;
  var burnoutWarning = props.burnoutWarning;
  var specialAlerts = props.specialAlerts || [];
  
  var now = new Date();
  var hour = now.getHours();
  var completed = tasks.filter(function(t) { return t.completed; }).length;
  var total = tasks.length;
  var completionRate = total > 0 ? (completed / total) * 100 : 0;
  
  // 1. 번아웃 경고 - 케어 표정
  if (burnoutWarning && (burnoutWarning.level === 'critical' || burnoutWarning.level === 'warning')) {
    return ALFREDO_EXPRESSIONS.care;
  }
  
  // 2. 발표 임박 - 긴급 표정
  var hasPresentationSoon = specialAlerts.some(function(a) {
    return a.type === 'presentation' && a.daysUntil <= 1;
  });
  if (hasPresentationSoon) {
    return ALFREDO_EXPRESSIONS.alert;
  }
  
  // 3. 긴급 상황 - 걱정 표정
  if (urgentEvent || messageType === 'urgent') {
    return ALFREDO_EXPRESSIONS.worried;
  }
  
  // 4. 피크 타임 - 피크 표정
  if (messageType === 'peak' || messageType === 'dna-peak') {
    return ALFREDO_EXPRESSIONS.peak;
  }
  
  // 5. 밤 시간 (21시~5시) - 졸림 표정
  if (hour >= 21 || hour < 5) {
    return ALFREDO_EXPRESSIONS.sleepy;
  }
  
  // 6. 컨디션 낮음 (1-2) - 위로 표정
  if (condition > 0 && condition <= 2) {
    return ALFREDO_EXPRESSIONS.comfort;
  }
  
  // 7. 바쁜 날 - 응원 표정
  if (todayContext && (todayContext.busyLevel === 'heavy' || todayContext.busyLevel === 'extreme')) {
    return ALFREDO_EXPRESSIONS.cheer;
  }
  
  // 8. 모든 태스크 완료 - 신남 표정
  if (total > 0 && completed === total) {
    return ALFREDO_EXPRESSIONS.excited;
  }
  
  // 9. 저녁 + 높은 완료율 - 자랑 표정
  if (hour >= 18 && completionRate >= 70) {
    return ALFREDO_EXPRESSIONS.proud;
  }
  
  // 10. 절반 이상 완료 - 기쁨 표정
  if (completionRate >= 50 && completed > 0) {
    return ALFREDO_EXPRESSIONS.happy;
  }
  
  // 11. 컨디션 물어볼 때 - 애정 표정
  if (condition === 0 || messageType === 'askCondition') {
    return ALFREDO_EXPRESSIONS.love;
  }
  
  // 12. 할 일 많이 남음 + 저녁 - 응원 표정
  if (hour >= 17 && total > 0 && completionRate < 50) {
    return ALFREDO_EXPRESSIONS.cheer;
  }
  
  // 13. 컨디션 좋음 (4-5) - 기쁨 표정
  if (condition >= 4) {
    return ALFREDO_EXPRESSIONS.happy;
  }
  
  // 기본 표정
  return ALFREDO_EXPRESSIONS.default;
};

/**
 * 시간대 판단
 * @returns {'morning' | 'afternoon' | 'evening' | 'night'}
 */
export var getTimeOfDay = function() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

/**
 * 저녁/밤 시간인지 확인
 * @returns {boolean}
 */
export var isEveningOrNight = function() {
  var timeOfDay = getTimeOfDay();
  return timeOfDay === 'evening' || timeOfDay === 'night';
};

export default {
  ALFREDO_EXPRESSIONS: ALFREDO_EXPRESSIONS,
  getAlfredoExpression: getAlfredoExpression,
  getTimeOfDay: getTimeOfDay,
  isEveningOrNight: isEveningOrNight
};
