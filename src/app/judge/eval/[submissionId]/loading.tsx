import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function JudgeEvalLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Back button */}
      <div>
        <Skeleton className="h-4 w-36 rounded" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-8 w-2/3 rounded" />
          <Skeleton className="h-3.5 w-80 max-w-full rounded" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Submission details & links */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4 shadow-xs">
            <Skeleton className="h-5 w-40 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-5/6 rounded" />
              <Skeleton className="h-3.5 w-2/3 rounded" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Rubric sliders & submit */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5 shadow-xs">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-6 w-16 rounded font-mono" />
            </div>

            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-3.5 w-10 rounded font-mono" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}

            <Skeleton className="h-10 w-full rounded-md mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

