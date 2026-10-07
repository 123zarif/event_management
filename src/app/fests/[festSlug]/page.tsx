import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { EventCard } from '@/components/EventCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Calendar, MapPin, ArrowLeft, Plus, Trophy, Edit3 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface FestDetailPageProps {
  params: Promise<{ festSlug: string }>;
}

export default async function FestDetailPage({ params }: FestDetailPageProps) {
  const { festSlug } = await params;
  const user = await getCurrentUser();
  const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

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

          {isOrganizer && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href={`/admin/fests/${fest.slug}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <Edit3 className="h-3.5 w-3.5 text-zinc-500" />
                <span>Edit Festival</span>
              </Link>
              <Link
                href={`/admin/events/new?festId=${fest.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Competition Track</span>
              </Link>
            </div>
          )}
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
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Competitions & Events ({fest.events.length})
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Select an event to view full schedule, criteria, rules, and registration details.
            </p>
          </div>

          {isOrganizer && fest.events.length > 0 && (
            <Link
              href={`/admin/events/new?festId=${fest.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 border border-violet-200 dark:border-violet-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Another Track</span>
            </Link>
          )}
        </div>

        {fest.events.length === 0 ? (
          <div className="p-10 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-3">
            <Trophy className="h-8 w-8 text-zinc-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                No competitions created for this festival yet
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Organizers can attach competitive tracks, hackathons, seminars, or workshops directly to this festival.
              </p>
            </div>
            {isOrganizer && (
              <Link
                href={`/admin/events/new?festId=${fest.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Competition to {fest.title}</span>
              </Link>
            )}
          </div>
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
