import React from 'react';
import { Mail, Calendar, FileText, ChevronRight } from 'lucide-react';

/**
 * ActionCard - 중요한 액션 카드 (Email/Meeting/Doc)
 * 
 * 스펙:
 * - 업무상 중요한 이메일/회의만 카드화
 * 
 * Variants:
 * - email
 * - meeting
 * - doc
 * 
 * Props:
 * - title: string
 * - summary: string
 * - recommendedAction?: string
 * - meta?: string ("Action Needed")
 * - onOpen?()
 */

function ActionCard(props) {
  var variant = props.variant || 'email';
  var title = props.title;
  var summary = props.summary;
  var recommendedAction = props.recommendedAction;
  var meta = props.meta;
  var onOpen = props.onOpen;
  
  // Variant별 아이콘
  var icons = {
    email: Mail,
    meeting: Calendar,
    doc: FileText
  };
  
  var Icon = icons[variant] || Mail;
  
  // Variant별 스타일
  var variantStyles = {
    email: 'border-l-primary',
    meeting: 'border-l-warning',
    doc: 'border-l-success'
  };
  
  return React.createElement('button', {
    onClick: onOpen,
    className: [
      'w-full text-left',
      'bg-white rounded-card p-4 shadow-card',
      'border-l-4',
      variantStyles[variant],
      'transition-all duration-normal',
      'hover:shadow-card-hover'
    ].join(' ')
  },
    // 헤더
    React.createElement('div', {
      className: 'flex items-start gap-3'
    },
      // 아이콘
      React.createElement('div', {
        className: 'w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0'
      },
        React.createElement(Icon, { size: 16, className: 'text-neutral-600' })
      ),
      
      // 콘텐츠
      React.createElement('div', { className: 'flex-1 min-w-0' },
        // 메타 배지
        meta && React.createElement('span', {
          className: 'inline-block text-xs font-medium text-error bg-error/10 px-2 py-0.5 rounded-full mb-1'
        }, meta),
        
        // 타이틀
        React.createElement('p', {
          className: 'text-md font-medium text-neutral-800 truncate'
        }, title),
        
        // 서머리
        summary && React.createElement('p', {
          className: 'text-sm text-neutral-500 mt-1 line-clamp-2'
        }, summary)
      ),
      
      // 화살표
      React.createElement(ChevronRight, {
        size: 18,
        className: 'text-neutral-300 flex-shrink-0'
      })
    ),
    
    // 추천 액션
    recommendedAction && React.createElement('div', {
      className: 'mt-3 pt-3 border-t border-neutral-100'
    },
      React.createElement('p', {
        className: 'text-sm text-primary font-medium'
      }, '→ ' + recommendedAction)
    )
  );
}

export default ActionCard;
