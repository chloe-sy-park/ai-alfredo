import React from 'react';

/**
 * ModeSwitch - ALL/WORK/LIFE 전환 컴포넌트
 * 
 * 스펙:
 * - 전환 시 브리핑 문장 즉시 변경
 * - 모드 전환은 상단 고정
 * - 데이터는 동일, 해석만 다름
 */

function ModeSwitch(props) {
  var mode = props.mode;
  var onChange = props.onChange;
  
  var modes = [
    { id: 'all', label: 'ALL' },
    { id: 'work', label: 'WORK' },
    { id: 'life', label: 'LIFE' }
  ];
  
  return React.createElement('div', {
    className: 'flex bg-white rounded-full p-1 shadow-card'
  },
    modes.map(function(item) {
      var isActive = mode === item.id;
      return React.createElement('button', {
        key: item.id,
        onClick: function() { onChange(item.id); },
        className: [
          'flex-1 py-2 px-4 text-sm font-medium rounded-full',
          'transition-all duration-normal ease-default',
          'min-h-touch',
          isActive 
            ? 'bg-primary text-white shadow-card' 
            : 'text-neutral-500 hover:text-neutral-700'
        ].join(' ')
      }, item.label);
    })
  );
}

export default ModeSwitch;
