import React, { useMemo } from 'react';
import { ChevronRight, Target, Zap, Coffee, Moon, Sun, Sparkles } from 'lucide-react';

// 상황별 알프레도 표정과 한마디
function getAlfredoState(props) {
  var hour = new Date().getHours();
  var tasks = props.tasks || [];
  var events = props.events || [];
  var mood = props.mood || 3;
  var energy = props.energy || 3;
  
  var totalTasks = tasks.length;
  var completedTasks = tasks.filter(function(t) { return t.completed || t.status === 'done'; }).length;
  var completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  var incompleteTasks = totalTasks - completedTasks;
  var urgentTasks = tasks.filter(function(t) { 
    return !t.completed && t.status !== 'done' && (t.priority === 'high' || t.urgent); 
  }).length;
  
  // 다음 미팅 확인
  var now = new Date();
  var upcomingMeeting = events.find(function(e) {
    var start = new Date(e.start);
    var diff = (start - now) / (1000 * 60); // 분 단위
    return diff > 0 && diff <= 30;
  });
  
  // 상태 결정 (우선순위 순)
  
  // 1. 모든 할 일 완료
  if (totalTasks > 0 && completionRate === 100) {
    return {
      emoji: '🎉',
      expression: 'celebrating',
      message: '오늘 할 일 모두 완료! 대단해요!',
      color: 'from-emerald-500 to-green-500'
    };
  }
  
  // 2. 컨디션 안 좋음
  if (mood <= 2 || energy <= 2) {
    return {
      emoji: '🤗',
      expression: 'caring',
      message: '오늘 좀 힘드시죠? 천천히 해요',
      color: 'from-pink-500 to-rose-500'
    };
  }
  
  // 3. 곧 미팅
  if (upcomingMeeting) {
    var minutes = Math.round((new Date(upcomingMeeting.start) - now) / (1000 * 60));
    return {
      emoji: '⏰',
      expression: 'alert',
      message: minutes + '분 후 미팅이에요!',
      color: 'from-amber-500 to-orange-500'
    };
  }
  
  // 4. 긴급 할 일 있음
  if (urgentTasks > 0) {
    return {
      emoji: '🔥',
      expression: 'focused',
      message: '긴급 ' + urgentTasks + '개, 집중해볼까요?',
      color: 'from-red-500 to-orange-500'
    };
  }
  
  // 5. 50% 이상 완료
  if (completionRate >= 50) {
    return {
      emoji: '💪',
      expression: 'encouraging',
      message: '절반 넘었어요! 조금만 더!',
      color: 'from-purple-500 to-indigo-500'
    };
  }
  
  // 6. 시간대별 기본 상태
  if (hour < 6) {
    return {
      emoji: '😴',
      expression: 'sleepy',
      message: '새벽이에요... 푹 쉬세요',
      color: 'from-indigo-500 to-purple-500'
    };
  }
  
  if (hour < 10) {
    return {
      emoji: '☀️',
      expression: 'cheerful',
      message: '좋은 아침! 오늘도 화이팅!',
      color: 'from-yellow-500 to-orange-500'
    };
  }
  
  if (hour < 14) {
    return {
      emoji: '🍚',
      expression: 'normal',
      message: '점심은 드셨나요?',
      color: 'from-[#A996FF] to-[#8B7CF7]'
    };
  }
  
  if (hour < 18) {
    return {
      emoji: '💼',
      expression: 'working',
      message: '오후도 힘내요!',
      color: 'from-blue-500 to-cyan-500'
    };
  }
  
  if (hour < 22) {
    return {
      emoji: '🌙',
      expression: 'relaxed',
      message: '오늘 수고했어요',
      color: 'from-indigo-500 to-purple-500'
    };
  }
  
  return {
    emoji: '🌛',
    expression: 'night',
    message: '늦은 시간이에요, 쉬어요',
    color: 'from-slate-600 to-slate-700'
  };
}

// 알프레도 상태바 컴포넌트
var AlfredoStatusBar = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var mood = props.mood;
  var energy = props.energy;
  var onOpenChat = props.onOpenChat;
  var userName = props.userName || 'Boss';
  
  // 상태 계산
  var alfredoState = useMemo(function() {
    return getAlfredoState({
      tasks: tasks,
      events: events,
      mood: mood,
      energy: energy
    });
  }, [tasks, events, mood, energy]);
  
  // 진행률 계산
  var totalTasks = tasks.length;
  var completedTasks = tasks.filter(function(t) { return t.completed || t.status === 'done'; }).length;
  var completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  var bgClass = darkMode 
    ? 'bg-gray-900/95 border-gray-800' 
    : 'bg-white/95 border-gray-200';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', {
    className: 'sticky top-0 z-30 ' + bgClass + ' backdrop-blur-xl border-b px-4 py-3'
  },
    React.createElement('div', {
      className: 'flex items-center gap-3',
      onClick: onOpenChat,
      style: { cursor: 'pointer' }
    },
      // 알프레도 아바타 + 표정
      React.createElement('div', {
        className: 'relative'
      },
        React.createElement('div', {
          className: 'w-10 h-10 rounded-full bg-gradient-to-br ' + alfredoState.color + ' flex items-center justify-center text-lg shadow-lg'
        }, '🐧'),
        // 표정 배지
        React.createElement('div', {
          className: 'absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center text-xs'
        }, alfredoState.emoji)
      ),
      
      // 한마디 + 진행률
      React.createElement('div', { className: 'flex-1 min-w-0' },
        React.createElement('p', { 
          className: textPrimary + ' font-medium text-sm truncate' 
        }, alfredoState.message),
        React.createElement('div', { className: 'flex items-center gap-2 mt-1' },
          // 진행률 바
          React.createElement('div', { 
            className: 'flex-1 h-1.5 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-200') 
          },
            React.createElement('div', {
              className: 'h-full rounded-full bg-gradient-to-r ' + alfredoState.color + ' transition-all duration-500',
              style: { width: completionRate + '%' }
            })
          ),
          // 진행률 텍스트
          React.createElement('span', { 
            className: textSecondary + ' text-xs font-medium whitespace-nowrap' 
          }, completedTasks + '/' + totalTasks)
        )
      ),
      
      // 화살표
      React.createElement(ChevronRight, { 
        size: 18, 
        className: textSecondary 
      })
    )
  );
};

export default AlfredoStatusBar;
