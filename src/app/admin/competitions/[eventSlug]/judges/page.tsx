import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getEventJudges } from '@/actions/judges';
import { JudgeRosterClient } from './JudgeRosterClient';

export const dynamic = 'force-dynamic';

interface JudgesPageProps {
  params: Promise<{ eventSlug: string }>;
}

export default async function CompetitionJudgesPage({ params }: JudgesPageProps) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/?denied=admin');
  }

  const { eventSlug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: {
      fest: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const judgesData = await getEventJudges(event.id);

  // Get score counts per judge for this event
  const judgeScoreCounts = await prisma.judgeScore.groupBy({
    by: ['judgeId'],
    where: {
      submission: {
        eventId: event.id,
      },
    },
    _count: {
      id: true,
    },
  });

  const scoresMap = new Map<string, number>();
  judgeScoreCounts.forEach((s) => {
    scoresMap.set(s.judgeId, s._count.id);
  });

  const enrichedAssigned = judgesData.assigned.map((a) => ({
    ...a,
    evaluatedCount: scoresMap.get(a.judge.id) || 0,
  }));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <JudgeRosterClient
        event={{
          id: event.id,
          slug: event.slug,
          title: event.title,
          category: event.category,
          festTitle: event.fest.title,
          totalSubmissions: event._count.submissions,
        }}
        assignedJudges={enrichedAssigned}
        availableJudges={judgesData.available}
      />
    </div>
  );
}
