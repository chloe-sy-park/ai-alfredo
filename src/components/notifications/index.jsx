import React, { useState, useEffect } from 'react';
import { 
  X, Bell, Clock, Calendar, Target, CheckCircle2, 
  ChevronRight, AlertCircle, Zap
} from 'lucide-react';

// NOTIFICATION_PRIORITY 상수 정의 - useSmartNotifications와 동일한 숫자 타입
var NOTIFICATION_PRIORITY = {
  URGENT: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4
};

var SmartNotificationToast = function(props) {
  var notifications = props.notifications || [];
  var onDismiss = props.onDismiss;
  var onAction = props.onAction;
  var darkMode = props.darkMode || false;
  var maxShow = props.maxShow || 2;
  
  var visibleNotifications = notifications.slice(0, maxShow);
  
  if (visibleNotifications.length === 0) return null;
  
  var colorMap = {
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
  };
  
  if (darkMode) {
    colorMap = {
      red: { bg: 'bg-red-900/30', border: 'border-red-800', text: 'text-red-300' },
      orange: { bg: 'bg-orange-900/30', border: 'border-orange-800', text: 'text-orange-300' },
      yellow: { bg: 'bg-yellow-900/30', border: 'border-yellow-800', text: 'text-yellow-300' },
      blue: { bg: 'bg-blue-900/30', border: 'border-blue-800', text: 'text-blue-300' },
      purple: { bg: 'bg-purple-900/30', border: 'border-purple-800', text: 'text-purple-300' },
      teal: { bg: 'bg-teal-900/30', border: 'border-teal-800', text: 'text-teal-300' },
    };
  }
  
  return React.createElement('div', { className: 'fixed top-4 left-4 right-4 z-50 space-y-2' },
    visibleNotifications.map(function(notification, index) {
      var colors = colorMap[notification.color] || colorMap.blue;
      
      return React.createElement('div', {
        key: notification.id,
        className: colors.bg + ' ' + colors.border + ' border rounded-xl p-3 shadow-lg backdrop-blur-sm',
        style: { animation: 'slideInFromTop 0.3s ease-out forwards', animationDelay: (index * 100) + 'ms' }
      },
        React.createElement('div', { className: 'flex items-start gap-3' },
          React.createElement('span', { className: 'text-xl shrink-0' }, notification.icon),
          React.createElement('div', { className: 'flex-1 min-w-0' },
            React.createElement('p', { className: 'font-semibold text-sm ' + colors.text }, notification.title),
            React.createElement('p', { className: 'text-xs truncate ' + (darkMode ? 'text-gray-400' : 'text-gray-600') },
              notification.message
            )
          ),
          React.createElement('button', {
            onClick: function() { if (onDismiss) onDismiss(notification.id); },
            className: 'p-1 hover:bg-black/10 rounded ' + (darkMode ? 'text-gray-400' : 'text-gray-500')
          },
            React.createElement(X, { size: 14 })
          )
        ),
        
        notification.action && React.createElement('button', {
          onClick: function() { if (onAction) onAction(notification.action, notification); },
          className: 'mt-2 w-full py-2 rounded-lg text-xs font-semibold bg-white/50 hover:bg-white/80 transition-colors ' + colors.text
        }, notification.action.label)
      );
    }),
    
    notifications.length > maxShow && React.createElement('div', {
      className: 'text-center text-xs ' + (darkMode ? 'text-gray-400' : 'text-gray-500')
    }, '+' + (notifications.length - maxShow) + '개 더'),
    
    React.createElement('style', null,
      '@keyframes slideInFromTop { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }'
    )
  );
};

// 알림 센터 컴포넌트 (전체 알림 목록)
var NotificationCenter = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var notifications = props.notifications || [];
  var onDismiss = props.onDismiss;
  var onDismissAll = props.onDismissAll;
  var onAction = props.onAction;
  var darkMode = props.darkMode || false;
  
  if (!isOpen) return null;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 알림 그룹화 - 숫자 priority 비교
  var grouped = {
    urgent: notifications.filter(function(n) { return n.priority === NOTIFICATION_PRIORITY.URGENT; }),
    today: notifications.filter(function(n) { return n.priority === NOTIFICATION_PRIORITY.HIGH || n.priority === NOTIFICATION_PRIORITY.MEDIUM; }),
    other: notifications.filter(function(n) { return n.priority === NOTIFICATION_PRIORITY.LOW; }),
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 backdrop-blur-sm',
    onClick: onClose
  },
    React.createElement('div', {
      onClick: function(e) { e.stopPropagation(); },
      className: cardBg + ' w-full max-w-md mx-4 rounded-2xl shadow-2xl max-h-[70vh] overflow-hidden flex flex-col'
    },
      // 헤더
      React.createElement('div', { className: 'p-4 border-b ' + (darkMode ? 'border-gray-700' : 'border-gray-200') + ' flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(Bell, { size: 20, className: 'text-[#A996FF]' }),
          React.createElement('h2', { className: 'font-bold ' + textPrimary }, '알림'),
          notifications.length > 0 && React.createElement('span', {
            className: 'px-2 py-0.5 bg-[#A996FF] text-white text-xs rounded-full'
          }, notifications.length)
        ),
        React.createElement('div', { className: 'flex items-center gap-2' },
          notifications.length > 0 && React.createElement('button', {
            onClick: onDismissAll,
            className: 'text-xs hover:text-[#A996FF] ' + textSecondary
          }, '모두 지우기'),
          React.createElement('button', { onClick: onClose, className: 'p-1 ' + textSecondary },
            React.createElement(X, { size: 20 })
          )
        )
      ),
      
      // 알림 목록
      React.createElement('div', { className: 'flex-1 overflow-y-auto p-4 space-y-4' },
        notifications.length === 0 ? 
          React.createElement('div', { className: 'text-center py-8' },
            React.createElement('span', { className: 'text-4xl' }, '🔔'),
            React.createElement('p', { className: 'mt-2 ' + textSecondary }, '새로운 알림이 없어요')
          ) :
          React.createElement(React.Fragment, null,
            // 긴급
            grouped.urgent.length > 0 && React.createElement('div', null,
              React.createElement('p', { className: 'text-xs font-semibold text-red-500 mb-2' }, '🔴 긴급'),
              React.createElement('div', { className: 'space-y-2' },
                grouped.urgent.map(function(n) {
                  return React.createElement(NotificationItem, {
                    key: n.id,
                    notification: n,
                    onDismiss: onDismiss,
                    onAction: onAction,
                    darkMode: darkMode
                  });
                })
              )
            ),
            
            // 오늘
            grouped.today.length > 0 && React.createElement('div', null,
              React.createElement('p', { className: 'text-xs font-semibold mb-2 ' + textSecondary }, '📅 오늘'),
              React.createElement('div', { className: 'space-y-2' },
                grouped.today.map(function(n) {
                  return React.createElement(NotificationItem, {
                    key: n.id,
                    notification: n,
                    onDismiss: onDismiss,
                    onAction: onAction,
                    darkMode: darkMode
                  });
                })
              )
            ),
            
            // 기타
            grouped.other.length > 0 && React.createElement('div', null,
              React.createElement('p', { className: 'text-xs font-semibold mb-2 ' + textSecondary }, '💡 참고'),
              React.createElement('div', { className: 'space-y-2' },
                grouped.other.map(function(n) {
                  return React.createElement(NotificationItem, {
                    key: n.id,
                    notification: n,
                    onDismiss: onDismiss,
                    onAction: onAction,
                    darkMode: darkMode
                  });
                })
              )
            )
          )
      )
    )
  );
};

// 알림 아이템 컴포넌트
var NotificationItem = function(props) {
  var notification = props.notification;
  var onDismiss = props.onDismiss;
  var onAction = props.onAction;
  var darkMode = props.darkMode;
  
  var textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var itemBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  
  return React.createElement('div', { className: itemBg + ' rounded-xl p-3' },
    React.createElement('div', { className: 'flex items-start gap-3' },
      React.createElement('span', { className: 'text-lg' }, notification.icon),
      React.createElement('div', { className: 'flex-1 min-w-0' },
        React.createElement('p', { className: 'font-medium text-sm ' + textPrimary }, notification.title),
        React.createElement('p', { className: 'text-xs truncate ' + textSecondary }, notification.message)
      ),
      React.createElement('button', {
        onClick: function() { if (onDismiss) onDismiss(notification.id); },
        className: textSecondary + ' p-1 rounded ' + (darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200')
      },
        React.createElement(X, { size: 14 })
      )
    ),
    notification.action && React.createElement('button', {
      onClick: function() { if (onAction) onAction(notification.action, notification); },
      className: 'mt-2 w-full py-2 bg-[#A996FF]/20 text-[#A996FF] rounded-lg text-xs font-semibold hover:bg-[#A996FF]/30 transition-colors'
    }, notification.action.label)
  );
};

export { SmartNotificationToast, NotificationCenter, NotificationItem, NOTIFICATION_PRIORITY };
