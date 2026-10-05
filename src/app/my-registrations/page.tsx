import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { Ticket, Calendar, ArrowRight, XCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { cancelRegistration } from '@/actions/registration';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function MyRegistrationsPage() {
  const user = await getCurrentUser();

  const registrations = user
    ? await prisma.registration.findMany({
        where: { userId: user.id },
        include: {
          event: {
            include: { fest: true },
          },
          team: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  async function handleCancel(formData: FormData) {
    'use server';
    const ticketCode = formData.get('ticketCode') as string;
    if (ticketCode) {
      await cancelRegistration(ticketCode);
      revalidatePath('/my-registrations');
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Ticket className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          My Registrations & Tickets
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
          View your active festival accreditation passes, check-in status, and manage team entries.
        </p>
      </div>

      {registrations.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-3 shadow-xs">
          <Ticket className="h-8 w-8 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">No event registrations found</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You have not registered for any competitions or festival events yet.
          </p>
          <div className="pt-2">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-sm"
            >
              Browse Competitions
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                    {reg.event.fest.title}
                  </span>
                  <StatusBadge status={reg.status} />
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  <Link href={`/events/${reg.event.slug}`} className="hover:text-violet-600 dark:hover:text-violet-400">
                    {reg.event.title}
                  </Link>
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-mono text-zinc-800 dark:text-zinc-300 font-medium">Ticket: {reg.ticketCode}</span>
                  {reg.team && (
                    <span className="text-violet-600 dark:text-violet-400 font-medium">Team: {reg.team.name}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                    {formatDateTime(reg.event.eventDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {reg.status !== 'CANCELLED' ? (
                  <>
                    <Link
                      href={`/tickets/${reg.ticketCode}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white transition-colors"
                    >
                      <span>Digital Pass (QR)</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    {reg.status !== 'CHECKED_IN' && (
                      <form action={handleCancel}>
                        <input type="hidden" name="ticketCode" value={reg.ticketCode} />
                        <button
                          type="submit"
                          className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                          title="Cancel Registration (Freed slot promotes next waitlist candidate)"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </form>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-zinc-500 dark:text-zinc-600 font-mono">Cancelled</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
