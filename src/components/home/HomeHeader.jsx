import React, { useState } from 'react';
import { Sun, Cloud, CloudRain, Calendar, CheckSquare, Droplets, Flame, ChevronDown, X } from 'lucide-react';

// 컨디션 이모지 매핑
var CONDITION_EMOJIS = {
  1: { emoji: '😰', label: '힘듦' },
  2: { emoji: '😴', label: '피곤' },
  3: { emoji: '😐', label: '보통' },
  4: { emoji: '😊', label: '좋음' },
  5: { emoji: '😄', label: '최고' }
};

// 컨디션 선택 모달
var ConditionModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var currentCondition = props.currentCondition;
  var onSelect = props.onSelect;
  var darkMode = props.darkMode;
  
  if (!isOpen) return null;
  
  var bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-end justify-center',
    onClick: onClose
  },
    React.createElement('div', { className: 'absolute inset-0 bg-black/50' }),
    React.createElement('div', {
      className: bgColor + ' w-full max-w-lg rounded-t-3xl p-6 relative',
      onClick: function(e) { e.stopPropagation(); }
    },
      React.createElement('div', { className: 'flex items-center justify-between mb-6' },
        React.createElement('h3', { className: textPrimary + ' text-lg font-bold' }, '오늘 컨디션 어때요?'),
        React.createElement('button', { onClick: onClose, className: textSecondary },
          React.createElement(X, { size: 24 })
        )
      ),
      React.createElement('div', { className: 'flex justify-between gap-2' },
        Object.keys(CONDITION_EMOJIS).map(function(key) {
          var value = parseInt(key);
          var condition = CONDITION_EMOJIS[key];
          var isSelected = currentCondition === value;
          
          return React.createElement('button', {
            key: key,
            onClick: function() { onSelect(value); onClose(); },
            className: 'flex-1 flex flex-col items-center p-4 rounded-2xl transition-all ' +
              (isSelected 
                ? 'bg-[#A996FF]/20 border-2 border-[#A996FF] scale-105' 
                : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'))
          },
            React.createElement('span', { className: 'text-3xl mb-2' }, condition.emoji),
            React.createElement('span', { className: textSecondary + ' text-xs' }, condition.label)
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
  
  var bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
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
    className: 'fixed inset-0 z-50 flex items-center justify-center',
    onClick: onClose
  },
    React.createElement('div', { className: 'absolute inset-0 bg-black/50' }),
    React.createElement('div', {
      className: bgColor + ' w-11/12 max-w-sm rounded-2xl p-6 relative',
      onClick: function(e) { e.stopPropagation(); }
    },
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('h3', { className: textPrimary + ' text-lg font-bold' }, '오늘 날씨'),
        React.createElement('button', { onClick: onClose, className: textSecondary },
          React.createElement(X, { size: 24 })
        )
      ),
      React.createElement('div', { className: 'text-center mb-4' },
        React.createElement('span', { className: 'text-5xl' }, condition.includes('비') ? '🌧️' : condition.includes('구름') ? '⛅' : '☀️'),
        React.createElement('p', { className: textPrimary + ' text-3xl font-bold mt-2' }, temp + '°'),
        React.createElement('p', { className: textSecondary + ' text-sm' }, '최저 ' + tempLow + '° / 최고 ' + temp + '°')
      ),
      React.createElement('div', { className: (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' rounded-xl p-4' },
        React.createElement('p', { className: textSecondary + ' text-sm mb-1' }, '🐧 알프레도 추천'),
        React.createElement('p', { className: textPrimary + ' font-medium' }, getClothingAdvice())
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
  var tasks = props.tasks || [];
  var events = props.events || [];
  var routines = props.routines || [];
  var streak = props.streak || 0;
  var onNavigate = props.onNavigate;
  
  var conditionModalState = useState(false);
  var showConditionModal = conditionModalState[0];
  var setShowConditionModal = conditionModalState[1];
  
  var weatherModalState = useState(false);
  var showWeatherModal = weatherModalState[0];
  var setShowWeatherModal = weatherModalState[1];
  
  var bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
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
  var tempLow = weather?.tempLow || -2;
  var weatherCondition = weather?.condition || '맑음';
  
  var getWeatherIcon = function() {
    if (weatherCondition.includes('비')) return React.createElement(CloudRain, { size: 14, className: 'text-blue-400' });
    if (weatherCondition.includes('구름')) return React.createElement(Cloud, { size: 14, className: 'text-gray-400' });
    return React.createElement(Sun, { size: 14, className: 'text-yellow-400' });
  };
  
  // 통계 계산
  var today = new Date();
  var todayEvents = events.filter(function(e) {
    var eventDate = new Date(e.start);
    return eventDate.toDateString() === today.toDateString();
  });
  
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  var completedRoutines = routines.filter(function(r) { return r.completed; });
  var routineProgress = routines.length > 0 
    ? completedRoutines.length + '/' + routines.length 
    : '0/0';
  
  var currentCondition = CONDITION_EMOJIS[condition] || CONDITION_EMOJIS[3];
  
  return React.createElement('div', { className: bgColor + ' sticky top-0 z-40 border-b ' + borderColor },
    // 첫번째 줄: 컨디션 | 날씨 | 날짜+시간
    React.createElement('div', { className: 'flex items-center justify-between px-4 py-2' },
      // 컨디션
      React.createElement('button', {
        onClick: function() { setShowConditionModal(true); },
        className: 'flex items-center gap-1.5 px-2 py-1 rounded-lg ' + (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
      },
        React.createElement('span', { className: 'text-lg' }, currentCondition.emoji),
        React.createElement(ChevronDown, { size: 12, className: textSecondary })
      ),
      
      // 날씨
      React.createElement('button', {
        onClick: function() { setShowWeatherModal(true); },
        className: 'flex items-center gap-1.5 px-2 py-1 rounded-lg ' + (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
      },
        getWeatherIcon(),
        React.createElement('span', { className: textSecondary + ' text-xs' }, temp + '°→' + tempLow + '°')
      ),
      
      // 날짜 + 시간
      React.createElement('div', { className: 'text-right' },
        React.createElement('span', { className: textPrimary + ' text-sm font-medium' }, month + '/' + date + ' ' + day),
        React.createElement('span', { className: textSecondary + ' text-xs ml-2' }, timeStr)
      )
    ),
    
    // 두번째 줄: 일정 | 할일 | 루틴 | 스트릭
    React.createElement('div', { className: 'flex items-center justify-around px-4 py-2 border-t ' + borderColor },
      // 일정
      React.createElement('button', {
        onClick: function() { if (onNavigate) onNavigate('CALENDAR'); },
        className: 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg ' + (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
      },
        React.createElement(Calendar, { size: 14, className: 'text-blue-500' }),
        React.createElement('span', { className: textPrimary + ' text-xs font-medium' }, todayEvents.length + '개')
      ),
      
      // 할일
      React.createElement('button', {
        onClick: function() { if (onNavigate) onNavigate('WORK'); },
        className: 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg ' + (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
      },
        React.createElement(CheckSquare, { size: 14, className: 'text-green-500' }),
        React.createElement('span', { className: textPrimary + ' text-xs font-medium' }, incompleteTasks.length + '개')
      ),
      
      // 루틴
      React.createElement('button', {
        onClick: function() { if (onNavigate) onNavigate('LIFE'); },
        className: 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg ' + (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
      },
        React.createElement(Droplets, { size: 14, className: 'text-cyan-500' }),
        React.createElement('span', { className: textPrimary + ' text-xs font-medium' }, routineProgress)
      ),
      
      // 스트릭
      React.createElement('button', {
        onClick: function() { if (onNavigate) onNavigate('GAME'); },
        className: 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg ' + (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
      },
        React.createElement(Flame, { size: 14, className: streak > 0 ? 'text-orange-500' : textSecondary }),
        React.createElement('span', { className: (streak > 0 ? 'text-orange-500' : textSecondary) + ' text-xs font-medium' }, streak + '일')
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
