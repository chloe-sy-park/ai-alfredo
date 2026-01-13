import React from 'react';
import { User, ChevronRight } from 'lucide-react';

/**
 * RelationshipReminder - 인간관계 리마인드 (이름 직접)
 * 
 * 스펙:
 * - 이름 직접 언급
 * - 예: "김민지에게 연락 안 한 지 3주"
 * 
 * Props:
 * - name: string
 * - reason: string ("생일 D-2", "마지막 연락 3주")
 * - onOpen?()
 */

function RelationshipReminder(props) {
  var reminders = props.reminders || [];
  var onOpen = props.onOpen;
  
  return React.createElement('div', {
    className: 'bg-white rounded-card p-4 shadow-card'
  },
    // 헤더
    React.createElement('p', {
      className: 'text-sm text-neutral-500 mb-3'
    }, '소중한 사람들'),
    
    // 리마인더 리스트
    React.createElement('div', { className: 'space-y-2' },
      reminders.map(function(reminder, index) {
        return React.createElement('button', {
          key: index,
          onClick: function() { onOpen && onOpen(reminder); },
          className: [
            'w-full flex items-center gap-3 p-2 -mx-2 rounded-lg',
            'transition-colors duration-normal',
            'hover:bg-neutral-50'
          ].join(' ')
        },
          // 아바타
          React.createElement('div', {
            className: 'w-10 h-10 rounded-full bg-life-bg flex items-center justify-center flex-shrink-0'
          },
            React.createElement(User, { size: 18, className: 'text-life-text' })
          ),
          
          // 콘텐츠
          React.createElement('div', { className: 'flex-1 min-w-0 text-left' },
            React.createElement('p', {
              className: 'text-md font-medium text-neutral-800'
            }, reminder.name),
            
            React.createElement('p', {
              className: 'text-sm text-neutral-500'
            }, reminder.reason)
          ),
          
          // 화살표
          React.createElement(ChevronRight, {
            size: 16,
            className: 'text-neutral-300 flex-shrink-0'
          })
        );
      })
    ),
    
    // 빈 상태
    reminders.length === 0 && React.createElement('p', {
      className: 'text-sm text-neutral-400 text-center py-4'
    }, '아직 리마인더가 없어요')
  );
}

export default RelationshipReminder;
