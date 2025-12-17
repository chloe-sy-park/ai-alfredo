import React, { useState, useEffect, useMemo } from 'react';
import { Battery, BatteryLow, BatteryMedium, BatteryFull, Zap } from 'lucide-react';

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

// 시간대별 인사말
var getGreeting = function(timeOfDay) {
  var greetings = {
    earlyMorning: '일찍 일어나셨네요!',
    morning: '시작해볼까요?',
    lunch: '점심 드셨어요?',
    afternoon: '오후도 화이팅!',
    evening: '오늘 수고했어요!',
    night: '푹 쉬세요'
  };
  return greetings[timeOfDay] || '시작해볼까요?';
};

// 브리핑 생성
var generateBriefing = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var weather = props.weather;
  var condition = props.condition || 3;
  
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  var urgentTasks = incompleteTasks.filter(function(t) {
    if (!t.deadline && !t.dueDate) return false;
    var deadline = new Date(t.deadline || t.dueDate);
    var now = new Date();
    var diffHours = (deadline - now) / 1000 / 60 / 60;
    return diffHours > 0 && diffHours <= 24;
  });
  
  // 강조 브리핑 (핵심 1줄)
  var highlight = '';
  if (urgentTasks.length > 0) {
    highlight = '오늘 마감 ' + urgentTasks.length + '개 있어요!';
  } else if (incompleteTasks.length > 0) {
    highlight = '오늘 할일 ' + incompleteTasks.length + '개 예정';
  } else {
    highlight = '오늘 여유있는 하루예요';
  }
  
  // 상세 브리핑
  var details = [];
  
  if (weather) {
    var temp = weather.temp || weather.temperature || 0;
    if (temp <= 0) {
      details.push('오늘 ' + temp + '° 많이 추워요! 따뜻하게 입으세요 🧣');
    } else if (temp >= 25) {
      details.push('오늘 ' + temp + '° 더워요! 시원하게 입으세요 👕');
    }
  }
  
  if (condition <= 2) {
    details.push('컨디션 낮으니 무리하지 마세요 💜');
  }
  
  if (events.length > 0) {
    var nextEvent = events[0];
    var eventTitle = nextEvent.title || nextEvent.summary || '일정';
    details.push('다음 일정: ' + eventTitle);
  }
  
  return {
    highlight: highlight,
    detail: details.join(' ')
  };
};

// 🐧 알프레도 히어로 섹션 v2
export var AlfredoHeroV2 = function(props) {
  var userName = props.userName || 'Boss';
  var condition = props.condition || 3;
  var energy = props.energy || 3;
  var weather = props.weather;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var onConditionChange = props.onConditionChange;
  var onEnergyChange = props.onEnergyChange;
  
  var showConditionState = useState(false);
  var showConditionPicker = showConditionState[0];
  var setShowConditionPicker = showConditionState[1];
  
  var showEnergyState = useState(false);
  var showEnergyPicker = showEnergyState[0];
  var setShowEnergyPicker = showEnergyState[1];
  
  // 컨디션 이모지
  var conditionEmojis = ['😫', '😔', '😐', '😊', '🔥'];
  var conditionLabels = ['아파요', '힘들어요', '보통', '좋아요', '최고!'];
  
  // 에너지 이모지 (배터리 스타일)
  var energyEmojis = ['🪫', '🔋', '⚡', '💪', '🚀'];
  var energyLabels = ['방전', '낮음', '보통', '충전됨', '폭발!'];
  
  // 시간대별 인사말
  var timeOfDay = getTimeOfDay();
  var greeting = getGreeting(timeOfDay);
  
  // 브리핑 생성
  var briefing = useMemo(function() {
    return generateBriefing({ tasks: tasks, events: events, weather: weather, condition: condition });
  }, [tasks, events, weather, condition]);
  
  // 배경색: 메인 배경과 동일 (#F5F5F7)
  return React.createElement('div', {
    className: 'bg-[#F5F5F7] pt-2 pb-6 px-4'
  },
    React.createElement('div', { 
      className: 'max-w-3xl mx-auto flex items-start gap-4'
    },
      // 왼쪽: 알프레도 이미지 (큰 사이즈)
      React.createElement('div', {
        className: 'flex-shrink-0'
      },
        React.createElement('img', {
          src: '/alfredo-penguin.png',
          alt: 'Alfredo',
          className: 'w-32 h-32 md:w-40 md:h-40 object-contain',
          onError: function(e) {
            // 이미지 로드 실패 시 이모지로 대체
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = '<div class="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center text-7xl md:text-8xl">🐧</div>';
          }
        })
      ),
      
      // 오른쪽: 텍스트 + 버튼들
      React.createElement('div', {
        className: 'flex-1 pt-2'
      },
        // 메인 인사말
        React.createElement('h1', {
          className: 'text-3xl md:text-4xl font-bold text-gray-900 leading-tight'
        }, userName + ','),
        React.createElement('h2', {
          className: 'text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4'
        }, greeting),
        
        // 기분 + 에너지 버튼
        React.createElement('div', { 
          className: 'flex items-center gap-2 mb-4'
        },
          // 기분 버튼 (에너지 아이콘 - 왼쪽)
          React.createElement('div', { className: 'relative' },
            React.createElement('button', {
              onClick: function() { 
                setShowEnergyPicker(!showEnergyPicker); 
                setShowConditionPicker(false); 
              },
              className: 'w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl hover:bg-amber-200 transition-colors'
            },
              React.createElement('span', null, energyEmojis[energy - 1])
            ),
            React.createElement('span', {
              className: 'text-xs text-gray-500 text-center block mt-1'
            }, '(보스의 에너지)'),
            
            // 에너지 선택 팝업
            showEnergyPicker && React.createElement('div', {
              className: 'absolute top-full mt-2 left-1/2 -translate-x-1/2 flex gap-1 p-2 rounded-2xl shadow-xl z-50 bg-white border border-gray-100'
            },
              energyEmojis.map(function(emoji, i) {
                return React.createElement('button', {
                  key: i,
                  onClick: function() {
                    if (onEnergyChange) onEnergyChange(i + 1);
                    setShowEnergyPicker(false);
                  },
                  className: 'w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform hover:scale-110 ' +
                    (energy === i + 1 ? 'bg-amber-100' : 'hover:bg-gray-100')
                }, emoji);
              })
            )
          ),
          
          // 기분 버튼 (스마일 아이콘 - 오른쪽)
          React.createElement('div', { className: 'relative' },
            React.createElement('button', {
              onClick: function() { 
                setShowConditionPicker(!showConditionPicker); 
                setShowEnergyPicker(false); 
              },
              className: 'w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl hover:bg-amber-200 transition-colors'
            },
              React.createElement('span', null, conditionEmojis[condition - 1])
            ),
            React.createElement('span', {
              className: 'text-xs text-gray-500 text-center block mt-1'
            }, '(보스의 기분)'),
            
            // 기분 선택 팝업
            showConditionPicker && React.createElement('div', {
              className: 'absolute top-full mt-2 left-1/2 -translate-x-1/2 flex gap-1 p-2 rounded-2xl shadow-xl z-50 bg-white border border-gray-100'
            },
              conditionEmojis.map(function(emoji, i) {
                return React.createElement('button', {
                  key: i,
                  onClick: function() {
                    if (onConditionChange) onConditionChange(i + 1);
                    setShowConditionPicker(false);
                  },
                  className: 'w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform hover:scale-110 ' +
                    (condition === i + 1 ? 'bg-purple-100' : 'hover:bg-gray-100')
                }, emoji);
              })
            )
          )
        ),
        
        // 강조 브리핑 (볼드)
        React.createElement('p', {
          className: 'text-base md:text-lg font-bold text-gray-900 mb-1'
        }, briefing.highlight),
        
        // 상세 브리핑 (회색)
        briefing.detail && React.createElement('p', {
          className: 'text-sm text-gray-500'
        }, briefing.detail)
      )
    ),
    
    // 클릭 외부 닫기
    (showConditionPicker || showEnergyPicker) && React.createElement('div', {
      className: 'fixed inset-0 z-40',
      onClick: function() { 
        setShowConditionPicker(false); 
        setShowEnergyPicker(false); 
      }
    })
  );
};

export default AlfredoHeroV2;
