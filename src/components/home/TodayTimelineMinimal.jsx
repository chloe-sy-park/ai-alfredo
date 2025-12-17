import React, { useMemo } from 'react';
import { Check, Briefcase, Heart, Calendar } from 'lucide-react';

// 카테고리 아이콘
var getCategoryIcon = function(title) {
  var lower = (title || '').toLowerCase();
  if (lower.includes('미팅') || lower.includes('회의') || lower.includes('보고') || lower.includes('업무')) {
    return React.createElement(Briefcase, { size: 14, className: 'text-blue-500' });
  }
  if (lower.includes('병원') || lower.includes('치과') || lower.includes('약')) {
    return '🏥';
  }
  if (lower.includes('엄마') || lower.includes('가족') || lower.includes('친구') || lower.includes('약속')) {
    return React.createElement(Heart, { size: 14, className: 'text-pink-500' });
  }
  return React.createElement(Calendar, { size: 14, className: 'text-gray-400' });
};

// 카테고리 배경색
var getCategoryBg = function(title) {
  var lower = (title || '').toLowerCase();
  if (lower.includes('미팅') || lower.includes('회의') || lower.includes('보고') || lower.includes('업무')) {
    return 'bg-blue-50 border-blue-100';
  }
  if (lower.includes('병원') || lower.includes('치과')) {
    return 'bg-green-50 border-green-100';
  }
  if (lower.includes('엄마') || lower.includes('가족') || lower.includes('친구')) {
    return 'bg-pink-50 border-pink-100';
  }
  return 'bg-gray-50 border-gray-100';
};

// 시간 포맷
var formatTime = function(date) {
  var d = new Date(date);
  var hours = d.getHours();
  var minutes = d.getMinutes();
  return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
};

// 📅 오늘 타임라인 (미니멀 + 성취도)
export var TodayTimelineMinimal = function(props) {
  var events = props.events || [];
  var tasks = props.tasks || [];
  var onStartTask = props.onStartTask;
  var onOpenEvent = props.onOpenEvent;
  
  var now = new Date();
  
  // 오늘 일정만 필터
  var todayEvents = useMemo(function() {
    var today = now.toDateString();
    
    return events.filter(function(e) {
      var eventDate = new Date(e.start || e.startTime);
      return eventDate.toDateString() === today;
    }).sort(function(a, b) {
      return new Date(a.start || a.startTime) - new Date(b.start || b.startTime);
    });
  }, [events]);
  
  // 완료된 이벤트 체크
  var processedEvents = useMemo(function() {
    return todayEvents.map(function(event) {
      var eventTime = new Date(event.start || event.startTime);
      var isPast = eventTime < now;
      return Object.assign({}, event, { isPast: isPast });
    });
  }, [todayEvents, now]);
  
  // 성취도 계산
  var stats = useMemo(function() {
    var completed = tasks.filter(function(t) { return t.completed; }).length;
    var total = tasks.length || 1;
    var percent = Math.round((completed / total) * 100);
    
    // 하루 진행률 계산
    var dayStart = new Date(now);
    dayStart.setHours(9, 0, 0, 0);
    var dayEnd = new Date(now);
    dayEnd.setHours(21, 0, 0, 0);
    
    var dayProgress = 0;
    if (now >= dayStart && now <= dayEnd) {
      dayProgress = Math.round(((now - dayStart) / (dayEnd - dayStart)) * 100);
    } else if (now > dayEnd) {
      dayProgress = 100;
    }
    
    // 빈 시간 계산 (대략적)
    var busyMinutes = todayEvents.length * 60; // 이벤트당 1시간 가정
    var totalMinutes = 12 * 60; // 9시-21시 = 12시간
    var freeMinutes = Math.max(0, totalMinutes - busyMinutes);
    var freeHours = Math.floor(freeMinutes / 60);
    
    return {
      completed: completed,
      total: total,
      percent: percent,
      dayProgress: dayProgress,
      freeHours: freeHours
    };
  }, [tasks, todayEvents, now]);
  
  // 현재 시간 포맷
  var currentTime = formatTime(now);
  
  return React.createElement('div', {
    className: 'mx-4 mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'
  },
    // 헤더 (성취도 포함)
    React.createElement('div', {
      className: 'p-4 border-b border-gray-50'
    },
      React.createElement('div', {
        className: 'flex items-center justify-between mb-3'
      },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', { className: 'text-lg' }, '📅'),
          React.createElement('span', { className: 'font-semibold text-gray-800' }, '오늘'),
          React.createElement('span', {
            className: 'text-sm text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full'
          }, stats.completed + '/' + stats.total + ' 완료 ✨')
        ),
        React.createElement('span', {
          className: 'text-sm text-gray-500'
        }, currentTime)
      ),
      
      // 진행 바
      React.createElement('div', {
        className: 'h-1.5 bg-gray-100 rounded-full overflow-hidden'
      },
        React.createElement('div', {
          className: 'h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all',
          style: { width: stats.dayProgress + '%' }
        })
      ),
      React.createElement('p', {
        className: 'text-xs text-gray-400 mt-1'
      }, stats.dayProgress + '% 지남')
    ),
    
    // 타임라인 내용
    React.createElement('div', { className: 'p-4' },
      processedEvents.length === 0
        ? React.createElement('div', {
            className: 'text-center py-6 text-gray-400'
          },
            React.createElement('p', null, '오늘 일정이 없어요'),
            React.createElement('p', { className: 'text-sm mt-1' }, '여유로운 하루 보내세요 ☀️')
          )
        : React.createElement('div', { className: 'space-y-3' },
            processedEvents.map(function(event, index) {
              var eventTime = formatTime(event.start || event.startTime);
              var title = event.title || event.summary || '일정';
              var isPast = event.isPast;
              var categoryBg = getCategoryBg(title);
              var categoryIcon = getCategoryIcon(title);
              
              return React.createElement('div', {
                key: event.id || index,
                className: 'flex items-center gap-3 cursor-pointer group',
                onClick: function() {
                  if (onOpenEvent) onOpenEvent(event);
                }
              },
                // 시간
                React.createElement('span', {
                  className: 'text-sm font-medium w-12 ' + (isPast ? 'text-gray-300' : 'text-gray-600')
                }, eventTime),
                
                // 완료 체크 (지난 일정)
                isPast && React.createElement('div', {
                  className: 'w-5 h-5 rounded-full bg-green-100 flex items-center justify-center'
                },
                  React.createElement(Check, { size: 12, className: 'text-green-600' })
                ),
                
                // 일정 내용
                React.createElement('div', {
                  className: 'flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ' + 
                    categoryBg + ' ' +
                    (isPast ? 'opacity-50' : 'group-hover:shadow-sm')
                },
                  React.createElement('span', { className: 'flex-shrink-0' }, categoryIcon),
                  React.createElement('span', {
                    className: 'text-sm truncate ' + (isPast ? 'line-through text-gray-400' : 'text-gray-700')
                  }, title)
                )
              );
            })
          ),
      
      // 빈 시간 안내
      stats.freeHours > 0 && React.createElement('div', {
        className: 'mt-4 pt-4 border-t border-gray-50'
      },
        React.createElement('p', {
          className: 'text-sm text-gray-500'
        },
          '✨ 빈 시간 약 ', 
          React.createElement('span', { className: 'font-medium text-purple-600' }, stats.freeHours + '시간')
        )
      )
    )
  );
};

export default TodayTimelineMinimal;
