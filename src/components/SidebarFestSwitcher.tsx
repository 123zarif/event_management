'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Calendar, 
  ChevronsUpDown, 
  Check, 
  Plus,
  ArrowRight
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

interface SidebarFestSwitcherProps {
  collapsed?: boolean;
  currentUser?: {
    role: string;
  } | null;
  onSelect?: () => void;
}

export function SidebarFestSwitcher({ collapsed, currentUser, onSelect }: SidebarFestSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [fests, setFests] = useState<FestSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive active festival from URL route or user selection
  const routeMatch = pathname.match(/\/fests\/([^/]+)/);
  const routeSlug = routeMatch ? routeMatch[1] : null;
  const activeSlug = selectedSlug || routeSlug || (fests.find((f) => f.status === 'ONGOING')?.slug || fests[0]?.slug || '9th-drmc-international-tech-carnival-2026');

  // Load fests list
  useEffect(() => {
    async function loadFests() {
      try {
        const res = await fetch('/api/fests/list');
        if (res.ok) {
          const data: FestSummary[] = await res.json();
          setFests(data);
        }
      } catch {
        // ignore network error
      }
    }
    loadFests();
  }, []);

  // Sync route changes to selectedSlug
  useEffect(() => {
    if (routeSlug) {
      setSelectedSlug(routeSlug);
    }
  }, [routeSlug]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activeFest = fests.find((f) => f.slug === activeSlug) || fests[0];
  const isOrganizer = currentUser?.role === 'ORGANIZER' || currentUser?.role === 'ADMIN';

  const handleSelect = (slug: string) => {
    setSelectedSlug(slug);
    setIsOpen(false);
    if (onSelect) onSelect();
    router.push(`/fests/${slug}`);
  };

  const isOngoing = activeFest?.status === 'ONGOING';

  return (
    <div className="relative w-full" ref={containerRef}>
      {!collapsed ? (
        /* Expanded Sidebar Fest Trigger */
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-2 rounded-md transition-colors cursor-pointer group text-left border ${
            isOpen
              ? 'bg-zinc-100 dark:bg-zinc-800/90 border-violet-400 dark:border-violet-600 shadow-xs'
              : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
          title="Switch Festival Context"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center gap-2 min-w-0 pr-1">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                isOngoing ? 'bg-emerald-500 animate-pulse' : 'bg-violet-500'
              }`}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                {activeFest?.title || 'Loading Festivals...'}
              </span>
              <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                {activeFest?.organizationName || 'DRMC IT Club'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                isOngoing
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/60'
              }`}
            >
              {isOngoing ? 'Live' : 'Upcoming'}
            </span>
            <ChevronsUpDown className="h-3 w-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors" />
          </div>
        </button>
      ) : (
        /* Collapsed Sidebar Fest Trigger */
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-9 w-9 mx-auto items-center justify-center rounded-md border transition-colors cursor-pointer group relative ${
            isOpen
              ? 'bg-zinc-100 dark:bg-zinc-800 border-violet-500 text-violet-600 dark:text-violet-400'
              : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
          title={`Active Festival: ${activeFest?.title || 'Festivals'}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <Calendar className="h-4 w-4" />
          <span
            className={`absolute top-1 right-1 h-1.5 w-1.5 rounded-full ${
              isOngoing ? 'bg-emerald-500 animate-pulse' : 'bg-violet-500'
            }`}
          />
        </button>
      )}

      {/* Floating Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute z-50 bg-white dark:bg-zinc-950 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
            collapsed
              ? 'left-full top-0 ml-2 w-72'
              : 'left-0 right-0 top-full mt-1.5 w-full'
          }`}
          role="listbox"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Select Festival
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {fests.length} available
            </span>
          </div>

          {/* Festival List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {fests.map((fest) => {
              const isSelected = fest.slug === activeSlug;
              const festOngoing = fest.status === 'ONGOING';

              return (
                <button
                  key={fest.id}
                  type="button"
                  onClick={() => handleSelect(fest.slug)}
                  className={`w-full flex items-start justify-between p-2 rounded-md text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-100 border border-violet-200 dark:border-violet-900/50'
                      : 'hover:bg-zinc-100/70 dark:hover:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          festOngoing ? 'bg-emerald-500' : 'bg-violet-500'
                        }`}
                      />
                      <span className="text-xs font-semibold truncate leading-tight">
                        {fest.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                      <span>{fest.eventCount} {fest.eventCount === 1 ? 'event' : 'events'}</span>
                      <span>•</span>
                      <span className="capitalize">{fest.status.toLowerCase()}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions Footer */}
          <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-1">
            <Link
              href="/fests"
              onClick={() => {
                setIsOpen(false);
                if (onSelect) onSelect();
              }}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>Browse All Festivals</span>
              <ArrowRight className="h-3 w-3 text-zinc-400" />
            </Link>

            {isOrganizer && (
              <Link
                href="/admin/fests/new"
                onClick={() => {
                  setIsOpen(false);
                  if (onSelect) onSelect();
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Plus className="h-3 w-3" />
                  Create New Fest
                </span>
                <span className="text-[9px] font-mono uppercase bg-violet-100 dark:bg-violet-950 px-1 rounded">Admin</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
