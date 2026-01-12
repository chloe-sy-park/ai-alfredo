/**
 * 🧠 알프레도가 파악한 것 컴포넌트
 * 
 * - 동기화율 표시 (성장 게이지)
 * - 알프레도가 학습한 인사이트들
 * - "이거 아닌데?" 교정 기능
 * - 제안 수락/거절
 */

var React = require('react');
var useState = React.useState;
var useEffect = React.useEffect;
var useMemo = React.useMemo;

// 자동 학습 시스템
var AutoLearning = typeof window !== 'undefined' && window.AlfredoAutoLearning 
  ? window.AlfredoAutoLearning 
  : require('../../utils/alfredoAutoLearning');

// 개인화 시스템
var Personalization = typeof window !== 'undefined' && window.AlfredoPersonalization 
  ? window.AlfredoPersonalization 
  : require('../../utils/alfredoPersonalization');

function AlfredoLearningInsights(props) {
  var isDarkMode = props.isDarkMode !== false;
  var onClose = props.onClose;
  var onOpenSettings = props.onOpenSettings; // 직접 설정하기 버튼용
  
  // 학습 상태
  var _statusState = useState(null);
  var status = _statusState[0];
  var setStatus = _statusState[1];
  
  // 인사이트
  var _insightsState = useState(null);
  var insights = _insightsState[0];
  var setInsights = _insightsState[1];
  
  // 제안
  var _suggestionsState = useState([]);
  var suggestions = _suggestionsState[0];
  var setSuggestions = _suggestionsState[1];
  
  // 로드
  useEffect(function() {
    var loadedStatus = AutoLearning.getLearningStatus();
    setStatus(loadedStatus);
    
    var loadedInsights = AutoLearning.generateLearningInsights();
    setInsights(loadedInsights);
    
    var loadedSuggestions = AutoLearning.generateStyleSuggestion();
    setSuggestions(loadedSuggestions);
  }, []);
  
  // 제안 수락
  function handleAcceptSuggestion(suggestion, idx) {
    AutoLearning.acceptSuggestion(suggestion);
    var newSuggestions = suggestions.slice();
    newSuggestions.splice(idx, 1);
    setSuggestions(newSuggestions);
    
    // 상태 갱신
    setStatus(AutoLearning.getLearningStatus());
    setInsights(AutoLearning.generateLearningInsights());
  }
  
  // 제안 거절
  function handleRejectSuggestion(suggestion, idx) {
    AutoLearning.rejectSuggestion(suggestion);
    var newSuggestions = suggestions.slice();
    newSuggestions.splice(idx, 1);
    setSuggestions(newSuggestions);
  }
  
  // "이거 아닌데" 피드백
  function handleCorrection(insightIndex) {
    AutoLearning.recordFeedback('insight_correction', 'correction', {
      insightIndex: insightIndex
    });
    
    // 인사이트 갱신
    setInsights(AutoLearning.generateLearningInsights());
    setStatus(AutoLearning.getLearningStatus());
  }
  
  // 스타일
  var styles = {
    container: {
      backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
      color: isDarkMode ? '#e0e0e0' : '#333333',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '500px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: isDarkMode ? '#888' : '#666',
      padding: '4px'
    },
    
    // 동기화율
    syncSection: {
      backgroundColor: isDarkMode ? '#252540' : '#f8f9fa',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
      textAlign: 'center'
    },
    syncLabel: {
      fontSize: '14px',
      opacity: 0.8,
      marginBottom: '8px'
    },
    syncRate: {
      fontSize: '48px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    syncBar: {
      height: '8px',
      backgroundColor: isDarkMode ? '#333' : '#e0e0e0',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '12px'
    },
    syncBarFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #10B981, #6366f1, #8b5cf6)',
      borderRadius: '4px',
      transition: 'width 0.5s ease'
    },
    syncInfo: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      marginTop: '12px',
      fontSize: '12px',
      opacity: 0.7
    },
    
    // 인사이트 목록
    insightsList: {
      marginBottom: '20px'
    },
    insightItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '14px',
      backgroundColor: isDarkMode ? '#252540' : '#f8f9fa',
      borderRadius: '12px',
      marginBottom: '10px'
    },
    insightEmoji: {
      fontSize: '20px',
      lineHeight: '1'
    },
    insightContent: {
      flex: 1
    },
    insightText: {
      fontSize: '14px',
      lineHeight: '1.5'
    },
    insightConfidence: {
      fontSize: '11px',
      opacity: 0.6,
      marginTop: '4px'
    },
    correctionButton: {
      background: 'none',
      border: 'none',
      fontSize: '12px',
      color: isDarkMode ? '#888' : '#999',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '4px'
    },
    
    // 제안 카드
    suggestionCard: {
      backgroundColor: isDarkMode ? '#2a2a4a' : '#f0f0ff',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '16px',
      border: '2px solid ' + (isDarkMode ? '#4a4a6a' : '#e0e0ff')
    },
    suggestionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '10px'
    },
    suggestionEmoji: {
      fontSize: '24px'
    },
    suggestionLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6366f1'
    },
    suggestionReason: {
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '14px'
    },
    suggestionButtons: {
      display: 'flex',
      gap: '8px'
    },
    acceptButton: {
      flex: 1,
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#6366f1',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    rejectButton: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid ' + (isDarkMode ? '#444' : '#ddd'),
      backgroundColor: 'transparent',
      color: isDarkMode ? '#aaa' : '#666',
      fontSize: '14px',
      cursor: 'pointer'
    },
    
    // 빈 상태
    emptyState: {
      textAlign: 'center',
      padding: '32px 16px',
      opacity: 0.7
    },
    emptyEmoji: {
      fontSize: '48px',
      marginBottom: '12px'
    },
    emptyText: {
      fontSize: '14px',
      lineHeight: '1.6'
    },
    
    // 하단 버튼
    footer: {
      marginTop: '24px',
      paddingTop: '16px',
      borderTop: '1px solid ' + (isDarkMode ? '#333' : '#eee')
    },
    settingsButton: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid ' + (isDarkMode ? '#444' : '#ddd'),
      backgroundColor: 'transparent',
      color: isDarkMode ? '#aaa' : '#666',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }
  };
  
  if (!status || !insights) {
    return React.createElement('div', { style: styles.container },
      React.createElement('div', { style: { textAlign: 'center', padding: '40px' } },
        '로딩 중...'
      )
    );
  }
  
  return React.createElement('div', { style: styles.container },
    // 헤더
    React.createElement('div', { style: styles.header },
      React.createElement('h2', { style: styles.title },
        React.createElement('span', null, '🧠'),
        '알프레도가 파악한 것'
      ),
      onClose && React.createElement('button', {
        style: styles.closeButton,
        onClick: onClose
      }, '×')
    ),
    
    // 동기화율
    React.createElement('div', { style: styles.syncSection },
      React.createElement('div', { style: styles.syncLabel }, '동기화율'),
      React.createElement('div', { style: styles.syncRate }, 
        insights.syncRate + '%'
      ),
      React.createElement('div', { style: styles.syncBar },
        React.createElement('div', { 
          style: Object.assign({}, styles.syncBarFill, {
            width: insights.syncRate + '%'
          })
        })
      ),
      React.createElement('div', { style: styles.syncInfo },
        React.createElement('span', null, '📅 ' + status.daysSinceStart + '일째'),
        React.createElement('span', null, '👍 피드백 ' + status.feedbackCount + '개'),
        React.createElement('span', null, '🔍 패턴 ' + status.patternsDiscovered + '개')
      )
    ),
    
    // 제안 카드들
    suggestions.length > 0 && suggestions.map(function(suggestion, idx) {
      if (suggestion.type === 'milestone') {
        return React.createElement('div', {
          key: idx,
          style: Object.assign({}, styles.suggestionCard, {
            backgroundColor: isDarkMode ? '#1a3a2a' : '#e8f5e9',
            border: '2px solid #10B981'
          })
        },
          React.createElement('div', { style: styles.suggestionHeader },
            React.createElement('span', { style: styles.suggestionEmoji }, suggestion.emoji),
            React.createElement('span', { 
              style: Object.assign({}, styles.suggestionLabel, { color: '#10B981' }) 
            }, '마일스톤!')
          ),
          React.createElement('div', { style: styles.suggestionReason },
            suggestion.reason
          )
        );
      }
      
      return React.createElement('div', {
        key: idx,
        style: styles.suggestionCard
      },
        React.createElement('div', { style: styles.suggestionHeader },
          React.createElement('span', { style: styles.suggestionEmoji }, suggestion.emoji || '💡'),
          React.createElement('span', { style: styles.suggestionLabel }, '알프레도 제안')
        ),
        React.createElement('div', { style: styles.suggestionReason },
          suggestion.reason
        ),
        React.createElement('div', { style: styles.suggestionButtons },
          React.createElement('button', {
            style: styles.acceptButton,
            onClick: function() { handleAcceptSuggestion(suggestion, idx); }
          }, '좋아요, 그렇게 해줘'),
          React.createElement('button', {
            style: styles.rejectButton,
            onClick: function() { handleRejectSuggestion(suggestion, idx); }
          }, '아니야')
        )
      );
    }),
    
    // 인사이트 목록
    React.createElement('div', { style: styles.insightsList },
      insights.insights.length > 0 ? (
        insights.insights.map(function(insight, idx) {
          return React.createElement('div', {
            key: idx,
            style: styles.insightItem
          },
            React.createElement('div', { style: styles.insightEmoji }, insight.emoji),
            React.createElement('div', { style: styles.insightContent },
              React.createElement('div', { style: styles.insightText }, insight.text),
              React.createElement('div', { style: styles.insightConfidence },
                '확신도 ' + insight.confidence + '%'
              )
            ),
            React.createElement('button', {
              style: styles.correctionButton,
              onClick: function() { handleCorrection(idx); },
              title: '이거 아닌데?'
            }, '❌')
          );
        })
      ) : (
        React.createElement('div', { style: styles.emptyState },
          React.createElement('div', { style: styles.emptyEmoji }, '🐧'),
          React.createElement('div', { style: styles.emptyText },
            '아직 배우는 중이에요!\n',
            '캘린더 연동하고 며칠 지나면\n',
            '당신에 대해 더 알게 될 거예요.'
          )
        )
      )
    ),
    
    // 하단
    React.createElement('div', { style: styles.footer },
      onOpenSettings && React.createElement('button', {
        style: styles.settingsButton,
        onClick: onOpenSettings
      },
        React.createElement('span', null, '⚙️'),
        '직접 설정하기'
      ),
      React.createElement('div', { 
        style: { 
          textAlign: 'center', 
          marginTop: '12px', 
          fontSize: '12px', 
          opacity: 0.6 
        } 
      },
        '💡 대부분은 알프레도가 알아서 맞춰갈 거예요'
      )
    )
  );
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlfredoLearningInsights;
}

if (typeof window !== 'undefined') {
  window.AlfredoLearningInsights = AlfredoLearningInsights;
}
