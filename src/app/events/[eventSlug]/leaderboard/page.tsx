import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ScoreboardFreezeBanner } from '@/components/ScoreboardFreezeBanner';
import { toggleScoreboardFreeze } from '@/actions/competitions';
import { Trophy, ArrowLeft, ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

interface LeaderboardPageProps {
  params: Promise<{ eventSlug: string }>;
}

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
  const { eventSlug } = await params;
  const user = await getCurrentUser();

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: {
      fest: true,
      submissions: {
        include: {
          team: true,
          user: true,
          scores: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Tally and rank submissions by total average score
  const rankedSubmissions = event.submissions
    .map((sub) => {
      const totalScore = sub.scores.reduce((acc, curr) => acc + curr.totalScore, 0);
      const avgScore = sub.scores.length > 0 ? totalScore / sub.scores.length : 0;
      return {
        ...sub,
        avgScore: Math.round(avgScore * 10) / 10,
        judgeCount: sub.scores.length,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  async function handleToggleFreeze() {
    'use server';
    if (!event) return;
    await toggleScoreboardFreeze(event.id, !event.isScoreboardFrozen);
    revalidatePath(`/events/${event.slug}/leaderboard`);
  }

  return (
    <div className="w-full space-y-6">
      {/* Header & Back */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Event Hub
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Live Standings: {event.title}
            </h1>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Real-time ranked scoreboard evaluated across UI/UX (30), Registration (30), Organizer Ops (30), and Bonus (30).
          </p>
        </div>

        {user?.role === 'JUDGE' && (
          <Link
            href="/judge"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-sm"
          >
            <span>Judge Scoring Panel</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Freeze Banner */}
      <form action={handleToggleFreeze}>
        <ScoreboardFreezeBanner
          isFrozen={event.isScoreboardFrozen}
          role={user?.role}
          onToggleFreeze={undefined}
        />
      </form>

      {/* Standings Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 font-mono text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Contestant / Team</th>
                <th className="py-3 px-4">Project Title</th>
                <th className="py-3 px-4">Links</th>
                <th className="py-3 px-4 text-center">Judged By</th>
                <th className="py-3 px-4 text-right">Score (Max 120)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900">
              {rankedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No evaluated submissions on the board yet.
                  </td>
                </tr>
              ) : (
                rankedSubmissions.map((sub, index) => {
                  const rank = index + 1;
                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors ${
                        rank === 1 ? 'bg-violet-50/50 dark:bg-violet-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-bold">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-400/20 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-400/40">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-800/20 text-amber-800 dark:text-amber-600 border border-amber-300 dark:border-amber-800/40">
                            3
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-mono">#{rank}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-200">
                          {sub.team?.name || sub.user.name}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {sub.team ? `Captain: ${sub.user.name}` : sub.user.email}
                        </p>
                      </td>

                      <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-300">
                        {sub.title}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={sub.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            title="GitHub Repository"
                          >
                            <GithubIcon className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={sub.liveDemoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            title="Live Deployment"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-zinc-600 dark:text-zinc-400">
                        {sub.judgeCount} {sub.judgeCount === 1 ? 'Judge' : 'Judges'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-bold font-mono text-violet-600 dark:text-violet-400">
                          {sub.avgScore}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-mono"> / 120</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
