import React, { useMemo, useEffect, useRef } from 'react';
import { Check, Circle, Briefcase, Heart, Calendar, Clock } from 'lucide-react';

// 카테고리 아이콘
var getCategoryIcon = function(title, isTask) {
  var lower = (title || '').toLowerCase();
  if (lower.includes('미팅') || lower.includes('회의') || lower.includes('보고') || lower.includes('업무')) {
    return React.createElement(Briefcase, { size: 16, className: 'text-blue-500' });
  }
  if (lower.includes('병원') || lower.includes('치과') || lower.includes('약')) {
    return '🏥';
  }
  if (lower.includes('엄마') || lower.includes('가족') || lower.includes('친구') || lower.includes('약속')) {
    return React.createElement(Heart, { size: 16, className: 'text-pink-500' });
  }
  if (isTask) {
    return React.createElement(Circle, { size: 16, className: 'text-purple-400' });
  }
  return React.createElement(Calendar, { size: 16, className: 'text-gray-400' });
};

// 카테고리 배경색
var getCategoryBg = function(title, isTask, isPast) {
  if (isPast) return 'bg-gray-50 border-gray-200';
  
  var lower = (title || '').toLowerCase();
  if (lower.includes('미팅') || lower.includes('회의') || lower.includes('보고') || lower.includes('업무')) {
    return 'bg-blue-50 border-blue-200';
  }
  if (lower.includes('병원') || lower.includes('치과')) {
    return 'bg-green-50 border-green-200';
  }
  if (lower.includes('엄마') || lower.includes('가족') || lower.includes('친구')) {
    return 'bg-pink-50 border-pink-200';
  }
  if (isTask) {
    return 'bg-purple-50 border-purple-200';
  }
  return 'bg-gray-50 border-gray-200';
};

// 📅 오늘 타임라인 (ADHD 친화적 - 시간 축 + 현재 위치)
export var TodayTimelineMinimal = function(props) {
  var events = props.events || [];
  var tasks = props.tasks || [];
  var onStartTask = props.onStartTask;
  var onOpenEvent = props.onOpenEvent;
  var onAddTask = props.onAddTask;
  
  var now = new Date();
  var currentHour = now.getHours();
  var currentMinute = now.getMinutes();
  
  var nowMarkerRef = useRef(null);
  var containerRef = useRef(null);
  
  // 타임라인 범위 (6시~23시)
  var START_HOUR = 6;
  var END_HOUR = 23;
  var HOUR_HEIGHT = 64; // 1시간 = 64px (모바일 터치 영역 확보)
  
  // 현재 시간 위치 (px)
  var nowPosition = useMemo(function() {
    if (currentHour < START_HOUR) return 0;
    if (currentHour >= END_HOUR) return (END_HOUR - START_HOUR) * HOUR_HEIGHT;
    return ((currentHour - START_HOUR) + (currentMinute / 60)) * HOUR_HEIGHT;
  }, [currentHour, currentMinute]);
  
  // 현재 시간 포맷
  var formatTime = function(hour, minute) {
    var h = hour < 10 ? '0' + hour : hour;
    var m = minute !== undefined ? (minute < 10 ? '0' + minute : minute) : '00';
    return h + ':' + m;
  };
  
  // 오늘 이벤트
  var todayEvents = useMemo(function() {
    var today = now.toDateString();
    
    return events.filter(function(e) {
      var eventDate = new Date(e.start || e.startTime);
      if (isNaN(eventDate.getTime())) return false;
      return eventDate.toDateString() === today;
    }).map(function(e) {
      var startTime = new Date(e.start || e.startTime);
      var endTime = e.end ? new Date(e.end) : new Date(startTime.getTime() + 60 * 60 * 1000);
      
      return {
        id: e.id,
        type: 'event',
        title: e.title || e.summary || '일정',
        startHour: startTime.getHours(),
        startMinute: startTime.getMinutes(),
        endHour: endTime.getHours(),
        endMinute: endTime.getMinutes(),
        isPast: startTime < now,
        original: e
      };
    });
  }, [events]);
  
  // 오늘 태스크 (마감 시간 있는 것만 타임라인에)
  var todayTasks = useMemo(function() {
    return tasks.filter(function(t) {
      return t.deadline || t.dueDate;
    }).map(function(t) {
      var deadline = new Date(t.deadline || t.dueDate);
      if (isNaN(deadline.getTime())) return null;
      
      return {
        id: t.id,
        type: 'task',
        title: t.title,
        startHour: deadline.getHours(),
        startMinute: deadline.getMinutes(),
        completed: t.completed,
        isPast: deadline < now && !t.completed,
        original: t
      };
    }).filter(Boolean);
  }, [tasks]);
  
  // 마감 시간 없는 태스크
  var untimedTasks = useMemo(function() {
    return tasks.filter(function(t) {
      return !t.deadline && !t.dueDate;
    });
  }, [tasks]);
  
  // 성취도
  var stats = useMemo(function() {
    var completed = tasks.filter(function(t) { return t.completed; }).length;
    var total = tasks.length || 0;
    return { completed: completed, total: total };
  }, [tasks]);
  
  // 뱃지 스타일
  var getBadgeStyle = function() {
    if (stats.total === 0) return 'text-gray-500 bg-gray-100';
    if (stats.completed === 0) return 'text-gray-500 bg-gray-100';
    if (stats.completed === stats.total) return 'text-green-600 bg-green-50';
    if (stats.completed >= stats.total / 2) return 'text-purple-600 bg-purple-50';
    return 'text-amber-600 bg-amber-50';
  };
  
  var getBadgeEmoji = function() {
    if (stats.total === 0) return '';
    if (stats.completed === 0) return '';
    if (stats.completed === stats.total) return ' 🎉';
    return '';
  };
  
  // 현재 시간 마커로 스크롤
  useEffect(function() {
    if (nowMarkerRef.current && containerRef.current) {
      var container = containerRef.current;
      var marker = nowMarkerRef.current;
      var markerTop = marker.offsetTop;
      var containerHeight = container.clientHeight;
      
      // 마커가 중앙에 오도록 스크롤
      container.scrollTop = markerTop - containerHeight / 3;
    }
  }, []);
  
  // 시간 슬롯 생성
  var timeSlots = [];
  for (var h = START_HOUR; h <= END_HOUR; h++) {
    timeSlots.push(h);
  }
  
  // 특정 시간의 이벤트/태스크 찾기
  var getItemsAtHour = function(hour) {
    var items = [];
    
    todayEvents.forEach(function(e) {
      if (e.startHour === hour) {
        items.push(e);
      }
    });
    
    todayTasks.forEach(function(t) {
      if (t.startHour === hour) {
        items.push(t);
      }
    });
    
    return items;
  };
  
  return React.createElement('div', {
    className: 'mx-4 mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'
  },
    // 헤더
    React.createElement('div', {
      className: 'p-4 border-b border-gray-100'
    },
      React.createElement('div', {
        className: 'flex items-center justify-between'
      },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', { className: 'text-xl' }, '📅'),
          React.createElement('span', { className: 'font-semibold text-gray-800 text-base' }, '오늘'),
          stats.total > 0 && React.createElement('span', {
            className: 'text-sm font-medium px-2.5 py-1 rounded-full ' + getBadgeStyle()
          }, stats.completed + '/' + stats.total + ' 완료' + getBadgeEmoji())
        ),
        React.createElement('div', {
          className: 'flex items-center gap-1.5 text-sm font-medium text-purple-600'
        },
          React.createElement(Clock, { size: 16 }),
          formatTime(currentHour, currentMinute)
        )
      )
    ),
    
    // 타임라인 컨테이너
    React.createElement('div', {
      ref: containerRef,
      className: 'relative overflow-y-auto',
      style: { 
        maxHeight: '400px',
        WebkitOverflowScrolling: 'touch'
      }
    },
      // 타임라인 그리드
      React.createElement('div', {
        className: 'relative',
        style: { height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT + 'px' }
      },
        // 시간 슬롯들
        timeSlots.map(function(hour, index) {
          var isPast = hour < currentHour;
          var isCurrent = hour === currentHour;
          var items = getItemsAtHour(hour);
          
          return React.createElement('div', {
            key: hour,
            className: 'absolute left-0 right-0 flex',
            style: { top: index * HOUR_HEIGHT + 'px', height: HOUR_HEIGHT + 'px' }
          },
            // 시간 레이블
            React.createElement('div', {
              className: 'w-16 flex-shrink-0 pr-2 text-right ' + 
                (isPast ? 'text-gray-300' : isCurrent ? 'text-purple-600 font-semibold' : 'text-gray-400')
            },
              React.createElement('span', { className: 'text-sm' }, formatTime(hour))
            ),
            
            // 구분선 + 콘텐츠 영역
            React.createElement('div', {
              className: 'flex-1 border-t relative ' + 
                (isPast ? 'border-gray-100 bg-gray-50/30' : 'border-gray-200')
            },
              // 이벤트/태스크 아이템들
              items.length > 0 && React.createElement('div', {
                className: 'absolute left-2 right-2 top-1.5 space-y-1.5'
              },
                items.map(function(item) {
                  var isTask = item.type === 'task';
                  var isCompleted = isTask && item.completed;
                  var categoryBg = getCategoryBg(item.title, isTask, item.isPast);
                  var categoryIcon = getCategoryIcon(item.title, isTask);
                  
                  return React.createElement('div', {
                    key: item.id,
                    className: 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer ' +
                      'transition-all active:scale-98 active:bg-opacity-80 ' + categoryBg +
                      (isCompleted ? ' opacity-50' : '') +
                      (item.isPast && !isCompleted ? ' opacity-60' : ''),
                    style: { minHeight: '44px' },
                    onClick: function() {
                      if (isTask && onStartTask) onStartTask(item.original);
                      else if (!isTask && onOpenEvent) onOpenEvent(item.original);
                    }
                  },
                    // 완료 체크 (태스크만)
                    isTask && (isCompleted
                      ? React.createElement('div', {
                          className: 'w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0'
                        },
                          React.createElement(Check, { size: 12, className: 'text-green-600' })
                        )
                      : React.createElement('div', {
                          className: 'w-5 h-5 rounded-full border-2 border-purple-300 flex-shrink-0'
                        })
                    ),
                    
                    // 아이콘
                    !isTask && React.createElement('span', { className: 'flex-shrink-0' }, categoryIcon),
                    
                    // 제목
                    React.createElement('span', {
                      className: 'text-sm truncate flex-1 ' + 
                        (isCompleted ? 'line-through text-gray-400' : 'text-gray-700')
                    }, item.title),
                    
                    // 시간 (이벤트만)
                    !isTask && React.createElement('span', {
                      className: 'ml-auto text-xs text-gray-400 flex-shrink-0'
                    }, formatTime(item.startHour, item.startMinute))
                  );
                })
              )
            )
          );
        }),
        
        // 🔴 현재 시간 마커 (NOW)
        currentHour >= START_HOUR && currentHour < END_HOUR && React.createElement('div', {
          ref: nowMarkerRef,
          className: 'absolute left-0 right-0 z-10 pointer-events-none',
          style: { top: nowPosition + 'px' }
        },
          // 빨간 선
          React.createElement('div', {
            className: 'flex items-center'
          },
            // NOW 라벨
            React.createElement('div', {
              className: 'w-16 flex-shrink-0 pr-1 flex justify-end'
            },
              React.createElement('span', {
                className: 'text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded'
              }, 'NOW')
            ),
            // 빨간 점 + 선
            React.createElement('div', {
              className: 'flex items-center flex-1'
            },
              React.createElement('div', {
                className: 'w-3 h-3 rounded-full bg-red-500 -ml-1.5 shadow-sm'
              }),
              React.createElement('div', {
                className: 'flex-1 h-0.5 bg-red-500/70'
              })
            )
          )
        )
      )
    ),
    
    // 시간 없는 태스크 (하단 섹션)
    untimedTasks.length > 0 && React.createElement('div', {
      className: 'border-t border-gray-100 p-4'
    },
      React.createElement('p', {
        className: 'text-xs text-gray-400 mb-3 flex items-center gap-1'
      },
        '✨ 시간 미정 할 일'
      ),
      React.createElement('div', { className: 'space-y-2' },
        untimedTasks.slice(0, 3).map(function(task, index) {
          var isCompleted = task.completed;
          
          return React.createElement('div', {
            key: task.id || 'untimed-' + index,
            className: 'flex items-center gap-2.5 px-3 py-3 rounded-xl border cursor-pointer ' +
              'transition-all active:scale-98 ' +
              (isCompleted ? 'bg-gray-50 border-gray-200 opacity-50' : 'bg-purple-50 border-purple-200'),
            style: { minHeight: '48px' },
            onClick: function() {
              if (onStartTask) onStartTask(task);
            }
          },
            isCompleted
              ? React.createElement('div', {
                  className: 'w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0'
                },
                  React.createElement(Check, { size: 12, className: 'text-green-600' })
                )
              : React.createElement('div', {
                  className: 'w-5 h-5 rounded-full border-2 border-purple-300 flex-shrink-0'
                }),
            React.createElement('span', {
              className: 'text-sm truncate ' + (isCompleted ? 'line-through text-gray-400' : 'text-gray-700')
            }, task.title)
          );
        }),
        untimedTasks.length > 3 && React.createElement('p', {
          className: 'text-xs text-gray-400 text-center py-1'
        }, '+' + (untimedTasks.length - 3) + '개 더')
      )
    ),
    
    // 빈 상태
    todayEvents.length === 0 && todayTasks.length === 0 && untimedTasks.length === 0 && React.createElement('div', {
      className: 'p-6 text-center'
    },
      React.createElement('span', { className: 'text-4xl block mb-3' }, '🐧'),
      React.createElement('p', { className: 'text-gray-600 font-medium text-base' }, '오늘 일정이 비어있어요'),
      React.createElement('p', { className: 'text-gray-400 text-sm mt-1' }, '여유로운 하루 보내거나, 할 일을 추가해보세요'),
      onAddTask && React.createElement('button', {
        onClick: onAddTask,
        className: 'mt-4 min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-medium ' +
          'bg-purple-50 text-purple-600 hover:bg-purple-100 active:bg-purple-200 transition-colors'
      }, '+ 할 일 추가')
    )
  );
};

export default TodayTimelineMinimal;
