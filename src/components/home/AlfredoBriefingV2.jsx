import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Target, Heart, Flame, MessageCircle, Plus, Sparkles } from 'lucide-react';

// 메시지 데이터 임포트
import { 
  GREETINGS, 
  CONDITION_CARE, 
  TIPS,
  getRandomMessage, 
  replaceVariables,
  getGreeting,
  getConditionCare
} from '../../data/alfredoMessages';

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

// 🐧 알프레도 한마디 (상황별 추가 메시지) - alfredoMessages.js 활용
var getAlfredoTip = function(props) {
  var timeOfDay = props.timeOfDay;
  var condition = props.condition;
  var weather = props.weather;
  var urgentTasks = props.urgentTasks || [];
  var upcomingEvent = props.upcomingEvent;
  var hasNoTasks = props.hasNoTasks;
  var mode = props.mode || 'focus';
  
  var tips = [];
  
  // 날씨 팁 (아침에만)
  if (timeOfDay === 'earlyMorning' && weather) {
    var temp = weather.temp || weather.temperature;
    if (temp !== undefined) {
      if (temp <= 0) {
        var coldTips = TIPS.weather.cold;
        tips.push(replaceVariables(getRandomMessage(coldTips), { temp: Math.round(temp) }));
      } else if (temp <= 15) {
        var coolTips = TIPS.weather.cool;
        tips.push(replaceVariables(getRandomMessage(coolTips), { temp: Math.round(temp) }));
      } else if (temp >= 28) {
        var hotTips = TIPS.weather.hot;
        tips.push(replaceVariables(getRandomMessage(hotTips), { temp: Math.round(temp) }));
      }
    }
    
    // 비 예보
    if (weather.rain || weather.rainChance > 50 || weather.rainProbability > 50) {
      var rainTips = TIPS.weather.rain;
      tips.push(getRandomMessage(rainTips));
    }
    
    // 미세먼지
    if (weather.dust === 'bad' || weather.dust === 'veryBad') {
      var dustTips = TIPS.weather.dust;
      tips.push(getRandomMessage(dustTips));
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
  
  // 컨디션 케어 메시지 (alfredoMessages 활용)
  if (condition <= 2 && timeOfDay !== 'night') {
    var careTips = TIPS.care;
    tips.push(getRandomMessage(careTips));
  }
  
  // 오후 슬럼프 케어 (alfredoMessages 활용)
  if (timeOfDay === 'afternoon' && condition >= 3 && mode !== 'care') {
    var afternoonTips = TIPS.afternoon;
    tips.push(getRandomMessage(afternoonTips));
  }
  
  // 데이터 없을 때 가이드 (alfredoMessages 활용)
  if (hasNoTasks && timeOfDay !== 'night') {
    var emptyTips = TIPS.empty;
    tips.push(getRandomMessage(emptyTips));
  }
  
  // 저녁 리마인드 (alfredoMessages 활용)
  if (timeOfDay === 'evening' && condition >= 3) {
    var eveningTips = TIPS.evening;
    tips.push(getRandomMessage(eveningTips));
  }
  
  return tips.filter(Boolean); // null/undefined 제거
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
  
  // 인사말 (alfredoMessages 활용)
  var greeting = useMemo(function() {
    // 밤 시간
    if (timeOfDay === 'night') {
      return getGreeting('night', userName);
    }
    
    // 컨디션 안 좋을 때 (최우선)
    if (condition && condition <= 2) {
      return getConditionCare(condition, userName);
    }
    
    // 데이터가 없을 때
    var isEmpty = todayStats.hasNoTasks && todayStats.hasNoEvents;
    if (isEmpty) {
      return getGreeting(timeOfDay, userName);
    }
    
    // 완료 상황 반영한 인사
    var baseGreeting = getGreeting(timeOfDay, userName);
    
    // 완료 개수에 따라 subtitle 수정
    if (todayStats.completed > 0 && (timeOfDay === 'lunch' || timeOfDay === 'afternoon' || timeOfDay === 'evening')) {
      var celebrationSuffixes = [
        '벌써 ' + todayStats.completed + '개 완료! 👏',
        todayStats.completed + '개나 해냈어요! 💪',
        '오늘 ' + todayStats.completed + '개 해치웠어요! 🔥'
      ];
      baseGreeting.subtitle = getRandomMessage(celebrationSuffixes) + '\n' + baseGreeting.subtitle.split('\n')[1];
    }
    
    return baseGreeting;
  }, [timeOfDay, condition, userName, todayStats]);
  
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
            greeting && React.createElement('h1', { 
              className: (darkMode ? 'text-white' : 'text-gray-900') + 
                ' text-lg font-bold leading-tight whitespace-pre-line'
            }, greeting.title),
            
            // 서브 메시지
            greeting && React.createElement('p', { 
              className: (darkMode ? 'text-gray-300' : 'text-gray-600') + 
                ' text-sm mt-2 leading-relaxed whitespace-pre-line'
            }, greeting.subtitle),
            
            // 이모지
            greeting && greeting.emoji && React.createElement('span', { 
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
