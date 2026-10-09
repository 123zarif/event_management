import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EventDetailLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-12 rounded" />
        <span className="text-zinc-400 dark:text-zinc-600 text-xs">/</span>
        <Skeleton className="h-3 w-32 rounded" />
        <span className="text-zinc-400 dark:text-zinc-600 text-xs">/</span>
        <Skeleton className="h-3 w-40 rounded" />
      </div>

      {/* Contest Banner Hero Skeleton */}
      <div className="w-full aspect-21/9 max-h-72 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 overflow-hidden shadow-xs relative flex items-end p-4">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-5 w-28 rounded bg-zinc-300 dark:bg-zinc-800" />
          <Skeleton className="h-5 w-36 rounded bg-zinc-300 dark:bg-zinc-800" />
        </div>
      </div>

      {/* Main Header Card Skeleton */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>

            <Skeleton className="h-8 w-3/4 rounded" />

            <div className="space-y-1.5 pt-1">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 min-w-[200px]">
            <Skeleton className="h-10 w-full rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md shrink-0" />
            </div>
          </div>
        </div>

        {/* Schedule & Capacity Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-zinc-200 dark:border-zinc-800/80 pt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 p-1">
              <Skeleton className="h-2.5 w-20 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded shrink-0" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules & Guidelines Skeleton */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <div className="space-y-2 pt-1">
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-4/5 rounded" />
          <Skeleton className="h-3.5 w-3/4 rounded" />
        </div>
      </div>

      {/* Criteria Rubric Skeleton */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <Skeleton className="h-5 w-56 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

