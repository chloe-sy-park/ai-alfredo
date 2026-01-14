import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  minimal?: boolean;
  centerLabel?: string;
}

export default function DonutChart({ 
  data, 
  minimal = true,
  centerLabel 
}: DonutChartProps) {
  // 알프레도 디자인 시스템 색상
  const defaultColors = ['#A996FF', '#E5E5E5']; // Primary + Neutral
  
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius={50}
            outerRadius={70}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || defaultColors[index % defaultColors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{centerLabel}</span>
        </div>
      )}
      
      {!minimal && (
        <div className="flex justify-center gap-6 mt-4">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: item.color || defaultColors[index % defaultColors.length] 
                }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}