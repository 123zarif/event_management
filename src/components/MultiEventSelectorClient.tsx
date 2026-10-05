'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerForMultipleEvents, MultiRegisterResult } from '@/actions/registration';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Loader2, 
  X,
  Ticket,
  AlertTriangle
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export interface SerializedEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  eventDate: string;
  registrationDeadline: string;
  capacity: number;
  fee: number;
  isTeamEvent: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  rulebookUrl?: string | null;
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

export function MultiEventSelectorClient({
  events,
  currentUser,
  activeCategory = 'ALL',
}: MultiEventSelectorClientProps) {
  const router = useRouter();
  const [multiMode, setMultiMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultModal, setResultModal] = useState<MultiRegisterResult | null>(null);

  const categories = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Hackathons', value: 'HACKATHON' },
    { label: 'Programming Contests', value: 'CONTEST' },
    { label: 'Robotics Challenges', value: 'ROBOTICS' },
    { label: 'Esports & Gaming', value: 'GAMING' },
    { label: 'Workshops', value: 'WORKSHOP' },
  ];

  const toggleSelect = (eventId: string) => {
    setSelectedIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const selectAll = () => {
    const available = events
      .filter((e) => new Date() <= new Date(e.registrationDeadline))
      .map((e) => e.id);
    setSelectedIds(available);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBundleRegister = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one competition.');
      return;
    }

    if (!currentUser) {
      toast.error('Please sign in or select a demo attendee to register.');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const res = await registerForMultipleEvents(selectedIds, currentUser.id);

      if (!res.success && res.registrations.length === 0) {
        toast.error(res.message);
        setLoading(false);
        return;
      }

      setResultModal(res);
      toast.success(res.message);
      setSelectedIds([]);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to complete bundle registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Controls: Mode Switcher & Category Pills */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const isSelected = (!activeCategory && cat.value === 'ALL') || activeCategory === cat.value;
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

        {/* Multi-Event Pass Mode Toggle */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5 rounded-md text-xs">
            <button
              onClick={() => {
                setMultiMode(false);
                setSelectedIds([]);
              }}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                !multiMode
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Single View
            </button>
            <button
              onClick={() => setMultiMode(true)}
              className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                multiMode
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>⚡ Multi-Event Pass</span>
              {selectedIds.length > 0 && (
                <span className="bg-white text-violet-700 dark:bg-zinc-900 dark:text-violet-300 px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold">
                  {selectedIds.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Mode Helper Banner */}
      {multiMode && (
        <div className="p-4 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-violet-900 dark:text-violet-200">
                Multi-Event Bundle Registration Mode Active
              </p>
              <p className="text-violet-700 dark:text-violet-300/80">
                Click event cards or checkboxes to select multiple tracks. Register for all in a single click with instant accreditation passes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={selectAll}
              className="px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Select All Available
            </button>
            {selectedIds.length > 0 && (
              <button
                onClick={clearSelection}
                className="px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="p-12 text-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-2">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-300">No competitions found</p>
          <p className="text-xs text-zinc-500">Try selecting another category or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {events.map((event) => {
            const registeredCount = event._count?.registrations ?? 0;
            const isExpired = new Date() > new Date(event.registrationDeadline);
            const isFull = registeredCount >= event.capacity;
            const isFillingFast = !isFull && registeredCount >= event.capacity * 0.7;
            const isSelected = selectedIds.includes(event.id);

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

            const detailUrl = `/events/${event.slug}`;

            return (
              <div
                key={event.id}
                onClick={() => {
                  if (multiMode && !isExpired) {
                    toggleSelect(event.id);
                  }
                }}
                className={`flex flex-col justify-between rounded-lg border p-5 transition-all shadow-xs relative ${
                  multiMode && !isExpired ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'border-violet-600 dark:border-violet-500 bg-violet-50/20 dark:bg-violet-950/20 ring-1 ring-violet-600'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div>
                  {/* Top meta: Category + Checkbox/Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-semibold">
                      {event.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {stateBadge}

                      {multiMode && !isExpired && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelect(event.id);
                          }}
                          className="h-4 w-4 rounded accent-violet-600 cursor-pointer"
                        />
                      )}
                    </div>
                  </div>

                  {/* Event Title */}
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2 leading-snug">
                    <Link
                      href={detailUrl}
                      onClick={(e) => {
                        if (multiMode) e.stopPropagation();
                      }}
                      className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    >
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

                  {/* Action row & Rulebook PDF link */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                        {formatCurrency(event.fee)}
                      </span>

                      {event.rulebookUrl && (
                        <a
                          href={event.rulebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors border border-zinc-200 dark:border-zinc-700"
                          title="Official Rulebook (PDF Only)"
                        >
                          <FileText className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                          <span>PDF</span>
                        </a>
                      )}
                    </div>

                    <Link
                      href={detailUrl}
                      onClick={(e) => {
                        if (multiMode) e.stopPropagation();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-colors"
                    >
                      <span>Details</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Registration Drawer in Multi-Mode */}
      {multiMode && selectedIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 sm:max-w-xl z-50 p-4 rounded-xl bg-zinc-950 border border-violet-500/80 text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-xs font-bold text-zinc-100">
                {selectedIds.length} Competition{selectedIds.length > 1 ? 's' : ''} Selected
              </p>
            </div>
            <p className="text-[11px] text-zinc-400">
              One-click multi-event bundle accreditation pass.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={clearSelection}
              className="px-3 py-2 rounded-md text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBundleRegister}
              disabled={loading}
              className="px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating Passes...
                </>
              ) : (
                <>
                  <Ticket className="h-3.5 w-3.5" />
                  <span>Register Selected ({selectedIds.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation & Generated Tickets Modal */}
      {resultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Bundle Registration Confirmed!
                </h3>
              </div>
              <button
                onClick={() => setResultModal(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-zinc-600 dark:text-zinc-300">
              You have been registered for {resultModal.registrations.length} competition{resultModal.registrations.length > 1 ? 's' : ''}. Individual digital QR accreditation passes have been issued.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {resultModal.registrations.map((reg) => (
                <div
                  key={reg.ticketCode}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60"
                >
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{reg.eventTitle}</p>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Ticket: {reg.ticketCode}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {reg.status}
                  </span>
                </div>
              ))}

              {resultModal.skipped.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1">
                    <AlertTriangle className="h-3 w-3" />
                    Skipped Events:
                  </p>
                  {resultModal.skipped.map((s) => (
                    <div
                      key={s.eventId}
                      className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[11px] mb-1"
                    >
                      {s.eventTitle}: {s.reason}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setResultModal(null)}
                className="px-4 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
              >
                Close
              </button>
              <Link
                href="/my-registrations"
                className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Ticket className="h-3.5 w-3.5" />
                <span>View My Passes</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
