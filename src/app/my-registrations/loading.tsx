import React from 'react';
import { Skeleton, TicketPassSkeleton } from '@/components/ui/Skeleton';

export default function MyRegistrationsLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5 space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded shrink-0" />
          <Skeleton className="h-7 w-72 rounded" />
        </div>
        <Skeleton className="h-3.5 w-96 max-w-full rounded" />
      </div>

      {/* Passes Stack */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <TicketPassSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

