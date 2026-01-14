type Mode = 'all' | 'work' | 'life';

interface ModeSwitchProps {
  activeMode: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeSwitch({ activeMode, onChange }: ModeSwitchProps) {
  var modes: { key: Mode; label: string }[] = [
    { key: 'all', label: 'ALL' },
    { key: 'work', label: 'WORK' },
    { key: 'life', label: 'LIFE' }
  ];

  return (
    <div className="flex bg-white rounded-full p-[4px] shadow-card">
      {modes.map(function(mode) {
        return (
          <button
            key={mode.key}
            onClick={function() { onChange(mode.key); }}
            className={
              'flex-1 py-[12px] px-[16px] text-sm font-medium rounded-full transition-all duration-200 min-h-[44px] ' +
              (activeMode === mode.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700')
            }
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
