'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, 
  MapPin, 
  ArrowRight, 
  FileText, 
  Trophy, 
  Search,
  Bot,
  Code2,
  Gamepad2,
  BookOpen
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export interface SerializedEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  bannerUrl?: string | null;
  venue?: string | null;
  eventDate?: string | null;
  registrationDeadline?: string | null;
  isDateUndecided?: boolean;
  hasSpecificTime?: boolean;
  capacity: number;
  fee: number;
  isTeamEvent: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  rulebookUrl?: string | null;
  isRulebookPublished?: boolean;
  isCompetitive?: boolean;
  fest: {
    id: string;
    slug: string;
    title: string;
  };
  _count?: {
    registrations: number;
  };
}

interface MultiEventSelectorClientProps {
  events: SerializedEvent[];
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  activeCategory?: string;
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

export function MultiEventSelectorClient({
  events,
  currentUser,
  activeCategory = 'ALL',
}: MultiEventSelectorClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(activeCategory);

  const categories = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Hackathons', value: 'HACKATHON' },
    { label: 'Programming Contests', value: 'CONTEST' },
    { label: 'Robotics Challenges', value: 'ROBOTICS' },
    { label: 'Esports & Gaming', value: 'GAMING' },
    { label: 'Workshops & Seminars', value: 'WORKSHOP' },
  ];

  // Filter events by category and search
  const filteredEvents = events.filter((e) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      e.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      searchQuery.trim() === '' ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.fest.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full space-y-6">
      {/* Search and Category Filter Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, category, or carnival..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Competitions */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2">
          <Trophy className="h-8 w-8 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No competitions found
          </h3>
          <p className="text-xs text-zinc-500">
            Try adjusting your search query or selecting a different category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const registered = event._count?.registrations || 0;
            const isFull = registered >= event.capacity;
            const isFillingFast = !isFull && registered >= event.capacity * 0.7;
            const isDateUndecided = event.isDateUndecided || !event.eventDate;
            const isDeadlinePassed =
              event.registrationDeadline && new Date() > new Date(event.registrationDeadline);

            return (
              <div
                key={event.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all overflow-hidden group"
              >
                <div>
                  {/* Top Banner (16:9) or Category Fallback Container */}
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

                    {/* Top Badges overlaid on banner */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur-xs text-violet-300 border border-violet-800/80 shadow-xs truncate">
                        {event.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur-xs text-zinc-400 border border-zinc-700/80 shrink-0">
                        {event.isTeamEvent ? `Team (${event.minTeamSize}–${event.maxTeamSize})` : 'Individual Solo'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Title & Carnival */}
                    <div>
                      <Link
                        href={`/events/${event.slug}`}
                        className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1"
                      >
                        {event.title}
                      </Link>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        Carnival: {event.fest.title}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Date & Venue details */}
                    <div className="space-y-1.5 text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        <span>
                          {isDateUndecided
                            ? 'Schedule: TBA (Upcoming)'
                            : formatDateTime(event.eventDate!)}
                        </span>
                      </div>

                      {event.venue && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions & Capacity */}
                <div className="p-4 sm:p-5 pt-0 space-y-3">
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-zinc-500">
                      {isFull ? (
                        <span className="text-amber-500 font-medium">Waitlist Open</span>
                      ) : isFillingFast ? (
                        <span className="text-orange-500 font-medium">Filling Fast ({registered}/{event.capacity})</span>
                      ) : (
                        <span>
                          <strong className="text-zinc-900 dark:text-zinc-100">{registered}</strong> / {event.capacity} spots
                        </span>
                      )}
                    </span>

                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {event.fee > 0 ? formatCurrency(event.fee) : 'Free Entry'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {event.rulebookUrl && event.isRulebookPublished !== false && (
                      <a
                        href={event.rulebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 transition-colors"
                        title="Download Rulebook (PDF)"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </a>
                    )}

                    <Link
                      href={`/events/${event.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-xs"
                    >
                      <span>
                        {(currentUser?.role === 'ORGANIZER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'JUDGE')
                          ? 'View Details'
                          : isDeadlinePassed
                          ? 'View Details'
                          : isFull
                          ? 'Join Waitlist'
                          : 'View & Register'}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
