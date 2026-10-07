import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { 
  Users, 
  QrCode, 
  Printer, 
  History, 
  HelpCircle,
  ArrowRight,
  Calendar,
  Award
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { RecentRegistrationsCard } from '@/components/dashboards/RecentRegistrationsCard';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/');
  }

  // Operational metrics
  const totalRegistrations = await prisma.registration.count();
  const checkedInCount = await prisma.registration.count({ where: { status: 'CHECKED_IN' } });
  const waitlistedCount = await prisma.registration.count({ where: { status: 'WAITLISTED' } });
  const openTicketsCount = await prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } });

  const events = await prisma.event.findMany({
    include: {
      fest: true,
      creator: true,
      _count: { select: { registrations: true, submissions: true } },
    },
    orderBy: { eventDate: 'asc' },
  });

  const recentActiveRegistrations = await prisma.registration.findMany({
    where: { status: { not: 'CANCELLED' } },
    take: 8,
    include: {
      user: true,
      event: true,
      team: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const recentCancelledRegistrations = await prisma.registration.findMany({
    where: { status: 'CANCELLED' },
    take: 8,
    include: {
      user: true,
      event: true,
      team: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const recentAudits = await prisma.auditLog.findMany({
    take: 6,
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800">
              Organizer Command Center
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            DRMC IT Club Operations Dashboard
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Real-time management for the 9th DRMC International Tech Carnival 2026.
          </p>
        </div>

        {/* Quick Operational Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/fests/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-sm"
          >
            <Calendar className="h-4 w-4" />
            <span>New Festival / Event</span>
          </Link>

          <Link
            href="/admin/scanner"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <QrCode className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <span>Webcam QR Scanner</span>
          </Link>

          <Link
            href="/admin/participants"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Users className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <span>Manage Participants</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-1 shadow-xs">
          <p className="text-[10px] uppercase font-mono text-zinc-500">Total Confirmed</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalRegistrations}</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Accredited attendees</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-1 shadow-xs">
          <p className="text-[10px] uppercase font-mono text-zinc-500">Gate Check-Ins</p>
          <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{checkedInCount}</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Scanned at venue</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-1 shadow-xs">
          <p className="text-[10px] uppercase font-mono text-zinc-500">Active Waitlist</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{waitlistedCount}</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Auto-promotion enabled</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-1 shadow-xs">
          <p className="text-[10px] uppercase font-mono text-zinc-500">Help Desk Queue</p>
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{openTicketsCount}</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Open contestant queries</p>
        </div>
      </div>

      {/* Operational Modules Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Cards */}
        <Link
          href="/admin/scanner"
          className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group block space-y-2 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded bg-violet-50 dark:bg-zinc-900 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-zinc-800">
              <QrCode className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Webcam QR Gate Scanner</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Real-time physical gate check-in tool with instant validation and audio ding.
          </p>
        </Link>

        <Link
          href="/admin/support"
          className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group block space-y-2 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded bg-violet-50 dark:bg-zinc-900 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-zinc-800">
              <HelpCircle className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Contestant Help Desk</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Triage participant tickets, respond to inquiries, and update resolution states.
          </p>
        </Link>

        <Link
          href="/admin/audit-logs"
          className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group block space-y-2 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded bg-violet-50 dark:bg-zinc-900 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-zinc-800">
              <History className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Real-Time Operational Audit Log</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Timestamped trace of registrations, cancellations, waitlist bumps, and check-ins.
          </p>
        </Link>
      </div>

      {/* Events Capacity Monitoring Grid */}
      <div className="space-y-4">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Event Capacity & Competition Monitors
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Live capacity utilization meters across competitions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => {
            const regCount = ev._count.registrations;
            const pct = Math.min(100, Math.round((regCount / ev.capacity) * 100));
            return (
              <div
                key={ev.id}
                className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-3 shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400 font-bold">
                      {ev.customCategory || ev.category}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{ev.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{ev.fest.title}</p>
                    <p className="text-[11px] text-zinc-500 font-mono mt-1">
                      Created by <strong className="text-zinc-700 dark:text-zinc-300">{ev.creator?.name || 'Club Organizer'}</strong> on {formatDateTime(ev.createdAt).split(',')[0]}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {ev.isCompetitive && (
                      <Link
                        href={`/admin/competitions/${ev.slug}/judges`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-[11px] text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900"
                        title="Manage Assigned Judges"
                      >
                        <Award className="h-3 w-3" />
                        Judges
                      </Link>
                    )}

                    <Link
                      href={`/admin/events/${ev.slug}/badges`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                      title="Print Accreditation Badges"
                    >
                      <Printer className="h-3 w-3" />
                      Badges
                    </Link>

                    {ev.category === 'GAMING' && (
                      <Link
                        href={`/admin/competitions/${ev.slug}/brackets`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                      >
                        Brackets
                      </Link>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
                    <span>Capacity: {regCount} / {ev.capacity}</span>
                    <span className={pct >= 100 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-800 dark:text-zinc-300'}>{pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pct >= 100 ? 'bg-amber-500' : 'bg-violet-600 dark:bg-violet-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two columns: Recent Registrations & Audit Log stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrations with Active/Cancelled Filter (Item 23) */}
        <RecentRegistrationsCard
          activeRegistrations={recentActiveRegistrations.map((r) => ({
            id: r.id,
            status: r.status,
            ticketCode: r.ticketCode,
            createdAt: r.createdAt.toISOString(),
            user: { name: r.user.name, email: r.user.email },
            event: { title: r.event.title },
          }))}
          cancelledRegistrations={recentCancelledRegistrations.map((r) => ({
            id: r.id,
            status: r.status,
            ticketCode: r.ticketCode,
            createdAt: r.createdAt.toISOString(),
            user: { name: r.user.name, email: r.user.email },
            event: { title: r.event.title },
          }))}
        />

        {/* Audit Log Stream */}
        <div className="space-y-4">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Operational Audit Stream
            </h2>
            <Link href="/admin/audit-logs" className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
              View log →
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 divide-y divide-zinc-100 dark:divide-zinc-900 overflow-hidden shadow-xs">
            {recentAudits.map((audit) => (
              <div key={audit.id} className="p-3.5 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-violet-600 dark:text-violet-400">
                    {audit.action}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {formatDateTime(audit.createdAt)}
                  </span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Entity: <span className="font-medium text-zinc-900 dark:text-zinc-200">{audit.entityType}</span> ({audit.entityId})
                </p>
                {audit.actor && (
                  <p className="text-[11px] text-zinc-500">Actor: {audit.actor.name} ({audit.actor.email})</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
