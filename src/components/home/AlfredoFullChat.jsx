import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, ChevronDown } from 'lucide-react';

// 시간 포맷
var formatTime = function(date) {
  var d = new Date(date);
  return d.getHours().toString().padStart(2, '0') + ':' + 
    d.getMinutes().toString().padStart(2, '0');
};

// 날짜 구분선용
var formatDateDivider = function(date) {
  var d = new Date(date);
  var now = new Date();
  
  if (d.toDateString() === now.toDateString()) {
    return '오늘';
  }
  
  var yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return '어제';
  }
  
  return (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
};

// 메시지 아이템
var ChatMessage = function(props) {
  var message = props.message;
  var darkMode = props.darkMode;
  
  var type = message.type; // 'alfredo', 'user', 'action', 'alert'
  var text = message.text;
  var time = message.time;
  
  // 타입별 스타일
  var getStyle = function() {
    switch (type) {
      case 'alfredo':
        return {
          align: 'justify-start',
          bubble: darkMode ? 'bg-[#A996FF]/20' : 'bg-[#E8E4F3]',
          text: darkMode ? 'text-gray-200' : 'text-gray-800',
          icon: '🐧'
        };
      case 'user':
        return {
          align: 'justify-end',
          bubble: 'bg-[#A996FF]',
          text: 'text-white',
          icon: null
        };
      case 'action':
        return {
          align: 'justify-center',
          bubble: darkMode ? 'bg-green-500/20' : 'bg-green-100',
          text: darkMode ? 'text-green-400' : 'text-green-700',
          icon: '✅'
        };
      case 'alert':
        return {
          align: 'justify-center',
          bubble: darkMode ? 'bg-orange-500/20' : 'bg-orange-100',
          text: darkMode ? 'text-orange-400' : 'text-orange-700',
          icon: '⚡'
        };
      default:
        return {
          align: 'justify-start',
          bubble: darkMode ? 'bg-gray-700' : 'bg-gray-200',
          text: darkMode ? 'text-gray-200' : 'text-gray-800',
          icon: null
        };
    }
  };
  
  var style = getStyle();
  
  // 액션/알림은 센터 정렬 + 작은 폰트
  if (type === 'action' || type === 'alert') {
    return React.createElement('div', {
      className: 'flex ' + style.align + ' my-2'
    },
      React.createElement('div', {
        className: style.bubble + ' ' + style.text + ' px-3 py-1.5 rounded-full text-xs flex items-center gap-1'
      },
        style.icon && React.createElement('span', null, style.icon),
        React.createElement('span', null, text)
      )
    );
  }
  
  // 알프레도/유저 메시지
  return React.createElement('div', {
    className: 'flex ' + style.align + ' my-2'
  },
    React.createElement('div', { className: 'flex items-end gap-2 max-w-[80%]' },
      // 알프레도 아바타 (왼쪽)
      type === 'alfredo' && React.createElement('div', {
        className: 'w-8 h-8 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-sm flex-shrink-0'
      }, '🐧'),
      
      // 메시지 버블
      React.createElement('div', null,
        React.createElement('div', {
          className: style.bubble + ' ' + style.text + ' px-4 py-2.5 text-sm ' +
            (type === 'user' ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md')
        },
          React.createElement('p', { className: 'whitespace-pre-wrap' }, text)
        ),
        // 시간
        React.createElement('p', {
          className: 'text-xs mt-1 ' + 
            (type === 'user' ? 'text-right ' : '') +
            (darkMode ? 'text-gray-600' : 'text-gray-400')
        }, formatTime(time))
      )
    )
  );
};

// 시간 구분선
var TimeDivider = function(props) {
  var time = props.time;
  var darkMode = props.darkMode;
  
  return React.createElement('div', {
    className: 'flex items-center gap-3 my-4'
  },
    React.createElement('div', {
      className: 'flex-1 h-px ' + (darkMode ? 'bg-gray-700' : 'bg-gray-200')
    }),
    React.createElement('span', {
      className: 'text-xs font-medium ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
    }, formatTime(time)),
    React.createElement('div', {
      className: 'flex-1 h-px ' + (darkMode ? 'bg-gray-700' : 'bg-gray-200')
    })
  );
};

// 🐧 풀 화면 대화창
export var AlfredoFullChat = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var darkMode = props.darkMode;
  var chatHistory = props.chatHistory || [];
  var onSendMessage = props.onSendMessage;
  var userName = props.userName || 'Boss';
  
  var inputState = useState('');
  var inputText = inputState[0];
  var setInputText = inputState[1];
  
  var scrollRef = useRef(null);
  var inputRef = useRef(null);
  
  // 새 메시지 오면 스크롤
  useEffect(function() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  // 열릴 때 입력창 포커스
  useEffect(function() {
    if (isOpen && inputRef.current) {
      setTimeout(function() {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);
  
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
  
  // 시간별 그룹핑
  var groupedMessages = React.useMemo(function() {
    var groups = [];
    var lastHour = null;
    
    chatHistory.forEach(function(msg, idx) {
      var msgTime = new Date(msg.time);
      var hourKey = msgTime.getHours();
      
      // 1시간 단위로 구분선
      if (lastHour !== hourKey) {
        groups.push({ type: 'divider', time: msg.time });
        lastHour = hourKey;
      }
      
      groups.push({ type: 'message', data: msg });
    });
    
    return groups;
  }, [chatHistory]);
  
  if (!isOpen) return null;
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex flex-col ' +
      (darkMode ? 'bg-[#1D1D1F]' : 'bg-[#F5F5F7]')
  },
    // 헤더
    React.createElement('div', {
      className: 'flex items-center gap-3 px-4 py-3 border-b ' +
        (darkMode ? 'border-gray-800 bg-[#2C2C2E]' : 'border-gray-200 bg-white')
    },
      // 뒤로가기
      React.createElement('button', {
        onClick: onClose,
        className: 'p-2 -ml-2 rounded-xl transition-all btn-press ' +
          (darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100')
      },
        React.createElement(ArrowLeft, { 
          size: 20, 
          className: darkMode ? 'text-white' : 'text-gray-900' 
        })
      ),
      
      // 타이틀
      React.createElement('div', { className: 'flex items-center gap-2 flex-1' },
        React.createElement('div', {
          className: 'w-10 h-10 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-lg shadow-lg shadow-[#A996FF]/30'
        }, '🐧'),
        React.createElement('div', null,
          React.createElement('h1', {
            className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold'
          }, '알프레도'),
          React.createElement('p', {
            className: 'text-xs ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
          }, '오늘의 대화')
        )
      )
    ),
    
    // 대화 목록
    React.createElement('div', {
      ref: scrollRef,
      className: 'flex-1 overflow-y-auto px-4 py-4'
    },
      // 빈 상태
      chatHistory.length === 0 && React.createElement('div', {
        className: 'flex flex-col items-center justify-center h-full text-center'
      },
        React.createElement('div', {
          className: 'w-20 h-20 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-4xl mb-4 shadow-xl shadow-[#A996FF]/30'
        }, '🐧'),
        React.createElement('p', {
          className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm'
        }, '오늘 알프레도와의 대화가 여기 기록돼요'),
        React.createElement('p', {
          className: (darkMode ? 'text-gray-600' : 'text-gray-400') + ' text-xs mt-1'
        }, '무엇이든 물어보세요!')
      ),
      
      // 메시지 목록
      groupedMessages.map(function(item, idx) {
        if (item.type === 'divider') {
          return React.createElement(TimeDivider, {
            key: 'divider-' + idx,
            time: item.time,
            darkMode: darkMode
          });
        }
        return React.createElement(ChatMessage, {
          key: 'msg-' + idx,
          message: item.data,
          darkMode: darkMode
        });
      })
    ),
    
    // 입력창
    React.createElement('div', {
      className: 'px-4 py-3 border-t ' +
        (darkMode ? 'border-gray-800 bg-[#2C2C2E]' : 'border-gray-200 bg-white')
    },
      React.createElement('div', {
        className: 'flex items-center gap-2 px-4 py-3 rounded-2xl ' +
          (darkMode ? 'bg-gray-800' : 'bg-gray-100')
      },
        React.createElement('input', {
          ref: inputRef,
          type: 'text',
          value: inputText,
          onChange: function(e) { setInputText(e.target.value); },
          onKeyPress: handleKeyPress,
          placeholder: '알프레도에게 메시지 보내기...',
          className: 'flex-1 bg-transparent outline-none text-sm ' +
            (darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400')
        }),
        React.createElement('button', {
          onClick: handleSend,
          disabled: !inputText.trim(),
          className: 'p-2 rounded-xl transition-all ' +
            (inputText.trim() 
              ? 'bg-[#A996FF] text-white btn-press' 
              : (darkMode ? 'text-gray-600' : 'text-gray-400'))
        },
          React.createElement(Send, { size: 18 })
        )
      ),
      
      // 안전 영역
      React.createElement('div', { className: 'h-safe-bottom' })
    )
  );
};

export default AlfredoFullChat;