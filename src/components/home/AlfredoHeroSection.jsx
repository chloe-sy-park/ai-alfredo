import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, Cloud, CloudRain, Snowflake } from 'lucide-react';

// 시간대별 인사말
var getGreeting = function(userName, timeOfDay, condition) {
  var name = userName || 'Boss';
  
  var greetings = {
    earlyMorning: [
      name + ', 일찍 일어나셨네요! ☀️',
      '좋은 아침이에요, ' + name + '! 오늘도 함께해요'
    ],
    morning: [
      name + ', 시작해볼까요? ✨',
      '좋은 아침! 오늘 뭐부터 할까요?'
    ],
    lunch: [
      name + ', 점심은 드셨어요? 🍚',
      '오전 잘 보내셨어요! 오후도 화이팅'
    ],
    afternoon: [
      name + ', 오후도 힘내요! 💪',
      '좋아요, 천천히 해나가요'
    ],
    evening: [
      name + ', 오늘 하루 수고했어요! 🌙',
      '이제 좀 쉬어도 돼요 💜'
    ],
    night: [
      name + ', 푹 쉬세요 🌙',
      '좋은 꿈 꿔요, 내일 봐요'
    ]
  };
  
  // 컨디션에 따른 변형
  if (condition <= 2) {
    return name + ', 무리하지 마세요 💜';
  }
  
  var options = greetings[timeOfDay] || greetings.morning;
  return options[Math.floor(Math.random() * options.length)];
};

// 시간대 체크
var getTimeOfDay = function() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return 'earlyMorning';
  if (hour >= 9 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// 날씨 아이콘
var WeatherIcon = function(props) {
  var weather = props.weather;
  var size = props.size || 16;
  
  if (!weather) return null;
  
  var condition = (weather.condition || '').toLowerCase();
  
  if (condition.includes('rain') || condition.includes('비')) {
    return React.createElement(CloudRain, { size: size, className: 'text-blue-400' });
  }
  if (condition.includes('snow') || condition.includes('눈')) {
    return React.createElement(Snowflake, { size: size, className: 'text-blue-200' });
  }
  if (condition.includes('cloud') || condition.includes('구름')) {
    return React.createElement(Cloud, { size: size, className: 'text-gray-400' });
  }
  return React.createElement(Sun, { size: size, className: 'text-yellow-400' });
};

// 🐧 알프레도 히어로 섹션
export var AlfredoHeroSection = function(props) {
  var darkMode = props.darkMode;
  var userName = props.userName || 'Boss';
  var condition = props.condition || 3;
  var energy = props.energy || 3;
  var weather = props.weather;
  var onConditionChange = props.onConditionChange;
  var onEnergyChange = props.onEnergyChange;
  var completedCount = props.completedCount || 0;
  var totalCount = props.totalCount || 0;
  
  var greetingState = useState('');
  var greeting = greetingState[0];
  var setGreeting = greetingState[1];
  
  var showConditionState = useState(false);
  var showConditionPicker = showConditionState[0];
  var setShowConditionPicker = showConditionState[1];
  
  var showEnergyState = useState(false);
  var showEnergyPicker = showEnergyState[0];
  var setShowEnergyPicker = showEnergyState[1];
  
  // 인사말 생성 (마운트 시 1회)
  useEffect(function() {
    var timeOfDay = getTimeOfDay();
    setGreeting(getGreeting(userName, timeOfDay, condition));
  }, []);
  
  // 컨디션 이모지
  var conditionEmojis = ['😫', '😔', '😐', '😊', '🔥'];
  var conditionLabels = ['아파요', '힘들어요', '보통', '좋아요', '최고!'];
  
  // 에너지 이모지
  var energyEmojis = ['🪫', '🔋', '⚡', '💪', '🚀'];
  var energyLabels = ['방전', '낮음', '보통', '충전됨', '폭발!'];
  
  // 배경 그라데이션 (시간대별)
  var timeOfDay = getTimeOfDay();
  var bgGradient = darkMode
    ? 'from-purple-900/30 via-indigo-900/20 to-slate-900/30'
    : timeOfDay === 'morning' || timeOfDay === 'earlyMorning'
      ? 'from-amber-50 via-orange-50 to-yellow-50'
      : timeOfDay === 'evening' || timeOfDay === 'night'
        ? 'from-indigo-100 via-purple-100 to-pink-100'
        : 'from-sky-50 via-blue-50 to-indigo-50';
  
  // 알프레도 표정 (컨디션 기반)
  var alfredoExpression = condition <= 2 ? '🫂' : condition >= 4 ? '🐧' : '🐧';
  
  return React.createElement('div', {
    className: 'relative overflow-hidden rounded-3xl bg-gradient-to-br ' + bgGradient + ' ' +
      (darkMode ? 'border border-white/10' : 'border border-black/5')
  },
    // 배경 장식
    React.createElement('div', {
      className: 'absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl'
    }),
    React.createElement('div', {
      className: 'absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl'
    }),
    
    // 메인 콘텐츠
    React.createElement('div', { className: 'relative p-6' },
      // 상단: 날씨 + 진행률
      React.createElement('div', { 
        className: 'flex items-center justify-between mb-4'
      },
        // 날씨
        weather && React.createElement('div', {
          className: 'flex items-center gap-1.5 px-3 py-1.5 rounded-full ' +
            (darkMode ? 'bg-white/10' : 'bg-white/60 backdrop-blur-sm')
        },
          React.createElement(WeatherIcon, { weather: weather, size: 14 }),
          React.createElement('span', {
            className: 'text-xs font-medium ' + (darkMode ? 'text-white/80' : 'text-gray-600')
          }, (weather.temp || weather.temperature || '--') + '°')
        ),
        
        // 진행률
        totalCount > 0 && React.createElement('div', {
          className: 'flex items-center gap-1.5 px-3 py-1.5 rounded-full ' +
            (darkMode ? 'bg-white/10' : 'bg-white/60 backdrop-blur-sm')
        },
          React.createElement(Sparkles, { size: 12, className: 'text-purple-500' }),
          React.createElement('span', {
            className: 'text-xs font-medium ' + (darkMode ? 'text-white/80' : 'text-gray-600')
          }, completedCount + '/' + totalCount)
        )
      ),
      
      // 중앙: 알프레도 + 인사말
      React.createElement('div', { className: 'text-center mb-6' },
        // 알프레도 이미지 (큰 사이즈)
        React.createElement('div', {
          className: 'relative inline-block mb-4'
        },
          React.createElement('div', {
            className: 'w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 ' +
              'flex items-center justify-center shadow-xl shadow-purple-500/25 ' +
              'animate-pulse-slow'
          },
            React.createElement('span', { className: 'text-5xl md:text-6xl' }, alfredoExpression)
          ),
          // 상태 뱃지
          React.createElement('div', {
            className: 'absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-lg ' +
              'flex items-center justify-center border-2 border-purple-200'
          },
            React.createElement('span', { className: 'text-lg' }, conditionEmojis[condition - 1])
          )
        ),
        
        // 인사말
        React.createElement('h2', {
          className: 'text-xl md:text-2xl font-bold mb-1 ' +
            (darkMode ? 'text-white' : 'text-gray-900')
        }, greeting || (userName + ', 시작해볼까요? ✨')),
        
        // 서브 텍스트
        React.createElement('p', {
          className: 'text-sm ' + (darkMode ? 'text-white/60' : 'text-gray-500')
        }, totalCount > 0 
          ? (completedCount > 0 
            ? '오늘 ' + completedCount + '개 완료! 잘하고 있어요'
            : '오늘 할 일 ' + totalCount + '개가 기다리고 있어요')
          : '오늘 하루도 함께해요')
      ),
      
      // 하단: 기분/에너지 버튼
      React.createElement('div', { 
        className: 'flex items-center justify-center gap-3'
      },
        // 기분 버튼
        React.createElement('div', { className: 'relative' },
          React.createElement('button', {
            onClick: function() { setShowConditionPicker(!showConditionPicker); setShowEnergyPicker(false); },
            className: 'flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all ' +
              (darkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-white/80 hover:bg-white shadow-sm text-gray-700') +
              ' backdrop-blur-sm'
          },
            React.createElement('span', { className: 'text-xl' }, conditionEmojis[condition - 1]),
            React.createElement('span', { className: 'text-sm font-medium' }, '기분'),
            React.createElement('span', { 
              className: 'text-xs px-1.5 py-0.5 rounded-full ' +
                (darkMode ? 'bg-white/20' : 'bg-gray-100')
            }, conditionLabels[condition - 1])
          ),
          
          // 기분 선택 팝업
          showConditionPicker && React.createElement('div', {
            className: 'absolute bottom-full mb-2 left-1/2 -translate-x-1/2 ' +
              'flex gap-1 p-2 rounded-2xl shadow-xl z-50 ' +
              (darkMode ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-100')
          },
            conditionEmojis.map(function(emoji, i) {
              return React.createElement('button', {
                key: i,
                onClick: function() {
                  if (onConditionChange) onConditionChange(i + 1);
                  setShowConditionPicker(false);
                },
                className: 'w-10 h-10 rounded-xl flex items-center justify-center text-xl ' +
                  'transition-transform hover:scale-110 ' +
                  (condition === i + 1 
                    ? (darkMode ? 'bg-purple-500/30' : 'bg-purple-100')
                    : 'hover:bg-gray-100')
              }, emoji);
            })
          )
        ),
        
        // 에너지 버튼
        React.createElement('div', { className: 'relative' },
          React.createElement('button', {
            onClick: function() { setShowEnergyPicker(!showEnergyPicker); setShowConditionPicker(false); },
            className: 'flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all ' +
              (darkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-white/80 hover:bg-white shadow-sm text-gray-700') +
              ' backdrop-blur-sm'
          },
            React.createElement('span', { className: 'text-xl' }, energyEmojis[energy - 1]),
            React.createElement('span', { className: 'text-sm font-medium' }, '에너지'),
            React.createElement('span', { 
              className: 'text-xs px-1.5 py-0.5 rounded-full ' +
                (darkMode ? 'bg-white/20' : 'bg-gray-100')
            }, energyLabels[energy - 1])
          ),
          
          // 에너지 선택 팝업
          showEnergyPicker && React.createElement('div', {
            className: 'absolute bottom-full mb-2 left-1/2 -translate-x-1/2 ' +
              'flex gap-1 p-2 rounded-2xl shadow-xl z-50 ' +
              (darkMode ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-100')
          },
            energyEmojis.map(function(emoji, i) {
              return React.createElement('button', {
                key: i,
                onClick: function() {
                  if (onEnergyChange) onEnergyChange(i + 1);
                  setShowEnergyPicker(false);
                },
                className: 'w-10 h-10 rounded-xl flex items-center justify-center text-xl ' +
                  'transition-transform hover:scale-110 ' +
                  (energy === i + 1 
                    ? (darkMode ? 'bg-yellow-500/30' : 'bg-yellow-100')
                    : 'hover:bg-gray-100')
              }, emoji);
            })
          )
        )
      )
    ),
    
    // 클릭 외부 닫기
    (showConditionPicker || showEnergyPicker) && React.createElement('div', {
      className: 'fixed inset-0 z-40',
      onClick: function() { setShowConditionPicker(false); setShowEnergyPicker(false); }
    })
  );
};

export default AlfredoHeroSection;
