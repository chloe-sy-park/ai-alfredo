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
  var signalIcons = {
    up: TrendingUp,
    down: TrendingDown,
    steady: Minus
  };

  var signalColors = {
    up: 'text-[#4ADE80]',
    down: 'text-[#EF4444]',
    steady: 'text-[#999999]'
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-card">
      <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">
        라이프 상태
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map(function(item) {
          var SignalIcon = item.signal ? signalIcons[item.signal] : null;
          var signalColor = item.signal ? signalColors[item.signal] : '';

          return (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-[#F5F5F5]"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#999999]">{item.label}</span>
                {SignalIcon && (
                  <SignalIcon className={'w-3 h-3 ' + signalColor} />
                )}
              </div>
              <p className="text-sm font-medium text-[#1A1A1A]">
                {item.statusText}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
