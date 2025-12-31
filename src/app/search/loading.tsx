import { MasonryGridSkeleton, BoardsGridSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1260px] mx-auto px-4 py-8">
        {/* Search input skeleton */}
        <div className="mb-8">
          <div className="h-12 w-full max-w-2xl mx-auto bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Results skeleton */}
        <div className="space-y-8">
          {/* Pins section */}
          <div>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
            <MasonryGridSkeleton count={8} />
          </div>

          {/* Boards section */}
          <div>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
            <BoardsGridSkeleton count={6} />
          </div>
        </div>
      </div>
    </div>
  );
}
