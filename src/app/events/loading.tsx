import React from 'react';
import { Skeleton, EventCardSkeleton } from '@/components/ui/Skeleton';

export default function EventsLoading() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md shrink-0" />
      </div>

      {/* Filter and Search Bar Skeletons */}
      <div className="space-y-4">
        {/* Category Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Skeleton className="h-8 w-16 rounded-full shrink-0" />
          <Skeleton className="h-8 w-28 rounded-full shrink-0" />
          <Skeleton className="h-8 w-36 rounded-full shrink-0" />
          <Skeleton className="h-8 w-32 rounded-full shrink-0" />
          <Skeleton className="h-8 w-24 rounded-full shrink-0" />
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Grid of 6 Event Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
      </div>
    </div>
  );
}

