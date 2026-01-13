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
  count = 3,
  items,
  onMore
}: PriorityStackProps) {
  const displayItems = items.slice(0, count);

  const getTagStyles = (tag: 'WORK' | 'LIFE') => {
    if (tag === 'WORK') {
      return 'bg-work-bg text-work-text';
    }
    return 'bg-life-bg text-life-text';
  };

  return (
    <div className="bg-white rounded-card p-4 shadow-card">
      <p className="text-sm text-neutral-500 mb-3">오늘의 우선순위</p>
      <div className="space-y-3">
        {displayItems.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0
                  ? 'bg-lavender-100 text-primary'
                  : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-800 truncate">{item.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getTagStyles(
                    item.sourceTag
                  )}`}
                >
                  {item.sourceTag}
                </span>
                {item.meta && (
                  <span className="text-xs text-neutral-400">{item.meta}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length > count && onMore && (
        <button
          onClick={onMore}
          className="text-sm text-neutral-400 mt-3 hover:text-neutral-600"
        >
          더 보기 →
        </button>
      )}
    </div>
  );
}
