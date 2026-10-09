import React from 'react';
import { Skeleton, FestCardSkeleton } from '@/components/ui/Skeleton';

export default function FestsLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>
        <Skeleton className="h-9 w-40 rounded-md shrink-0" />
      </div>

      {/* Fests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <FestCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

