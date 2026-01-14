import { ReactNode, HTMLAttributes } from 'react';

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
  ...props
}: CardProps) {
  // Base styles - radius: 16px (rounded-xl)
  var baseStyles = 'rounded-xl transition-all duration-200';
  
  // Variant styles (라이트모드)
  var variantStyles = {
    default: 'bg-white shadow-card',
    elevated: 'bg-[#F0F0FF]', // 알프레도 메시지 배경
    priority: 'bg-white shadow-card border-l-[3px]',
    alfredo: 'bg-[#F0F0FF]', // 알프레도 메시지 배경
  };
  
  // Priority border colors
  var priorityBorderColors = {
    1: 'border-l-[#FFD700]', // 골드
    2: 'border-l-[#D4D4D4]',
    3: 'border-l-[#E5E5E5]',
  };
  
  // Hover styles
  var hoverStyles = hoverable ? 'hover:shadow-card-hover cursor-pointer' : '';
  
  // Padding - 16px
  var paddingStyles = noPadding ? '' : 'p-4';
  
  // Build final className
  var finalClassName = [
    baseStyles,
    variantStyles[variant],
    variant === 'priority' && priority ? priorityBorderColors[priority] : '',
    hoverStyles,
    paddingStyles,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={finalClassName} {...props}>
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
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-xl">🐧</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        {onMore && (
          <button
            onClick={onMore}
            className="text-sm text-[#666666] hover:text-[#1A1A1A] flex-shrink-0 min-h-[44px] flex items-center"
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
