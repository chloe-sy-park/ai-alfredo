interface TimelinePoint {
  date: string;
  time?: string;
  intensity?: 'low' | 'mid' | 'high';
  label?: string;
}

interface TimelineChartProps {
  points: TimelinePoint[];
  minimal?: boolean;
}

export default function TimelineChart({ points, minimal = true }: TimelineChartProps) {
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  
  // 점 크기 매핑
  const getSizeClass = (intensity?: string) => {
    switch (intensity) {
      case 'high': return 'w-4 h-4';
      case 'mid': return 'w-3 h-3';
      default: return 'w-2 h-2';
    }
  };
  
  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2" />
      
      {/* Day Labels */}
      <div className="flex justify-between mb-8">
        {days.map((day) => (
          <div key={day} className="text-xs text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      {/* Points */}
      <div className="relative h-16">
        {points.map((point, index) => {
          // 날짜에서 요일 계산 (간단한 예시)
          const dayIndex = index % 7; // 실제로는 date를 파싱해야 함
          const leftPosition = `${(dayIndex / 6) * 100}%`;
          
          return (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: leftPosition, top: '50%' }}
            >
              <div className="relative">
                <div 
                  className={`bg-primary rounded-full ${getSizeClass(point.intensity)}`}
                />
                {!minimal && point.label && (
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {point.label}
                    </p>
                    {point.time && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {point.time}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}