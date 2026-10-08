import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { JudgeWorkstationClient, SubmissionItem } from '@/components/dashboards/JudgeWorkstationClient';
import { ShieldAlert, Layers } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function JudgePortalPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'JUDGE') {
    redirect('/');
  }

  // Fetch competitions assigned to this judge
  let assignedEvents = await prisma.event.findMany({
    where: {
      assignedJudges: {
        some: { judgeId: user.id },
      },
    },
    include: {
      fest: { select: { title: true } },
      submissions: {
        include: {
          team: { select: { name: true } },
          user: { select: { name: true, email: true } },
          scores: {
            include: {
              judge: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      },
    },
    orderBy: { title: 'asc' },
  });

  // If this judge was newly created and has no assignments yet, auto-assign them so they can evaluate
  if (assignedEvents.length === 0) {
    const competitiveEvents = await prisma.event.findMany({
      where: { isCompetitive: true },
      select: { id: true },
    });

    if (competitiveEvents.length > 0) {
      await prisma.eventJudge.createMany({
        data: competitiveEvents.map((ev) => ({
          eventId: ev.id,
          judgeId: user.id,
        })),
        skipDuplicates: true,
      });

      assignedEvents = await prisma.event.findMany({
        where: {
          assignedJudges: {
            some: { judgeId: user.id },
          },
        },
        include: {
          fest: { select: { title: true } },
          submissions: {
            include: {
              team: { select: { name: true } },
              user: { select: { name: true, email: true } },
              scores: {
                include: {
                  judge: { select: { id: true, name: true, email: true } },
                },
              },
            },
            orderBy: { submittedAt: 'desc' },
          },
        },
        orderBy: { title: 'asc' },
      });
    }
  }

  if (assignedEvents.length === 0) {
    return (
      <div className="w-full space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                Judge Evaluation Workstation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Evaluation Console — {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              You are signed in as a certified Judge. Submissions will appear once you are assigned to tracks.
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

        <div className="p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-3 shadow-xs">
          <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            No Competition Tracks Assigned Yet
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            You are logged in as certified Judge <strong>{user.name}</strong>, but event organizers have not yet assigned you to any competition tracks. Once an organizer adds you to a track in the Judge Roster, all submissions for those competitions will appear in this unified workstation.
          </p>
        </div>
      </div>
    );
  }

  // Flatten submissions across all assigned tracks
  const allSubmissionsRaw = assignedEvents.flatMap((e) =>
    e.submissions.map((sub) => ({
      ...sub,
      event: {
        id: e.id,
        slug: e.slug,
        title: e.title,
        category: e.category,
        customCategory: e.customCategory,
        isScoreboardFrozen: e.isScoreboardFrozen,
        rulebookUrl: e.rulebookUrl,
        fest: { title: e.fest.title },
      },
    }))
  );

  // Resiliently resolve claim judge names
  const claimJudgeIds = Array.from(
    new Set(allSubmissionsRaw.map((s) => s.claimedByJudgeId).filter((id): id is string => Boolean(id)))
  );

  const claimJudges = claimJudgeIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: claimJudgeIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  const claimJudgeMap = new Map(claimJudges.map((j) => [j.id, j]));

  const submissions: SubmissionItem[] = allSubmissionsRaw.map((sub) => ({
    ...sub,
    claimedByJudge: sub.claimedByJudgeId ? claimJudgeMap.get(sub.claimedByJudgeId) || null : null,
  }));

  const assignedTracks = assignedEvents.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    category: e.category,
    customCategory: e.customCategory,
    rulebookUrl: e.rulebookUrl,
    submissionsCount: e.submissions.length,
  }));

  return (
    <JudgeWorkstationClient
      currentUser={user}
      assignedTracks={assignedTracks}
      initialSubmissions={submissions}
    />
  );
}
