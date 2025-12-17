import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronRight, X, Send } from 'lucide-react';

// 🐧 알프레도 메시지 생성
var getAlfredoMessage = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 3;
  var userName = props.userName || 'Boss';
  
  var now = new Date();
  var hour = now.getHours();
  var completed = tasks.filter(function(t) { return t.completed; }).length;
  var total = tasks.length;
  
  // 1. 컨디션 낮을 때
  if (condition <= 2) {
    return {
      line1: '오늘은 무리하지 말아요, ' + userName,
      line2: '꼭 필요한 것만 천천히 💜',
      urgent: false
    };
  }
  
  // 2. 30분 이내 일정
  var upcomingEvent = events.find(function(e) {
    var start = new Date(e.start || e.startTime);
    var diffMin = (start - now) / 1000 / 60;
    return diffMin > 0 && diffMin <= 30;
  });
  
  if (upcomingEvent) {
    var diffMin = Math.round((new Date(upcomingEvent.start || upcomingEvent.startTime) - now) / 1000 / 60);
    return {
      line1: userName + '! ' + diffMin + '분 뒤 일정이에요',
      line2: '"' + (upcomingEvent.title || upcomingEvent.summary).slice(0, 15) + '" 준비하세요 ⚡',
      urgent: true
    };
  }
  
  // 3. 성취도 기반 메시지
  if (completed > 0 && total > 0) {
    var remaining = total - completed;
    if (remaining === 0) {
      return {
        line1: '오늘 다 해냈어요! 🎉',
        line2: '정말 대단해요, ' + userName,
        urgent: false
      };
    }
    return {
      line1: '벌써 ' + completed + '개 했어요! 👏',
      line2: remaining + '개 남았어요. 이거 해볼까요?',
      urgent: false
    };
  }
  
  // 4. 시간대별 기본 메시지
  var greeting = '';
  var subtext = '';
  
  if (hour >= 5 && hour < 9) {
    greeting = '좋은 아침이에요, ' + userName;
    subtext = '오늘 하루도 함께할게요 ☀️';
  } else if (hour >= 9 && hour < 12) {
    greeting = '좋은 오전이에요, ' + userName;
    subtext = '첫 번째부터 시작해볼까요?';
  } else if (hour >= 12 && hour < 14) {
    greeting = '점심은 드셨어요?';
    subtext = '배고프면 집중력이 떨어져요 🍚';
  } else if (hour >= 14 && hour < 17) {
    greeting = '좋은 오후예요, ' + userName;
    subtext = '지금 이거부터 해볼까요?';
  } else if (hour >= 17 && hour < 21) {
    greeting = '오늘 하루 수고했어요';
    subtext = '이제 좀 쉬어도 돼요 💜';
  } else {
    greeting = '이 시간엔 쉬셔야죠';
    subtext = '내일도 함께할게요 🌙';
  }
  
  return { line1: greeting, line2: subtext, urgent: false };
};

// 📜 대화 히스토리 생성
var generateChatHistory = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var userName = props.userName || 'Boss';
  
  var history = [];
  var now = new Date();
  var hour = now.getHours();
  
  // 아침 인사 (9시 이후면 추가)
  if (hour >= 9) {
    history.push({
      time: '09:00',
      type: 'alfredo',
      text: '좋은 아침이에요, ' + userName + '! 물 한 잔 먼저 마셔요 💧'
    });
  }
  
  // 완료된 태스크들
  var completed = tasks.filter(function(t) { return t.completed; });
  completed.forEach(function(task, index) {
    var taskHour = 9 + index;
    if (taskHour < hour) {
      history.push({
        time: (taskHour < 10 ? '0' : '') + taskHour + ':30',
        type: 'action',
        text: '✅ ' + userName + '가 "' + task.title + '" 완료!'
      });
    }
  });
  
  // 점심 인사 (12시 이후면 추가)
  if (hour >= 12) {
    history.push({
      time: '12:30',
      type: 'alfredo',
      text: '점심 드셨어요? 오전에 ' + completed.length + '개 해치웠어요! 👏'
    });
  }
  
  // 곧 있을 일정
  var upcomingEvent = events.find(function(e) {
    var start = new Date(e.start || e.startTime);
    var diffMin = (start - now) / 1000 / 60;
    return diffMin > 0 && diffMin <= 60;
  });
  
  if (upcomingEvent) {
    var eventTime = new Date(upcomingEvent.start || upcomingEvent.startTime);
    var diffMin = Math.round((eventTime - now) / 1000 / 60);
    history.push({
      time: '지금',
      type: 'notification',
      text: '⚡ ' + diffMin + '분 뒤 "' + (upcomingEvent.title || upcomingEvent.summary) + '"이에요!'
    });
  }
  
  return history;
};

// 🐧 알프레도 아일랜드 (미니멀)
export var AlfredoIslandMinimal = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 3;
  var userName = props.userName || 'Boss';
  var onSendMessage = props.onSendMessage;
  
  var expandedState = useState(false);
  var isExpanded = expandedState[0];
  var setExpanded = expandedState[1];
  
  var inputState = useState('');
  var inputText = inputState[0];
  var setInputText = inputState[1];
  
  var chatEndRef = useRef(null);
  
  // 메시지 생성
  var message = useMemo(function() {
    return getAlfredoMessage({
      tasks: tasks,
      events: events,
      condition: condition,
      userName: userName
    });
  }, [tasks, events, condition, userName]);
  
  // 대화 히스토리
  var chatHistory = useMemo(function() {
    return generateChatHistory({
      tasks: tasks,
      events: events,
      userName: userName
    });
  }, [tasks, events, userName]);
  
  // 스크롤 to bottom
  useEffect(function() {
    if (isExpanded && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isExpanded, chatHistory]);
  
  // 메시지 전송
  var handleSend = function() {
    if (inputText.trim()) {
      if (onSendMessage) onSendMessage(inputText.trim());
      setInputText('');
    }
  };
  
  var handleKeyPress = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // 스타일
  var bgColor = message.urgent ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100';
  var textColor = message.urgent ? 'text-orange-800' : 'text-gray-800';
  
  return React.createElement(React.Fragment, null,
    // 축소 상태 (2줄)
    React.createElement('div', {
      className: 'mx-4 mt-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md ' + bgColor,
      onClick: function() { setExpanded(true); }
    },
      React.createElement('div', { className: 'p-4 flex items-center gap-3' },
        // 펭귄
        React.createElement('div', { className: 'text-2xl' }, '🐧'),
        
        // 텍스트
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('p', { 
            className: 'font-medium truncate ' + textColor 
          }, message.line1),
          React.createElement('p', { 
            className: 'text-sm text-gray-500 truncate' 
          }, message.line2)
        ),
        
        // 화살표
        React.createElement(ChevronRight, { 
          size: 20, 
          className: 'text-gray-400 flex-shrink-0' 
        })
      )
    ),
    
    // 확장 상태 (플로팅 대화창)
    isExpanded && React.createElement('div', {
      className: 'fixed inset-0 z-50 flex items-end justify-center'
    },
      // 배경 딤
      React.createElement('div', {
        className: 'absolute inset-0 bg-black/40',
        onClick: function() { setExpanded(false); }
      }),
      
      // 대화창
      React.createElement('div', {
        className: 'relative w-full max-w-lg mx-4 mb-4 bg-white rounded-2xl shadow-2xl overflow-hidden',
        style: { maxHeight: '70vh' }
      },
        // 헤더
        React.createElement('div', {
          className: 'flex items-center justify-between p-4 border-b bg-gray-50'
        },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('span', { className: 'text-xl' }, '🐧'),
            React.createElement('span', { className: 'font-semibold text-gray-800' }, '알프레도')
          ),
          React.createElement('button', {
            className: 'p-1 rounded-full hover:bg-gray-200 transition-colors',
            onClick: function() { setExpanded(false); }
          },
            React.createElement(X, { size: 20, className: 'text-gray-500' })
          )
        ),
        
        // 대화 내용
        React.createElement('div', {
          className: 'p-4 overflow-y-auto',
          style: { maxHeight: 'calc(70vh - 140px)' }
        },
          chatHistory.map(function(item, index) {
            var isAction = item.type === 'action';
            var isNotification = item.type === 'notification';
            
            return React.createElement('div', {
              key: index,
              className: 'mb-4'
            },
              // 시간
              React.createElement('div', {
                className: 'text-xs text-gray-400 mb-1'
              }, item.time),
              
              // 메시지
              React.createElement('div', {
                className: isAction 
                  ? 'text-sm text-purple-600 bg-purple-50 rounded-lg px-3 py-2 inline-block'
                  : isNotification
                    ? 'text-sm text-orange-600 bg-orange-50 rounded-lg px-3 py-2'
                    : 'text-gray-800'
              }, item.text)
            );
          }),
          
          React.createElement('div', { ref: chatEndRef })
        ),
        
        // 입력창
        React.createElement('div', {
          className: 'p-3 border-t bg-gray-50'
        },
          React.createElement('div', {
            className: 'flex items-center gap-2 bg-white rounded-full border px-4 py-2'
          },
            React.createElement('input', {
              type: 'text',
              placeholder: '알프레도에게 말하기...',
              className: 'flex-1 outline-none text-sm',
              value: inputText,
              onChange: function(e) { setInputText(e.target.value); },
              onKeyPress: handleKeyPress
            }),
            React.createElement('button', {
              className: 'p-1 text-purple-500 hover:text-purple-600',
              onClick: handleSend
            },
              React.createElement(Send, { size: 18 })
            )
          )
        )
      )
    )
  );
};

export default AlfredoIslandMinimal;
