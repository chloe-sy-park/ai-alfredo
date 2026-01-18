import { TrendingUp, TrendingDown, Minus, Heart } from 'lucide-react';

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
    up: 'var(--state-success)',
    down: 'var(--state-danger)',
    steady: 'var(--text-tertiary)'
  };

  // 빈 상태 처리
  if (items.length === 0) {
    return (
      <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          라이프 상태
        </h3>
        <div className="text-center py-4">
          <div
            className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          >
            <Heart size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            아직 상태 정보가 없어요
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            컨디션을 기록하면 여기에 표시돼요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        라이프 상태
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map(function(item) {
          const SignalIcon = item.signal ? signalIcons[item.signal] : null;
          const signalColor = item.signal ? signalColors[item.signal] : '';

          return (
            <div
              key={item.id}
              className="p-3 rounded-xl"
              style={{ backgroundColor: 'var(--surface-subtle)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.label}</span>
                {SignalIcon && (
                  <SignalIcon className="w-3 h-3" style={{ color: signalColor }} />
                )}
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {item.statusText}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
