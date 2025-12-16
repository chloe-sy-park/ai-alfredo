import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, Cloud, CloudRain, CloudSnow, Wind, Thermometer, Calendar, CheckCircle2, Clock, Zap, TrendingUp, AlertCircle, ChevronRight, RefreshCw, Mail, Reply } from 'lucide-react';
import { ALFREDO_PERSONALITIES, DEFAULT_PERSONALITY, getTimeBasedGreeting, getContextualMessage } from './AlfredoPersonality';
import { useGmail } from '../../hooks/useGmail';

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
  var emailCount = context.emailCount || 0;
  var urgentEmailCount = context.urgentEmailCount || 0;
  
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
  
  // 이메일 정보 추가! 📧
  if (urgentEmailCount > 0) {
    messages.push('📧 긴급 답장 필요 ' + urgentEmailCount + '개!');
  } else if (emailCount > 0) {
    messages.push('📧 답장 필요 ' + emailCount + '개');
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
  var onEmailClick = props.onEmailClick; // 이메일 클릭 핸들러
  
  // Gmail 훅 사용
  var gmail = useGmail();
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var hour = new Date().getHours();
  var timeOfDay = getTimeOfDay(hour);
  var today = new Date();
  var dateStr = (today.getMonth() + 1) + '월 ' + today.getDate() + '일 ' + WEEKDAYS[today.getDay()];
  
  // 브리핑 메시지 생성 (이메일 정보 포함)
  var briefingMessage = useMemo(function() {
    return generateBriefingMessage({
      personality: personality,
      timeOfDay: timeOfDay,
      tasksCount: tasks.filter(function(t) { return !t.completed; }).length,
      eventsCount: events.length,
      streak: streak,
      energy: energy,
      weather: weather,
      emailCount: gmail.replyActions?.length || 0,
      urgentEmailCount: gmail.urgentReplyActions?.length || 0
    });
  }, [personality, timeOfDay, tasks, events, streak, energy, weather, gmail.replyActions, gmail.urgentReplyActions]);
  
  // Compact 모드
  if (compact) {
    return React.createElement('button', {
      onClick: onClick,
      className: cardBg + ' rounded-2xl p-4 border ' + borderColor + ' w-full text-left hover:border-[#A996FF]/50 transition-all'
    },
      React.createElement('div', { className: 'flex items-start gap-3' },
        React.createElement('span', { className: 'text-3xl' }, '🐧'),
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('p', { className: textSecondary + ' text-xs mb-1' }, dateStr),
          React.createElement('p', { className: textPrimary + ' text-sm leading-relaxed' }, briefingMessage)
        ),
        React.createElement(ChevronRight, { size: 18, className: textSecondary })
      )
    );
  }
  
  // 풀 모드
  return React.createElement('div', {
    className: cardBg + ' rounded-2xl p-5 border ' + borderColor
  },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: 'text-3xl' }, '🐧'),
        React.createElement('div', null,
          React.createElement('p', { className: textSecondary + ' text-xs' }, dateStr),
          React.createElement('p', { className: textPrimary + ' font-bold' }, '알프레도 브리핑')
        )
      ),
      onRefresh && React.createElement('button', {
        onClick: onRefresh,
        className: textSecondary + ' hover:text-[#A996FF] transition-colors'
      }, React.createElement(RefreshCw, { size: 18 }))
    ),
    
    // 메시지
    React.createElement('p', {
      className: textPrimary + ' text-sm leading-relaxed mb-4 whitespace-pre-line'
    }, briefingMessage),
    
    // 📧 이메일 답장 필요 버튼 (있을 경우만)
    gmail.replyActions?.length > 0 && React.createElement('button', {
      onClick: onEmailClick,
      className: 'w-full mb-4 p-3 rounded-xl flex items-center justify-between transition-all ' + 
        (gmail.urgentReplyActions?.length > 0 
          ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20' 
          : 'bg-[#A996FF]/10 border border-[#A996FF]/30 hover:bg-[#A996FF]/20')
    },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement(Reply, { size: 18, className: gmail.urgentReplyActions?.length > 0 ? 'text-red-500' : 'text-[#A996FF]' }),
        React.createElement('div', { className: 'text-left' },
          React.createElement('p', { className: textPrimary + ' font-medium text-sm' }, 
            gmail.urgentReplyActions?.length > 0 
              ? '긴급 답장 필요 ' + gmail.urgentReplyActions.length + '개'
              : '답장 필요 ' + gmail.replyActions.length + '개'
          ),
          gmail.replyActions[0]?.email && React.createElement('p', { className: textSecondary + ' text-xs truncate max-w-[200px]' },
            gmail.replyActions[0].email.from?.name + ': ' + gmail.replyActions[0].email.subject
          )
        )
      ),
      React.createElement(ChevronRight, { size: 18, className: textSecondary })
    ),
    
    // 요약 스탯
    React.createElement(BriefingSummary, {
      darkMode: darkMode,
      tasks: tasks,
      events: events,
      streak: streak
    })
  );
};

// 🌅 아침 브리핑 페이지 (전체 화면)
export var MorningBriefingPage = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var streak = props.streak || 0;
  var weather = props.weather;
  var onClose = props.onClose;
  var onStartDay = props.onStartDay;
  var onEmailClick = props.onEmailClick;
  
  // Gmail 훅 사용
  var gmail = useGmail();
  
  var pageBg = darkMode ? 'bg-[#1a1625]' : 'bg-gradient-to-b from-[#F0EBFF] to-white';
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  var today = new Date();
  var dateStr = (today.getMonth() + 1) + '월 ' + today.getDate() + '일 ' + WEEKDAYS[today.getDay()];
  
  var big3 = tasks.filter(function(t) { return !t.completed && t.isBig3; }).slice(0, 3);
  var todayEvents = events.filter(function(e) {
    var eventDate = new Date(e.start);
    return eventDate.toDateString() === today.toDateString();
  });
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 ' + pageBg + ' overflow-y-auto'
  },
    React.createElement('div', { className: 'max-w-md mx-auto p-6 pt-12' },
      // 헤더
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('span', { className: 'text-6xl mb-4 block' }, '🐧'),
        React.createElement('p', { className: textSecondary + ' text-sm mb-2' }, dateStr),
        React.createElement('h1', { className: textPrimary + ' text-2xl font-bold' }, '좋은 아침이에요, 보스!')
      ),
      
      // 날씨
      weather && React.createElement('div', {
        className: cardBg + ' rounded-2xl p-4 mb-6 flex items-center justify-between'
      },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('span', { className: 'text-3xl' }, 
            (WEATHER_ICONS[weather.condition] || WEATHER_ICONS.clear).emoji
          ),
          React.createElement('div', null,
            React.createElement('p', { className: textPrimary + ' font-medium' }, weather.temp + '°C'),
            React.createElement('p', { className: textSecondary + ' text-sm' }, 
              (WEATHER_ICONS[weather.condition] || WEATHER_ICONS.clear).label
            )
          )
        ),
        weather.high && weather.low && React.createElement('p', { className: textSecondary + ' text-sm' },
          '최고 ' + weather.high + '° / 최저 ' + weather.low + '°'
        )
      ),
      
      // 📧 이메일 답장 필요 (있을 경우)
      gmail.replyActions?.length > 0 && React.createElement('div', {
        className: 'mb-6'
      },
        React.createElement('h2', { className: textPrimary + ' font-bold mb-3' }, '📧 답장 필요'),
        React.createElement('div', { className: 'space-y-2' },
          gmail.replyActions.slice(0, 3).map(function(action) {
            var isUrgent = action.priority === 'urgent' || action.priority === 'high';
            return React.createElement('button', {
              key: action.emailId,
              onClick: function() { window.open('https://mail.google.com/mail/u/0/#inbox/' + action.emailId, '_blank'); },
              className: 'w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all ' + 
                (darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50') +
                (isUrgent ? ' border-l-4 border-red-500' : '')
            },
              React.createElement('div', { className: 'w-2 h-2 rounded-full ' + (isUrgent ? 'bg-red-500' : 'bg-amber-500') }),
              React.createElement('div', { className: 'flex-1 min-w-0' },
                React.createElement('p', { className: textPrimary + ' font-medium text-sm truncate' },
                  action.email?.from?.name || action.email?.from?.email
                ),
                React.createElement('p', { className: textSecondary + ' text-xs truncate' },
                  action.email?.subject
                )
              ),
              React.createElement(ChevronRight, { size: 16, className: textSecondary })
            );
          })
        ),
        gmail.replyActions.length > 3 && React.createElement('button', {
          onClick: onEmailClick,
          className: 'w-full text-center py-2 mt-2 text-[#A996FF] text-sm hover:underline'
        }, '+' + (gmail.replyActions.length - 3) + '개 더보기')
      ),
      
      // Big 3
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
    )
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
        React.createElement('p', { className: textPrimary + ' font-bold' }, '오늘 하루 어떠나요?'),
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
