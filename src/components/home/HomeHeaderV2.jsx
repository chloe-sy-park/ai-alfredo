import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Snowflake, Bell, Star } from 'lucide-react';

// 날씨 아이콘
var WeatherIcon = function(props) {
  var condition = props.condition || '';
  var size = props.size || 18;
  
  if (condition.includes('rain') || condition.includes('비')) {
    return React.createElement(CloudRain, { size: size, className: 'text-blue-400' });
  }
  if (condition.includes('snow') || condition.includes('눈')) {
    return React.createElement(Snowflake, { size: size, className: 'text-blue-200' });
  }
  if (condition.includes('cloud') || condition.includes('구름')) {
    return React.createElement(Cloud, { size: size, className: 'text-gray-400' });
  }
  return React.createElement(Sun, { size: size, className: 'text-amber-400' });
};

// 알림 모달
var NotificationsModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var notifications = props.notifications || [];
  
  if (!isOpen) return null;
  
  var sampleNotifications = notifications.length > 0 ? notifications : [
    { id: 1, type: 'reminder', title: '팀 미팅 30분 전', time: '10분 전', icon: '📅' },
    { id: 2, type: 'task', title: '기획서 마감 D-1', time: '1시간 전', icon: '⚠️' },
    { id: 3, type: 'care', title: '물 마실 시간이에요', time: '2시간 전', icon: '💧' }
  ];
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-[60] flex items-start justify-center md:justify-end p-4 pt-20',
    onClick: onClose
  },
    React.createElement('div', { 
      className: 'absolute inset-0 bg-black/20' 
    }),
    React.createElement('div', {
      className: 'bg-white w-full max-w-sm md:mr-4 rounded-2xl shadow-2xl overflow-hidden relative',
      onClick: function(e) { e.stopPropagation(); }
    },
      React.createElement('div', { 
        className: 'flex items-center justify-between px-4 py-3 border-b border-gray-100'
      },
        React.createElement('h3', { 
          className: 'text-gray-900 font-semibold' 
        }, '알림')
      ),
      
      React.createElement('div', { className: 'max-h-[60vh] overflow-y-auto' },
        sampleNotifications.map(function(notif) {
          return React.createElement('div', {
            key: notif.id,
            className: 'flex items-start gap-3 p-4 min-h-[64px] border-b border-gray-50 hover:bg-gray-50'
          },
            React.createElement('span', { className: 'text-xl flex-shrink-0' }, notif.icon),
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement('p', { 
                className: 'text-gray-900 text-sm font-medium' 
              }, notif.title),
              React.createElement('p', { 
                className: 'text-gray-400 text-xs mt-0.5' 
              }, notif.time)
            )
          );
        })
      )
    )
  );
};

// 메인 헤더 v2 - 간소화 버전 (이미지 1 디자인)
export var HomeHeaderV2 = function(props) {
  var weather = props.weather;
  var level = props.level || 1;
  var notifications = props.notifications || [];
  var onOpenNotifications = props.onOpenNotifications;
  
  var notifModalState = useState(false);
  var showNotifModal = notifModalState[0];
  var setShowNotifModal = notifModalState[1];
  
  var timeState = useState(new Date());
  var currentTime = timeState[0];
  var setCurrentTime = timeState[1];
  
  // 시간 업데이트 (1분마다)
  useEffect(function() {
    var interval = setInterval(function() {
      setCurrentTime(new Date());
    }, 60000);
    return function() { clearInterval(interval); };
  }, []);
  
  var month = currentTime.getMonth() + 1;
  var date = currentTime.getDate();
  var days = ['일', '월', '화', '수', '목', '금', '토'];
  var day = days[currentTime.getDay()];
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var timeStr = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
  
  var temp = weather?.temp || weather?.temperature || -3;
  var weatherCondition = weather?.condition || '맑음';
  
  var unreadCount = notifications.filter(function(n) { return !n.read; }).length || 0;
  
  // 배경색: 메인 배경과 동일 (#F5F5F7)
  return React.createElement('div', { 
    className: 'sticky top-0 z-40 bg-[#F5F5F7]'
  },
    React.createElement('div', { 
      className: 'max-w-3xl mx-auto flex items-center justify-between px-4 md:px-6 lg:px-8 py-4'
    },
      // 왼쪽: 날짜 + 시간 + 날씨 (흰색 박스 안에)
      React.createElement('div', { 
        className: 'bg-white rounded-xl px-4 py-2 shadow-sm flex items-center gap-3'
      },
        // 날짜 + 시간
        React.createElement('div', { 
          className: 'flex items-center gap-2 text-gray-900'
        },
          React.createElement('span', { 
            className: 'text-base font-semibold' 
          }, month + '/' + date + ' ' + day),
          React.createElement('span', { 
            className: 'text-base text-gray-500' 
          }, timeStr)
        ),
        
        // 날씨 + 온도
        React.createElement('div', { 
          className: 'flex items-center gap-1.5'
        },
          React.createElement(WeatherIcon, { 
            condition: weatherCondition,
            size: 20 
          }),
          React.createElement('span', { 
            className: 'text-base text-gray-600' 
          }, temp + '°')
        )
      ),
      
      // 오른쪽: 레벨 + 알림
      React.createElement('div', { className: 'flex items-center gap-2' },
        // 레벨 뱃지
        React.createElement('div', { 
          className: 'flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#A996FF] text-white text-sm font-semibold'
        },
          React.createElement(Star, { size: 14, className: 'fill-current' }),
          React.createElement('span', null, 'Lv.' + level)
        ),
        
        // 알림 버튼
        React.createElement('button', {
          onClick: function() { 
            if (onOpenNotifications) onOpenNotifications();
            else setShowNotifModal(true);
          },
          className: 'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-black/5 relative text-gray-600'
        },
          React.createElement(Bell, { size: 22 }),
          unreadCount > 0 && React.createElement('div', {
            className: 'absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full'
          })
        )
      )
    ),
    
    // 알림 모달
    React.createElement(NotificationsModal, {
      isOpen: showNotifModal,
      onClose: function() { setShowNotifModal(false); },
      notifications: notifications
    })
  );
};

export default HomeHeaderV2;
