import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Trophy, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function JudgePortalPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'JUDGE' && user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/');
  }

  const submissions = await prisma.submission.findMany({
    include: {
      event: { include: { fest: true } },
      team: true,
      user: true,
      scores: {
        where: { judgeId: user.id },
      },
    },
    orderBy: { submittedAt: 'desc' },
  });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800">
              Judge Evaluation Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            Assigned Project Submissions
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Welcome, {user.name}. Evaluate contest entries across the 4 official 30-pt criteria.
          </p>
        </div>

        <Link
          href="/leaderboards"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <span>View Public Scoreboards</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 shadow-xs">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">No project submissions available for evaluation yet.</p>
          </div>
        ) : (
          submissions.map((sub) => {
            const myScore = sub.scores[0];
            return (
              <div
                key={sub.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400 font-bold">
                      {sub.event.title}
                    </span>
                    {myScore ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Scored: {myScore.totalScore}/120
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Awaiting Your Score
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {sub.title}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {sub.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                    <span className="text-zinc-800 dark:text-zinc-300 font-medium">
                      {sub.team ? `Team: ${sub.team.name}` : `Author: ${sub.user.name}`}
                    </span>
                    <a
                      href={sub.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                      Repository
                    </a>
                    <a
                      href={sub.liveDemoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Live Demo
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <Link
                    href={`/judge/eval/${sub.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-sm"
                  >
                    <span>{myScore ? 'Update Rubric Score' : 'Evaluate Project'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
