// NotificationToast - 알림 토스트 컴포넌트
import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

function NotificationToast(props) {
  var message = props.message;
  var type = props.type || 'info';
  var onClose = props.onClose;
  
  var icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info
  };
  
  var colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  var iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };
  
  var Icon = icons[type] || Info;
  var colorClass = colors[type] || colors.info;
  var iconColor = iconColors[type] || iconColors.info;
  
  return React.createElement('div', {
    className: 'fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-slide-down'
  },
    React.createElement('div', {
      className: 'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ' + colorClass
    },
      React.createElement(Icon, { size: 20, className: iconColor }),
      React.createElement('span', { className: 'flex-1 text-sm font-medium' }, message),
      onClose && React.createElement('button', {
        onClick: onClose,
        className: 'p-1 hover:bg-black/5 rounded-full transition-colors'
      },
        React.createElement(X, { size: 16 })
      )
    )
  );
}

export default NotificationToast;
