/**
 * 🐧 샘플 브리핑 체험
 * 
 * 온보딩 원칙: "가치 먼저, 요청은 나중에"
 * - 캘린더 연동 전에 알프레도의 가치를 먼저 체험
 * - 가상의 브리핑 데이터로 "아~ 이런 거구나!" 경험
 * - Calm 방식: 3초 만에 가치 전달
 */

import React, { useState, useEffect } from 'react';

function SampleBriefingExperience(props) {
  var isDarkMode = props.isDarkMode !== false;
  var onComplete = props.onComplete;
  var userName = props.userName || '';
  
  // 애니메이션 단계
  var _stepState = useState(0);
  var step = _stepState[0];
  var setStep = _stepState[1];
  
  // 타이핑 효과
  var _typingState = useState('');
  var typingText = _typingState[0];
  var setTypingText = _typingState[1];
  
  // 샘플 브리핑 데이터 (가상)
  var sampleData = {
    greeting: userName ? userName + '님, 좋은 아침이에요! ☀️' : '좋은 아침이에요! ☀️',
    weather: '오늘 서울 맑음, 최고 8°C',
    schedules: [
      { time: '10:00', title: '팀 스탠드업 미팅', emoji: '👥' },
      { time: '14:00', title: '프로젝트 리뷰', emoji: '📋' },
      { time: '16:30', title: '1:1 미팅 (김대리)', emoji: '💬' }
    ],
    insight: '오후에 미팅이 몰려있네요. 오전에 집중 작업 추천드려요!',
    tip: '점심 후 15분 산책하면 오후 집중력이 올라가요 🚶'
  };
  
  // 단계별 자동 진행
  useEffect(function() {
    var timers = [];
    
    // Step 0: 펭귄 등장 (0초)
    // Step 1: 인사 (0.5초)
    timers.push(setTimeout(function() { setStep(1); }, 500));
    // Step 2: 날씨 (1.5초)
    timers.push(setTimeout(function() { setStep(2); }, 1500));
    // Step 3: 일정들 (2.5초)
    timers.push(setTimeout(function() { setStep(3); }, 2500));
    // Step 4: 인사이트 (4초)
    timers.push(setTimeout(function() { setStep(4); }, 4000));
    // Step 5: 팁 (5.5초)
    timers.push(setTimeout(function() { setStep(5); }, 5500));
    // Step 6: CTA 버튼 (7초)
    timers.push(setTimeout(function() { setStep(6); }, 7000));
    
    return function() {
      timers.forEach(function(t) { clearTimeout(t); });
    };
  }, []);
  
  // 스타일
  var styles = {
    container: {
      backgroundColor: isDarkMode ? '#1a1a2e' : '#f8f9ff',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    
    // 브리핑 카드
    briefingCard: {
      backgroundColor: isDarkMode ? '#252540' : '#ffffff',
      borderRadius: '24px',
      padding: '28px',
      maxWidth: '380px',
      width: '100%',
      boxShadow: isDarkMode 
        ? '0 8px 32px rgba(0,0,0,0.3)' 
        : '0 8px 32px rgba(99, 102, 241, 0.15)',
      position: 'relative',
      overflow: 'hidden'
    },
    
    // 펭귄
    penguinSection: {
      textAlign: 'center',
      marginBottom: '20px'
    },
    penguin: {
      fontSize: '64px',
      animation: 'bounce 1s ease infinite',
      display: 'inline-block'
    },
    
    // 인사
    greeting: {
      fontSize: '20px',
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#333',
      textAlign: 'center',
      marginBottom: '16px',
      opacity: step >= 1 ? 1 : 0,
      transform: step >= 1 ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 0.4s ease'
    },
    
    // 날씨
    weatherBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: isDarkMode ? '#333355' : '#e8f4ff',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      color: isDarkMode ? '#88ccff' : '#0066cc',
      marginBottom: '20px',
      opacity: step >= 2 ? 1 : 0,
      transform: step >= 2 ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 0.4s ease'
    },
    
    // 일정 섹션
    scheduleSection: {
      marginBottom: '20px',
      opacity: step >= 3 ? 1 : 0,
      transform: step >= 3 ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 0.4s ease'
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: isDarkMode ? '#888' : '#666',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '12px'
    },
    scheduleItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      backgroundColor: isDarkMode ? '#1a1a2e' : '#f8f9ff',
      borderRadius: '12px',
      marginBottom: '8px'
    },
    scheduleEmoji: {
      fontSize: '20px'
    },
    scheduleTime: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#6366f1',
      minWidth: '50px'
    },
    scheduleTitle: {
      fontSize: '14px',
      color: isDarkMode ? '#e0e0e0' : '#333'
    },
    
    // 인사이트 버블
    insightBubble: {
      backgroundColor: isDarkMode ? '#2a2a4a' : '#fff8e6',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '12px',
      borderLeft: '4px solid #f59e0b',
      opacity: step >= 4 ? 1 : 0,
      transform: step >= 4 ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 0.4s ease'
    },
    insightText: {
      fontSize: '14px',
      color: isDarkMode ? '#fbbf24' : '#92400e',
      lineHeight: '1.5'
    },
    
    // 팁 버블
    tipBubble: {
      backgroundColor: isDarkMode ? '#1a3a2a' : '#e8f5e9',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '24px',
      borderLeft: '4px solid #10b981',
      opacity: step >= 5 ? 1 : 0,
      transform: step >= 5 ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 0.4s ease'
    },
    tipText: {
      fontSize: '14px',
      color: isDarkMode ? '#6ee7b7' : '#065f46',
      lineHeight: '1.5'
    },
    
    // CTA 섹션
    ctaSection: {
      textAlign: 'center',
      opacity: step >= 6 ? 1 : 0,
      transform: step >= 6 ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 0.4s ease'
    },
    ctaText: {
      fontSize: '14px',
      color: isDarkMode ? '#aaa' : '#666',
      marginBottom: '16px',
      lineHeight: '1.6'
    },
    ctaButton: {
      width: '100%',
      padding: '16px 24px',
      borderRadius: '14px',
      border: 'none',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
    },
    
    // 하단 라벨
    sampleLabel: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      backgroundColor: isDarkMode ? '#4a4a6a' : '#e0e0ff',
      color: isDarkMode ? '#a0a0ff' : '#6366f1',
      fontSize: '11px',
      fontWeight: '600',
      padding: '4px 10px',
      borderRadius: '10px'
    },
    
    // 스킵 버튼
    skipButton: {
      marginTop: '16px',
      background: 'none',
      border: 'none',
      color: isDarkMode ? '#666' : '#999',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '8px 16px'
    }
  };
  
  // CSS 애니메이션 추가
  useEffect(function() {
    var styleEl = document.createElement('style');
    styleEl.textContent = '\n      @keyframes bounce {\n        0%, 100% { transform: translateY(0); }\n        50% { transform: translateY(-8px); }\n      }\n      @keyframes fadeInUp {\n        from { opacity: 0; transform: translateY(20px); }\n        to { opacity: 1; transform: translateY(0); }\n      }\n    ';
    document.head.appendChild(styleEl);
    return function() { document.head.removeChild(styleEl); };
  }, []);
  
  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.briefingCard },
      // 샘플 라벨
      React.createElement('div', { style: styles.sampleLabel }, '✨ 미리보기'),
      
      // 펭귄
      React.createElement('div', { style: styles.penguinSection },
        React.createElement('span', { style: styles.penguin }, '🐧')
      ),
      
      // 인사
      React.createElement('div', { style: styles.greeting },
        sampleData.greeting
      ),
      
      // 날씨
      React.createElement('div', { style: { textAlign: 'center' } },
        React.createElement('span', { style: styles.weatherBadge },
          '🌤️ ', sampleData.weather
        )
      ),
      
      // 일정 섹션
      React.createElement('div', { style: styles.scheduleSection },
        React.createElement('div', { style: styles.sectionTitle }, '📅 오늘 일정'),
        sampleData.schedules.map(function(schedule, idx) {
          return React.createElement('div', { 
            key: idx, 
            style: Object.assign({}, styles.scheduleItem, {
              opacity: step >= 3 ? 1 : 0,
              transform: step >= 3 ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.3s ease ' + (idx * 0.1) + 's'
            })
          },
            React.createElement('span', { style: styles.scheduleEmoji }, schedule.emoji),
            React.createElement('span', { style: styles.scheduleTime }, schedule.time),
            React.createElement('span', { style: styles.scheduleTitle }, schedule.title)
          );
        })
      ),
      
      // 인사이트
      React.createElement('div', { style: styles.insightBubble },
        React.createElement('div', { style: styles.insightText },
          '💡 ', sampleData.insight
        )
      ),
      
      // 팁
      React.createElement('div', { style: styles.tipBubble },
        React.createElement('div', { style: styles.tipText },
          '🌿 ', sampleData.tip
        )
      ),
      
      // CTA
      React.createElement('div', { style: styles.ctaSection },
        React.createElement('div', { style: styles.ctaText },
          '이런 식으로 매일 아침 브리핑해드릴게요!',
          React.createElement('br', null),
          '캘린더를 연결하면 진짜 일정으로 시작할 수 있어요.'
        ),
        React.createElement('button', {
          style: styles.ctaButton,
          onClick: onComplete
        }, '내 캘린더로 시작하기 →')
      )
    ),
    
    // 스킵
    React.createElement('button', {
      style: styles.skipButton,
      onClick: onComplete
    }, '나중에 할게요')
  );
}

export default SampleBriefingExperience;
