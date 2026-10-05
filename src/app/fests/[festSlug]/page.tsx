import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { EventCard } from '@/components/EventCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface FestDetailPageProps {
  params: Promise<{ festSlug: string }>;
}

export default async function FestDetailPage({ params }: FestDetailPageProps) {
  const { festSlug } = await params;

  const fest = await prisma.fest.findUnique({
    where: { slug: festSlug },
    include: {
      organization: true,
      events: {
        include: {
          _count: { select: { registrations: true } },
        },
        orderBy: { eventDate: 'asc' },
      },
    },
  });

  if (!fest) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/fests"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Fests Directory
        </Link>
      </div>

      {/* Fest Header Overview */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold">
                {fest.organization.name}
              </span>
              <StatusBadge status={fest.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {fest.title}
            </h1>
          </div>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
          {fest.description}
        </p>

        <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800/80 pt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">
              {formatDate(fest.startDate)} – {formatDate(fest.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">{fest.location}</span>
          </div>
        </div>
      </div>

      {/* Events List in Fest */}
      <div className="space-y-4">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Competitions & Events ({fest.events.length})
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Select an event to view full schedule, criteria, rules, and registration details.
          </p>
        </div>

        {fest.events.length === 0 ? (
          <p className="p-8 text-center text-xs text-zinc-500 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30">
            No events announced for this festival yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fest.events.map((event) => (
              <EventCard key={event.id} event={event} festSlug={fest.slug} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
