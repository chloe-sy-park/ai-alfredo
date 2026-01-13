import React from 'react';
import { Clock } from 'lucide-react';

/**
 * Timeline - 오늘 타임라인
 */
function Timeline({ items = [], mode = 'all', onItemClick }) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-card text-center">
        <Clock size={24} className="mx-auto text-neutral-300 mb-2" />
        <p className="text-neutral-400">오늘 일정이 없어요</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="p-3 border-b border-neutral-100">
        <h3 className="text-sm font-medium text-neutral-500">오늘 타임라인</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick && onItemClick(item.id)}
            className="w-full flex items-start gap-3 text-left hover:bg-neutral-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
          >
            {/* 시간 */}
            <span className="text-sm font-medium text-neutral-400 w-14 flex-shrink-0">
              {item.timeRange}
            </span>
            
            {/* 타임라인 바 */}
            <div className={`w-1 h-12 rounded-full flex-shrink-0 ${
              item.importance === 'high' ? 'bg-primary' :
              item.importance === 'mid' ? 'bg-primary/50' : 'bg-neutral-200'
            }`} />
            
            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-800">{item.title}</p>
              {item.subtitle && (
                <p className="text-sm text-neutral-400 truncate">{item.subtitle}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
