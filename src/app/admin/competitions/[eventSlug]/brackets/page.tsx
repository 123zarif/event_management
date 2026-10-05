import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { advanceBracketWinner } from '@/actions/competitions';
import { Trophy, ArrowLeft, Swords } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

interface BracketsPageProps {
  params: Promise<{ eventSlug: string }>;
}

export default async function AdminBracketsPage({ params }: BracketsPageProps) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/');
  }

  const { eventSlug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: {
      fest: true,
      bracketMatches: {
        include: {
          team1: true,
          team2: true,
          winner: true,
        },
        orderBy: { matchNumber: 'asc' },
      },
    },
  });

  if (!event) {
    notFound();
  }

  async function handleAdvance(formData: FormData) {
    'use server';
    const matchId = formData.get('matchId') as string;
    const winnerId = formData.get('winnerId') as string;
    const score1 = parseInt((formData.get('score1') as string) || '0', 10);
    const score2 = parseInt((formData.get('score2') as string) || '0', 10);

    if (matchId && winnerId) {
      await advanceBracketWinner(matchId, winnerId, score1, score2);
      revalidatePath(`/admin/competitions/${eventSlug}/brackets`);
    }
  }

  const semiFinals = event.bracketMatches.filter((m) => m.roundName === 'SEMIFINAL');
  const finals = event.bracketMatches.filter((m) => m.roundName === 'FINAL');

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Swords className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            Tournament Bracket Manager: {event.title}
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Single-elimination knockout bracket tree with 1-click match advancement into finals.
          </p>
        </div>
      </div>

      {/* Bracket Tree Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Semifinals Column */}
        <div className="space-y-4">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-violet-600 dark:text-violet-400">
              Round 1: Semifinals
            </h2>
          </div>

          <div className="space-y-4">
            {semiFinals.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3 shadow-xs"
              >
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                  <span>Match #{m.matchNumber}</span>
                  {m.winner && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Winner: {m.winner.name}
                    </span>
                  )}
                </div>

                <form action={handleAdvance} className="space-y-2 text-xs">
                  <input type="hidden" name="matchId" value={m.id} />

                  <div className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                      {m.team1?.name || 'TBD'}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="score1"
                        defaultValue={m.score1}
                        className="w-12 px-2 py-1 rounded bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-center font-mono text-zinc-900 dark:text-zinc-100"
                      />
                      {m.team1 && (
                        <button
                          type="submit"
                          name="winnerId"
                          value={m.team1.id}
                          className="px-2 py-1 rounded text-[10px] font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors"
                        >
                          Win
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                      {m.team2?.name || 'TBD'}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="score2"
                        defaultValue={m.score2}
                        className="w-12 px-2 py-1 rounded bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-center font-mono text-zinc-900 dark:text-zinc-100"
                      />
                      {m.team2 && (
                        <button
                          type="submit"
                          name="winnerId"
                          value={m.team2.id}
                          className="px-2 py-1 rounded text-[10px] font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors"
                        >
                          Win
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            ))}
          </div>
        </div>

        {/* Finals Column */}
        <div className="space-y-4">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-amber-600 dark:text-amber-400">
              Grand Championship Final
            </h2>
          </div>

          <div className="space-y-4">
            {finals.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/30 dark:bg-zinc-950 space-y-4 shadow-sm"
              >
                <div className="flex justify-between items-center text-[10px] font-mono text-amber-700 dark:text-amber-400 border-b border-zinc-200 dark:border-zinc-900 pb-2">
                  <span className="flex items-center gap-1 font-bold">
                    <Trophy className="h-3.5 w-3.5" />
                    CHAMPIONSHIP MATCH
                  </span>
                  {m.winner && (
                    <span className="text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                      🏆 Champion: {m.winner.name}
                    </span>
                  )}
                </div>

                <form action={handleAdvance} className="space-y-3 text-xs">
                  <input type="hidden" name="matchId" value={m.id} />

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {m.team1?.name || 'Winner Semi 1'}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="score1"
                        defaultValue={m.score1}
                        className="w-14 px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-center font-mono text-zinc-900 dark:text-zinc-100 font-bold"
                      />
                      {m.team1 && (
                        <button
                          type="submit"
                          name="winnerId"
                          value={m.team1.id}
                          className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors shadow-xs"
                        >
                          Crown Champion
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {m.team2?.name || 'Winner Semi 2'}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="score2"
                        defaultValue={m.score2}
                        className="w-14 px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-center font-mono text-zinc-900 dark:text-zinc-100 font-bold"
                      />
                      {m.team2 && (
                        <button
                          type="submit"
                          name="winnerId"
                          value={m.team2.id}
                          className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors shadow-xs"
                        >
                          Crown Champion
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
