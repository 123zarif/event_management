import React from 'react';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function AuditLogsLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-36 rounded mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded shrink-0" />
            <Skeleton className="h-7 w-64 rounded" />
          </div>
          <Skeleton className="h-3.5 w-96 max-w-full rounded" />
        </div>
      </div>

      {/* Audit Log Table Skeleton */}
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}

