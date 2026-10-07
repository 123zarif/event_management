'use client';

import React, { useTransition } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { toggleScoreboardFreeze } from '@/actions/competitions';
import { toast } from 'sonner';

interface ScoreboardFreezeBannerProps {
  eventId: string;
  isFrozen: boolean;
  canManageFreeze: boolean;
}

export function ScoreboardFreezeBanner({
  eventId,
  isFrozen,
  canManageFreeze,
}: ScoreboardFreezeBannerProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleScoreboardFreeze(eventId, !isFrozen);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  if (!isFrozen) {
    if (canManageFreeze) {
      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 mb-6 text-xs text-zinc-700 dark:text-zinc-300 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              <strong>Live Scoreboard Active:</strong> Standings and scores update automatically in real-time.
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/90 transition-colors font-semibold shadow-xs disabled:opacity-50"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{isPending ? 'Freezing...' : 'Freeze Scoreboard (ICPC)'}</span>
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 mb-6 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 border border-amber-200 dark:border-amber-700/80 shrink-0">
          <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold tracking-tight text-amber-950 dark:text-amber-200 flex items-center gap-2">
            SCOREBOARD FROZEN
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold">
              ICPC Mode
            </span>
          </h4>
          <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
            Final standings have been locked to build suspense before the Grand Award Ceremony.
          </p>
        </div>
      </div>

      {canManageFreeze && (
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-xs font-semibold shadow-xs disabled:opacity-50"
        >
          <Unlock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span>{isPending ? 'Unfreezing...' : 'Unfreeze & Publish Standings'}</span>
        </button>
      )}
    </div>
  );
}
