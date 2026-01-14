// Skeleton Loader Component
// Subtle loading states following Alfredo's micro-interaction principles

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: boolean;
}

export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  animation = true
}: SkeletonProps) {
  var baseClasses = 'bg-neutral-200';
  var animationClass = animation ? 'animate-pulse' : '';
  
  var variantClasses = {
    text: 'h-4 rounded',
    card: 'rounded-xl',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };
  
  var style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${animationClass} ${className}`}
      style={style}
    />
  );
}

// Preset skeletons for common patterns
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-card animate-fade-in">
      <div className="space-y-3">
        <Skeleton width="40%" height={20} />
        <Skeleton width="100%" height={16} />
        <Skeleton width="80%" height={16} />
      </div>
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 p-3 animate-fade-in">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  );
}

export function SkeletonBriefing() {
  return (
    <div className="bg-gradient-to-r from-neutral-100 to-neutral-50 rounded-xl p-4 animate-slide-down">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-1">
          <Skeleton width="30%" height={16} />
          <Skeleton width="20%" height={12} />
        </div>
      </div>
      <div className="bg-white/70 rounded-lg p-3 space-y-2">
        <Skeleton width="90%" height={14} />
        <Skeleton width="75%" height={14} />
      </div>
    </div>
  );
}

// Loading states for different contexts
export function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" />
      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse animation-delay-150" />
      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse animation-delay-300" />
    </div>
  );
}

export function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div 
      className="inline-block animate-spin text-primary"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-25"
        />
        <path 
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}