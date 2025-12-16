import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, Cloud, CloudRain, CloudSnow, Wind, Thermometer, Calendar, CheckCircle2, Clock, Zap, TrendingUp, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { ALFREDO_PERSONALITIES, DEFAULT_PERSONALITY, getTimeBasedGreeting, getContextualMessage } from './AlfredoPersonality';

// 시간대 판별
function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// 요일 이름
var WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// 날씨 아이콘 매핑
var WEATHER_ICONS = {
  clear: { icon: Sun, emoji: '☀️', label: '맑음' },
  cloudy: { icon: Cloud, emoji: '☁️', label: '흐림' },
  rain: { icon: CloudRain, emoji: '🌧️', label: '비' },
  snow: { icon: CloudSnow, emoji: '❄️', label: '눈' },
  wind: { icon: Wind, emoji: '💨', label: '바람' }
};

// 🐧 알프레도 브리핑 메시지 생성
function generateBriefingMessage(context) {
  var personality = context.personality || DEFAULT_PERSONALITY;
  var timeOfDay = context.timeOfDay || 'morning';
  var tasksCount = context.tasksCount || 0;
  var eventsCount = context.eventsCount || 0;
  var streak = context.streak || 0;
  var energy = context.energy || 3;
  var weather = context.weather;
  
  var messages = [];
  
  // 시간대별 인사
  if (timeOfDay === 'morning') {
    messages.push('좋은 아침이에요, 보스! 🌅');
    if (tasksCount > 0) {
      messages.push('오늘 ' + tasksCount + '개의 할 일이 기다리고 있어요.');
    } else {
      messages.push('오늘은 여유로운 하루네요!');
    }
  } else if (timeOfDay === 'afternoon') {
    messages.push('오후도 힘내요, 보스! ☀️');
    if (tasksCount > 0) {
      messages.push('아직 ' + tasksCount + '개 남았어요. 화이팅!');
    }
  } else if (timeOfDay === 'evening') {
    messages.push('저녁이에요, 보스! 🌙');
    if (tasksCount > 0) {
      messages.push('오늘 안에 끝낼 수 있을까요?');
    } else {
      messages.push('할 일 모두 끝냈네요. 대단해요!');
    }
  } else {
    messages.push('늦은 밤이에요, 보스 🌃');
    messages.push('무리하지 말고 쉬어가요.');
  }
  
  // 일정 정보
  if (eventsCount > 0) {
    messages.push('오늘 ' + eventsCount + '개의 일정이 있어요.');
  }
  
  // 스트릭
  if (streak >= 3) {
    messages.push('🔥 ' + streak + '일 연속 달성 중!');
  }
  
  // 에너지 기반 조언
  if (energy <= 2) {
    messages.push('컨디션이 안 좋아 보여요. 무리하지 마세요.');
  } else if (energy >= 4) {
    messages.push('에너지 충만! 오늘 많은 걸 해낼 수 있을 거예요!');
  }
  
  // 날씨
  if (weather) {
    var w = WEATHER_ICONS[weather.condition] || WEATHER_ICONS.clear;
    messages.push(w.emoji + ' ' + weather.temp + '°C, ' + w.label);
  }
  
  return messages.join(' ');
}

// 📊 브리핑 요약 카드
export var BriefingSummary = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var streak = props.streak || 0;
  var weather = props.weather;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var completedTasks = tasks.filter(function(t) { return t.completed; }).length;
  var pendingTasks = tasks.filter(function(t) { return !t.completed; }).length;
  var upcomingEvents = events.filter(function(e) {
    var eventTime = new Date(e.start);
    var now = new Date();
    return eventTime > now;
  });
  
  var stats = [
    { icon: '✅', label: '할일', value: completedTasks + '/' + tasks.length, color: 'text-emerald-500' },
    { icon: '📅', label: '일정', value: upcomingEvents.length + '개', color: 'text-blue-500' },
    { icon: '🔥', label: '스트릭', value: streak + '일', color: 'text-orange-500' }
  ];
  
  return React.createElement('div', { className: 'grid grid-cols-3 gap-2' },
    stats.map(function(stat, idx) {
      return React.createElement('div', {
        key: idx,
        className: 'p-3 rounded-xl text-center ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50')
      },
        React.createElement('span', { className: 'text-xl' }, stat.icon),
        React.createElement('p', { className: stat.color + ' font-bold text-lg' }, stat.value),
        React.createElement('p', { className: textSecondary + ' text-xs' }, stat.label)
      );
    })
  );
};

// 🐧 알프레도 브리핑 카드 (메인)
export var AlfredoBriefingCard = function(props) {
  var darkMode = props.darkMode;
  var personality = props.personality || DEFAULT_PERSONALITY;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var streak = props.streak || 0;
  var energy = props.energy || 3;
  var weather = props.weather;
  var onRefresh = props.onRefresh;
  var onClick = props.onClick;
  var compact = props.compact;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var hour = new Date().getHours();
  var timeOfDay = getTimeOfDay(hour);
  var today = new Date();
  var dateStr = (today.getMonth() + 1) + '월 ' + today.getDate() + '일 ' + WEEKDAYS[today.getDay()];
  
  var pendingTasks = tasks.filter(function(t) { return !t.completed; }).length;
  var upcomingEvents = events.filter(function(e) {
    var eventTime = new Date(e.start);
    return eventTime > today && eventTime.toDateString() === today.toDateString();
  });
  
  // 브리핑 메시지 생성
  var briefingMessage = useMemo(function() {
    return generateBriefingMessage({
      personality: personality,
      timeOfDay: timeOfDay,
      tasksCount: pendingTasks,
      eventsCount: upcomingEvents.length,
      streak: streak,
      energy: energy,
      weather: weather
    });
  }, [personality, timeOfDay, pendingTasks, upcomingEvents.length, streak, energy, weather]);
  
  if (compact) {
    return React.createElement('button', {
      onClick: onClick,
      className: cardBg + ' rounded-2xl p-4 border ' + borderColor + ' w-full text-left hover:border-[#A996FF]/50 transition-all'
    },
      React.createElement('div', { className: 'flex items-start gap-3' },
        React.createElement('span', { className: 'text-3xl' }, '🐧'),
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('p', { className: textSecondary + ' text-xs mb-1' }, dateStr),
          React.createElement('p', { className: textPrimary + ' text-sm line-clamp-2' }, briefingMessage)
        ),
        React.createElement(ChevronRight, { size: 16, className: textSecondary })
      )
    );
  }
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: 'text-2xl' }, '🐧'),
        React.createElement('div', null,
          React.createElement('p', { className: textPrimary + ' font-bold' }, '알프레도 브리핑'),
          React.createElement('p', { className: textSecondary + ' text-xs' }, dateStr)
        )
      ),
      onRefresh && React.createElement('button', {
        onClick: onRefresh,
        className: textSecondary + ' hover:text-[#A996FF] transition-colors'
      }, React.createElement(RefreshCw, { size: 16 }))
    ),
    
    // 메시지 버블
    React.createElement('div', { className: personality.bgColor + ' rounded-2xl rounded-tl-sm p-4 mb-4' },
      React.createElement('p', { className: textPrimary }, briefingMessage)
    ),
    
    // 요약 통계
    React.createElement(BriefingSummary, {
      darkMode: darkMode,
      tasks: tasks,
      events: events,
      streak: streak,
      weather: weather
    }),
    
    // 오늘의 하이라이트
    (pendingTasks > 0 || upcomingEvents.length > 0) && React.createElement('div', { className: 'mt-4 pt-4 border-t ' + borderColor },
      React.createElement('p', { className: textSecondary + ' text-xs mb-2 font-medium' }, '📌 오늘의 하이라이트'),
      
      // 다음 일정
      upcomingEvents.length > 0 && React.createElement('div', {
        className: 'flex items-center gap-2 p-2 rounded-lg ' + (darkMode ? 'bg-blue-500/10' : 'bg-blue-50') + ' mb-2'
      },
        React.createElement(Calendar, { size: 14, className: 'text-blue-500' }),
        React.createElement('span', { className: textPrimary + ' text-sm flex-1 truncate' }, upcomingEvents[0].title),
        React.createElement('span', { className: 'text-blue-500 text-xs' }, 
          new Date(upcomingEvents[0].start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        )
      ),
      
      // 남은 할일
      pendingTasks > 0 && React.createElement('div', {
        className: 'flex items-center gap-2 p-2 rounded-lg ' + (darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50')
      },
        React.createElement(CheckCircle2, { size: 14, className: 'text-emerald-500' }),
        React.createElement('span', { className: textPrimary + ' text-sm' }, pendingTasks + '개의 할 일이 남았어요')
      )
    ),
    
    // CTA 버튼
    onClick && React.createElement('button', {
      onClick: onClick,
      className: 'w-full mt-4 py-2 text-[#A996FF] text-sm font-medium hover:bg-[#A996FF]/10 rounded-xl transition-colors flex items-center justify-center gap-1'
    }, '알프레도와 대화하기', React.createElement(ChevronRight, { size: 14 }))
  );
};

// 🌅 아침 브리핑 전체 화면
export var MorningBriefingPage = function(props) {
  var darkMode = props.darkMode;
  var personality = props.personality;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var streak = props.streak || 0;
  var energy = props.energy || 3;
  var weather = props.weather;
  var onClose = props.onClose;
  var onStartDay = props.onStartDay;
  
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-[#F0EBFF] to-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  var today = new Date();
  var dateStr = (today.getMonth() + 1) + '월 ' + today.getDate() + '일 ' + WEEKDAYS[today.getDay()];
  
  var pendingTasks = tasks.filter(function(t) { return !t.completed; });
  var big3 = pendingTasks.filter(function(t) { return t.isBig3; }).slice(0, 3);
  var todayEvents = events.filter(function(e) {
    return new Date(e.start).toDateString() === today.toDateString();
  });
  
  return React.createElement('div', { className: bgColor + ' min-h-screen p-4 pb-8' },
    // 헤더
    React.createElement('div', { className: 'text-center pt-8 mb-8' },
      React.createElement('p', { className: textSecondary + ' text-sm mb-2' }, dateStr),
      React.createElement('h1', { className: textPrimary + ' text-2xl font-bold mb-4' }, '좋은 아침이에요, 보스! 🌅'),
      React.createElement('span', { className: 'text-6xl' }, '🐧')
    ),
    
    // 날씨
    weather && React.createElement('div', { 
      className: 'text-center mb-8 p-4 rounded-2xl ' + (darkMode ? 'bg-gray-800' : 'bg-white') + ' shadow-sm'
    },
      React.createElement('div', { className: 'flex items-center justify-center gap-4' },
        React.createElement('span', { className: 'text-4xl' }, WEATHER_ICONS[weather.condition]?.emoji || '☀️'),
        React.createElement('div', null,
          React.createElement('p', { className: textPrimary + ' text-3xl font-bold' }, weather.temp + '°C'),
          React.createElement('p', { className: textSecondary }, WEATHER_ICONS[weather.condition]?.label || '맑음')
        )
      )
    ),
    
    // 오늘의 Big3
    big3.length > 0 && React.createElement('div', { className: 'mb-6' },
      React.createElement('h2', { className: textPrimary + ' font-bold mb-3' }, '⭐ 오늘의 Big 3'),
      React.createElement('div', { className: 'space-y-2' },
        big3.map(function(task, idx) {
          return React.createElement('div', {
            key: task.id,
            className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-800' : 'bg-white') + ' flex items-center gap-3'
          },
            React.createElement('span', { className: 'text-lg' }, (idx + 1) + '.'),
            React.createElement('span', { className: textPrimary }, task.title)
          );
        })
      )
    ),
    
    // 오늘의 일정
    todayEvents.length > 0 && React.createElement('div', { className: 'mb-6' },
      React.createElement('h2', { className: textPrimary + ' font-bold mb-3' }, '📅 오늘의 일정'),
      React.createElement('div', { className: 'space-y-2' },
        todayEvents.slice(0, 5).map(function(event) {
          return React.createElement('div', {
            key: event.id,
            className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-800' : 'bg-white') + ' flex items-center gap-3'
          },
            React.createElement('span', { className: 'text-blue-500 text-sm font-medium' }, 
              new Date(event.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            ),
            React.createElement('span', { className: textPrimary }, event.title)
          );
        })
      )
    ),
    
    // 스트릭
    streak > 0 && React.createElement('div', { 
      className: 'text-center p-4 rounded-2xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 mb-6'
    },
      React.createElement('p', { className: 'text-orange-500 font-bold' }, '🔥 ' + streak + '일 연속 달성 중!'),
      React.createElement('p', { className: textSecondary + ' text-sm' }, '오늘도 이어가요!')
    ),
    
    // 시작 버튼
    React.createElement('button', {
      onClick: onStartDay || onClose,
      className: 'w-full py-4 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-2xl font-bold text-lg shadow-lg'
    }, '오늘 하루 시작하기! 🚀')
  );
};

// 🌙 저녁 리뷰 카드
export var EveningReviewCard = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var focusMinutes = props.focusMinutes || 0;
  var streak = props.streak || 0;
  var onClick = props.onClick;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var completedToday = tasks.filter(function(t) { return t.completed; }).length;
  var totalToday = tasks.length;
  var completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  
  return React.createElement('button', {
    onClick: onClick,
    className: cardBg + ' rounded-2xl p-4 border ' + borderColor + ' w-full text-left hover:border-[#A996FF]/50'
  },
    React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
      React.createElement('span', { className: 'text-2xl' }, '🌙'),
      React.createElement('div', null,
        React.createElement('p', { className: textPrimary + ' font-bold' }, '오늘 하루 어땠나요?'),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '하루를 돌아보고 내일을 준비해요')
      )
    ),
    React.createElement('div', { className: 'grid grid-cols-3 gap-2' },
      React.createElement('div', { className: 'text-center p-2 rounded-lg ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
        React.createElement('p', { className: 'text-emerald-500 font-bold' }, completionRate + '%'),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '달성률')
      ),
      React.createElement('div', { className: 'text-center p-2 rounded-lg ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
        React.createElement('p', { className: 'text-purple-500 font-bold' }, focusMinutes + '분'),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '집중')
      ),
      React.createElement('div', { className: 'text-center p-2 rounded-lg ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
        React.createElement('p', { className: 'text-orange-500 font-bold' }, streak + '일'),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '스트릭')
      )
    )
  );
};

export default {
  AlfredoBriefingCard: AlfredoBriefingCard,
  BriefingSummary: BriefingSummary,
  MorningBriefingPage: MorningBriefingPage,
  EveningReviewCard: EveningReviewCard,
  generateBriefingMessage: generateBriefingMessage
};
