import React, { useState, useEffect } from 'react';

/**
 * 알프레도 스타일 설정 컴포넌트
 * - 4가지 육성 축 슬라이더
 * - 실시간 프리뷰
 */
var AlfredoStyleSettings = function(props) {
  var darkMode = props.darkMode;
  var onStyleChange = props.onStyleChange;
  
  // 4가지 육성 축 (0-100)
  var _toneState = useState(function() {
    var saved = localStorage.getItem('alfredo_tone_warmth');
    return saved ? parseInt(saved) : 50;
  });
  var toneWarmth = _toneState[0];
  var setToneWarmth = _toneState[1];
  
  var _notifState = useState(function() {
    var saved = localStorage.getItem('alfredo_notification_freq');
    return saved ? parseInt(saved) : 50;
  });
  var notificationFreq = _notifState[0];
  var setNotificationFreq = _notifState[1];
  
  var _dataState = useState(function() {
    var saved = localStorage.getItem('alfredo_data_depth');
    return saved ? parseInt(saved) : 50;
  });
  var dataDepth = _dataState[0];
  var setDataDepth = _dataState[1];
  
  var _motivState = useState(function() {
    var saved = localStorage.getItem('alfredo_motivation_style');
    return saved ? parseInt(saved) : 50;
  });
  var motivationStyle = _motivState[0];
  var setMotivationStyle = _motivState[1];
  
  // localStorage 저장
  useEffect(function() {
    localStorage.setItem('alfredo_tone_warmth', toneWarmth.toString());
    localStorage.setItem('alfredo_notification_freq', notificationFreq.toString());
    localStorage.setItem('alfredo_data_depth', dataDepth.toString());
    localStorage.setItem('alfredo_motivation_style', motivationStyle.toString());
    
    if (onStyleChange) {
      onStyleChange({
        toneWarmth: toneWarmth,
        notificationFreq: notificationFreq,
        dataDepth: dataDepth,
        motivationStyle: motivationStyle
      });
    }
  }, [toneWarmth, notificationFreq, dataDepth, motivationStyle]);
  
  // 다크모드 색상
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var bgCard = darkMode ? 'bg-gray-800' : 'bg-white/70';
  var sliderBg = darkMode ? 'bg-gray-700' : 'bg-gray-200';
  
  // 프리뷰 메시지 생성
  var getPreviewMessage = function() {
    var messages = {
      warm: [
        "오늘 미팅 3개나 있네요. 힘들 수 있으니까 중간에 잠깐 쉬어가요, 괜찮죠? 💙",
        "아침이에요! 오늘도 함께 힘내봐요. 뭐부터 시작해볼까요? 🌅",
        "에너지가 조금 낮은 것 같아요. 무리하지 마시고 천천히 해요 🤗"
      ],
      direct: [
        "오늘 미팅 3개. 체력 관리 필수입니다. 11시 미팅 후 반드시 10분 휴식 넣으세요.",
        "아침 브리핑입니다. 오늘 우선순위: 1. 기획안 마감 2. 팀 미팅 3. 리포트 검토.",
        "에너지 레벨 낮음 감지. 가벼운 태스크 먼저 처리 권장합니다."
      ],
      balanced: [
        "오늘 미팅 3개 있어요. 11시 미팅 후에 휴식 시간 넣어두면 좋을 것 같아요.",
        "좋은 아침이에요! 오늘 일정 확인해봤는데, 오전에 집중 작업하시면 좋겠어요.",
        "오늘 에너지가 좀 낮아 보여요. 쉬운 것부터 해볼까요?"
      ]
    };
    
    var messageIdx = Math.floor(toneWarmth / 34); // 0, 1, 2
    if (toneWarmth <= 30) {
      return messages.direct[messageIdx % 3];
    } else if (toneWarmth >= 70) {
      return messages.warm[messageIdx % 3];
    } else {
      return messages.balanced[messageIdx % 3];
    }
  };
  
  // 슬라이더 컴포넌트
  var StyleSlider = function(sliderProps) {
    var label = sliderProps.label;
    var leftEmoji = sliderProps.leftEmoji;
    var leftText = sliderProps.leftText;
    var rightEmoji = sliderProps.rightEmoji;
    var rightText = sliderProps.rightText;
    var value = sliderProps.value;
    var onChange = sliderProps.onChange;
    var description = sliderProps.description;
    
    return React.createElement('div', { className: 'mb-5' },
      React.createElement('div', { className: 'flex justify-between items-center mb-2' },
        React.createElement('span', { className: textPrimary + ' font-medium text-sm' }, label),
        description && React.createElement('span', { className: textSecondary + ' text-xs' }, description)
      ),
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('div', { className: 'flex items-center gap-1 min-w-[80px]' },
          React.createElement('span', { className: 'text-lg' }, leftEmoji),
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
        React.createElement('div', { className: 'flex items-center gap-1 min-w-[80px] justify-end' },
          React.createElement('span', { className: textSecondary + ' text-xs' }, rightText),
          React.createElement('span', { className: 'text-lg' }, rightEmoji)
        )
      )
    );
  };
  
  return React.createElement('div', { className: bgCard + ' backdrop-blur-xl rounded-xl p-4' },
    // 헤더
    React.createElement('h3', { className: textPrimary + ' font-bold mb-4 flex items-center gap-2' },
      React.createElement('span', { className: 'text-xl' }, '🐧'),
      '내 알프레도 스타일'
    ),
    
    // 슬라이더들
    React.createElement(StyleSlider, {
      label: '1. 말투는 어떻게?',
      leftEmoji: '🌸',
      leftText: '다정하게',
      rightEmoji: '🔥',
      rightText: '직설적으로',
      value: toneWarmth,
      onChange: setToneWarmth
    }),
    
    React.createElement(StyleSlider, {
      label: '2. 얼마나 자주 말 걸까?',
      leftEmoji: '🤫',
      leftText: '필요할 때만',
      rightEmoji: '💬',
      rightText: '자주자주',
      value: notificationFreq,
      onChange: setNotificationFreq
    }),
    
    React.createElement(StyleSlider, {
      label: '3. 데이터는 얼마나?',
      leftEmoji: '😌',
      leftText: '핵심만',
      rightEmoji: '🔬',
      rightText: '다 보여줘',
      value: dataDepth,
      onChange: setDataDepth
    }),
    
    React.createElement(StyleSlider, {
      label: '4. 동기부여 방식은?',
      leftEmoji: '🌊',
      leftText: '느긋하게',
      rightEmoji: '🏆',
      rightText: '도전적으로',
      value: motivationStyle,
      onChange: setMotivationStyle
    }),
    
    // 실시간 프리뷰
    React.createElement('div', { 
      className: (darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]') + ' rounded-xl p-4 mt-4'
    },
      React.createElement('p', { className: textSecondary + ' text-xs mb-2' }, '💬 이런 느낌으로 말할게요'),
      React.createElement('div', { className: 'flex items-start gap-3' },
        React.createElement('div', { 
          className: 'w-10 h-10 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-lg flex-shrink-0'
        }, '🐧'),
        React.createElement('div', { 
          className: (darkMode ? 'bg-gray-600' : 'bg-white') + ' rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm'
        },
          React.createElement('p', { className: textPrimary + ' text-sm leading-relaxed' }, getPreviewMessage())
        )
      )
    ),
    
    // 초기화 버튼
    React.createElement('button', {
      onClick: function() {
        setToneWarmth(50);
        setNotificationFreq(50);
        setDataDepth(50);
        setMotivationStyle(50);
      },
      className: textSecondary + ' text-xs mt-3 hover:underline'
    }, '기본값으로 초기화')
  );
};

export default AlfredoStyleSettings;
