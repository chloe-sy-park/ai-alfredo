import { ReactNode, HTMLAttributes, CSSProperties } from 'react';

type CardVariant = 'default' | 'elevated' | 'priority' | 'alfredo';
type PriorityLevel = 1 | 2 | 3;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  priority?: PriorityLevel;
  children: ReactNode;
  noPadding?: boolean;
  hoverable?: boolean;
}

export default function Card({
  variant = 'default',
  priority,
  children,
  noPadding = false,
  hoverable = false,
  className = '',
  style,
  ...props
}: CardProps) {
  // Base styles - radius: 16px (rounded-xl)
  const baseStyles = 'rounded-xl transition-all duration-200';

  // Variant class styles
  const variantClasses: Record<CardVariant, string> = {
    default: 'shadow-card',
    elevated: '', // 알프레도 메시지 배경
    priority: 'shadow-card border-l-[3px]',
    alfredo: '', // 알프레도 메시지 배경
  };

  // Variant inline styles using tokens
  const variantInlineStyles: Record<CardVariant, CSSProperties> = {
    default: { backgroundColor: 'var(--surface-default)' },
    elevated: { backgroundColor: 'var(--surface-subtle)' },
    priority: { backgroundColor: 'var(--surface-default)' },
    alfredo: { backgroundColor: 'var(--surface-subtle)' },
  };

  // Priority border colors using tokens
  const priorityBorderColors: Record<PriorityLevel, string> = {
    1: 'border-l-[var(--accent-primary)]', // 골드
    2: 'border-l-[var(--border-default)]',
    3: 'border-l-[var(--border-default)]',
  };

  // Hover styles
  const hoverStyles = hoverable ? 'hover:shadow-card-hover cursor-pointer' : '';

  // Padding - 16px
  const paddingStyles = noPadding ? '' : 'p-4';

  // Build final className
  const finalClassName = [
    baseStyles,
    variantClasses[variant],
    variant === 'priority' && priority ? priorityBorderColors[priority] : '',
    hoverStyles,
    paddingStyles,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={finalClassName}
      style={{ ...variantInlineStyles[variant], ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

// 알프레도 메시지 전용 카드
interface AlfredoCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  showAvatar?: boolean;
  onMore?: () => void;
}

export function AlfredoCard({
  children,
  showAvatar = true,
  onMore,
  className = '',
  ...props
}: AlfredoCardProps) {
  return (
    <Card variant="alfredo" className={className} {...props}>
      <div className="flex gap-3">
        {/* 아바타 - 40x40 */}
        {showAvatar && (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          >
            <img
              src="/assets/alfredo/avatar/alfredo-avatar-48.png"
              alt="알프레도"
              className="w-8 h-8 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-xl">🎩</span>'; }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        {onMore && (
          <button
            onClick={onMore}
            className="text-sm flex-shrink-0 min-h-[44px] flex items-center hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            더보기
          </button>
        )}
      </div>
    </Card>
  );
}

// 우선순위 카드
interface PriorityCardProps extends HTMLAttributes<HTMLDivElement> {
  priority: PriorityLevel;
  children: ReactNode;
}

export function PriorityCard({
  priority,
  children,
  className = '',
  ...props
}: PriorityCardProps) {
  return (
    <Card
      variant="priority"
      priority={priority}
      className={className}
      hoverable
      {...props}
    >
      {children}
    </Card>
  );
}
