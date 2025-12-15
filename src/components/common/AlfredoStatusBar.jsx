import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Zap, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

// 알프레도 표정 결정
function getAlfredoFace(props) {
  var mood = props.mood || 3;
  var energy = props.energy || 3;
  var completionRate = props.completionRate || 0;
  var hour = new Date().getHours();
  var hasUrgent = props.hasUrgent;
  var hasMeetingSoon = props.hasMeetingSoon;
  
  // 우선순위 순서로 체크
  
  // 1. 미팅 임박
  if (hasMeetingSoon) {
    return { emoji: '📅', mood: 'alert' };
  }
  
  // 2. 긴급 할 일
  if (hasUrgent) {
    return { emoji: '💪', mood: 'focused' };
  }
  
  // 3. 모든 할 일 완료
  if (completionRate >= 1) {
    return { emoji: '🎉', mood: 'celebration' };
  }
  
  // 4. 절반 이상 완료
  if (completionRate >= 0.5) {
    return { emoji: '🔥', mood: 'motivated' };
  }
  
  // 5. 에너지/기분 기반
  if (energy <= 2 || mood <= 2) {
    return { emoji: '😴', mood: 'tired' };
  }
  
  // 6. 시간대별 기본
  if (hour < 6) {
    return { emoji: '🌙', mood: 'night' };
  }
  if (hour < 12) {
    return { emoji: '☀️', mood: 'morning' };
  }
  if (hour < 18) {
    return { emoji: '😊', mood: 'default' };
  }
  if (hour < 22) {
    return { emoji: '🌆', mood: 'evening' };
  }
  return { emoji: '🌛', mood: 'latenight' };
}

// 알프레도 한마디 결정
function getAlfredoMessage(props) {
  var userName = props.userName || 'Boss';
  var completionRate = props.completionRate || 0;
  var remainingTasks = props.remainingTasks || 0;
  var nextEventMinutes = props.nextEventMinutes;
  var mood = props.mood || 3;
  var energy = props.energy || 3;
  var hour = new Date().getHours();
  var face = props.face;
  
  // 상황별 메시지
  switch(face.mood) {
    case 'alert':
      return nextEventMinutes + '분 후 미팅이에요! 준비되셨나요?';
    case 'focused':
      return '긴급한 일이 있어요. 먼저 처리할까요?';
    case 'celebration':
      return '오늘 할 일 완료! 정말 대단해요 🎊';
    case 'motivated':
      return '절반 넘었어요! 조금만 더 힘내요 💪';
    case 'tired':
      return '무리하지 마세요. 천천히 해도 괜찮아요';
    case 'night':
      return '이 시간까지... 푹 쉬세요, ' + userName + '님';
    case 'morning':
      if (remainingTasks > 0) {
        return '오늘 ' + remainingTasks + '개 할 일이 있어요!';
      }
      return '좋은 아침이에요! 오늘도 파이팅 ☀️';
    case 'evening':
      if (remainingTasks > 0) {
        return '아직 ' + remainingTasks + '개 남았어요. 괜찮아요?';
      }
      return '오늘 하루 수고하셨어요 🌙';
    case 'latenight':
      return '늦은 시간이에요. 내일 해도 괜찮아요';
    default:
      if (remainingTasks > 3) {
        return '할 일이 좀 많네요. 하나씩 해봐요!';
      }
      if (remainingTasks > 0) {
        return remainingTasks + '개만 더 하면 끝이에요!';
      }
      return '무엇을 도와드릴까요?';
  }
}

// 진행률 바 컴포넌트
var ProgressBar = function(props) {
  var progress = props.progress || 0;
  var darkMode = props.darkMode;
  
  var bgColor = darkMode ? 'bg-gray-700' : 'bg-gray-200';
  var fillColor = progress >= 1 
    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
    : progress >= 0.5
      ? 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7]'
      : 'bg-gradient-to-r from-amber-500 to-orange-500';
  
  return React.createElement('div', { className: bgColor + ' h-1.5 rounded-full overflow-hidden flex-1' },
    React.createElement('div', {
      className: fillColor + ' h-full rounded-full transition-all duration-500',
      style: { width: Math.min(progress * 100, 100) + '%' }
    })
  );
};

// 알프레도 상태바 메인 컴포넌트
var AlfredoStatusBar = function(props) {
  var darkMode = props.darkMode;
  var userName = props.userName || 'Boss';
  var mood = props.mood;
  var energy = props.energy;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var onOpenChat = props.onOpenChat;
  
  // 통계 계산
  var stats = useMemo(function() {
    var now = new Date();
    var todayStr = now.toDateString();
    
    // 오늘 할 일만 필터 (선택적)
    var allTasks = tasks;
    var completed = allTasks.filter(function(t) { 
      return t.completed || t.status === 'done'; 
    });
    var remaining = allTasks.filter(function(t) { 
      return !t.completed && t.status !== 'done'; 
    });
    var urgent = remaining.filter(function(t) { 
      return t.priority === 'high' || t.urgent; 
    });
    
    // 다음 이벤트까지 남은 시간
    var upcomingEvents = events.filter(function(e) {
      return new Date(e.start) > now;
    }).sort(function(a, b) {
      return new Date(a.start) - new Date(b.start);
    });
    
    var nextEvent = upcomingEvents[0];
    var nextEventMinutes = null;
    var hasMeetingSoon = false;
    
    if (nextEvent) {
      var diff = (new Date(nextEvent.start) - now) / 1000 / 60;
      nextEventMinutes = Math.round(diff);
      hasMeetingSoon = diff <= 15;
    }
    
    var total = allTasks.length;
    var completionRate = total > 0 ? completed.length / total : 0;
    
    return {
      total: total,
      completed: completed.length,
      remaining: remaining.length,
      urgent: urgent.length,
      completionRate: completionRate,
      hasUrgent: urgent.length > 0,
      hasMeetingSoon: hasMeetingSoon,
      nextEventMinutes: nextEventMinutes,
      nextEvent: nextEvent
    };
  }, [tasks, events]);
  
  // 알프레도 표정 & 메시지
  var face = getAlfredoFace({
    mood: mood,
    energy: energy,
    completionRate: stats.completionRate,
    hasUrgent: stats.hasUrgent,
    hasMeetingSoon: stats.hasMeetingSoon
  });
  
  var message = getAlfredoMessage({
    userName: userName,
    completionRate: stats.completionRate,
    remainingTasks: stats.remaining,
    nextEventMinutes: stats.nextEventMinutes,
    mood: mood,
    energy: energy,
    face: face
  });
  
  // 스타일
  var bgClass = darkMode 
    ? 'bg-gray-800/95 border-gray-700' 
    : 'bg-white/95 border-gray-200';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', {
    className: 'fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b ' + bgClass,
    style: { paddingTop: 'env(safe-area-inset-top)' }
  },
    React.createElement('div', {
      className: 'px-4 py-3 flex items-center gap-3',
      onClick: onOpenChat
    },
      // 펭귄 + 표정
      React.createElement('div', { 
        className: 'relative flex-shrink-0'
      },
        React.createElement('span', { className: 'text-2xl' }, '🐧'),
        React.createElement('span', { 
          className: 'absolute -top-1 -right-1 text-sm'
        }, face.emoji)
      ),
      
      // 메시지 + 진행률
      React.createElement('div', { className: 'flex-1 min-w-0' },
        React.createElement('p', { 
          className: textPrimary + ' text-sm font-medium truncate'
        }, message),
        React.createElement('div', { className: 'flex items-center gap-2 mt-1' },
          React.createElement(ProgressBar, { 
            progress: stats.completionRate, 
            darkMode: darkMode 
          }),
          React.createElement('span', { 
            className: textSecondary + ' text-xs flex-shrink-0'
          }, stats.completed + '/' + stats.total)
        )
      ),
      
      // 화살표
      React.createElement(ChevronRight, { 
        size: 18, 
        className: textSecondary + ' flex-shrink-0'
      })
    )
  );
};

export default AlfredoStatusBar;
