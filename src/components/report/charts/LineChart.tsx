import { LineChart as RechartsLineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface LineChartProps {
  data: Array<{
    name: string;
    value: number;
    value2?: number;
  }>;
  dataKey?: string;
  dataKey2?: string;
  minimal?: boolean;
  showGrid?: boolean;
  annotations?: string[];
}

export default function LineChart({ 
  data, 
  dataKey = 'value',
  dataKey2,
  minimal = true,
  showGrid = false,
  annotations
}: LineChartProps) {
  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
            {entry.value}
          </p>
        ))}
      </div>
    );
  };
  
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={160}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          {showGrid && (
            <>
              <XAxis 
                dataKey="name" 
                stroke="#E5E7EB"
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <YAxis 
                stroke="#E5E7EB"
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
            </>
          )}
          
          {!minimal && <Tooltip content={<CustomTooltip />} />}
          
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#A996FF"
            strokeWidth={2}
            dot={!minimal}
            activeDot={!minimal ? { r: 6 } : false}
          />
          
          {dataKey2 && (
            <Line
              type="monotone"
              dataKey={dataKey2}
              stroke="#E5E5E5"
              strokeWidth={2}
              dot={!minimal}
              activeDot={!minimal ? { r: 6 } : false}
            />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
      
      {!minimal && annotations && (
        <div className="mt-4 space-y-2">
          {annotations.map((annotation, index) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
              {annotation}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}