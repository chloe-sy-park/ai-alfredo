import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Target, Heart, Flame } from 'lucide-react';

// 모드 설정
var MODES = {
  focus: { id: 'focus', emoji: '🎯', label: '집중모드', color: 'text-orange-500', bgColor: 'bg-orange-500/10', icon: Target },
  care: { id: 'care', emoji: '💜', label: '케어모드', color: 'text-purple-500', bgColor: 'bg-purple-500/10', icon: Heart },
  challenge: { id: 'challenge', emoji: '🔥', label: '챌린지모드', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: Flame }
};

// 시간대 구분
var getTimeOfDay = function() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 12) return 'lateMorning';
  if (hour >= 12 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// 인사말 생성 (이름 + 상황별 메시지)
var getGreeting = function(timeOfDay, condition, userName) {
  var name = userName || '클로이';
  
  // 밤 시간
  if (timeOfDay === 'night') {
    return {
      title: name + ',\n이 시간엔 쉬셔야죠,',
      subtitle: '오늘 충분히 하셨어요. 남은 건 내일의 ' + name + '가 할 거예요.\n푹 쉬세요 💜'
    };
  }
  
  // 컨디션 나쁠 때
  if (condition && condition <= 2) {
    return {
      title: name + ',\n오늘 좀 힘드시구나...',
      subtitle: '괜찮아요. 무리하지 말고 꼭 해야 할 것만 해요.\n나머지는 내일의 ' + name + '가 할 거예요 💜'
    };
  }
  
  var greetings = {
    morning: {
      title: name + ',\n좋은 아침이에요!',
      subtitle: '오늘도 차근차근 시작해봐요 ☀️'
    },
    lateMorning: {
      title: name + ',\n오전 잘 보내고 계세요?',
      subtitle: '점심 전에 중요한 거 하나만 끝내봐요 💪'
    },
    lunch: {
      title: name + ',\n점심 맛있게 드셨어요?',
      subtitle: '잠깐 쉬고 오후 시작해요 🍽️'
    },
    afternoon: {
      title: name + ',\n오후도 힘내세요!',
      subtitle: '남은 일정 체크해볼까요? 📋'
    },
    evening: {
      title: name + ',\n오늘 하루 수고했어요!',
      subtitle: '마무리하고 편히 쉬어요 🌙'
    }
  };
  
  return greetings[timeOfDay] || greetings.morning;
};

// 브리핑 아이템 생성
var generateBriefingItems = function(props) {
  var condition = props.condition;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var weather = props.weather;
  var userName = props.userName || '클로이';
  
  var items = [];
  var now = new Date();
  var timeOfDay = getTimeOfDay();
  
  // 오늘 일정 필터링
  var todayEvents = events.filter(function(e) {
    var eventDate = new Date(e.start);
    return eventDate.toDateString() === now.toDateString();
  }).sort(function(a, b) {
    return new Date(a.start) - new Date(b.start);
  });
  
  // 미완료 할일
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  
  // 아침 날씨 정보
  if (timeOfDay === 'morning' && weather) {
    var temp = weather.temp || 3;
    var clothingAdvice = temp <= 0 ? '패딩 필수예요!' 
      : temp <= 5 ? '두꺼운 외투 챙기세요' 
      : temp <= 10 ? '가디건이나 자켓 추천해요'
      : '가벼운 옷차림이면 될 것 같아요';
    items.push('(날씨, 옷차림 등등)');
  }
  
  // 일정 정보
  if (todayEvents.length > 0) {
    var nextEvent = todayEvents.find(function(e) { return new Date(e.start) > now; });
    if (nextEvent) {
      var time = new Date(nextEvent.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      items.push('이따 오후 ' + time.replace('오후 ', '').replace('오전 ', '') + '에 미팅이 있어요. (일정)');
    }
  }
  
  // 할일 정보
  if (incompleteTasks.length > 0) {
    var urgentCount = incompleteTasks.filter(function(t) { return t.priority === 'high'; }).length;
    var emailCount = incompleteTasks.filter(function(t) { 
      return t.title && (t.title.includes('메일') || t.title.includes('회신')); 
    }).length;
    
    var taskLine = '오늘 마감인 테스크 ' + urgentCount + '건';
    if (emailCount > 0) taskLine += ', 회신해야하는 메일 ' + emailCount + '건';
    taskLine += ' (오늘 할일)';
    items.push(taskLine);
  }
  
  // 일상 케어
  items.push('(일상에서 챙겨야할 것)');
  
  // 리마인더
  items.push('마지막으로 (잊지마세요! 뭐 할거, ...');
  
  return items;
};

// 메인 브리핑 컴포넌트
export var AlfredoBriefingV2 = function(props) {
  var darkMode = props.darkMode;
  var condition = props.condition || 3;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var weather = props.weather;
  var mode = props.mode || 'focus';
  var setMode = props.setMode;
  var userName = props.userName || '클로이';
  var onAction = props.onAction;
  var reminders = props.reminders || [];
  
  var expandedState = useState(true);
  var isExpanded = expandedState[0];
  var setExpanded = expandedState[1];
  
  var modeDropdownState = useState(false);
  var showModeDropdown = modeDropdownState[0];
  var setShowModeDropdown = modeDropdownState[1];
  
  var timeOfDay = getTimeOfDay();
  var greeting = getGreeting(timeOfDay, condition, userName);
  var currentMode = MODES[mode] || MODES.focus;
  
  // 브리핑 아이템
  var briefingItems = useMemo(function() {
    return generateBriefingItems({ condition: condition, tasks: tasks, events: events, weather: weather, userName: userName });
  }, [condition, tasks, events, weather, userName]);
  
  // 가장 급한 리마인더
  var topReminder = reminders.length > 0 ? reminders[0] : null;
  
  return React.createElement('div', { 
    className: 'rounded-3xl overflow-hidden mb-6 shadow-xl ' +
      (darkMode 
        ? 'bg-gradient-to-br from-[#2C2C2E] to-[#1D1D1F]' 
        : 'bg-gradient-to-br from-[#E8E4F3] to-[#D4CCE8]')
  },
    React.createElement('div', { className: 'p-5' },
      // 헤더: 아바타 + 인사 + 모드 선택
      React.createElement('div', { className: 'flex items-start gap-4' },
        // 알프레도 아바타 (원형)
        React.createElement('div', { 
          className: 'w-16 h-16 rounded-full bg-[#A996FF] flex items-center justify-center text-3xl shadow-lg flex-shrink-0'
        }, '🐧'),
        
        // 인사말
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('h1', { 
            className: (darkMode ? 'text-white' : 'text-gray-900') + 
              ' text-2xl font-bold leading-tight whitespace-pre-line'
          }, greeting.title),
          
          isExpanded && React.createElement('p', { 
            className: (darkMode ? 'text-gray-300' : 'text-gray-600') + 
              ' text-sm mt-2 leading-relaxed whitespace-pre-line'
          }, greeting.subtitle)
        ),
        
        // 모드 선택 버튼
        React.createElement('div', { className: 'relative' },
          React.createElement('button', {
            onClick: function() { setShowModeDropdown(!showModeDropdown); },
            className: 'flex items-center gap-1.5 px-3 py-2 rounded-full transition-all ' +
              (darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/60 hover:bg-white/80') +
              ' shadow-sm'
          },
            React.createElement('span', null, currentMode.emoji),
            React.createElement('span', { 
              className: (darkMode ? 'text-white' : 'text-gray-700') + ' text-sm font-medium' 
            }, currentMode.label.replace('모드', '')),
            React.createElement(ChevronDown, { 
              size: 14, 
              className: darkMode ? 'text-gray-300' : 'text-gray-500' 
            })
          ),
          
          // 드롭다운
          showModeDropdown && React.createElement('div', {
            className: 'absolute right-0 top-full mt-2 w-40 rounded-2xl shadow-xl overflow-hidden z-10 ' +
              (darkMode ? 'bg-[#3A3A3C]' : 'bg-white')
          },
            Object.values(MODES).map(function(m) {
              var isActive = mode === m.id;
              return React.createElement('button', {
                key: m.id,
                onClick: function() { if (setMode) setMode(m.id); setShowModeDropdown(false); },
                className: 'w-full flex items-center gap-2 px-4 py-3 transition-all ' +
                  (isActive 
                    ? 'bg-[#A996FF]/20' 
                    : (darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50'))
              },
                React.createElement('span', null, m.emoji),
                React.createElement('span', { 
                  className: (darkMode ? 'text-white' : 'text-gray-700') + ' text-sm font-medium' 
                }, m.label)
              );
            })
          )
        )
      ),
      
      // 브리핑 내용 (펼쳐진 상태일 때)
      isExpanded && React.createElement('div', { 
        className: 'mt-4 pt-4 border-t ' + (darkMode ? 'border-white/10' : 'border-black/10')
      },
        briefingItems.map(function(item, idx) {
          return React.createElement('p', {
            key: idx,
            className: (darkMode ? 'text-gray-200' : 'text-gray-700') + ' text-sm leading-relaxed mb-2'
          }, item);
        }),
        
        // 리마인더 버튼
        topReminder && React.createElement('button', {
          onClick: function() { if (onAction) onAction('openReminder', topReminder); },
          className: 'mt-3 flex items-center gap-2 px-4 py-2 rounded-full ' +
            (darkMode ? 'bg-white/10' : 'bg-white/60') + ' transition-all hover:scale-105'
        },
          React.createElement('span', null, '♡'),
          React.createElement('span', { 
            className: (darkMode ? 'text-white' : 'text-gray-700') + ' text-sm' 
          }, topReminder.title || '엄마님께 연락할 때가 됐어요')
        )
      ),
      
      // 접기/펼치기 버튼
      React.createElement('button', {
        onClick: function() { setExpanded(!isExpanded); },
        className: 'w-full flex items-center justify-center pt-3 mt-2'
      },
        React.createElement('div', { 
          className: 'w-0 h-0 border-l-8 border-r-8 border-transparent ' +
            (isExpanded 
              ? 'border-t-8 ' + (darkMode ? 'border-t-gray-400' : 'border-t-gray-500')
              : 'border-b-8 ' + (darkMode ? 'border-b-gray-400' : 'border-b-gray-500'))
        })
      )
    )
  );
};

export default AlfredoBriefingV2;
