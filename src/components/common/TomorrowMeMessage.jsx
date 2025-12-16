import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Sun, Moon, ChevronRight, Edit3 } from 'lucide-react';

// localStorage 키
var STORAGE_KEY = 'lifebutler_tomorrow_messages';

// 메시지 로드
function loadMessages() {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load tomorrow messages:', e);
  }
  return [];
}

// 메시지 저장
function saveMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.warn('Failed to save tomorrow messages:', e);
  }
}

// 🌙 "내일의 나에게" 메시지 작성 모달
export var TomorrowMeWriteModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var darkMode = props.darkMode;
  var userName = props.userName || 'Boss';
  
  var messageState = useState('');
  var message = messageState[0];
  var setMessage = messageState[1];
  
  var moodState = useState('hopeful'); // hopeful, gentle, determined
  var selectedMood = moodState[0];
  var setSelectedMood = moodState[1];
  
  if (!isOpen) return null;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var inputBg = darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';
  
  var moods = [
    { id: 'hopeful', emoji: '🌟', label: '희망찬' },
    { id: 'gentle', emoji: '🤗', label: '부드러운' },
    { id: 'determined', emoji: '💪', label: '의지 넘치는' }
  ];
  
  var prompts = [
    '내일 꼭 해보고 싶은 한 가지가 있어...',
    '오늘 힘들었지만, 내일은...',
    '내일의 나에게 해주고 싶은 말이 있어',
    '내일 아침에 일어나면 가장 먼저...',
    '힘들면 이것만 기억해줘...'
  ];
  
  var randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  
  var handleSend = function() {
    if (!message.trim()) return;
    
    var messages = loadMessages();
    var newMessage = {
      id: 'msg-' + Date.now(),
      text: message.trim(),
      mood: selectedMood,
      createdAt: new Date().toISOString(),
      targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 내일 날짜
      read: false
    };
    
    messages.push(newMessage);
    saveMessages(messages);
    
    setMessage('');
    onClose();
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: cardBg + ' rounded-3xl p-6 max-w-sm w-full shadow-2xl',
      onClick: function(e) { e.stopPropagation(); }
    },
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(Moon, { size: 20, className: 'text-indigo-400' }),
          React.createElement('h3', { className: textPrimary + ' text-lg font-bold' }, '내일의 나에게')
        ),
        React.createElement('button', { onClick: onClose, className: textSecondary },
          React.createElement(X, { size: 20 })
        )
      ),
      
      // 설명
      React.createElement('p', { className: textSecondary + ' text-sm mb-4' },
        '🐧 보스, 내일 아침의 나에게 한마디 남겨볼까요?'
      ),
      
      // 기분 선택
      React.createElement('div', { className: 'flex gap-2 mb-4' },
        moods.map(function(m) {
          var isSelected = selectedMood === m.id;
          return React.createElement('button', {
            key: m.id,
            onClick: function() { setSelectedMood(m.id); },
            className: 'flex-1 flex flex-col items-center p-3 rounded-xl transition-all ' +
              (isSelected 
                ? 'bg-[#A996FF]/20 ring-2 ring-[#A996FF]' 
                : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'))
          },
            React.createElement('span', { className: 'text-xl' }, m.emoji),
            React.createElement('span', { className: textSecondary + ' text-xs mt-1' }, m.label)
          );
        })
      ),
      
      // 메시지 입력
      React.createElement('div', { className: 'mb-4' },
        React.createElement('textarea', {
          value: message,
          onChange: function(e) { setMessage(e.target.value); },
          placeholder: randomPrompt,
          rows: 4,
          className: inputBg + ' border rounded-xl px-4 py-3 w-full outline-none focus:ring-2 focus:ring-[#A996FF] ' + textPrimary + ' resize-none'
        })
      ),
      
      // 전송 버튼
      React.createElement('button', {
        onClick: handleSend,
        disabled: !message.trim(),
        className: 'w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg'
      },
        React.createElement(Send, { size: 18 }),
        '내일의 나에게 보내기'
      )
    )
  );
};

// ☀️ "어제의 나로부터" 메시지 카드 (아침에 표시)
export var YesterdayMeCard = function(props) {
  var darkMode = props.darkMode;
  var onDismiss = props.onDismiss;
  var onReply = props.onReply;
  
  var messageState = useState(null);
  var todayMessage = messageState[0];
  var setTodayMessage = messageState[1];
  
  // 오늘 날짜의 메시지 찾기
  useEffect(function() {
    var messages = loadMessages();
    var today = new Date().toISOString().slice(0, 10);
    
    var unreadMessage = messages.find(function(m) {
      return m.targetDate === today && !m.read;
    });
    
    if (unreadMessage) {
      setTodayMessage(unreadMessage);
    }
  }, []);
  
  if (!todayMessage) return null;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var moodEmojis = {
    hopeful: '🌟',
    gentle: '🤗',
    determined: '💪'
  };
  
  var handleDismiss = function() {
    // 읽음 처리
    var messages = loadMessages();
    var updated = messages.map(function(m) {
      if (m.id === todayMessage.id) {
        return Object.assign({}, m, { read: true });
      }
      return m;
    });
    saveMessages(updated);
    setTodayMessage(null);
    if (onDismiss) onDismiss();
  };
  
  return React.createElement('div', { 
    className: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl p-4 mb-4 border border-amber-500/30'
  },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Sun, { size: 18, className: 'text-amber-500' }),
        React.createElement('span', { className: textPrimary + ' font-bold text-sm' }, '어제의 나로부터 💌')
      ),
      React.createElement('button', {
        onClick: handleDismiss,
        className: textSecondary + ' text-xs'
      }, '확인')
    ),
    
    // 메시지
    React.createElement('div', { className: 'flex gap-3' },
      React.createElement('span', { className: 'text-2xl' }, moodEmojis[todayMessage.mood] || '💜'),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('p', { className: textPrimary + ' text-sm leading-relaxed' }, 
          '"' + todayMessage.text + '"'
        ),
        React.createElement('p', { className: textSecondary + ' text-xs mt-2' }, 
          '— 어제 밤의 나'
        )
      )
    ),
    
    // 답장 버튼 (선택적)
    onReply && React.createElement('button', {
      onClick: onReply,
      className: 'mt-3 w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2'
    },
      React.createElement(Edit3, { size: 14 }),
      '오늘의 나도 한마디'
    )
  );
};

// 🌙 미니 "내일의 나에게" 버튼 (저녁 시간대에 표시)
export var TomorrowMeButton = function(props) {
  var darkMode = props.darkMode;
  var onClick = props.onClick;
  
  // 저녁 시간대 체크 (18시~23시)
  var hour = new Date().getHours();
  var isEvening = hour >= 18 && hour < 24;
  
  if (!isEvening) return null;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  return React.createElement('button', {
    onClick: onClick,
    className: cardBg + ' rounded-2xl p-4 mb-4 border ' + borderColor + ' w-full flex items-center justify-between hover:border-indigo-500/50 transition-all group'
  },
    React.createElement('div', { className: 'flex items-center gap-3' },
      React.createElement('div', { className: 'w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center' },
        React.createElement(Moon, { size: 20, className: 'text-indigo-400' })
      ),
      React.createElement('div', { className: 'text-left' },
        React.createElement('p', { className: textPrimary + ' font-medium text-sm' }, '내일의 나에게 한마디'),
        React.createElement('p', { className: textSecondary + ' text-xs' }, '🐧 오늘 하루를 마무리하며...')
      )
    ),
    React.createElement(ChevronRight, { 
      size: 18, 
      className: textSecondary + ' group-hover:text-indigo-400 transition-colors' 
    })
  );
};

// 📊 메시지 히스토리 (더보기 페이지용)
export var TomorrowMeHistory = function(props) {
  var darkMode = props.darkMode;
  
  var messagesState = useState([]);
  var messages = messagesState[0];
  var setMessages = messagesState[1];
  
  useEffect(function() {
    setMessages(loadMessages().reverse().slice(0, 10)); // 최근 10개
  }, []);
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var moodEmojis = {
    hopeful: '🌟',
    gentle: '🤗',
    determined: '💪'
  };
  
  if (messages.length === 0) {
    return React.createElement('div', { className: cardBg + ' rounded-2xl p-6 border ' + borderColor + ' text-center' },
      React.createElement('span', { className: 'text-4xl block mb-3' }, '🌙'),
      React.createElement('p', { className: textPrimary + ' font-medium mb-1' }, '아직 메시지가 없어요'),
      React.createElement('p', { className: textSecondary + ' text-sm' }, '저녁에 내일의 나에게 한마디 남겨보세요!')
    );
  }
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    React.createElement('h3', { className: textPrimary + ' font-bold mb-3 flex items-center gap-2' },
      React.createElement(Sparkles, { size: 18, className: 'text-[#A996FF]' }),
      '나에게 보낸 메시지들'
    ),
    React.createElement('div', { className: 'space-y-3' },
      messages.map(function(msg) {
        var date = new Date(msg.createdAt);
        var dateStr = (date.getMonth() + 1) + '/' + date.getDate();
        
        return React.createElement('div', {
          key: msg.id,
          className: 'p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50')
        },
          React.createElement('div', { className: 'flex items-start gap-2' },
            React.createElement('span', { className: 'text-lg' }, moodEmojis[msg.mood] || '💜'),
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement('p', { className: textPrimary + ' text-sm' }, msg.text),
              React.createElement('p', { className: textSecondary + ' text-xs mt-1' }, dateStr + ' 밤')
            )
          )
        );
      })
    )
  );
};

export default {
  TomorrowMeWriteModal: TomorrowMeWriteModal,
  YesterdayMeCard: YesterdayMeCard,
  TomorrowMeButton: TomorrowMeButton,
  TomorrowMeHistory: TomorrowMeHistory
};
