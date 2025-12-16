import React, { useMemo } from 'react';
import { Calendar, CheckSquare, MapPin, Zap } from 'lucide-react';

// 📋 오늘 한눈에 미니 타임라인
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
    
    // 일정 추가
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
    
    // 시간 지정된 할일 추가
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
  
  // 다음 아이템
  var nextItem = todayItems.find(function(item) { return item.startTime > now; });
  var nextItemMin = nextItem ? Math.round((nextItem.startTime - now) / 1000 / 60) : null;
  
  // 타임라인 바 위치 계산
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
  
  return React.createElement('div', { 
    className: 'rounded-3xl overflow-hidden shadow-lg ' +
      (darkMode ? 'bg-[#2C2C2E]' : 'bg-white')
  },
    // 헤더
    React.createElement('div', { className: 'p-5 pb-3' },
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', { className: 'text-lg' }, '📋'),
          React.createElement('h2', { 
            className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold text-lg'
          }, '오늘 한눈에'),
          React.createElement('span', { 
            className: 'px-2 py-0.5 rounded-full text-xs font-medium bg-[#A996FF]/10 text-[#A996FF]'
          }, '드래그로 이동')
        ),
        React.createElement('span', { 
          className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm'
        }, completedCount + '/' + totalCount + ' 완료')
      ),
      
      // 현재 시간 + 다음 일정
      React.createElement('div', { className: 'flex items-center gap-3 mb-4' },
        React.createElement('div', { 
          className: 'flex items-center gap-2 px-4 py-2 bg-[#A996FF] text-white rounded-full shadow-lg shadow-[#A996FF]/30'
        },
          React.createElement('div', { className: 'w-2 h-2 bg-white rounded-full animate-pulse' }),
          React.createElement('span', { className: 'font-semibold' }, '지금 ' + currentTimeStr)
        ),
        nextItem && React.createElement('span', { 
          className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm'
        },
          '→ ',
          nextItem.title.length > 12 ? nextItem.title.substring(0, 12) + '...' : nextItem.title,
          ' ',
          React.createElement('span', { className: 'text-[#A996FF] font-semibold' }, nextItemMin + '분 후')
        )
      ),
      
      // 타임라인 바
      React.createElement('div', { 
        className: 'relative h-2 rounded-full mb-1 ' + (darkMode ? 'bg-[#3A3A3C]' : 'bg-gray-100')
      },
        // 현재 시간까지 진행
        React.createElement('div', { 
          className: 'absolute h-full bg-gradient-to-r from-[#D4CCE8] to-[#A996FF] rounded-full',
          style: { width: getTimePosition(now) + '%' }
        }),
        // 이벤트 포인트들
        todayItems.map(function(item) {
          var pos = getTimePosition(item.startTime);
          var isPast = item.startTime < now;
          return React.createElement('div', {
            key: item.id,
            className: 'absolute w-3 h-3 rounded-full -top-0.5 transform -translate-x-1/2 border-2 border-white ' +
              (item.type === 'event' ? 'bg-blue-500' : 'bg-green-500') +
              (isPast ? ' opacity-50' : ''),
            style: { left: pos + '%' }
          });
        })
      ),
      
      // 시간 라벨
      React.createElement('div', { 
        className: 'flex justify-between text-xs ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
      },
        React.createElement('span', null, '7:00'),
        React.createElement('span', null, '12:00'),
        React.createElement('span', null, '18:00'),
        React.createElement('span', null, '22:00')
      )
    ),
    
    // 아이템 리스트
    React.createElement('div', { 
      className: 'px-5 pb-5 space-y-2 max-h-80 overflow-y-auto'
    },
      todayItems.map(function(item, idx) {
        var prevItem = idx > 0 ? todayItems[idx - 1] : null;
        var gap = getGapInfo(item, prevItem);
        var isPast = item.startTime < now;
        var isOngoing = item.startTime <= now && 
          new Date(item.startTime.getTime() + (item.duration || 60) * 60000) > now;
        
        return React.createElement(React.Fragment, { key: item.id },
          // 빈 시간 슬롯
          gap && React.createElement('div', { 
            className: 'flex items-center gap-3 p-3 border-2 border-dashed rounded-2xl ' +
              (darkMode ? 'border-[#3A3A3C]' : 'border-gray-200')
          },
            React.createElement('div', { 
              className: 'w-3 h-3 rounded-full ' + (darkMode ? 'bg-gray-600' : 'bg-gray-300')
            }),
            React.createElement('span', { 
              className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' text-sm'
            }, gap.startStr + ' - ' + gap.endStr),
            React.createElement('span', { 
              className: 'px-2 py-0.5 text-xs rounded-full ' + 
                (darkMode ? 'bg-[#3A3A3C] text-gray-400' : 'bg-gray-100 text-gray-500')
            }, gap.durationStr + ' 비어있어요')
          ),
          
          // 아이템
          React.createElement('div', { 
            className: 'flex items-center gap-3 p-3 rounded-2xl transition-all ' +
              (isOngoing 
                ? 'bg-[#A996FF]/10 ring-1 ring-[#A996FF]' 
                : isPast 
                  ? (darkMode ? 'bg-[#3A3A3C]/50' : 'bg-gray-50') 
                  : (darkMode ? 'bg-[#3A3A3C]' : 'bg-gray-50'))
          },
            // 시간
            React.createElement('span', { 
              className: 'text-sm font-semibold w-12 ' + 
                (isPast ? (darkMode ? 'text-gray-500' : 'text-gray-400') : (darkMode ? 'text-white' : 'text-gray-900'))
            }, item.timeStr),
            
            // 타입 아이콘
            React.createElement('div', { 
              className: 'w-8 h-8 rounded-xl flex items-center justify-center ' +
                (item.type === 'event' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-green-100 text-green-600')
            },
              item.type === 'event' 
                ? React.createElement(Calendar, { size: 16 })
                : React.createElement(CheckSquare, { size: 16 })
            ),
            
            // 제목 + 위치
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement('p', { 
                className: 'font-medium truncate ' + 
                  (isPast 
                    ? (darkMode ? 'text-gray-500 line-through' : 'text-gray-400 line-through')
                    : (darkMode ? 'text-white' : 'text-gray-900'))
              }, item.title),
              (item.location || item.project) && React.createElement('div', { 
                className: 'flex items-center gap-1 mt-0.5'
              },
                item.location && React.createElement(MapPin, { 
                  size: 12, 
                  className: darkMode ? 'text-gray-500' : 'text-gray-400'
                }),
                React.createElement('span', { 
                  className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' text-xs'
                }, item.location || item.project)
              )
            ),
            
            // 소요시간 + 시작 버튼
            !isPast && item.type === 'task' && React.createElement(React.Fragment, null,
              React.createElement('span', { 
                className: (darkMode ? 'text-gray-500' : 'text-gray-400') + ' text-xs'
              }, '~' + (item.duration || 30) + '분'),
              React.createElement('button', {
                onClick: function() { if (onStartTask) onStartTask(item.original); },
                className: 'px-3 py-1.5 bg-[#A996FF] text-white text-sm font-medium rounded-lg ' +
                  'shadow-sm hover:bg-[#8B7AE4] transition-all active:scale-95 flex items-center gap-1'
              },
                React.createElement(Zap, { size: 14 }),
                '시작'
              )
            )
          )
        );
      }),
      
      // 아이템 없으면
      todayItems.length === 0 && React.createElement('div', { 
        className: 'text-center py-8 ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
      }, '오늘 일정이 없어요 ✨')
    )
  );
};

export default MiniTimeline;
