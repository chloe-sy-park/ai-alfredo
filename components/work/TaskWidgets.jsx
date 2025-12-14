import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

const Sparkline = ({ data = [], color = '#A996FF', width = 50, height = 20 }) => {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 마지막 점 강조 */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="2.5"
        fill={color}
      />
    </svg>
  );
};


const PriorityIndicator = ({ change, reason }) => {
  const config = {
    up: { icon: <TrendingUp size={12} strokeWidth={3} />, color: 'text-[#A996FF]', bg: 'bg-[#A996FF]/10', label: '+Score' },
    down: { icon: <TrendingDown size={12} strokeWidth={3} />, color: 'text-gray-400', bg: 'bg-[#F5F3FF]', label: '-Score' },
    new: { icon: <span className="text-[11px] font-bold">N</span>, color: 'text-[#A996FF]', bg: 'bg-[#A996FF]/10', label: 'New' },
    same: { icon: <span className="text-gray-300">—</span>, color: 'text-gray-400', bg: 'bg-gray-50', label: '' },
  };
  
  const c = config[change] || config.same;
  
  return (
    <div className="flex flex-col items-end gap-0.5 min-w-[60px]">
      <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${c.bg}`}>
        <span className={c.color}>{c.icon}</span>
        {c.label && <span className={`text-[11px] font-bold ${c.color}`}>{c.label}</span>}
      </div>
      {reason && (
        <span className="text-[11px] text-gray-400 truncate max-w-[80px] text-right">{reason}</span>
      )}
    </div>
  );
};


export { Sparkline, PriorityIndicator };
