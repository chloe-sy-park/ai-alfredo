import React, { useState } from 'react';
import { AlertTriangle, Mail, Phone, CreditCard, Calendar } from 'lucide-react';

// 리마인더 아이콘
var getIcon = function(type) {
  switch (type) {
    case 'email': return Mail;
    case 'call': return Phone;
    case 'payment': return CreditCard;
    case 'deadline': return Calendar;
    default: return AlertTriangle;
  }
};

// 😊 컨디션 이모지
var conditionEmojis = ['', '😫', '😔', '😐', '😊', '🔥'];

// 🔔 오늘 잊지마세요 + 기분 카드
export var TodayRemindersCard = function(props) {
  var darkMode = props.darkMode;
  var reminders = props.reminders || [];
  var urgentCount = props.urgentCount || 0;
  var condition = props.condition || 3;
  var onConditionChange = props.onConditionChange;
  var onReminderClick = props.onReminderClick;
  
  // 기분 선택 모달
  var moodModalState = useState(false);
  var isMoodModalOpen = moodModalState[0];
  var setMoodModalOpen = moodModalState[1];
  
  // 배경색
  var bgClass = darkMode ? 'bg-[#2C2C2E]' : 'bg-white';
  var textColor = darkMode ? 'text-white' : 'text-gray-900';
  var subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', {
    className: 'flex gap-4'
  },
    // 왼쪽: 오늘 잊지마세요
    React.createElement('div', {
      className: bgClass + ' flex-1 rounded-2xl p-4 shadow-lg ' +
        (darkMode ? '' : 'border border-gray-100')
    },
      // 헤더
      React.createElement('div', {
        className: 'flex items-center justify-between mb-3'
      },
        React.createElement('h3', {
          className: textColor + ' font-bold text-base'
        }, '오늘 잊지마세요!'),
        
        urgentCount > 0 && React.createElement('span', {
          className: 'px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white'
        }, '🔥 ' + urgentCount + '건 긴급!')
      ),
      
      // 설명
      React.createElement('p', {
        className: subTextColor + ' text-sm mb-3'
      }, '잊지말아야할것 이거이거고 + 미루면안되는 것'),
      
      // 태그들
      React.createElement('div', {
        className: 'flex flex-wrap gap-2'
      },
        reminders.slice(0, 4).map(function(reminder, idx) {
          return React.createElement('button', {
            key: reminder.id || idx,
            onClick: function() {
              if (onReminderClick) onReminderClick(reminder);
            },
            className: 'px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 ' +
              (darkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
          },
            '[ ' + (reminder.title.length > 6 ? reminder.title.substring(0, 6) + '...' : reminder.title) + ' ]'
          );
        })
      )
    ),
    
    // 오른쪽: Today 기분/에너지
    React.createElement('button', {
      onClick: function() { setMoodModalOpen(true); },
      className: 'w-28 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center ' +
        'bg-gradient-to-br from-amber-100 to-yellow-200 ' +
        'transition-all active:scale-95'
    },
      React.createElement('span', {
        className: 'text-amber-800 font-bold text-sm mb-1'
      }, 'Today'),
      React.createElement('span', {
        className: 'text-amber-700 text-xs mb-2'
      }, '기분/에너지'),
      React.createElement('span', {
        className: 'text-4xl'
      }, conditionEmojis[condition] || '😊')
    ),
    
    // 기분 선택 모달
    isMoodModalOpen && React.createElement('div', {
      className: 'fixed inset-0 z-50 flex items-center justify-center p-4'
    },
      // 백드롭
      React.createElement('div', {
        onClick: function() { setMoodModalOpen(false); },
        className: 'absolute inset-0 bg-black/50 backdrop-blur-sm'
      }),
      
      // 모달
      React.createElement('div', {
        className: (darkMode ? 'bg-[#2C2C2E]' : 'bg-white') + 
          ' relative w-full max-w-sm rounded-3xl shadow-2xl p-6'
      },
        React.createElement('h3', {
          className: textColor + ' font-bold text-lg text-center mb-6'
        }, '오늘 컨디션은 어때요?'),
        
        React.createElement('div', {
          className: 'flex justify-center gap-4'
        },
          [1, 2, 3, 4, 5].map(function(level) {
            var isSelected = condition === level;
            return React.createElement('button', {
              key: level,
              onClick: function() {
                if (onConditionChange) onConditionChange(level);
                setMoodModalOpen(false);
              },
              className: 'w-14 h-14 rounded-2xl text-3xl flex items-center justify-center ' +
                'transition-all active:scale-90 ' +
                (isSelected 
                  ? 'bg-[#A996FF] shadow-lg scale-110'
                  : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'))
            }, conditionEmojis[level]);
          })
        ),
        
        React.createElement('p', {
          className: subTextColor + ' text-center text-sm mt-4'
        }, ['', '아파요', '힘들어요', '보통', '좋아요', '최고!'][condition])
      )
    )
  );
};

export default TodayRemindersCard;
