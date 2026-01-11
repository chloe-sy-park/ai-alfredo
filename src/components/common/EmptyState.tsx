import Button from './Button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'minimal';
}

export default function EmptyState({
  icon = '📝',
  title,
  message,
  actionLabel,
  onAction,
  variant = 'default'
}: EmptyStateProps) {
  if (variant === 'minimal') {
    return (
      <div className="text-center py-6 text-gray-400">
        <p>{title}</p>
        {onAction && actionLabel && (
          <button 
            onClick={onAction}
            className="mt-2 text-lavender-500 text-sm hover:text-lavender-600"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {message && (
        <p className="text-gray-500 text-sm mb-6 max-w-xs">{message}</p>
      )}
      {onAction && actionLabel && (
        <Button onClick={onAction} leftIcon={<Plus size={18} />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// 페이지별 프리셋 Empty States
export function TasksEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="✨"
      title="태스크가 없어요"
      message="오늘 할 일을 추가해볼까요?"
      actionLabel="태스크 추가"
      onAction={onAdd}
    />
  );
}

export function HabitsEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="🌱"
      title="습관을 만들어보세요"
      message="작은 습관부터 시작해볼까요?"
      actionLabel="습관 추가"
      onAction={onAdd}
    />
  );
}

export function ConversationsEmptyState() {
  return (
    <EmptyState
      icon="🐧"
      title="알프레도와 대화해보세요"
      message="무엇이든 물어보세요!"
    />
  );
}
