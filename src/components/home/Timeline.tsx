import { Clock } from 'lucide-react';

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
    : items.filter(function(item) {
        return item.sourceTag?.toLowerCase() === mode;
      });

  function getImportanceColor(importance: 'low' | 'mid' | 'high'): string {
    switch (importance) {
      case 'high':
        return 'var(--accent-primary)';
      case 'mid':
        return 'var(--text-primary)';
      default:
        return 'var(--text-secondary)';
    }
  }

  function getImportanceWeight(importance: 'low' | 'mid' | 'high'): string {
    switch (importance) {
      case 'high':
        return 'font-bold';
      case 'mid':
        return 'font-semibold';
      default:
        return 'font-normal';
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

  // 빈 상태 처리
  if (filteredItems.length === 0) {
    return (
      <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
        <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>오늘 타임라인</p>
        <div className="text-center py-4">
          <div
            className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          >
            <Clock size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            {mode === 'work' ? '오늘 업무 일정이 없어요' : mode === 'life' ? '오늘 생활 일정이 없어요' : '오늘 일정이 없어요'}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {mode === 'work' ? '여유롭게 집중할 수 있는 날이에요' : mode === 'life' ? '나만의 시간을 만들어보세요' : '자유롭게 하루를 보내세요'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
      <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>오늘 타임라인</p>
      <div className="space-y-1">
        {filteredItems.map(function(item) {
          return (
            <div
              key={item.id}
              className={'flex gap-3 ' + getImportancePadding(item.importance)}
            >
              <span className="text-sm w-16 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                {item.timeRange}
              </span>
              <span
                className={'text-sm ' + getImportanceWeight(item.importance)}
                style={{ color: getImportanceColor(item.importance) }}
              >
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
