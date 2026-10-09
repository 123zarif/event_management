import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-zinc-200/80 dark:bg-zinc-800/80', className)}
      {...props}
    />
  );
}

/**
 * Skeleton that mirrors EventCard (16:9 banner, title, metadata, capacity, footer button)
 */
export function EventCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-xs">
      <div>
        {/* Top 16:9 banner placeholder */}
        <div className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-800 animate-pulse flex items-center justify-center">
          <Skeleton className="h-8 w-8 rounded-lg bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Category chip & State badge */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>

          {/* Event title & subtitle */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-5 w-4/5 rounded" />
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3.5 w-2/3 rounded" />
          </div>

          {/* Meta rows (Date, Venue) */}
          <div className="pt-2 space-y-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded shrink-0" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded shrink-0" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 sm:px-5 py-3.5 bg-zinc-50/80 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton that mirrors FestCard in the /fests directory
 */
export function FestCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-xs flex flex-col justify-between">
      <div>
        {/* Festival Cover */}
        <div className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-800 animate-pulse flex items-center justify-center">
          <Skeleton className="h-10 w-10 rounded-xl bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Festival Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>

          <div className="space-y-1.5">
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3.5 w-5/6 rounded" />
          </div>

          <div className="pt-2 space-y-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded shrink-0" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded shrink-0" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton for standard dashboard metric counters (Live Fests, Competitions, etc.)
 */
export function MetricCardSkeleton() {
  return (
    <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-16 rounded" />
      <Skeleton className="h-2.5 w-32 rounded" />
    </div>
  );
}

/**
 * Skeleton for tables (participants registry, audit logs, submissions)
 */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
      {/* Table Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Table rows */}
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-3.5 w-40 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </div>
            {Array.from({ length: cols - 2 }).map((_, cIdx) => (
              <Skeleton key={cIdx} className="hidden sm:block h-3.5 w-24 rounded" />
            ))}
            <Skeleton className="h-7 w-20 rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Leaderboard / Standings ranking cards
 */
export function LeaderboardItemSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3.5 min-w-0">
        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <Skeleton className="h-3 w-48 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right space-y-1 hidden sm:block">
          <Skeleton className="h-4 w-14 rounded ml-auto" />
          <Skeleton className="h-2.5 w-20 rounded ml-auto" />
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Skeleton for My Registrations / Tickets cards
 */
export function TicketPassSkeleton() {
  return (
    <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4 min-w-0">
        {/* QR thumbnail box */}
        <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-48 rounded" />
          <div className="flex items-center gap-3 text-xs">
            <Skeleton className="h-3 w-32 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
        <Skeleton className="h-8 flex-1 sm:flex-initial sm:w-28 rounded-md" />
        <Skeleton className="h-8 flex-1 sm:flex-initial sm:w-24 rounded-md" />
      </div>
    </div>
  );
}

