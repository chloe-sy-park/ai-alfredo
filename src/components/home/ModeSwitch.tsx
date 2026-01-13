type Mode = 'all' | 'work' | 'life';

interface ModeSwitchProps {
  activeMode: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeSwitch({ activeMode, onChange }: ModeSwitchProps) {
  const modes: { key: Mode; label: string }[] = [
    { key: 'all', label: 'ALL' },
    { key: 'work', label: 'WORK' },
    { key: 'life', label: 'LIFE' }
  ];

  return (
    <div className="flex bg-white rounded-full p-1 shadow-card">
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onChange(mode.key)}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-all duration-normal ${
            activeMode === mode.key
              ? 'bg-primary text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
