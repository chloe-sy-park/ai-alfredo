import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * BriefingCard - 모든 모드에서 최상단 판단 전달
 * 
 * 스펙:
 * - 항상 최상단
 * - 배경 강조 최소
 * - 텍스트가 주인공
 * - 설명/근거 금지
 * - onMore에서만 근거 노출
 * 
 * Variants:
 * - default: 홈
 * - update: 패턴 변화 감지
 * - postAction: 자동 처리 후
 */

function BriefingCard(props) {
  var variant = props.variant || 'default';
  var headline = props.headline;
  var subline = props.subline;
  var hasMore = props.hasMore;
  var onMore = props.onMore;
  var hintBadge = props.hintBadge;
  
  // Variant별 스타일
  var variantStyles = {
    default: 'bg-white',
    update: 'bg-primary/5 border border-primary/20',
    postAction: 'bg-success/5 border border-success/20'
  };
  
  return React.createElement('div', {
    className: [
      'rounded-card p-4 shadow-card',
      variantStyles[variant]
    ].join(' ')
  },
    // 상단: 펭귄 아이콘 + 헤드라인
    React.createElement('div', { className: 'flex items-start gap-3' },
      // 펭귄 아이콘
      React.createElement('div', { className: 'text-2xl flex-shrink-0' }, '🐧'),
      
      // 텍스트 영역
      React.createElement('div', { className: 'flex-1 min-w-0' },
        // 배지 (update variant)
        hintBadge && React.createElement('span', {
          className: 'inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-1'
        }, hintBadge.label),
        
        // 헤드라인 (1-2줄)
        React.createElement('p', {
          className: 'text-md font-medium text-neutral-800 leading-relaxed'
        }, headline),
        
        // 서브라인 (옵션)
        subline && React.createElement('p', {
          className: 'text-base text-neutral-500 mt-1'
        }, subline)
      )
    ),
    
    // 더 보기 버튼
    hasMore && onMore && React.createElement('button', {
      onClick: onMore,
      className: [
        'flex items-center gap-1 mt-3',
        'text-sm text-primary font-medium',
        'transition-colors duration-normal',
        'hover:text-primary/80'
      ].join(' ')
    },
      '더 보기',
      React.createElement(ChevronRight, { size: 14 })
    )
  );
}

export default BriefingCard;
