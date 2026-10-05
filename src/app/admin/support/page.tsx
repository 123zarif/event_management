import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface AdminSupportPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminSupportQueuePage({ searchParams }: AdminSupportPageProps) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/');
  }

  const { status } = await searchParams;

  const whereClause: Record<string, unknown> = {};
  if (status && status !== 'ALL') {
    whereClause.status = status;
  }

  const tickets = await prisma.supportTicket.findMany({
    where: whereClause,
    include: {
      user: true,
      event: true,
      assignedTo: true,
      messages: {
        select: { id: true, message: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            Contestant Support Triage Center ({tickets.length})
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Resolve contestant inquiries, clarify rules, assist with team rosters, and track support states.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 text-xs overflow-x-auto">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => {
          const isActive = (!status && st === 'ALL') || status === st;
          return (
            <a
              key={st}
              href={st === 'ALL' ? '/admin/support' : `/admin/support?status=${st}`}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {st.replace('_', ' ')}
            </a>
          );
        })}
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {tickets.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 text-xs shadow-xs">
            No support tickets in this view.
          </div>
        ) : (
          tickets.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors space-y-3 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                    #TK-{t.ticketNumber}
                  </span>
                  <StatusBadge status={t.status} />
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {t.priority} Priority
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {t.category.replace('_', ' ')}
                  </span>
                </div>

                <Link
                  href={`/support/${t.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white transition-colors"
                >
                  <span>Open Ticket Thread</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.subject}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                  {t.messages[0]?.message}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 pt-1">
                <div className="flex items-center gap-3">
                  <span>Author: <strong className="text-zinc-800 dark:text-zinc-300">{t.user.name}</strong> ({t.user.email})</span>
                  {t.event && <span>Event: {t.event.title}</span>}
                </div>
                <span>Last updated: {formatDateTime(t.updatedAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
