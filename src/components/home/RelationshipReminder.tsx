import { User } from 'lucide-react';

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
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">
        소중한 사람들
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onOpen?.(item.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
          >
            <div className="p-2 rounded-full bg-pink-100">
              <User className="w-4 h-4 text-pink-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800">
                {item.name}
              </p>
              <p className="text-xs text-neutral-500">
                {item.reason}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
