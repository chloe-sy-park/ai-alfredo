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
  // Base styles - 디자인 시스템: radius 16px
  var baseStyles = 'rounded-[16px] transition-all duration-200';
  
  // Variant styles
  var variantStyles = {
    default: 'bg-white shadow-card',
    elevated: 'bg-[#F0F0FF] shadow-card', // 알프레도 메시지 배경
    priority: 'bg-white shadow-card border-l-[3px]',
    alfredo: 'bg-[#F0F0FF] shadow-card', // 알프레도 메시지 배경
  };
  
  // Priority border colors
  var priorityBorderColors = {
    1: 'border-l-[#FFD700]', // 골드
    2: 'border-l-neutral-300',
    3: 'border-l-neutral-200',
  };
  
  // Hover styles
  var hoverStyles = hoverable ? 'hover:shadow-card-hover cursor-pointer' : '';
  
  // Padding - 디자인 시스템: 16px
  var paddingStyles = noPadding ? '' : 'p-[16px]';
  
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
      <div className="flex items-start gap-[12px]">
        {/* 아바타 - 40x40 */}
        {showAvatar && (
          <div className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-xl">🐧</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        {onMore && (
          <button
            onClick={onMore}
            className="text-sm text-lavender-600 hover:text-lavender-700 flex-shrink-0 min-h-[44px] flex items-center"
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
