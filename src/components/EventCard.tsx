import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';

interface EventCardProps {
  event: {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    venue: string;
    eventDate: Date | string;
    registrationDeadline: Date | string;
    capacity: number;
    fee: number;
    isTeamEvent: boolean;
    minTeamSize: number;
    maxTeamSize: number;
    _count?: {
      registrations: number;
    };
  };
  festSlug?: string;
}

export function EventCard({ event, festSlug }: EventCardProps) {
  const registeredCount = event._count?.registrations ?? 0;
  const isExpired = new Date() > new Date(event.registrationDeadline);
  const isFull = registeredCount >= event.capacity;
  const isFillingFast = !isFull && registeredCount >= event.capacity * 0.7;

  // Registration state label
  let stateBadge = (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
      Available
    </span>
  );

  if (isExpired) {
    stateBadge = (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
        Registration Closed
      </span>
    );
  } else if (isFull) {
    stateBadge = (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
        Waitlist Only
      </span>
    );
  } else if (isFillingFast) {
    stateBadge = (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
        Filling Fast
      </span>
    );
  }

  const detailUrl = festSlug 
    ? `/fests/${festSlug}/events/${event.slug}`
    : `/events/${event.slug}`;

  return (
    <div className="flex flex-col justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs">
      <div>
        {/* Top meta: Category + State */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-semibold">
            {event.category}
          </span>
          {stateBadge}
        </div>

        {/* 1. Event Name */}
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2 leading-snug">
          <Link href={detailUrl} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            {event.title}
          </Link>
        </h3>

        {/* Description brief */}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>

        {/* Meta details list */}
        <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
            <span className="truncate">{formatDateTime(event.eventDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
            <span>
              {event.isTeamEvent
                ? `Team (${event.minTeamSize}-${event.maxTeamSize} members)`
                : 'Solo Participation'}
            </span>
          </div>
        </div>
      </div>

      <div>
        {/* Capacity Meter */}
        <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-3 mb-3">
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-zinc-500 dark:text-zinc-400">Spots Filled</span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">
              {registeredCount} / {event.capacity}
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                isFull
                  ? 'bg-amber-500'
                  : isFillingFast
                  ? 'bg-orange-500'
                  : 'bg-violet-600 dark:bg-violet-500'
              }`}
              style={{ width: `${Math.min(100, (registeredCount / event.capacity) * 100)}%` }}
            />
          </div>
        </div>

        {/* Action button & Fee */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
            {formatCurrency(event.fee)}
          </span>

          <Link
            href={detailUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
