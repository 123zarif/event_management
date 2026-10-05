import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Ticket, 
  Trophy, 
  Users, 
  HelpCircle, 
  ArrowRight, 
  FileCheck, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { GithubIcon } from '@/components/Icons';

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
  // Fetch attendee's registrations
  const registrations = await prisma.registration.findMany({
    where: { userId: currentUser.id },
    include: {
      event: { include: { fest: true } },
      team: {
        include: {
          members: { include: { user: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch attendee's project submissions
  const submissions = await prisma.submission.findMany({
    where: {
      OR: [
        { userId: currentUser.id },
        { team: { members: { some: { userId: currentUser.id } } } },
      ],
    },
    include: {
      event: true,
      team: true,
      scores: true,
    },
    orderBy: { submittedAt: 'desc' },
  });

  // Fetch attendee's support tickets
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: currentUser.id },
    include: {
      event: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
    take: 4,
  });

  // Fetch other competitions available to register
  const registeredEventIds = registrations.map((r) => r.eventId);
  const otherEvents = await prisma.event.findMany({
    where: {
      id: { notIn: registeredEventIds.length > 0 ? registeredEventIds : ['none'] },
    },
    include: {
      fest: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { eventDate: 'asc' },
    take: 3,
  });

  const confirmedPassesCount = registrations.filter((r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN').length;
  const teamsCount = registrations.filter((r) => r.team !== null).length;
  const openTicketsCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <div className="w-full space-y-8">
      {/* 1. Attendee Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Contestant Workspace
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {currentUser.institution || 'DRMC Student'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Track your competition accreditation passes, submit project repositories, collaborate with teammates, and get direct organizer support.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
          >
            <Trophy className="h-3.5 w-3.5" />
            Explore Competitions
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

      {/* 2. Operational Metrics for Attendee */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">My Registrations</span>
            <Ticket className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{registrations.length}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Active competitive tracks</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Valid QR Passes</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{confirmedPassesCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Ready for gate accreditation</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Team Rosters</span>
            <Users className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{teamsCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Team events joined</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Open Inquiries</span>
            <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{openTicketsCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Support tickets in progress</p>
        </div>
      </div>

      {/* 3. My Active Passes & Passes Grid */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <Ticket className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              My Accreditation Passes & Event Status
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Present your digital QR pass at the venue entrance for instant camera scanning.
            </p>
          </div>
          {registrations.length > 0 && (
            <Link
              href="/my-registrations"
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              View all passes ({registrations.length}) →
            </Link>
          )}
        </div>

        {registrations.length === 0 ? (
          <div className="p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 text-center space-y-3">
            <Ticket className="h-8 w-8 text-zinc-400 mx-auto" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No active registrations yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Join the 9th DRMC International Tech Carnival 2026. Register for the flagship AI Web Contest or Hackathons now.
            </p>
            <div className="pt-2">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                Browse Competitions & Register
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="flex flex-col justify-between p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800">
                      {reg.event.category}
                    </span>
                    <StatusBadge status={reg.status} />
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {reg.event.title}
                  </h3>

                  <div className="mt-2 space-y-1 text-xs text-zinc-500">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{formatDateTime(reg.event.eventDate)}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{reg.event.venue}</span>
                    </p>
                  </div>

                  {reg.team && (
                    <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{reg.team.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400">{reg.team.members.length} members</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-violet-600 dark:text-violet-400">
                        <span>Invite Code:</span>
                        <code className="px-1 py-0.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-bold">
                          {reg.team.inviteCode}
                        </code>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    {reg.ticketCode}
                  </span>
                  <Link
                    href={`/tickets/${reg.ticketCode}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
                  >
                    View QR Pass
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Project Submission Hub & Status */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Project Submission Status
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Official contest submissions are evaluated by judges across the 120-pt rubric.
            </p>
          </div>

          <Link
            href="/events/ai-web-development-contest/submit"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            Submit / Update Project →
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
              <AlertCircle className="h-4 w-4" />
              <span>Pending Action: Submit your AI Web Contest Repository & Live URL</span>
            </div>
            <p className="text-amber-700/90 dark:text-amber-400/80 leading-relaxed text-[11px]">
              If you have registered for the AI Web Development Contest, ensure you submit your GitHub repo and live working deployment link before the registration deadline to receive official judge evaluations.
            </p>
            <div className="pt-1">
              <Link
                href="/events/ai-web-development-contest/submit"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 dark:text-amber-200 underline"
              >
                Go to Project Submission Portal →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      {sub.title}
                    </span>
                    <span className="text-zinc-400 font-mono text-[11px] ml-2">
                      ({sub.event.title})
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    Entry Received & Active
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  <a
                    href={sub.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                    <span className="truncate max-w-xs">{sub.repoUrl}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <a
                    href={sub.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Live Demo URL</span>
                  </a>

                  <span className="text-zinc-400 text-[11px]">
                    Last updated: {formatDateTime(sub.submittedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Support Tickets & Other Events Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Help Desk snippet */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Contestant Help Desk
            </h3>
            <Link
              href="/support"
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
            >
              All tickets →
            </Link>
          </div>

          {tickets.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 space-y-2">
              <p>No support tickets opened.</p>
              <Link
                href="/support"
                className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Open a support ticket
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/support/${t.id}`}
                  className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center justify-between text-xs block"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {t.subject}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      #TK-{t.ticketNumber} · {t.event?.title || 'General'}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Other Competitions to join */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Explore More Competitions
            </h3>
            <Link
              href="/events"
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
            >
              Browse all →
            </Link>
          </div>

          <div className="space-y-2.5">
            {otherEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {ev.title}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    {ev.category} · {formatCurrency(ev.fee)} · {ev._count.registrations}/{ev.capacity} spots
                  </p>
                </div>
                <Link
                  href={`/events/${ev.slug}/register`}
                  className="shrink-0 px-2.5 py-1.5 rounded text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-xs ml-3"
                >
                  Register
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
