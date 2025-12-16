import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Clock, Target, Flame, Trophy, ChevronLeft, ChevronRight, Minus } from 'lucide-react';

// 요일 이름
var WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
var WEEKDAYS_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// 날짜 유틸
function getWeekDates(date) {
  var d = new Date(date);
  var day = d.getDay();
  var start = new Date(d);
  start.setDate(d.getDate() - day);
  
  var dates = [];
  for (var i = 0; i < 7; i++) {
    var curr = new Date(start);
    curr.setDate(start.getDate() + i);
    dates.push(curr);
  }
  return dates;
}

function getMonthDates(date) {
  var d = new Date(date);
  var year = d.getFullYear();
  var month = d.getMonth();
  var firstDay = new Date(year, month, 1);
  var lastDay = new Date(year, month + 1, 0);
  
  var dates = [];
  for (var i = 1; i <= lastDay.getDate(); i++) {
    dates.push(new Date(year, month, i));
  }
  return dates;
}

function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

// 📊 주간 막대 차트
export var WeeklyBarChart = function(props) {
  var data = props.data || {}; // { '2024-01-01': { tasks: 5, focus: 30 }, ... }
  var weekDates = props.weekDates || getWeekDates(new Date());
  var darkMode = props.darkMode;
  var metric = props.metric || 'tasks'; // tasks, focus, mood
  var height = props.height || 120;
  
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 최대값 계산
  var maxValue = Math.max(1, ...weekDates.map(function(d) {
    var key = formatDateKey(d);
    return data[key] ? (data[key][metric] || 0) : 0;
  }));
  
  var today = formatDateKey(new Date());
  
  return React.createElement('div', { className: 'flex items-end justify-between gap-2', style: { height: height + 'px' } },
    weekDates.map(function(date, idx) {
      var key = formatDateKey(date);
      var value = data[key] ? (data[key][metric] || 0) : 0;
      var barHeight = maxValue > 0 ? (value / maxValue) * (height - 30) : 0;
      var isToday = key === today;
      
      return React.createElement('div', {
        key: idx,
        className: 'flex-1 flex flex-col items-center gap-1'
      },
        // 값
        React.createElement('span', { className: textSecondary + ' text-xs' }, value > 0 ? value : ''),
        // 바
        React.createElement('div', {
          className: 'w-full rounded-t-lg transition-all ' + 
            (isToday ? 'bg-[#A996FF]' : (darkMode ? 'bg-gray-600' : 'bg-gray-300')),
          style: { height: Math.max(4, barHeight) + 'px' }
        }),
        // 요일
        React.createElement('span', { 
          className: (isToday ? 'text-[#A996FF] font-bold' : textSecondary) + ' text-xs'
        }, WEEKDAYS[date.getDay()])
      );
    })
  );
};

// 📅 월간 히트맵
export var MonthlyHeatmap = function(props) {
  var data = props.data || {}; // { '2024-01-01': { level: 0-4 }, ... }
  var month = props.month || new Date();
  var darkMode = props.darkMode;
  var onDateClick = props.onDateClick;
  
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  var monthDates = getMonthDates(month);
  var firstDayOfWeek = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  var today = formatDateKey(new Date());
  
  // 레벨별 색상
  var levelColors = [
    darkMode ? 'bg-gray-700' : 'bg-gray-200', // 0
    'bg-emerald-200',
    'bg-emerald-300',
    'bg-emerald-400',
    'bg-emerald-500'
  ];
  
  // 빈 칸 채우기
  var emptyDays = [];
  for (var i = 0; i < firstDayOfWeek; i++) {
    emptyDays.push(null);
  }
  
  return React.createElement('div', null,
    // 요일 헤더
    React.createElement('div', { className: 'grid grid-cols-7 gap-1 mb-1' },
      WEEKDAYS.map(function(day) {
        return React.createElement('div', {
          key: day,
          className: textSecondary + ' text-xs text-center'
        }, day);
      })
    ),
    // 날짜 그리드
    React.createElement('div', { className: 'grid grid-cols-7 gap-1' },
      emptyDays.map(function(_, idx) {
        return React.createElement('div', { key: 'empty-' + idx, className: 'aspect-square' });
      }),
      monthDates.map(function(date) {
        var key = formatDateKey(date);
        var level = data[key] ? (data[key].level || 0) : 0;
        var isToday = key === today;
        
        return React.createElement('button', {
          key: key,
          onClick: function() { if (onDateClick) onDateClick(date); },
          className: 'aspect-square rounded-sm ' + levelColors[level] + ' ' +
            (isToday ? 'ring-2 ring-[#A996FF]' : '') +
            ' hover:ring-1 hover:ring-[#A996FF]/50 transition-all',
          title: key + ': Level ' + level
        });
      })
    ),
    // 범례
    React.createElement('div', { className: 'flex items-center justify-end gap-1 mt-2' },
      React.createElement('span', { className: textSecondary + ' text-xs mr-1' }, '적음'),
      levelColors.map(function(color, idx) {
        return React.createElement('div', {
          key: idx,
          className: 'w-3 h-3 rounded-sm ' + color
        });
      }),
      React.createElement('span', { className: textSecondary + ' text-xs ml-1' }, '많음')
    )
  );
};

// 📈 통계 카드
export var StatCard = function(props) {
  var icon = props.icon;
  var label = props.label;
  var value = props.value;
  var subValue = props.subValue;
  var trend = props.trend; // 'up', 'down', 'neutral'
  var trendValue = props.trendValue;
  var color = props.color || 'text-[#A996FF]';
  var darkMode = props.darkMode;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  var trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : textSecondary;
  
  return React.createElement('div', { className: cardBg + ' rounded-xl p-4 border ' + borderColor },
    React.createElement('div', { className: 'flex items-start justify-between mb-2' },
      React.createElement('span', { className: 'text-2xl' }, icon),
      trend && React.createElement('div', { className: 'flex items-center gap-1 ' + trendColor },
        React.createElement(TrendIcon, { size: 14 }),
        trendValue && React.createElement('span', { className: 'text-xs' }, trendValue)
      )
    ),
    React.createElement('p', { className: color + ' text-2xl font-bold' }, value),
    React.createElement('p', { className: textSecondary + ' text-xs' }, label),
    subValue && React.createElement('p', { className: textSecondary + ' text-xs mt-1' }, subValue)
  );
};

// 📊 주간 통계 대시보드
export var WeeklyStatsDashboard = function(props) {
  var darkMode = props.darkMode;
  var weekData = props.weekData || {};
  var previousWeekData = props.previousWeekData || {};
  var onWeekChange = props.onWeekChange;
  var currentWeekStart = props.currentWeekStart || new Date();
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var weekDates = getWeekDates(currentWeekStart);
  var weekLabel = (weekDates[0].getMonth() + 1) + '/' + weekDates[0].getDate() + ' - ' + 
                  (weekDates[6].getMonth() + 1) + '/' + weekDates[6].getDate();
  
  // 주간 합계 계산
  var weekTotals = useMemo(function() {
    var totals = { tasks: 0, focus: 0, streak: 0, quests: 0 };
    weekDates.forEach(function(date) {
      var key = formatDateKey(date);
      if (weekData[key]) {
        totals.tasks += weekData[key].tasks || 0;
        totals.focus += weekData[key].focus || 0;
        totals.quests += weekData[key].quests || 0;
      }
    });
    totals.streak = weekData.streak || 0;
    return totals;
  }, [weekData, weekDates]);
  
  // 전주 대비 트렌드
  var prevTotals = useMemo(function() {
    var totals = { tasks: 0, focus: 0 };
    Object.values(previousWeekData).forEach(function(day) {
      if (day && typeof day === 'object') {
        totals.tasks += day.tasks || 0;
        totals.focus += day.focus || 0;
      }
    });
    return totals;
  }, [previousWeekData]);
  
  var getTrend = function(current, previous) {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };
  
  var getTrendValue = function(current, previous) {
    if (previous === 0) return '';
    var diff = Math.round(((current - previous) / previous) * 100);
    return (diff >= 0 ? '+' : '') + diff + '%';
  };
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(BarChart3, { size: 20, className: 'text-[#A996FF]' }),
        React.createElement('h3', { className: textPrimary + ' font-bold' }, '주간 통계')
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('button', {
          onClick: function() { 
            var prev = new Date(currentWeekStart);
            prev.setDate(prev.getDate() - 7);
            if (onWeekChange) onWeekChange(prev);
          },
          className: textSecondary + ' hover:text-[#A996FF]'
        }, React.createElement(ChevronLeft, { size: 18 })),
        React.createElement('span', { className: textSecondary + ' text-sm' }, weekLabel),
        React.createElement('button', {
          onClick: function() {
            var next = new Date(currentWeekStart);
            next.setDate(next.getDate() + 7);
            if (onWeekChange) onWeekChange(next);
          },
          className: textSecondary + ' hover:text-[#A996FF]'
        }, React.createElement(ChevronRight, { size: 18 }))
      )
    ),
    
    // 통계 카드 그리드
    React.createElement('div', { className: 'grid grid-cols-2 gap-3 mb-4' },
      React.createElement(StatCard, {
        icon: '✅',
        label: '완료한 할일',
        value: weekTotals.tasks,
        trend: getTrend(weekTotals.tasks, prevTotals.tasks),
        trendValue: getTrendValue(weekTotals.tasks, prevTotals.tasks),
        color: 'text-emerald-500',
        darkMode: darkMode
      }),
      React.createElement(StatCard, {
        icon: '🎯',
        label: '집중 시간',
        value: weekTotals.focus + '분',
        subValue: Math.floor(weekTotals.focus / 60) + '시간 ' + (weekTotals.focus % 60) + '분',
        trend: getTrend(weekTotals.focus, prevTotals.focus),
        trendValue: getTrendValue(weekTotals.focus, prevTotals.focus),
        color: 'text-purple-500',
        darkMode: darkMode
      }),
      React.createElement(StatCard, {
        icon: '🔥',
        label: '현재 스트릭',
        value: weekTotals.streak + '일',
        color: 'text-orange-500',
        darkMode: darkMode
      }),
      React.createElement(StatCard, {
        icon: '⭐',
        label: '완료 퀘스트',
        value: weekTotals.quests,
        color: 'text-amber-500',
        darkMode: darkMode
      })
    ),
    
    // 주간 차트
    React.createElement('div', { className: 'pt-4 border-t ' + borderColor },
      React.createElement('p', { className: textSecondary + ' text-xs mb-3' }, '일별 할일 완료'),
      React.createElement(WeeklyBarChart, {
        data: weekData,
        weekDates: weekDates,
        darkMode: darkMode,
        metric: 'tasks'
      })
    )
  );
};

// 📅 월간 통계 대시보드
export var MonthlyStatsDashboard = function(props) {
  var darkMode = props.darkMode;
  var monthData = props.monthData || {};
  var currentMonth = props.currentMonth || new Date();
  var onMonthChange = props.onMonthChange;
  var onDateClick = props.onDateClick;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var monthLabel = currentMonth.getFullYear() + '년 ' + (currentMonth.getMonth() + 1) + '월';
  
  // 월간 합계
  var monthTotals = useMemo(function() {
    var totals = { tasks: 0, focus: 0, activeDays: 0, bestDay: 0 };
    var monthDates = getMonthDates(currentMonth);
    
    monthDates.forEach(function(date) {
      var key = formatDateKey(date);
      if (monthData[key]) {
        var dayTasks = monthData[key].tasks || 0;
        totals.tasks += dayTasks;
        totals.focus += monthData[key].focus || 0;
        if (dayTasks > 0) totals.activeDays++;
        if (dayTasks > totals.bestDay) totals.bestDay = dayTasks;
      }
    });
    return totals;
  }, [monthData, currentMonth]);
  
  // 히트맵 데이터 변환
  var heatmapData = useMemo(function() {
    var result = {};
    Object.keys(monthData).forEach(function(key) {
      var tasks = monthData[key].tasks || 0;
      var level = 0;
      if (tasks >= 10) level = 4;
      else if (tasks >= 7) level = 3;
      else if (tasks >= 4) level = 2;
      else if (tasks >= 1) level = 1;
      result[key] = { level: level };
    });
    return result;
  }, [monthData]);
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Calendar, { size: 20, className: 'text-[#A996FF]' }),
        React.createElement('h3', { className: textPrimary + ' font-bold' }, '월간 통계')
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('button', {
          onClick: function() {
            var prev = new Date(currentMonth);
            prev.setMonth(prev.getMonth() - 1);
            if (onMonthChange) onMonthChange(prev);
          },
          className: textSecondary + ' hover:text-[#A996FF]'
        }, React.createElement(ChevronLeft, { size: 18 })),
        React.createElement('span', { className: textSecondary + ' text-sm' }, monthLabel),
        React.createElement('button', {
          onClick: function() {
            var next = new Date(currentMonth);
            next.setMonth(next.getMonth() + 1);
            if (onMonthChange) onMonthChange(next);
          },
          className: textSecondary + ' hover:text-[#A996FF]'
        }, React.createElement(ChevronRight, { size: 18 }))
      )
    ),
    
    // 요약 통계
    React.createElement('div', { className: 'grid grid-cols-4 gap-2 mb-4' },
      React.createElement('div', { className: 'text-center p-2 rounded-lg ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
        React.createElement('p', { className: 'text-emerald-500 font-bold text-lg' }, monthTotals.tasks),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '할일')
      ),
      React.createElement('div', { className: 'text-center p-2 rounded-lg ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
        React.createElement('p', { className: 'text-purple-500 font-bold text-lg' }, Math.floor(monthTotals.focus / 60) + 'h'),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '집중')
      ),
      React.createElement('div', { className: 'text-center p-2 rounded-lg ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
        React.createElement('p', { className: 'text-blue-500 font-bold text-lg' }, monthTotals.activeDays),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '활동일')
      ),
      React.createElement('div', { className: 'text-center p-2 rounded-lg ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
        React.createElement('p', { className: 'text-amber-500 font-bold text-lg' }, monthTotals.bestDay),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '최고일')
      )
    ),
    
    // 히트맵
    React.createElement('div', { className: 'pt-4 border-t ' + borderColor },
      React.createElement('p', { className: textSecondary + ' text-xs mb-3' }, '일별 활동량'),
      React.createElement(MonthlyHeatmap, {
        data: heatmapData,
        month: currentMonth,
        darkMode: darkMode,
        onDateClick: onDateClick
      })
    )
  );
};

// 📊 전체 통계 페이지
export var StatsPage = function(props) {
  var darkMode = props.darkMode;
  var weekData = props.weekData || {};
  var monthData = props.monthData || {};
  var gameData = props.gameData || {};
  var onBack = props.onBack;
  
  var weekState = useState(new Date());
  var currentWeek = weekState[0];
  var setCurrentWeek = weekState[1];
  
  var monthState = useState(new Date());
  var currentMonth = monthState[0];
  var setCurrentMonth = monthState[1];
  
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', { className: bgColor + ' min-h-screen pb-24' },
    // 헤더
    React.createElement('div', { className: 'px-4 pt-6 pb-4' },
      React.createElement('div', { className: 'flex items-center gap-3 mb-4' },
        React.createElement('button', {
          onClick: onBack,
          className: textSecondary + ' hover:' + textPrimary
        }, '←'),
        React.createElement('h1', { className: textPrimary + ' text-2xl font-bold' }, '📊 통계')
      )
    ),
    
    // 콘텐츠
    React.createElement('div', { className: 'px-4 space-y-4' },
      // 주간 통계
      React.createElement(WeeklyStatsDashboard, {
        darkMode: darkMode,
        weekData: weekData,
        currentWeekStart: currentWeek,
        onWeekChange: setCurrentWeek
      }),
      
      // 월간 통계
      React.createElement(MonthlyStatsDashboard, {
        darkMode: darkMode,
        monthData: monthData,
        currentMonth: currentMonth,
        onMonthChange: setCurrentMonth
      }),
      
      // 전체 기록
      React.createElement('div', { className: (darkMode ? 'bg-gray-800' : 'bg-white') + ' rounded-2xl p-4 border ' + (darkMode ? 'border-gray-700' : 'border-gray-200') },
        React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
          React.createElement(Trophy, { size: 20, className: 'text-amber-400' }),
          React.createElement('h3', { className: textPrimary + ' font-bold' }, '전체 기록')
        ),
        React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
          React.createElement('div', { className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
            React.createElement('p', { className: 'text-emerald-500 text-2xl font-bold' }, gameData.tasksCompleted || 0),
            React.createElement('p', { className: textSecondary + ' text-xs' }, '총 완료 할일')
          ),
          React.createElement('div', { className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
            React.createElement('p', { className: 'text-purple-500 text-2xl font-bold' }, Math.floor((gameData.focusMinutes || 0) / 60) + 'h'),
            React.createElement('p', { className: textSecondary + ' text-xs' }, '총 집중 시간')
          ),
          React.createElement('div', { className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
            React.createElement('p', { className: 'text-orange-500 text-2xl font-bold' }, gameData.longestStreak || 0),
            React.createElement('p', { className: textSecondary + ' text-xs' }, '최장 스트릭')
          ),
          React.createElement('div', { className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
            React.createElement('p', { className: 'text-[#A996FF] text-2xl font-bold' }, gameData.totalXp || 0),
            React.createElement('p', { className: textSecondary + ' text-xs' }, '총 XP')
          )
        )
      )
    )
  );
};

export default {
  WeeklyBarChart: WeeklyBarChart,
  MonthlyHeatmap: MonthlyHeatmap,
  StatCard: StatCard,
  WeeklyStatsDashboard: WeeklyStatsDashboard,
  MonthlyStatsDashboard: MonthlyStatsDashboard,
  StatsPage: StatsPage
};
