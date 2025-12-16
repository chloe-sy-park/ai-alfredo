import React, { useState } from 'react';
import { Sun, Cloud, CloudRain, ChevronDown, X, Search, Bell, Settings, Star } from 'lucide-react';

// 컨디션 이모지 매핑
var CONDITION_EMOJIS = {
  1: { emoji: '😰', label: '힘듦' },
  2: { emoji: '😴', label: '피곤' },
  3: { emoji: '😐', label: '보통' },
  4: { emoji: '😊', label: '좋음' },
  5: { emoji: '😄', label: '최고' }
};

// 컨디션 선택 모달 (Apple 스타일 바텀시트)
var ConditionModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var currentCondition = props.currentCondition;
  var onSelect = props.onSelect;
  var darkMode = props.darkMode;
  
  if (!isOpen) return null;
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-end justify-center',
    onClick: onClose
  },
    React.createElement('div', { 
      className: 'absolute inset-0 bg-black/40 backdrop-blur-sm'
    }),
    React.createElement('div', {
      className: (darkMode ? 'bg-[#2C2C2E]' : 'bg-white') + 
        ' w-full max-w-lg rounded-t-3xl p-6 relative shadow-2xl',
      onClick: function(e) { e.stopPropagation(); }
    },
      // 핸들 바
      React.createElement('div', { 
        className: 'w-10 h-1 rounded-full mx-auto mb-6 ' + 
          (darkMode ? 'bg-gray-600' : 'bg-gray-300')
      }),
      
      React.createElement('h3', { 
        className: (darkMode ? 'text-white' : 'text-gray-900') + 
          ' text-xl font-semibold text-center mb-6' 
      }, '오늘 컨디션 어때요?'),
      
      React.createElement('div', { className: 'flex justify-between gap-3' },
        Object.keys(CONDITION_EMOJIS).map(function(key) {
          var value = parseInt(key);
          var condition = CONDITION_EMOJIS[key];
          var isSelected = currentCondition === value;
          
          return React.createElement('button', {
            key: key,
            onClick: function() { onSelect(value); onClose(); },
            className: 'flex-1 flex flex-col items-center p-4 rounded-2xl transition-all transform ' +
              (isSelected 
                ? 'bg-[#A996FF]/20 ring-2 ring-[#A996FF] scale-105' 
                : (darkMode ? 'bg-[#3A3A3C] hover:bg-[#48484A]' : 'bg-gray-100 hover:bg-gray-200')) +
              ' active:scale-95'
          },
            React.createElement('span', { className: 'text-4xl mb-2' }, condition.emoji),
            React.createElement('span', { 
              className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-xs font-medium' 
            }, condition.label)
          );
        })
      )
    )
  );
};

// 날씨 상세 모달
var WeatherModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var weather = props.weather;
  var darkMode = props.darkMode;
  
  if (!isOpen) return null;
  
  var temp = weather?.temp || 3;
  var tempLow = weather?.tempLow || -2;
  var condition = weather?.condition || '맑음';
  
  var getClothingAdvice = function() {
    if (temp <= 0) return '패딩, 목도리 필수! 🧣';
    if (temp <= 5) return '두꺼운 외투 챙기세요 🧥';
    if (temp <= 10) return '가디건이나 자켓 추천 🧥';
    if (temp <= 20) return '가벼운 겉옷 챙기세요 👔';
    return '시원하게 입으세요 👕';
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    onClick: onClose
  },
    React.createElement('div', { 
      className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' 
    }),
    React.createElement('div', {
      className: (darkMode ? 'bg-[#2C2C2E]' : 'bg-white') + 
        ' w-full max-w-sm rounded-3xl p-6 relative shadow-2xl',
      onClick: function(e) { e.stopPropagation(); }
    },
      React.createElement('button', { 
        onClick: onClose, 
        className: 'absolute top-4 right-4 p-2 rounded-full ' +
          (darkMode ? 'hover:bg-[#3A3A3C]' : 'hover:bg-gray-100')
      },
        React.createElement(X, { size: 20, className: darkMode ? 'text-gray-400' : 'text-gray-500' })
      ),
      
      React.createElement('div', { className: 'text-center pt-2' },
        React.createElement('span', { className: 'text-6xl' }, 
          condition.includes('비') ? '🌧️' : condition.includes('구름') ? '⛅' : '☀️'
        ),
        React.createElement('p', { 
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' text-4xl font-bold mt-4' 
        }, temp + '°'),
        React.createElement('p', { 
          className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm mt-1' 
        }, '최저 ' + tempLow + '° / 최고 ' + temp + '°')
      ),
      
      React.createElement('div', { 
        className: (darkMode ? 'bg-[#3A3A3C]' : 'bg-gray-50') + ' rounded-2xl p-4 mt-6' 
      },
        React.createElement('p', { 
          className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm mb-1' 
        }, '🐧 알프레도 추천'),
        React.createElement('p', { 
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-medium' 
        }, getClothingAdvice())
      )
    )
  );
};

// 메인 헤더 컴포넌트
export var HomeHeader = function(props) {
  var darkMode = props.darkMode;
  var condition = props.condition || 3;
  var setCondition = props.setCondition;
  var weather = props.weather;
  var level = props.level || 1;
  var onOpenSearch = props.onOpenSearch;
  var onOpenNotifications = props.onOpenNotifications;
  var onOpenSettings = props.onOpenSettings;
  
  var conditionModalState = useState(false);
  var showConditionModal = conditionModalState[0];
  var setShowConditionModal = conditionModalState[1];
  
  var weatherModalState = useState(false);
  var showWeatherModal = weatherModalState[0];
  var setShowWeatherModal = weatherModalState[1];
  
  // 날짜 포맷
  var now = new Date();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var days = ['일', '월', '화', '수', '목', '금', '토'];
  var day = days[now.getDay()];
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var timeStr = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
  
  // 날씨 정보
  var temp = weather?.temp || 3;
  var weatherCondition = weather?.condition || '맑음';
  
  var getWeatherIcon = function() {
    if (weatherCondition.includes('비')) return React.createElement(CloudRain, { size: 16, className: 'text-blue-400' });
    if (weatherCondition.includes('구름')) return React.createElement(Cloud, { size: 16, className: 'text-gray-400' });
    return React.createElement(Sun, { size: 16, className: 'text-amber-400' });
  };
  
  var currentCondition = CONDITION_EMOJIS[condition] || CONDITION_EMOJIS[3];
  
  return React.createElement('div', { 
    className: 'sticky top-0 z-40 backdrop-blur-xl ' +
      (darkMode 
        ? 'bg-[#1D1D1F]/80 border-b border-white/10' 
        : 'bg-[#F5F5F7]/80 border-b border-black/5')
  },
    React.createElement('div', { className: 'flex items-center justify-between px-4 py-3' },
      // 왼쪽: 날짜/시간 + 날씨 + 컨디션
      React.createElement('div', { className: 'flex items-center gap-3' },
        // 날짜/시간
        React.createElement('span', { 
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' text-sm font-semibold' 
        }, month + '/' + date + ' ' + day + ' ' + timeStr),
        
        // 날씨
        React.createElement('button', {
          onClick: function() { setShowWeatherModal(true); },
          className: 'flex items-center gap-1 px-2 py-1 rounded-full transition-all ' +
            (darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5')
        },
          getWeatherIcon(),
          React.createElement('span', { 
            className: (darkMode ? 'text-gray-300' : 'text-gray-600') + ' text-sm' 
          }, temp + '°')
        ),
        
        // 컨디션
        React.createElement('button', {
          onClick: function() { setShowConditionModal(true); },
          className: 'flex items-center gap-1 px-2 py-1 rounded-full transition-all ' +
            (darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5')
        },
          React.createElement('span', { className: 'text-lg' }, currentCondition.emoji),
          React.createElement(ChevronDown, { 
            size: 12, 
            className: darkMode ? 'text-gray-400' : 'text-gray-500' 
          })
        )
      ),
      
      // 오른쪽: 레벨 배지 + 아이콘들
      React.createElement('div', { className: 'flex items-center gap-1' },
        // 레벨 배지
        React.createElement('div', { 
          className: 'flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#A996FF] text-white text-sm font-semibold shadow-lg shadow-[#A996FF]/30'
        },
          React.createElement(Star, { size: 12, className: 'fill-current' }),
          React.createElement('span', null, 'Lv.' + level)
        ),
        
        // 검색
        React.createElement('button', {
          onClick: onOpenSearch,
          className: 'p-2 rounded-full transition-all ' +
            (darkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-600')
        },
          React.createElement(Search, { size: 20 })
        ),
        
        // 알림
        React.createElement('button', {
          onClick: onOpenNotifications,
          className: 'p-2 rounded-full transition-all relative ' +
            (darkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-600')
        },
          React.createElement(Bell, { size: 20 })
        ),
        
        // 설정
        React.createElement('button', {
          onClick: onOpenSettings,
          className: 'p-2 rounded-full transition-all ' +
            (darkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-600')
        },
          React.createElement(Settings, { size: 20 })
        )
      )
    ),
    
    // 모달들
    React.createElement(ConditionModal, {
      isOpen: showConditionModal,
      onClose: function() { setShowConditionModal(false); },
      currentCondition: condition,
      onSelect: setCondition,
      darkMode: darkMode
    }),
    
    React.createElement(WeatherModal, {
      isOpen: showWeatherModal,
      onClose: function() { setShowWeatherModal(false); },
      weather: weather,
      darkMode: darkMode
    })
  );
};

export default HomeHeader;
