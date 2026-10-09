'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Calendar, 
  ChevronDown, 
  Plus
} from 'lucide-react';

interface FestSummary {
  id: string;
  slug: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  eventCount: number;
  organizationName: string;
}

interface FestSwitcherProps {
  currentUser?: {
    role: string;
  } | null;
}

export function FestSwitcher({ currentUser }: FestSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [fests, setFests] = useState<FestSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive active festival from route context or user manual selection
  const routeMatch = pathname.match(/\/fests\/([^/]+)/);
  const routeSlug = routeMatch ? routeMatch[1] : null;
  const activeSlug = selectedSlug || routeSlug || (fests.find((f) => f.status === 'ONGOING')?.slug || fests[0]?.slug || 'tech-carnival-2026');

  // Fetch fests list from API on mount
  useEffect(() => {
    async function loadFests() {
      try {
        const res = await fetch('/api/fests/list');
        if (res.ok) {
          const data: FestSummary[] = await res.json();
          setFests(data);
        }
      } catch {
        // ignore
      }
    }

    loadFests();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFest = fests.find((f) => f.slug === activeSlug) || fests[0];
  const isOrganizer = currentUser?.role === 'ORGANIZER' || currentUser?.role === 'ADMIN';

  const handleSelectFest = (slug: string) => {
    setSelectedSlug(slug);
    setIsOpen(false);
    router.push(`/fests/${slug}`);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Interactive Context Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer group"
        title="Switch Active Festival / Event Context"
        aria-label="Switch festival context"
        aria-expanded={isOpen}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="font-semibold text-zinc-800 dark:text-zinc-200 hidden sm:inline">
          {activeFest?.organizationName || 'DRMC IT Club'}
        </span>
        <span className="text-zinc-400 hidden sm:inline">/</span>
        <span className="text-violet-600 dark:text-violet-400 font-medium truncate max-w-[100px] min-[420px]:max-w-[130px] sm:max-w-[200px]">
          {activeFest?.title || '9th Tech Carnival 2026'}
        </span>
        <ChevronDown className="h-3 w-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors shrink-0" />
      </button>

      {/* Mobile Backdrop when open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-xs sm:hidden"
          aria-hidden="true"
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 sm:inset-x-auto sm:absolute sm:left-0 sm:top-full sm:mt-2 w-auto sm:w-88 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100 text-xs max-h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-900 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold shrink-0">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-violet-500" />
              Overarching Carnivals & Fests
            </span>
            <span className="text-violet-600 dark:text-violet-400 font-mono">
              {fests.length} {fests.length === 1 ? 'Festival' : 'Festivals'}
            </span>
          </div>

          {/* List of Fests */}
          <div className="flex-1 overflow-y-auto max-h-72 space-y-1 py-1">
            {fests.map((fest) => {
              const isSelected = fest.slug === activeSlug;
              return (
                <div
                  key={fest.id}
                  onClick={() => handleSelectFest(fest.slug)}
                  className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold border border-violet-200 dark:border-violet-800/80'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs truncate font-medium">{fest.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500 font-mono">
                      <span>{fest.location.split(',')[0]}</span>
                      <span>•</span>
                      <span>{fest.eventCount} Competitions</span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0 ${
                      fest.status === 'ONGOING'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : fest.status === 'UPCOMING'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {fest.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Organizer Quick Actions at bottom of dropdown */}
          <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-900 space-y-1 shrink-0">
            {isOrganizer && (
              <Link
                href="/admin/fests/new"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/50 dark:hover:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-semibold text-xs border border-violet-200 dark:border-violet-800/60 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create New Festival / Event</span>
              </Link>
            )}

            <Link
              href="/fests"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 py-1 px-3 rounded-md text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-[11px] transition-colors"
            >
              <span>View All Festivals in Directory →</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
