/**
 * LoadingState
 * PRD Component Inventory: 로딩 상태 컴포넌트
 * 스켈레톤과 스피너를 통합한 일관된 로딩 UI
 */

import { Loader2 } from 'lucide-react';

type LoadingVariant = 'spinner' | 'skeleton-card' | 'skeleton-briefing' | 'skeleton-list' | 'skeleton-timeline';

interface LoadingStateProps {
  variant?: LoadingVariant;
  message?: string;
  count?: number;
}

// 스켈레톤 카드
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm animate-pulse">
      <div className="h-4 bg-[#E5E5E5] dark:bg-gray-700 rounded w-1/3 mb-3" />
      <div className="h-6 bg-[#E5E5E5] dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-[#E5E5E5] dark:bg-gray-700 rounded w-1/2" />
    </div>
  );
}

// 스켈레톤 브리핑
function SkeletonBriefing() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-[#E5E5E5] dark:bg-gray-700 rounded-full" />
        <div className="h-4 bg-[#E5E5E5] dark:bg-gray-700 rounded w-24" />
      </div>
      <div className="space-y-3">
        <div className="h-5 bg-[#E5E5E5] dark:bg-gray-700 rounded w-full" />
        <div className="h-5 bg-[#E5E5E5] dark:bg-gray-700 rounded w-4/5" />
        <div className="h-4 bg-[#E5E5E5] dark:bg-gray-700 rounded w-2/3" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-[#E5E5E5] dark:bg-gray-700 rounded-full w-20" />
        <div className="h-8 bg-[#E5E5E5] dark:bg-gray-700 rounded-full w-16" />
      </div>
    </div>
  );
}

// 스켈레톤 리스트 아이템
function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-10 h-10 bg-[#E5E5E5] dark:bg-gray-700 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-[#E5E5E5] dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-3 bg-[#E5E5E5] dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
}

// 스켈레톤 타임라인 아이템
function SkeletonTimelineItem() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-[#E5E5E5] dark:bg-gray-700 rounded-full" />
        <div className="w-0.5 h-12 bg-[#E5E5E5] dark:bg-gray-700" />
      </div>
      <div className="flex-1 pb-4">
        <div className="h-3 bg-[#E5E5E5] dark:bg-gray-700 rounded w-16 mb-2" />
        <div className="h-4 bg-[#E5E5E5] dark:bg-gray-700 rounded w-3/4" />
      </div>
    </div>
  );
}

// 스피너
function Spinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-[#A996FF] animate-spin mb-3" />
      {message && (
        <p className="text-sm text-[#999999] dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}

export default function LoadingState({
  variant = 'spinner',
  message,
  count = 3
}: LoadingStateProps) {
  if (variant === 'spinner') {
    return <Spinner message={message} />;
  }

  if (variant === 'skeleton-card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map(function(_, index) {
          return <SkeletonCard key={index} />;
        })}
      </div>
    );
  }

  if (variant === 'skeleton-briefing') {
    return <SkeletonBriefing />;
  }

  if (variant === 'skeleton-list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-[#E5E5E5] dark:divide-gray-700">
        {Array.from({ length: count }).map(function(_, index) {
          return <SkeletonListItem key={index} />;
        })}
      </div>
    );
  }

  if (variant === 'skeleton-timeline') {
    return (
      <div className="pl-2">
        {Array.from({ length: count }).map(function(_, index) {
          return <SkeletonTimelineItem key={index} />;
        })}
      </div>
    );
  }

  return <Spinner message={message} />;
}

// Named exports for direct usage
export { SkeletonCard, SkeletonBriefing, SkeletonListItem, SkeletonTimelineItem, Spinner };
