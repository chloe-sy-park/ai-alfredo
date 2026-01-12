/**
 * 알프레도 학습 유틸리티
 * - 피드백 수집 및 저장
 * - 패턴 인식 및 자동 학습
 * - 학습 데이터 관리
 */

const FEEDBACK_KEY = 'alfredo_feedback';
const LEARNINGS_KEY = 'alfredo_learnings';

// 피드백 저장
export const saveFeedback = (messageId, messageText, feedbackType, context = {}) => {
  const feedbacks = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
  
  const newFeedback = {
    id: `feedback-${Date.now()}`,
    messageId,
    messageText: messageText.slice(0, 200), // 200자 제한
    feedbackType, // 'positive' | 'negative'
    context: {
      time: new Date().toISOString(),
      hour: new Date().getHours(),
      energy: context.energy,
      mood: context.mood,
      ...context
    },
    createdAt: new Date().toISOString()
  };
  
  feedbacks.push(newFeedback);
  
  // 최대 100개 유지
  if (feedbacks.length > 100) {
    feedbacks.shift();
  }
  
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
  
  // 패턴 분석 후 자동 학습 트리거
  analyzeAndLearn(feedbacks);
  
  return newFeedback;
};

// 피드백 가져오기
export const getFeedbacks = () => {
  return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
};

// 학습 데이터 가져오기
export const getLearnings = () => {
  return JSON.parse(localStorage.getItem(LEARNINGS_KEY) || '[]');
};

// 학습 데이터 저장
export const saveLearning = (learning) => {
  const learnings = getLearnings();
  
  // 중복 체크 (비슷한 내용이 있으면 신뢰도만 업데이트)
  const existingIndex = learnings.findIndex(l => 
    l.category === learning.category && 
    l.content.toLowerCase().includes(learning.content.toLowerCase().slice(0, 20))
  );
  
  if (existingIndex >= 0) {
    // 기존 학습 강화
    learnings[existingIndex].confidence = Math.min(100, learnings[existingIndex].confidence + 10);
    learnings[existingIndex].updatedAt = new Date().toISOString();
  } else {
    // 새 학습 추가
    const newLearning = {
      id: `learning-${Date.now()}`,
      ...learning,
      source: learning.source || 'feedback', // 'feedback' | 'direct' | 'calendar' | 'chat'
      confidence: learning.confidence || 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    learnings.push(newLearning);
  }
  
  localStorage.setItem(LEARNINGS_KEY, JSON.stringify(learnings));
  return learnings;
};

// 학습 삭제
export const deleteLearning = (learningId) => {
  const learnings = getLearnings();
  const filtered = learnings.filter(l => l.id !== learningId);
  localStorage.setItem(LEARNINGS_KEY, JSON.stringify(filtered));
  return filtered;
};

// 학습 수정
export const updateLearning = (learningId, updates) => {
  const learnings = getLearnings();
  const index = learnings.findIndex(l => l.id === learningId);
  
  if (index >= 0) {
    learnings[index] = { ...learnings[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(LEARNINGS_KEY, JSON.stringify(learnings));
  }
  
  return learnings;
};

// 패턴 분석 및 자동 학습
const analyzeAndLearn = (feedbacks) => {
  // 최근 20개 피드백만 분석
  const recent = feedbacks.slice(-20);
  
  // 1. 시간대별 선호도 분석
  const timePreference = analyzeTimePreference(recent);
  if (timePreference) {
    saveLearning(timePreference);
  }
  
  // 2. 톤 선호도 분석
  const tonePreference = analyzeTonePreference(recent);
  if (tonePreference) {
    saveLearning(tonePreference);
  }
  
  // 3. 부정적 피드백 패턴 분석
  const negativePattern = analyzeNegativePatterns(recent);
  if (negativePattern) {
    saveLearning(negativePattern);
  }
};

// 시간대별 선호도 분석
const analyzeTimePreference = (feedbacks) => {
  const morningFeedbacks = feedbacks.filter(f => f.context.hour >= 6 && f.context.hour < 12);
  const afternoonFeedbacks = feedbacks.filter(f => f.context.hour >= 12 && f.context.hour < 18);
  const eveningFeedbacks = feedbacks.filter(f => f.context.hour >= 18 || f.context.hour < 6);
  
  const getPositiveRate = (fbs) => {
    if (fbs.length < 3) return null;
    return fbs.filter(f => f.feedbackType === 'positive').length / fbs.length;
  };
  
  const morningRate = getPositiveRate(morningFeedbacks);
  const afternoonRate = getPositiveRate(afternoonFeedbacks);
  const eveningRate = getPositiveRate(eveningFeedbacks);
  
  // 뚜렷한 차이가 있을 때만 학습
  if (morningRate !== null && afternoonRate !== null) {
    if (morningRate > 0.7 && afternoonRate < 0.5) {
      return {
        category: 'time',
        content: '오전에 대화할 때 더 잘 맞는 것 같아요',
        confidence: 40
      };
    }
    if (afternoonRate > 0.7 && morningRate < 0.5) {
      return {
        category: 'time',
        content: '오후에 대화할 때 더 잘 맞는 것 같아요',
        confidence: 40
      };
    }
  }
  
  return null;
};

// 톤 선호도 분석 (메시지 길이, 이모지 사용 등)
const analyzeTonePreference = (feedbacks) => {
  const positives = feedbacks.filter(f => f.feedbackType === 'positive');
  const negatives = feedbacks.filter(f => f.feedbackType === 'negative');
  
  if (positives.length < 3 || negatives.length < 2) return null;
  
  // 긍정 피드백 메시지의 평균 길이
  const avgPositiveLen = positives.reduce((sum, f) => sum + f.messageText.length, 0) / positives.length;
  const avgNegativeLen = negatives.reduce((sum, f) => sum + f.messageText.length, 0) / negatives.length;
  
  if (avgPositiveLen < 50 && avgNegativeLen > 100) {
    return {
      category: 'style',
      content: '짧고 간결한 답변을 선호해요',
      confidence: 35
    };
  }
  
  if (avgPositiveLen > 100 && avgNegativeLen < 50) {
    return {
      category: 'style',
      content: '자세하고 상세한 답변을 선호해요',
      confidence: 35
    };
  }
  
  return null;
};

// 부정적 피드백 패턴 분석
const analyzeNegativePatterns = (feedbacks) => {
  const negatives = feedbacks.filter(f => f.feedbackType === 'negative');
  
  if (negatives.length < 3) return null;
  
  // 에너지 낮을 때 부정 피드백이 많으면
  const lowEnergyNegatives = negatives.filter(f => f.context.energy && f.context.energy < 40);
  if (lowEnergyNegatives.length >= 2) {
    return {
      category: 'energy',
      content: '에너지 낮을 때는 더 조심스럽게 다가가야 해요',
      confidence: 45
    };
  }
  
  return null;
};

// 대화에서 직접 가르치기 키워드 감지
export const detectTeachingIntent = (message) => {
  const teachingPatterns = [
    { pattern: /내가?\s*좋아하는?\s*건?\s*(.+)/i, category: 'preference', extract: 1 },
    { pattern: /난?\s*(.+)\s*(?:좋아|선호|원해)/i, category: 'preference', extract: 1 },
    { pattern: /(.+)\s*(?:싫어|안\s*좋아|별로)/i, category: 'dislike', extract: 1 },
    { pattern: /(?:나는?|난)\s*(.+)\s*스타일이야/i, category: 'style', extract: 1 },
    { pattern: /기억해\s*(?:둬|줘)[,.]\s*(.+)/i, category: 'memory', extract: 1 },
    { pattern: /(.+)\s*기억해/i, category: 'memory', extract: 1 },
    { pattern: /(?:아침|오전)에?\s*(.+)/i, category: 'time', extract: 0 },
    { pattern: /(?:저녁|밤)에?\s*(.+)/i, category: 'time', extract: 0 },
  ];
  
  for (const { pattern, category, extract } of teachingPatterns) {
    const match = message.match(pattern);
    if (match) {
      return {
        detected: true,
        category,
        content: match[extract] || match[0],
        fullMatch: match[0]
      };
    }
  }
  
  return { detected: false };
};

// 학습 통계
export const getLearningStats = () => {
  const learnings = getLearnings();
  const feedbacks = getFeedbacks();
  
  const positiveCount = feedbacks.filter(f => f.feedbackType === 'positive').length;
  const negativeCount = feedbacks.filter(f => f.feedbackType === 'negative').length;
  
  return {
    totalLearnings: learnings.length,
    autoLearnings: learnings.filter(l => l.source === 'feedback' || l.source === 'calendar').length,
    directLearnings: learnings.filter(l => l.source === 'direct' || l.source === 'chat').length,
    totalFeedbacks: feedbacks.length,
    positiveRate: feedbacks.length > 0 ? (positiveCount / feedbacks.length * 100).toFixed(1) : 0,
    avgConfidence: learnings.length > 0 
      ? Math.round(learnings.reduce((sum, l) => sum + l.confidence, 0) / learnings.length)
      : 0
  };
};

// 이해도 점수 계산
export const calculateUnderstandingScore = () => {
  const learnings = getLearnings();
  const feedbacks = getFeedbacks();
  const stats = getLearningStats();
  
  let score = 20; // 기본 점수
  
  // 학습 개수 (최대 +30)
  score += Math.min(learnings.length * 5, 30);
  
  // 평균 신뢰도 반영 (최대 +20)
  if (learnings.length > 0) {
    score += Math.round(stats.avgConfidence * 0.2);
  }
  
  // 피드백 참여도 (최대 +15)
  score += Math.min(feedbacks.length * 1.5, 15);
  
  // 긍정 피드백 비율 (최대 +15)
  if (feedbacks.length >= 5) {
    score += Math.round(parseFloat(stats.positiveRate) * 0.15);
  }
  
  return Math.min(100, Math.round(score));
};

export default {
  saveFeedback,
  getFeedbacks,
  getLearnings,
  saveLearning,
  deleteLearning,
  updateLearning,
  detectTeachingIntent,
  getLearningStats,
  calculateUnderstandingScore
};
