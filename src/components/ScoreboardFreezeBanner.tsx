import React from 'react';
import { Lock, EyeOff } from 'lucide-react';

interface ScoreboardFreezeBannerProps {
  isFrozen: boolean;
  role?: string;
  onToggleFreeze?: () => void;
}

export function ScoreboardFreezeBanner({ isFrozen, role, onToggleFreeze }: ScoreboardFreezeBannerProps) {
  if (!isFrozen) {
    if (role === 'ORGANIZER' || role === 'ADMIN') {
      return (
        <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 mb-6 text-xs text-zinc-700 dark:text-zinc-300 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Scoreboard is active and updating in real-time.</span>
          </div>
          {onToggleFreeze && (
            <button
              onClick={onToggleFreeze}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/80 transition-colors font-medium"
            >
              <Lock className="h-3 w-3" />
              Freeze Scoreboard
            </button>
          )}
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border border-amber-300 dark:border-amber-600/80 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 mb-6 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-amber-100 dark:bg-amber-900/60 border border-amber-200 dark:border-amber-700/80">
          <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold tracking-tight text-amber-950 dark:text-amber-300 flex items-center gap-2">
            SCOREBOARD FROZEN
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              ICPC Style
            </span>
          </h4>
          <p className="text-xs text-amber-800 dark:text-amber-300/80 mt-0.5">
            Final standings have been locked to build suspense. The ultimate champions will be unveiled during the Grand Award Ceremony!
          </p>
        </div>
      </div>

      {(role === 'ORGANIZER' || role === 'ADMIN') && onToggleFreeze && (
        <button
          onClick={onToggleFreeze}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-xs font-medium"
        >
          <EyeOff className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
          Unfreeze & Publish Board
        </button>
      )}
    </div>
  );
}
