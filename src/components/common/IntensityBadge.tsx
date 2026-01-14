type IntensityLevel = 'light' | 'normal' | 'heavy' | 'overloaded';

interface IntensityBadgeProps {
  level: IntensityLevel;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

var levelConfig = {
  light: {
    bg: 'bg-intensity-light',
    text: 'text-neutral-900',
    label: 'LIGHT',
    labelKo: '여유',
  },
  normal: {
    bg: 'bg-intensity-normal',
    text: 'text-neutral-900',
    label: 'NORMAL',
    labelKo: '보통',
  },
  heavy: {
    bg: 'bg-intensity-heavy',
    text: 'text-white',
    label: 'HEAVY',
    labelKo: '바쁨',
  },
  overloaded: {
    bg: 'bg-intensity-overloaded',
    text: 'text-white',
    label: 'OVERLOADED',
    labelKo: '과부하',
  },
};

export default function IntensityBadge({
  level,
  size = 'sm',
  showLabel = true,
}: IntensityBadgeProps) {
  var config = levelConfig[level];
  
  var sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={[
        'inline-flex items-center font-bold uppercase rounded-pill',
        config.bg,
        config.text,
        sizeStyles[size],
      ].join(' ')}
    >
      {showLabel ? config.label : config.labelKo}
    </span>
  );
}

// 강도 계산 헬퍼 함수
export function calculateIntensity(
  eventCount: number,
  conditionLevel?: string
): IntensityLevel {
  // 컨디션이 나쁘면 강도 증가
  var conditionModifier = conditionLevel === 'bad' ? 2 : conditionLevel === 'great' ? -1 : 0;
  var adjustedCount = eventCount + conditionModifier;
  
  if (adjustedCount <= 2) return 'light';
  if (adjustedCount <= 5) return 'normal';
  if (adjustedCount <= 8) return 'heavy';
  return 'overloaded';
}
