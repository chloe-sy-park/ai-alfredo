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
  
  // 라이트모드 색상 (hex)
  var colorValues = {
    accent: '#FFD700',
    success: '#4ADE80',
    primary: '#A996FF',
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
          stroke="#E5E5E5"
          strokeWidth={actualStrokeWidth}
        />
        
        {/* Progress ring */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          stroke={colorValues[color]}
          strokeWidth={actualStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={animate ? 'transition-all duration-300 ease-out' : ''}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {centerContent ? (
          centerContent
        ) : showPercent ? (
          <span className={'font-bold text-[#1A1A1A] ' + config.fontSize}>
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
    return x + ',' + y;
  }).join(' ');
  
  // 라이트모드 색상 (hex)
  var colorValues = {
    accent: '#FFD700',
    success: '#4ADE80',
    error: '#EF4444',
  };

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={colorValues[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r="3"
        fill={colorValues[color]}
      />
    </svg>
  );
}
