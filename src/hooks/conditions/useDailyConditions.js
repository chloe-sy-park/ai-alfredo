import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  CONDITION_LEVELS,
  LEVEL_LABELS,
  DAY_NAMES,
  SYNC_QUEUE_KEY,
  TEST_USER_ID,
  getDateKey,
  getTimeOfDay,
  loadConditions,
  saveConditions,
  getSyncQueue,
  addToSyncQueue,
  clearSyncQueue
} from './conditionUtils';

// 🎯 메인 훅 (Supabase Direct Mode)
export var useDailyConditions = function(options) {
  var opts = options || {};
  var useDb = opts.useDb !== false;
  
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
  
  // DB에서 데이터 로드
  useEffect(function() {
    if (!useDb || syncedRef.current) return;
    
    var fetchFromDb = async function() {
      setIsLoading(true);
      try {
        var endDate = new Date();
        var startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        
        var { data, error: dbError } = await supabase
          .from('daily_conditions')
          .select('*')
          .eq('user_id', TEST_USER_ID)
          .gte('log_date', getDateKey(startDate))
          .lte('log_date', getDateKey(endDate))
          .order('log_date', { ascending: false })
          .limit(100);
        
        if (dbError) {
          console.error('DB fetch error:', dbError);
          setError(dbError.message);
          return;
        }
        
        if (data && data.length > 0) {
          var dbData = {};
          data.forEach(function(item) {
            var date = new Date(item.log_date);
            var avgLevel = Math.round(
              ((item.energy_level || 3) + (item.mood_level || 3) + (item.focus_level || 3)) / 3
            );
            
            dbData[item.log_date] = {
              date: item.log_date,
              dayOfWeek: date.getDay(),
              mainLevel: avgLevel,
              energy_level: item.energy_level,
              mood_level: item.mood_level,
              focus_level: item.focus_level,
              factors: item.factors || [],
              note: item.note,
              records: [{
                time: item.created_at,
                timeOfDay: getTimeOfDay(new Date(item.created_at)),
                level: avgLevel,
                energy: item.energy_level,
                mood: item.mood_level,
                focus: item.focus_level,
                note: item.note || ''
              }],
              dbId: item.id
            };
          });
          
          var merged = Object.assign({}, conditions, dbData);
          setConditions(merged);
          saveConditions(merged);
          syncedRef.current = true;
        }
      } catch (e) {
        console.error('DB fetch failed:', e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFromDb();
  }, [useDb]);
  
  // 컨디션 기록
  var recordCondition = useCallback(async function(levelOrData, note) {
    var now = new Date();
    var dateKey = getDateKey(now);
    var timeOfDay = getTimeOfDay(now);
    
    var energy_level, mood_level, focus_level;
    var noteText = note;
    
    if (typeof levelOrData === 'object') {
      energy_level = levelOrData.energy_level || 3;
      mood_level = levelOrData.mood_level || 3;
      focus_level = levelOrData.focus_level || 3;
      noteText = levelOrData.note || note;
    } else {
      energy_level = levelOrData;
      mood_level = levelOrData;
      focus_level = levelOrData;
    }
    
    var avgLevel = Math.round((energy_level + mood_level + focus_level) / 3);
    
    var localRecord = {
      time: now.toISOString(),
      timeOfDay: timeOfDay,
      level: avgLevel,
      energy: energy_level,
      mood: mood_level,
      focus: focus_level,
      note: noteText || ''
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
      updated[dateKey].mainLevel = avgLevel;
      updated[dateKey].energy_level = energy_level;
      updated[dateKey].mood_level = mood_level;
      updated[dateKey].focus_level = focus_level;
      
      saveConditions(updated);
      return updated;
    });
    
    if (useDb) {
      try {
        var { data: existing } = await supabase
          .from('daily_conditions')
          .select('id')
          .eq('user_id', TEST_USER_ID)
          .eq('log_date', dateKey)
          .single();
        
        var result;
        
        if (existing) {
          result = await supabase
            .from('daily_conditions')
            .update({
              energy_level: energy_level,
              mood_level: mood_level,
              focus_level: focus_level,
              note: noteText || null,
              updated_at: now.toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single();
        } else {
          result = await supabase
            .from('daily_conditions')
            .insert({
              user_id: TEST_USER_ID,
              log_date: dateKey,
              energy_level: energy_level,
              mood_level: mood_level,
              focus_level: focus_level,
              note: noteText || null
            })
            .select()
            .single();
        }
        
        if (result.error) {
          console.error('DB save error:', result.error);
          addToSyncQueue({
            action: 'record',
            data: { user_id: TEST_USER_ID, log_date: dateKey, energy_level, mood_level, focus_level, note: noteText }
          });
        } else if (result.data) {
          setConditions(function(prev) {
            var updated = Object.assign({}, prev);
            if (updated[dateKey]) {
              updated[dateKey].dbId = result.data.id;
            }
            saveConditions(updated);
            return updated;
          });
        }
      } catch (e) {
        console.error('DB save failed:', e);
        addToSyncQueue({
          action: 'record',
          data: { user_id: TEST_USER_ID, log_date: dateKey, energy_level, mood_level, focus_level, note: noteText }
        });
      }
    }
    
    return { dateKey: dateKey, level: avgLevel };
  }, [useDb]);
  
  var getTodayCondition = useCallback(function() {
    var dateKey = getDateKey();
    var todayData = conditions[dateKey];
    
    if (!todayData || !todayData.records || todayData.records.length === 0) {
      return null;
    }
    
    return {
      level: todayData.mainLevel,
      energy_level: todayData.energy_level,
      mood_level: todayData.mood_level,
      focus_level: todayData.focus_level,
      records: todayData.records,
      lastRecord: todayData.records[todayData.records.length - 1]
    };
  }, [conditions]);
  
  var getConditionByDate = useCallback(function(date) {
    var dateKey = getDateKey(date);
    return conditions[dateKey] || null;
  }, [conditions]);
  
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
        energy_level: data ? data.energy_level : null,
        mood_level: data ? data.mood_level : null,
        focus_level: data ? data.focus_level : null,
        hasRecord: !!data
      });
    }
    
    return result.reverse();
  }, [conditions]);
  
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
  
  var getOverallStats = useMemo(function() {
    var allLevels = [];
    var maxStreak = 0;
    var currentStreak = 0;
    
    var sortedDates = Object.keys(conditions).sort();
    
    sortedDates.forEach(function(dateKey) {
      var day = conditions[dateKey];
      if (day.mainLevel) {
        allLevels.push(day.mainLevel);
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });
    
    var checkDate = new Date();
    var streakCount = 0;
    
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
    allLevels.forEach(function(level) { distribution[level]++; });
    
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
  
  var getInsights = useMemo(function() {
    var insights = [];
    var stats = getOverallStats;
    var weekdayAvg = getWeekdayAverages;
    var timeAvg = getTimeOfDayAverages;
    
    if (stats.totalDays >= 7) {
      insights.push({ type: 'milestone', emoji: '🎯', text: stats.totalDays + '일째 컨디션 기록 중이에요!' });
    }
    
    if (stats.currentStreak >= 3) {
      insights.push({ type: 'streak', emoji: '🔥', text: stats.currentStreak + '일 연속 기록 중!' });
    }
    
    var bestDay = weekdayAvg.reduce(function(best, curr) {
      if (!best.average) return curr;
      if (!curr.average) return best;
      return curr.average > best.average ? curr : best;
    }, weekdayAvg[0]);
    
    if (bestDay.average && bestDay.count >= 2) {
      insights.push({ type: 'pattern', emoji: '📊', text: bestDay.day + '요일에 컨디션이 좋은 편이에요' });
    }
    
    return insights.slice(0, 3);
  }, [getOverallStats, getWeekdayAverages, getTimeOfDayAverages]);
  
  var processSyncQueue = useCallback(async function() {
    if (!useDb) return;
    
    var queue = getSyncQueue();
    if (queue.length === 0) return;
    
    var failed = [];
    
    for (var i = 0; i < queue.length; i++) {
      var item = queue[i];
      try {
        if (item.action === 'record') {
          var { error: dbError } = await supabase.from('daily_conditions').insert(item.data);
          if (dbError) failed.push(item);
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
  }, [useDb]);
  
  useEffect(function() {
    var handleOnline = function() { processSyncQueue(); };
    window.addEventListener('online', handleOnline);
    return function() { window.removeEventListener('online', handleOnline); };
  }, [processSyncQueue]);
  
  return {
    conditions: conditions,
    isLoading: isLoading,
    error: error,
    CONDITION_LEVELS: CONDITION_LEVELS,
    LEVEL_LABELS: LEVEL_LABELS,
    recordCondition: recordCondition,
    getTodayCondition: getTodayCondition,
    getConditionByDate: getConditionByDate,
    getRecentConditions: getRecentConditions,
    getMonthConditions: getMonthConditions,
    weekdayAverages: getWeekdayAverages,
    timeOfDayAverages: getTimeOfDayAverages,
    overallStats: getOverallStats,
    insights: getInsights,
    syncQueue: getSyncQueue(),
    processSyncQueue: processSyncQueue
  };
};

export default useDailyConditions;
