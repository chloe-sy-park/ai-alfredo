import React, { useMemo } from 'react';
import { Check, Circle, Briefcase, Heart, Calendar, Clock, Sparkles } from 'lucide-react';

// 카테고리 아이콘
var getCategoryIcon = function(title, isTask) {
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
  if (isTask) {
    return React.createElement(Circle, { size: 14, className: 'text-purple-400' });
  }
  return React.createElement(Calendar, { size: 14, className: 'text-gray-400' });
};

// 카테고리 배경색
var getCategoryBg = function(title, isTask, completed) {
  if (completed) return 'bg-gray-50 border-gray-100';
  
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
  if (isTask) {
    return 'bg-purple-50 border-purple-100';
  }
  return 'bg-gray-50 border-gray-100';
};

// 시간 포맷 (Invalid Date 처리 추가)
var formatTime = function(date) {
  if (!date) return null;
  var d = new Date(date);
  // Invalid Date 체크
  if (isNaN(d.getTime())) return null;
  var hours = d.getHours();
  var minutes = d.getMinutes();
  return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
};

// 📅 오늘 타임라인 (미니멀 + 성취도 + 태스크 포함)
export var TodayTimelineMinimal = function(props) {
  var events = props.events || [];
  var tasks = props.tasks || [];
  var onStartTask = props.onStartTask;
  var onOpenEvent = props.onOpenEvent;
  var onAddTask = props.onAddTask;
  
  var now = new Date();
  
  // 오늘 일정 필터
  var todayEvents = useMemo(function() {
    var today = now.toDateString();
    
    return events.filter(function(e) {
      var eventDate = new Date(e.start || e.startTime);
      // Invalid Date 체크
      if (isNaN(eventDate.getTime())) return false;
      return eventDate.toDateString() === today;
    }).map(function(e) {
      var eventTime = new Date(e.start || e.startTime);
      return {
        id: e.id,
        type: 'event',
        title: e.title || e.summary || '일정',
        time: eventTime,
        timeStr: formatTime(eventTime),
        isPast: eventTime < now,
        original: e
      };
    });
  }, [events]);
  
  // 오늘 태스크
  var todayTasks = useMemo(function() {
    return tasks.map(function(t, index) {
      // 마감 시간이 있으면 그 시간, 없으면 순서대로 배치
      var taskTime = null;
      var timeStr = null;
      
      if (t.deadline || t.dueDate) {
        var parsed = new Date(t.deadline || t.dueDate);
        // Invalid Date 체크
        if (!isNaN(parsed.getTime())) {
          taskTime = parsed;
          timeStr = formatTime(parsed);
        }
      }
      
      return {
        id: t.id || 'task-' + index,
        type: 'task',
        title: t.title,
        time: taskTime,
        timeStr: timeStr,
        completed: t.completed,
        original: t
      };
    });
  }, [tasks]);
  
  // 이벤트 + 태스크 합치고 정렬
  var allItems = useMemo(function() {
    var items = [];
    
    // 시간 있는 이벤트들
    todayEvents.forEach(function(e) {
      items.push(e);
    });
    
    // 시간 있는 태스크들 (마감 기준)
    todayTasks.filter(function(t) { return t.time; }).forEach(function(t) {
      items.push(t);
    });
    
    // 시간순 정렬
    items.sort(function(a, b) {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time - b.time;
    });
    
    return items;
  }, [todayEvents, todayTasks]);
  
  // 시간 없는 태스크들 (별도 섹션)
  var untimedTasks = useMemo(function() {
    return todayTasks.filter(function(t) { return !t.time; });
  }, [todayTasks]);
  
  // 성취도 계산
  var stats = useMemo(function() {
    var completed = tasks.filter(function(t) { return t.completed; }).length;
    var total = tasks.length || 0;
    
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
    
    return {
      completed: completed,
      total: total,
      dayProgress: dayProgress
    };
  }, [tasks, now]);
  
  // 현재 시간 포맷
  var currentTime = formatTime(now) || '--:--';
  
  // 빈 상태
  var isEmpty = allItems.length === 0 && untimedTasks.length === 0;
  
  // 완료율에 따른 뱃지 스타일
  var getBadgeStyle = function() {
    if (stats.total === 0) return 'text-gray-500 bg-gray-50';
    if (stats.completed === 0) return 'text-gray-500 bg-gray-100';
    if (stats.completed === stats.total) return 'text-green-600 bg-green-50';
    if (stats.completed >= stats.total / 2) return 'text-purple-600 bg-purple-50';
    return 'text-amber-600 bg-amber-50';
  };
  
  // 완료율에 따른 이모지
  var getBadgeEmoji = function() {
    if (stats.total === 0) return '';
    if (stats.completed === 0) return '';
    if (stats.completed === stats.total) return ' 🎉';
    if (stats.completed >= stats.total / 2) return ' ✨';
    return '';
  };
  
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
          stats.total > 0 && React.createElement('span', {
            className: 'text-sm font-medium px-2 py-0.5 rounded-full ' + getBadgeStyle()
          }, stats.completed + '/' + stats.total + ' 완료' + getBadgeEmoji())
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
      // 빈 상태
      isEmpty
        ? React.createElement('div', {
            className: 'text-center py-6'
          },
            React.createElement('span', { className: 'text-3xl block mb-2' }, '🐧'),
            React.createElement('p', { className: 'text-gray-600 font-medium' }, '오늘 일정이 비어있어요'),
            React.createElement('p', { className: 'text-gray-400 text-sm mt-1' }, '여유로운 하루 보내거나, 할 일을 추가해보세요'),
            onAddTask && React.createElement('button', {
              onClick: onAddTask,
              className: 'mt-4 px-4 py-2 rounded-xl text-sm font-medium ' +
                'bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors'
            }, '+ 할 일 추가')
          )
        : React.createElement('div', { className: 'space-y-2' },
            // 시간대별 아이템들
            allItems.map(function(item, index) {
              var isTask = item.type === 'task';
              var isCompleted = isTask ? item.completed : item.isPast;
              var categoryBg = getCategoryBg(item.title, isTask, isCompleted);
              var categoryIcon = getCategoryIcon(item.title, isTask);
              
              return React.createElement('div', {
                key: item.id || index,
                className: 'flex items-center gap-3 cursor-pointer group',
                onClick: function() {
                  if (isTask && onStartTask) onStartTask(item.original);
                  else if (!isTask && onOpenEvent) onOpenEvent(item.original);
                }
              },
                // 시간
                React.createElement('span', {
                  className: 'text-sm font-medium w-12 ' + (isCompleted ? 'text-gray-300' : 'text-gray-600')
                }, item.timeStr || '—'),
                
                // 완료 체크
                isCompleted && React.createElement('div', {
                  className: 'w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0'
                },
                  React.createElement(Check, { size: 12, className: 'text-green-600' })
                ),
                
                // 미완료 원
                !isCompleted && isTask && React.createElement('div', {
                  className: 'w-5 h-5 rounded-full border-2 border-purple-300 flex-shrink-0'
                }),
                
                // 일정 내용
                React.createElement('div', {
                  className: 'flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ' + 
                    categoryBg + ' ' +
                    (isCompleted ? 'opacity-50' : 'group-hover:shadow-sm')
                },
                  React.createElement('span', { className: 'flex-shrink-0' }, categoryIcon),
                  React.createElement('span', {
                    className: 'text-sm truncate ' + (isCompleted ? 'line-through text-gray-400' : 'text-gray-700')
                  }, item.title),
                  isTask && !isCompleted && React.createElement('span', {
                    className: 'ml-auto text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity'
                  }, '시작 →')
                )
              );
            }),
            
            // 시간 없는 태스크들
            untimedTasks.length > 0 && React.createElement('div', {
              className: 'mt-4 pt-3 border-t border-gray-100'
            },
              React.createElement('p', {
                className: 'text-xs text-gray-400 mb-2 flex items-center gap-1'
              },
                React.createElement(Sparkles, { size: 12 }),
                '오늘 할 일'
              ),
              React.createElement('div', { className: 'space-y-2' },
                untimedTasks.map(function(item, index) {
                  var isCompleted = item.completed;
                  var categoryBg = getCategoryBg(item.title, true, isCompleted);
                  var categoryIcon = getCategoryIcon(item.title, true);
                  
                  return React.createElement('div', {
                    key: item.id || 'untimed-' + index,
                    className: 'flex items-center gap-3 cursor-pointer group',
                    onClick: function() {
                      if (onStartTask) onStartTask(item.original);
                    }
                  },
                    // 빈 시간 자리
                    React.createElement('span', { className: 'w-12' }),
                    
                    // 완료 체크 또는 원
                    isCompleted 
                      ? React.createElement('div', {
                          className: 'w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0'
                        },
                          React.createElement(Check, { size: 12, className: 'text-green-600' })
                        )
                      : React.createElement('div', {
                          className: 'w-5 h-5 rounded-full border-2 border-purple-300 flex-shrink-0'
                        }),
                    
                    // 태스크 내용
                    React.createElement('div', {
                      className: 'flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ' + 
                        categoryBg + ' ' +
                        (isCompleted ? 'opacity-50' : 'group-hover:shadow-sm')
                    },
                      React.createElement('span', { className: 'flex-shrink-0' }, categoryIcon),
                      React.createElement('span', {
                        className: 'text-sm truncate ' + (isCompleted ? 'line-through text-gray-400' : 'text-gray-700')
                      }, item.title),
                      !isCompleted && React.createElement('span', {
                        className: 'ml-auto text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity'
                      }, '시작 →')
                    )
                  );
                })
              )
            )
          )
    )
  );
};

export default TodayTimelineMinimal;
