import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { JudgeDashboardClient } from './JudgeDashboardClient';
import { Award, Layers, ShieldAlert } from 'lucide-react';

interface JudgeDashboardProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function JudgeDashboard({ currentUser }: JudgeDashboardProps) {
  // Query only events specifically assigned to this judge (Item 19)
  const assignedEvents = await prisma.event.findMany({
    where: {
      assignedJudges: {
        some: { judgeId: currentUser.id },
      },
    },
    include: {
      fest: true,
      submissions: {
        include: {
          team: true,
          user: true,
          scores: {
            include: {
              judge: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      },
    },
    orderBy: { title: 'asc' },
  });

  if (assignedEvents.length === 0) {
    return (
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                Judge Evaluation Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Award className="h-7 w-7 text-violet-600 dark:text-violet-400" />
              Evaluation Console — {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Welcome, certified Judge. You will evaluate student projects for competitions assigned to you.
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

        {/* Empty state: No competition tracks assigned yet */}
        <div className="p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-3 shadow-xs">
          <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            No Competition Tracks Assigned Yet
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            You are logged in as certified Judge <strong>{currentUser.name}</strong>, but event organizers have not yet assigned you to any competition tracks. Once an organizer adds you to a track in the Judge Roster, the competition submissions and scoring controls will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Resiliently resolve claim judge details without relying on Prisma relation include cache
  const allSubmissions = assignedEvents.flatMap((e) => e.submissions);
  const claimJudgeIds = Array.from(
    new Set(allSubmissions.map((s) => s.claimedByJudgeId).filter((id): id is string => Boolean(id)))
  );

  const claimJudges = claimJudgeIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: claimJudgeIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  const judgeMap = new Map(claimJudges.map((j) => [j.id, j]));

  const enrichedEvents = assignedEvents.map((event) => ({
    ...event,
    submissions: event.submissions.map((sub) => ({
      ...sub,
      claimedByJudge: sub.claimedByJudgeId ? judgeMap.get(sub.claimedByJudgeId) || null : null,
    })),
  }));

  return (
    <JudgeDashboardClient
      currentUser={currentUser}
      assignedEvents={enrichedEvents}
    />
  );
}
