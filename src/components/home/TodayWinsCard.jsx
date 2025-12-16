import React, { useMemo } from 'react';
import { Trophy, CheckCircle, Target, Droplets, Flame, ChevronRight, Sparkles } from 'lucide-react';

// 🎉 오늘의 작은 승리 카드
export var TodayWinsCard = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var focusMinutes = props.focusMinutes || 0;
  var waterCount = props.waterCount || 0;
  var streak = props.streak || 0;
  var yesterdayCompleted = props.yesterdayCompleted || 0;
  var onClick = props.onClick;
  
  // 오늘 통계 계산
  var stats = useMemo(function() {
    var completedTasks = tasks.filter(function(t) { return t.completed; });
    var totalTasks = tasks.length;
    var completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
    
    // 어제 대비 성장률
    var growthRate = yesterdayCompleted > 0 
      ? Math.round(((completedTasks.length - yesterdayCompleted) / yesterdayCompleted) * 100)
      : 0;
    
    return {
      completed: completedTasks.length,
      total: totalTasks,
      completionRate: completionRate,
      growthRate: growthRate
    };
  }, [tasks, yesterdayCompleted]);
  
  // 격려 메시지
  var getMessage = function() {
    if (stats.completed === 0) {
      return { text: '아직 시작 전이에요. 하나만 끝내볼까요?', emoji: '💪' };
    }
    if (stats.completionRate >= 100) {
      return { text: '완벽해요! 오늘 할 일 다 끝냈어요!', emoji: '🎉' };
    }
    if (stats.completionRate >= 75) {
      return { text: '거의 다 했어요! 조금만 더!', emoji: '🔥' };
    }
    if (stats.completionRate >= 50) {
      return { text: '절반 넘겼어요! 잘하고 있어요!', emoji: '👏' };
    }
    if (stats.growthRate > 0) {
      return { text: '어제보다 ' + stats.growthRate + '% 더 해냈어요!', emoji: '📈' };
    }
    return { text: '좋은 시작이에요! 계속 가봐요!', emoji: '✨' };
  };
  
  var message = getMessage();
  
  // 성취 아이템
  var achievements = [
    { 
      icon: CheckCircle, 
      label: '할일 완료', 
      value: stats.completed + '개',
      color: 'text-green-500',
      bgColor: darkMode ? 'bg-green-500/20' : 'bg-green-100'
    },
    { 
      icon: Target, 
      label: '집중 시간', 
      value: focusMinutes + '분',
      color: 'text-blue-500',
      bgColor: darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
    },
    { 
      icon: Droplets, 
      label: '물', 
      value: waterCount + '잔',
      color: 'text-cyan-500',
      bgColor: darkMode ? 'bg-cyan-500/20' : 'bg-cyan-100'
    }
  ];
  
  // 아무것도 안했으면 표시 안함
  if (stats.completed === 0 && focusMinutes === 0 && waterCount === 0) {
    return null;
  }
  
  return React.createElement('div', {
    className: 'rounded-2xl overflow-hidden shadow-lg animate-fadeIn cursor-pointer transition-all hover:shadow-xl ' +
      (darkMode 
        ? 'bg-gradient-to-br from-[#2C2C2E] to-[#1D1D1F] border border-white/10' 
        : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50'),
    onClick: onClick
  },
    React.createElement('div', { className: 'p-4' },
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('div', {
            className: 'w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center'
          },
            React.createElement(Trophy, { size: 16, className: 'text-white' })
          ),
          React.createElement('h3', { 
            className: (darkMode ? 'text-white' : 'text-gray-900') + ' font-bold'
          }, '오늘의 나')
        ),
        // 스트릭 배지
        streak > 0 && React.createElement('div', {
          className: 'flex items-center gap-1 px-2 py-1 rounded-full ' +
            (streak >= 7 
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
              : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'))
        },
          React.createElement(Flame, { size: 12 }),
          React.createElement('span', { className: 'text-xs font-bold' }, streak + '일')
        )
      ),
      
      // 성취 아이템들
      React.createElement('div', { className: 'grid grid-cols-3 gap-2 mb-4' },
        achievements.map(function(item, idx) {
          return React.createElement('div', {
            key: idx,
            className: 'flex flex-col items-center p-3 rounded-xl ' + item.bgColor
          },
            React.createElement(item.icon, { 
              size: 20, 
              className: item.color 
            }),
            React.createElement('span', {
              className: (darkMode ? 'text-white' : 'text-gray-900') + ' text-lg font-bold mt-1'
            }, item.value),
            React.createElement('span', {
              className: (darkMode ? 'text-gray-500' : 'text-gray-500') + ' text-xs'
            }, item.label)
          );
        })
      ),
      
      // 진행률 바
      React.createElement('div', { className: 'mb-3' },
        React.createElement('div', { className: 'flex justify-between items-center mb-1' },
          React.createElement('span', {
            className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-xs'
          }, '오늘 진행률'),
          React.createElement('span', {
            className: 'text-[#A996FF] text-xs font-bold'
          }, stats.completionRate + '%')
        ),
        React.createElement('div', {
          className: 'h-2 rounded-full overflow-hidden ' + 
            (darkMode ? 'bg-gray-700' : 'bg-gray-200')
        },
          React.createElement('div', {
            className: 'h-full rounded-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] transition-all duration-500',
            style: { width: stats.completionRate + '%' }
          })
        )
      ),
      
      // 격려 메시지
      React.createElement('div', {
        className: 'flex items-center justify-between p-3 rounded-xl ' +
          (darkMode ? 'bg-white/5' : 'bg-white/70')
      },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(Sparkles, { 
            size: 16, 
            className: 'text-amber-500' 
          }),
          React.createElement('span', {
            className: (darkMode ? 'text-gray-200' : 'text-gray-700') + ' text-sm font-medium'
          }, message.text)
        ),
        React.createElement('span', { className: 'text-lg' }, message.emoji)
      ),
      
      // 상세 보기 버튼
      onClick && React.createElement('button', {
        className: 'w-full mt-3 flex items-center justify-center gap-1 py-2 text-[#A996FF] text-sm font-medium btn-press'
      },
        React.createElement('span', null, '오늘 뭘 했는지 보기'),
        React.createElement(ChevronRight, { size: 14 })
      )
    )
  );
};

export default TodayWinsCard;
