interface TimelineItem {
  id: string;
  timeRange: string;
  title: string;
  importance: 'low' | 'mid' | 'high';
  sourceTag?: 'WORK' | 'LIFE';
}

interface TimelineProps {
  mode: 'all' | 'work' | 'life';
  items: TimelineItem[];
}

export default function Timeline({ mode, items }: TimelineProps) {
  const filteredItems = mode === 'all' 
    ? items 
    : items.filter(item => item.sourceTag?.toLowerCase() === mode);

  const getImportanceStyles = (importance: 'low' | 'mid' | 'high') => {
    switch (importance) {
      case 'high':
        return 'font-bold text-primary';
      case 'mid':
        return 'font-semibold text-neutral-700';
      default:
        return 'font-normal text-neutral-600';
    }
  };

  const getImportancePadding = (importance: 'low' | 'mid' | 'high') => {
    switch (importance) {
      case 'high':
        return 'py-3';
      case 'mid':
        return 'py-2';
      default:
        return 'py-1.5';
    }
  };

  return (
    <div className="bg-white rounded-card p-4 shadow-card">
      <p className="text-sm text-neutral-500 mb-3">오늘 타임라인</p>
      <div className="space-y-1">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className={`flex gap-3 ${getImportancePadding(item.importance)}`}
          >
            <span className="text-sm text-neutral-400 w-16 flex-shrink-0">
              {item.timeRange}
            </span>
            <span className={`text-sm ${getImportanceStyles(item.importance)}`}>
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
