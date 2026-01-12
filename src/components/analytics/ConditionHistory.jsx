import React, { useState, useMemo } from 'react';
import { useDailyConditions } from '../../hooks/useDailyConditions';

// 📊 컨디션 히스토리 - 주간/월간 리포트
// ADHD 친화적 디자인: 심플한 차트, 직관적인 인사이트

var DAY_NAMES_SHORT = ['일', '월', '화', '수', '목', '금', '토'];
var DAY_NAMES_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
var TIME_OF_DAY_LABELS = {
  morning: { emoji: '🌅', label: '아침', color: '#fbbf24' },
  afternoon: { emoji: '☀️', label: '오후', color: '#f97316' },
  evening: { emoji: '🌆', label: '저녁', color: '#8b5cf6' },
  night: { emoji: '🌙', label: '밤', color: '#3b82f6' }
};

var ConditionHistory = function(props) {
  var onShowYearPixels = props.onShowYearPixels;
  
  var periodState = useState('week'); // 'week' | 'month'
  var period = periodState[0];
  var setPeriod = periodState[1];
  
  var dailyConditions = useDailyConditions();
  var CONDITION_LEVELS = dailyConditions.CONDITION_LEVELS;
  
  // 최근 7일 데이터
  var weekData = useMemo(function() {
    return dailyConditions.getRecentConditions(7);
  }, [dailyConditions.conditions]);
  
  // 최근 30일 데이터
  var monthData = useMemo(function() {
    return dailyConditions.getRecentConditions(30);
  }, [dailyConditions.conditions]);
  
  var currentData = period === 'week' ? weekData : monthData;
  
  // 기간 통계 계산
  var periodStats = useMemo(function() {
    var recordedDays = currentData.filter(function(d) { return d.level !== null; });
    var levels = recordedDays.map(function(d) { return d.level; });
    
    if (levels.length === 0) {
      return {
        average: null,
        best: null,
        worst: null,
        recordedDays: 0,
        totalDays: currentData.length
      };
    }
    
    var sum = levels.reduce(function(a, b) { return a + b; }, 0);
    var avg = sum / levels.length;
    var best = Math.max.apply(Math, levels);
    var worst = Math.min.apply(Math, levels);
    
    return {
      average: Math.round(avg * 10) / 10,
      best: best,
      worst: worst,
      recordedDays: recordedDays.length,
      totalDays: currentData.length
    };
  }, [currentData]);
  
  // 미니 바 차트 렌더링
  var renderMiniBarChart = function() {
    var maxLevel = 5;
    
    return React.createElement('div', { className: 'bg-white rounded-2xl p-5 shadow-sm' },
      React.createElement('h3', { className: 'text-sm font-medium text-gray-700 mb-4' },
        period === 'week' ? '최근 7일' : '최근 30일'
      ),
      React.createElement('div', { className: 'flex items-end gap-1 h-24' },
        currentData.map(function(day, idx) {
          var hasRecord = day.level !== null;
          var height = hasRecord ? (day.level / maxLevel) * 100 : 10;
          var levelInfo = hasRecord ? CONDITION_LEVELS[day.level] : null;
          
          return React.createElement('div', {
            key: day.date,
            className: 'flex-1 flex flex-col items-center'
          },
            React.createElement('div', {
              className: 'w-full rounded-t-md transition-all duration-300 hover:opacity-80',
              style: {
                height: height + '%',
                backgroundColor: hasRecord ? levelInfo.color : '#e5e7eb',
                minHeight: '4px'
              },
              title: day.date + ': ' + (hasRecord ? levelInfo.label : '기록 없음')
            }),
            period === 'week' && React.createElement('span', { 
              className: 'text-[10px] text-gray-400 mt-1'
            }, day.dayName)
          );
        })
      ),
      // 평균 라인
      periodStats.average && React.createElement('div', {
        className: 'relative mt-2 pt-2 border-t border-dashed border-gray-200'
      },
        React.createElement('div', { className: 'flex items-center justify-between text-xs text-gray-500' },
          React.createElement('span', null, '평균'),
          React.createElement('span', { className: 'font-medium' }, periodStats.average.toFixed(1))
        )
      )
    );
  };
  
  // 요일별 패턴
  var renderWeekdayPattern = function() {
    var weekdayAvg = dailyConditions.weekdayAverages;
    
    return React.createElement('div', { className: 'bg-white rounded-2xl p-5 shadow-sm' },
      React.createElement('h3', { className: 'text-sm font-medium text-gray-700 mb-4' },
        '📅 요일별 패턴'
      ),
      React.createElement('div', { className: 'space-y-2' },
        weekdayAvg.map(function(day, idx) {
          if (!day.average) {
            return React.createElement('div', {
              key: idx,
              className: 'flex items-center gap-3'
            },
              React.createElement('span', { className: 'w-8 text-xs text-gray-500' }, day.day),
              React.createElement('div', { className: 'flex-1 h-6 bg-gray-100 rounded-full' }),
              React.createElement('span', { className: 'text-xs text-gray-400 w-8' }, '-')
            );
          }
          
          var level = Math.round(day.average);
          var levelInfo = CONDITION_LEVELS[level] || CONDITION_LEVELS[3];
          var width = (day.average / 5) * 100;
          
          return React.createElement('div', {
            key: idx,
            className: 'flex items-center gap-3'
          },
            React.createElement('span', { className: 'w-8 text-xs font-medium text-gray-600' }, day.day),
            React.createElement('div', { className: 'flex-1 h-6 bg-gray-100 rounded-full overflow-hidden' },
              React.createElement('div', {
                className: 'h-full rounded-full transition-all duration-500',
                style: { 
                  width: width + '%',
                  backgroundColor: levelInfo.color 
                }
              })
            ),
            React.createElement('span', { className: 'text-sm' }, levelInfo.emoji)
          );
        })
      )
    );
  };
  
  // 시간대별 패턴
  var renderTimePattern = function() {
    var timeAvg = dailyConditions.timeOfDayAverages;
    
    return React.createElement('div', { className: 'bg-white rounded-2xl p-5 shadow-sm' },
      React.createElement('h3', { className: 'text-sm font-medium text-gray-700 mb-4' },
        '⏰ 시간대별 패턴'
      ),
      React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
        Object.keys(TIME_OF_DAY_LABELS).map(function(key) {
          var info = TIME_OF_DAY_LABELS[key];
          var avg = timeAvg[key];
          var level = avg ? Math.round(avg) : null;
          var levelInfo = level ? CONDITION_LEVELS[level] : null;
          
          return React.createElement('div', {
            key: key,
            className: 'flex items-center gap-3 p-3 bg-gray-50 rounded-xl'
          },
            React.createElement('span', { className: 'text-xl' }, info.emoji),
            React.createElement('div', null,
              React.createElement('p', { className: 'text-xs text-gray-500' }, info.label),
              React.createElement('p', { 
                className: 'text-sm font-medium',
                style: { color: levelInfo ? levelInfo.color : '#9ca3af' }
              }, 
                avg ? avg.toFixed(1) : '-'
              )
            )
          );
        })
      )
    );
  };
  
  // 인사이트 카드
  var renderInsights = function() {
    var insights = dailyConditions.insights;
    
    if (insights.length === 0) {
      return React.createElement('div', { className: 'bg-purple-50 rounded-2xl p-5' },
        React.createElement('div', { className: 'text-center' },
          React.createElement('p', { className: 'text-4xl mb-2' }, '🐧'),
          React.createElement('p', { className: 'text-sm text-purple-700' },
            '컨디션 기록을 쌓으면'
          ),
          React.createElement('p', { className: 'text-sm text-purple-700' },
            '알프레도가 패턴을 발견해드려요!'
          )
        )
      );
    }
    
    return React.createElement('div', { className: 'bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5' },
      React.createElement('h3', { className: 'text-sm font-medium text-gray-700 mb-3 flex items-center gap-2' },
        '💡 알프레도의 발견'
      ),
      React.createElement('div', { className: 'space-y-2' },
        insights.map(function(insight, idx) {
          return React.createElement('div', {
            key: idx,
            className: 'flex items-start gap-2 p-3 bg-white/60 rounded-xl'
          },
            React.createElement('span', { className: 'text-lg' }, insight.emoji),
            React.createElement('p', { className: 'text-sm text-gray-700 leading-relaxed' }, insight.text)
          );
        })
      )
    );
  };
  
  // 기간 요약 카드
  var renderPeriodSummary = function() {
    var stats = periodStats;
    var bestLevelInfo = stats.best ? CONDITION_LEVELS[stats.best] : null;
    var worstLevelInfo = stats.worst ? CONDITION_LEVELS[stats.worst] : null;
    
    return React.createElement('div', { className: 'bg-white rounded-2xl p-5 shadow-sm' },
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('h3', { className: 'text-sm font-medium text-gray-700' }, '📊 기간 요약'),
        React.createElement('span', { className: 'text-xs text-gray-400' },
          stats.recordedDays + '/' + stats.totalDays + '일 기록'
        )
      ),
      stats.recordedDays > 0 ? React.createElement('div', { className: 'grid grid-cols-3 gap-3' },
        // 평균
        React.createElement('div', { className: 'text-center p-3 bg-gray-50 rounded-xl' },
          React.createElement('p', { className: 'text-2xl font-bold text-gray-900' },
            stats.average ? stats.average.toFixed(1) : '-'
          ),
          React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, '평균')
        ),
        // 최고
        React.createElement('div', { className: 'text-center p-3 bg-green-50 rounded-xl' },
          React.createElement('p', { className: 'text-2xl' }, bestLevelInfo ? bestLevelInfo.emoji : '-'),
          React.createElement('p', { className: 'text-xs text-green-600 mt-1' }, '최고')
        ),
        // 최저
        React.createElement('div', { className: 'text-center p-3 bg-orange-50 rounded-xl' },
          React.createElement('p', { className: 'text-2xl' }, worstLevelInfo ? worstLevelInfo.emoji : '-'),
          React.createElement('p', { className: 'text-xs text-orange-600 mt-1' }, '최저')
        )
      ) : React.createElement('div', { className: 'text-center py-4 text-gray-400' },
        React.createElement('p', { className: 'text-sm' }, '아직 기록이 없어요')
      )
    );
  };
  
  // 전체 통계
  var renderOverallStats = function() {
    var stats = dailyConditions.overallStats;
    
    return React.createElement('div', { className: 'bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-5 text-white' },
      React.createElement('h3', { className: 'text-sm font-medium opacity-80 mb-4' }, '🏆 전체 통계'),
      React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
        React.createElement('div', null,
          React.createElement('p', { className: 'text-3xl font-bold' }, stats.totalDays),
          React.createElement('p', { className: 'text-xs opacity-80' }, '총 기록 일수')
        ),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-3xl font-bold' },
            stats.averageLevel ? stats.averageLevel.toFixed(1) : '-'
          ),
          React.createElement('p', { className: 'text-xs opacity-80' }, '평균 컨디션')
        ),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-3xl font-bold flex items-center gap-1' },
            stats.currentStreak,
            stats.currentStreak >= 3 && React.createElement('span', { className: 'text-xl' }, '🔥')
          ),
          React.createElement('p', { className: 'text-xs opacity-80' }, '연속 기록')
        ),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-3xl font-bold' }, stats.maxStreak),
          React.createElement('p', { className: 'text-xs opacity-80' }, '최장 스트릭')
        )
      ),
      // Year in Pixels 바로가기
      onShowYearPixels && React.createElement('button', {
        className: 'w-full mt-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors',
        onClick: onShowYearPixels
      }, '🎨 Year in Pixels 보기')
    );
  };
  
  // 분포 차트
  var renderDistribution = function() {
    var stats = dailyConditions.overallStats;
    var distribution = stats.distribution;
    var total = stats.totalDays || 1;
    
    return React.createElement('div', { className: 'bg-white rounded-2xl p-5 shadow-sm' },
      React.createElement('h3', { className: 'text-sm font-medium text-gray-700 mb-4' }, '📈 컨디션 분포'),
      React.createElement('div', { className: 'space-y-2' },
        [5, 4, 3, 2, 1].map(function(level) {
          var count = distribution[level] || 0;
          var percentage = Math.round((count / total) * 100);
          var levelInfo = CONDITION_LEVELS[level];
          
          return React.createElement('div', {
            key: level,
            className: 'flex items-center gap-3'
          },
            React.createElement('span', { className: 'text-lg w-8' }, levelInfo.emoji),
            React.createElement('div', { className: 'flex-1 h-4 bg-gray-100 rounded-full overflow-hidden' },
              React.createElement('div', {
                className: 'h-full rounded-full transition-all duration-500',
                style: {
                  width: percentage + '%',
                  backgroundColor: levelInfo.color
                }
              })
            ),
            React.createElement('span', { className: 'text-xs text-gray-500 w-12 text-right' },
              count + '일 (' + percentage + '%)'
            )
          );
        })
      )
    );
  };
  
  return React.createElement('div', { className: 'space-y-4' },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('div', null,
        React.createElement('h2', { className: 'text-xl font-bold text-gray-900' }, '📊 컨디션 리포트'),
        React.createElement('p', { className: 'text-sm text-gray-500 mt-1' },
          '나의 컨디션 패턴을 분석해봐요'
        )
      )
    ),
    
    // 기간 토글
    React.createElement('div', { className: 'flex bg-gray-100 rounded-xl p-1' },
      React.createElement('button', {
        className: 'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ' + 
          (period === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'),
        onClick: function() { setPeriod('week'); }
      }, '주간'),
      React.createElement('button', {
        className: 'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ' + 
          (period === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'),
        onClick: function() { setPeriod('month'); }
      }, '월간')
    ),
    
    // 미니 바 차트
    renderMiniBarChart(),
    
    // 기간 요약
    renderPeriodSummary(),
    
    // 인사이트
    renderInsights(),
    
    // 요일별/시간대별 패턴
    React.createElement('div', { className: 'grid grid-cols-1 gap-4' },
      renderWeekdayPattern(),
      renderTimePattern()
    ),
    
    // 분포
    renderDistribution(),
    
    // 전체 통계
    renderOverallStats()
  );
};

export default ConditionHistory;
