// 🗄️ Conditions Service
// localStorage 기반 컨디션 기록 (Supabase 직접 호출 제거)

// LocalStorage 키
var STORAGE_KEY = 'alfredo_daily_conditions';
var PENDING_KEY = 'alfredo_pending_sync';

// 📊 Conditions Service
var ConditionsService = {

  // 서비스 상태 확인 - 항상 사용 가능 (localStorage 기반)
  isAvailable: function() {
    return true;
  },

  // 사용자 ID 가져오기 (로그인 상태에 따라)
  getUserId: function() {
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

  // 컨디션 기록 저장 (localStorage만 사용)
  saveCondition: async function(conditionData) {
    var success = this.saveToLocal(conditionData);
    return { success: success, savedLocally: success, savedToServer: false };
  },

  // 로컬 스토리지에 저장
  saveToLocal: function(conditionData) {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
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

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Local save error:', e);
      return false;
    }
  },

  // Pending 마크 (향후 동기화용)
  markAsPending: function(date) {
    try {
      var pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
      if (!pending.includes(date)) {
        pending.push(date);
        localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
      }
    } catch (e) {
      console.error('Mark pending error:', e);
    }
  },

  // 로컬에서 전체 데이터 가져오기
  fetchAllFromServer: async function() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      var items = Object.values(data).map(function(item) {
        return {
          date: item.date,
          level: item.mainLevel,
          day_of_week: item.dayOfWeek,
          recorded_at: item.records?.[0]?.time || new Date().toISOString(),
          time_of_day: item.records?.[0]?.timeOfDay,
          note: item.records?.[0]?.note
        };
      });
      return { success: true, data: items };
    } catch (e) {
      return { success: false, error: e };
    }
  },

  // 특정 기간 데이터 가져오기
  fetchByDateRange: async function(startDate, endDate) {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      var items = Object.values(data).filter(function(item) {
        return item.date >= startDate && item.date <= endDate;
      }).map(function(item) {
        return {
          date: item.date,
          level: item.mainLevel,
          day_of_week: item.dayOfWeek,
          recorded_at: item.records?.[0]?.time || new Date().toISOString(),
          time_of_day: item.records?.[0]?.timeOfDay,
          note: item.records?.[0]?.note
        };
      });
      return { success: true, data: items };
    } catch (e) {
      return { success: false, error: e };
    }
  },

  // 동기화 (localStorage 전용이라 no-op)
  syncToServer: async function() {
    return { success: true, synced: 0 };
  },

  // 동기화 (localStorage 전용이라 no-op)
  syncFromServer: async function() {
    return { success: true, synced: 0 };
  },

  // 양방향 동기화 (localStorage 전용이라 no-op)
  fullSync: async function() {
    return {
      success: true,
      toServer: { success: true, synced: 0 },
      fromServer: { success: true, synced: 0 }
    };
  },

  // 통계 집계
  getServerStats: async function() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      var items = Object.values(data);
      var total = items.length;
      var avg = 0;

      if (total > 0) {
        var sum = items.reduce(function(acc, item) {
          return acc + (item.mainLevel || 0);
        }, 0);
        avg = sum / total;
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
    try {
      var localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      delete localData[date];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
    } catch (e) {
      console.error('Local delete error:', e);
    }

    return { success: true };
  },

  // 전체 데이터 삭제 (계정 삭제용)
  deleteAllUserData: async function() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PENDING_KEY);
    return { success: true };
  }
};

export default ConditionsService;
