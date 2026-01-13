import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * ChatLauncher - 채팅 진입점 (홈/모드 공통)
 * 
 * 스펙:
 * - Floating: 하단 플로팅, bottom 24, Safe area 고려
 * - Inline: 브리핑 아래
 * 
 * Variants:
 * - floating (하단 플로팅)
 * - inline (브리핑 아래)
 */

function ChatLauncher(props) {
  var variant = props.variant || 'floating';
  var label = props.label || '같이 정리해볼까';
  var onOpen = props.onOpen;
  
  if (variant === 'inline') {
    return React.createElement('button', {
      onClick: onOpen,
      className: [
        'w-full flex items-center justify-center gap-2',
        'bg-white rounded-card p-3 shadow-card',
        'text-md font-medium text-primary',
        'transition-all duration-normal',
        'hover:shadow-card-hover'
      ].join(' ')
    },
      React.createElement(MessageCircle, { size: 18 }),
      label
    );
  }
  
  // Floating variant
  return React.createElement('button', {
    onClick: onOpen,
    className: [
      'fixed bottom-24 right-4 z-40',
      'w-14 h-14 rounded-full',
      'bg-primary text-white',
      'shadow-lg',
      'flex items-center justify-center',
      'transition-all duration-normal',
      'hover:scale-105 hover:shadow-xl',
      'active:scale-95'
    ].join(' '),
    'aria-label': '채팅 열기'
  },
    React.createElement(MessageCircle, { size: 24 })
  );
}

export default ChatLauncher;
