import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 🔄 Habits Hook (Supabase Direct Mode)
// - Supabase 클라이언트 직접 사용
// - localStorage 백업
// - 스트릭 자동 계산

// 테스트용 사용자 ID
var TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// localStorage 키
var STORAGE_KEY = 'alfredo_habits';

// 날짜 키 생성
var getDateKey = function(date) {
  var d = date || new Date();
  var year = d.getFullYear();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
};

// localStorage 데이터 로드
var loadHabitsData = function() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load habits:', e);
    return [];
  }
};

// localStorage 데이터 저장
var saveHabitsData = function(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save habits:', e);
  }
};

export function useHabits(autoFetch) {
  var shouldAutoFetch = autoFetch !== false;
  
  var habitsState = useState(function() {
    return loadHabitsData();
  });
  var habits = habitsState[0];
  var setHabits = habitsState[1];
  
  var loadingState = useState(false);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];
  
  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];

  // 습관 목록 조회 (오늘 로그 포함)
  var fetchHabits = useCallback(async function() {
    setIsLoading(true);
    setError(null);

    try {
      var today = getDateKey();
      
      // 습관 목록 조회
      var { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (habitsError) {
        console.error('Habits fetch error:', habitsError);
        setError(habitsError.message);
        return;
      }

      // 오늘 로그 조회
      var { data: logsData } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('log_date', today);

      // 습관에 오늘 완료 여부 추가
      var habitsWithStatus = (habitsData || []).map(function(habit) {
        var todayLog = (logsData || []).find(function(log) {
          return log.habit_id === habit.id;
        });
        
        return Object.assign({}, habit, {
          completed_today: todayLog ? todayLog.completed : false,
          today_log: todayLog || null
        });
      });

      setHabits(habitsWithStatus);
      saveHabitsData(habitsWithStatus);
    } catch (e) {
      console.error('Habits fetch failed:', e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 습관 생성
  var createHabit = useCallback(async function(data) {
    try {
      var habitData = Object.assign({
        user_id: TEST_USER_ID,
        frequency: 'daily',
        is_active: true,
        current_streak: 0,
        longest_streak: 0,
        total_completions: 0
      }, data);

      var { data: newHabit, error: dbError } = await supabase
        .from('habits')
        .insert(habitData)
        .select()
        .single();

      if (dbError) {
        console.error('Habit create error:', dbError);
        setError(dbError.message);
        return null;
      }

      var habitWithStatus = Object.assign({}, newHabit, {
        completed_today: false,
        today_log: null
      });

      setHabits(function(prev) {
        var updated = prev.concat([habitWithStatus]);
        saveHabitsData(updated);
        return updated;
      });

      console.log('✅ 습관 생성:', newHabit.name);
      return newHabit;
    } catch (e) {
      console.error('Habit create failed:', e);
      setError(e.message);
      return null;
    }
  }, []);

  // 습관 수정
  var updateHabit = useCallback(async function(id, data) {
    try {
      var { data: updatedHabit, error: dbError } = await supabase
        .from('habits')
        .update(Object.assign({}, data, { updated_at: new Date().toISOString() }))
        .eq('id', id)
        .eq('user_id', TEST_USER_ID)
        .select()
        .single();

      if (dbError) {
        console.error('Habit update error:', dbError);
        setError(dbError.message);
        return null;
      }

      setHabits(function(prev) {
        var updated = prev.map(function(h) {
          if (h.id === id) {
            return Object.assign({}, updatedHabit, {
              completed_today: h.completed_today,
              today_log: h.today_log
            });
          }
          return h;
        });
        saveHabitsData(updated);
        return updated;
      });

      console.log('✅ 습관 수정:', updatedHabit.name);
      return updatedHabit;
    } catch (e) {
      console.error('Habit update failed:', e);
      setError(e.message);
      return null;
    }
  }, []);

  // 습관 삭제 (비활성화)
  var deleteHabit = useCallback(async function(id) {
    try {
      var { error: dbError } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', TEST_USER_ID);

      if (dbError) {
        console.error('Habit delete error:', dbError);
        setError(dbError.message);
        return false;
      }

      setHabits(function(prev) {
        var updated = prev.filter(function(h) { return h.id !== id; });
        saveHabitsData(updated);
        return updated;
      });

      console.log('✅ 습관 삭제');
      return true;
    } catch (e) {
      console.error('Habit delete failed:', e);
      setError(e.message);
      return false;
    }
  }, []);

  // 습관 로그 기록
  var logHabit = useCallback(async function(id, completed, notes) {
    var isCompleted = completed !== false;
    
    try {
      var today = getDateKey();
      
      // 이미 로그가 있는지 확인
      var { data: existingLog } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('habit_id', id)
        .eq('log_date', today)
        .single();

      var logData;
      
      if (existingLog) {
        // 업데이트
        var { data: updatedLog, error: updateError } = await supabase
          .from('habit_logs')
          .update({
            completed: isCompleted,
            notes: notes || null
          })
          .eq('id', existingLog.id)
          .select()
          .single();

        if (updateError) {
          setError(updateError.message);
          return null;
        }
        logData = updatedLog;
      } else {
        // 새로 생성
        var { data: newLog, error: insertError } = await supabase
          .from('habit_logs')
          .insert({
            user_id: TEST_USER_ID,
            habit_id: id,
            log_date: today,
            completed: isCompleted,
            notes: notes || null
          })
          .select()
          .single();

        if (insertError) {
          setError(insertError.message);
          return null;
        }
        logData = newLog;
      }

      // 스트릭 업데이트
      if (isCompleted) {
        var habit = habits.find(function(h) { return h.id === id; });
        if (habit) {
          var newStreak = habit.current_streak + 1;
          var newLongest = Math.max(habit.longest_streak, newStreak);
          var newTotal = habit.total_completions + 1;

          await supabase
            .from('habits')
            .update({
              current_streak: newStreak,
              longest_streak: newLongest,
              total_completions: newTotal
            })
            .eq('id', id);

          // XP 보상
          var xpReward = 5;
          if (newStreak >= 7) xpReward = 10;
          if (newStreak >= 30) xpReward = 15;

          var { data: penguin } = await supabase
            .from('penguin_status')
            .select('current_xp, total_xp')
            .eq('user_id', TEST_USER_ID)
            .single();

          if (penguin) {
            await supabase
              .from('penguin_status')
              .update({
                current_xp: penguin.current_xp + xpReward,
                total_xp: penguin.total_xp + xpReward
              })
              .eq('user_id', TEST_USER_ID);

            await supabase
              .from('xp_history')
              .insert({
                user_id: TEST_USER_ID,
                amount: xpReward,
                source: 'habit_complete',
                description: '습관 완료: ' + habit.name + ' (' + newStreak + '일 연속)'
              });
          }

          // 상태 업데이트
          setHabits(function(prev) {
            var updated = prev.map(function(h) {
              if (h.id === id) {
                return Object.assign({}, h, {
                  completed_today: true,
                  today_log: logData,
                  current_streak: newStreak,
                  longest_streak: newLongest,
                  total_completions: newTotal
                });
              }
              return h;
            });
            saveHabitsData(updated);
            return updated;
          });

          console.log('✅ 습관 완료 +' + xpReward + 'XP:', habit.name, '(' + newStreak + '일 연속)');
        }
      }

      return logData;
    } catch (e) {
      console.error('Habit log failed:', e);
      setError(e.message);
      return null;
    }
  }, [habits]);

  // 오늘 완료한 습관 수
  var completedToday = habits.filter(function(h) {
    return h.completed_today;
  }).length;

  // 오늘 완료율
  var completionRate = habits.length > 0 
    ? Math.round((completedToday / habits.length) * 100) 
    : 0;

  // 자동 fetch
  useEffect(function() {
    if (shouldAutoFetch) {
      fetchHabits();
    }
  }, [shouldAutoFetch, fetchHabits]);

  return {
    // 상태
    habits: habits,
    isLoading: isLoading,
    error: error,
    
    // 통계
    completedToday: completedToday,
    completionRate: completionRate,
    
    // 조회
    fetchHabits: fetchHabits,
    
    // CRUD
    createHabit: createHabit,
    updateHabit: updateHabit,
    deleteHabit: deleteHabit,
    
    // 액션
    logHabit: logHabit
  };
}

export default useHabits;
