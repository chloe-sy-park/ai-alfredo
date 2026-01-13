import React from 'react';

/**
 * ModeSwitch - ALL/WORK/LIFE 전환 컴포넌트
 */
function ModeSwitch({ mode, onChange }) {
  const modes = [
    { id: 'all', label: 'ALL' },
    { id: 'work', label: 'WORK' },
    { id: 'life', label: 'LIFE' }
  ];
  
  return (
    <div className="flex bg-white rounded-full p-1 shadow-card">
      {modes.map((item) => {
        const isActive = mode === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-all duration-200 min-h-[44px] ${
              isActive
                ? 'bg-primary text-white shadow-card'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default ModeSwitch;
