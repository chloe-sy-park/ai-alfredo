// MainCardSkeleton.tsx - Loading State MainCard
import { MainCardShell, OSType } from './MainCardShell';

interface MainCardSkeletonProps {
  os: OSType;
}

/**
 * MainCardSkeleton - 로딩 상태의 MainCard
 *
 * 4블록 구조의 스켈레톤:
 * A. Context 스켈레톤
 * B. Insight 스켈레톤
 * C. CTA 스켈레톤
 * D. Follow-up 스켈레톤 (optional)
 */
export function MainCardSkeleton({ os }: MainCardSkeletonProps) {
  return (
    <MainCardShell os={os}>
      <div className="flex flex-col gap-4">
        {/* A: Context Skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded animate-skeleton" />
          <div className="w-20 h-3 rounded animate-skeleton" />
        </div>

        {/* B: Core Insight Skeleton */}
        <div className="space-y-2">
          <div className="w-full h-4 rounded animate-skeleton" />
          <div className="w-3/4 h-4 rounded animate-skeleton" />
        </div>

        {/* C: CTA Skeleton */}
        <div className="w-full h-12 rounded-xl animate-skeleton" />

        {/* D: Follow-up Skeleton */}
        <div className="w-32 h-3 rounded mx-auto animate-skeleton" />
      </div>
    </MainCardShell>
  );
}

export default MainCardSkeleton;
