import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { EventCard } from '@/components/EventCard';
import { Trophy, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface EventsPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { category, q } = await searchParams;

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

  const categories = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Hackathons', value: 'HACKATHON' },
    { label: 'Programming Contests', value: 'CONTEST' },
    { label: 'Robotics Challenges', value: 'ROBOTICS' },
    { label: 'Esports & Gaming', value: 'GAMING' },
    { label: 'Workshops', value: 'WORKSHOP' },
  ];

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
            Browse active events across the 9th DRMC International Tech Carnival 2026. Register teams, view live brackets, and track capacities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/leaderboards"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            Live Leaderboards →
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const isSelected = (!category && cat.value === 'ALL') || category === cat.value;
            return (
              <Link
                key={cat.value}
                href={cat.value === 'ALL' ? '/events' : `/events?category=${cat.value}`}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-violet-600 text-white font-semibold shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Total count */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <Filter className="h-3.5 w-3.5" />
          <span>
            {events.length} {events.length === 1 ? 'competition' : 'competitions'} available
          </span>
        </div>
      </div>

      {/* Fluid Grid */}
      {events.length === 0 ? (
        <div className="p-12 text-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-2">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-300">No competitions match your filter</p>
          <p className="text-xs text-zinc-500">Try selecting another category or clearing search parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {events.map((event) => (
            <EventCard key={event.id} event={event} festSlug={event.fest.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
