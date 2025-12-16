import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

// 리마인더 타입별 스타일
var REMINDER_STYLES = {
  payment: { emoji: '💳', label: '결제' },
  email: { emoji: '✉️', label: '메일' },
  call: { emoji: '📱', label: '연락' },
  birthday: { emoji: '🎂', label: '생일' },
  meeting: { emoji: '🤝', label: '미팅' },
  health: { emoji: '💊', label: '건강' },
  deadline: { emoji: '⏰', label: '마감' },
  default: { emoji: '📌', label: '일반' }
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
    return { text: Math.abs(diffDays) + '일 지남', isOverdue: true, isPast: true };
  } else if (diffDays === 0) {
    return { text: '오늘!', isOverdue: true, isPast: false };
  } else if (diffDays === 1) {
    return { text: '내일', isOverdue: true, isPast: false };
  } else if (diffDays <= 3) {
    return { text: 'D-' + diffDays, isOverdue: true, isPast: false };
  } else if (diffDays <= 7) {
    return { text: 'D-' + diffDays, isOverdue: false, isPast: false };
  } else {
    return { text: diffDays + '일 후', isOverdue: false, isPast: false };
  }
};

// 경과일 계산
var getElapsedText = function(lastCompleted) {
  if (!lastCompleted) return null;
  
  var now = new Date();
  var last = new Date(lastCompleted);
  var diffTime = now - last;
  var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '오늘 함';
  if (diffDays === 1) return '어제';
  if (diffDays <= 7) return diffDays + '일 전';
  return Math.floor(diffDays / 7) + '주 전';
};

// 리마인더 아이템 - 시각적 강화
var ReminderItem = function(props) {
  var reminder = props.reminder;
  var darkMode = props.darkMode;
  var onClick = props.onClick;
  var index = props.index || 0;
  
  var style = REMINDER_STYLES[reminder.type] || REMINDER_STYLES.default;
  var ddayInfo = reminder.dueDate ? getDdayText(reminder.dueDate) : null;
  var elapsedText = reminder.lastCompleted ? getElapsedText(reminder.lastCompleted) : null;
  
  var badgeText = ddayInfo ? ddayInfo.text : elapsedText;
  var isUrgent = ddayInfo && ddayInfo.isOverdue;
  var isPast = ddayInfo && ddayInfo.isPast;
  
  // 배경색 결정
  var getBgColor = function() {
    if (isUrgent && !isPast) return darkMode ? 'bg-[#A996FF]/10' : 'bg-[#A996FF]/5';
    if (isPast) return darkMode ? 'bg-orange-500/10' : 'bg-orange-50';
    return darkMode ? 'bg-[#3A3A3C]' : 'bg-white';
  };
  
  var delayClass = index === 0 ? '' : index === 1 ? 'animate-delay-100' : index === 2 ? 'animate-delay-200' : 'animate-delay-300';
  
  return React.createElement('button', {
    onClick: function() { if (onClick) onClick(reminder); },
    className: 'w-full flex items-center gap-3 p-3 md:p-4 min-h-[56px] rounded-xl ' +
      'transition-all active:scale-[0.98] shadow-sm hover:shadow-md animate-fadeInUp ' + delayClass + ' ' +
      getBgColor() +
      (isUrgent && !isPast ? ' ring-1 ring-[#A996FF]/30' : '') +
      (isPast ? ' ring-1 ring-orange-300/30' : '')
  },
    // 이모지 with 배경
    React.createElement('div', { 
      className: 'w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ' +
        (isPast 
          ? (darkMode ? 'bg-orange-500/20' : 'bg-orange-100')
          : isUrgent 
            ? (darkMode ? 'bg-[#A996FF]/20' : 'bg-[#A996FF]/10')
            : (darkMode ? 'bg-[#48484A]' : 'bg-gray-100'))
    }, style.emoji),
    
    // 텍스트
    React.createElement('div', { className: 'flex-1 min-w-0 text-left' },
      React.createElement('p', { 
        className: 'font-semibold truncate text-sm md:text-base ' +
          (isPast 
            ? 'text-orange-500'
            : isUrgent 
              ? 'text-[#A996FF]'
              : (darkMode ? 'text-white' : 'text-gray-900'))
      }, reminder.title),
      React.createElement('p', { 
        className: 'text-xs mt-0.5 ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
      }, style.label)
    ),
    
    // 뱃지
    badgeText && React.createElement('span', { 
      className: 'flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ' +
        (isPast 
          ? 'bg-orange-100 text-orange-600' 
          : isUrgent
            ? 'bg-[#A996FF]/20 text-[#A996FF]'
            : (darkMode 
                ? 'bg-[#48484A] text-gray-400' 
                : 'bg-gray-100 text-gray-500'))
    }, badgeText),
    
    // 화살표
    React.createElement(ChevronRight, { 
      size: 18, 
      className: 'flex-shrink-0 ' + (darkMode ? 'text-gray-600' : 'text-gray-300')
    })
  );
};

// ⚠️ 잊지 마세요 섹션 - 카드형 레이아웃
export var RemindersSection = function(props) {
  var reminders = props.reminders || [];
  var darkMode = props.darkMode;
  var onReminderClick = props.onReminderClick;
  
  var expandedState = useState(false);
  var isExpanded = expandedState[0];
  var setExpanded = expandedState[1];
  
  if (reminders.length === 0) return null;
  
  var visibleReminders = isExpanded ? reminders : reminders.slice(0, 3);
  var hasMore = reminders.length > 3;
  
  // 긴급 건수
  var urgentCount = reminders.filter(function(r) {
    if (!r.dueDate) return false;
    var info = getDdayText(r.dueDate);
    return info && info.isOverdue;
  }).length;
  
  return React.createElement('div', { 
    className: 'rounded-2xl md:rounded-3xl overflow-hidden shadow-lg animate-fadeIn ' +
      (darkMode ? 'bg-[#2C2C2E]' : 'bg-white')
  },
    // 헤더 - 그라데이션 배경
    React.createElement('div', { 
      className: 'flex items-center justify-between p-4 md:p-5 pb-3 ' +
        (darkMode ? 'bg-gradient-to-r from-[#3A3A3C] to-[#2C2C2E]' : 'bg-gradient-to-r from-amber-50 to-white')
    },
      React.createElement('div', { className: 'flex items-center gap-3' },
        // 아이콘 with 배경
        React.createElement('div', { 
          className: 'w-10 h-10 rounded-xl flex items-center justify-center ' +
            (darkMode ? 'bg-amber-500/20' : 'bg-amber-100')
        },
          React.createElement(Bell, { size: 20, className: 'text-amber-500' })
        ),
        React.createElement('div', null,
          React.createElement('h2', { 
            className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold text-base md:text-lg'
          }, '잊지 마세요'),
          React.createElement('p', { 
            className: 'text-xs ' + (darkMode ? 'text-gray-400' : 'text-gray-500')
          }, 
            urgentCount > 0 
              ? '🔥 ' + urgentCount + '건 긴급!'
              : reminders.length + '건의 리마인더'
          )
        )
      ),
      
      // 카운트 뱃지
      React.createElement('span', { 
        className: 'px-3 py-1.5 rounded-full text-sm font-bold ' +
          (urgentCount > 0 
            ? 'bg-[#A996FF] text-white shadow-lg shadow-[#A996FF]/30'
            : (darkMode ? 'bg-[#3A3A3C] text-gray-300' : 'bg-gray-100 text-gray-600'))
      }, reminders.length)
    ),
    
    // 리마인더 목록
    React.createElement('div', { className: 'p-3 md:p-4 pt-2 space-y-2' },
      visibleReminders.map(function(reminder, idx) {
        return React.createElement(ReminderItem, {
          key: reminder.id || idx,
          reminder: reminder,
          darkMode: darkMode,
          onClick: onReminderClick,
          index: idx
        });
      })
    ),
    
    // 더보기/접기
    hasMore && React.createElement('div', { className: 'px-4 pb-4 pt-0' },
      React.createElement('button', {
        onClick: function() { setExpanded(!isExpanded); },
        className: 'w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] ' +
          'text-sm font-medium rounded-xl transition-colors btn-press ' +
          (darkMode 
            ? 'text-gray-400 hover:bg-white/5' 
            : 'text-gray-500 hover:bg-black/5')
      }, 
        isExpanded ? '접기' : (reminders.length - 3) + '개 더보기',
        isExpanded 
          ? React.createElement(ChevronUp, { size: 16 })
          : React.createElement(ChevronDown, { size: 16 })
      )
    )
  );
};

export default RemindersSection;
