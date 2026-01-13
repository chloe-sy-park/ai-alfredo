import { useState, useCallback, useMemo } from 'react';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

/**
 * ⏱️ useTimeEstimator - 시간 추정 코치 훅
 * ADHD Time Blindness 지원
 */

var STORAGE_KEY = 'alfredo_time_estimator';

var getDefaultData = function() {
  return {
    entries: [],
    categoryStats: {},
    lastUpdated: null
  };
};

export function useTimeEstimator() {
  var dataState = useState(function() {
    var saved = loadFromStorage(STORAGE_KEY);
    return saved || getDefaultData();
  });
  var data = dataState[0];
  var setData = dataState[1];
  
  var timerState = useState(null);
  var activeTimer = timerState[0];
  var setActiveTimer = timerState[1];
  
  var lastResultState = useState(null);
  var lastResult = lastResultState[0];
  var setLastResult = lastResultState[1];
  
  var saveData = useCallback(function(newData) {
    var updated = Object.assign({}, newData, { lastUpdated: new Date().toISOString() });
    saveToStorage(STORAGE_KEY, updated);
    setData(updated);
  }, []);
  
  var startTimer = useCallback(function(taskId, estimatedMinutes, taskName, category) {
    setActiveTimer({
      taskId: taskId,
      taskName: taskName || 'Task',
      category: category || 'general',
      estimated: estimatedMinutes,
      startTime: Date.now()
    });
  }, []);
  
  var stopTimer = useCallback(function(taskId, category) {
    if (!activeTimer || activeTimer.taskId !== taskId) {
      return null;
    }
    
    var endTime = Date.now();
    var actualMinutes = Math.round((endTime - activeTimer.startTime) / 60000);
    if (actualMinutes < 1) actualMinutes = 1;
    
    var entry = {
      taskId: taskId,
      taskName: activeTimer.taskName,
      category: category || activeTimer.category || 'general',
      estimated: activeTimer.estimated,
      actual: actualMinutes,
      date: new Date().toISOString()
    };
    
    var newEntries = data.entries.concat([entry]);
    var catStats = Object.assign({}, data.categoryStats);
    var cat = entry.category;
    if (!catStats[cat]) {
      catStats[cat] = { totalEstimated: 0, totalActual: 0, count: 0 };
    }
    catStats[cat].totalEstimated += entry.estimated;
    catStats[cat].totalActual += entry.actual;
    catStats[cat].count += 1;
    
    saveData({ entries: newEntries, categoryStats: catStats });
    
    var result = {
      taskName: entry.taskName,
      estimated: entry.estimated,
      actual: entry.actual,
      diff: entry.actual - entry.estimated,
      ratio: entry.estimated > 0 ? entry.actual / entry.estimated : 1
    };
    setLastResult(result);
    setActiveTimer(null);
    
    return result;
  }, [activeTimer, data, saveData]);
  
  var getCorrectionFactor = useCallback(function(category) {
    var stats = data.categoryStats[category || 'general'];
    if (!stats || stats.count < 2) return 1.0;
    return stats.totalActual / stats.totalEstimated;
  }, [data.categoryStats]);
  
  var getSuggestedTime = useCallback(function(category, baseEstimate) {
    var factor = getCorrectionFactor(category);
    var stats = data.categoryStats[category || 'general'];
    
    if (!stats || stats.count < 2) {
      return {
        suggested: baseEstimate || 30,
        factor: 1.0,
        confidence: 'low',
        message: '아직 데이터를 수집 중이에요'
      };
    }
    
    var suggested = baseEstimate ? Math.round(baseEstimate * factor) : Math.round(stats.totalActual / stats.count);
    var confidence = stats.count >= 5 ? 'high' : 'medium';
    
    var message = '';
    if (factor > 1.3) {
      message = '이 유형은 예상보다 ' + Math.round((factor - 1) * 100) + '% 더 걸려요';
    } else if (factor < 0.8) {
      message = '이 유형은 예상보다 빨리 끝나는 편이에요';
    } else {
      message = '예상 시간이 정확한 편이에요!';
    }
    
    return { suggested: suggested, factor: factor, confidence: confidence, message: message, sampleCount: stats.count };
  }, [data.categoryStats, getCorrectionFactor]);
  
  var getInsight = useCallback(function() {
    var entries = data.entries;
    if (entries.length < 3) return null;
    
    var recent = entries.slice(-7);
    var overCount = recent.filter(function(e) { return e.actual > e.estimated * 1.2; }).length;
    var underCount = recent.filter(function(e) { return e.actual < e.estimated * 0.8; }).length;
    
    var categories = Object.keys(data.categoryStats);
    var worstCategory = null;
    var worstFactor = 1;
    
    categories.forEach(function(cat) {
      var stats = data.categoryStats[cat];
      if (stats.count >= 2) {
        var factor = stats.totalActual / stats.totalEstimated;
        if (factor > worstFactor) {
          worstFactor = factor;
          worstCategory = cat;
        }
      }
    });
    
    if (overCount >= Math.ceil(recent.length * 0.7)) {
      return {
        type: 'warning',
        emoji: '⏰',
        message: '시간 예측이 낙관적인 편이에요',
        suggestion: '예상 시간에 30% 정도 여유를 두는 걸 추천해요',
        category: 'time_optimism'
      };
    }
    
    if (worstCategory && worstFactor > 1.3) {
      var categoryLabel = { meeting: '회의', coding: '코딩', writing: '글쓰기', design: '디자인', admin: '행정', general: '일반' }[worstCategory] || worstCategory;
      return {
        type: 'info',
        emoji: '💡',
        message: categoryLabel + ' 업무는 예상보다 ' + Math.round((worstFactor - 1) * 100) + '% 더 걸려요',
        suggestion: '다음엔 ' + categoryLabel + ' 예상 시간을 늘려보세요',
        category: 'category_insight'
      };
    }
    
    if (underCount >= Math.ceil(recent.length * 0.5)) {
      return { type: 'success', emoji: '🚀', message: '예상보다 빠르게 완료하고 있어요!', suggestion: '좋은 페이스를 유지하세요', category: 'good_pace' };
    }
    
    return { type: 'success', emoji: '✨', message: '시간 예측이 정확해지고 있어요', suggestion: entries.length + '개의 기록으로 학습 중이에요', category: 'learning' };
  }, [data]);
  
  var clearLastResult = useCallback(function() { setLastResult(null); }, []);
  
  return {
    data: data,
    activeTimer: activeTimer,
    lastResult: lastResult,
    startTimer: startTimer,
    stopTimer: stopTimer,
    clearLastResult: clearLastResult,
    getCorrectionFactor: getCorrectionFactor,
    getSuggestedTime: getSuggestedTime,
    getInsight: getInsight
  };
}

export default useTimeEstimator;
