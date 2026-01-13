import React, { useMemo } from 'react';
import { Dna, Brain, TrendingUp, Clock, Zap, Target, AlertCircle, Sparkles, BarChart3 } from 'lucide-react';

/**
 * 🧬 EnhancedInsightCards - DNA 및 고급 인사이트 카드 모음
 */

// DNA 확장 인사이트 카드
export var DNAInsightCard = function(props) {
  var dnaData = props.dnaData;
  var darkMode = props.darkMode;
  var onExpand = props.onExpand;
  
  if (!dnaData) return null;
  
  var bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // DNA 특성 요약
  var traits = [
    { label: '최적 집중 시간', value: dnaData.peakFocusTime || '오전 10-12시', icon: Clock },
    { label: '평균 집중 지속', value: (dnaData.avgFocusDuration || 25) + '분', icon: Target },
    { label: '선호 업무 유형', value: dnaData.preferredTaskType || '창의적 업무', icon: Zap }
  ];
  
  return React.createElement('div', { className: bgCard + ' rounded-2xl p-4 shadow-sm border border-purple-500/20' },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', { className: 'w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center' },
          React.createElement(Dna, { size: 20, className: 'text-white' })
        ),
        React.createElement('div', null,
          React.createElement('h3', { className: 'font-bold ' + textPrimary }, 'DNA 프로필'),
          React.createElement('p', { className: 'text-xs ' + textSecondary }, '당신만의 업무 패턴')
        )
      ),
      onExpand && React.createElement('button', {
        onClick: onExpand,
        className: 'text-xs text-purple-500 hover:text-purple-600'
      }, '자세히')
    ),
    
    // 특성 그리드
    React.createElement('div', { className: 'grid grid-cols-3 gap-2' },
      traits.map(function(trait, i) {
        var Icon = trait.icon;
        return React.createElement('div', {
          key: i,
          className: 'p-3 rounded-xl text-center ' + (darkMode ? 'bg-gray-700/50' : 'bg-purple-50')
        },
          React.createElement(Icon, { size: 16, className: 'text-purple-500 mx-auto mb-1' }),
          React.createElement('p', { className: 'text-xs ' + textSecondary + ' mb-0.5' }, trait.label),
          React.createElement('p', { className: 'text-sm font-semibold ' + textPrimary }, trait.value)
        );
      })
    ),
    
    // 인사이트 메시지
    dnaData.insight && React.createElement('div', {
      className: 'mt-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20'
    },
      React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
        React.createElement(Sparkles, { size: 14, className: 'text-purple-500' }),
        React.createElement('span', { className: 'text-xs font-semibold text-purple-500' }, 'AI 인사이트')
      ),
      React.createElement('p', { className: 'text-sm ' + textPrimary }, dnaData.insight)
    )
  );
};

// 생산성 패턴 카드
export var ProductivityPatternCard = function(props) {
  var patterns = props.patterns || {};
  var darkMode = props.darkMode;
  
  var bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 시간대별 생산성 (간소화)
  var hourlyData = patterns.hourlyProductivity || [
    { hour: '오전', level: 70 },
    { hour: '점심', level: 40 },
    { hour: '오후', level: 85 },
    { hour: '저녁', level: 50 }
  ];
  
  var maxLevel = Math.max.apply(null, hourlyData.map(function(d) { return d.level; }));
  
  return React.createElement('div', { className: bgCard + ' rounded-2xl p-4 shadow-sm' },
    React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
      React.createElement(BarChart3, { size: 18, className: 'text-blue-500' }),
      React.createElement('span', { className: 'font-bold ' + textPrimary }, '생산성 패턴')
    ),
    
    // 바 차트
    React.createElement('div', { className: 'flex items-end justify-between h-24 gap-2' },
      hourlyData.map(function(item, i) {
        var height = (item.level / maxLevel) * 100;
        var isMax = item.level === maxLevel;
        return React.createElement('div', {
          key: i,
          className: 'flex-1 flex flex-col items-center'
        },
          React.createElement('div', {
            className: 'w-full rounded-t-lg transition-all ' + (isMax ? 'bg-blue-500' : (darkMode ? 'bg-gray-600' : 'bg-blue-200')),
            style: { height: height + '%' }
          }),
          React.createElement('span', { className: 'text-xs ' + textSecondary + ' mt-1' }, item.hour)
        );
      })
    ),
    
    // 요약
    patterns.summary && React.createElement('p', {
      className: 'text-sm ' + textSecondary + ' mt-3 text-center'
    }, patterns.summary)
  );
};

// 스트릭 카드
export var StreakCard = function(props) {
  var currentStreak = props.currentStreak || 0;
  var longestStreak = props.longestStreak || 0;
  var darkMode = props.darkMode;
  
  var bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 스트릭 레벨 결정
  var level = currentStreak >= 30 ? 'legendary' : 
              currentStreak >= 14 ? 'master' :
              currentStreak >= 7 ? 'pro' :
              currentStreak >= 3 ? 'good' : 'starting';
  
  var levelInfo = {
    legendary: { emoji: '🔥', label: 'Legendary!', color: 'text-orange-500' },
    master: { emoji: '⭐', label: 'Master', color: 'text-yellow-500' },
    pro: { emoji: '💪', label: 'Pro', color: 'text-blue-500' },
    good: { emoji: '👍', label: 'Good', color: 'text-green-500' },
    starting: { emoji: '🌱', label: 'Starting', color: 'text-gray-500' }
  };
  
  var info = levelInfo[level];
  
  return React.createElement('div', { className: bgCard + ' rounded-2xl p-4 shadow-sm' },
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('div', null,
        React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
          React.createElement('span', { className: 'text-2xl' }, info.emoji),
          React.createElement('span', { className: 'font-bold ' + info.color }, info.label)
        ),
        React.createElement('p', { className: 'text-3xl font-bold ' + textPrimary }, currentStreak, '일'),
        React.createElement('p', { className: 'text-xs ' + textSecondary }, '연속 달성')
      ),
      React.createElement('div', { className: 'text-right' },
        React.createElement('p', { className: 'text-xs ' + textSecondary }, '최고 기록'),
        React.createElement('p', { className: 'text-lg font-semibold ' + textPrimary }, longestStreak, '일')
      )
    )
  );
};

// 오버로드 경고 카드
export var OverloadWarningCard = function(props) {
  var taskCount = props.taskCount || 0;
  var threshold = props.threshold || 7;
  var darkMode = props.darkMode;
  var onAction = props.onAction;
  
  if (taskCount < threshold) return null;
  
  var severity = taskCount >= threshold * 2 ? 'high' : taskCount >= threshold * 1.5 ? 'medium' : 'low';
  
  var severityInfo = {
    high: { 
      bg: darkMode ? 'bg-red-900/30' : 'bg-red-50', 
      border: 'border-red-500/30',
      text: 'text-red-600',
      message: '오늘 할 일이 너무 많아요. 우선순위를 정해볼까요?'
    },
    medium: { 
      bg: darkMode ? 'bg-amber-900/30' : 'bg-amber-50', 
      border: 'border-amber-500/30',
      text: 'text-amber-600',
      message: '할 일이 조금 많네요. 일부를 내일로 미뤄볼까요?'
    },
    low: { 
      bg: darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50', 
      border: 'border-yellow-500/30',
      text: 'text-yellow-600',
      message: '오늘 할 일이 많은 편이에요.'
    }
  };
  
  var info = severityInfo[severity];
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  
  return React.createElement('div', { className: info.bg + ' border ' + info.border + ' rounded-2xl p-4' },
    React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
      React.createElement(AlertCircle, { size: 18, className: info.text }),
      React.createElement('span', { className: 'font-bold ' + info.text }, '오버로드 감지')
    ),
    React.createElement('p', { className: 'text-sm ' + textPrimary + ' mb-3' }, info.message),
    React.createElement('div', { className: 'flex gap-2' },
      React.createElement('button', {
        onClick: function() { onAction && onAction('prioritize'); },
        className: 'flex-1 py-2 bg-white/50 rounded-lg text-sm font-medium ' + info.text
      }, '우선순위 정리'),
      React.createElement('button', {
        onClick: function() { onAction && onAction('delegate'); },
        className: 'flex-1 py-2 bg-white/50 rounded-lg text-sm font-medium ' + info.text
      }, '내일로 미루기')
    )
  );
};

// 에너지 예측 카드
export var EnergyPredictionCard = function(props) {
  var currentEnergy = props.currentEnergy || 50;
  var predictedDip = props.predictedDip;
  var darkMode = props.darkMode;
  
  var bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', { className: bgCard + ' rounded-2xl p-4 shadow-sm' },
    React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
      React.createElement(Zap, { size: 18, className: 'text-yellow-500' }),
      React.createElement('span', { className: 'font-bold ' + textPrimary }, '에너지 예측')
    ),
    
    // 현재 에너지 바
    React.createElement('div', { className: 'mb-3' },
      React.createElement('div', { className: 'flex justify-between text-xs ' + textSecondary + ' mb-1' },
        React.createElement('span', null, '현재 에너지'),
        React.createElement('span', null, currentEnergy, '%')
      ),
      React.createElement('div', { className: 'h-2 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-200') },
        React.createElement('div', {
          className: 'h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500',
          style: { width: currentEnergy + '%' }
        })
      )
    ),
    
    // 예측 메시지
    predictedDip && React.createElement('div', {
      className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-yellow-50')
    },
      React.createElement('p', { className: 'text-sm ' + textPrimary },
        '💡 ', predictedDip.time, '경에 에너지가 낮아질 것 같아요.'
      ),
      React.createElement('p', { className: 'text-xs ' + textSecondary + ' mt-1' },
        '추천: ', predictedDip.suggestion
      )
    )
  );
};

// useInsightGenerator 훅
export function useInsightGenerator(tasks, completedToday, energy) {
  return useMemo(function() {
    var insights = [];
    var hour = new Date().getHours();
    
    // 오버로드 체크
    var pendingTasks = tasks ? tasks.filter(function(t) { return !t.completed && t.status !== 'done'; }).length : 0;
    if (pendingTasks > 7) {
      insights.push({
        type: 'overload',
        priority: 1,
        data: { taskCount: pendingTasks, threshold: 7 }
      });
    }
    
    // 에너지 예측
    if (hour >= 13 && hour < 15 && energy > 60) {
      insights.push({
        type: 'energy',
        priority: 2,
        data: {
          currentEnergy: energy,
          predictedDip: { time: '오후 2-3시', suggestion: '가벼운 업무나 휴식' }
        }
      });
    }
    
    // 스트릭 축하
    if (completedToday >= 3) {
      insights.push({
        type: 'streak',
        priority: 3,
        data: { currentStreak: completedToday, longestStreak: Math.max(completedToday, 7) }
      });
    }
    
    return insights;
  }, [tasks, completedToday, energy]);
}

export default {
  DNAInsightCard: DNAInsightCard,
  ProductivityPatternCard: ProductivityPatternCard,
  StreakCard: StreakCard,
  OverloadWarningCard: OverloadWarningCard,
  EnergyPredictionCard: EnergyPredictionCard,
  useInsightGenerator: useInsightGenerator
};
