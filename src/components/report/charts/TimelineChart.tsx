// TimelineChart.tsx - 타임라인 차트 컴포넌트
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { LiftRecord } from '../../../stores/liftStore';

interface TimelineChartProps {
  lifts: LiftRecord[];
  height?: number;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ lifts, height = 200 }) => {
  // Lift 데이터를 차트용 데이터로 변환
  const chartData = lifts.map(lift => {
    const date = new Date(lift.timestamp);
    const dayOfWeek = date.getDay();
    const hour = date.getHours() + date.getMinutes() / 60;
    
    return {
      x: dayOfWeek,
      y: hour,
      size: lift.impact === 'high' ? 12 : lift.impact === 'medium' ? 8 : 5,
      type: lift.type,
      reason: lift.reason
    };
  });
  
  // 요일 레이블
  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow-lg rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">{data.reason}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
        <XAxis 
          type="number" 
          dataKey="x" 
          domain={[0, 6]}
          ticks={[0, 1, 2, 3, 4, 5, 6]}
          tickFormatter={(value) => dayLabels[value]}
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          domain={[0, 24]}
          ticks={[6, 12, 18, 24]}
          tickFormatter={(value) => `${value}:00`}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter 
          data={chartData} 
          fill="#A996FF"
          fillOpacity={0.6}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};