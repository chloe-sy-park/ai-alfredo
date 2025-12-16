import React, { useState, useMemo } from 'react';
import { ChevronDown, Target, Heart, Flame } from 'lucide-react';

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

// 알프레도 브리핑 생성 (수석비서 스타일)
var generateBriefing = function(props) {
  var condition = props.condition;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var weather = props.weather;
  var userName = props.userName || '클로이';
  var reminders = props.reminders || [];
  
  var now = new Date();
  var timeOfDay = getTimeOfDay();
  var lines = [];
  
  // 오늘 일정 필터링
  var todayEvents = events.filter(function(e) {
    var eventDate = new Date(e.start);
    return eventDate.toDateString() === now.toDateString();
  }).sort(function(a, b) {
    return new Date(a.start) - new Date(b.start);
  });
  
  // 미완료 할일
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  var urgentTasks = incompleteTasks.filter(function(t) { 
    return t.priority === 'high' || t.importance >= 4; 
  });
  var emailTasks = incompleteTasks.filter(function(t) { 
    return t.title && (t.title.includes('메일') || t.title.includes('회신')); 
  });
  
  // === 첫 번째 줄: 인사 + 감성 ===
  if (timeOfDay === 'night') {
    lines.push('오늘 충분히 하셨어요. 남은 건 내일의 ' + userName + '가 할 거예요.');
    lines.push('푹 쉬세요 💜');
  } else if (condition && condition <= 2) {
    lines.push('괜찮아요. 무리하지 말고 꼭 해야 할 것만 해요.');
    lines.push('나머지는 내일의 ' + userName + '가 할 거예요 💜');
  } else if (timeOfDay === 'morning') {
    lines.push('오늘도 차근차근 시작해봐요 ☀️');
  } else if (timeOfDay === 'lateMorning') {
    lines.push('점심 전에 중요한 거 하나만 끝내봐요 💪');
  } else if (timeOfDay === 'lunch') {
    lines.push('잠깐 쉬고 오후 시작해요 🍽️');
  } else if (timeOfDay === 'afternoon') {
    lines.push('남은 일정 체크해볼까요? 📋');
  } else if (timeOfDay === 'evening') {
    lines.push('마무리하고 편히 쉬어요 🌙');
  }
  
  // === 날씨 (아침에만) ===
  if (timeOfDay === 'morning' && weather) {
    var temp = weather.temp || 3;
    var clothingAdvice = temp <= 0 ? '패딩, 목도리 필수예요!' 
      : temp <= 5 ? '두꺼운 외투 챙기세요' 
      : temp <= 10 ? '가디건이나 자켓 추천해요'
      : '가벼운 옷차림이면 될 것 같아요';
    lines.push('오늘 ' + temp + '도예요. ' + clothingAdvice);
  }
  
  // === 일정 정보 ===
  if (todayEvents.length > 0) {
    var nextEvent = todayEvents.find(function(e) { return new Date(e.start) > now; });
    if (nextEvent) {
      var eventTime = new Date(nextEvent.start);
      var hours = eventTime.getHours();
      var minutes = eventTime.getMinutes();
      var timeStr = (hours >= 12 ? '오후 ' : '오전 ') + 
        (hours > 12 ? hours - 12 : hours) + '시' +
        (minutes > 0 ? ' ' + minutes + '분' : '');
      var eventTitle = nextEvent.title || nextEvent.summary || '미팅';
      lines.push('이따 ' + timeStr + '에 ' + eventTitle + '이 있어요.');
    }
  }
  
  // === 할일 정보 ===
  if (incompleteTasks.length > 0) {
    var taskParts = [];
    if (urgentTasks.length > 0) {
      taskParts.push('오늘 마감인 테스크 ' + urgentTasks.length + '건');
    }
    if (emailTasks.length > 0) {
      taskParts.push('회신해야하는 메일 ' + emailTasks.length + '건');
    }
    if (taskParts.length > 0) {
      lines.push(taskParts.join(', ') + '이 있어요.');
    }
  }
  
  // === 일상 케어 (루틴 기반) ===
  // TODO: 실제 루틴 데이터 연동
  if (timeOfDay === 'morning') {
    lines.push('물 한잔 마시고, 영양제 챙겨드세요 💧');
  } else if (timeOfDay === 'afternoon') {
    lines.push('스트레칭 한번 하고 가시죠 🧘');
  }
  
  // === 리마인더 (마지막) ===
  var reminderItem = null;
  if (reminders.length > 0) {
    var topReminder = reminders[0];
    var reminderText = '';
    
    if (topReminder.type === 'call' || topReminder.title.includes('연락')) {
      reminderText = '엄마님께 연락할 때가 됐어요';
    } else if (topReminder.type === 'payment' || topReminder.title.includes('대금')) {
      reminderText = topReminder.title + ' 납부일이 다가왔어요';
    } else if (topReminder.type === 'email') {
      reminderText = topReminder.title + ' 회신 잊지 마세요';
    } else {
      reminderText = topReminder.title;
    }
    
    reminderItem = {
      text: reminderText,
      data: topReminder
    };
    
    lines.push('마지막으로, 잊지 마세요!');
  }
  
  return {
    lines: lines,
    reminderItem: reminderItem
  };
};

// 인사말 타이틀 생성
var getGreetingTitle = function(timeOfDay, condition, userName) {
  var name = userName || '클로이';
  
  if (timeOfDay === 'night') {
    return name + ',\n이 시간엔 쉬셔야죠,';
  }
  
  if (condition && condition <= 2) {
    return name + ',\n오늘 좀 힘드시구나...';
  }
  
  var titles = {
    morning: name + ',\n좋은 아침이에요!',
    lateMorning: name + ',\n오전 잘 보내고 계세요?',
    lunch: name + ',\n점심 맛있게 드셨어요?',
    afternoon: name + ',\n오후도 힘내세요!',
    evening: name + ',\n오늘 하루 수고했어요!'
  };
  
  return titles[timeOfDay] || titles.morning;
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
  
  var expandedState = useState(false); // 기본: 접힌 상태
  var isExpanded = expandedState[0];
  var setExpanded = expandedState[1];
  
  var modeDropdownState = useState(false);
  var showModeDropdown = modeDropdownState[0];
  var setShowModeDropdown = modeDropdownState[1];
  
  var timeOfDay = getTimeOfDay();
  var greetingTitle = getGreetingTitle(timeOfDay, condition, userName);
  var currentMode = MODES[mode] || MODES.focus;
  
  // 브리핑 생성
  var briefing = useMemo(function() {
    return generateBriefing({ 
      condition: condition, 
      tasks: tasks, 
      events: events, 
      weather: weather, 
      userName: userName,
      reminders: reminders
    });
  }, [condition, tasks, events, weather, userName, reminders]);
  
  // 접힌 상태: 첫 2줄만
  var visibleLines = isExpanded ? briefing.lines : briefing.lines.slice(0, 2);
  var hasMoreLines = briefing.lines.length > 2;
  
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
        
        // 인사말 타이틀
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('h1', { 
            className: (darkMode ? 'text-white' : 'text-gray-900') + 
              ' text-2xl font-bold leading-tight whitespace-pre-line'
          }, greetingTitle)
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
      
      // 브리핑 내용
      React.createElement('div', { className: 'mt-4' },
        // 보이는 줄들
        visibleLines.map(function(line, idx) {
          return React.createElement('p', {
            key: idx,
            className: (darkMode ? 'text-gray-200' : 'text-gray-700') + ' text-sm leading-relaxed mb-1'
          }, line);
        }),
        
        // 펼쳐진 상태에서 리마인더 버튼
        isExpanded && briefing.reminderItem && React.createElement('button', {
          onClick: function() { if (onAction) onAction('openReminder', briefing.reminderItem.data); },
          className: 'mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full ' +
            (darkMode ? 'bg-white/10' : 'bg-white/60') + ' transition-all hover:scale-105'
        },
          React.createElement('span', { className: 'text-pink-400' }, '♡'),
          React.createElement('span', { 
            className: (darkMode ? 'text-white' : 'text-gray-700') + ' text-sm' 
          }, briefing.reminderItem.text)
        )
      ),
      
      // 더보기/접기 토글
      hasMoreLines && React.createElement('button', {
        onClick: function() { setExpanded(!isExpanded); },
        className: 'w-full flex items-center justify-center pt-4 mt-2'
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
