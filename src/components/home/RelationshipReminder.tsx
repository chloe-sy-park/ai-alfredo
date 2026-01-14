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
    <div className="bg-white rounded-xl p-4 shadow-card">
      <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">
        소중한 사람들
      </h3>
      <div className="space-y-2">
        {items.map(function(item) {
          return (
            <button
              key={item.id}
              onClick={function() { if (onOpen) onOpen(item.id); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#F5F5F5] hover:bg-[#EEEEEE] transition-colors text-left min-h-[44px]"
            >
              <div className="p-2 rounded-full bg-[#FCE7F3]">
                <User className="w-4 h-4 text-[#EC4899]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {item.name}
                </p>
                <p className="text-xs text-[#999999]">
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
