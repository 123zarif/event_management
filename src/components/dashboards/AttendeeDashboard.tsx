import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Ticket, 
  Trophy, 
  HelpCircle, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Plus,
  Bot,
  Code2,
  Gamepad2,
  BookOpen,
  FileCheck,
  Clock,
  Award
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const cat = category?.toUpperCase() || '';
  if (cat.includes('ROBOT')) return <Bot className={className} />;
  if (cat.includes('HACK') || cat.includes('DEV') || cat.includes('WEB')) return <Code2 className={className} />;
  if (cat.includes('PROG') || cat.includes('CODE') || cat.includes('ALGO')) return <Code2 className={className} />;
  if (cat.includes('GAME') || cat.includes('ESPORT') || cat.includes('CHESS')) return <Gamepad2 className={className} />;
  if (cat.includes('WORKSHOP') || cat.includes('SEMINAR')) return <BookOpen className={className} />;
  return <Trophy className={className} />;
}

interface AttendeeDashboardProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    institution?: string | null;
  };
}

export async function AttendeeDashboard({ currentUser }: AttendeeDashboardProps) {
  // 1. Fetch attendee's active registrations count and basic status
  const registrations = await prisma.registration.findMany({
    where: { userId: currentUser.id },
    include: {
      event: { include: { fest: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Fetch attendee's open support tickets
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: currentUser.id },
    include: {
      event: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
    take: 3,
  });

  // 3. Fetch active & upcoming Festivals
  const fests = await prisma.fest.findMany({
    include: {
      _count: { select: { events: true } },
      events: {
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          customCategory: true,
        },
        take: 3,
      },
    },
    orderBy: { startDate: 'asc' },
    take: 4,
  });

  // 4. Fetch available competitions & tracks
  const registeredEventIds = registrations.map((r) => r.eventId);
  const openCompetitions = await prisma.event.findMany({
    where: {
      id: { notIn: registeredEventIds.length > 0 ? registeredEventIds : ['none'] },
    },
    include: {
      fest: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { eventDate: 'asc' },
    take: 6,
  });

  // 5. Fetch attendee's submitted projects & judge evaluations (Item #21)
  const submissions = await prisma.submission.findMany({
    where: { userId: currentUser.id },
    include: {
      event: { include: { fest: true } },
      scores: {
        include: {
          judge: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const confirmedPassesCount = registrations.filter((r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <div className="w-full space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Contestant Discovery & Hub
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {currentUser.institution || 'DRMC Student'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Discover upcoming tech carnivals, explore competition tracks, and join national challenges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/my-registrations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
          >
            <Ticket className="h-3.5 w-3.5" />
            My Passes ({confirmedPassesCount})
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <HelpCircle className="h-3.5 w-3.5 text-zinc-500" />
            Help Desk
          </Link>
        </div>
      </div>

      {/* Active Submissions & Revision History Section (Item #21) */}
      {submissions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                My Contest Submissions & Evaluation Status
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Track your active contest entries, review past submissions, and submit revisions before deadlines.
              </p>
            </div>
            <Link
              href="/my-registrations"
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              All Passes & Entries →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions.map((sub) => {
              const latestScore = sub.scores[0];
              const isDeadlinePassed = Boolean(
                sub.event.registrationDeadline && new Date() > new Date(sub.event.registrationDeadline)
              );

              return (
                <div
                  key={sub.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-3.5 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                        {sub.event.title}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        Rev #{sub.revisionNumber || 1}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {sub.title}
                    </h3>

                    {/* Review & Score Status */}
                    <div>
                      {latestScore ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          <Award className="h-3.5 w-3.5" />
                          <span>Graded: {latestScore.totalScore} pts (Judge {latestScore.judge.name})</span>
                        </div>
                      ) : sub.claimedByJudgeId ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-medium text-amber-700 dark:text-amber-300">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Under Active Judge Review</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Submitted · Awaiting Evaluation</span>
                        </div>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                      {sub.repoUrl && (
                        <a
                          href={sub.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-violet-600 dark:hover:text-violet-400 text-zinc-600 dark:text-zinc-400 transition-colors"
                        >
                          Repository ↗
                        </a>
                      )}
                      {sub.liveDemoUrl && (
                        <a
                          href={sub.liveDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-emerald-600 dark:hover:text-emerald-400 text-zinc-600 dark:text-zinc-400 transition-colors"
                        >
                          Live Demo ↗
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-zinc-500">
                      {isDeadlinePassed ? 'Revisions Closed' : 'Deadline Open'}
                    </span>
                    {!isDeadlinePassed ? (
                      <Link
                        href={`/events/${sub.event.slug}/submit`}
                        className="inline-flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        <span>Update Project (Rev {(sub.revisionNumber || 1) + 1})</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <Link
                        href={`/events/${sub.event.slug}`}
                        className="text-zinc-500 hover:underline"
                      >
                        View Contest
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. Available Competitions & Tracks (Showcased First) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <Trophy className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Available Competitions to Enter
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Select an individual track to view rules, rubrics, and reserve your spot.
            </p>
          </div>
          <Link
            href="/events"
            className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium inline-flex items-center gap-1"
          >
            Explore all tracks ({openCompetitions.length}) →
          </Link>
        </div>

        {openCompetitions.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 text-xs text-zinc-500">
            You are registered for all currently active competitions!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openCompetitions.map((event) => {
              const registered = event._count.registrations;
              const isFull = registered >= event.capacity;
              const isDateUndecided = event.isDateUndecided || !event.eventDate;

              return (
                <div
                  key={event.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between overflow-hidden group"
                >
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
                          <CategoryIcon category={event.customCategory || event.category} className="h-9 w-9 text-zinc-500 group-hover:text-violet-400 transition-colors relative z-10" />
                          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-2 relative z-10 font-semibold">
                            {event.customCategory || event.category}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                        <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur-xs text-violet-300 border border-violet-800/80 shadow-xs truncate">
                          {event.customCategory || event.category}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur-xs text-zinc-400 border border-zinc-700/80 shrink-0">
                          {event.isTeamEvent ? `Team (${event.minTeamSize}–${event.maxTeamSize})` : 'Individual'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 space-y-2.5">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                          <Link href={`/events/${event.slug}`}>
                            {event.title}
                          </Link>
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          Fest: {event.fest.title}
                        </p>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="space-y-1 text-xs text-zinc-500 pt-1">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          <span>
                            {isDateUndecided
                              ? 'Schedule: TBA (Upcoming)'
                              : formatDateTime(event.eventDate!)}
                          </span>
                        </p>
                        {event.venue && (
                          <p className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{event.venue}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pt-0">
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-mono text-[11px]">
                        {isFull ? (
                          <span className="text-amber-500 font-medium">Waitlist Open</span>
                        ) : (
                          `${registered}/${event.capacity} spots`
                        )}
                      </span>

                      <Link
                        href={`/events/${event.slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-xs"
                      >
                        <span>View & Register</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Featured Carnivals & Festivals Section (Showcased Second) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Active & Upcoming Carnivals
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Flagship science and technology festivals organized on campus.
            </p>
          </div>
          <Link
            href="/fests"
            className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium inline-flex items-center gap-1"
          >
            View all fests →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fests.map((fest) => {
            const isOngoing = fest.status === 'ONGOING';
            return (
              <div
                key={fest.id}
                className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                        isOngoing
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      {fest.status}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {formatDateTime(fest.startDate).split(',')[0]}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {fest.title}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {fest.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{fest.location}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono">
                    {fest._count.events} competition tracks
                  </span>
                  <Link
                    href={`/fests/${fest.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    <span>Browse Carnival</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Support Inquiries Desk */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-xs">
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Contestant Help Desk & Organizer Support
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Have questions about rules, team formation, or equipment? Contact event staff directly.
            </p>
          </div>
          <Link
            href="/support"
            className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium inline-flex items-center gap-1"
          >
            All tickets ({openTicketsCount}) →
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500 space-y-2">
            <p>No active support tickets opened.</p>
            <Link
              href="/support"
              className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Open a support ticket
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tickets.map((t) => (
              <Link
                key={t.id}
                href={`/support/${t.id}`}
                className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors block text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-500">
                    #TK-{t.ticketNumber}
                  </span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {t.subject}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">
                  Event: {t.event?.title || 'General Festival'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
