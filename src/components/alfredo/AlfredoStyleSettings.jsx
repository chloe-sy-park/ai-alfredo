import React, { useState, useEffect } from 'react';
import { 
  getAreaStyle, 
  saveAreaStyle, 
  detectCurrentContext,
  getContextMetadata,
  getStylePreviewMessage,
  getContextSettings,
  saveContextSettings,
  toggleAutoSwitch,
  setManualMode
} from '../../utils/alfredoContext';

/**
 * 알프레도 스타일 설정 컴포넌트 (Phase 3)
 * - 업무/라이프 모드 탭 분리
 * - 영역별 4가지 육성 축 슬라이더
 * - 자동 전환 설정
 * - 실시간 프리뷰
 */
var AlfredoStyleSettings = function(props) {
  var darkMode = props.darkMode;
  var onStyleChange = props.onStyleChange;
  var currentTab = props.currentTab; // 현재 앱 탭 (work/life 감지용)
  
  // 현재 선택된 모드 탭
  var _modeState = useState('work');
  var selectedMode = _modeState[0];
  var setSelectedMode = _modeState[1];
  
  // 컨텍스트 설정
  var _contextState = useState(getContextSettings);
  var contextSettings = _contextState[0];
  var setContextSettings = _contextState[1];
  
  // 현재 자동 감지된 컨텍스트
  var _detectedState = useState(function() {
    return detectCurrentContext({ currentTab: currentTab });
  });
  var detectedContext = _detectedState[0];
  var setDetectedContext = _detectedState[1];
  
  // 업무 모드 스타일
  var _workState = useState(function() {
    return getAreaStyle('work');
  });
  var workStyle = _workState[0];
  var setWorkStyle = _workState[1];
  
  // 라이프 모드 스타일
  var _lifeState = useState(function() {
    return getAreaStyle('life');
  });
  var lifeStyle = _lifeState[0];
  var setLifeStyle = _lifeState[1];
  
  // 현재 탭에 따른 스타일 가져오기
  var currentStyle = selectedMode === 'work' ? workStyle : lifeStyle;
  var setCurrentStyle = selectedMode === 'work' ? setWorkStyle : setLifeStyle;
  
  // 주기적으로 컨텍스트 업데이트
  useEffect(function() {
    var interval = setInterval(function() {
      var newContext = detectCurrentContext({ currentTab: currentTab });
      setDetectedContext(newContext);
    }, 60000); // 1분마다 체크
    
    return function() { clearInterval(interval); };
  }, [currentTab]);
  
  // 스타일 변경 시 저장
  useEffect(function() {
    saveAreaStyle('work', workStyle);
    saveAreaStyle('life', lifeStyle);
    
    if (onStyleChange) {
      onStyleChange({
        work: workStyle,
        life: lifeStyle,
        currentMode: selectedMode,
        detectedContext: detectedContext
      });
    }
  }, [workStyle, lifeStyle, selectedMode]);
  
  // 개별 스타일 값 업데이트
  var updateStyle = function(key, value) {
    if (selectedMode === 'work') {
      setWorkStyle(function(prev) {
        var updated = Object.assign({}, prev);
        updated[key] = value;
        return updated;
      });
    } else {
      setLifeStyle(function(prev) {
        var updated = Object.assign({}, prev);
        updated[key] = value;
        return updated;
      });
    }
  };
  
  // 자동 전환 토글
  var handleAutoSwitchToggle = function() {
    var newSettings = toggleAutoSwitch(!contextSettings.autoSwitch);
    setContextSettings(newSettings);
  };
  
  // 수동 모드 설정
  var handleManualMode = function(mode) {
    var newSettings = setManualMode(mode);
    setContextSettings(newSettings);
    setSelectedMode(mode === 'auto' ? detectedContext : mode);
  };
  
  // 다크모드 색상
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var bgCard = darkMode ? 'bg-gray-800' : 'bg-white/70';
  var sliderBg = darkMode ? 'bg-gray-700' : 'bg-gray-200';
  var tabActive = 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white';
  var tabInactive = darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500';
  
  // 모드별 메타데이터
  var workMeta = getContextMetadata('work');
  var lifeMeta = getContextMetadata('life');
  
  // 슬라이더 컴포넌트
  var StyleSlider = function(sliderProps) {
    var label = sliderProps.label;
    var leftEmoji = sliderProps.leftEmoji;
    var leftText = sliderProps.leftText;
    var rightEmoji = sliderProps.rightEmoji;
    var rightText = sliderProps.rightText;
    var value = sliderProps.value;
    var onChange = sliderProps.onChange;
    
    return React.createElement('div', { className: 'mb-4' },
      React.createElement('div', { className: 'flex justify-between items-center mb-2' },
        React.createElement('span', { className: textPrimary + ' font-medium text-sm' }, label)
      ),
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('div', { className: 'flex items-center gap-1 min-w-[70px]' },
          React.createElement('span', { className: 'text-base' }, leftEmoji),
          React.createElement('span', { className: textSecondary + ' text-xs' }, leftText)
        ),
        React.createElement('div', { className: 'flex-1 relative' },
          React.createElement('div', { 
            className: sliderBg + ' h-2 rounded-full overflow-hidden'
          },
            React.createElement('div', {
              className: 'h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all duration-200',
              style: { width: value + '%' }
            })
          ),
          React.createElement('input', {
            type: 'range',
            min: 0,
            max: 100,
            value: value,
            onChange: function(e) { onChange(parseInt(e.target.value)); },
            className: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer'
          })
        ),
        React.createElement('div', { className: 'flex items-center gap-1 min-w-[70px] justify-end' },
          React.createElement('span', { className: textSecondary + ' text-xs' }, rightText),
          React.createElement('span', { className: 'text-base' }, rightEmoji)
        )
      )
    );
  };
  
  return React.createElement('div', { className: bgCard + ' backdrop-blur-xl rounded-xl p-4' },
    // 헤더 + 현재 감지된 모드
    React.createElement('div', { className: 'flex justify-between items-center mb-4' },
      React.createElement('h3', { className: textPrimary + ' font-bold flex items-center gap-2' },
        React.createElement('span', { className: 'text-xl' }, '🐧'),
        '내 알프레도 스타일'
      ),
      // 현재 감지된 모드 표시
      contextSettings.autoSwitch && React.createElement('div', { 
        className: 'flex items-center gap-1 px-2 py-1 rounded-full text-xs ' + 
          (detectedContext === 'work' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700')
      },
        React.createElement('span', null, detectedContext === 'work' ? workMeta.emoji : lifeMeta.emoji),
        React.createElement('span', null, detectedContext === 'work' ? '업무 중' : '라이프')
      )
    ),
    
    // 자동 전환 토글
    React.createElement('div', { 
      className: (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') + ' rounded-lg p-3 mb-4 flex items-center justify-between'
    },
      React.createElement('div', null,
        React.createElement('p', { className: textPrimary + ' text-sm font-medium' }, '자동 모드 전환'),
        React.createElement('p', { className: textSecondary + ' text-xs' }, 
          '시간, 일정에 따라 알프레도 스타일 자동 변경'
        )
      ),
      React.createElement('button', {
        onClick: handleAutoSwitchToggle,
        className: 'w-12 h-6 rounded-full transition-all ' + 
          (contextSettings.autoSwitch 
            ? 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7]' 
            : (darkMode ? 'bg-gray-600' : 'bg-gray-300'))
      },
        React.createElement('div', {
          className: 'w-5 h-5 bg-white rounded-full shadow transition-transform ' +
            (contextSettings.autoSwitch ? 'translate-x-6' : 'translate-x-0.5')
        })
      )
    ),
    
    // 모드 탭
    React.createElement('div', { className: 'flex gap-2 mb-4' },
      React.createElement('button', {
        onClick: function() { setSelectedMode('work'); },
        className: 'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ' +
          (selectedMode === 'work' ? tabActive : tabInactive)
      },
        React.createElement('span', null, workMeta.emoji),
        React.createElement('span', null, '업무 모드')
      ),
      React.createElement('button', {
        onClick: function() { setSelectedMode('life'); },
        className: 'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ' +
          (selectedMode === 'life' ? tabActive : tabInactive)
      },
        React.createElement('span', null, lifeMeta.emoji),
        React.createElement('span', null, '라이프 모드')
      )
    ),
    
    // 현재 모드 설명
    React.createElement('p', { className: textSecondary + ' text-xs mb-4 text-center' },
      selectedMode === 'work' 
        ? '💼 업무 시간에 사용되는 스타일이에요' 
        : '🌿 퇴근 후, 주말에 사용되는 스타일이에요'
    ),
    
    // 슬라이더들
    React.createElement(StyleSlider, {
      label: '1. 말투는 어떻게?',
      leftEmoji: '🌸',
      leftText: '다정하게',
      rightEmoji: '🔥',
      rightText: '직설적으로',
      value: currentStyle.toneWarmth,
      onChange: function(v) { updateStyle('toneWarmth', v); }
    }),
    
    React.createElement(StyleSlider, {
      label: '2. 얼마나 자주 말 걸까?',
      leftEmoji: '🤫',
      leftText: '필요할 때만',
      rightEmoji: '💬',
      rightText: '자주자주',
      value: currentStyle.notificationFreq,
      onChange: function(v) { updateStyle('notificationFreq', v); }
    }),
    
    React.createElement(StyleSlider, {
      label: '3. 데이터는 얼마나?',
      leftEmoji: '😌',
      leftText: '핵심만',
      rightEmoji: '🔬',
      rightText: '다 보여줘',
      value: currentStyle.dataDepth,
      onChange: function(v) { updateStyle('dataDepth', v); }
    }),
    
    React.createElement(StyleSlider, {
      label: '4. 동기부여 방식은?',
      leftEmoji: '🌊',
      leftText: '느긋하게',
      rightEmoji: '🏆',
      rightText: '도전적으로',
      value: currentStyle.motivationStyle,
      onChange: function(v) { updateStyle('motivationStyle', v); }
    }),
    
    // 실시간 프리뷰
    React.createElement('div', { 
      className: (darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]') + ' rounded-xl p-4 mt-4'
    },
      React.createElement('p', { className: textSecondary + ' text-xs mb-2' }, 
        selectedMode === 'work' ? '💼 업무 모드에선 이렇게 말할게요' : '🌿 라이프 모드에선 이렇게 말할게요'
      ),
      React.createElement('div', { className: 'flex items-start gap-3' },
        React.createElement('div', { 
          className: 'w-10 h-10 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-lg flex-shrink-0'
        }, '🐧'),
        React.createElement('div', { 
          className: (darkMode ? 'bg-gray-600' : 'bg-white') + ' rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm'
        },
          React.createElement('p', { className: textPrimary + ' text-sm leading-relaxed' }, 
            getStylePreviewMessage(selectedMode, currentStyle)
          )
        )
      )
    ),
    
    // 초기화 버튼
    React.createElement('div', { className: 'flex justify-between items-center mt-3' },
      React.createElement('button', {
        onClick: function() {
          if (selectedMode === 'work') {
            setWorkStyle({ toneWarmth: 35, notificationFreq: 60, dataDepth: 70, motivationStyle: 65 });
          } else {
            setLifeStyle({ toneWarmth: 75, notificationFreq: 40, dataDepth: 30, motivationStyle: 35 });
          }
        },
        className: textSecondary + ' text-xs hover:underline'
      }, '기본값으로 초기화'),
      React.createElement('button', {
        onClick: function() {
          // 업무/라이프 스타일 동기화
          if (selectedMode === 'work') {
            setLifeStyle(Object.assign({}, workStyle));
          } else {
            setWorkStyle(Object.assign({}, lifeStyle));
          }
        },
        className: textSecondary + ' text-xs hover:underline'
      }, '다른 모드에도 적용')
    )
  );
};

export default AlfredoStyleSettings;
