import React from 'react';

// 🎯 오늘의 진행률 카드
export var TodayProgressCard = function(props) {
  var darkMode = props.darkMode;
  var completedCount = props.completedCount || 0;
  var totalCount = props.totalCount || 3;
  var focusMinutes = props.focusMinutes || 0;
  var onClick = props.onClick;
  
  // 진행률 계산
  var progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // 배경색
  var bgClass = darkMode ? 'bg-[#2C2C2E]' : 'bg-white';
  var textColor = darkMode ? 'text-white' : 'text-gray-900';
  var subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 진행률에 따른 색상
  var progressColor = progress >= 100 ? '#22C55E' : '#A996FF';
  
  return React.createElement('button', {
    onClick: onClick,
    className: bgClass + ' w-full rounded-2xl p-5 shadow-lg transition-all active:scale-[0.99] ' +
      (darkMode ? '' : 'border border-gray-100')
  },
    React.createElement('div', {
      className: 'flex items-center justify-between'
    },
      // 왼쪽: 메시지
      React.createElement('div', { className: 'flex-1' },
        React.createElement('p', {
          className: subTextColor + ' text-sm leading-relaxed'
        }, 
          completedCount > 0 
            ? '오늘 ' + completedCount + '개 완료! 잘하고 있어요 👏'
            : '아직 시작 전이에요. 첫 번째 할 일을 완료해보세요! ✨'
        )
      ),
      
      // 오른쪽: 원형 프로그레스
      React.createElement('div', {
        className: 'relative w-16 h-16 flex-shrink-0 ml-4'
      },
        // SVG 원형 프로그레스
        React.createElement('svg', {
          className: 'w-full h-full -rotate-90',
          viewBox: '0 0 36 36'
        },
          // 배경 원
          React.createElement('circle', {
            cx: '18',
            cy: '18',
            r: '15.5',
            fill: 'none',
            stroke: darkMode ? '#374151' : '#E5E7EB',
            strokeWidth: '3'
          }),
          // 진행률 원
          React.createElement('circle', {
            cx: '18',
            cy: '18',
            r: '15.5',
            fill: 'none',
            stroke: progressColor,
            strokeWidth: '3',
            strokeDasharray: '97.4',
            strokeDashoffset: 97.4 - (97.4 * progress / 100),
            strokeLinecap: 'round',
            className: 'transition-all duration-500'
          })
        ),
        
        // 퍼센트 텍스트
        React.createElement('div', {
          className: 'absolute inset-0 flex flex-col items-center justify-center'
        },
          React.createElement('span', {
            className: 'text-xs ' + subTextColor
          }, '진행률'),
          React.createElement('span', {
            className: textColor + ' font-bold text-sm'
          }, progress + '%')
        )
      )
    ),
    
    // 하단: 완료 수
    React.createElement('div', {
      className: 'flex justify-end mt-2'
    },
      React.createElement('span', {
        className: subTextColor + ' text-xs'
      }, completedCount + '/' + totalCount + ' 완료 ✨')
    )
  );
};

export default TodayProgressCard;
