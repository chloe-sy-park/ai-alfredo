import React, { useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

// 리마인더 타입별 이모지
var REMINDER_EMOJIS = {
  payment: '💰',
  email: '📧',
  call: '📞',
  birthday: '🎂',
  meeting: '🤝',
  health: '💊',
  default: '📌'
};

// D-day 계산
var getDdayText = function(dueDate) {
  if (!dueDate) return null;
  
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  var diffTime = due - now;
  var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { text: Math.abs(diffDays) + '일째', isOverdue: true, isPast: true };
  } else if (diffDays === 0) {
    return { text: 'D-Day', isOverdue: true, isPast: false };
  } else if (diffDays === 1) {
    return { text: 'D-1', isOverdue: true, isPast: false };
  } else if (diffDays <= 3) {
    return { text: 'D-' + diffDays, isOverdue: true, isPast: false };
  } else if (diffDays <= 7) {
    return { text: 'D-' + diffDays, isOverdue: false, isPast: false };
  } else {
    return { text: diffDays + '일 전', isOverdue: false, isPast: false };
  }
};

// 경과일 계산 (마지막 완료일 기준)
var getElapsedText = function(lastCompleted) {
  if (!lastCompleted) return null;
  
  var now = new Date();
  var last = new Date(lastCompleted);
  var diffTime = now - last;
  var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  return diffDays + '일 전';
};

// 리마인더 아이템 - 반응형
var ReminderItem = function(props) {
  var reminder = props.reminder;
  var darkMode = props.darkMode;
  var onClick = props.onClick;
  var index = props.index || 0;
  
  var emoji = REMINDER_EMOJIS[reminder.type] || REMINDER_EMOJIS.default;
  var ddayInfo = reminder.dueDate ? getDdayText(reminder.dueDate) : null;
  var elapsedText = reminder.lastCompleted ? getElapsedText(reminder.lastCompleted) : null;
  
  // 표시할 뱃지 텍스트
  var badgeText = ddayInfo ? ddayInfo.text : elapsedText;
  var isUrgent = ddayInfo && ddayInfo.isOverdue;
  var isPast = ddayInfo && ddayInfo.isPast;
  
  // 애니메이션 딜레이
  var delayClass = index === 0 ? '' : index === 1 ? 'animate-delay-100' : index === 2 ? 'animate-delay-200' : 'animate-delay-300';
  
  return React.createElement('button', {
    onClick: function() { if (onClick) onClick(reminder); },
    // 터치 타겟 48px+ 보장
    className: 'w-full flex items-center gap-3 p-3 md:p-4 min-h-[56px] rounded-xl md:rounded-2xl transition-all active:scale-[0.98] ' +
      'animate-fadeInUp ' + delayClass + ' card-hover ' +
      (darkMode 
        ? 'bg-[#2C2C2E] hover:bg-[#3A3A3C]' 
        : 'bg-white hover:bg-gray-50') +
      ' shadow-sm'
  },
    // 이모지
    React.createElement('span', { className: 'text-xl flex-shrink-0' }, emoji),
    
    // 텍스트 - 말줄임 처리
    React.createElement('span', { 
      className: 'flex-1 text-left font-medium text-sm md:text-base truncate ' +
        (isUrgent 
          ? (isPast ? 'text-orange-500' : 'text-[#A996FF]')
          : (darkMode ? 'text-white' : 'text-gray-900'))
    }, reminder.title),
    
    // 뱃지
    badgeText && React.createElement('span', { 
      className: 'px-2 md:px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ' +
        (isUrgent 
          ? (isPast 
              ? 'bg-orange-100 text-orange-600' 
              : 'bg-[#A996FF]/20 text-[#A996FF]')
          : (darkMode 
              ? 'bg-[#3A3A3C] text-gray-400' 
              : 'bg-gray-100 text-gray-500'))
    }, badgeText),
    
    // 화살표
    React.createElement(ChevronRight, { 
      size: 18, 
      className: (darkMode ? 'text-gray-600' : 'text-gray-300') + ' flex-shrink-0'
    })
  );
};

// ⚠️ 잊지 마세요 섹션 - 반응형
export var RemindersSection = function(props) {
  var reminders = props.reminders || [];
  var darkMode = props.darkMode;
  var onReminderClick = props.onReminderClick;
  var onShowAll = props.onShowAll;
  
  var expandedState = useState(false);
  var isExpanded = expandedState[0];
  var setExpanded = expandedState[1];
  
  if (reminders.length === 0) return null;
  
  // 표시할 리마인더 (펼치면 전부, 접으면 3개)
  var visibleReminders = isExpanded ? reminders : reminders.slice(0, 3);
  var hasMore = reminders.length > 3;
  
  return React.createElement('div', { className: 'animate-fadeIn' },
    // 섹션 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-3 px-1' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(AlertTriangle, { 
          size: 18, 
          className: 'text-amber-500' 
        }),
        React.createElement('h2', { 
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold text-base md:text-lg'
        }, '잊지 마세요'),
        React.createElement('span', { 
          className: 'px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-600'
        }, reminders.length)
      ),
      
      // 터치 타겟 44px
      hasMore && React.createElement('button', {
        onClick: function() { setExpanded(!isExpanded); },
        className: 'text-sm font-medium text-[#A996FF] p-2 -mr-2 min-h-[44px] btn-press'
      }, isExpanded ? '접기' : '전체보기')
    ),
    
    // 리마인더 목록
    React.createElement('div', { className: 'space-y-2' },
      visibleReminders.map(function(reminder, idx) {
        return React.createElement(ReminderItem, {
          key: reminder.id || idx,
          reminder: reminder,
          darkMode: darkMode,
          onClick: onReminderClick,
          index: idx
        });
      })
    )
  );
};

export default RemindersSection;
