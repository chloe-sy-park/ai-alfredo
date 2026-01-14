interface PriorityItem {
  id: string;
  title: string;
  sourceTag: 'WORK' | 'LIFE';
  meta?: string;
  status?: 'pending' | 'in-progress' | 'done';
}

interface PriorityStackProps {
  count?: 3 | 5;
  items: PriorityItem[];
  onMore?: () => void;
}

export default function PriorityStack({
  count,
  items,
  onMore
}: PriorityStackProps) {
  if (count === undefined) count = 3;
  
  var displayItems = items.slice(0, count);

  function getTagStyles(tag: 'WORK' | 'LIFE'): string {
    if (tag === 'WORK') {
      return 'bg-[#F0F0FF] text-[#A996FF]';
    }
    return 'bg-[#FEF3C7] text-[#F97316]';
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-card">
      <p className="text-sm text-[#999999] mb-3">오늘의 우선순위</p>
      <div className="space-y-3">
        {displayItems.map(function(item, index) {
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div
                className={
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ' +
                  (index === 0
                    ? 'bg-[#FFD700]/20 text-[#1A1A1A]'
                    : 'bg-[#F5F5F5] text-[#999999]')
                }
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1A1A1A] truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={'text-xs px-2 py-0.5 rounded-full font-medium ' + getTagStyles(item.sourceTag)}
                  >
                    {item.sourceTag}
                  </span>
                  {item.meta && (
                    <span className="text-xs text-[#999999]">{item.meta}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {items.length > count && onMore && (
        <button
          onClick={onMore}
          className="text-sm text-[#999999] mt-3 hover:text-[#666666] min-h-[44px]"
        >
          더 보기 →
        </button>
      )}
    </div>
  );
}
