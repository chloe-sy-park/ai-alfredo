import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * MoreSheet - 근거/상세를 인라인 확장(시트)
 * 
 * 스펙:
 * - 페이지 이동 금지
 * - 이유는 절대 기본 렌더링 금지
 * - Why/What/Trade-off 섹션
 */

function MoreSheet(props) {
  var isOpen = props.isOpen;
  var title = props.title || '판단 근거';
  var sections = props.sections || [];
  var onClose = props.onClose;
  
  var sheetRef = useRef(null);
  
  // 바깥 클릭 시 닫기
  useEffect(function() {
    var handleClickOutside = function(event) {
      if (sheetRef.current && !sheetRef.current.contains(event.target)) {
        onClose && onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // 스크롤 잠금
      document.body.style.overflow = 'hidden';
    }
    
    return function() {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-end justify-center'
  },
    // 배경 오버레이
    React.createElement('div', {
      className: 'absolute inset-0 bg-black/30 animate-fade-in'
    }),
    
    // 시트
    React.createElement('div', {
      ref: sheetRef,
      className: [
        'relative w-full max-w-mobile',
        'bg-white rounded-t-card-lg',
        'shadow-sheet',
        'animate-slide-up',
        'max-h-[80vh] overflow-y-auto'
      ].join(' ')
    },
      // 핸들바
      React.createElement('div', {
        className: 'sticky top-0 bg-white pt-3 pb-2 px-4 border-b border-neutral-100'
      },
        React.createElement('div', {
          className: 'w-10 h-1 bg-neutral-200 rounded-full mx-auto mb-3'
        }),
        
        // 헤더
        React.createElement('div', {
          className: 'flex items-center justify-between'
        },
          React.createElement('h2', {
            className: 'text-lg font-semibold text-neutral-800'
          }, title),
          
          React.createElement('button', {
            onClick: onClose,
            className: [
              'w-8 h-8 rounded-full',
              'flex items-center justify-center',
              'text-neutral-400 hover:text-neutral-600',
              'hover:bg-neutral-100',
              'transition-colors duration-normal'
            ].join(' ')
          },
            React.createElement(X, { size: 18 })
          )
        )
      ),
      
      // 섹션들
      React.createElement('div', { className: 'p-4 space-y-4' },
        sections.map(function(section, index) {
          return React.createElement('div', {
            key: index,
            className: 'space-y-2'
          },
            // 섹션 라벨
            React.createElement('p', {
              className: 'text-sm font-medium text-primary'
            }, section.label),
            
            // 섹션 아이템들
            React.createElement('div', { className: 'space-y-1.5' },
              section.items.map(function(item, itemIndex) {
                return React.createElement('p', {
                  key: itemIndex,
                  className: 'text-md text-neutral-700 leading-relaxed'
                }, item);
              })
            )
          );
        })
      )
    )
  );
}

export default MoreSheet;
