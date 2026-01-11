interface SkeletonProps {
  variant?: 'text' | 'card' | 'circle' | 'custom';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export default function Skeleton({ 
  variant = 'text',
  width,
  height,
  className = '',
  count = 1
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 animate-pulse rounded';

  const variantClasses = {
    text: 'h-4 rounded',
    card: 'h-20 rounded-xl',
    circle: 'rounded-full',
    custom: ''
  };

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          style={{ 
            width: width || (variant === 'circle' ? '40px' : '100%'),
            height: height || (variant === 'circle' ? '40px' : undefined)
          }}
        />
      ))}
    </>
  );
}

// 프리셋 스켈레톤
export function TaskSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-white border border-gray-100">
      <div className="flex items-start gap-3">
        <Skeleton variant="circle" width="20px" height="20px" />
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" />
          <Skeleton width="40%" className="h-3" />
        </div>
      </div>
    </div>
  );
}

export function HabitSkeleton() {
  return (
    <div className="p-3 rounded-xl bg-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton variant="circle" width="18px" height="18px" />
        <Skeleton width="60%" className="h-4" />
      </div>
      <Skeleton height="6px" className="rounded-full" />
      <Skeleton width="40%" className="h-3 mt-1" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-white border border-gray-100 space-y-3">
      <Skeleton width="50%" />
      <Skeleton count={2} className="h-3" />
    </div>
  );
}
