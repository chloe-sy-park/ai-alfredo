import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Clock, Target, Flame, Trophy, ChevronLeft, ChevronRight, Minus, Star, Zap, Award, Medal } from 'lucide-react';

// W2 게이미피케이션 임포트
import { LevelXpBar, useGamification, LEVEL_CONFIG } from '../gamification/LevelSystem';
import { DailyQuestCard, QuestList } from '../gamification/QuestSystem';
import { BadgeGrid, BadgeShowcase } from '../gamification/BadgeSystem';

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
  var data = props.data || {};
  var weekDates = props.weekDates || getWeekDates(new Date());
  var darkMode = props.darkMode;
  var metric = props.metric || 'tasks';
  var height = props.height || 120;
  
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
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
        React.createElement('span', { className: textSecondary + ' text-xs' }, value > 0 ? value : ''),
        React.createElement('div', {
          className: 'w-full rounded-t-lg transition-all ' + 
            (isToday ? 'bg-[#A996FF]' : (darkMode ? 'bg-gray-600' : 'bg-gray-300')),
          style: { height: Math.max(4, barHeight) + 'px' }
        }),
        React.createElement('span', { 
          className: (isToday ? 'text-[#A996FF] font-bold' : textSecondary) + ' text-xs'
        }, WEEKDAYS[date.getDay()])
      );
    })
  );
};

// 📅 월간 히트맵
export var MonthlyHeatmap = function(props) {
  var data = props.data || {};
  var month = props.month || new Date();
  var darkMode = props.darkMode;
  var onDateClick = props.onDateClick;
  
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  var monthDates = getMonthDates(month);
  var firstDayOfWeek = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  var today = formatDateKey(new Date());
  
  var levelColors = [
    darkMode ? 'bg-gray-700' : 'bg-gray-200',
    'bg-emerald-200',
    'bg-emerald-300',
    'bg-emerald-400',
    'bg-emerald-500'
  ];
  
  var emptyDays = [];
  for (var i = 0; i < firstDayOfWeek; i++) {
    emptyDays.push(null);
  }
  
  return React.createElement('div', null,
    React.createElement('div', { className: 'grid grid-cols-7 gap-1 mb-1' },
      WEEKDAYS.map(function(day) {
        return React.createElement('div', {
          key: day,
          className: textSecondary + ' text-xs text-center'
        }, day);
      })
    ),
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
  var trend = props.trend;
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

// 🎮 게임 요약 카드
var GameSummaryCard = function(props) {
  var darkMode = props.darkMode;
  var gameData = props.gameData || {};
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var level = gameData.level || 1;
  var totalXp = gameData.totalXp || 0;
  var currentStreak = gameData.currentStreak || 0;
  var longestStreak = gameData.longestStreak || 0;
  
  var levelInfo = LEVEL_CONFIG ? LEVEL_CONFIG[level] : { title: '새싹', minXp: 0, maxXp: 100 };
  var nextLevelXp = levelInfo ? levelInfo.maxXp : 100;
  var progress = nextLevelXp > 0 ? Math.min(100, (totalXp / nextLevelXp) * 100) : 0;
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
      React.createElement(Trophy, { size: 20, className: 'text-amber-400' }),
      React.createElement('h3', { className: textPrimary + ' font-bold' }, '나의 성장')
    ),
    
    // 레벨 & XP
    React.createElement('div', { className: 'flex items-center gap-4 mb-4' },
      React.createElement('div', { 
        className: 'w-16 h-16 rounded-2xl bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-white text-2xl font-bold shadow-lg'
      }, level),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('div', { className: 'flex items-center justify-between mb-1' },
          React.createElement('span', { className: textPrimary + ' font-bold' }, 'Lv.' + level + ' ' + (levelInfo?.title || '')),
          React.createElement('span', { className: 'text-[#A996FF] text-sm' }, totalXp.toLocaleString() + ' XP')
        ),
        React.createElement('div', { className: 'h-2 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' overflow-hidden' },
          React.createElement('div', {
            className: 'h-full rounded-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7]',
            style: { width: progress + '%' }
          })
        ),
        React.createElement('p', { className: textSecondary + ' text-xs mt-1' }, 
          '다음 레벨까지 ' + Math.max(0, nextLevelXp - totalXp) + ' XP'
        )
      )
    ),
    
    // 스트릭
    React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
      React.createElement('div', { className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-orange-50') },
        React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
          React.createElement(Flame, { size: 16, className: 'text-orange-500' }),
          React.createElement('span', { className: textSecondary + ' text-xs' }, '현재 스트릭')
        ),
        React.createElement('p', { className: 'text-orange-500 text-xl font-bold' }, currentStreak + '일')
      ),
      React.createElement('div', { className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-amber-50') },
        React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
          React.createElement(Star, { size: 16, className: 'text-amber-500' }),
          React.createElement('span', { className: textSecondary + ' text-xs' }, '최장 스트릭')
        ),
        React.createElement('p', { className: 'text-amber-500 text-xl font-bold' }, longestStreak + '일')
      )
    )
  );
};

// 📊 통합 통계 & 게임센터 페이지
export var StatsPage = function(props) {
  var darkMode = props.darkMode;
  var weekData = props.weekData || {};
  var monthData = props.monthData || {};
  var gameData = props.gameData || {};
  var onBack = props.onBack;
  
  // 탭 상태
  var tabState = useState('stats'); // 'stats', 'game', 'quests', 'badges'
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];
  
  var weekState = useState(new Date());
  var currentWeek = weekState[0];
  var setCurrentWeek = weekState[1];
  
  var monthState = useState(new Date());
  var currentMonth = monthState[0];
  var setCurrentMonth = monthState[1];
  
  // 게이미피케이션 훅
  var gamification = useGamification ? useGamification() : gameData;
  
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var weekDates = getWeekDates(currentWeek);
  var weekLabel = (weekDates[0].getMonth() + 1) + '/' + weekDates[0].getDate() + ' - ' + 
                  (weekDates[6].getMonth() + 1) + '/' + weekDates[6].getDate();
  var monthLabel = currentMonth.getFullYear() + '년 ' + (currentMonth.getMonth() + 1) + '월';
  
  // 주간 합계
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
    totals.streak = gamification.currentStreak || 0;
    return totals;
  }, [weekData, weekDates, gamification]);
  
  // 히트맵 데이터
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
  
  // 탭 목록
  var tabs = [
    { id: 'stats', label: '통계', icon: '📊' },
    { id: 'game', label: '성장', icon: '🎮' },
    { id: 'quests', label: '퀘스트', icon: '📜' },
    { id: 'badges', label: '배지', icon: '🏅' }
  ];
  
  return React.createElement('div', { className: bgColor + ' min-h-screen pb-24' },
    // 헤더
    React.createElement('div', { className: 'px-4 pt-6 pb-4' },
      React.createElement('div', { className: 'flex items-center gap-3 mb-4' },
        React.createElement('button', {
          onClick: onBack,
          className: textSecondary + ' hover:' + textPrimary + ' text-xl'
        }, '←'),
        React.createElement('h1', { className: textPrimary + ' text-2xl font-bold' }, '📊 통계 & 게임센터')
      ),
      
      // 탭 바
      React.createElement('div', { className: 'flex gap-2 overflow-x-auto pb-2' },
        tabs.map(function(tab) {
          var isActive = activeTab === tab.id;
          return React.createElement('button', {
            key: tab.id,
            onClick: function() { setActiveTab(tab.id); },
            className: 'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ' +
              (isActive 
                ? 'bg-[#A996FF] text-white' 
                : (darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'))
          },
            React.createElement('span', null, tab.icon),
            React.createElement('span', null, tab.label)
          );
        })
      )
    ),
    
    // 콘텐츠
    React.createElement('div', { className: 'px-4 space-y-4' },
      
      // 통계 탭
      activeTab === 'stats' && React.createElement(React.Fragment, null,
        // 주간 통계 카드
        React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
          React.createElement('div', { className: 'flex items-center justify-between mb-4' },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement(BarChart3, { size: 20, className: 'text-[#A996FF]' }),
              React.createElement('h3', { className: textPrimary + ' font-bold' }, '주간 통계')
            ),
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('button', {
                onClick: function() { 
                  var prev = new Date(currentWeek);
                  prev.setDate(prev.getDate() - 7);
                  setCurrentWeek(prev);
                },
                className: textSecondary + ' hover:text-[#A996FF]'
              }, React.createElement(ChevronLeft, { size: 18 })),
              React.createElement('span', { className: textSecondary + ' text-sm' }, weekLabel),
              React.createElement('button', {
                onClick: function() {
                  var next = new Date(currentWeek);
                  next.setDate(next.getDate() + 7);
                  setCurrentWeek(next);
                },
                className: textSecondary + ' hover:text-[#A996FF]'
              }, React.createElement(ChevronRight, { size: 18 }))
            )
          ),
          
          React.createElement('div', { className: 'grid grid-cols-2 gap-3 mb-4' },
            React.createElement(StatCard, { icon: '✅', label: '완료 할일', value: weekTotals.tasks, color: 'text-emerald-500', darkMode: darkMode }),
            React.createElement(StatCard, { icon: '🎯', label: '집중 시간', value: weekTotals.focus + '분', color: 'text-purple-500', darkMode: darkMode }),
            React.createElement(StatCard, { icon: '🔥', label: '스트릭', value: weekTotals.streak + '일', color: 'text-orange-500', darkMode: darkMode }),
            React.createElement(StatCard, { icon: '⭐', label: '완료 퀘스트', value: weekTotals.quests, color: 'text-amber-500', darkMode: darkMode })
          ),
          
          React.createElement('div', { className: 'pt-4 border-t ' + borderColor },
            React.createElement('p', { className: textSecondary + ' text-xs mb-3' }, '일별 할일 완료'),
            React.createElement(WeeklyBarChart, { data: weekData, weekDates: weekDates, darkMode: darkMode, metric: 'tasks' })
          )
        ),
        
        // 월간 히트맵
        React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
          React.createElement('div', { className: 'flex items-center justify-between mb-4' },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement(Calendar, { size: 20, className: 'text-[#A996FF]' }),
              React.createElement('h3', { className: textPrimary + ' font-bold' }, '월간 활동')
            ),
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('button', {
                onClick: function() {
                  var prev = new Date(currentMonth);
                  prev.setMonth(prev.getMonth() - 1);
                  setCurrentMonth(prev);
                },
                className: textSecondary + ' hover:text-[#A996FF]'
              }, React.createElement(ChevronLeft, { size: 18 })),
              React.createElement('span', { className: textSecondary + ' text-sm' }, monthLabel),
              React.createElement('button', {
                onClick: function() {
                  var next = new Date(currentMonth);
                  next.setMonth(next.getMonth() + 1);
                  setCurrentMonth(next);
                },
                className: textSecondary + ' hover:text-[#A996FF]'
              }, React.createElement(ChevronRight, { size: 18 }))
            )
          ),
          React.createElement(MonthlyHeatmap, { data: heatmapData, month: currentMonth, darkMode: darkMode })
        )
      ),
      
      // 게임(성장) 탭
      activeTab === 'game' && React.createElement(React.Fragment, null,
        React.createElement(GameSummaryCard, { darkMode: darkMode, gameData: gamification }),
        
        // 전체 기록
        React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
          React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
            React.createElement(Award, { size: 20, className: 'text-amber-400' }),
            React.createElement('h3', { className: textPrimary + ' font-bold' }, '전체 기록')
          ),
          React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
            React.createElement('div', { className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
              React.createElement('p', { className: 'text-emerald-500 text-2xl font-bold' }, gamification.tasksCompleted || 0),
              React.createElement('p', { className: textSecondary + ' text-xs' }, '총 완료 할일')
            ),
            React.createElement('div', { className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
              React.createElement('p', { className: 'text-purple-500 text-2xl font-bold' }, Math.floor((gamification.focusMinutes || 0) / 60) + 'h'),
              React.createElement('p', { className: textSecondary + ' text-xs' }, '총 집중 시간')
            ),
            React.createElement('div', { className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
              React.createElement('p', { className: 'text-blue-500 text-2xl font-bold' }, gamification.questsCompleted || 0),
              React.createElement('p', { className: textSecondary + ' text-xs' }, '완료 퀘스트')
            ),
            React.createElement('div', { className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
              React.createElement('p', { className: 'text-amber-500 text-2xl font-bold' }, gamification.badgesEarned || 0),
              React.createElement('p', { className: textSecondary + ' text-xs' }, '획득 배지')
            )
          )
        )
      ),
      
      // 퀘스트 탭
      activeTab === 'quests' && React.createElement(React.Fragment, null,
        React.createElement(DailyQuestCard, { darkMode: darkMode }),
        React.createElement(QuestList, { darkMode: darkMode, showCompleted: true })
      ),
      
      // 배지 탭
      activeTab === 'badges' && React.createElement(React.Fragment, null,
        React.createElement(BadgeShowcase, { darkMode: darkMode, maxBadges: 6 }),
        React.createElement(BadgeGrid, { darkMode: darkMode, showLocked: true })
      )
    )
  );
};

export default {
  WeeklyBarChart: WeeklyBarChart,
  MonthlyHeatmap: MonthlyHeatmap,
  StatCard: StatCard,
  StatsPage: StatsPage
};
