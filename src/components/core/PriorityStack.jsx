import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * PriorityStack - 우선순위 리스트 (순서가 메시지)
 * 
 * 스펙:
 * - 체크박스/완료 UI 금지
 * - 이유/점수 금지
 * - 순서 자체가 메시지
 * - 출처 태그만 표시 (WORK / LIFE)
 * 
 * Variants:
 * - top3 (기본)
 * - top5 (ALL 확장)
 * 
 * PriorityItem shape:
 * - id: string
 * - title: string
 * - sourceTag?: 'WORK' | 'LIFE'
 * - meta?: string ("마감", "오늘")
 * - status?: 'normal' | 'atRisk' | 'blocked'
 */

function PriorityStack(props) {
  var items = props.items || [];
  var variant = props.variant || 'top3';
  var onItemClick = props.onItemClick;
  var onMore = props.onMore;
  var showMore = props.showMore;
  
  // variant에 따른 표시 개수
  var displayCount = variant === 'top5' ? 5 : 3;
  var displayItems = items.slice(0, displayCount);
  
  // 소스 태그 스타일
  var getSourceTagStyle = function(tag) {
    if (tag === 'WORK') {
      return 'bg-work-bg text-work-text';
    }
    if (tag === 'LIFE') {
      return 'bg-life-bg text-life-text';
    }
    return 'bg-neutral-100 text-neutral-600';
  };
  
  // 상태별 스타일
  var getStatusStyle = function(status) {
    if (status === 'atRisk') {
      return 'border-l-2 border-l-warning';
    }
    if (status === 'blocked') {
      return 'border-l-2 border-l-error';
    }
    return '';
  };
  
  return React.createElement('div', {
    className: 'bg-white rounded-card p-4 shadow-card'
  },
    // 헤더
    React.createElement('p', {
      className: 'text-sm text-neutral-500 mb-3'
    }, '오늘의 우선순위'),
    
    // 아이템 리스트
    React.createElement('div', { className: 'space-y-3' },
      displayItems.map(function(item, index) {
        return React.createElement('button', {
          key: item.id,
          onClick: function() { onItemClick && onItemClick(item.id); },
          className: [
            'w-full flex items-center gap-3 p-2 -mx-2 rounded-lg',
            'transition-colors duration-normal',
            'hover:bg-neutral-50',
            getStatusStyle(item.status)
          ].join(' ')
        },
          // 순서 번호
          React.createElement('span', {
            className: [
              'w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
              index === 0 
                ? 'bg-primary/10 text-primary' 
                : 'bg-neutral-100 text-neutral-500'
            ].join(' ')
          }, index + 1),
          
          // 타이틀 + 메타
          React.createElement('div', { className: 'flex-1 min-w-0 text-left' },
            React.createElement('p', {
              className: 'text-md font-medium text-neutral-800 truncate'
            }, item.title),
            
            item.meta && React.createElement('p', {
              className: 'text-sm text-neutral-400 mt-0.5'
            }, item.meta)
          ),
          
          // 소스 태그
          item.sourceTag && React.createElement('span', {
            className: [
              'text-xs font-medium px-2 py-0.5 rounded flex-shrink-0',
              getSourceTagStyle(item.sourceTag)
            ].join(' ')
          }, item.sourceTag)
        );
      })
    ),
    
    // 더 보기 버튼
    showMore && onMore && items.length > displayCount && React.createElement('button', {
      onClick: onMore,
      className: [
        'flex items-center gap-1 mt-3',
        'text-sm text-neutral-400 font-medium',
        'transition-colors duration-normal',
        'hover:text-neutral-600'
      ].join(' ')
    },
      '더 보기',
      React.createElement(ChevronRight, { size: 14 })
    )
  );
}

export default PriorityStack;
