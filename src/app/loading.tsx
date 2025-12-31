import { MasonryGridSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1260px] mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <MasonryGridSkeleton count={12} />
      </div>
    </div>
  );
}
