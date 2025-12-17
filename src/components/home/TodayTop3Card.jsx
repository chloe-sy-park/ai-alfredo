import React from 'react';
import { Star, CheckCircle2, Circle, Clock, Flame, ChevronRight } from 'lucide-react';

// 🌟 오늘의 Top 3 카드
export var TodayTop3Card = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var onTaskClick = props.onTaskClick;
  var onStartTask = props.onStartTask;
  
  // Top 3 태스크 선정 로직
  var topTasks = React.useMemo(function() {
    var now = new Date();
    var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
    
    // 스코어링
    var scored = incompleteTasks.map(function(t) {
      var score = 0;
      
      // 우선순위 점수
      if (t.priority === 'high' || t.importance >= 4) score += 100;
      else if (t.priority === 'medium' || t.importance >= 3) score += 50;
      
      // 마감일 점수
      if (t.deadline || t.dueDate) {
        var deadline = new Date(t.deadline || t.dueDate);
        var diffHours = (deadline - now) / 1000 / 60 / 60;
        if (diffHours <= 2) score += 200; // 긴급
        else if (diffHours <= 24) score += 100;
        else if (diffHours <= 48) score += 50;
      }
      
      // 예정 시간 점수
      if (t.scheduledTime) {
        var parts = t.scheduledTime.split(':');
        var scheduledHour = parseInt(parts[0], 10);
        var currentHour = now.getHours();
        if (scheduledHour <= currentHour + 2) score += 80;
      }
      
      return Object.assign({}, t, { score: score });
    });
    
    // 정렬 후 Top 3
    return scored
      .sort(function(a, b) { return b.score - a.score; })
      .slice(0, 3);
  }, [tasks]);
  
  // 완료된 Top 3 개수
  var completedTop3 = topTasks.filter(function(t) { return t.completed; }).length;
  
  // 태스크가 없으면 표시하지 않음
  if (topTasks.length === 0) {
    return React.createElement('div', {
      className: 'rounded-2xl p-5 text-center ' +
        (darkMode 
          ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10'
          : 'bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100')
    },
      React.createElement('div', { className: 'flex items-center justify-center gap-2 mb-2' },
        React.createElement(Star, { 
          size: 18, 
          className: 'text-amber-400',
          fill: 'currentColor'
        }),
        React.createElement('h3', {
          className: 'font-semibold ' + (darkMode ? 'text-white' : 'text-gray-900')
        }, '오늘의 Top 3')
      ),
      React.createElement('p', {
        className: 'text-sm ' + (darkMode ? 'text-white/50' : 'text-gray-400')
      }, '아직 할 일이 없어요. 추가해볼까요?')
    );
  }
  
  return React.createElement('div', {
    className: 'rounded-2xl overflow-hidden ' +
      (darkMode 
        ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-white/10'
        : 'bg-white border border-gray-100 shadow-sm')
  },
    // 헤더
    React.createElement('div', {
      className: 'px-5 py-4 flex items-center justify-between ' +
        (darkMode 
          ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-white/5'
          : 'bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/50')
    },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', {
          className: 'w-8 h-8 rounded-xl flex items-center justify-center ' +
            'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25'
        },
          React.createElement(Star, { size: 16, className: 'text-white', fill: 'white' })
        ),
        React.createElement('div', null,
          React.createElement('h3', {
            className: 'font-bold text-sm ' + (darkMode ? 'text-white' : 'text-gray-900')
          }, '오늘의 Top 3'),
          React.createElement('p', {
            className: 'text-xs ' + (darkMode ? 'text-white/50' : 'text-gray-400')
          }, '가장 중요한 것부터')
        )
      ),
      
      // 진행률
      React.createElement('div', {
        className: 'flex items-center gap-1.5 px-3 py-1.5 rounded-full ' +
          (darkMode ? 'bg-white/10' : 'bg-amber-100/50')
      },
        React.createElement(Flame, { size: 14, className: 'text-orange-500' }),
        React.createElement('span', {
          className: 'text-xs font-semibold ' + (darkMode ? 'text-white' : 'text-amber-700')
        }, completedTop3 + '/' + topTasks.length)
      )
    ),
    
    // 태스크 목록
    React.createElement('div', { className: 'divide-y ' + (darkMode ? 'divide-white/5' : 'divide-gray-100') },
      topTasks.map(function(task, index) {
        var isUrgent = task.score >= 200;
        var priorityColor = task.priority === 'high' 
          ? 'from-red-500 to-pink-500'
          : task.priority === 'medium'
            ? 'from-amber-500 to-orange-500'
            : 'from-blue-500 to-cyan-500';
        
        return React.createElement('div', {
          key: task.id,
          className: 'px-5 py-4 flex items-center gap-4 group cursor-pointer ' +
            'transition-colors ' +
            (darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50')
        },
          // 순위 뱃지
          React.createElement('div', {
            className: 'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' +
              'bg-gradient-to-br ' + priorityColor + ' text-white font-bold text-sm ' +
              'shadow-lg ' + (index === 0 ? 'shadow-amber-500/30' : 'shadow-gray-500/20')
          }, index + 1),
          
          // 태스크 정보
          React.createElement('div', { 
            className: 'flex-1 min-w-0',
            onClick: function() { if (onTaskClick) onTaskClick(task); }
          },
            React.createElement('p', {
              className: 'font-medium truncate ' + 
                (darkMode ? 'text-white' : 'text-gray-900') +
                (task.completed ? ' line-through opacity-50' : '')
            }, task.title),
            
            // 메타 정보
            React.createElement('div', { className: 'flex items-center gap-2 mt-1' },
              // 긴급 태그
              isUrgent && React.createElement('span', {
                className: 'px-2 py-0.5 rounded-full text-[10px] font-semibold ' +
                  'bg-red-500/10 text-red-500'
              }, '긴급'),
              
              // 예상 시간
              task.estimatedMinutes && React.createElement('span', {
                className: 'flex items-center gap-1 text-xs ' +
                  (darkMode ? 'text-white/40' : 'text-gray-400')
              },
                React.createElement(Clock, { size: 10 }),
                task.estimatedMinutes + '분'
              ),
              
              // 마감일
              (task.deadline || task.dueDate) && React.createElement('span', {
                className: 'text-xs ' + 
                  (isUrgent 
                    ? 'text-red-500 font-medium'
                    : (darkMode ? 'text-white/40' : 'text-gray-400'))
              }, function() {
                var d = new Date(task.deadline || task.dueDate);
                var now = new Date();
                var diffHours = (d - now) / 1000 / 60 / 60;
                if (diffHours <= 2) return Math.round(diffHours * 60) + '분 후 마감';
                if (diffHours <= 24) return Math.round(diffHours) + '시간 후';
                return (d.getMonth() + 1) + '/' + d.getDate();
              }())
            )
          ),
          
          // 시작 버튼
          !task.completed && React.createElement('button', {
            onClick: function(e) {
              e.stopPropagation();
              if (onStartTask) onStartTask(task);
            },
            className: 'px-4 py-2 rounded-xl text-xs font-semibold transition-all ' +
              'opacity-0 group-hover:opacity-100 ' +
              'bg-gradient-to-r from-purple-500 to-indigo-500 text-white ' +
              'hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105'
          }, '시작'),
          
          // 완료 체크
          task.completed && React.createElement(CheckCircle2, {
            size: 24,
            className: 'text-green-500 flex-shrink-0'
          }),
          
          // 화살표 (모바일)
          !task.completed && React.createElement(ChevronRight, {
            size: 16,
            className: 'flex-shrink-0 group-hover:hidden ' +
              (darkMode ? 'text-white/20' : 'text-gray-300')
          })
        );
      })
    ),
    
    // 동기부여 메시지
    completedTop3 > 0 && React.createElement('div', {
      className: 'px-5 py-3 text-center ' +
        (darkMode 
          ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-t border-white/5'
          : 'bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100/50')
    },
      React.createElement('p', {
        className: 'text-sm font-medium ' + (darkMode ? 'text-green-400' : 'text-green-600')
      }, completedTop3 === topTasks.length 
        ? '🎉 오늘의 Top 3 완료! 대단해요!'
        : '💪 ' + completedTop3 + '개 완료! ' + (topTasks.length - completedTop3) + '개 남았어요')
    )
  );
};

export default TodayTop3Card;
