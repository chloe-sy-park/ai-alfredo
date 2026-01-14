import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface BarChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  minimal?: boolean;
  showGrid?: boolean;
  horizontal?: boolean;
}

export default function BarChart({ 
  data, 
  minimal = true,
  showGrid = false,
  horizontal = false
}: BarChartProps) {
  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium">{payload[0].payload.name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {payload[0].value}
        </p>
      </div>
    );
  };
  
  const chartProps = {
    data,
    margin: { top: 5, right: 5, bottom: 5, left: 5 },
    layout: horizontal ? 'horizontal' as const : 'vertical' as const
  };
  
  return (
    <ResponsiveContainer width="100%" height={160}>
      <RechartsBarChart {...chartProps}>
        {showGrid && !horizontal && (
          <XAxis 
            dataKey="name" 
            stroke="#E5E7EB"
            tick={{ fontSize: 12 }}
            axisLine={false}
          />
        )}
        
        {showGrid && horizontal && (
          <YAxis 
            dataKey="name"
            type="category"
            stroke="#E5E7EB"
            tick={{ fontSize: 12 }}
            axisLine={false}
          />
        )}
        
        {!minimal && <Tooltip content={<CustomTooltip />} />}
        
        <Bar
          dataKey="value"
          fill="#A996FF"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}