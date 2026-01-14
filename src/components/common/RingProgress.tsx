import { ReactNode } from 'react';

interface RingProgressProps {
  percent: number;
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  color?: 'accent' | 'success' | 'primary';
  showPercent?: boolean;
  centerContent?: ReactNode;
  animate?: boolean;
}

export default function RingProgress({
  percent,
  size = 'md',
  strokeWidth,
  color = 'accent',
  showPercent = false,
  centerContent,
  animate = true,
}: RingProgressProps) {
  // Size configs
  var sizeConfigs = {
    sm: { dimension: 48, defaultStroke: 4, fontSize: 'text-xs' },
    md: { dimension: 80, defaultStroke: 8, fontSize: 'text-sm' },
    lg: { dimension: 120, defaultStroke: 12, fontSize: 'text-lg' },
  };
  
  var config = sizeConfigs[size];
  var actualStrokeWidth = strokeWidth || config.defaultStroke;
  var radius = (config.dimension - actualStrokeWidth) / 2;
  var circumference = 2 * Math.PI * radius;
  var offset = circumference - (percent / 100) * circumference;
  
  // Color classes
  var colorClasses = {
    accent: 'stroke-accent',
    success: 'stroke-success',
    primary: 'stroke-primary',
  };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: config.dimension, height: config.dimension }}
    >
      <svg
        width={config.dimension}
        height={config.dimension}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={actualStrokeWidth}
          className="text-neutral-200"
        />
        
        {/* Progress ring */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={actualStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={[
            colorClasses[color],
            animate ? 'transition-all duration-emphasis ease-default' : '',
          ].join(' ')}
          style={animate ? { animation: 'progressFill 800ms ease-out' } : undefined}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {centerContent ? (
          centerContent
        ) : showPercent ? (
          <span className={`font-bold text-neutral-800 ${config.fontSize}`}>
            {Math.round(percent)}%
          </span>
        ) : null}
      </div>
    </div>
  );
}

// 작은 인라인 스파크라인용
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: 'accent' | 'success' | 'error';
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = 'accent',
}: SparklineProps) {
  if (data.length < 2) return null;
  
  var max = Math.max(...data);
  var min = Math.min(...data);
  var range = max - min || 1;
  
  var points = data.map(function(value, index) {
    var x = (index / (data.length - 1)) * width;
    var y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  
  var colorClasses = {
    accent: 'stroke-accent',
    success: 'stroke-success',
    error: 'stroke-error',
  };

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className={colorClasses[color]}
      />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r="3"
        className={`fill-current ${colorClasses[color].replace('stroke-', 'text-')}`}
      />
    </svg>
  );
}
