import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { dailyConditionsApi, DailyCondition } from '../lib/api';

// 📊 Daily Conditions Hook (Hybrid Mode)
// - API 우선 + localStorage 백업
// - 오프라인 지원
// - Year in Pixels 스타일 시각화 데이터 제공
// - 패턴 분석 (요일별, 시간대별)

// 컨디션 레벨 정의
var CONDITION_LEVELS = {
  1: { emoji: '😫', label: '힘들어요', color: '#ef4444' },   // red-500
  2: { emoji: '😔', label: '그저그래요', color: '#f97316' }, // orange-500
  3: { emoji: '😐', label: '보통이에요', color: '#6b7280' }, // gray-500
  4: { emoji: '🙂', label: '괜찮아요', color: '#22c55e' },   // green-500
  5: { emoji: '😊', label: '좋아요!', color: '#a855f7' }     // purple-500
};

// 무드 → 레벨 매핑
var MOOD_TO_LEVEL = {
  'bad': 1,
  'low': 2,
  'neutral': 3,
  'good': 4,
  'great': 5
};

var LEVEL_TO_MOOD = {
  1: 'bad',
  2: 'low',
  3: 'neutral',
  4: 'good',
  5: 'great'
};

// 요일 이름
var DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// localStorage 키
var STORAGE_KEY = 'alfredo_daily_conditions';
var SYNC_QUEUE_KEY = 'alfredo_conditions_sync_queue';

// 날짜 키 생성 (YYYY-MM-DD)
var getDateKey = function(date) {
  var d = date || new Date();
  var year = d.getFullYear();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
};

// 시간대 구분
var getTimeOfDay = function(date) {
  var hour = (date || new Date()).getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// localStorage 데이터 로드
var loadConditions = function() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load conditions:', e);
    return {};
  }
};

// localStorage 데이터 저장
var saveConditions = function(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save conditions:', e);
  }
};

// 동기화 큐 관리
var getSyncQueue = function() {
  try {
    var data = localStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

var addToSyncQueue = function(action) {
  var queue = getSyncQueue();
  queue.push(Object.assign({ timestamp: Date.now() }, action));
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
};

var clearSyncQueue = function() {
  localStorage.removeItem(SYNC_QUEUE_KEY);
};

// 🎯 메인 훅 (Hybrid Mode)
export var useDailyConditions = function(options) {
  var opts = options || {};
  var useApi = opts.useApi !== false; // 기본값: true
  
  var conditionsState = useState(function() {
    return loadConditions();
  });
  var conditions = conditionsState[0];
  var setConditions = conditionsState[1];
  
  var loadingState = useState(false);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];
  
  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];
  
  var syncedRef = useRef(false);
  
  // API에서 데이터 로드 (초기화 시)
  useEffect(function() {
    if (!useApi || syncedRef.current) return;
    
    var fetchFromApi = async function() {
      setIsLoading(true);
      try {
        // 최근 90일 데이터 가져오기
        var endDate = new Date();
        var startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        
        var response = await dailyConditionsApi.list({
          start_date: getDateKey(startDate),
          end_date: getDateKey(endDate),
          limit: '100'
        });
        
        if (response.success && response.data) {
          // API 데이터를 로컬 형식으로 변환
          var apiData = {};
          response.data.forEach(function(item) {
            var date = new Date(item.date);
            apiData[item.date] = {
              date: item.date,
              dayOfWeek: date.getDay(),
              mainLevel: item.energy_level,
              mood: item.mood,
              physical_state: item.physical_state,
              notes: item.notes,
              records: [{
                time: item.created_at,
                timeOfDay: getTimeOfDay(new Date(item.created_at)),
                level: item.energy_level,
                note: item.notes || ''
              }],
              apiId: item.id // API ID 저장
            };
          });
          
          // 로컬 데이터와 병합 (API 데이터 우선)
          var merged = Object.assign({}, conditions, apiData);
          setConditions(merged);
          saveConditions(merged);
          syncedRef.current = true;
        }
      } catch (e) {
        console.error('API fetch failed, using local data:', e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFromApi();
  }, [useApi]);
  
  // 컨디션 기록 (Hybrid)
  var recordCondition = useCallback(async function(level, note) {
    var now = new Date();
    var dateKey = getDateKey(now);
    var timeOfDay = getTimeOfDay(now);
    var mood = LEVEL_TO_MOOD[level] || 'neutral';
    
    // 로컬 저장 (즉시)
    var localRecord = {
      time: now.toISOString(),
      timeOfDay: timeOfDay,
      level: level,
      note: note || ''
    };
    
    setConditions(function(prev) {
      var updated = Object.assign({}, prev);
      
      if (!updated[dateKey]) {
        updated[dateKey] = {
          date: dateKey,
          dayOfWeek: now.getDay(),
          records: []
        };
      }
      
      updated[dateKey].records.push(localRecord);
      updated[dateKey].mainLevel = level;
      updated[dateKey].mood = mood;
      
      saveConditions(updated);
      return updated;
    });
    
    // API 저장 (비동기)
    if (useApi) {
      try {
        var response = await dailyConditionsApi.record({
          date: dateKey,
          energy_level: level,
          mood: mood,
          notes: note || undefined
        });
        
        if (response.success && response.data) {
          // API ID 업데이트
          setConditions(function(prev) {
            var updated = Object.assign({}, prev);
            if (updated[dateKey]) {
              updated[dateKey].apiId = response.data.id;
            }
            saveConditions(updated);
            return updated;
          });
        }
      } catch (e) {
        console.error('API save failed, queued for sync:', e);
        addToSyncQueue({
          action: 'record',
          data: { date: dateKey, energy_level: level, mood: mood, notes: note }
        });
      }
    }
    
    return { dateKey: dateKey, level: level };
  }, [useApi]);
  
  // 오늘 컨디션 가져오기
  var getTodayCondition = useCallback(function() {
    var dateKey = getDateKey();
    var todayData = conditions[dateKey];
    
    if (!todayData || !todayData.records || todayData.records.length === 0) {
      return null;
    }
    
    return {
      level: todayData.mainLevel,
      mood: todayData.mood,
      records: todayData.records,
      lastRecord: todayData.records[todayData.records.length - 1]
    };
  }, [conditions]);
  
  // 특정 날짜 컨디션 가져오기
  var getConditionByDate = useCallback(function(date) {
    var dateKey = getDateKey(date);
    return conditions[dateKey] || null;
  }, [conditions]);
  
  // 최근 N일 컨디션 가져오기
  var getRecentConditions = useCallback(function(days) {
    var n = days || 7;
    var result = [];
    var today = new Date();
    
    for (var i = 0; i < n; i++) {
      var date = new Date(today);
      date.setDate(date.getDate() - i);
      var dateKey = getDateKey(date);
      var data = conditions[dateKey];
      
      result.push({
        date: dateKey,
        dayOfWeek: date.getDay(),
        dayName: DAY_NAMES[date.getDay()],
        level: data ? data.mainLevel : null,
        mood: data ? data.mood : null,
        hasRecord: !!data
      });
    }
    
    return result.reverse();
  }, [conditions]);
  
  // 이번 달 컨디션 (Year in Pixels용)
  var getMonthConditions = useCallback(function(year, month) {
    var y = year || new Date().getFullYear();
    var m = month !== undefined ? month : new Date().getMonth();
    
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);
    var daysInMonth = lastDay.getDate();
    
    var result = [];
    
    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(y, m, d);
      var dateKey = getDateKey(date);
      var data = conditions[dateKey];
      
      result.push({
        day: d,
        date: dateKey,
        dayOfWeek: date.getDay(),
        level: data ? data.mainLevel : null,
        color: data && data.mainLevel ? CONDITION_LEVELS[data.mainLevel].color : '#e5e7eb'
      });
    }
    
    return {
      year: y,
      month: m,
      days: result,
      firstDayOfWeek: firstDay.getDay()
    };
  }, [conditions]);
  
  // 요일별 평균 컨디션
  var getWeekdayAverages = useMemo(function() {
    var totals = [0, 0, 0, 0, 0, 0, 0];
    var counts = [0, 0, 0, 0, 0, 0, 0];
    
    Object.values(conditions).forEach(function(day) {
      if (day.mainLevel && day.dayOfWeek !== undefined) {
        totals[day.dayOfWeek] += day.mainLevel;
        counts[day.dayOfWeek]++;
      }
    });
    
    return DAY_NAMES.map(function(name, i) {
      return {
        day: name,
        average: counts[i] > 0 ? Math.round(totals[i] / counts[i] * 10) / 10 : null,
        count: counts[i]
      };
    });
  }, [conditions]);
  
  // 시간대별 평균 컨디션
  var getTimeOfDayAverages = useMemo(function() {
    var stats = {
      morning: { total: 0, count: 0 },
      afternoon: { total: 0, count: 0 },
      evening: { total: 0, count: 0 },
      night: { total: 0, count: 0 }
    };
    
    Object.values(conditions).forEach(function(day) {
      if (day.records) {
        day.records.forEach(function(record) {
          if (record.level && record.timeOfDay) {
            stats[record.timeOfDay].total += record.level;
            stats[record.timeOfDay].count++;
          }
        });
      }
    });
    
    return {
      morning: stats.morning.count > 0 ? Math.round(stats.morning.total / stats.morning.count * 10) / 10 : null,
      afternoon: stats.afternoon.count > 0 ? Math.round(stats.afternoon.total / stats.afternoon.count * 10) / 10 : null,
      evening: stats.evening.count > 0 ? Math.round(stats.evening.total / stats.evening.count * 10) / 10 : null,
      night: stats.night.count > 0 ? Math.round(stats.night.total / stats.night.count * 10) / 10 : null
    };
  }, [conditions]);
  
  // 전체 통계
  var getOverallStats = useMemo(function() {
    var allLevels = [];
    var streakCount = 0;
    var maxStreak = 0;
    var currentStreak = 0;
    
    var sortedDates = Object.keys(conditions).sort();
    
    sortedDates.forEach(function(dateKey, index) {
      var day = conditions[dateKey];
      if (day.mainLevel) {
        allLevels.push(day.mainLevel);
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });
    
    var today = getDateKey();
    var checkDate = new Date();
    streakCount = 0;
    
    for (var i = 0; i < 365; i++) {
      var dateKey = getDateKey(checkDate);
      if (conditions[dateKey] && conditions[dateKey].mainLevel) {
        streakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    var sum = allLevels.reduce(function(a, b) { return a + b; }, 0);
    var avg = allLevels.length > 0 ? Math.round(sum / allLevels.length * 10) / 10 : null;
    
    var distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allLevels.forEach(function(level) {
      distribution[level]++;
    });
    
    return {
      totalDays: allLevels.length,
      averageLevel: avg,
      currentStreak: streakCount,
      maxStreak: maxStreak,
      distribution: distribution,
      mostCommonLevel: Object.keys(distribution).reduce(function(a, b) {
        return distribution[a] > distribution[b] ? a : b;
      }, '3')
    };
  }, [conditions]);
  
  // 인사이트 생성
  var getInsights = useMemo(function() {
    var insights = [];
    var stats = getOverallStats;
    var weekdayAvg = getWeekdayAverages;
    var timeAvg = getTimeOfDayAverages;
    
    if (stats.totalDays >= 7) {
      insights.push({
        type: 'milestone',
        emoji: '🎯',
        text: stats.totalDays + '일째 컨디션 기록 중이에요!'
      });
    }
    
    if (stats.currentStreak >= 3) {
      insights.push({
        type: 'streak',
        emoji: '🔥',
        text: stats.currentStreak + '일 연속 기록 중!'
      });
    }
    
    var bestDay = weekdayAvg.reduce(function(best, curr) {
      if (!best.average) return curr;
      if (!curr.average) return best;
      return curr.average > best.average ? curr : best;
    }, weekdayAvg[0]);
    
    var worstDay = weekdayAvg.reduce(function(worst, curr) {
      if (!worst.average) return curr;
      if (!curr.average) return worst;
      return curr.average < worst.average ? curr : worst;
    }, weekdayAvg[0]);
    
    if (bestDay.average && bestDay.count >= 2) {
      insights.push({
        type: 'pattern',
        emoji: '📊',
        text: bestDay.day + '요일에 컨디션이 좋은 편이에요'
      });
    }
    
    if (worstDay.average && worstDay.count >= 2 && bestDay.day !== worstDay.day) {
      insights.push({
        type: 'pattern',
        emoji: '💡',
        text: worstDay.day + '요일은 좀 힘드신 것 같아요'
      });
    }
    
    if (timeAvg.morning && timeAvg.afternoon) {
      if (timeAvg.morning > timeAvg.afternoon + 0.5) {
        insights.push({
          type: 'chronotype',
          emoji: '🌅',
          text: '오전에 컨디션이 더 좋으시네요'
        });
      } else if (timeAvg.afternoon > timeAvg.morning + 0.5) {
        insights.push({
          type: 'chronotype',
          emoji: '☀️',
          text: '오후에 컨디션이 더 좋으시네요'
        });
      }
    }
    
    return insights.slice(0, 3);
  }, [getOverallStats, getWeekdayAverages, getTimeOfDayAverages]);
  
  // 동기화 큐 처리
  var processSyncQueue = useCallback(async function() {
    if (!useApi) return;
    
    var queue = getSyncQueue();
    if (queue.length === 0) return;
    
    var failed = [];
    
    for (var i = 0; i < queue.length; i++) {
      var item = queue[i];
      try {
        if (item.action === 'record') {
          await dailyConditionsApi.record(item.data);
        }
      } catch (e) {
        failed.push(item);
      }
    }
    
    if (failed.length > 0) {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failed));
    } else {
      clearSyncQueue();
    }
  }, [useApi]);
  
  // 온라인 복구 시 동기화
  useEffect(function() {
    var handleOnline = function() {
      processSyncQueue();
    };
    
    window.addEventListener('online', handleOnline);
    return function() {
      window.removeEventListener('online', handleOnline);
    };
  }, [processSyncQueue]);
  
  return {
    // 상태
    conditions: conditions,
    isLoading: isLoading,
    error: error,
    CONDITION_LEVELS: CONDITION_LEVELS,
    
    // 기록 함수
    recordCondition: recordCondition,
    
    // 조회 함수
    getTodayCondition: getTodayCondition,
    getConditionByDate: getConditionByDate,
    getRecentConditions: getRecentConditions,
    getMonthConditions: getMonthConditions,
    
    // 분석 데이터
    weekdayAverages: getWeekdayAverages,
    timeOfDayAverages: getTimeOfDayAverages,
    overallStats: getOverallStats,
    insights: getInsights,
    
    // 동기화
    syncQueue: getSyncQueue(),
    processSyncQueue: processSyncQueue
  };
};

// 📅 Year in Pixels 컴포넌트용 데이터 훅
export var useYearInPixels = function(year) {
  var y = year || new Date().getFullYear();
  var dailyConditions = useDailyConditions();
  
  var yearData = useMemo(function() {
    var months = [];
    
    for (var m = 0; m < 12; m++) {
      months.push(dailyConditions.getMonthConditions(y, m));
    }
    
    return {
      year: y,
      months: months,
      stats: dailyConditions.overallStats
    };
  }, [y, dailyConditions.conditions]);
  
  return yearData;
};

export default useDailyConditions;
