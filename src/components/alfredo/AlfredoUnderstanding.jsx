import React, { useState, useEffect } from 'react';

/**
 * 알프레도 이해도 게이지 컴포넌트
 * - 알프레도가 사용자를 이해하는 정도
 * - 이번 주 배운 것 / 아직 파악 중인 것
 */
var AlfredoUnderstanding = function(props) {
  var darkMode = props.darkMode;
  var learnings = props.learnings || [];
  
  // 이해도 점수 계산
  var calculateUnderstanding = function() {
    var baseScore = 20; // 기본 점수
    var learningBonus = learnings.length * 8; // 학습당 8점
    var total = Math.min(baseScore + learningBonus, 100);
    return total;
  };
  
  var understandingScore = calculateUnderstanding();
  
  // 레벨 & 칭호 계산
  var getLevelAndTitle = function(score) {
    if (score < 20) return { level: 1, title: '처음 만난 펭귄' };
    if (score < 35) return { level: 3, title: '이름을 기억하는 펭귄' };
    if (score < 50) return { level: 5, title: '취향을 아는 펭귄' };
    if (score < 65) return { level: 8, title: '당신의 아침을 아는 펭귄' };
    if (score < 80) return { level: 12, title: '당신의 리듬을 아는 펭귄' };
    if (score < 95) return { level: 18, title: '당신의 패턴을 꿰뚫는 펭귄' };
    return { level: 20, title: '당신의 모든 것을 아는 펭귄' };
  };
  
  var levelInfo = getLevelAndTitle(understandingScore);
  
  // 이번 주 배운 것 (가장 최근 3개)
  var recentLearnings = learnings.slice(-3).reverse();
  
  // 아직 파악 중인 것들 (Mock)
  var pendingLearnings = [
    '점심 후 에너지 패턴',
    '주말 계획 스타일',
    '스트레스 받을 때 선호 활동'
  ];
  
  // 다크모드 색상
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var bgCard = darkMode ? 'bg-gray-800' : 'bg-white/70';
  
  // 프로그레스 바 컴포넌트
  var ProgressBar = function(barProps) {
    var value = barProps.value;
    var showChange = barProps.showChange;
    
    return React.createElement('div', { className: 'relative' },
      React.createElement('div', { 
        className: (darkMode ? 'bg-gray-700' : 'bg-gray-200') + ' h-3 rounded-full overflow-hidden'
      },
        React.createElement('div', {
          className: 'h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all duration-500',
          style: { width: value + '%' }
        })
      ),
      showChange && React.createElement('span', { 
        className: 'absolute -top-1 right-0 text-xs text-emerald-500 font-medium'
      }, '+' + showChange + '%')
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
      React.createElement('p', { className: textSecondary + ' text-sm' },
        'Lv.' + levelInfo.level + ' "' + levelInfo.title + '"'
      )
    ),
    
    // 프로그레스 바
    React.createElement('div', { className: 'mb-6' },
      React.createElement(ProgressBar, { value: understandingScore, showChange: 12 })
    ),
    
    // 이번 주 배운 것
    recentLearnings.length > 0 && React.createElement('div', { className: 'mb-4' },
      React.createElement('p', { className: textSecondary + ' text-xs mb-2' }, '📚 이번 주 새로 배운 것'),
      React.createElement('div', { className: 'space-y-1' },
        recentLearnings.map(function(item, idx) {
          return React.createElement('div', { 
            key: idx,
            className: 'flex items-center gap-2 text-sm ' + textPrimary
          },
            React.createElement('span', { className: 'text-emerald-500' }, '•'),
            React.createElement('span', null, '"' + item.summary + '"')
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
        '💬 "2주 더 같이 지내면 더 잘 알 것 같아요"'
      )
    )
  );
};

export default AlfredoUnderstanding;
