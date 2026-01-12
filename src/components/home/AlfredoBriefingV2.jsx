import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Target, Heart, Flame, MessageCircle, Plus, Sparkles } from 'lucide-react';

// 모드 설정
var MODES = {
  focus: { id: 'focus', emoji: '🎯', label: '집중' },
  care: { id: 'care', emoji: '💜', label: '케어' },
  challenge: { id: 'challenge', emoji: '🔥', label: '챌린지' }
};

// 시간대 구분 (더 세밀하게)
var getTimeOfDay = function() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return 'earlyMorning';
  if (hour >= 9 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// 알프레도 표정 (상황별)
var getAlfredoMood = function(timeOfDay, condition, urgentCount, hasNoTasks) {
  if (timeOfDay === 'night') return { emoji: '😴', mood: 'sleepy' };
  if (condition <= 2) return { emoji: '🥺', mood: 'worried' };
  if (urgentCount > 2) return { emoji: '😰', mood: 'urgent' };
  if (hasNoTasks) return { emoji: '✨', mood: 'ready' };
  if (timeOfDay === 'earlyMorning') return { emoji: '☀️', mood: 'fresh' };
  if (timeOfDay === 'evening') return { emoji: '🌙', mood: 'proud' };
  return { emoji: '🐧', mood: 'normal' };
};

// 🐧 시간대별 인사 (더 자연스럽고 다양하게)
var getGreeting = function(timeOfDay, condition, userName, completedCount, totalTasks, hasNoTasks, hasNoEvents) {
  var name = userName || 'Boss';
  var isEmpty = hasNoTasks && hasNoEvents;
  
  // 밤 시간
  if (timeOfDay === 'night') {
    var nightMessages = [
      {
        title: name + '님,\n이 시간엔 쉬셔야죠 🌙',
        subtitle: '오늘 하루 수고 많으셨어요.\n내일은 제가 더 잘 챙겨드릴게요.',
        emoji: '💜'
      },
      {
        title: '밤이 깊었어요, ' + name + '님',
        subtitle: '오늘 못 한 건 내일의 ' + name + '님이\n해낼 거예요. 일단 푹 쉬세요.',
        emoji: '🌙'
      }
    ];
    return nightMessages[Math.floor(Math.random() * nightMessages.length)];
  }
  
  // 컨디션 안 좋을 때 (최우선)
  if (condition && condition <= 2) {
    var careMessages = [
      {
        title: name + '님,\n오늘 좀 힘드시구나...',
        subtitle: '무리하지 말아요. 꼭 해야 할 것만요.\n나머지는 제가 내일로 옮겨둘게요.',
        emoji: '💜'
      },
      {
        title: '괜찮으세요, ' + name + '님?',
        subtitle: '컨디션이 안 좋을 땐 쉬는 것도 일이에요.\n급한 거 아니면 미뤄도 괜찮아요.',
        emoji: '🤗'
      },
      {
        title: name + '님, 오늘은\n살살 가요 우리',
        subtitle: '몸이 먼저예요. 하나만 해도 충분해요.\n아니, 안 해도 괜찮아요.',
        emoji: '💜'
      }
    ];
    return careMessages[Math.floor(Math.random() * careMessages.length)];
  }
  
  // 데이터가 없을 때 (처음 사용자 또는 빈 상태)
  if (isEmpty) {
    var emptyMessages = {
      earlyMorning: {
        title: '좋은 아침이에요, ' + name + '님!',
        subtitle: '오늘 하루 뭘 하고 싶으세요?\n같이 계획 세워볼까요?',
        emoji: '☀️'
      },
      morning: {
        title: name + '님, 오전 잘 보내고 계세요?',
        subtitle: '오늘 할 일 있으면 알려주세요.\n제가 챙겨드릴게요!',
        emoji: '✨'
      },
      lunch: {
        title: name + '님, 점심 맛있게 드셨어요?',
        subtitle: '오후에 뭐 하실 건지 알려주시면\n제가 리마인드 해드릴게요.',
        emoji: '🍚'
      },
      afternoon: {
        title: name + '님, 오후 잘 보내고 계세요?',
        subtitle: '기억해야 할 거 있으면 말해주세요.\n제가 까먹지 않게 해드릴게요.',
        emoji: '☕'
      },
      evening: {
        title: '오늘 하루 어떠셨어요, ' + name + '님?',
        subtitle: '내일 할 일 미리 정해두면\n아침이 훨씬 편해요.',
        emoji: '🌙'
      }
    };
    return emptyMessages[timeOfDay] || emptyMessages.morning;
  }
  
  // 시간대별 + 완료 상황별
  var greetings = {
    earlyMorning: {
      title: '좋은 아침이에요, ' + name + '님!',
      subtitle: '오늘 하루도 제가 함께할게요.\n일단 물 한 잔 먼저 마셔요 💧',
      emoji: '☀️'
    },
    morning: totalTasks > 0 ? {
      title: name + '님,\n오전 잘 보내고 계세요?',
      subtitle: '오늘 할 것들 정리해뒀어요.\n하나씩 차근차근 해봐요.',
      emoji: '✨'
    } : {
      title: name + '님, 좋은 오전이에요!',
      subtitle: '오늘은 어떤 하루가 될까요?\n뭐든 도와드릴 준비 됐어요.',
      emoji: '✨'
    },
    lunch: completedCount > 0 ? {
      title: name + '님, 점심은 드셨어요?',
      subtitle: '오전에 ' + completedCount + '개나 해치웠어요! 👏\n밥 먹고 오후도 화이팅!',
      emoji: '🍚'
    } : {
      title: name + '님, 점심 시간이에요!',
      subtitle: '밥이 보약이래요.\n든든히 먹고 오후 시작해요.',
      emoji: '🍚'
    },
    afternoon: completedCount > 0 ? {
      title: name + '님, 오후도 힘내고 있죠?',
      subtitle: '벌써 ' + completedCount + '개 완료! 잘하고 있어요.\n조금만 더 하면 퇴근이에요.',
      emoji: '💪'
    } : {
      title: name + '님, 오후 어떠세요?',
      subtitle: '지금부터 시작해도 충분해요.\n하나만 먼저 끝내볼까요?',
      emoji: '☕'
    },
    evening: completedCount > 0 ? {
      title: name + '님,\n오늘 하루 수고했어요!',
      subtitle: '오늘 ' + completedCount + '개나 해냈어요! 🎉\n이제 좀 쉬어도 돼요.',
      emoji: '🌙'
    } : {
      title: name + '님, 하루 마무리 어때요?',
      subtitle: '괜찮아요. 쉬는 날도 필요한 거예요.\n내일 다시 시작하면 돼요 💜',
      emoji: '🌙'
    }
  };
  
  return greetings[timeOfDay] || greetings.morning;
};

// 🐧 알프레도 한마디 (상황별 추가 메시지)
var getAlfredoTip = function(props) {
  var timeOfDay = props.timeOfDay;
  var condition = props.condition;
  var weather = props.weather;
  var urgentTasks = props.urgentTasks || [];
  var upcomingEvent = props.upcomingEvent;
  var hasNoTasks = props.hasNoTasks;
  var mode = props.mode || 'focus';
  
  var tips = [];
  
  // 날씨 팁 (아침에만, 더 자연스럽게)
  if (timeOfDay === 'earlyMorning' && weather) {
    var temp = weather.temp || weather.temperature;
    if (temp !== undefined) {
      if (temp <= 0) tips.push('🧣 오늘 ' + Math.round(temp) + '°C래요. 따뜻하게 입고 나가세요!');
      else if (temp <= 5) tips.push('🧥 오늘 쌀쌀해요 (' + Math.round(temp) + '°C). 겉옷 잊지 마세요.');
      else if (temp <= 15) tips.push('🍂 오늘 ' + Math.round(temp) + '°C예요. 가벼운 겉옷 추천!');
      else if (temp >= 28) tips.push('☀️ 오늘 덥대요 (' + Math.round(temp) + '°C). 물 많이 드세요!');
    }
    
    // 비 예보
    if (weather.rain || weather.rainChance > 50 || weather.rainProbability > 50) {
      tips.push('🌧️ 비 올 수 있어요. 우산 챙기세요!');
    }
    
    // 미세먼지
    if (weather.dust === 'bad' || weather.dust === 'veryBad') {
      tips.push('😷 미세먼지 ' + (weather.dustText || '나쁨') + '이에요. 마스크 추천!');
    }
  }
  
  // 긴급 일정 (30분 이내)
  if (upcomingEvent) {
    var eventTime = new Date(upcomingEvent.start || upcomingEvent.startTime);
    var now = new Date();
    var diffMinutes = Math.round((eventTime - now) / 1000 / 60);
    var eventTitle = upcomingEvent.title || upcomingEvent.summary || '일정';
    
    if (diffMinutes > 0 && diffMinutes <= 15) {
      tips.push('⚡ ' + diffMinutes + '분 뒤 "' + eventTitle + '"! 준비하세요!');
    } else if (diffMinutes > 0 && diffMinutes <= 30) {
      tips.push('📅 ' + diffMinutes + '분 뒤 "' + eventTitle + '" 있어요.');
    } else if (diffMinutes > 0 && diffMinutes <= 60) {
      tips.push('🕐 1시간 내에 "' + eventTitle + '" 있어요.');
    }
  }
  
  // 긴급 태스크 (오늘 마감)
  if (urgentTasks.length > 0 && timeOfDay !== 'night') {
    if (urgentTasks.length === 1) {
      tips.push('🔥 오늘 마감: "' + urgentTasks[0].title + '"');
    } else if (urgentTasks.length <= 3) {
      tips.push('🔥 오늘 마감 ' + urgentTasks.length + '개 있어요!');
    } else {
      tips.push('🔥 오늘 마감 ' + urgentTasks.length + '개... 하나씩 해봐요!');
    }
  }
  
  // 컨디션 케어 메시지
  if (condition <= 2 && timeOfDay !== 'night') {
    var careTips = [
      '💜 힘들면 5분만 눈 감아도 괜찮아요.',
      '💜 깊은 숨 한번 쉬고 가요.',
      '💜 따뜻한 거 한 잔 어때요?'
    ];
    tips.push(careTips[Math.floor(Math.random() * careTips.length)]);
  }
  
  // 오후 슬럼프 케어 (모드가 care가 아닐 때만)
  if (timeOfDay === 'afternoon' && condition >= 3 && mode !== 'care') {
    var afternoonTips = [
      '🧘 잠깐 스트레칭 하고 가는 건 어때요?',
      '☕ 커피인보다 물 한 잔 추천!',
      '💨 창문 열고 환기 한번 해요.'
    ];
    tips.push(afternoonTips[Math.floor(Math.random() * afternoonTips.length)]);
  }
  
  // 데이터 없을 때 가이드
  if (hasNoTasks && timeOfDay !== 'night') {
    tips.push('💡 "+" 버튼으로 할 일을 추가해보세요!');
  }
  
  // 저녁 리마인드
  if (timeOfDay === 'evening' && condition >= 3) {
    tips.push('🌙 내일 할 일 미리 정해두면 아침이 편해요.');
  }
  
  return tips;
};

// 인라인 모드 토글
var ModeToggle = function(props) {
  var mode = props.mode || 'focus';
  var setMode = props.setMode;
  var darkMode = props.darkMode;
  
  return React.createElement('div', { 
    className: 'inline-flex items-center gap-0.5 p-1 rounded-full ' +
      (darkMode ? 'bg-white/10' : 'bg-white/60')
  },
    Object.values(MODES).map(function(m) {
      var isActive = mode === m.id;
      return React.createElement('button', {
        key: m.id,
        onClick: function() { if (setMode) setMode(m.id); },
        className: 'px-3 py-2 min-h-[44px] rounded-full text-xs font-medium transition-all btn-press ' +
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

// 🐧 메인 브리핑 컴포넌트
export var AlfredoBriefingV2 = function(props) {
  var darkMode = props.darkMode;
  var condition = props.condition || 3;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var weather = props.weather;
  var mode = props.mode || 'focus';
  var setMode = props.setMode;
  var userName = props.userName || 'Boss';
  var onAction = props.onAction;
  var onTapAlfredo = props.onTapAlfredo;
  var onAddTask = props.onAddTask;
  
  var timeOfDay = getTimeOfDay();
  
  // 오늘 통계
  var todayStats = useMemo(function() {
    var now = new Date();
    var today = now.toDateString();
    
    var incompleteTasks = tasks.filter(function(t) { return !t.completed && t.status !== 'done'; });
    var completedTasks = tasks.filter(function(t) { return t.completed || t.status === 'done'; });
    
    var urgentTasks = incompleteTasks.filter(function(t) {
      if (!t.dueDate && !t.deadline) return false;
      var due = new Date(t.dueDate || t.deadline);
      return due.toDateString() === today;
    });
    
    var todayEvents = events.filter(function(e) {
      var eventDate = new Date(e.start || e.startTime);
      return eventDate.toDateString() === today;
    });
    
    var upcomingEvent = todayEvents.find(function(e) {
      return new Date(e.start || e.startTime) > now;
    });
    
    return {
      completed: completedTasks.length,
      remaining: incompleteTasks.length,
      urgent: urgentTasks,
      upcomingEvent: upcomingEvent,
      hasNoTasks: tasks.length === 0,
      hasNoEvents: events.length === 0 || todayEvents.length === 0
    };
  }, [tasks, events]);
  
  // 인사말
  var greeting = getGreeting(
    timeOfDay, 
    condition, 
    userName, 
    todayStats.completed, 
    tasks.length,
    todayStats.hasNoTasks,
    todayStats.hasNoEvents
  );
  
  // 알프레도 표정
  var alfredoMood = getAlfredoMood(timeOfDay, condition, todayStats.urgent.length, todayStats.hasNoTasks);
  
  // 추가 팁
  var tips = getAlfredoTip({
    timeOfDay: timeOfDay,
    condition: condition,
    weather: weather,
    urgentTasks: todayStats.urgent,
    upcomingEvent: todayStats.upcomingEvent,
    hasNoTasks: todayStats.hasNoTasks,
    mode: mode
  });
  
  // 밤 모드 체크
  var isNightMode = timeOfDay === 'night';
  
  return React.createElement('div', { 
    className: 'rounded-3xl overflow-hidden mb-6 shadow-xl animate-fadeIn ' +
      (isNightMode
        ? (darkMode ? 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e]' : 'bg-gradient-to-br from-[#2d3436] to-[#636e72]')
        : (darkMode 
          ? 'bg-gradient-to-br from-[#2C2C2E] to-[#1D1D1F]' 
          : 'bg-gradient-to-br from-[#E8E4F3] to-[#D4CCE8]'))
  },
    React.createElement('div', { className: 'p-5' },
      // 🐧 큰 알프레도 아바타 + 말풍선
      React.createElement('div', { className: 'flex items-start gap-4' },
        // 알프레도 아바타 (크게!)
        React.createElement('button', { 
          onClick: onTapAlfredo,
          className: 'relative flex-shrink-0 group'
        },
          React.createElement('div', { 
            className: 'w-16 h-16 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-3xl shadow-xl shadow-[#A996FF]/40 transition-transform group-hover:scale-105 group-active:scale-95'
          }, '🐧'),
          // 상태 표시 배지
          React.createElement('div', {
            className: 'absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-sm'
          }, alfredoMood.emoji)
        ),
        
        // 말풍선 스타일 인사
        React.createElement('div', { className: 'flex-1 min-w-0' },
          // 말풍선
          React.createElement('div', { 
            className: 'relative rounded-2xl p-4 ' +
              (darkMode ? 'bg-white/10' : 'bg-white/70')
          },
            // 말풍선 꼬리
            React.createElement('div', {
              className: 'absolute left-[-8px] top-4 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ' +
                (darkMode ? 'border-r-[8px] border-r-white/10' : 'border-r-[8px] border-r-white/70')
            }),
            
            // 인사 타이틀
            React.createElement('h1', { 
              className: (darkMode ? 'text-white' : 'text-gray-900') + 
                ' text-lg font-bold leading-tight whitespace-pre-line'
            }, greeting.title),
            
            // 서브 메시지
            React.createElement('p', { 
              className: (darkMode ? 'text-gray-300' : 'text-gray-600') + 
                ' text-sm mt-2 leading-relaxed whitespace-pre-line'
            }, greeting.subtitle),
            
            // 이모지
            greeting.emoji && React.createElement('span', { 
              className: 'inline-block mt-2 text-lg'
            }, greeting.emoji)
          )
        )
      ),
      
      // 모드 토글 (밤에는 숨김)
      !isNightMode && React.createElement('div', { className: 'mt-4' },
        React.createElement(ModeToggle, {
          mode: mode,
          setMode: setMode,
          darkMode: darkMode
        })
      ),
      
      // 추가 팁들
      tips.length > 0 && !isNightMode && React.createElement('div', { 
        className: 'mt-4 space-y-2'
      },
        tips.map(function(tip, idx) {
          return React.createElement('div', {
            key: idx,
            className: 'px-3 py-2.5 rounded-xl text-sm animate-fadeInUp ' +
              (darkMode ? 'bg-white/5 text-gray-300' : 'bg-white/50 text-gray-700')
          }, tip);
        })
      ),
      
      // 빠른 추가 버튼 (데이터 없을 때)
      todayStats.hasNoTasks && !isNightMode && onAddTask && React.createElement('button', {
        onClick: onAddTask,
        className: 'w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl transition-all btn-press ' +
          'bg-[#A996FF] text-white font-medium shadow-lg shadow-[#A996FF]/30 hover:shadow-xl'
      },
        React.createElement(Plus, { size: 18 }),
        React.createElement('span', null, '오늘 할 일 추가하기')
      ),
      
      // 알프레도 탭 힌트
      React.createElement('button', {
        onClick: onTapAlfredo,
        className: 'w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-xl transition-all btn-press ' +
          (darkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-white/30 text-gray-400')
      },
        React.createElement(MessageCircle, { size: 14 }),
        React.createElement('span', { className: 'text-xs' }, '알프레도와 대화하기')
      )
    )
  );
};

export default AlfredoBriefingV2;
