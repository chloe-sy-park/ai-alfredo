import React, { useState, useEffect } from 'react';
import { getLearnings, getFeedbacks, getLearningStats } from '../../utils/alfredoLearning';

/**
 * 알프레도 주간 성장 리포트 컴포넌트
 * - 이번 주 피드백 통계
 * - 새로 배운 것들
 * - 이해도 변화 시각화
 * - 다음 주 목표
 */
var AlfredoWeeklyReport = function(props) {
  var darkMode = props.darkMode;
  var onClose = props.onClose;
  
  // 주간 데이터 상태
  var _dataState = useState({
    weeklyFeedbacks: [],
    weeklyLearnings: [],
    stats: {},
    previousWeekStats: {},
    weekDates: { start: '', end: '' }
  });
  var weeklyData = _dataState[0];
  var setWeeklyData = _dataState[1];
  
  // 데이터 로드
  useEffect(function() {
    var now = new Date();
    var startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // 이번 주 일요일
    startOfWeek.setHours(0, 0, 0, 0);
    
    var endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 이번 주 토요일
    endOfWeek.setHours(23, 59, 59, 999);
    
    var startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    
    var allFeedbacks = getFeedbacks();
    var allLearnings = getLearnings();
    
    // 이번 주 피드백 필터
    var weeklyFeedbacks = allFeedbacks.filter(function(f) {
      var date = new Date(f.createdAt);
      return date >= startOfWeek && date <= endOfWeek;
    });
    
    // 이번 주 학습 필터
    var weeklyLearnings = allLearnings.filter(function(l) {
      var date = new Date(l.createdAt);
      return date >= startOfWeek && date <= endOfWeek;
    });
    
    // 지난 주 피드백 필터 (비교용)
    var lastWeekFeedbacks = allFeedbacks.filter(function(f) {
      var date = new Date(f.createdAt);
      return date >= startOfLastWeek && date < startOfWeek;
    });
    
    // 통계 계산
    var positiveCount = weeklyFeedbacks.filter(function(f) { return f.feedbackType === 'positive'; }).length;
    var negativeCount = weeklyFeedbacks.filter(function(f) { return f.feedbackType === 'negative'; }).length;
    var positiveRate = weeklyFeedbacks.length > 0 
      ? Math.round(positiveCount / weeklyFeedbacks.length * 100) 
      : 0;
    
    var lastPositiveCount = lastWeekFeedbacks.filter(function(f) { return f.feedbackType === 'positive'; }).length;
    var lastPositiveRate = lastWeekFeedbacks.length > 0
      ? Math.round(lastPositiveCount / lastWeekFeedbacks.length * 100)
      : 0;
    
    // 요일별 피드백 분포
    var dailyDistribution = [0, 0, 0, 0, 0, 0, 0]; // 일~토
    weeklyFeedbacks.forEach(function(f) {
      var day = new Date(f.createdAt).getDay();
      dailyDistribution[day]++;
    });
    
    // 시간대별 피드백 분포
    var hourlyDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    weeklyFeedbacks.forEach(function(f) {
      var hour = f.context.hour || new Date(f.createdAt).getHours();
      if (hour >= 6 && hour < 12) hourlyDistribution.morning++;
      else if (hour >= 12 && hour < 18) hourlyDistribution.afternoon++;
      else if (hour >= 18 && hour < 22) hourlyDistribution.evening++;
      else hourlyDistribution.night++;
    });
    
    setWeeklyData({
      weeklyFeedbacks: weeklyFeedbacks,
      weeklyLearnings: weeklyLearnings,
      stats: {
        totalFeedbacks: weeklyFeedbacks.length,
        positiveCount: positiveCount,
        negativeCount: negativeCount,
        positiveRate: positiveRate,
        newLearnings: weeklyLearnings.length,
        dailyDistribution: dailyDistribution,
        hourlyDistribution: hourlyDistribution
      },
      previousWeekStats: {
        totalFeedbacks: lastWeekFeedbacks.length,
        positiveRate: lastPositiveRate
      },
      weekDates: {
        start: startOfWeek.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        end: endOfWeek.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      }
    });
  }, []);
  
  // 다크모드 색상
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  var bgSection = darkMode ? 'bg-gray-700/50' : 'bg-gray-50';
  
  // 변화율 계산
  var rateChange = weeklyData.stats.positiveRate - weeklyData.previousWeekStats.positiveRate;
  var isImproved = rateChange > 0;
  
  // 요일 이름
  var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 가장 활발한 요일 찾기
  var maxDayIndex = weeklyData.stats.dailyDistribution 
    ? weeklyData.stats.dailyDistribution.indexOf(Math.max.apply(null, weeklyData.stats.dailyDistribution))
    : 0;
  
  // 개선 포인트 분석
  var getImprovementSuggestion = function() {
    var stats = weeklyData.stats;
    if (stats.positiveRate < 50) {
      return '조금 더 상황에 맞는 대화를 연습할게요';
    }
    if (stats.negativeCount > stats.positiveCount) {
      return '피드백을 참고해서 톤을 조정해볼게요';
    }
    if (stats.totalFeedbacks < 5) {
      return '더 많이 대화하면서 배워갈게요';
    }
    return '이대로 잘 맞아가고 있어요!';
  };
  
  // 성장 메시지
  var getGrowthMessage = function() {
    var learnings = weeklyData.weeklyLearnings.length;
    var rate = weeklyData.stats.positiveRate;
    
    if (learnings >= 3 && rate >= 70) {
      return '이번 주 많이 성장했어요! 🎉';
    }
    if (learnings >= 1 && rate >= 50) {
      return '점점 더 잘 맞아가고 있어요 ✨';
    }
    if (weeklyData.stats.totalFeedbacks === 0) {
      return '이번 주는 대화가 없었네요 🥲';
    }
    return '함께 성장해가는 중이에요 🌱';
  };
  
  return React.createElement('div', { 
    className: 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'
  },
    React.createElement('div', { 
      className: bgCard + ' rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl'
    },
      // 헤더
      React.createElement('div', { 
        className: 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] p-5 rounded-t-2xl'
      },
        React.createElement('div', { className: 'flex justify-between items-start' },
          React.createElement('div', null,
            React.createElement('h2', { className: 'text-white text-xl font-bold mb-1' }, 
              '📊 주간 성장 리포트'
            ),
            React.createElement('p', { className: 'text-white/80 text-sm' }, 
              weeklyData.weekDates.start + ' - ' + weeklyData.weekDates.end
            )
          ),
          React.createElement('button', {
            onClick: onClose,
            className: 'text-white/80 hover:text-white text-xl'
          }, '✕')
        ),
        // 성장 메시지
        React.createElement('div', { 
          className: 'mt-4 bg-white/20 rounded-xl p-4 text-center'
        },
          React.createElement('span', { className: 'text-3xl' }, '🐧'),
          React.createElement('p', { className: 'text-white font-medium mt-2' }, getGrowthMessage())
        )
      ),
      
      // 본문
      React.createElement('div', { className: 'p-5 space-y-5' },
        
        // 핵심 지표
        React.createElement('div', { className: 'grid grid-cols-3 gap-3' },
          // 총 피드백
          React.createElement('div', { className: bgSection + ' rounded-xl p-3 text-center' },
            React.createElement('p', { className: textSecondary + ' text-xs mb-1' }, '총 피드백'),
            React.createElement('p', { className: textPrimary + ' text-2xl font-bold' }, 
              weeklyData.stats.totalFeedbacks || 0
            )
          ),
          // 긍정 비율
          React.createElement('div', { className: bgSection + ' rounded-xl p-3 text-center' },
            React.createElement('p', { className: textSecondary + ' text-xs mb-1' }, '긍정 비율'),
            React.createElement('p', { className: textPrimary + ' text-2xl font-bold' }, 
              (weeklyData.stats.positiveRate || 0) + '%'
            ),
            rateChange !== 0 && React.createElement('p', { 
              className: 'text-xs ' + (isImproved ? 'text-green-500' : 'text-red-400')
            }, 
              (isImproved ? '▲' : '▼') + ' ' + Math.abs(rateChange) + '%'
            )
          ),
          // 새로 배운 것
          React.createElement('div', { className: bgSection + ' rounded-xl p-3 text-center' },
            React.createElement('p', { className: textSecondary + ' text-xs mb-1' }, '새로 배운 것'),
            React.createElement('p', { className: textPrimary + ' text-2xl font-bold' }, 
              weeklyData.stats.newLearnings || 0
            )
          )
        ),
        
        // 요일별 활동
        React.createElement('div', { className: bgSection + ' rounded-xl p-4' },
          React.createElement('p', { className: textPrimary + ' font-medium text-sm mb-3' }, 
            '📅 요일별 대화량'
          ),
          React.createElement('div', { className: 'flex justify-between items-end h-16 gap-1' },
            weeklyData.stats.dailyDistribution && weeklyData.stats.dailyDistribution.map(function(count, idx) {
              var maxCount = Math.max.apply(null, weeklyData.stats.dailyDistribution) || 1;
              var height = (count / maxCount * 100) || 5;
              var isMax = idx === maxDayIndex && count > 0;
              
              return React.createElement('div', { 
                key: idx, 
                className: 'flex-1 flex flex-col items-center gap-1'
              },
                React.createElement('div', {
                  className: 'w-full rounded-t ' + 
                    (isMax ? 'bg-gradient-to-t from-[#A996FF] to-[#8B7CF7]' : 
                      (darkMode ? 'bg-gray-600' : 'bg-gray-300')),
                  style: { height: height + '%', minHeight: '4px' }
                }),
                React.createElement('span', { 
                  className: textSecondary + ' text-xs ' + (isMax ? 'font-bold' : '')
                }, dayNames[idx])
              );
            })
          ),
          maxDayIndex !== undefined && weeklyData.stats.dailyDistribution && weeklyData.stats.dailyDistribution[maxDayIndex] > 0 && 
            React.createElement('p', { className: textSecondary + ' text-xs mt-2 text-center' },
              dayNames[maxDayIndex] + '요일에 가장 많이 대화했어요!'
            )
        ),
        
        // 시간대별 분포
        React.createElement('div', { className: bgSection + ' rounded-xl p-4' },
          React.createElement('p', { className: textPrimary + ' font-medium text-sm mb-3' }, 
            '⏰ 시간대별 분포'
          ),
          React.createElement('div', { className: 'grid grid-cols-4 gap-2' },
            [
              { key: 'morning', emoji: '🌅', label: '오전', count: weeklyData.stats.hourlyDistribution?.morning || 0 },
              { key: 'afternoon', emoji: '☀️', label: '오후', count: weeklyData.stats.hourlyDistribution?.afternoon || 0 },
              { key: 'evening', emoji: '🌆', label: '저녁', count: weeklyData.stats.hourlyDistribution?.evening || 0 },
              { key: 'night', emoji: '🌙', label: '밤', count: weeklyData.stats.hourlyDistribution?.night || 0 }
            ].map(function(item) {
              return React.createElement('div', { 
                key: item.key,
                className: 'text-center'
              },
                React.createElement('span', { className: 'text-lg' }, item.emoji),
                React.createElement('p', { className: textSecondary + ' text-xs' }, item.label),
                React.createElement('p', { className: textPrimary + ' font-bold' }, item.count)
              );
            })
          )
        ),
        
        // 이번 주 배운 것들
        weeklyData.weeklyLearnings.length > 0 && React.createElement('div', { 
          className: bgSection + ' rounded-xl p-4'
        },
          React.createElement('p', { className: textPrimary + ' font-medium text-sm mb-3' }, 
            '📚 이번 주 새로 배운 것'
          ),
          React.createElement('div', { className: 'space-y-2' },
            weeklyData.weeklyLearnings.slice(0, 5).map(function(learning) {
              return React.createElement('div', { 
                key: learning.id,
                className: 'flex items-center gap-2'
              },
                React.createElement('span', { className: 'text-sm' }, '✨'),
                React.createElement('span', { className: textSecondary + ' text-sm' }, 
                  learning.content
                )
              );
            })
          ),
          weeklyData.weeklyLearnings.length > 5 && React.createElement('p', { 
            className: textSecondary + ' text-xs mt-2'
          }, '외 ' + (weeklyData.weeklyLearnings.length - 5) + '개 더...')
        ),
        
        // 다음 주 목표
        React.createElement('div', { 
          className: 'bg-gradient-to-r from-[#A996FF]/10 to-[#8B7CF7]/10 rounded-xl p-4 border border-[#A996FF]/30'
        },
          React.createElement('p', { className: textPrimary + ' font-medium text-sm mb-2' }, 
            '🎯 다음 주 목표'
          ),
          React.createElement('p', { className: textSecondary + ' text-sm' }, 
            getImprovementSuggestion()
          )
        ),
        
        // 닫기 버튼
        React.createElement('button', {
          onClick: onClose,
          className: 'w-full py-3 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-medium'
        }, '확인했어요!')
      )
    )
  );
};

export default AlfredoWeeklyReport;
