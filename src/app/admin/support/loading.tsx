import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminSupportLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32 rounded mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded shrink-0" />
            <Skeleton className="h-7 w-80 rounded" />
          </div>
          <Skeleton className="h-3.5 w-96 max-w-full rounded" />
        </div>
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
      </div>

      {/* Tickets List Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16 rounded font-mono" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <Skeleton className="h-8 w-32 rounded-md" />
            </div>

            <Skeleton className="h-5 w-2/3 rounded" />
            <Skeleton className="h-3.5 w-full rounded" />

            <div className="flex items-center gap-4 text-xs pt-1">
              <Skeleton className="h-3 w-36 rounded" />
              <Skeleton className="h-3 w-48 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

