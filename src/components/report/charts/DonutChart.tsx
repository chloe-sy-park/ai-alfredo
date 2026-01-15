// DonutChart.tsx - 도넛 차트 컴포넌트
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
  width?: number;
  height?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  width = 200, 
  height = 200 
}) => {
  // Primary color와 Neutral color만 사용
  const COLORS = ['#A996FF', '#E5E7EB'];
  
  return (
    <ResponsiveContainer width={width} height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={60}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};