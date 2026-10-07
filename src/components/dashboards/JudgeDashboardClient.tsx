'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileCheck,
  FileText,
  Lock,
  Unlock,
  Layers,
  UserCheck
} from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { formatDateTime } from '@/lib/utils';
import { claimSubmissionForReview, releaseSubmissionClaim } from '@/actions/competitions';
import { toast } from 'sonner';

interface SubmissionWithDetails {
  id: string;
  title: string;
  repoUrl: string;
  liveDemoUrl: string;
  videoUrl?: string | null;
  description: string;
  submittedAt: Date | string;
  revisionNumber?: number;
  team?: { name: string } | null;
  user: { name: string; email: string };
  claimedByJudgeId?: string | null;
  claimedByJudge?: { id: string; name: string; email: string } | null;
  scores: Array<{
    id: string;
    judgeId: string;
    totalScore: number;
    judge: { id: string; name: string; email: string };
  }>;
}

interface AssignedEvent {
  id: string;
  slug: string;
  title: string;
  category: string;
  rulebookUrl?: string | null;
  eventDate?: Date | string | null;
  venue?: string | null;
  isScoreboardFrozen: boolean;
  fest: {
    title: string;
  };
  submissions: SubmissionWithDetails[];
}

interface JudgeDashboardClientProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assignedEvents: AssignedEvent[];
}

export function JudgeDashboardClient({
  currentUser,
  assignedEvents,
}: JudgeDashboardClientProps) {
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const selectedEvent = assignedEvents[activeEventIndex] || assignedEvents[0];

  // Calculate metrics across all assigned tracks
  const totalSubmissions = assignedEvents.reduce((acc, ev) => acc + ev.submissions.length, 0);
  const totalScoredByMe = assignedEvents.reduce(
    (acc, ev) => acc + ev.submissions.filter((s) => s.scores.some((sc) => sc.judgeId === currentUser.id)).length,
    0
  );
  const totalPendingForMe = totalSubmissions - totalScoredByMe;

  // Selected track metrics
  const currentSubmissions = selectedEvent?.submissions || [];
  const currentScoredByMe = currentSubmissions.filter((s) =>
    s.scores.some((sc) => sc.judgeId === currentUser.id)
  ).length;
  const currentPending = currentSubmissions.length - currentScoredByMe;

  const handleClaim = (submissionId: string) => {
    startTransition(async () => {
      const res = await claimSubmissionForReview(submissionId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleReleaseClaim = (submissionId: string) => {
    startTransition(async () => {
      const res = await releaseSubmissionClaim(submissionId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Judge Evaluation Workspace
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {assignedEvents.length} Assigned {assignedEvents.length === 1 ? 'Competition Track' : 'Competition Tracks'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Award className="h-7 w-7 text-violet-600 dark:text-violet-400" />
            Evaluation Console — {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Review submitted student projects, claim entries for exclusive review, and evaluate submissions against track criteria.
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

      {/* 2. Global Assigned Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Assigned Tracks</span>
            <Trophy className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{assignedEvents.length}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Competitions in your roster</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Total Submissions</span>
            <FileCheck className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalSubmissions}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Entries across your tracks</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Evaluated by You</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalScoredByMe}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Official scores recorded</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Pending Scoring</span>
            <Clock className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalPendingForMe}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Awaiting your evaluation</p>
        </div>
      </div>

      {/* 3. Competition Switcher Tabs (Point 19 & 22) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold mb-2">
            Switch Assigned Competition Track:
          </h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {assignedEvents.map((event, idx) => {
              const isActive = idx === activeEventIndex;
              const subCount = event.submissions.length;
              return (
                <button
                  key={event.id}
                  onClick={() => setActiveEventIndex(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shadow-xs ${
                    isActive
                      ? 'bg-violet-600 text-white border-violet-600 shadow-violet-500/10'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
                  }`}
                >
                  <Trophy className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-violet-500'}`} />
                  <span>{event.title}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-violet-700 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {subCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Active Competition Track Info Banner */}
        {selectedEvent && (
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800">
                  {selectedEvent.category}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {selectedEvent.fest.title}
                </span>
                {selectedEvent.isScoreboardFrozen && (
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Scoreboard Frozen
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {selectedEvent.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {selectedEvent.submissions.length} Submissions · {currentScoredByMe} Scored by You · {currentPending} Pending
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedEvent.rulebookUrl && (
                <a
                  href={selectedEvent.rulebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-300 dark:border-zinc-700 shadow-xs"
                >
                  <FileText className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  <span>Track Rulebook (PDF)</span>
                </a>
              )}

              <Link
                href={`/events/${selectedEvent.slug}/leaderboard`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <span>Live Standings</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 5. Submissions List for Selected Competition (Point 22 & 13 & 14) */}
        <section className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Submissions for &quot;{selectedEvent.title}&quot; ({currentSubmissions.length})
            </h2>
            <span className="text-xs font-mono text-zinc-500">
              {currentPending} remaining for you
            </span>
          </div>

          {currentSubmissions.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-2 shadow-xs">
              <Trophy className="h-8 w-8 text-zinc-400 mx-auto" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">
                No submissions for this competition yet
              </p>
              <p className="text-xs text-zinc-500">
                Student submissions will appear here automatically as soon as contestants submit their projects.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentSubmissions.map((sub) => {
                const myScore = sub.scores.find((sc) => sc.judgeId === currentUser.id);
                const otherScore = sub.scores.find((sc) => sc.judgeId !== currentUser.id);
                const isClaimedByMe = sub.claimedByJudgeId === currentUser.id && !myScore;
                const isClaimedByOther = sub.claimedByJudgeId && sub.claimedByJudgeId !== currentUser.id && !sub.scores.length;

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800">
                            {selectedEvent.category}
                          </span>
                          {sub.revisionNumber && sub.revisionNumber > 1 && (
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              Rev {sub.revisionNumber}
                            </span>
                          )}
                          <span className="text-xs text-zinc-500 font-mono">
                            Submitted: {formatDateTime(sub.submittedAt)}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          {sub.title}
                        </h3>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">
                          Author / Team:{' '}
                          <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">
                            {sub.team?.name || sub.user.name}
                          </strong>{' '}
                          ({sub.user.email})
                        </p>
                      </div>

                      {/* Status Badges & Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {/* Case 1: Scored by Me */}
                        {myScore && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Evaluated by You: {myScore.totalScore} pts
                            </span>
                            <Link
                              href={`/judge/eval/${sub.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
                            >
                              <span>Edit Score</span>
                            </Link>
                          </div>
                        )}

                        {/* Case 2: Scored by Another Judge (Point 13 & 14) */}
                        {otherScore && !myScore && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                              <UserCheck className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                              Evaluated by Judge {otherScore.judge.name} ({otherScore.totalScore} pts)
                            </span>
                            <Link
                              href={`/judge/eval/${sub.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
                            >
                              <span>View Scorecard</span>
                            </Link>
                          </div>
                        )}

                        {/* Case 3: Claimed by Current Judge */}
                        {isClaimedByMe && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                              <Lock className="h-3.5 w-3.5" />
                              Claimed by You
                            </span>
                            <button
                              type="button"
                              onClick={() => handleReleaseClaim(sub.id)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <Unlock className="h-3 w-3" />
                              <span>Release</span>
                            </button>
                            <Link
                              href={`/judge/eval/${sub.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
                            >
                              <span>Evaluate Project</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        )}

                        {/* Case 4: Claimed by Another Judge */}
                        {isClaimedByOther && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <Lock className="h-3.5 w-3.5" />
                            Claim held by Judge {sub.claimedByJudge?.name}
                          </span>
                        )}

                        {/* Case 5: Unclaimed and Pending */}
                        {!sub.scores.length && !sub.claimedByJudgeId && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleClaim(sub.id)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
                            >
                              <Lock className="h-3.5 w-3.5 text-zinc-500" />
                              <span>Claim for Review</span>
                            </button>
                            <Link
                              href={`/judge/eval/${sub.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
                            >
                              <span>Evaluate Project</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        )}
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
    </div>
  );
}

