import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { StatusBadge } from '@/components/StatusBadge';
import { Calendar, MapPin, ArrowRight, Trophy } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function FestsPage() {
  const fests = await prisma.fest.findMany({
    include: {
      organization: true,
      events: {
        select: { id: true },
      },
    },
    orderBy: { startDate: 'asc' },
  });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Festival Directory
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
          Explore student technology festivals organized by DRMC Information Technology Club.
        </p>
      </div>

      {/* Fests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fests.map((fest) => (
          <div
            key={fest.id}
            className="flex flex-col justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold">
                  {fest.organization.name}
                </span>
                <StatusBadge status={fest.status} />
              </div>

              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2 leading-snug">
                <Link href={`/fests/${fest.slug}`} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  {fest.title}
                </Link>
              </h2>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                {fest.description}
              </p>

              <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 mb-4 border-t border-zinc-200 dark:border-zinc-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                  <span>
                    {formatDate(fest.startDate)} – {formatDate(fest.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                  <span className="truncate">{fest.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                  <span>{fest.events.length} Events & Competitions</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/fests/${fest.slug}`}
                className="w-full inline-flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white hover:border-violet-600 transition-colors"
              >
                <span>View Festival Schedule & Events</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
