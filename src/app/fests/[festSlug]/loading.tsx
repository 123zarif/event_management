import React from 'react';
import { Skeleton, EventCardSkeleton } from '@/components/ui/Skeleton';

export default function FestDetailLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Back button */}
      <div>
        <Skeleton className="h-4 w-36 rounded" />
      </div>

      {/* Fest Header Overview */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <Skeleton className="h-8 w-3/4 rounded" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
        </div>

        <div className="space-y-1.5 max-w-3xl">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>

        <div className="flex flex-wrap items-center gap-6 border-t border-zinc-200 dark:border-zinc-800/80 pt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded shrink-0" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded shrink-0" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
      </div>

      {/* Events List in Fest */}
      <div className="space-y-4">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 space-y-1">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-3.5 w-80 max-w-full rounded" />
        </div>

        {/* Competitions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

