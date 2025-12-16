import React, { useState } from 'react';
import { Sun, Cloud, CloudRain, ChevronDown, X, Search, Bell, Settings, Star, Calendar, CheckSquare, Clock } from 'lucide-react';

// 컨디션 이모지 매핑
var CONDITION_EMOJIS = {
  1: { emoji: '😰', label: '힘듦' },
  2: { emoji: '😴', label: '피곤' },
  3: { emoji: '😐', label: '보통' },
  4: { emoji: '😊', label: '좋음' },
  5: { emoji: '😄', label: '최고' }
};

// 검색 모달
var SearchModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var onSelectTask = props.onSelectTask;
  var onSelectEvent = props.onSelectEvent;
  
  var queryState = useState('');
  var query = queryState[0];
  var setQuery = queryState[1];
  
  if (!isOpen) return null;
  
  var filteredTasks = tasks.filter(function(t) {
    return t.title && t.title.toLowerCase().includes(query.toLowerCase());
  }).slice(0, 5);
  
  var filteredEvents = events.filter(function(e) {
    var title = e.title || e.summary || '';
    return title.toLowerCase().includes(query.toLowerCase());
  }).slice(0, 5);
  
  var hasResults = filteredTasks.length > 0 || filteredEvents.length > 0;
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-[60] animate-fadeIn',
    onClick: onClose
  },
    React.createElement('div', { 
      className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' 
    }),
    React.createElement('div', {
      className: 'relative w-full max-w-lg mx-auto mt-20 px-4',
      onClick: function(e) { e.stopPropagation(); }
    },
      React.createElement('div', {
        className: (darkMode ? 'bg-[#2C2C2E]' : 'bg-white') + 
          ' rounded-2xl shadow-2xl overflow-hidden animate-fadeInDown'
      },
        React.createElement('div', { 
          className: 'flex items-center gap-3 px-4 py-3 border-b ' +
            (darkMode ? 'border-gray-700' : 'border-gray-100')
        },
          React.createElement(Search, { 
            size: 20, 
            className: darkMode ? 'text-gray-400' : 'text-gray-500' 
          }),
          React.createElement('input', {
            type: 'text',
            placeholder: '할일, 일정 검색...',
            value: query,
            onChange: function(e) { setQuery(e.target.value); },
            autoFocus: true,
            className: 'flex-1 bg-transparent outline-none text-base md:text-lg ' +
              (darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400')
          }),
          query && React.createElement('button', {
            onClick: function() { setQuery(''); },
            className: 'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full btn-press ' + 
              (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
          },
            React.createElement(X, { size: 18, className: darkMode ? 'text-gray-400' : 'text-gray-500' })
          )
        ),
        
        query && React.createElement('div', { className: 'max-h-[60vh] overflow-y-auto' },
          filteredTasks.length > 0 && React.createElement('div', { className: 'p-3' },
            React.createElement('p', { 
              className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' text-xs font-medium mb-2 px-2' 
            }, '할일'),
            filteredTasks.map(function(task, idx) {
              return React.createElement('button', {
                key: task.id,
                onClick: function() { if (onSelectTask) onSelectTask(task); onClose(); },
                className: 'w-full flex items-center gap-3 p-3 min-h-[52px] rounded-xl transition-all animate-fadeInUp btn-press ' +
                  'animate-delay-' + (idx * 100) + ' ' +
                  (darkMode ? 'hover:bg-[#3A3A3C]' : 'hover:bg-gray-50')
              },
                React.createElement('div', {
                  className: 'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ' +
                    (task.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600')
                },
                  React.createElement(CheckSquare, { size: 18 })
                ),
                React.createElement('div', { className: 'flex-1 text-left min-w-0' },
                  React.createElement('p', { 
                    className: (darkMode ? 'text-white' : 'text-gray-900') + ' truncate ' +
                      (task.completed ? ' line-through opacity-50' : '')
                  }, task.title),
                  task.project && React.createElement('p', { 
                    className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' text-xs truncate' 
                  }, task.project)
                )
              );
            })
          ),
          
          filteredEvents.length > 0 && React.createElement('div', { 
            className: 'p-3 border-t ' + (darkMode ? 'border-gray-700' : 'border-gray-100') 
          },
            React.createElement('p', { 
              className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' text-xs font-medium mb-2 px-2' 
            }, '일정'),
            filteredEvents.map(function(event, idx) {
              var startDate = new Date(event.start || event.startTime);
              var dateStr = (startDate.getMonth() + 1) + '/' + startDate.getDate();
              var timeStr = startDate.getHours() + ':' + startDate.getMinutes().toString().padStart(2, '0');
              
              return React.createElement('button', {
                key: event.id,
                onClick: function() { if (onSelectEvent) onSelectEvent(event); onClose(); },
                className: 'w-full flex items-center gap-3 p-3 min-h-[52px] rounded-xl transition-all animate-fadeInUp btn-press ' +
                  'animate-delay-' + (idx * 100) + ' ' +
                  (darkMode ? 'hover:bg-[#3A3A3C]' : 'hover:bg-gray-50')
              },
                React.createElement('div', {
                  className: 'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-100 text-purple-600'
                },
                  React.createElement(Calendar, { size: 18 })
                ),
                React.createElement('div', { className: 'flex-1 text-left min-w-0' },
                  React.createElement('p', { 
                    className: (darkMode ? 'text-white' : 'text-gray-900') + ' truncate'
                  }, event.title || event.summary),
                  React.createElement('p', { 
                    className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' text-xs' 
                  }, dateStr + ' ' + timeStr)
                )
              );
            })
          ),
          
          !hasResults && React.createElement('div', { 
            className: 'p-8 text-center animate-fadeIn ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
          }, '검색 결과가 없어요')
        ),
        
        !query && React.createElement('div', { 
          className: 'p-8 text-center animate-fadeIn ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
        }, '할일이나 일정을 검색해보세요')
      )
    )
  );
};

// 알림 모달
var NotificationsModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var darkMode = props.darkMode;
  var notifications = props.notifications || [];
  
  if (!isOpen) return null;
  
  var sampleNotifications = notifications.length > 0 ? notifications : [
    { id: 1, type: 'reminder', title: '팀 미팅 30분 전', time: '10분 전', icon: '📅' },
    { id: 2, type: 'task', title: '기획서 마감 D-1', time: '1시간 전', icon: '⚠️' },
    { id: 3, type: 'care', title: '물 마실 시간이에요', time: '2시간 전', icon: '💧' }
  ];
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-[60] flex items-start justify-center md:justify-end p-4 pt-20 animate-fadeIn',
    onClick: onClose
  },
    React.createElement('div', { 
      className: 'absolute inset-0 bg-black/20' 
    }),
    React.createElement('div', {
      className: (darkMode ? 'bg-[#2C2C2E]' : 'bg-white') + 
        ' w-full max-w-sm md:mr-4 rounded-2xl shadow-2xl overflow-hidden relative animate-scaleIn',
      onClick: function(e) { e.stopPropagation(); }
    },
      React.createElement('div', { 
        className: 'flex items-center justify-between px-4 py-3 border-b ' +
          (darkMode ? 'border-gray-700' : 'border-gray-100')
      },
        React.createElement('h3', { 
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-semibold' 
        }, '알림'),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full btn-press ' + 
            (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
        },
          React.createElement(X, { size: 18, className: darkMode ? 'text-gray-400' : 'text-gray-500' })
        )
      ),
      
      React.createElement('div', { className: 'max-h-[60vh] overflow-y-auto' },
        sampleNotifications.map(function(notif, idx) {
          return React.createElement('div', {
            key: notif.id,
            className: 'flex items-start gap-3 p-4 min-h-[64px] border-b transition-all animate-fadeInUp ' +
              'animate-delay-' + (idx * 100) + ' card-hover ' +
              (darkMode ? 'border-gray-700/50 hover:bg-[#3A3A3C]' : 'border-gray-50 hover:bg-gray-50')
          },
            React.createElement('span', { className: 'text-xl flex-shrink-0' }, notif.icon),
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement('p', { 
                className: (darkMode ? 'text-white' : 'text-gray-900') + ' text-sm font-medium' 
              }, notif.title),
              React.createElement('p', { 
                className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' text-xs mt-0.5' 
              }, notif.time)
            )
          );
        }),
        
        sampleNotifications.length === 0 && React.createElement('div', { 
          className: 'p-8 text-center animate-fadeIn ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
        }, '새로운 알림이 없어요')
      ),
      
      React.createElement('button', {
        className: 'w-full p-4 min-h-[52px] text-center text-sm font-medium text-[#A996FF] btn-press ' +
          (darkMode ? 'hover:bg-[#3A3A3C]' : 'hover:bg-gray-50')
      }, '전체 알림 보기')
    )
  );
};

// 컨디션 선택 모달 - 상단 바텀시트로 변경
var ConditionModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var currentCondition = props.currentCondition;
  var onSelect = props.onSelect;
  var darkMode = props.darkMode;
  
  if (!isOpen) return null;
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-[60] flex items-start justify-center animate-fadeIn',
    onClick: onClose
  },
    React.createElement('div', { 
      className: 'absolute inset-0 bg-black/40 backdrop-blur-sm'
    }),
    // 상단에서 내려오는 모달
    React.createElement('div', {
      className: (darkMode ? 'bg-[#2C2C2E]' : 'bg-white') + 
        ' w-full max-w-lg mx-4 mt-16 rounded-2xl p-5 relative shadow-2xl animate-fadeInDown',
      onClick: function(e) { e.stopPropagation(); }
    },
      React.createElement('h3', { 
        className: (darkMode ? 'text-white' : 'text-gray-900') + 
          ' text-base font-semibold text-center mb-4' 
      }, '오늘 컨디션 어때요?'),
      
      React.createElement('div', { className: 'flex justify-between gap-2' },
        Object.keys(CONDITION_EMOJIS).map(function(key, idx) {
          var value = parseInt(key);
          var condition = CONDITION_EMOJIS[key];
          var isSelected = currentCondition === value;
          
          return React.createElement('button', {
            key: key,
            onClick: function() { onSelect(value); onClose(); },
            className: 'flex-1 flex flex-col items-center p-3 min-h-[72px] rounded-xl transition-all transform btn-press animate-fadeInUp ' +
              'animate-delay-' + (idx * 50) + ' ' +
              (isSelected 
                ? 'bg-[#A996FF]/20 ring-2 ring-[#A996FF] scale-105' 
                : (darkMode ? 'bg-[#3A3A3C] hover:bg-[#48484A]' : 'bg-gray-100 hover:bg-gray-200'))
          },
            React.createElement('span', { className: 'text-2xl mb-1' }, condition.emoji),
            React.createElement('span', { 
              className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-xs font-medium' 
            }, condition.label)
          );
        })
      )
    )
  );
};

// 날씨 상세 모달 - 중앙 정렬
var WeatherModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var weather = props.weather;
  var darkMode = props.darkMode;
  
  if (!isOpen) return null;
  
  var temp = weather?.temp || -3;
  var tempLow = weather?.tempLow || -5;
  var condition = weather?.condition || '맑음';
  
  var getClothingAdvice = function() {
    if (temp <= 0) return '패딩, 목도리 필수! 🧣';
    if (temp <= 5) return '두꺼운 외투 챙기세요 🧥';
    if (temp <= 10) return '가디건이나 자켓 추천 🧥';
    if (temp <= 20) return '가벼운 겉옷 챙기세요 👔';
    return '시원하게 입으세요 👕';
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn',
    onClick: onClose
  },
    React.createElement('div', { 
      className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' 
    }),
    React.createElement('div', {
      className: (darkMode ? 'bg-[#2C2C2E]' : 'bg-white') + 
        ' w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-scaleIn',
      onClick: function(e) { e.stopPropagation(); }
    },
      React.createElement('button', { 
        onClick: onClose, 
        className: 'absolute top-4 right-4 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full btn-press ' +
          (darkMode ? 'hover:bg-[#3A3A3C]' : 'hover:bg-gray-100')
      },
        React.createElement(X, { size: 20, className: darkMode ? 'text-gray-400' : 'text-gray-500' })
      ),
      
      React.createElement('div', { className: 'text-center pt-2' },
        React.createElement('span', { className: 'text-6xl animate-bounce-soft' }, 
          condition.includes('비') ? '🌧️' : condition.includes('구름') ? '⛅' : '☀️'
        ),
        React.createElement('p', { 
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' text-5xl font-bold mt-4 animate-fadeInUp' 
        }, temp + '°'),
        React.createElement('p', { 
          className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm mt-2 animate-fadeInUp animate-delay-100' 
        }, '최저 ' + tempLow + '° / 최고 ' + temp + '°')
      ),
      
      React.createElement('div', { 
        className: (darkMode ? 'bg-[#3A3A3C]' : 'bg-gray-50') + ' rounded-2xl p-4 mt-6 animate-fadeInUp animate-delay-200' 
      },
        React.createElement('p', { 
          className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm mb-1' 
        }, '🐧 알프레도 추천'),
        React.createElement('p', { 
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-medium' 
        }, getClothingAdvice())
      )
    )
  );
};

// 메인 헤더 컴포넌트
export var HomeHeader = function(props) {
  var darkMode = props.darkMode;
  var condition = props.condition || 3;
  var setCondition = props.setCondition;
  var weather = props.weather;
  var level = props.level || 1;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var notifications = props.notifications || [];
  var onOpenSettings = props.onOpenSettings;
  var onSelectTask = props.onSelectTask;
  var onSelectEvent = props.onSelectEvent;
  
  var conditionModalState = useState(false);
  var showConditionModal = conditionModalState[0];
  var setShowConditionModal = conditionModalState[1];
  
  var weatherModalState = useState(false);
  var showWeatherModal = weatherModalState[0];
  var setShowWeatherModal = weatherModalState[1];
  
  var searchModalState = useState(false);
  var showSearchModal = searchModalState[0];
  var setShowSearchModal = searchModalState[1];
  
  var notifModalState = useState(false);
  var showNotifModal = notifModalState[0];
  var setShowNotifModal = notifModalState[1];
  
  var now = new Date();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var days = ['일', '월', '화', '수', '목', '금', '토'];
  var day = days[now.getDay()];
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var timeStr = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
  
  var temp = weather?.temp || -3;
  var weatherCondition = weather?.condition || '맑음';
  
  var getWeatherIcon = function() {
    if (weatherCondition.includes('비')) return React.createElement(CloudRain, { size: 16, className: 'text-blue-400' });
    if (weatherCondition.includes('구름')) return React.createElement(Cloud, { size: 16, className: 'text-gray-400' });
    return React.createElement(Sun, { size: 16, className: 'text-amber-400' });
  };
  
  var currentCondition = CONDITION_EMOJIS[condition] || CONDITION_EMOJIS[3];
  var unreadCount = notifications.filter(function(n) { return !n.read; }).length || 0;
  
  return React.createElement('div', { 
    className: 'sticky top-0 z-40 backdrop-blur-xl safe-area-top ' +
      (darkMode 
        ? 'bg-[#1D1D1F]/90 border-b border-white/10' 
        : 'bg-[#F5F5F7]/90 border-b border-black/5')
  },
    React.createElement('div', { 
      className: 'max-w-3xl mx-auto flex items-center justify-between px-4 md:px-6 lg:px-8 py-3'
    },
      // 왼쪽
      React.createElement('div', { className: 'flex items-center gap-2 md:gap-3' },
        React.createElement('span', { 
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' text-xs md:text-sm font-semibold' 
        }, month + '/' + date + ' ' + day + ' ' + timeStr),
        
        React.createElement('button', {
          onClick: function() { setShowWeatherModal(true); },
          className: 'flex items-center gap-1 px-2 py-1.5 min-h-[40px] rounded-full transition-all btn-press ' +
            (darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5')
        },
          getWeatherIcon(),
          React.createElement('span', { 
            className: (darkMode ? 'text-gray-300' : 'text-gray-600') + ' text-xs md:text-sm' 
          }, temp + '°')
        ),
        
        React.createElement('button', {
          onClick: function() { setShowConditionModal(true); },
          className: 'flex items-center gap-1 px-2 py-1.5 min-h-[40px] rounded-full transition-all btn-press ' +
            (darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5')
        },
          React.createElement('span', { className: 'text-lg' }, currentCondition.emoji),
          React.createElement(ChevronDown, { 
            size: 12, 
            className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' hidden md:block'
          })
        )
      ),
      
      // 오른쪽
      React.createElement('div', { className: 'flex items-center gap-1' },
        React.createElement('div', { 
          className: 'flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-full bg-[#A996FF] text-white text-xs md:text-sm font-semibold shadow-lg shadow-[#A996FF]/30'
        },
          React.createElement(Star, { size: 12, className: 'fill-current' }),
          React.createElement('span', null, 'Lv.' + level)
        ),
        
        React.createElement('button', {
          onClick: function() { setShowSearchModal(true); },
          className: 'p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full transition-all btn-press ' +
            (darkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-600')
        },
          React.createElement(Search, { size: 18 })
        ),
        
        React.createElement('button', {
          onClick: function() { setShowNotifModal(true); },
          className: 'p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full transition-all relative btn-press ' +
            (darkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-600')
        },
          React.createElement(Bell, { size: 18 }),
          unreadCount > 0 && React.createElement('div', {
            className: 'absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full notif-badge'
          })
        ),
        
        React.createElement('button', {
          onClick: onOpenSettings,
          className: 'p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full transition-all btn-press ' +
            (darkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-600')
        },
          React.createElement(Settings, { size: 18 })
        )
      )
    ),
    
    // 모달들
    React.createElement(ConditionModal, {
      isOpen: showConditionModal,
      onClose: function() { setShowConditionModal(false); },
      currentCondition: condition,
      onSelect: setCondition,
      darkMode: darkMode
    }),
    
    React.createElement(WeatherModal, {
      isOpen: showWeatherModal,
      onClose: function() { setShowWeatherModal(false); },
      weather: weather,
      darkMode: darkMode
    }),
    
    React.createElement(SearchModal, {
      isOpen: showSearchModal,
      onClose: function() { setShowSearchModal(false); },
      darkMode: darkMode,
      tasks: tasks,
      events: events,
      onSelectTask: onSelectTask,
      onSelectEvent: onSelectEvent
    }),
    
    React.createElement(NotificationsModal, {
      isOpen: showNotifModal,
      onClose: function() { setShowNotifModal(false); },
      darkMode: darkMode,
      notifications: notifications
    })
  );
};

export default HomeHeader;
