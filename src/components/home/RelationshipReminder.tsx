import { User, Heart, Plus, UserPlus } from 'lucide-react';

interface Relationship {
  id: string;
  name: string;
  reason: string;
}

interface RelationshipReminderProps {
  items: Relationship[];
  onOpen?: (id: string) => void;
  onAddPerson?: () => void;
}

export default function RelationshipReminder({ items, onOpen, onAddPerson }: RelationshipReminderProps) {
  // 빈 상태 처리 - 더 상세한 설명과 명확한 CTA
  if (items.length === 0) {
    return (
      <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Heart size={16} style={{ color: 'var(--os-life)' }} />
          소중한 사람들
        </h3>
        <div className="text-center py-4">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(126, 155, 138, 0.15)' }}
          >
            <UserPlus size={24} style={{ color: 'var(--os-life)' }} />
          </div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            관계를 관리해보세요
          </p>
          <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            연락이 뜸해지면 알프레도가 먼저 알려드려요.<br />
            바쁜 일상 속에서도 소중한 사람들을 놓치지 않도록 도와드릴게요.
          </p>
          <button
            onClick={onAddPerson}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--os-life)',
              color: 'white'
            }}
          >
            <Plus size={16} />
            소중한 사람 등록하기
          </button>
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
