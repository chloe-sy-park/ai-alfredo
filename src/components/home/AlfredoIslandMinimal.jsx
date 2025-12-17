import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronRight, X, Send, Sparkles } from 'lucide-react';

// 🐧 알프레도 메시지 생성
var getAlfredoMessage = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 0;
  var userName = props.userName || 'Boss';
  var urgentEvent = props.urgentEvent;
  
  var now = new Date();
  var hour = now.getHours();
  var completed = tasks.filter(function(t) { return t.completed; }).length;
  var total = tasks.length;
  
  // 0. 컨디션 아직 안 물어봤을 때
  if (condition === 0) {
    return {
      line1: '안녕하세요, ' + userName + '!',
      line2: '오늘 컨디션은 어때요? 💜',
      urgent: false,
      askCondition: true
    };
  }
  
  // 1. 긴급 일정 (30분 이내)
  if (urgentEvent) {
    var title = urgentEvent.event.title || urgentEvent.event.summary || '일정';
    return {
      line1: '⚡ ' + urgentEvent.diffMin + '분 뒤 일정!',
      line2: '"' + title.slice(0, 12) + '" 준비하세요',
      urgent: true
    };
  }
  
  // 2. 컨디션 낮을 때
  if (condition <= 2) {
    return {
      line1: '오늘은 무리하지 말아요, ' + userName,
      line2: '꼭 필요한 것만 천천히 💜',
      urgent: false,
      lowEnergy: true
    };
  }
  
  // 3. 성취도 기반 메시지
  if (total > 0) {
    var remaining = total - completed;
    if (remaining === 0) {
      return {
        line1: '오늘 다 해냈어요! 🎉',
        line2: '정말 대단해요, ' + userName,
        urgent: false
      };
    }
    if (completed > 0) {
      return {
        line1: '벌써 ' + completed + '개 했어요! 👏',
        line2: remaining + '개 남았어요. 이거 해볼까요?',
        urgent: false
      };
    }
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
    greeting = '점심은 드셨어요? 🍚';
    subtext = '배고프면 집중력이 떨어져요';
  } else if (hour >= 14 && hour < 17) {
    greeting = '좋은 오후예요, ' + userName;
    subtext = '지금 이거부터 해볼까요?';
  } else if (hour >= 17 && hour < 21) {
    greeting = '오늘 하루 수고했어요 💜';
    subtext = '이제 좀 쉬어도 돼요';
  } else {
    greeting = '이 시간엔 쉬셔야죠 🌙';
    subtext = '내일도 함께할게요';
  }
  
  return { line1: greeting, line2: subtext, urgent: false };
};

// 📜 대화 히스토리 생성
var generateChatHistory = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var userName = props.userName || 'Boss';
  var condition = props.condition || 3;
  
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
  
  // 컨디션 기록
  if (condition > 0) {
    var conditionEmoji = ['😫', '😔', '😐', '😊', '🔥'][condition - 1];
    var conditionText = condition <= 2 
      ? '오늘은 좀 힘드시군요. 무리하지 마세요 💜'
      : condition >= 4
        ? '컨디션 좋으시네요! 오늘 잘 될 거예요 ✨'
        : '알겠어요! 차근차근 해봐요';
    
    history.push({
      time: '오늘',
      type: 'action',
      text: userName + '의 컨디션: ' + conditionEmoji
    });
    history.push({
      time: '',
      type: 'alfredo',
      text: conditionText
    });
  }
  
  // 완료된 태스크들
  var completed = tasks.filter(function(t) { return t.completed; });
  completed.forEach(function(task, index) {
    var taskHour = 10 + index;
    if (taskHour <= hour) {
      history.push({
        time: (taskHour < 10 ? '0' : '') + taskHour + ':00',
        type: 'action',
        text: '✅ "' + task.title + '" 완료!'
      });
      
      // 칭찬 메시지
      var praises = ['잘했어요! 👏', '대단해요!', '하나 끝! ✨', '좋아요!'];
      history.push({
        time: '',
        type: 'alfredo',
        text: praises[index % praises.length]
      });
    }
  });
  
  // 점심 인사 (12시 이후면 추가)
  if (hour >= 12 && hour < 14) {
    history.push({
      time: '12:30',
      type: 'alfredo',
      text: '점심 드셨어요? 밥 먹고 하는 게 효율적이에요 🍚'
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
  
  // 빈 히스토리면 기본 메시지
  if (history.length === 0) {
    history.push({
      time: '지금',
      type: 'alfredo',
      text: '안녕하세요 ' + userName + '! 무엇을 도와드릴까요? 💜'
    });
  }
  
  return history;
};

// 🐧 알프레도 아일랜드 (미니멀)
export var AlfredoIslandMinimal = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 0;
  var userName = props.userName || 'Boss';
  var urgentEvent = props.urgentEvent;
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
      userName: userName,
      urgentEvent: urgentEvent
    });
  }, [tasks, events, condition, userName, urgentEvent]);
  
  // 대화 히스토리
  var chatHistory = useMemo(function() {
    return generateChatHistory({
      tasks: tasks,
      events: events,
      userName: userName,
      condition: condition
    });
  }, [tasks, events, userName, condition]);
  
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
  var bgColor = message.urgent 
    ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' 
    : message.lowEnergy
      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
      : message.askCondition
        ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
        : 'bg-white border-gray-100';
  
  var textColor = message.urgent ? 'text-orange-800' : 'text-gray-800';
  
  return React.createElement(React.Fragment, null,
    // 축소 상태 (2줄)
    React.createElement('div', {
      className: 'mx-4 mt-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md ' + bgColor,
      onClick: function() { setExpanded(true); }
    },
      React.createElement('div', { className: 'p-4 flex items-center gap-3' },
        // 펭귄 (긴급시 애니메이션)
        React.createElement('div', { 
          className: 'text-2xl ' + (message.urgent ? 'animate-bounce' : '')
        }, '🐧'),
        
        // 텍스트
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('p', { 
            className: 'font-medium truncate ' + textColor 
          }, message.line1),
          React.createElement('p', { 
            className: 'text-sm truncate ' + (message.urgent ? 'text-orange-600' : 'text-gray-500')
          }, message.line2)
        ),
        
        // 화살표 또는 AI 배지
        message.askCondition
          ? React.createElement('span', {
              className: 'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600'
            },
              React.createElement(Sparkles, { size: 12 }),
              '체크'
            )
          : React.createElement(ChevronRight, { 
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
          className: 'flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-white'
        },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('span', { className: 'text-xl' }, '🐧'),
            React.createElement('span', { className: 'font-semibold text-gray-800' }, '알프레도'),
            React.createElement('span', { 
              className: 'text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full'
            }, '오늘의 대화')
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
            var isAlfredo = item.type === 'alfredo';
            
            return React.createElement('div', {
              key: index,
              className: 'mb-3'
            },
              // 시간 (있을 때만)
              item.time && React.createElement('div', {
                className: 'text-xs text-gray-400 mb-1'
              }, item.time),
              
              // 메시지
              React.createElement('div', {
                className: isAction 
                  ? 'text-sm text-purple-600 bg-purple-50 rounded-lg px-3 py-2 inline-block'
                  : isNotification
                    ? 'text-sm text-orange-600 bg-orange-50 rounded-lg px-3 py-2 border border-orange-200'
                    : isAlfredo
                      ? 'text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2'
                      : 'text-gray-800'
              }, 
                isAlfredo && React.createElement('span', { className: 'mr-1' }, '🐧'),
                item.text
              )
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
              className: 'p-1 text-purple-500 hover:text-purple-600 transition-colors',
              onClick: handleSend
            },
              React.createElement(Send, { size: 18 })
            )
          ),
          React.createElement('p', {
            className: 'text-xs text-gray-400 text-center mt-2'
          }, '💬 채팅 기능은 곧 업데이트될 예정이에요')
        )
      )
    )
  );
};

export default AlfredoIslandMinimal;
