import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { 
  Trophy, 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Layers,
  FileCheck
} from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { formatDateTime } from '@/lib/utils';

interface JudgeDashboardProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function JudgeDashboard({ currentUser }: JudgeDashboardProps) {
  // Fetch submissions and this judge's scores
  const submissions = await prisma.submission.findMany({
    include: {
      event: { include: { fest: true } },
      team: true,
      user: true,
      scores: {
        where: { judgeId: currentUser.id },
      },
    },
    orderBy: { submittedAt: 'desc' },
  });

  const totalSubmissions = submissions.length;
  const scoredCount = submissions.filter((s) => s.scores.length > 0).length;
  const pendingCount = totalSubmissions - scoredCount;

  // Average score given
  const allScores = submissions
    .filter((s) => s.scores.length > 0)
    .map((s) => s.scores[0].totalScore);
  const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

  // Check if any scoreboard is frozen
  const anyFrozen = submissions.some((s) => s.event.isScoreboardFrozen);

  return (
    <div className="w-full space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Judge Evaluation Workspace
            </span>
            {anyFrozen && (
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Scoreboard Frozen
              </span>
            )}
            <span className="text-xs text-zinc-500 font-mono">
              9th DRMC International Tech Carnival 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Award className="h-7 w-7 text-violet-600 dark:text-violet-400" />
            Evaluation Console — {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Review submitted student projects, inspect public GitHub repositories and live deployments, and grade entries across the 120-pt rubric.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/leaderboards"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Layers className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            Public Scoreboards
          </Link>
        </div>
      </div>

      {/* 2. Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Assigned Projects</span>
            <FileCheck className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalSubmissions}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Entries across assigned tracks</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Evaluated by You</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{scoredCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Scores recorded & audited</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Pending Review</span>
            <Clock className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Awaiting your evaluation</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Your Mean Score</span>
            <Trophy className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{avgScore} <span className="text-xs text-zinc-400 font-normal">/ 120</span></p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Across {scoredCount} completed scorecards</p>
        </div>
      </div>

      {/* 3. Official Evaluation Rubric Card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
          <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
            Official 120-Point Judging Rubric Reference
          </h2>
          <span className="text-[10px] text-violet-600 dark:text-violet-400 font-mono">Rulebook Compliant</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-xs">Fest Directory & UX</span>
            <span className="text-violet-600 dark:text-violet-400 font-bold text-sm">30 pts</span>
            <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Hierarchy, restrained typography, dark mode</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-xs">Registration System</span>
            <span className="text-violet-600 dark:text-violet-400 font-bold text-sm">30 pts</span>
            <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Dynamic fields, teams, concurrency safety</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-xs">Organizer Management</span>
            <span className="text-violet-600 dark:text-violet-400 font-bold text-sm">30 pts</span>
            <p className="text-[10px] text-zinc-500 font-sans mt-0.5">QR scanner, badge printing, participant exports</p>
          </div>
          <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-900/50">
            <span className="font-semibold text-violet-700 dark:text-violet-300 block text-xs">Bonus & Creative</span>
            <span className="text-violet-600 dark:text-violet-400 font-bold text-sm">30 pts</span>
            <p className="text-[10px] text-violet-600/80 dark:text-violet-400/80 font-sans mt-0.5">Brackets, freeze, ticket desk, cert verification</p>
          </div>
        </div>
      </div>

      {/* 4. Submissions List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Assigned Project Submissions ({submissions.length})
          </h2>
          <span className="text-xs font-mono text-zinc-500">
            {pendingCount} remaining to score
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-2">
            <Trophy className="h-8 w-8 text-zinc-400 mx-auto" />
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">No project submissions yet</p>
            <p className="text-xs text-zinc-500">Contestant submissions will appear here automatically for evaluation.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const myScore = sub.scores.length > 0 ? sub.scores[0] : null;

              return (
                <div
                  key={sub.id}
                  className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800">
                          {sub.event.category}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">
                          {sub.event.title}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        Team / Author: <strong className="text-zinc-700 dark:text-zinc-300">{sub.team?.name || sub.user.name}</strong> · Submitted: {formatDateTime(sub.submittedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {myScore ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Score: {myScore.totalScore} / 120
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <Clock className="h-3.5 w-3.5" />
                          Pending Score
                        </span>
                      )}

                      <Link
                        href={`/judge/eval/${sub.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
                      >
                        <span>{myScore ? 'Edit Score' : 'Evaluate Project'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Submission Links Strip */}
                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs font-mono">
                    <a
                      href={sub.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                      <span>GitHub Repo</span>
                      <ExternalLink className="h-3 w-3 text-zinc-400" />
                    </a>

                    <a
                      href={sub.liveDemoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400 hover:underline transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Live Working Deployment</span>
                    </a>

                    {sub.videoUrl && (
                      <a
                        href={sub.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      >
                        <span>Video Demo ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
