'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Trophy, 
  ChevronDown, 
  Search, 
  Calendar, 
  ArrowRight
} from 'lucide-react';

interface EventSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  isCompetitive: boolean;
  venue: string;
  capacity: number;
  registeredCount: number;
  festTitle: string;
}

export function EventSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect active event from URL if on /events/[eventSlug]
  const currentSlugMatch = pathname.match(/\/events\/([^/]+)/);
  const currentSlug = currentSlugMatch ? currentSlugMatch[1] : null;

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const res = await fetch('/api/events/list');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickRestore);
    function handleClickRestore() {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const activeEvent = events.find((e) => e.slug === currentSlug);

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const competitions = filteredEvents.filter((e) => e.isCompetitive);
  const generalEvents = filteredEvents.filter((e) => !e.isCompetitive);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    router.push(`/events/${slug}`);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-colors shadow-xs"
        title="Switch Event / Competition"
      >
        <Trophy className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
        <span className="truncate max-w-[130px] sm:max-w-[180px]">
          {activeEvent ? activeEvent.title : 'Switch Event'}
        </span>
        <ChevronDown className="h-3 w-3 text-zinc-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-80 sm:w-96 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 p-2 space-y-2 animate-in fade-in zoom-in-95">
          {/* Search Input */}
          <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            <Search className="h-3.5 w-3.5 text-zinc-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search competitions or events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-0 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none"
              autoFocus
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-3 pr-1 text-xs">
            {/* Competitions Section */}
            {competitions.length > 0 && (
              <div>
                <p className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                  <Trophy className="h-3 w-3 text-violet-500" />
                  <span>Competitions & Tracks</span>
                </p>
                <div className="space-y-0.5 mt-1">
                  {competitions.map((ev) => {
                    const isCurrent = ev.slug === currentSlug;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => handleSelect(ev.slug)}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs truncate font-medium">{ev.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500 font-mono">
                            <span>{ev.category}</span>
                            <span>•</span>
                            <span>{ev.registeredCount}/{ev.capacity} spots</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Link
                            href={`/events/${ev.slug}/leaderboard`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:text-violet-600 dark:hover:text-violet-400 text-zinc-400 text-[10px] font-mono"
                            title="Live Standings"
                          >
                            Scoreboard
                          </Link>
                          <ArrowRight className="h-3 w-3 text-zinc-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* General Events Section */}
            {generalEvents.length > 0 && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <p className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-emerald-500" />
                  <span>General Events & Workshops</span>
                </p>
                <div className="space-y-0.5 mt-1">
                  {generalEvents.map((ev) => {
                    const isCurrent = ev.slug === currentSlug;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => handleSelect(ev.slug)}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs truncate font-medium">{ev.title}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {ev.category} • {ev.venue}
                          </p>
                        </div>
                        <ArrowRight className="h-3 w-3 text-zinc-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredEvents.length === 0 && !loading && (
              <p className="text-center py-4 text-zinc-500 text-xs">No matching events found.</p>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-[11px] text-zinc-500 px-1">
            <Link
              href="/events"
              onClick={() => setIsOpen(false)}
              className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
            >
              Browse All Competitions →
            </Link>
            <span className="font-mono text-[10px]">{events.length} Events Total</span>
          </div>
        </div>
      )}
    </div>
  );
}
