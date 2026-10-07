import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { Users, Search, Download, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { verifyAndCheckInTicket, cancelRegistration } from '@/actions/registration';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface ParticipantsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    eventId?: string;
  }>;
}

export default async function AdminParticipantsPage({ searchParams }: ParticipantsPageProps) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/');
  }

  const { q, status = 'ACTIVE', eventId } = await searchParams;

  const whereClause: Record<string, unknown> = {};

  if (status === 'ACTIVE') {
    whereClause.status = { not: 'CANCELLED' };
  } else if (status && status !== 'ALL') {
    whereClause.status = status;
  }

  if (eventId && eventId !== 'ALL') {
    whereClause.eventId = eventId;
  }

  if (q && q.trim() !== '') {
    whereClause.OR = [
      { ticketCode: { contains: q, mode: 'insensitive' } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [registrations, events] = await Promise.all([
    prisma.registration.findMany({
      where: whereClause,
      include: {
        user: true,
        event: true,
        team: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.event.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  async function handleCheckIn(formData: FormData) {
    'use server';
    const ticketCode = formData.get('ticketCode') as string;
    const admin = await getCurrentUser();
    if (ticketCode) {
      await verifyAndCheckInTicket(ticketCode, admin?.id);
      revalidatePath('/admin/participants');
    }
  }

  async function handleCancel(formData: FormData) {
    'use server';
    const ticketCode = formData.get('ticketCode') as string;
    if (ticketCode) {
      await cancelRegistration(ticketCode);
      revalidatePath('/admin/participants');
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Command Center
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            Participant Command Center ({registrations.length})
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Search, filter, check-in, and manage accreditation status across all events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/api/admin/export-participants?${new URLSearchParams({
              ...(status ? { status } : {}),
              ...(eventId ? { eventId } : {}),
            }).toString()}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg text-xs shadow-xs">
        <form method="GET" action="/admin/participants" className="flex-1 flex flex-wrap md:flex-nowrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Search by attendee name, email, or ticket code..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-violet-600"
            />
          </div>

          <select
            name="eventId"
            defaultValue={eventId || 'ALL'}
            className="px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 text-xs outline-none"
          >
            <option value="ALL">All Competitions</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={status}
            className="px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 text-xs outline-none"
          >
            <option value="ACTIVE">Active (Excludes Cancelled)</option>
            <option value="ALL">All (Including Cancelled)</option>
            <option value="CONFIRMED">Confirmed Only</option>
            <option value="WAITLISTED">Waitlisted Only</option>
            <option value="CHECKED_IN">Checked In Only</option>
            <option value="CANCELLED">Cancelled Only</option>
          </select>

          <button
            type="submit"
            className="px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 hover:bg-violet-600 hover:text-white transition-colors font-medium"
          >
            Filter
          </button>
        </form>
      </div>

      {/* DataTable */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 font-mono text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Competition</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No participants matched search criteria.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-200">
                      <Link href={`/tickets/${reg.ticketCode}`} className="hover:text-violet-600 dark:hover:text-violet-400">
                        {reg.ticketCode}
                      </Link>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-200">{reg.user.name}</p>
                      <p className="text-[11px] text-zinc-500 truncate max-w-xs">{reg.user.email}</p>
                      {reg.team && (
                        <p className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">Team: {reg.team.name}</p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-zinc-800 dark:text-zinc-300">{reg.event.title}</p>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{reg.event.category}</span>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={reg.status} />
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-500">
                      {formatDateTime(reg.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {reg.status !== 'CHECKED_IN' && reg.status !== 'CANCELLED' && (
                          <form action={handleCheckIn}>
                            <input type="hidden" name="ticketCode" value={reg.ticketCode} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/80 transition-colors"
                              title="Manual Gate Check-In"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Check In
                            </button>
                          </form>
                        )}

                        {reg.status !== 'CANCELLED' && (
                          <form action={handleCancel}>
                            <input type="hidden" name="ticketCode" value={reg.ticketCode} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                              title="Cancel registration and auto-promote waitlist"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
