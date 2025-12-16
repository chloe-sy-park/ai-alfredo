import React from 'react';
import { ChevronRight, Zap } from 'lucide-react';

// 상황별 알프레도 표정 & 한마디
var getAlfredoState = function(props) {
  var mood = props.mood;
  var energy = props.energy;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var hour = new Date().getHours();
  
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  var completedTasks = tasks.filter(function(t) { return t.completed; });
  var totalTasks = tasks.length;
  var completionRate = totalTasks > 0 ? completedTasks.length / totalTasks : 0;
  
  // 긴급 태스크
  var urgentTasks = incompleteTasks.filter(function(t) { 
    return t.priority === 'high' || t.urgent; 
  });
  
  // 다가오는 미팅 (30분 이내)
  var now = new Date();
  var upcomingMeeting = events.find(function(e) {
    var start = new Date(e.start);
    var diff = (start - now) / 1000 / 60;
    return diff > 0 && diff <= 30;
  });
  
  // 1. 모든 할일 완료!
  if (totalTasks > 0 && completionRate === 1) {
    return {
      expression: '🎉🐧',
      message: '오늘 할 일 완료! 수고했어요, Boss!',
      mood: 'celebration'
    };
  }
  
  // 2. 절반 이상 완료
  if (completionRate >= 0.5) {
    return {
      expression: '🔥🐧',
      message: '절반 넘었어요! 조금만 더 힘내요!',
      mood: 'motivated'
    };
  }
  
  // 3. 곧 미팅!
  if (upcomingMeeting) {
    var minutesLeft = Math.ceil((new Date(upcomingMeeting.start) - now) / 1000 / 60);
    return {
      expression: '📅🐧',
      message: minutesLeft + '분 후 미팅이에요! 준비되셨나요?',
      mood: 'alert'
    };
  }
  
  // 4. 긴급 태스크 있음
  if (urgentTasks.length > 0) {
    return {
      expression: '😤🐧',
      message: '긴급 할 일 ' + urgentTasks.length + '개! 집중해봐요!',
      mood: 'urgent'
    };
  }
  
  // 5. 에너지 낮음
  if (energy && energy <= 2) {
    return {
      expression: '😴🐧',
      message: '에너지가 부족해 보여요. 잠깐 쉬어갈까요?',
      mood: 'tired'
    };
  }
  
  // 6. 기분 안좋음
  if (mood && mood <= 2) {
    return {
      expression: '🤗🐧',
      message: '힘든 날이에요. 천천히 해도 괜찮아요.',
      mood: 'caring'
    };
  }
  
  // 7. 시간대별 기본 상태
  if (hour < 6) {
    return {
      expression: '😪🐧',
      message: '새벽이네요... 푹 주무셨나요?',
      mood: 'sleepy'
    };
  }
  if (hour < 10) {
    return {
      expression: '☀️🐧',
      message: '좋은 아침이에요! 오늘도 화이팅!',
      mood: 'morning'
    };
  }
  if (hour < 14) {
    return {
      expression: '😊🐧',
      message: '점심은 드셨나요? 든든하게!',
      mood: 'normal'
    };
  }
  if (hour < 18) {
    return {
      expression: '💪🐧',
      message: '오후도 파이팅! 잘하고 있어요!',
      mood: 'motivated'
    };
  }
  if (hour < 22) {
    return {
      expression: '🌙🐧',
      message: '하루 마무리 잘 하고 있어요!',
      mood: 'evening'
    };
  }
  return {
    expression: '🌛🐧',
    message: '늦은 시간이에요. 오늘도 수고했어요!',
    mood: 'night'
  };
};

// 진행률 바 컴포넌트
var ProgressBar = function(props) {
  var progress = props.progress || 0;
  var darkMode = props.darkMode;
  
  var bgColor = darkMode ? 'bg-gray-700' : 'bg-gray-200';
  var progressColor = progress >= 1 
    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
    : progress >= 0.5
      ? 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7]'
      : 'bg-gradient-to-r from-amber-400 to-orange-500';
  
  return React.createElement('div', { className: 'flex items-center gap-2' },
    React.createElement('div', { className: bgColor + ' h-1.5 flex-1 rounded-full overflow-hidden' },
      React.createElement('div', {
        className: progressColor + ' h-full rounded-full transition-all duration-500',
        style: { width: Math.min(progress * 100, 100) + '%' }
      })
    ),
    React.createElement('span', { 
      className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-xs font-medium min-w-[36px] text-right'
    }, Math.round(progress * 100) + '%')
  );
};

// 알프레도 상태바 컴포넌트
var AlfredoStatusBar = function(props) {
  var darkMode = props.darkMode;
  var mood = props.mood;
  var energy = props.energy;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var onOpenChat = props.onOpenChat;
  var sticky = props.sticky !== false; // 기본값 true
  
  var state = getAlfredoState({
    mood: mood,
    energy: energy,
    tasks: tasks,
    events: events
  });
  
  var completedTasks = tasks.filter(function(t) { return t.completed; });
  var totalTasks = tasks.length;
  var progress = totalTasks > 0 ? completedTasks.length / totalTasks : 0;
  
  var bgClass = darkMode 
    ? 'bg-gray-900/95 backdrop-blur-sm border-gray-800' 
    : 'bg-white/95 backdrop-blur-sm border-gray-200';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 무드별 악센트 색상
  var getMoodAccent = function() {
    switch (state.mood) {
      case 'celebration': return 'border-l-green-500';
      case 'motivated': return 'border-l-[#A996FF]';
      case 'alert': return 'border-l-amber-500';
      case 'urgent': return 'border-l-red-500';
      case 'tired': return 'border-l-blue-400';
      case 'caring': return 'border-l-pink-400';
      default: return 'border-l-[#A996FF]';
    }
  };
  
  var containerClass = bgClass + ' border-b px-4 py-3 border-l-4 ' + getMoodAccent();
  if (sticky) {
    containerClass += ' sticky top-0 z-40';
  }
  
  return React.createElement('div', { className: containerClass },
    React.createElement('button', {
      onClick: onOpenChat,
      className: 'w-full'
    },
      // 상단: 표정 + 한마디 + 화살표
      React.createElement('div', { className: 'flex items-center gap-3 mb-2' },
        React.createElement('span', { className: 'text-2xl' }, state.expression),
        React.createElement('p', { className: textPrimary + ' text-sm font-medium flex-1 text-left' }, 
          state.message
        ),
        React.createElement(ChevronRight, { size: 18, className: textSecondary })
      ),
      
      // 하단: 진행률 바
      totalTasks > 0 && React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: textSecondary + ' text-xs' }, 
          '오늘 ' + completedTasks.length + '/' + totalTasks
        ),
        React.createElement('div', { className: 'flex-1' },
          React.createElement(ProgressBar, { progress: progress, darkMode: darkMode })
        )
      )
    )
  );
};

export default AlfredoStatusBar;
export { getAlfredoState };
