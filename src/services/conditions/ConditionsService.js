// 🗄️ Supabase Conditions Service
// daily_conditions 테이블과 연동
// localStorage와 서버 간 동기화

// Supabase 클라이언트 (환경변수에서 설정)
var SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
var SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 테이블 정의
var TABLE_NAME = 'daily_conditions';

// Supabase 클라이언트 생성
var createClient = function() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not configured. Using localStorage only.');
    return null;
  }
  
  // @supabase/supabase-js가 설치되어 있다고 가정
  try {
    var supabase = window.supabase;
    if (supabase && supabase.createClient) {
      return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch (e) {
    console.warn('Supabase client not available:', e);
  }
  
  return null;
};

var supabase = createClient();

// 📊 Conditions Service
var ConditionsService = {
  
  // 서비스 상태 확인
  isAvailable: function() {
    return !!supabase;
  },
  
  // 사용자 ID 가져오기 (로그인 상태에 따라)
  getUserId: function() {
    // 로컬 스토리지에서 사용자 ID 가져오기
    var userData = localStorage.getItem('alfredo_user');
    if (userData) {
      try {
        return JSON.parse(userData).id;
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  
  // 컨디션 기록 저장 (서버 + 로컬)
  saveCondition: async function(conditionData) {
    var userId = this.getUserId();
    
    // 로컬 먼저 저장 (오프라인 대응)
    this.saveToLocal(conditionData);
    
    // 서버 저장 (로그인된 경우)
    if (supabase && userId) {
      try {
        var serverData = {
          user_id: userId,
          date: conditionData.date,
          level: conditionData.level,
          time_of_day: conditionData.timeOfDay,
          note: conditionData.note || null,
          day_of_week: conditionData.dayOfWeek,
          recorded_at: new Date().toISOString()
        };
        
        var result = await supabase
          .from(TABLE_NAME)
          .upsert(serverData, { 
            onConflict: 'user_id,date',
            ignoreDuplicates: false 
          });
        
        if (result.error) {
          console.error('Server save error:', result.error);
          // 로컬에 pending 마크
          this.markAsPending(conditionData.date);
          return { success: false, error: result.error, savedLocally: true };
        }
        
        return { success: true, savedLocally: true, savedToServer: true };
      } catch (e) {
        console.error('Server save exception:', e);
        this.markAsPending(conditionData.date);
        return { success: false, error: e, savedLocally: true };
      }
    }
    
    return { success: true, savedLocally: true, savedToServer: false };
  },
  
  // 로컬 스토리지에 저장
  saveToLocal: function(conditionData) {
    try {
      var key = 'alfredo_daily_conditions';
      var stored = localStorage.getItem(key);
      var data = stored ? JSON.parse(stored) : {};
      
      if (!data[conditionData.date]) {
        data[conditionData.date] = {
          date: conditionData.date,
          dayOfWeek: conditionData.dayOfWeek,
          records: []
        };
      }
      
      data[conditionData.date].records.push({
        time: new Date().toISOString(),
        timeOfDay: conditionData.timeOfDay,
        level: conditionData.level,
        note: conditionData.note || ''
      });
      
      data[conditionData.date].mainLevel = conditionData.level;
      
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Local save error:', e);
      return false;
    }
  },
  
  // Pending 마크 (오프라인 저장 후 나중에 동기화용)
  markAsPending: function(date) {
    try {
      var pendingKey = 'alfredo_pending_sync';
      var pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
      if (!pending.includes(date)) {
        pending.push(date);
        localStorage.setItem(pendingKey, JSON.stringify(pending));
      }
    } catch (e) {
      console.error('Mark pending error:', e);
    }
  },
  
  // 서버에서 전체 데이터 가져오기
  fetchAllFromServer: async function() {
    var userId = this.getUserId();
    
    if (!supabase || !userId) {
      return { success: false, data: null };
    }
    
    try {
      var result = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (result.error) {
        console.error('Fetch error:', result.error);
        return { success: false, error: result.error };
      }
      
      return { success: true, data: result.data };
    } catch (e) {
      console.error('Fetch exception:', e);
      return { success: false, error: e };
    }
  },
  
  // 특정 기간 데이터 가져오기
  fetchByDateRange: async function(startDate, endDate) {
    var userId = this.getUserId();
    
    if (!supabase || !userId) {
      return { success: false, data: null };
    }
    
    try {
      var result = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return { success: true, data: result.data };
    } catch (e) {
      return { success: false, error: e };
    }
  },
  
  // 로컬 → 서버 동기화
  syncToServer: async function() {
    var userId = this.getUserId();
    
    if (!supabase || !userId) {
      return { success: false, reason: 'Not available' };
    }
    
    try {
      // Pending 목록 확인
      var pendingKey = 'alfredo_pending_sync';
      var pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
      
      if (pending.length === 0) {
        return { success: true, synced: 0 };
      }
      
      // 로컬 데이터 가져오기
      var localData = JSON.parse(localStorage.getItem('alfredo_daily_conditions') || '{}');
      
      var toSync = [];
      pending.forEach(function(date) {
        if (localData[date]) {
          toSync.push({
            user_id: userId,
            date: date,
            level: localData[date].mainLevel,
            day_of_week: localData[date].dayOfWeek,
            recorded_at: localData[date].records[0]?.time || new Date().toISOString()
          });
        }
      });
      
      if (toSync.length > 0) {
        var result = await supabase
          .from(TABLE_NAME)
          .upsert(toSync, { onConflict: 'user_id,date' });
        
        if (result.error) {
          return { success: false, error: result.error };
        }
        
        // Pending 클리어
        localStorage.setItem(pendingKey, '[]');
      }
      
      return { success: true, synced: toSync.length };
    } catch (e) {
      return { success: false, error: e };
    }
  },
  
  // 서버 → 로컬 동기화
  syncFromServer: async function() {
    var result = await this.fetchAllFromServer();
    
    if (!result.success || !result.data) {
      return { success: false };
    }
    
    try {
      var localData = JSON.parse(localStorage.getItem('alfredo_daily_conditions') || '{}');
      
      result.data.forEach(function(item) {
        // 서버 데이터가 더 최신이면 업데이트
        if (!localData[item.date] || 
            new Date(item.recorded_at) > new Date(localData[item.date].records?.[0]?.time || 0)) {
          localData[item.date] = {
            date: item.date,
            dayOfWeek: item.day_of_week,
            mainLevel: item.level,
            records: [{
              time: item.recorded_at,
              timeOfDay: item.time_of_day,
              level: item.level,
              note: item.note || ''
            }]
          };
        }
      });
      
      localStorage.setItem('alfredo_daily_conditions', JSON.stringify(localData));
      
      return { success: true, synced: result.data.length };
    } catch (e) {
      return { success: false, error: e };
    }
  },
  
  // 양방향 동기화
  fullSync: async function() {
    // 먼저 로컬 → 서버
    var toServer = await this.syncToServer();
    
    // 그 다음 서버 → 로컬
    var fromServer = await this.syncFromServer();
    
    return {
      success: toServer.success && fromServer.success,
      toServer: toServer,
      fromServer: fromServer
    };
  },
  
  // 통계 집계 쿼리 (서버에서 직접)
  getServerStats: async function() {
    var userId = this.getUserId();
    
    if (!supabase || !userId) {
      return { success: false };
    }
    
    try {
      // 전체 기록 수
      var countResult = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      // 평균 레벨
      var avgResult = await supabase
        .from(TABLE_NAME)
        .select('level')
        .eq('user_id', userId);
      
      var total = countResult.count || 0;
      var avg = 0;
      
      if (avgResult.data && avgResult.data.length > 0) {
        var sum = avgResult.data.reduce(function(acc, item) {
          return acc + item.level;
        }, 0);
        avg = sum / avgResult.data.length;
      }
      
      return {
        success: true,
        stats: {
          totalDays: total,
          averageLevel: Math.round(avg * 10) / 10
        }
      };
    } catch (e) {
      return { success: false, error: e };
    }
  },
  
  // 데이터 삭제 (특정 날짜)
  deleteCondition: async function(date) {
    var userId = this.getUserId();
    
    // 로컬 삭제
    try {
      var localData = JSON.parse(localStorage.getItem('alfredo_daily_conditions') || '{}');
      delete localData[date];
      localStorage.setItem('alfredo_daily_conditions', JSON.stringify(localData));
    } catch (e) {
      console.error('Local delete error:', e);
    }
    
    // 서버 삭제
    if (supabase && userId) {
      try {
        await supabase
          .from(TABLE_NAME)
          .delete()
          .eq('user_id', userId)
          .eq('date', date);
      } catch (e) {
        console.error('Server delete error:', e);
      }
    }
    
    return { success: true };
  },
  
  // 전체 데이터 삭제 (계정 삭제용)
  deleteAllUserData: async function() {
    var userId = this.getUserId();
    
    // 로컬 삭제
    localStorage.removeItem('alfredo_daily_conditions');
    localStorage.removeItem('alfredo_pending_sync');
    
    // 서버 삭제
    if (supabase && userId) {
      try {
        await supabase
          .from(TABLE_NAME)
          .delete()
          .eq('user_id', userId);
      } catch (e) {
        console.error('Server delete all error:', e);
      }
    }
    
    return { success: true };
  }
};

export default ConditionsService;

// SQL 스키마 (참고용)
/*
-- daily_conditions 테이블 생성
CREATE TABLE daily_conditions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
  time_of_day TEXT,
  note TEXT,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- 인덱스
CREATE INDEX idx_daily_conditions_user_date ON daily_conditions(user_id, date);
CREATE INDEX idx_daily_conditions_user_level ON daily_conditions(user_id, level);

-- RLS 정책
ALTER TABLE daily_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conditions" ON daily_conditions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conditions" ON daily_conditions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conditions" ON daily_conditions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conditions" ON daily_conditions
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_conditions_updated_at
  BEFORE UPDATE ON daily_conditions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
*/
