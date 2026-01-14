type IntensityLevel = 'light' | 'normal' | 'heavy' | 'overloaded';

interface IntensityBadgeProps {
  level: IntensityLevel;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

// 라이트모드 색상 스펙
var levelConfig = {
  light: {
    bg: 'bg-[#4ADE80]',
    text: 'text-white',
    label: 'LIGHT',
    labelKo: '여유',
  },
  normal: {
    bg: 'bg-[#FBBF24]',
    text: 'text-[#1A1A1A]',
    label: 'NORMAL',
    labelKo: '보통',
  },
  heavy: {
    bg: 'bg-[#F97316]',
    text: 'text-white',
    label: 'HEAVY',
    labelKo: '바쁨',
  },
  overloaded: {
    bg: 'bg-[#EF4444]',
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
    sm: 'px-2.5 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
  };

  return (
    <span
      className={[
        'inline-flex items-center font-bold uppercase rounded-full tracking-wide',
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
