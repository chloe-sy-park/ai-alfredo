import React, { useMemo } from 'react';
import { Clock, Plus, Sparkles, Calendar, CheckCircle, Coffee, Zap } from 'lucide-react';

// 🗓️ 미니 타임라인 - 빈 시간 제안 포함
export var MiniTimeline = function(props) {
  var events = props.events || [];
  var tasks = props.tasks || [];
  var darkMode = props.darkMode;
  var onStartTask = props.onStartTask;
  var onOpenEvent = props.onOpenEvent;
  var onAddTask = props.onAddTask;
  var condition = props.condition || 3;
  
  // 현재 시간
  var now = new Date();
  var currentHour = now.getHours();
  var currentMinute = now.getMinutes();
  var currentTimePercent = ((currentHour - 6) * 60 + currentMinute) / (18 * 60) * 100;
  
  // 타임라인 아이템 생성 (일정 + 빈 시간 분석)
  var timelineData = useMemo(function() {
    var items = [];
    var sortedEvents = events.slice().sort(function(a, b) {
      return new Date(a.start || a.startTime) - new Date(b.start || b.startTime);
    });
    
    // 미완료 태스크 (빈 시간 추천용)
    var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
    
    // 오늘 남은 일정들만
    var upcomingEvents = sortedEvents.filter(function(e) {
      var start = new Date(e.start || e.startTime);
      return start > now;
    });
    
    // 빈 시간 분석
    var lastEnd = now;
    
    upcomingEvents.forEach(function(event, idx) {
      var eventStart = new Date(event.start || event.startTime);
      var eventEnd = new Date(event.end || event.endTime || eventStart);
      
      // 빈 시간 계산
      var gapMinutes = Math.round((eventStart - lastEnd) / 1000 / 60);
      
      if (gapMinutes >= 30) {
        // 30분 이상 빈 시간이면 추천
        var suggestion = getSuggestion(gapMinutes, incompleteTasks, condition);
        items.push({
          type: 'gap',
          start: lastEnd,
          end: eventStart,
          duration: gapMinutes,
          suggestion: suggestion
        });
      }
      
      // 일정 추가
      items.push({
        type: 'event',
        event: event,
        start: eventStart,
        end: eventEnd,
        isNow: eventStart <= now && eventEnd > now
      });
      
      lastEnd = eventEnd;
    });
    
    // 마지막 일정 이후 빈 시간
    var endOfDay = new Date(now);
    endOfDay.setHours(22, 0, 0, 0);
    var finalGap = Math.round((endOfDay - lastEnd) / 1000 / 60);
    
    if (finalGap >= 30 && upcomingEvents.length > 0) {
      var suggestion = getSuggestion(finalGap, incompleteTasks, condition);
      items.push({
        type: 'gap',
        start: lastEnd,
        end: endOfDay,
        duration: finalGap,
        suggestion: suggestion
      });
    }
    
    // 일정이 없으면 전체가 빈 시간
    if (upcomingEvents.length === 0) {
      var freeMinutes = Math.round((endOfDay - now) / 1000 / 60);
      if (freeMinutes > 0) {
        var suggestion = getSuggestion(freeMinutes, incompleteTasks, condition);
        items.push({
          type: 'free-day',
          duration: freeMinutes,
          suggestion: suggestion
        });
      }
    }
    
    return items;
  }, [events, tasks, condition]);
  
  // 빈 시간 제안 생성
  function getSuggestion(minutes, tasks, condition) {
    // 컨디션 안 좋으면 휴식 우선
    if (condition <= 2) {
      if (minutes >= 60) {
        return { type: 'rest', text: '잠깐 쉬어가는 건 어때요?', emoji: '☕', action: 'rest' };
      }
      return { type: 'rest', text: '5분만 스트레칭 해요', emoji: '🧘', action: 'stretch' };
    }
    
    // 미뤄둔 할일 중 시간 맞는 것 찾기
    var fittingTask = tasks.find(function(t) {
      var estimated = t.estimatedTime || 30;
      return estimated <= minutes;
    });
    
    if (fittingTask) {
      return { 
        type: 'task', 
        text: '"' + fittingTask.title + '" 하기 딱!', 
        emoji: '✨',
        action: 'task',
        task: fittingTask
      };
    }
    
    // 긴 시간이면 집중 작업 추천
    if (minutes >= 90) {
      return { type: 'focus', text: '깊은 집중 작업 하기 좋아요', emoji: '🎯', action: 'focus' };
    }
    
    if (minutes >= 60) {
      return { type: 'work', text: '한 가지 작업에 집중해봐요', emoji: '💪', action: 'work' };
    }
    
    // 짧은 시간
    if (minutes >= 30) {
      return { type: 'quick', text: '짧은 작업 하나 끝내기!', emoji: '⚡', action: 'quick' };
    }
    
    return { type: 'break', text: '잠깐 쉬어가요', emoji: '☕', action: 'break' };
  }
  
  // 시간 포맷
  var formatTime = function(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
  };
  
  var formatDuration = function(minutes) {
    if (minutes >= 60) {
      var hours = Math.floor(minutes / 60);
      var mins = minutes % 60;
      return hours + '시간' + (mins > 0 ? ' ' + mins + '분' : '');
    }
    return minutes + '분';
  };
  
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
          ? 'bg-gradient-to-r from-blue-500/20 to-transparent'
          : 'bg-gradient-to-r from-blue-100 to-transparent')
    },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', {
          className: 'w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center'
        },
          React.createElement(Clock, { size: 14, className: 'text-white' })
        ),
        React.createElement('span', {
          className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold'
        }, '오늘 타임라인')
      ),
      // 현재 시간
      React.createElement('div', {
        className: 'px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white'
      }, formatTime(now) + ' 지금')
    ),
    
    // 진행률 바
    React.createElement('div', { className: 'px-5 py-2' },
      React.createElement('div', {
        className: 'h-2 rounded-full overflow-hidden ' +
          (darkMode ? 'bg-gray-700' : 'bg-gray-200')
      },
        React.createElement('div', {
          className: 'h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all',
          style: { width: Math.min(100, Math.max(0, currentTimePercent)) + '%' }
        })
      ),
      React.createElement('div', { className: 'flex justify-between mt-1' },
        React.createElement('span', { className: 'text-xs text-gray-500' }, '06:00'),
        React.createElement('span', { className: 'text-xs text-[#A996FF] font-medium' }, 
          Math.round(currentTimePercent) + '% 지남'
        ),
        React.createElement('span', { className: 'text-xs text-gray-500' }, '24:00')
      )
    ),
    
    // 타임라인 콘텐츠
    React.createElement('div', { className: 'px-5 pb-5' },
      // 빈 상태
      timelineData.length === 0 && React.createElement('div', {
        className: 'text-center py-8'
      },
        React.createElement(Sparkles, { 
          size: 32, 
          className: 'mx-auto mb-3 text-[#A996FF] animate-pulse-soft' 
        }),
        React.createElement('p', {
          className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm'
        }, '오늘은 일정이 없어요!'),
        React.createElement('p', {
          className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' text-xs mt-1'
        }, '여유롭게 하고 싶은 거 해요 ✨')
      ),
      
      // 타임라인 아이템들
      timelineData.length > 0 && React.createElement('div', { className: 'relative mt-3' },
        // 타임라인 바
        React.createElement('div', {
          className: 'absolute left-[18px] top-0 bottom-0 w-1 rounded-full ' +
            (darkMode ? 'bg-gray-700' : 'bg-gray-200')
        }),
        
        // 아이템들
        React.createElement('div', { className: 'space-y-3' },
          timelineData.map(function(item, idx) {
            if (item.type === 'event') {
              // 일정 아이템
              var event = item.event;
              var eventStart = new Date(event.start || event.startTime);
              var isNow = item.isNow;
              
              return React.createElement('div', {
                key: 'event-' + idx,
                className: 'flex items-start gap-3 cursor-pointer group',
                onClick: function() { if (onOpenEvent) onOpenEvent(event); }
              },
                // 포인트
                React.createElement('div', {
                  className: 'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-transform group-hover:scale-110 ' +
                    (isNow 
                      ? 'bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] text-white ring-4 ring-[#A996FF]/20'
                      : (darkMode ? 'bg-gray-700' : 'bg-gray-200'))
                },
                  React.createElement(Calendar, { 
                    size: 16, 
                    className: isNow ? 'text-white' : (darkMode ? 'text-gray-400' : 'text-gray-500')
                  })
                ),
                
                // 정보
                React.createElement('div', {
                  className: 'flex-1 py-2 px-3 rounded-xl transition-all ' +
                    (isNow 
                      ? 'bg-[#A996FF]/10 ring-1 ring-[#A996FF]/30'
                      : (darkMode ? 'bg-white/5 group-hover:bg-white/10' : 'bg-gray-50 group-hover:bg-gray-100'))
                },
                  React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
                    React.createElement('span', {
                      className: (isNow ? 'text-[#A996FF]' : (darkMode ? 'text-gray-400' : 'text-gray-500')) + ' text-xs font-medium'
                    }, formatTime(eventStart)),
                    isNow && React.createElement('span', {
                      className: 'px-2 py-0.5 rounded-full bg-[#A996FF] text-white text-xs font-bold'
                    }, '진행중')
                  ),
                  React.createElement('p', {
                    className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-medium text-sm'
                  }, event.title || event.summary)
                )
              );
            }
            
            if (item.type === 'gap' || item.type === 'free-day') {
              // 빈 시간 + 제안
              return React.createElement('div', {
                key: 'gap-' + idx,
                className: 'flex items-start gap-3'
              },
                // 포인트
                React.createElement('div', {
                  className: 'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ' +
                    'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                },
                  React.createElement(Sparkles, { size: 16 })
                ),
                
                // 빈 시간 제안 카드
                React.createElement('div', {
                  className: 'flex-1 py-3 px-4 rounded-xl ' +
                    (darkMode ? 'bg-amber-500/10' : 'bg-amber-50')
                },
                  React.createElement('div', { className: 'flex items-center justify-between mb-2' },
                    React.createElement('span', {
                      className: 'text-amber-500 text-xs font-medium'
                    }, '✨ ' + formatDuration(item.duration) + ' 비어있어요'),
                    item.type === 'gap' && React.createElement('span', {
                      className: 'text-xs text-gray-500'
                    }, formatTime(item.start) + ' - ' + formatTime(item.end))
                  ),
                  
                  // 제안
                  React.createElement('div', { className: 'flex items-center justify-between' },
                    React.createElement('p', {
                      className: (darkMode ? 'text-gray-200' : 'text-gray-700') + ' text-sm font-medium'
                    },
                      React.createElement('span', { className: 'mr-2' }, item.suggestion.emoji),
                      item.suggestion.text
                    ),
                    
                    // 바로 시작 버튼
                    item.suggestion.task && React.createElement('button', {
                      onClick: function(e) { 
                        e.stopPropagation();
                        if (onStartTask) onStartTask(item.suggestion.task);
                      },
                      className: 'px-3 py-1.5 rounded-lg text-xs font-medium btn-press ' +
                        'bg-[#A996FF] text-white shadow-sm'
                    }, '시작')
                  )
                )
              );
            }
            
            return null;
          })
        )
      ),
      
      // 일정 추가 버튼
      React.createElement('button', {
        onClick: onAddTask,
        className: 'w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl transition-all btn-press ' +
          (darkMode 
            ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700')
      },
        React.createElement(Plus, { size: 16 }),
        React.createElement('span', { className: 'text-sm' }, '일정 추가')
      )
    )
  );
};

export default MiniTimeline;
