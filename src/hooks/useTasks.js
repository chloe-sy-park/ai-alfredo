import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 📋 Tasks Hook (Supabase Direct Mode)
// - Supabase 클라이언트 직접 사용
// - localStorage 백업
// - 태스크 CRUD + 완료/미루기

// 테스트용 사용자 ID
var TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// localStorage 키
var STORAGE_KEY = 'alfredo_tasks';

// localStorage 데이터 로드
var loadTasksData = function() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load tasks:', e);
    return [];
  }
};

// localStorage 데이터 저장
var saveTasksData = function(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
};

// 날짜 키 생성
var getDateKey = function(date) {
  var d = date || new Date();
  var year = d.getFullYear();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
};

export function useTasks(options) {
  var opts = options || {};
  var autoFetch = opts.autoFetch !== false;
  var statusFilter = opts.status;
  var categoryFilter = opts.category;
  var isTopThreeFilter = opts.isTopThree;
  
  var tasksState = useState(function() {
    return loadTasksData();
  });
  var tasks = tasksState[0];
  var setTasks = tasksState[1];
  
  var loadingState = useState(false);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];
  
  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];
  
  var metaState = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  });
  var meta = metaState[0];
  var setMeta = metaState[1];

  // 태스크 목록 조회
  var fetchTasks = useCallback(async function() {
    setIsLoading(true);
    setError(null);

    try {
      var query = supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .eq('user_id', TEST_USER_ID)
        .order('created_at', { ascending: false });

      // 필터 적용
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }
      if (isTopThreeFilter !== undefined) {
        query = query.eq('is_top_three', isTopThreeFilter);
      }

      var { data, error: dbError, count } = await query.limit(50);

      if (dbError) {
        console.error('Tasks fetch error:', dbError);
        setError(dbError.message);
        return;
      }

      setTasks(data || []);
      saveTasksData(data || []);
      setMeta(function(prev) {
        return Object.assign({}, prev, {
          total: count || 0,
          hasMore: (count || 0) > 50
        });
      });
    } catch (e) {
      console.error('Tasks fetch failed:', e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, categoryFilter, isTopThreeFilter]);

  // 태스크 생성
  var createTask = useCallback(async function(data) {
    try {
      var taskData = Object.assign({
        user_id: TEST_USER_ID,
        status: 'todo',
        is_top_three: false,
        is_starred: false,
        defer_count: 0
      }, data);

      var { data: newTask, error: dbError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (dbError) {
        console.error('Task create error:', dbError);
        setError(dbError.message);
        return null;
      }

      setTasks(function(prev) {
        var updated = [newTask].concat(prev);
        saveTasksData(updated);
        return updated;
      });

      console.log('✅ 태스크 생성:', newTask.title);
      return newTask;
    } catch (e) {
      console.error('Task create failed:', e);
      setError(e.message);
      return null;
    }
  }, []);

  // 태스크 수정
  var updateTask = useCallback(async function(id, data) {
    try {
      var { data: updatedTask, error: dbError } = await supabase
        .from('tasks')
        .update(Object.assign({}, data, { updated_at: new Date().toISOString() }))
        .eq('id', id)
        .eq('user_id', TEST_USER_ID)
        .select()
        .single();

      if (dbError) {
        console.error('Task update error:', dbError);
        setError(dbError.message);
        return null;
      }

      setTasks(function(prev) {
        var updated = prev.map(function(t) {
          return t.id === id ? updatedTask : t;
        });
        saveTasksData(updated);
        return updated;
      });

      console.log('✅ 태스크 수정:', updatedTask.title);
      return updatedTask;
    } catch (e) {
      console.error('Task update failed:', e);
      setError(e.message);
      return null;
    }
  }, []);

  // 태스크 삭제
  var deleteTask = useCallback(async function(id) {
    try {
      var { error: dbError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', TEST_USER_ID);

      if (dbError) {
        console.error('Task delete error:', dbError);
        setError(dbError.message);
        return false;
      }

      setTasks(function(prev) {
        var updated = prev.filter(function(t) { return t.id !== id; });
        saveTasksData(updated);
        return updated;
      });

      console.log('✅ 태스크 삭제');
      return true;
    } catch (e) {
      console.error('Task delete failed:', e);
      setError(e.message);
      return false;
    }
  }, []);

  // 태스크 완료
  var completeTask = useCallback(async function(id) {
    try {
      var now = new Date().toISOString();
      
      var { data: completedTask, error: dbError } = await supabase
        .from('tasks')
        .update({
          status: 'done',
          completed_at: now,
          updated_at: now
        })
        .eq('id', id)
        .eq('user_id', TEST_USER_ID)
        .select()
        .single();

      if (dbError) {
        console.error('Task complete error:', dbError);
        setError(dbError.message);
        return null;
      }

      // XP 보상 (is_starred와 is_top_three 기반)
      var xpReward = 10;
      if (completedTask.is_starred) xpReward = 20;
      if (completedTask.is_top_three) xpReward += 5;

      // 펭귄 XP 업데이트
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

        // XP 히스토리 기록
        await supabase
          .from('xp_history')
          .insert({
            user_id: TEST_USER_ID,
            amount: xpReward,
            source: 'task_complete',
            description: '태스크 완료: ' + completedTask.title
          });
      }

      setTasks(function(prev) {
        var updated = prev.map(function(t) {
          return t.id === id ? completedTask : t;
        });
        saveTasksData(updated);
        return updated;
      });

      console.log('✅ 태스크 완료 +' + xpReward + 'XP:', completedTask.title);
      return { task: completedTask, rewards: { xp: xpReward } };
    } catch (e) {
      console.error('Task complete failed:', e);
      setError(e.message);
      return null;
    }
  }, []);

  // 태스크 미루기
  var deferTask = useCallback(async function(id) {
    try {
      // 현재 태스크 정보 조회
      var { data: currentTask } = await supabase
        .from('tasks')
        .select('defer_count, due_date')
        .eq('id', id)
        .single();

      var newDeferCount = (currentTask?.defer_count || 0) + 1;
      
      // 내일로 미루기
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      var newDueDate = getDateKey(tomorrow);

      var { data: deferredTask, error: dbError } = await supabase
        .from('tasks')
        .update({
          status: 'deferred',
          defer_count: newDeferCount,
          due_date: newDueDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', TEST_USER_ID)
        .select()
        .single();

      if (dbError) {
        console.error('Task defer error:', dbError);
        setError(dbError.message);
        return null;
      }

      setTasks(function(prev) {
        var updated = prev.map(function(t) {
          return t.id === id ? deferredTask : t;
        });
        saveTasksData(updated);
        return updated;
      });

      console.log('✅ 태스크 미루기 (' + newDeferCount + '번째):', deferredTask.title);
      return deferredTask;
    } catch (e) {
      console.error('Task defer failed:', e);
      setError(e.message);
      return null;
    }
  }, []);

  // 오늘 태스크 가져오기
  var getTodayTasks = useCallback(function() {
    var today = getDateKey();
    return tasks.filter(function(t) {
      return t.due_date === today && t.status !== 'done';
    });
  }, [tasks]);

  // Top3 태스크 가져오기
  var getTopThreeTasks = useCallback(function() {
    return tasks.filter(function(t) {
      return t.is_top_three && t.status !== 'done';
    }).slice(0, 3);
  }, [tasks]);

  // Top3 설정/해제
  var setTopThree = useCallback(async function(id, isTopThree) {
    return updateTask(id, { is_top_three: isTopThree });
  }, [updateTask]);

  // 자동 fetch
  useEffect(function() {
    if (autoFetch) {
      fetchTasks();
    }
  }, [autoFetch, fetchTasks]);

  return {
    // 상태
    tasks: tasks,
    isLoading: isLoading,
    error: error,
    meta: meta,
    
    // 조회
    fetchTasks: fetchTasks,
    getTodayTasks: getTodayTasks,
    getTopThreeTasks: getTopThreeTasks,
    
    // CRUD
    createTask: createTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
    
    // 액션
    completeTask: completeTask,
    deferTask: deferTask,
    setTopThree: setTopThree
  };
}

export default useTasks;
