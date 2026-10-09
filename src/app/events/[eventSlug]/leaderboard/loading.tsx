import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EventLeaderboardLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-36 rounded mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded shrink-0" />
            <Skeleton className="h-7 w-64 rounded" />
          </div>
          <Skeleton className="h-3.5 w-80 max-w-full rounded" />
        </div>
      </div>

      {/* Standings Table Skeleton */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
        {/* Table header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6 w-full">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-40 rounded hidden md:block" />
            <Skeleton className="h-4 w-24 rounded hidden lg:block" />
            <Skeleton className="h-4 w-16 rounded ml-auto" />
          </div>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-900">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                <div className="space-y-1 min-w-0 flex-1">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
                <div className="hidden md:block space-y-1 w-48">
                  <Skeleton className="h-3.5 w-32 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded font-mono shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

