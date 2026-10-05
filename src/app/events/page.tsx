import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { MultiEventSelectorClient, SerializedEvent } from '@/components/MultiEventSelectorClient';
import { Trophy, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface EventsPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { category, q } = await searchParams;
  const user = await getCurrentUser();

  const whereClause: Record<string, unknown> = {};

  if (category && category !== 'ALL') {
    whereClause.category = category;
  }

  if (q && q.trim() !== '') {
    whereClause.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      fest: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { eventDate: 'asc' },
  });

  const serializedEvents: SerializedEvent[] = events.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    category: event.category,
    venue: event.venue,
    eventDate: event.eventDate.toISOString(),
    registrationDeadline: event.registrationDeadline.toISOString(),
    capacity: event.capacity,
    fee: event.fee,
    isTeamEvent: event.isTeamEvent,
    minTeamSize: event.minTeamSize,
    maxTeamSize: event.maxTeamSize,
    rulebookUrl: event.rulebookUrl,
    fest: {
      id: event.fest.id,
      slug: event.fest.slug,
      title: event.fest.title,
    },
    _count: event._count,
  }));

  const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1 text-violet-600 dark:text-violet-400">
            <Trophy className="h-4 w-4" />
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">
              Competitions & Events
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Official Competitions Directory
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Browse active events across the 9th DRMC International Tech Carnival 2026. Register teams, bundle multi-event passes, and view PDF rulebooks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isOrganizer && (
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Track</span>
            </Link>
          )}

          <Link
            href="/leaderboards"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            Live Standings →
          </Link>
        </div>
      </div>

      {/* Interactive Multi-Event Selector Client */}
      <MultiEventSelectorClient
        events={serializedEvents}
        currentUser={
          user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              }
            : null
        }
        activeCategory={category || 'ALL'}
      />
    </div>
  );
}
