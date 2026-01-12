/**
 * 🎯 알프레도 개인화 온보딩 컴포넌트
 * 
 * 2개의 질문으로 사용자 유형 파악 → 프리셋 추천
 * 1. 데이터와의 관계 (데이터 덕후 / 적당히 궁금 / 심플하게)
 * 2. 동기부여 스타일 (도전과 보상 / 흐름대로 / 중간)
 */

var React = require('react');
var useState = React.useState;
var useMemo = React.useMemo;

// 개인화 시스템 import
var Personalization = typeof window !== 'undefined' && window.AlfredoPersonalization 
  ? window.AlfredoPersonalization 
  : require('../../utils/alfredoPersonalization');

var ONBOARDING_QUESTIONS = Personalization.ONBOARDING_QUESTIONS;
var PRESETS = Personalization.PRESETS;

function AlfredoPersonalizationOnboarding(props) {
  var isDarkMode = props.isDarkMode !== false;
  var onComplete = props.onComplete; // (presetKey, values) => void
  var onSkip = props.onSkip;
  
  // 현재 단계 (0: 시작, 1: 질문1, 2: 질문2, 3: 결과)
  var _stepState = useState(0);
  var step = _stepState[0];
  var setStep = _stepState[1];
  
  // 선택한 답변들
  var _answersState = useState([]);
  var answers = _answersState[0];
  var setAnswers = _answersState[1];
  
  // 추천 결과
  var recommendation = useMemo(function() {
    if (answers.length >= 2) {
      return Personalization.recommendPresetFromAnswers(answers);
    }
    return null;
  }, [answers]);
  
  // 답변 선택
  function handleSelect(questionIndex, option) {
    var newAnswers = answers.slice();
    newAnswers[questionIndex] = option;
    setAnswers(newAnswers);
    
    // 다음 단계로
    setTimeout(function() {
      setStep(step + 1);
    }, 300);
  }
  
  // 완료
  function handleComplete(useRecommendation) {
    if (useRecommendation && recommendation) {
      Personalization.applyPreset(recommendation.closestPreset, 'global');
      if (onComplete) {
        onComplete(recommendation.closestPreset, recommendation.values);
      }
    } else {
      // 커스텀으로 시작
      if (onComplete) {
        onComplete('custom', recommendation ? recommendation.values : PRESETS.balance.values);
      }
    }
  }
  
  // 스타일
  var styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    container: {
      backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
      color: isDarkMode ? '#e0e0e0' : '#333333',
      borderRadius: '24px',
      padding: '32px',
      maxWidth: '480px',
      width: '100%',
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    
    // 시작 화면
    welcomeEmoji: {
      fontSize: '64px',
      marginBottom: '24px'
    },
    welcomeTitle: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '12px'
    },
    welcomeDesc: {
      fontSize: '16px',
      opacity: 0.8,
      marginBottom: '32px',
      lineHeight: '1.6'
    },
    
    // 질문 화면
    progressBar: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      marginBottom: '32px'
    },
    progressDot: {
      width: '8px',
      height: '8px',
      borderRadius: '4px',
      transition: 'all 0.3s ease'
    },
    progressDotActive: {
      backgroundColor: '#6366f1',
      width: '24px'
    },
    progressDotInactive: {
      backgroundColor: isDarkMode ? '#444' : '#ddd'
    },
    progressDotDone: {
      backgroundColor: '#10B981'
    },
    
    question: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '24px',
      lineHeight: '1.4'
    },
    
    optionList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    optionCard: {
      padding: '20px',
      borderRadius: '16px',
      border: '2px solid transparent',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px'
    },
    optionEmoji: {
      fontSize: '32px',
      lineHeight: '1'
    },
    optionContent: {
      flex: 1
    },
    optionLabel: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '4px'
    },
    optionDesc: {
      fontSize: '14px',
      opacity: 0.7
    },
    
    // 결과 화면
    resultEmoji: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    resultTitle: {
      fontSize: '22px',
      fontWeight: '700',
      marginBottom: '8px'
    },
    resultPreset: {
      fontSize: '18px',
      color: '#6366f1',
      marginBottom: '24px'
    },
    
    resultCard: {
      backgroundColor: isDarkMode ? '#252540' : '#f8f9fa',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      textAlign: 'left'
    },
    resultItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid ' + (isDarkMode ? '#333' : '#eee')
    },
    resultItemLast: {
      borderBottom: 'none'
    },
    resultLabel: {
      fontSize: '14px',
      opacity: 0.8
    },
    resultValue: {
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    
    // 버튼
    buttonPrimary: {
      width: '100%',
      padding: '16px 24px',
      borderRadius: '12px',
      border: 'none',
      backgroundColor: '#6366f1',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: '12px',
      transition: 'all 0.2s ease'
    },
    buttonSecondary: {
      width: '100%',
      padding: '14px 24px',
      borderRadius: '12px',
      border: '2px solid ' + (isDarkMode ? '#444' : '#ddd'),
      backgroundColor: 'transparent',
      color: isDarkMode ? '#e0e0e0' : '#333',
      fontSize: '15px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    skipButton: {
      background: 'none',
      border: 'none',
      color: isDarkMode ? '#888' : '#999',
      fontSize: '14px',
      cursor: 'pointer',
      marginTop: '16px'
    }
  };
  
  // 현재 질문 인덱스
  var questionIndex = step - 1;
  var currentQuestion = ONBOARDING_QUESTIONS[questionIndex];
  
  // 결과에서 표시할 레벨들
  function getResultLevels() {
    if (!recommendation) return [];
    
    var levels = Personalization.getAllLevels(recommendation.values);
    return [
      { key: 'dataDepth', name: '데이터 깊이', level: levels.dataDepth },
      { key: 'notificationStyle', name: '알림 스타일', level: levels.notificationStyle },
      { key: 'visualStyle', name: '시각화', level: levels.visualStyle },
      { key: 'motivationStyle', name: '동기부여', level: levels.motivationStyle }
    ];
  }
  
  // 렌더링
  return React.createElement('div', { style: styles.overlay },
    React.createElement('div', { style: styles.container },
      
      // Step 0: 시작 화면
      step === 0 && React.createElement('div', null,
        React.createElement('div', { style: styles.welcomeEmoji }, '🐧'),
        React.createElement('div', { style: styles.welcomeTitle }, 
          '알프레도가 당신을 알아가는 중'
        ),
        React.createElement('div', { style: styles.welcomeDesc },
          '간단한 질문 2개로\n나에게 맞는 알프레도 스타일을 찾아볼게요'
        ),
        React.createElement('button', {
          style: styles.buttonPrimary,
          onClick: function() { setStep(1); }
        }, '시작하기'),
        onSkip && React.createElement('button', {
          style: styles.skipButton,
          onClick: onSkip
        }, '나중에 할게요')
      ),
      
      // Step 1-2: 질문
      (step === 1 || step === 2) && currentQuestion && React.createElement('div', null,
        // 진행 바
        React.createElement('div', { style: styles.progressBar },
          [0, 1].map(function(idx) {
            var dotStyle = Object.assign({}, styles.progressDot);
            if (idx < questionIndex) {
              Object.assign(dotStyle, styles.progressDotDone);
            } else if (idx === questionIndex) {
              Object.assign(dotStyle, styles.progressDotActive);
            } else {
              Object.assign(dotStyle, styles.progressDotInactive);
            }
            return React.createElement('div', { key: idx, style: dotStyle });
          })
        ),
        
        // 질문
        React.createElement('div', { style: styles.question },
          currentQuestion.question
        ),
        
        // 선택지
        React.createElement('div', { style: styles.optionList },
          currentQuestion.options.map(function(option, idx) {
            var isSelected = answers[questionIndex] === option;
            
            return React.createElement('div', {
              key: idx,
              style: Object.assign({}, styles.optionCard, {
                backgroundColor: isDarkMode 
                  ? (isSelected ? '#333355' : '#252540')
                  : (isSelected ? '#f0f0ff' : '#f8f9fa'),
                borderColor: isSelected ? '#6366f1' : 'transparent',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)'
              }),
              onClick: function() { handleSelect(questionIndex, option); }
            },
              React.createElement('div', { style: styles.optionEmoji }, option.emoji),
              React.createElement('div', { style: styles.optionContent },
                React.createElement('div', { style: styles.optionLabel }, option.label),
                React.createElement('div', { style: styles.optionDesc }, option.desc)
              )
            );
          })
        )
      ),
      
      // Step 3: 결과
      step === 3 && recommendation && React.createElement('div', null,
        React.createElement('div', { style: styles.resultEmoji }, '🎯'),
        React.createElement('div', { style: styles.resultTitle },
          '당신을 위한 알프레도 설정'
        ),
        React.createElement('div', { style: styles.resultPreset },
          recommendation.preset.emoji + ' ' + recommendation.preset.name
        ),
        
        // 설정 요약
        React.createElement('div', { style: styles.resultCard },
          getResultLevels().map(function(item, idx, arr) {
            return React.createElement('div', {
              key: item.key,
              style: Object.assign({}, styles.resultItem, 
                idx === arr.length - 1 ? styles.resultItemLast : {}
              )
            },
              React.createElement('span', { style: styles.resultLabel }, item.name),
              React.createElement('span', { style: styles.resultValue },
                React.createElement('span', null, item.level.emoji),
                React.createElement('span', null, item.level.label)
              )
            );
          })
        ),
        
        // 설명
        React.createElement('div', { 
          style: { 
            fontSize: '14px', 
            opacity: 0.8, 
            marginBottom: '24px',
            lineHeight: '1.6'
          } 
        },
          recommendation.preset.longDesc
        ),
        
        // 버튼들
        React.createElement('button', {
          style: styles.buttonPrimary,
          onClick: function() { handleComplete(true); }
        }, '이대로 시작하기'),
        React.createElement('button', {
          style: styles.buttonSecondary,
          onClick: function() { handleComplete(false); }
        }, '직접 커스텀하기'),
        
        React.createElement('div', { 
          style: { 
            fontSize: '12px', 
            opacity: 0.6, 
            marginTop: '16px' 
          } 
        },
          '💡 설정은 언제든 바꿀 수 있어요'
        )
      )
    )
  );
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlfredoPersonalizationOnboarding;
}

if (typeof window !== 'undefined') {
  window.AlfredoPersonalizationOnboarding = AlfredoPersonalizationOnboarding;
}
