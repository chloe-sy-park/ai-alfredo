import React, { useState, useMemo } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, Clock, Target, Calendar, Zap, Award, ChevronRight, Share2, Download, Sparkles } from 'lucide-react';

// 요일 이름
var WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 날짜 유틸
function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

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

// 💡 인사이트 생성
function generateInsights(data) {
  var insights = [];
  
  if (!data || !data.weekData) return insights;
  
  var weekDates = getWeekDates(new Date());
  var weekTotals = { tasks: 0, focus: 0, days: 0 };
  var dayStats = [];
  
  weekDates.forEach(function(date) {
    var key = formatDateKey(date);
    if (data.weekData[key]) {
      var day = data.weekData[key];
      weekTotals.tasks += day.tasks || 0;
      weekTotals.focus += day.focus || 0;
      if (day.tasks > 0 || day.focus > 0) weekTotals.days++;
      dayStats.push({ day: date.getDay(), tasks: day.tasks || 0, focus: day.focus || 0 });
    }
  });
  
  // 가장 생산적인 요일
  if (dayStats.length > 0) {
    var bestDay = dayStats.reduce(function(best, curr) {
      return curr.tasks > best.tasks ? curr : best;
    }, dayStats[0]);
    
    if (bestDay.tasks > 0) {
      insights.push({
        type: 'productivity',
        icon: '📊',
        title: '가장 생산적인 요일',
        message: WEEKDAYS[bestDay.day] + '요일에 가장 많은 할일(' + bestDay.tasks + '개)을 완료했어요!',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
      });
    }
  }
  
  // 집중 시간 분석
  if (weekTotals.focus > 0) {
    var avgFocus = Math.round(weekTotals.focus / Math.max(1, weekTotals.days));
    insights.push({
      type: 'focus',
      icon: '🎯',
      title: '집중 시간 분석',
      message: '이번 주 평균 ' + avgFocus + '분씩 집중했어요. 총 ' + Math.floor(weekTotals.focus / 60) + '시간 ' + (weekTotals.focus % 60) + '분!',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    });
  }
  
  // 활동 패턴
  if (weekTotals.days >= 5) {
    insights.push({
      type: 'consistency',
      icon: '🔥',
      title: '꾸준함의 힘',
      message: '이번 주 ' + weekTotals.days + '일 동안 활동했어요! 꾸준함이 성공의 비결이에요.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    });
  } else if (weekTotals.days < 3 && weekTotals.days > 0) {
    insights.push({
      type: 'suggestion',
      icon: '💡',
      title: '작은 시작의 힘',
      message: '조금씩이라도 매일 하는 게 중요해요. 내일은 5분만 집중해볼까요?',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    });
  }
  
  // 스트릭 관련
  if (data.streak >= 7) {
    insights.push({
      type: 'streak',
      icon: '🏆',
      title: '대단한 스트릭!',
      message: data.streak + '일 연속 활동 중! 정말 대단해요, 보스!',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    });
  }
  
  // 레벨 관련
  if (data.level && data.level >= 5) {
    insights.push({
      type: 'level',
      icon: '⭐',
      title: '레벨 업 마스터',
      message: '벌써 레벨 ' + data.level + '! ' + data.totalXp + ' XP를 모았어요.',
      color: 'text-[#A996FF]',
      bgColor: 'bg-[#A996FF]/10'
    });
  }
  
  return insights;
}

// 💡 인사이트 카드
export var InsightCard = function(props) {
  var insight = props.insight;
  var darkMode = props.darkMode;
  var onClick = props.onClick;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  return React.createElement('button', {
    onClick: onClick,
    className: cardBg + ' rounded-2xl p-4 border ' + borderColor + ' w-full text-left hover:border-[#A996FF]/50 transition-all'
  },
    React.createElement('div', { className: 'flex items-start gap-3' },
      React.createElement('div', { 
        className: 'w-10 h-10 rounded-xl flex items-center justify-center text-xl ' + insight.bgColor
      }, insight.icon),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('p', { className: insight.color + ' text-sm font-medium mb-1' }, insight.title),
        React.createElement('p', { className: textPrimary + ' text-sm' }, insight.message)
      )
    )
  );
};

// 📊 인사이트 섹션
export var InsightsSection = function(props) {
  var darkMode = props.darkMode;
  var data = props.data;
  var maxInsights = props.maxInsights || 3;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var insights = useMemo(function() {
    return generateInsights(data).slice(0, maxInsights);
  }, [data, maxInsights]);
  
  if (insights.length === 0) {
    return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
      React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
        React.createElement(Lightbulb, { size: 18, className: 'text-amber-400' }),
        React.createElement('h3', { className: textPrimary + ' font-bold' }, '인사이트')
      ),
      React.createElement('p', { className: textSecondary + ' text-sm text-center py-4' }, 
        '활동을 더 기록하면 인사이트를 볼 수 있어요!'
      )
    );
  }
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
      React.createElement(Lightbulb, { size: 18, className: 'text-amber-400' }),
      React.createElement('h3', { className: textPrimary + ' font-bold' }, '이번 주 인사이트')
    ),
    React.createElement('div', { className: 'space-y-3' },
      insights.map(function(insight, idx) {
        return React.createElement('div', {
          key: idx,
          className: 'flex items-start gap-3 p-3 rounded-xl ' + insight.bgColor
        },
          React.createElement('span', { className: 'text-xl' }, insight.icon),
          React.createElement('div', null,
            React.createElement('p', { className: insight.color + ' text-sm font-medium' }, insight.title),
            React.createElement('p', { className: textPrimary + ' text-sm' }, insight.message)
          )
        );
      })
    )
  );
};

// 📄 주간 리포트
export var WeeklyReport = function(props) {
  var darkMode = props.darkMode;
  var weekData = props.weekData || {};
  var previousWeekData = props.previousWeekData || {};
  var gameData = props.gameData || {};
  var onShare = props.onShare;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var weekDates = getWeekDates(new Date());
  var weekStart = weekDates[0];
  var weekEnd = weekDates[6];
  var weekLabel = (weekStart.getMonth() + 1) + '/' + weekStart.getDate() + ' - ' + 
                  (weekEnd.getMonth() + 1) + '/' + weekEnd.getDate();
  
  // 주간 통계 계산
  var stats = useMemo(function() {
    var current = { tasks: 0, focus: 0, activeDays: 0 };
    var previous = { tasks: 0, focus: 0 };
    
    weekDates.forEach(function(date) {
      var key = formatDateKey(date);
      if (weekData[key]) {
        current.tasks += weekData[key].tasks || 0;
        current.focus += weekData[key].focus || 0;
        if (weekData[key].tasks > 0) current.activeDays++;
      }
    });
    
    Object.values(previousWeekData).forEach(function(day) {
      if (day && typeof day === 'object') {
        previous.tasks += day.tasks || 0;
        previous.focus += day.focus || 0;
      }
    });
    
    // 변화율 계산
    var taskChange = previous.tasks > 0 
      ? Math.round(((current.tasks - previous.tasks) / previous.tasks) * 100)
      : (current.tasks > 0 ? 100 : 0);
    var focusChange = previous.focus > 0
      ? Math.round(((current.focus - previous.focus) / previous.focus) * 100)
      : (current.focus > 0 ? 100 : 0);
    
    return {
      current: current,
      previous: previous,
      taskChange: taskChange,
      focusChange: focusChange
    };
  }, [weekData, previousWeekData]);
  
  // 하이라이트 생성
  var highlights = useMemo(function() {
    var items = [];
    
    if (stats.current.tasks > 0) {
      items.push({
        icon: '✅',
        label: '완료한 할일',
        value: stats.current.tasks + '개',
        change: stats.taskChange,
        color: 'text-emerald-500'
      });
    }
    
    if (stats.current.focus > 0) {
      items.push({
        icon: '🎯',
        label: '집중 시간',
        value: Math.floor(stats.current.focus / 60) + '시간 ' + (stats.current.focus % 60) + '분',
        change: stats.focusChange,
        color: 'text-purple-500'
      });
    }
    
    if (stats.current.activeDays > 0) {
      items.push({
        icon: '📅',
        label: '활동 일수',
        value: stats.current.activeDays + '일 / 7일',
        color: 'text-blue-500'
      });
    }
    
    if (gameData.currentStreak > 0) {
      items.push({
        icon: '🔥',
        label: '현재 스트릭',
        value: gameData.currentStreak + '일',
        color: 'text-orange-500'
      });
    }
    
    return items;
  }, [stats, gameData]);
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', null,
        React.createElement('h2', { className: textPrimary + ' text-lg font-bold' }, '📊 주간 리포트'),
        React.createElement('p', { className: textSecondary + ' text-sm' }, weekLabel)
      ),
      onShare && React.createElement('button', {
        onClick: onShare,
        className: 'p-2 rounded-lg ' + (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200') + ' transition-colors'
      }, React.createElement(Share2, { size: 18, className: textSecondary }))
    ),
    
    // 알프레도 코멘트
    React.createElement('div', { className: 'bg-[#A996FF]/10 rounded-xl p-4 mb-4' },
      React.createElement('div', { className: 'flex items-start gap-3' },
        React.createElement('span', { className: 'text-2xl' }, '🐧'),
        React.createElement('div', null,
          React.createElement('p', { className: textPrimary + ' text-sm' }, 
            stats.current.tasks > 10 
              ? '와! 이번 주 정말 열심히 했어요, 보스! ' + stats.current.tasks + '개의 할일을 완료했네요!'
              : stats.current.tasks > 0
                ? '이번 주도 수고했어요! 조금씩 발전하고 있어요.'
                : '이번 주는 좀 쉬어갔네요. 다음 주는 함께 화이팅해요!'
          )
        )
      )
    ),
    
    // 통계 그리드
    React.createElement('div', { className: 'grid grid-cols-2 gap-3 mb-4' },
      highlights.map(function(item, idx) {
        return React.createElement('div', {
          key: idx,
          className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50')
        },
          React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
            React.createElement('span', null, item.icon),
            React.createElement('span', { className: textSecondary + ' text-xs' }, item.label)
          ),
          React.createElement('p', { className: item.color + ' text-lg font-bold' }, item.value),
          item.change !== undefined && React.createElement('div', { 
            className: 'flex items-center gap-1 mt-1 ' + (item.change >= 0 ? 'text-emerald-500' : 'text-red-500')
          },
            item.change >= 0 
              ? React.createElement(TrendingUp, { size: 12 })
              : React.createElement(TrendingDown, { size: 12 }),
            React.createElement('span', { className: 'text-xs' }, 
              (item.change >= 0 ? '+' : '') + item.change + '% vs 지난주'
            )
          )
        );
      })
    ),
    
    // 일별 활동
    React.createElement('div', { className: 'pt-4 border-t ' + borderColor },
      React.createElement('p', { className: textSecondary + ' text-xs mb-3' }, '일별 활동'),
      React.createElement('div', { className: 'flex justify-between' },
        weekDates.map(function(date) {
          var key = formatDateKey(date);
          var dayData = weekData[key] || {};
          var tasks = dayData.tasks || 0;
          var isToday = key === formatDateKey(new Date());
          
          return React.createElement('div', {
            key: key,
            className: 'flex flex-col items-center gap-1'
          },
            React.createElement('div', {
              className: 'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ' +
                (tasks > 0 
                  ? 'bg-emerald-500 text-white' 
                  : (isToday 
                    ? 'ring-1 ring-[#A996FF] ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                    : (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')))
            }, tasks > 0 ? tasks : '-'),
            React.createElement('span', { 
              className: (isToday ? 'text-[#A996FF] font-bold' : textSecondary) + ' text-xs'
            }, WEEKDAYS[date.getDay()])
          );
        })
      )
    )
  );
};

// 🏆 성과 요약 카드
export var AchievementSummary = function(props) {
  var darkMode = props.darkMode;
  var gameData = props.gameData || {};
  var earnedBadges = props.earnedBadges || [];
  var onClick = props.onClick;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var stats = [
    { icon: '📊', label: '총 XP', value: (gameData.totalXp || 0).toLocaleString() },
    { icon: '✅', label: '완료 할일', value: gameData.tasksCompleted || 0 },
    { icon: '🎯', label: '집중 시간', value: Math.floor((gameData.focusMinutes || 0) / 60) + 'h' },
    { icon: '🏅', label: '획득 배지', value: earnedBadges.length }
  ];
  
  return React.createElement('button', {
    onClick: onClick,
    className: cardBg + ' rounded-2xl p-4 border ' + borderColor + ' w-full text-left hover:border-[#A996FF]/50'
  },
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Award, { size: 18, className: 'text-amber-400' }),
        React.createElement('h3', { className: textPrimary + ' font-bold' }, '나의 성과')
      ),
      React.createElement(ChevronRight, { size: 16, className: textSecondary })
    ),
    React.createElement('div', { className: 'grid grid-cols-4 gap-2' },
      stats.map(function(stat, idx) {
        return React.createElement('div', {
          key: idx,
          className: 'text-center'
        },
          React.createElement('span', { className: 'text-lg' }, stat.icon),
          React.createElement('p', { className: textPrimary + ' font-bold' }, stat.value),
          React.createElement('p', { className: textSecondary + ' text-xs' }, stat.label)
        );
      })
    )
  );
};

// 📈 트렌드 미니 차트
export var TrendMiniChart = function(props) {
  var data = props.data || []; // [{ value: 5 }, { value: 3 }, ...]
  var darkMode = props.darkMode;
  var color = props.color || '#A996FF';
  var height = props.height || 40;
  
  if (data.length === 0) return null;
  
  var maxValue = Math.max(1, ...data.map(function(d) { return d.value || 0; }));
  var width = 100 / data.length;
  
  return React.createElement('div', { 
    className: 'flex items-end gap-0.5', 
    style: { height: height + 'px' }
  },
    data.map(function(item, idx) {
      var barHeight = ((item.value || 0) / maxValue) * height;
      return React.createElement('div', {
        key: idx,
        className: 'flex-1 rounded-t',
        style: { 
          height: Math.max(2, barHeight) + 'px',
          backgroundColor: color,
          opacity: 0.3 + ((idx / data.length) * 0.7)
        }
      });
    })
  );
};

// 🎯 목표 달성률 카드
export var GoalProgressCard = function(props) {
  var darkMode = props.darkMode;
  var weeklyGoal = props.weeklyGoal || 35; // 주간 할일 목표
  var currentProgress = props.currentProgress || 0;
  var daysLeft = props.daysLeft || 0;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var progress = Math.min(100, (currentProgress / weeklyGoal) * 100);
  var isOnTrack = (currentProgress / (7 - daysLeft)) >= (weeklyGoal / 7);
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Target, { size: 18, className: 'text-[#A996FF]' }),
        React.createElement('h3', { className: textPrimary + ' font-bold' }, '주간 목표')
      ),
      React.createElement('span', { 
        className: (isOnTrack ? 'text-emerald-500' : 'text-amber-500') + ' text-xs px-2 py-1 rounded-full ' +
          (isOnTrack ? 'bg-emerald-500/20' : 'bg-amber-500/20')
      }, isOnTrack ? '순항 중 🚀' : '힘내요! 💪')
    ),
    
    React.createElement('div', { className: 'mb-2' },
      React.createElement('div', { className: 'flex justify-between text-sm mb-1' },
        React.createElement('span', { className: textPrimary + ' font-bold' }, currentProgress + ' / ' + weeklyGoal),
        React.createElement('span', { className: 'text-[#A996FF]' }, Math.round(progress) + '%')
      ),
      React.createElement('div', { className: 'h-3 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' overflow-hidden' },
        React.createElement('div', {
          className: 'h-full rounded-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] transition-all',
          style: { width: progress + '%' }
        })
      )
    ),
    
    daysLeft > 0 && React.createElement('p', { className: textSecondary + ' text-xs' },
      '남은 ' + daysLeft + '일 동안 ' + Math.max(0, weeklyGoal - currentProgress) + '개 더 완료하면 목표 달성!'
    )
  );
};

export default {
  InsightCard: InsightCard,
  InsightsSection: InsightsSection,
  WeeklyReport: WeeklyReport,
  AchievementSummary: AchievementSummary,
  TrendMiniChart: TrendMiniChart,
  GoalProgressCard: GoalProgressCard,
  generateInsights: generateInsights
};
