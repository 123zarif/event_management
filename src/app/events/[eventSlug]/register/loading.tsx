import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EventRegisterLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb back link */}
      <div>
        <Skeleton className="h-4 w-36 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Skeleton */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 space-y-2">
            <Skeleton className="h-3 w-36 rounded font-mono" />
            <Skeleton className="h-7 w-72 rounded" />
            <Skeleton className="h-3.5 w-96 max-w-full rounded" />
          </div>

          <div className="space-y-6">
            {/* Mode selection placeholder */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>

            {/* Submit Button */}
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>

        {/* Right 1 Col: Event Overview Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-xs">
            <Skeleton className="h-4 w-28 rounded pb-2 border-b border-zinc-200 dark:border-zinc-800" />

            <div className="space-y-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-2.5 w-20 rounded font-mono" />
                  <Skeleton className="h-4 w-40 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

