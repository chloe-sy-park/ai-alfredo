import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Send, X } from 'lucide-react';

// ⭐ 알프레도의 한 마디 생성
var getAlfredoMessage = function(props) {
  var events = props.events || [];
  var tasks = props.tasks || [];
  var userName = props.userName || 'Boss';
  var condition = props.condition || 3;
  var notification = props.notification; // 알림 (휴식, 집중 등)
  
  var now = new Date();
  
  // 1. 알림이 있으면 알림 우선
  if (notification) {
    return {
      type: 'notification',
      title: notification.title,
      subtitle: notification.subtitle,
      actions: notification.actions // [{label, action}]
    };
  }
  
  // 2. 컨디션 낮을 때
  if (condition <= 2) {
    return {
      type: 'message',
      title: '⭐ 알프레도의 지금 한 마디',
      subtitle: '오늘은 무리하지 말아요. 꼭 필요한 것만 천천히 💜'
    };
  }
  
  // 3. 30분 이내 일정
  var upcomingEvent = events.find(function(e) {
    var start = new Date(e.start || e.startTime);
    var diffMin = (start - now) / 1000 / 60;
    return diffMin > 0 && diffMin <= 30;
  });
  
  if (upcomingEvent) {
    var diffMin = Math.round((new Date(upcomingEvent.start || upcomingEvent.startTime) - now) / 1000 / 60);
    return {
      type: 'message',
      title: '⭐ ' + diffMin + '분 뒤 일정이 있어요!',
      subtitle: '"' + (upcomingEvent.title || upcomingEvent.summary) + '" 준비하세요 ⚡'
    };
  }
  
  // 4. 시간대별 기본 메시지
  var hour = now.getHours();
  var greeting = '';
  
  if (hour >= 5 && hour < 9) {
    greeting = '좋은 아침이에요! 오늘 하루도 함께할게요 ☀️';
  } else if (hour >= 9 && hour < 12) {
    greeting = '오전 잘 보내고 계세요? 오늘 할 것들 정리해뒀어요 ✨';
  } else if (hour >= 12 && hour < 14) {
    greeting = '점심은 드셨어요? 오후도 화이팅! 🍚';
  } else if (hour >= 14 && hour < 17) {
    greeting = '오후도 힘내고 있죠? 잘하고 있어요 💪';
  } else if (hour >= 17 && hour < 21) {
    greeting = '오늘 하루 수고했어요! 이제 좀 쉬어도 돼요 💜';
  } else {
    greeting = '이 시간엔 쉬셔야죠. 푹 쉬세요 🌙';
  }
  
  return {
    type: 'message',
    title: '⭐ 알프레도의 지금 한 마디',
    subtitle: greeting
  };
};

// 🐧 알프레도 카드 (메인)
export var AlfredoCard = function(props) {
  var darkMode = props.darkMode;
  var userName = props.userName || 'Boss';
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 3;
  var notification = props.notification;
  var onNotificationAction = props.onNotificationAction;
  var chatHistory = props.chatHistory || [];
  var onSendMessage = props.onSendMessage;
  var onOpenChat = props.onOpenChat;
  
  // 채팅 모달 상태
  var modalState = useState(false);
  var isModalOpen = modalState[0];
  var setModalOpen = modalState[1];
  
  // 알프레도 메시지
  var message = getAlfredoMessage({
    events: events,
    tasks: tasks,
    userName: userName,
    condition: condition,
    notification: notification
  });
  
  // 카드 탭 핸들러
  var handleCardClick = function() {
    if (message.type === 'notification') {
      // 알림이면 아무것도 안함 (버튼으로 처리)
      return;
    }
    setModalOpen(true);
  };
  
  // 알림 버튼 핸들러
  var handleNotificationAction = function(action) {
    if (onNotificationAction) {
      onNotificationAction(action);
    }
  };
  
  // 배경색
  var bgClass = darkMode ? 'bg-[#2C2C2E]' : 'bg-white';
  var textColor = darkMode ? 'text-white' : 'text-gray-900';
  var subTextColor = darkMode ? 'text-gray-400' : 'text-gray-600';
  
  return React.createElement(React.Fragment, null,
    // 메인 카드
    React.createElement('div', {
      onClick: message.type !== 'notification' ? handleCardClick : undefined,
      className: bgClass + ' rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ' +
        (darkMode ? '' : 'border border-gray-100') +
        (message.type !== 'notification' ? ' cursor-pointer active:scale-[0.99]' : '')
    },
      React.createElement('div', { className: 'p-4 flex items-start gap-4' },
        // 알프레도 아바타 (빨간 원)
        React.createElement('div', {
          className: 'w-16 h-16 rounded-full flex-shrink-0 bg-gradient-to-br from-red-400 to-red-600 shadow-lg'
        }),
        
        // 콘텐츠
        React.createElement('div', { className: 'flex-1 min-w-0' },
          // 타이틀
          React.createElement('p', {
            className: textColor + ' font-semibold text-base leading-tight'
          }, message.title),
          
          // 서브타이틀
          React.createElement('p', {
            className: subTextColor + ' text-sm leading-relaxed mt-1'
          }, message.subtitle),
          
          // 알림 액션 버튼들
          message.type === 'notification' && message.actions && React.createElement('div', {
            className: 'flex items-center gap-3 mt-4'
          },
            message.actions.map(function(btn, idx) {
              var isPrimary = idx === message.actions.length - 1;
              return React.createElement('button', {
                key: idx,
                onClick: function(e) {
                  e.stopPropagation();
                  handleNotificationAction(btn.action);
                },
                className: 'flex-1 py-3 rounded-xl font-medium text-base transition-all active:scale-95 ' +
                  (isPrimary 
                    ? 'bg-[#A996FF] text-white hover:bg-[#8B7CF7]'
                    : (darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'))
              }, btn.label);
            })
          )
        ),
        
        // 화살표 (알림 아닐 때만)
        message.type !== 'notification' && React.createElement('div', {
          className: subTextColor + ' mt-1'
        },
          React.createElement(ChevronDown, { size: 20 })
        )
      )
    ),
    
    // 플로팅 채팅 모달
    React.createElement(AlfredoChatModal, {
      isOpen: isModalOpen,
      onClose: function() { setModalOpen(false); },
      darkMode: darkMode,
      userName: userName,
      message: message,
      chatHistory: chatHistory,
      onSendMessage: onSendMessage
    })
  );
};

// 💬 플로팅 채팅 모달
var AlfredoChatModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var darkMode = props.darkMode;
  var userName = props.userName;
  var message = props.message;
  var chatHistory = props.chatHistory || [];
  var onSendMessage = props.onSendMessage;
  
  var inputState = useState('');
  var inputText = inputState[0];
  var setInputText = inputState[1];
  
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
  
  if (!isOpen) return null;
  
  var bgClass = darkMode ? 'bg-[#1C1C1E]' : 'bg-white';
  var textColor = darkMode ? 'text-white' : 'text-gray-900';
  var subTextColor = darkMode ? 'text-gray-400' : 'text-gray-600';
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4'
  },
    // 백드롭
    React.createElement('div', {
      onClick: onClose,
      className: 'absolute inset-0 bg-black/50 backdrop-blur-sm'
    }),
    
    // 모달
    React.createElement('div', {
      className: bgClass + ' relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden ' +
        'animate-in fade-in zoom-in-95 duration-200'
    },
      // 상단 - 알프레도 메시지
      React.createElement('div', { className: 'p-6 pb-4' },
        React.createElement('div', { className: 'flex items-start gap-4' },
          // 아바타
          React.createElement('div', {
            className: 'w-20 h-20 rounded-full flex-shrink-0 bg-gradient-to-br from-red-400 to-red-600 shadow-lg'
          }),
          
          // 메시지
          React.createElement('div', { className: 'flex-1' },
            React.createElement('p', {
              className: textColor + ' font-semibold text-lg'
            }, '⭐ 알프레도의 한 마디'),
            React.createElement('p', {
              className: subTextColor + ' text-base mt-1 leading-relaxed'
            }, message.subtitle)
          )
        )
      ),
      
      // 채팅 영역
      React.createElement('div', {
        className: 'px-6 py-4 min-h-[200px] max-h-[300px] overflow-y-auto'
      },
        chatHistory.map(function(chat, idx) {
          var isUser = chat.type === 'user';
          
          return React.createElement('div', {
            key: idx,
            className: 'mb-4 ' + (isUser ? 'flex justify-end' : '')
          },
            isUser 
              // 유저: 보라색 말풍선
              ? React.createElement('div', {
                  className: 'inline-block px-4 py-3 rounded-2xl bg-[#A996FF] text-white max-w-[80%]'
                }, chat.text)
              // 알프레도: 말풍선 없이 텍스트만
              : React.createElement('p', {
                  className: subTextColor + ' text-sm'
                }, chat.text)
          );
        })
      ),
      
      // 입력창
      React.createElement('div', {
        className: 'p-4 border-t ' + (darkMode ? 'border-gray-700' : 'border-gray-100')
      },
        React.createElement('div', {
          className: 'flex items-center gap-3 px-4 py-3 rounded-2xl ' +
            (darkMode ? 'bg-gray-800' : 'bg-gray-100')
        },
          React.createElement('input', {
            type: 'text',
            value: inputText,
            onChange: function(e) { setInputText(e.target.value); },
            onKeyPress: handleKeyPress,
            placeholder: '알프레도에게 말해보세요... 💬',
            className: 'flex-1 bg-transparent text-sm outline-none ' +
              (darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400')
          }),
          React.createElement('button', {
            onClick: handleSend,
            disabled: !inputText.trim(),
            className: 'w-10 h-10 rounded-full flex items-center justify-center transition-all ' +
              (inputText.trim() 
                ? 'bg-[#A996FF] text-white hover:bg-[#8B7CF7]'
                : (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'))
          },
            React.createElement(Send, { size: 18 })
          )
        )
      ),
      
      // 닫기 버튼
      React.createElement('button', {
        onClick: onClose,
        className: 'absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ' +
          (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500') +
          ' hover:opacity-80 transition-opacity'
      },
        React.createElement(X, { size: 18 })
      )
    )
  );
};

export default AlfredoCard;
