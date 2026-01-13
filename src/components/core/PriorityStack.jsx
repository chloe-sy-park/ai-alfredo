import React from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';

/**
 * PriorityStack - 우선순위 목록
 */
function PriorityStack({ items = [], variant = 'top3', onItemClick, showMore, onMore }) {
  const displayItems = variant === 'top3' ? items.slice(0, 3) : items;
  
  if (displayItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-card text-center">
        <p className="text-neutral-400">오늘 할 일이 없어요 ✨</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="p-3 border-b border-neutral-100">
        <h3 className="text-sm font-medium text-neutral-500">오늘의 우선순위</h3>
      </div>
      
      <div className="divide-y divide-neutral-50">
        {displayItems.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => onItemClick && onItemClick(item.id)}
            className="w-full flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors text-left"
          >
            {/* 순위 */}
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              idx === 0 ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500'
            }`}>
              {idx + 1}
            </span>
            
            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-800 truncate">{item.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  item.sourceTag === 'WORK' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>
                  {item.sourceTag}
                </span>
                {item.meta && (
                  <span className="text-xs text-neutral-400">{item.meta}</span>
                )}
              </div>
            </div>
            
            {/* 상태 */}
            {item.status === 'atRisk' && (
              <AlertCircle size={16} className="text-amber-500" />
            )}
          </button>
        ))}
      </div>
      
      {/* 더보기 */}
      {showMore && onMore && (
        <button
          onClick={onMore}
          className="w-full p-3 text-sm text-primary font-medium flex items-center justify-center gap-1 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
        >
          더 보기
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

export default PriorityStack;
