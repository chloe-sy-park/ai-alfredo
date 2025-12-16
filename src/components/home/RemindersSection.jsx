import React, { useState, useMemo } from 'react';
import { Bell, ChevronDown, ChevronUp, AlertCircle, Mail, Phone, CreditCard, Calendar } from 'lucide-react';

// 리마인더 타입별 스타일
var REMINDER_STYLES = {
  deadline: { emoji: '🔥', label: '마감', color: 'red', icon: AlertCircle },
  email: { emoji: '✉️', label: '메일', color: 'blue', icon: Mail },
  call: { emoji: '📞', label: '연락', color: 'green', icon: Phone },
  payment: { emoji: '💳', label: '결제', color: 'orange', icon: CreditCard },
  event: { emoji: '📅', label: '일정', color: 'purple', icon: Calendar },
  default: { emoji: '📌', label: '할일', color: 'gray', icon: Bell }
};

// 색상 매핑
var getColorClasses = function(color, darkMode) {
  var colors = {
    red: {
      bg: darkMode ? 'bg-red-500/20' : 'bg-red-100',
      text: 'text-red-500',
      ring: 'ring-red-500/30'
    },
    blue: {
      bg: darkMode ? 'bg-blue-500/20' : 'bg-blue-100',
      text: 'text-blue-500',
      ring: 'ring-blue-500/30'
    },
    green: {
      bg: darkMode ? 'bg-green-500/20' : 'bg-green-100',
      text: 'text-green-500',
      ring: 'ring-green-500/30'
    },
    orange: {
      bg: darkMode ? 'bg-orange-500/20' : 'bg-orange-100',
      text: 'text-orange-500',
      ring: 'ring-orange-500/30'
    },
    purple: {
      bg: darkMode ? 'bg-purple-500/20' : 'bg-purple-100',
      text: 'text-purple-500',
      ring: 'ring-purple-500/30'
    },
    gray: {
      bg: darkMode ? 'bg-gray-500/20' : 'bg-gray-100',
      text: 'text-gray-500',
      ring: 'ring-gray-500/30'
    }
  };
  return colors[color] || colors.gray;
};

// 날짜 포맷
var formatDueDate = function(dateStr) {
  if (!dateStr) return null;
  
  var date = new Date(dateStr);
  var now = new Date();
  var diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: Math.abs(diffDays) + '일 지남', urgent: true, overdue: true };
  if (diffDays === 0) return { text: '오늘', urgent: true, overdue: false };
  if (diffDays === 1) return { text: '내일', urgent: true, overdue: false };
  if (diffDays <= 3) return { text: diffDays + '일 후', urgent: true, overdue: false };
  if (diffDays <= 7) return { text: diffDays + '일 후', urgent: false, overdue: false };
  
  return { 
    text: (date.getMonth() + 1) + '/' + date.getDate(), 
    urgent: false, 
    overdue: false 
  };
};

// 🔔 리마인더 섹션
export var RemindersSection = function(props) {
  var reminders = props.reminders || [];
  var darkMode = props.darkMode;
  var onReminderClick = props.onReminderClick;
  var maxVisible = props.maxVisible || 3;
  
  var expandedState = useState(false);
  var isExpanded = expandedState[0];
  var setExpanded = expandedState[1];
  
  // 정렬 및 필터
  var sortedReminders = useMemo(function() {
    return reminders.slice().sort(function(a, b) {
      // 긴급한 것 먼저
      var aDate = a.dueDate ? new Date(a.dueDate) : new Date('2099-12-31');
      var bDate = b.dueDate ? new Date(b.dueDate) : new Date('2099-12-31');
      return aDate - bDate;
    });
  }, [reminders]);
  
  var visibleReminders = isExpanded ? sortedReminders : sortedReminders.slice(0, maxVisible);
  var hasMore = sortedReminders.length > maxVisible;
  
  // 긴급 카운트
  var urgentCount = sortedReminders.filter(function(r) {
    if (!r.dueDate) return false;
    var due = formatDueDate(r.dueDate);
    return due && due.urgent;
  }).length;
  
  if (reminders.length === 0) {
    return null;
  }
  
  return React.createElement('div', {
    className: 'rounded-2xl overflow-hidden shadow-lg ' +
      (darkMode 
        ? 'bg-gradient-to-br from-[#2C2C2E] to-[#1D1D1F]'
        : 'bg-gradient-to-br from-white to-gray-50')
  },
    // 헤더
    React.createElement('div', {
      className: 'px-5 py-3 flex items-center justify-between ' +
        (darkMode 
          ? 'bg-gradient-to-r from-pink-500/20 to-transparent'
          : 'bg-gradient-to-r from-pink-100 to-transparent')
    },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', {
          className: 'w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center'
        },
          React.createElement(Bell, { size: 14, className: 'text-white' })
        ),
        React.createElement('span', {
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold'
        }, '잊지 마세요')
      ),
      // 긴급 카운트
      urgentCount > 0 && React.createElement('div', {
        className: 'px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse-soft'
      }, '🔥 ' + urgentCount + '건 긴급!')
    ),
    
    // 리마인더 목록
    React.createElement('div', { className: 'p-4 space-y-2' },
      visibleReminders.map(function(reminder, idx) {
        var style = REMINDER_STYLES[reminder.type] || REMINDER_STYLES.default;
        var colorClasses = getColorClasses(style.color, darkMode);
        var dueInfo = formatDueDate(reminder.dueDate);
        
        return React.createElement('button', {
          key: reminder.id || idx,
          onClick: function() { if (onReminderClick) onReminderClick(reminder); },
          className: 'w-full flex items-center gap-3 p-3 rounded-xl transition-all btn-press text-left ' +
            (dueInfo && dueInfo.overdue 
              ? (darkMode ? 'bg-red-500/10 ring-1 ring-red-500/30' : 'bg-red-50 ring-1 ring-red-200')
              : (dueInfo && dueInfo.urgent)
                ? (darkMode ? 'bg-orange-500/10' : 'bg-orange-50')
                : (darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'))
        },
          // 아이콘
          React.createElement('div', {
            className: 'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ' + colorClasses.bg
          },
            React.createElement('span', { className: 'text-lg' }, style.emoji)
          ),
          
          // 내용
          React.createElement('div', { className: 'flex-1 min-w-0' },
            React.createElement('p', {
              className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-medium text-sm truncate'
            }, reminder.title),
            
            // 메타 정보
            React.createElement('div', { className: 'flex items-center gap-2 mt-0.5' },
              React.createElement('span', {
                className: colorClasses.text + ' text-xs'
              }, style.label),
              
              dueInfo && React.createElement('span', {
                className: (dueInfo.overdue 
                  ? 'text-red-500' 
                  : dueInfo.urgent 
                    ? 'text-orange-500' 
                    : (darkMode ? 'text-gray-500' : 'text-gray-400')) + ' text-xs'
              }, dueInfo.overdue ? '⚠️ ' + dueInfo.text : dueInfo.text)
            )
          ),
          
          // 화살표
          React.createElement('div', {
            className: 'text-gray-400'
          }, '›')
        );
      }),
      
      // 더보기/접기 버튼
      hasMore && React.createElement('button', {
        onClick: function() { setExpanded(!isExpanded); },
        className: 'w-full flex items-center justify-center gap-1 py-2 mt-2 rounded-xl transition-all btn-press ' +
          (darkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-100 text-gray-400')
      },
        React.createElement('span', { className: 'text-sm' }, 
          isExpanded ? '접기' : (sortedReminders.length - maxVisible) + '개 더보기'
        ),
        isExpanded 
          ? React.createElement(ChevronUp, { size: 14 })
          : React.createElement(ChevronDown, { size: 14 })
      )
    )
  );
};

export default RemindersSection;
