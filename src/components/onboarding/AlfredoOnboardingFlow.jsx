/**
 * 🚀 알프레도 온보딩 플로우
 * 
 * 문서 기준 플로우:
 * - Phase 0: 펭귄 인사 (0-3초)
 * - Phase 1: 샘플 브리핑 체험 (10-30초)
 * - Phase 2: 질문 1개 - "어떤 도움을 원하세요?" (30-45초)
 * - Phase 3: 캘린더 연동 요청 (1분)
 * - Phase 4: 즉시 인사이트 (1분 30초)
 * - Phase 5: 완료 + 육성 시작 알림 (2분)
 * 
 * 총: 2-3분 / 설문: 1개 / 연동: 1개
 */

import React, { useState, useEffect } from 'react';
import SampleBriefingExperience from './SampleBriefingExperience';

function AlfredoOnboardingFlow(props) {
  var isDarkMode = props.isDarkMode !== false;
  var onComplete = props.onComplete;
  var onSkip = props.onSkip;
  
  // 현재 단계
  var _phaseState = useState(0);
  var phase = _phaseState[0];
  var setPhase = _phaseState[1];
  
  // 사용자 응답
  var _answerState = useState(null);
  var answer = _answerState[0];
  var setAnswer = _answerState[1];
  
  // 연동 상태
  var _connectedState = useState(false);
  var isConnected = _connectedState[0];
  var setIsConnected = _connectedState[1];
  
  // Phase 0: 펭귄 인사 자동 진행
  useEffect(function() {
    if (phase === 0) {
      var timer = setTimeout(function() {
        setPhase(1);
      }, 3000);
      return function() { clearTimeout(timer); };
    }
  }, [phase]);
  
  // 스타일
  var styles = {
    container: {
      backgroundColor: isDarkMode ? '#1a1a2e' : '#f8f9ff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: isDarkMode ? '#e0e0e0' : '#333'
    },
    
    // Phase 0: 펭귄 인사
    welcomeScreen: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      textAlign: 'center'
    },
    welcomePenguin: {
      fontSize: '96px',
      marginBottom: '24px',
      animation: 'bounce 1s ease infinite'
    },
    welcomeTitle: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '12px',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    welcomeSubtitle: {
      fontSize: '16px',
      opacity: 0.8,
      lineHeight: '1.6'
    },
    
    // Phase 2: 질문
    questionScreen: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px'
    },
    questionCard: {
      backgroundColor: isDarkMode ? '#252540' : '#ffffff',
      borderRadius: '24px',
      padding: '32px',
      maxWidth: '400px',
      width: '100%',
      boxShadow: isDarkMode 
        ? '0 8px 32px rgba(0,0,0,0.3)' 
        : '0 8px 32px rgba(99, 102, 241, 0.15)'
    },
    questionEmoji: {
      fontSize: '48px',
      textAlign: 'center',
      marginBottom: '20px'
    },
    questionText: {
      fontSize: '20px',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: '24px',
      lineHeight: '1.5'
    },
    optionButton: {
      width: '100%',
      padding: '16px 20px',
      borderRadius: '14px',
      border: '2px solid ' + (isDarkMode ? '#333' : '#e0e0e0'),
      backgroundColor: 'transparent',
      color: isDarkMode ? '#e0e0e0' : '#333',
      fontSize: '15px',
      textAlign: 'left',
      cursor: 'pointer',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s ease'
    },
    optionButtonSelected: {
      borderColor: '#6366f1',
      backgroundColor: isDarkMode ? '#2a2a5a' : '#f0f0ff'
    },
    optionEmoji: {
      fontSize: '24px'
    },
    optionContent: {
      flex: 1
    },
    optionLabel: {
      fontWeight: '600',
      marginBottom: '4px'
    },
    optionDesc: {
      fontSize: '13px',
      opacity: 0.7
    },
    
    // Phase 3: 캘린더 연동
    connectScreen: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px'
    },
    connectCard: {
      backgroundColor: isDarkMode ? '#252540' : '#ffffff',
      borderRadius: '24px',
      padding: '32px',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center',
      boxShadow: isDarkMode 
        ? '0 8px 32px rgba(0,0,0,0.3)' 
        : '0 8px 32px rgba(99, 102, 241, 0.15)'
    },
    connectEmoji: {
      fontSize: '56px',
      marginBottom: '20px'
    },
    connectTitle: {
      fontSize: '22px',
      fontWeight: '600',
      marginBottom: '12px'
    },
    connectDesc: {
      fontSize: '15px',
      opacity: 0.8,
      lineHeight: '1.6',
      marginBottom: '24px'
    },
    benefitsList: {
      textAlign: 'left',
      marginBottom: '24px'
    },
    benefitItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 0',
      fontSize: '14px'
    },
    connectButton: {
      width: '100%',
      padding: '16px 24px',
      borderRadius: '14px',
      border: 'none',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '12px'
    },
    skipButton: {
      background: 'none',
      border: 'none',
      color: isDarkMode ? '#666' : '#999',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '8px 16px'
    },
    privacyNote: {
      fontSize: '12px',
      opacity: 0.6,
      marginTop: '16px'
    },
    
    // Phase 4: 인사이트
    insightScreen: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px'
    },
    insightCard: {
      backgroundColor: isDarkMode ? '#252540' : '#ffffff',
      borderRadius: '24px',
      padding: '32px',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center',
      boxShadow: isDarkMode 
        ? '0 8px 32px rgba(0,0,0,0.3)' 
        : '0 8px 32px rgba(99, 102, 241, 0.15)'
    },
    insightEmoji: {
      fontSize: '56px',
      marginBottom: '20px'
    },
    insightTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '16px'
    },
    insightList: {
      textAlign: 'left',
      marginBottom: '24px'
    },
    insightItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px',
      backgroundColor: isDarkMode ? '#1a1a2e' : '#f8f9ff',
      borderRadius: '12px',
      marginBottom: '10px',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    
    // Phase 5: 완료
    completeScreen: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      textAlign: 'center'
    },
    completeEmoji: {
      fontSize: '80px',
      marginBottom: '24px'
    },
    completeTitle: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '12px'
    },
    completeDesc: {
      fontSize: '16px',
      opacity: 0.8,
      lineHeight: '1.6',
      marginBottom: '24px',
      maxWidth: '300px'
    },
    // 육성 알림 박스
    nurturingBox: {
      backgroundColor: isDarkMode ? '#1a1a2e' : '#f0f0ff',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      maxWidth: '300px',
      width: '100%'
    },
    nurturingHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
      fontSize: '14px',
      fontWeight: '600'
    },
    progressBarContainer: {
      backgroundColor: isDarkMode ? '#333' : '#e0e0e0',
      borderRadius: '8px',
      height: '8px',
      overflow: 'hidden',
      marginBottom: '8px'
    },
    progressBarFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
      borderRadius: '8px',
      transition: 'width 1s ease'
    },
    nurturingPercent: {
      fontSize: '12px',
      opacity: 0.7,
      textAlign: 'right'
    },
    nurturingNote: {
      fontSize: '13px',
      opacity: 0.8,
      marginTop: '12px',
      lineHeight: '1.5'
    },
    startButton: {
      padding: '18px 48px',
      borderRadius: '16px',
      border: 'none',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: '#fff',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
    },
    
    // 프로그레스 바
    progressBar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      backgroundColor: isDarkMode ? '#333' : '#e0e0e0'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
      transition: 'width 0.3s ease'
    }
  };
  
  // CSS 애니메이션
  useEffect(function() {
    var styleEl = document.createElement('style');
    styleEl.textContent = '\n      @keyframes bounce {\n        0%, 100% { transform: translateY(0); }\n        50% { transform: translateY(-10px); }\n      }\n      @keyframes fadeIn {\n        from { opacity: 0; transform: translateY(20px); }\n        to { opacity: 1; transform: translateY(0); }\n      }\n    ';
    document.head.appendChild(styleEl);
    return function() { document.head.removeChild(styleEl); };
  }, []);
  
  // 📋 문서 기준 질문 옵션들 (도움 유형)
  var questionOptions = [
    { 
      id: 'organize', 
      emoji: '📋', 
      label: '할 일 정리',
      desc: '뭐부터 해야 할지 모르겠어요'
    },
    { 
      id: 'balance', 
      emoji: '⚖️', 
      label: '워라밸',
      desc: '일과 삶의 균형을 잡고 싶어요'
    },
    { 
      id: 'condition', 
      emoji: '🧠', 
      label: '컨디션 관리',
      desc: '번아웃 없이 꾸준히 하고 싶어요'
    },
    { 
      id: 'explore', 
      emoji: '🤔', 
      label: '아직 잘 모르겠어요',
      desc: '일단 써보면서 알아갈래요'
    }
  ];
  
  // 질문 답변 처리
  function handleAnswer(optionId) {
    setAnswer(optionId);
    
    // 0.5초 후 다음 단계
    setTimeout(function() {
      setPhase(3);
    }, 500);
  }
  
  // 캘린더 연동 (시뮬레이션)
  function handleConnect() {
    setIsConnected(true);
    
    setTimeout(function() {
      setPhase(4);
    }, 1000);
  }
  
  // 연동 스킵
  function handleSkipConnect() {
    setPhase(5);
  }
  
  // 인사이트 확인 후 완료
  function handleInsightComplete() {
    setPhase(5);
  }
  
  // 온보딩 완료
  function handleComplete() {
    if (onComplete) {
      onComplete({ 
        helpType: answer,
        calendarConnected: isConnected
      });
    }
  }
  
  // 프로그레스 계산
  var progressPercent = (phase / 5) * 100;
  
  // Phase 0: 펭귄 인사
  if (phase === 0) {
    return React.createElement('div', { style: styles.container },
      React.createElement('div', { style: styles.progressBar },
        React.createElement('div', { style: Object.assign({}, styles.progressFill, { width: progressPercent + '%' }) })
      ),
      React.createElement('div', { style: styles.welcomeScreen },
        React.createElement('div', { style: styles.welcomePenguin }, '🐧'),
        React.createElement('div', { style: styles.welcomeTitle }, '안녕하세요, 알프레도예요'),
        React.createElement('div', { style: styles.welcomeSubtitle },
          '오늘 하루를 함께 정리해드릴게요'
        )
      )
    );
  }
  
  // Phase 1: 샘플 브리핑 체험
  if (phase === 1) {
    return React.createElement('div', { style: styles.container },
      React.createElement('div', { style: styles.progressBar },
        React.createElement('div', { style: Object.assign({}, styles.progressFill, { width: '20%' }) })
      ),
      React.createElement(SampleBriefingExperience, {
        isDarkMode: isDarkMode,
        onComplete: function() { setPhase(2); }
      })
    );
  }
  
  // Phase 2: 질문 1개 (문서 기준 - 도움 유형)
  if (phase === 2) {
    return React.createElement('div', { style: styles.container },
      React.createElement('div', { style: styles.progressBar },
        React.createElement('div', { style: Object.assign({}, styles.progressFill, { width: '40%' }) })
      ),
      React.createElement('div', { style: styles.questionScreen },
        React.createElement('div', { style: styles.questionCard },
          React.createElement('div', { style: styles.questionEmoji }, '🐧'),
          React.createElement('div', { style: styles.questionText },
            '저한테 어떤 도움을',
            React.createElement('br', null),
            '원하세요?'
          ),
          questionOptions.map(function(option) {
            var isSelected = answer === option.id;
            return React.createElement('button', {
              key: option.id,
              style: Object.assign({}, styles.optionButton, isSelected ? styles.optionButtonSelected : {}),
              onClick: function() { handleAnswer(option.id); }
            },
              React.createElement('span', { style: styles.optionEmoji }, option.emoji),
              React.createElement('div', { style: styles.optionContent },
                React.createElement('div', { style: styles.optionLabel }, option.label),
                React.createElement('div', { style: styles.optionDesc }, option.desc)
              )
            );
          })
        )
      )
    );
  }
  
  // Phase 3: 캘린더 연동
  if (phase === 3) {
    return React.createElement('div', { style: styles.container },
      React.createElement('div', { style: styles.progressBar },
        React.createElement('div', { style: Object.assign({}, styles.progressFill, { width: '60%' }) })
      ),
      React.createElement('div', { style: styles.connectScreen },
        React.createElement('div', { style: styles.connectCard },
          React.createElement('div', { style: styles.connectEmoji }, '📅'),
          React.createElement('div', { style: styles.connectTitle },
            '캘린더를 연결해주세요'
          ),
          React.createElement('div', { style: styles.connectDesc },
            '일정을 보고 맞춤 브리핑을 해드릴게요'
          ),
          
          React.createElement('div', { style: styles.benefitsList },
            React.createElement('div', { style: styles.benefitItem },
              React.createElement('span', null, '✅'),
              React.createElement('span', null, '미팅 전 리마인드')
            ),
            React.createElement('div', { style: styles.benefitItem },
              React.createElement('span', null, '✅'),
              React.createElement('span', null, '집중 시간 보호')
            ),
            React.createElement('div', { style: styles.benefitItem },
              React.createElement('span', null, '✅'),
              React.createElement('span', null, '당신만의 패턴 분석')
            )
          ),
          
          React.createElement('button', {
            style: styles.connectButton,
            onClick: handleConnect
          },
            React.createElement('img', {
              src: 'https://www.google.com/favicon.ico',
              alt: 'Google',
              style: { width: '20px', height: '20px' }
            }),
            'Google 캘린더 연결하기'
          ),
          
          React.createElement('button', {
            style: styles.skipButton,
            onClick: handleSkipConnect
          }, '나중에 할게요'),
          
          React.createElement('div', { style: styles.privacyNote },
            '🔒 캘린더 데이터는 절대 공유하지 않아요'
          )
        )
      )
    );
  }
  
  // Phase 4: 즉시 인사이트
  if (phase === 4) {
    return React.createElement('div', { style: styles.container },
      React.createElement('div', { style: styles.progressBar },
        React.createElement('div', { style: Object.assign({}, styles.progressFill, { width: '80%' }) })
      ),
      React.createElement('div', { style: styles.insightScreen },
        React.createElement('div', { style: styles.insightCard },
          React.createElement('div', { style: styles.insightEmoji }, '🎯'),
          React.createElement('div', { style: styles.insightTitle },
            '벌써 몇 가지 알게 됐어요!'
          ),
          
          React.createElement('div', { style: styles.insightList },
            React.createElement('div', { style: styles.insightItem },
              React.createElement('span', null, '📆'),
              React.createElement('span', null, '이번 주 미팅이 꽤 있네요. 집중 시간 확보해드릴게요.')
            ),
            React.createElement('div', { style: styles.insightItem },
              React.createElement('span', null, '🌅'),
              React.createElement('span', null, '오전에 일정이 많은 편이에요.')
            ),
            React.createElement('div', { style: styles.insightItem },
              React.createElement('span', null, '💡'),
              React.createElement('span', null, '시간이 지나면 더 많이 알게 될 거예요!')
            )
          ),
          
          React.createElement('button', {
            style: styles.connectButton,
            onClick: handleInsightComplete
          }, '좋아요!')
        )
      )
    );
  }
  
  // Phase 5: 완료 + 육성 시작 알림
  if (phase === 5) {
    return React.createElement('div', { style: styles.container },
      React.createElement('div', { style: styles.progressBar },
        React.createElement('div', { style: Object.assign({}, styles.progressFill, { width: '100%' }) })
      ),
      React.createElement('div', { style: styles.completeScreen },
        React.createElement('div', { style: styles.completeEmoji }, '🎉'),
        React.createElement('div', { style: styles.completeTitle },
          '준비 완료!'
        ),
        React.createElement('div', { style: styles.completeDesc },
          '알프레도가 조금씩 당신을 알아갈 거예요.'
        ),
        
        // 🐧 육성 시작 알림 박스
        React.createElement('div', { style: styles.nurturingBox },
          React.createElement('div', { style: styles.nurturingHeader },
            React.createElement('span', null, '🐧'),
            React.createElement('span', null, '알프레도가 당신을 이해하는 중...')
          ),
          React.createElement('div', { style: styles.progressBarContainer },
            React.createElement('div', { style: Object.assign({}, styles.progressBarFill, { width: '8%' }) })
          ),
          React.createElement('div', { style: styles.nurturingPercent },
            '현재 이해도: 8%'
          ),
          React.createElement('div', { style: styles.nurturingNote },
            '함께 시간을 보낼수록 더 잘 알게 될 거예요!'
          )
        ),
        
        React.createElement('button', {
          style: styles.startButton,
          onClick: handleComplete
        }, '시작하기')
      )
    );
  }
  
  return null;
}

export default AlfredoOnboardingFlow;
