type Mode = 'all' | 'work' | 'life';

interface ModeSwitchProps {
  activeMode: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeSwitch({ activeMode, onChange }: ModeSwitchProps) {
  const modes: { key: Mode; label: string; activeClass: string }[] = [
    { key: 'all', label: 'ALL', activeClass: 'bg-primary text-white' },
    { key: 'work', label: 'WORK', activeClass: 'bg-work-text text-white' },
    { key: 'life', label: 'LIFE', activeClass: 'bg-life-text text-white' },
  ];

  return (
    <div className="flex bg-white rounded-full p-1 shadow-card">
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onChange(mode.key)}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-full transition-all duration-200 min-h-[36px] ${
            activeMode === mode.key
              ? `${mode.activeClass} shadow-sm`
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
