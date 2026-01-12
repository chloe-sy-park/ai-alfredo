/**
 * 🧠 알프레도 자동 학습 시스템
 * 
 * 이대표 철학: "캘린더 하나로 DNA 확장"
 * - 유저 입력 최소화
 * - 행동에서 학습
 * - 시간 지날수록 정교해짐
 * - 알프레도가 먼저 제안
 */

// 개인화 시스템 import
var Personalization = typeof window !== 'undefined' && window.AlfredoPersonalization 
  ? window.AlfredoPersonalization 
  : null;

// ============================================
// 스토리지 키
// ============================================

var LEARNING_KEYS = {
  // 학습된 스타일 값
  learnedStyle: 'alfredo_learned_style',
  // 피드백 히스토리
  feedbackHistory: 'alfredo_feedback_history',
  // 캘린더 패턴
  calendarPatterns: 'alfredo_calendar_patterns',
  // 동기화율
  syncRate: 'alfredo_sync_rate',
  // 학습 시작일
  learningStartDate: 'alfredo_learning_start',
  // 제안 히스토리
  suggestionHistory: 'alfredo_suggestion_history'
};

// ============================================
// 동기화율 계산
// ============================================

/**
 * 동기화율 계산 (0-100%)
 * - 사용 기간
 * - 피드백 수
 * - 캘린더 데이터 양
 * - 패턴 발견 수
 */
function calculateSyncRate() {
  var factors = {
    daysSinceStart: 0,
    feedbackCount: 0,
    calendarEvents: 0,
    patternsFound: 0
  };
  
  // 사용 기간 (최대 30점)
  var startDate = localStorage.getItem(LEARNING_KEYS.learningStartDate);
  if (startDate) {
    var days = Math.floor((Date.now() - parseInt(startDate, 10)) / (1000 * 60 * 60 * 24));
    factors.daysSinceStart = Math.min(days * 1, 30); // 하루 1점, 최대 30점
  }
  
  // 피드백 수 (최대 30점)
  var feedback = getFeedbackHistory();
  factors.feedbackCount = Math.min(feedback.length * 2, 30); // 피드백 1개당 2점
  
  // 캘린더 패턴 (최대 25점)
  var patterns = getCalendarPatterns();
  var patternCount = Object.keys(patterns).filter(function(k) {
    return patterns[k] !== null && patterns[k] !== undefined;
  }).length;
  factors.patternsFound = Math.min(patternCount * 5, 25); // 패턴 1개당 5점
  
  // 기본 점수 (15점) - 연동만 해도 시작
  var baseScore = 15;
  
  var total = baseScore + factors.daysSinceStart + factors.feedbackCount + factors.patternsFound;
  
  // 저장
  var syncData = {
    rate: Math.min(total, 100),
    factors: factors,
    updatedAt: Date.now()
  };
  localStorage.setItem(LEARNING_KEYS.syncRate, JSON.stringify(syncData));
  
  return syncData;
}

/**
 * 동기화율 가져오기
 */
function getSyncRate() {
  try {
    var saved = localStorage.getItem(LEARNING_KEYS.syncRate);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return calculateSyncRate();
}

// ============================================
// 캘린더 패턴 분석 (DNA 확장)
// ============================================

/**
 * 캘린더 이벤트에서 패턴 추론
 * @param {Array} events - 캘린더 이벤트 배열
 */
function analyzeCalendarPatterns(events) {
  if (!events || events.length === 0) {
    return getCalendarPatterns();
  }
  
  var patterns = {
    // 크로노타입
    chronotype: null, // 'morning' | 'evening'
    avgFirstEventHour: null,
    
    // 에너지 패턴
    busiestDay: null,
    avgMeetingsPerDay: null,
    meetingHeavyDays: [], // 미팅 많은 요일들
    
    // 워라밸
    hasWeekendWork: false,
    hasLateNightEvents: false,
    
    // 집중 시간
    likelyFocusHours: [],
    
    // 스트레스 신호
    recentCancellations: 0,
    scheduleChangesThisWeek: 0
  };
  
  // 시간대별, 요일별 분석
  var hourCounts = {};
  var dayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  var firstEventHours = [];
  
  events.forEach(function(event) {
    if (!event.start) return;
    
    var date = new Date(event.start);
    var hour = date.getHours();
    var day = date.getDay();
    
    // 시간대 카운트
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    
    // 요일 카운트
    dayCounts[day] = (dayCounts[day] || 0) + 1;
    
    // 첫 일정 시간 (9시 이전 시작하는 일정만)
    if (hour < 12) {
      firstEventHours.push(hour);
    }
    
    // 주말 업무
    if (day === 0 || day === 6) {
      patterns.hasWeekendWork = true;
    }
    
    // 늦은 밤 일정
    if (hour >= 21) {
      patterns.hasLateNightEvents = true;
    }
  });
  
  // 크로노타입 추론
  if (firstEventHours.length > 0) {
    var avgFirst = firstEventHours.reduce(function(a, b) { return a + b; }, 0) / firstEventHours.length;
    patterns.avgFirstEventHour = Math.round(avgFirst * 10) / 10;
    patterns.chronotype = avgFirst < 9 ? 'morning' : 'evening';
  }
  
  // 가장 바쁜 요일
  var maxDay = 0;
  var maxCount = 0;
  Object.keys(dayCounts).forEach(function(day) {
    if (dayCounts[day] > maxCount) {
      maxCount = dayCounts[day];
      maxDay = parseInt(day, 10);
    }
  });
  var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  patterns.busiestDay = dayNames[maxDay];
  
  // 평균 미팅 수
  var totalDays = Math.max(1, new Set(events.map(function(e) {
    return new Date(e.start).toDateString();
  })).size);
  patterns.avgMeetingsPerDay = Math.round(events.length / totalDays * 10) / 10;
  
  // 집중 가능 시간 (미팅 적은 시간대)
  var quietHours = [];
  for (var h = 9; h <= 18; h++) {
    if ((hourCounts[h] || 0) < patterns.avgMeetingsPerDay / 2) {
      quietHours.push(h);
    }
  }
  patterns.likelyFocusHours = quietHours.slice(0, 3);
  
  // 저장
  localStorage.setItem(LEARNING_KEYS.calendarPatterns, JSON.stringify(patterns));
  
  // 동기화율 재계산
  calculateSyncRate();
  
  return patterns;
}

/**
 * 저장된 캘린더 패턴 가져오기
 */
function getCalendarPatterns() {
  try {
    var saved = localStorage.getItem(LEARNING_KEYS.calendarPatterns);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return {};
}

// ============================================
// 피드백 기반 학습
// ============================================

/**
 * 피드백 기록
 * @param {string} context - 피드백 맥락 (briefing, notification, suggestion 등)
 * @param {string} type - 'positive' | 'negative' | 'correction'
 * @param {object} details - 추가 정보
 */
function recordFeedback(context, type, details) {
  var history = getFeedbackHistory();
  
  var feedback = {
    id: Date.now().toString(36),
    context: context,
    type: type,
    details: details || {},
    timestamp: Date.now()
  };
  
  history.push(feedback);
  
  // 최근 100개만 유지
  if (history.length > 100) {
    history = history.slice(-100);
  }
  
  localStorage.setItem(LEARNING_KEYS.feedbackHistory, JSON.stringify(history));
  
  // 스타일 자동 조정
  adjustStyleFromFeedback(feedback);
  
  // 동기화율 재계산
  calculateSyncRate();
  
  return feedback;
}

/**
 * 피드백 히스토리 가져오기
 */
function getFeedbackHistory() {
  try {
    var saved = localStorage.getItem(LEARNING_KEYS.feedbackHistory);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return [];
}

/**
 * 피드백 기반 스타일 자동 조정
 */
function adjustStyleFromFeedback(feedback) {
  var learned = getLearnedStyle();
  var adjustments = {
    dataDepth: 0,
    notificationStyle: 0,
    visualStyle: 0,
    motivationStyle: 0
  };
  
  // 알림 관련 피드백
  if (feedback.context === 'notification') {
    if (feedback.type === 'negative') {
      // 알림 무시 → 젠틀하게
      adjustments.notificationStyle = -5;
    } else if (feedback.type === 'positive') {
      // 알림 수용 → 현재 유지 또는 약간 강화
      adjustments.notificationStyle = 2;
    }
  }
  
  // 브리핑 관련 피드백
  if (feedback.context === 'briefing') {
    if (feedback.details && feedback.details.tooLong) {
      adjustments.dataDepth = -10;
    } else if (feedback.details && feedback.details.wantMore) {
      adjustments.dataDepth = 10;
    }
  }
  
  // 동기부여 관련 피드백
  if (feedback.context === 'motivation') {
    if (feedback.type === 'negative' && feedback.details && feedback.details.tooPushy) {
      adjustments.motivationStyle = -10;
      adjustments.notificationStyle = -5;
    }
  }
  
  // 스킵/무시 패턴
  if (feedback.context === 'skip' || feedback.context === 'ignore') {
    // 전반적으로 덜 적극적으로
    adjustments.notificationStyle = -3;
    adjustments.motivationStyle = -3;
  }
  
  // 조정 적용
  Object.keys(adjustments).forEach(function(key) {
    if (adjustments[key] !== 0) {
      learned[key] = Math.max(0, Math.min(100, (learned[key] || 50) + adjustments[key]));
    }
  });
  
  // 저장
  saveLearnedStyle(learned);
  
  return learned;
}

// ============================================
// 학습된 스타일 관리
// ============================================

/**
 * 학습된 스타일 가져오기
 */
function getLearnedStyle() {
  try {
    var saved = localStorage.getItem(LEARNING_KEYS.learnedStyle);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  
  // 기본값 (밸런스)
  return {
    dataDepth: 50,
    notificationStyle: 50,
    visualStyle: 50,
    motivationStyle: 50,
    confidence: {
      dataDepth: 0,
      notificationStyle: 0,
      visualStyle: 0,
      motivationStyle: 0
    }
  };
}

/**
 * 학습된 스타일 저장
 */
function saveLearnedStyle(style) {
  style.updatedAt = Date.now();
  localStorage.setItem(LEARNING_KEYS.learnedStyle, JSON.stringify(style));
}

/**
 * 캘린더 패턴에서 스타일 추론
 */
function inferStyleFromPatterns(patterns) {
  var style = getLearnedStyle();
  
  if (!patterns || Object.keys(patterns).length === 0) {
    return style;
  }
  
  // 바쁜 정도에 따른 데이터 깊이
  if (patterns.avgMeetingsPerDay !== null) {
    if (patterns.avgMeetingsPerDay > 5) {
      // 매우 바쁨 → 에센셜 추천
      style.dataDepth = Math.min(style.dataDepth, 30);
      style.confidence.dataDepth = Math.min(100, (style.confidence.dataDepth || 0) + 10);
    } else if (patterns.avgMeetingsPerDay < 2) {
      // 여유로움 → 풀데이터도 OK
      style.dataDepth = Math.max(style.dataDepth, 60);
      style.confidence.dataDepth = Math.min(100, (style.confidence.dataDepth || 0) + 10);
    }
  }
  
  // 워라밸 상태에 따른 알림 스타일
  if (patterns.hasWeekendWork || patterns.hasLateNightEvents) {
    // 과부하 → 젠틀하게
    style.notificationStyle = Math.min(style.notificationStyle, 40);
    style.confidence.notificationStyle = Math.min(100, (style.confidence.notificationStyle || 0) + 10);
  }
  
  // 크로노타입에 따른 추천 (참고용)
  style.chronotype = patterns.chronotype;
  
  saveLearnedStyle(style);
  
  return style;
}

// ============================================
// 알프레도 제안 시스템
// ============================================

/**
 * 스타일 변경 제안 생성
 * 알프레도가 먼저 "이렇게 해볼까요?" 제안
 */
function generateStyleSuggestion() {
  var patterns = getCalendarPatterns();
  var feedback = getFeedbackHistory();
  var currentStyle = getLearnedStyle();
  var syncData = getSyncRate();
  
  var suggestions = [];
  
  // 최근 피드백 분석
  var recentFeedback = feedback.filter(function(f) {
    return Date.now() - f.timestamp < 7 * 24 * 60 * 60 * 1000; // 최근 7일
  });
  
  var negativeCount = recentFeedback.filter(function(f) { 
    return f.type === 'negative'; 
  }).length;
  
  var positiveCount = recentFeedback.filter(function(f) { 
    return f.type === 'positive'; 
  }).length;
  
  // 부정 피드백이 많으면 스타일 변경 제안
  if (negativeCount > 3 && negativeCount > positiveCount) {
    if (currentStyle.notificationStyle > 50) {
      suggestions.push({
        type: 'notificationStyle',
        currentValue: currentStyle.notificationStyle,
        suggestedValue: currentStyle.notificationStyle - 20,
        reason: '최근 알림을 자주 무시하시는 것 같아요. 좀 더 젠틀하게 다가갈까요?',
        emoji: '🌸'
      });
    }
  }
  
  // 주말 업무 감지 → 워라밸 케어 제안
  if (patterns.hasWeekendWork && currentStyle.motivationStyle > 60) {
    suggestions.push({
      type: 'motivationStyle',
      currentValue: currentStyle.motivationStyle,
      suggestedValue: 40,
      reason: '주말에도 일정이 있으시네요. 압박 줄이고 편하게 갈까요?',
      emoji: '🌊'
    });
  }
  
  // 미팅 많은 날 감지 → 데이터 간소화 제안
  if (patterns.avgMeetingsPerDay > 5 && currentStyle.dataDepth > 50) {
    suggestions.push({
      type: 'dataDepth',
      currentValue: currentStyle.dataDepth,
      suggestedValue: 30,
      reason: '하루 미팅이 평균 ' + patterns.avgMeetingsPerDay + '개예요. 핵심만 간단히 알려드릴까요?',
      emoji: '😌'
    });
  }
  
  // 동기화율 높으면 → 신뢰 표현
  if (syncData.rate > 70 && suggestions.length === 0) {
    suggestions.push({
      type: 'milestone',
      reason: '동기화율 ' + syncData.rate + '%! 이제 많이 맞춰졌어요 🎉',
      emoji: '🎯'
    });
  }
  
  return suggestions;
}

/**
 * 제안 수락
 */
function acceptSuggestion(suggestion) {
  if (!suggestion || !suggestion.type) return;
  
  if (suggestion.type === 'milestone') {
    // 마일스톤은 기록만
    recordSuggestionResponse(suggestion, 'acknowledged');
    return;
  }
  
  var style = getLearnedStyle();
  style[suggestion.type] = suggestion.suggestedValue;
  saveLearnedStyle(style);
  
  recordSuggestionResponse(suggestion, 'accepted');
  
  return style;
}

/**
 * 제안 거절
 */
function rejectSuggestion(suggestion) {
  recordSuggestionResponse(suggestion, 'rejected');
  
  // 거절 시 해당 축의 confidence 증가 (유저가 현재 값 선호)
  var style = getLearnedStyle();
  if (suggestion.type && style.confidence && style.confidence[suggestion.type] !== undefined) {
    style.confidence[suggestion.type] = Math.min(100, style.confidence[suggestion.type] + 20);
    saveLearnedStyle(style);
  }
}

/**
 * 제안 응답 기록
 */
function recordSuggestionResponse(suggestion, response) {
  try {
    var history = JSON.parse(localStorage.getItem(LEARNING_KEYS.suggestionHistory) || '[]');
    history.push({
      suggestion: suggestion,
      response: response,
      timestamp: Date.now()
    });
    if (history.length > 50) {
      history = history.slice(-50);
    }
    localStorage.setItem(LEARNING_KEYS.suggestionHistory, JSON.stringify(history));
  } catch (e) {}
}

// ============================================
// 학습 시작/초기화
// ============================================

/**
 * 학습 시작 (첫 연동 시)
 */
function startLearning() {
  if (!localStorage.getItem(LEARNING_KEYS.learningStartDate)) {
    localStorage.setItem(LEARNING_KEYS.learningStartDate, Date.now().toString());
  }
  calculateSyncRate();
}

/**
 * 학습 데이터 리셋
 */
function resetLearning() {
  Object.keys(LEARNING_KEYS).forEach(function(key) {
    localStorage.removeItem(LEARNING_KEYS[key]);
  });
}

/**
 * 학습 상태 요약 가져오기
 */
function getLearningStatus() {
  var syncData = getSyncRate();
  var patterns = getCalendarPatterns();
  var style = getLearnedStyle();
  var feedback = getFeedbackHistory();
  
  // 학습 기간
  var startDate = localStorage.getItem(LEARNING_KEYS.learningStartDate);
  var daysSinceStart = 0;
  if (startDate) {
    daysSinceStart = Math.floor((Date.now() - parseInt(startDate, 10)) / (1000 * 60 * 60 * 24));
  }
  
  return {
    syncRate: syncData.rate,
    daysSinceStart: daysSinceStart,
    feedbackCount: feedback.length,
    patternsDiscovered: Object.keys(patterns).filter(function(k) {
      return patterns[k] !== null && patterns[k] !== undefined;
    }).length,
    learnedStyle: style,
    calendarPatterns: patterns
  };
}

// ============================================
// 알프레도가 파악한 것 텍스트 생성
// ============================================

/**
 * 알프레도가 파악한 내용을 자연어로
 */
function generateLearningInsights() {
  var patterns = getCalendarPatterns();
  var style = getLearnedStyle();
  var syncData = getSyncRate();
  
  var insights = [];
  
  // 크로노타입
  if (patterns.chronotype) {
    insights.push({
      emoji: patterns.chronotype === 'morning' ? '🌅' : '🌙',
      text: patterns.chronotype === 'morning' 
        ? '아침형이시네요. 첫 일정이 보통 ' + (patterns.avgFirstEventHour || 9) + '시쯤이에요.'
        : '오전에 여유 있게 시작하시는 편이에요.',
      confidence: style.confidence.dataDepth || 30
    });
  }
  
  // 바쁜 요일
  if (patterns.busiestDay) {
    insights.push({
      emoji: '📆',
      text: patterns.busiestDay + '요일이 가장 바쁘시네요.',
      confidence: 50
    });
  }
  
  // 미팅 패턴
  if (patterns.avgMeetingsPerDay) {
    var meetingDesc = patterns.avgMeetingsPerDay > 4 ? '미팅이 많은 편이에요' :
                      patterns.avgMeetingsPerDay < 2 ? '미팅보다 집중 작업이 많으시네요' :
                      '미팅과 집중 시간이 균형 있어요';
    insights.push({
      emoji: '👥',
      text: '하루 평균 미팅 ' + patterns.avgMeetingsPerDay + '개. ' + meetingDesc,
      confidence: 60
    });
  }
  
  // 집중 시간
  if (patterns.likelyFocusHours && patterns.likelyFocusHours.length > 0) {
    insights.push({
      emoji: '🎯',
      text: patterns.likelyFocusHours[0] + '시~' + (patterns.likelyFocusHours[patterns.likelyFocusHours.length - 1] + 1) + '시가 집중하기 좋은 시간 같아요.',
      confidence: 40
    });
  }
  
  // 워라밸
  if (patterns.hasWeekendWork || patterns.hasLateNightEvents) {
    insights.push({
      emoji: '⚠️',
      text: patterns.hasWeekendWork 
        ? '주말에도 일정이 있네요. 쉬는 시간도 필요해요!'
        : '밤 늦게까지 일정이 있어요. 무리하지 마세요.',
      confidence: 70
    });
  }
  
  // 스타일 파악
  if (Personalization) {
    var levels = Personalization.getAllLevels(style);
    
    if (style.confidence.notificationStyle > 30) {
      insights.push({
        emoji: levels.notificationStyle.emoji,
        text: levels.notificationStyle.label + ' 스타일의 알림이 잘 맞는 것 같아요.',
        confidence: style.confidence.notificationStyle
      });
    }
  }
  
  return {
    syncRate: syncData.rate,
    insights: insights
  };
}

// ============================================
// Export
// ============================================

var AutoLearning = {
  // 동기화율
  calculateSyncRate: calculateSyncRate,
  getSyncRate: getSyncRate,
  
  // 캘린더 패턴
  analyzeCalendarPatterns: analyzeCalendarPatterns,
  getCalendarPatterns: getCalendarPatterns,
  
  // 피드백
  recordFeedback: recordFeedback,
  getFeedbackHistory: getFeedbackHistory,
  
  // 학습된 스타일
  getLearnedStyle: getLearnedStyle,
  saveLearnedStyle: saveLearnedStyle,
  inferStyleFromPatterns: inferStyleFromPatterns,
  
  // 제안
  generateStyleSuggestion: generateStyleSuggestion,
  acceptSuggestion: acceptSuggestion,
  rejectSuggestion: rejectSuggestion,
  
  // 상태
  startLearning: startLearning,
  resetLearning: resetLearning,
  getLearningStatus: getLearningStatus,
  generateLearningInsights: generateLearningInsights
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutoLearning;
}

if (typeof window !== 'undefined') {
  window.AlfredoAutoLearning = AutoLearning;
}
