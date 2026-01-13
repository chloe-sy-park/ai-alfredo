import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * BriefingCard - 알프레도 브리핑 카드
 */
function BriefingCard({ variant = 'default', headline, subline, hasMore, onMore, hintBadge }) {
  const variantStyles = {
    default: 'bg-white',
    alert: 'bg-amber-50 border border-amber-200',
    highlight: 'bg-primary/5 border border-primary/20'
  };
  
  return (
    <div className={`rounded-2xl p-4 shadow-card ${variantStyles[variant] || variantStyles.default}`}>
      {/* Badge */}
      {hintBadge && (
        <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full mb-2">
          {hintBadge}
        </span>
      )}
      
      {/* Penguin + Headline */}
      <div className="flex items-start gap-3">
        <span className="text-3xl">🐧</span>
        <div className="flex-1">
          <p className="text-lg font-medium text-neutral-800">{headline}</p>
          {subline && (
            <p className="text-sm text-neutral-500 mt-1">{subline}</p>
          )}
        </div>
      </div>
      
      {/* More button */}
      {hasMore && onMore && (
        <button
          onClick={onMore}
          className="mt-3 flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
        >
          더 들어볼래
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

export default BriefingCard;
