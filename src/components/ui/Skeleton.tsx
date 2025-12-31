import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
        className
      )}
      style={{
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, shimmer 2s linear infinite',
      }}
    />
  );
}

export function PinCardSkeleton() {
  return (
    <div className="mb-4 break-inside-avoid">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
        {/* Image skeleton */}
        <Skeleton className="w-full aspect-[3/4] rounded-t-2xl" />

        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <Skeleton className="h-5 w-3/4 rounded" />

          {/* Description lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
          </div>

          {/* User info */}
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BoardCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Cover image skeleton */}
      <Skeleton className="w-full h-48 rounded-t-2xl" />

      {/* Content */}
      <div className="p-6 space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-2/3 rounded" />

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}

export function TextLineSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4 rounded',
            i === lines - 1 ? 'w-4/5' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function MasonryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PinCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BoardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BoardCardSkeleton key={i} />
      ))}
    </div>
  );
}
