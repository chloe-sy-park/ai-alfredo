import React, { useState, useMemo } from 'react';
import { 
  Calendar, CheckSquare, Clock, Zap, ChevronRight, ChevronDown,
  MapPin, Play, Pause, MoreHorizontal
} from 'lucide-react';

// 시간대별 인사말
var getTimeGreeting = function(condition) {
  var hour = new Date().getHours();
  
  if (condition && condition <= 2) {
    return '오늘 좀 힘드시구나... 괜찮아요, Boss.';
  }
  
  if (hour >= 5 && hour < 12) return '좋은 아침이에요, Boss!';
  if (hour >= 12 && hour < 17) return '좋은 오후예요, Boss!';
  if (hour >= 17 && hour < 21) return '오늘 하루 수고하셨어요, Boss!';
  return '이 시간엔 쉬셔야죠, Boss.';
};

// 모드 설정
var MODES = {
  focus: { id: 'focus', emoji: '🎯', label: '집중', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  care: { id: 'care', emoji: '💜', label: '케어', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  challenge: { id: 'challenge', emoji: '🔥', label: '챌린지', color: 'text-red-500', bgColor: 'bg-red-500/10' }
};

// 🐧 알프레도 인사 섹션
export var AlfredoGreeting = function(props) {
  var darkMode = props.darkMode;
  var condition = props.condition;
  var mode = props.mode || 'focus';
  var setMode = props.setMode;
  
  var modeExpandedState = useState(false);
  var isModeExpanded = modeExpandedState[0];
  var setModeExpanded = modeExpandedState[1];
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var currentMode = MODES[mode] || MODES.focus;
  var greeting = getTimeGreeting(condition);
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl border ' + borderColor + ' p-4 mb-4' },
    React.createElement('div', { className: 'flex items-start gap-3' },
      React.createElement('span', { className: 'text-3xl' }, '🐧'),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('p', { className: textPrimary + ' font-medium text-lg leading-relaxed' }, greeting),
        
        // 모드 선택
        isModeExpanded 
          ? React.createElement('div', { className: 'flex gap-2 mt-3' },
              Object.values(MODES).map(function(m) {
                var isActive = mode === m.id;
                return React.createElement('button', {
                  key: m.id,
                  onClick: function() { if (setMode) setMode(m.id); setModeExpanded(false); },
                  className: 'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ' +
                    (isActive ? m.bgColor + ' ' + m.color : (darkMode ? 'bg-gray-700' : 'bg-gray-100'))
                },
                  React.createElement('span', null, m.emoji),
                  React.createElement('span', { className: 'text-xs font-medium' }, m.label)
                );
              })
            )
          : React.createElement('button', {
              onClick: function() { setModeExpanded(true); },
              className: currentMode.bgColor + ' px-3 py-1.5 rounded-full flex items-center gap-1.5 mt-2'
            },
              React.createElement('span', null, currentMode.emoji),
              React.createElement('span', { className: currentMode.color + ' text-xs font-medium' }, currentMode.label + ' 모드'),
              React.createElement(ChevronDown, { size: 12, className: currentMode.color })
            )
      )
    )
  );
};

// 📊 오늘 요약 카드
export var TodaySummary = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  
  var now = new Date();
  var todayEvents = events.filter(function(e) {
    var eventDate = new Date(e.start);
    return eventDate.toDateString() === now.toDateString();
  });
  
  var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
  var taskCount = incompleteTasks.length;
  var eventCount = todayEvents.length;
  
  return React.createElement('div', { className: 'mb-4' },
    React.createElement('p', { className: textPrimary + ' text-xl font-bold' },
      '오늘 할 일 ',
      React.createElement('span', { className: 'text-[#A996FF]' }, taskCount + '개'),
      ', 미팅 ',
      React.createElement('span', { className: 'text-[#A996FF]' }, eventCount + '개'),
      ' 있어요.'
    )
  );
};

// 📅 다가오는 일정 카드
export var UpcomingEventCard = function(props) {
  var event = props.event;
  var darkMode = props.darkMode;
  var onClick = props.onClick;
  var isUrgent = props.isUrgent;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = isUrgent 
    ? 'border-[#A996FF] border-l-4' 
    : (darkMode ? 'border-gray-700' : 'border-gray-200');
  
  var startTime = new Date(event.start);
  var timeStr = startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  
  // 시간 계산
  var now = new Date();
  var diffMin = Math.round((startTime - now) / 1000 / 60);
  var timeLabel = diffMin <= 0 ? '진행 중' : diffMin + '분 후';
  
  // 이모지 선택
  var emoji = '📅';
  var title = event.title || event.summary || '';
  if (title.includes('PT') || title.includes('운동')) emoji = '🏋️';
  if (title.includes('미팅') || title.includes('투자')) emoji = '🤝';
  if (title.includes('점심') || title.includes('저녁')) emoji = '🍽️';
  
  // 알프레도 팁
  var tip = '';
  if (title.includes('PT')) tip = '미팅 전 5분 명상 추천';
  if (title.includes('미팅') || title.includes('투자')) tip = diffMin > 30 ? (startTime.getHours() - 1) + ':00까지 업무 마무리하면 좋겠어요' : '준비 시작하세요!';
  
  return React.createElement('button', {
    onClick: onClick,
    className: cardBg + ' w-full rounded-2xl border ' + borderColor + ' p-4 text-left mb-3 transition-all hover:shadow-md'
  },
    React.createElement('div', { className: 'flex items-start gap-3' },
      React.createElement('span', { className: 'text-2xl' }, emoji),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('p', { className: textPrimary + ' font-medium' },
          isUrgent 
            ? React.createElement('span', { className: 'text-[#A996FF]' }, timeStr + ' ')
            : '오늘 ' + timeStr + ' ',
          title
        ),
        tip && React.createElement('p', { className: textSecondary + ' text-sm mt-1' }, tip)
      ),
      isUrgent && React.createElement('span', { className: 'text-[#A996FF] text-sm font-medium' }, timeLabel)
    )
  );
};

// ⚡ 지금 이거부터 섹션
export var FocusNow = function(props) {
  var task = props.task;
  var darkMode = props.darkMode;
  var onStart = props.onStart;
  var onMore = props.onMore;
  
  if (!task) return null;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  // 태그
  var isRecommended = task.priority === 'high' || task.recommended;
  
  // 예상 시간
  var duration = task.estimatedTime || task.duration || 30;
  var durationText = duration >= 60 ? Math.floor(duration / 60) + '시간' : '~' + duration + '분';
  
  // 프로젝트/도메인
  var domain = task.project || task.domain || '';
  
  // 마감까지 남은 시간
  var deadlineText = '';
  if (task.deadline || task.dueDate) {
    var deadline = new Date(task.deadline || task.dueDate);
    var now = new Date();
    var diffHours = Math.round((deadline - now) / 1000 / 60 / 60);
    if (diffHours > 0 && diffHours < 24) {
      deadlineText = diffHours + '시간 전';
    }
  }
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl border ' + borderColor + ' p-4 mb-4' },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: 'text-lg' }, '🎯'),
        React.createElement('span', { className: 'text-[#A996FF] font-medium text-sm' }, '지금 이거부터')
      ),
      React.createElement('button', {
        onClick: onMore,
        className: textSecondary + ' text-sm flex items-center gap-1'
      },
        '다른 옵션',
        React.createElement(ChevronDown, { size: 14 })
      )
    ),
    
    // 태스크 정보
    React.createElement('div', { className: 'flex items-start justify-between gap-4' },
      React.createElement('div', { className: 'flex-1' },
        React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
          React.createElement('h3', { className: textPrimary + ' font-bold text-lg' }, task.title),
          isRecommended && React.createElement('span', { 
            className: 'px-2 py-0.5 bg-[#A996FF]/20 text-[#A996FF] text-xs rounded-full font-medium' 
          }, '추천')
        ),
        React.createElement('p', { className: textSecondary + ' text-sm' },
          domain && (domain + ' · '),
          deadlineText || durationText
        )
      ),
      
      // 시작 버튼
      React.createElement('button', {
        onClick: function() { if (onStart) onStart(task); },
        className: 'px-5 py-3 bg-[#A996FF] text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-[#A996FF]/30 hover:bg-[#8B7CF7] transition-all'
      },
        React.createElement(Zap, { size: 18 }),
        '시작'
      )
    )
  );
};

// 📋 "오늘 한눈에" 미니 타임라인
export var MiniTimeline = function(props) {
  var events = props.events || [];
  var tasks = props.tasks || [];
  var darkMode = props.darkMode;
  var onExpand = props.onExpand;
  var onStartTask = props.onStartTask;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
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
          timeStr: startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
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
  
  // 빈 시간 계산
  var getGapBefore = function(item, prevItem) {
    var startMin = item.startTime.getHours() * 60 + item.startTime.getMinutes();
    var prevEndMin = prevItem 
      ? (prevItem.startTime.getHours() * 60 + prevItem.startTime.getMinutes() + (prevItem.duration || 60))
      : 8 * 60; // 8시 시작
    
    var gap = startMin - prevEndMin;
    if (gap >= 30) {
      var startStr = Math.floor(prevEndMin / 60).toString().padStart(2, '0') + ':' + (prevEndMin % 60).toString().padStart(2, '0');
      var endStr = Math.floor(startMin / 60).toString().padStart(2, '0') + ':' + (startMin % 60).toString().padStart(2, '0');
      var hours = Math.floor(gap / 60);
      var mins = gap % 60;
      var durationStr = hours > 0 ? hours + '시간 ' + mins + '분' : mins + '분';
      return { startStr: startStr, endStr: endStr, duration: gap, durationStr: durationStr };
    }
    return null;
  };
  
  // 타임라인 바 위치 계산
  var getTimePosition = function(date) {
    var mins = date.getHours() * 60 + date.getMinutes();
    var dayStart = 7 * 60;
    var dayEnd = 22 * 60;
    return Math.max(0, Math.min(100, ((mins - dayStart) / (dayEnd - dayStart)) * 100));
  };
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl border ' + borderColor + ' overflow-hidden mb-4' },
    // 헤더
    React.createElement('div', { className: 'p-4 pb-2' },
      React.createElement('div', { className: 'flex items-center justify-between mb-3' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', { className: 'text-lg' }, '📋'),
          React.createElement('span', { className: textPrimary + ' font-bold' }, '오늘 한눈에'),
          React.createElement('span', { className: 'text-xs px-2 py-0.5 bg-[#A996FF]/10 text-[#A996FF] rounded-full' }, '드래그로 이동')
        ),
        React.createElement('span', { className: textSecondary + ' text-sm' }, completedCount + '/' + totalCount + ' 완료')
      ),
      
      // 현재 시간 + 다음 일정
      React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
        React.createElement('div', { className: 'px-4 py-2 bg-[#A996FF] text-white rounded-full flex items-center gap-2' },
          React.createElement('div', { className: 'w-2 h-2 bg-white rounded-full animate-pulse' }),
          React.createElement('span', { className: 'font-medium' }, '지금 ' + currentTimeStr)
        ),
        nextItem && React.createElement('span', { className: textSecondary + ' text-sm' },
          '→ ' + nextItem.title.substring(0, 10) + (nextItem.title.length > 10 ? '...' : '') + ' ',
          React.createElement('span', { className: 'text-[#A996FF] font-medium' }, nextItemMin + '분 후')
        )
      ),
      
      // 타임라인 바
      React.createElement('div', { className: 'relative h-2 bg-gray-100 rounded-full mb-1 ' + (darkMode ? 'bg-gray-700' : '') },
        // 현재 시간까지 진행
        React.createElement('div', { 
          className: 'absolute h-full bg-gradient-to-r from-[#E5E0FF] to-[#A996FF] rounded-full',
          style: { width: getTimePosition(now) + '%' }
        }),
        // 이벤트 포인트들
        todayItems.map(function(item) {
          var pos = getTimePosition(item.startTime);
          var isPast = item.startTime < now;
          return React.createElement('div', {
            key: item.id,
            className: 'absolute w-3 h-3 rounded-full -top-0.5 transform -translate-x-1/2 ' +
              (item.type === 'event' ? 'bg-blue-500' : 'bg-green-500') +
              (isPast ? ' opacity-50' : ''),
            style: { left: pos + '%' }
          });
        })
      ),
      
      // 시간 라벨
      React.createElement('div', { className: 'flex justify-between text-xs ' + textSecondary },
        React.createElement('span', null, '7:00'),
        React.createElement('span', null, '12:00'),
        React.createElement('span', null, '18:00'),
        React.createElement('span', null, '22:00')
      )
    ),
    
    // 아이템 리스트
    React.createElement('div', { className: 'px-4 pb-4 space-y-2 max-h-80 overflow-y-auto' },
      todayItems.map(function(item, idx) {
        var prevItem = idx > 0 ? todayItems[idx - 1] : null;
        var gap = getGapBefore(item, prevItem);
        var isPast = item.startTime < now;
        var isOngoing = item.startTime <= now && (!item.duration || 
          new Date(item.startTime.getTime() + item.duration * 60000) > now);
        
        return React.createElement(React.Fragment, { key: item.id },
          // 빈 시간 슬롯
          gap && React.createElement('div', { 
            className: 'flex items-center gap-3 p-3 border-2 border-dashed rounded-xl ' + 
              (darkMode ? 'border-gray-700' : 'border-gray-200')
          },
            React.createElement('div', { className: 'w-3 h-3 rounded-full bg-gray-300 ' + (darkMode ? 'bg-gray-600' : '') }),
            React.createElement('span', { className: textSecondary + ' text-sm' }, 
              gap.startStr + ' - ' + gap.endStr
            ),
            React.createElement('span', { 
              className: 'px-2 py-0.5 text-xs rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' ' + textSecondary 
            }, gap.durationStr + ' 비어있어요')
          ),
          
          // 아이템
          React.createElement('div', { 
            className: 'flex items-center gap-3 p-3 rounded-xl transition-all ' +
              (isOngoing ? 'bg-[#A996FF]/10 border border-[#A996FF]' : 
               isPast ? (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') : 
               (darkMode ? 'bg-gray-700' : 'bg-gray-50'))
          },
            // 시간
            React.createElement('div', { className: 'text-sm font-medium w-14 ' + (isPast ? textSecondary : textPrimary) },
              item.timeStr
            ),
            
            // 타입 아이콘
            React.createElement('div', { 
              className: 'w-8 h-8 rounded-lg flex items-center justify-center ' +
                (item.type === 'event' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600')
            },
              item.type === 'event' 
                ? React.createElement(Calendar, { size: 16 })
                : React.createElement(CheckSquare, { size: 16 })
            ),
            
            // 제목
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement('p', { 
                className: 'font-medium truncate ' + (isPast ? textSecondary + ' line-through' : textPrimary) 
              }, item.title),
              item.project && React.createElement('p', { className: textSecondary + ' text-xs' }, item.project)
            ),
            
            // 소요시간 & 시작 버튼
            item.type === 'task' && !isPast && React.createElement(React.Fragment, null,
              item.duration && React.createElement('span', { className: textSecondary + ' text-xs' }, '~' + item.duration + '분'),
              React.createElement('button', {
                onClick: function() { if (onStartTask) onStartTask(item.original); },
                className: 'px-3 py-1.5 bg-[#A996FF] text-white text-sm rounded-lg flex items-center gap-1'
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
        className: 'text-center py-8 ' + textSecondary 
      }, '오늘 일정이 없어요 ✨')
    )
  );
};

export default {
  AlfredoGreeting: AlfredoGreeting,
  TodaySummary: TodaySummary,
  UpcomingEventCard: UpcomingEventCard,
  FocusNow: FocusNow,
  MiniTimeline: MiniTimeline
};
