import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Target, Heart, Flame, MessageCircle } from 'lucide-react';

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
var getAlfredoMood = function(timeOfDay, condition, urgentCount) {
  if (timeOfDay === 'night') return { emoji: '😴', mood: 'sleepy' };
  if (condition <= 2) return { emoji: '🥺', mood: 'worried' };
  if (urgentCount > 2) return { emoji: '😰', mood: 'urgent' };
  if (timeOfDay === 'earlyMorning') return { emoji: '☀️', mood: 'fresh' };
  if (timeOfDay === 'evening') return { emoji: '🌙', mood: 'proud' };
  return { emoji: '🐧', mood: 'normal' };
};

// 시간대별 인사 (감성적으로)
var getGreeting = function(timeOfDay, condition, userName, completedCount, totalTasks) {
  var name = userName || 'Boss';
  
  // 밤 시간
  if (timeOfDay === 'night') {
    return {
      title: name + ',\n이 시간엔 쉬셔야죠.',
      subtitle: '오늘 충분히 하셨어요.\n남은 건 내일의 ' + name + '가 할 거예요.',
      emoji: '💜'
    };
  }
  
  // 컨디션 안 좋을 때
  if (condition && condition <= 2) {
    return {
      title: name + ',\n오늘 좀 힘드시구나...',
      subtitle: '무리하지 말아요. 꼭 해야 할 것만 해요.\n나머지는 제가 내일로 미뤄둘게요.',
      emoji: '💜'
    };
  }
  
  // 시간대별
  var greetings = {
    earlyMorning: {
      title: '좋은 아침이에요, ' + name + '!',
      subtitle: '오늘 하루도 제가 함께할게요.\n일단 물 한 잔 먼저 마셔요 💧',
      emoji: '☀️'
    },
    morning: {
      title: name + ',\n오전 잘 보내고 계세요?',
      subtitle: '오늘 해야 할 것들 정리해뒀어요.\n하나씩 차근차근 해봐요.',
      emoji: '✨'
    },
    lunch: {
      title: name + ',\n점심은 드셨어요?',
      subtitle: completedCount > 0 
        ? '오전에 ' + completedCount + '개나 해치웠어요! 👏\n밥 먹고 오후도 화이팅!'
        : '밥 먼저 드시고 오후에 시작해도 괜찮아요.',
      emoji: '🍚'
    },
    afternoon: {
      title: name + ',\n오후도 힘내고 있죠?',
      subtitle: completedCount > 0
        ? '벌써 ' + completedCount + '개 완료! 잘하고 있어요.\n조금만 더 하면 퇴근이에요.'
        : '지금부터 시작해도 충분해요.\n하나만 먼저 끝내볼까요?',
      emoji: '💪'
    },
    evening: {
      title: name + ',\n오늘 하루 수고했어요!',
      subtitle: completedCount > 0
        ? '오늘 ' + completedCount + '개나 해냈어요! 대단해요 🎉\n이제 좀 쉬어도 돼요.'
        : '괜찮아요. 쉬는 날도 필요한 거예요.\n내일 다시 시작하면 돼요 💜',
      emoji: '🌙'
    }
  };
  
  return greetings[timeOfDay] || greetings.morning;
};

// 알프레도 한마디 (상황별 추가 메시지)
var getAlfredoTip = function(props) {
  var timeOfDay = props.timeOfDay;
  var condition = props.condition;
  var weather = props.weather;
  var urgentTasks = props.urgentTasks || [];
  var upcomingEvent = props.upcomingEvent;
  
  var tips = [];
  
  // 날씨 팁 (아침에만)
  if (timeOfDay === 'earlyMorning' && weather) {
    var temp = weather.temp || weather.temperature;
    if (temp !== undefined) {
      if (temp <= 0) tips.push('🧣 오늘 ' + Math.round(temp) + '도예요. 패딩, 목도리 필수!');
      else if (temp <= 5) tips.push('🧥 오늘 ' + Math.round(temp) + '도예요. 따뜻하게 입으세요.');
      else if (temp <= 15) tips.push('🧥 오늘 ' + Math.round(temp) + '도예요. 겉옷 챙기세요.');
    }
  }
  
  // 긴급 일정
  if (upcomingEvent) {
    var eventTime = new Date(upcomingEvent.start || upcomingEvent.startTime);
    var now = new Date();
    var diffMinutes = Math.round((eventTime - now) / 1000 / 60);
    var eventTitle = upcomingEvent.title || upcomingEvent.summary || '일정';
    
    if (diffMinutes > 0 && diffMinutes <= 30) {
      tips.push('⚡ ' + diffMinutes + '분 뒤 ' + eventTitle + '이 있어요!');
    } else if (diffMinutes > 0 && diffMinutes <= 60) {
      tips.push('📅 ' + diffMinutes + '분 뒤 ' + eventTitle + '이 있어요.');
    }
  }
  
  // 긴급 태스크
  if (urgentTasks.length > 0 && timeOfDay !== 'night') {
    if (urgentTasks.length === 1) {
      tips.push('🔥 오늘 마감: ' + urgentTasks[0].title);
    } else {
      tips.push('🔥 오늘 마감인 것 ' + urgentTasks.length + '개 있어요!');
    }
  }
  
  // 컨디션 케어
  if (condition <= 2 && timeOfDay !== 'night') {
    tips.push('💜 힘들면 5분만 쉬어도 괜찮아요.');
  }
  
  // 오후 케어
  if (timeOfDay === 'afternoon' && condition >= 3) {
    tips.push('🧘 잠깐 스트레칭 하고 가는 건 어때요?');
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
        className: 'px-3 py-2 min-h-[36px] rounded-full text-xs font-medium transition-all btn-press ' +
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
  
  var timeOfDay = getTimeOfDay();
  
  // 오늘 통계
  var todayStats = useMemo(function() {
    var now = new Date();
    var today = now.toDateString();
    
    var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
    var completedTasks = tasks.filter(function(t) { return t.completed; });
    
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
      upcomingEvent: upcomingEvent
    };
  }, [tasks, events]);
  
  // 인사말
  var greeting = getGreeting(timeOfDay, condition, userName, todayStats.completed, tasks.length);
  
  // 알프레도 표정
  var alfredoMood = getAlfredoMood(timeOfDay, condition, todayStats.urgent.length);
  
  // 추가 팁
  var tips = getAlfredoTip({
    timeOfDay: timeOfDay,
    condition: condition,
    weather: weather,
    urgentTasks: todayStats.urgent,
    upcomingEvent: todayStats.upcomingEvent
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
            className: 'px-3 py-2 rounded-xl text-sm animate-fadeInUp ' +
              (darkMode ? 'bg-white/5 text-gray-300' : 'bg-white/50 text-gray-700')
          }, tip);
        })
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
