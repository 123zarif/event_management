import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Users, 
  QrCode, 
  Printer, 
  History, 
  HelpCircle,
  Shield,
  Activity,
  Zap
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface OrganizerDashboardProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function OrganizerDashboard({ currentUser }: OrganizerDashboardProps) {
  // Operational metrics
  const totalRegistrations = await prisma.registration.count();
  const checkedInCount = await prisma.registration.count({ where: { status: 'CHECKED_IN' } });
  const waitlistedCount = await prisma.registration.count({ where: { status: 'WAITLISTED' } });
  const openTicketsCount = await prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } });

  const events = await prisma.event.findMany({
    include: {
      fest: true,
      _count: { select: { registrations: true, submissions: true } },
    },
    orderBy: { eventDate: 'asc' },
  });

  const recentRegistrations = await prisma.registration.findMany({
    take: 6,
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
    <div className="w-full space-y-8">
      {/* 1. Organizer Header & Action Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Organizer Command Center
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              9th DRMC International Tech Carnival 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Shield className="h-7 w-7 text-violet-600 dark:text-violet-400" />
            Operations Command — {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Real-time control over gate attendance, concurrency slot locks, live webcam verification, support triage, and cryptographic audit logs.
          </p>
        </div>

        {/* Operational Quick Actions Strip */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/admin/scanner"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
          >
            <QrCode className="h-4 w-4" />
            <span>Launch Gate Scanner</span>
          </Link>
          <Link
            href="/admin/participants"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Users className="h-4 w-4 text-zinc-500" />
            <span>Registry & Export</span>
          </Link>
          <Link
            href="/admin/support"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <HelpCircle className="h-4 w-4 text-zinc-500" />
            <span>Support ({openTicketsCount})</span>
          </Link>
          <Link
            href="/admin/audit-logs"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <History className="h-4 w-4 text-zinc-500" />
            <span>Audits</span>
          </Link>
        </div>
      </div>

      {/* 2. Operational Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Total Registrations</span>
            <Users className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{totalRegistrations}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Postgres concurrency locked</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Gate Check-Ins</span>
            <QrCode className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{checkedInCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            {totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0}% attendance verified
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Automated Waitlist</span>
            <Zap className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{waitlistedCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Auto-promoted on cancellations</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono uppercase">Open Inquiries</span>
            <HelpCircle className="h-3.5 w-3.5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{openTicketsCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Contestant support triage queue</p>
        </div>
      </div>

      {/* 3. Event Capacity Grid & Quick Ops */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <Activity className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Event Track Capacity & Operations
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live capacity meters, badge printing sheets, and tournament bracket progression.
            </p>
          </div>
          <Link
            href="/events"
            className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
          >
            All Competitions →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => {
            const regCount = ev._count.registrations;
            const pct = Math.min(100, (regCount / ev.capacity) * 100);

            return (
              <div
                key={ev.id}
                className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold px-1.5 py-0.2 rounded bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800">
                      {ev.category}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      {ev._count.submissions} submissions
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {ev.title}
                  </h3>

                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                      <span>CAPACITY</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{regCount} / {ev.capacity}</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          pct >= 100 ? 'bg-amber-500' : pct >= 70 ? 'bg-orange-500' : 'bg-violet-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs">
                  <Link
                    href={`/admin/events/${ev.slug}/badges`}
                    className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
                    title="Print Badge Sheet"
                  >
                    <Printer className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Print Badges</span>
                  </Link>

                  {ev.category === 'GAMING' || ev.category === 'ROBOTICS' ? (
                    <Link
                      href={`/admin/competitions/${ev.slug}/brackets`}
                      className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline font-medium"
                    >
                      <span>Brackets →</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/events/${ev.slug}/leaderboard`}
                      className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline font-medium"
                    >
                      <span>Standings →</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Live Check-in Feed & Audit Log Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations & Check-in table */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Recent Registrations
            </h3>
            <Link
              href="/admin/participants"
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
            >
              Full Registry →
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs">
            {recentRegistrations.map((r) => (
              <div key={r.id} className="py-2.5 flex items-center justify-between">
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {r.user.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">
                    {r.ticketCode} · {r.event.title}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Security Audits */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Security Audit Trail
            </h3>
            <Link
              href="/admin/audit-logs"
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
            >
              All Logs →
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs">
            {recentAudits.map((a) => (
              <div key={a.id} className="py-2.5 flex items-center justify-between">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] px-1.5 py-0.2 rounded font-semibold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                      {a.action}
                    </span>
                    <span className="text-zinc-800 dark:text-zinc-200 truncate">{a.entityType} ({a.entityId.slice(0, 8)}...)</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Actor: {a.actor?.name || 'System'} · {formatDateTime(a.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
