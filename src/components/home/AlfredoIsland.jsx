import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Send, Maximize2 } from 'lucide-react';

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

// 실용적인 메시지 생성 (일정/태스크 기반)
var getPracticalMessage = function(events, tasks, userName, condition) {
  var name = userName || 'Boss';
  var now = new Date();
  
  // 컨디션 낮을 때
  if (condition && condition <= 2) {
    return {
      line1: name + ', 오늘은 무리하지 말아요',
      line2: '꼭 필요한 것만 천천히 💜'
    };
  }
  
  // 30분 이내 일정
  var upcomingEvent = events.find(function(e) {
    var start = new Date(e.start || e.startTime);
    var diffMin = (start - now) / 1000 / 60;
    return diffMin > 0 && diffMin <= 30;
  });
  
  if (upcomingEvent) {
    var diffMin = Math.round((new Date(upcomingEvent.start || upcomingEvent.startTime) - now) / 1000 / 60);
    return {
      line1: name + ', ' + diffMin + '분 뒤 일정!',
      line2: '"' + (upcomingEvent.title || upcomingEvent.summary) + '" 준비하세요 ⚡',
      isUrgent: true
    };
  }
  
  // 2시간 이내 마감 태스크
  var urgentTask = tasks.find(function(t) {
    if (t.completed || (!t.deadline && !t.dueDate)) return false;
    var due = new Date(t.deadline || t.dueDate);
    var diffHour = (due - now) / 1000 / 60 / 60;
    return diffHour > 0 && diffHour <= 2;
  });
  
  if (urgentTask) {
    return {
      line1: name + ', 마감이 코앞이에요!',
      line2: '"' + urgentTask.title + '" 지금 시작해요 🔥',
      isUrgent: true
    };
  }
  
  // 다음 일정 있으면
  var nextEvent = events.find(function(e) {
    var start = new Date(e.start || e.startTime);
    return start > now;
  });
  
  // 미완료 태스크 중 추천
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  var recommendedTask = incompleteTasks.find(function(t) {
    return t.priority === 'high' || t.importance >= 4;
  }) || incompleteTasks[0];
  
  if (nextEvent && recommendedTask) {
    var eventStart = new Date(nextEvent.start || nextEvent.startTime);
    var diffHours = Math.round((eventStart - now) / 1000 / 60 / 60);
    
    if (diffHours <= 2) {
      return {
        line1: name + ', ' + diffHours + '시간 뒤 일정 전까지',
        line2: '"' + recommendedTask.title + '" 해볼까요? 💪'
      };
    }
  }
  
  if (recommendedTask) {
    return {
      line1: name + ', 지금 이거 어때요?',
      line2: '"' + recommendedTask.title + '" 시작해볼까요? ✨'
    };
  }
  
  // 할 일 없을 때
  var completedCount = tasks.filter(function(t) { return t.completed; }).length;
  if (completedCount > 0) {
    return {
      line1: name + ', 오늘 ' + completedCount + '개 완료!',
      line2: '잘하고 있어요 👏'
    };
  }
  
  return {
    line1: name + ', 오늘 뭐 해볼까요?',
    line2: '할 일 추가하거나 저한테 물어봐요 💬'
  };
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
  
  // 상태: 0=축소, 1=미니확장
  var expandState = useState(0);
  var expandLevel = expandState[0];
  var setExpandLevel = expandState[1];
  
  var inputState = useState('');
  var inputText = inputState[0];
  var setInputText = inputState[1];
  
  // 실용적 메시지
  var message = getPracticalMessage(events, tasks, userName, condition);
  var isUrgent = message.isUrgent;
  
  // 최근 대화 2개 (맥락용)
  var recentChats = useMemo(function() {
    if (chatHistory.length === 0) return [];
    // 최근 2개 (유저 + 알프레도 쌍)
    return chatHistory.slice(-2);
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
  
  // 배경색 (가독성 개선 - 톤 다운)
  var getBgClass = function() {
    if (isUrgent) {
      return darkMode 
        ? 'bg-gradient-to-r from-orange-900/80 to-red-900/80' 
        : 'bg-gradient-to-r from-orange-100 to-red-100';
    }
    return darkMode 
      ? 'bg-[#2C2C2E]' 
      : 'bg-white';
  };
  
  // 텍스트 색상
  var textColor = darkMode ? 'text-white' : 'text-gray-900';
  var subTextColor = isUrgent 
    ? (darkMode ? 'text-orange-300' : 'text-orange-700')
    : (darkMode ? 'text-gray-400' : 'text-gray-500');
  
  return React.createElement('div', {
    className: 'transition-all duration-300 ease-out'
  },
    // 메인 아일랜드
    React.createElement('div', {
      className: getBgClass() + ' rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ' +
        (isUrgent ? 'ring-2 ring-orange-400/50' : (darkMode ? '' : 'border border-gray-100'))
    },
      // 1단계: 축소 상태 (항상 보임)
      React.createElement('button', {
        onClick: handleToggle,
        className: 'w-full p-4 flex items-center gap-3 text-left transition-all active:scale-[0.99]'
      },
        // 알프레도 아바타
        React.createElement('div', {
          className: 'w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 ' +
            'bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] shadow-md'
        }, '🐧'),
        
        // 텍스트 (2줄 - 실용 정보)
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('p', {
            className: textColor + ' font-semibold text-[15px] leading-tight truncate'
          }, message.line1),
          React.createElement('p', {
            className: subTextColor + ' text-sm leading-tight truncate mt-0.5'
          }, message.line2)
        ),
        
        // 화살표 (확장 방향 표시)
        React.createElement('div', {
          className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' transition-transform duration-300'
        },
          expandLevel > 0 
            ? React.createElement(ChevronUp, { size: 20 })
            : React.createElement(ChevronDown, { size: 20 })
        )
      ),
      
      // 2단계: 미니 확장 (expandLevel === 1)
      expandLevel >= 1 && React.createElement('div', {
        className: 'border-t ' + (darkMode ? 'border-gray-700' : 'border-gray-100')
      },
        // 최근 대화 (맥락 있게)
        recentChats.length > 0 && React.createElement('div', {
          className: 'px-4 py-3 space-y-2 ' + (darkMode ? 'bg-black/20' : 'bg-gray-50/50')
        },
          recentChats.map(function(chat, idx) {
            var isUser = chat.type === 'user';
            var isAction = chat.type === 'action';
            
            return React.createElement('div', {
              key: idx,
              className: 'flex items-start gap-2 text-sm'
            },
              // 라벨
              React.createElement('span', {
                className: 'flex-shrink-0 ' + (
                  isUser ? (darkMode ? 'text-blue-400' : 'text-blue-600') :
                  isAction ? (darkMode ? 'text-green-400' : 'text-green-600') :
                  (darkMode ? 'text-purple-400' : 'text-purple-600')
                )
              }, isUser ? '나:' : isAction ? '✓' : '🐧'),
              
              // 텍스트
              React.createElement('span', {
                className: (darkMode ? 'text-gray-300' : 'text-gray-600') + ' truncate'
              }, chat.text)
            );
          })
        ),
        
        // 입력창 + 전체보기 버튼 (균형 맞춤)
        React.createElement('div', {
          className: 'px-4 py-3 flex items-center gap-3'
        },
          // 입력창
          React.createElement('div', {
            className: 'flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl ' +
              (darkMode ? 'bg-gray-800' : 'bg-gray-100')
          },
            React.createElement('input', {
              type: 'text',
              value: inputText,
              onChange: function(e) { setInputText(e.target.value); },
              onKeyPress: handleKeyPress,
              placeholder: '메시지 입력...',
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
          
          // 전체보기 버튼 (더 눈에 띄게)
          React.createElement('button', {
            onClick: function() {
              if (onOpenFullChat) onOpenFullChat();
            },
            className: 'px-3 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 ' +
              'bg-[#A996FF] text-white hover:bg-[#8B7CF7]'
          },
            React.createElement('span', { className: 'flex items-center gap-1' },
              '전체',
              React.createElement(Maximize2, { size: 14 })
            )
          )
        )
      )
    )
  );
};

export default AlfredoIsland;