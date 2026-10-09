import React from 'react';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function AdminParticipantsLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-36 rounded mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded shrink-0" />
            <Skeleton className="h-7 w-72 rounded" />
          </div>
          <Skeleton className="h-3.5 w-96 max-w-full rounded" />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <Skeleton className="h-9 w-full md:w-72 rounded-md" />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}

