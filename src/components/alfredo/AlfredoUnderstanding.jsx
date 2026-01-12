import React, { useState, useEffect } from 'react';
import { getLearnings, getLearningStats, calculateUnderstandingScore } from '../../utils/alfredoLearning';
import AlfredoWeeklyReport from './AlfredoWeeklyReport';

/**
 * 알프레도 이해도 게이지 컴포넌트 (Phase 3)
 * - calculateUnderstandingScore 연동
 * - 피드백 통계 표시
 * - 레벨/칭호 시스템
 * - 주간 성장 리포트 버튼
 */
var AlfredoUnderstanding = function(props) {
  var darkMode = props.darkMode;
  
  var _scoreState = useState(function() { return calculateUnderstandingScore(); });
  var understandingScore = _scoreState[0];
  var setUnderstandingScore = _scoreState[1];
  
  var _statsState = useState(function() { return getLearningStats(); });
  var stats = _statsState[0];
  var setStats = _statsState[1];
  
  var _learningsState = useState(function() { return getLearnings(); });
  var learnings = _learningsState[0];
  var setLearnings = _learningsState[1];
  
  // 주간 리포트 모달
  var _reportState = useState(false);
  var showReport = _reportState[0];
  var setShowReport = _reportState[1];
  
  // 데이터 새로고침
  var refreshData = function() {
    setUnderstandingScore(calculateUnderstandingScore());
    setStats(getLearningStats());
    setLearnings(getLearnings());
  };
  
  useEffect(function() {
    refreshData();
    var interval = setInterval(refreshData, 60000);
    return function() { clearInterval(interval); };
  }, []);
  
  // 레벨 & 칭호 계산
  var getLevelAndTitle = function(score) {
    if (score < 20) return { level: 1, title: '처음 만난 펭귄', emoji: '🐣' };
    if (score < 35) return { level: 3, title: '이름을 기억하는 펭귄', emoji: '👋' };
    if (score < 50) return { level: 5, title: '취향을 아는 펭귄', emoji: '❤️' };
    if (score < 65) return { level: 8, title: '당신의 아침을 아는 펭귄', emoji: '🌅' };
    if (score < 80) return { level: 12, title: '당신의 리듬을 아는 펭귄', emoji: '🎵' };
    if (score < 95) return { level: 18, title: '당신의 패턴을 꿰뚫는 펭귄', emoji: '🧠' };
    return { level: 20, title: '당신의 모든 것을 아는 펭귄', emoji: '✨' };
  };
  
  // 다음 레벨까지 필요한 점수
  var getNextLevelProgress = function(score) {
    var thresholds = [20, 35, 50, 65, 80, 95, 100];
    for (var i = 0; i < thresholds.length; i++) {
      if (score < thresholds[i]) {
        var prevThreshold = i === 0 ? 0 : thresholds[i - 1];
        var progress = ((score - prevThreshold) / (thresholds[i] - prevThreshold)) * 100;
        var remaining = thresholds[i] - score;
        return { progress: progress, remaining: remaining, nextThreshold: thresholds[i] };
      }
    }
    return { progress: 100, remaining: 0, nextThreshold: 100 };
  };
  
  var levelInfo = getLevelAndTitle(understandingScore);
  var nextLevel = getNextLevelProgress(understandingScore);
  
  // 최근 학습 (최신 3개)
  var recentLearnings = learnings.slice(-3).reverse();
  
  // 아직 파악 중인 것들
  var getPendingLearnings = function() {
    var pending = [];
    if (!learnings.find(function(l) { return l.category === 'energy'; })) {
      pending.push('에너지 패턴');
    }
    if (!learnings.find(function(l) { return l.category === 'time'; })) {
      pending.push('시간대별 선호도');
    }
    if (!learnings.find(function(l) { return l.category === 'style'; })) {
      pending.push('대화 스타일 선호');
    }
    if (pending.length === 0) {
      pending.push('더 깊은 패턴');
    }
    return pending.slice(0, 3);
  };
  
  var pendingLearnings = getPendingLearnings();
  
  // 다크모드 색상
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var bgCard = darkMode ? 'bg-gray-800' : 'bg-white/70';
  
  // 프로그레스 바 컴포넌트
  var ProgressBar = function(barProps) {
    var value = barProps.value;
    
    return React.createElement('div', { className: 'relative' },
      React.createElement('div', { 
        className: (darkMode ? 'bg-gray-700' : 'bg-gray-200') + ' h-3 rounded-full overflow-hidden'
      },
        React.createElement('div', {
          className: 'h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all duration-500',
          style: { width: value + '%' }
        })
      )
    );
  };
  
  return React.createElement('div', { className: bgCard + ' backdrop-blur-xl rounded-xl p-4' },
    // 헤더 + 주간 리포트 버튼
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('h3', { className: textPrimary + ' font-bold flex items-center gap-2' },
        React.createElement('span', { className: 'text-xl' }, '🧠'),
        '알프레도가 당신을 이해하는 정도'
      ),
      React.createElement('button', {
        onClick: function() { setShowReport(true); },
        className: 'text-xs px-2 py-1 rounded-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white hover:opacity-90 transition-opacity flex items-center gap-1'
      },
        React.createElement('span', null, '📊'),
        '주간 리포트'
      )
    ),
    
    // 메인 스코어 + 레벨 표시
    React.createElement('div', { className: 'text-center mb-4' },
      React.createElement('div', { className: 'inline-flex items-center gap-2 bg-gradient-to-r from-[#A996FF]/20 to-[#8B7CF7]/20 px-4 py-2 rounded-full mb-3' },
        React.createElement('span', { className: 'text-2xl' }, levelInfo.emoji),
        React.createElement('span', { className: textPrimary + ' font-medium' }, 
          'Lv.' + levelInfo.level + ' ' + levelInfo.title
        )
      ),
      React.createElement('div', { className: 'text-5xl font-bold text-[#A996FF] mb-2' },
        understandingScore + '%'
      ),
      nextLevel.remaining > 0 && React.createElement('p', { className: textSecondary + ' text-xs' },
        '다음 레벨까지 ' + nextLevel.remaining + '% 남음'
      )
    ),
    
    // 프로그레스 바
    React.createElement('div', { className: 'mb-6' },
      React.createElement(ProgressBar, { value: understandingScore })
    ),
    
    // 피드백 통계 카드
    React.createElement('div', { className: 'grid grid-cols-3 gap-2 mb-4' },
      // 총 학습
      React.createElement('div', { 
        className: (darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]') + ' rounded-lg p-2 text-center'
      },
        React.createElement('p', { className: 'text-lg font-bold text-[#A996FF]' }, stats.totalLearnings || 0),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '학습')
      ),
      // 피드백
      React.createElement('div', { 
        className: (darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]') + ' rounded-lg p-2 text-center'
      },
        React.createElement('p', { className: 'text-lg font-bold text-[#A996FF]' }, stats.totalFeedbacks || 0),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '피드백')
      ),
      // 긍정률
      React.createElement('div', { 
        className: (darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]') + ' rounded-lg p-2 text-center'
      },
        React.createElement('p', { className: 'text-lg font-bold text-emerald-500' }, 
          (stats.positiveRate || 0) + '%'
        ),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '👍 비율')
      )
    ),
    
    // 이번 주 배운 것
    recentLearnings.length > 0 && React.createElement('div', { className: 'mb-4' },
      React.createElement('p', { className: textSecondary + ' text-xs mb-2' }, '📚 최근 배운 것'),
      React.createElement('div', { className: 'space-y-1' },
        recentLearnings.map(function(item, idx) {
          return React.createElement('div', { 
            key: idx,
            className: 'flex items-center gap-2 text-sm ' + textPrimary
          },
            React.createElement('span', { className: 'text-emerald-500' }, '✓'),
            React.createElement('span', null, item.content)
          );
        })
      )
    ),
    
    // 아직 파악 중
    React.createElement('div', null,
      React.createElement('p', { className: textSecondary + ' text-xs mb-2' }, '❓ 아직 파악 중'),
      React.createElement('div', { className: 'space-y-1' },
        pendingLearnings.map(function(item, idx) {
          return React.createElement('div', { 
            key: idx,
            className: 'flex items-center gap-2 text-sm ' + textSecondary
          },
            React.createElement('span', null, '•'),
            React.createElement('span', null, item)
          );
        })
      )
    ),
    
    // 격려 메시지
    React.createElement('div', { 
      className: (darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]') + ' rounded-xl p-3 mt-4'
    },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('span', { className: 'text-2xl' }, '🐧'),
        React.createElement('p', { className: textSecondary + ' text-sm' },
          understandingScore < 30 
            ? '"아직 서로 알아가는 중이에요. 천천히 함께해요!"'
            : understandingScore < 50 
              ? '"조금씩 알아가고 있어요! 더 많이 대화해요!"'
              : understandingScore < 70
                ? '"점점 더 잘 맞아가는 것 같아요!"'
                : understandingScore < 90
                  ? '"이제 꽤 잘 알게 된 것 같아요!"'
                  : '"이제 당신을 정말 잘 이해해요! ✨"'
        )
      )
    ),
    
    // 주간 리포트 모달
    showReport && React.createElement(AlfredoWeeklyReport, {
      darkMode: darkMode,
      onClose: function() { setShowReport(false); }
    })
  );
};

export default AlfredoUnderstanding;
