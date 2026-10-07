import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowRight,
  Bot,
  Code2,
  Gamepad2,
  BookOpen,
  Trophy
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';

interface EventCardProps {
  event: {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    bannerUrl?: string | null;
    venue?: string | null;
    eventDate?: Date | string | null;
    registrationDeadline?: Date | string | null;
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

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const cat = category?.toUpperCase() || '';
  if (cat.includes('ROBOT')) return <Bot className={className} />;
  if (cat.includes('HACK') || cat.includes('DEV') || cat.includes('WEB')) return <Code2 className={className} />;
  if (cat.includes('PROG') || cat.includes('CODE') || cat.includes('ALGO')) return <Code2 className={className} />;
  if (cat.includes('GAME') || cat.includes('ESPORT') || cat.includes('CHESS')) return <Gamepad2 className={className} />;
  if (cat.includes('WORKSHOP') || cat.includes('SEMINAR')) return <BookOpen className={className} />;
  return <Trophy className={className} />;
}

export function EventCard({ event, festSlug }: EventCardProps) {
  const registeredCount = event._count?.registrations ?? 0;
  const isExpired = event.registrationDeadline
    ? new Date() > new Date(event.registrationDeadline)
    : false;
  const isFull = registeredCount >= event.capacity;
  const isFillingFast = !isFull && registeredCount >= event.capacity * 0.7;

  // Registration state label
  let stateBadge = (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/80 backdrop-blur-xs text-emerald-300 border border-emerald-700/80 shadow-xs">
      Available
    </span>
  );

  if (isExpired) {
    stateBadge = (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-950/80 backdrop-blur-xs text-zinc-400 border border-zinc-700/80 shadow-xs">
        Registration Closed
      </span>
    );
  } else if (isFull) {
    stateBadge = (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-950/80 backdrop-blur-xs text-amber-300 border border-amber-700/80 shadow-xs">
        Waitlist Only
      </span>
    );
  } else if (isFillingFast) {
    stateBadge = (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-orange-950/80 backdrop-blur-xs text-orange-300 border border-orange-700/80 shadow-xs">
        Filling Fast
      </span>
    );
  }

  const detailUrl = festSlug 
    ? `/fests/${festSlug}/events/${event.slug}`
    : `/events/${event.slug}`;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs group">
      <div>
        {/* Top 16:9 Banner or Fallback Container */}
        <div className="relative w-full aspect-video bg-zinc-900 dark:bg-zinc-950 overflow-hidden">
          {event.bannerUrl ? (
            <Image
              src={event.bannerUrl}
              alt={event.title}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />
              <CategoryIcon category={event.category} className="h-9 w-9 text-zinc-500 group-hover:text-violet-400 transition-colors relative z-10" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-2 relative z-10 font-semibold">
                {event.category}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Badges overlaid on banner */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur-xs text-violet-300 border border-violet-800/80 shadow-xs truncate">
              {event.category}
            </span>
            {stateBadge}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
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
          <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
              <span className="truncate">
                {event.eventDate ? formatDateTime(event.eventDate) : 'Date TBA'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
              <span className="truncate">{event.venue || 'TBA'}</span>
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
      </div>

      <div className="p-4 sm:p-5 pt-0">
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
