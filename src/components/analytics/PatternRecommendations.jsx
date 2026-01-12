import React, { useMemo } from 'react';
import { useDailyConditions } from '../../hooks/useDailyConditions';

// 🎯 패턴 기반 추천 시스템
// DNA 확장 엔진의 핵심 - 컨디션 패턴을 기반으로 맞춤 추천 제공
// "물어보지 않고 알아내는" 개인화

var PatternRecommendations = function(props) {
  var onAction = props.onAction;
  var compact = props.compact;
  
  var dailyConditions = useDailyConditions();
  var CONDITION_LEVELS = dailyConditions.CONDITION_LEVELS;
  
  // 현재 시간 정보
  var now = new Date();
  var currentHour = now.getHours();
  var currentDayOfWeek = now.getDay();
  var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 시간대 판단
  var getTimeOfDay = function() {
    if (currentHour >= 5 && currentHour < 12) return 'morning';
    if (currentHour >= 12 && currentHour < 17) return 'afternoon';
    if (currentHour >= 17 && currentHour < 21) return 'evening';
    return 'night';
  };
  var timeOfDay = getTimeOfDay();
  
  // 오늘 컨디션
  var todayCondition = dailyConditions.getTodayCondition();
  
  // 패턴 기반 추천 생성
  var recommendations = useMemo(function() {
    var recs = [];
    var weekdayAvg = dailyConditions.weekdayAverages;
    var timeAvg = dailyConditions.timeOfDayAverages;
    var stats = dailyConditions.overallStats;
    
    // 1. 요일 기반 추천
    var todayAvg = weekdayAvg[currentDayOfWeek];
    if (todayAvg.average && todayAvg.count >= 2) {
      if (todayAvg.average <= 2.5) {
        recs.push({
          id: 'weekday_warning',
          type: 'caution',
          priority: 'high',
          emoji: '⚠️',
          title: dayNames[currentDayOfWeek] + '요일 주의보',
          description: '평소 ' + dayNames[currentDayOfWeek] + '요일은 컨디션이 낮은 편이에요. 오늘은 무리하지 마세요.',
          action: {
            label: '가벼운 태스크 보기',
            type: 'show_light_tasks'
          },
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        });
      } else if (todayAvg.average >= 4) {
        recs.push({
          id: 'weekday_good',
          type: 'opportunity',
          priority: 'medium',
          emoji: '🌟',
          title: dayNames[currentDayOfWeek] + '요일 파워타임!',
          description: '평소 ' + dayNames[currentDayOfWeek] + '요일은 컨디션이 좋은 편이에요. 중요한 일 하기 좋아요!',
          action: {
            label: '중요한 태스크 보기',
            type: 'show_important_tasks'
          },
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        });
      }
    }
    
    // 2. 시간대 기반 추천
    var currentTimeAvg = timeAvg[timeOfDay];
    if (currentTimeAvg) {
      if (currentTimeAvg <= 2.5) {
        var timeLabels = {
          morning: '오전',
          afternoon: '오후',
          evening: '저녁',
          night: '밤'
        };
        recs.push({
          id: 'time_warning',
          type: 'caution',
          priority: 'medium',
          emoji: '💤',
          title: timeLabels[timeOfDay] + ' 슬럼프 시간대',
          description: '이 시간대는 보통 에너지가 낮은 편이에요. 휴식이나 가벼운 일을 추천해요.',
          action: {
            label: '휴식 타이머 시작',
            type: 'start_break'
          },
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        });
      }
    }
    
    // 3. 오늘 컨디션 기반 추천
    if (todayCondition) {
      var level = todayCondition.level;
      if (level <= 2) {
        recs.push({
          id: 'today_low',
          type: 'care',
          priority: 'high',
          emoji: '🤗',
          title: '오늘은 쉬어가는 날',
          description: '컨디션이 낮은 날이에요. 자기 돌봄이 우선이에요.',
          action: {
            label: '셀프케어 추천 보기',
            type: 'show_selfcare'
          },
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        });
      } else if (level >= 4) {
        recs.push({
          id: 'today_high',
          type: 'opportunity',
          priority: 'medium',
          emoji: '⚡',
          title: '에너지 충만한 날!',
          description: '오늘 컨디션이 좋아요! 미뤄둔 일을 해치우기 좋은 날이에요.',
          action: {
            label: '미룬 태스크 보기',
            type: 'show_postponed'
          },
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        });
      }
    }
    
    // 4. 스트릭 관련 추천
    if (stats.currentStreak === 0) {
      recs.push({
        id: 'streak_start',
        type: 'nudge',
        priority: 'low',
        emoji: '🔥',
        title: '오늘 컨디션 기록하기',
        description: '지금 컨디션은 어떠세요? 기록하면 패턴을 분석해드려요!',
        action: {
          label: '컨디션 기록',
          type: 'record_condition'
        },
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      });
    } else if (stats.currentStreak >= 7 && stats.currentStreak % 7 === 0) {
      recs.push({
        id: 'streak_milestone',
        type: 'celebration',
        priority: 'high',
        emoji: '🎉',
        title: stats.currentStreak + '일 연속 기록!',
        description: '대단해요! 꾸준히 기록하고 계시네요.',
        action: null,
        bgColor: 'bg-gradient-to-r from-purple-50 to-pink-50',
        borderColor: 'border-purple-200'
      });
    }
    
    // 5. 데이터 부족 시 온보딩 추천
    if (stats.totalDays < 7) {
      recs.push({
        id: 'onboarding',
        type: 'info',
        priority: 'low',
        emoji: '📊',
        title: '패턴 분석 준비 중',
        description: stats.totalDays + '/7일 기록됨. 7일 이상 기록하면 더 정확한 패턴을 알려드려요!',
        action: null,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      });
    }
    
    // 6. 최적 시간대 추천
    if (stats.totalDays >= 7) {
      var bestTime = null;
      var bestAvg = 0;
      Object.keys(timeAvg).forEach(function(time) {
        if (timeAvg[time] && timeAvg[time] > bestAvg) {
          bestAvg = timeAvg[time];
          bestTime = time;
        }
      });
      
      if (bestTime && bestAvg >= 3.5 && bestTime !== timeOfDay) {
        var timeEmojis = {
          morning: '🌅',
          afternoon: '☀️',
          evening: '🌆',
          night: '🌙'
        };
        var timeNames = {
          morning: '오전',
          afternoon: '오후',
          evening: '저녁',
          night: '밤'
        };
        recs.push({
          id: 'best_time',
          type: 'insight',
          priority: 'low',
          emoji: timeEmojis[bestTime],
          title: '최적 집중 시간: ' + timeNames[bestTime],
          description: '데이터에 따르면 ' + timeNames[bestTime] + '에 컨디션이 가장 좋아요!',
          action: {
            label: '스케줄 조정하기',
            type: 'adjust_schedule'
          },
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200'
        });
      }
    }
    
    // 우선순위별 정렬
    var priorityOrder = { high: 0, medium: 1, low: 2 };
    recs.sort(function(a, b) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    return recs;
  }, [dailyConditions.conditions, currentDayOfWeek, timeOfDay, todayCondition]);
  
  // 액션 핸들러
  var handleAction = function(action) {
    if (onAction && action) {
      onAction(action);
    }
  };
  
  // 컴팩트 뷰 (홈에서 사용)
  if (compact) {
    var topRec = recommendations[0];
    if (!topRec) return null;
    
    return React.createElement('div', {
      className: topRec.bgColor + ' border ' + topRec.borderColor + ' rounded-xl p-4'
    },
      React.createElement('div', { className: 'flex items-start gap-3' },
        React.createElement('span', { className: 'text-2xl' }, topRec.emoji),
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('p', { className: 'font-medium text-gray-900 text-sm' }, topRec.title),
          React.createElement('p', { className: 'text-xs text-gray-600 mt-0.5 line-clamp-2' }, topRec.description),
          topRec.action && React.createElement('button', {
            className: 'mt-2 text-xs font-medium text-blue-600 hover:text-blue-700',
            onClick: function() { handleAction(topRec.action); }
          }, topRec.action.label + ' →')
        )
      )
    );
  }
  
  // 전체 뷰
  return React.createElement('div', { className: 'space-y-4' },
    // 헤더
    React.createElement('div', null,
      React.createElement('h2', { className: 'text-xl font-bold text-gray-900 flex items-center gap-2' },
        '🎯 맞춤 추천'
      ),
      React.createElement('p', { className: 'text-sm text-gray-500 mt-1' },
        '당신의 패턴을 기반으로 알프레도가 추천해요'
      )
    ),
    
    // 추천 카드들
    recommendations.length > 0 ? React.createElement('div', { className: 'space-y-3' },
      recommendations.map(function(rec) {
        return React.createElement('div', {
          key: rec.id,
          className: rec.bgColor + ' border ' + rec.borderColor + ' rounded-2xl p-4 transition-all hover:shadow-md'
        },
          React.createElement('div', { className: 'flex items-start gap-3' },
            React.createElement('span', { className: 'text-2xl' }, rec.emoji),
            React.createElement('div', { className: 'flex-1' },
              React.createElement('div', { className: 'flex items-center gap-2' },
                React.createElement('p', { className: 'font-semibold text-gray-900' }, rec.title),
                rec.priority === 'high' && React.createElement('span', {
                  className: 'px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-medium rounded'
                }, '중요')
              ),
              React.createElement('p', { className: 'text-sm text-gray-600 mt-1 leading-relaxed' }, rec.description),
              rec.action && React.createElement('button', {
                className: 'mt-3 px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors',
                onClick: function() { handleAction(rec.action); }
              }, rec.action.label)
            )
          )
        );
      })
    ) : React.createElement('div', { className: 'bg-gray-50 rounded-2xl p-6 text-center' },
      React.createElement('p', { className: 'text-4xl mb-2' }, '🐧'),
      React.createElement('p', { className: 'text-gray-600' },
        '컨디션 기록이 쌓이면'
      ),
      React.createElement('p', { className: 'text-gray-600' },
        '맞춤 추천을 드릴 수 있어요!'
      )
    ),
    
    // 알프레도 팁
    React.createElement('div', { className: 'bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-4' },
      React.createElement('div', { className: 'flex items-start gap-3' },
        React.createElement('span', { className: 'text-2xl' }, '🐧'),
        React.createElement('div', null,
          React.createElement('p', { className: 'font-medium text-purple-900 text-sm' }, '알프레도의 팁'),
          React.createElement('p', { className: 'text-xs text-purple-700 mt-1' },
            '매일 컨디션을 기록하면 더 정확한 패턴을 발견할 수 있어요. 같은 시간대에 기록하면 더욱 좋아요!'
          )
        )
      )
    )
  );
};

// 홈페이지용 컴팩트 위젯
export var PatternInsightWidget = function(props) {
  return React.createElement(PatternRecommendations, {
    compact: true,
    onAction: props.onAction
  });
};

export default PatternRecommendations;
