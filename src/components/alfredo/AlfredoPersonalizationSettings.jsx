/**
 * 🎛️ 알프레도 개인화 설정 컴포넌트
 * 노션 가이드 기준 4축 완전 재설계
 * 
 * - 프리셋 선택 (QS 매니아 / 밸런스 / 미니멀 등)
 * - 4축 슬라이더 (데이터 깊이, 알림 스타일, 시각화 스타일, 동기부여 스타일)
 * - 영역별 설정 (업무/라이프/운동)
 * - 실시간 프리뷰
 */

var React = require('react');
var useState = React.useState;
var useEffect = React.useEffect;
var useMemo = React.useMemo;

// 개인화 시스템 import (실제로는 경로 조정 필요)
var Personalization = typeof window !== 'undefined' && window.AlfredoPersonalization 
  ? window.AlfredoPersonalization 
  : require('../../utils/alfredoPersonalization');

var AXES = Personalization.AXES;
var PRESETS = Personalization.PRESETS;
var AREA_DEFAULTS = Personalization.AREA_DEFAULTS;

function AlfredoPersonalizationSettings(props) {
  var isDarkMode = props.isDarkMode !== false;
  var onClose = props.onClose;
  
  // 현재 영역 (global, work, life, health)
  var _areaState = useState('global');
  var currentArea = _areaState[0];
  var setCurrentArea = _areaState[1];
  
  // 영역별 설정 활성화 여부
  var _areaEnabledState = useState(Personalization.isAreaPersonalizationEnabled());
  var areaEnabled = _areaEnabledState[0];
  var setAreaEnabled = _areaEnabledState[1];
  
  // 현재 값들
  var _valuesState = useState(function() {
    return Personalization.loadStyle(currentArea);
  });
  var values = _valuesState[0];
  var setValues = _valuesState[1];
  
  // 현재 프리셋
  var _presetState = useState(Personalization.getCurrentPreset());
  var currentPreset = _presetState[0];
  var setCurrentPreset = _presetState[1];
  
  // 탭 변경시 값 로드
  useEffect(function() {
    setValues(Personalization.loadStyle(currentArea));
  }, [currentArea]);
  
  // 값 변경 핸들러
  function handleValueChange(axisKey, newValue) {
    var newValues = Object.assign({}, values);
    newValues[axisKey] = parseInt(newValue, 10);
    setValues(newValues);
    Personalization.saveStyle(currentArea, newValues);
    setCurrentPreset('custom'); // 커스텀으로 변경
  }
  
  // 프리셋 적용
  function handlePresetApply(presetKey) {
    var preset = PRESETS[presetKey];
    if (preset) {
      setValues(preset.values);
      Personalization.saveStyle(currentArea, preset.values);
      setCurrentPreset(presetKey);
    }
  }
  
  // 영역별 설정 토글
  function handleAreaToggle() {
    var newEnabled = !areaEnabled;
    setAreaEnabled(newEnabled);
    Personalization.setAreaPersonalizationEnabled(newEnabled);
  }
  
  // 현재 레벨들 계산
  var levels = useMemo(function() {
    return Personalization.getAllLevels(values);
  }, [values]);
  
  // 프리뷰 메시지 생성
  var preview = useMemo(function() {
    return Personalization.generatePreviewMessage(values, currentArea);
  }, [values, currentArea]);
  
  // 톤 예시 생성
  var toneExample = useMemo(function() {
    return Personalization.generateToneExample(values);
  }, [values]);
  
  // 스타일
  var styles = {
    container: {
      backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
      color: isDarkMode ? '#e0e0e0' : '#333333',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '1px solid ' + (isDarkMode ? '#333' : '#eee')
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: isDarkMode ? '#888' : '#666',
      padding: '4px'
    },
    
    // 프리셋 섹션
    presetSection: {
      marginBottom: '24px'
    },
    presetLabel: {
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '12px',
      color: isDarkMode ? '#aaa' : '#666'
    },
    presetGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px'
    },
    presetCard: {
      padding: '12px',
      borderRadius: '12px',
      border: '2px solid transparent',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s ease'
    },
    presetCardActive: {
      borderColor: '#6366f1'
    },
    presetEmoji: {
      fontSize: '24px',
      marginBottom: '4px'
    },
    presetName: {
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '2px'
    },
    presetDesc: {
      fontSize: '11px',
      opacity: 0.7
    },
    
    // 영역 탭
    areaTabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px',
      padding: '4px',
      backgroundColor: isDarkMode ? '#252540' : '#f5f5f5',
      borderRadius: '12px'
    },
    areaTab: {
      flex: 1,
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px'
    },
    areaTabActive: {
      backgroundColor: isDarkMode ? '#3a3a5c' : '#ffffff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    areaTabInactive: {
      backgroundColor: 'transparent'
    },
    
    // 슬라이더 섹션
    sliderSection: {
      marginBottom: '24px'
    },
    axisItem: {
      marginBottom: '20px'
    },
    axisHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    axisName: {
      fontSize: '14px',
      fontWeight: '600'
    },
    axisValue: {
      fontSize: '13px',
      padding: '4px 10px',
      borderRadius: '12px',
      backgroundColor: isDarkMode ? '#333355' : '#f0f0f5'
    },
    axisLabels: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '6px',
      fontSize: '12px'
    },
    axisLabelLeft: {
      opacity: 0.6
    },
    axisLabelRight: {
      opacity: 0.6
    },
    slider: {
      width: '100%',
      height: '8px',
      borderRadius: '4px',
      appearance: 'none',
      background: 'linear-gradient(to right, #10B981, #6366f1, #F59E0B)',
      cursor: 'pointer'
    },
    
    // 프리뷰 섹션
    previewSection: {
      backgroundColor: isDarkMode ? '#252540' : '#f8f9fa',
      borderRadius: '16px',
      padding: '20px',
      marginTop: '24px'
    },
    previewTitle: {
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    previewChat: {
      backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
      borderRadius: '12px',
      padding: '16px'
    },
    previewBubble: {
      backgroundColor: isDarkMode ? '#333355' : '#e8f4f8',
      borderRadius: '16px',
      padding: '12px 16px',
      marginBottom: '12px',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    previewDivider: {
      height: '1px',
      backgroundColor: isDarkMode ? '#333' : '#eee',
      margin: '16px 0'
    },
    
    // 톤 예시 섹션
    toneSection: {
      marginTop: '16px'
    },
    toneTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: isDarkMode ? '#888' : '#666',
      marginBottom: '8px'
    },
    toneSituation: {
      fontSize: '12px',
      opacity: 0.7,
      marginBottom: '8px'
    },
    toneButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginTop: '12px'
    },
    toneButton: {
      padding: '8px 14px',
      borderRadius: '20px',
      border: 'none',
      fontSize: '13px',
      backgroundColor: isDarkMode ? '#3a3a5c' : '#e0e7ff',
      color: isDarkMode ? '#e0e0e0' : '#4338ca',
      cursor: 'pointer'
    },
    
    // 영역 토글
    areaToggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      backgroundColor: isDarkMode ? '#252540' : '#f8f9fa',
      borderRadius: '12px',
      marginBottom: '16px'
    },
    toggleLabel: {
      fontSize: '14px',
      fontWeight: '500'
    },
    toggleSwitch: {
      width: '48px',
      height: '28px',
      borderRadius: '14px',
      backgroundColor: areaEnabled ? '#6366f1' : (isDarkMode ? '#444' : '#ddd'),
      position: 'relative',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    toggleKnob: {
      width: '22px',
      height: '22px',
      borderRadius: '11px',
      backgroundColor: '#fff',
      position: 'absolute',
      top: '3px',
      left: areaEnabled ? '23px' : '3px',
      transition: 'left 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }
  };
  
  // 영역 탭 목록
  var areaTabs = [
    { key: 'global', emoji: '🌍', label: '전체' }
  ];
  
  if (areaEnabled) {
    areaTabs.push(
      { key: 'work', emoji: '💼', label: '업무' },
      { key: 'life', emoji: '🌿', label: '라이프' },
      { key: 'health', emoji: '🏃', label: '운동' }
    );
  }
  
  // 메인 프리셋 목록 (상위 3개만 표시)
  var mainPresets = ['qsMania', 'balance', 'minimal'];
  
  return React.createElement('div', { style: styles.container },
    // 헤더
    React.createElement('div', { style: styles.header },
      React.createElement('h2', { style: styles.title }, '🎛️ 나의 알프레도 스타일'),
      onClose && React.createElement('button', {
        style: styles.closeButton,
        onClick: onClose
      }, '×')
    ),
    
    // 프리셋 섹션
    React.createElement('div', { style: styles.presetSection },
      React.createElement('div', { style: styles.presetLabel }, '빠른 설정'),
      React.createElement('div', { style: styles.presetGrid },
        mainPresets.map(function(presetKey) {
          var preset = PRESETS[presetKey];
          var isActive = currentPreset === presetKey;
          
          return React.createElement('div', {
            key: presetKey,
            style: Object.assign({}, styles.presetCard, 
              isActive ? styles.presetCardActive : {},
              {
                backgroundColor: isDarkMode 
                  ? (isActive ? '#333355' : '#252540') 
                  : (isActive ? '#f0f0ff' : '#f8f9fa')
              }
            ),
            onClick: function() { handlePresetApply(presetKey); }
          },
            React.createElement('div', { style: styles.presetEmoji }, preset.emoji),
            React.createElement('div', { style: styles.presetName }, preset.name),
            React.createElement('div', { style: styles.presetDesc }, preset.description)
          );
        })
      )
    ),
    
    // 영역별 설정 토글
    React.createElement('div', { style: styles.areaToggle },
      React.createElement('div', null,
        React.createElement('div', { style: styles.toggleLabel }, '영역별 다른 설정'),
        React.createElement('div', { 
          style: { fontSize: '12px', opacity: 0.7, marginTop: '2px' } 
        }, '업무/라이프/운동마다 다르게')
      ),
      React.createElement('div', {
        style: styles.toggleSwitch,
        onClick: handleAreaToggle
      },
        React.createElement('div', { style: styles.toggleKnob })
      )
    ),
    
    // 영역 탭
    React.createElement('div', { style: styles.areaTabs },
      areaTabs.map(function(tab) {
        var isActive = currentArea === tab.key;
        return React.createElement('button', {
          key: tab.key,
          style: Object.assign({}, styles.areaTab, 
            isActive ? styles.areaTabActive : styles.areaTabInactive,
            {
              backgroundColor: isActive 
                ? (isDarkMode ? '#3a3a5c' : '#ffffff')
                : 'transparent',
              color: isDarkMode ? '#e0e0e0' : '#333'
            }
          ),
          onClick: function() { setCurrentArea(tab.key); }
        },
          React.createElement('span', null, tab.emoji),
          React.createElement('span', null, tab.label)
        );
      })
    ),
    
    // 4축 슬라이더
    React.createElement('div', { style: styles.sliderSection },
      Object.keys(AXES).map(function(axisKey) {
        var axis = AXES[axisKey];
        var value = values[axisKey] || 50;
        var level = levels[axisKey];
        
        return React.createElement('div', { key: axisKey, style: styles.axisItem },
          React.createElement('div', { style: styles.axisHeader },
            React.createElement('span', { style: styles.axisName }, axis.name),
            React.createElement('span', { style: styles.axisValue },
              level.emoji + ' ' + level.label
            )
          ),
          React.createElement('div', { style: styles.axisLabels },
            React.createElement('span', { style: styles.axisLabelLeft },
              axis.left.emoji + ' ' + axis.left.desc
            ),
            React.createElement('span', { style: styles.axisLabelRight },
              axis.right.desc + ' ' + axis.right.emoji
            )
          ),
          React.createElement('input', {
            type: 'range',
            min: 0,
            max: 100,
            value: value,
            onChange: function(e) { handleValueChange(axisKey, e.target.value); },
            style: styles.slider
          })
        );
      })
    ),
    
    // 프리뷰 섹션
    React.createElement('div', { style: styles.previewSection },
      React.createElement('div', { style: styles.previewTitle },
        React.createElement('span', null, '🐧'),
        React.createElement('span', null, '이 설정으로 알프레도는 이렇게 말해요')
      ),
      
      React.createElement('div', { style: styles.previewChat },
        // 인사
        React.createElement('div', { style: styles.previewBubble },
          preview.greeting
        ),
        // 데이터 정보
        React.createElement('div', { style: styles.previewBubble },
          preview.dataInfo
        ),
        // 동기부여
        React.createElement('div', { style: styles.previewBubble },
          preview.motivation
        )
      ),
      
      // 톤 예시
      React.createElement('div', { style: styles.toneSection },
        React.createElement('div', { style: styles.previewDivider }),
        React.createElement('div', { style: styles.toneTitle }, '💬 같은 상황, 다른 톤'),
        React.createElement('div', { style: styles.toneSituation },
          '상황: ' + toneExample.situation
        ),
        React.createElement('div', { style: styles.previewBubble },
          toneExample.message
        ),
        React.createElement('div', { style: styles.toneButtons },
          toneExample.buttons.map(function(btn, idx) {
            return React.createElement('button', {
              key: idx,
              style: styles.toneButton
            }, btn);
          })
        )
      )
    ),
    
    // 안내 문구
    React.createElement('div', { 
      style: { 
        textAlign: 'center', 
        marginTop: '20px', 
        fontSize: '13px', 
        opacity: 0.6 
      } 
    },
      '💡 설정은 언제든 바꿀 수 있어요. 사용하면서 맞는 걸 찾아가요!'
    )
  );
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlfredoPersonalizationSettings;
}

if (typeof window !== 'undefined') {
  window.AlfredoPersonalizationSettings = AlfredoPersonalizationSettings;
}
