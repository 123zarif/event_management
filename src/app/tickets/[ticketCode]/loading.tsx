import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function TicketLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Back button */}
      <div>
        <Skeleton className="h-4 w-36 rounded" />
      </div>

      <div className="flex flex-col items-center">
        {/* Offline sync note skeleton */}
        <div className="flex items-center gap-1.5 mb-4">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-64 rounded" />
        </div>

        {/* Main E-Ticket Card Skeleton */}
        <div className="w-full max-w-lg rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-md space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-32 rounded font-mono" />
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-3.5 w-28 rounded font-mono" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* QR Code Placeholder */}
          <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <Skeleton className="h-44 w-44 rounded-xl" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-16 rounded uppercase font-mono" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-16 rounded uppercase font-mono" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 flex-1 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

