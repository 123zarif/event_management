import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  switch (normalized) {
    case 'CONFIRMED':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 ${className}`}>
          ● Confirmed
        </span>
      );
    case 'CHECKED_IN':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/80 ${className}`}>
          ✓ Checked In
        </span>
      );
    case 'WAITLISTED':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 ${className}`}>
          ⏳ Waitlisted
        </span>
      );
    case 'CANCELLED':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 ${className}`}>
          ✕ Cancelled
        </span>
      );
    case 'ONGOING':
    case 'LIVE':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 ${className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
          Live Fest
        </span>
      );
    case 'UPCOMING':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/80 ${className}`}>
          Upcoming
        </span>
      );
    case 'OPEN':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 ${className}`}>
          Open
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 ${className}`}>
          In Progress
        </span>
      );
    case 'RESOLVED':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 ${className}`}>
          Resolved
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 ${className}`}>
          {status}
        </span>
      );
  }
}
