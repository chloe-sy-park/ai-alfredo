import React, { useState, useMemo } from 'react';
import { Sun, Moon, ChevronRight, Check, Calendar, Clock, RefreshCw, Sparkles, X, ArrowRight } from 'lucide-react';

// 🌅 내일 준비 체크리스트 기본 아이템
var DEFAULT_PREP_ITEMS = [
  { id: 'water', text: '물 한 잔 마시기', emoji: '💧', category: 'health' },
  { id: 'phone', text: '폰 충전해두기', emoji: '🔋', category: 'practical' },
  { id: 'clothes', text: '내일 입을 옷 준비', emoji: '👔', category: 'practical' },
  { id: 'bag', text: '가방 미리 챙기기', emoji: '🎒', category: 'practical' },
  { id: 'alarm', text: '알람 설정하기', emoji: '⏰', category: 'practical' },
  { id: 'gratitude', text: '오늘 감사한 것 1개', emoji: '💜', category: 'wellness' },
  { id: 'stretch', text: '가벼운 스트레칭', emoji: '🧘', category: 'health' },
  { id: 'teeth', text: '양치하기', emoji: '🦷', category: 'health' }
];

// 우선순위 순서 (아침에 급한 것부터)
var PRIORITY_ORDER = ['alarm', 'clothes', 'bag', 'phone', 'water', 'teeth', 'stretch', 'gratitude'];

// 🌙 "내일의 나" 컴포넌트
export var TomorrowPrep = function(props) {
  var tasks = props.tasks || [];
  var tomorrowEvents = props.tomorrowEvents || [];
  var userName = props.userName || 'Boss';
  var onClose = props.onClose;
  var onRolloverTask = props.onRolloverTask;
  
  var checkedState = useState([]);
  var checkedItems = checkedState[0];
  var setCheckedItems = checkedState[1];
  
  var showAllItemsState = useState(false);
  var showAllItems = showAllItemsState[0];
  var setShowAllItems = showAllItemsState[1];
  
  // 미완료 태스크
  var incompleteTasks = useMemo(function() {
    return tasks.filter(function(t) { return !t.completed; });
  }, [tasks]);
  
  // 내일 첫 일정
  var firstEvent = tomorrowEvents.length > 0 ? tomorrowEvents[0] : null;
  var firstEventTime = firstEvent 
    ? new Date(firstEvent.start || firstEvent.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : null;
  
  // 준비 아이템 (기본 5개, 더보기로 전체)
  var prepItems = showAllItems 
    ? DEFAULT_PREP_ITEMS.sort(function(a, b) {
        return PRIORITY_ORDER.indexOf(a.id) - PRIORITY_ORDER.indexOf(b.id);
      })
    : DEFAULT_PREP_ITEMS.slice(0, 5);
  
  // 체크 토글
  var toggleCheck = function(itemId) {
    setCheckedItems(function(prev) {
      if (prev.includes(itemId)) {
        return prev.filter(function(id) { return id !== itemId; });
      }
      return prev.concat([itemId]);
    });
  };
  
  // 완료율
  var completionRate = prepItems.length > 0 
    ? Math.round((checkedItems.length / prepItems.length) * 100) 
    : 0;
  
  return React.createElement('div', {
    className: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl overflow-hidden'
  },
    // 헤더
    React.createElement('div', {
      className: 'p-5 flex items-center justify-between border-b border-white/10'
    },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('span', { className: 'text-3xl' }, '🌅'),
        React.createElement('div', null,
          React.createElement('h3', {
            className: 'text-white font-bold text-lg'
          }, '내일을 위한 준비'),
          React.createElement('p', {
            className: 'text-indigo-300 text-sm'
          }, '내일의 ' + userName + '을 위해')
        )
      ),
      onClose && React.createElement('button', {
        className: 'p-2 rounded-full hover:bg-white/10 transition-colors',
        onClick: onClose
      },
        React.createElement(X, { size: 20, className: 'text-indigo-300' })
      )
    ),
    
    // 내일 일정 미리보기
    tomorrowEvents.length > 0 && React.createElement('div', {
      className: 'px-5 py-4 bg-white/5 border-b border-white/10'
    },
      React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
        React.createElement(Calendar, { size: 16, className: 'text-indigo-300' }),
        React.createElement('span', { className: 'text-indigo-200 text-sm font-medium' }, '내일 일정')
      ),
      
      // 첫 번째 일정 강조
      firstEvent && React.createElement('div', {
        className: 'bg-indigo-500/30 rounded-xl p-3 mb-2'
      },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(Clock, { size: 14, className: 'text-indigo-300' }),
          React.createElement('span', { className: 'text-white font-medium' }, firstEventTime),
          React.createElement('span', { className: 'text-indigo-200' }, '첫 일정')
        ),
        React.createElement('p', {
          className: 'text-white mt-1 truncate'
        }, firstEvent.title || firstEvent.summary || '일정')
      ),
      
      // 나머지 일정 요약
      tomorrowEvents.length > 1 && React.createElement('p', {
        className: 'text-indigo-300 text-sm'
      }, '외 ' + (tomorrowEvents.length - 1) + '개 일정이 있어요')
    ),
    
    // 미완료 태스크 (롤오버)
    incompleteTasks.length > 0 && React.createElement('div', {
      className: 'px-5 py-4 border-b border-white/10'
    },
      React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
        React.createElement(RefreshCw, { size: 16, className: 'text-orange-300' }),
        React.createElement('span', { className: 'text-orange-200 text-sm font-medium' }, 
          '오늘 못 끝낸 것 (' + incompleteTasks.length + '개)'
        )
      ),
      
      React.createElement('div', { className: 'space-y-2' },
        incompleteTasks.slice(0, 3).map(function(task, index) {
          return React.createElement('div', {
            key: task.id || index,
            className: 'flex items-center justify-between bg-white/5 rounded-lg px-3 py-2'
          },
            React.createElement('span', {
              className: 'text-white text-sm truncate flex-1'
            }, task.title),
            React.createElement('span', {
              className: 'text-indigo-300 text-xs flex-shrink-0 ml-2'
            }, '→ 내일')
          );
        }),
        incompleteTasks.length > 3 && React.createElement('p', {
          className: 'text-indigo-400 text-xs'
        }, '외 ' + (incompleteTasks.length - 3) + '개')
      ),
      
      React.createElement('p', {
        className: 'text-indigo-300 text-sm mt-3'
      }, '괜찮아요, 내일 다시 시작하면 돼요 💜')
    ),
    
    // 준비 체크리스트
    React.createElement('div', { className: 'px-5 py-4' },
      React.createElement('div', { className: 'flex items-center justify-between mb-3' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(Sparkles, { size: 16, className: 'text-yellow-300' }),
          React.createElement('span', { className: 'text-yellow-200 text-sm font-medium' }, '잠들기 전 준비')
        ),
        completionRate > 0 && React.createElement('span', {
          className: 'text-xs text-indigo-300'
        }, completionRate + '% 완료')
      ),
      
      React.createElement('div', { className: 'space-y-2' },
        prepItems.map(function(item) {
          var isChecked = checkedItems.includes(item.id);
          return React.createElement('button', {
            key: item.id,
            className: 'w-full flex items-center gap-3 p-3 rounded-xl transition-all ' +
              (isChecked 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-white/5 hover:bg-white/10 border border-transparent'),
            onClick: function() { toggleCheck(item.id); }
          },
            // 체크박스
            React.createElement('div', {
              className: 'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ' +
                (isChecked 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-indigo-400')
            },
              isChecked && React.createElement(Check, { size: 14, className: 'text-white' })
            ),
            // 이모지
            React.createElement('span', { className: 'text-lg' }, item.emoji),
            // 텍스트
            React.createElement('span', {
              className: 'text-sm flex-1 text-left ' + 
                (isChecked ? 'text-green-300 line-through' : 'text-white')
            }, item.text)
          );
        })
      ),
      
      // 더보기/접기
      !showAllItems && React.createElement('button', {
        className: 'w-full mt-3 py-2 text-indigo-300 text-sm hover:text-white transition-colors',
        onClick: function() { setShowAllItems(true); }
      }, '더보기 →'),
      
      showAllItems && React.createElement('button', {
        className: 'w-full mt-3 py-2 text-indigo-300 text-sm hover:text-white transition-colors',
        onClick: function() { setShowAllItems(false); }
      }, '접기')
    ),
    
    // 하단 격려 메시지
    React.createElement('div', {
      className: 'px-5 py-4 bg-white/5 border-t border-white/10 text-center'
    },
      completionRate >= 80
        ? React.createElement('p', { className: 'text-green-300' }, 
            '완벽해요! 푹 주무세요 🌙'
          )
        : completionRate >= 50
          ? React.createElement('p', { className: 'text-indigo-200' }, 
              '잘하고 있어요! 조금만 더 💜'
            )
          : React.createElement('p', { className: 'text-indigo-300' }, 
              '하나씩 체크해보세요 ✨'
            )
    )
  );
};

// 🌙 간단한 내일 준비 카드 (홈 화면용)
export var TomorrowPrepCard = function(props) {
  var incompleteTasks = props.incompleteTasks || [];
  var tomorrowEventCount = props.tomorrowEventCount || 0;
  var onOpenFull = props.onOpenFull;
  
  return React.createElement('div', {
    className: 'mx-4 mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow',
    onClick: onOpenFull
  },
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('span', { className: 'text-2xl' }, '🌅'),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-white font-medium' }, '내일을 위한 준비'),
          React.createElement('p', { className: 'text-white/70 text-sm' },
            (incompleteTasks.length > 0 ? incompleteTasks.length + '개 롤오버 · ' : '') +
            (tomorrowEventCount > 0 ? tomorrowEventCount + '개 일정' : '일정 없음')
          )
        )
      ),
      React.createElement(ChevronRight, { size: 20, className: 'text-white/70' })
    )
  );
};

// 🌅 내일 미리보기 모달
export var TomorrowModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var tasks = props.tasks || [];
  var tomorrowEvents = props.tomorrowEvents || [];
  var userName = props.userName || 'Boss';
  
  if (!isOpen) return null;
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4'
  },
    // 배경
    React.createElement('div', {
      className: 'absolute inset-0 bg-black/60',
      onClick: onClose
    }),
    
    // 모달
    React.createElement('div', {
      className: 'relative w-full max-w-md max-h-[80vh] overflow-y-auto'
    },
      React.createElement(TomorrowPrep, {
        tasks: tasks,
        tomorrowEvents: tomorrowEvents,
        userName: userName,
        onClose: onClose
      })
    )
  );
};

// 🌙 나이트 모드에서 사용할 간단 버전
export var TomorrowPrepSimple = function(props) {
  var onOpenFull = props.onOpenFull;
  
  var quickItems = [
    { id: 'water', text: '물 한 잔', emoji: '💧' },
    { id: 'phone', text: '폰 내려놓기', emoji: '📱' }
  ];
  
  return React.createElement('div', {
    className: 'bg-white/10 backdrop-blur rounded-2xl p-5'
  },
    React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
      React.createElement(Moon, { size: 18, className: 'text-yellow-400' }),
      React.createElement('span', { className: 'text-white font-medium' }, '잠들기 전에')
    ),
    
    React.createElement('div', { className: 'space-y-2' },
      quickItems.map(function(item) {
        return React.createElement('button', {
          key: item.id,
          className: 'w-full py-3 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors'
        }, item.emoji + ' ' + item.text);
      })
    ),
    
    onOpenFull && React.createElement('button', {
      className: 'w-full mt-3 py-2 text-indigo-300 text-sm hover:text-white transition-colors flex items-center justify-center gap-1',
      onClick: onOpenFull
    },
      '내일 준비 더 보기',
      React.createElement(ArrowRight, { size: 14 })
    )
  );
};

export default {
  TomorrowPrep: TomorrowPrep,
  TomorrowPrepCard: TomorrowPrepCard,
  TomorrowModal: TomorrowModal,
  TomorrowPrepSimple: TomorrowPrepSimple
};
