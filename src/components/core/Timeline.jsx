import React from 'react';

/**
 * Timeline - 하루 타임라인 컨테이너
 * TimelineItem - 개별 일정 카드
 * 
 * 스펙:
 * - 시간 축 기준
 * - 중요도에 따라 굵기 차이 (색상 사용 금지)
 * - 색상 사용 최소화
 * 
 * TimelineItem Variants:
 * - event (캘린더 이벤트)
 * - taskBlock (집중 블록)
 * - recovery (회복 슬롯)
 * 
 * Props:
 * - timeRange: string ("10:00–11:00")
 * - title: string
 * - subtitle?: string
 * - importance?: 'low' | 'mid' | 'high'
 * - details?: Array<{ label: string; value: string }>
 */

function TimelineItem(props) {
  var timeRange = props.timeRange;
  var title = props.title;
  var subtitle = props.subtitle;
  var importance = props.importance || 'mid';
  var variant = props.variant || 'event';
  var onClick = props.onClick;
  var isNow = props.isNow;
  
  // 중요도별 스타일 (굵기 & 여백으로만 표현)
  var importanceStyles = {
    low: {
      title: 'text-base font-normal text-neutral-600',
      container: 'py-2'
    },
    mid: {
      title: 'text-md font-medium text-neutral-800',
      container: 'py-2.5'
    },
    high: {
      title: 'text-lg font-semibold text-neutral-900',
      container: 'py-3'
    }
  };
  
  var styles = importanceStyles[importance];
  
  return React.createElement('button', {
    onClick: onClick,
    className: [
      'w-full flex gap-3 text-left',
      styles.container,
      'transition-colors duration-normal',
      'hover:bg-neutral-50 rounded-lg -mx-2 px-2',
      isNow && 'bg-primary/5'
    ].filter(Boolean).join(' ')
  },
    // 시간 영역
    React.createElement('div', {
      className: 'w-14 flex-shrink-0 text-sm text-neutral-400'
    }, timeRange),
    
    // 콘텐츠 영역
    React.createElement('div', { className: 'flex-1 min-w-0' },
      // 현재 시간 표시
      isNow && React.createElement('span', {
        className: 'inline-block text-xs font-medium text-primary mb-0.5'
      }, '지금'),
      
      // 타이틀
      React.createElement('p', {
        className: styles.title + ' truncate'
      }, title),
      
      // 서브타이틀
      subtitle && React.createElement('p', {
        className: 'text-sm text-neutral-400 truncate mt-0.5'
      }, subtitle)
    )
  );
}

function Timeline(props) {
  var items = props.items || [];
  var mode = props.mode || 'all';
  var title = props.title || '오늘 타임라인';
  var onItemClick = props.onItemClick;
  
  // 현재 시간 찾기
  var now = new Date();
  var currentHour = now.getHours();
  var currentMinutes = now.getMinutes();
  
  // 현재 시간대 아이템 확인
  var isCurrentTimeSlot = function(timeRange) {
    if (!timeRange) return false;
    var match = timeRange.match(/(\d{1,2}):(\d{2})/);
    if (!match) return false;
    var hour = parseInt(match[1], 10);
    return hour === currentHour || hour === currentHour + 1;
  };
  
  return React.createElement('div', {
    className: 'bg-white rounded-card p-4 shadow-card'
  },
    // 헤더
    React.createElement('p', {
      className: 'text-sm text-neutral-500 mb-3'
    }, title),
    
    // 타임라인 아이템들
    React.createElement('div', { className: 'space-y-1' },
      items.map(function(item) {
        return React.createElement(TimelineItem, Object.assign({
          key: item.id
        }, item, {
          isNow: isCurrentTimeSlot(item.timeRange),
          onClick: function() { onItemClick && onItemClick(item.id); }
        }));
      })
    ),
    
    // 빈 상태
    items.length === 0 && React.createElement('div', {
      className: 'text-center py-6 text-neutral-400 text-sm'
    }, '오늘 일정이 없어요')
  );
}

export { Timeline, TimelineItem };
export default Timeline;
