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
    <div className="flex bg-white rounded-full p-1 shadow-card">
      {modes.map(function(mode) {
        return (
          <button
            key={mode.key}
            onClick={function() { onChange(mode.key); }}
            className={
              'flex-1 py-3 px-4 text-sm font-semibold rounded-full transition-all duration-200 min-h-[44px] ' +
              (activeMode === mode.key
                ? 'bg-[#A996FF] text-white shadow-sm'
                : 'text-[#999999] hover:text-[#666666]')
            }
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
