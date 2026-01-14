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
  var filteredItems = mode === 'all' 
    ? items 
    : items.filter(function(item) { 
        return item.sourceTag?.toLowerCase() === mode; 
      });

  function getImportanceStyles(importance: 'low' | 'mid' | 'high'): string {
    switch (importance) {
      case 'high':
        return 'font-bold text-[#A996FF]';
      case 'mid':
        return 'font-semibold text-[#1A1A1A]';
      default:
        return 'font-normal text-[#666666]';
    }
  }

  function getImportancePadding(importance: 'low' | 'mid' | 'high'): string {
    switch (importance) {
      case 'high':
        return 'py-3';
      case 'mid':
        return 'py-2';
      default:
        return 'py-1.5';
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-card">
      <p className="text-sm text-[#999999] mb-3">오늘 타임라인</p>
      <div className="space-y-1">
        {filteredItems.map(function(item) {
          return (
            <div 
              key={item.id} 
              className={'flex gap-3 ' + getImportancePadding(item.importance)}
            >
              <span className="text-sm text-[#999999] w-16 flex-shrink-0">
                {item.timeRange}
              </span>
              <span className={'text-sm ' + getImportanceStyles(item.importance)}>
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
