import React, { useMemo } from 'react';
import { Moon, Star, CheckCircle, Calendar, Sparkles, Heart, ChevronRight } from 'lucide-react';

// 시간대 체크
var getEveningPhase = function() {
  var hour = new Date().getHours();
  if (hour >= 17 && hour < 19) return 'earlyEvening';  // 퇴근 시간
  if (hour >= 19 && hour < 21) return 'evening';        // 저녁
  if (hour >= 21 && hour < 23) return 'lateEvening';    // 늦은 저녁
  return 'night';                                         // 밤
};

// 컨디션별 마무리 메시지
var getClosingMessage = function(phase, condition, completedCount, userName) {
  var name = userName || 'Boss';
  
  // 컨디션 안 좋았던 날
  if (condition && condition <= 2) {
    return {
      title: name + ', 오늘 수고 많았어요',
      subtitle: '힘든 날이었지만 하루를 버텼어요.\n그것만으로도 충분히 잘한 거예요. 💜',
      emoji: '🫂',
      mood: 'caring'
    };
  }
  
  // 아무것도 못 한 날
  if (completedCount === 0) {
    return {
      title: name + ', 오늘 쉬어가는 날이었죠',
      subtitle: '매일 달릴 순 없어요.\n쉬는 것도 생산적인 거예요.',
      emoji: '🌙',
      mood: 'understanding'
    };
  }
  
  // 많이 한 날 (5개 이상)
  if (completedCount >= 5) {
    return {
      title: name + ', 오늘 대단했어요!',
      subtitle: completedCount + '개나 해치웠어요. 진짜 열심히 했네요.\n이제 진짜 쉬어도 돼요!',
      emoji: '🎉',
      mood: 'proud'
    };
  }
  
  // 적당히 한 날 (1-4개)
  var messages = {
    earlyEvening: {
      title: name + ', 오늘 하루 어땠어요?',
      subtitle: completedCount + '개 완료했어요. 좋은 하루였죠?\n저녁 시간 여유롭게 보내세요.',
      emoji: '🌅',
      mood: 'warm'
    },
    evening: {
      title: name + ', 저녁 잘 보내고 있죠?',
      subtitle: '오늘 ' + completedCount + '개 해냈어요. 수고했어요!\n남은 저녁은 편하게 쉬세요.',
      emoji: '🍵',
      mood: 'cozy'
    },
    lateEvening: {
      title: name + ', 이제 쉴 시간이에요',
      subtitle: '오늘 ' + completedCount + '개 완료! 충분히 했어요.\n내일을 위해 에너지 충전해요.',
      emoji: '😌',
      mood: 'gentle'
    },
    night: {
      title: name + ', 이 시간엔 쉬셔야죠',
      subtitle: '오늘 할 건 끝났어요. ' + completedCount + '개나 했잖아요.\n이제 내일의 ' + name + '에게 맡기고 자요.',
      emoji: '💤',
      mood: 'sleepy'
    }
  };
  
  return messages[phase] || messages.evening;
};

// 오늘의 하이라이트 생성
var getTodayHighlights = function(completedTasks, events) {
  var highlights = [];
  
  // 완료한 태스크 중 중요한 것들
  if (completedTasks && completedTasks.length > 0) {
    var important = completedTasks.filter(function(t) {
      return t.priority === 'high' || t.isImportant;
    });
    
    if (important.length > 0) {
      highlights.push({
        type: 'achievement',
        icon: '🏆',
        text: '중요한 일 ' + important.length + '개 완료!'
      });
    }
    
    if (completedTasks.length >= 3) {
      highlights.push({
        type: 'streak',
        icon: '🔥',
        text: '오늘 ' + completedTasks.length + '개 해치웠어요'
      });
    }
  }
  
  // 오늘 있었던 미팅
  if (events && events.length > 0) {
    var todayEvents = events.filter(function(e) {
      var eventDate = new Date(e.start || e.startTime);
      return eventDate.toDateString() === new Date().toDateString();
    });
    
    if (todayEvents.length > 0) {
      highlights.push({
        type: 'meeting',
        icon: '📅',
        text: '미팅 ' + todayEvents.length + '개 참여'
      });
    }
  }
  
  return highlights;
};

// 내일 미리보기
var getTomorrowPreview = function(tasks, events) {
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var tomorrowStr = tomorrow.toDateString();
  
  var preview = {
    taskCount: 0,
    eventCount: 0,
    firstEvent: null,
    urgentTask: null
  };
  
  // 내일 태스크
  if (tasks) {
    var tomorrowTasks = tasks.filter(function(t) {
      if (t.completed) return false;
      if (!t.dueDate && !t.deadline) return false;
      var due = new Date(t.dueDate || t.deadline);
      return due.toDateString() === tomorrowStr;
    });
    preview.taskCount = tomorrowTasks.length;
    preview.urgentTask = tomorrowTasks[0];
  }
  
  // 내일 일정
  if (events) {
    var tomorrowEvents = events.filter(function(e) {
      var eventDate = new Date(e.start || e.startTime);
      return eventDate.toDateString() === tomorrowStr;
    }).sort(function(a, b) {
      return new Date(a.start || a.startTime) - new Date(b.start || b.startTime);
    });
    
    preview.eventCount = tomorrowEvents.length;
    preview.firstEvent = tomorrowEvents[0];
  }
  
  return preview;
};

// 포맷 시간
var formatTime = function(date) {
  if (!date) return '';
  var d = new Date(date);
  var hours = d.getHours();
  var minutes = d.getMinutes();
  var ampm = hours >= 12 ? '오후' : '오전';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return ampm + ' ' + hours + (minutes > 0 ? ':' + (minutes < 10 ? '0' : '') + minutes : '') + '시';
};

// 메인 저녁 브리핑 컴포넌트
export var EveningBriefing = function(props) {
  var darkMode = props.darkMode;
  var condition = props.condition || 3;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var userName = props.userName || 'Boss';
  var onTapAlfredo = props.onTapAlfredo;
  var onViewTomorrow = props.onViewTomorrow;
  
  var phase = getEveningPhase();
  
  // 오늘 완료한 태스크
  var completedTasks = useMemo(function() {
    return tasks.filter(function(t) { return t.completed; });
  }, [tasks]);
  
  // 마무리 메시지
  var closingMessage = getClosingMessage(phase, condition, completedTasks.length, userName);
  
  // 오늘 하이라이트
  var highlights = getTodayHighlights(completedTasks, events);
  
  // 내일 미리보기
  var tomorrowPreview = getTomorrowPreview(tasks, events);
  
  // 배경 그라데이션 (저녁 분위기)
  var getBgGradient = function() {
    if (phase === 'night') {
      return darkMode 
        ? 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e]' 
        : 'bg-gradient-to-br from-[#2d3436] to-[#636e72]';
    }
    if (phase === 'lateEvening') {
      return darkMode 
        ? 'bg-gradient-to-br from-[#2C2C3E] to-[#1D1D2F]' 
        : 'bg-gradient-to-br from-[#ddd6f3] to-[#faaca8]';
    }
    return darkMode 
      ? 'bg-gradient-to-br from-[#2C2C2E] to-[#1D1D1F]' 
      : 'bg-gradient-to-br from-[#ffecd2] to-[#fcb69f]';
  };
  
  return React.createElement('div', { 
    className: 'rounded-3xl overflow-hidden mb-6 shadow-xl animate-fadeIn ' + getBgGradient()
  },
    React.createElement('div', { className: 'p-5' },
      
      // 헤더: 알프레도 + 인사
      React.createElement('div', { className: 'flex items-start gap-4 mb-5' },
        // 알프레도 아바타
        React.createElement('button', { 
          onClick: onTapAlfredo,
          className: 'relative flex-shrink-0 group'
        },
          React.createElement('div', { 
            className: 'w-16 h-16 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-3xl shadow-xl shadow-[#A996FF]/40 transition-transform group-hover:scale-105 group-active:scale-95'
          }, '🐧'),
          React.createElement('div', {
            className: 'absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-sm'
          }, closingMessage.emoji)
        ),
        
        // 마무리 메시지
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('div', { 
            className: 'relative rounded-2xl p-4 ' +
              (darkMode ? 'bg-white/10' : 'bg-white/70')
          },
            React.createElement('div', {
              className: 'absolute left-[-8px] top-4 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ' +
                (darkMode ? 'border-r-[8px] border-r-white/10' : 'border-r-[8px] border-r-white/70')
            }),
            React.createElement('h1', { 
              className: (darkMode ? 'text-white' : 'text-gray-900') + 
                ' text-lg font-bold leading-tight'
            }, closingMessage.title),
            React.createElement('p', { 
              className: (darkMode ? 'text-gray-300' : 'text-gray-600') + 
                ' text-sm mt-2 leading-relaxed whitespace-pre-line'
            }, closingMessage.subtitle)
          )
        )
      ),
      
      // 오늘 하이라이트 (있을 때만)
      highlights.length > 0 && React.createElement('div', { 
        className: 'mb-5'
      },
        React.createElement('div', { 
          className: 'flex items-center gap-2 mb-3 ' +
            (darkMode ? 'text-gray-400' : 'text-gray-500')
        },
          React.createElement(Star, { size: 14 }),
          React.createElement('span', { className: 'text-xs font-medium' }, '오늘의 하이라이트')
        ),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          highlights.map(function(h, idx) {
            return React.createElement('div', {
              key: idx,
              className: 'inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm ' +
                (darkMode ? 'bg-white/10 text-white' : 'bg-white/60 text-gray-700')
            },
              React.createElement('span', null, h.icon),
              React.createElement('span', null, h.text)
            );
          })
        )
      ),
      
      // 완료 목록 요약 (3개 이상일 때)
      completedTasks.length >= 1 && React.createElement('div', { 
        className: 'mb-5 p-4 rounded-2xl ' +
          (darkMode ? 'bg-white/5' : 'bg-white/50')
      },
        React.createElement('div', { 
          className: 'flex items-center gap-2 mb-3 ' +
            (darkMode ? 'text-green-400' : 'text-green-600')
        },
          React.createElement(CheckCircle, { size: 16 }),
          React.createElement('span', { className: 'text-sm font-medium' }, 
            '오늘 완료한 것들'
          )
        ),
        React.createElement('div', { className: 'space-y-2' },
          completedTasks.slice(0, 3).map(function(task, idx) {
            return React.createElement('div', {
              key: task.id || idx,
              className: 'flex items-center gap-2 text-sm ' +
                (darkMode ? 'text-gray-300' : 'text-gray-600')
            },
              React.createElement('span', { className: 'text-green-500' }, '✓'),
              React.createElement('span', { className: 'line-through opacity-70' }, 
                task.title || task.name
              )
            );
          }),
          completedTasks.length > 3 && React.createElement('div', {
            className: 'text-xs ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
          }, '외 ' + (completedTasks.length - 3) + '개 더')
        )
      ),
      
      // 내일 미리보기
      (tomorrowPreview.taskCount > 0 || tomorrowPreview.eventCount > 0) && 
      React.createElement('button', { 
        onClick: onViewTomorrow,
        className: 'w-full p-4 rounded-2xl text-left transition-all btn-press ' +
          (darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/50 hover:bg-white/70')
      },
        React.createElement('div', { 
          className: 'flex items-center justify-between'
        },
          React.createElement('div', null,
            React.createElement('div', { 
              className: 'flex items-center gap-2 mb-1 ' +
                (darkMode ? 'text-gray-400' : 'text-gray-500')
            },
              React.createElement(Calendar, { size: 14 }),
              React.createElement('span', { className: 'text-xs font-medium' }, '내일 미리보기')
            ),
            
            // 내일 첫 일정
            tomorrowPreview.firstEvent && React.createElement('p', { 
              className: 'text-sm ' + (darkMode ? 'text-white' : 'text-gray-800')
            },
              formatTime(tomorrowPreview.firstEvent.start || tomorrowPreview.firstEvent.startTime) + ' ',
              React.createElement('span', { className: 'font-medium' }, 
                tomorrowPreview.firstEvent.title || tomorrowPreview.firstEvent.summary
              )
            ),
            
            // 요약
            React.createElement('p', { 
              className: 'text-xs mt-1 ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
            },
              (tomorrowPreview.eventCount > 0 ? '일정 ' + tomorrowPreview.eventCount + '개' : '') +
              (tomorrowPreview.eventCount > 0 && tomorrowPreview.taskCount > 0 ? ' · ' : '') +
              (tomorrowPreview.taskCount > 0 ? '할 일 ' + tomorrowPreview.taskCount + '개' : '')
            )
          ),
          
          React.createElement(ChevronRight, { 
            size: 20, 
            className: darkMode ? 'text-gray-500' : 'text-gray-400'
          })
        )
      ),
      
      // 편안한 밤 되세요 메시지 (밤 시간에만)
      phase === 'night' && React.createElement('div', { 
        className: 'mt-5 text-center py-4'
      },
        React.createElement('div', { className: 'flex items-center justify-center gap-2 mb-2' },
          React.createElement(Moon, { 
            size: 20, 
            className: darkMode ? 'text-purple-400' : 'text-purple-500'
          }),
          React.createElement('span', { 
            className: 'text-lg ' + (darkMode ? 'text-white' : 'text-gray-800')
          }, '편안한 밤 되세요')
        ),
        React.createElement('p', { 
          className: 'text-xs ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
        }, '내일 아침에 다시 브리핑해드릴게요 🐧')
      ),
      
      // 알프레도와 대화하기
      React.createElement('button', {
        onClick: onTapAlfredo,
        className: 'w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-xl transition-all btn-press ' +
          (darkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-white/30 text-gray-400')
      },
        React.createElement(Heart, { size: 14 }),
        React.createElement('span', { className: 'text-xs' }, '알프레도에게 오늘 얘기하기')
      )
    )
  );
};

export default EveningBriefing;
