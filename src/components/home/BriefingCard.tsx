interface BriefingCardProps {
  type?: 'default' | 'update' | 'postAction';
  headline: string;
  subline?: string;
  hasMore?: boolean;
  onMore?: () => void;
}

export default function BriefingCard({
  type = 'default',
  headline,
  subline,
  hasMore = true,
  onMore
}: BriefingCardProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'update':
        return 'border-l-4 border-primary';
      case 'postAction':
        return 'bg-lavender-50';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-white rounded-card p-4 shadow-card ${getTypeStyles()}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🐧</span>
        <div className="flex-1 min-w-0">
          <p className="text-md font-medium text-neutral-800 leading-relaxed">
            {headline}
          </p>
          {subline && (
            <p className="text-sm text-neutral-500 mt-1">{subline}</p>
          )}
        </div>
      </div>
      {hasMore && onMore && (
        <button
          onClick={onMore}
          className="text-sm text-primary mt-3 hover:underline transition-colors"
        >
          더 보기 →
        </button>
      )}
    </div>
  );
}
