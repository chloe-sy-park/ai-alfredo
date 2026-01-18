import { User, Heart } from 'lucide-react';

interface Relationship {
  id: string;
  name: string;
  reason: string;
}

interface RelationshipReminderProps {
  items: Relationship[];
  onOpen?: (id: string) => void;
}

export default function RelationshipReminder({ items, onOpen }: RelationshipReminderProps) {
  // 빈 상태 처리
  if (items.length === 0) {
    return (
      <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          소중한 사람들
        </h3>
        <div className="text-center py-4">
          <div
            className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          >
            <Heart size={18} style={{ color: 'var(--os-life)' }} />
          </div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            소중한 사람을 등록해보세요
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            알프레도가 연락 타이밍을 알려드려요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        소중한 사람들
      </h3>
      <div className="space-y-2">
        {items.map(function(item) {
          return (
            <button
              key={item.id}
              onClick={function() { if (onOpen) onOpen(item.id); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left min-h-[44px]"
              style={{ backgroundColor: 'var(--surface-subtle)' }}
            >
              <div
                className="p-2 rounded-full"
                style={{ backgroundColor: 'rgba(126, 155, 138, 0.15)' }}
              >
                <User className="w-4 h-4" style={{ color: 'var(--os-life)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {item.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {item.reason}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
