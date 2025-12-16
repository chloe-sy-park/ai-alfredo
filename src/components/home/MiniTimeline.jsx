import React, { useMemo } from 'react';
import { Calendar, CheckSquare, MapPin, Zap, Clock, Sparkles, Plus } from 'lucide-react';

// 📋 오늘 한눈에 미니 타임라인 - 시각적 강화 버전
export var MiniTimeline = function(props) {
  var events = props.events || [];
  var tasks = props.tasks || [];
  var darkMode = props.darkMode;
  var onStartTask = props.onStartTask;
  var onOpenEvent = props.onOpenEvent;
  
  var now = new Date();
  var currentHour = now.getHours();
  var currentMin = now.getMinutes();
  var currentTimeStr = currentHour.toString().padStart(2, '0') + ':' + currentMin.toString().padStart(2, '0');
  
  // 오늘 일정/할일 통합
  var todayItems = useMemo(function() {
    var items = [];
    
    events.forEach(function(e) {
      var startDate = new Date(e.start);
      if (startDate.toDateString() === now.toDateString()) {
        items.push({
          id: e.id,
          type: 'event',
          title: e.title || e.summary,
          startTime: startDate,
          timeStr: startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }).replace('오전 ', '').replace('오후 ', ''),
          location: e.location,
          duration: e.duration || 60,
          original: e
        });
      }
    });
    
    tasks.forEach(function(t) {
      if (t.scheduledTime && !t.completed) {
        var timeParts = t.scheduledTime.split(':');
        var taskTime = new Date();
        taskTime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1] || 0));
        
        items.push({
          id: t.id,
          type: 'task',
          title: t.title,
          startTime: taskTime,
          timeStr: t.scheduledTime,
          duration: t.estimatedTime || t.duration || 30,
          project: t.project,
          original: t
        });
      }
    });
    
    return items.sort(function(a, b) { return a.startTime - b.startTime; });
  }, [events, tasks]);
  
  // 완료 카운트
  var totalCount = todayItems.length + tasks.filter(function(t) { return !t.completed && !t.scheduledTime; }).length;
  var completedCount = tasks.filter(function(t) { return t.completed; }).length;
  var progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // 다음 아이템
  var nextItem = todayItems.find(function(item) { return item.startTime > now; });
  var nextItemMin = nextItem ? Math.round((nextItem.startTime - now) / 1000 / 60) : null;
  
  // 타임라인 바 위치
  var getTimePosition = function(date) {
    var mins = date.getHours() * 60 + date.getMinutes();
    var dayStart = 7 * 60;
    var dayEnd = 22 * 60;
    return Math.max(0, Math.min(100, ((mins - dayStart) / (dayEnd - dayStart)) * 100));
  };
  
  // 빈 시간 계산
  var getGapInfo = function(item, prevItem) {
    var startMin = item.startTime.getHours() * 60 + item.startTime.getMinutes();
    var prevEndMin = prevItem 
      ? (prevItem.startTime.getHours() * 60 + prevItem.startTime.getMinutes() + (prevItem.duration || 60))
      : 9 * 60;
    
    var gap = startMin - prevEndMin;
    if (gap >= 30) {
      var hours = Math.floor(gap / 60);
      var mins = gap % 60;
      var durationStr = hours > 0 
        ? hours + '시간' + (mins > 0 ? ' ' + mins + '분' : '') 
        : mins + '분';
      var startStr = Math.floor(prevEndMin / 60).toString().padStart(2, '0') + ':' + 
        (prevEndMin % 60).toString().padStart(2, '0');
      var endStr = Math.floor(startMin / 60).toString().padStart(2, '0') + ':' + 
        (startMin % 60).toString().padStart(2, '0');
      return { startStr: startStr, endStr: endStr, durationStr: durationStr };
    }
    return null;
  };
  
  var getDelayClass = function(idx) {
    if (idx === 0) return '';
    if (idx === 1) return 'animate-delay-100';
    if (idx === 2) return 'animate-delay-200';
    return 'animate-delay-300';
  };
  
  return React.createElement('div', { 
    className: 'rounded-2xl md:rounded-3xl overflow-hidden shadow-xl animate-fadeIn ' +
      (darkMode ? 'bg-[#2C2C2E]' : 'bg-white')
  },
    // 헤더 - 그라데이션 배경
    React.createElement('div', { 
      className: 'p-4 md:p-5 ' +
        (darkMode 
          ? 'bg-gradient-to-r from-[#3A3A3C] to-[#2C2C2E]'
          : 'bg-gradient-to-r from-[#F0F4FF] to-white')
    },
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          // 아이콘 with 배경
          React.createElement('div', { 
            className: 'w-10 h-10 rounded-xl flex items-center justify-center ' +
              (darkMode ? 'bg-blue-500/20' : 'bg-blue-100')
          },
            React.createElement(Clock, { size: 20, className: 'text-blue-500' })
          ),
          React.createElement('div', null,
            React.createElement('h2', { 
              className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold text-base md:text-lg'
            }, '오늘 한눈에'),
            React.createElement('p', { 
              className: 'text-xs ' + (darkMode ? 'text-gray-400' : 'text-gray-500')
            }, progress + '% 완료')
          )
        ),
        // 진행률 바
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('div', { 
            className: 'w-20 md:w-24 h-2 rounded-full overflow-hidden ' + (darkMode ? 'bg-[#3A3A3C]' : 'bg-gray-200')
          },
            React.createElement('div', { 
              className: 'h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all',
              style: { width: progress + '%' }
            })
          ),
          React.createElement('span', { 
            className: 'text-sm font-bold ' + (darkMode ? 'text-gray-300' : 'text-gray-700')
          }, completedCount + '/' + totalCount)
        )
      ),
      
      // 현재 시간 + 다음 일정
      React.createElement('div', { className: 'flex items-center gap-3 mb-4' },
        React.createElement('div', { 
          className: 'flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-[#A996FF] to-[#8B7AE4] ' +
            'text-white rounded-full shadow-lg shadow-[#A996FF]/30'
        },
          React.createElement('div', { className: 'w-2 h-2 bg-white rounded-full animate-pulse-soft' }),
          React.createElement('span', { className: 'font-bold text-sm md:text-base' }, '지금 ' + currentTimeStr)
        ),
        nextItem && React.createElement('span', { 
          className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-xs md:text-sm truncate'
        },
          '→ ',
          React.createElement('span', { className: 'hidden sm:inline' },
            nextItem.title.length > 10 ? nextItem.title.substring(0, 10) + '...' : nextItem.title,
            ' '
          ),
          React.createElement('span', { className: 'text-[#A996FF] font-bold' }, nextItemMin + '분 후')
        )
      ),
      
      // 타임라인 바 - 더 두껍게
      React.createElement('div', { 
        className: 'relative h-3 rounded-full overflow-hidden ' + (darkMode ? 'bg-[#3A3A3C]' : 'bg-gray-100')
      },
        React.createElement('div', { 
          className: 'absolute h-full bg-gradient-to-r from-[#D4CCE8] via-[#A996FF] to-[#8B7AE4] rounded-full xp-bar',
          style: { width: getTimePosition(now) + '%' }
        }),
        todayItems.map(function(item) {
          var pos = getTimePosition(item.startTime);
          var isPast = item.startTime < now;
          return React.createElement('div', {
            key: item.id,
            className: 'absolute w-4 h-4 rounded-full -top-0.5 transform -translate-x-1/2 ' +
              'border-2 border-white shadow-md ' +
              (item.type === 'event' ? 'bg-blue-500' : 'bg-emerald-500') +
              (isPast ? ' opacity-50' : ''),
            style: { left: pos + '%' }
          });
        })
      ),
      
      // 시간 라벨
      React.createElement('div', { 
        className: 'flex justify-between text-[10px] md:text-xs mt-1 ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
      },
        React.createElement('span', null, '7:00'),
        React.createElement('span', null, '12:00'),
        React.createElement('span', null, '18:00'),
        React.createElement('span', null, '22:00')
      )
    ),
    
    // 아이템 리스트
    React.createElement('div', { 
      className: 'px-4 md:px-5 pb-4 md:pb-5 space-y-2 max-h-80 overflow-y-auto'
    },
      todayItems.map(function(item, idx) {
        var prevItem = idx > 0 ? todayItems[idx - 1] : null;
        var gap = getGapInfo(item, prevItem);
        var isPast = item.startTime < now;
        var isOngoing = item.startTime <= now && 
          new Date(item.startTime.getTime() + (item.duration || 60) * 60000) > now;
        var delayClass = getDelayClass(idx);
        
        return React.createElement(React.Fragment, { key: item.id },
          // 빈 시간 슬롯 - 클릭 가능
          gap && React.createElement('button', { 
            className: 'w-full flex items-center gap-3 p-3 border-2 border-dashed rounded-xl ' +
              'transition-all hover:border-[#A996FF]/50 hover:bg-[#A996FF]/5 ' +
              (darkMode ? 'border-[#3A3A3C]' : 'border-gray-200')
          },
            React.createElement('div', { 
              className: 'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ' + 
                (darkMode ? 'bg-[#3A3A3C]' : 'bg-gray-100')
            },
              React.createElement(Plus, { size: 16, className: darkMode ? 'text-gray-500' : 'text-gray-400' })
            ),
            React.createElement('span', { 
              className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' text-sm'
            }, gap.startStr + ' - ' + gap.endStr),
            React.createElement('span', { 
              className: 'ml-auto px-2.5 py-1 text-xs font-medium rounded-full ' + 
                (darkMode ? 'bg-[#3A3A3C] text-gray-400' : 'bg-gray-100 text-gray-500')
            }, '✨ ' + gap.durationStr)
          ),
          
          // 아이템
          React.createElement('div', { 
            className: 'flex items-center gap-3 p-3 rounded-xl transition-all min-h-[56px] animate-fadeInUp ' + delayClass + ' ' +
              (isOngoing 
                ? 'bg-gradient-to-r from-[#A996FF]/15 to-[#A996FF]/5 ring-2 ring-[#A996FF] shadow-lg shadow-[#A996FF]/20' 
                : isPast 
                  ? (darkMode ? 'bg-[#3A3A3C]/30 opacity-60' : 'bg-gray-50/50 opacity-60') 
                  : (darkMode ? 'bg-[#3A3A3C]' : 'bg-gray-50'))
          },
            // 시간
            React.createElement('div', { className: 'w-10 md:w-12 text-center flex-shrink-0' },
              React.createElement('span', { 
                className: 'text-xs md:text-sm font-bold ' + 
                  (isOngoing 
                    ? 'text-[#A996FF]'
                    : isPast 
                      ? (darkMode ? 'text-gray-500' : 'text-gray-400') 
                      : (darkMode ? 'text-white' : 'text-gray-900'))
              }, item.timeStr)
            ),
            
            // 타입 아이콘 - 더 크게
            React.createElement('div', { 
              className: 'w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ' +
                (item.type === 'event' 
                  ? (isOngoing ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600')
                  : (isOngoing ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'))
            },
              item.type === 'event' 
                ? React.createElement(Calendar, { size: 18 })
                : React.createElement(CheckSquare, { size: 18 })
            ),
            
            // 제목 + 위치
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement('p', { 
                className: 'font-semibold truncate text-sm md:text-base ' + 
                  (isOngoing
                    ? 'text-[#A996FF]'
                    : isPast 
                      ? (darkMode ? 'text-gray-500 line-through' : 'text-gray-400 line-through')
                      : (darkMode ? 'text-white' : 'text-gray-900'))
              }, item.title),
              (item.location || item.project) && React.createElement('div', { 
                className: 'flex items-center gap-1.5 mt-0.5'
              },
                item.location && React.createElement(MapPin, { 
                  size: 12, 
                  className: darkMode ? 'text-gray-500' : 'text-gray-400'
                }),
                React.createElement('span', { 
                  className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' text-xs truncate'
                }, item.location || item.project)
              )
            ),
            
            // 시작 버튼
            !isPast && item.type === 'task' && React.createElement('button', {
              onClick: function() { if (onStartTask) onStartTask(item.original); },
              className: 'px-3 py-2 min-h-[40px] bg-gradient-to-r from-[#A996FF] to-[#8B7AE4] ' +
                'text-white text-xs md:text-sm font-bold rounded-lg ' +
                'shadow-md shadow-[#A996FF]/30 hover:shadow-lg hover:shadow-[#A996FF]/40 ' +
                'transition-all btn-press flex items-center gap-1 flex-shrink-0'
            },
              React.createElement(Zap, { size: 14, className: 'fill-current' }),
              React.createElement('span', { className: 'hidden sm:inline' }, '시작')
            )
          )
        );
      }),
      
      // 빈 상태 - 더 친근하게
      todayItems.length === 0 && React.createElement('div', { 
        className: 'text-center py-10 animate-fadeIn ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
      }, 
        React.createElement('div', { 
          className: 'w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ' +
            (darkMode ? 'bg-[#3A3A3C]' : 'bg-gray-100')
        },
          React.createElement(Sparkles, { size: 28, className: 'text-[#A996FF]' })
        ),
        React.createElement('p', { className: 'font-medium mb-1' }, '오늘 일정이 없어요'),
        React.createElement('p', { className: 'text-sm' }, '여유로운 하루 되세요! ✨')
      )
    )
  );
};

export default MiniTimeline;
