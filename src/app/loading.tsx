import React from 'react';
import { Skeleton, EventCardSkeleton, MetricCardSkeleton } from '@/components/ui/Skeleton';

export default function RootLoading() {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Hero Showcase Skeleton */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 pb-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Pill */}
            <Skeleton className="h-6 w-72 rounded-md" />
            {/* Heading */}
            <Skeleton className="h-9 sm:h-11 w-4/5 rounded-lg" />
            {/* Subtitle */}
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Skeleton className="h-9 w-36 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>

        {/* Metric Counters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      </section>

      {/* Featured Arena Banner Placeholder */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-7 w-2/3 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>

      {/* Grid of Competitions Skeletons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <Skeleton className="h-5 w-44 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </div>
    </div>
  );
}

