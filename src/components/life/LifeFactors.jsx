import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * LifeFactors - 습관/건강/취미/개인목표 상태 요약
 * 
 * 스펙:
 * - 상태 중심, 점수 금지
 * 
 * Props:
 * - items: Array<{ id; label; statusText; signal?: 'up'|'down'|'steady' }>
 */

function LifeFactors(props) {
  var items = props.items || [];
  
  // 신호별 아이콘
  var signalIcons = {
    up: TrendingUp,
    down: TrendingDown,
    steady: Minus
  };
  
  var signalColors = {
    up: 'text-success',
    down: 'text-error',
    steady: 'text-neutral-400'
  };
  
  return React.createElement('div', {
    className: 'bg-white rounded-card p-4 shadow-card'
  },
    // 헤더
    React.createElement('p', {
      className: 'text-sm text-neutral-500 mb-3'
    }, '생활 요소'),
    
    // 아이템 그리드
    React.createElement('div', { className: 'grid grid-cols-2 gap-2' },
      items.map(function(item) {
        var SignalIcon = signalIcons[item.signal] || Minus;
        var signalColor = signalColors[item.signal] || signalColors.steady;
        
        return React.createElement('div', {
          key: item.id,
          className: [
            'p-3 rounded-lg',
            'bg-neutral-50',
            'border border-neutral-100'
          ].join(' ')
        },
          // 라벨 + 신호
          React.createElement('div', {
            className: 'flex items-center justify-between mb-1'
          },
            React.createElement('span', {
              className: 'text-sm font-medium text-neutral-700'
            }, item.label),
            
            React.createElement(SignalIcon, {
              size: 14,
              className: signalColor
            })
          ),
          
          // 상태 텍스트
          React.createElement('p', {
            className: 'text-sm text-neutral-500'
          }, item.statusText)
        );
      })
    ),
    
    // 빈 상태
    items.length === 0 && React.createElement('p', {
      className: 'text-sm text-neutral-400 text-center py-4'
    }, '아직 설정된 항목이 없어요')
  );
}

export default LifeFactors;
