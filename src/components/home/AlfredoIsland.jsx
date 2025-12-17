import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Send, Maximize2, Play } from 'lucide-react';

// 태스크명 줄이기 (최대 12자)
var shortenTitle = function(title, maxLen) {
  if (!title) return '';
  maxLen = maxLen || 12;
  if (title.length <= maxLen) return title;
  return title.substring(0, maxLen) + '...';
};

// 시간 차이 포맷
var formatTimeDiff = function(diffMs) {
  var diffMin = Math.round(diffMs / 1000 / 60);
  if (diffMin < 60) return diffMin + '분';
  var diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return diffHour + '시간';
  return Math.round(diffHour / 24) + '일';
};

// 실용적인 메시지 생성 (일정/태스크 기반)
var getPracticalMessage = function(events, tasks, userName, condition) {
  var name = userName || 'Boss';
  var now = new Date();
  
  // 컨디션 낮을 때
  if (condition && condition <= 2) {
    return {
      greeting: name + ', 오늘은 무리하지 말아요',
      subText: '꼭 필요한 것만 천천히 💜',
      task: null
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
      greeting: name + ', ' + diffMin + '분 뒤 일정!',
      subText: '📅 ' + shortenTitle(upcomingEvent.title || upcomingEvent.summary),
      isUrgent: true,
      task: null,
      event: upcomingEvent
    };
  }
  
  // 미완료 태스크 중 추천
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  
  // 2시간 이내 마감 태스크
  var urgentTask = incompleteTasks.find(function(t) {
    if (!t.deadline && !t.dueDate) return false;
    var due = new Date(t.deadline || t.dueDate);
    var diffHour = (due - now) / 1000 / 60 / 60;
    return diffHour > 0 && diffHour <= 2;
  });
  
  if (urgentTask) {
    var due = new Date(urgentTask.deadline || urgentTask.dueDate);
    var timeLeft = formatTimeDiff(due - now);
    return {
      greeting: name + ', 지금 이거 해볼까요?',
      task: urgentTask,
      taskTitle: shortenTitle(urgentTask.title),
      reason: '마감 ' + timeLeft + ' 전',
      isUrgent: true
    };
  }
  
  // 높은 우선순위 태스크
  var highPriorityTask = incompleteTasks.find(function(t) {
    return t.priority === 'high' || t.importance >= 4;
  });
  
  if (highPriorityTask) {
    var reason = '중요';
    if (highPriorityTask.deadline || highPriorityTask.dueDate) {
      var due = new Date(highPriorityTask.deadline || highPriorityTask.dueDate);
      var diffMs = due - now;
      if (diffMs > 0) {
        reason = '마감 ' + formatTimeDiff(diffMs) + ' 전';
      }
    }
    return {
      greeting: name + ', 지금 이거 해볼까요?',
      task: highPriorityTask,
      taskTitle: shortenTitle(highPriorityTask.title),
      reason: reason
    };
  }
  
  // 일반 태스크
  if (incompleteTasks.length > 0) {
    var task = incompleteTasks[0];
    var reason = '';
    if (task.deadline || task.dueDate) {
      var due = new Date(task.deadline || task.dueDate);
      var diffMs = due - now;
      if (diffMs > 0) {
        reason = '마감 ' + formatTimeDiff(diffMs) + ' 전';
      }
    }
    return {
      greeting: name + ', 지금 이거 해볼까요?',
      task: task,
      taskTitle: shortenTitle(task.title),
      reason: reason
    };
  }
  
  // 할 일 없을 때
  var completedCount = tasks.filter(function(t) { return t.completed; }).length;
  if (completedCount > 0) {
    return {
      greeting: name + ', 오늘 ' + completedCount + '개 완료!',
      subText: '잘하고 있어요 👏',
      task: null
    };
  }
  
  return {
    greeting: name + ', 오늘 뭐 해볼까요?',
    subText: '할 일 추가하거나 저한테 물어봐요 💬',
    task: null
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
  var onStartTask = props.onStartTask;
  
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
    return chatHistory.slice(-2);
  }, [chatHistory]);
  
  // 토글
  var handleToggle = function() {
    setExpandLevel(expandLevel === 0 ? 1 : 0);
  };
  
  // 태스크 시작
  var handleStartTask = function(e) {
    e.stopPropagation();
    if (message.task && onStartTask) {
      onStartTask(message.task);
    }
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
  
  // 배경색
  var getBgClass = function() {
    if (isUrgent) {
      return darkMode 
        ? 'bg-gradient-to-r from-orange-900/80 to-red-900/80' 
        : 'bg-gradient-to-r from-orange-50 to-red-50';
    }
    return darkMode 
      ? 'bg-[#2C2C2E]' 
      : 'bg-white';
  };
  
  // 텍스트 색상
  var textColor = darkMode ? 'text-white' : 'text-gray-900';
  var subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  
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
          className: 'w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ' +
            'bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] shadow-md'
        }, '🐧'),
        
        // 콘텐츠 영역
        React.createElement('div', { className: 'flex-1 min-w-0' },
          // 인사말
          React.createElement('p', {
            className: textColor + ' font-semibold text-[15px] leading-tight'
          }, message.greeting),
          
          // 태스크가 있으면 태스크 카드, 없으면 서브텍스트
          message.task ? React.createElement('div', {
            className: 'flex items-center gap-2 mt-1.5'
          },
            // 태스크 아이콘
            React.createElement('span', { className: 'text-sm' }, '📝'),
            // 태스크명 (짧게)
            React.createElement('span', {
              className: textColor + ' text-sm font-medium'
            }, message.taskTitle),
            // 마감 이유 (있으면)
            message.reason && React.createElement('span', {
              className: (isUrgent 
                ? (darkMode ? 'text-orange-300' : 'text-orange-600') 
                : subTextColor) + ' text-xs'
            }, '· ' + message.reason)
          ) : React.createElement('p', {
            className: subTextColor + ' text-sm leading-tight mt-0.5'
          }, message.subText)
        ),
        
        // 시작 버튼 (태스크 있을 때만)
        message.task && React.createElement('button', {
          onClick: handleStartTask,
          className: 'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ' +
            (isUrgent 
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : 'bg-[#A996FF] hover:bg-[#8B7CF7] text-white')
        },
          React.createElement(Play, { size: 16, className: 'ml-0.5' })
        ),
        
        // 화살표 (확장 방향 표시)
        React.createElement('div', {
          className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' transition-transform duration-300'
        },
          expandLevel > 0 
            ? React.createElement(ChevronUp, { size: 18 })
            : React.createElement(ChevronDown, { size: 18 })
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
              React.createElement('span', {
                className: 'flex-shrink-0 ' + (
                  isUser ? (darkMode ? 'text-blue-400' : 'text-blue-600') :
                  isAction ? (darkMode ? 'text-green-400' : 'text-green-600') :
                  (darkMode ? 'text-purple-400' : 'text-purple-600')
                )
              }, isUser ? '나:' : isAction ? '✓' : '🐧'),
              React.createElement('span', {
                className: (darkMode ? 'text-gray-300' : 'text-gray-600') + ' truncate'
              }, chat.text)
            );
          })
        ),
        
        // 입력창 + 전체보기 버튼
        React.createElement('div', {
          className: 'px-4 py-3 flex items-center gap-3'
        },
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
