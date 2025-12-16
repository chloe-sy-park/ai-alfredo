import React, { useMemo } from 'react';
import { Moon, CheckCircle, Sun, Calendar, Clock, ChevronRight, Sparkles } from 'lucide-react';

// 🌙 나이트 모드 화면 (21시 이후)
export var NightModeView = function(props) {
  var darkMode = props.darkMode;
  var userName = props.userName || 'Boss';
  var tasks = props.tasks || [];
  var events = props.events || [];
  var focusMinutes = props.focusMinutes || 0;
  var onReadyForTomorrow = props.onReadyForTomorrow;
  var onViewDetails = props.onViewDetails;
  
  // 오늘 통계
  var todayStats = useMemo(function() {
    var completedTasks = tasks.filter(function(t) { return t.completed; });
    return {
      completed: completedTasks.length,
      total: tasks.length
    };
  }, [tasks]);
  
  // 내일 일정
  var tomorrowEvents = useMemo(function() {
    var now = new Date();
    var tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    var tomorrowStr = tomorrow.toDateString();
    
    return events.filter(function(e) {
      var eventDate = new Date(e.start || e.startTime);
      return eventDate.toDateString() === tomorrowStr;
    }).sort(function(a, b) {
      return new Date(a.start || a.startTime) - new Date(b.start || b.startTime);
    }).slice(0, 3);
  }, [events]);
  
  // 내일 마감 태스크
  var tomorrowDeadlines = useMemo(function() {
    var now = new Date();
    var tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    var tomorrowStr = tomorrow.toDateString();
    
    return tasks.filter(function(t) {
      if (t.completed) return false;
      if (!t.dueDate && !t.deadline) return false;
      var due = new Date(t.dueDate || t.deadline);
      return due.toDateString() === tomorrowStr;
    }).slice(0, 3);
  }, [tasks]);
  
  // 감사 메시지
  var getThankYouMessage = function() {
    if (todayStats.completed >= 5) {
      return '오늘 ' + todayStats.completed + '개나 해내셨어요! 진짜 대단해요 🎉';
    }
    if (todayStats.completed > 0) {
      return '오늘도 수고 많으셨어요. ' + todayStats.completed + '개 완료했어요 👏';
    }
    return '괜찮아요. 쉬는 것도 중요해요 💜';
  };
  
  return React.createElement('div', {
    className: 'min-h-[70vh] flex flex-col items-center justify-center px-6 py-8 animate-fadeIn'
  },
    // 달 아이콘
    React.createElement('div', {
      className: 'w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30 animate-pulse-soft'
    },
      React.createElement('span', { className: 'text-5xl' }, '🌙')
    ),
    
    // 메인 메시지
    React.createElement('h1', {
      className: (darkMode ? 'text-white' : 'text-gray-100') + 
        ' text-2xl font-bold text-center mb-2'
    }, userName + ', 오늘 수고했어요'),
    
    React.createElement('p', {
      className: 'text-gray-400 text-center mb-8'
    }, getThankYouMessage()),
    
    // 오늘 요약 카드
    React.createElement('div', {
      className: 'w-full max-w-sm rounded-2xl p-5 mb-6 ' +
        (darkMode ? 'bg-white/5' : 'bg-white/10')
    },
      React.createElement('h3', {
        className: 'text-gray-400 text-sm font-medium mb-4 flex items-center gap-2'
      },
        React.createElement(Sparkles, { size: 14 }),
        '오늘 요약'
      ),
      
      // 통계
      React.createElement('div', { className: 'flex items-center justify-around mb-4' },
        React.createElement('div', { className: 'text-center' },
          React.createElement('div', { className: 'flex items-center justify-center gap-1 mb-1' },
            React.createElement(CheckCircle, { size: 18, className: 'text-green-400' }),
            React.createElement('span', { 
              className: (darkMode ? 'text-white' : 'text-gray-100') + ' text-2xl font-bold'
            }, todayStats.completed)
          ),
          React.createElement('span', { className: 'text-gray-500 text-xs' }, '완료')
        ),
        React.createElement('div', {
          className: 'w-px h-10 ' + (darkMode ? 'bg-gray-700' : 'bg-gray-600')
        }),
        React.createElement('div', { className: 'text-center' },
          React.createElement('div', { className: 'flex items-center justify-center gap-1 mb-1' },
            React.createElement(Clock, { size: 18, className: 'text-blue-400' }),
            React.createElement('span', { 
              className: (darkMode ? 'text-white' : 'text-gray-100') + ' text-2xl font-bold'
            }, focusMinutes)
          ),
          React.createElement('span', { className: 'text-gray-500 text-xs' }, '분 집중')
        )
      )
    ),
    
    // 내일 미리보기
    (tomorrowEvents.length > 0 || tomorrowDeadlines.length > 0) && 
    React.createElement('div', {
      className: 'w-full max-w-sm rounded-2xl p-5 mb-6 ' +
        (darkMode ? 'bg-white/5' : 'bg-white/10')
    },
      React.createElement('h3', {
        className: 'text-gray-400 text-sm font-medium mb-4 flex items-center gap-2'
      },
        React.createElement(Sun, { size: 14 }),
        '내일 중요한 것'
      ),
      
      // 내일 일정
      tomorrowEvents.map(function(event, idx) {
        var eventTime = new Date(event.start || event.startTime);
        var timeStr = eventTime.getHours().toString().padStart(2, '0') + ':' + 
          eventTime.getMinutes().toString().padStart(2, '0');
        
        return React.createElement('div', {
          key: 'event-' + idx,
          className: 'flex items-center gap-3 py-2'
        },
          React.createElement(Calendar, { size: 14, className: 'text-purple-400 flex-shrink-0' }),
          React.createElement('span', { className: 'text-gray-400 text-sm w-12' }, timeStr),
          React.createElement('span', { 
            className: (darkMode ? 'text-gray-200' : 'text-gray-100') + ' text-sm truncate'
          }, event.title || event.summary)
        );
      }),
      
      // 내일 마감
      tomorrowDeadlines.map(function(task, idx) {
        return React.createElement('div', {
          key: 'task-' + idx,
          className: 'flex items-center gap-3 py-2'
        },
          React.createElement('span', { className: 'text-orange-400' }, '🔥'),
          React.createElement('span', { className: 'text-orange-400 text-sm w-12' }, '마감'),
          React.createElement('span', { 
            className: (darkMode ? 'text-gray-200' : 'text-gray-100') + ' text-sm truncate'
          }, task.title)
        );
      })
    ),
    
    // 내일 준비 완료 버튼
    React.createElement('button', {
      onClick: onReadyForTomorrow,
      className: 'w-full max-w-sm py-4 rounded-2xl font-bold text-lg transition-all btn-press ' +
        'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white shadow-lg shadow-[#A996FF]/30 hover:shadow-xl'
    }, '내일 준비 완료 ✓'),
    
    // 마무리 메시지
    React.createElement('p', {
      className: 'mt-6 text-gray-500 text-sm text-center'
    }, '💜 푹 쉬세요. 내일 제가 깨워드릴게요.'),
    
    // 상세 보기 (선택)
    onViewDetails && React.createElement('button', {
      onClick: onViewDetails,
      className: 'mt-4 flex items-center gap-1 text-gray-500 text-sm btn-press hover:text-gray-400'
    },
      React.createElement('span', null, '오늘 뭘 했는지 보기'),
      React.createElement(ChevronRight, { size: 14 })
    )
  );
};

export default NightModeView;
