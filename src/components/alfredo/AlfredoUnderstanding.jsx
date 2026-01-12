import React, { useState, useEffect } from 'react';
import { getLearnings, getLearningStats, calculateUnderstandingScore } from '../../utils/alfredoLearning';

/**
 * 알프레도 이해도 게이지 컴포넌트
 * - calculateUnderstandingScore 연동
 * - 피드백 통계 표시
 * - 레벨/칭호 시스템
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
  
  var levelInfo = getLevelAndTitle(understandingScore);
  
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
    var prevValue = barProps.prevValue || 0;
    var change = value - prevValue;
    
    return React.createElement('div', { className: 'relative' },
      React.createElement('div', { 
        className: (darkMode ? 'bg-gray-700' : 'bg-gray-200') + ' h-3 rounded-full overflow-hidden'
      },
        React.createElement('div', {
          className: 'h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all duration-500',
          style: { width: value + '%' }
        })
      ),
      change > 0 && React.createElement('span', { 
        className: 'absolute -top-1 right-0 text-xs text-emerald-500 font-medium'
      }, '+' + change + '%')
    );
  };
  
  return React.createElement('div', { className: bgCard + ' backdrop-blur-xl rounded-xl p-4' },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('h3', { className: textPrimary + ' font-bold flex items-center gap-2' },
        React.createElement('span', { className: 'text-xl' }, '🧠'),
        '알프레도가 당신을 이해하는 정도'
      )
    ),
    
    // 메인 스코어
    React.createElement('div', { className: 'text-center mb-4' },
      React.createElement('div', { className: 'text-4xl font-bold text-[#A996FF] mb-1' },
        understandingScore + '%'
      ),
      React.createElement('p', { className: textSecondary + ' text-sm flex items-center justify-center gap-1' },
        React.createElement('span', null, levelInfo.emoji),
        'Lv.' + levelInfo.level + ' "' + levelInfo.title + '"'
      )
    ),
    
    // 프로그레스 바
    React.createElement('div', { className: 'mb-6' },
      React.createElement(ProgressBar, { value: understandingScore })
    ),
    
    // 피드백 통계
    stats.totalFeedbacks > 0 && React.createElement('div', {
      className: (darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]') + ' rounded-xl p-3 mb-4'
    },
      React.createElement('div', { className: 'flex items-center justify-between text-xs' },
        React.createElement('div', { className: 'flex items-center gap-4' },
          React.createElement('span', { className: textSecondary },
            '학습 ' + stats.totalLearnings + '개'
          ),
          React.createElement('span', { className: textSecondary },
            '피드백 ' + stats.totalFeedbacks + '개'
          )
        ),
        React.createElement('span', { className: 'text-emerald-500 font-medium' },
          '👍 ' + stats.positiveRate + '%'
        )
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
            React.createElement('span', { className: 'text-emerald-500' }, '•'),
            React.createElement('span', null, '"' + item.content + '"')
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
    
    // 메시지
    React.createElement('div', { 
      className: (darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]') + ' rounded-xl p-3 mt-4 text-center'
    },
      React.createElement('p', { className: textSecondary + ' text-xs' },
        understandingScore < 50 
          ? '💬 "채팅에서 피드백을 주시면 더 빨리 배울 수 있어요"'
          : understandingScore < 80
            ? '💬 "점점 더 잘 알아가고 있어요!"'
            : '💬 "이제 꽤 잘 알게 된 것 같아요!"'
      )
    )
  );
};

export default AlfredoUnderstanding;
