import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Target, Heart, Flame } from 'lucide-react';

// 모드 설정
var MODES = {
  focus: { id: 'focus', emoji: '🎯', label: '집중' },
  care: { id: 'care', emoji: '💜', label: '케어' },
  challenge: { id: 'challenge', emoji: '🔥', label: '챌린지' }
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

// 알프레도 브리핑 생성 (실제 데이터 기반)
var generateBriefing = function(props) {
  var condition = props.condition;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var weather = props.weather;
  var userName = props.userName || '클로이';
  var reminders = props.reminders || [];
  var mode = props.mode || 'focus';
  
  var now = new Date();
  var timeOfDay = getTimeOfDay();
  var lines = [];
  
  // 오늘 일정 필터링
  var todayEvents = events.filter(function(e) {
    var eventDate = new Date(e.start || e.startTime);
    return eventDate.toDateString() === now.toDateString();
  }).sort(function(a, b) {
    return new Date(a.start || a.startTime) - new Date(b.start || b.startTime);
  });
  
  // 미완료 할일
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  var completedTasks = tasks.filter(function(t) { return t.completed; });
  
  // 긴급 태스크 (오늘 마감)
  var urgentTasks = incompleteTasks.filter(function(t) {
    if (!t.dueDate && !t.deadline) return false;
    var due = new Date(t.dueDate || t.deadline);
    return due.toDateString() === now.toDateString();
  });
  
  // 메일 관련 태스크
  var emailTasks = incompleteTasks.filter(function(t) { 
    return t.title && (t.title.includes('메일') || t.title.includes('회신') || t.title.includes('답장')); 
  });
  
  // === 첫 번째: 감성 인사 ===
  if (timeOfDay === 'night') {
    lines.push('오늘 충분히 하셨어요. 남은 건 내일의 ' + userName + '가 할 거예요.');
    lines.push('푹 쉬세요 💜');
  } else if (condition && condition <= 2) {
    lines.push('괜찮아요. 무리하지 말고 꼭 해야 할 것만 해요.');
    lines.push('나머지는 내일의 ' + userName + '가 할 거예요 💜');
  } else if (timeOfDay === 'morning') {
    // 아침: 날씨 + 오늘 계획
    if (weather) {
      var temp = weather.temp || weather.temperature;
      if (temp !== undefined) {
        var clothingAdvice = temp <= 0 ? '패딩, 목도리 필수예요!' 
          : temp <= 5 ? '두꺼운 외투 챙기세요' 
          : temp <= 10 ? '가디건이나 자켓 추천해요'
          : temp <= 15 ? '가벼운 겉옷 하나면 될 것 같아요'
          : '가벼운 옷차림이면 될 것 같아요';
        lines.push('오늘 ' + Math.round(temp) + '도예요. ' + clothingAdvice);
      }
    }
  } else if (timeOfDay === 'evening') {
    // 저녁: 하루 정리
    if (completedTasks.length > 0) {
      lines.push('오늘 ' + completedTasks.length + '개나 끝내셨네요! 수고하셨어요 👏');
    } else {
      lines.push('오늘 하루 고생 많으셨어요.');
    }
  }
  
  // === 일정 정보 ===
  var upcomingEvent = todayEvents.find(function(e) { 
    return new Date(e.start || e.startTime) > now; 
  });
  
  if (upcomingEvent) {
    var eventTime = new Date(upcomingEvent.start || upcomingEvent.startTime);
    var diffMinutes = Math.round((eventTime - now) / 1000 / 60);
    var eventTitle = upcomingEvent.title || upcomingEvent.summary || '일정';
    
    if (diffMinutes <= 30 && diffMinutes > 0) {
      // 30분 이내: 긴급
      lines.push('⚡ ' + diffMinutes + '분 뒤 ' + eventTitle + '이 있어요!');
    } else if (diffMinutes <= 60) {
      // 1시간 이내
      lines.push('이따 ' + diffMinutes + '분 뒤에 ' + eventTitle + '이 있어요.');
    } else {
      // 그 외
      var hours = eventTime.getHours();
      var minutes = eventTime.getMinutes();
      var timeStr = (hours >= 12 ? '오후 ' : '오전 ') + 
        (hours > 12 ? hours - 12 : hours) + '시' +
        (minutes > 0 ? ' ' + minutes + '분' : '');
      lines.push('이따 ' + timeStr + '에 ' + eventTitle + '이 있어요.');
    }
  } else if (todayEvents.length === 0 && timeOfDay !== 'night') {
    lines.push('오늘은 일정이 없어서 여유롭게 할 수 있어요 ✨');
  }
  
  // === 할일 정보 ===
  if (incompleteTasks.length > 0 && timeOfDay !== 'night') {
    var taskParts = [];
    
    if (urgentTasks.length > 0) {
      taskParts.push('오늘 마감인 테스크 ' + urgentTasks.length + '건');
    }
    if (emailTasks.length > 0) {
      taskParts.push('회신해야하는 메일 ' + emailTasks.length + '건');
    }
    
    if (taskParts.length > 0) {
      lines.push(taskParts.join(', ') + '이 있어요.');
    } else if (incompleteTasks.length > 0 && mode === 'focus') {
      lines.push('할 일이 ' + incompleteTasks.length + '개 남아있어요.');
    }
  }
  
  // === 일상 케어 (시간대별) ===
  if (timeOfDay === 'morning' && condition >= 3) {
    lines.push('물 한잔 마시고, 오늘도 시작해봐요 💧');
  } else if (timeOfDay === 'afternoon' && incompleteTasks.length > 3) {
    lines.push('잠깐 스트레칭 하고 가시죠 🧘');
  }
  
  // === 다 끝났을 때 ===
  if (incompleteTasks.length === 0 && timeOfDay !== 'night') {
    lines.push('할 일 다 끝내셨네요! 진짜 대단해요 🎉');
    lines.push('남은 시간 뭐 하고 싶으세요?');
  }
  
  // === 리마인더 (마지막) ===
  var reminderItem = null;
  if (reminders.length > 0 && timeOfDay !== 'night') {
    var topReminder = reminders[0];
    var reminderText = '';
    
    if (topReminder.type === 'call' || (topReminder.title && topReminder.title.includes('연락'))) {
      reminderText = topReminder.title.includes('엄마') ? '엄마님께 연락할 때가 됐어요' : topReminder.title + ' 연락해보세요';
    } else if (topReminder.type === 'payment') {
      reminderText = topReminder.title + ' 납부일이 다가왔어요';
    } else if (topReminder.type === 'email') {
      reminderText = topReminder.title + ' 잊지 마세요';
    } else {
      reminderText = topReminder.title;
    }
    
    reminderItem = {
      text: reminderText,
      data: topReminder
    };
    
    if (lines.length > 0) {
      lines.push('마지막으로, 잊지 마세요!');
    }
  }
  
  // 빈 상태 방지
  if (lines.length === 0) {
    if (timeOfDay === 'morning') {
      lines.push('오늘도 차근차근 시작해봐요 ☀️');
    } else if (timeOfDay === 'afternoon') {
      lines.push('오후도 화이팅이에요! 💪');
    } else {
      lines.push('오늘 하루 수고하셨어요 🌙');
    }
  }
  
  return {
    lines: lines,
    reminderItem: reminderItem
  };
};

// 인라인 모드 토글 (세그먼트 컨트롤) - 반응형
var ModeToggle = function(props) {
  var mode = props.mode || 'focus';
  var setMode = props.setMode;
  var darkMode = props.darkMode;
  
  return React.createElement('div', { 
    className: 'inline-flex items-center gap-0.5 md:gap-1 p-1 rounded-full ' +
      (darkMode ? 'bg-white/10' : 'bg-white/60')
  },
    Object.values(MODES).map(function(m) {
      var isActive = mode === m.id;
      // 터치 타겟 44px
      return React.createElement('button', {
        key: m.id,
        onClick: function() { if (setMode) setMode(m.id); },
        className: 'px-3 md:px-3.5 py-2 min-h-[36px] rounded-full text-xs md:text-sm font-medium transition-all btn-press ' +
          (isActive 
            ? 'bg-[#A996FF] text-white shadow-sm' 
            : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'))
      },
        React.createElement('span', { className: 'mr-1' }, m.emoji),
        m.label
      );
    })
  );
};

// 메인 브리핑 컴포넌트 - 반응형
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
  
  var timeOfDay = getTimeOfDay();
  var greetingTitle = getGreetingTitle(timeOfDay, condition, userName);
  
  // 브리핑 생성
  var briefing = useMemo(function() {
    return generateBriefing({ 
      condition: condition, 
      tasks: tasks, 
      events: events, 
      weather: weather, 
      userName: userName,
      reminders: reminders,
      mode: mode
    });
  }, [condition, tasks, events, weather, userName, reminders, mode]);
  
  // 접힌 상태: 첫 2줄만, 펼쳐진 상태: 전부
  var visibleLines = isExpanded ? briefing.lines : briefing.lines.slice(0, 2);
  var hasMoreLines = briefing.lines.length > 2;
  
  return React.createElement('div', { 
    className: 'rounded-2xl md:rounded-3xl overflow-hidden mb-4 md:mb-6 shadow-xl animate-fadeIn ' +
      (darkMode 
        ? 'bg-gradient-to-br from-[#2C2C2E] to-[#1D1D1F]' 
        : 'bg-gradient-to-br from-[#E8E4F3] to-[#D4CCE8]')
  },
    React.createElement('div', { className: 'p-4 md:p-5' },
      // 헤더: 아바타 + 인사
      React.createElement('div', { className: 'flex items-start gap-3 md:gap-4' },
        // 알프레도 아바타 (원형)
        React.createElement('div', { 
          className: 'w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#A996FF] flex items-center justify-center text-xl md:text-2xl shadow-lg shadow-[#A996FF]/30 flex-shrink-0 animate-fadeIn'
        }, '🐧'),
        
        // 인사말 타이틀
        React.createElement('div', { className: 'flex-1 min-w-0 animate-fadeInUp' },
          React.createElement('h1', { 
            className: (darkMode ? 'text-white' : 'text-gray-900') + 
              ' text-lg md:text-xl font-bold leading-tight whitespace-pre-line'
          }, greetingTitle)
        )
      ),
      
      // 모드 토글 (인라인 세그먼트)
      React.createElement('div', { className: 'mt-3 animate-fadeInUp animate-delay-100' },
        React.createElement(ModeToggle, {
          mode: mode,
          setMode: setMode,
          darkMode: darkMode
        })
      ),
      
      // 브리핑 내용
      React.createElement('div', { className: 'mt-4' },
        // 보이는 줄들
        visibleLines.map(function(line, idx) {
          var delayClass = idx === 0 ? 'animate-delay-200' : idx === 1 ? 'animate-delay-300' : 'animate-delay-400';
          return React.createElement('p', {
            key: idx,
            className: (darkMode ? 'text-gray-200' : 'text-gray-700') + 
              ' text-sm md:text-base leading-relaxed mb-1.5 animate-fadeInUp ' + delayClass
          }, line);
        }),
        
        // 펼쳐진 상태에서 리마인더 버튼 - 터치 타겟 44px
        isExpanded && briefing.reminderItem && React.createElement('button', {
          onClick: function() { if (onAction) onAction('openReminder', briefing.reminderItem.data); },
          className: 'mt-3 inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-full animate-fadeInUp btn-press ' +
            (darkMode ? 'bg-white/10 hover:bg-white/15' : 'bg-white/60 hover:bg-white/80') + 
            ' transition-all'
        },
          React.createElement('span', { className: 'text-pink-400' }, '♡'),
          React.createElement('span', { 
            className: (darkMode ? 'text-white' : 'text-gray-700') + ' text-sm' 
          }, briefing.reminderItem.text)
        )
      ),
      
      // 더보기/접기 토글 - 터치 타겟 44px
      hasMoreLines && React.createElement('button', {
        onClick: function() { setExpanded(!isExpanded); },
        className: 'w-full flex items-center justify-center gap-1 pt-3 mt-2 min-h-[44px] btn-press group'
      },
        React.createElement('span', { 
          className: (darkMode ? 'text-gray-400' : 'text-gray-500') + 
            ' text-xs md:text-sm group-hover:text-[#A996FF] transition-colors'
        }, isExpanded ? '접기' : '더보기'),
        isExpanded 
          ? React.createElement(ChevronUp, { 
              size: 14, 
              className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' group-hover:text-[#A996FF] transition-colors'
            })
          : React.createElement(ChevronDown, { 
              size: 14, 
              className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' group-hover:text-[#A996FF] transition-colors'
            })
      )
    )
  );
};

export default AlfredoBriefingV2;
