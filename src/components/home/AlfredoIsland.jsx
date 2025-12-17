import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronUp, Send, Maximize2, X } from 'lucide-react';

// 시간대 구분
var getTimeOfDay = function() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return 'earlyMorning';
  if (hour >= 9 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// 시간대별 인사
var getGreeting = function(timeOfDay, userName, completedCount, condition) {
  var name = userName || 'Boss';
  
  if (condition && condition <= 2) {
    return {
      line1: name + ', 오늘 좀 힘드시구나...',
      line2: '무리하지 말고, 꼭 해야 할 것만 해요 💜'
    };
  }
  
  var greetings = {
    earlyMorning: {
      line1: '좋은 아침이에요, ' + name + '!',
      line2: '오늘 하루도 제가 함께할게요 ☀️'
    },
    morning: {
      line1: name + ', 오전 잘 보내고 계세요?',
      line2: '오늘 할 것들 정리해뒀어요 ✨'
    },
    lunch: {
      line1: name + ', 점심은 드셨어요?',
      line2: completedCount > 0 
        ? '오전에 ' + completedCount + '개 해치웠어요! 👏'
        : '밥 먹고 시작해도 괜찮아요 🍚'
    },
    afternoon: {
      line1: name + ', 오후도 힘내고 있죠?',
      line2: completedCount > 0
        ? '벌써 ' + completedCount + '개 완료! 잘하고 있어요 💪'
        : '지금 시작해도 충분해요!'
    },
    evening: {
      line1: name + ', 오늘 하루 수고했어요!',
      line2: completedCount > 0
        ? '오늘 ' + completedCount + '개나 해냈어요 🎉'
        : '쉬는 날도 필요한 거예요 💜'
    },
    night: {
      line1: name + ', 이 시간엔 쉬셔야죠.',
      line2: '내일 제가 깨워드릴게요 🌙'
    }
  };
  
  return greetings[timeOfDay] || greetings.morning;
};

// 긴급도 체크
var getUrgentInfo = function(events, tasks) {
  var now = new Date();
  
  // 30분 이내 일정
  var upcomingEvent = events.find(function(e) {
    var start = new Date(e.start || e.startTime);
    var diffMin = (start - now) / 1000 / 60;
    return diffMin > 0 && diffMin <= 30;
  });
  
  if (upcomingEvent) {
    var diffMin = Math.round((new Date(upcomingEvent.start || upcomingEvent.startTime) - now) / 1000 / 60);
    return {
      isUrgent: true,
      line1: 'Boss! ' + diffMin + '분 뒤 일정이에요!',
      line2: (upcomingEvent.title || upcomingEvent.summary) + ' 준비하세요 ⚡'
    };
  }
  
  // 2시간 이내 마감
  var urgentTask = tasks.find(function(t) {
    if (t.completed || (!t.deadline && !t.dueDate)) return false;
    var due = new Date(t.deadline || t.dueDate);
    var diffHour = (due - now) / 1000 / 60 / 60;
    return diffHour > 0 && diffHour <= 2;
  });
  
  if (urgentTask) {
    return {
      isUrgent: true,
      line1: 'Boss! 마감이 코앞이에요!',
      line2: '"' + urgentTask.title + '" 지금 시작해요 🔥'
    };
  }
  
  return { isUrgent: false };
};

// 🐧 다이내믹 아일랜드 메인 컴포넌트
export var AlfredoIsland = function(props) {
  var darkMode = props.darkMode;
  var userName = props.userName || 'Boss';
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 3;
  var chatHistory = props.chatHistory || [];
  var onSendMessage = props.onSendMessage;
  var onOpenFullChat = props.onOpenFullChat;
  var onAction = props.onAction;
  
  // 상태: 0=축소, 1=미니확장, 2=풀(외부에서 처리)
  var expandState = useState(0);
  var expandLevel = expandState[0];
  var setExpandLevel = expandState[1];
  
  var inputState = useState('');
  var inputText = inputState[0];
  var setInputText = inputState[1];
  
  // 통계
  var completedCount = useMemo(function() {
    return tasks.filter(function(t) { return t.completed; }).length;
  }, [tasks]);
  
  // 시간대
  var timeOfDay = getTimeOfDay();
  var isNight = timeOfDay === 'night';
  
  // 긴급 체크
  var urgentInfo = getUrgentInfo(events, tasks);
  
  // 인사말
  var greeting = urgentInfo.isUrgent 
    ? { line1: urgentInfo.line1, line2: urgentInfo.line2 }
    : getGreeting(timeOfDay, userName, completedCount, condition);
  
  // 최근 히스토리 (미니 확장용)
  var recentHistory = useMemo(function() {
    if (chatHistory.length === 0) return null;
    return chatHistory[chatHistory.length - 1];
  }, [chatHistory]);
  
  // 토글
  var handleToggle = function() {
    setExpandLevel(expandLevel === 0 ? 1 : 0);
  };
  
  // 메시지 전송
  var handleSend = function() {
    if (inputText.trim() && onSendMessage) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };
  
  var handleKeyPress = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // 배경색 (긴급 여부에 따라)
  var getBgClass = function() {
    if (urgentInfo.isUrgent) {
      return darkMode 
        ? 'bg-gradient-to-r from-orange-600/90 to-red-600/90' 
        : 'bg-gradient-to-r from-orange-500 to-red-500';
    }
    if (isNight) {
      return darkMode
        ? 'bg-gradient-to-r from-indigo-900/90 to-purple-900/90'
        : 'bg-gradient-to-r from-indigo-600 to-purple-600';
    }
    return darkMode 
      ? 'bg-gradient-to-r from-[#2C2C2E] to-[#3A3A3C]' 
      : 'bg-gradient-to-r from-[#E8E4F3] to-[#D4CCE8]';
  };
  
  var textColor = (urgentInfo.isUrgent || isNight) ? 'text-white' : (darkMode ? 'text-white' : 'text-gray-900');
  var subTextColor = (urgentInfo.isUrgent || isNight) ? 'text-white/80' : (darkMode ? 'text-gray-400' : 'text-gray-600');
  
  return React.createElement('div', {
    className: 'mx-4 mb-4 transition-all duration-300 ease-out'
  },
    // 메인 아일랜드
    React.createElement('div', {
      className: getBgClass() + ' rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ' +
        (urgentInfo.isUrgent ? 'animate-pulse-soft ring-2 ring-orange-400/50' : '')
    },
      // 1단계: 축소 상태 (항상 보임)
      React.createElement('button', {
        onClick: handleToggle,
        className: 'w-full p-4 flex items-center gap-3 text-left transition-all btn-press'
      },
        // 알프레도 아바타
        React.createElement('div', {
          className: 'w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ' +
            (urgentInfo.isUrgent 
              ? 'bg-white/20' 
              : 'bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] shadow-lg shadow-[#A996FF]/30')
        }, '🐧'),
        
        // 텍스트 (2줄)
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('p', {
            className: textColor + ' font-bold text-sm leading-tight truncate'
          }, greeting.line1),
          React.createElement('p', {
            className: subTextColor + ' text-sm leading-tight truncate mt-0.5'
          }, greeting.line2)
        ),
        
        // 화살표
        React.createElement('div', {
          className: subTextColor + ' transition-transform duration-300 ' +
            (expandLevel > 0 ? 'rotate-90' : '')
        },
          expandLevel > 0 
            ? React.createElement(ChevronUp, { size: 20 })
            : React.createElement(ChevronRight, { size: 20 })
        )
      ),
      
      // 2단계: 미니 확장 (expandLevel === 1)
      expandLevel >= 1 && React.createElement('div', {
        className: 'border-t ' + (darkMode ? 'border-white/10' : 'border-black/5')
      },
        // 최근 액션/대화 1개
        recentHistory && React.createElement('div', {
          className: 'px-4 py-3 ' + (darkMode ? 'bg-black/20' : 'bg-white/30')
        },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('span', { className: 'text-sm' }, 
              recentHistory.type === 'action' ? '✅' : 
              recentHistory.type === 'user' ? '💬' : '🐧'
            ),
            React.createElement('span', {
              className: (darkMode ? 'text-gray-300' : 'text-gray-700') + ' text-sm truncate'
            }, recentHistory.text)
          )
        ),
        
        // 입력창 + 전체보기 버튼
        React.createElement('div', {
          className: 'px-4 py-3 flex items-center gap-2'
        },
          // 입력창
          React.createElement('div', {
            className: 'flex-1 flex items-center gap-2 px-3 py-2 rounded-xl ' +
              (darkMode ? 'bg-black/30' : 'bg-white/50')
          },
            React.createElement('input', {
              type: 'text',
              value: inputText,
              onChange: function(e) { setInputText(e.target.value); },
              onKeyPress: handleKeyPress,
              placeholder: '알프레도에게...',
              className: 'flex-1 bg-transparent text-sm outline-none ' +
                (darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400')
            }),
            inputText.trim() && React.createElement('button', {
              onClick: handleSend,
              className: 'text-[#A996FF] hover:text-[#8B7CF7] transition-colors'
            },
              React.createElement(Send, { size: 16 })
            )
          ),
          
          // 전체보기 버튼
          React.createElement('button', {
            onClick: function() {
              if (onOpenFullChat) onOpenFullChat();
            },
            className: 'p-2 rounded-xl transition-all btn-press ' +
              (darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-gray-700')
          },
            React.createElement(Maximize2, { size: 18 })
          )
        )
      )
    )
  );
};

export default AlfredoIsland;