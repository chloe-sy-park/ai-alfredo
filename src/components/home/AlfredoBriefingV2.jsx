import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Mail, Calendar, CheckSquare, Gift, Heart, Zap, Target, Coffee, Moon, Sun, Sparkles } from 'lucide-react';

// 모드 설정
var MODES = {
  focus: { id: 'focus', emoji: '🎯', label: '집중모드', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  care: { id: 'care', emoji: '💜', label: '케어모드', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  challenge: { id: 'challenge', emoji: '🔥', label: '챌린지모드', color: 'text-red-500', bgColor: 'bg-red-500/10' }
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

// 인사말 생성
var getGreeting = function(timeOfDay, condition) {
  var greetings = {
    morning: '좋은 아침이에요, Boss.',
    lateMorning: '오전 잘 보내고 계세요, Boss.',
    lunch: '점심 시간이에요, Boss.',
    afternoon: '오후도 힘내세요, Boss.',
    evening: '오늘 하루 수고하셨어요, Boss.',
    night: '이 시간엔 쉬셔야죠, Boss.'
  };
  
  // 컨디션 나쁘면 다른 인사
  if (condition && condition <= 2) {
    return '오늘 좀 힘드시구나... 괜찮아요, Boss.';
  }
  
  return greetings[timeOfDay] || greetings.morning;
};

// 모드 선택 컴포넌트
var ModeSelector = function(props) {
  var currentMode = props.currentMode;
  var setMode = props.setMode;
  var recommendedMode = props.recommendedMode;
  var darkMode = props.darkMode;
  var isExpanded = props.isExpanded;
  var setExpanded = props.setExpanded;
  
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var mode = MODES[currentMode] || MODES.focus;
  
  if (isExpanded) {
    return React.createElement('div', { className: 'mb-4' },
      React.createElement('div', { className: 'flex items-center justify-between mb-2' },
        React.createElement('span', { className: textSecondary + ' text-xs' }, '모드 선택'),
        React.createElement('button', {
          onClick: function() { setExpanded(false); },
          className: 'text-xs text-[#A996FF]'
        }, '완료')
      ),
      React.createElement('div', { className: 'flex gap-2' },
        Object.values(MODES).map(function(m) {
          var isActive = currentMode === m.id;
          var isRecommended = recommendedMode === m.id;
          
          return React.createElement('button', {
            key: m.id,
            onClick: function() { setMode(m.id); setExpanded(false); },
            className: 'flex-1 flex flex-col items-center p-2 rounded-xl border transition-all ' +
              (isActive 
                ? m.bgColor + ' border-current ' + m.color
                : (darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'))
          },
            React.createElement('span', { className: 'text-lg' }, m.emoji),
            React.createElement('span', { className: 'text-xs mt-1 ' + (isActive ? m.color : textSecondary) }, m.label),
            isRecommended && !isActive && React.createElement('span', { className: 'text-[10px] text-[#A996FF] mt-0.5' }, '추천')
          );
        })
      )
    );
  }
  
  return React.createElement('button', {
    onClick: function() { setExpanded(true); },
    className: mode.bgColor + ' px-3 py-1.5 rounded-full flex items-center gap-1.5 mb-4'
  },
    React.createElement('span', { className: 'text-sm' }, mode.emoji),
    React.createElement('span', { className: mode.color + ' text-xs font-medium' }, mode.label),
    React.createElement(ChevronDown, { size: 12, className: mode.color })
  );
};

// 브리핑 아이템 컴포넌트
var BriefingItem = function(props) {
  var icon = props.icon;
  var iconColor = props.iconColor;
  var title = props.title;
  var content = props.content;
  var actions = props.actions;
  var darkMode = props.darkMode;
  var priority = props.priority;
  
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  return React.createElement('div', { className: 'py-4 border-b ' + borderColor + ' last:border-b-0' },
    // 제목
    title && React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
      icon && React.createElement('span', { className: iconColor }, icon),
      React.createElement('span', { className: textPrimary + ' font-medium text-sm' }, title)
    ),
    
    // 내용
    React.createElement('p', { className: textSecondary + ' text-sm leading-relaxed whitespace-pre-line' }, content),
    
    // 액션 버튼들
    actions && actions.length > 0 && React.createElement('div', { className: 'flex flex-wrap gap-2 mt-3' },
      actions.map(function(action, idx) {
        var isPrimary = idx === 0;
        return React.createElement('button', {
          key: idx,
          onClick: action.onClick,
          className: isPrimary
            ? 'px-4 py-2 bg-[#A996FF] text-white text-sm rounded-xl font-medium'
            : 'px-4 py-2 ' + (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600') + ' text-sm rounded-xl'
        }, action.label);
      })
    )
  );
};

// 메인 브리핑 컴포넌트
export var AlfredoBriefingV2 = function(props) {
  var darkMode = props.darkMode;
  var condition = props.condition || 3;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var emails = props.emails || [];
  var reminders = props.reminders || [];
  var weather = props.weather;
  var streak = props.streak || 0;
  var mode = props.mode || 'focus';
  var setMode = props.setMode;
  var onAction = props.onAction;
  
  var modeExpandedState = useState(false);
  var isModeExpanded = modeExpandedState[0];
  var setModeExpanded = modeExpandedState[1];
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var timeOfDay = getTimeOfDay();
  var now = new Date();
  
  // 오늘 일정 필터링
  var todayEvents = useMemo(function() {
    return events.filter(function(e) {
      var eventDate = new Date(e.start);
      return eventDate.toDateString() === now.toDateString();
    }).sort(function(a, b) {
      return new Date(a.start) - new Date(b.start);
    });
  }, [events]);
  
  // 다가오는 일정 (30분 내)
  var upcomingEvent = useMemo(function() {
    return todayEvents.find(function(e) {
      var start = new Date(e.start);
      var diff = (start - now) / 1000 / 60;
      return diff > 0 && diff <= 30;
    });
  }, [todayEvents]);
  
  // 미완료 할일
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  var urgentTasks = incompleteTasks.filter(function(t) { return t.priority === 'high'; });
  
  // 추천 모드 계산
  var recommendedMode = useMemo(function() {
    if (condition <= 2) return 'care';
    if (condition >= 4 && incompleteTasks.length >= 3) return 'challenge';
    return 'focus';
  }, [condition, incompleteTasks.length]);
  
  // 브리핑 아이템들 생성
  var briefingItems = useMemo(function() {
    var items = [];
    
    // 1. 컨디션 케어 (컨디션 나쁠 때 최우선)
    if (condition <= 2) {
      items.push({
        priority: 0,
        icon: '💜',
        title: null,
        content: '오늘 무리하지 마세요.\n꼭 해야 할 것만 하고, 나머지는 내일의 Boss가 할 거예요.',
        actions: [
          { label: '오늘 필수만 보기', onClick: function() { if (onAction) onAction('showEssentials'); } }
        ]
      });
    }
    
    // 2. 다가오는 일정 (30분 내)
    if (upcomingEvent) {
      var minutesUntil = Math.round((new Date(upcomingEvent.start) - now) / 1000 / 60);
      items.push({
        priority: 1,
        icon: '📅',
        title: minutesUntil + '분 후 일정',
        content: upcomingEvent.title || upcomingEvent.summary,
        actions: [
          { label: '준비됐어요', onClick: function() { if (onAction) onAction('eventReady', upcomingEvent); } }
        ]
      });
    }
    
    // 3. 날씨 (아침에만)
    if (timeOfDay === 'morning' && weather) {
      var temp = weather.temp || 3;
      var tempLow = weather.tempLow || -2;
      var clothingAdvice = temp <= 0 ? '패딩, 목도리 필수예요! 🧣' 
        : temp <= 5 ? '두꺼운 외투 챙기세요 🧥' 
        : temp <= 10 ? '가디건이나 자켓 추천해요 🧥'
        : '가벼운 옷차림이면 될 것 같아요 👔';
      
      items.push({
        priority: 2,
        icon: '🌤️',
        title: '오늘 날씨',
        content: '지금 ' + temp + '°, 저녁엔 ' + tempLow + '°까지 떨어져요.\n' + clothingAdvice,
        actions: []
      });
    }
    
    // 4. 오늘 일정 요약
    if (todayEvents.length > 0 && !upcomingEvent) {
      var eventSummary = todayEvents.length + '개 일정이 있어요.';
      var nextEvent = todayEvents.find(function(e) { return new Date(e.start) > now; });
      if (nextEvent) {
        var nextTime = new Date(nextEvent.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        eventSummary += '\n다음은 ' + nextTime + ' ' + (nextEvent.title || nextEvent.summary);
      }
      
      // 여유/빡빡 판단
      var busyEvents = todayEvents.filter(function(e) { return new Date(e.start) > now; });
      if (busyEvents.length >= 3) {
        eventSummary += '\n오후가 좀 빡빡해요. 점심은 일찍 드세요.';
      } else if (busyEvents.length === 0) {
        eventSummary += '\n남은 일정 없이 여유로워요 ✨';
      }
      
      items.push({
        priority: 3,
        icon: '📅',
        title: '오늘 일정',
        content: eventSummary,
        actions: [
          { label: '캘린더 보기', onClick: function() { if (onAction) onAction('openCalendar'); } }
        ]
      });
    }
    
    // 5. 이메일 (임시 - 나중에 실제 데이터 연동)
    if (emails.length > 0) {
      var urgentEmails = emails.filter(function(e) { return e.priority === 'high'; });
      if (urgentEmails.length > 0) {
        var email = urgentEmails[0];
        items.push({
          priority: 4,
          icon: '📬',
          title: email.from + '님 메일',
          content: email.subject + '\n' + (email.suggestion || ''),
          actions: [
            { label: '초안 써줘', onClick: function() { if (onAction) onAction('draftEmail', email); } },
            { label: '직접 답장', onClick: function() { if (onAction) onAction('openEmail', email); } }
          ]
        });
      }
    }
    
    // 6. 오늘 할 일
    if (incompleteTasks.length > 0) {
      var taskContent = incompleteTasks.length + '개 남았어요.';
      var topTask = incompleteTasks.sort(function(a, b) {
        var priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
      })[0];
      
      if (topTask) {
        taskContent += '\n"' + topTask.title + '"이 제일 급해요.';
        
        // 시간 여유 있으면 제안
        var nextEventTime = todayEvents.find(function(e) { return new Date(e.start) > now; });
        if (nextEventTime) {
          var minutesFree = Math.round((new Date(nextEventTime.start) - now) / 1000 / 60);
          if (minutesFree >= 30) {
            taskContent += '\n' + Math.floor(minutesFree / 60) + '시간 ' + (minutesFree % 60) + '분 여유 있으니 지금 하시면 좋겠어요.';
          }
        }
      }
      
      items.push({
        priority: 5,
        icon: '📋',
        title: '오늘 할 일',
        content: taskContent,
        actions: [
          { label: '시작하기', onClick: function() { if (onAction) onAction('startTask', topTask); } },
          { label: '나중에', onClick: function() { if (onAction) onAction('later'); } }
        ]
      });
    }
    
    // 7. 기념일/리마인더
    if (reminders.length > 0) {
      var reminder = reminders[0];
      items.push({
        priority: 6,
        icon: '🎂',
        title: reminder.title,
        content: reminder.description || '',
        actions: reminder.actions || []
      });
    }
    
    // 8. 저녁 마무리
    if (timeOfDay === 'evening') {
      var completedToday = tasks.filter(function(t) { return t.completed; }).length;
      var totalToday = tasks.length;
      
      var summaryContent = '✓ 완료 ' + completedToday + '개';
      if (incompleteTasks.length > 0) {
        summaryContent += '\n→ 내일로 ' + incompleteTasks.length + '개 (급하지 않아요)';
      }
      
      // 내일 일정 미리보기
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      var tomorrowEvents = events.filter(function(e) {
        var eventDate = new Date(e.start);
        return eventDate.toDateString() === tomorrow.toDateString();
      });
      
      if (tomorrowEvents.length > 0) {
        var firstTomorrow = tomorrowEvents[0];
        var firstTime = new Date(firstTomorrow.start).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        summaryContent += '\n\n내일 ' + firstTime + '에 ' + (firstTomorrow.title || firstTomorrow.summary) + ' 있어요.';
      }
      
      summaryContent += '\n\n푹 쉬시고 내일 봐요 😊';
      
      items.push({
        priority: 7,
        icon: '🌙',
        title: '오늘 하루 정리',
        content: summaryContent,
        actions: [
          { label: '내일 메모 남기기', onClick: function() { if (onAction) onAction('tomorrowNote'); } },
          { label: '퇴근!', onClick: function() { if (onAction) onAction('endDay'); } }
        ]
      });
    }
    
    // 9. 밤 시간
    if (timeOfDay === 'night') {
      items.push({
        priority: 0,
        icon: '🌙',
        title: null,
        content: '이 시간엔 쉬셔야죠.\n오늘 충분히 하셨어요. 남은 건 내일의 Boss가 할 거예요.\n\n푹 쉬세요 💜',
        actions: []
      });
    }
    
    // 10. 할일 다 끝냈을 때
    if (incompleteTasks.length === 0 && tasks.length > 0 && timeOfDay !== 'evening' && timeOfDay !== 'night') {
      items.push({
        priority: 0,
        icon: '🎉',
        title: null,
        content: '오늘 할 거 다 끝내셨네요!\n진짜 대단해요, Boss.\n\n남은 시간 뭐 하고 싶으세요?',
        actions: [
          { label: '내일 미리 준비', onClick: function() { if (onAction) onAction('prepareTomorrow'); } },
          { label: '그냥 쉴래요', onClick: function() { if (onAction) onAction('rest'); } }
        ]
      });
    }
    
    // 11. 못했을 때 케어 (저녁에 완료 0개)
    if (timeOfDay === 'evening' && tasks.length > 0 && tasks.filter(function(t) { return t.completed; }).length === 0) {
      items.unshift({
        priority: -1,
        icon: '💜',
        title: null,
        content: '오늘 좀 힘드셨나봐요.\n\n괜찮아요, 그런 날도 있어요.\n못한 건 내일의 Boss가 할 거예요.\n\n오늘은 그냥 쉬세요.\n내일 제가 더 잘 챙길게요 💜',
        actions: []
      });
    }
    
    // 정렬
    items.sort(function(a, b) { return a.priority - b.priority; });
    
    return items;
  }, [condition, tasks, events, emails, reminders, weather, timeOfDay, upcomingEvent, todayEvents]);
  
  var greeting = getGreeting(timeOfDay, condition);
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl border ' + borderColor + ' overflow-hidden mb-4' },
    // 알프레도 헤더
    React.createElement('div', { className: 'px-4 pt-4' },
      React.createElement('div', { className: 'flex items-start gap-3 mb-3' },
        React.createElement('span', { className: 'text-2xl' }, '🐧'),
        React.createElement('p', { className: textPrimary + ' font-medium leading-relaxed' }, greeting)
      ),
      
      // 모드 선택
      React.createElement(ModeSelector, {
        currentMode: mode,
        setMode: setMode,
        recommendedMode: recommendedMode,
        darkMode: darkMode,
        isExpanded: isModeExpanded,
        setExpanded: setModeExpanded
      })
    ),
    
    // 브리핑 아이템들
    React.createElement('div', { className: 'px-4 pb-4' },
      briefingItems.length > 0 
        ? briefingItems.map(function(item, idx) {
            return React.createElement(BriefingItem, {
              key: idx,
              icon: item.icon,
              iconColor: item.iconColor,
              title: item.title,
              content: item.content,
              actions: item.actions,
              darkMode: darkMode,
              priority: item.priority
            });
          })
        : React.createElement('p', { className: textSecondary + ' text-sm text-center py-4' },
            '오늘은 특별히 챙길 게 없어요 ✨'
          )
    )
  );
};

export default AlfredoBriefingV2;