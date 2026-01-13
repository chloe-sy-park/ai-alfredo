import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LifeFactor {
  id: string;
  label: string;
  statusText: string;
  signal?: 'up' | 'down' | 'steady';
}

interface LifeFactorsProps {
  items: LifeFactor[];
}

export default function LifeFactors({ items }: LifeFactorsProps) {
  const signalIcons = {
    up: TrendingUp,
    down: TrendingDown,
    steady: Minus
  };

  const signalColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    steady: 'text-neutral-400'
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">
        라이프 상태
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const SignalIcon = item.signal ? signalIcons[item.signal] : null;
          const signalColor = item.signal ? signalColors[item.signal] : '';

          return (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-neutral-50"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-500">{item.label}</span>
                {SignalIcon && (
                  <SignalIcon className={`w-3 h-3 ${signalColor}`} />
                )}
              </div>
              <p className="text-sm font-medium text-neutral-800">
                {item.statusText}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
