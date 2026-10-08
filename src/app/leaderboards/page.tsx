import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Trophy, ArrowRight, Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Competition Scoreboards & Standings',
  description:
    'Live judge rankings, submission evaluations, and official tournament standings across all DRMC competitions.',
  alternates: {
    canonical: '/leaderboards',
  },
  openGraph: {
    title: 'Competition Scoreboards & Standings | ClubSphere',
    description:
      'Live judge rankings, submission evaluations, and official tournament standings across all DRMC competitions.',
    url: '/leaderboards',
    images: ['/api/og?title=Competition%20Scoreboards%20%26%20Standings&category=LEADERBOARDS'],
  },
};

export default async function LeaderboardsIndexPage() {
  const events = await prisma.event.findMany({
    include: {
      fest: true,
      _count: { select: { submissions: true } },
    },
    orderBy: { eventDate: 'asc' },
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            Competition Scoreboards & Live Standings
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Explore real-time judge scoring, algorithmic rankings, and tournament standings across all festival tracks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span>{events.length} Active Tracks</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="flex flex-col justify-between p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800">
                  {ev.category}
                </span>
                {ev.isScoreboardFrozen && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Lock className="h-3 w-3" />
                    Scoreboard Frozen
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                {ev.title}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mb-4">
                Fest: {ev.fest.title}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-mono">
                {ev._count.submissions} Submissions
              </span>
              <Link
                href={`/events/${ev.slug}/leaderboard`}
                className="inline-flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium"
              >
                View Standings
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
