import { useMemo } from 'react';
import { useDailyConditions } from './useDailyConditions';

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

export default useYearInPixels;
