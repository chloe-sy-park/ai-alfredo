// BarChart.tsx - 바 차트 컴포넌트
import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface BarChartProps {
  data: any[];
  dataKey: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  dataKey, 
  height = 200 
}) => {
  // 커스텀 X축 레이블 (긴 텍스트 처리)
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const words = payload.value.split(' ');
    const isLong = words.length > 2;
    
    if (isLong) {
      return (
        <text x={x} y={y} textAnchor="middle" fill="#9CA3AF" fontSize={11}>
          <tspan x={x} dy={0}>{words.slice(0, 2).join(' ')}</tspan>
          <tspan x={x} dy={12}>{words.slice(2).join(' ')}</tspan>
        </text>
      );
    }
    
    return (
      <text x={x} y={y} dy={8} textAnchor="middle" fill="#9CA3AF" fontSize={11}>
        {payload.value}
      </text>
    );
  };
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart 
        data={data} 
        margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis 
          dataKey="pattern" 
          axisLine={false}
          tickLine={false}
          tick={<CustomXAxisTick />}
          interval={0}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#9CA3AF' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB',
            borderRadius: '8px'
          }}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill="#A996FF" />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};