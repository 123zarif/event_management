import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { EditEventForm } from './EditEventForm';

export const dynamic = 'force-dynamic';

interface EditEventPageProps {
  params: Promise<{ eventSlug: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { eventSlug } = await params;
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/?denied=admin');
  }

  const [event, fests, categories] = await Promise.all([
    prisma.event.findUnique({
      where: { slug: eventSlug },
      include: {
        fest: true,
        creator: true,
      },
    }),
    prisma.fest.findMany({
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        description: true,
      },
    }),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-mono">
          <span>Created by:</span>
          <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{event.creator?.name || 'Club Organizer'}</strong>
          {event.creator?.email && <span className="text-zinc-500">({event.creator.email})</span>}
        </div>
        <div className="text-zinc-500 font-mono text-[11px]">
          Created on: {new Date(event.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <EditEventForm
        event={{
          id: event.id,
          festId: event.festId,
          title: event.title,
          slug: event.slug,
          category: event.category,
          categoryId: event.categoryId,
          customCategory: event.customCategory,
          isCompetitive: event.isCompetitive,
          description: event.description,
          rules: event.rules,
          rulebookUrl: event.rulebookUrl,
          bannerUrl: event.bannerUrl,
          judgingCriteria: Array.isArray(event.judgingCriteria) ? (event.judgingCriteria as unknown as { id: string; name: string; maxScore: number; description?: string }[]) : [],
          venue: event.venue,
          isDateUndecided: event.isDateUndecided,
          hasSpecificTime: event.hasSpecificTime,
          eventDate: event.eventDate ? event.eventDate.toISOString() : null,
          registrationDeadline: event.registrationDeadline ? event.registrationDeadline.toISOString() : null,
          isRulebookPublished: event.isRulebookPublished,
          isJudgingPublished: event.isJudgingPublished,
          capacity: event.capacity,
          fee: event.fee,
          isTeamEvent: event.isTeamEvent,
          minTeamSize: event.minTeamSize,
          maxTeamSize: event.maxTeamSize,
        }}
        fests={fests}
        initialCategories={categories}
      />
    </div>
  );
}

